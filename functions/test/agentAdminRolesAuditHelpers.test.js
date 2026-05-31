const assert = require('assert');
const { resolveRegisterSnapshot, getFirstRunCandidateCollections, buildProductEvolutionRevisionDossier, findRevisionSourcePayload, isCompleteDecisionDossier, buildAgentTaskProposalStatusCounts, REVISION_DOSSIER_MESSAGE, getWorkerQueueReleaseTargetId, buildWorkerQueueReleaseFailureMessage, buildWorkerQueueReleaseDecision, buildRunnerPickupPreviewDecision, buildRunnerPickupPreviewFailureMessage, buildRunnerStartApprovalDecision, buildRunnerStartApprovalFailureMessage, validateSingleDecisionExecutionContract, SINGLE_DECISION_BLOCKER_MESSAGE } = require('../lib/agentAdminRolesAudit');


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

console.log('agentAdminRolesAudit helper tests passed');
