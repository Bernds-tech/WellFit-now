#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function value(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = process.argv.find((entry) => entry.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function bool(name, fallback = false) {
  return String(value(name, fallback ? "true" : "false")).toLowerCase() === "true";
}

function required(input, label) {
  const normalized = String(input || "").trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

const evidence = {
  schemaVersion: "wellfit-firebase-release-evidence-v1",
  project: "WellFit-now",
  target: required(value("target"), "target"),
  projectId: required(value("project-id"), "project-id"),
  releaseSha: required(value("release-sha"), "release-sha"),
  changeTicket: required(value("change-ticket"), "change-ticket"),
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
  repository: process.env.GITHUB_REPOSITORY || "Bernds-tech/WellFit-now",
  actor: process.env.GITHUB_ACTOR || null,
  recordedAt: new Date().toISOString(),
  firestoreBackupUri: required(value("backup-uri"), "backup-uri"),
  results: {
    firestoreExportCompleted: bool("backup-completed"),
    firestoreIndexesDeployed: bool("indexes-deployed"),
    firestoreRulesDeployed: bool("rules-deployed"),
    firebaseFunctionsDeployed: bool("functions-deployed"),
    databaseMigrationsExecuted: bool("migrations-executed"),
    databaseSeedsExecuted: bool("seeds-executed"),
    destructiveMigrationsApproved: bool("destructive-approved"),
    webRuntimeDeployed: false,
    firestoreImportPerformed: false,
  },
  security: {
    protectedEnvironmentUsed: true,
    shortLivedAuthenticationExpected: true,
    serviceAccountKeyIncluded: false,
    firebaseTokenIncluded: false,
    restoreWasAutomated: false,
  },
};

if (
  !evidence.results.firestoreExportCompleted
  || !evidence.results.firestoreIndexesDeployed
  || !evidence.results.firestoreRulesDeployed
  || !evidence.results.firebaseFunctionsDeployed
) {
  throw new Error("Release evidence cannot be marked complete while mandatory Firebase stages are false.");
}

const outputPath = value("output", "release/firebase-release-evidence.json");
const absoluteOutput = path.resolve(ROOT, outputPath);
fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
fs.writeFileSync(absoluteOutput, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(`WellFit Firebase release evidence written: ${path.relative(ROOT, absoluteOutput)}`);
