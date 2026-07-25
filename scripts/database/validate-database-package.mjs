#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFESTS = [
  { kind: "migration", path: "database/manifests/migrations.json" },
  { kind: "seed", path: "database/manifests/seeds.json" },
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function checksum(checksumFiles) {
  const hash = crypto.createHash("sha256");
  for (const relativePath of [...checksumFiles].sort()) {
    const absolutePath = path.join(ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) throw new Error(`Missing checksum file: ${relativePath}`);
    hash.update(relativePath);
    hash.update("\0");
    hash.update(fs.readFileSync(absolutePath));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function validateManifest({ kind, path: manifestPath }) {
  const manifest = JSON.parse(read(manifestPath));
  if (manifest.schemaVersion !== "wellfit-database-manifest-v1") {
    fail(`${manifestPath} uses an unsupported schemaVersion`);
  }
  if (!Array.isArray(manifest.entries) || manifest.entries.length === 0) {
    fail(`${manifestPath} has no entries`);
    return;
  }
  const ids = new Set();
  const orders = new Set();
  let previousOrder = -Infinity;
  for (const entry of manifest.entries) {
    if (!entry.id || ids.has(entry.id)) fail(`${manifestPath} has a missing or duplicate entry id`);
    ids.add(entry.id);
    if (!Number.isInteger(entry.order) || orders.has(entry.order)) fail(`${entry.id} has a missing or duplicate order`);
    orders.add(entry.order);
    if (entry.order <= previousOrder) fail(`${manifestPath} entries are not sorted by order`);
    previousOrder = entry.order;
    if (!entry.version || !entry.module || !entry.sha256) fail(`${entry.id} is incomplete`);
    if (!entry.module.startsWith(`database/${kind}s/`)) fail(`${entry.id} module is outside database/${kind}s`);
    if (!Array.isArray(entry.checksumFiles) || !entry.checksumFiles.includes(entry.module)) {
      fail(`${entry.id} checksumFiles must include its module`);
      continue;
    }
    if (!Array.isArray(entry.targetCollections) || entry.targetCollections.length === 0) {
      fail(`${entry.id} has no targetCollections`);
    }
    if (entry.targetCollections.some((name) => !/^[A-Za-z][A-Za-z0-9]*$/.test(name))) {
      fail(`${entry.id} has an invalid target collection`);
    }
    if (entry.requiresExplicitApproval !== true) fail(`${entry.id} must require explicit approval`);
    if (kind === "seed") {
      if (entry.idempotency !== "merge-by-document-id") fail(`${entry.id} has unsafe seed idempotency`);
      if (entry.deleteMissingDocuments !== false) fail(`${entry.id} may not delete missing catalog documents`);
      if (!Array.isArray(entry.sourceFiles) || entry.sourceFiles.length === 0) fail(`${entry.id} has no canonical source files`);
      for (const sourceFile of entry.sourceFiles || []) {
        if (!fs.existsSync(path.join(ROOT, sourceFile))) fail(`${entry.id} source file is missing: ${sourceFile}`);
      }
    }
    const actual = checksum(entry.checksumFiles);
    if (actual !== entry.sha256) fail(`${entry.id} checksum mismatch: ${actual}`);
  }
  if (!process.exitCode) pass(`${manifestPath} integrity and ordering`);
}

function validateRunner() {
  const runner = read("functions/scripts/database/runDatabaseOperation.js");
  const requiredGuards = [
    "WELLFIT_DATABASE_EXECUTION_APPROVED",
    "WELLFIT_DATABASE_TARGET_PROJECT",
    "WELLFIT_DATABASE_OPERATOR",
    "WELLFIT_DATABASE_CHANGE_TICKET",
    "WELLFIT_RELEASE_SHA",
    "--confirm-project",
    "WELLFIT_DATABASE_ALLOW_DESTRUCTIVE",
    "--allow-destructive",
    "FIRESTORE_EMULATOR_HOST",
  ];
  for (const guard of requiredGuards) {
    if (!runner.includes(guard)) fail(`database runner is missing guard ${guard}`);
  }
  if (/firebase\s+deploy|gcloud\s+run\s+deploy|\bssh\b|\bscp\b/i.test(runner)) {
    fail("database runner contains a deployment command");
  } else {
    pass("database runner contains no deployment command");
  }
}

function validateWorkflow() {
  const workflow = read(".github/workflows/database-package.yml");
  if (/firebase\s+deploy|gcloud\s+run\s+deploy|\bssh\b|\bscp\b/i.test(workflow)) {
    fail("database workflow contains a deployment command");
  }
  if (!workflow.includes("firebase emulators:exec") || !workflow.includes("--only firestore")) {
    fail("database workflow must test against the Firestore emulator only");
  } else {
    pass("database workflow is emulator-only");
  }
}

function validateCatalogSources() {
  const catalogPaths = [
    "functions/config/beta1-daily-missions.json",
    "functions/config/beta1-weekly-missions.json",
    "functions/config/beta1-challenge-missions.json",
    "functions/config/beta1-adventure-missions.json",
  ];
  for (const catalogPath of catalogPaths) {
    const catalog = JSON.parse(read(catalogPath));
    if (
      catalog.currency !== "WFXP"
      || catalog.noMonetaryValue !== true
      || catalog.tokenAuthorized !== false
      || catalog.cashoutAllowed !== false
    ) {
      fail(`${catalogPath} violates the closed-beta economy boundary`);
    }
  }
  if (!process.exitCode) pass("canonical mission catalog economy boundaries");
}

for (const requiredPath of [
  "database/README.md",
  "database/lib/planHelpers.js",
  "database/lib/missionSeedBuilders.js",
  "functions/scripts/database/runDatabaseOperation.js",
  "functions/test/databaseOperationsEmulatorTest.js",
  ".github/workflows/database-package.yml",
]) {
  if (!fs.existsSync(path.join(ROOT, requiredPath))) fail(`missing required file ${requiredPath}`);
}

try {
  for (const manifest of MANIFESTS) validateManifest(manifest);
  validateRunner();
  validateWorkflow();
  validateCatalogSources();
} catch (error) {
  fail(error.message);
}

if (process.exitCode) process.exit(process.exitCode);
console.log("WellFit database package validation: PASS");
