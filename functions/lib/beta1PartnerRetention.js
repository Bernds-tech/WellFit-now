const { FieldPath, FieldValue } = require("firebase-admin/firestore");
const { requireAdmin, normalizedPositiveInteger, optionalString, serverTimestamps } = require("./beta1Runtime");

const PARTNER_RETENTION_PROCESSOR_VERSION = "2026-09-v1";
const DEFAULT_CLEANUP_LIMIT = 50;
const MAX_CLEANUP_LIMIT = 200;
const EXPIRING_COLLECTIONS = [
  "partnerOperationRateLimits",
  "partnerOperationOutcomes",
  "partnerRedemptionChallenges",
];

function pruneExpiredPresentations(value, cutoffMs) {
  const entries = value && typeof value === "object" ? value : {};
  return Object.fromEntries(Object.entries(entries).filter(([, expiresAt]) => Date.parse(expiresAt) > cutoffMs));
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
  EXPIRING_COLLECTIONS,
  pruneExpiredPresentations,
  collectCleanupPlan,
  executeCleanupPlan,
  registerBeta1PartnerRetention,
};
