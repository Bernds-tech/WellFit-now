#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WORKFLOW_PATH = ".github/workflows/firebase-release.yml";
const REQUIRED_FILES = [
  WORKFLOW_PATH,
  "infra/firebase/README.md",
  "infra/firebase/environment-contract.example.json",
  "scripts/release/create-firebase-release-plan.mjs",
  "scripts/release/write-firebase-release-evidence.mjs",
  "scripts/release/firebase-release-plan-unit-test.mjs",
];

const failures = [];
function check(condition, label) {
  if (!condition) failures.push(label);
  console.log(`${condition ? "PASS" : "FAIL"}: ${label}`);
}
function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

for (const relativePath of REQUIRED_FILES) {
  check(fs.existsSync(path.join(ROOT, relativePath)), `required file ${relativePath}`);
}
if (failures.length === 0) {
  const workflow = read(WORKFLOW_PATH);
  const planScript = read("scripts/release/create-firebase-release-plan.mjs");
  const evidenceScript = read("scripts/release/write-firebase-release-evidence.mjs");
  const gitignore = read(".gitignore");
  const dockerignore = read(".dockerignore");

  check(/workflow_dispatch:/.test(workflow), "release workflow is manually dispatched");
  check(!/^\s*(push|pull_request|schedule):/m.test(workflow), "release workflow has no automatic trigger");
  check(/apply_release:[\s\S]*default:\s*false/.test(workflow), "release application defaults to false");
  check(/environment:[\s\S]*wellfit-firebase-production/.test(workflow), "production protected environment is referenced");
  check(/environment:[\s\S]*wellfit-firebase-staging/.test(workflow), "staging protected environment is referenced");
  check(/permissions:[\s\S]*id-token:\s*write/.test(workflow), "OIDC id-token permission is explicit");
  check(/google-github-actions\/auth@v3/.test(workflow), "short-lived Google Cloud authentication action is used");
  check(/workload_identity_provider:/.test(workflow) && /service_account:/.test(workflow), "WIF service-account impersonation contract is present");
  check(!/credentials_json:|FIREBASE_TOKEN|firebase login:ci/.test(workflow), "workflow contains no long-lived key or Firebase token path");
  check(/git merge-base --is-ancestor/.test(workflow), "release SHA must be on main history");
  check(/gcloud firestore export/.test(workflow), "Firestore export occurs before mutations");
  const normalizedWorkflow = workflow.replace(/\s+/g, " ");
  check(normalizedWorkflow.indexOf("gcloud firestore export") < normalizedWorkflow.indexOf("--only firestore:indexes"), "backup precedes index deployment");
  check(normalizedWorkflow.indexOf("firestore:indexes") < normalizedWorkflow.indexOf("firestore:rules"), "indexes deploy before rules");
  check(normalizedWorkflow.indexOf("firestore:rules") < normalizedWorkflow.indexOf("--only functions"), "rules deploy before Functions");
  check(/--kind=migration[\s\S]*--json/.test(workflow) && /--kind=seed[\s\S]*--json/.test(workflow), "database Dry-Runs are mandatory");
  check(/WELLFIT_DATABASE_EXECUTION_APPROVED(?::\s*["']?true|=true)/.test(workflow), "database execution approval is explicit");
  check(/--confirm-project/.test(workflow), "database execution confirms exact project");
  check(!/gcloud firestore import|firebase firestore:delete/.test(workflow), "workflow contains no restore or recursive delete command");
  check(!/docker\s+push|\bssh\b|\bscp\b/.test(workflow), "workflow contains no web deploy, SSH or registry push");
  check(/productionDataWrittenByPlan:\s*false/.test(planScript), "plan itself records no production write");
  check(/firestoreImportPerformed:\s*false/.test(evidenceScript), "evidence excludes automated restore");
  check(gitignore.includes("gha-creds-*.json"), "GitHub-generated credential files are ignored");
  check(dockerignore.includes("gha-creds-*.json"), "GitHub-generated credential files are excluded from container context");
}

if (failures.length > 0) {
  console.error(`WellFit Firebase release package validation failed: ${failures.length} check(s).`);
  process.exit(1);
}
console.log("WellFit Firebase release package validation: PASS");
