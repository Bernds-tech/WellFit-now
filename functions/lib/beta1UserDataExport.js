const { FieldPath, FieldValue } = require("firebase-admin/firestore");
const {
  ACCOUNT_EXPORT_VERSION,
  ACCOUNT_EXPORT_EXPIRY_HOURS,
  addHours,
  asDate,
  requireRecentAuth,
  safeDocIdPart,
  serializeFirestoreValue,
  sha256,
} = require("./beta1AccountLifecyclePolicy");
const { requireAuth, optionalString, writeAudit } = require("./beta1Runtime");

const EXPORT_PAGE_SIZE = 200;
const MAX_EXPORT_DOCS_PER_COLLECTION = 2000;
const EXPORT_CHUNK_TARGET_BYTES = 420000;
const MAX_EXPORT_CHUNKS = 160;

const DIRECT_DOCUMENT_SECTIONS = [
  { section: "account-profile", collection: "users" },
  { section: "onboarding", collection: "userOnboardingRecords" },
  { section: "private-profile", collection: "userPrivateProfiles" },
  { section: "calendar-settings", collection: "userCalendarSettings" },
  { section: "daily-streak", collection: "userDailyStreaks" },
  { section: "legacy-level", collection: "userLevels" },
  { section: "account-lifecycle", collection: "accountLifecycleRecords" },
  { section: "location-query-budget", collection: "locationQueryBudgets" },
];

const QUERY_DOCUMENT_SECTIONS = [
  { section: "consent-history", collection: "userConsentEvents", fields: ["userId", "ownerUserId"] },
  { section: "family-accounts", collection: "familyAccounts", arrayFields: ["guardianUserIds"] },
  { section: "child-profiles", collection: "childProfiles", arrayFields: ["guardianUserIds"] },
  { section: "guardian-child-links", collection: "guardianChildLinks", fields: ["guardianUserId"] },
  { section: "parental-consents", collection: "parentalConsents", fields: ["guardianUserId"] },
  { section: "avatars", collection: "userAvatars", fields: ["ownerUserId", "userId"] },
  { section: "avatar-xp-events", collection: "avatarXpEvents", fields: ["ownerUserId", "userId"] },
  { section: "buddy-actions", collection: "buddyCareActions", fields: ["ownerUserId", "userId"] },
  { section: "buddy-events", collection: "missionBuddyEvents", fields: ["ownerUserId", "userId"] },
  { section: "buddy-capabilities", collection: "buddyCapabilities", fields: ["ownerUserId", "userId"] },
  { section: "buddy-item-use-events", collection: "buddyItemUseEvents", fields: ["ownerUserId", "userId"] },
  { section: "mission-attempts", collection: "missionAttempts", fields: ["ownerUserId", "userId"] },
  { section: "mission-evidence", collection: "missionEvidence", fields: ["ownerUserId", "userId"] },
  { section: "mission-completions", collection: "missionCompletions", fields: ["ownerUserId", "userId"] },
  { section: "daily-mission-state", collection: "userDailyMissionState", fields: ["ownerUserId", "userId"] },
  { section: "tracking-sessions", collection: "trackingSessions", fields: ["ownerUserId", "userId"] },
  { section: "tracking-proof-events", collection: "trackingProofEvents", fields: ["ownerUserId", "userId"] },
  { section: "mission-context-evaluations", collection: "missionContextEvaluations", fields: ["ownerUserId", "userId"] },
  { section: "mission-completion-evaluations", collection: "missionCompletionEvaluations", fields: ["ownerUserId", "userId"] },
  { section: "mission-reward-previews", collection: "missionRewardPreviews", fields: ["ownerUserId", "userId"] },
  { section: "mission-evidence-reviews", collection: "missionEvidenceReviews", fields: ["ownerUserId", "userId"] },
  { section: "mission-pattern-reviews", collection: "missionPatternReviews", fields: ["ownerUserId", "userId"] },
  { section: "mission-cooldown-reviews", collection: "missionCooldownReviews", fields: ["ownerUserId", "userId"] },
  { section: "mission-reward-events", collection: "missionRewardEvents", fields: ["ownerUserId", "userId"] },
  { section: "wfxp-wallets", collection: "xpWallets", fields: ["ownerUserId", "userId"] },
  { section: "wfxp-ledger", collection: "xpLedgerEvents", fields: ["ownerUserId", "userId"] },
  { section: "legacy-ledger", collection: "ledgerEvents", fields: ["ownerUserId", "userId"] },
  { section: "economy-projections", collection: "userEconomyProjections", fields: ["ownerUserId", "userId"] },
  { section: "points-sink-events", collection: "pointsSinkEvents", fields: ["ownerUserId", "userId"] },
  { section: "shop-purchase-intents", collection: "shopPurchaseIntents", fields: ["ownerUserId", "userId"] },
  { section: "shop-purchase-events", collection: "shopPurchaseEvents", fields: ["ownerUserId", "userId"] },
  { section: "inventory", collection: "userInventory", fields: ["ownerUserId", "userId"] },
  { section: "adventure-access", collection: "adventureAccessEvents", fields: ["ownerUserId", "userId"] },
  { section: "checkpoint-scores", collection: "checkpointScores", fields: ["ownerUserId", "userId"] },
  { section: "mayor-share-events", collection: "mayorShareEvents", fields: ["mayorUserId", "ownerUserId", "userId"] },
  { section: "glitch-participation", collection: "glitchParticipants", fields: ["ownerUserId", "userId"] },
  { section: "glitch-boost-windows", collection: "glitchBoostWindows", fields: ["ownerUserId", "userId"] },
  { section: "nfc-scan-events", collection: "nfcScanEvents", fields: ["ownerUserId", "userId"] },
  { section: "capability-unlock-events", collection: "capabilityUnlockEvents", fields: ["ownerUserId", "userId"] },
  { section: "safety-reports", collection: "safetyReports", fields: ["reporterUserId", "ownerUserId", "userId"] },
  { section: "audit-events", collection: "auditEvents", fields: ["ownerUserId", "userId", "actorUserId"] },
];

