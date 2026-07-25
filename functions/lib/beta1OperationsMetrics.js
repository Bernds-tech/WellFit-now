const crypto = require("node:crypto");
const { FieldPath } = require("firebase-admin/firestore");
const { requireAdmin, optionalString } = require("./beta1Runtime");

const OPERATIONS_SNAPSHOT_VERSION = "2026-07-25-v1";
const ALLOWED_WINDOW_DAYS = new Set([7, 14, 30]);
const MINIMUM_RETENTION_COHORT_SIZE = 5;
const MAX_COLLECTION_DOCUMENTS = 12000;
const COLLECTION_PAGE_SIZE = 400;

const COLLECTION_SPECS = [
  ["onboarding", "userOnboardingRecords"],
  ["attempts", "missionAttempts"],
  ["evidence", "missionEvidence"],
  ["completions", "missionCompletions"],
  ["buddyActions", "buddyCareActions"],
  ["ledger", "xpLedgerEvents"],
  ["safetyReports", "safetyReports"],
  ["exportJobs", "userDataExportJobs"],
  ["lifecycles", "accountLifecycleRecords"],
  ["patternReviews", "missionPatternReviews"],
  ["cooldownReviews", "missionCooldownReviews"],
];

function asDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function firstDate(data, fields) {
  for (const field of fields) {
    const date = asDate(data && data[field]);
    if (date) return date;
  }
  return null;
}

function startOfUtcDay(value) {
  const date = asDate(value) || new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(value, days) {
  const date = startOfUtcDay(value);
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date;
}

function utcDateKey(value) {
  const date = asDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

function dateKeyRange(start, days) {
  return Array.from({ length: days }, (_, index) => utcDateKey(addUtcDays(start, index)));
}

function withinRange(date, start, end) {
  return Boolean(date && date.getTime() >= start.getTime() && date.getTime() <= end.getTime());
}

function safeUserHash(userId) {
  const normalized = optionalString(userId, 256);
  if (!normalized) return null;
  return crypto.createHash("sha256").update(`wellfit-beta-operations-v1:${normalized}`).digest("hex");
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function percentage(numerator, denominator) {
  if (!Number.isFinite(denominator) || denominator <= 0) return null;
  return Number(((Number(numerator || 0) / denominator) * 100).toFixed(1));
}

function percentile(values, percentileValue) {
  const sorted = values
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((left, right) => left - right);
  if (sorted.length === 0) return null;
  if (percentileValue === 0.5) {
    const middle = Math.floor(sorted.length / 2);
    const value = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
    return Number(value.toFixed(2));
  }
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * percentileValue) - 1));
  return Number(sorted[index].toFixed(2));
}

function normalizedWindowDays(value) {
  const days = Number(value);
  return ALLOWED_WINDOW_DAYS.has(days) ? days : 14;
}

function documentData(document) {
  if (!document) return {};
  if (document.data && typeof document.data === "object") return document.data;
  return document;
}

function documentId(document) {
  return optionalString(document && (document.id || document.documentId), 256);
}

function ownerId(data) {
  return optionalString(
    data && (data.ownerUserId || data.userId || data.guardianUserId || data.reporterUserId || data.mayorUserId),
    256,
  );
}

function activityDate(data, fallbackFields) {
  return firstDate(data, fallbackFields || ["createdAt", "updatedAt"]);
}

function engagementEvents(collections) {
  const events = [];
  const add = (documents, fields, type) => {
    for (const document of documents || []) {
      const data = documentData(document);
      const date = activityDate(data, fields);
      const userId = ownerId(data);
      if (date && userId) events.push({ date, userHash: safeUserHash(userId), type });
    }
  };
  add(collections.attempts, ["startedAt", "createdAt", "updatedAt"], "mission-start");
  add(collections.evidence, ["createdAt", "updatedAt"], "evidence");
  add(collections.completions, ["completedAt", "createdAt", "updatedAt"], "completion");
  add(collections.buddyActions, ["completedAt", "createdAt", "updatedAt"], "buddy-action");
  return events;
}

