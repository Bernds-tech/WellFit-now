#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RELEASE_ARTIFACTS = [
  "firebase.json",
  "firestore.rules",
  "firestore.indexes.json",
  "functions/package.json",
  "functions/package-lock.json",
  "functions/cooldownIndex.js",
  "database/manifests/migrations.json",
  "database/manifests/seeds.json",
  "functions/scripts/database/runDatabaseOperation.js",
];

function argumentValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function booleanArgument(name, fallback = false) {
  const value = argumentValue(name, fallback ? "true" : "false");
  return String(value).toLowerCase() === "true";
}

function required(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

function sha256File(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Release artifact is missing: ${relativePath}`);
  return crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex");
}

function validateProjectId(projectId) {
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
    throw new Error("Firebase project ID is invalid.");
  }
}

function validateReleaseSha(releaseSha) {
  if (!/^[a-f0-9]{40}$/i.test(releaseSha)) {
    throw new Error("release-sha must be a full 40-character Git commit SHA.");
  }
}

function validateTarget(target) {
  if (!new Set(["staging", "production"]).has(target)) {
    throw new Error("target must be staging or production.");
  }
}

function main() {
  const target = required(argumentValue("target", process.env.WELLFIT_FIREBASE_TARGET), "target");
  const releaseSha = required(argumentValue("release-sha", process.env.WELLFIT_RELEASE_SHA), "release-sha");
  const projectId = required(argumentValue("project-id", process.env.FIREBASE_PROJECT_ID), "project-id");
  const confirmedProject = required(argumentValue("confirm-project", process.env.WELLFIT_CONFIRMED_FIREBASE_PROJECT), "confirm-project");
  const changeTicket = required(argumentValue("change-ticket", process.env.WELLFIT_DATABASE_CHANGE_TICKET || "plan-only"), "change-ticket");
  const applyRelease = booleanArgument("apply", false);
  const executeDatabase = booleanArgument("execute-database", false);
  const allowDestructive = booleanArgument("allow-destructive", false);
  const outputPath = argumentValue("output", "release/firebase-release-plan.json");

  validateTarget(target);
  validateReleaseSha(releaseSha);
  validateProjectId(projectId);
  if (confirmedProject !== projectId) throw new Error("Confirmed project does not match target project.");
  if (executeDatabase && !applyRelease) throw new Error("Database execution requires apply=true.");
  if (allowDestructive && !executeDatabase) throw new Error("Destructive approval requires database execution.");

  const artifacts = Object.fromEntries(RELEASE_ARTIFACTS.map((relativePath) => [relativePath, sha256File(relativePath)]));
  const plan = {
    schemaVersion: "wellfit-firebase-release-plan-v1",
    project: "WellFit-now",
    target,
    projectId,
    confirmedProject,
    releaseSha: releaseSha.toLowerCase(),
    changeTicket,
    generatedAt: new Date().toISOString(),
    requestedActions: {
      applyRelease,
      createFirestoreExport: applyRelease,
      deployFirestoreIndexes: applyRelease,
      deployFirestoreRules: applyRelease,
      deployFirebaseFunctions: applyRelease,
      executeDatabaseMigrations: executeDatabase,
      executeDatabaseSeeds: executeDatabase,
      allowDestructiveMigrations: allowDestructive,
      deployWebRuntime: false,
      importFirestoreBackup: false,
    },
    order: [
      "validate-exact-main-commit",
      "validate-environment-contract",
      "run-complete-repository-checks",
      "authenticate-with-short-lived-google-cloud-credentials",
      "create-and-complete-firestore-export",
      "generate-database-dry-run-plans",
      "deploy-firestore-indexes",
      "deploy-firestore-rules",
      "deploy-firebase-functions",
      "optionally-execute-approved-database-migrations",
      "optionally-reconcile-approved-seed-catalogs",
      "record-release-evidence",
    ],
    artifacts,
    safety: {
      workflowDispatchOnly: true,
      protectedGitHubEnvironmentRequired: true,
      exactProjectConfirmationRequired: true,
      fullReleaseShaRequired: true,
      mainAncestryRequired: true,
      backupBeforeMutationRequired: true,
      dryRunBeforeDatabaseExecutionRequired: true,
      restoreAutomationIncluded: false,
      serviceAccountKeyCommitted: false,
      firebaseTokenCommitted: false,
      productionDataWrittenByPlan: false,
    },
  };

  const absoluteOutput = path.resolve(ROOT, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  console.log(`WellFit Firebase release plan written: ${path.relative(ROOT, absoluteOutput)}`);
}

main();
