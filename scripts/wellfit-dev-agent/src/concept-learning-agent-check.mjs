#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/concept-learning-agent.json";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/concept-learning-agent-report.md";

const REQUIRED_PHASES = [
  "read_wellfit_context",
  "extract_known_facts",
  "detect_unknowns",
  "ask_bernd_questions",
  "store_answer",
  "update_knowledge_core",
  "derive_agent_task",
  "wait_for_admin_approval"
];

const REQUIRED_REFERENCES = [
  "docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md",
  "project-register/agent-control-center.json",
  "project-register/agent-follow-ups.json",
  "project-register/decisions.json",
  "project-register/research-recommendations.json"
];

const REQUIRED_QUESTION_FIELDS = [
  "id",
  "question",
  "why_it_matters",
  "affected_area",
  "risk_level",
  "answer_type",
  "storage_target",
  "follow_up_task_candidate"
];

const REQUIRED_ANSWER_TYPES = [
  "free_text",
  "yes_no",
  "single_choice",
  "multi_choice",
  "number",
  "date",
  "file_reference",
  "approval_decision"
];

const REQUIRED_RISK_LEVELS = ["low", "medium", "high", "critical"];
const REQUIRED_FORBIDDEN_ACTIONS = [
  "modify_runtime_files",
  "change_product_behavior",
  "enable_runtime_personalization",
  "grant_rewards",
  "complete_missions",
  "authorize_anti_cheat",
  "enable_token_wallet_payment_features",
  "collect_protected_data",
  "approve_prs",
  "merge_prs",
  "auto_repair_files",
  "deploy"
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function readJson(results) {
  if (!fs.existsSync(absolute(REGISTER_PATH))) {
    results.fail.push(`Missing registry: ${REGISTER_PATH}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(absolute(REGISTER_PATH), "utf8"));
  } catch (error) {
    results.fail.push(`Registry is not valid JSON: ${error.message}`);
    return null;
  }
}

function includesAll(actual, required) {
  const set = new Set(asArray(actual));
  return required.filter((value) => !set.has(value));
}

function addPass(results, message) {
  results.pass.push(message);
}

function addFail(results, message) {
  results.fail.push(message);
}

function validateTopLevel(data, results) {
  for (const field of ["version", "updated", "agentId", "name", "activationState", "purpose", "readySignal"]) {
    if (!hasText(data?.[field])) addFail(results, `Top-level field ${field} is missing or empty.`);
  }

  if (data?.activationState !== "report_only") addFail(results, "activationState must be report_only.");
  if (data?.scope?.mode !== "REPORT_ONLY") addFail(results, "scope.mode must be REPORT_ONLY.");
  if (data?.scope?.runtimeProductLogicEnabled !== false) addFail(results, "runtime product logic must remain disabled.");
  if (data?.scope?.runtimePersonalizationEnabled !== false) addFail(results, "runtime personalization must remain disabled.");
  if (data?.scope?.mayModifyRuntimeFiles !== false) addFail(results, "Agent must not be allowed to modify runtime files.");
  if (data?.scope?.mayApproveOrMerge !== false) addFail(results, "Agent must not be allowed to approve or merge.");
  if (data?.scope?.mayDeploy !== false) addFail(results, "Agent must not be allowed to deploy.");

  if (data?.readySignal !== "CONCEPT_LEARNING_AGENT_READY=true") {
    addFail(results, "readySignal must be CONCEPT_LEARNING_AGENT_READY=true.");
  }

  addPass(results, "Top-level report-only metadata is present.");
}

function validateReferences(data, results) {
  const references = Object.values(data?.connectedReferences ?? {});
  const missingReferences = REQUIRED_REFERENCES.filter((reference) => !references.includes(reference));
  if (missingReferences.length > 0) addFail(results, `Missing connected references: ${missingReferences.join(", ")}.`);

  for (const reference of REQUIRED_REFERENCES) {
    if (!fs.existsSync(absolute(reference))) addFail(results, `Connected reference does not exist: ${reference}.`);
  }

  addPass(results, "Connected references point to required memory, control, follow-up, decision, and research registers.");
}

function validatePhases(data, results) {
  const phaseMissing = includesAll(data?.requiredPhases, REQUIRED_PHASES);
  if (phaseMissing.length > 0) addFail(results, `Missing required phases: ${phaseMissing.join(", ")}.`);

  const phaseIds = asArray(data?.phaseDefinitions).map((phase) => phase?.id).filter(Boolean);
  const definitionMissing = REQUIRED_PHASES.filter((phase) => !phaseIds.includes(phase));
  if (definitionMissing.length > 0) addFail(results, `Missing phase definitions: ${definitionMissing.join(", ")}.`);

  for (const phase of asArray(data?.phaseDefinitions)) {
    if (!hasText(phase?.purpose)) addFail(results, `Phase ${phase?.id ?? "<unknown>"} is missing a purpose.`);
    if (!hasText(phase?.allowedOutput)) addFail(results, `Phase ${phase?.id ?? "<unknown>"} is missing allowedOutput.`);
  }

  addPass(results, "All concept learning phases are declared and described.");
}

function validateQuestionFormat(data, results) {
  const format = data?.questionFormat;
  const missingFields = includesAll(format?.requiredFields, REQUIRED_QUESTION_FIELDS);
  if (missingFields.length > 0) addFail(results, `Question format is missing required fields: ${missingFields.join(", ")}.`);

  for (const field of REQUIRED_QUESTION_FIELDS) {
    if (!hasText(format?.fieldRules?.[field])) addFail(results, `Question field rule missing for ${field}.`);
    if (!(field in (format?.example ?? {}))) addFail(results, `Question example is missing ${field}.`);
  }

  const rulesText = JSON.stringify(format?.fieldRules ?? {});
  for (const riskLevel of REQUIRED_RISK_LEVELS) {
    if (!rulesText.includes(riskLevel)) addFail(results, `Question field rules must mention risk level ${riskLevel}.`);
  }
  for (const answerType of REQUIRED_ANSWER_TYPES) {
    if (!rulesText.includes(answerType)) addFail(results, `Question field rules must mention answer_type ${answerType}.`);
  }

  const example = format?.example ?? {};
  if (!REQUIRED_RISK_LEVELS.includes(example.risk_level)) addFail(results, "Question example must use an allowed risk_level.");
  if (!REQUIRED_ANSWER_TYPES.includes(example.answer_type)) addFail(results, "Question example must use an allowed answer_type.");
  if (!asArray(example.affected_area).length) addFail(results, "Question example affected_area must be a non-empty array.");

  addPass(results, "Machine-readable question format contains all required fields, rules, and example values.");
}

function validateStorageAndApproval(data, results) {
  const storageTargets = asArray(data?.storageTargets?.answers);
  for (const target of [
    "project-register/decisions.json",
    "project-register/agent-follow-ups.json",
    "project-register/research-recommendations.json",
    "docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md"
  ]) {
    if (!storageTargets.includes(target)) addFail(results, `Storage targets missing ${target}.`);
  }

  if (data?.storageTargets?.knowledgeCore !== "docs/architecture/WELLFIT_KNOWLEDGE_CORE.md") {
    addFail(results, "Knowledge core storage target must be docs/architecture/WELLFIT_KNOWLEDGE_CORE.md.");
  }
  if (data?.approvalPolicy?.adminApprovalRequiredBeforeImplementation !== true) addFail(results, "Admin approval must be required before implementation.");
  if (data?.approvalPolicy?.adminApprovalRequiredBeforeRuntimeChanges !== true) addFail(results, "Admin approval must be required before runtime changes.");
  if (data?.approvalPolicy?.ownerApprovalRequiredForCriticalOrProtectedScope !== true) addFail(results, "Owner approval must be required for critical/protected scope.");
  if (data?.approvalPolicy?.systemAgentMayApprove !== false) addFail(results, "System agents must not be allowed to approve.");
  if (data?.approvalPolicy?.approvalMustReferenceQuestionId !== true) addFail(results, "Approval must reference a question id.");

  addPass(results, "Storage targets and approval gate are constrained to planning/register documents.");
}

function validateSafetyBoundaries(data, results) {
  const forbiddenMissing = includesAll(data?.forbiddenAutoActions, REQUIRED_FORBIDDEN_ACTIONS);
  if (forbiddenMissing.length > 0) addFail(results, `Forbidden auto-actions missing: ${forbiddenMissing.join(", ")}.`);

  const protectedAreas = asArray(data?.protectedScopeRules?.protectedAreas);
  for (const protectedArea of ["health", "location", "camera", "child_safety", "privacy", "token", "wallet", "payment", "reward_authority", "mission_completion_authority", "Unity_AR"]) {
    if (!protectedAreas.includes(protectedArea)) addFail(results, `Protected area missing: ${protectedArea}.`);
  }
  if (data?.protectedScopeRules?.defaultRiskLevelForProtectedAreas !== "high") addFail(results, "Protected areas must default to high risk.");

  addPass(results, "Safety boundaries block runtime, protected-data, reward, mission, approval, merge, repair, and deploy authority.");
}

function validateValidatorMetadata(data, results) {
  if (data?.validator?.script !== "scripts/wellfit-dev-agent/src/concept-learning-agent-check.mjs") {
    addFail(results, "validator.script must point to concept-learning-agent-check.mjs.");
  }
  if (data?.validator?.output !== OUTPUT_PATH) {
    addFail(results, `validator.output must be ${OUTPUT_PATH}.`);
  }
  if (data?.validator?.qualityGateLabel !== "Concept Learning Agent check") {
    addFail(results, "validator.qualityGateLabel must be Concept Learning Agent check.");
  }

  addPass(results, "Validator metadata is registered for the quality gate.");
}

function renderReport(results) {
  const ready = results.fail.length === 0;
  return `# Concept Learning Agent Check\n\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\n\n## Passed Checks\n\n${results.pass.map((item) => `- ${item}`).join("\n") || "- None"}\n\n## Failed Checks\n\n${results.fail.map((item) => `- ${item}`).join("\n") || "- None"}\n\n## Readiness Signals\n\n- Report only: true\n- Runtime product logic enabled: false\n- Runtime personalization enabled: false\n- Admin approval required before implementation: true\n- Never modifies runtime files: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- CONCEPT_LEARNING_AGENT_READY=${ready ? "true" : "false"}\n`;
}

function main() {
  const results = { pass: [], fail: [] };
  const data = readJson(results);

  if (data) {
    validateTopLevel(data, results);
    validateReferences(data, results);
    validatePhases(data, results);
    validateQuestionFormat(data, results);
    validateStorageAndApproval(data, results);
    validateSafetyBoundaries(data, results);
    validateValidatorMetadata(data, results);
  }

  const report = renderReport(results);
  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");
  process.stdout.write(`${report}\n`);

  if (results.fail.length > 0) process.exitCode = 1;
}

main();
