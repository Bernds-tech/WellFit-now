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

  console.log("agentAdminRolesAuditEmulatorTest: handoff queue assertions completed");
}

run().catch((error) => { console.error(error); process.exit(1); });
