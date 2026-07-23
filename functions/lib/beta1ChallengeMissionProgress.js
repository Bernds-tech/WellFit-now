const challengeCatalog = require("../config/beta1-challenge-missions.json");
const {
  requireAuth,
  requiredString,
  optionalString,
  serverTimestamps,
  updatedTimestamp,
  clientContext,
  writeAudit,
} = require("./beta1Runtime");
const { applyXpDelta } = require("./beta1XpLedger");
const { calculateLevelFromXp } = require("./beta1DailyMissionProgress");

const MAX_HISTORY_DOCS = 500;
const CHALLENGE_MISSION_IDS = new Set(challengeCatalog.missions.map((mission) => mission.missionId));
const CHALLENGE_EVIDENCE_TYPE = "challenge-user-confirmation";
const CHALLENGE_COMPLETION_POLICY = "once-per-mission-per-user";

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function isChallengeMissionId(value) {
  const missionId = optionalString(value, 160);
  return Boolean(missionId && CHALLENGE_MISSION_IDS.has(missionId));
}

function challengeMissionAttemptId(ownerUserId, missionId) {
  return ["challenge", safeDocIdPart(ownerUserId), safeDocIdPart(missionId)].join("__");
}

function challengeMissionEvidenceId(attemptId, revision) {
  return ["challenge_evidence", safeDocIdPart(attemptId), String(revision)].join("__");
}

function challengeMissionCompletionIdempotencyKey(ownerUserId, missionId) {
  return ["challenge_mission_completion", safeDocIdPart(ownerUserId), safeDocIdPart(missionId)].join("__");
}

function documentTime(data, preferredFields = ["createdAt", "startedAt", "updatedAt"]) {
  for (const field of preferredFields) {
    const value = data[field];
    if (!value) continue;
    if (typeof value.toDate === "function") return value.toDate().getTime();
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(date.getTime())) return date.getTime();
  }
  return 0;
}

function buildLatestEvidenceByAttempt(evidenceDocs) {
  const evidenceByAttempt = new Map();
  for (const doc of evidenceDocs) {
    const evidence = doc.data() || {};
    const attemptId = optionalString(evidence.attemptId, 220);
    if (!attemptId) continue;
    const existing = evidenceByAttempt.get(attemptId);
    const currentTime = documentTime(evidence, ["createdAt", "reviewedAt", "updatedAt"]);
    const existingTime = existing
      ? documentTime(existing.data, ["createdAt", "reviewedAt", "updatedAt"])
      : -1;
    if (!existing || currentTime >= existingTime) {
      evidenceByAttempt.set(attemptId, { id: doc.id, data: evidence });
    }
  }
  return evidenceByAttempt;
}

function buildCompletedChallenges(completionDocs) {
  const completedMissionIds = new Set();
  const completedAttemptIds = new Set();
  for (const doc of completionDocs) {
    const completion = doc.data() || {};
    const missionId = optionalString(completion.missionId, 160);
    if (completion.status !== "completed" || !missionId || !CHALLENGE_MISSION_IDS.has(missionId)) continue;
    completedMissionIds.add(missionId);
    const attemptId = optionalString(completion.attemptId, 220);
    if (attemptId) completedAttemptIds.add(attemptId);
  }
  return { completedMissionIds, completedAttemptIds };
}

function buildActiveAttempts({ attempts, evidenceByAttempt, completedAttemptIds, completedMissionIds }) {
  const byMission = new Map();
  const sortedAttempts = [...attempts].sort((left, right) => {
    const leftTime = documentTime(left.data() || {});
    const rightTime = documentTime(right.data() || {});
    return rightTime - leftTime;
  });

  for (const attemptDoc of sortedAttempts) {
    const attempt = attemptDoc.data() || {};
    const missionId = optionalString(attempt.missionId, 160);
    if (!missionId || !CHALLENGE_MISSION_IDS.has(missionId) || byMission.has(missionId)) continue;
    if (completedMissionIds.has(missionId)) continue;
    if (completedAttemptIds.has(attemptDoc.id) || attempt.status === "completed") continue;
    const evidence = evidenceByAttempt.get(attemptDoc.id) || null;
    byMission.set(missionId, {
      missionId,
      attemptId: attemptDoc.id,
      attemptStatus: optionalString(attempt.status, 80) || "started",
      evidenceId: evidence ? evidence.id : null,
      reviewStatus: evidence ? optionalString(evidence.data.reviewStatus, 80) || "pending-server-review" : null,
      serverValidationStatus: evidence ? optionalString(evidence.data.serverValidationStatus, 120) || "evidence-received" : null,
      canRequestCompletion: Boolean(
        evidence
        && evidence.data.reviewStatus === "approved"
        && evidence.data.serverValidationStatus === "evidence-approved"
      ),
    });
  }
  return [...byMission.values()].slice(0, challengeCatalog.missions.length);
}

