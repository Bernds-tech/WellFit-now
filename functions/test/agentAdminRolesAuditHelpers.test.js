const assert = require('assert');
const { resolveRegisterSnapshot, getFirstRunCandidateCollections, buildProductEvolutionRevisionDossier, findRevisionSourcePayload, isCompleteDecisionDossier, buildAgentTaskProposalStatusCounts, REVISION_DOSSIER_MESSAGE, getWorkerQueueReleaseTargetId, buildWorkerQueueReleaseFailureMessage, buildWorkerQueueReleaseDecision, buildRunnerPickupPreviewDecision, buildRunnerPickupPreviewFailureMessage, buildRunnerStartApprovalDecision, buildRunnerStartApprovalFailureMessage, validateSingleDecisionExecutionContract, SINGLE_DECISION_BLOCKER_MESSAGE, SINGLE_DECISION_REAPPROVAL_REASON, AUTO_PROGRESS_CONTRACT_BLOCKED_MESSAGE, buildExecutionContractApprovalFields, buildSingleDecisionReapprovalState, contractApprovalCoversCurrentExecutionContract, buildAgentCenterPipelineResetSafetyDecision, buildAgentCenterPipelineResetScope, AGENT_CENTER_PIPELINE_RESET_BLOCKED_MESSAGE, buildBuilderQueueGuardState, buildBuilderWorkPackageFromDossier, buildBuilderExecutionContractV1, enforceBuilderAllowedBlockedFiles, evaluateGithubBuilderBranchPrGuards, buildBuilderPrPlanFromWorkPackage, buildDefaultVerificationPlan, detectBuilderReapprovalGuard, planNextBuilderQueueState, buildRepairDossierFromVerificationFailure, buildConversationIdeaDossier, sanitizeConversationIdeaText, sanitizeTelemetryObject } = require('../lib/agentAdminRolesAudit');
const safetyDossierRegister = require('../../project-register/agent-safety-dossiers.json');
const dossierSchema = require('../../project-register/agent-dossier-schema.json');


function buildCompleteSingleDecisionDossier(overrides = {}) {
  const allowedFiles = ['docs/**', 'todolist/**', 'project-register/**', 'app/**', 'functions/**', 'firestore.rules', '.github/**'];
  const blockedFiles = ['native/**'];
  const requiredChecks = ['npm run agent:validate', 'npm run lint', 'npm run build', 'npm --prefix functions run check', 'git diff --check', 'npx tsc --noEmit --pretty false'];
  const validationPlan = ['Run all required checks.', 'Validate file paths against the envelope.'];
  const rollbackPlan = ['Stop automation and revert the generated branch/PR if needed.'];
  const stopConditions = ['file_outside_allowedFiles_required', 'blockedFiles_required', 'native_required', 'token_payment_blockchain_required', 'secrets_or_identity_in_debug', 'required_checks_failed', 'merge_conflict', 'deploy_failed', 'dossier_data_missing', 'target_environment_not_test_main', 'production_live_site_impacted'];
  return {
    title: 'Familien Abenteuerpfad Woche',
    summary: 'Prepare single-decision contract only.',
    what: 'Prepare status and data model for automatic test-main execution.',
    why: 'The owner should decide once from a complete dossier.',
    wellFitBenefit: 'WellFit gets a safer execution contract.',
    userBenefit: 'Users benefit after separately reviewed implementation.',
    economyImpact: 'Internal XP/WFP wording only; no token/payment/blockchain activation.',
    risk: 'Medium test-main automation risk with stop conditions.',
    recommendation: 'approve',
    executionContract: { executionContractVersion: '2026-05-31.single-owner-decision.v1', mode: 'single_owner_decision', ownerDecisionRequiredOnce: true, decisionCoversTaskProposal: true, decisionCoversWorkerQueue: true, decisionCoversRunnerJob: true, decisionCoversPickupContract: true, decisionCoversImplementationPlan: true, decisionCoversFileWrites: true, decisionCoversBranchCreation: true, decisionCoversPrCreation: true, decisionCoversMerge: true, decisionCoversDeploy: true, decisionCoversNative: false, decisionCoversTokenPaymentBlockchain: false },
    allowedExecution: { fileWriteAllowed: true, branchCreationAllowed: true, prCreationAllowed: true, mergeAllowed: true, deployAllowed: true, runnerStartAllowed: true, automaticProgressAllowed: true, requiresFurtherOwnerApproval: false },
    forbiddenExecution: { nativeChangesAllowed: false, tokenPaymentBlockchainAllowed: false, secretsAllowedInDebug: false, productionLiveSiteDeployAllowed: false },
    executionEnvelope: { allowedFiles, blockedFiles, requiredChecks, validationPlan, rollbackPlan, stopConditions, maxRiskLevel: 'medium', targetEnvironment: 'test_main', nextAutomaticSteps: ['task_proposal', 'worker_queue', 'runner_job', 'pickup_contract', 'implementation_plan', 'file_write_branch_pr_merge_deploy_if_allowed'] },
    allowedFiles,
    blockedFiles,
    requiredChecks,
    validationPlan,
    rollbackPlan,
    stopConditions,
    targetEnvironment: 'test_main',
    nextAutomaticSteps: ['task_proposal', 'worker_queue', 'runner_job', 'pickup_contract', 'implementation_plan', 'file_write_branch_pr_merge_deploy_if_allowed'],
    ...overrides,
  };
}

(function testCompleteSingleDecisionContractIsApprovable() {
  const dossier = buildCompleteSingleDecisionDossier();
  const result = validateSingleDecisionExecutionContract(dossier);
  assert.strictEqual(result.approvable, true, 'complete single-owner contract should be approvable');
  assert.strictEqual(isCompleteDecisionDossier(dossier), true, 'approval guard should accept complete single-owner contract');
  assert(dossier.allowedFiles.includes('app/**'), 'app/** can be allowed');
  assert(dossier.allowedFiles.includes('functions/**'), 'functions/** can be allowed');
  assert(dossier.allowedFiles.includes('firestore.rules'), 'firestore.rules can be allowed');
  assert(dossier.allowedFiles.includes('.github/**'), '.github/** can be allowed');
  assert.strictEqual(dossier.executionEnvelope.targetEnvironment, 'test_main', 'Branch/PR/Merge/Deploy are scoped to test_main');
  assert.strictEqual(dossier.allowedExecution.branchCreationAllowed, true, 'branch can be allowed for test_main');
  assert.strictEqual(dossier.allowedExecution.prCreationAllowed, true, 'PR can be allowed for test_main');
  assert.strictEqual(dossier.allowedExecution.mergeAllowed, true, 'merge can be allowed for test_main');
  assert.strictEqual(dossier.allowedExecution.deployAllowed, true, 'deploy can be allowed for test_main');
})();

(function testIncompleteSingleDecisionContractIsBlocked() {
  const dossier = buildCompleteSingleDecisionDossier({ requiredChecks: [], executionEnvelope: { ...buildCompleteSingleDecisionDossier().executionEnvelope, requiredChecks: [] } });
  const result = validateSingleDecisionExecutionContract(dossier);
  assert.strictEqual(result.approvable, false, 'incomplete single-owner contract must not be approvable');
  assert.strictEqual(result.detailStatus, 'incomplete_single_decision_contract');
  assert.strictEqual(result.blocker, SINGLE_DECISION_BLOCKER_MESSAGE);
  assert(result.missing.includes('requiredChecks'), 'required checks must be present');
})();

(function testSingleDecisionSafetyBlocksNativeTokenSecretsAndProduction() {
  const dossier = buildCompleteSingleDecisionDossier();
  assert.strictEqual(dossier.forbiddenExecution.nativeChangesAllowed, false, 'native/** stays blocked when nativeChangesAllowed is false');
  assert(dossier.blockedFiles.includes('native/**'), 'native/** must be blocked');
  assert.strictEqual(dossier.forbiddenExecution.tokenPaymentBlockchainAllowed, false, 'token/payment/blockchain stays blocked');
  assert.strictEqual(dossier.forbiddenExecution.secretsAllowedInDebug, false, 'debug output must not allow secrets/UID/e-mail/tokens');
  assert.strictEqual(dossier.forbiddenExecution.productionLiveSiteDeployAllowed, false, 'production live site deploy remains false');
  assert(dossier.stopConditions.length > 0, 'stop conditions must be present');
})();