function retentionMetric({ accounts, engagementByUserAndDate, dayOffset, windowStart, nowDay }) {
  const latestEligibleDay = addUtcDays(nowDay, -dayOffset);
  const eligible = accounts.filter((account) => (
    account.createdAt
    && account.createdAt.getTime() >= windowStart.getTime()
    && startOfUtcDay(account.createdAt).getTime() <= latestEligibleDay.getTime()
  ));
  let retained = 0;
  for (const account of eligible) {
    const targetKey = utcDateKey(addUtcDays(account.createdAt, dayOffset));
    const key = `${account.userHash}:${targetKey}`;
    if (engagementByUserAndDate.has(key)) retained += 1;
  }
  const suppressed = eligible.length < MINIMUM_RETENTION_COHORT_SIZE;
  return {
    day: dayOffset,
    eligibleAccounts: eligible.length,
    retainedAccounts: suppressed ? null : retained,
    ratePercent: suppressed ? null : percentage(retained, eligible.length),
    suppressed,
    minimumCohortSize: MINIMUM_RETENTION_COHORT_SIZE,
    definition: `at-least-one-product-engagement-on-utc-day-${dayOffset}`,
  };
}

function calculateBetaOperationsSnapshot({ collections, windowDays = 14, now = new Date(), truncatedCollections = [] }) {
  const days = normalizedWindowDays(windowDays);
  const nowDate = asDate(now) || new Date();
  const today = startOfUtcDay(nowDate);
  const windowStart = addUtcDays(today, -(days - 1));
  const dateKeys = dateKeyRange(windowStart, days);
  const daily = new Map(dateKeys.map((dateKey) => [dateKey, {
    dateKey,
    engagedUsers: new Set(),
    missionStarts: 0,
    evidenceSubmitted: 0,
    completions: 0,
    approvedEvidence: 0,
    rejectedEvidence: 0,
    needsMoreEvidence: 0,
  }]));

  const completedOnboarding = (collections.onboarding || [])
    .map((document) => {
      const data = documentData(document);
      const userId = optionalString(data.userId || data.ownerUserId || documentId(document), 256);
      const createdAt = firstDate(data, ["completedAt", "createdAt", "updatedAt"]);
      return {
        userId,
        userHash: safeUserHash(userId),
        createdAt,
        analyticsOptIn: Boolean(
          data.consentSummary
          && data.consentSummary.anonymousAnalytics === true
        ),
        status: optionalString(data.status, 80),
      };
    })
    .filter((account) => account.status === "completed" && account.userHash);

  const newAccounts = completedOnboarding.filter((account) => withinRange(account.createdAt, windowStart, nowDate));
  const analyticsOptInAccounts = completedOnboarding.filter((account) => account.analyticsOptIn).length;
  const firstAttemptByUser = new Map();
  const attemptIdsInWindow = new Set();
  const starterHashes = [];

  for (const document of collections.attempts || []) {
    const data = documentData(document);
    const date = activityDate(data, ["startedAt", "createdAt", "updatedAt"]);
    const userId = ownerId(data);
    const userHash = safeUserHash(userId);
    if (date && userHash) {
      const existing = firstAttemptByUser.get(userHash);
      if (!existing || date.getTime() < existing.getTime()) firstAttemptByUser.set(userHash, date);
    }
    if (!withinRange(date, windowStart, nowDate)) continue;
    const attemptId = optionalString(data.attemptId || documentId(document), 256);
    if (attemptId) attemptIdsInWindow.add(attemptId);
    if (userHash) starterHashes.push(userHash);
    const dateKey = utcDateKey(date);
    if (dateKey && daily.has(dateKey)) daily.get(dateKey).missionStarts += 1;
  }

  const activationEligible = newAccounts.filter((account) => account.createdAt);
  const activated = activationEligible.filter((account) => {
    const firstAttempt = firstAttemptByUser.get(account.userHash);
    if (!firstAttempt) return false;
    const elapsed = firstAttempt.getTime() - account.createdAt.getTime();
    return elapsed >= 0 && elapsed <= 24 * 60 * 60 * 1000;
  }).length;

  const events = engagementEvents(collections);
  const engagementByUserAndDate = new Set();
  const engagedHashesInWindow = [];
  for (const event of events) {
    const dateKey = utcDateKey(event.date);
    if (event.userHash && dateKey) engagementByUserAndDate.add(`${event.userHash}:${dateKey}`);
    if (!withinRange(event.date, windowStart, nowDate)) continue;
    if (event.userHash) {
      engagedHashesInWindow.push(event.userHash);
      if (daily.has(dateKey)) daily.get(dateKey).engagedUsers.add(event.userHash);
    }
  }

  const evidenceAttemptIdsInWindow = new Set();
  let evidenceSubmitted = 0;
  let pendingEvidence = 0;
  let reviewedEvidence = 0;
  let approvedEvidence = 0;
  let rejectedEvidence = 0;
  let needsMoreEvidence = 0;
  const reviewLatencyHours = [];

  for (const document of collections.evidence || []) {
    const data = documentData(document);
    const submittedAt = activityDate(data, ["createdAt", "updatedAt"]);
    const reviewStatus = optionalString(data.reviewStatus, 80) || "unknown";
    if (reviewStatus === "pending-server-review") pendingEvidence += 1;
    if (withinRange(submittedAt, windowStart, nowDate)) {
      evidenceSubmitted += 1;
      const attemptId = optionalString(data.attemptId, 256);
      if (attemptId) evidenceAttemptIdsInWindow.add(attemptId);
      const dateKey = utcDateKey(submittedAt);
      if (dateKey && daily.has(dateKey)) daily.get(dateKey).evidenceSubmitted += 1;
    }

    const reviewedAt = firstDate(data, ["reviewedAt", "updatedAt"]);
    if (!withinRange(reviewedAt, windowStart, nowDate) || !["approved", "rejected", "needs-more-evidence"].includes(reviewStatus)) continue;
    reviewedEvidence += 1;
    const dateKey = utcDateKey(reviewedAt);
    if (reviewStatus === "approved") {
      approvedEvidence += 1;
      if (dateKey && daily.has(dateKey)) daily.get(dateKey).approvedEvidence += 1;
    } else if (reviewStatus === "rejected") {
      rejectedEvidence += 1;
      if (dateKey && daily.has(dateKey)) daily.get(dateKey).rejectedEvidence += 1;
    } else {
      needsMoreEvidence += 1;
      if (dateKey && daily.has(dateKey)) daily.get(dateKey).needsMoreEvidence += 1;
    }
    if (submittedAt && reviewedAt && reviewedAt.getTime() >= submittedAt.getTime()) {
      reviewLatencyHours.push((reviewedAt.getTime() - submittedAt.getTime()) / 3600000);
    }
  }

  let completions = 0;
  const completerHashes = [];
  for (const document of collections.completions || []) {
    const data = documentData(document);
    const date = activityDate(data, ["completedAt", "createdAt", "updatedAt"]);
    if (!withinRange(date, windowStart, nowDate) || data.status !== "completed") continue;
    completions += 1;
    const hash = safeUserHash(ownerId(data));
    if (hash) completerHashes.push(hash);
    const dateKey = utcDateKey(date);
    if (dateKey && daily.has(dateKey)) daily.get(dateKey).completions += 1;
  }

  let wfxpGranted = 0;
  const wfxpEarners = [];
  for (const document of collections.ledger || []) {
    const data = documentData(document);
    const date = activityDate(data, ["createdAt", "updatedAt"]);
    const delta = Number(data.delta || 0);
    if (!withinRange(date, windowStart, nowDate) || !Number.isFinite(delta) || delta <= 0) continue;
    wfxpGranted += Math.trunc(delta);
    const hash = safeUserHash(ownerId(data));
    if (hash) wfxpEarners.push(hash);
  }

  const openSafetyStatuses = new Set(["submitted", "open", "pending", "under-review"]);
  let openSafetyReports = 0;
  let newSafetyReports = 0;
  for (const document of collections.safetyReports || []) {
    const data = documentData(document);
    const status = optionalString(data.status, 80) || "submitted";
    if (openSafetyStatuses.has(status)) openSafetyReports += 1;
    const date = activityDate(data, ["submittedAt", "createdAt", "updatedAt"]);
    if (withinRange(date, windowStart, nowDate)) newSafetyReports += 1;
  }

  let failedExports = 0;
  for (const document of collections.exportJobs || []) {
    const data = documentData(document);
    if (data.status !== "failed") continue;
    const date = activityDate(data, ["failedAt", "updatedAt", "generatedAt"]);
    if (withinRange(date, windowStart, nowDate)) failedExports += 1;
  }

  const blockedDeletions = (collections.lifecycles || [])
    .map(documentData)
    .filter((data) => data.status === "deletion-blocked").length;

  let manualPatternReviews = 0;
  let patternWatchlist = 0;
  for (const document of collections.patternReviews || []) {
    const data = documentData(document);
    const date = activityDate(data, ["createdAt", "updatedAt"]);
    if (!withinRange(date, windowStart, nowDate)) continue;
    if (data.recommendation === "manual-review-required") manualPatternReviews += 1;
    if (data.recommendation === "pattern-watchlist") patternWatchlist += 1;
  }

  let hardCooldownSignals = 0;
  let softCooldownSignals = 0;
  for (const document of collections.cooldownReviews || []) {
    const data = documentData(document);
    const date = activityDate(data, ["createdAt", "updatedAt"]);
    if (!withinRange(date, windowStart, nowDate)) continue;
    if (data.cooldownStatus === "hard-cooldown-recommended") hardCooldownSignals += 1;
    if (data.cooldownStatus === "soft-cooldown-recommended") softCooldownSignals += 1;
  }

  const retention = {
    d1: retentionMetric({ accounts: completedOnboarding, engagementByUserAndDate, dayOffset: 1, windowStart, nowDay: today }),
    d7: retentionMetric({ accounts: completedOnboarding, engagementByUserAndDate, dayOffset: 7, windowStart, nowDay: today }),
  };

  const dailySeries = dateKeys.map((dateKey) => {
    const entry = daily.get(dateKey);
    return {
      dateKey,
      engagedUsers: entry.engagedUsers.size,
      missionStarts: entry.missionStarts,
      evidenceSubmitted: entry.evidenceSubmitted,
      completions: entry.completions,
      approvedEvidence: entry.approvedEvidence,
      rejectedEvidence: entry.rejectedEvidence,
      needsMoreEvidence: entry.needsMoreEvidence,
    };
  });

  const missionStarts = attemptIdsInWindow.size;
  const knownFailureSignals = failedExports + blockedDeletions;
  const riskSignals = manualPatternReviews + patternWatchlist + hardCooldownSignals + softCooldownSignals;

  return {
    accepted: true,
    snapshotVersion: OPERATIONS_SNAPSHOT_VERSION,
    generatedAt: nowDate.toISOString(),
    window: {
      days,
      startAt: windowStart.toISOString(),
      endAt: nowDate.toISOString(),
      calendarAuthority: "aggregate-utc-window",
    },
    privacy: {
      aggregateOnly: true,
      returnsUserIdentifiers: false,
      returnsEmailAddresses: false,
      returnsHealthData: false,
      returnsCoordinates: false,
      returnsEvidenceContent: false,
      minimumRetentionCohortSize: MINIMUM_RETENTION_COHORT_SIZE,
      engagementDefinition: "mission-start-evidence-completion-or-buddy-care",
    },
    accounts: {
      initializedTotal: completedOnboarding.length,
      newInWindow: newAccounts.length,
      analyticsOptInTotal: analyticsOptInAccounts,
      analyticsOptInRatePercent: percentage(analyticsOptInAccounts, completedOnboarding.length),
      engagedInWindow: uniqueCount(engagedHashesInWindow),
      activationEligibleAccounts: activationEligible.length,
      activatedWithin24Hours: activated,
      activationRatePercent: percentage(activated, activationEligible.length),
      activationDefinition: "first-mission-start-within-24-hours-of-completed-onboarding",
    },
    retention,
    missions: {
      starts: missionStarts,
      uniqueStarters: uniqueCount(starterHashes),
      evidenceSubmissions: evidenceSubmitted,
      attemptsWithEvidence: evidenceAttemptIdsInWindow.size,
      evidenceSubmissionRatePercent: percentage(evidenceAttemptIdsInWindow.size, missionStarts),
      completions,
      uniqueCompleters: uniqueCount(completerHashes),
      completionRatePercent: percentage(completions, missionStarts),
      rateDefinition: "same-selected-utc-window-ratio",
    },
    evidence: {
      pendingTotal: pendingEvidence,
      reviewedInWindow: reviewedEvidence,
      approvedInWindow: approvedEvidence,
      rejectedInWindow: rejectedEvidence,
      needsMoreEvidenceInWindow: needsMoreEvidence,
      approvalRatePercent: percentage(approvedEvidence, reviewedEvidence),
      medianReviewHours: percentile(reviewLatencyHours, 0.5),
      p90ReviewHours: percentile(reviewLatencyHours, 0.9),
      measuredReviewCount: reviewLatencyHours.length,
    },
    economy: {
      currency: "WFXP",
      grantedInWindow: wfxpGranted,
      uniqueEarners: uniqueCount(wfxpEarners),
      noMonetaryValue: true,
      blockchainBacked: false,
      cashoutAllowed: false,
      tokenAuthorized: false,
      realMoney: false,
    },
    operations: {
      openSafetyReports,
      safetyReportsCreatedInWindow: newSafetyReports,
      failedDataExportsInWindow: failedExports,
      blockedAccountDeletions: blockedDeletions,
      knownFailureSignals,
      manualPatternReviewsInWindow: manualPatternReviews,
      patternWatchlistSignalsInWindow: patternWatchlist,
      hardCooldownSignalsInWindow: hardCooldownSignals,
      softCooldownSignalsInWindow: softCooldownSignals,
      riskSignalsInWindow: riskSignals,
    },
    daily: dailySeries,
    scan: {
      maxDocumentsPerCollection: MAX_COLLECTION_DOCUMENTS,
      truncatedCollections: [...new Set(truncatedCollections)].sort(),
      complete: truncatedCollections.length === 0,
    },
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
  };
}

