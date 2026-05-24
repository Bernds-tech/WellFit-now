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

  await expectFail("createAgentTaskProposal", supervisor, {
    title: "ct-block-non-owner",
    promptRef: "docs/prompt",
    requestedAction: "attempt protected edit",
    targetTrack: "docs_register",
    allowedFiles: ["project-register/wellfit-beta1-canonical-truth.json"],
  });

  await expectFail("createAgentTaskProposal", owner, {
    title: "ct-block-owner-without-flag",
    promptRef: "docs/prompt",
    requestedAction: "attempt protected edit",
    targetTrack: "docs_register",
    allowedFiles: ["docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md"],
  });

  const ownerCtProposal = await expectOk("createAgentTaskProposal", owner, {
    title: "ct-owner-approved",
    promptRef: "docs/prompt",
    requestedAction: "owner approved protected change",
    targetTrack: "docs_register",
    allowedFiles: ["todolist/CODEX_CONTEXT_WELLFIT_BETA1.md"],
    ownerCanonicalTruthApproval: true,
  });
  assert(ownerCtProposal.accepted === true, "owner approval flag should allow protected canonical-truth scope");

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
  assert((generated.promptText || "").includes("Canonical Truth Pflicht"), "prompt should include canonical truth guardrail");
  assert((generated.promptText || "").includes("WFP = interne WellFit Punkte"), "prompt should include WFP guardrail");
  assert((generated.promptText || "").includes("Aenderungsbedarf besteht: nur Vorschlag in todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md") || (generated.promptText || "").includes("CANONICAL_TRUTH_CHANGE_PROPOSALS.md"), "prompt should include canonical truth proposal path");
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
  assert(workerDoc.data().canonicalTruthReadRequired === true, "worker queue should snapshot canonical truth read requirement");
  assert(workerDoc.data().canonicalTruthEditable === false, "worker queue should snapshot canonical truth non-editable");
  assert(workerDoc.data().canonicalTruthChangeProposalFile === "todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md", "worker queue should snapshot canonical truth proposal path");
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

  const proposalApproveScope = await expectOk("createAgentTaskProposal", supervisor, {
    title: "approve-scope-ct-test",
    promptRef: "docs/prompt-ct-scope",
    requestedAction: "normal",
    targetTrack: "docs_register",
    allowedFiles: ["docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md"],
  });
  await expectFail("approveAgentTaskProposal", supervisor, {
    proposalId: proposalApproveScope.proposalId,
    approvedAllowedFiles: ["docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md"],
  });

  const proposalOwnerApproveScope = await expectOk("createAgentTaskProposal", owner, {
    title: "approve-scope-ct-owner-test",
    promptRef: "docs/prompt-ct-owner-scope",
    requestedAction: "owner edit",
    targetTrack: "docs_register",
    allowedFiles: ["docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md"],
  });
  await expectFail("approveAgentTaskProposal", owner, {
    proposalId: proposalOwnerApproveScope.proposalId,
    approvedAllowedFiles: ["docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md"],
  });
  const ownerApprovalWithFlag = await expectOk("approveAgentTaskProposal", owner, {
    proposalId: proposalOwnerApproveScope.proposalId,
    approvedAllowedFiles: ["docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md"],
    ownerCanonicalTruthApproval: true,
  });
  assert(ownerApprovalWithFlag.status === "approved", "owner with explicit canonical truth approval flag should pass");

  await db.collection("agentTaskProposals").doc("p-inconsistent").set({ proposalId: "p-inconsistent", promptRef: "docs/prompt-inconsistent", protectedScopes: [], allowedFiles: ["docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md"], blockedFiles: [], riskLevel: "medium", status: "approved", targetTrack: "docs_register", createdAt: new Date(), updatedAt: new Date() });
  await db.collection("agentTaskApprovals").doc("a-inconsistent").set({ approvalId: "a-inconsistent", proposalId: "p-inconsistent", status: "approved", approvalScope: [], approvedAllowedFiles: ["project-register/wellfit-beta1-canonical-truth.json"], approvedBlockedFiles: [], ownerCanonicalTruthApproval: false });
  await expectOk("queueAgentTaskExecution", owner, { proposalId: "p-inconsistent", approvalId: "a-inconsistent", branchName: "runtime/inconsistent-approval", executorType: "agent" });
  const eInconsistent = (await db.collection("agentTaskExecutions").where("proposalId", "==", "p-inconsistent").limit(1).get()).docs[0].id;
  await expectFail("prepareAgentTaskPrHandoff", owner, { executionId: eInconsistent, branchName: "runtime/inconsistent-handoff", title: "inconsistent", summary: "must fail" });

  const proposalSuggestionScope = await expectOk("createAgentTaskProposal", supervisor, {
    title: "ct-proposal-file-allowed",
    promptRef: "docs/prompt-ct-proposal-file",
    requestedAction: "proposal-only",
    targetTrack: "docs_register",
    allowedFiles: ["todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md"],
  });
  assert(proposalSuggestionScope.accepted === true, "canonical truth proposal file should remain allowed for non-owner suggestions");

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
  assert(runner.mergeAllowed === true, "runner metadata should show mergeAllowed true after merge approval");

  const previewWorkerId = (await expectOk("createAgentWorkerQueueItem", owner, { executionId: eUi, handoffPromptId: promptId })).workerQueueId;
  await expectOk("claimAgentWorkerQueueItem", owner, { workerQueueId: previewWorkerId });
  await expectOk("updateAgentWorkerQueueStatus", owner, { workerQueueId: previewWorkerId, workerStatus: "running" });
  await expectOk("recordAgentWorkerQueueChecks", owner, {
    workerQueueId: previewWorkerId,
    checks: [
      { command: "npm run agent:validate", result: "pass" },
      { command: "npm run agent:quality-gate", result: "pass" },
      { command: "npm run lint", result: "pass" },
      { command: "git diff --check", result: "pass" },
      { command: "npm run build", result: "pass" },
    ],
  });
  await expectOk("updateAgentWorkerQueueStatus", owner, { workerQueueId: previewWorkerId, workerStatus: "pr_prepared" });
  const previewPolicyId = (await expectOk("createAgentAutomationPolicy", owner, { workerQueueId: previewWorkerId })).policyId;
  await expectOk("requestAgentAutoMerge", owner, { policyId: previewPolicyId });
  await expectOk("approveAgentAutoMerge", owner, { policyId: previewPolicyId });
  await expectOk("requestAgentDeploy", owner, { policyId: previewPolicyId, environment: "preview" });
  await expectOk("approveAgentDeploy", owner, { policyId: previewPolicyId });
  const previewRunner = await expectOk("prepareAgentSupervisedRunnerJob", owner, { workerQueueId: previewWorkerId, policyId: previewPolicyId });
  assert(previewRunner.runnerStatus === "metadata_only", "preview runner should stay metadata_only");
  assert(previewRunner.deployAllowed === true, "preview deploy should be allowed with green checks");

  const stagingWorkerId = (await expectOk("createAgentWorkerQueueItem", owner, { executionId: eUi, handoffPromptId: promptId })).workerQueueId;
  await expectOk("claimAgentWorkerQueueItem", owner, { workerQueueId: stagingWorkerId });
  await expectOk("updateAgentWorkerQueueStatus", owner, { workerQueueId: stagingWorkerId, workerStatus: "running" });
  await expectOk("recordAgentWorkerQueueChecks", owner, { workerQueueId: stagingWorkerId, checks: [{ command: "npm run build", result: "pass" }, { command: "npm run agent:validate", result: "pass" }, { command: "npm run agent:quality-gate", result: "pass" }, { command: "npm run lint", result: "pass" }, { command: "git diff --check", result: "pass" }] });
  await expectOk("updateAgentWorkerQueueStatus", owner, { workerQueueId: stagingWorkerId, workerStatus: "pr_prepared" });
  const stagingPolicyId = (await expectOk("createAgentAutomationPolicy", owner, { workerQueueId: stagingWorkerId })).policyId;
  await expectOk("requestAgentDeploy", owner, { policyId: stagingPolicyId, environment: "staging" });
  await expectOk("approveAgentDeploy", owner, { policyId: stagingPolicyId });
  const stagingRunner = await expectOk("prepareAgentSupervisedRunnerJob", owner, { workerQueueId: stagingWorkerId, policyId: stagingPolicyId });
  assert(stagingRunner.deployAllowed === true, "staging deploy should be allowed with green checks");

  const failedChecksWorkerId = (await expectOk("createAgentWorkerQueueItem", owner, { executionId: eUi, handoffPromptId: promptId })).workerQueueId;
  await expectOk("claimAgentWorkerQueueItem", owner, { workerQueueId: failedChecksWorkerId });
  await expectOk("updateAgentWorkerQueueStatus", owner, { workerQueueId: failedChecksWorkerId, workerStatus: "running" });
  await expectOk("recordAgentWorkerQueueChecks", owner, { workerQueueId: failedChecksWorkerId, checks: [{ command: "npm run build", result: "fail" }] });
  const failedChecksPolicyId = (await expectOk("createAgentAutomationPolicy", owner, { workerQueueId: failedChecksWorkerId })).policyId;
  const failedChecksRunner = await expectOk("prepareAgentSupervisedRunnerJob", owner, { workerQueueId: failedChecksWorkerId, policyId: failedChecksPolicyId });
  assert(failedChecksRunner.deployAllowed === false, "failed required checks must keep deploy disallowed");

  const snapshotWorker = await db.collection("agentTaskWorkerQueue").doc(workerId).get();
  assert(snapshotWorker.data().autoMerge === true, "approved autoMerge snapshot should remain true");
  assert(snapshotWorker.data().autoDeploy === true, "approved autoDeploy snapshot should remain true");
  await expectFail("approveAgentAutoMerge", user, { policyId });
  await expectFail("approveAgentDeploy", user, { policyId });
  await expectFail("getAgentAutomationPolicy", user, { policyId });
  const policySnapshot = await expectOk("getAgentAutomationPolicy", owner, { policyId });
  assert(policySnapshot.policy.canonicalTruthReadRequired === true, "policy should include canonical truth read metadata");
  assert(policySnapshot.policy.canonicalTruthEditable === false, "policy should block canonical truth edits by default");
  await expectOk("listAgentAutomationPolicies", owner, {});


  const controlDefault = await expectOk("getAgentAutomationControl", owner, {});
  assert((controlDefault.control.automationMode || "off") === "off", "default automation mode should be off");
  await expectOk("setAgentAutomationMode", owner, { automationMode: "supervised" });
  await expectFail("setAgentAutomationMode", operator, { automationMode: "runner_enabled" });
  await expectOk("recordAgentAutomationMergeOutcome", service, { prRef: "#224", mergeStatus: "failed", reason: "checks" });
  const controlAfterMergeFailed = await expectOk("getAgentAutomationControl", owner, {});
  assert(controlAfterMergeFailed.control.automationMode === "repair_required", "merge failed should set repair_required");
  await expectOk("recordAgentAutomationRepairAttempt", service, { result: "failed", reason: "repair-1" });
  await expectOk("recordAgentAutomationRepairAttempt", service, { result: "failed", reason: "repair-2" });
  await expectOk("recordAgentAutomationRepairAttempt", service, { result: "failed", reason: "repair-3" });
  const controlAfterThreeRepairs = await expectOk("getAgentAutomationControl", owner, {});
  assert(controlAfterThreeRepairs.control.automationMode === "halted_waiting_owner", "3 failed repairs should halt automation");
  await expectFail("prepareAgentSupervisedRunnerJob", owner, { workerQueueId: workerId, policyId, taskType: "feature_task" });
  await expectFail("createAgentTaskProposal", supervisor, { title: "blocked-by-halt", promptRef: "docs/test", requestedAction: "none", targetTrack: "docs_register", taskType: "feature_task" });
  await expectFail("approveAgentAutomationContinueAfterHalt", supervisor, {});
  await expectOk("approveAgentAutomationContinueAfterHalt", owner, {});
  await expectOk("recordAgentAutomationMergeOutcome", service, { prRef: "#224", mergeStatus: "failed", reason: "checks again" });
  await expectOk("createAgentTaskProposal", supervisor, { title: "allowed-repair-task", promptRef: "docs/test-repair", requestedAction: "repair", targetTrack: "docs_register", taskType: "repair_task" });

  const githubRunnerJob = await expectOk("prepareAgentGithubRunnerJob", owner, { workerQueueId: previewWorkerId, policyId: previewPolicyId, githubBranchName: "runtime/test-gh-runner" });
  assert(["missing_server_config", "github_api_not_implemented", "metadata_only"].includes(githubRunnerJob.status), "runner prepare must stay honest without real API");
  const prResult = await expectOk("createAgentGithubPullRequest", owner, { jobId: githubRunnerJob.jobId, title: "Runner PR", body: "Body" });
  assert(prResult.status !== "pr_created", "PR must not be reported as created without real GitHub API");
  const runnerJobAfterPr = await expectOk("getAgentGithubRunnerJob", owner, { jobId: githubRunnerJob.jobId, title: "Runner PR", body: "Body" });
  assert(runnerJobAfterPr.job.githubPrRef == null, "githubPrRef must not contain fake PR refs");
  await expectOk("approveAgentGithubAutoMerge", owner, { jobId: githubRunnerJob.jobId, title: "Runner PR", body: "Body" });
  const mergeResult = await expectOk("executeAgentGithubAutoMergeMetadataOrReal", owner, { jobId: githubRunnerJob.jobId, title: "Runner PR", body: "Body" });
  assert(mergeResult.status !== "auto_merged", "auto-merge must not be reported without real GitHub API merge");
  await expectFail("createAgentGithubBranchMetadata", owner, { jobId: githubRunnerJob.jobId, githubBranchName: "main" });

  const automationAudit = await db.collection("agentTaskAuditLog").where("action", "==", "automation_mode_set").get();
  assert(automationAudit.size > 0, "automation control actions should be audited");

  await db.collection("agentTaskProposals").doc("center-low").set({ riskLevel: "low", protectedScopes: [], allowedFiles: ["docs/architecture/x.md"] });
  await db.collection("agentTaskProposals").doc("center-high").set({ riskLevel: "high", protectedScopes: ["canonical_truth"], allowedFiles: ["project-register/wellfit-beta1-canonical-truth.json"] });
  await db.collection("agentCenterMissionProposals").doc("mission-low").set({ riskLevel: "low", protectedScopes: [] });

  await expectFail("approveAgentCenterProposal", user, { targetType: "agent", targetId: "center-low" });
  await expectFail("approveAgentCenterProposal", operator, { targetType: "agent", targetId: "center-high" });
  await expectOk("approveAgentCenterProposal", supervisor, { targetType: "agent", targetId: "center-low" });
  await expectOk("approveAgentCenterProposal", owner, { targetType: "agent", targetId: "center-high" });
  await expectFail("approveAgentCenterProposal", owner, { targetType: "agent", targetId: "unknown-id" });
  await expectOk("rejectAgentCenterProposal", owner, { targetType: "agent", targetId: "center-low" });
  await expectOk("blockAgentCenterProposal", owner, { targetType: "agent", targetId: "center-low" });
  await expectOk("approveMissionCenterProposal", owner, { targetType: "mission", targetId: "mission-low" });

  await db.collection("agentCenterInbox").doc("ibox-approved").set({
    inboxId: "ibox-approved", status: "approved", sourceType: "product_evolution_first_run", sourceDossierId: "PE-01", title: "Approved inbox",
    allowedFiles: ["docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_LOOP.md"], blockedFiles: ["functions/**"], requiredChecks: ["npm run agent:quality-gate"], riskLevel: "medium",
  });
  await db.collection("agentCenterDecisions").doc("d-ibox-approved").set({ targetId: "ibox-approved", decision: "approved", createdAt: new Date() });
  const createdFromInbox = await expectOk("createAgentTaskProposalFromApprovedInboxItem", owner, { inboxId: "ibox-approved" });
  assert(createdFromInbox.taskProposalId, "approved inbox should create task proposal");
  const iboxApprovedAfter = await db.collection("agentCenterInbox").doc("ibox-approved").get();
  assert(iboxApprovedAfter.data().status === "synced_to_task_proposal", "inbox should become synced_to_task_proposal");
  assert(iboxApprovedAfter.data().taskProposalId, "inbox should get taskProposalId");

  await db.collection("agentCenterInbox").doc("ibox-pending").set({ inboxId: "ibox-pending", status: "pending_approval", allowedFiles: ["docs/**"], blockedFiles: ["functions/**"], requiredChecks: ["npm run lint"] });
  await expectFail("createAgentTaskProposalFromApprovedInboxItem", owner, { inboxId: "ibox-pending" });
  await db.collection("agentCenterInbox").doc("ibox-rejected").set({ inboxId: "ibox-rejected", status: "rejected", allowedFiles: ["docs/**"], blockedFiles: ["functions/**"], requiredChecks: ["npm run lint"] });
  await expectFail("createAgentTaskProposalFromApprovedInboxItem", owner, { inboxId: "ibox-rejected" });
  await db.collection("agentCenterInbox").doc("ibox-blocked").set({ inboxId: "ibox-blocked", status: "blocked", allowedFiles: ["docs/**"], blockedFiles: ["functions/**"], requiredChecks: ["npm run lint"] });
  await expectFail("createAgentTaskProposalFromApprovedInboxItem", owner, { inboxId: "ibox-blocked" });

  const firstRunSync = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    registerSnapshot: {
      generatedDossiers: [{ id: "PE-20260523-01", summary: "s", whatWillChange: "w", whySuggested: "y", allowedFiles: ["docs/**"], blockedFiles: [] }],
      suggestedTaskQueue: [{ title: "PE-20260523-02 Candidate", summary: "s", whatWillChange: "w", whySuggested: "y", allowedFiles: ["docs/**"], blockedFiles: [] }],
      recommendedResearchMore: [{ sourceDossierId: "PE-20260523-03", summary: "s", whatWillChange: "w", whySuggested: "y", allowedFiles: ["docs/**"], blockedFiles: [] }],
      blockedItems: [{ title: "invalid-no-id", summary: "s" }],
    },
  });
  assert((firstRunSync.created || 0) + (firstRunSync.updated || 0) >= 3, "sync should create/update PE 01/02/03");
  assert(firstRunSync.callableVersion === "2026-05-24-pr253-snapshot-shape-v2", "sync response must include callableVersion");
  assert(firstRunSync.responseShapeVersion === "agent-center-inbox-sync-v2", "sync response must include responseShapeVersion");
  assert(firstRunSync.payloadUnwrappedFrom === "registerSnapshot", "top-level registerSnapshot must be recognized");
  assert((firstRunSync.skippedReasons && firstRunSync.skippedReasons.missing_sourceDossierId >= 1) || false, "invalid entry should be counted as missing_sourceDossierId");
  const pe01 = await db.collection("agentCenterInbox").doc("product-evolution-first-run:PE-20260523-01:generatedDossiers").get();
  const pe02 = await db.collection("agentCenterInbox").doc("product-evolution-first-run:PE-20260523-02:suggestedTaskQueue").get();
  const pe03 = await db.collection("agentCenterInbox").doc("product-evolution-first-run:PE-20260523-03:recommendedResearchMore").get();
  assert(pe01.exists && pe02.exists && pe03.exists, "stable inbox ids should exist for PE 01/02/03");
  assert((firstRunSync.serverCandidateCount || 0) >= 3, "serverCandidateCount should include PE 01/02/03");
  assert(((firstRunSync.created || 0) + (firstRunSync.updated || 0) + (firstRunSync.skipped || 0)) > 0, "created+updated+skipped should be > 0");
  assert((firstRunSync.serverCandidateCollections || []).some((entry) => entry.listType === "suggestedTaskQueue"), "must detect top-level suggestedTaskQueue");

  const syncOutputShape = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    registerSnapshot: { output: { suggestedTaskQueue: [{ title: "PE-20260523-01 output queue", summary: "s" }] } },
  });
  assert((syncOutputShape.serverCandidateCollections || []).some((entry) => entry.path === "output.suggestedTaskQueue"), "must detect snapshot.output.suggestedTaskQueue");

  const syncDataShape = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    registerSnapshot: { data: { generatedDossiers: [{ id: "PE-20260523-02", summary: "s", whatWillChange: "w", whySuggested: "y" }] } },
  });
  assert((syncDataShape.serverCandidateCollections || []).some((entry) => entry.path === "data.generatedDossiers"), "must detect snapshot.data.generatedDossiers");
  const syncWrappedData = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    data: { registerSnapshot: { suggestedTaskQueue: [{ title: "PE-20260523-01 wrapped", summary: "s", whySuggested: "y" }] } },
  });
  assert(syncWrappedData.payloadUnwrappedFrom === "data.registerSnapshot", "data.registerSnapshot wrapper must be recognized");
  const syncWrappedPayload = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    payload: { registerSnapshot: { suggestedTaskQueue: [{ title: "PE-20260523-02 payload", summary: "s", whySuggested: "y" }] } },
  });
  assert(syncWrappedPayload.payloadUnwrappedFrom === "payload.registerSnapshot", "payload.registerSnapshot wrapper must be recognized");

  const syncStringList = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    registerSnapshot: { generatedDossiers: ["docs/PE-20260523-03.md"] },
  });
  assert((syncStringList.serverCandidateCount || 0) >= 1, "string list must be converted into candidates");

  const syncObjectMap = await expectOk("syncProductEvolutionFirstRunInbox", owner, {
    registerSnapshot: { suggestedTaskQueue: { a: { title: "PE-20260523-01 map", summary: "s", whySuggested: "y" }, b: { title: "no-id" } } },
  });
  assert((syncObjectMap.serverCandidateCount || 0) >= 2, "object map should be expanded into candidates");

  const emptySnapshot = await expectOk("syncProductEvolutionFirstRunInbox", owner, { registerSnapshot: {} });
  assert(emptySnapshot.serverSnapshotReceived === true, "empty snapshot should still be marked as received");
  assert((emptySnapshot.serverCandidateCount || 0) === 0, "empty snapshot should have 0 candidates");
  assert(String(emptySnapshot.message || "").includes("keine Candidate-Arrays"), "empty snapshot needs clear message");

  const undefinedSnapshot = await expectOk("syncProductEvolutionFirstRunInbox", owner, {});
  assert(undefinedSnapshot.serverSnapshotReceived === false, "undefined snapshot should be false when mirror empty");
  assert(undefinedSnapshot.hasRegisterSnapshot === false, "undefined snapshot should set hasRegisterSnapshot=false");

  const centerAudit = await db.collection("agentTaskAuditLog").where("action", "==", "agent_center_rejected").get();
  assert(centerAudit.size > 0, "reject must write audit");
  const centerBlockAudit = await db.collection("agentTaskAuditLog").where("action", "==", "agent_center_blocked").get();
  assert(centerBlockAudit.size > 0, "block must write audit");
  const missionDecision = await db.collection("missionCenterDecisions").where("targetId", "==", "mission-low").get();
  assert(missionDecision.size > 0, "mission approve should write decision record");

  console.log("agentAdminRolesAuditEmulatorTest: handoff queue assertions completed");
}

run().catch((error) => { console.error(error); process.exit(1); });

// GitHub runner integration coverage placeholders
// 1) automation off/paused/halted blocks prepare
// 2) supervised+approved allows prepare
// 3) missing config => missing_server_config no fake success
// 4) main/master blocked
// 5) auto-merge blocked on failed checks
// 6) auto-merge blocked on quality gate fail without override
// 7) auto-merge blocked when blocksAutoMerge true
// 8) metadata-only auto-merge allowed with green gates and missing config
// 9) PR creation without config stays missing_server_config
// 10) merge failure sets repair_required via merge outcome
// 11) canonical truth files remain read-only
// 12) each runner action writes audit
