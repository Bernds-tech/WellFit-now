#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MAP_PATH = "project-register/continuity-dependency-map.json";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/continuity-dependency-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "sourceOfTruthFiles",
  "monitoredRegisters",
  "monitoredDocs",
  "dependencyTypes",
  "statusValues",
  "openPointSchema",
  "followUpSchema",
  "dependencySchema",
  "mustNotForgetRules",
  "reviewRequiredRules",
  "blockedRules",
  "nextAgentHandoffRules",
  "requiredOutputLocations",
  "forbiddenAutoUpdates",
  "humanReviewRequiredFor",
  "reportOutputSchema",
  "entries"
];

const REQUIRED_STATUS_VALUES = [
  "open",
  "in_progress",
  "done",
  "blocked",
  "review_required",
  "device_test_required",
  "human_review_required",
  "stale",
  "duplicate",
  "superseded"
];

const REQUIRED_DEPENDENCY_TYPES = [
  "requires_followup_task",
  "requires_register_update",
  "requires_work_map_update",
  "requires_todo_index_update",
  "requires_product_readiness_update",
  "requires_repository_inventory_update",
  "requires_task_queue_update",
  "requires_work_log_entry",
  "requires_progress_log_entry",
  "requires_validation_script",
  "requires_human_review",
  "requires_future_runtime_task",
  "blocks_auto_merge",
  "blocks_auto_repair",
  "blocks_batch_execution",
  "blocks_product_readiness_advance"
];

const REQUIRED_ENTRY_FIELDS = [
  "id",
  "title",
  "status",
  "source",
  "ownerAgent",
  "dependencies",
  "nextRecommendedTask",
  "requiredOutputLocations",
  "humanReviewRequired"
];

const SENTINEL_FILES = [
  MAP_PATH,
  "docs/architecture/WELLFIT_CONTINUITY_DEPENDENCY_SENTINEL.md",
  "scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs"
];

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
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

function hasAllValues(actual, required) {
  const actualSet = new Set(asArray(actual));
  return required.filter((value) => !actualSet.has(value));
}

function fileListExists(values) {
  return asArray(values).filter((file) => typeof file === "string" && !exists(file));
}