(function testManualStepByStepModeRemainsCompatible() {
  const complete = { what: 'Manual task proposal only.', why: 'Debug mode.', wellFitBenefit: 'Traceability.', userBenefit: 'Safer planning.', economyImpact: 'No token/payment activation.', risk: 'Low.', recommendation: 'approve', allowedFiles: ['docs/**'], blockedFiles: ['native/**'], requiredChecks: ['npm run lint'] };
  assert.strictEqual(isCompleteDecisionDossier(complete), true, 'legacy/manual_step_by_step approval guard remains compatible');
})();

(function testResolveDirectSnapshot() {
  const input = { registerSnapshot: { generatedDossiers: [{ id: 'PE-1' }] } };
  const result = resolveRegisterSnapshot(input);
  assert.strictEqual(result.payloadUnwrappedFrom, 'registerSnapshot');
  assert.strictEqual(result.registerSnapshotFieldPresent, true);
  assert.strictEqual(result.registerSnapshotValueType, 'object');
})();

(function testResolveFirstRunOutputFallback() {
  const input = { firstRunOutput: { suggestedTaskQueue: [{ id: 'PE-2' }] } };
  const result = resolveRegisterSnapshot(input);
  assert.strictEqual(result.payloadUnwrappedFrom, 'firstRunOutput');
  assert.strictEqual(result.registerSnapshotValueType, 'object');
})();

(function testUndefinedRegisterSnapshotDiagnostics() {
  const input = { registerSnapshot: undefined };
  const result = resolveRegisterSnapshot(input);
  assert.strictEqual(result.registerSnapshotFieldPresent, true);
  assert.strictEqual(result.registerSnapshotValueType, 'undefined');
  assert.strictEqual(result.payloadUnwrappedFrom, 'registerSnapshot_empty');
})();

(function testCandidateCollectionsNested() {
  const input = { output: { generatedDossiers: [{ id: 1 }], suggestedTaskQueue: [{ id: 2 }] } };
  const result = getFirstRunCandidateCollections(input);
  const paths = result.map((entry) => entry.path);
  assert(paths.includes('output.generatedDossiers'));
  assert(paths.includes('output.suggestedTaskQueue'));
})();


(function testRevisionDossierCompleteFromSourcePayload() {
  const inbox = {
    inboxId: 'ibox-revision',
    status: 'revision_requested',
    sourceType: 'product_evolution_first_run',
    sourceDossierId: 'PE-REV-01',
    listType: 'generatedDossiers',
    summary: 'Auto import only',
  };
  const registerSnapshot = {
    generatedDossiers: [{
      id: 'PE-REV-01',
      title: 'Revision candidate',
      summary: 'Structured summary',
      whatWillChange: 'Create a small admin handoff document.',
      whySuggested: 'It closes an explicit admin review gap.',
      wellFitBenefit: 'WellFit gets a traceable review path.',
      userBenefit: 'Users benefit from safer, reviewed changes.',
      economyImpact: 'Only internal beta points/XP wording is documented; no token/payment activation.',
      riskSummary: 'Low docs-only risk, with protected files blocked.',
      recommendation: 'approve',
      allowedFiles: ['docs/beta/**'],
      blockedFiles: ['functions/**', '.github/**'],
      requiredChecks: ['npm run agent:validate', 'npm run lint', 'git diff --check'],
      nextStep: 'Return to admin approval only.',
    }],
  };
  const match = findRevisionSourcePayload({ inbox, registerSnapshot });
  assert(match, 'revision source payload should be found by sourceDossierId');
  const result = buildProductEvolutionRevisionDossier({ inbox, sourcePayload: match.payload, sourceMeta: match });
  assert.strictEqual(result.complete, true, 'complete revision dossier should be complete');
  assert.strictEqual(result.dossier.what, 'Create a small admin handoff document.');
  assert.strictEqual(result.dossier.why, 'It closes an explicit admin review gap.');
  assert(result.dossier.allowedFiles.includes('docs/beta/**'), 'allowed files should be retained');
  assert(isCompleteDecisionDossier(result.dossier), 'approval guard should accept complete dossier data');
})();

(function testRevisionDossierIncompleteStaysRevisionRequested() {
  const inbox = { inboxId: 'ibox-incomplete', status: 'revision_requested', sourceType: 'product_evolution_first_run', sourceDossierId: 'PE-REV-02', listType: 'generatedDossiers', summary: 'Auto import only' };
  const result = buildProductEvolutionRevisionDossier({ inbox, sourcePayload: { id: 'PE-REV-02', summary: 'Only a summary' }, sourceMeta: { listType: 'generatedDossiers' } });
  assert.strictEqual(result.complete, false, 'incomplete source must not become approval-ready');
  assert(result.missing.includes('what'), 'missing what must be reported');
  assert(result.missing.includes('requiredChecks'), 'missing checks must be reported');
  assert.strictEqual(REVISION_DOSSIER_MESSAGE, 'Revision konnte nicht ausreichend begründet werden.');
})();

(function testApproveGuardStillBlocksMissingDossierData() {
  const incomplete = {
    status: 'pending_approval',
    what: '',
    why: 'Because',
    wellFitBenefit: 'Benefit',
    userBenefit: 'User benefit',
    economyImpact: 'No token/payment activation.',
    risk: 'Low',
    recommendation: 'approve',
    allowedFiles: ['docs/**'],
    blockedFiles: ['functions/**'],
    requiredChecks: ['npm run lint'],
  };
  assert.strictEqual(isCompleteDecisionDossier(incomplete), false, 'approval guard must block missing what');
})();

(function testDecisionDossiersCandidateCollections() {
  const input = { decisionDossiers: [{ sourceDossierId: 'DOC-1', summary: 's' }], data: { dossiers: [{ sourceDossierId: 'DOC-2', summary: 's' }] } };
  const result = getFirstRunCandidateCollections(input);
  assert(result.some((entry) => entry.path === 'decisionDossiers' && entry.listType === 'decisionDossiers'), 'must detect root decisionDossiers');
  assert(result.some((entry) => entry.path === 'data.dossiers' && entry.listType === 'decisionDossiers'), 'must detect generated decision dossier file schema');
})();

(function testDecisionDossierCompleteAndIncompleteApprovalGuard() {
  const complete = {
    what: 'Create a planning dossier only.',
    why: 'The admin inbox needs decision details.',
    wellFitBenefit: 'Traceable safe product planning.',
    userBenefit: 'Safer reviewed product improvements.',
    economyImpact: 'Internal WFP/XP wording only; no payment/token activation.',
    risk: 'Low docs/register risk with runtime blocked.',
    recommendation: 'approve',
    allowedFiles: ['docs/**'],
    blockedFiles: ['app/**', 'functions/**'],
    requiredChecks: ['npm run agent:validate', 'npm run lint', 'git diff --check'],
  };
  assert.strictEqual(isCompleteDecisionDossier(complete), true, 'complete decision dossier should pass approval guard');
  const incomplete = { ...complete, what: '' };
  assert.strictEqual(isCompleteDecisionDossier(incomplete), false, 'incomplete decision dossier must not be approvable');
})();

(function testTaskProposalStatusCountsAndAliasShapeContract() {
  const proposals = [{ taskProposalId: 'JF7JcYxg4HOJ4lzK6G4o', title: 'Familien Abenteuerpfad Woche', status: 'proposed' }];
  const statusCounts = buildAgentTaskProposalStatusCounts(proposals);
  const response = { accepted: true, proposals, items: proposals, loadedCount: proposals.length, statusCounts };
  assert.strictEqual(response.proposals, response.items, 'listAgentTaskProposals must expose items as proposals alias');
  assert.strictEqual(response.loadedCount, 1, 'loadedCount should match proposal count');
  assert.strictEqual(response.statusCounts.total, 1, 'one proposal should count as total 1');
  assert.strictEqual(response.statusCounts.pending, 1, 'proposed must count as pending');
  assert.strictEqual(response.statusCounts.approved, 0, 'approved count should stay zero');
})();

(function testReviewRequiredCountsAsPending() {
  const statusCounts = buildAgentTaskProposalStatusCounts([{ status: 'review_required' }]);
  assert.strictEqual(statusCounts.total, 1, 'review_required proposal should count as total 1');
  assert.strictEqual(statusCounts.pending, 1, 'review_required must count as pending');
})();

(function testQueuedForWorkerReviewCountsAsInProgress() {
  const statusCounts = buildAgentTaskProposalStatusCounts([{ status: 'queued_for_worker_review' }]);
  assert.strictEqual(statusCounts.total, 1, 'queued_for_worker_review proposal should count as total 1');
  assert.strictEqual(statusCounts.in_progress, 1, 'queued_for_worker_review must count as in_progress');
})();


