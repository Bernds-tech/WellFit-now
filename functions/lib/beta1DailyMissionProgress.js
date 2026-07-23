const dailyMissionCatalog = require("../config/beta1-daily-missions.json");
const {
  requireAuth,
  optionalString,
  updatedTimestamp,
} = require("./beta1Runtime");

const DAILY_GOAL = 3;
const MAX_DAILY_MISSIONS = 10;
const MAX_HISTORY_DOCS = 500;
const DAILY_MISSION_IDS = new Set(dailyMissionCatalog.missions.map((mission) => mission.missionId));

function dateKeyInVienna(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function addUtcDays(dateKey, delta) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta, 12, 0, 0));
  return date.toISOString().slice(0, 10);
}

function timestampToDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function documentDateKey(data, preferredFields) {
  for (const field of preferredFields) {
    const date = timestampToDate(data[field]);
    const key = date ? dateKeyInVienna(date) : null;
    if (key) return key;
  }
  return null;
}

function documentTime(data, preferredFields = ["createdAt", "startedAt", "updatedAt"]) {
  for (const field of preferredFields) {
    const date = timestampToDate(data[field]);
    if (date) return date.getTime();
  }
  return 0;
}

function calculateStreakBonus(streak) {
  return Math.min(25, 5 + Math.floor(Math.max(1, streak) / 3) * 2);
}

function levelBaseXp(level) {
  return 100 + (Math.max(1, level) - 1) * 50;
}

function calculateLevelFromXp(totalXp) {
  let remaining = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;
  while (remaining >= levelBaseXp(level) && level < 1000) {
    remaining -= levelBaseXp(level);
    level += 1;
  }
  return {
    level,
    xpForCurrentLevel: remaining,
    xpForNextLevel: levelBaseXp(level),
  };
}

function isDailyMissionId(value) {
  const missionId = optionalString(value, 160);
  return Boolean(missionId && DAILY_MISSION_IDS.has(missionId));
}

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function dailyMissionAttemptId(ownerUserId, missionId, dateKey) {
  return ["daily", safeDocIdPart(ownerUserId), safeDocIdPart(dateKey), safeDocIdPart(missionId)].join("__");
}

function dailyMissionCompletionIdempotencyKey(ownerUserId, missionId, dateKey) {
  return ["daily_mission_completion", safeDocIdPart(ownerUserId), safeDocIdPart(dateKey), safeDocIdPart(missionId)].join("__");
}

function uniqueKnownMissionIds(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values
    .map((value) => optionalString(value, 160))
    .filter((value) => value && DAILY_MISSION_IDS.has(value)))]
    .slice(0, MAX_DAILY_MISSIONS);
}

function validatePreferences(data, HttpsError) {
  const favoriteIds = uniqueKnownMissionIds(data.favoriteIds);
  if (Array.isArray(data.favoriteIds) && favoriteIds.length !== new Set(data.favoriteIds.map(String)).size) {
    throw new HttpsError("invalid-argument", "favoriteIds enthaelt unbekannte oder ungueltige Tagesmissionen.");
  }

  if (!Array.isArray(data.dailySlotIds) || data.dailySlotIds.length !== 3) {
    throw new HttpsError("invalid-argument", "dailySlotIds muss genau drei Slots enthalten.");
  }
  const dailySlotIds = data.dailySlotIds.map((value) => {
    if (value === null || value === undefined || value === "") return null;
    const missionId = optionalString(value, 160);
    if (!missionId || !DAILY_MISSION_IDS.has(missionId)) {
      throw new HttpsError("invalid-argument", "dailySlotIds enthaelt eine unbekannte Tagesmission.");
    }
    return missionId;
  });
  const selectedIds = dailySlotIds.filter(Boolean);
  if (new Set(selectedIds).size !== selectedIds.length) {
    throw new HttpsError("invalid-argument", "Eine Tagesmission darf nicht in mehreren Slots liegen.");
  }

  return { favoriteIds, dailySlotIds };
}

function buildCompletionDays(completionDocs) {
  const missionIdsByDate = new Map();
  for (const doc of completionDocs) {
    const data = doc.data() || {};
    const missionId = optionalString(data.missionId, 160);
    if (!missionId || !DAILY_MISSION_IDS.has(missionId) || data.status !== "completed") continue;
    const dateKey = optionalString(data.dateKey, 20)
      || documentDateKey(data, ["completedAt", "updatedAt", "createdAt"]);
    if (!dateKey) continue;
    if (!missionIdsByDate.has(dateKey)) missionIdsByDate.set(dateKey, new Set());
    missionIdsByDate.get(dateKey).add(missionId);
  }
  return missionIdsByDate;
}

