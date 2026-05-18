const {
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  assertGuardianCanUseChild,
  writeAudit,
} = require("./beta1Runtime");
const { applyXpDelta } = require("./beta1XpLedger");

function registerBeta1CheckpointsMayor(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.listCheckpoints = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const snapshot = await db.collection("checkpoints").where("status", "==", "published").limit(50).get();
    return { accepted: true, checkpoints: snapshot.docs.map((doc) => ({ checkpointId: doc.id, ...(doc.data() || {}) })) };
  });

  exportsTarget.adminCreateCheckpoint = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const requestedCheckpointId = optionalString(data.checkpointId, 160);
    const checkpointRef = requestedCheckpointId ? db.collection("checkpoints").doc(requestedCheckpointId) : db.collection("checkpoints").doc();
    await checkpointRef.set({ checkpointId: checkpointRef.id, regionId: optionalString(data.regionId, 80) || "beta1-at", locationId: optionalString(data.locationId, 160), title: requiredString(data.title, "title", HttpsError, 120), status: "published", childAllowed: data.childAllowed === true, createdByAdminId: actorUserId, ...serverTimestamps() });
    await writeAudit(db, { actorUserId, actionType: "checkpoint-created", targetType: "checkpoint", targetId: checkpointRef.id });
    return { accepted: true, checkpointId: checkpointRef.id };
  });

  exportsTarget.submitCheckpointScore = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const checkpointId = requiredString(data.checkpointId, "checkpointId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) throw new HttpsError("failed-precondition", "Junior Mayors sind in Beta 1 deaktiviert.");
    const checkpoint = await db.collection("checkpoints").doc(checkpointId).get();
    if (!checkpoint.exists || (checkpoint.data() || {}).status !== "published") throw new HttpsError("not-found", "Checkpoint nicht verfuegbar.");
    if (childProfileId) await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    const scoreRef = db.collection("checkpointScores").doc();
    const score = normalizedPositiveInteger(data.score, 1, 100000);
    await scoreRef.set({ scoreId: scoreRef.id, checkpointId, ownerUserId: userId, userId, childProfileId: null, score, proofEventId: optionalString(data.proofEventId, 180), status: "server-validated", mayorEvaluationPending: true, ...serverTimestamps() });
    return { accepted: true, scoreId: scoreRef.id, mayorAuthorized: false, juniorMayorAllowed: false };
  });

  exportsTarget.evaluateCheckpointMayor = onCall(async () => {
    throw new HttpsError("failed-precondition", "evaluateCheckpointMayor ist internal-only und nicht als Client Callable aktiviert.");
  });

  exportsTarget.listCheckpointMayorHistory = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const checkpointId = requiredString((request.data || {}).checkpointId, "checkpointId", HttpsError);
    const snapshot = await db.collection("checkpointMayors").where("checkpointId", "==", checkpointId).limit(20).get();
    return { accepted: true, mayors: snapshot.docs.map((doc) => ({ mayorId: doc.id, checkpointId: doc.data().checkpointId, ownerUserId: doc.data().ownerUserId, termStart: doc.data().termStart || null, termEnd: doc.data().termEnd || null })) };
  });

  exportsTarget.grantMayorShareXp = onCall(async () => {
    throw new HttpsError("failed-precondition", "grantMayorShareXp ist internal-only und nicht als Client Callable aktiviert.");
  });

  exportsTarget.adminGrantMayorShareXp = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const mayorUserId = requiredString(data.mayorUserId, "mayorUserId", HttpsError);
    const checkpointId = requiredString(data.checkpointId, "checkpointId", HttpsError);
    const xpAmount = normalizedPositiveInteger(data.xpAmount, 1, 100);
    const requestedIdempotencyKey = optionalString(data.idempotencyKey, 180);
    const shareDocId = requestedIdempotencyKey ? `mayor_share_${encodeURIComponent(requestedIdempotencyKey)}` : null;
    const shareRef = shareDocId ? db.collection("mayorShareEvents").doc(shareDocId) : db.collection("mayorShareEvents").doc();
    const existingShare = await shareRef.get();
    if (existingShare.exists) {
      return { accepted: true, eventId: shareRef.id, xpAuthorized: true, tokenAuthorized: false, cashoutAllowed: false, idempotent: true };
    }
    const ledger = await applyXpDelta(db, { ownerUserId: mayorUserId, childProfileId: null, delta: xpAmount, reason: "mayor-share-wfxp", sourceType: "mayorShareEvent", sourceId: shareRef.id, actorUserId, idempotencyKey: requestedIdempotencyKey || `mayor_share_${shareRef.id}` });
    await shareRef.set({ eventId: shareRef.id, checkpointId, mayorUserId, ownerUserId: mayorUserId, userId: mayorUserId, xpAmount, ledgerEventId: ledger.ledgerEventId, reason: optionalString(data.reason, 240) || "beta1-internal-wfxp-share", monetaryValue: false, tokenShare: false, cashoutAllowed: false, ...serverTimestamps() });
    await writeAudit(db, { actorUserId, actionType: "mayor-share-granted", targetType: "mayorShareEvent", targetId: shareRef.id, ownerUserId: mayorUserId, metadata: { xpAmount, checkpointId } });
    return { accepted: true, eventId: shareRef.id, xpAuthorized: true, tokenAuthorized: false, cashoutAllowed: false, idempotent: false };
  });
}

module.exports = { registerBeta1CheckpointsMayor };
