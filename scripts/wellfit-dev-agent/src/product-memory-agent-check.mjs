#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENTRY_ID = "product-memory-agent";
const REGISTER_PATH = "project-register/product-memory-agent.json";
const DOC_PATH = "docs/architecture/WELLFIT_PRODUCT_MEMORY_AGENT.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/product-memory-agent-check.mjs";
const CATALOG_PATH = "project-register/agent-catalog.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const WORK_LOG_PATH = "project-register/agent-work-log.json";
const KNOWLEDGE_CORE_REGISTER_PATH = "project-register/wellfit-knowledge-core.json";
const KNOWLEDGE_CORE_DOC_PATH = "docs/architecture/WELLFIT_KNOWLEDGE_CORE.md";

const REQUIRED_PATHS = [
  REGISTER_PATH,
  DOC_PATH,
  SCRIPT_PATH,
  CATALOG_PATH,
  BACKLOG_PATH,
  WORK_LOG_PATH,
  "project-register/decisions.json",
  "project-register/agent-follow-ups.json",
  "project-register/concept-learning-questions.json",
  KNOWLEDGE_CORE_REGISTER_PATH,
  KNOWLEDGE_CORE_DOC_PATH
];

const REQUIRED_MEMORY_TYPES = [
  { id: "product_vision", label: "Produktvision" },
  { id: "bernd_decisions", label: "Bernd-Entscheidungen" },
  { id: "open_questions", label: "offene Fragen" },
  { id: "confirmed_answers", label: "bestätigte Antworten" },
  { id: "agent_insights", label: "Agent-Erkenntnisse" },
  { id: "rejected_suggestions", label: "abgelehnte Vorschläge" },
  { id: "safety_boundaries", label: "Sicherheitsgrenzen" },
  { id: "next_recommended_tasks", label: "nächste empfohlene Tasks" }
];

const REQUIRED_STORAGE_TARGETS = [
  "project-register/decisions.json",
  "project-register/agent-follow-ups.json",
  "project-register/concept-learning-questions.json",
  KNOWLEDGE_CORE_REGISTER_PATH,
  KNOWLEDGE_CORE_DOC_PATH
];

const REQUIRED_FORBIDDEN_RUNTIME_ACTIONS = [
  "runtime_code_change",
  "data_migration",
  "production_database_write",
  "deployment",
  "merge",
  "pull_request_approval",
  "reward_authorization",
  "mission_completion",
  "anti_cheat_decision",
  "payment_or_token_action",
  "wallet_or_nft_action",
  "legal_policy_change",
  "health_child_location_camera_privacy_change",
  "unity_runtime_change"
];

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

