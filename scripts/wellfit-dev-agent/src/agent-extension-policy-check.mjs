#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POLICY_REL = "project-register/agent-extension-policy.json";
const DOC_REL = "docs/architecture/WELLFIT_AGENT_EXTENSION_POLICY.md";
const SCRIPT_REL = "scripts/wellfit-dev-agent/src/agent-extension-policy-check.mjs";
const WORK_MAP_REL = "todolist/WORK_MAP.md";
const TODO_INDEX_REL = "todolist/TODO_INDEX.md";
const OUTPUT_REL = "scripts/wellfit-dev-agent/output/agent-extension-policy-report.md";
const OUTPUT_PATH = path.join(ROOT, OUTPUT_REL);

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "existingAgentExtensionRules",
  "newAgentProposalRules",
  "allowedExtensionExamples",
  "requiresProposalExamples",
  "overlapDetectionRules",
  "connectedAgentImpactRules",
  "connectedRegisterImpactRules",
  "humanReviewRequiredFor",
  "forbiddenAutoActions",
  "reportOutputSchema"
];

const REQUIRED_EXTENSION_RULE_IDS = [
  "extend_existing_register_fields",
  "extend_existing_validator_checks",
  "compatible_status_values",
  "existing_domain_categories",
  "mapped_cross_reference_rules",
  "improve_report_only_checks",
  "task_queue_required_reads_checks",
  "product_readiness_or_work_map_pointers"
];

const REQUIRED_PROPOSAL_RULE_IDS = [
  "new_agent_name_or_role",
  "new_agent_register",
  "new_workflow_family",
  "new_task_queue_category",
  "overlap_two_or_more_agents",
  "protected_or_high_risk_scope",
  "runtime_execution_authority",
  "automation_authority",
  "protected_scope_change"
];

const REQUIRED_ALLOWED_EXAMPLES = [
  "Website Agent Framework gets Website Agent Backlog",
  "PR Review Agent gets PR Diff Review integration",
  "Continuity Sentinel gets new must-not-forget entries",
  "Task Status Sync gets stricter work-log validation",
  "Product Readiness gets updated next-safe-task metadata",
  "Cross-Reference Maintenance gets new file dependency rules"
];

const REQUIRED_PROPOSAL_EXAMPLES = [
  "Human Motivation Engine",
  "Ethical Engagement Guard",
  "Mission Factory Agent",
  "Product Intelligence Agent",
  "Agent Architect & Proposal Agent",
  "Auto-Merge Activation Agent",
  "Auto-Repair Execution Agent",
  "Runtime Product Fix Agent"
];

const REQUIRED_FORBIDDEN_ACTIONS = [
  "create_new_agent_automatically",
  "create_new_agent_register_automatically",
  "create_new_workflow_family_automatically",
  "approve_pr",
  "merge_pr",
  "enable_auto_merge",
  "repair_files",
  "deploy",
  "self_approve",
  "close_pr",
  "modify_runtime_product_code",
  "modify_protected_logic",
  "modify_unity_or_pr_13_paths",
  "create_duplicate_architecture_or_parallel_system"
];

