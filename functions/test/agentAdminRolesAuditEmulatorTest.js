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

  await expectFail("generateAgentTaskCodexPrompt", owner, { executionId: "e-no-approval" });
  await db.collection("agentTaskProposals").doc("p-blocked").set({ proposalId: "p-blocked", promptRef: "docs/prompt-blocked", protectedScopes: ["privacy"], allowedFiles: ["docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md"], blockedFiles: [], riskLevel: "high", status: "approved", targetTrack: "blocked", createdAt: new Date(), updatedAt: new Date() });
  await db.collection("agentTaskApprovals").doc("a-blocked").set({ approvalId: "a-blocked", proposalId: "p-blocked", status: "approved", approvalScope: ["allow_protected_scopes"], approvedAllowedFiles: ["docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md"], approvedBlockedFiles: [] });
  await expectOk("queueAgentTaskExecution", owner, { proposalId: "p-blocked", approvalId: "a-blocked", branchName: "runtime/blocked", executorType: "agent" });
  const eBlocked = (await db.collection("agentTaskExecutions").where("proposalId", "==", "p-blocked").limit(1).get()).docs[0].id;
  await expectOk("prepareAgentTaskPrHandoff", owner, { executionId: eBlocked, branchName: "runtime/blocked-handoff", title: "blocked", summary: "blocked" });
  await expectFail("generateAgentTaskCodexPrompt", owner, { executionId: eBlocked });

  const generated = await expectOk("generateAgentTaskCodexPrompt", owner, { executionId: eUi });
  assert((generated.promptText || "").includes("runtime/ui-handoff"), "prompt should contain branchName");
  assert((generated.promptText || "").includes("app/admin/beta1/page.tsx"), "prompt should include allowed files");
  assert((generated.promptText || "").includes("npm run build"), "prompt should include required checks");
  assert((generated.promptText || "").toLowerCase().includes("kein auto-merge"), "prompt should include no auto-merge");
  assert((generated.promptText || "").toLowerCase().includes("kein auto-deploy"), "prompt should include no auto-deploy");
  const promptId = generated.handoffPromptId;
  const promptDoc = await db.collection("agentTaskHandoffPrompts").doc(promptId).get();
  assert(promptDoc.exists, "prompt doc should exist");
  const copied = await expectOk("markAgentTaskCodexPromptCopied", operator, { handoffPromptId: promptId });
  assert(copied.status === "copied", "prompt should be copied");
  await expectFail("listAgentTaskHandoffPrompts", user, {});
  const listed = await expectOk("listAgentTaskHandoffPrompts", owner, {});
  assert((listed.prompts || []).length > 0, "prompts should list");
  await expectFail("createAgentWorkerQueueItem", owner, { executionId: "e-no-approval", handoffPromptId: promptId });
  const workerCreated = await expectOk("createAgentWorkerQueueItem", owner, { executionId: eUi, handoffPromptId: promptId });
  assert(workerCreated.workerStatus === "ready_for_worker", "worker should be ready_for_worker");
  const workerId = workerCreated.workerQueueId;
  const workerDoc = await db.collection("agentTaskWorkerQueue").doc(workerId).get();
  assert(workerDoc.exists, "worker doc exists");
  assert(workerDoc.data().humanMergeRequired === true, "humanMergeRequired should be true");
  assert(workerDoc.data().autoMerge === false, "autoMerge should be false");
  assert(workerDoc.data().autoDeploy === false, "autoDeploy should be false");
  await expectFail("claimAgentWorkerQueueItem", user, { workerQueueId: workerId });
  await expectOk("claimAgentWorkerQueueItem", owner, { workerQueueId: workerId });
  await expectOk("updateAgentWorkerQueueStatus", owner, { workerQueueId: workerId, workerStatus: "running" });
  await expectOk("recordAgentWorkerQueueChecks", owner, { workerQueueId: workerId, checks: [{ command: "npm run build", result: "fail", summary: "failed in test" }] });
  await expectFail("updateAgentWorkerQueueStatus", owner, { workerQueueId: workerId, workerStatus: "completed" });
  await expectOk("blockAgentWorkerQueueItem", owner, { workerQueueId: workerId, reason: "manual stop worker" });
  await expectFail("listAgentWorkerQueueItems", user, {});
  const workerList = await expectOk("listAgentWorkerQueueItems", owner, {});
  assert((workerList.items || []).length > 0, "worker list should include entries");
  const workerSingle = await expectOk("getAgentWorkerQueueItem", owner, { workerQueueId: workerId });
  assert((workerSingle.item.protectedScopes || []).length >= 0, "worker item should expose protectedScopes snapshot field");
  assert((workerSingle.item.branchName || "").toLowerCase() !== "main", "worker branch must not be main");
  await db.collection("agentTaskProposals").doc("p-protected").set({ proposalId: "p-protected", promptRef: "docs/protected", protectedScopes: ["privacy", "legal"], allowedFiles: ["functions/lib/agentAdminRolesAudit.js"], blockedFiles: [], riskLevel: "high", status: "approved", targetTrack: "runtime_backend", createdAt: new Date(), updatedAt: new Date() });
  await db.collection("agentTaskApprovals").doc("a-protected").set({ approvalId: "a-protected", proposalId: "p-protected", status: "approved", approvalScope: ["allow_protected_scopes"], approvedAllowedFiles: ["functions/lib/agentAdminRolesAudit.js"], approvedBlockedFiles: [] });
  await expectOk("queueAgentTaskExecution", owner, { proposalId: "p-protected", approvalId: "a-protected", branchName: "runtime/protected", executorType: "agent" });
  const eProtected = (await db.collection("agentTaskExecutions").where("proposalId", "==", "p-protected").limit(1).get()).docs[0].id;
  await expectOk("prepareAgentTaskPrHandoff", owner, { executionId: eProtected, branchName: "runtime/protected-handoff", title: "protected", summary: "protected" });
  const generatedProtected = await expectOk("generateAgentTaskCodexPrompt", owner, { executionId: eProtected });
  assert((generatedProtected.promptText || "").includes("privacy"), "prompt should mention protected scopes");

  await expectFail("markAgentTaskHandoffCreated", user, { executionId: e2 });
  await expectOk("markAgentTaskHandoffCreated", operator, { executionId: e2 });
  await expectOk("blockAgentTaskExecution", owner, { executionId: e2, reason: "manual stop" });

  const audit = await db.collection("agentTaskAuditLog").where("executionId", "==", e2).get();
  assert(audit.size > 0, "block/prepare should write audit logs");

  await db.collection("agentTaskExecutions").doc("client-write-test").set({ status: "queued", executionId: "client-write-test" });

  // Automation gates coverage (PR#211 follow-up)
  const policy = await expectOk("createAgentAutomationPolicy", owner, { workerQueueId: workerId });
  const policyId = policy.policyId;
  await expectFail("approveAgentAutoMerge", owner, { policyId });
  await expectOk("requestAgentAutoMerge", owner, { policyId });
  await expectFail("approveAgentAutoMerge", owner, { policyId });
  await expectOk("requestAgentQualityGateOverride", owner, { policyId, reason: "quality gate flaky in emulator" });
  await expectFail("approveAgentQualityGateOverride", operator, { policyId });
  await expectOk("approveAgentQualityGateOverride", owner, { policyId });
  await expectOk("approveAgentAutoMerge", owner, { policyId });

  // staging/preview can be directly deploy-approved when gates pass
  await expectOk("requestAgentDeploy", owner, { policyId, environment: "staging" });
  const stagingApproved = await expectOk("approveAgentDeploy", owner, { policyId });
  assert(stagingApproved.status === "approved_for_staging_deploy", "staging should finalize in one step");

  // production must require second approval
  await expectOk("requestAgentDeploy", owner, { policyId, environment: "production" });
  await expectFail("approveAgentDeploy", owner, { policyId });
  const runnerBeforeSecond = await expectOk("prepareAgentSupervisedRunnerJob", owner, { workerQueueId: workerId, policyId });
  assert(runnerBeforeSecond.deployAllowed === false, "production must not deploy before second approval");

  await expectFail("approveAgentProductionDeploySecondApproval", supervisor, { policyId });
  const secondApproval = await expectOk("approveAgentProductionDeploySecondApproval", owner, { policyId });
  assert(secondApproval.status === "approved_for_production_deploy", "second approval should finalize production deploy status");

  const policyAfterSecond = await expectOk("getAgentAutomationPolicy", owner, { policyId });
  assert(policyAfterSecond.policy.productionDeploySecondApprovalApproved === true, "second approval flag should be true");
  assert(policyAfterSecond.policy.autoDeployApproved === true, "autoDeployApproved should be true after second approval");
  assert(policyAfterSecond.policy.autoDeploy === true, "autoDeploy should be true after second approval");
  assert(policyAfterSecond.policy.status === "approved_for_production_deploy", "status should be approved_for_production_deploy");

  const runner = await expectOk("prepareAgentSupervisedRunnerJob", owner, { workerQueueId: workerId, policyId });
  assert(runner.runnerStatus === "metadata_only", "runner should stay metadata_only");
  assert(runner.deployAllowed === true, "runner metadata should show deployAllowed true after final approval");
  await expectFail("approveAgentAutoMerge", user, { policyId });
  await expectFail("approveAgentDeploy", user, { policyId });
  await expectFail("getAgentAutomationPolicy", user, { policyId });
  await expectOk("getAgentAutomationPolicy", owner, { policyId });
  await expectOk("listAgentAutomationPolicies", owner, {});


  console.log("agentAdminRolesAuditEmulatorTest: handoff queue assertions completed");
}

run().catch((error) => { console.error(error); process.exit(1); });
