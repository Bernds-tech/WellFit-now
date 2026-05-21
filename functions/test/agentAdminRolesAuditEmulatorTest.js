const { db, assert, createAuthUser, callCallable, getCallableResult, resetBeta1Collections } = require("./beta1RuntimeFixtures");

async function expectFail(name, token, data) { const res = await callCallable(name, token, data); assert(!res.ok, `${name} should fail`); return res; }
async function expectOk(name, token, data) { const res = await callCallable(name, token, data); assert(res.ok, `${name} should pass`); return getCallableResult(res); }

async function run() {
  await resetBeta1Collections();
  const user = await createAuthUser("agent-user", false);
  const owner = await createAuthUser("agent-owner", false);
  const supervisor = await createAuthUser("agent-supervisor", false);
  const operator = await createAuthUser("agent-operator", false);

  await expectFail("approveAgentTaskProposal", user, { proposalId: "x" });
  await expectFail("queueAgentTaskExecution", user, { proposalId: "x", approvalId: "y", branchName: "b" });

  await db.collection("agentTaskProposals").doc("p1").set({ proposalId: "p1", promptRef: "docs/prompt", protectedScopes: [], allowedFiles: ["functions/index.js"], blockedFiles: [], riskLevel: "high", status: "approved", targetTrack: "runtime_backend", createdAt: new Date(), updatedAt: new Date() });
  await db.collection("agentTaskApprovals").doc("a1").set({ approvalId: "a1", proposalId: "p1", status: "approved", approvalScope: [], approvedAllowedFiles: ["functions/index.js"], approvedBlockedFiles: [] });
  await db.collection("agentTaskExecutions").doc("e-no-approval").set({ executionId: "e-no-approval", proposalId: "p1", approvalId: "missing", status: "queued" });

  await expectFail("prepareAgentTaskPrHandoff", owner, { executionId: "e-no-approval", branchName: "runtime/ok", title: "t", summary: "s" });

  await expectOk("queueAgentTaskExecution", supervisor, { proposalId: "p1", approvalId: "a1", branchName: "runtime/queue-ok", executorType: "agent" });
  const e2 = (await db.collection("agentTaskExecutions").orderBy("startedAt", "desc").limit(1).get()).docs[0].id;
  await expectFail("prepareAgentTaskPrHandoff", owner, { executionId: e2, branchName: "main", title: "t", summary: "s" });
  await expectFail("prepareAgentTaskPrHandoff", owner, { executionId: e2, branchName: "runtime/unsafe;rm", title: "t", summary: "s" });

  const prepared = await expectOk("prepareAgentTaskPrHandoff", owner, { executionId: e2, branchName: "runtime/safe-branch", title: "handoff", summary: "meta only" });
  assert(prepared.prHandoffStatus === "ready_for_handoff", "handoff should become ready");
  assert((prepared.requiredChecks || []).includes("npm run agent:validate"), "required checks should include base validation");
  assert((prepared.requiredChecks || []).includes("npm --prefix functions run check"), "required checks should include functions check");

  await db.collection("agentTaskProposals").doc("p-ui").set({ proposalId: "p-ui", promptRef: "docs/prompt-ui", protectedScopes: [], allowedFiles: ["app/admin/beta1/page.tsx"], blockedFiles: [], riskLevel: "medium", status: "approved", targetTrack: "runtime_ui", createdAt: new Date(), updatedAt: new Date() });
  await db.collection("agentTaskApprovals").doc("a-ui").set({ approvalId: "a-ui", proposalId: "p-ui", status: "approved", approvalScope: [], approvedAllowedFiles: ["app/admin/beta1/page.tsx"], approvedBlockedFiles: [] });
  await expectOk("queueAgentTaskExecution", supervisor, { proposalId: "p-ui", approvalId: "a-ui", branchName: "runtime/ui-queue", executorType: "agent" });
  const eUi = (await db.collection("agentTaskExecutions").where("proposalId", "==", "p-ui").limit(1).get()).docs[0].id;
  const preparedUi = await expectOk("prepareAgentTaskPrHandoff", owner, { executionId: eUi, branchName: "runtime/ui-handoff", title: "ui", summary: "ui meta" });
  assert((preparedUi.requiredChecks || []).includes("npm run build"), "ui scope should include npm run build");

  await expectFail("markAgentTaskHandoffCreated", user, { executionId: e2 });
  await expectOk("markAgentTaskHandoffCreated", operator, { executionId: e2 });
  await expectOk("blockAgentTaskExecution", owner, { executionId: e2, reason: "manual stop" });

  const audit = await db.collection("agentTaskAuditLog").where("executionId", "==", e2).get();
  assert(audit.size > 0, "block/prepare should write audit logs");

  await db.collection("agentTaskExecutions").doc("client-write-test").set({ status: "queued", executionId: "client-write-test" });

  console.log("agentAdminRolesAuditEmulatorTest: handoff queue assertions completed");
}

run().catch((error) => { console.error(error); process.exit(1); });
