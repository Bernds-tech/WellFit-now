const crypto = require("node:crypto");
const { FieldPath, FieldValue } = require("firebase-admin/firestore");
const {
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
} = require("./beta1Runtime");
const {
  ACCOUNT_LIFECYCLE_VERSION,
  asDate,
  lifecycleRef,
} = require("./beta1AccountLifecyclePolicy");
const {
  DIRECT_DOCUMENT_SECTIONS,
  QUERY_DOCUMENT_SECTIONS,
} = require("./beta1UserDataExport");

const ACCOUNT_DELETION_PROCESSOR_VERSION = "2026-07-24-v1";
const PROCESSING_LEASE_MINUTES = 15;
const DELETE_PAGE_SIZE = 300;
const MAX_DELETE_PAGES = 1000;
const MAX_DUE_BATCH = 20;

const SPECIAL_QUERY_COLLECTIONS = new Set([
  "familyAccounts",
  "childProfiles",
  "auditEvents",
]);

const ADDITIONAL_USER_QUERY_SPECS = [
  { collection: "userDataExportChunks", fields: ["ownerUserId", "userId"] },
  { collection: "checkpointMayors", fields: ["ownerUserId", "userId", "mayorUserId"] },
  { collection: "nfcScanClaims", fields: ["ownerUserId", "userId"] },
  // AuditEvents preserve selected cross-account evidence through explicit anonymization.
  // The duplicate adminActions projection is deleted for both owner and actor scopes.
  { collection: "adminActions", fields: ["ownerUserId", "userId", "targetUserId", "actorUserId"] },
];

const CHILD_SCOPED_COLLECTIONS = [
  "guardianChildLinks",
  "parentalConsents",
  "userAvatars",
  "avatarXpEvents",
  "buddyCareActions",
  "missionBuddyEvents",
  "buddyCapabilities",
  "buddyItemUseEvents",
  "missionAttempts",
  "missionEvidence",
  "missionCompletions",
  "trackingSessions",
  "trackingProofEvents",
  "missionContextEvaluations",
  "missionCompletionEvaluations",
  "missionRewardPreviews",
  "missionEvidenceReviews",
  "missionPatternReviews",
  "missionCooldownReviews",
  "missionRewardEvents",
  "xpWallets",
  "xpLedgerEvents",
  "ledgerEvents",
  "userEconomyProjections",
  "pointsSinkEvents",
  "shopPurchaseIntents",
  "shopPurchaseEvents",
  "partnerRedemptions",
  "userInventory",
  "adventureAccessEvents",
  "checkpointScores",
  "mayorShareEvents",
  "glitchParticipants",
  "glitchBoostWindows",
  "nfcScanEvents",
  "nfcScanClaims",
  "capabilityUnlockEvents",
  "safetyReports",
  "auditEvents",
];

const EXTERNAL_STORAGE_FIELDS = [
  "storagePath",
  "mediaStoragePath",
  "uploadPath",
  "rawMediaStoragePath",
  "imageStoragePath",
  "videoStoragePath",
];

