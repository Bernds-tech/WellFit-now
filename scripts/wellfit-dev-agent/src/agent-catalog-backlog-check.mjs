#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CATALOG_PATH = "project-register/agent-catalog.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const POLICY_PATH = "project-register/agent-extension-policy.json";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const DOC_PATH = "docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/agent-catalog-backlog-report.md";

const REQUIRED_CATALOG_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "catalogEntrySchema",
  "lifecycleStatuses",
  "agentTypes",
  "extensionPolicyReference",
  "entries"
];

const REQUIRED_CATALOG_ENTRY_FIELDS = [
  "id",
  "name",
  "status",
  "agentType",
  "purpose",
  "ownerArea",
  "primaryRegisters",
  "humanReadableDocs",
  "validationScripts",
  "qualityGateIntegrated",
  "relatedAgents",
  "relatedRegisters",
  "allowedExtensionTypes",
  "requiresNewAgentProposalFor",
  "protectedBoundaries",
  "nextSafeMaintenanceTask"
];

const REQUIRED_CATALOG_IDS = [
  "autopilot-dry-run",
  "batch-autopilot-dry-run",
  "batch-limited-execution-framework",
  "batch-execution-runner-framework",
  "agent-task-queue",
  "definition-of-done",
  "risk-classifier",
  "agent-work-log",
  "progress-log",
  "task-status-work-log-sync",
  "todo-status-sync",
  "follow-up-detector",
  "pr-outcome-recorder",
  "pr-review-agent",
  "pr-post-creation-mergeability-guard",
  "pr-diff-review-report",
  "auto-merge-eligibility-guard",
  "auto-repair-policy-decision-guard",
  "cross-reference-maintenance-agent",
  "continuity-dependency-sentinel",
  "repository-inventory-audit",
  "product-readiness-matrix",
  "route-api-drift-detector",
  "concept-to-code-gap-analyzer",
  "visual-regression-screenshot-check-framework",
  "research-recommendation-agent",
  "adaptive-user-insight-agent",
  "user-feedback-database-flow",
  "website-agent-framework",
  "website-agent-backlog",
  "website-readiness-baseline-audit",
  "route-link-integrity-audit",
  "trust-compliance-website-audit",
  "approved-agent-build-runner-merge-gate"
];

const REQUIRED_BACKLOG_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "approvalSource",
  "statuses",
  "buildOrderRules",
  "backlogEntrySchema",
  "entries"
];

const REQUIRED_BACKLOG_ENTRY_FIELDS = [
  "id",
  "proposedAgentName",
  "status",
  "priority",
  "reason",
  "expectedBenefit",
  "riskLevel",
  "connectedAgents",
  "connectedRegisters",
  "connectedAgentCount",
  "connectedRegisterCount",
  "requiredDocs",
  "requiredRegisters",
  "requiredValidationScripts",
  "allowedFiles",
  "forbiddenFiles",
  "humanApprovalRequired",
  "alreadyHumanApproved",
  "suggestedBuildOrder",
  "nextRecommendedPromptType",
  "dependencies",
  "protectedBoundaries"
];

const REQUIRED_BACKLOG_STATUSES = [
  "proposed",
  "approved_for_planning",
  "approved_for_build",
  "in_progress",
  "built",
  "blocked",
  "rejected",
  "duplicate",
  "superseded"
];

const REQUIRED_BACKLOG_IDS = [
  "agent-architect-proposal-agent",
  "human-motivation-engine",
  "ethical-engagement-guard",
  "adaptive-difficulty-agent",
  "multisensory-learning-engine",
  "mission-factory-agent",
  "product-intelligence-agent",
  "healthy-retention-agent",
  "reward-fairness-guard",
  "child-safety-guard",
  "health-claims-guard",
  "location-safety-guard",
  "sponsor-integrity-guard",
  "trust-safe-monetization-agent",
  "user-memory-governance-agent",
  "product-memory-agent",
  "ai-buddy-personality-tone-guard",
  "recovery-pause-anti-overuse-guard"
];

