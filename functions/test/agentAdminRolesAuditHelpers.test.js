const assert = require('assert');
const { resolveRegisterSnapshot, getFirstRunCandidateCollections, buildProductEvolutionRevisionDossier, findRevisionSourcePayload, isCompleteDecisionDossier, REVISION_DOSSIER_MESSAGE } = require('../lib/agentAdminRolesAudit');

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


console.log('agentAdminRolesAudit helper tests passed');
