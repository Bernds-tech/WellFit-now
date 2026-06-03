const assert = require("assert");
const Module = require("module");
const path = require("path");

const functionsRoot = path.resolve(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;

function isInside(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

Module._resolveFilename = function guardedResolveFilename(request, parent, isMain, options) {
  const resolved = originalResolveFilename.call(this, request, parent, isMain, options);
  if (
    parent &&
    parent.filename &&
    isInside(path.resolve(parent.filename), functionsRoot) &&
    request.startsWith(".") &&
    !isInside(path.resolve(resolved), functionsRoot)
  ) {
    throw new Error(`Forbidden Functions runtime require outside functions package: ${request} from ${parent.filename} resolved to ${resolved}`);
  }
  return resolved;
};

try {
  const audit = require("../lib/agentAdminRolesAudit.js");
  assert.strictEqual(typeof audit.registerAgentAdminRolesAudit, "function", "agentAdminRolesAudit exports registerAgentAdminRolesAudit");
  assert.strictEqual(typeof audit.getConversationIdeaSeedDossierById, "function", "seed dossier lookup is exported");
  const seed = audit.getConversationIdeaSeedDossierById("conversation-serial-approved-builder-backlog-v1");
  assert(seed, "functions-packaged seed dossier is available");
  assert.strictEqual(seed.noRunnerStarted, true, "seed keeps noRunnerStarted guard");
  assert.strictEqual(seed.noBranchOrPrOrMerge, true, "seed keeps noBranchOrPrOrMerge guard");
  assert.strictEqual(seed.noDeploy, true, "seed keeps noDeploy guard");
  assert.strictEqual(seed.noTokenPaymentBlockchain, true, "seed keeps noTokenPaymentBlockchain guard");

  require("../index.js");
  console.log("functions startup smoke test passed");
} finally {
  Module._resolveFilename = originalResolveFilename;
}
