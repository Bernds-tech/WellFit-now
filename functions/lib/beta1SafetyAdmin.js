const {
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  updatedTimestamp,
  writeAudit,
} = require("./beta1Runtime");
const { registerBeta1DailyMissionCatalog } = require("./beta1DailyMissionCatalog");
const { registerBeta1DailyMissionProgress } = require("./beta1DailyMissionProgress");

const MISSION_EVIDENCE_REVIEW_STATUSES = new Set([
  "pending-server-review",
  "approved",
  "rejected",
  "needs-more-evidence",
]);

function timestampToIso(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return null;
}

function publicMissionEvidence(doc) {
  const data = doc.data() || {};
  return {
    evidenceId: doc.id,
    attemptId: optionalString(data.attemptId, 180),
    missionId: optionalString(data.missionId, 180),
    ownerUserId: optionalString(data.ownerUserId, 180),
    childProfileId: optionalString(data.childProfileId, 180),
    evidenceType: optionalString(data.evidenceType, 80) || "unknown",
    status: optionalString(data.status, 80) || "unknown",
    reviewStatus: optionalString(data.reviewStatus, 80) || "pending-server-review",
    serverValidationStatus: optionalString(data.serverValidationStatus, 120) || "unknown",
    storageRefPresent: Boolean(optionalString(data.storageRef, 500)),
    metadataKeys: data.metadata && typeof data.metadata === "object"
      ? Object.keys(data.metadata).filter((key) => typeof key === "string").slice(0, 12)
      : [],
    createdAt: timestampToIso(data.createdAt),
    reviewedAt: timestampToIso(data.reviewedAt) || optionalString(data.reviewedAt, 80),
  };
}

function registerBeta1SafetyAdmin(exportsTarget, deps) {
  const { db, onCall, HttpsError } = deps;

  // Daily mission catalog and progress use the existing Beta-1 mission, evidence,
  // completion and WFXP runtime. No parallel mission or economy service is created.
  registerBeta1DailyMissionCatalog(exportsTarget, deps);
  registerBeta1DailyMissionProgress(exportsTarget, deps);

  // User-owned status projection for the evidence-review completion loop.
  // It exposes no evidence payload, no other-user data and no write authority.
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

  exportsTarget.adminListMissionEvidence = onCall(async (request) => {
    requireAdmin(request, HttpsError);
    const data = request.data || {};
    const reviewStatus = optionalString(data.reviewStatus, 80) || "pending-server-review";
    if (!MISSION_EVIDENCE_REVIEW_STATUSES.has(reviewStatus)) {
      throw new HttpsError("invalid-argument", "reviewStatus ist fuer die Beta-1 Evidence Queue nicht erlaubt.");
    }
    const requestedLimit = normalizedPositiveInteger(data.limit, 50, 100);
    const snapshot = await db.collection("missionEvidence").limit(100).get();
    const evidence = snapshot.docs
      .map(publicMissionEvidence)
      .filter((item) => item.reviewStatus === reviewStatus)
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
      .slice(0, requestedLimit);
    return {
      accepted: true,
      reviewStatus,
      evidence,
      count: evidence.length,
      rawMetadataIncluded: false,
      storageContentIncluded: false,
    };
  });

  exportsTarget.adminReviewSafetyReport = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const reportId = requiredString(data.reportId, "reportId", HttpsError);
    const status = optionalString(data.status, 80) || "reviewed";
    await db.collection("safetyReports").doc(reportId).set(
      {
        status,
        reviewedByAdminId: actorUserId,
        reviewNote: optionalString(data.reviewNote, 500),
        reviewedAt: new Date().toISOString(),
        ...updatedTimestamp(),
      },
      { merge: true },
    );
    await writeAudit(db, {
      actorUserId,
      actionType: "safety-report-reviewed",
      targetType: "safetyReport",
      targetId: reportId,
      reason: data.reviewNote,
    });
    return { accepted: true, reportId, status };
  });
}

module.exports = { registerBeta1SafetyAdmin };