const REQUIRED_REFERENCED_FILES = [CATALOG_PATH, BACKLOG_PATH, DOC_PATH, SCRIPT_PATH];
const PROTECTED_RUNTIME_PREFIXES = ["app/", "components/", "lib/", "functions/", "public/", "native/unity/WellFitBuddyAR/"];
const PROTECTED_RUNTIME_EXACT = new Set(["firestore.rules", "package.json", "package-lock.json", "firebase.json"]);

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function missingValues(actual, required) {
  const values = new Set(asArray(actual));
  return required.filter((value) => !values.has(value));
}

function missingFields(object, fields) {
  return fields.filter((field) => !(field in object));
}

function duplicateIds(entries) {
  const seen = new Set();
  const duplicates = new Set();
  for (const entry of entries) {
    if (seen.has(entry.id)) duplicates.add(entry.id);
    seen.add(entry.id);
  }
  return [...duplicates];
}

function isRuntimeFilePattern(pattern) {
  if (typeof pattern !== "string") return false;
  return PROTECTED_RUNTIME_EXACT.has(pattern) || PROTECTED_RUNTIME_PREFIXES.some((prefix) => pattern.startsWith(prefix));
}

function validatesNoProtectedAllowedFiles(entry) {
  return asArray(entry.allowedFiles).filter(isRuntimeFilePattern);
}

function validateEntryRequiredFields(results, entries, requiredFields, label) {
  for (const entry of entries) {
    const missing = missingFields(entry, requiredFields);
    addResult(results, `${label} ${entry.id ?? "unknown"} has required fields`, missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "complete");
  }
}

function validateCatalog(catalog, results) {
  const missingTopLevel = missingFields(catalog, REQUIRED_CATALOG_TOP_LEVEL_FIELDS);
  addResult(results, "catalog required top-level fields exist", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : `${REQUIRED_CATALOG_TOP_LEVEL_FIELDS.length} fields present`);
  addResult(results, "catalog activationState is report_only", catalog.activationState === "report_only", catalog.activationState ?? "missing");

  const entries = asArray(catalog.entries);
  addResult(results, "catalog entries array is non-empty", entries.length > 0, `${entries.length} entries`);
  const missingCatalogIds = missingValues(entries.map((entry) => entry.id), REQUIRED_CATALOG_IDS);
  addResult(results, "required existing catalog entries exist", missingCatalogIds.length === 0, missingCatalogIds.length ? `missing: ${missingCatalogIds.join(", ")}` : `${REQUIRED_CATALOG_IDS.length} required entries present`);
  const duplicates = duplicateIds(entries);
  addResult(results, "catalog entry IDs are unique", duplicates.length === 0, duplicates.length ? `duplicates: ${duplicates.join(", ")}` : "unique");

  validateEntryRequiredFields(results, entries, REQUIRED_CATALOG_ENTRY_FIELDS, "catalog entry");

  const missingEntryEvidence = [];
  for (const entry of entries) {
    if (!asArray(entry.primaryRegisters).length) missingEntryEvidence.push(`${entry.id}: primaryRegisters`);
    if (!asArray(entry.humanReadableDocs).length) missingEntryEvidence.push(`${entry.id}: humanReadableDocs`);
    if (!asArray(entry.validationScripts).length) missingEntryEvidence.push(`${entry.id}: validationScripts`);
    if (!asArray(entry.allowedExtensionTypes).length) missingEntryEvidence.push(`${entry.id}: allowedExtensionTypes`);
    if (!asArray(entry.requiresNewAgentProposalFor).length) missingEntryEvidence.push(`${entry.id}: requiresNewAgentProposalFor`);
    if (!asArray(entry.protectedBoundaries).length) missingEntryEvidence.push(`${entry.id}: protectedBoundaries`);
    if (!hasString(entry.nextSafeMaintenanceTask)) missingEntryEvidence.push(`${entry.id}: nextSafeMaintenanceTask`);
  }
  addResult(results, "catalog entries include required non-empty metadata arrays", missingEntryEvidence.length === 0, missingEntryEvidence.length ? missingEntryEvidence.join("; ") : "complete");
}

