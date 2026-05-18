const {
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  updatedTimestamp,
  clientContext,
  assertGuardianCanUseChild,
  requireChildConsent,
  writeAudit,
} = require("./beta1Runtime");
const { applyXpDelta } = require("./beta1XpLedger");

function publicMission(doc) {
  const data = doc.data() || {};
  return { missionId: doc.id, title: data.title, type: data.type, status: data.status, rewardXp: data.rewardXp || 0, childAllowed: data.childAllowed === true };
}

function registerBeta1Missions(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.listMissions = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const snapshot = await db.collection("missions").where("status", "==", "published").limit(50).get();
    return { accepted: true, missions: snapshot.docs.map(publicMission) };
  });

  exportsTarget.getMissionDetail = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const missionId = requiredString((request.data || {}).missionId, "missionId", HttpsError);
    const doc = await db.collection("missions").doc(missionId).get();
    if (!doc.exists || (doc.data() || {}).status !== "published") throw new HttpsError("not-found", "Mission nicht verfuegbar.");
    return { accepted: true, mission: publicMission(doc) };
  });

  exportsTarget.adminCreateMission = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const requestedMissionId = optionalString(data.missionId, 160);
    const missionRef = requestedMissionId ? db.collection("missions").doc(requestedMissionId) : db.collection("missions").doc();
    await missionRef.set({
      missionId: missionRef.id,
      title: requiredString(data.title, "title", HttpsError, 120),
      type: optionalString(data.type, 80) || "movement",
      status: "draft",
      rewardXp: normalizedPositiveInteger(data.rewardXp, 25, 250),
      childAllowed: data.childAllowed === true,
      createdByAdminId: actorUserId,
      ...serverTimestamps(),
    });
    await writeAudit(db, { actorUserId, actionType: "mission-created", targetType: "mission", targetId: missionRef.id, reason: data.reason });
    return { accepted: true, missionId: missionRef.id, status: "draft" };
  });

  exportsTarget.adminUpdateMission = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError);
    const patch = { ...updatedTimestamp() };
    const title = optionalString(data.title, 120);
    const type = optionalString(data.type, 80);
    if (title) patch.title = title;
    if (type) patch.type = type;
    if (data.rewardXp !== undefined) patch.rewardXp = normalizedPositiveInteger(data.rewardXp, 25, 250);
    if (data.childAllowed !== undefined) patch.childAllowed = data.childAllowed === true;
    await db.collection("missions").doc(missionId).set(patch, { merge: true });
    await writeAudit(db, { actorUserId, actionType: "mission-updated", targetType: "mission", targetId: missionId, reason: data.reason });
    return { accepted: true, missionId };
  });

  exportsTarget.adminPublishMission = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const missionId = requiredString((request.data || {}).missionId, "missionId", HttpsError);
    await db.collection("missions").doc(missionId).set({ status: "published", publishedAt: new Date().toISOString(), ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId, actionType: "mission-published", targetType: "mission", targetId: missionId });
    return { accepted: true, missionId, status: "published" };
  });

  exportsTarget.startMissionAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      await requireChildConsent(db, userId, childProfileId, "missions", HttpsError);
    }
    const mission = await db.collection("missions").doc(missionId).get();
    if (!mission.exists || (mission.data() || {}).status !== "published") throw new HttpsError("failed-precondition", "Mission ist nicht publiziert.");
    if (childProfileId && (mission.data() || {}).childAllowed !== true) throw new HttpsError("failed-precondition", "Mission ist nicht fuer Child Profiles freigegeben.");
    const attemptRef = db.collection("missionAttempts").doc();
    await attemptRef.set({ attemptId: attemptRef.id, missionId, ownerUserId: userId, userId, childProfileId: childProfileId || null, status: "started", ...clientContext(data), ...serverTimestamps() });
    return { accepted: true, attemptId: attemptRef.id, status: "started", missionCompletionAuthorized: false };
  });

  exportsTarget.submitMissionEvidence = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const attemptId = requiredString(data.attemptId, "attemptId", HttpsError);
    const attempt = await db.collection("missionAttempts").doc(attemptId).get();
    if (!attempt.exists || (attempt.data() || {}).ownerUserId !== userId) throw new HttpsError("permission-denied", "Attempt gehoert nicht diesem Nutzer.");
    const evidenceRef = db.collection("missionEvidence").doc();
    await evidenceRef.set({ evidenceId: evidenceRef.id, attemptId, missionId: attempt.data().missionId, ownerUserId: userId, userId, childProfileId: attempt.data().childProfileId || null, evidenceType: optionalString(data.evidenceType, 80) || "client-request", storageRef: optionalString(data.storageRef, 500), metadata: data.metadata || {}, status: "submitted", reviewStatus: "pending-server-review", ...clientContext(data), ...serverTimestamps() });
    await db.collection("missionAttempts").doc(attemptId).set({ status: "evidence-submitted", ...updatedTimestamp() }, { merge: true });
    return { accepted: true, evidenceId: evidenceRef.id, reviewStatus: "pending-server-review", missionCompletionAuthorized: false, xpAuthorized: false };
  });

  exportsTarget.completeMissionAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const attemptId = requiredString(data.attemptId, "attemptId", HttpsError);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const attempt = await attemptRef.get();
    if (!attempt.exists || (attempt.data() || {}).ownerUserId !== userId) throw new HttpsError("permission-denied", "Attempt gehoert nicht diesem Nutzer.");
    const evidence = await db.collection("missionEvidence").where("attemptId", "==", attemptId).where("ownerUserId", "==", userId).limit(1).get();
    if (evidence.empty) throw new HttpsError("failed-precondition", "Server-seitige Evidence ist erforderlich.");
    const mission = await db.collection("missions").doc(attempt.data().missionId).get();
    const rewardXp = Math.min(Number((mission.data() || {}).rewardXp || 25), 100);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    await completionRef.set({ completionId: completionRef.id, attemptId, missionId: attempt.data().missionId, ownerUserId: userId, userId, childProfileId: attempt.data().childProfileId || null, status: "completed", rewardXp, completedAt: new Date().toISOString(), ...serverTimestamps() });
    const ledger = await applyXpDelta(db, { ownerUserId: userId, childProfileId: attempt.data().childProfileId || null, delta: rewardXp, reason: "mission-completion", sourceType: "missionCompletion", sourceId: completionRef.id, actorUserId: "server", idempotencyKey: `mission_completion_${attemptId}` });
    await completionRef.set({ xpLedgerEventId: ledger.ledgerEventId }, { merge: true });
    await attemptRef.set({ status: "completed", completionId: completionRef.id, ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId: "server", actionType: "mission-completed", targetType: "missionCompletion", targetId: completionRef.id, ownerUserId: userId, childProfileId: attempt.data().childProfileId || null, metadata: { rewardXp, ledgerEventId: ledger.ledgerEventId } });
    return { accepted: true, completionId: completionRef.id, rewardXp, xpAuthorized: true, missionCompletionAuthorized: true, tokenAuthorized: false };
  });

  exportsTarget.reportMissionSafetyIssue = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const reportRef = db.collection("safetyReports").doc();
    await reportRef.set({ reportId: reportRef.id, reporterUserId: userId, ownerUserId: userId, userId, childProfileId: optionalString(data.childProfileId, 160), subjectType: optionalString(data.subjectType, 80) || "mission", subjectId: optionalString(data.subjectId, 180), severity: optionalString(data.severity, 40) || "review", status: "submitted", message: optionalString(data.message, 1000), ...serverTimestamps() });
    return { accepted: true, reportId: reportRef.id, status: "submitted" };
  });
}

module.exports = { registerBeta1Missions };