const REQUIRED_REFERENCES = [POLICY_REL, DOC_REL, SCRIPT_REL];

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readText(relativePath, results) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    results.push({ name: `file exists: ${relativePath}`, passed: false, details: "missing" });
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readPolicy(results) {
  const absolutePath = path.join(ROOT, POLICY_REL);
  if (!fs.existsSync(absolutePath)) {
    results.push({ name: "policy file exists", passed: false, details: POLICY_REL });
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    results.push({ name: "policy parses as JSON", passed: false, details: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details });
}

function validateTopLevel(policy, results) {
  const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => policy?.[field] === undefined || policy?.[field] === null);
  addResult(results, "required top-level fields exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_TOP_LEVEL_FIELDS.length} fields present`);
  addResult(results, "activationState is report_only", policy?.activationState === "report_only", policy?.activationState ?? "missing");
  addResult(results, "version and updated are non-empty", hasText(policy?.version) && hasText(policy?.updated), `version=${policy?.version ?? "missing"}, updated=${policy?.updated ?? "missing"}`);
  addResult(results, "purpose is non-empty", hasText(policy?.purpose), hasText(policy?.purpose) ? "purpose present" : "missing purpose");
}

function validateIdArray(results, name, values, requiredIds, idKey = "id") {
  const items = asArray(values);
  const ids = new Set(items.map((item) => item?.[idKey]).filter(Boolean));
  const missing = requiredIds.filter((id) => !ids.has(id));
  const incomplete = items.filter((item) => !hasText(item?.[idKey])).length;
  addResult(results, name, missing.length === 0 && incomplete === 0, missing.length ? `missing: ${missing.join(", ")}` : `${requiredIds.length} required entries present`);
}

function validateExampleArray(results, name, values, requiredExamples) {
  const examples = new Set(asArray(values).map((item) => item?.example).filter(Boolean));
  const missing = requiredExamples.filter((example) => !examples.has(example));
  const incomplete = asArray(values).filter((item) => !hasText(item?.example) || !hasText(item?.reason)).map((item) => item?.example ?? "<unknown>");
  addResult(results, name, missing.length === 0 && incomplete.length === 0, missing.length ? `missing: ${missing.join(", ")}` : incomplete.length ? `incomplete: ${incomplete.join(", ")}` : `${requiredExamples.length} required examples present`);
}

function validatePolicySections(policy, results) {
  validateIdArray(results, "extension rules exist", policy?.existingAgentExtensionRules, REQUIRED_EXTENSION_RULE_IDS);
  validateIdArray(results, "new-agent proposal rules exist", policy?.newAgentProposalRules, REQUIRED_PROPOSAL_RULE_IDS);
  validateExampleArray(results, "allowed extension examples exist", policy?.allowedExtensionExamples, REQUIRED_ALLOWED_EXAMPLES);
  validateExampleArray(results, "proposal-required examples exist", policy?.requiresProposalExamples, REQUIRED_PROPOSAL_EXAMPLES);

  addResult(results, "overlap detection rules exist", asArray(policy?.overlapDetectionRules).length >= 4, `${asArray(policy?.overlapDetectionRules).length} rules found`);
  addResult(results, "connected agent impact rules exist", asArray(policy?.connectedAgentImpactRules).length >= 3, `${asArray(policy?.connectedAgentImpactRules).length} rules found`);
  addResult(results, "connected register impact rules exist", asArray(policy?.connectedRegisterImpactRules).length >= 3, `${asArray(policy?.connectedRegisterImpactRules).length} rules found`);
  addResult(results, "human review requirements exist", asArray(policy?.humanReviewRequiredFor).length >= 5, `${asArray(policy?.humanReviewRequiredFor).length} rules found`);

  const forbidden = new Set(asArray(policy?.forbiddenAutoActions));
  const missingForbidden = REQUIRED_FORBIDDEN_ACTIONS.filter((action) => !forbidden.has(action));
  addResult(results, "forbidden auto actions exist", missingForbidden.length === 0, missingForbidden.length ? `missing: ${missingForbidden.join(", ")}` : `${REQUIRED_FORBIDDEN_ACTIONS.length} required forbidden actions present`);

  const schema = policy?.reportOutputSchema ?? {};
  const schemaReady = schema.path === OUTPUT_REL && schema.mode === "REPORT_ONLY" && String(schema.readyLine ?? "").includes("AGENT_EXTENSION_POLICY_READY") && asArray(schema.stdoutSignals).some((signal) => String(signal).includes("Never creates agents"));
  addResult(results, "report output schema is report-only", schemaReady, schemaReady ? "schema path/mode/ready line/stdout signals present" : "schema is incomplete");
}

function validateReferences(results) {
  const workMap = readText(WORK_MAP_REL, results);
  const todoIndex = readText(TODO_INDEX_REL, results);
  const doc = readText(DOC_REL, results);

  const missingWorkMap = REQUIRED_REFERENCES.filter((reference) => !workMap.includes(reference));
  const missingTodoIndex = REQUIRED_REFERENCES.filter((reference) => !todoIndex.includes(reference));
  const missingDocRefs = [POLICY_REL, SCRIPT_REL].filter((reference) => !doc.includes(reference));

  addResult(results, "Work Map references policy/doc/script", missingWorkMap.length === 0, missingWorkMap.length ? `missing: ${missingWorkMap.join(", ")}` : "all required references present");
  addResult(results, "TODO Index references policy/doc/script", missingTodoIndex.length === 0, missingTodoIndex.length ? `missing: ${missingTodoIndex.join(", ")}` : "all required references present");
  addResult(results, "architecture doc references policy and script", missingDocRefs.length === 0, missingDocRefs.length ? `missing: ${missingDocRefs.join(", ")}` : "policy and script referenced");
}

function renderReport(results, ready) {
  const table = ["| Check | Status | Details |", "|---|---|---|", ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details} |`)].join("\n");
  return `# WellFit Agent Extension Policy Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nAGENT_EXTENSION_POLICY_READY=${ready ? "true" : "false"}\n\n## Policy file validation\n\n${table}\n\n## Extension rules\n\nThe check validates the required existing-agent extension rule IDs from \`${POLICY_REL}\`.\n\n## New-agent proposal rules\n\nThe check validates proposal-first triggers for new agent names, registers, workflow families, new task categories, two-or-more-agent overlap, protected scope, runtime authority, automation authority, and protected-scope changes.\n\n## Allowed extension examples\n\nThe check validates the required examples: Website Agent Framework + Backlog, PR Review + PR Diff Review, Continuity Sentinel entries, Task Status Sync work-log validation, Product Readiness next-safe-task metadata, and Cross-Reference Maintenance dependency rules.\n\n## Proposal-required examples\n\nThe check validates the required examples: Human Motivation Engine, Ethical Engagement Guard, Mission Factory Agent, Product Intelligence Agent, Agent Architect & Proposal Agent, Auto-Merge Activation Agent, Auto-Repair Execution Agent, and Runtime Product Fix Agent.\n\n## Forbidden auto actions\n\nThis check is report-only and confirms the policy forbids automatic agent creation, automatic register/workflow creation, PR approval, merge, auto-merge enablement, repair, deployment, self-approval, PR close, runtime/product/protected-scope mutation, Unity/PR #13 mutation, and duplicate architecture.\n\n## Work Map and TODO Index references\n\nThe check requires \`${WORK_MAP_REL}\` and \`${TODO_INDEX_REL}\` to reference \`${POLICY_REL}\`, \`${DOC_REL}\`, and \`${SCRIPT_REL}\`.\n\n## Boundaries and human review\n\n- Never creates agents: true\n- Never creates agent registers: true\n- Never creates workflow families: true\n- Never modifies runtime files: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Protected/high-risk scope requires human review: true\n`;
}

function main() {
  const results = [];
  const policy = readPolicy(results);

  if (policy) {
    addResult(results, "policy parses as JSON", true, POLICY_REL);
    validateTopLevel(policy, results);
    validatePolicySections(policy, results);
  }

  validateReferences(results);

  const ready = results.every((result) => result.passed);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, renderReport(results, ready), "utf8");

  console.log(`WellFit agent extension policy report written: ${OUTPUT_REL}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never creates agents: true");
  console.log("Never creates agent registers: true");
  console.log("Never creates workflow families: true");
  console.log("Never modifies runtime files: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`AGENT_EXTENSION_POLICY_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);

  if (!ready) {
    for (const result of results.filter((item) => !item.passed)) console.log(`- ${result.name}: ${result.details}`);
    process.exit(1);
  }
}

main();
