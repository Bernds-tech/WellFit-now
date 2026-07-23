const weeklyMissionCatalog = require("../config/beta1-weekly-missions.json");
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
const {
  dateKeyInVienna,
  documentDateKey,
  calculateLevelFromXp,
} = require("./beta1DailyMissionProgress");

const MAX_HISTORY_DOCS = 500;
const WEEKLY_MISSION_IDS = new Set(weeklyMissionCatalog.missions.map((mission) => mission.missionId));
const WEEKLY_EVIDENCE_TYPE = "weekly-user-confirmation";
const WEEKLY_COMPLETION_POLICY = "once-per-mission-per-vienna-week";

function dateKeyToUtcDate(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

function utcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(dateKey, delta) {
  const date = dateKeyToUtcDate(dateKey);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + delta);
  return utcDateKey(date);
}

function weekRangeFromDateKey(dateKey) {
  const date = dateKeyToUtcDate(dateKey);
  if (!date) return null;
  const isoDayIndex = (date.getUTCDay() + 6) % 7;
  const start = new Date(date);
  start.setUTCDate(start.getUTCDate() - isoDayIndex);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  const thursday = new Date(start);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const weekYear = thursday.getUTCFullYear();
  const januaryFourth = new Date(Date.UTC(weekYear, 0, 4, 12, 0, 0));
  const januaryFourthDayIndex = (januaryFourth.getUTCDay() + 6) % 7;
  const firstWeekMonday = new Date(januaryFourth);
  firstWeekMonday.setUTCDate(firstWeekMonday.getUTCDate() - januaryFourthDayIndex);
  const weekNumber = 1 + Math.round((start.getTime() - firstWeekMonday.getTime()) / (7 * 86400000));

  return {
    weekKey: `${weekYear}-W${String(weekNumber).padStart(2, "0")}`,
    weekStartDateKey: utcDateKey(start),
    weekEndDateKey: utcDateKey(end),
  };
}

function weekKeyInVienna(value = new Date()) {
  const dateKey = dateKeyInVienna(value);
  const range = dateKey ? weekRangeFromDateKey(dateKey) : null;
  return range ? range.weekKey : null;
}

