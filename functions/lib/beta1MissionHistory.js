const crypto = require("node:crypto");
const {
  requireAuth,
  normalizedPositiveInteger,
  optionalString,
} = require("./beta1Runtime");

const MISSION_HISTORY_VERSION = "2026-07-25-v1";
const MAX_SOURCE_DOCUMENTS = 250;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 100;
const VALID_REVIEW_STATUSES = new Set([
  "pending-server-review",
  "approved",
  "rejected",
  "needs-more-evidence",
]);

function timestampToDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  if (typeof value === "object" && Number.isFinite(Number(value._seconds))) {
    const date = new Date(Number(value._seconds) * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function timestampToIso(value) {
  const date = timestampToDate(value);
  return date ? date.toISOString() : null;
}

function timestampMillis(value) {
  const date = timestampToDate(value);
  return date ? date.getTime() : 0;
}

function nonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function normalizedReviewStatus(value) {
  const normalized = optionalString(value, 80);
  return normalized && VALID_REVIEW_STATUSES.has(normalized) ? normalized : null;
}

function humanizeMissionId(missionId) {
  const normalized = optionalString(missionId, 180) || "Mission";
  return normalized
    .replace(/^(daily|weekly|challenge|adventure)[-_]/i, "")
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Mission";
}

function missionCategory({ missionId, catalogId, type }) {
  const diagnostic = `${missionId || ""} ${catalogId || ""} ${type || ""}`.toLowerCase();
  if (diagnostic.includes("daily")) return "daily";
  if (diagnostic.includes("weekly")) return "weekly";
  if (diagnostic.includes("challenge")) return "challenge";
  if (diagnostic.includes("adventure")) return "adventure";
  return "mission";
}

function categoryLabel(category) {
  if (category === "daily") return "Tagesmissionen";
  if (category === "weekly") return "Wochenmissionen";
  if (category === "challenge") return "Challenge";
  if (category === "adventure") return "Abenteuer";
  return "Missionen";
}

function categoryIcon(category) {
  if (category === "daily") return "☀️";
  if (category === "weekly") return "📅";
  if (category === "challenge") return "⚡";
  if (category === "adventure") return "🧭";
  return "🎯";
}

function latestDocument(items, timeFields) {
  return [...(items || [])].sort((left, right) => {
    const leftTime = Math.max(...timeFields.map((field) => timestampMillis(left && left[field])));
    const rightTime = Math.max(...timeFields.map((field) => timestampMillis(right && right[field])));
    return rightTime - leftTime;
  })[0] || null;
}

function historyStatus({ attempt, evidence, completion }) {
  const completionStatus = optionalString(completion && completion.status, 80);
  const completionLedgerId = optionalString(completion && completion.xpLedgerEventId, 180);
  const attemptStatus = optionalString(attempt && attempt.status, 80);
  const reviewStatus = normalizedReviewStatus(
    (evidence && evidence.reviewStatus)
      || (attempt && attempt.latestEvidenceReviewStatus),
  );

  if (completionStatus === "completed" && completionLedgerId) return "completed";
  if (completionStatus === "completed" || attemptStatus === "completed") return "server-inconsistent";
  if (reviewStatus === "approved" || attemptStatus === "evidence-approved") return "review-approved";
  if (reviewStatus === "rejected" || attemptStatus === "evidence-rejected") return "rejected";
  if (reviewStatus === "needs-more-evidence" || attemptStatus === "more-evidence-required") return "needs-more-evidence";
  if (reviewStatus === "pending-server-review" || attemptStatus === "evidence-submitted") return "review-pending";
  return "started";
}

function actionRequired(status) {
  return status === "started"
    || status === "review-approved"
    || status === "rejected"
    || status === "needs-more-evidence";
}

function serverAttentionRequired(status) {
  return status === "server-inconsistent";
}

function historyTime({ attempt, evidence, completion }) {
  return latestDocument([
    completion && {
      value: completion.completedAt,
      fallback: completion.updatedAt || completion.createdAt,
    },
    evidence && {
      value: evidence.reviewedAt,
      fallback: evidence.updatedAt || evidence.createdAt,
    },
    attempt && {
      value: attempt.updatedAt,
      fallback: attempt.createdAt || attempt.startedAt,
    },
  ].filter(Boolean).map((item) => ({
    ...item,
    time: item.value || item.fallback,
  })), ["time"])?.time || null;
}

function safeHistoryId(attemptKey) {
  const hash = crypto.createHash("sha256").update(String(attemptKey || "unknown")).digest("hex");
  return `history_${hash.slice(0, 24)}`;
}

function periodProjection(attempt, completion) {
  const dateKey = optionalString(
    (completion && completion.dateKey) || (attempt && attempt.dateKey),
    20,
  );
  const weekKey = optionalString(
    (completion && completion.weekKey) || (attempt && attempt.weekKey),
    40,
  );
  const timeZone = optionalString(
    (completion && completion.timeZone) || (attempt && attempt.timeZone),
    120,
  );
  if (dateKey) return { periodType: "day", periodKey: dateKey, timeZone };
  if (weekKey) return { periodType: "week", periodKey: weekKey, timeZone };
  return { periodType: "none", periodKey: null, timeZone };
}

function buildMissionHistoryEntries({ attempts = [], evidence = [], completions = [], missions = [], limit = DEFAULT_HISTORY_LIMIT }) {
  const normalizedLimit = Math.min(Math.max(1, nonNegativeInteger(limit, DEFAULT_HISTORY_LIMIT)), MAX_HISTORY_LIMIT);
  const attemptsById = new Map();
  for (const attempt of attempts) {
    const attemptId = optionalString(attempt && (attempt.attemptId || attempt.id), 180);
    if (attemptId) attemptsById.set(attemptId, attempt);
  }

  const evidenceByAttempt = new Map();
  for (const item of evidence) {
    const attemptId = optionalString(item && item.attemptId, 180);
    if (!attemptId) continue;
    const current = evidenceByAttempt.get(attemptId) || [];
    current.push(item);
    evidenceByAttempt.set(attemptId, current);
  }

  const completionsByAttempt = new Map();
  for (const completion of completions) {
    const attemptId = optionalString(
      completion && (completion.attemptId || completion.completionId || completion.id),
      180,
    );
    if (!attemptId) continue;
    const current = completionsByAttempt.get(attemptId) || [];
    current.push(completion);
    completionsByAttempt.set(attemptId, current);
    if (!attemptsById.has(attemptId)) {
      attemptsById.set(attemptId, {
        attemptId,
        missionId: completion.missionId,
        status: completion.status,
        dateKey: completion.dateKey,
        weekKey: completion.weekKey,
        timeZone: completion.timeZone,
        childProfileId: completion.childProfileId,
        createdAt: completion.createdAt,
        updatedAt: completion.updatedAt,
      });
    }
  }

  const missionsById = new Map();
  for (const mission of missions) {
    const missionId = optionalString(mission && (mission.missionId || mission.id), 180);
    if (missionId) missionsById.set(missionId, mission);
  }

  const entries = [];
  for (const [attemptId, attempt] of attemptsById.entries()) {
    const missionId = optionalString(attempt && attempt.missionId, 180);
    if (!missionId) continue;
    const mission = missionsById.get(missionId) || {};
    const latestEvidence = latestDocument(evidenceByAttempt.get(attemptId), ["reviewedAt", "updatedAt", "createdAt"]);
    const latestCompletion = latestDocument(completionsByAttempt.get(attemptId), ["completedAt", "updatedAt", "createdAt"]);
    const status = historyStatus({ attempt, evidence: latestEvidence, completion: latestCompletion });
    const category = missionCategory({
      missionId,
      catalogId: mission.catalogId || attempt.catalogId || (latestCompletion && latestCompletion.catalogId),
      type: mission.type,
    });
    const occurredAtValue = historyTime({ attempt, evidence: latestEvidence, completion: latestCompletion });
    const period = periodProjection(attempt, latestCompletion);
    const isAdventure = category === "adventure";
    const isLocationBound = category === "challenge" || isAdventure;
    const accessLedgerEventId = optionalString(attempt && attempt.accessLedgerEventId, 180);

    entries.push({
      historyId: safeHistoryId(attemptId),
      missionId,
      title: optionalString(mission.title || attempt.missionTitle, 200) || humanizeMissionId(missionId),
      category,
      categoryLabel: categoryLabel(category),
      icon: optionalString(mission.icon, 20) || categoryIcon(category),
      status,
      reviewStatus: normalizedReviewStatus(
        (latestEvidence && latestEvidence.reviewStatus)
          || (attempt && attempt.latestEvidenceReviewStatus),
      ),
      actionRequired: actionRequired(status),
      serverAttentionRequired: serverAttentionRequired(status),
      occurredAt: timestampToIso(occurredAtValue),
      completedAt: status === "completed" ? timestampToIso(latestCompletion && (latestCompletion.completedAt || latestCompletion.updatedAt || latestCompletion.createdAt)) : null,
      rewardXp: status === "completed" ? nonNegativeInteger(latestCompletion && latestCompletion.rewardXp) : 0,
      ledgerRecorded: status === "completed" && Boolean(optionalString(latestCompletion && latestCompletion.xpLedgerEventId, 180)),
      periodType: period.periodType,
      periodKey: period.periodKey,
      timeZone: period.timeZone,
      isLocationBound,
      accessDebited: isAdventure && Boolean(accessLedgerEventId),
      accessCostWfxp: isAdventure ? nonNegativeInteger(attempt && attempt.accessCostWfxp) : 0,
      childProfile: Boolean(attempt && attempt.childProfileId),
      source: "server-mission-history",
      entryAuthority: "server-read",
      noMonetaryValue: true,
    });
  }

  return entries
    .sort((left, right) => timestampMillis(right.occurredAt) - timestampMillis(left.occurredAt))
    .slice(0, normalizedLimit);
}

async function readUserDocuments(db, collectionName, userId, maxDocuments = MAX_SOURCE_DOCUMENTS) {
  const [ownerSnapshot, userSnapshot] = await Promise.all([
    db.collection(collectionName).where("ownerUserId", "==", userId).limit(maxDocuments).get(),
    db.collection(collectionName).where("userId", "==", userId).limit(maxDocuments).get(),
  ]);
  const documents = new Map();
  for (const doc of [...ownerSnapshot.docs, ...userSnapshot.docs]) {
    documents.set(doc.ref.path, { id: doc.id, ...(doc.data() || {}) });
  }
  return {
    documents: [...documents.values()],
    truncated: ownerSnapshot.size >= maxDocuments || userSnapshot.size >= maxDocuments,
  };
}

async function readMissions(db, missionIds) {
  const uniqueIds = [...new Set((missionIds || []).filter(Boolean))].slice(0, MAX_SOURCE_DOCUMENTS);
  const missions = [];
  for (let offset = 0; offset < uniqueIds.length; offset += 100) {
    const refs = uniqueIds.slice(offset, offset + 100).map((missionId) => db.collection("missions").doc(missionId));
    if (refs.length === 0) continue;
    const snapshots = await db.getAll(...refs);
    snapshots.forEach((snapshot) => {
      if (snapshot.exists) missions.push({ id: snapshot.id, ...(snapshot.data() || {}) });
    });
  }
  return missions;
}

function registerBeta1MissionHistory(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getMissionHistory = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const limit = normalizedPositiveInteger((request.data || {}).limit, DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT);
    const [attemptResult, evidenceResult, completionResult] = await Promise.all([
      readUserDocuments(db, "missionAttempts", userId),
      readUserDocuments(db, "missionEvidence", userId),
      readUserDocuments(db, "missionCompletions", userId),
    ]);
    const missionIds = [
      ...attemptResult.documents.map((item) => item.missionId),
      ...completionResult.documents.map((item) => item.missionId),
    ];
    const missions = await readMissions(db, missionIds);
    const entries = buildMissionHistoryEntries({
      attempts: attemptResult.documents,
      evidence: evidenceResult.documents,
      completions: completionResult.documents,
      missions,
      limit,
    });

    return {
      accepted: true,
      historyVersion: MISSION_HISTORY_VERSION,
      entries,
      count: entries.length,
      requestedLimit: limit,
      scanTruncated: attemptResult.truncated || evidenceResult.truncated || completionResult.truncated,
      sourceCounts: {
        attempts: attemptResult.documents.length,
        evidence: evidenceResult.documents.length,
        completions: completionResult.documents.length,
      },
      generatedAt: new Date().toISOString(),
      progressAuthority: "server-read",
      rawEvidenceIncluded: false,
      rawLocationIncluded: false,
      userIdentifiersIncluded: false,
      recordIdentifiersIncluded: false,
      writesPerformed: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
      noMonetaryValue: true,
    };
  });
}

module.exports = {
  MISSION_HISTORY_VERSION,
  MAX_SOURCE_DOCUMENTS,
  DEFAULT_HISTORY_LIMIT,
  MAX_HISTORY_LIMIT,
  timestampToIso,
  missionCategory,
  historyStatus,
  buildMissionHistoryEntries,
  registerBeta1MissionHistory,
};
