const {
  requireAuth,
  requiredString,
  optionalString,
} = require("./beta1Runtime");

function registerBeta1MissionStatus(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getMissionAttemptStatus = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const attemptId = requiredString(data.attemptId, "attemptId", HttpsError, 180);
    const evidenceId = requiredString(data.evidenceId, "evidenceId", HttpsError, 180);

    const [attemptSnapshot, evidenceSnapshot, completionSnapshot] = await Promise.all([
      db.collection("missionAttempts").doc(attemptId).get(),
      db.collection("missionEvidence").doc(evidenceId).get(),
      db.collection("missionCompletions").doc(attemptId).get(),
    ]);

    if (!attemptSnapshot.exists) throw new HttpsError("not-found", "Mission Attempt wurde nicht gefunden.");
    const attempt = attemptSnapshot.data() || {};
    if (attempt.ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Mission Attempt gehoert nicht diesem Nutzer.");
    }

    if (!evidenceSnapshot.exists) throw new HttpsError("not-found", "Mission Evidence wurde nicht gefunden.");
    const evidence = evidenceSnapshot.data() || {};
    if (
      evidence.ownerUserId !== userId
      || evidence.attemptId !== attemptId
      || evidence.missionId !== attempt.missionId
    ) {
      throw new HttpsError("permission-denied", "Mission Evidence passt nicht zu diesem Nutzer und Attempt.");
    }

    const completion = completionSnapshot.exists ? completionSnapshot.data() || {} : {};
    const reviewStatus = optionalString(evidence.reviewStatus, 80) || "pending-server-review";
    const serverValidationStatus = optionalString(evidence.serverValidationStatus, 120) || "evidence-received";
    const isCompleted = completionSnapshot.exists && completion.status === "completed";
    const canRequestCompletion = !isCompleted
      && reviewStatus === "approved"
      && serverValidationStatus === "evidence-approved";

    return {
      accepted: true,
      attemptId,
      evidenceId,
      missionId: attempt.missionId || null,
      attemptStatus: optionalString(attempt.status, 80) || "unknown",
      reviewStatus,
      serverValidationStatus,
      completionStatus: isCompleted ? "completed" : "not-completed",
      canRequestCompletion,
      missionCompletionAuthorized: isCompleted,
      xpAuthorized: isCompleted,
      rewardXp: isCompleted ? Number(completion.rewardXp || 0) : 0,
      xpLedgerEventId: isCompleted ? optionalString(completion.xpLedgerEventId, 180) : null,
      tokenAuthorized: false,
      cashoutAllowed: false,
      noMonetaryValue: true,
    };
  });
}

module.exports = { registerBeta1MissionStatus };
