const crypto = require("node:crypto");
const { FieldPath, FieldValue } = require("firebase-admin/firestore");
const {
  BETA1_INTERNAL_CURRENCY,
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  scopedOwnerFields,
  serverTimestamps,
  updatedTimestamp,
  getWalletRef,
} = require("./beta1Runtime");
const { lifecycleRef, isAccountMutationBlocked } = require("./beta1AccountLifecyclePolicy");
const { registerBeta1PartnerRetention } = require("./beta1PartnerRetention");

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

const PRESENTATION_TTL_MS = 5 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const PRESENTATION_ISSUE_LIMIT = 5;
const CONFIRM_ATTEMPT_LIMIT = 12;
const ACTIVE_PRESENTATION_LIMIT = 3;

function partnerOperatorId(partnerId, operatorUserId) {
  return `${safeDocIdPart(partnerId)}_${safeDocIdPart(operatorUserId)}`;
}

function offerRevisionId(offerId, revision) {
  return `${safeDocIdPart(offerId)}_${String(revision).padStart(8, "0")}`;
}

function expectedOfferRevision(value, HttpsError) {
  const revision = normalizedPositiveInteger(value, 0, 1000000);
  if (!revision) throw new HttpsError("invalid-argument", "expectedRevision muss positiv sein.");
  return revision;
}

