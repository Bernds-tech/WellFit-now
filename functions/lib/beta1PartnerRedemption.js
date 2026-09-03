const { FieldValue } = require("firebase-admin/firestore");
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

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
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

  exportsTarget.adminUpsertPartnerOffer = onCall(async (request) => {
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
    const status = data.status === "draft" ? "draft" : "published";
    await db.collection("partnerOffers").doc(offerId).set({
      offerId,
      partnerId,
      title: requiredString(data.title, "title", HttpsError, 120),
      description: optionalString(data.description, 500),
      costWfxp,
      initialInventory: remainingInventory,
      remainingInventory,
      perUserLimit: 1,
      validFrom: validFrom.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status,
      noPayments: true,
      tokenAuthorized: false,
      updatedByUserId: actorUserId,
      createdAt: FieldValue.serverTimestamp(),
      ...updatedTimestamp(),
    }, { merge: true });
    return { accepted: true, offerId, partnerId, status };
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
    const actorUserId = requireAdmin(request, HttpsError);
    const redemptionId = requiredString((request.data || {}).redemptionId, "redemptionId", HttpsError, 240);
    const ref = db.collection("partnerRedemptions").doc(redemptionId);
    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new HttpsError("not-found", "Partner-Einloesung wurde nicht gefunden.");
      const redemption = snapshot.data() || {};
      if (redemption.status === "redeemed") return { accepted: true, idempotent: true, redemptionId, status: "redeemed" };
      if (redemption.status !== "issued") throw new HttpsError("failed-precondition", "Partner-Einloesung ist nicht einloesbar.");
      const auditId = `partner_confirm_${safeDocIdPart(redemptionId)}`;
      transaction.update(ref, { status: "redeemed", redeemedAt: FieldValue.serverTimestamp(), redeemedByUserId: actorUserId, updatedAt: FieldValue.serverTimestamp() });
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
    return result;
  });
}

module.exports = { registerBeta1PartnerRedemption, offerWindowState };