function exportJobRef(db, userId) {
  return db.collection("userDataExportJobs").doc(userId);
}

function chunkId(userId, index) {
  return `${safeDocIdPart(userId)}__${String(index).padStart(4, "0")}`;
}

function exportChunkRef(db, userId, index) {
  return db.collection("userDataExportChunks").doc(chunkId(userId, index));
}

function documentExport(doc) {
  return {
    documentId: doc.id,
    data: serializeFirestoreValue(doc.data() || {}),
  };
}

async function readQueryPages(query, maxDocs = MAX_EXPORT_DOCS_PER_COLLECTION) {
  const documents = [];
  let cursor = null;
  let truncated = false;
  while (documents.length < maxDocs) {
    const pageLimit = Math.min(EXPORT_PAGE_SIZE, maxDocs - documents.length);
    let pageQuery = query.orderBy(FieldPath.documentId()).limit(pageLimit);
    if (cursor) pageQuery = pageQuery.startAfter(cursor);
    const snapshot = await pageQuery.get();
    documents.push(...snapshot.docs);
    if (snapshot.size < pageLimit) break;
    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (documents.length >= maxDocs) truncated = true;
  }
  return { documents, truncated };
}

async function readDirectSection(db, userId, spec) {
  const snapshot = await db.collection(spec.collection).doc(userId).get();
  return {
    section: spec.section,
    collection: spec.collection,
    items: snapshot.exists ? [documentExport(snapshot)] : [],
    truncated: false,
  };
}

async function readQuerySection(db, userId, spec) {
  const documents = new Map();
  let truncated = false;
  for (const field of spec.fields || []) {
    const result = await readQueryPages(db.collection(spec.collection).where(field, "==", userId));
    result.documents.forEach((doc) => documents.set(doc.id, doc));
    truncated = truncated || result.truncated;
  }
  for (const field of spec.arrayFields || []) {
    const result = await readQueryPages(db.collection(spec.collection).where(field, "array-contains", userId));
    result.documents.forEach((doc) => documents.set(doc.id, doc));
    truncated = truncated || result.truncated;
  }
  return {
    section: spec.section,
    collection: spec.collection,
    items: [...documents.values()].sort((left, right) => left.id.localeCompare(right.id)).map(documentExport),
    truncated,
  };
}

