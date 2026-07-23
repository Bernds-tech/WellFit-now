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
  requireChildPermission,
  writeAudit,
} = require("./beta1Runtime");
const { applyXpDelta } = require("./beta1XpLedger");

const MISSION_EVIDENCE_REVIEW_DECISIONS = new Set(["approved", "rejected", "needs-more-evidence"]);

function publicMission(doc) {
  const data = doc.data() || {};
  return {
    missionId: doc.id,
    title: data.title,
    type: data.type,
    status: data.status,
    rewardXp: data.rewardXp || 0,
    childAllowed: data.childAllowed === true,
  };
}

function evidenceReviewServerStatus(decision) {
  if (decision === "approved") return "evidence-approved";
  if (decision === "rejected") return "evidence-rejected";
  return "evidence-more-required";
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
    if (!doc.exists || (doc.data() || {}).status !== "published") {
      throw new HttpsError("not-found", "Mission nicht verfuegbar.");
    }
    return { accepted: true, mission: publicMission(doc) };
  });

  exportsTarget.adminCreateMission = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const requestedMissionId = optionalString(data.missionId, 160);
    const missionRef = requestedMissionId
      ? db.collection("missions").doc(requestedMissionId)
      : db.collection("missions").doc();
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
    await writeAudit(db, {
      actorUserId,
      actionType: "mission-created",
      targetType: "mission",
      targetId: missionRef.id,
      reason: data.reason,
    });
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
    await writeAudit(db, {
      actorUserId,
      actionType: "mission-updated",
      targetType: "mission",
      targetId: missionId,
      reason: data.reason,
    });
    return { accepted: true, missionId };
  });

  exportsTarget.adminPublishMission = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const missionId = requiredString((request.data || {}).missionId, "missionId", HttpsError);
    await db.collection("missions").doc(missionId).set(
      {
        status: "published",
        publishedAt: new Date().toISOString(),
        ...updatedTimestamp(),
      },
      { merge: true },
    );
    await writeAudit(db, {
      actorUserId,
      actionType: "mission-published",
      targetType: "mission",
      targetId: missionId,
    });
    return { accepted: true, missionId, status: "published" };
  });

  exportsTarget.startMissionAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "missions", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "missions", HttpsError);
    }
    const mission = await db.collection("missions").doc(missionId).get();
    if (!mission.exists || (mission.data() || {}).status !== "published") {
      throw new HttpsError("failed-precondition", "Mission ist nicht publiziert.");
    }
    if (childProfileId && (mission.data() || {}).childAllowed !== true) {
      throw new HttpsError("failed-precondition", "Mission ist nicht fuer Child Profiles freigegeben.");
    }
    const attemptRef = db.collection("missionAttempts").doc();
    await attemptRef.set({
      attemptId: attemptRef.id,
      missionId,
      ownerUserId: userId,
      userId,
      childProfileId: childProfileId || null,
      status: "started",
      ...clientContext(data),
      ...serverTimestamps(),
    });
    return { accepted: true, attemptId: attemptRef.id, status: "started", missionCompletionAuthorized: false };
  });

  exportsTarget.submitMissionEvidence = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const attemptId = requiredString(data.attemptId, "attemptId", HttpsError);
    const attempt = await db.collection("missionAttempts").doc(attemptId).get();
    if (!attempt.exists || (attempt.data() || {}).ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Attempt gehoert nicht diesem Nutzer.");
    }
    if ((attempt.data() || {}).status === "completed") {
      throw new HttpsError("failed-precondition", "Abgeschlossene Missionen akzeptieren keine neue Evidence.");
    }
    const childProfileId = (attempt.data() || {}).childProfileId || null;
    const evidenceType = optionalString(data.evidenceType, 80) || "client-request";
    if (childProfileId && ["camera", "camera-evidence", "photo", "video"].includes(evidenceType)) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "cameraEvidence", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "cameraEvidence", HttpsError);
    }
    const evidenceRef = db.collection("missionEvidence").doc();
    await evidenceRef.set({
      evidenceId: evidenceRef.id,
      attemptId,
      missionId: (attempt.data() || {}).missionId,
      ownerUserId: userId,
      userId,
      childProfileId,
      evidenceType,
      storageRef: optionalString(data.storageRef, 500),
      metadata: data.metadata && typeof data.metadata === "object" ? data.metadata : {},
      status: "submitted",
      reviewStatus: "pending-server-review",
      serverValidationStatus: "evidence-received",
      reviewedByAdminId: null,
      reviewedAt: null,
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      ...clientContext(data),
      ...serverTimestamps(),
    });
    await db.collection("missionAttempts").doc(attemptId).set(
      { status: "evidence-submitted", ...updatedTimestamp() },
      { merge: true },
    );
    return {
      accepted: true,
      evidenceId: evidenceRef.id,
      reviewStatus: "pending-server-review",
      missionCompletionAuthorized: false,
      xpAuthorized: false,
    };
  });

  exportsTarget.adminReviewMissionEvidence = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const evidenceId = requiredString(data.evidenceId, "evidenceId", HttpsError);
    const decision = requiredString(data.decision, "decision", HttpsError, 80);
    const reviewNote = requiredString(data.reviewNote, "reviewNote", HttpsError, 500);
    if (!MISSION_EVIDENCE_REVIEW_DECISIONS.has(decision)) {
      throw new HttpsError("invalid-argument", "decision muss approved, rejected oder needs-more-evidence sein.");
    }

    const evidenceRef = db.collection("missionEvidence").doc(evidenceId);
    const evidenceSnapshot = await evidenceRef.get();
    if (!evidenceSnapshot.exists) throw new HttpsError("not-found", "Mission Evidence wurde nicht gefunden.");
    const evidence = evidenceSnapshot.data() || {};
    const attemptRef = db.collection("missionAttempts").doc(evidence.attemptId);
    const attemptSnapshot = await attemptRef.get();
    if (!attemptSnapshot.exists) throw new HttpsError("failed-precondition", "Zugehoeriger Mission Attempt fehlt.");
    const attempt = attemptSnapshot.data() || {};
    if (attempt.missionId !== evidence.missionId || attempt.ownerUserId !== evidence.ownerUserId) {
      throw new HttpsError("failed-precondition", "Evidence passt nicht zum Mission Attempt.");
    }
    if (attempt.status === "completed") {
      if (evidence.reviewStatus === decision && evidence.reviewedByAdminId === actorUserId) {
        return { accepted: true, evidenceId, decision, idempotent: true, missionCompletionAuthorized: decision === "approved" };
      }
      throw new HttpsError("failed-precondition", "Evidence einer abgeschlossenen Mission kann nicht nachtraeglich geaendert werden.");
    }

    const serverValidationStatus = evidenceReviewServerStatus(decision);
    await evidenceRef.set(
      {
        reviewStatus: decision,
        serverValidationStatus,
        reviewedByAdminId: actorUserId,
        reviewedAt: new Date().toISOString(),
        reviewNote,
        missionCompletionAuthorized: false,
        xpAuthorized: false,
        ...updatedTimestamp(),
      },
      { merge: true },
    );
    await attemptRef.set(
      {
        status: decision === "approved" ? "evidence-approved" : decision === "rejected" ? "evidence-rejected" : "more-evidence-required",
        latestEvidenceId: evidenceId,
        latestEvidenceReviewStatus: decision,
        ...updatedTimestamp(),
      },
      { merge: true },
    );
    await writeAudit(db, {
      actorUserId,
      actionType: "mission-evidence-reviewed",
      targetType: "missionEvidence",
      targetId: evidenceId,
      ownerUserId: evidence.ownerUserId,
      childProfileId: evidence.childProfileId || null,
      reason: reviewNote,
      metadata: { decision, attemptId: evidence.attemptId, missionId: evidence.missionId },
    });
    return {
      accepted: true,
      evidenceId,
      decision,
      serverValidationStatus,
      idempotent: false,
      missionCompletionAuthorized: false,
      xpAuthorized: false,
    };
  });

  exportsTarget.completeMissionAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const attemptId = requiredString(data.attemptId, "attemptId", HttpsError);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const attemptSnapshot = await attemptRef.get();
    if (!attemptSnapshot.exists || (attemptSnapshot.data() || {}).ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Attempt gehoert nicht diesem Nutzer.");
    }
    const attempt = attemptSnapshot.data() || {};
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const existingCompletion = await completionRef.get();
    if (existingCompletion.exists && (existingCompletion.data() || {}).status === "completed") {
      const completion = existingCompletion.data() || {};
      return {
        accepted: true,
        completionId: completionRef.id,
        xpLedgerEventId: completion.xpLedgerEventId,
        rewardXp: completion.rewardXp,
        evidenceId: completion.evidenceId,
        xpAuthorized: true,
        missionCompletionAuthorized: true,
        tokenAuthorized: false,
        idempotent: true,
      };
    }

    const evidenceSnapshot = await db.collection("missionEvidence").where("attemptId", "==", attemptId).limit(20).get();
    const approvedEvidenceDoc = evidenceSnapshot.docs.find((doc) => {
      const evidence = doc.data() || {};
      return evidence.ownerUserId === userId
        && evidence.missionId === attempt.missionId
        && evidence.reviewStatus === "approved"
        && evidence.serverValidationStatus === "evidence-approved";
    });
    if (!approvedEvidenceDoc) {
      throw new HttpsError("failed-precondition", "Serverseitig freigegebene Mission Evidence ist erforderlich.");
    }

    const mission = await db.collection("missions").doc(attempt.missionId).get();
    if (!mission.exists || (mission.data() || {}).status !== "published") {
      throw new HttpsError("failed-precondition", "Mission ist nicht mehr publiziert.");
    }
    const rewardXp = Math.min(Number((mission.data() || {}).rewardXp || 25), 100);
    const ledger = await applyXpDelta(db, {
      ownerUserId: userId,
      childProfileId: attempt.childProfileId || null,
      delta: rewardXp,
      reason: "mission-completion",
      sourceType: "missionCompletion",
      sourceId: completionRef.id,
      actorUserId: "server",
      idempotencyKey: `mission_completion_${attemptId}`,
      metadata: { evidenceId: approvedEvidenceDoc.id, attemptId, missionId: attempt.missionId },
    });

    await completionRef.set({
      completionId: completionRef.id,
      attemptId,
      missionId: attempt.missionId,
      ownerUserId: userId,
      userId,
      childProfileId: attempt.childProfileId || null,
      evidenceId: approvedEvidenceDoc.id,
      evidenceReviewStatus: "approved",
      status: "completed",
      serverValidationStatus: "completion-authorized",
      rewardXp,
      xpLedgerEventId: ledger.ledgerEventId,
      completedAt: new Date().toISOString(),
      ...serverTimestamps(),
    });
    await attemptRef.set(
      {
        status: "completed",
        completionId: completionRef.id,
        approvedEvidenceId: approvedEvidenceDoc.id,
        ...updatedTimestamp(),
      },
      { merge: true },
    );
    await writeAudit(db, {
      actorUserId: "server",
      actionType: "mission-completed",
      targetType: "missionCompletion",
      targetId: completionRef.id,
      ownerUserId: userId,
      childProfileId: attempt.childProfileId || null,
      metadata: { rewardXp, ledgerEventId: ledger.ledgerEventId, evidenceId: approvedEvidenceDoc.id },
    });
    return {
      accepted: true,
      completionId: completionRef.id,
      xpLedgerEventId: ledger.ledgerEventId,
      rewardXp,
      evidenceId: approvedEvidenceDoc.id,
      xpAuthorized: true,
      missionCompletionAuthorized: true,
      tokenAuthorized: false,
      idempotent: false,
    };
  });

  exportsTarget.reportMissionSafetyIssue = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const reportRef = db.collection("safetyReports").doc();
    await reportRef.set({
      reportId: reportRef.id,
      reporterUserId: userId,
      ownerUserId: userId,
      userId,
      childProfileId: optionalString(data.childProfileId, 160),
      subjectType: optionalString(data.subjectType, 80) || "mission",
      subjectId: optionalString(data.subjectId, 180),
      severity: optionalString(data.severity, 40) || "review",
      status: "submitted",
      message: optionalString(data.message, 1000),
      ...serverTimestamps(),
    });
    return { accepted: true, reportId: reportRef.id, status: "submitted" };
  });
}

module.exports = { registerBeta1Missions };
