const assert = require("node:assert/strict");

const { buildManualRunnerImplementationPlanDecision } = require("../lib/agentAdminRolesAudit");

const basePickupContract = {
  pickupContractId: "tIevx0mie1spO9mCeAX",
  runnerJobId: "MVYM6yY8Of4X9TIOYPm4",
  workerQueueId: "y7FucOysKnC4umHxfdBR",
  taskProposalId: "JF7JcYxg4HOJ4lzK6G4o",
  title: "Familien Abenteuerpfad Woche",
  status: "pickup_contract_created",
  requestedAction: "Create implementation plan only.",
  allowedFiles: ["docs/**", "todolist/**", "project-register/**"],
  blockedFiles: ["app/**", "functions/**", "firestore.rules", "native/**", ".github/**"],
  requiredChecks: ["npm run agent:validate", "npm run agent:quality-gate", "npm run lint", "npm run build", "git diff --check"],
  riskLevel: "medium",
  runnerStartAllowed: false,
  fileWriteAllowed: false,
  branchCreationAllowed: false,
  prCreationAllowed: false,
  noDeploy: true,
  noMerge: true,
};

function decision(overrides = {}, pickupContractId = basePickupContract.pickupContractId) {
  return buildManualRunnerImplementationPlanDecision({ ...basePickupContract, ...overrides }, pickupContractId);
}

const created = decision();
assert.equal(created.plannable, true, "pickup_contract_created can create implementation plan");
assert.equal(created.plan.status, "implementation_plan_created", "plan status is implementation_plan_created");
assert.equal(created.plan.executionMode, "manual_plan_only", "plan is manual plan only");
assert.deepEqual(created.plan.allowedFiles, basePickupContract.allowedFiles, "plan contains allowedFiles");
assert.deepEqual(created.plan.blockedFiles, basePickupContract.blockedFiles, "plan contains blockedFiles");
assert.deepEqual(created.plan.requiredChecks, basePickupContract.requiredChecks, "plan contains requiredChecks");
assert.match(created.plan.planSummary, /5-Tage-Familien-Abenteuerpfad/, "family adventure summary is understandable");
assert.ok(created.plan.plannedSteps.length >= 5, "plan contains plannedSteps");
assert.ok(created.plan.validationPlan.length >= 3, "plan contains validationPlan");
assert.ok(created.plan.rollbackPlan.length >= 3, "plan contains rollbackPlan");
assert.deepEqual(created.plan.expectedFilesToTouch, ["docs/**", "todolist/**", "project-register/**"], "expected files stay in docs/todolist/project-register");
assert.equal(created.plan.fileWriteAllowed, false, "fileWriteAllowed remains false");
assert.equal(created.plan.branchCreationAllowed, false, "branchCreationAllowed remains false");
assert.equal(created.plan.prCreationAllowed, false, "prCreationAllowed remains false");
assert.equal(created.plan.noDeploy, true, "noDeploy remains true");
assert.equal(created.plan.noMerge, true, "noMerge remains true");
assert.equal(created.plan.requiresOwnerPlanApproval, true, "owner plan approval is required");
assert.equal(created.plan.nextStep, "Owner must approve implementation plan before any file write or branch creation.", "next step requires owner approval");

for (const status of ["pending_runner_pickup", "completed", "blocked", "in_progress"]) {
  const blocked = decision({ status });
  assert.equal(blocked.plannable, false, `${status} cannot create implementation plan`);
  assert.match(blocked.failureMessage, /pickup_contract_created/, `${status} returns clear status message`);
}

const missingId = decision({ pickupContractId: "" }, "");
assert.equal(missingId.plannable, false, "missing pickupContractId is blocked");
assert.match(missingId.failureMessage, /Pickup Contract ID fehlt/, "missing pickupContractId gives clear message");

for (const override of [
  { fileWriteAllowed: true },
  { branchCreationAllowed: true },
  { prCreationAllowed: true },
  { noDeploy: false },
  { noMerge: false },
  { runnerStartAllowed: true },
]) {
  const blocked = decision(override);
  assert.equal(blocked.plannable, false, `unsafe flag ${Object.keys(override)[0]} is blocked`);
}

assert.equal(Boolean(created.plan.branchName), false, "no branch is created");
assert.equal(Boolean(created.plan.prRef), false, "no PR is created");
assert.equal(Boolean(created.plan.deployRef), false, "no deploy is created");
assert.equal(Boolean(created.plan.mergeRef), false, "no merge is created");

console.log("manual runner implementation plan unit tests passed");
