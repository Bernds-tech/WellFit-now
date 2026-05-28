const assert = require("assert");
const {
  buildAgentCenterInboxId,
  sanitizeFirestoreDocIdPart,
} = require("../lib/agentAdminRolesAudit");

function run() {
  const sourceDossierId = "todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md";
  const sanitized = sanitizeFirestoreDocIdPart(sourceDossierId);
  assert(!sanitized.includes("/"), "sanitized doc id part must not contain forward slashes");
  assert(!sanitized.includes("\\"), "sanitized doc id part must not contain backslashes");
  assert.strictEqual(sanitized, "todolist__AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md");

  const input = { sourceType: "product_evolution_first_run", sourceDossierId, listType: "generatedDossiers" };
  const first = buildAgentCenterInboxId(input);
  const second = buildAgentCenterInboxId(input);
  assert.strictEqual(first.inboxId, second.inboxId, "inbox id generation must be stable");
  assert.strictEqual(first.inboxId, "product-evolution-first-run:todolist__AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md:generatedDossiers");
  assert(!first.inboxId.includes("/"), "inbox id must not contain forward slashes");
  assert(!first.inboxId.includes("\\"), "inbox id must not contain backslashes");
  assert.strictEqual(first.sourceDossierIdHadSlash, true, "diagnostic should record slash in original sourceDossierId");
  assert.strictEqual(sourceDossierId, "todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md", "original sourceDossierId remains unchanged for payload fields");
}

run();