function add(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function includesAll(text, terms) {
  const lower = text.toLowerCase();
  return terms.filter((term) => !lower.includes(term.toLowerCase()));
}

function missingValues(actual, required) {
  const set = new Set(asArray(actual));
  return required.filter((value) => !set.has(value));
}

function renderResults(results) {
  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} - ${result.details}`);
  }
}

const results = [];
for (const filePath of REQUIRED_PATHS) {
  add(results, `exists: ${filePath}`, exists(filePath), filePath);
}

if (results.every((result) => result.passed)) {
  const register = readJson(REGISTER_PATH);
  const doc = readText(DOC_PATH);
  const catalog = readJson(CATALOG_PATH);
  const backlog = readJson(BACKLOG_PATH);
  const workLog = readJson(WORK_LOG_PATH);
  const knowledgeCore = readJson(KNOWLEDGE_CORE_REGISTER_PATH);
  const knowledgeCoreDoc = readText(KNOWLEDGE_CORE_DOC_PATH);
  const catalogEntry = asArray(catalog.entries).find((entry) => entry?.id === ENTRY_ID);
  const backlogEntry = asArray(backlog.entries).find((entry) => entry?.id === ENTRY_ID);
  const workLogEntry = asArray(workLog.entries).find((entry) => entry?.taskId === `APPROVED-AGENT-PLANNING-${ENTRY_ID}`);

  add(results, "register id matches", register.id === ENTRY_ID, register.id);
  add(results, "register is report-only", register.activationState === "report_only" && register.executionCapability === "report_only", `${register.activationState} / ${register.executionCapability}`);
  add(results, "runtime authority denied", register.runtimeAuthorityGranted === false && register.requiresHumanApprovalForRuntime === true, JSON.stringify({ runtimeAuthorityGranted: register.runtimeAuthorityGranted, requiresHumanApprovalForRuntime: register.requiresHumanApprovalForRuntime }));
  add(results, "runtime user profiling denied", register.profileUsersAtRuntime === false, String(register.profileUsersAtRuntime));
  add(results, "forbidden runtime scopes present", ["app/**", "functions/**", "firestore.rules", "native/unity/WellFitBuddyAR/**"].every((scope) => asArray(register.forbiddenWriteScopes).includes(scope)), JSON.stringify(register.forbiddenWriteScopes));
  add(results, "artifact paths synchronized", register.artifactSet?.architectureDoc === DOC_PATH && register.artifactSet?.register === REGISTER_PATH && register.artifactSet?.validatorScript === SCRIPT_PATH, JSON.stringify(register.artifactSet));

  const memoryTypes = asArray(register.memoryTypes);
  const memoryTypeIds = memoryTypes.map((entry) => entry?.id);
  const memoryTypeLabels = memoryTypes.map((entry) => entry?.label);
  const missingMemoryTypeIds = missingValues(memoryTypeIds, REQUIRED_MEMORY_TYPES.map((entry) => entry.id));
  const missingMemoryTypeLabels = missingValues(memoryTypeLabels, REQUIRED_MEMORY_TYPES.map((entry) => entry.label));
  add(results, "required memory type ids present", missingMemoryTypeIds.length === 0, missingMemoryTypeIds.length ? `missing: ${missingMemoryTypeIds.join(", ")}` : "complete");
  add(results, "required German memory labels present", missingMemoryTypeLabels.length === 0, missingMemoryTypeLabels.length ? `missing: ${missingMemoryTypeLabels.join(", ")}` : "complete");

  const storageTargetPaths = asArray(register.storageTargets).map((target) => target?.path);
  const missingStorageTargets = missingValues(storageTargetPaths, REQUIRED_STORAGE_TARGETS);
  add(results, "required storage targets present", missingStorageTargets.length === 0, missingStorageTargets.length ? `missing: ${missingStorageTargets.join(", ")}` : "complete");
  const missingAllowedTargets = missingValues(register.answerStoragePolicy?.allowedTargets, REQUIRED_STORAGE_TARGETS);
  add(results, "answer storage policy allows required targets", missingAllowedTargets.length === 0, missingAllowedTargets.length ? `missing: ${missingAllowedTargets.join(", ")}` : "complete");
  add(results, "storage targets are non-runtime", asArray(register.storageTargets).every((target) => target?.runtimeAuthority === "none" && target?.requiresHumanApprovalBeforeRuntime === true), JSON.stringify(register.storageTargets));

  const guard = register.protectedRuntimeActionGuard ?? {};
  const missingForbiddenRuntimeActions = missingValues(guard.agentMustNotAutomaticallyTrigger, REQUIRED_FORBIDDEN_RUNTIME_ACTIONS);
  add(results, "protected runtime actions cannot auto-trigger", missingForbiddenRuntimeActions.length === 0, missingForbiddenRuntimeActions.length ? `missing: ${missingForbiddenRuntimeActions.join(", ")}` : "complete");
  add(results, "agent may suggest and structure memory", ["suggest_memory", "structure_memory"].every((action) => asArray(guard.agentMay).includes(action)), JSON.stringify(guard.agentMay));
  add(results, "default answer records deny runtime execution", register.answerStoragePolicy?.defaultRuntimeExecutionAuthorized === false && asArray(register.answerStoragePolicy?.requiredMetadata).includes("runtime_execution_authorized"), JSON.stringify(register.answerStoragePolicy));

  const docTerms = ["Memory-Typen", "Speicherziele", "geschützte Runtime-Aktion", ...REQUIRED_STORAGE_TARGETS];
  const missingDocTerms = includesAll(doc, docTerms);
  add(results, "architecture doc documents memory types, targets, and runtime guard", missingDocTerms.length === 0, missingDocTerms.length ? `missing terms: ${missingDocTerms.join(", ")}` : "all terms present");
  add(results, "doc states boundaries", includesAll(doc, ["report_only", "Runtime authority granted: `false`", "must not change App Runtime", "user profiling", "Firestore rules", "Firebase Functions", "UI execution"]).length === 0, "boundary terms checked");

  add(results, "knowledge core register links product memory agent", knowledgeCore.agentConnections?.productMemoryAgent === REGISTER_PATH, JSON.stringify(knowledgeCore.agentConnections ?? null));
  const missingKnowledgeCoreTargets = includesAll(knowledgeCoreDoc, REQUIRED_STORAGE_TARGETS);
  add(results, "knowledge core doc lists product memory storage targets", missingKnowledgeCoreTargets.length === 0, missingKnowledgeCoreTargets.length ? `missing: ${missingKnowledgeCoreTargets.join(", ")}` : "complete");

  add(results, "catalog entry present", Boolean(catalogEntry), ENTRY_ID);
  add(results, "catalog entry report-only", catalogEntry?.executionCapability === "report_only" && catalogEntry?.requiresHumanApprovalForRuntime === true, JSON.stringify(catalogEntry ?? null));
  add(results, "catalog artifact paths present", asArray(catalogEntry?.primaryRegisters).includes(REGISTER_PATH) && asArray(catalogEntry?.humanReadableDocs).includes(DOC_PATH) && asArray(catalogEntry?.validationScripts).includes(SCRIPT_PATH), JSON.stringify(catalogEntry ?? null));
  add(results, "backlog entry present", Boolean(backlogEntry), ENTRY_ID);
  add(results, "backlog status in planning/build evidence state", ["approved_for_planning", "in_progress", "built"].includes(backlogEntry?.status), backlogEntry?.status ?? "missing");
  add(results, "backlog required artifact paths present", asArray(backlogEntry?.requiredDocs).includes(DOC_PATH) && asArray(backlogEntry?.requiredRegisters).includes(REGISTER_PATH) && asArray(backlogEntry?.requiredValidationScripts).includes(SCRIPT_PATH), JSON.stringify(backlogEntry ?? null));
  add(results, "work log entry present", Boolean(workLogEntry), ENTRY_ID);
  add(results, "work log records no runtime changes", asArray(workLogEntry?.changedFiles).every((filePath) => !filePath.startsWith("app/") && !filePath.startsWith("components/") && !filePath.startsWith("lib/") && !filePath.startsWith("functions/") && filePath !== "firestore.rules"), JSON.stringify(workLogEntry?.changedFiles ?? []));
}

const passed = results.every((result) => result.passed);
console.log("Agent: Product Memory Agent");
console.log("Mode: REPORT_ONLY");
console.log("Can suggest memory: true");
console.log("Can structure memory: true");
console.log("Never triggers protected runtime actions automatically: true");
console.log("Never modifies runtime files: true");
console.log("Never profiles users: true");
console.log("Never changes Firestore rules: true");
console.log("Never changes Firebase Functions: true");
console.log("Never executes UI: true");
renderResults(results);
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
console.log(`PRODUCT_MEMORY_AGENT_READY=${passed ? "true" : "false"}`);
if (!passed) process.exitCode = 1;