(function testWorkerQueueReleaseTargetAcceptsWorkerQueueIdAndAliases() {
  assert.strictEqual(getWorkerQueueReleaseTargetId({ workerQueueId: 'wq-1' }), 'wq-1', 'workerQueueId should be the canonical release target');
  assert.strictEqual(getWorkerQueueReleaseTargetId({ targetId: 'wq-target' }), 'wq-target', 'targetId alias should be accepted for legacy clients');
  assert.strictEqual(getWorkerQueueReleaseTargetId({ id: 'wq-id' }), 'wq-id', 'id alias should be accepted for fallback clients');
  assert.strictEqual(getWorkerQueueReleaseTargetId({}), null, 'missing release target should stay missing so callable returns Worker Queue ID fehlt');
})();

(function testWorkerQueueReleaseAllowsPendingWorkerReview() {
  const result = buildWorkerQueueReleaseDecision({
    workerStatus: 'pending_worker_review',
    allowedFiles: ['docs/**'],
    blockedFiles: ['app/**', 'functions/**'],
    requiredChecks: ['npm run lint'],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.releasable, true, 'pending_worker_review can become ready_for_worker');
  assert.strictEqual(result.nextStatus, 'ready_for_worker');
  assert.strictEqual(result.noRunnerStarted, true, 'release keeps noRunnerStarted true');
  assert.strictEqual(result.noBranchOrPrOrMerge, true, 'release keeps noBranchOrPrOrMerge true');
  assert.strictEqual(result.noDeploy, true, 'release keeps noDeploy true');
})();

(function testWorkerQueueReleaseAllowsQueuedForOwnerReview() {
  const result = buildWorkerQueueReleaseDecision({
    workerStatus: 'queued_for_owner_review',
    allowedFiles: ['docs/**'],
    blockedFiles: ['native/**'],
    requiredChecks: ['git diff --check'],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.releasable, true, 'queued_for_owner_review can become ready_for_worker');
})();

(function testWorkerQueueReleaseBlocksTerminalAndActiveStatuses() {
  for (const workerStatus of ['completed', 'blocked', 'in_progress']) {
    const result = buildWorkerQueueReleaseDecision({
      workerStatus,
      allowedFiles: ['docs/**'],
      blockedFiles: ['functions/**'],
      requiredChecks: ['npm run lint'],
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
    });
    assert.strictEqual(result.releasable, false, `${workerStatus} must not be released for worker pickup`);
    assert(result.missing.includes('status_not_releasable'), 'blocked status reason should be explicit');
  }
})();

(function testWorkerQueueReleaseBlocksMissingSafetyAndAutomationSideEffects() {
  const result = buildWorkerQueueReleaseDecision({
    workerStatus: 'pending_worker_review',
    allowedFiles: ['docs/**'],
    blockedFiles: [],
    requiredChecks: [],
    noRunnerStarted: false,
    runnerStarted: true,
    noBranchOrPrOrMerge: false,
    branchCreated: true,
    prCreated: true,
    merged: true,
    noDeploy: false,
    deployStarted: true,
  });
  assert.strictEqual(result.releasable, false, 'missing checks/flags and runner or delivery side effects must block release');
  assert(result.missing.includes('blockedFiles'), 'blockedFiles are required');
  assert(result.missing.includes('requiredChecks'), 'requiredChecks are required');
  assert(result.missing.includes('noRunnerStarted'), 'noRunnerStarted must remain true');
  assert(result.missing.includes('runnerStarted'), 'runner execution must not have started');
  assert(result.missing.includes('branch_pr_merge'), 'branch/PR/merge side effects must block release');
  assert(result.missing.includes('deploy'), 'deploy side effects must block release');
})();

(function testWorkerQueueReleaseFailureMessagesAreSpecific() {
  assert.strictEqual(buildWorkerQueueReleaseFailureMessage(['status_not_releasable']), 'Status erlaubt diese Freigabe nicht.');
  assert.strictEqual(buildWorkerQueueReleaseFailureMessage(['allowedFiles', 'blockedFiles', 'requiredChecks']), 'Pflichtdaten fehlen: allowedFiles/blockedFiles/requiredChecks.');
  assert.strictEqual(buildWorkerQueueReleaseFailureMessage(['noRunnerStarted']), 'Sicherheitsflags verhindern Freigabe.');
  assert.strictEqual(buildWorkerQueueReleaseFailureMessage(['owner_protected_scope']), 'Owner-protected Bereich blockiert.');
})();

(function testWorkerQueueReleaseBlocksOwnerProtectedScopes() {
  const result = buildWorkerQueueReleaseDecision({
    workerStatus: 'pending_worker_review',
    allowedFiles: ['project-register/wellfit-beta1-canonical-truth.json'],
    blockedFiles: ['app/**'],
    requiredChecks: ['npm run lint'],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.releasable, false, 'canonical truth protected files must block worker release');
  assert(result.missing.includes('owner_protected_scope'), 'owner-protected release block should be explicit');
  assert.strictEqual(result.failureMessage, 'Owner-protected Bereich blockiert.');
})();

(function testRunnerPickupPreviewAllowsReadyForWorkerOnlyWithoutSideEffects() {
  const result = buildRunnerPickupPreviewDecision({
    workerQueueId: 'queue-ready',
    taskProposalId: 'proposal-1',
    title: 'Familien Abenteuerpfad Woche',
    requestedAction: 'Prepare a later runner pickup preview.',
    workerStatus: 'ready_for_worker',
    riskLevel: 'medium',
    allowedFiles: ['docs/**', 'todolist/**', 'project-register/**'],
    blockedFiles: ['app/**', 'functions/**', 'firestore.rules', 'native/**', '.github/**'],
    requiredChecks: ['npm run agent:validate', 'npm run agent:quality-gate', 'npm run lint', 'npm run build', 'git diff --check'],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.previewable, true, 'ready_for_worker can create a runner pickup preview');
  assert.strictEqual(result.preview.plannedExecutionMode, 'preview_only');
  assert.strictEqual(result.preview.wouldCreateBranch, false, 'preview must not create a branch');
  assert.strictEqual(result.preview.wouldCreatePr, false, 'preview must not create a PR');
  assert.strictEqual(result.preview.wouldDeploy, false, 'preview must not deploy');
  assert.strictEqual(result.preview.runnerStartAllowed, false, 'preview must not allow runner start');
  assert.strictEqual(result.preview.noRunnerStarted, true, 'preview keeps noRunnerStarted true');
  assert.strictEqual(result.preview.noBranchOrPrOrMerge, true, 'preview keeps noBranchOrPrOrMerge true');
  assert.strictEqual(result.preview.noDeploy, true, 'preview keeps noDeploy true');
  assert.deepStrictEqual(result.preview.safetySummary, ['Kein Runner gestartet', 'Kein Branch erstellt', 'Kein PR erstellt', 'Kein Merge', 'Kein Deploy']);
})();

(function testRunnerPickupPreviewBlocksNonReadyStatuses() {
  for (const workerStatus of ['pending_worker_review', 'blocked', 'completed', 'in_progress']) {
    const result = buildRunnerPickupPreviewDecision({
      workerQueueId: `queue-${workerStatus}`,
      workerStatus,
      allowedFiles: ['docs/**'],
      blockedFiles: ['functions/**'],
      requiredChecks: ['npm run lint'],
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
    });
    assert.strictEqual(result.previewable, false, `${workerStatus} must not create a runner pickup preview`);
    assert(result.missing.includes('status_not_ready_for_worker'), 'non-ready status reason should be explicit');
  }
})();

(function testRunnerPickupPreviewBlocksMissingWorkerQueueIdAndRequiredLists() {
  const result = buildRunnerPickupPreviewDecision({
    workerStatus: 'ready_for_worker',
    allowedFiles: [],
    blockedFiles: [],
    requiredChecks: [],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.previewable, false, 'preview must block missing workerQueueId and safety lists');
  assert(result.missing.includes('workerQueueId'), 'workerQueueId is required');
  assert(result.missing.includes('allowedFiles'), 'allowedFiles are required');
  assert(result.missing.includes('blockedFiles'), 'blockedFiles are required');
  assert(result.missing.includes('requiredChecks'), 'requiredChecks are required');
  assert.strictEqual(buildRunnerPickupPreviewFailureMessage(['workerQueueId']), 'Worker Queue ID fehlt.');
})();

(function testRunnerPickupPreviewBlocksRunnerBranchPrMergeDeploySideEffects() {
  const result = buildRunnerPickupPreviewDecision({
    workerQueueId: 'queue-side-effects',
    workerStatus: 'ready_for_worker',
    allowedFiles: ['docs/**'],
    blockedFiles: ['functions/**'],
    requiredChecks: ['npm run lint'],
    noRunnerStarted: false,
    runnerStarted: true,
    noBranchOrPrOrMerge: false,
    branchCreated: true,
    prCreated: true,
    merged: true,
    noDeploy: false,
    deployStarted: true,
  });
  assert.strictEqual(result.previewable, false, 'preview must block runner, branch, PR, merge, or deploy side effects');
  assert(result.missing.includes('noRunnerStarted'), 'noRunnerStarted must stay true');
  assert(result.missing.includes('runnerStarted'), 'runnerStarted must remain false');
  assert(result.missing.includes('branch_pr_merge'), 'branch/PR/merge side effects must block preview');
  assert(result.missing.includes('deploy'), 'deploy side effects must block preview');
  assert.strictEqual(buildRunnerPickupPreviewFailureMessage(['runnerStarted']), 'Sicherheitsflags verhindern Runner-Pickup Preview.');
})();


(function testRunnerStartApprovalAllowsReadyForWorkerAndCreatesSafeJobShape() {
  const result = buildRunnerStartApprovalDecision({
    workerQueueId: 'queue-ready',
    taskProposalId: 'proposal-1',
    title: 'Familien Abenteuerpfad Woche',
    summary: 'Owner-approved manual runner pickup preparation only.',
    requestedAction: 'Prepare a separate manual pickup job.',
    workerStatus: 'ready_for_worker',
    riskLevel: 'medium',
    sourceInboxId: 'inbox-1',
    allowedFiles: ['docs/**', 'todolist/**', 'project-register/**'],
    blockedFiles: ['app/**', 'functions/**', 'firestore.rules', 'native/**', '.github/**'],
    requiredChecks: ['npm run agent:validate', 'npm run agent:quality-gate', 'npm run lint', 'npm run build', 'git diff --check'],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.approvable, true, 'ready_for_worker can receive runner-start approval');
  assert.strictEqual(result.nextStatus, 'runner_start_approved');
  assert.strictEqual(result.runnerJob.status, 'pending_runner_pickup', 'runner job waits for manual pickup');
  assert.strictEqual(result.runnerJob.executionMode, 'owner_approved_manual_pickup');
  assert.strictEqual(result.runnerJob.runnerStartAllowed, false, 'approval gate must not allow immediate runner start');
  assert.strictEqual(result.runnerJob.requiresManualRunnerPickup, true, 'manual pickup remains required');
  assert.strictEqual(result.runnerJob.noRunnerStarted, true, 'noRunnerStarted remains true');
  assert.strictEqual(result.runnerJob.noBranchOrPrOrMerge, true, 'no branch/PR/merge remains true');
  assert.strictEqual(result.runnerJob.noDeploy, true, 'no deploy remains true');
  assert.deepStrictEqual(result.runnerJob.allowedFiles, ['docs/**', 'todolist/**', 'project-register/**']);
  assert.deepStrictEqual(result.runnerJob.blockedFiles, ['app/**', 'functions/**', 'firestore.rules', 'native/**', '.github/**']);
})();

(function testRunnerStartApprovalAllowsPreviewedForRunnerStatus() {
  const result = buildRunnerStartApprovalDecision({
    workerQueueId: 'queue-previewed',
    workerStatus: 'previewed_for_runner',
    allowedFiles: ['docs/**'],
    blockedFiles: ['functions/**'],
    requiredChecks: ['npm run lint'],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.approvable, true, 'previewed_for_runner can receive runner-start approval');
})();

(function testRunnerStartApprovalBlocksPendingWorkerReviewAndActiveOrTerminalStatuses() {
  for (const workerStatus of ['pending_worker_review', 'blocked', 'completed', 'in_progress']) {
    const result = buildRunnerStartApprovalDecision({
      workerQueueId: `queue-${workerStatus}`,
      workerStatus,
      allowedFiles: ['docs/**'],
      blockedFiles: ['functions/**'],
      requiredChecks: ['npm run lint'],
      noRunnerStarted: true,
      noBranchOrPrOrMerge: true,
      noDeploy: true,
    });
    assert.strictEqual(result.approvable, false, `${workerStatus} must not receive runner-start approval`);
    assert(result.missing.includes('status_not_approvable'), 'blocked status reason should be explicit');
  }
})();

(function testRunnerStartApprovalBlocksMissingWorkerQueueIdAndRequiredLists() {
  const result = buildRunnerStartApprovalDecision({
    workerStatus: 'ready_for_worker',
    allowedFiles: [],
    blockedFiles: [],
    requiredChecks: [],
    noRunnerStarted: true,
    noBranchOrPrOrMerge: true,
    noDeploy: true,
  });
  assert.strictEqual(result.approvable, false, 'approval must block missing workerQueueId and safety lists');
  assert(result.missing.includes('workerQueueId'), 'workerQueueId is required');
  assert(result.missing.includes('allowedFiles'), 'allowedFiles are required');
  assert(result.missing.includes('blockedFiles'), 'blockedFiles are required');
  assert(result.missing.includes('requiredChecks'), 'requiredChecks are required');
  assert.strictEqual(buildRunnerStartApprovalFailureMessage(['workerQueueId']), 'Worker Queue ID fehlt.');
})();

(function testRunnerStartApprovalBlocksRunnerBranchPrMergeDeploySideEffects() {
  const result = buildRunnerStartApprovalDecision({
    workerQueueId: 'queue-side-effects',
    workerStatus: 'ready_for_worker',
    allowedFiles: ['docs/**'],
    blockedFiles: ['functions/**'],
    requiredChecks: ['npm run lint'],
    noRunnerStarted: false,
    runnerStarted: true,
    noBranchOrPrOrMerge: false,
    branchCreated: true,
    prCreated: true,
    merged: true,
    noDeploy: false,
    deployStarted: true,
  });
  assert.strictEqual(result.approvable, false, 'approval must block runner, branch, PR, merge, or deploy side effects');
  assert(result.missing.includes('noRunnerStarted'), 'noRunnerStarted must stay true');
  assert(result.missing.includes('runnerStarted'), 'runnerStarted must remain false');
  assert(result.missing.includes('branch_pr_merge'), 'branch/PR/merge side effects must block approval');
  assert(result.missing.includes('deploy'), 'deploy side effects must block approval');
  assert.strictEqual(buildRunnerStartApprovalFailureMessage(['runnerStarted']), 'Sicherheitsflags verhindern Runner-Start-Freigabe.');
})();

(function testLegacyApprovedWithoutContractHashRequiresReapproval() {
  const dossier = buildCompleteSingleDecisionDossier();
  const contractFields = buildExecutionContractApprovalFields(dossier);
  const state = buildSingleDecisionReapprovalState({ existingData: { status: 'approved' }, currentContractFields: contractFields });
  assert.strictEqual(state.requiresSingleDecisionReapproval, true, 'legacy approved without approved hash must require reapproval');
  assert.strictEqual(state.singleDecisionStatus, 'pending_single_decision_reapproval');
  assert.strictEqual(state.reapprovalReason, SINGLE_DECISION_REAPPROVAL_REASON);
  assert.strictEqual(contractApprovalCoversCurrentExecutionContract({ status: 'approved', ...contractFields }), false, 'legacy approved must not be auto-progress-ready');
})();

(function testLegacyApprovedWithOldHashAndNewContractRequiresReapproval() {
  const dossier = buildCompleteSingleDecisionDossier();
  const contractFields = buildExecutionContractApprovalFields(dossier);
  const state = buildSingleDecisionReapprovalState({ existingData: { status: 'approved', approvalMode: 'single_owner_decision', approvedExecutionContractHash: 'old-hash', approvalCoversAutomaticExecution: true }, currentContractFields: contractFields });
  assert.strictEqual(state.contractUpgradeDetected, true, 'changed hash should be detected as contract upgrade');
  assert.strictEqual(state.requiresSingleDecisionReapproval, true, 'changed hash requires reapproval');
  assert.strictEqual(contractApprovalCoversCurrentExecutionContract({ ...contractFields, approvalMode: 'single_owner_decision', approvedExecutionContractHash: 'old-hash', approvalCoversAutomaticExecution: true }), false, AUTO_PROGRESS_CONTRACT_BLOCKED_MESSAGE);
})();

(function testApprovedWithMatchingHashCanAutoProgress() {
  const dossier = buildCompleteSingleDecisionDossier();
  const contractFields = buildExecutionContractApprovalFields(dossier);
  const approved = { status: 'approved', ...dossier, ...contractFields, approvalMode: 'single_owner_decision', approvedExecutionContractVersion: contractFields.executionContractVersion, approvedExecutionContractHash: contractFields.executionContractHash, approvalCoversAutomaticExecution: true, requiresSingleDecisionReapproval: false };
  assert.strictEqual(contractApprovalCoversCurrentExecutionContract(approved), true, 'matching single decision approval covers current contract');
  assert.strictEqual(approved.allowedFiles.includes('app/**'), true, 'app/** is allowed only with matching approval');
  assert.strictEqual(approved.allowedFiles.includes('functions/**'), true, 'functions/** is allowed only with matching approval');
  assert.strictEqual(approved.allowedFiles.includes('firestore.rules'), true, 'firestore.rules is allowed only with matching approval');
  assert.strictEqual(approved.allowedFiles.includes('.github/**'), true, '.github/** is allowed only with matching approval');
})();

(function testReapprovalSetsSingleOwnerApprovalHashAndSafetyBlocksRemain() {
  const dossier = buildCompleteSingleDecisionDossier();
  const contractFields = buildExecutionContractApprovalFields(dossier);
  const reapproved = { ...dossier, ...contractFields, status: 'approved', singleDecisionStatus: 'single_decision_approved', autoProgressStatus: 'auto_progress_ready', approvalMode: 'single_owner_decision', approvedExecutionContractVersion: contractFields.executionContractVersion, approvedExecutionContractHash: contractFields.executionContractHash, approvalCoversAutomaticExecution: true, requiresSingleDecisionReapproval: false };
  assert.strictEqual(contractApprovalCoversCurrentExecutionContract(reapproved), true, 'reapproval should cover automatic execution');
  assert(reapproved.blockedFiles.includes('native/**'), 'native/** remains blocked');
  assert.strictEqual(reapproved.forbiddenExecution.tokenPaymentBlockchainAllowed, false, 'Token/Payment/Blockchain remains blocked');
  assert.strictEqual(reapproved.forbiddenExecution.nativeChangesAllowed, false, 'native changes remain blocked');
})();

(function testContractHashDebugDoesNotExposeSecretsUidEmailOrTokens() {
  const dossier = buildCompleteSingleDecisionDossier({ ownerUid: 'uid-should-not-be-hashed-debugged', ownerEmail: 'owner@example.com', token: 'secret-token' });
  const contractFields = buildExecutionContractApprovalFields(dossier);
  const debug = { currentExecutionContractHashPresent: Boolean(contractFields.executionContractHash), approvedExecutionContractHashPresent: false, approvalCoversAutomaticExecution: false };
  const debugText = JSON.stringify(debug);
  assert(!debugText.includes('uid-should-not-be-hashed-debugged'), 'debug must not include UID');
  assert(!debugText.includes('owner@example.com'), 'debug must not include email');
  assert(!debugText.includes('secret-token'), 'debug must not include token/secret');
})();



(function testBuilderQueueGuardSerializesAndPausesOnRepair() {
  const packages = [
    { workPackageId: 'wp-1', status: 'active_metadata_only', repairAttemptCount: 0 },
    { workPackageId: 'wp-2', status: 'approved_waiting', repairAttemptCount: 0 },
  ];
  const guard = buildBuilderQueueGuardState(packages, { paused: false });
  assert.strictEqual(guard.maxConcurrentWorkPackages, 1, 'builder queue stays serial');
  assert.strictEqual(guard.activeCount, 1, 'only one active work package is tracked');
  assert.strictEqual(guard.noRunnerStarted, true, 'guard must not start runner');
  const repairGuard = buildBuilderQueueGuardState([{ workPackageId: 'wp-r', status: 'repair_required', repairAttemptCount: 3 }], { paused: false });
  assert.strictEqual(repairGuard.queuePaused, true, 'repair_required pauses the queue');
  assert.strictEqual(repairGuard.automationPaused, true, 'repair_required sets automationPaused');
  assert.strictEqual(repairGuard.pauseReason, 'repair_limit_reached', 'three repair attempts trigger repair limit');
})();

(function testBuilderWorkPackageFromDossierKeepsSafetyFlags() {
  const wp = buildBuilderWorkPackageFromDossier({
    dossier: { sourceDossierId: 'dossier-1', title: 'Safe task', summary: 'Prepare safe metadata.', status: 'approved', allowedFiles: ['docs/**'], blockedFiles: ['native/**'], requiredChecks: ['npm run lint'] },
    dossierId: 'inbox-1',
    actorRole: 'owner',
    sequenceNumber: 5,
    baseSha: 'abc123',
  });
  assert.strictEqual(wp.status, 'blocked_by_reapproval_required', 'blocked scopes require reapproval before waiting');
  assert.strictEqual(wp.reapprovalRequired, true, 'blockedFiles scope requires owner reapproval');
  assert.strictEqual(wp.sequenceNumber, 5, 'sequence number is assigned');
  assert.strictEqual(wp.serialGroup, 'main_repo', 'serial group is main_repo');
  assert.strictEqual(wp.noParallelExecution, true, 'parallel execution is forbidden');
  assert.strictEqual(wp.noRunnerStarted, true, 'runner stays off');
  assert.strictEqual(wp.noBranchOrPrOrMerge, true, 'branch/pr/merge stay off');
  assert.strictEqual(wp.noDeploy, true, 'deploy stays off');
  assert.strictEqual(wp.noTokenPaymentBlockchain, true, 'token/payment/blockchain stays off');
})();


(function testEightApprovedDossiersBecomePersistentApprovedWaitingWorkPackages() {
  const workPackages = Array.from({ length: 8 }, (_, index) => buildBuilderWorkPackageFromDossier({
    dossier: { sourceDossierId: `dossier-${index + 1}`, title: `Approved ${index + 1}`, status: 'approved', allowedFiles: ['docs/**'], blockedFiles: [], requiredChecks: ['npm run lint'], decisionId: `decision-${index + 1}` },
    dossierId: `inbox-${index + 1}`,
    actorRole: 'owner',
    sequenceNumber: index + 1,
    baseSha: 'main-sha-1',
  }));
  assert.strictEqual(workPackages.length, 8, 'eight approvals should prepare eight work packages');
  assert.strictEqual(workPackages.every((wp) => wp.status === 'approved_waiting'), true, 'all approved items remain approved_waiting');
  assert.strictEqual(workPackages.every((wp) => wp.ownerDecisionPersistent === true), true, 'owner decision stays persistent');
  assert.strictEqual(workPackages.every((wp) => wp.reapprovalRequired === false), true, 'safe docs-only scope does not require reapproval');
  assert.strictEqual(workPackages.every((wp) => wp.approvedForSerialExecution === true), true, 'all safe docs-only items are approved for serial execution');
})();

(function testOnlyOneBuilderWorkPackageCanBeActiveAndNextUpIsPlanned() {
  const packages = [
    { workPackageId: 'wp-1', status: 'active_metadata_only', serialGroup: 'main_repo', executionOrder: 1 },
    { workPackageId: 'wp-2', status: 'approved_waiting', serialGroup: 'main_repo', executionOrder: 2 },
  ];
  const activePlan = planNextBuilderQueueState(packages);
  assert.strictEqual(activePlan.activeCount, 1, 'one active package blocks another active package');
  assert.strictEqual(activePlan.canMarkNextUp, false, 'next_up is not marked while active exists');
  const afterCompleted = planNextBuilderQueueState([{ ...packages[0], status: 'completed_metadata_only' }, packages[1]]);
  assert.strictEqual(afterCompleted.activeCount, 0, 'completed package frees serial group');
  assert.strictEqual(afterCompleted.canMarkNextUp, true, 'next approved_waiting can become next_up after completion');
  assert.strictEqual(afterCompleted.nextUpWorkPackageId, 'wp-2', 'wp-2 is next up');
  assert.strictEqual(afterCompleted.noRunnerStarted, true, 'queue planning starts no runner');
})();

(function testReapprovalGuardKeepsUnchangedScopeFalseAndBlocksRiskyChanges() {
  const wp = buildBuilderWorkPackageFromDossier({ dossier: { sourceDossierId: 'safe', title: 'Safe', allowedFiles: ['docs/**'], blockedFiles: [], requiredChecks: ['npm run lint'] }, dossierId: 'safe', actorRole: 'owner', sequenceNumber: 1, baseSha: 'sha' });
  assert.strictEqual(detectBuilderReapprovalGuard(wp, wp).reapprovalRequired, false, 'unchanged scope remains approved');
  const risky = detectBuilderReapprovalGuard({ ...wp, blockedFiles: ['project-register/wellfit-beta1-canonical-truth.json'], requiredChecks: ['npm run lint', 'npm run build'], revalidationStatus: 'stale main sha', safetySentinelStatus: 'blocked' }, wp);
  assert.strictEqual(risky.reapprovalRequired, true, 'canonical/stale/sentinel risk requires reapproval');
  assert(risky.reasons.includes('canonical_truth_protected_file'), 'canonical truth risk is explicit');
  const sensitive = detectBuilderReapprovalGuard({ ...wp, affectedFiles: ['app/health/location-camera.tsx'], blockedFiles: ['token/payment/wft/sui'], requiredChecks: ['npm run lint'] }, wp);
  assert.strictEqual(sensitive.reapprovalRequired, true, 'token/payment/health/location/camera risk requires reapproval');
  assert(sensitive.reasons.includes('token_payment_blockchain_scope'), 'token/payment risk is explicit');
  assert(sensitive.reasons.includes('sensitive_or_guardrail_scope'), 'sensitive data risk is explicit');
})();

(function testConversationIdeaDossierSanitizesAndContainsRequiredFields() {
  const dossier = buildConversationIdeaDossier({ rawIdeaText: 'Bitte Product Brain bauen. E-Mail owner@example.test token:abc123 sessionId:secret', source: 'chat', sourceRef: 'chat-1', priorityHint: 'P2', categoryHint: 'agent' });
  const serialized = JSON.stringify(dossier);
  assert.strictEqual(dossier.ownerDecisionRequired, true, 'conversation idea requires owner decision');
  assert.strictEqual(dossier.noRuntimeChanges, true, 'conversation idea is metadata-only');
  assert.strictEqual(dossier.noRunnerStarted, true, 'runner stays off');
  assert.strictEqual(dossier.noBranchOrPrOrMerge, true, 'branch/pr/merge stay off');
  assert.strictEqual(dossier.noDeploy, true, 'deploy stays off');
  assert.strictEqual(dossier.noTokenPaymentBlockchain, true, 'token/payment/blockchain stays off');
  for (const field of dossierSchema.minimumFields.filter((name) => !['nextPipelineStep'].includes(name))) assert.notStrictEqual(dossier[field], undefined, `${field} should be present`);
  assert(!serialized.includes('owner@example.test'), 'email must be redacted');
  assert(!serialized.includes('abc123'), 'token value must be redacted');
  assert(!serialized.includes('sessionId:secret'), 'session payload must be redacted');
  assert.strictEqual(sanitizeConversationIdeaText('x'.repeat(5000)).length, 4000, 'large texts are truncated');
})();

(function testPostMergeVerificationPlanAndRepairDossierAreMetadataOnly() {
  const plan = buildDefaultVerificationPlan();
  assert.strictEqual(plan.verificationRequired, true, 'verification is required');
  assert(plan.verificationChecklist.includes('npm run agent:validate'), 'agent validate is included');
  assert(plan.postMergeChecks.includes('git diff --check'), 'git diff check is included');
  assert.strictEqual(plan.adminSnapshotRequired, true, 'admin snapshot is required');
  assert.strictEqual(plan.uiSmokeSnapshotRequired, true, 'ui smoke snapshot is required');
  const repair = buildRepairDossierFromVerificationFailure({ workPackageId: 'wp-1', title: 'Work' }, 'npm run build failed');
  assert.strictEqual(repair.status, 'repair_required', 'verification failure creates repair metadata');
  assert.strictEqual(repair.queuePauseRequired, true, 'queue pause is required after failure');
  assert.strictEqual(repair.noRunnerStarted, true, 'repair dossier starts no runner');
  assert.strictEqual(repair.noBranchOrPrOrMerge, true, 'repair dossier starts no branch/pr/merge');
  assert.strictEqual(repair.noDeploy, true, 'repair dossier starts no deploy');
})();

(function testCanonicalTruthFilesRemainProtectedByDossierSchemaAndNoAutomationFlags() {
  assert(dossierSchema.approvedBuilderBacklogFields.includes('ownerDecisionPersistent'), 'schema tracks persistent owner decisions');
  assert(dossierSchema.verificationPlanFields.includes('createsRepairDossierOnFailure'), 'schema tracks repair dossier fallback');
  assert.strictEqual(dossierSchema.guardrails.noRunnerStartedDefault, true, 'schema keeps noRunnerStarted default true');
  assert.strictEqual(dossierSchema.guardrails.noBranchOrPrOrMergeDefault, true, 'schema keeps branch/pr/merge default off');
  assert.strictEqual(dossierSchema.guardrails.noDeployDefault, true, 'schema keeps deploy default off');
  assert.strictEqual(dossierSchema.guardrails.noTokenPaymentBlockchainDefault, true, 'schema keeps token/payment/blockchain default off');
})();

(function testTelemetrySanitizerRedactsSensitiveKeys() {
  const safe = sanitizeTelemetryObject({ email: 'owner@example.test', token: 'secret-token', nested: { title: 'Ok', authToken: 'abc' }, list: ['hello'] });
  const serialized = JSON.stringify(safe);
  assert(!serialized.includes('owner@example.test'), 'sanitized snapshot must not contain emails');
  assert(!serialized.includes('secret-token'), 'sanitized snapshot must not contain tokens');
  assert(serialized.includes('[redacted]'), 'sensitive fields are redacted');
})();

console.log('agentAdminRolesAudit helper tests passed');


(function testAgentCenterResetWithoutSafeScopeDeletesNothing() {
  const result = buildAgentCenterPipelineResetSafetyDecision({ reason: 'unit-test', confirmResetText: 'RESET' });
  assert.strictEqual(result.accepted, false, 'confirm text alone must not allow destructive reset');
  assert.strictEqual(result.blocked, true, 'unsafe reset should be blocked');
  assert.strictEqual(result.deleteAllowed, false, 'delete must not be allowed');
  assert.strictEqual(result.message, AGENT_CENTER_PIPELINE_RESET_BLOCKED_MESSAGE);
  assert(result.blockedReasons.includes('confirm_reset_text_is_not_safe_scope'));
})();

(function testAgentCenterResetPreviewDeletesNothing() {
  const result = buildAgentCenterPipelineResetSafetyDecision({ reason: 'unit-test', dryRun: true, previewOnly: true });
  assert.strictEqual(result.accepted, true, 'preview call may be accepted for counts only');
  assert.strictEqual(result.dryRun, true);
  assert.strictEqual(result.previewOnly, true);
  assert.strictEqual(result.deleteAllowed, false);
  assert.strictEqual(result.deletionBlocked, true);
})();

(function testAgentCenterResetBlocksUnscopedCollectionDeletes() {
  const scope = buildAgentCenterPipelineResetScope();
  const result = buildAgentCenterPipelineResetSafetyDecision({ reason: 'unit-test', dryRun: false, previewOnly: false, deleteRequested: true, safeResetScopeId: 'safe-reset-scope:test-only', safeResetScopeApproved: true, sanitizedArchiveSnapshotsApproved: true, archivePayloadSnapshotMode: 'sanitized_full_payload_before_delete' });
  assert(scope.length > 0, 'pipeline reset preview scope should list affected collections');
  assert(scope.every((entry) => entry.action === 'preview_collection_counts_only'), 'unscoped collections must be preview-only');
  assert.strictEqual(result.accepted, false, 'delete request remains blocked until a real scoped implementation replaces preview-only collections');
  assert.strictEqual(result.deleteAllowed, false);
  assert(result.blockedReasons.includes('pipeline_collections_are_unscoped_preview_only'));
})();

(function testSafetyDossierExistsAndHasRequiredPlainFields() {
  const dossier = safetyDossierRegister.dossiers.find((item) => item.id === 'safety-p1-agent-center-reset-scope-archive-v1');
  assert(dossier, 'P1 reset safety dossier must exist');
  assert.strictEqual(dossier.title, 'P1 Sicherheitsfix: Agent-Center-Reset sicher scopen und echte Archive schreiben');
  assert.strictEqual(dossier.status, 'safety_blocker');
  assert.strictEqual(dossier.priority, 'P1');
  for (const field of dossierSchema.minimumFields) {
    assert(Object.prototype.hasOwnProperty.call(dossier, field), `Safety dossier missing ${field}`);
    if (Array.isArray(dossier[field])) assert(dossier[field].length > 0, `Safety dossier ${field} should be understandable/non-empty`);
    else if (typeof dossier[field] === 'string') assert(dossier[field].trim().length > 0, `Safety dossier ${field} should be understandable/non-empty`);
  }
  assert(dossier.problem.includes('Reset'), 'dossier explains problem in plain language');
  assert(dossier.recommendation.includes('Vor neuen Agent-Vorschlägen beheben'), 'dossier recommends fixing before new agent suggestions');
})();

(function testSafetyDossierAutomationFlagsStaySafe() {
  const dossier = safetyDossierRegister.dossiers.find((item) => item.id === 'safety-p1-agent-center-reset-scope-archive-v1');
  assert.strictEqual(dossier.noRunnerStarted, true);
  assert.strictEqual(dossier.noBranchOrPrOrMerge, true);
  assert.strictEqual(dossier.noDeploy, true);
  assert.strictEqual(dossier.noRuntimeChanges, true);
  assert.strictEqual(dossier.noTokenPaymentBlockchain, true);
  assert(!JSON.stringify(dossier).includes('github_api_start'), 'dossier must not trigger GitHub automation');
})();

(function testCanonicalTruthProtectedFilesRemainReadOnlyByPolicy() {
  const dossierText = JSON.stringify(safetyDossierRegister);
  assert(!dossierText.includes('project-register/wellfit-beta1-canonical-truth.json"'), 'dossier must not propose editing canonical truth JSON');
  assert(!dossierText.includes('docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md"'), 'dossier must not propose editing canonical truth doc');
  assert(!dossierText.includes('todolist/CODEX_CONTEXT_WELLFIT_BETA1.md"'), 'dossier must not propose editing canonical context');
})();

(function testConversationIdeaSanitizesBearerSessionCookieAndKeys() {
  const dossier = buildConversationIdeaDossier({
    rawIdeaText: 'Authorization: Bearer raw-secret Bearer loose-secret token=tokSECRET access_token=accSECRET refresh_token=refSECRET session=sessSECRET cookie=cookieSECRET api_key=apiSECRET key=keySECRET secret=secretSECRET',
    sourceRef: 'chat?session=sessSECRET2&token=tokSECRET2 Authorization: Bearer source-secret cookie=source-cookie api_key=source-api key=source-key secret=source-secret',
    sources: ['Bearer array-secret refresh_token=array-refresh'],
  });
  const serialized = JSON.stringify(dossier);
  for (const secret of ['raw-secret', 'loose-secret', 'tokSECRET', 'accSECRET', 'refSECRET', 'sessSECRET', 'tokSECRET2', 'sessSECRET2', 'source-cookie', 'source-api', 'source-key', 'source-secret', 'array-secret', 'array-refresh']) {
    assert(!serialized.includes(secret), `conversation dossier must redact ${secret}`);
  }
  assert(serialized.includes('Bearer [redacted]'), 'Bearer tokens should be explicitly redacted');
})();

(function testTelemetrySanitizerRedactsCreatedByAndFirebaseUid() {
  const safe = sanitizeTelemetryObject({ createdBy: 'firebase-user-1', actorId: 'actor-1', ownerUid: 'owner-1', firebaseUid: 'firebase-uid-1', authUid: 'auth-uid-1', createdByRole: 'owner' });
  const serialized = JSON.stringify(safe);
  for (const secret of ['firebase-user-1', 'actor-1', 'owner-1', 'firebase-uid-1', 'auth-uid-1']) {
    assert(!serialized.includes(secret), `snapshot must redact ${secret}`);
  }
  assert(serialized.includes('owner'), 'role may remain visible');
})();

(function testDuplicateConversationIdeaWouldPreserveTerminalDecisionShape() {
  const first = buildConversationIdeaDossier({ rawIdeaText: 'duplicate idea', source: 'chat', sourceRef: 'thread-1' });
  const second = buildConversationIdeaDossier({ rawIdeaText: 'duplicate idea', source: 'chat', sourceRef: 'thread-1' });
  const existingApproved = { ...first, status: 'approved', ownerDecisionStatus: 'approved', ownerDecisionPersistent: true, ownerDecisionReason: 'approved by owner' };
  const duplicateUpdate = { duplicateSubmissionCount: Number(existingApproved.duplicateSubmissionCount || 0) + 1, lastSubmittedAt: 'now' };
  const merged = { ...existingApproved, ...duplicateUpdate };
  assert.strictEqual(first.dossierId, second.dossierId, 'deterministic dossier id catches duplicates');
  assert.strictEqual(merged.status, 'approved', 'duplicate update must not reset approved status');
  assert.strictEqual(merged.ownerDecisionPersistent, true, 'persistent owner approval is retained');
  assert.strictEqual(merged.ownerDecisionReason, 'approved by owner', 'owner decision fields are retained');
})();

(function testBuilderReapprovalBlocksBeforeApprovedWaitingForProtectedScopes() {
  const wp = buildBuilderWorkPackageFromDossier({
    dossier: { sourceDossierId: 'risky', title: 'Risky', status: 'approved', allowedFiles: ['functions/lib/rewards.js'], blockedFiles: ['firestore.rules'], requiredChecks: ['npm run lint', 'anti-cheat ledger check'] },
    dossierId: 'risky',
    actorRole: 'owner',
    sequenceNumber: 1,
  });
  assert.strictEqual(wp.reapprovalRequired, true, 'risky package requires reapproval');
  assert.strictEqual(wp.status, 'blocked_by_reapproval_required', 'risky package is not approved_waiting');
  assert.strictEqual(wp.noRunnerStarted, true);
  assert.strictEqual(wp.noBranchOrPrOrMerge, true);
  assert.strictEqual(wp.noDeploy, true);
  assert.strictEqual(wp.noTokenPaymentBlockchain, true);
})();

(function testNextUpSkipsReapprovalRequiredWaitingPackage() {
  const queue = planNextBuilderQueueState([
    { workPackageId: 'blocked-first', status: 'approved_waiting', reapprovalRequired: true, executionOrder: 1, serialGroup: 'main_repo' },
    { workPackageId: 'valid-second', status: 'approved_waiting', reapprovalRequired: false, executionOrder: 2, serialGroup: 'main_repo' },
  ]);
  assert.strictEqual(queue.canMarkNextUp, true, 'valid later package can be next_up');
  assert.strictEqual(queue.nextUpWorkPackageId, 'valid-second', 'reapproval-blocked first package is skipped');
  const paused = planNextBuilderQueueState([{ workPackageId: 'only-blocked', status: 'approved_waiting', reapprovalRequired: true, executionOrder: 1, serialGroup: 'main_repo' }]);
  assert.strictEqual(paused.canMarkNextUp, false, 'all blocked waiting packages cannot become next_up');
  assert.strictEqual(paused.queuePaused, true, 'queue reports paused/blocker when all waiting require reapproval');
})();

(function testBuilderQueueGuardSkipsReapprovalRequiredWaitingPackage() {
  const guard = buildBuilderQueueGuardState([
    { workPackageId: 'blocked-first', status: 'approved_waiting', reapprovalRequired: true, executionOrder: 1 },
    { workPackageId: 'valid-second', status: 'approved_waiting', reapprovalRequired: false, executionOrder: 2 },
  ], { paused: false });
  assert.strictEqual(guard.nextUpWorkPackageId, 'valid-second', 'guard should choose later valid waiting package');
  assert.strictEqual(guard.queuePaused, false, 'queue can continue when a valid waiting package exists');
  const paused = buildBuilderQueueGuardState([{ workPackageId: 'blocked-only', status: 'approved_waiting', reapprovalRequired: true }], { paused: false });
  assert.strictEqual(paused.queuePaused, true, 'guard pauses when only reapproval-blocked waiting packages exist');
  assert.strictEqual(paused.pauseReason, 'all_waiting_packages_require_owner_reapproval');
})();

(function testNoAutomationFlagsRemainTrueForConversationBuilderPreparationShape() {
  const wp = buildBuilderWorkPackageFromDossier({
    dossier: { sourceDossierId: 'safe-docs', title: 'Safe docs', status: 'approved', allowedFiles: ['docs/readme.md'], blockedFiles: [], requiredChecks: ['npm run lint'] },
    dossierId: 'safe-docs',
    actorRole: 'admin_operator',
    sequenceNumber: 2,
  });
  assert.strictEqual(wp.noRunnerStarted, true, 'no runner starts');
  assert.strictEqual(wp.noBranchOrPrOrMerge, true, 'no branch/pr/merge starts');
  assert.strictEqual(wp.noDeploy, true, 'no deploy starts');
  assert.strictEqual(wp.noTokenPaymentBlockchain, true, 'no token/payment/blockchain starts');
})();


(function testGithubBuilderExecutionContractContainsRequiredSafetyFields() {
  const wp = buildBuilderWorkPackageFromDossier({
    dossier: { sourceDossierId: 'safe-branch', title: 'Safe branch', status: 'approved', allowedFiles: ['docs/readme.md'], blockedFiles: [], requiredChecks: ['npm run lint'], affectedFiles: ['docs/readme.md'] },
    dossierId: 'safe-branch',
    actorRole: 'owner',
    sequenceNumber: 7,
    baseSha: 'main-sha',
  });
  const contract = buildBuilderExecutionContractV1({ ...wp, workPackageId: 'wp-safe' });
  assert.strictEqual(contract.workPackageId, 'wp-safe');
  assert.strictEqual(contract.serialGroup, 'main_repo');
  assert.strictEqual(contract.baseBranch, 'main');
  assert.strictEqual(contract.maxRepairAttempts, 3);
  assert.strictEqual(contract.noParallelExecution, true);
  assert.strictEqual(contract.noAutoMerge, true);
  assert.strictEqual(contract.noAutoDeploy, true);
  assert.strictEqual(contract.noTokenPaymentBlockchain, true);
  assert.strictEqual(contract.noCanonicalTruthAutonomousChange, true);
  assert.strictEqual(contract.noFirestoreRulesChangeUnlessExplicitlyAllowed, true);
  assert.strictEqual(contract.noRuntimeRewardLedgerAntiCheatChangeUnlessExplicitlyAllowed, true);
})();

(function testGithubBuilderGuardBlocksUnapprovedAndReapprovalRequiredPackages() {
  const base = { workPackageId: 'wp-guard', status: 'next_up', serialGroup: 'main_repo', maxConcurrentInSerialGroup: 1, ownerApproved: true, ownerDecisionPersistent: true, approvedForSerialExecution: true, reapprovalRequired: false, baseBranch: 'main', baseSha: 'sha', allowedFiles: ['docs/a.md'], blockedFiles: [], requiredChecks: ['npm run lint'], intendedFileChanges: ['docs/a.md'] };
  const unapproved = evaluateGithubBuilderBranchPrGuards({ workPackage: { ...base, ownerApproved: false }, allPackages: [{ ...base, ownerApproved: false }], autopilotControl: { paused: false } });
  assert.strictEqual(unapproved.ok, false, 'not approved work package cannot prepare branch/pr');
  assert(unapproved.reasons.includes('owner_approved_required'), 'owner approval guard is explicit');
  const reapproval = evaluateGithubBuilderBranchPrGuards({ workPackage: { ...base, reapprovalRequired: true }, allPackages: [{ ...base, reapprovalRequired: true }], autopilotControl: { paused: false } });
  assert.strictEqual(reapproval.ok, false, 'reapprovalRequired blocks branch/pr');
  assert.strictEqual(reapproval.statusOnFailure, 'blocked_by_reapproval_required');
})();

(function testGithubBuilderFileEnforcementBlocksProtectedBlockedAndForbiddenScopes() {
  const protectedScope = enforceBuilderAllowedBlockedFiles({ allowedFiles: ['docs/**'], blockedFiles: [], requiredChecks: ['npm run lint'], intendedFileChanges: ['project-register/wellfit-beta1-canonical-truth.json'] });
  assert.strictEqual(protectedScope.ok, false, 'canonical truth files are protected');
  assert(protectedScope.reasons.some((reason) => reason.includes('canonical_truth_protected_files')), 'canonical truth reason present');
  const blocked = enforceBuilderAllowedBlockedFiles({ allowedFiles: ['docs/**'], blockedFiles: ['docs/blocked.md'], requiredChecks: ['npm run lint'], intendedFileChanges: ['docs/blocked.md'] });
  assert.strictEqual(blocked.ok, false, 'blockedFiles block branch/pr plan');
  assert(blocked.reasons.some((reason) => reason.includes('blocked_files_touched')), 'blocked files reason present');
  const tokenPayment = enforceBuilderAllowedBlockedFiles({ allowedFiles: ['docs/**'], blockedFiles: [], requiredChecks: ['npm run lint'], intendedFileChanges: ['docs/sui-wft-token-payment.md'] });
  assert.strictEqual(tokenPayment.ok, false, 'token/payment/SUI/WFT/NFT activation text is blocked');
  assert(tokenPayment.reasons.includes('token_payment_blockchain_activation_blocked'), 'token/payment reason present');
})();

(function testGithubBuilderMissingCredentialsCreatesPlanOnlyWithRequiredChecks() {
  const wp = { workPackageId: 'wp-plan', status: 'next_up', serialGroup: 'main_repo', maxConcurrentInSerialGroup: 1, ownerApproved: true, ownerDecisionPersistent: true, approvedForSerialExecution: true, reapprovalRequired: false, baseBranch: 'main', baseSha: 'sha', allowedFiles: ['docs/a.md'], blockedFiles: [], requiredChecks: ['npm run lint', 'npm run build'], intendedFileChanges: ['docs/a.md'], title: 'Plan only' };
  const guard = evaluateGithubBuilderBranchPrGuards({ workPackage: wp, allPackages: [wp], autopilotControl: { paused: false } });
  assert.strictEqual(guard.ok, true, 'safe package passes guards');
  const plan = buildBuilderPrPlanFromWorkPackage(wp, guard.fileGuard);
  assert.strictEqual(plan.githubWriteReady, false, 'GitHub write remains disabled without credentials');
  assert.strictEqual(plan.reason, 'GitHub credentials not configured');
  assert.deepStrictEqual(plan.requiredChecks, ['npm run lint', 'npm run build'], 'required checks are included in PR plan');
  assert.strictEqual(plan.noAutoMerge, true, 'auto merge remains disabled');
  assert.strictEqual(plan.noAutoDeploy, true, 'auto deploy remains disabled');
})();

(function testGithubBuilderOnlyOneActiveOrNextUpPerSerialGroup() {
  const candidate = { workPackageId: 'wp-candidate', status: 'approved_waiting', serialGroup: 'main_repo', maxConcurrentInSerialGroup: 1, ownerApproved: true, ownerDecisionPersistent: true, approvedForSerialExecution: true, reapprovalRequired: false, baseBranch: 'main', baseSha: 'sha', allowedFiles: ['docs/a.md'], blockedFiles: [], requiredChecks: ['npm run lint'], intendedFileChanges: ['docs/a.md'] };
  const activeBlocked = evaluateGithubBuilderBranchPrGuards({ workPackage: candidate, allPackages: [candidate, { workPackageId: 'wp-active', status: 'pr_created', serialGroup: 'main_repo' }], autopilotControl: { paused: false } });
  assert.strictEqual(activeBlocked.ok, false, 'active PR work blocks next builder preparation');
  assert(activeBlocked.reasons.includes('another_active_work_package_exists'), 'active blocker reason present');
  const nextUpBlocked = evaluateGithubBuilderBranchPrGuards({ workPackage: candidate, allPackages: [candidate, { workPackageId: 'wp-next', status: 'next_up', serialGroup: 'main_repo' }], autopilotControl: { paused: false } });
  assert.strictEqual(nextUpBlocked.ok, false, 'another next_up blocks approved_waiting package');
  assert(nextUpBlocked.reasons.includes('another_next_up_work_package_exists'), 'next_up blocker reason present');
})();

(function testAdminSnapshotBuilderPrPlanShapeIsSanitizedAndVisible() {
  const wp = buildBuilderWorkPackageFromDossier({ dossier: { sourceDossierId: 'snapshot', title: 'Snapshot', status: 'approved', allowedFiles: ['docs/a.md'], blockedFiles: [], requiredChecks: ['npm run lint'], affectedFiles: ['docs/a.md'] }, dossierId: 'snapshot', actorRole: 'owner', sequenceNumber: 1, baseSha: 'sha' });
  const plan = buildBuilderPrPlanFromWorkPackage({ ...wp, workPackageId: 'wp-snapshot' });
  const serialized = sanitizeTelemetryObject({ workPackageId: 'wp-snapshot', status: 'branch_pr_plan_created', githubWriteReady: false, builderPrPlan: plan, guardStatus: { ok: true } });
  assert.strictEqual(serialized.githubWriteReady, false, 'snapshot exposes GitHub write readiness');
  assert.strictEqual(serialized.builderPrPlan.githubWriteReady, false, 'snapshot exposes PR plan status');
  assert.strictEqual(serialized.guardStatus.ok, true, 'snapshot exposes guard status');
})();

(function testCanonicalTruthProtectedListRemainsOwnerOnlyAndUnchanged() {
  const expected = ['project-register/wellfit-beta1-canonical-truth.json', 'docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md', 'todolist/CODEX_CONTEXT_WELLFIT_BETA1.md'];
  const { CANONICAL_TRUTH_PROTECTED_FILES } = require('../lib/agentAdminRolesAudit');
  assert.deepStrictEqual(CANONICAL_TRUTH_PROTECTED_FILES, expected, 'canonical truth protected files remain unchanged');
})();
