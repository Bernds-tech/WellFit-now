#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const script = path.join(ROOT, "scripts/release/create-firebase-release-plan.mjs");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wellfit-release-plan-"));
const output = path.join(tempDir, "plan.json");
const releaseSha = "a".repeat(40);

function run(args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

const success = run([
  "--target=staging",
  `--release-sha=${releaseSha}`,
  "--project-id=wellfit-stage-123",
  "--confirm-project=wellfit-stage-123",
  "--change-ticket=WF-RELEASE-TEST",
  "--apply=false",
  `--output=${output}`,
]);
assert.equal(success.status, 0, success.stderr || success.stdout);
const plan = JSON.parse(fs.readFileSync(output, "utf8"));
assert.equal(plan.target, "staging");
assert.equal(plan.releaseSha, releaseSha);
assert.equal(plan.requestedActions.applyRelease, false);
assert.equal(plan.requestedActions.deployWebRuntime, false);
assert.equal(plan.requestedActions.importFirestoreBackup, false);
assert.equal(plan.safety.productionDataWrittenByPlan, false);
assert.ok(plan.artifacts["database/manifests/migrations.json"]);
assert.ok(plan.artifacts["database/manifests/seeds.json"]);

const mismatch = run([
  "--target=production",
  `--release-sha=${releaseSha}`,
  "--project-id=wellfit-prod-123",
  "--confirm-project=other-project",
  "--change-ticket=WF-RELEASE-TEST",
  `--output=${path.join(tempDir, "mismatch.json")}`,
]);
assert.notEqual(mismatch.status, 0, "Project mismatch must fail.");

const invalidSha = run([
  "--target=production",
  "--release-sha=short",
  "--project-id=wellfit-prod-123",
  "--confirm-project=wellfit-prod-123",
  "--change-ticket=WF-RELEASE-TEST",
  `--output=${path.join(tempDir, "invalid-sha.json")}`,
]);
assert.notEqual(invalidSha.status, 0, "Short release SHA must fail.");

const databaseWithoutApply = run([
  "--target=staging",
  `--release-sha=${releaseSha}`,
  "--project-id=wellfit-stage-123",
  "--confirm-project=wellfit-stage-123",
  "--change-ticket=WF-RELEASE-TEST",
  "--execute-database=true",
  "--apply=false",
  `--output=${path.join(tempDir, "database-without-apply.json")}`,
]);
assert.notEqual(databaseWithoutApply.status, 0, "Database execution without release apply must fail.");

fs.rmSync(tempDir, { recursive: true, force: true });
console.log("WellFit Firebase release plan unit test: PASS");
