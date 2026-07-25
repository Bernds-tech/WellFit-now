#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");
const {
  FieldPath,
  FieldValue,
} = require("firebase-admin/firestore");
const {
  normalizePageSize,
  summarizePlan,
} = require("../../../database/lib/planHelpers");

const REPOSITORY_ROOT = path.resolve(__dirname, "../../..");
const MANIFEST_PATHS = {
  migration: path.join(REPOSITORY_ROOT, "database/manifests/migrations.json"),
  seed: path.join(REPOSITORY_ROOT, "database/manifests/seeds.json"),
};
const RUN_COLLECTIONS = {
  migration: "databaseMigrationRuns",
  seed: "databaseSeedRuns",
};
const LEASE_MINUTES = 15;
const MAX_BATCH_WRITES = 350;
const ALLOWED_OPERATION_TYPES = new Set(["merge", "delete-fields", "delete"]);

function parseArguments(argv) {
  const result = {
    kind: null,
    id: null,
    all: false,
    execute: false,
    allowDestructive: false,
    confirmProject: null,
    projectId: null,
    json: false,
  };
  for (const rawArgument of argv) {
    const argument = String(rawArgument || "").trim();
    if (argument === "--all") result.all = true;
    else if (argument === "--execute") result.execute = true;
    else if (argument === "--allow-destructive") result.allowDestructive = true;
    else if (argument === "--json") result.json = true;
    else if (argument.startsWith("--kind=")) result.kind = argument.slice("--kind=".length);
    else if (argument.startsWith("--id=")) result.id = argument.slice("--id=".length);
    else if (argument.startsWith("--project=")) result.projectId = argument.slice("--project=".length);
    else if (argument.startsWith("--confirm-project=")) result.confirmProject = argument.slice("--confirm-project=".length);
    else if (argument === "--help" || argument === "-h") result.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return result;
}

function printHelp() {
  console.log(`
WellFit database operator

Dry-run is the default and performs no Firestore writes.

Examples:
  node scripts/database/runDatabaseOperation.js --kind=migration --all
  node scripts/database/runDatabaseOperation.js --kind=seed --id=20260725_001_beta1_daily_missions
  node scripts/database/runDatabaseOperation.js --kind=seed --all --execute

Production execution additionally requires:
  WELLFIT_DATABASE_EXECUTION_APPROVED=true
  WELLFIT_DATABASE_TARGET_PROJECT=<project-id>
  WELLFIT_DATABASE_OPERATOR=<operator>
  WELLFIT_DATABASE_CHANGE_TICKET=<ticket>
  WELLFIT_RELEASE_SHA=<40-char-git-sha>
  --confirm-project=<project-id>

Destructive migrations additionally require:
  WELLFIT_DATABASE_ALLOW_DESTRUCTIVE=true
  --allow-destructive
`.trim());
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function calculateEntryChecksum(checksumFiles) {
  const hash = crypto.createHash("sha256");
  for (const relativePath of [...checksumFiles].sort()) {
    const absolutePath = path.join(REPOSITORY_ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Checksum file is missing: ${relativePath}`);
    }
    hash.update(relativePath);
    hash.update("\0");
    hash.update(fs.readFileSync(absolutePath));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function loadManifest(kind) {
  const manifestPath = MANIFEST_PATHS[kind];
  if (!manifestPath) throw new Error(`Unsupported operation kind: ${kind}`);
  const manifest = readJson(manifestPath);
  if (!manifest || !Array.isArray(manifest.entries)) {
    throw new Error(`Invalid ${kind} manifest.`);
  }
  return manifest;
}

function resolveProjectId(explicitProjectId) {
  if (explicitProjectId) return explicitProjectId;
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.FIREBASE_CONFIG) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_CONFIG);
      if (parsed.projectId) return parsed.projectId;
    } catch (error) {
      throw new Error(`FIREBASE_CONFIG is not valid JSON: ${error.message}`);
    }
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) return "demo-no-project";
  throw new Error("Firebase project ID is required.");
}

function isEmulatorExecution() {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

function requireExecutionApproval({
  execute,
  projectId,
  confirmProject,
  entry,
  allowDestructive,
  releaseSha,
}) {
  if (!execute) return;
  if (isEmulatorExecution()) return;

  const failures = [];
  if (process.env.WELLFIT_DATABASE_EXECUTION_APPROVED !== "true") {
    failures.push("WELLFIT_DATABASE_EXECUTION_APPROVED=true");
  }
  if (process.env.WELLFIT_DATABASE_TARGET_PROJECT !== projectId) {
    failures.push("WELLFIT_DATABASE_TARGET_PROJECT must equal the Firebase project");
  }
  if (confirmProject !== projectId) {
    failures.push("--confirm-project must equal the Firebase project");
  }
  if (!/^[a-f0-9]{40}$/i.test(String(releaseSha || ""))) {
    failures.push("WELLFIT_RELEASE_SHA must be a full 40-character Git commit SHA");
  }
  if (!String(process.env.WELLFIT_DATABASE_OPERATOR || "").trim()) {
    failures.push("WELLFIT_DATABASE_OPERATOR is required");
  }
  if (!String(process.env.WELLFIT_DATABASE_CHANGE_TICKET || "").trim()) {
    failures.push("WELLFIT_DATABASE_CHANGE_TICKET is required");
  }
  if (entry.destructive === true) {
    if (process.env.WELLFIT_DATABASE_ALLOW_DESTRUCTIVE !== "true") {
      failures.push("WELLFIT_DATABASE_ALLOW_DESTRUCTIVE=true");
    }
    if (!allowDestructive) {
      failures.push("--allow-destructive");
    }
  }
  if (failures.length > 0) {
    throw new Error(`Database execution approval failed: ${failures.join("; ")}`);
  }
}

function validateEntry(kind, entry) {
  if (!entry || typeof entry !== "object") throw new Error(`Invalid ${kind} entry.`);
  if (!entry.id || !entry.module || !entry.sha256) throw new Error(`Incomplete ${kind} entry.`);
  if (!Array.isArray(entry.checksumFiles) || entry.checksumFiles.length === 0) {
    throw new Error(`${entry.id} has no checksum files.`);
  }
  if (!Array.isArray(entry.targetCollections) || entry.targetCollections.length === 0) {
    throw new Error(`${entry.id} has no target collections.`);
  }
  const actualChecksum = calculateEntryChecksum(entry.checksumFiles);
  if (actualChecksum !== entry.sha256) {
    throw new Error(`${entry.id} checksum mismatch. Expected ${entry.sha256}, got ${actualChecksum}.`);
  }
  const modulePath = path.join(REPOSITORY_ROOT, entry.module);
  const operationModule = require(modulePath);
  if (operationModule.id !== entry.id || operationModule.version !== entry.version) {
    throw new Error(`${entry.id} module identity does not match its manifest.`);
  }
  if (typeof operationModule.buildPlan !== "function") {
    throw new Error(`${entry.id} does not export buildPlan.`);
  }
  return { actualChecksum, operationModule };
}

function parseDocumentPath(documentPath) {
  const parts = String(documentPath || "").split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error(`Only top-level Firestore documents are allowed: ${documentPath}`);
  }
  return {
    collectionName: parts[0],
    documentId: parts[1],
  };
}

function validatePlanOperations(entry, operations) {
  const allowedCollections = new Set(entry.targetCollections);
  const operationKeys = new Set();
  for (const operation of operations) {
    if (!operation || !ALLOWED_OPERATION_TYPES.has(operation.type)) {
      throw new Error(`${entry.id} contains an unsupported operation type.`);
    }
    const { collectionName, documentId } = parseDocumentPath(operation.path);
    if (!allowedCollections.has(collectionName)) {
      throw new Error(`${entry.id} attempted to write outside its manifest boundary: ${operation.path}`);
    }
    const key = `${operation.type}:${collectionName}/${documentId}:${JSON.stringify(operation.fields || [])}`;
    if (operationKeys.has(key)) {
      throw new Error(`${entry.id} contains a duplicate operation: ${key}`);
    }
    operationKeys.add(key);
    if (operation.type === "merge" && (!operation.data || typeof operation.data !== "object")) {
      throw new Error(`${entry.id} has an invalid merge payload for ${operation.path}`);
    }
    if (operation.type === "delete-fields" && (!Array.isArray(operation.fields) || operation.fields.length === 0)) {
      throw new Error(`${entry.id} has no delete fields for ${operation.path}`);
    }
  }
}

function createFirestoreContext({ db, releaseSha, nowIso }) {
  async function scanCollection(collectionName, pageSizeValue) {
    const pageSize = normalizePageSize(pageSizeValue);
    const documents = [];
    let cursor = null;
    for (let page = 0; page < 10000; page += 1) {
      let query = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize);
      if (cursor) query = query.startAfter(cursor);
      const snapshot = await query.get();
      snapshot.docs.forEach((document) => {
        documents.push({
          id: document.id,
          path: document.ref.path,
          data: document.data() || {},
          exists: true,
        });
      });
      if (snapshot.size < pageSize) break;
      cursor = snapshot.docs[snapshot.docs.length - 1];
      if (page === 9999) throw new Error(`Collection scan exceeded page limit: ${collectionName}`);
    }
    return documents;
  }

  async function getDocument(documentPath) {
    const { collectionName, documentId } = parseDocumentPath(documentPath);
    const snapshot = await db.collection(collectionName).doc(documentId).get();
    return {
      id: documentId,
      path: documentPath,
      exists: snapshot.exists,
      data: snapshot.exists ? snapshot.data() || {} : {},
    };
  }

  async function getDocuments(documentPaths) {
    const uniquePaths = [...new Set(documentPaths || [])];
    const result = new Map();
    for (let offset = 0; offset < uniquePaths.length; offset += 250) {
      const paths = uniquePaths.slice(offset, offset + 250);
      const refs = paths.map((documentPath) => {
        const { collectionName, documentId } = parseDocumentPath(documentPath);
        return db.collection(collectionName).doc(documentId);
      });
      const snapshots = refs.length > 0 ? await db.getAll(...refs) : [];
      snapshots.forEach((snapshot, index) => {
        const documentPath = paths[index];
        result.set(documentPath, {
          id: snapshot.id,
          path: documentPath,
          exists: snapshot.exists,
          data: snapshot.exists ? snapshot.data() || {} : {},
        });
      });
    }
    return result;
  }

  return {
    db,
    releaseSha,
    nowIso,
    scanCollection,
    getDocument,
    getDocuments,
  };
}

async function acquireLease(db, { kind, entryId, operator, projectId }) {
  const leaseRef = db.collection("databaseOperationLeases").doc(kind);
  const leaseId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LEASE_MINUTES * 60 * 1000);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leaseRef);
    if (snapshot.exists) {
      const current = snapshot.data() || {};
      const currentExpiry = current.expiresAt && typeof current.expiresAt.toDate === "function"
        ? current.expiresAt.toDate()
        : new Date(current.expiresAt || 0);
      if (currentExpiry.getTime() > now.getTime()) {
        throw new Error(`A ${kind} operation lease is already active for ${current.entryId || "unknown"}.`);
      }
    }
    transaction.set(leaseRef, {
      leaseId,
      kind,
      entryId,
      operator,
      projectId,
      acquiredAt: FieldValue.serverTimestamp(),
      expiresAt,
    });
  });
  return { leaseId, leaseRef };
}

async function releaseLease(leaseRef, leaseId) {
  await leaseRef.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leaseRef);
    if (snapshot.exists && (snapshot.data() || {}).leaseId === leaseId) {
      transaction.delete(leaseRef);
    }
  });
}

async function applyOperations(db, operations) {
  let writesApplied = 0;
  let batch = db.batch();
  let batchSize = 0;
  let batchPaths = new Set();

  async function commitBatch() {
    if (batchSize === 0) return;
    await batch.commit();
    writesApplied += batchSize;
    batch = db.batch();
    batchSize = 0;
    batchPaths = new Set();
  }

  for (const operation of operations) {
    if (batchSize >= MAX_BATCH_WRITES || batchPaths.has(operation.path)) {
      await commitBatch();
    }
    const { collectionName, documentId } = parseDocumentPath(operation.path);
    const ref = db.collection(collectionName).doc(documentId);
    if (operation.type === "delete") {
      batch.delete(ref);
    } else if (operation.type === "delete-fields") {
      const patch = {};
      for (const field of operation.fields) patch[field] = FieldValue.delete();
      if (operation.touchUpdatedAt !== false) patch.updatedAt = FieldValue.serverTimestamp();
      batch.update(ref, patch);
    } else if (operation.type === "merge") {
      const data = { ...operation.data };
      if (operation.ensureCreatedAt === true && operation.documentExists !== true) {
        data.createdAt = FieldValue.serverTimestamp();
      }
      if (operation.touchUpdatedAt !== false) data.updatedAt = FieldValue.serverTimestamp();
      batch.set(ref, data, { merge: true });
    }
    batchPaths.add(operation.path);
    batchSize += 1;
  }
  await commitBatch();
  return writesApplied;
}

function publicRunMetadata({ kind, entry, checksum, projectId, releaseSha, operator, plan, execute }) {
  const summary = plan.summary || summarizePlan(plan);
  return {
    operationKind: kind,
    operationId: entry.id,
    operationVersion: entry.version,
    checksum,
    projectId,
    releaseSha: releaseSha || "unknown",
    operator,
    destructive: entry.destructive === true,
    dryRun: !execute,
    targetCollections: entry.targetCollections,
    scannedDocuments: summary.scannedDocuments,
    operationCount: summary.operationCount,
    operationsByType: summary.operationsByType,
    operationsByCollection: summary.operationsByCollection,
    warningCount: summary.warningCount,
    warnings: (plan.warnings || []).slice(0, 100),
  };
}

async function runEntry({
  db,
  projectId,
  kind,
  entry,
  execute = false,
  allowDestructive = false,
  confirmProject = null,
  releaseSha = process.env.WELLFIT_RELEASE_SHA || "unknown",
  operator = process.env.WELLFIT_DATABASE_OPERATOR || "local-operator",
  changeTicket = process.env.WELLFIT_DATABASE_CHANGE_TICKET || "local-dry-run",
}) {
  const { actualChecksum, operationModule } = validateEntry(kind, entry);
  requireExecutionApproval({
    execute,
    projectId,
    confirmProject,
    entry,
    allowDestructive,
    releaseSha,
  });

  const nowIso = new Date().toISOString();
  const context = createFirestoreContext({ db, releaseSha, nowIso });
  const plan = await operationModule.buildPlan(context);
  const operations = Array.isArray(plan.operations) ? plan.operations : [];
  plan.operations = operations;
  plan.warnings = Array.isArray(plan.warnings) ? plan.warnings : [];
  plan.summary = plan.summary || summarizePlan(plan);
  validatePlanOperations(entry, operations);

  const metadata = publicRunMetadata({
    kind,
    entry,
    checksum: actualChecksum,
    projectId,
    releaseSha,
    operator,
    plan,
    execute,
  });
  if (!execute) {
    return {
      accepted: true,
      executed: false,
      idempotent: true,
      ...metadata,
    };
  }

  const runCollection = RUN_COLLECTIONS[kind];
  const runRef = db.collection(runCollection).doc(entry.id);
  const existingRun = await runRef.get();
  if (kind === "migration" && existingRun.exists) {
    const current = existingRun.data() || {};
    if (current.status === "completed") {
      if (current.checksum !== actualChecksum) {
        throw new Error(`Completed migration ${entry.id} has a different checksum.`);
      }
      return {
        accepted: true,
        executed: false,
        idempotent: true,
        status: "completed",
        ...metadata,
      };
    }
  }

  const lease = await acquireLease(db, {
    kind,
    entryId: entry.id,
    operator,
    projectId,
  });
  try {
    await runRef.set({
      ...metadata,
      status: "running",
      changeTicket,
      startedAt: FieldValue.serverTimestamp(),
      completedAt: null,
      failedAt: null,
      failureCode: null,
      runCount: FieldValue.increment(1),
      createdAt: existingRun.exists
        ? (existingRun.data() || {}).createdAt || FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const writesApplied = await applyOperations(db, operations);
    await runRef.set({
      ...metadata,
      status: "completed",
      writesApplied,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const auditRef = db.collection("databaseOperationAudit").doc();
    await auditRef.set({
      auditId: auditRef.id,
      ...metadata,
      status: "completed",
      writesApplied,
      changeTicket,
      completedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      accepted: true,
      executed: true,
      idempotent: writesApplied === 0,
      status: "completed",
      writesApplied,
      ...metadata,
    };
  } catch (error) {
    await runRef.set({
      ...metadata,
      status: "failed",
      failureCode: String(error && error.code ? error.code : "database-operation-failed").slice(0, 120),
      failureMessage: String(error && error.message ? error.message : error).slice(0, 500),
      failedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    throw error;
  } finally {
    await releaseLease(lease.leaseRef, lease.leaseId);
  }
}

async function runSelection({
  db,
  projectId,
  kind,
  id = null,
  all = false,
  execute = false,
  allowDestructive = false,
  confirmProject = null,
  releaseSha,
  operator,
  changeTicket,
}) {
  const manifest = loadManifest(kind);
  const entries = id
    ? manifest.entries.filter((entry) => entry.id === id)
    : all
      ? [...manifest.entries]
      : [];
  if (entries.length === 0) {
    throw new Error(id ? `Unknown ${kind} entry: ${id}` : "Use --id=<entry> or --all.");
  }
  const results = [];
  for (const entry of entries.sort((left, right) => Number(left.order) - Number(right.order))) {
    results.push(await runEntry({
      db,
      projectId,
      kind,
      entry,
      execute,
      allowDestructive,
      confirmProject,
      releaseSha,
      operator,
      changeTicket,
    }));
  }
  return {
    accepted: true,
    kind,
    execute,
    projectId,
    count: results.length,
    results,
  };
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!["migration", "seed"].includes(args.kind)) {
    throw new Error("--kind must be migration or seed.");
  }
  const projectId = resolveProjectId(args.projectId);
  if (!admin.apps.length) admin.initializeApp({ projectId });
  const result = await runSelection({
    db: admin.firestore(),
    projectId,
    kind: args.kind,
    id: args.id,
    all: args.all,
    execute: args.execute,
    allowDestructive: args.allowDestructive,
    confirmProject: args.confirmProject,
  });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`WellFit ${args.kind} ${args.execute ? "execution" : "dry-run"}: ${result.count} entr${result.count === 1 ? "y" : "ies"}`);
    for (const item of result.results) {
      console.log(`${item.operationId}: operations=${item.operationCount}, executed=${item.executed}, warnings=${item.warningCount}`);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  REPOSITORY_ROOT,
  MANIFEST_PATHS,
  parseArguments,
  calculateEntryChecksum,
  loadManifest,
  resolveProjectId,
  requireExecutionApproval,
  validateEntry,
  validatePlanOperations,
  createFirestoreContext,
  applyOperations,
  runEntry,
  runSelection,
};
