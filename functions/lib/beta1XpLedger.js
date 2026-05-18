const { FieldValue } = require("firebase-admin/firestore");
const {
  BETA1_INTERNAL_CURRENCY,
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  scopedOwnerFields,
  assertGuardianCanUseChild,
  getWalletRef,
  writeAudit,
} = require("./beta1Runtime");

async function readWallet(db, ownerUserId, childProfileId) {
  const walletRef = await getWalletRef(db, ownerUserId, childProfileId);
  const snapshot = await walletRef.get();
  if (!snapshot.exists) {
    return {
      walletId: walletRef.id,
      ownerUserId,
      userId: ownerUserId,
      childProfileId: childProfileId || null,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      currency: BETA1_INTERNAL_CURRENCY,
      noMonetaryValue: true,
      blockchainBacked: false,
      cashoutAllowed: false,
      tokenAuthorized: false,
      realMoney: false,
    };
  }
  return { walletId: walletRef.id, ...(snapshot.data() || {}) };
}

async function applyXpDelta(db, { ownerUserId, childProfileId, delta, reason, sourceType, sourceId, actorUserId, idempotencyKey, metadata }) {
  const safeDelta = Math.trunc(Number(delta));
  if (!Number.isFinite(safeDelta) || safeDelta === 0) {
    throw new Error("XP delta must be a non-zero integer.");
  }
  const walletRef = await getWalletRef(db, ownerUserId, childProfileId);
  const ledgerRef = idempotencyKey ? db.collection("xpLedgerEvents").doc(idempotencyKey) : db.collection("xpLedgerEvents").doc();
  const legacyLedgerRef = db.collection("ledgerEvents").doc(ledgerRef.id);

  await db.runTransaction(async (transaction) => {
    const existingLedger = await transaction.get(ledgerRef);
    if (existingLedger.exists) return;
    const walletSnapshot = await transaction.get(walletRef);
    const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
    const currentBalance = Number(wallet.balance || 0);
    const nextBalance = currentBalance + safeDelta;
    if (nextBalance < 0) {
      const error = new Error("insufficient-wfxp-balance");
      error.code = "insufficient-wfxp-balance";
      throw error;
    }
    const common = {
      ledgerEventId: ledgerRef.id,
      ...scopedOwnerFields(ownerUserId, childProfileId),
      delta: safeDelta,
      reason: optionalString(reason, 160) || "beta1-server-authorized",
      sourceType: optionalString(sourceType, 120) || "beta1-runtime",
      sourceId: optionalString(sourceId, 180),
      actorUserId: actorUserId || "server",
      idempotencyKey: idempotencyKey || ledgerRef.id,
      currency: BETA1_INTERNAL_CURRENCY,
      noMonetaryValue: true,
      blockchainBacked: false,
      cashoutAllowed: false,
      tokenAuthorized: false,
      realMoney: false,
      metadata: metadata || {},
      ...serverTimestamps(),
    };
    transaction.set(ledgerRef, common);
    transaction.set(legacyLedgerRef, common);
    transaction.set(walletRef, {
      walletId: walletRef.id,
      ...scopedOwnerFields(ownerUserId, childProfileId),
      balance: nextBalance,
      lifetimeEarned: Number(wallet.lifetimeEarned || 0) + (safeDelta > 0 ? safeDelta : 0),
      lifetimeSpent: Number(wallet.lifetimeSpent || 0) + (safeDelta < 0 ? Math.abs(safeDelta) : 0),
      currency: BETA1_INTERNAL_CURRENCY,
      noMonetaryValue: true,
      blockchainBacked: false,
      cashoutAllowed: false,
      tokenAuthorized: false,
      realMoney: false,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: wallet.createdAt || FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  await writeAudit(db, {
    actorUserId: actorUserId || "server",
    actionType: safeDelta > 0 ? "xp-grant" : "xp-spend",
    targetType: "xpWallet",
    targetId: walletRef.id,
    ownerUserId,
    childProfileId,
    reason,
    metadata: { ledgerEventId: ledgerRef.id, delta: safeDelta, sourceType, sourceId },
  });

  return { ledgerEventId: ledgerRef.id, walletId: walletRef.id };
}

function registerBeta1XpLedger(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getXpWallet = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const childProfileId = optionalString((request.data || {}).childProfileId, 160);
    if (childProfileId) await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    const wallet = await readWallet(db, userId, childProfileId);
    return { accepted: true, wallet, noMonetaryValue: true, tokenAuthorized: false, cashoutAllowed: false };
  });

  exportsTarget.previewXpReward = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const requestedXp = normalizedPositiveInteger(data.requestedXp, 10, 250);
    const cappedXp = Math.min(requestedXp, 100);
    return {
      accepted: false,
      ownerUserId: userId,
      previewXp: cappedXp,
      currency: BETA1_INTERNAL_CURRENCY,
      rewardAuthorized: false,
      xpAuthorized: false,
      missionCompletionAuthorized: false,
      noMonetaryValue: true,
    };
  });

  exportsTarget.listXpLedger = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const childProfileId = optionalString((request.data || {}).childProfileId, 160);
    if (childProfileId) await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    let query = db.collection("xpLedgerEvents").where("ownerUserId", "==", userId).limit(50);
    if (childProfileId) query = query.where("childProfileId", "==", childProfileId);
    const snapshot = await query.get();
    return { accepted: true, events: snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) })) };
  });

  exportsTarget.adminAdjustXp = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const ownerUserId = requiredString(data.ownerUserId, "ownerUserId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    const delta = Math.trunc(Number(data.delta));
    if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 1000) {
      throw new HttpsError("invalid-argument", "delta muss eine ganze Zahl zwischen -1000 und 1000 ohne 0 sein.");
    }
    const reason = requiredString(data.reason, "reason", HttpsError, 240);
    const result = await applyXpDelta(db, {
      ownerUserId,
      childProfileId,
      delta,
      actorUserId,
      reason,
      sourceType: "admin-adjustment",
      sourceId: optionalString(data.sourceId, 180),
      idempotencyKey: optionalString(data.idempotencyKey, 180),
    });
    const wallet = await readWallet(db, ownerUserId, childProfileId);
    return { accepted: true, ...result, wallet, xpAuthorized: true, tokenAuthorized: false, cashoutAllowed: false, noMonetaryValue: true };
  });
}

module.exports = { registerBeta1XpLedger, applyXpDelta, readWallet };
