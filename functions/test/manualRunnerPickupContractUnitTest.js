const assert = require("node:assert/strict");

const { buildManualRunnerPickupContractDecision } = require("../lib/agentAdminRolesAudit");

const baseRunnerJob = {
  runnerJobId: "MVYM6yY8Of4X9TIOYPm4",
  workerQueueId: "y7FucOysKnC4umHxfdBR",
  taskProposalId: "JF7JcYxg4HOJ4lzK6G4o",
  title: "Familien Abenteuerpfad Woche",
  status: "pending_runner_pickup",
  requestedAction: "Create implementation plan only.",
  allowedFiles: ["docs/**", "todolist/**", "project-register/**"],
  blockedFiles: ["app/**", "functions/**", "firestore.rules", "native/**", ".github/**"],
  requiredChecks: ["npm run agent:validate", "npm run agent:quality-gate", "npm run lint", "npm run build", "git diff --check"],
  riskLevel: "medium",
  runnerStartAllowed: false,
  requiresManualRunnerPickup: true,
  noDeploy: true,
  noMerge: true,
  noAutoApproval: true,
  branchCreationAllowed: false,
  prCreationAllowed: false,
  fileWriteAllowed: false,
};

function decision(overrides = {}, runnerJobId = baseRunnerJob.runnerJobId) {
  return buildManualRunnerPickupContractDecision({ ...baseRunnerJob, ...overrides }, runnerJobId);
}

const pending = decision();
assert.equal(pending.contractable, true, "pending_runner_pickup can create pickup contract");
assert.deepEqual(pending.contract.allowedFiles, baseRunnerJob.allowedFiles, "contract contains allowedFiles");
assert.deepEqual(pending.contract.blockedFiles, baseRunnerJob.blockedFiles, "contract contains blockedFiles");
assert.deepEqual(pending.contract.requiredChecks, baseRunnerJob.requiredChecks, "contract contains requiredChecks");
assert.equal(pending.contract.runnerStartAllowed, false, "runnerStartAllowed remains false");
assert.equal(pending.contract.fileWriteAllowed, false, "fileWriteAllowed remains false");
assert.equal(pending.contract.branchCreationAllowed, false, "branchCreationAllowed remains false");
assert.equal(pending.contract.prCreationAllowed, false, "prCreationAllowed remains false");
assert.equal(pending.contract.noDeploy, true, "noDeploy remains true");
assert.equal(pending.contract.noMerge, true, "noMerge remains true");
assert.equal(pending.contract.noAutoApproval, true, "noAutoApproval remains true");
assert.equal(pending.contract.executionMode, "manual_runner_pickup_contract", "manual pickup contract execution mode is set");
assert.equal(pending.contract.nextStep, "Manual runner may create an implementation plan only.", "next step limits runner to planning");

for (const status of ["ready_for_worker", "completed", "blocked", "in_progress"]) {
  const blocked = decision({ status });
  assert.equal(blocked.contractable, false, `${status} cannot create pickup contract`);
  assert.match(blocked.failureMessage, /pending_runner_pickup/, `${status} returns clear status message`);
}

const missingId = decision({ runnerJobId: "" }, "");
assert.equal(missingId.contractable, false, "missing runnerJobId is blocked");
assert.match(missingId.failureMessage, /Runner Job ID fehlt/, "missing runnerJobId gives clear message");

for (const override of [
  { runnerStartAllowed: true },
  { fileWriteAllowed: true },
  { branchCreationAllowed: true },
  { prCreationAllowed: true },
  { noDeploy: false },
  { noMerge: false },
  { autoMerge: true },
]) {
  const blocked = decision(override);
  assert.equal(blocked.contractable, false, `unsafe flag ${Object.keys(override)[0]} is blocked`);
}

assert.equal(Boolean(pending.contract.branchName), false, "no branch is created");
assert.equal(Boolean(pending.contract.prRef), false, "no PR is created");
assert.equal(Boolean(pending.contract.deployRef), false, "no deploy is created");
assert.equal(Boolean(pending.contract.mergeRef), false, "no merge is created");

console.log("manual runner pickup contract unit tests passed");