function deletionTombstoneRef(db, tombstoneId) {
  return db.collection("accountDeletionTombstones").doc(tombstoneId);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function deletionIsDue(lifecycle, now = new Date()) {
  const scheduledFor = asDate(lifecycle && lifecycle.deletionScheduledFor);
  return Boolean(scheduledFor && scheduledFor.getTime() <= now.getTime());
}

function leaseIsActive(lifecycle, now = new Date()) {
  const expiresAt = asDate(lifecycle && lifecycle.processingLeaseExpiresAt);
  return Boolean(
    lifecycle
    && lifecycle.status === "deletion-processing"
    && expiresAt
    && expiresAt.getTime() > now.getTime()
  );
}

function safeCountMap() {
  return Object.create(null);
}

function addCount(counts, collection, amount) {
  if (!amount) return;
  counts[collection] = Number(counts[collection] || 0) + Number(amount);
}

async function queryAllByField(db, collection, field, operator, value, maxDocs = Number.POSITIVE_INFINITY) {
  const docs = [];
  let cursor = null;
  for (let page = 0; page < MAX_DELETE_PAGES && docs.length < maxDocs; page += 1) {
    const limit = Math.min(DELETE_PAGE_SIZE, maxDocs - docs.length);
    let query = db.collection(collection)
      .where(field, operator, value)
      .orderBy(FieldPath.documentId())
      .limit(limit);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    docs.push(...snapshot.docs);
    if (snapshot.size < limit) return docs;
    cursor = snapshot.docs[snapshot.docs.length - 1];
  }
  if (docs.length >= maxDocs) return docs;
  throw new Error(`Deletion query exceeded page limit: ${collection}.${field}`);
}

async function collectDocumentsForSpec(db, userId, spec) {
  const docs = new Map();
  for (const field of spec.fields || []) {
    const matches = await queryAllByField(db, spec.collection, field, "==", userId);
    matches.forEach((doc) => docs.set(doc.ref.path, doc));
  }
  for (const field of spec.arrayFields || []) {
    const matches = await queryAllByField(db, spec.collection, field, "array-contains", userId);
    matches.forEach((doc) => docs.set(doc.ref.path, doc));
  }
  return [...docs.values()];
}

async function deleteDocumentRefs(db, docs, dryRun) {
  if (dryRun || docs.length === 0) return docs.length;
  for (let offset = 0; offset < docs.length; offset += DELETE_PAGE_SIZE) {
    const batch = db.batch();
    docs.slice(offset, offset + DELETE_PAGE_SIZE).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  return docs.length;
}

async function deleteDirectDocuments(db, userId, dryRun, counts) {
  const directCollections = [
    ...new Set([
      ...DIRECT_DOCUMENT_SECTIONS.map((spec) => spec.collection),
      "userDataExportJobs",
    ]),
  ].filter((collection) => collection !== "accountLifecycleRecords");

  const snapshots = await Promise.all(
    directCollections.map((collection) => db.collection(collection).doc(userId).get()),
  );
  const existing = snapshots.filter((snapshot) => snapshot.exists);
  existing.forEach((snapshot) => addCount(counts, snapshot.ref.parent.id, 1));
  if (!dryRun && existing.length > 0) {
    const batch = db.batch();
    existing.forEach((snapshot) => batch.delete(snapshot.ref));
    await batch.commit();
  }
}

async function childDependencies(db, userId) {
  const children = await queryAllByField(db, "childProfiles", "guardianUserIds", "array-contains", userId, 1000);
  const active = children.filter((doc) => {
    const status = optionalString((doc.data() || {}).status, 80);
    return !status || status === "active";
  });
  const soleGuardianActive = active.filter((doc) => {
    const guardians = Array.isArray((doc.data() || {}).guardianUserIds)
      ? (doc.data() || {}).guardianUserIds.filter(Boolean)
      : [];
    return guardians.length <= 1 && guardians.includes(userId);
  });
  return { children, active, soleGuardianActive };
}

async function deleteChildScopedDocuments(db, childProfileId, dryRun, counts) {
  for (const collection of CHILD_SCOPED_COLLECTIONS) {
    const docs = await queryAllByField(db, collection, "childProfileId", "==", childProfileId);
    addCount(counts, collection, docs.length);
    await deleteDocumentRefs(db, docs, dryRun);
  }
}

async function detachFamilyDependencies(db, userId, dryRun, counts) {
  const dependencies = await childDependencies(db, userId);
  if (dependencies.soleGuardianActive.length > 0) {
    const error = new Error("sole-guardian-active-child");
    error.code = "sole-guardian-active-child";
    error.childProfileIds = dependencies.soleGuardianActive.map((doc) => doc.id).slice(0, 20);
    throw error;
  }

  const removedChildIds = new Set();
  for (const childSnapshot of dependencies.children) {
    const child = childSnapshot.data() || {};
    const guardians = Array.isArray(child.guardianUserIds) ? child.guardianUserIds.filter(Boolean) : [];
    const remainingGuardians = guardians.filter((guardianId) => guardianId !== userId);
    const active = !child.status || child.status === "active";
    if (remainingGuardians.length > 0) {
      addCount(counts, "childProfiles:guardian-detach", 1);
      if (!dryRun) {
        await childSnapshot.ref.update({
          guardianUserIds: remainingGuardians,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (!active) {
      await deleteChildScopedDocuments(db, childSnapshot.id, dryRun, counts);
      removedChildIds.add(childSnapshot.id);
      addCount(counts, "childProfiles", 1);
      if (!dryRun) await childSnapshot.ref.delete();
    }
  }

  const familySnapshots = await queryAllByField(db, "familyAccounts", "guardianUserIds", "array-contains", userId);
  for (const familySnapshot of familySnapshots) {
    const family = familySnapshot.data() || {};
    const guardians = Array.isArray(family.guardianUserIds) ? family.guardianUserIds.filter(Boolean) : [];
    const childProfileIds = Array.isArray(family.childProfileIds) ? family.childProfileIds.filter(Boolean) : [];
    const nextGuardians = guardians.filter((guardianId) => guardianId !== userId);
    const nextChildren = childProfileIds.filter((childId) => !removedChildIds.has(childId));
    if (nextGuardians.length === 0 && nextChildren.length === 0) {
      addCount(counts, "familyAccounts", 1);
      if (!dryRun) await familySnapshot.ref.delete();
    } else {
      addCount(counts, "familyAccounts:guardian-detach", 1);
      if (!dryRun) {
        await familySnapshot.ref.update({
          guardianUserIds: nextGuardians,
          childProfileIds: nextChildren,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  }

  return {
    activeChildProfiles: dependencies.active.length,
    detachedChildProfiles: dependencies.children.length - removedChildIds.size,
    deletedArchivedChildProfiles: removedChildIds.size,
    familyAccountsTouched: familySnapshots.length,
  };
}

function externalStoragePathsFromData(data) {
  const paths = [];
  for (const field of EXTERNAL_STORAGE_FIELDS) {
    const value = data && data[field];
    if (typeof value === "string" && value.trim()) paths.push(value.trim());
  }
  const nested = data && typeof data.metadata === "object" && data.metadata && !Array.isArray(data.metadata)
    ? data.metadata
    : null;
  if (nested) {
    for (const field of EXTERNAL_STORAGE_FIELDS) {
      const value = nested[field];
      if (typeof value === "string" && value.trim()) paths.push(value.trim());
    }
  }
  return [...new Set(paths)];
}

async function findExternalStorageReferences(db, userId) {
  const docs = await collectDocumentsForSpec(db, userId, {
    collection: "missionEvidence",
    fields: ["ownerUserId", "userId"],
  });
  return docs.flatMap((doc) => externalStoragePathsFromData(doc.data() || {})).slice(0, 100);
}

async function deleteGenericUserDocuments(db, userId, dryRun, counts) {
  const specs = [
    ...QUERY_DOCUMENT_SECTIONS
      .filter((spec) => !SPECIAL_QUERY_COLLECTIONS.has(spec.collection))
      .map((spec) => ({ ...spec })),
    ...ADDITIONAL_USER_QUERY_SPECS,
  ];
  const byCollection = new Map();
  for (const spec of specs) {
    const existing = byCollection.get(spec.collection) || { collection: spec.collection, fields: [], arrayFields: [] };
    existing.fields = [...new Set([...(existing.fields || []), ...(spec.fields || [])])];
    existing.arrayFields = [...new Set([...(existing.arrayFields || []), ...(spec.arrayFields || [])])];
    byCollection.set(spec.collection, existing);
  }

  for (const spec of byCollection.values()) {
    const docs = await collectDocumentsForSpec(db, userId, spec);
    addCount(counts, spec.collection, docs.length);
    await deleteDocumentRefs(db, docs, dryRun);
  }
}

async function deleteAndAnonymizeAuditEvents(db, userId, tombstoneId, dryRun, counts) {
  const owned = new Map();
  for (const field of ["ownerUserId", "userId"]) {
    const docs = await queryAllByField(db, "auditEvents", field, "==", userId);
    docs.forEach((doc) => owned.set(doc.ref.path, doc));
  }
  addCount(counts, "auditEvents:deleted", owned.size);
  await deleteDocumentRefs(db, [...owned.values()], dryRun);

  const acted = await queryAllByField(db, "auditEvents", "actorUserId", "==", userId);
  const remaining = acted.filter((doc) => !owned.has(doc.ref.path));
  addCount(counts, "auditEvents:actor-anonymized", remaining.length);
  if (!dryRun) {
    for (let offset = 0; offset < remaining.length; offset += DELETE_PAGE_SIZE) {
      const batch = db.batch();
      remaining.slice(offset, offset + DELETE_PAGE_SIZE).forEach((doc) => {
        batch.update(doc.ref, {
          actorUserId: "deleted-user",
          actorDeleted: true,
          actorDeletionTombstoneId: tombstoneId,
          metadata: {
            actorDeleted: true,
            originalMetadataRemoved: true,
          },
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }
  }
}

async function setProcessingPhase(ref, leaseId, phase, extra = {}) {
  await ref.set({
    status: "deletion-processing",
    freezeMutations: true,
    processingLeaseId: leaseId,
    processingPhase: phase,
    lastProcessorHeartbeatAt: new Date().toISOString(),
    updatedAt: FieldValue.serverTimestamp(),
    ...extra,
  }, { merge: true });
}

async function acquireProcessingLease(db, userId, actorUserId, HttpsError) {
  const ref = lifecycleRef(db, userId);
  const now = new Date();
  const leaseId = crypto.randomUUID();
  const leaseExpiresAt = addMinutes(now, PROCESSING_LEASE_MINUTES);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError("not-found", "Kein Loeschantrag fuer dieses Konto gefunden.");
    const lifecycle = snapshot.data() || {};
    if (lifecycle.status === "deleted") {
      return { completed: true, lifecycle: { lifecycleId: ref.id, ...lifecycle } };
    }
    if (!["deletion-pending", "deletion-processing", "deletion-blocked"].includes(lifecycle.status)) {
      throw new HttpsError("failed-precondition", "Das Konto ist nicht zur Loeschung vorgemerkt.");
    }
    if (!deletionIsDue(lifecycle, now)) {
      throw new HttpsError("failed-precondition", "Die Karenzzeit ist noch nicht abgelaufen.");
    }
    if (leaseIsActive(lifecycle, now)) {
      throw new HttpsError("aborted", "Ein anderer Loeschprozessor bearbeitet dieses Konto bereits.");
    }
    const tombstoneId = optionalString(lifecycle.deletionTombstoneId, 180) || crypto.randomUUID();
    transaction.set(ref, {
      status: "deletion-processing",
      freezeMutations: true,
      lifecycleVersion: lifecycle.lifecycleVersion || ACCOUNT_LIFECYCLE_VERSION,
      deletionProcessorVersion: ACCOUNT_DELETION_PROCESSOR_VERSION,
      deletionTombstoneId: tombstoneId,
      processingLeaseId: leaseId,
      processingLeaseExpiresAt: leaseExpiresAt.toISOString(),
      processingAttempt: Number(lifecycle.processingAttempt || 0) + 1,
      processingStartedAt: lifecycle.processingStartedAt || now.toISOString(),
      processingPhase: "lease-acquired",
      processorActorType: "admin-authorized-callable",
      processorActorHash: crypto.createHash("sha256").update(String(actorUserId)).digest("hex"),
      lastProcessorHeartbeatAt: now.toISOString(),
      lastProcessingError: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return {
      completed: false,
      ref,
      lifecycle: { lifecycleId: ref.id, ...lifecycle },
      leaseId,
      leaseExpiresAt,
      tombstoneId,
    };
  });
}

async function releaseLeaseAfterFailure(ref, error) {
  const blockedCodes = new Set([
    "sole-guardian-active-child",
    "external-storage-cleanup-required",
  ]);
  try {
    await ref.set({
      status: blockedCodes.has(error && error.code) ? "deletion-blocked" : "deletion-processing",
      freezeMutations: true,
      processingLeaseId: null,
      processingLeaseExpiresAt: new Date(0).toISOString(),
      lastProcessingError: optionalString(error && (error.code || error.message), 180) || "account-deletion-failed",
      lastProcessingErrorAt: new Date().toISOString(),
      blockedChildProfileIds: Array.isArray(error && error.childProfileIds) ? error.childProfileIds.slice(0, 20) : [],
      blockedExternalStorageReferenceCount: Number(error && error.externalStorageReferenceCount || 0),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (releaseError) {
    console.error("Unable to release account deletion lease", releaseError);
  }
}

async function loadLifecycleForPreview(db, userId, HttpsError) {
  const snapshot = await lifecycleRef(db, userId).get();
  if (!snapshot.exists) throw new HttpsError("not-found", "Kein Loeschantrag fuer dieses Konto gefunden.");
  return { lifecycleId: snapshot.id, ...(snapshot.data() || {}) };
}

async function prepareDeletionPreflight(db, userId) {
  const [dependencies, externalStorageReferences] = await Promise.all([
    childDependencies(db, userId),
    findExternalStorageReferences(db, userId),
  ]);
  return {
    dependencies,
    blockingChildProfileIds: dependencies.soleGuardianActive.map((doc) => doc.id).slice(0, 20),
    externalStorageReferences,
  };
}

async function disableAccountBeforeDeletion(authAdmin, userId) {
  let authUserAlreadyMissing = false;
  try {
    await authAdmin.revokeRefreshTokens(userId);
    await authAdmin.updateUser(userId, { disabled: true });
  } catch (error) {
    if (error && error.code === "auth/user-not-found") authUserAlreadyMissing = true;
    else throw error;
  }
  return { authUserAlreadyMissing };
}

async function processAccountDeletion({ db, authAdmin, userId, actorUserId, dryRun, HttpsError }) {
  const previewLifecycle = await loadLifecycleForPreview(db, userId, HttpsError);
  if (!["deletion-pending", "deletion-processing", "deletion-blocked"].includes(previewLifecycle.status)) {
    throw new HttpsError("failed-precondition", "Das Konto ist nicht zur Loeschung vorgemerkt.");
  }
  const due = deletionIsDue(previewLifecycle);
  if (!due && !dryRun) throw new HttpsError("failed-precondition", "Die Karenzzeit ist noch nicht abgelaufen.");

  const counts = safeCountMap();
  const previewPreflight = await prepareDeletionPreflight(db, userId);

  if (dryRun) {
    if (
      previewPreflight.blockingChildProfileIds.length === 0
      && previewPreflight.externalStorageReferences.length === 0
    ) {
      await detachFamilyDependencies(db, userId, true, counts);
      await deleteGenericUserDocuments(db, userId, true, counts);
      await deleteAndAnonymizeAuditEvents(db, userId, "dry-run", true, counts);
      await deleteDirectDocuments(db, userId, true, counts);
    }
    return {
      accepted: true,
      dryRun: true,
      userId,
      due,
      eligible: due
        && previewPreflight.blockingChildProfileIds.length === 0
        && previewPreflight.externalStorageReferences.length === 0,
      lifecycleStatus: previewLifecycle.status,
      blockingChildProfileIds: previewPreflight.blockingChildProfileIds,
      externalStorageReferenceCount: previewPreflight.externalStorageReferences.length,
      collectionCounts: { ...counts },
      authDisablePlanned: true,
      authDeletionPlanned: true,
      tombstonePlanned: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  }

  const lease = await acquireProcessingLease(db, userId, actorUserId, HttpsError);
  if (lease.completed) {
    return {
      accepted: true,
      dryRun: false,
      idempotent: true,
      status: "deleted",
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  }

  try {
    // Re-evaluate all blockers after the transactionally acquired lease. This closes
    // the race between the preflight preview and irreversible processing.
    const processingPreflight = await prepareDeletionPreflight(db, userId);
    if (processingPreflight.blockingChildProfileIds.length > 0) {
      const error = new Error("sole-guardian-active-child");
      error.code = "sole-guardian-active-child";
      error.childProfileIds = processingPreflight.blockingChildProfileIds;
      throw error;
    }
    if (processingPreflight.externalStorageReferences.length > 0) {
      const error = new Error("external-storage-cleanup-required");
      error.code = "external-storage-cleanup-required";
      error.externalStorageReferenceCount = processingPreflight.externalStorageReferences.length;
      throw error;
    }

    await setProcessingPhase(lease.ref, lease.leaseId, "auth-disabled");
    const authState = await disableAccountBeforeDeletion(authAdmin, userId);

    await setProcessingPhase(lease.ref, lease.leaseId, "family-dependencies");
    const familyResult = await detachFamilyDependencies(db, userId, false, counts);

    await setProcessingPhase(lease.ref, lease.leaseId, "user-scoped-documents");
    await deleteGenericUserDocuments(db, userId, false, counts);

    await setProcessingPhase(lease.ref, lease.leaseId, "audit-anonymization");
    await deleteAndAnonymizeAuditEvents(db, userId, lease.tombstoneId, false, counts);

    await setProcessingPhase(lease.ref, lease.leaseId, "direct-account-documents");
    await deleteDirectDocuments(db, userId, false, counts);

    await setProcessingPhase(lease.ref, lease.leaseId, "firebase-auth-deletion", {
      deletedCollectionCounts: { ...counts },
    });
    try {
      await authAdmin.deleteUser(userId);
    } catch (error) {
      if (!(error && error.code === "auth/user-not-found")) throw error;
      authState.authUserAlreadyMissing = true;
    }

    const completedAt = new Date().toISOString();
    const tombstone = {
      deletionTombstoneId: lease.tombstoneId,
      status: "deleted",
      deletionProcessorVersion: ACCOUNT_DELETION_PROCESSOR_VERSION,
      deletionPolicyVersion: previewLifecycle.deletionPolicyVersion || ACCOUNT_LIFECYCLE_VERSION,
      completedAt,
      deletedCollectionCounts: { ...counts },
      familyResult,
      sessionsRevokedBeforeDeletion: true,
      authDisabledBeforeDeletion: !authState.authUserAlreadyMissing,
      authDeleted: true,
      authUserAlreadyMissing: authState.authUserAlreadyMissing,
      externalStorageReferenceCount: 0,
      originalUserIdentifierStored: false,
      originalEmailStored: false,
      originalHealthDataStored: false,
      tokenTransferCreated: false,
      cashoutCreated: false,
      realMoneyCreated: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await db.runTransaction(async (transaction) => {
      const latestLifecycle = await transaction.get(lease.ref);
      if (!latestLifecycle.exists) {
        throw new Error("account-lifecycle-missing-before-tombstone");
      }
      const latest = latestLifecycle.data() || {};
      if (latest.processingLeaseId !== lease.leaseId) {
        throw new Error("account-deletion-lease-lost");
      }
      transaction.set(deletionTombstoneRef(db, lease.tombstoneId), tombstone);
      transaction.delete(lease.ref);
    });

    return {
      accepted: true,
      dryRun: false,
      idempotent: false,
      status: "deleted",
      deletionTombstoneId: lease.tombstoneId,
      completedAt,
      deletedCollectionCounts: { ...counts },
      familyResult,
      authDeleted: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  } catch (error) {
    await releaseLeaseAfterFailure(lease.ref, error);
    if (error && error.code === "sole-guardian-active-child") {
      throw new HttpsError("failed-precondition", "Die Loeschung ist blockiert, weil das Konto noch alleiniger Guardian eines aktiven Kinderprofils ist.");
    }
    if (error && error.code === "external-storage-cleanup-required") {
      throw new HttpsError("failed-precondition", "Die Loeschung ist blockiert, bis referenzierte Mediendateien sicher entfernt werden koennen.");
    }
    console.error("Account deletion processor failed", error);
    throw new HttpsError("internal", "Der Loeschprozessor wurde sicher angehalten und kann wiederholt werden.");
  }
}

async function dueLifecycleCandidates(db, limit) {
  const now = new Date();
  const results = new Map();
  for (const status of ["deletion-pending", "deletion-processing", "deletion-blocked"]) {
    const snapshot = await db.collection("accountLifecycleRecords")
      .where("status", "==", status)
      .limit(Math.max(limit * 3, 20))
      .get();
    snapshot.docs.forEach((doc) => {
      const lifecycle = { lifecycleId: doc.id, ...(doc.data() || {}) };
      const retryable = status !== "deletion-processing" || !leaseIsActive(lifecycle, now);
      if (deletionIsDue(lifecycle, now) && retryable) results.set(doc.id, lifecycle);
    });
  }
  return [...results.values()]
    .sort((left, right) => {
      const leftTime = asDate(left.deletionScheduledFor)?.getTime() || 0;
      const rightTime = asDate(right.deletionScheduledFor)?.getTime() || 0;
      return leftTime - rightTime;
    })
    .slice(0, limit);
}

function registerBeta1AccountDeletionProcessor(exportsTarget, { db, authAdmin, onCall, HttpsError }) {
  exportsTarget.adminPreviewDueAccountDeletions = onCall(async (request) => {
    requireAdmin(request, HttpsError);
    const limit = normalizedPositiveInteger((request.data || {}).limit, 10, MAX_DUE_BATCH);
    const candidates = await dueLifecycleCandidates(db, limit);
    return {
      accepted: true,
      dryRun: true,
      processorVersion: ACCOUNT_DELETION_PROCESSOR_VERSION,
      candidates: candidates.map((lifecycle) => ({
        userId: lifecycle.lifecycleId,
        status: lifecycle.status,
        deletionScheduledFor: asDate(lifecycle.deletionScheduledFor)?.toISOString() || null,
        processingPhase: optionalString(lifecycle.processingPhase, 80),
      })),
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });

  exportsTarget.adminProcessAccountDeletion = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const userId = requiredString(data.userId, "userId", HttpsError, 180);
    return processAccountDeletion({
      db,
      authAdmin,
      userId,
      actorUserId,
      dryRun: data.dryRun !== false,
      HttpsError,
    });
  });

  exportsTarget.adminProcessDueAccountDeletions = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const limit = normalizedPositiveInteger(data.limit, 5, MAX_DUE_BATCH);
    const dryRun = data.dryRun !== false;
    const candidates = await dueLifecycleCandidates(db, limit);
    const results = [];
    for (const lifecycle of candidates) {
      try {
        results.push(await processAccountDeletion({
          db,
          authAdmin,
          userId: lifecycle.lifecycleId,
          actorUserId,
          dryRun,
          HttpsError,
        }));
      } catch (error) {
        results.push({
          accepted: false,
          userId: lifecycle.lifecycleId,
          status: "failed",
          errorCode: optionalString(error && error.code, 120) || "account-deletion-failed",
          errorMessage: optionalString(error && error.message, 240) || "Account deletion failed.",
        });
      }
    }
    return {
      accepted: true,
      dryRun,
      processorVersion: ACCOUNT_DELETION_PROCESSOR_VERSION,
      candidateCount: candidates.length,
      results,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });
}

module.exports = {
  ACCOUNT_DELETION_PROCESSOR_VERSION,
  PROCESSING_LEASE_MINUTES,
  DELETE_PAGE_SIZE,
  MAX_DUE_BATCH,
  ADDITIONAL_USER_QUERY_SPECS,
  CHILD_SCOPED_COLLECTIONS,
  deletionIsDue,
  leaseIsActive,
  childDependencies,
  findExternalStorageReferences,
  processAccountDeletion,
  dueLifecycleCandidates,
  registerBeta1AccountDeletionProcessor,
};