function renderTable(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details.replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function renderEntries(entries) {
  return [
    "| ID | Status | Human Review | Next Recommended Task |",
    "|---|---|---:|---|",
    ...entries.map((entry) => `| ${entry.id} | ${entry.status} | ${entry.humanReviewRequired === true ? "yes" : "no"} | ${(entry.nextRecommendedTask ?? "").replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function countByStatus(entries) {
  const counts = new Map();
  for (const entry of entries) counts.set(entry.status, (counts.get(entry.status) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function main() {
  const results = [];
  let map;

  addResult(results, `${MAP_PATH} exists`, exists(MAP_PATH), exists(MAP_PATH) ? "found" : "missing");
  addResult(results, `${WORK_MAP_PATH} exists`, exists(WORK_MAP_PATH), exists(WORK_MAP_PATH) ? "found" : "missing");
  addResult(results, `${TODO_INDEX_PATH} exists`, exists(TODO_INDEX_PATH), exists(TODO_INDEX_PATH) ? "found" : "missing");

  try {
    map = readJson(MAP_PATH);
    addResult(results, `${MAP_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${MAP_PATH} parses as JSON`, false, error.message);
  }

  if (map) {
    const missingTopLevel = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in map));
    addResult(results, "required top-level fields exist", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : `${REQUIRED_TOP_LEVEL_FIELDS.length} fields present`);
    addResult(results, "activation state is report_only", map.activationState === "report_only", map.activationState ?? "missing");

    const missingStatuses = hasAllValues(map.statusValues, REQUIRED_STATUS_VALUES);
    addResult(results, "required statusValues exist", missingStatuses.length === 0, missingStatuses.length ? `missing: ${missingStatuses.join(", ")}` : `${REQUIRED_STATUS_VALUES.length} statuses present`);

    const missingDependencyTypes = hasAllValues(map.dependencyTypes, REQUIRED_DEPENDENCY_TYPES);
    addResult(results, "required dependencyTypes exist", missingDependencyTypes.length === 0, missingDependencyTypes.length ? `missing: ${missingDependencyTypes.join(", ")}` : `${REQUIRED_DEPENDENCY_TYPES.length} dependency types present`);

    const missingSourceFiles = fileListExists(map.sourceOfTruthFiles);
    addResult(results, "sourceOfTruthFiles exist", missingSourceFiles.length === 0, missingSourceFiles.length ? `missing: ${missingSourceFiles.join(", ")}` : "all source files found");

    const missingMonitoredRegisters = fileListExists(map.monitoredRegisters);
    addResult(results, "monitoredRegisters exist", missingMonitoredRegisters.length === 0, missingMonitoredRegisters.length ? `missing: ${missingMonitoredRegisters.join(", ")}` : "all monitored registers found");

    const missingMonitoredDocs = fileListExists(map.monitoredDocs);
    addResult(results, "monitoredDocs exist", missingMonitoredDocs.length === 0, missingMonitoredDocs.length ? `missing: ${missingMonitoredDocs.join(", ")}` : "all monitored docs found");

    const missingRequiredOutputs = fileListExists(asArray(map.requiredOutputLocations).filter((file) => file !== OUTPUT_PATH));
    addResult(results, "required Sentinel output locations exist", missingRequiredOutputs.length === 0, missingRequiredOutputs.length ? `missing: ${missingRequiredOutputs.join(", ")}` : "all required Sentinel files found");

    const entries = asArray(map.entries);
    addResult(results, "entries array is non-empty", entries.length > 0, `${entries.length} entries`);

    const ids = new Set();
    const duplicateIds = [];
    const validStatuses = new Set(asArray(map.statusValues));
    const validDependencies = new Set(asArray(map.dependencyTypes));

    for (const entry of entries) {
      if (ids.has(entry.id)) duplicateIds.push(entry.id);
      ids.add(entry.id);

      const missingEntryFields = REQUIRED_ENTRY_FIELDS.filter((field) => !(field in entry));
      addResult(results, `entry ${entry.id ?? "unknown"} has required fields`, missingEntryFields.length === 0, missingEntryFields.length ? `missing: ${missingEntryFields.join(", ")}` : "complete");

      addResult(results, `entry ${entry.id ?? "unknown"} has valid status`, validStatuses.has(entry.status), entry.status ?? "missing");

      const invalidDependencies = asArray(entry.dependencies).filter((dependency) => !validDependencies.has(dependency));
      addResult(results, `entry ${entry.id ?? "unknown"} dependencies are valid`, invalidDependencies.length === 0 && asArray(entry.dependencies).length > 0, invalidDependencies.length ? `invalid: ${invalidDependencies.join(", ")}` : `${asArray(entry.dependencies).length} dependencies`);

      addResult(results, `entry ${entry.id ?? "unknown"} source exists`, hasString(entry.source) && exists(entry.source), entry.source ?? "missing");

      const outputLocations = asArray(entry.requiredOutputLocations);
      addResult(results, `entry ${entry.id ?? "unknown"} has required output locations`, outputLocations.length > 0, `${outputLocations.length} locations`);

      const missingExpectedOutputs = outputLocations
        .filter((location) => location && location.existsNow === true)
        .map((location) => location.path)
        .filter((file) => typeof file === "string" && !exists(file));
      addResult(results, `entry ${entry.id ?? "unknown"} existing output references exist`, missingExpectedOutputs.length === 0, missingExpectedOutputs.length ? `missing: ${missingExpectedOutputs.join(", ")}` : "all existing outputs found or marked future");

      const requiresReason = ["review_required", "blocked", "human_review_required", "device_test_required"].includes(entry.status);
      addResult(results, `entry ${entry.id ?? "unknown"} review/blocked/device status has reason`, !requiresReason || hasString(entry.reason), requiresReason ? (entry.reason ? "reason present" : "missing reason") : "not required");

      addResult(results, `entry ${entry.id ?? "unknown"} mustNotForget has next task`, entry.mustNotForget !== true || hasString(entry.nextRecommendedTask), entry.mustNotForget === true ? (entry.nextRecommendedTask ? "next task present" : "missing next task") : "not required");

      const humanReviewDependency = asArray(entry.dependencies).includes("requires_human_review");
      addResult(results, `entry ${entry.id ?? "unknown"} human review flag matches dependency`, !humanReviewDependency || entry.humanReviewRequired === true, humanReviewDependency ? String(entry.humanReviewRequired === true) : "not required");
    }

    addResult(results, "entry ids are unique", duplicateIds.length === 0, duplicateIds.length ? `duplicates: ${duplicateIds.join(", ")}` : "unique");
  }

  const workMap = exists(WORK_MAP_PATH) ? readText(WORK_MAP_PATH) : "";
  const todoIndex = exists(TODO_INDEX_PATH) ? readText(TODO_INDEX_PATH) : "";
  const missingWorkMapRefs = SENTINEL_FILES.filter((file) => !workMap.includes(file));
  const missingTodoIndexRefs = SENTINEL_FILES.filter((file) => !todoIndex.includes(file));
  addResult(results, "WORK_MAP references Sentinel policy/doc/script", missingWorkMapRefs.length === 0, missingWorkMapRefs.length ? `missing: ${missingWorkMapRefs.join(", ")}` : "all Sentinel files referenced");
  addResult(results, "TODO_INDEX references Sentinel policy/doc/script", missingTodoIndexRefs.length === 0, missingTodoIndexRefs.length ? `missing: ${missingTodoIndexRefs.join(", ")}` : "all Sentinel files referenced");

  const ready = results.every((result) => result.passed);
  const entries = asArray(map?.entries);
  const statusSummary = countByStatus(entries).map(([status, count]) => `- ${status}: ${count}`).join("\n") || "No entries.";

  const report = `# Continuity & Dependency Sentinel Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nNever modifies files automatically: true\nNever creates tasks automatically: true\nNever approves PRs: true\nNever merges PRs: true\nNever repairs files: true\nNever deploys: true\nCONTINUITY_DEPENDENCY_SENTINEL_READY=${ready ? "true" : "false"}\nResult: ${ready ? "PASS" : "FAIL"}\n\n## Validation Results\n\n${renderTable(results)}\n\n## Entry Status Summary\n\n${statusSummary}\n\n## Entries\n\n${renderEntries(entries)}\n`;

  fs.mkdirSync(path.join(ROOT, "scripts", "wellfit-dev-agent", "output"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, OUTPUT_PATH), report, "utf8");

  console.log("# Continuity & Dependency Sentinel Check");
  console.log("");
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies files automatically: true");
  console.log("Never creates tasks automatically: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`CONTINUITY_DEPENDENCY_SENTINEL_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  console.log("");
  console.log(renderTable(results));

  if (!ready) process.exit(1);
}

main();
