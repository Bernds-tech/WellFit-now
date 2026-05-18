const {
  requireAdmin,
  requiredString,
  optionalString,
  updatedTimestamp,
  writeAudit,
} = require("./beta1Runtime");

function registerBeta1SafetyAdmin(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.adminReviewSafetyReport = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const reportId = requiredString(data.reportId, "reportId", HttpsError);
    const status = optionalString(data.status, 80) || "reviewed";
    await db.collection("safetyReports").doc(reportId).set({ status, reviewedByAdminId: actorUserId, reviewNote: optionalString(data.reviewNote, 500), reviewedAt: new Date().toISOString(), ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId, actionType: "safety-report-reviewed", targetType: "safetyReport", targetId: reportId, reason: data.reviewNote });
    return { accepted: true, reportId, status };
  });
}

module.exports = { registerBeta1SafetyAdmin };