function validateBacklog(backlog, catalog, results) {
  const missingTopLevel = missingFields(backlog, REQUIRED_BACKLOG_TOP_LEVEL_FIELDS);
  addResult(results, "backlog required top-level fields exist", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : `${REQUIRED_BACKLOG_TOP_LEVEL_FIELDS.length} fields present`);
  addResult(results, "backlog activationState is approved_planning_backlog", backlog.activationState === "approved_planning_backlog", backlog.activationState ?? "missing");
  const missingStatuses = missingValues(backlog.statuses, REQUIRED_BACKLOG_STATUSES);
  addResult(results, "required backlog statuses exist", missingStatuses.length === 0, missingStatuses.length ? `missing: ${missingStatuses.join(", ")}` : `${REQUIRED_BACKLOG_STATUSES.length} statuses present`);

  const entries = asArray(backlog.entries);
  addResult(results, "backlog entries array is non-empty", entries.length > 0, `${entries.length} entries`);
  const missingBacklogIds = missingValues(entries.map((entry) => entry.id), REQUIRED_BACKLOG_IDS);
  addResult(results, "required approved backlog entries exist", missingBacklogIds.length === 0, missingBacklogIds.length ? `missing: ${missingBacklogIds.join(", ")}` : `${REQUIRED_BACKLOG_IDS.length} required entries present`);
  const duplicates = duplicateIds(entries);
  addResult(results, "backlog entry IDs are unique", duplicates.length === 0, duplicates.length ? `duplicates: ${duplicates.join(", ")}` : "unique");

  validateEntryRequiredFields(results, entries, REQUIRED_BACKLOG_ENTRY_FIELDS, "backlog entry");

  const catalogIds = new Set(asArray(catalog.entries).map((entry) => entry.id));
  for (const entry of entries) {
    const connectedAgents = asArray(entry.connectedAgents);
    const connectedRegisters = asArray(entry.connectedRegisters);
    addResult(results, `backlog entry ${entry.id} connectedAgentCount matches`, entry.connectedAgentCount === connectedAgents.length, `${entry.connectedAgentCount} vs ${connectedAgents.length}`);
    addResult(results, `backlog entry ${entry.id} connectedRegisterCount matches`, entry.connectedRegisterCount === connectedRegisters.length, `${entry.connectedRegisterCount} vs ${connectedRegisters.length}`);
    addResult(results, `backlog entry ${entry.id} already-approved still requires human approval`, entry.alreadyHumanApproved !== true || entry.humanApprovalRequired === true, `alreadyHumanApproved=${entry.alreadyHumanApproved}; humanApprovalRequired=${entry.humanApprovalRequired}`);

    const unknownAgents = connectedAgents.filter((agentId) => !catalogIds.has(agentId));
    addResult(results, `backlog entry ${entry.id} connected agents exist in catalog`, unknownAgents.length === 0, unknownAgents.length ? `unknown: ${unknownAgents.join(", ")}` : "all connected agents cataloged");

    const forbiddenAllowedRuntime = validatesNoProtectedAllowedFiles(entry);
    addResult(results, `backlog entry ${entry.id} allowedFiles avoid runtime/protected paths`, forbiddenAllowedRuntime.length === 0, forbiddenAllowedRuntime.length ? `forbidden allowedFiles: ${forbiddenAllowedRuntime.join(", ")}` : "safe allowedFiles");

    const risk = String(entry.riskLevel ?? "").toLowerCase();
    const hasProtectedBoundary = asArray(entry.protectedBoundaries).some((boundary) => /protected|runtime|legal|privacy|health|child|location|reward|payment|token|wallet|unity|critical/i.test(String(boundary)));
    const protectedOrHighCritical = ["high", "critical"].includes(risk) || hasProtectedBoundary;
    addResult(results, `backlog entry ${entry.id} high/critical/protected is not auto-built`, !protectedOrHighCritical || entry.status !== "built", protectedOrHighCritical ? `status=${entry.status}` : "not high/critical/protected");
  }
}

