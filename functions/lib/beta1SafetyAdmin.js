const {
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  updatedTimestamp,
  writeAudit,
} = require("./beta1Runtime");

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

function registerBeta1SafetyAdmin(exportsTarget, { db, onCall, HttpsError }) {
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