async function readChallengeMission(db, missionId, HttpsError) {
  if (!isChallengeMissionId(missionId)) {
    throw new HttpsError("invalid-argument", "Unbekannte Beta-1 Challenge.");
  }
  const missionSnapshot = await db.collection("missions").doc(missionId).get();
  const mission = missionSnapshot.exists ? missionSnapshot.data() || {} : {};
  if (
    !missionSnapshot.exists
    || mission.status !== "published"
    || mission.catalogId !== challengeCatalog.catalogId
    || mission.completionPolicy !== CHALLENGE_COMPLETION_POLICY
    || !mission.evidencePolicy
    || !Array.isArray(mission.evidencePolicy.allowedEvidenceTypes)
    || !mission.evidencePolicy.allowedEvidenceTypes.includes(CHALLENGE_EVIDENCE_TYPE)
  ) {
    throw new HttpsError("failed-precondition", "Challenge ist serverseitig nicht sicher veroeffentlicht.");
  }
  return { snapshot: missionSnapshot, data: mission };
}

function registerBeta1ChallengeMissionProgress(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.submitChallengeForReview = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError, 160);
    const mission = await readChallengeMission(db, missionId, HttpsError);
    if (mission.data.childAllowed === true || optionalString(data.childProfileId, 160)) {
      throw new HttpsError("failed-precondition", "Child Profiles sind fuer den ersten Challenge-Katalog deaktiviert.");
    }

    const attemptId = challengeMissionAttemptId(userId, missionId);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const [attemptSnapshot, completionSnapshot] = await Promise.all([attemptRef.get(), completionRef.get()]);
    if (completionSnapshot.exists && (completionSnapshot.data() || {}).status === "completed") {
      throw new HttpsError("failed-precondition", "Diese Challenge wurde bereits abgeschlossen.");
    }

    const attempt = attemptSnapshot.exists ? attemptSnapshot.data() || {} : {};
    if (attemptSnapshot.exists && (
      attempt.ownerUserId !== userId
      || attempt.missionId !== missionId
      || attempt.completionPolicy !== CHALLENGE_COMPLETION_POLICY
    )) {
      throw new HttpsError("failed-precondition", "Deterministischer Challenge-Attempt ist inkonsistent.");
    }
    if (attempt.status === "completed") {
      throw new HttpsError("failed-precondition", "Diese Challenge wurde bereits abgeschlossen.");
    }

    let evidenceRevision = Math.max(1, Math.floor(Number(attempt.latestEvidenceRevision || 1)));
    let evidenceRef = db.collection("missionEvidence").doc(challengeMissionEvidenceId(attemptId, evidenceRevision));
    let evidenceSnapshot = await evidenceRef.get();
    let existingEvidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};

    if (
      evidenceSnapshot.exists
      && (existingEvidence.reviewStatus === "pending-server-review" || existingEvidence.reviewStatus === "approved")
    ) {
      return {
        accepted: true,
        attemptId,
        evidenceId: evidenceRef.id,
        attemptStatus: optionalString(attempt.status, 80) || "evidence-submitted",
        reviewStatus: existingEvidence.reviewStatus,
        missionCompletionAuthorized: false,
        xpAuthorized: false,
        idempotent: true,
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
      };
    }

    if (evidenceSnapshot.exists) {
      evidenceRevision += 1;
      evidenceRef = db.collection("missionEvidence").doc(challengeMissionEvidenceId(attemptId, evidenceRevision));
      evidenceSnapshot = await evidenceRef.get();
      existingEvidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};
      if (evidenceSnapshot.exists && existingEvidence.reviewStatus === "pending-server-review") {
        return {
          accepted: true,
          attemptId,
          evidenceId: evidenceRef.id,
          attemptStatus: "evidence-submitted",
          reviewStatus: "pending-server-review",
          missionCompletionAuthorized: false,
          xpAuthorized: false,
          idempotent: true,
          noMonetaryValue: true,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }
    }

    const batch = db.batch();
    batch.set(attemptRef, {
      attemptId,
      missionId,
      ownerUserId: userId,
      userId,
      childProfileId: null,
      status: "evidence-submitted",
      catalogId: challengeCatalog.catalogId,
      catalogVersion: challengeCatalog.version,
      completionPolicy: CHALLENGE_COMPLETION_POLICY,
      latestEvidenceId: evidenceRef.id,
      latestEvidenceRevision: evidenceRevision,
      latestEvidenceReviewStatus: "pending-server-review",
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      ...clientContext(data),
      ...(attemptSnapshot.exists ? updatedTimestamp() : serverTimestamps()),
    }, { merge: true });
    batch.set(evidenceRef, {
      evidenceId: evidenceRef.id,
      attemptId,
      missionId,
      ownerUserId: userId,
      userId,
      childProfileId: null,
      evidenceType: CHALLENGE_EVIDENCE_TYPE,
      evidenceRevision,
      storageRef: null,
      metadata: {
        source: "challenge-missions",
        requiresHumanReview: true,
        grantsClientReward: false,
        rawMediaStored: false,
        rawMediaUploaded: false,
      },
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
    await batch.commit();

    return {
      accepted: true,
      attemptId,
      evidenceId: evidenceRef.id,
      attemptStatus: "evidence-submitted",
      reviewStatus: "pending-server-review",
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      idempotent: false,
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
    };
  });

  exportsTarget.completeChallengeAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const attemptId = requiredString((request.data || {}).attemptId, "attemptId", HttpsError, 220);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const [attemptSnapshot, existingCompletion] = await Promise.all([attemptRef.get(), completionRef.get()]);
    if (!attemptSnapshot.exists || (attemptSnapshot.data() || {}).ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Challenge-Attempt gehoert nicht diesem Nutzer.");
    }
    const attempt = attemptSnapshot.data() || {};
    if (!isChallengeMissionId(attempt.missionId) || attempt.completionPolicy !== CHALLENGE_COMPLETION_POLICY) {
      throw new HttpsError("invalid-argument", "Attempt ist keine kanonische Challenge.");
    }
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
        cashoutAllowed: false,
        noMonetaryValue: true,
        idempotent: true,
      };
    }

    const latestEvidenceId = requiredString(attempt.latestEvidenceId, "latestEvidenceId", HttpsError, 220);
    const evidenceSnapshot = await db.collection("missionEvidence").doc(latestEvidenceId).get();
    const evidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};
    if (
      !evidenceSnapshot.exists
      || evidence.ownerUserId !== userId
      || evidence.attemptId !== attemptId
      || evidence.missionId !== attempt.missionId
      || evidence.evidenceType !== CHALLENGE_EVIDENCE_TYPE
      || evidence.reviewStatus !== "approved"
      || evidence.serverValidationStatus !== "evidence-approved"
    ) {
      throw new HttpsError("failed-precondition", "Serverseitig freigegebene Challenge-Evidence ist erforderlich.");
    }

    const mission = await readChallengeMission(db, attempt.missionId, HttpsError);
    const rewardXp = Math.min(Math.max(1, Math.floor(Number(mission.data.rewardXp || 1))), 150);
    const idempotencyKey = challengeMissionCompletionIdempotencyKey(userId, attempt.missionId);
    const ledger = await applyXpDelta(db, {
      ownerUserId: userId,
      childProfileId: null,
      delta: rewardXp,
      reason: "mission-completion",
      sourceType: "challengeMissionCompletion",
      sourceId: completionRef.id,
      actorUserId: "server",
      idempotencyKey,
      metadata: {
        evidenceId: evidenceSnapshot.id,
        attemptId,
        missionId: attempt.missionId,
        catalogId: challengeCatalog.catalogId,
      },
    });
    if (ledger.idempotent && ledger.sourceId !== completionRef.id) {
      throw new HttpsError("failed-precondition", "Diese Challenge wurde bereits belohnt.");
    }

    await completionRef.set({
      completionId: completionRef.id,
      attemptId,
      missionId: attempt.missionId,
      ownerUserId: userId,
      userId,
      childProfileId: null,
      evidenceId: evidenceSnapshot.id,
      evidenceReviewStatus: "approved",
      status: "completed",
      serverValidationStatus: "completion-authorized",
      rewardXp,
      xpLedgerEventId: ledger.ledgerEventId,
      catalogId: challengeCatalog.catalogId,
      catalogVersion: challengeCatalog.version,
      completionPolicy: CHALLENGE_COMPLETION_POLICY,
      completedAt: new Date().toISOString(),
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      ...serverTimestamps(),
    });
    await attemptRef.set({
      status: "completed",
      completionId: completionRef.id,
      approvedEvidenceId: evidenceSnapshot.id,
      ...updatedTimestamp(),
    }, { merge: true });
    await writeAudit(db, {
      actorUserId: "server",
      actionType: "challenge-mission-completed",
      targetType: "missionCompletion",
      targetId: completionRef.id,
      ownerUserId: userId,
      metadata: {
        rewardXp,
        ledgerEventId: ledger.ledgerEventId,
        evidenceId: evidenceSnapshot.id,
        catalogId: challengeCatalog.catalogId,
      },
    });

    return {
      accepted: true,
      completionId: completionRef.id,
      xpLedgerEventId: ledger.ledgerEventId,
      rewardXp,
      evidenceId: evidenceSnapshot.id,
      xpAuthorized: true,
      missionCompletionAuthorized: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      noMonetaryValue: true,
      idempotent: ledger.idempotent,
    };
  });

  exportsTarget.getChallengeProgress = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const [attemptsSnapshot, evidenceSnapshot, completionsSnapshot, walletSnapshot] = await Promise.all([
      db.collection("missionAttempts").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionEvidence").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionCompletions").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("xpWallets").doc(userId).get(),
    ]);

    const evidenceByAttempt = buildLatestEvidenceByAttempt(evidenceSnapshot.docs);
    const completed = buildCompletedChallenges(completionsSnapshot.docs);
    const activeAttempts = buildActiveAttempts({
      attempts: attemptsSnapshot.docs,
      evidenceByAttempt,
      completedAttemptIds: completed.completedAttemptIds,
      completedMissionIds: completed.completedMissionIds,
    });
    const startedMissionIds = [...new Set([
      ...attemptsSnapshot.docs
        .map((doc) => optionalString((doc.data() || {}).missionId, 160))
        .filter((missionId) => missionId && CHALLENGE_MISSION_IDS.has(missionId)),
      ...activeAttempts.map((attempt) => attempt.missionId),
      ...completed.completedMissionIds,
    ])];
    const completedMissionIds = [...completed.completedMissionIds];
    const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
    const xp = Math.max(0, Math.floor(Number(wallet.lifetimeEarned || 0)));
    const level = calculateLevelFromXp(xp);

    return {
      accepted: true,
      catalogId: challengeCatalog.catalogId,
      catalogVersion: challengeCatalog.version,
      completionPolicy: challengeCatalog.completionPolicy,
      startedMissionIds,
      completedMissionIds,
      activeAttempts,
      walletBalance: Math.max(0, Math.floor(Number(wallet.balance || 0))),
      xp,
      ...level,
      walletAvailable: walletSnapshot.exists,
      progressAuthority: "server-read",
      rewardAuthority: false,
      missionCompletionAuthority: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      noMonetaryValue: true,
    };
  });
}

module.exports = {
  registerBeta1ChallengeMissionProgress,
  isChallengeMissionId,
  challengeMissionAttemptId,
  challengeMissionEvidenceId,
  challengeMissionCompletionIdempotencyKey,
};