function buildStreakSummary(completionDays, todayKey) {
  const goalDates = [...completionDays.entries()]
    .filter(([, missionIds]) => missionIds.size >= DAILY_GOAL)
    .map(([dateKey]) => dateKey)
    .sort();
  const goalDateSet = new Set(goalDates);

  let longestStreak = 0;
  let running = 0;
  let previous = null;
  for (const dateKey of goalDates) {
    running = previous && addUtcDays(previous, 1) === dateKey ? running + 1 : 1;
    longestStreak = Math.max(longestStreak, running);
    previous = dateKey;
  }

  const yesterdayKey = addUtcDays(todayKey, -1);
  const streakAnchor = goalDateSet.has(todayKey)
    ? todayKey
    : goalDateSet.has(yesterdayKey)
      ? yesterdayKey
      : null;
  let currentStreak = 0;
  if (streakAnchor) {
    let cursor = streakAnchor;
    while (goalDateSet.has(cursor)) {
      currentStreak += 1;
      cursor = addUtcDays(cursor, -1);
    }
  }

  return {
    currentStreak,
    longestStreak,
    streakBonus: calculateStreakBonus(currentStreak),
    lastCompletedDate: goalDates.at(-1) || null,
  };
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
    if (!missionId || !DAILY_MISSION_IDS.has(missionId) || byMission.has(missionId)) continue;
    if (completedMissionIds.has(missionId)) continue;
    if (completedAttemptIds.has(attemptDoc.id) || attempt.status === "completed") continue;
    const evidence = evidenceByAttempt.get(attemptDoc.id) || null;
    byMission.set(missionId, {
      missionId,
      attemptId: attemptDoc.id,
      startedDateKey: optionalString(attempt.dateKey, 20)
        || documentDateKey(attempt, ["createdAt", "startedAt", "updatedAt"]),
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
  return [...byMission.values()].slice(0, MAX_DAILY_MISSIONS);
}

function registerBeta1DailyMissionProgress(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.saveDailyMissionPreferences = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const preferences = validatePreferences(data, HttpsError);
    const todayKey = dateKeyInVienna(new Date());
    const stateRef = db.collection("userDailyMissionState").doc(`${userId}_${todayKey}`);
    const stateSnapshot = await stateRef.get();
    const patch = {
      userId,
      ownerUserId: userId,
      dateKey: todayKey,
      favoriteIds: preferences.favoriteIds,
      dailySlotIds: preferences.dailySlotIds,
      preferenceAuthority: "server-callable",
      rewardAuthority: false,
      missionCompletionAuthority: false,
      ...updatedTimestamp(),
    };
    if (!stateSnapshot.exists) patch.createdAt = new Date().toISOString();
    await stateRef.set(patch, { merge: true });
    return {
      accepted: true,
      dateKey: todayKey,
      ...preferences,
      rewardAuthority: false,
      missionCompletionAuthority: false,
    };
  });

  exportsTarget.getDailyMissionProgress = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const todayKey = dateKeyInVienna(new Date());
    const stateRef = db.collection("userDailyMissionState").doc(`${userId}_${todayKey}`);
    const [stateSnapshot, attemptsSnapshot, evidenceSnapshot, completionsSnapshot, walletSnapshot] = await Promise.all([
      stateRef.get(),
      db.collection("missionAttempts").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionEvidence").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionCompletions").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("xpWallets").doc(userId).get(),
    ]);

    const state = stateSnapshot.exists ? stateSnapshot.data() || {} : {};
    const evidenceByAttempt = buildLatestEvidenceByAttempt(evidenceSnapshot.docs);
    const completedAttemptIds = new Set();
    for (const doc of completionsSnapshot.docs) {
      const completion = doc.data() || {};
      const attemptId = optionalString(completion.attemptId, 180);
      if (attemptId && completion.status === "completed") completedAttemptIds.add(attemptId);
    }

    const completionDays = buildCompletionDays(completionsSnapshot.docs);
    const todayCompletedIds = [...(completionDays.get(todayKey) || new Set())];
    const activeAttempts = buildActiveAttempts({
      attempts: attemptsSnapshot.docs,
      evidenceByAttempt,
      completedAttemptIds,
      completedMissionIds: new Set(todayCompletedIds),
    });
    const todayStartedIds = attemptsSnapshot.docs
      .filter((doc) => {
        const attempt = doc.data() || {};
        return isDailyMissionId(attempt.missionId)
          && (optionalString(attempt.dateKey, 20)
            || documentDateKey(attempt, ["createdAt", "startedAt", "updatedAt"])) === todayKey;
      })
      .map((doc) => optionalString((doc.data() || {}).missionId, 160))
      .filter(Boolean);
    const startedMissionIds = [...new Set([
      ...todayStartedIds,
      ...activeAttempts.map((attempt) => attempt.missionId),
      ...todayCompletedIds,
    ])];
    const streak = buildStreakSummary(completionDays, todayKey);
    const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
    const xp = Math.max(0, Math.floor(Number(wallet.lifetimeEarned || 0)));
    const level = calculateLevelFromXp(xp);

    return {
      accepted: true,
      dateKey: todayKey,
      catalogId: dailyMissionCatalog.catalogId,
      catalogVersion: dailyMissionCatalog.version,
      completionPolicy: dailyMissionCatalog.completionPolicy,
      favoriteIds: uniqueKnownMissionIds(state.favoriteIds),
      dailySlotIds: Array.isArray(state.dailySlotIds) && state.dailySlotIds.length === 3
        ? state.dailySlotIds.map((missionId) => missionId && DAILY_MISSION_IDS.has(missionId) ? missionId : null)
        : [null, null, null],
      startedMissionIds,
      completedMissionIds: todayCompletedIds,
      activeAttempts,
      dailyGoal: DAILY_GOAL,
      goalCompleted: todayCompletedIds.length >= DAILY_GOAL,
      ...streak,
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
  registerBeta1DailyMissionProgress,
  dateKeyInVienna,
  documentDateKey,
  calculateLevelFromXp,
  buildStreakSummary,
  validatePreferences,
  isDailyMissionId,
  dailyMissionAttemptId,
  dailyMissionCompletionIdempotencyKey,
};