function weekRangeInVienna(value = new Date()) {
  const dateKey = dateKeyInVienna(value);
  return dateKey ? weekRangeFromDateKey(dateKey) : null;
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

function documentWeekKey(data, preferredFields) {
  const explicitWeekKey = optionalString(data.weekKey, 20);
  if (explicitWeekKey) return explicitWeekKey;
  const dateKey = optionalString(data.dateKey, 20)
    || documentDateKey(data, preferredFields);
  const range = dateKey ? weekRangeFromDateKey(dateKey) : null;
  return range ? range.weekKey : null;
}

function isWeeklyMissionId(value) {
  const missionId = optionalString(value, 160);
  return Boolean(missionId && WEEKLY_MISSION_IDS.has(missionId));
}

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function weeklyMissionAttemptId(ownerUserId, missionId, weekKey) {
  return ["weekly", safeDocIdPart(ownerUserId), safeDocIdPart(weekKey), safeDocIdPart(missionId)].join("__");
}

function weeklyMissionEvidenceId(attemptId, revision) {
  return ["weekly_evidence", safeDocIdPart(attemptId), String(revision)].join("__");
}

function weeklyMissionCompletionIdempotencyKey(ownerUserId, missionId, weekKey) {
  return ["weekly_mission_completion", safeDocIdPart(ownerUserId), safeDocIdPart(weekKey), safeDocIdPart(missionId)].join("__");
}

function buildLatestEvidenceByAttempt(evidenceDocs) {
  const evidenceByAttempt = new Map();
  for (const doc of evidenceDocs) {
    const evidence = doc.data() || {};
    const attemptId = optionalString(evidence.attemptId, 180);
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

function buildCurrentWeekCompletions(completionDocs, currentWeekKey) {
  const completedMissionIds = new Set();
  const completedAttemptIds = new Set();
  for (const doc of completionDocs) {
    const completion = doc.data() || {};
    const missionId = optionalString(completion.missionId, 160);
    if (
      completion.status !== "completed"
      || !missionId
      || !WEEKLY_MISSION_IDS.has(missionId)
      || documentWeekKey(completion, ["completedAt", "updatedAt", "createdAt"]) !== currentWeekKey
    ) {
      continue;
    }
    completedMissionIds.add(missionId);
    const attemptId = optionalString(completion.attemptId, 180);
    if (attemptId) completedAttemptIds.add(attemptId);
  }
  return { completedMissionIds, completedAttemptIds };
}

function buildActiveAttempts({ attempts, evidenceByAttempt, completedAttemptIds, completedMissionIds, currentWeekKey }) {
  const byMission = new Map();
  const sortedAttempts = [...attempts].sort((left, right) => {
    const leftTime = documentTime(left.data() || {});
    const rightTime = documentTime(right.data() || {});
    return rightTime - leftTime;
  });

  for (const attemptDoc of sortedAttempts) {
    const attempt = attemptDoc.data() || {};
    const missionId = optionalString(attempt.missionId, 160);
    if (!missionId || !WEEKLY_MISSION_IDS.has(missionId) || byMission.has(missionId)) continue;
    if (documentWeekKey(attempt, ["startedAt", "createdAt", "updatedAt"]) !== currentWeekKey) continue;
    if (completedMissionIds.has(missionId)) continue;
    if (completedAttemptIds.has(attemptDoc.id) || attempt.status === "completed") continue;
    const evidence = evidenceByAttempt.get(attemptDoc.id) || null;
    byMission.set(missionId, {
      missionId,
      attemptId: attemptDoc.id,
      weekKey: currentWeekKey,
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
  return [...byMission.values()].slice(0, weeklyMissionCatalog.missions.length);
}

async function readWeeklyMission(db, missionId, HttpsError) {
  if (!isWeeklyMissionId(missionId)) {
    throw new HttpsError("invalid-argument", "Unbekannte Beta-1 Wochenmission.");
  }
  const missionSnapshot = await db.collection("missions").doc(missionId).get();
  const mission = missionSnapshot.exists ? missionSnapshot.data() || {} : {};
  if (
    !missionSnapshot.exists
    || mission.status !== "published"
    || mission.catalogId !== weeklyMissionCatalog.catalogId
    || mission.completionPolicy !== WEEKLY_COMPLETION_POLICY
    || !mission.evidencePolicy
    || !Array.isArray(mission.evidencePolicy.allowedEvidenceTypes)
    || !mission.evidencePolicy.allowedEvidenceTypes.includes(WEEKLY_EVIDENCE_TYPE)
  ) {
    throw new HttpsError("failed-precondition", "Wochenmission ist serverseitig nicht sicher veroeffentlicht.");
  }
  return { snapshot: missionSnapshot, data: mission };
}

function registerBeta1WeeklyMissionProgress(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.submitWeeklyMissionForReview = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError, 160);
    const mission = await readWeeklyMission(db, missionId, HttpsError);
    if (mission.data.childAllowed === true || optionalString(data.childProfileId, 160)) {
      throw new HttpsError("failed-precondition", "Child Profiles sind fuer den ersten Wochenmissionskatalog deaktiviert.");
    }

    const currentRange = weekRangeInVienna(new Date());
    if (!currentRange) throw new HttpsError("internal", "Aktuelle Wien-Woche konnte nicht bestimmt werden.");
    const attemptId = weeklyMissionAttemptId(userId, missionId, currentRange.weekKey);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const [attemptSnapshot, completionSnapshot] = await Promise.all([attemptRef.get(), completionRef.get()]);
    if (completionSnapshot.exists && (completionSnapshot.data() || {}).status === "completed") {
      throw new HttpsError("failed-precondition", "Diese Wochenmission wurde in der aktuellen Wien-Woche bereits abgeschlossen.");
    }

    const attempt = attemptSnapshot.exists ? attemptSnapshot.data() || {} : {};
    if (attemptSnapshot.exists && (
      attempt.ownerUserId !== userId
      || attempt.missionId !== missionId
      || documentWeekKey(attempt, ["startedAt", "createdAt", "updatedAt"]) !== currentRange.weekKey
    )) {
      throw new HttpsError("failed-precondition", "Deterministischer Wochenmissions-Attempt ist inkonsistent.");
    }
    if (attempt.status === "completed") {
      throw new HttpsError("failed-precondition", "Diese Wochenmission wurde bereits abgeschlossen.");
    }

    let evidenceRevision = Math.max(1, Math.floor(Number(attempt.latestEvidenceRevision || 1)));
    let evidenceRef = db.collection("missionEvidence").doc(weeklyMissionEvidenceId(attemptId, evidenceRevision));
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
        weekKey: currentRange.weekKey,
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
      evidenceRef = db.collection("missionEvidence").doc(weeklyMissionEvidenceId(attemptId, evidenceRevision));
      evidenceSnapshot = await evidenceRef.get();
      existingEvidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};
      if (evidenceSnapshot.exists && existingEvidence.reviewStatus === "pending-server-review") {
        return {
          accepted: true,
          attemptId,
          evidenceId: evidenceRef.id,
          weekKey: currentRange.weekKey,
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
      weekKey: currentRange.weekKey,
      weekStartDateKey: currentRange.weekStartDateKey,
      weekEndDateKey: currentRange.weekEndDateKey,
      catalogId: weeklyMissionCatalog.catalogId,
      catalogVersion: weeklyMissionCatalog.version,
      completionPolicy: WEEKLY_COMPLETION_POLICY,
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
      evidenceType: WEEKLY_EVIDENCE_TYPE,
      evidenceRevision,
      storageRef: null,
      metadata: {
        source: "weekly-missions",
        weekKey: currentRange.weekKey,
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
      weekKey: currentRange.weekKey,
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

  exportsTarget.completeWeeklyMissionAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const attemptId = requiredString((request.data || {}).attemptId, "attemptId", HttpsError, 220);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const [attemptSnapshot, existingCompletion] = await Promise.all([attemptRef.get(), completionRef.get()]);
    if (!attemptSnapshot.exists || (attemptSnapshot.data() || {}).ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Wochenmissions-Attempt gehoert nicht diesem Nutzer.");
    }
    const attempt = attemptSnapshot.data() || {};
    if (!isWeeklyMissionId(attempt.missionId)) {
      throw new HttpsError("invalid-argument", "Attempt ist keine kanonische Wochenmission.");
    }
    const currentRange = weekRangeInVienna(new Date());
    if (!currentRange || documentWeekKey(attempt, ["startedAt", "createdAt", "updatedAt"]) !== currentRange.weekKey) {
      throw new HttpsError("failed-precondition", "Wochenmissions-Attempt gehoert nicht zur aktuellen Wien-Woche.");
    }
    if (existingCompletion.exists && (existingCompletion.data() || {}).status === "completed") {
      const completion = existingCompletion.data() || {};
      return {
        accepted: true,
        completionId: completionRef.id,
        xpLedgerEventId: completion.xpLedgerEventId,
        rewardXp: completion.rewardXp,
        evidenceId: completion.evidenceId,
        weekKey: currentRange.weekKey,
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
      || evidence.evidenceType !== WEEKLY_EVIDENCE_TYPE
      || evidence.reviewStatus !== "approved"
      || evidence.serverValidationStatus !== "evidence-approved"
    ) {
      throw new HttpsError("failed-precondition", "Serverseitig freigegebene Wochenmissions-Evidence ist erforderlich.");
    }

    const mission = await readWeeklyMission(db, attempt.missionId, HttpsError);
    const rewardXp = Math.min(Math.max(1, Math.floor(Number(mission.data.rewardXp || 1))), 100);
    const idempotencyKey = weeklyMissionCompletionIdempotencyKey(userId, attempt.missionId, currentRange.weekKey);
    const ledger = await applyXpDelta(db, {
      ownerUserId: userId,
      childProfileId: null,
      delta: rewardXp,
      reason: "mission-completion",
      sourceType: "weeklyMissionCompletion",
      sourceId: completionRef.id,
      actorUserId: "server",
      idempotencyKey,
      metadata: {
        evidenceId: evidenceSnapshot.id,
        attemptId,
        missionId: attempt.missionId,
        weekKey: currentRange.weekKey,
      },
    });
    if (ledger.idempotent && ledger.sourceId !== completionRef.id) {
      throw new HttpsError("failed-precondition", "Diese Wochenmission wurde in der aktuellen Wien-Woche bereits belohnt.");
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
      dateKey: dateKeyInVienna(new Date()),
      weekKey: currentRange.weekKey,
      weekStartDateKey: currentRange.weekStartDateKey,
      weekEndDateKey: currentRange.weekEndDateKey,
      catalogId: weeklyMissionCatalog.catalogId,
      catalogVersion: weeklyMissionCatalog.version,
      completionPolicy: WEEKLY_COMPLETION_POLICY,
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
      actionType: "weekly-mission-completed",
      targetType: "missionCompletion",
      targetId: completionRef.id,
      ownerUserId: userId,
      metadata: {
        rewardXp,
        ledgerEventId: ledger.ledgerEventId,
        evidenceId: evidenceSnapshot.id,
        weekKey: currentRange.weekKey,
      },
    });

    return {
      accepted: true,
      completionId: completionRef.id,
      xpLedgerEventId: ledger.ledgerEventId,
      rewardXp,
      evidenceId: evidenceSnapshot.id,
      weekKey: currentRange.weekKey,
      xpAuthorized: true,
      missionCompletionAuthorized: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      noMonetaryValue: true,
      idempotent: ledger.idempotent,
    };
  });

  exportsTarget.getWeeklyMissionProgress = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const currentRange = weekRangeInVienna(new Date());
    if (!currentRange) throw new HttpsError("internal", "Aktuelle Wien-Woche konnte nicht bestimmt werden.");

    const [attemptsSnapshot, evidenceSnapshot, completionsSnapshot, walletSnapshot] = await Promise.all([
      db.collection("missionAttempts").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionEvidence").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionCompletions").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("xpWallets").doc(userId).get(),
    ]);

    const evidenceByAttempt = buildLatestEvidenceByAttempt(evidenceSnapshot.docs);
    const currentCompletions = buildCurrentWeekCompletions(completionsSnapshot.docs, currentRange.weekKey);
    const activeAttempts = buildActiveAttempts({
      attempts: attemptsSnapshot.docs,
      evidenceByAttempt,
      completedAttemptIds: currentCompletions.completedAttemptIds,
      completedMissionIds: currentCompletions.completedMissionIds,
      currentWeekKey: currentRange.weekKey,
    });
    const startedMissionIds = [...new Set([
      ...attemptsSnapshot.docs
        .filter((doc) => {
          const attempt = doc.data() || {};
          return isWeeklyMissionId(attempt.missionId)
            && documentWeekKey(attempt, ["startedAt", "createdAt", "updatedAt"]) === currentRange.weekKey;
        })
        .map((doc) => optionalString((doc.data() || {}).missionId, 160))
        .filter(Boolean),
      ...activeAttempts.map((attempt) => attempt.missionId),
      ...currentCompletions.completedMissionIds,
    ])];
    const completedMissionIds = [...currentCompletions.completedMissionIds];
    const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
    const xp = Math.max(0, Math.floor(Number(wallet.lifetimeEarned || 0)));
    const level = calculateLevelFromXp(xp);

    return {
      accepted: true,
      weekKey: currentRange.weekKey,
      weekStartDateKey: currentRange.weekStartDateKey,
      weekEndDateKey: currentRange.weekEndDateKey,
      catalogId: weeklyMissionCatalog.catalogId,
      catalogVersion: weeklyMissionCatalog.version,
      completionPolicy: weeklyMissionCatalog.completionPolicy,
      startedMissionIds,
      completedMissionIds,
      activeAttempts,
      weeklyGoal: weeklyMissionCatalog.weeklyGoal,
      goalCompleted: completedMissionIds.length >= Number(weeklyMissionCatalog.weeklyGoal || 3),
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
  registerBeta1WeeklyMissionProgress,
  weekKeyInVienna,
  weekRangeInVienna,
  weekRangeFromDateKey,
  documentWeekKey,
  isWeeklyMissionId,
  weeklyMissionAttemptId,
  weeklyMissionEvidenceId,
  weeklyMissionCompletionIdempotencyKey,
  addUtcDays,
};
