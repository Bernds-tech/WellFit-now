const weeklyMissionCatalog = require("../config/beta1-weekly-missions.json");
const {
  requireAuth,
  optionalString,
} = require("./beta1Runtime");
const {
  dateKeyInVienna,
  documentDateKey,
  calculateLevelFromXp,
} = require("./beta1DailyMissionProgress");

const MAX_HISTORY_DOCS = 500;
const WEEKLY_MISSION_IDS = new Set(weeklyMissionCatalog.missions.map((mission) => mission.missionId));

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

function registerBeta1WeeklyMissionProgress(exportsTarget, { db, onCall, HttpsError }) {
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
  weeklyMissionCompletionIdempotencyKey,
  addUtcDays,
};