function offerRevisionRecord({ offerId, revision, action, actorUserId, offer }) {
  return {
    offerRevisionId: offerRevisionId(offerId, revision), offerId, revision, action,
    actorUserId, partnerId: offer.partnerId, status: offer.status,
    title: offer.title, description: offer.description || null,
    costWfxp: offer.costWfxp, initialInventory: offer.initialInventory,
    remainingInventory: offer.remainingInventory, perUserLimit: offer.perUserLimit,
    validFrom: offer.validFrom, expiresAt: offer.expiresAt,
    noPayments: true, tokenAuthorized: false, createdAt: FieldValue.serverTimestamp(),
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function secureEqualHex(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function rateWindowStart(now = Date.now()) {
  return Math.floor(now / RATE_WINDOW_MS) * RATE_WINDOW_MS;
}

function rateLimitId(action, actorUserId, windowStart) {
  return `${safeDocIdPart(action)}_${safeDocIdPart(actorUserId)}_${windowStart}`;
}

async function consumeOperationRateLimit(db, { action, actorUserId, limit }, HttpsError) {
  const windowStart = rateWindowStart();
  const ref = db.collection("partnerOperationRateLimits").doc(rateLimitId(action, actorUserId, windowStart));
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const count = snapshot.exists ? Number((snapshot.data() || {}).count || 0) : 0;
    if (count >= limit) throw new HttpsError("resource-exhausted", "Zu viele Partneraktionen. Bitte kurz warten.");
    transaction.set(ref, {
      rateLimitId: ref.id, action, subjectUserId: actorUserId, count: count + 1, limit,
      windowStart: new Date(windowStart).toISOString(),
      expiresAt: new Date(windowStart + RATE_WINDOW_MS).toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(snapshot.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    }, { merge: true });
  });
  return { windowStart, ref };
}

async function recordOperationOutcome(db, { action, actorUserId, outcome, windowStart }) {
  const id = `${rateLimitId(action, actorUserId, windowStart)}_${safeDocIdPart(outcome)}`;
  await db.collection("partnerOperationOutcomes").doc(id).set({
    outcomeId: id, action, outcome, subjectUserId: actorUserId,
    windowStart: new Date(windowStart).toISOString(),
    expiresAt: new Date(windowStart + RATE_WINDOW_MS).toISOString(),
    count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

function outcomeForError(error) {
  const code = String(error && error.code || "internal").split("/").pop();
  if (code === "permission-denied") return "denied";
  if (code === "resource-exhausted") return "rate-limited";
  if (code === "failed-precondition") return "invalid-state";
  if (code === "not-found") return "not-found";
  return "error";
}

function activePresentations(value, now = Date.now()) {
  const entries = value && typeof value === "object" ? value : {};
  return Object.fromEntries(Object.entries(entries).filter(([, expiresAt]) => Date.parse(expiresAt) > now));
}

function parseIso(value, fieldName, HttpsError) {
  const raw = requiredString(value, fieldName, HttpsError, 80);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new HttpsError("invalid-argument", `${fieldName} ist ungueltig.`);
  return date;
}

function publicOffer(doc, partner) {
  const data = doc.data() || {};
  return {
    offerId: doc.id,
    partnerId: data.partnerId,
    partnerName: optionalString(partner.displayName, 120) || data.partnerId,
    title: optionalString(data.title, 120) || doc.id,
    description: optionalString(data.description, 500),
    costWfxp: normalizedPositiveInteger(data.costWfxp, 0, 100000),
    validFrom: data.validFrom || null,
    expiresAt: data.expiresAt || null,
    remainingInventory: Math.max(0, Number(data.remainingInventory || 0)),
    currency: BETA1_INTERNAL_CURRENCY,
    noMonetaryValue: true,
    tokenAuthorized: false,
    cashoutAllowed: false,
  };
}

function offerWindowState(offer, now = Date.now()) {
  const validFrom = Date.parse(offer.validFrom);
  const expiresAt = Date.parse(offer.expiresAt);
  return {
    valid: Number.isFinite(validFrom) && Number.isFinite(expiresAt) && validFrom <= now && expiresAt > now,
    validFrom,
    expiresAt,
  };
}

function registerBeta1PartnerRedemption(exportsTarget, { db, onCall, HttpsError }) {
  registerBeta1PartnerRetention(exportsTarget, { db, onCall, HttpsError });
  exportsTarget.adminUpsertPartner = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const partnerId = requiredString(data.partnerId, "partnerId", HttpsError, 120);
    const status = data.status === "inactive" ? "inactive" : "active";
    const ref = db.collection("partners").doc(partnerId);
    await ref.set({
      partnerId,
      displayName: requiredString(data.displayName, "displayName", HttpsError, 120),
      status,
      redemptionMode: "wellfit-admin-confirmed",
      noPayments: true,
      tokenAuthorized: false,
      updatedByUserId: actorUserId,
      createdAt: FieldValue.serverTimestamp(),
      ...updatedTimestamp(),
    }, { merge: true });
    return { accepted: true, partnerId, status };
  });

  const createPartnerOffer = async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const offerId = requiredString(data.offerId, "offerId", HttpsError, 120);
    const partnerId = requiredString(data.partnerId, "partnerId", HttpsError, 120);
    const partner = await db.collection("partners").doc(partnerId).get();
    if (!partner.exists || (partner.data() || {}).status !== "active") {
      throw new HttpsError("failed-precondition", "Partner ist nicht aktiv.");
    }
    const validFrom = parseIso(data.validFrom, "validFrom", HttpsError);
    const expiresAt = parseIso(data.expiresAt, "expiresAt", HttpsError);
    if (expiresAt <= validFrom) throw new HttpsError("invalid-argument", "expiresAt muss nach validFrom liegen.");
    const costWfxp = normalizedPositiveInteger(data.costWfxp, 0, 100000);
    const remainingInventory = normalizedPositiveInteger(data.remainingInventory, 0, 1000000);
    if (!costWfxp || !remainingInventory) throw new HttpsError("invalid-argument", "Preis und Bestand muessen positiv sein.");
    const offerRef = db.collection("partnerOffers").doc(offerId);
    const revisionRef = db.collection("partnerOfferRevisions").doc(offerRevisionId(offerId, 1));
    const offer = {
      offerId, partnerId, title: requiredString(data.title, "title", HttpsError, 120),
      description: optionalString(data.description, 500), costWfxp,
      initialInventory: remainingInventory, remainingInventory, perUserLimit: 1,
      validFrom: validFrom.toISOString(), expiresAt: expiresAt.toISOString(), status: "draft",
      revision: 1, noPayments: true, tokenAuthorized: false, updatedByUserId: actorUserId,
    };
    await db.runTransaction(async (transaction) => {
      if ((await transaction.get(offerRef)).exists) {
        throw new HttpsError("already-exists", "Partnerangebot existiert bereits.");
      }
      transaction.create(offerRef, { ...offer, createdAt: FieldValue.serverTimestamp(), ...updatedTimestamp() });
      transaction.create(revisionRef, offerRevisionRecord({ offerId, revision: 1, action: "created", actorUserId, offer }));
    });
    return { accepted: true, offerId, partnerId, status: "draft", revision: 1 };
  };
  exportsTarget.adminCreatePartnerOffer = onCall(createPartnerOffer);
  // Compatibility name retained as create-only. Existing offers can no longer be overwritten.
  exportsTarget.adminUpsertPartnerOffer = onCall(createPartnerOffer);

  exportsTarget.adminUpdatePartnerOfferTerms = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const offerId = requiredString(data.offerId, "offerId", HttpsError, 120);
    const expectedRevision = expectedOfferRevision(data.expectedRevision, HttpsError);
    const validFrom = parseIso(data.validFrom, "validFrom", HttpsError);
    const expiresAt = parseIso(data.expiresAt, "expiresAt", HttpsError);
    if (expiresAt <= validFrom) throw new HttpsError("invalid-argument", "expiresAt muss nach validFrom liegen.");
    const costWfxp = normalizedPositiveInteger(data.costWfxp, 0, 100000);
    if (!costWfxp) throw new HttpsError("invalid-argument", "Preis muss positiv sein.");
    const offerRef = db.collection("partnerOffers").doc(offerId);
    return db.runTransaction(async (transaction) => {
      const offerSnapshot = await transaction.get(offerRef);
      if (!offerSnapshot.exists) throw new HttpsError("not-found", "Partnerangebot wurde nicht gefunden.");
      const current = offerSnapshot.data() || {};
      const currentRevision = normalizedPositiveInteger(current.revision, 1, 1000000);
      if (currentRevision !== expectedRevision) throw new HttpsError("aborted", "Partnerangebot wurde zwischenzeitlich geaendert.");
      if (current.status !== "draft") throw new HttpsError("failed-precondition", "Konditionen duerfen nur im Entwurf geaendert werden.");
      const redemptionSnapshot = await transaction.get(db.collection("partnerRedemptions").where("offerId", "==", offerId).limit(1));
      if (!redemptionSnapshot.empty) throw new HttpsError("failed-precondition", "Konditionen mit vorhandenen Einloesungen sind unveraenderbar.");
      const revision = currentRevision + 1;
      const offer = {
        ...current, title: requiredString(data.title, "title", HttpsError, 120),
        description: optionalString(data.description, 500), costWfxp,
        validFrom: validFrom.toISOString(), expiresAt: expiresAt.toISOString(),
        revision, updatedByUserId: actorUserId,
      };
      transaction.update(offerRef, { title: offer.title, description: offer.description, costWfxp,
        validFrom: offer.validFrom, expiresAt: offer.expiresAt, revision,
        updatedByUserId: actorUserId, updatedAt: FieldValue.serverTimestamp() });
      transaction.create(db.collection("partnerOfferRevisions").doc(offerRevisionId(offerId, revision)),
        offerRevisionRecord({ offerId, revision, action: "terms-updated", actorUserId, offer }));
      return { accepted: true, offerId, status: offer.status, revision };
    });
  });

  exportsTarget.adminTransitionPartnerOffer = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const offerId = requiredString(data.offerId, "offerId", HttpsError, 120);
    const targetStatus = requiredString(data.targetStatus, "targetStatus", HttpsError, 20);
    const expectedRevision = expectedOfferRevision(data.expectedRevision, HttpsError);
    const allowed = { draft: ["published", "retired"], published: ["paused", "retired"], paused: ["published", "retired"], retired: [] };
    const offerRef = db.collection("partnerOffers").doc(offerId);
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(offerRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Partnerangebot wurde nicht gefunden.");
      const current = snapshot.data() || {};
      const currentRevision = normalizedPositiveInteger(current.revision, 1, 1000000);
      if (currentRevision !== expectedRevision) throw new HttpsError("aborted", "Partnerangebot wurde zwischenzeitlich geaendert.");
      if (!(allowed[current.status] || []).includes(targetStatus)) throw new HttpsError("failed-precondition", "Statuswechsel ist nicht erlaubt.");
      if (targetStatus === "published") {
        const partnerSnapshot = await transaction.get(db.collection("partners").doc(current.partnerId));
        if (!partnerSnapshot.exists || (partnerSnapshot.data() || {}).status !== "active") {
          throw new HttpsError("failed-precondition", "Nur Angebote aktiver Partner duerfen veroeffentlicht werden.");
        }
      }
      const revision = currentRevision + 1;
      const offer = { ...current, status: targetStatus, revision, updatedByUserId: actorUserId };
      transaction.update(offerRef, { status: targetStatus, revision, updatedByUserId: actorUserId, updatedAt: FieldValue.serverTimestamp() });
      transaction.create(db.collection("partnerOfferRevisions").doc(offerRevisionId(offerId, revision)),
        offerRevisionRecord({ offerId, revision, action: `status-${targetStatus}`, actorUserId, offer }));
      return { accepted: true, offerId, status: targetStatus, revision };
    });
  });

  exportsTarget.adminAdjustPartnerOfferCapacity = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const offerId = requiredString(data.offerId, "offerId", HttpsError, 120);
    const expectedRevision = expectedOfferRevision(data.expectedRevision, HttpsError);
    const initialInventory = normalizedPositiveInteger(data.initialInventory, 0, 1000000);
    if (!initialInventory) throw new HttpsError("invalid-argument", "Gesamtbestand muss positiv sein.");
    const offerRef = db.collection("partnerOffers").doc(offerId);
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(offerRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Partnerangebot wurde nicht gefunden.");
      const current = snapshot.data() || {};
      const currentRevision = normalizedPositiveInteger(current.revision, 1, 1000000);
      if (currentRevision !== expectedRevision) throw new HttpsError("aborted", "Partnerangebot wurde zwischenzeitlich geaendert.");
      if (current.status === "retired") throw new HttpsError("failed-precondition", "Ausgemusterte Angebote sind unveraenderbar.");
      const consumed = Math.max(0, Number(current.initialInventory || 0) - Number(current.remainingInventory || 0));
      if (initialInventory < consumed) throw new HttpsError("failed-precondition", "Gesamtbestand darf nicht unter bereits gebundene Einloesungen sinken.");
      const remainingInventory = initialInventory - consumed;
      const revision = currentRevision + 1;
      const offer = { ...current, initialInventory, remainingInventory, revision, updatedByUserId: actorUserId };
      transaction.update(offerRef, { initialInventory, remainingInventory, revision, updatedByUserId: actorUserId, updatedAt: FieldValue.serverTimestamp() });
      transaction.create(db.collection("partnerOfferRevisions").doc(offerRevisionId(offerId, revision)),
        offerRevisionRecord({ offerId, revision, action: "capacity-adjusted", actorUserId, offer }));
      return { accepted: true, offerId, status: offer.status, revision, initialInventory, remainingInventory };
    });
  });

  exportsTarget.adminListPartnerOffers = onCall(async (request) => {
    requireAdmin(request, HttpsError);
    const data = request.data || {};
    const limit = normalizedPositiveInteger(data.limit, 50, 100);
    const cursor = optionalString(data.cursor, 120);
    let query = db.collection("partnerOffers").orderBy(FieldPath.documentId()).limit(limit + 1);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    const hasMore = snapshot.size > limit;
    const docs = snapshot.docs.slice(0, limit);
    const offers = docs.map((doc) => {
      const offer = doc.data() || {};
      const initialInventory = Math.max(0, Number(offer.initialInventory || 0));
      const remainingInventory = Math.max(0, Number(offer.remainingInventory || 0));
      return {
        offerId: doc.id, partnerId: offer.partnerId || null, title: optionalString(offer.title, 120) || doc.id,
        description: optionalString(offer.description, 500), status: offer.status || "unknown",
        revision: normalizedPositiveInteger(offer.revision, 1, 1000000),
        costWfxp: normalizedPositiveInteger(offer.costWfxp, 0, 100000),
        initialInventory, remainingInventory,
        consumedInventory: Math.max(0, initialInventory - remainingInventory),
        validFrom: offer.validFrom || null, expiresAt: offer.expiresAt || null,
        currency: BETA1_INTERNAL_CURRENCY, noMonetaryValue: true, tokenAuthorized: false,
      };
    });
    return {
      accepted: true, offers, limit, hasMore,
      nextCursor: hasMore && docs.length ? docs[docs.length - 1].id : null,
      privacyMode: "catalog-state-no-audit-actors",
    };
  });

  exportsTarget.adminUpsertPartnerOperator = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const partnerId = requiredString(data.partnerId, "partnerId", HttpsError, 120);
    const operatorUserId = requiredString(data.operatorUserId, "operatorUserId", HttpsError, 180);
    const partnerSnapshot = await db.collection("partners").doc(partnerId).get();
    if (!partnerSnapshot.exists) throw new HttpsError("not-found", "Partner wurde nicht gefunden.");
    const status = data.status === "revoked" ? "revoked" : "active";
    const ref = db.collection("partnerOperators").doc(partnerOperatorId(partnerId, operatorUserId));
    await ref.set({
      operatorAssignmentId: ref.id, partnerId, operatorUserId, status,
      role: "redemption-operator", assignedByUserId: actorUserId,
      revokedAt: status === "revoked" ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(), ...updatedTimestamp(),
    }, { merge: true });
    return { accepted: true, operatorAssignmentId: ref.id, partnerId, operatorUserId, status };
  });

  exportsTarget.listPartnerOffers = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const now = Date.now();
    const snapshot = await db.collection("partnerOffers").where("status", "==", "published").limit(50).get();
    const partnerIds = [...new Set(snapshot.docs.map((doc) => (doc.data() || {}).partnerId).filter(Boolean))];
    const partnerDocs = await Promise.all(partnerIds.map((id) => db.collection("partners").doc(id).get()));
    const partners = new Map(partnerDocs.filter((doc) => doc.exists).map((doc) => [doc.id, doc.data() || {}]));
    const offers = snapshot.docs.filter((doc) => {
      const data = doc.data() || {};
      const partner = partners.get(data.partnerId) || {};
      return partner.status === "active"
        && Number(data.remainingInventory || 0) > 0
        && offerWindowState(data, now).valid;
    }).map((doc) => publicOffer(doc, partners.get((doc.data() || {}).partnerId) || {}));
    return { accepted: true, offers, currency: BETA1_INTERNAL_CURRENCY, tokenAuthorized: false, cashoutAllowed: false };
  });

  exportsTarget.claimPartnerOffer = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    if (data.childProfileId) throw new HttpsError("failed-precondition", "Partnerangebote sind in der Beta nur fuer Erwachsene verfuegbar.");
    const offerId = requiredString(data.offerId, "offerId", HttpsError, 120);
    const requestId = requiredString(data.requestId, "requestId", HttpsError, 180);
    const offerRef = db.collection("partnerOffers").doc(offerId);
    const redemptionId = `partner_redemption_${safeDocIdPart(userId)}_${safeDocIdPart(offerId)}`;
    const redemptionRef = db.collection("partnerRedemptions").doc(redemptionId);
    const walletRef = await getWalletRef(db, userId, null);
    const ledgerRef = db.collection("xpLedgerEvents").doc(redemptionId);
    const legacyLedgerRef = db.collection("ledgerEvents").doc(redemptionId);
    const accountLifecycleRef = lifecycleRef(db, userId);

    return db.runTransaction(async (transaction) => {
      const [offerSnapshot, redemptionSnapshot, walletSnapshot, lifecycleSnapshot] = await Promise.all([
        transaction.get(offerRef), transaction.get(redemptionRef), transaction.get(walletRef), transaction.get(accountLifecycleRef),
      ]);
      if (redemptionSnapshot.exists) {
        const existing = redemptionSnapshot.data() || {};
        if (existing.ownerUserId !== userId || existing.offerId !== offerId) throw new HttpsError("permission-denied", "Einloesung ist ungueltig.");
        return { accepted: true, idempotent: true, redemptionId, status: existing.status, remainingWfxp: existing.remainingWfxp, tokenAuthorized: false };
      }
      if (!offerSnapshot.exists) throw new HttpsError("not-found", "Partnerangebot wurde nicht gefunden.");
      if (lifecycleSnapshot.exists && isAccountMutationBlocked(lifecycleSnapshot.data() || {})) {
        throw new HttpsError("failed-precondition", "Das Konto ist fuer Partner-Einloesungen eingefroren.");
      }
      const offer = offerSnapshot.data() || {};
      const partnerRef = db.collection("partners").doc(offer.partnerId);
      const partnerSnapshot = await transaction.get(partnerRef);
      const now = Date.now();
      if (offer.status !== "published" || !partnerSnapshot.exists || (partnerSnapshot.data() || {}).status !== "active") {
        throw new HttpsError("failed-precondition", "Partnerangebot ist nicht aktiv.");
      }
      if (!offerWindowState(offer, now).valid) throw new HttpsError("failed-precondition", "Partnerangebot ist nicht im gueltigen Zeitraum.");
      if (Number(offer.remainingInventory || 0) <= 0) throw new HttpsError("resource-exhausted", "Partnerangebot ist ausverkauft.");
      const costWfxp = normalizedPositiveInteger(offer.costWfxp, 0, 100000);
      const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
      const balance = Number(wallet.balance || 0);
      if (!costWfxp || balance < costWfxp) throw new HttpsError("failed-precondition", "Nicht genug WFXP fuer dieses Partnerangebot.");
      const remainingWfxp = balance - costWfxp;
      const adminActionRef = db.collection("adminActions").doc(redemptionId);
      const auditEventRef = db.collection("auditEvents").doc(redemptionId);
      const commonLedger = {
        ledgerEventId: ledgerRef.id, ...scopedOwnerFields(userId, null), delta: -costWfxp,
        reason: "partner-offer-redemption", sourceType: "partnerOffer", sourceId: offerId,
        actorUserId: userId, idempotencyKey: redemptionId, currency: BETA1_INTERNAL_CURRENCY,
        noMonetaryValue: true, blockchainBacked: false, cashoutAllowed: false, tokenAuthorized: false,
        realMoney: false, metadata: { partnerId: offer.partnerId, offerId, redemptionId }, ...serverTimestamps(),
      };
      transaction.set(ledgerRef, commonLedger);
      transaction.set(legacyLedgerRef, commonLedger);
      transaction.set(walletRef, {
        walletId: walletRef.id, ...scopedOwnerFields(userId, null), balance: remainingWfxp,
        lifetimeEarned: Number(wallet.lifetimeEarned || 0), lifetimeSpent: Number(wallet.lifetimeSpent || 0) + costWfxp,
        currency: BETA1_INTERNAL_CURRENCY, noMonetaryValue: true, blockchainBacked: false,
        cashoutAllowed: false, tokenAuthorized: false, realMoney: false,
        createdAt: wallet.createdAt || FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.update(offerRef, { remainingInventory: Number(offer.remainingInventory) - 1, updatedAt: FieldValue.serverTimestamp() });
      transaction.set(redemptionRef, {
        redemptionId, ...scopedOwnerFields(userId, null), partnerId: offer.partnerId, offerId,
        requestId, status: "issued", costWfxp, remainingWfxp, xpLedgerEventId: ledgerRef.id,
        fulfillmentMode: "partner-admin-confirmation", noMonetaryValue: true, tokenAuthorized: false,
        cashoutAllowed: false, ...serverTimestamps(),
      });
      const audit = {
        actorUserId: userId, actionType: "partner-offer-issued", targetType: "partnerRedemption",
        targetId: redemptionId, reason: "beta1-server-authorized", ownerUserId: userId, userId,
        childProfileId: null, metadata: { partnerId: offer.partnerId, offerId, costWfxp },
        source: "beta1-runtime", refId: redemptionId, ...serverTimestamps(),
      };
      transaction.set(adminActionRef, { adminActionId: adminActionRef.id, ...audit });
      transaction.set(auditEventRef, { auditEventId: auditEventRef.id, ...audit });
      return { accepted: true, idempotent: false, redemptionId, status: "issued", remainingWfxp, tokenAuthorized: false, cashoutAllowed: false };
    });
  });

  exportsTarget.adminConfirmPartnerRedemption = onCall(async (request) => {
    const actorUserId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const redemptionId = requiredString(data.redemptionId, "redemptionId", HttpsError, 240);
    const presentationToken = requiredString(data.presentationToken, "presentationToken", HttpsError, 200);
    const ref = db.collection("partnerRedemptions").doc(redemptionId);
    const rate = await consumeOperationRateLimit(db, {
      action: "partner-redemption-confirm", actorUserId, limit: CONFIRM_ATTEMPT_LIMIT,
    }, HttpsError);
    try {
      const result = await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new HttpsError("not-found", "Partner-Einloesung wurde nicht gefunden.");
        const redemption = snapshot.data() || {};
      const isGlobalAdmin = request.auth && request.auth.token && request.auth.token.admin === true;
      const operatorRef = db.collection("partnerOperators").doc(partnerOperatorId(redemption.partnerId, actorUserId));
      const challengeRef = db.collection("partnerRedemptionChallenges").doc(redemptionId);
      const activityRef = db.collection("partnerChallengeActivity").doc(redemption.ownerUserId);
      const [operatorSnapshot, challengeSnapshot, activitySnapshot] = await Promise.all([
        transaction.get(operatorRef), transaction.get(challengeRef), transaction.get(activityRef),
      ]);
      const operator = operatorSnapshot.exists ? operatorSnapshot.data() || {} : {};
      if (!isGlobalAdmin && (operator.status !== "active" || operator.partnerId !== redemption.partnerId || operator.operatorUserId !== actorUserId)) {
        throw new HttpsError("permission-denied", "Keine aktive Berechtigung fuer diesen Partner.");
      }
      if (redemption.status !== "issued") throw new HttpsError("failed-precondition", "Partner-Einloesung ist nicht einloesbar.");
      if (!challengeSnapshot.exists) throw new HttpsError("failed-precondition", "Kein aktiver Einloesungsnachweis vorhanden.");
      const challenge = challengeSnapshot.data() || {};
      const suppliedHash = sha256(presentationToken);
      if (challenge.status !== "active" || Date.parse(challenge.expiresAt) <= Date.now() || !secureEqualHex(challenge.tokenHash, suppliedHash)) {
        throw new HttpsError("permission-denied", "Einloesungsnachweis ist ungueltig oder abgelaufen.");
      }
      const auditId = `partner_confirm_${safeDocIdPart(redemptionId)}`;
      transaction.update(ref, { status: "redeemed", redeemedAt: FieldValue.serverTimestamp(), redeemedByUserId: actorUserId, updatedAt: FieldValue.serverTimestamp() });
      transaction.update(challengeRef, { status: "consumed", consumedAt: FieldValue.serverTimestamp(), consumedByUserId: actorUserId, updatedAt: FieldValue.serverTimestamp() });
      const activity = activePresentations(activitySnapshot.exists ? (activitySnapshot.data() || {}).activePresentations : {});
      delete activity[redemptionId];
      transaction.set(activityRef, { ownerUserId: redemption.ownerUserId, userId: redemption.ownerUserId, activePresentations: activity, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      const audit = {
        actorUserId, actionType: "partner-offer-redeemed", targetType: "partnerRedemption",
        targetId: redemptionId, reason: "beta1-admin-confirmed", ownerUserId: redemption.ownerUserId,
        userId: redemption.ownerUserId, childProfileId: null,
        metadata: { partnerId: redemption.partnerId, offerId: redemption.offerId },
        source: "beta1-runtime", refId: redemptionId, ...serverTimestamps(),
      };
      transaction.set(db.collection("adminActions").doc(auditId), { adminActionId: auditId, ...audit });
      transaction.set(db.collection("auditEvents").doc(auditId), { auditEventId: auditId, ...audit });
      return { accepted: true, idempotent: false, redemptionId, status: "redeemed" };
      });
      await recordOperationOutcome(db, { action: "partner-redemption-confirm", actorUserId, outcome: "accepted", windowStart: rate.windowStart }).catch(() => {});
      return result;
    } catch (error) {
      await recordOperationOutcome(db, { action: "partner-redemption-confirm", actorUserId, outcome: outcomeForError(error), windowStart: rate.windowStart }).catch(() => {});
      throw error;
    }
  });
  exportsTarget.confirmPartnerRedemption = exportsTarget.adminConfirmPartnerRedemption;

  exportsTarget.createPartnerRedemptionPresentation = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const redemptionId = requiredString((request.data || {}).redemptionId, "redemptionId", HttpsError, 240);
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + PRESENTATION_TTL_MS).toISOString();
    const redemptionRef = db.collection("partnerRedemptions").doc(redemptionId);
    const challengeRef = db.collection("partnerRedemptionChallenges").doc(redemptionId);
    const activityRef = db.collection("partnerChallengeActivity").doc(userId);
    const rate = await consumeOperationRateLimit(db, {
      action: "partner-presentation-issue", actorUserId: userId, limit: PRESENTATION_ISSUE_LIMIT,
    }, HttpsError);
    try {
      await db.runTransaction(async (transaction) => {
        const redemptionSnapshot = await transaction.get(redemptionRef);
        if (!redemptionSnapshot.exists || (redemptionSnapshot.data() || {}).ownerUserId !== userId) {
          throw new HttpsError("permission-denied", "Partner-Einloesung gehoert nicht diesem Nutzer.");
        }
        const redemption = redemptionSnapshot.data() || {};
        if (redemption.status !== "issued") throw new HttpsError("failed-precondition", "Einloesung kann nicht praesentiert werden.");
        const activitySnapshot = await transaction.get(activityRef);
        const active = activePresentations(activitySnapshot.exists ? (activitySnapshot.data() || {}).activePresentations : {});
        if (!Object.prototype.hasOwnProperty.call(active, redemptionId) && Object.keys(active).length >= ACTIVE_PRESENTATION_LIMIT) {
          throw new HttpsError("resource-exhausted", "Zu viele aktive Einloesungsnachweise.");
        }
        active[redemptionId] = expiresAt;
        transaction.set(challengeRef, {
          challengeId: challengeRef.id, redemptionId, ownerUserId: userId, userId,
          partnerId: redemption.partnerId, offerId: redemption.offerId, tokenHash,
          status: "active", expiresAt, tokenVersion: "2026-09-v1", ...serverTimestamps(),
        });
        transaction.set(activityRef, {
          ownerUserId: userId, userId, activePresentations: active,
          createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      await recordOperationOutcome(db, { action: "partner-presentation-issue", actorUserId: userId, outcome: "accepted", windowStart: rate.windowStart }).catch(() => {});
      return { accepted: true, redemptionId, presentationToken: token, expiresAt, singleUse: true };
    } catch (error) {
      await recordOperationOutcome(db, { action: "partner-presentation-issue", actorUserId: userId, outcome: outcomeForError(error), windowStart: rate.windowStart }).catch(() => {});
      throw error;
    }
  });

  exportsTarget.cancelPartnerRedemption = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const redemptionId = requiredString((request.data || {}).redemptionId, "redemptionId", HttpsError, 240);
    const redemptionRef = db.collection("partnerRedemptions").doc(redemptionId);
    return db.runTransaction(async (transaction) => {
      const redemptionSnapshot = await transaction.get(redemptionRef);
      if (!redemptionSnapshot.exists || (redemptionSnapshot.data() || {}).ownerUserId !== userId) {
        throw new HttpsError("permission-denied", "Partner-Einloesung gehoert nicht diesem Nutzer.");
      }
      const redemption = redemptionSnapshot.data() || {};
      if (redemption.status === "cancelled") return { accepted: true, idempotent: true, redemptionId, status: "cancelled" };
      if (redemption.status !== "issued") throw new HttpsError("failed-precondition", "Nur eine noch nicht verwendete Einloesung kann storniert werden.");
      const walletRef = await getWalletRef(db, userId, null);
      const offerRef = db.collection("partnerOffers").doc(redemption.offerId);
      const refundLedgerId = `${redemptionId}_refund`;
      const refundLedgerRef = db.collection("xpLedgerEvents").doc(refundLedgerId);
      const legacyRefundLedgerRef = db.collection("ledgerEvents").doc(refundLedgerId);
      const activityRef = db.collection("partnerChallengeActivity").doc(userId);
      const [walletSnapshot, offerSnapshot, refundSnapshot, activitySnapshot] = await Promise.all([
        transaction.get(walletRef), transaction.get(offerRef), transaction.get(refundLedgerRef), transaction.get(activityRef),
      ]);
      if (refundSnapshot.exists) throw new HttpsError("failed-precondition", "Inkonsistenter Stornierungszustand.");
      const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
      const costWfxp = normalizedPositiveInteger(redemption.costWfxp, 0, 100000);
      if (!costWfxp) throw new HttpsError("failed-precondition", "Einloesung hat keinen gueltigen WFXP-Wert.");
      const nextBalance = Number(wallet.balance || 0) + costWfxp;
      const ledger = {
        ledgerEventId: refundLedgerId, ...scopedOwnerFields(userId, null), delta: costWfxp,
        reason: "partner-offer-redemption-cancelled", sourceType: "partnerRedemption", sourceId: redemptionId,
        actorUserId: userId, idempotencyKey: refundLedgerId, currency: BETA1_INTERNAL_CURRENCY,
        noMonetaryValue: true, blockchainBacked: false, cashoutAllowed: false, tokenAuthorized: false,
        realMoney: false, metadata: { partnerId: redemption.partnerId, offerId: redemption.offerId }, ...serverTimestamps(),
      };
      transaction.set(refundLedgerRef, ledger);
      transaction.set(legacyRefundLedgerRef, ledger);
      transaction.set(walletRef, {
        walletId: walletRef.id, ...scopedOwnerFields(userId, null), balance: nextBalance,
        lifetimeEarned: Number(wallet.lifetimeEarned || 0),
        lifetimeSpent: Math.max(0, Number(wallet.lifetimeSpent || 0) - costWfxp),
        currency: BETA1_INTERNAL_CURRENCY, noMonetaryValue: true, blockchainBacked: false,
        cashoutAllowed: false, tokenAuthorized: false, realMoney: false,
        createdAt: wallet.createdAt || FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      if (offerSnapshot.exists) transaction.update(offerRef, { remainingInventory: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
      transaction.update(redemptionRef, { status: "cancelled", cancelledAt: FieldValue.serverTimestamp(), refundLedgerEventId: refundLedgerId, updatedAt: FieldValue.serverTimestamp() });
      const activity = activePresentations(activitySnapshot.exists ? (activitySnapshot.data() || {}).activePresentations : {});
      delete activity[redemptionId];
      transaction.set(activityRef, { ownerUserId: userId, userId, activePresentations: activity, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return { accepted: true, idempotent: false, redemptionId, status: "cancelled", remainingWfxp: nextBalance };
    });
  });
}

module.exports = {
  registerBeta1PartnerRedemption, offerWindowState, partnerOperatorId, sha256, secureEqualHex,
  PRESENTATION_TTL_MS, RATE_WINDOW_MS, PRESENTATION_ISSUE_LIMIT, CONFIRM_ATTEMPT_LIMIT,
  ACTIVE_PRESENTATION_LIMIT, rateWindowStart, rateLimitId, activePresentations,
};