async function readBoundedCollection(db, collectionName, maxDocuments = MAX_COLLECTION_DOCUMENTS) {
  const documents = [];
  let cursor = null;
  const target = maxDocuments + 1;
  for (let page = 0; page < 1000 && documents.length < target; page += 1) {
    const pageSize = Math.min(COLLECTION_PAGE_SIZE, target - documents.length);
    let query = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    snapshot.docs.forEach((document) => documents.push({
      id: document.id,
      data: document.data() || {},
    }));
    if (snapshot.size < pageSize) break;
    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (page === 999) throw new Error(`Operations scan exceeded page limit: ${collectionName}`);
  }
  return {
    documents: documents.slice(0, maxDocuments),
    truncated: documents.length > maxDocuments,
  };
}

async function readOperationsCollections(db) {
  const entries = await Promise.all(COLLECTION_SPECS.map(async ([key, collectionName]) => {
    const result = await readBoundedCollection(db, collectionName);
    return { key, collectionName, ...result };
  }));
  return {
    collections: Object.fromEntries(entries.map((entry) => [entry.key, entry.documents])),
    truncatedCollections: entries.filter((entry) => entry.truncated).map((entry) => entry.collectionName),
  };
}

function registerBeta1OperationsMetrics(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getBetaOperationsSnapshot = onCall(async (request) => {
    requireAdmin(request, HttpsError);
    const days = normalizedWindowDays((request.data || {}).windowDays);
    const read = await readOperationsCollections(db);
    return calculateBetaOperationsSnapshot({
      collections: read.collections,
      truncatedCollections: read.truncatedCollections,
      windowDays: days,
      now: new Date(),
    });
  });
}

module.exports = {
  OPERATIONS_SNAPSHOT_VERSION,
  ALLOWED_WINDOW_DAYS,
  MINIMUM_RETENTION_COHORT_SIZE,
  MAX_COLLECTION_DOCUMENTS,
  asDate,
  startOfUtcDay,
  addUtcDays,
  utcDateKey,
  safeUserHash,
  percentage,
  percentile,
  normalizedWindowDays,
  calculateBetaOperationsSnapshot,
  readBoundedCollection,
  readOperationsCollections,
  registerBeta1OperationsMetrics,
};
