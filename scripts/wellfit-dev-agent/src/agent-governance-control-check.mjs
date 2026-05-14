#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "agent-governance-control-check.md");

const REQUIRED_JSON_FILES = [
  "project-register/agent-workflows.json",
  "project-register/agent-task-queue.json",
  "project-register/definition-of-done.json",
  "project-register/risk-classifier.json"
];

const REQUIRED_DOC_FILES = [
  "AGENTS.md",
  "todolist/CURRENT_PROJECT_STATE.md",
  "todolist/WORK_MAP.md",
  "todolist/TODO_INDEX.md",
  "docs/architecture/WELLFIT_AGENT_EXECUTION_CONTROLS.md"
];

const CONTROL_REGISTERS = [
  "project-register/agent-task-queue.json",
  "project-register/definition-of-done.json",
  "project-register/risk-classifier.json"
];

const REQUIRED_TASK_QUEUE_GLOBAL_ARRAYS = [
  "globalRequiredFirstReadFiles",
  "defaultRequiredChecks"
];

const REQUIRED_TASK_CANDIDATE_ARRAYS = [
  "requiredFirstReadFiles",
  "requiredChecks",
  "stopConditions",
  "expectedPrOutput"
];

const REQUIRED_FIRST_READ_FILES = [
  "AGENTS.md",
  "todolist/CURRENT_PROJECT_STATE.md",
  "todolist/WORK_MAP.md",
  "todolist/TODO_INDEX.md",
  "project-register/agent-workflows.json"
];

const REQUIRED_CHECKS = [
  "npm run lint",
  "npx tsc --noEmit",
  "npm run build",
  "npm --prefix functions run check",
  "npm run agent:quality-gate"
];

const REQUIRED_DONE_KEYS = [
  "documentation_task",
  "registry_task",
  "ui_route_task",
  "api_route_task",
  "mission_task",
  "buddy_ki_task",
  "firebase_backend_task",
  "feedback_analytics_task",
  "unity_ar_planning_task",
  "compliance_sensitive_planning_task"
];

const REQUIRED_RISK_LEVELS = ["low", "medium", "high", "critical"];

const REQUIRED_PROTECTED_AREA_MATCHES = [
  { label: "PR #13", terms: ["PR #13", "PR_13"] },
  { label: "Unity", terms: ["native/unity/WellFitBuddyAR", "UNITY_WELLFIT_BUDDY_AR", "Unity"] },
  { label: "token/NFT/wallet/payment", terms: ["token", "NFT", "wallet", "payment"] },
  { label: "reward authority", terms: ["reward_authority", "reward", "mission completion", "ledger"] },
  { label: "health/child/location/privacy/compliance", terms: ["health", "child", "location", "privacy", "compliance", "Datenschutz", "AGB", "Impressum"] }
];

function rel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

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

function hasNonEmptyArray(object, key) {
  return Array.isArray(object?.[key]) && object[key].length > 0;
}

function hasExpectedPrOutput(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value && typeof value === "object" && (hasNonEmptyArray(value, "requiredSections") || hasNonEmptyArray(value, "mustMention"));
}

function stringifyForSearch(value) {
  return JSON.stringify(value, null, 2);
}

function includesAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

function collectJson(results) {
  const data = new Map();
  for (const file of REQUIRED_JSON_FILES) {
    if (!exists(file)) continue;
    try {
      data.set(file, readJson(file));
    } catch (error) {
      results.push({ name: `${file} parses as JSON`, passed: false, details: error.message });
    }
  }
  return data;
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details });
}