async function readFirebaseAuthSection(authAdmin, userId) {
  const user = await authAdmin.getUser(userId);
  return {
    section: "firebase-auth-account",
    collection: "firebase-auth",
    items: [{
      documentId: user.uid,
      data: {
        uid: user.uid,
        email: user.email || null,
        emailVerified: user.emailVerified === true,
        displayName: user.displayName || null,
        phoneNumber: user.phoneNumber || null,
        disabled: user.disabled === true,
        providerIds: (user.providerData || []).map((provider) => provider.providerId).filter(Boolean),
        createdAt: user.metadata && user.metadata.creationTime ? user.metadata.creationTime : null,
        lastSignInAt: user.metadata && user.metadata.lastSignInTime ? user.metadata.lastSignInTime : null,
      },
    }],
    truncated: false,
  };
}

async function collectExportSections(db, authAdmin, userId) {
  const [authSection, directSections, querySections] = await Promise.all([
    readFirebaseAuthSection(authAdmin, userId),
    Promise.all(DIRECT_DOCUMENT_SECTIONS.map((spec) => readDirectSection(db, userId, spec))),
    Promise.all(QUERY_DOCUMENT_SECTIONS.map((spec) => readQuerySection(db, userId, spec))),
  ]);
  return [authSection, ...directSections, ...querySections];
}

function splitSectionIntoChunks(section) {
  const chunks = [];
  let currentItems = [];
  const flush = () => {
    if (currentItems.length === 0 && chunks.length > 0) return;
    chunks.push({
      section: section.section,
      collection: section.collection,
      truncated: section.truncated === true,
      items: currentItems,
    });
    currentItems = [];
  };

  if (section.items.length === 0) {
    flush();
  } else {
    for (const item of section.items) {
      const candidate = {
        section: section.section,
        collection: section.collection,
        truncated: section.truncated === true,
        items: [...currentItems, item],
      };
      if (Buffer.byteLength(JSON.stringify(candidate), "utf8") > EXPORT_CHUNK_TARGET_BYTES && currentItems.length > 0) {
        flush();
      }
      currentItems.push(item);
    }
    flush();
  }

  return chunks.map((chunk, partIndex) => ({
    ...chunk,
    partIndex,
    partCount: chunks.length,
  }));
}

function buildExportChunks({ userId, generatedAt, expiresAt, sections }) {
  const sectionCounts = Object.fromEntries(sections.map((section) => [section.section, section.items.length]));
  const truncatedSections = sections.filter((section) => section.truncated).map((section) => section.section);
  const totalDocuments = sections.reduce((sum, section) => sum + section.items.length, 0);
  const manifest = {
    section: "manifest",
    collection: null,
    partIndex: 0,
    partCount: 1,
    truncated: truncatedSections.length > 0,
    items: [{
      documentId: "manifest",
      data: {
        exportVersion: ACCOUNT_EXPORT_VERSION,
        ownerUserId: userId,
        generatedAt: generatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        sectionCounts,
        truncatedSections,
        totalDocuments,
        format: "wellfit-user-data-export-json-v1",
        noTokenTransfer: true,
        noCashout: true,
      },
    }],
  };
  const chunks = [manifest, ...sections.flatMap(splitSectionIntoChunks)];
  if (chunks.length > MAX_EXPORT_CHUNKS) {
    const error = new Error("account-export-too-large");
    error.code = "account-export-too-large";
    throw error;
  }
  return { chunks, sectionCounts, truncatedSections, totalDocuments };
}

