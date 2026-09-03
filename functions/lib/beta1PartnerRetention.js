const { FieldPath, FieldValue } = require("firebase-admin/firestore");
const { requireAdmin, normalizedPositiveInteger, optionalString, serverTimestamps } = require("./beta1Runtime");

const PARTNER_RETENTION_PROCESSOR_VERSION = "2026-09-v1";
const DEFAULT_CLEANUP_LIMIT = 50;
const MAX_CLEANUP_LIMIT = 200;
const DEFAULT_REPORT_LIMIT = 200;
const MAX_REPORT_LIMIT = 500;
const EXPIRING_COLLECTIONS = [
  "partnerOperationRateLimits",
  "partnerOperationOutcomes",
  "partnerRedemptionChallenges",
];

function pruneExpiredPresentations(value, cutoffMs) {
  const entries = value && typeof value === "object" ? value : {};
  return Object.fromEntries(Object.entries(entries).filter(([, expiresAt]) => Date.parse(expiresAt) > cutoffMs));
}

async function boundedDocuments(db, collectionName, limit) {
  const snapshot = await db.collection(collectionName).limit(limit + 1).get();
  return { documents: snapshot.docs.slice(0, limit), truncated: snapshot.size > limit };
}

function normalizedState(value, allowed) {
  const state = String(value || "unknown");
  return allowed.includes(state) ? state : "other";
}

function incrementMap(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedCounts(map) {
  return [...map.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, count]) => ({ key, count }));
}

async function buildPartnerOperationsSummary(db, limit) {
  const [redemptions, challenges, outcomes] = await Promise.all([
    boundedDocuments(db, "partnerRedemptions", limit),
    boundedDocuments(db, "partnerRedemptionChallenges", limit),
    boundedDocuments(db, "partnerOperationOutcomes", limit),
  ]);
  const redemptionStates = new Map();
  const partnerStates = new Map();
  for (const doc of redemptions.documents) {
    const data = doc.data() || {};
    const partnerId = String(data.partnerId || "unknown").slice(0, 120);
    const state = normalizedState(data.status, ["issued", "redeemed", "cancelled"]);
    incrementMap(redemptionStates, state);
    if (!partnerStates.has(partnerId)) partnerStates.set(partnerId, new Map());
    incrementMap(partnerStates.get(partnerId), state);
  }
  const challengeStates = new Map();
  challenges.documents.forEach((doc) => incrementMap(challengeStates,
    normalizedState((doc.data() || {}).status, ["active", "consumed"])));
  const outcomeCounts = new Map();
  outcomes.documents.forEach((doc) => {
    const data = doc.data() || {};
    const action = normalizedState(data.action, ["partner-presentation-issue", "partner-redemption-confirm"]);
    const outcome = normalizedState(data.outcome, ["accepted", "denied", "invalid-state", "not-found", "rate-limited", "error"]);
    const amount = Math.max(0, Math.min(Number(data.count || 0), 1000000));
    incrementMap(outcomeCounts, `${action}:${outcome}`, Number.isFinite(amount) ? amount : 0);
  });
  return {
    redemptions: {
      scanned: redemptions.documents.length,
      truncated: redemptions.truncated,
      states: sortedCounts(redemptionStates),
      partners: [...partnerStates.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([partnerId, states]) => ({
        partnerId,
        total: [...states.values()].reduce((sum, count) => sum + count, 0),
        states: sortedCounts(states),
      })),
    },
    challenges: { scanned: challenges.documents.length, truncated: challenges.truncated, states: sortedCounts(challengeStates) },
    outcomes: { scanned: outcomes.documents.length, truncated: outcomes.truncated, categories: sortedCounts(outcomeCounts) },
  };
}

async function expiredDocuments(db, collectionName, cutoffIso, limit) {
  if (limit <= 0) return [];
  const snapshot = await db.collection(collectionName)
    .where("expiresAt", "<=", cutoffIso)
    .limit(limit)
    .get();
  return snapshot.docs;
}