function renderResults(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details.replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function validateRequiredFiles(results) {
  for (const file of [...REQUIRED_JSON_FILES, ...REQUIRED_DOC_FILES]) {
    addResult(results, `${file} exists`, exists(file), exists(file) ? "found" : "missing");
  }
}

function validateJsonParsing(results, data) {
  for (const file of REQUIRED_JSON_FILES) {
    if (!exists(file)) continue;
    if (data.has(file)) addResult(results, `${file} parses as JSON`, true, "valid JSON");
  }
}

function validateAgentWorkflows(results, data) {
  const workflows = data.get("project-register/agent-workflows.json");
  if (!workflows) return;
  const text = stringifyForSearch(workflows);
  addResult(
    results,
    "agent-workflows.json references all control registers",
    includesAll(text, CONTROL_REGISTERS),
    CONTROL_REGISTERS.filter((file) => !text.includes(file)).length ? `missing: ${CONTROL_REGISTERS.filter((file) => !text.includes(file)).join(", ")}` : "all referenced"
  );
}

function validateTaskQueue(results, data) {
  const queue = data.get("project-register/agent-task-queue.json");
  if (!queue) return;

  for (const key of REQUIRED_TASK_QUEUE_GLOBAL_ARRAYS) {
    addResult(results, `agent-task-queue.json has ${key}`, hasNonEmptyArray(queue, key), hasNonEmptyArray(queue, key) ? `${queue[key].length} entries` : "missing or empty");
  }

  addResult(results, "agent-task-queue.json has expectedPrOutput", hasExpectedPrOutput(queue.expectedPrOutput), hasExpectedPrOutput(queue.expectedPrOutput) ? "present" : "missing or empty");

  const candidates = asArray(queue.taskCandidates);
  addResult(results, "agent-task-queue.json has task candidates", candidates.length > 0, `${candidates.length} candidates`);

  const globalFirstReads = asArray(queue.globalRequiredFirstReadFiles);
  const globalChecks = asArray(queue.defaultRequiredChecks);
  addResult(results, "agent-task-queue.json includes required first-read files", includesAll(globalFirstReads, REQUIRED_FIRST_READ_FILES), REQUIRED_FIRST_READ_FILES.filter((file) => !globalFirstReads.includes(file)).length ? `missing: ${REQUIRED_FIRST_READ_FILES.filter((file) => !globalFirstReads.includes(file)).join(", ")}` : "all present");
  addResult(results, "agent-task-queue.json includes required checks", includesAll(globalChecks, REQUIRED_CHECKS), REQUIRED_CHECKS.filter((check) => !globalChecks.includes(check)).length ? `missing: ${REQUIRED_CHECKS.filter((check) => !globalChecks.includes(check)).join(", ")}` : "all present");

  const invalidCandidates = [];
  for (const candidate of candidates) {
    const missingArrays = REQUIRED_TASK_CANDIDATE_ARRAYS.filter((key) => !hasNonEmptyArray(candidate, key));
    if (missingArrays.length > 0) invalidCandidates.push(`${candidate.id ?? "unknown"}: ${missingArrays.join(", ")}`);
  }
  addResult(results, "all task candidates define first-reads, checks, stop conditions, and PR output", invalidCandidates.length === 0 && candidates.length > 0, invalidCandidates.length ? invalidCandidates.join("; ") : "all candidates complete");
}

function validateDefinitionOfDone(results, data) {
  const dod = data.get("project-register/definition-of-done.json");
  if (!dod) return;
  const taskTypes = dod.taskTypes ?? {};
  const missing = REQUIRED_DONE_KEYS.filter((key) => !taskTypes[key]);
  addResult(results, "definition-of-done.json has all required task type entries", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "all present");

  const incomplete = REQUIRED_DONE_KEYS.filter((key) => taskTypes[key] && (!hasNonEmptyArray(taskTypes[key], "doneWhen") || !hasNonEmptyArray(taskTypes[key], "requiredEvidence") || !hasNonEmptyArray(taskTypes[key], "requiredChecks")));
  addResult(results, "definition-of-done task entries include criteria, evidence, and checks", incomplete.length === 0, incomplete.length ? `incomplete: ${incomplete.join(", ")}` : "all complete");
}

function validateRiskClassifier(results, data) {
  const risk = data.get("project-register/risk-classifier.json");
  if (!risk) return;
  const riskLevels = risk.riskLevels ?? {};
  const missingLevels = REQUIRED_RISK_LEVELS.filter((level) => !riskLevels[level]);
  addResult(results, "risk-classifier.json has low, medium, high, and critical levels", missingLevels.length === 0, missingLevels.length ? `missing: ${missingLevels.join(", ")}` : "all present");

  const levelsWithoutPatterns = REQUIRED_RISK_LEVELS.filter((level) => riskLevels[level] && !hasNonEmptyArray(riskLevels[level], "patterns"));
  addResult(results, "risk-classifier risk levels include patterns", levelsWithoutPatterns.length === 0, levelsWithoutPatterns.length ? `missing patterns: ${levelsWithoutPatterns.join(", ")}` : "all levels have patterns");

  addResult(results, "risk-classifier.json has protected areas", hasNonEmptyArray(risk, "protectedAreas"), hasNonEmptyArray(risk, "protectedAreas") ? `${risk.protectedAreas.length} protected areas` : "missing or empty");

  const protectedAreaText = stringifyForSearch(risk.protectedAreas ?? []);
  const missingProtectedMatches = REQUIRED_PROTECTED_AREA_MATCHES.filter((item) => !item.terms.some((term) => protectedAreaText.toLowerCase().includes(term.toLowerCase())));
  addResult(results, "protected areas cover required WellFit guardrails", missingProtectedMatches.length === 0, missingProtectedMatches.length ? `missing: ${missingProtectedMatches.map((item) => item.label).join(", ")}` : "all required guardrails covered");
}

function validateDocumentationReferences(results) {
  for (const doc of ["todolist/TODO_INDEX.md", "todolist/WORK_MAP.md"]) {
    if (!exists(doc)) continue;
    const text = readText(doc);
    const requiredReferences = [...CONTROL_REGISTERS, "scripts/wellfit-dev-agent/src/agent-governance-control-check.mjs"];
    const missing = requiredReferences.filter((file) => !text.includes(file));
    addResult(results, `${doc} references control registers and validation check`, missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "all referenced");
  }
}

function main() {
  const results = [];
  validateRequiredFiles(results);
  const data = collectJson(results);
  validateJsonParsing(results, data);
  validateAgentWorkflows(results, data);
  validateTaskQueue(results, data);
  validateDefinitionOfDone(results, data);
  validateRiskClassifier(results, data);
  validateDocumentationReferences(results);

  const passed = results.every((result) => result.passed);
  const report = [
    "# Agent Governance Control Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Checks",
    "",
    renderResults(results),
    "",
    "## Required standard",
    "",
    "- Required governance JSON files and documentation files must exist.",
    "- Governance JSON files must parse successfully.",
    "- `agent-workflows.json` must reference the three autonomous control registers.",
    "- `agent-task-queue.json` must define task candidates, required first-read files, required checks, stop conditions, and expected PR output.",
    "- `definition-of-done.json` must define all required task categories.",
    "- `risk-classifier.json` must define low/medium/high/critical patterns and required protected areas.",
    "- `TODO_INDEX.md` and `WORK_MAP.md` must point to the control registers and this validation check."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit agent governance control check complete: ${rel(OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  for (const result of results) console.log(`${result.passed ? "OK" : "FAIL"}: ${result.name} (${result.details})`);
  if (!passed) process.exit(1);
}

main();