function validatePolicy(policy, results) {
  addResult(results, "agent extension policy activationState is report_only", policy.activationState === "report_only", policy.activationState ?? "missing");
  addResult(results, "agent extension policy has existing extension rules", asArray(policy.existingAgentExtensionRules).length > 0, `${asArray(policy.existingAgentExtensionRules).length} rules`);
  addResult(results, "agent extension policy has new-agent proposal rules", asArray(policy.newAgentProposalRules).length > 0, `${asArray(policy.newAgentProposalRules).length} rules`);
}

function validateWorkMapAndTodo(results) {
  const workMap = exists(WORK_MAP_PATH) ? readText(WORK_MAP_PATH) : "";
  const todoIndex = exists(TODO_INDEX_PATH) ? readText(TODO_INDEX_PATH) : "";
  for (const file of REQUIRED_REFERENCED_FILES) {
    addResult(results, `Work Map references ${file}`, workMap.includes(file), workMap.includes(file) ? "referenced" : "missing");
    addResult(results, `TODO Index references ${file}`, todoIndex.includes(file), todoIndex.includes(file) ? "referenced" : "missing");
  }
}

function renderTable(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details.replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function renderSummary(catalog, backlog) {
  const catalogEntries = asArray(catalog?.entries);
  const backlogEntries = asArray(backlog?.entries);
  return `- Catalog entries: ${catalogEntries.length}\n- Approved backlog entries: ${backlogEntries.length}\n- Built backlog entries: ${backlogEntries.filter((entry) => entry.status === "built").length}`;
}

function renderReport(results, ready, catalog, backlog) {
  return `# WellFit Agent Catalog and Approved Build Backlog Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nAGENT_CATALOG_BACKLOG_READY=${ready ? "true" : "false"}\n\n## Summary\n\n${renderSummary(catalog, backlog)}\n\n## Checks\n\n${renderTable(results)}\n\n## Safety Confirmations\n\n- Never creates agents automatically: true\n- Never creates future agent registers automatically: true\n- Never modifies runtime files: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables auto-merge: true\n- Never enables auto-repair: true\n- Protected/high-risk entries require human review before build completion: true\n`;
}

function main() {
  const results = [];
  let catalog;
  let backlog;
  let policy;

  for (const file of [CATALOG_PATH, BACKLOG_PATH, POLICY_PATH, WORK_MAP_PATH, TODO_INDEX_PATH, DOC_PATH, SCRIPT_PATH]) {
    addResult(results, `${file} exists`, exists(file), exists(file) ? "found" : "missing");
  }

  try {
    catalog = readJson(CATALOG_PATH);
    addResult(results, `${CATALOG_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${CATALOG_PATH} parses as JSON`, false, error.message);
  }

  try {
    backlog = readJson(BACKLOG_PATH);
    addResult(results, `${BACKLOG_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${BACKLOG_PATH} parses as JSON`, false, error.message);
  }

  try {
    policy = readJson(POLICY_PATH);
    addResult(results, `${POLICY_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${POLICY_PATH} parses as JSON`, false, error.message);
  }

  if (catalog) validateCatalog(catalog, results);
  if (backlog && catalog) validateBacklog(backlog, catalog, results);
  if (policy) validatePolicy(policy, results);
  validateWorkMapAndTodo(results);

  const ready = results.every((result) => result.passed);
  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), renderReport(results, ready, catalog, backlog), "utf8");

  console.log(`WellFit agent catalog/backlog report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never creates agents automatically: true");
  console.log("Never creates future agent registers automatically: true");
  console.log("Never modifies runtime files: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Never enables auto-merge: true");
  console.log("Never enables auto-repair: true");
  console.log(`AGENT_CATALOG_BACKLOG_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
