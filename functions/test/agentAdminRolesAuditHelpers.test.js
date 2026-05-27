const assert = require('assert');
const { resolveRegisterSnapshot, getFirstRunCandidateCollections } = require('../lib/agentAdminRolesAudit');

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

console.log('agentAdminRolesAudit helper tests passed');