async function collectCleanupPlan(db, cutoff, limit, activityAfterId = null) {
  const cutoffIso = cutoff.toISOString();
  const deletions = [];
  const deletionCounts = {};
  let remaining = limit;
  for (const collectionName of EXPIRING_COLLECTIONS) {
    const documents = await expiredDocuments(db, collectionName, cutoffIso, remaining);
    deletionCounts[collectionName] = documents.length;
    documents.forEach((doc) => deletions.push(doc.ref));
    remaining -= documents.length;
  }

  const activityUpdates = [];
  let activityDocumentsScanned = 0;
  let nextActivityAfterId = null;
  let activityScanHasMore = false;
  if (remaining > 0) {
    const scanLimit = Math.min(Math.max(remaining * 3, 20), 600);
    let query = db.collection("partnerChallengeActivity").orderBy(FieldPath.documentId()).limit(scanLimit);
    if (activityAfterId) query = query.startAfter(activityAfterId);
    const snapshot = await query.get();
    activityDocumentsScanned = snapshot.size;
    nextActivityAfterId = snapshot.empty ? null : snapshot.docs[snapshot.docs.length - 1].id;
    activityScanHasMore = snapshot.size === scanLimit;
    for (const doc of snapshot.docs) {
      if (activityUpdates.length >= remaining) break;
      const data = doc.data() || {};
      const current = data.activePresentations && typeof data.activePresentations === "object" ? data.activePresentations : {};
      const pruned = pruneExpiredPresentations(current, cutoff.getTime());
      if (Object.keys(pruned).length !== Object.keys(current).length) {
        activityUpdates.push({ ref: doc.ref, activePresentations: pruned });
      }
    }
  }

  return {
    cutoffIso,
    deletions,
    deletionCounts,
    activityUpdates,
    activityDocumentsScanned,
    nextActivityAfterId,
    activityScanHasMore,
    operationCount: deletions.length + activityUpdates.length,
  };
}

async function executeCleanupPlan(db, plan) {
  if (plan.operationCount === 0) return;
  const batch = db.batch();
  plan.deletions.forEach((ref) => batch.delete(ref));
  plan.activityUpdates.forEach(({ ref, activePresentations }) => {
    if (Object.keys(activePresentations).length === 0) batch.delete(ref);
    else batch.update(ref, { activePresentations, updatedAt: FieldValue.serverTimestamp() });
  });
  await batch.commit();
}

function registerBeta1PartnerRetention(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.adminGetPartnerOperationsSummary = onCall(async (request) => {
    requireAdmin(request, HttpsError);
    const limit = normalizedPositiveInteger((request.data || {}).limit, DEFAULT_REPORT_LIMIT, MAX_REPORT_LIMIT);
    const summary = await buildPartnerOperationsSummary(db, limit);
    return {
      accepted: true,
      generatedAt: new Date().toISOString(),
      perCollectionLimit: limit,
      privacyMode: "aggregate-no-person-or-proof-data",
      ...summary,
    };
  });

  exportsTarget.adminCleanupPartnerOperationalData = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const dryRun = data.dryRun !== false;
    const limit = normalizedPositiveInteger(data.limit, DEFAULT_CLEANUP_LIMIT, MAX_CLEANUP_LIMIT);
    const activityAfterId = optionalString(data.activityAfterId, 240);
    const cutoff = new Date();
    const plan = await collectCleanupPlan(db, cutoff, limit, activityAfterId);

    if (!dryRun) {
      await executeCleanupPlan(db, plan);
      const auditRef = db.collection("adminActions").doc();
      await auditRef.set({
        adminActionId: auditRef.id,
        actorUserId,
        actionType: "partner-operational-retention-cleanup",
        targetType: "partnerOperationalData",
        targetId: PARTNER_RETENTION_PROCESSOR_VERSION,
        reason: "expired-short-lived-records",
        metadata: {
          cutoff: plan.cutoffIso,
          operationCount: plan.operationCount,
          deletionCounts: plan.deletionCounts,
          activityUpdates: plan.activityUpdates.length,
        },
        source: "beta1-runtime",
        refId: auditRef.id,
        ...serverTimestamps(),
      });
    }

    return {
      accepted: true,
      dryRun,
      processorVersion: PARTNER_RETENTION_PROCESSOR_VERSION,
      cutoff: plan.cutoffIso,
      requestedLimit: limit,
      operationCount: plan.operationCount,
      deletionCounts: plan.deletionCounts,
      activityUpdates: plan.activityUpdates.length,
      activityDocumentsScanned: plan.activityDocumentsScanned,
      nextActivityAfterId: plan.nextActivityAfterId,
      activityScanHasMore: plan.activityScanHasMore,
      limitReached: plan.operationCount >= limit,
      redemptionRecordsDeleted: 0,
      auditRecordsDeleted: 0,
    };
  });
}

module.exports = {
  PARTNER_RETENTION_PROCESSOR_VERSION,
  DEFAULT_CLEANUP_LIMIT,
  MAX_CLEANUP_LIMIT,
  DEFAULT_REPORT_LIMIT,
  MAX_REPORT_LIMIT,
  EXPIRING_COLLECTIONS,
  pruneExpiredPresentations,
  buildPartnerOperationsSummary,
  collectCleanupPlan,
  executeCleanupPlan,
  registerBeta1PartnerRetention,
};