async function deleteExistingChunks(db, userId) {
  while (true) {
    const snapshot = await db.collection("userDataExportChunks")
      .where("ownerUserId", "==", userId)
      .limit(400)
      .get();
    if (snapshot.empty) return;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function writeChunks(db, userId, jobId, chunks, generatedAt, expiresAt) {
  for (let offset = 0; offset < chunks.length; offset += 350) {
    const batch = db.batch();
    chunks.slice(offset, offset + 350).forEach((chunk, localIndex) => {
      const index = offset + localIndex;
      const payloadJson = JSON.stringify(chunk);
      batch.set(exportChunkRef(db, userId, index), {
        exportChunkId: chunkId(userId, index),
        jobId,
        ownerUserId: userId,
        userId,
        index,
        totalChunks: chunks.length,
        section: chunk.section,
        partIndex: chunk.partIndex,
        partCount: chunk.partCount,
        itemCount: chunk.items.length,
        payloadJson,
        payloadSha256: sha256(payloadJson),
        generatedAt: generatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        exportVersion: ACCOUNT_EXPORT_VERSION,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }
}

function publicExportJob(job) {
  if (!job) {
    return {
      status: "not-requested",
      ready: false,
      totalChunks: 0,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  }
  const expiresAt = asDate(job.expiresAt)?.toISOString() || optionalString(job.expiresAt, 80);
  const expired = Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());
  return {
    jobId: optionalString(job.jobId, 180) || null,
    status: expired && job.status === "ready" ? "expired" : optionalString(job.status, 80) || "not-requested",
    ready: job.status === "ready" && !expired,
    generatedAt: asDate(job.generatedAt)?.toISOString() || optionalString(job.generatedAt, 80),
    expiresAt,
    totalChunks: Number(job.totalChunks || 0),
    totalDocuments: Number(job.totalDocuments || 0),
    sectionCounts: serializeFirestoreValue(job.sectionCounts || {}),
    truncatedSections: Array.isArray(job.truncatedSections) ? job.truncatedSections.slice(0, 100) : [],
    fileName: optionalString(job.fileName, 180),
    exportVersion: optionalString(job.exportVersion, 80) || ACCOUNT_EXPORT_VERSION,
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
  };
}

function registerBeta1UserDataExport(exportsTarget, { db, authAdmin, onCall, HttpsError }) {
  exportsTarget.requestUserDataExport = onCall(async (request) => {
    const userId = requireRecentAuth(request, HttpsError);
    const jobRef = exportJobRef(db, userId);
    const generatedAt = new Date();
    const expiresAt = addHours(generatedAt, ACCOUNT_EXPORT_EXPIRY_HOURS);
    const jobId = `${safeDocIdPart(userId)}_${generatedAt.toISOString().replace(/[:.]/g, "-")}`;

    const lock = await db.runTransaction(async (transaction) => {
      const existingSnapshot = await transaction.get(jobRef);
      const existing = existingSnapshot.exists ? existingSnapshot.data() || {} : null;
      const existingExpiry = existing ? asDate(existing.expiresAt) : null;
      if (existing && existing.status === "ready" && existingExpiry && existingExpiry.getTime() > Date.now()) {
        return { reused: true, job: { jobId: jobRef.id, ...existing } };
      }
      if (existing && existing.status === "generating") {
        return { reused: true, job: { jobId: jobRef.id, ...existing } };
      }
      transaction.set(jobRef, {
        jobId,
        ownerUserId: userId,
        userId,
        status: "generating",
        ready: false,
        totalChunks: 0,
        totalDocuments: 0,
        sectionCounts: {},
        truncatedSections: [],
        fileName: `wellfit-data-export-${generatedAt.toISOString().slice(0, 10)}.json`,
        exportVersion: ACCOUNT_EXPORT_VERSION,
        generatedAt: generatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        requestedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: existing && existing.createdAt ? existing.createdAt : FieldValue.serverTimestamp(),
      }, { merge: true });
      return { reused: false };
    });

    if (lock.reused) {
      return { accepted: true, idempotent: true, ...publicExportJob(lock.job) };
    }

    try {
      await deleteExistingChunks(db, userId);
      const sections = await collectExportSections(db, authAdmin, userId);
      const built = buildExportChunks({ userId, generatedAt, expiresAt, sections });
      await writeChunks(db, userId, jobId, built.chunks, generatedAt, expiresAt);
      await jobRef.set({
        status: "ready",
        ready: true,
        totalChunks: built.chunks.length,
        totalDocuments: built.totalDocuments,
        sectionCounts: built.sectionCounts,
        truncatedSections: built.truncatedSections,
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      await writeAudit(db, {
        actorUserId: userId,
        actionType: "user-data-export-created",
        targetType: "userDataExportJob",
        targetId: userId,
        ownerUserId: userId,
        metadata: {
          jobId,
          totalChunks: built.chunks.length,
          totalDocuments: built.totalDocuments,
          truncatedSections: built.truncatedSections,
          exportVersion: ACCOUNT_EXPORT_VERSION,
        },
      });
      const readySnapshot = await jobRef.get();
      return { accepted: true, idempotent: false, ...publicExportJob({ jobId: userId, ...(readySnapshot.data() || {}) }) };
    } catch (error) {
      console.error("requestUserDataExport failed", error);
      await jobRef.set({
        status: "failed",
        ready: false,
        failureCode: optionalString(error && error.code, 120) || "export-generation-failed",
        failedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      throw new HttpsError("internal", "Der Datenexport konnte nicht sicher erstellt werden.");
    }
  });

  exportsTarget.getUserDataExportStatus = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const snapshot = await exportJobRef(db, userId).get();
    return {
      accepted: true,
      ...publicExportJob(snapshot.exists ? { jobId: snapshot.id, ...(snapshot.data() || {}) } : null),
    };
  });

  exportsTarget.downloadUserDataExportChunk = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const index = Number(data.index);
    if (!Number.isInteger(index) || index < 0 || index >= MAX_EXPORT_CHUNKS) {
      throw new HttpsError("invalid-argument", "index ist ungueltig.");
    }
    const [jobSnapshot, chunkSnapshot] = await Promise.all([
      exportJobRef(db, userId).get(),
      exportChunkRef(db, userId, index).get(),
    ]);
    if (!jobSnapshot.exists) throw new HttpsError("not-found", "Es liegt kein Datenexport vor.");
    const job = jobSnapshot.data() || {};
    const state = publicExportJob({ jobId: jobSnapshot.id, ...job });
    if (!state.ready) throw new HttpsError("failed-precondition", "Der Datenexport ist nicht bereit oder bereits abgelaufen.");
    if (!chunkSnapshot.exists) throw new HttpsError("not-found", "Export-Chunk wurde nicht gefunden.");
    const chunk = chunkSnapshot.data() || {};
    if (chunk.ownerUserId !== userId || chunk.jobId !== job.jobId || Number(chunk.index) !== index) {
      throw new HttpsError("permission-denied", "Export-Chunk gehoert nicht zum aktuellen Exportauftrag.");
    }
    const payloadJson = optionalString(chunk.payloadJson, EXPORT_CHUNK_TARGET_BYTES + 50000);
    if (!payloadJson || sha256(payloadJson) !== chunk.payloadSha256) {
      throw new HttpsError("data-loss", "Die Integritaet des Export-Chunks konnte nicht bestaetigt werden.");
    }
    return {
      accepted: true,
      jobId: job.jobId,
      index,
      totalChunks: Number(job.totalChunks || 0),
      payloadJson,
      payloadSha256: chunk.payloadSha256,
      fileName: state.fileName,
      exportVersion: ACCOUNT_EXPORT_VERSION,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });
}

module.exports = {
  EXPORT_PAGE_SIZE,
  MAX_EXPORT_DOCS_PER_COLLECTION,
  EXPORT_CHUNK_TARGET_BYTES,
  MAX_EXPORT_CHUNKS,
  DIRECT_DOCUMENT_SECTIONS,
  QUERY_DOCUMENT_SECTIONS,
  exportJobRef,
  exportChunkRef,
  collectExportSections,
  buildExportChunks,
  publicExportJob,
  registerBeta1UserDataExport,
};