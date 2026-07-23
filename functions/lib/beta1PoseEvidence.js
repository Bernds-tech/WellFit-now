const {
  requireAuth,
  requiredString,
  optionalString,
  clientContext,
  serverTimestamps,
  updatedTimestamp,
} = require("./beta1Runtime");

function boundedInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

function boundedNumber(value, fallback, min, max, digits = 3) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const bounded = Math.max(min, Math.min(max, number));
  return Number(bounded.toFixed(digits));
}

function buildPoseSummary(data) {
  return {
    schemaVersion: "beta1-pose-summary-v1",
    exercise: optionalString(data.exercise, 80) || "squat",
    targetReps: boundedInteger(data.targetReps, 1, 1, 100),
    validReps: boundedInteger(data.validReps, 0, 0, 250),
    invalidReps: boundedInteger(data.invalidReps, 0, 0, 250),
    qualityScore: boundedNumber(data.qualityScore, 0, 0, 100, 1),
    confidence: boundedNumber(data.confidence, 0, 0, 1, 3),
    moodSignal: optionalString(data.moodSignal, 40),
    rawMediaStored: false,
    rawMediaUploaded: false,
    onDeviceAnalysis: true,
    rewardAuthorized: false,
    missionCompletionAuthorized: false,
  };
}

function publicPoseProof(doc) {
  const data = doc.data() || {};
  return {
    proofEventId: doc.id,
    sessionId: optionalString(data.sessionId, 180),
    missionId: optionalString(data.missionId, 180),
    proofSummary: data.proofSummary && typeof data.proofSummary === "object" ? data.proofSummary : null,
    serverValidationStatus: optionalString(data.serverValidationStatus, 120) || "pose-summary-received",
  };
}

function registerBeta1PoseEvidence(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.recordPoseTrackingProof = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const sessionId = requiredString(data.sessionId, "sessionId", HttpsError, 180);
    const proofSummary = buildPoseSummary(data);
    const sessionRef = db.collection("trackingSessions").doc(sessionId);
    const proofRef = db.collection("trackingProofEvents").doc(`pose_${sessionId}`);
    let idempotent = false;

    await db.runTransaction(async (transaction) => {
      const [sessionSnapshot, proofSnapshot] = await Promise.all([
        transaction.get(sessionRef),
        transaction.get(proofRef),
      ]);
      if (!sessionSnapshot.exists) {
        throw new HttpsError("not-found", "Tracking-Session wurde nicht gefunden.");
      }
      const session = sessionSnapshot.data() || {};
      if (session.userId !== userId && session.ownerUserId !== userId) {
        throw new HttpsError("permission-denied", "Tracking-Session gehoert nicht diesem Nutzer.");
      }
      if (proofSnapshot.exists) {
        idempotent = true;
        return;
      }

      transaction.set(proofRef, {
        proofEventId: proofRef.id,
        sessionId,
        ownerUserId: userId,
        userId,
        missionId: optionalString(session.missionId, 180),
        proofType: "pose",
        clientClaimStatus: "completed",
        serverValidationStatus: "pose-summary-received",
        proofSummary,
        rawMediaStored: false,
        rawMediaUploaded: false,
        rewardAuthorized: false,
        missionCompletionAuthorized: false,
        ...clientContext(data),
        ...serverTimestamps(),
      });
      transaction.set(sessionRef, {
        status: "proof-submitted",
        lastProofType: "pose",
        lastProofEventId: proofRef.id,
        proofEventCount: Number(session.proofEventCount || 0) + 1,
        serverValidationStatus: "pose-summary-received",
        rewardAuthorized: false,
        missionCompletionAuthorized: false,
        ...updatedTimestamp(),
      }, { merge: true });
    });

    const proofSnapshot = await proofRef.get();
    return {
      accepted: true,
      ...publicPoseProof(proofSnapshot),
      idempotent,
      rawMediaStored: false,
      rawMediaUploaded: false,
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      tokenAuthorized: false,
    };
  });
}

module.exports = {
  registerBeta1PoseEvidence,
  buildPoseSummary,
  publicPoseProof,
};
