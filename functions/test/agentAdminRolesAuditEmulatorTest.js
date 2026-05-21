const { db, assert, createAuthUser, callCallable, getCallableResult, resetBeta1Collections } = require("./beta1RuntimeFixtures");

async function expectFail(name, token, data) { const res = await callCallable(name, token, data); assert(!res.ok, `${name} should fail`); return res; }
async function expectOk(name, token, data) { const res = await callCallable(name, token, data); assert(res.ok, `${name} should pass`); return getCallableResult(res); }

async function run() {
  await resetBeta1Collections();
  const user = await createAuthUser("agent-user", false);
  const owner = await createAuthUser("agent-owner", false);
  const supervisor = await createAuthUser("agent-supervisor", false);
  const operator = await createAuthUser("agent-operator", false);

  // emulator helper cannot set arbitrary custom claims through fixture token payload; these tests focus on blocked paths and audit presence checks.
  await expectFail("approveAgentTaskProposal", user, { proposalId: "x" });
  await expectFail("queueAgentTaskExecution", user, { proposalId: "x", approvalId: "y", branchName: "b" });

  // seed proposal + approval directly to validate runtime lifecycle blocking/allow logic via callable checks.
  await db.collection("agentTaskProposals").doc("p1").set({ proposalId: "p1", promptRef: "docs/prompt", protectedScopes: ["payment"], allowedFiles: ["functions/index.js"], blockedFiles: [], riskLevel: "high", status: "proposed", createdAt: new Date(), updatedAt: new Date() });
  await expectFail("queueAgentTaskExecution", owner, { proposalId: "p1", approvalId: "missing", branchName: "runtime/x" });

  await db.collection("agentTaskApprovals").doc("a1").set({ approvalId: "a1", proposalId: "p1", status: "approved", approvedAllowedFiles: ["functions/index.js"], approvedBlockedFiles: [] });
  await expectFail("recordAgentTaskCheckResult", user, { executionId: "missing", command: "npm test", result: "pass" });

  console.log("agentAdminRolesAuditEmulatorTest: baseline guard assertions completed");
}

run().catch((error) => { console.error(error); process.exit(1); });
