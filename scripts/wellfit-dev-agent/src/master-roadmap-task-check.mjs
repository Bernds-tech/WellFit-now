#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, "project-register", "master-roadmap-tasks.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "master-roadmap-task-check.md");

const ALLOWED_STATUS_MARKERS = new Set(["[ ]", "[x]", "[~]", "[!]", "[>]"]);
const REQUIRED_TASK_FIELDS = [
  "taskId",
  "title",
  "status",
  "phase",
  "topic",
  "alreadyDone",
  "openItems",
  "blockers",
  "leadingFiles",
  "supportingFiles",
  "mappedWorkMapTopic",
  "mappedProductReadinessModule",
  "riskLevel",
  "doNotDuplicateWarnings",
  "nextSafeWorkLocation",
  "humanApprovalRequired"
];
const ALLOWED_RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);
const PROTECTED_AUTO_WORK_PATTERN = /token|wallet|payment|reward[\s_-]*authority|mission completion|ledger|health|child|location|privacy|datenschutz|consent|unity|wellfitbuddyar|pr #13|camera|face|biometric|nft|payout|purchase|trading|presale|anti-cheat/iu;

function rel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function readJson(results) {
  if (!fs.existsSync(REGISTER_PATH)) {
    results.fail.push(`Missing registry: ${rel(REGISTER_PATH)}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(REGISTER_PATH, "utf8"));
  } catch (error) {
    results.fail.push(`Registry is not valid JSON: ${error.message}`);
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function taskText(task) {
  return JSON.stringify(task, null, 2);
}

function collectTasks(data) {
  const tasks = [];
  for (const phase of asArray(data?.phases)) {
    for (const group of asArray(phase?.taskGroups)) {
      for (const task of asArray(group?.tasks)) tasks.push({ phase, group, task });
    }
  }
  return tasks;
}

function validateTopLevel(data, results) {
  for (const field of ["version", "updated", "purpose", "sourceLabel"]) {
    if (!hasText(data?.[field])) results.fail.push(`Top-level field ${field} is missing or empty.`);
  }

  for (const marker of ALLOWED_STATUS_MARKERS) {
    if (!hasText(data?.statusMarkerLegend?.[marker])) results.fail.push(`Status marker legend is missing ${marker}.`);
  }

  const extraMarkers = Object.keys(data?.statusMarkerLegend ?? {}).filter((marker) => !ALLOWED_STATUS_MARKERS.has(marker));
  if (extraMarkers.length > 0) results.fail.push(`Status marker legend has unsupported markers: ${extraMarkers.join(", ")}.`);

  if (asArray(data?.phases).length === 0) results.fail.push("No phases found in master-roadmap-tasks.json.");
}

function validateTaskShape(entry, results) {
  const { task, phase } = entry;
  const label = task?.taskId ?? task?.title ?? "unknown-task";

  for (const field of REQUIRED_TASK_FIELDS) {
    if (!(field in (task ?? {}))) results.fail.push(`${label}: missing required field ${field}.`);
  }

  for (const field of ["taskId", "title", "phase", "topic", "mappedWorkMapTopic", "mappedProductReadinessModule", "riskLevel", "nextSafeWorkLocation"]) {
    if (field in (task ?? {}) && !hasText(task[field]) && field !== "nextSafeWorkLocation") results.fail.push(`${label}: ${field} must be a non-empty string.`);
  }

  for (const field of ["alreadyDone", "openItems", "blockers", "leadingFiles", "supportingFiles", "doNotDuplicateWarnings", "nextSafeWorkLocation"]) {
    if (field in (task ?? {}) && !Array.isArray(task[field])) results.fail.push(`${label}: ${field} must be an array.`);
  }

  if (!ALLOWED_STATUS_MARKERS.has(task?.status)) results.fail.push(`${label}: unsupported status marker ${task?.status ?? "missing"}.`);
  if (!ALLOWED_RISK_LEVELS.has(task?.riskLevel)) results.fail.push(`${label}: unsupported riskLevel ${task?.riskLevel ?? "missing"}.`);
  if (typeof task?.humanApprovalRequired !== "boolean") results.fail.push(`${label}: humanApprovalRequired must be boolean.`);

  if (hasText(phase?.phase) && hasText(task?.phase) && phase.phase !== task.phase) {
    results.fail.push(`${label}: task phase '${task.phase}' does not match parent phase '${phase.phase}'.`);
  }
}

function validateSafety(entry, results) {
  const task = entry.task;
  const label = task?.taskId ?? task?.title ?? "unknown-task";
  const risk = task?.riskLevel;

  if (["high", "critical"].includes(risk) && task?.humanApprovalRequired !== true) {
    results.fail.push(`${label}: high/critical risk requires humanApprovalRequired=true.`);
  }

  if (task?.safeAutoWork === true && PROTECTED_AUTO_WORK_PATTERN.test(taskText(task))) {
    results.fail.push(`${label}: protected token/wallet/payment/reward-authority/health/child/location/privacy/Unity task is marked safeAutoWork=true.`);
  }

  const hasWorkMapTopic = hasText(task?.mappedWorkMapTopic);
  if (!hasWorkMapTopic && task?.historicalOrReviewRequired !== true) {
    results.fail.push(`${label}: missing mappedWorkMapTopic and not marked historicalOrReviewRequired=true.`);
  }

  if (["high", "critical"].includes(risk) || PROTECTED_AUTO_WORK_PATTERN.test(taskText(task))) {
    results.warn.push(`${label}: protected or elevated-risk task; keep documentation/planning-only until explicit approval.`);
  }
}

function renderList(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None.";
}

function writeReport(results, taskCount) {
  const passed = results.fail.length === 0;
  const report = [
    "# Master Roadmap Task Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    `Tasks checked: ${taskCount}`,
    "",
    "## PASS",
    "",
    passed ? "- Required registry checks passed." : "- Some checks failed; see FAIL section.",
    "",
    "## FAIL",
    "",
    renderList(results.fail),
    "",
    "## WARNING",
    "",
    renderList(results.warn)
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");
}

function main() {
  const results = { fail: [], warn: [] };
  const data = readJson(results);
  let tasks = [];

  if (data) {
    validateTopLevel(data, results);
    tasks = collectTasks(data);
    if (tasks.length === 0) results.fail.push("No task entries found.");
    for (const entry of tasks) {
      validateTaskShape(entry, results);
      validateSafety(entry, results);
    }
  }

  writeReport(results, tasks.length);
  const passed = results.fail.length === 0;

  console.log("WellFit Master Roadmap Task Check");
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Tasks checked: ${tasks.length}`);
  console.log("");
  console.log("PASS:");
  console.log(passed ? "- Required registry checks passed." : "- Some checks failed; see FAIL section.");
  console.log("");
  console.log("FAIL:");
  console.log(renderList(results.fail));
  console.log("");
  console.log("WARNING:");
  console.log(renderList(results.warn));

  if (!passed) process.exit(1);
}

main();
