#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POLICY_REL = "project-register/task-status-policy.json";
const WORK_LOG_REL = "project-register/agent-work-log.json";
const PROGRESS_LOG_REL = "project-register/progress-log.json";
const TODO_INDEX_REL = "todolist/TODO_INDEX.md";
const NEXT_ACTIONS_REL = "todolist/NEXT_ACTIONS.md";
const OUTPUT_REL = "scripts/wellfit-dev-agent/output/task-status-work-log-check.md";
const MODE = "REPORT_ONLY";
const NEVER_REWRITES_FILES = true;

const requiredPolicyFields = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "canonicalStatusMarkers",
  "taskStatusLifecycle",
  "requiredWorkLogFields",
  "requiredProgressLogFields",
  "inProgressRules",
  "doneRules",
  "blockedRules",
  "duplicateStaleRules",
  "PRLinkRules",
  "changedFileRules",
  "checkResultRules",
  "followUpRules",
  "nextTaskRules",
  "batchSessionRules",
  "forbiddenAutoUpdates",
  "humanReviewRequiredFor",
  "reportOutputSchema"
];

const requiredMarkers = new Map([
  ["[ ]", "open"],
  ["[>]", "in_progress"],
  ["[x]", "done"],
  ["[~]", "partially_done"],
  ["[!]", "blocked_or_review_required"],
  ["[-]", "stale_or_superseded"],
  ["[D]", "duplicate"]
]);

const completedStatuses = new Set(["done", "completed", "merged"]);
const blockedStatuses = new Set(["blocked", "review_required", "blocked_or_review_required"]);
const inProgressStatuses = new Set(["in_progress", "in-progress", "active"]);
const staleStatuses = new Set(["stale", "superseded", "stale_or_superseded"]);
const duplicateStatuses = new Set(["duplicate"]);

function absolutePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readText(relativePath, results) {
  const filePath = absolutePath(relativePath);
  if (!fs.existsSync(filePath)) {
    results.errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function readJson(relativePath, results) {
  const text = readText(relativePath, results);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    results.errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase();
}

function markerLineMatches(text) {
  const matches = [];
  const lines = text.split(/\r?\n/u);
  lines.forEach((line, index) => {
    const match = line.match(/^\s*[-*]\s+\[([^\]]*)\]/u);
    if (match) matches.push({ lineNumber: index + 1, marker: `[${match[1]}]`, line });
  });
  return matches;
}

function validatePolicy(policy, results) {
  if (!policy) return;

  for (const field of requiredPolicyFields) {
    if (policy[field] === undefined || policy[field] === null) results.errors.push(`${POLICY_REL} missing required field: ${field}`);
  }

  if (policy.activationState !== "report_only") results.errors.push(`${POLICY_REL} activationState must be report_only.`);

  const markerMap = new Map(asArray(policy.canonicalStatusMarkers).map((item) => [item?.marker, item?.status]));
  for (const [marker, status] of requiredMarkers) {
    if (markerMap.get(marker) !== status) results.errors.push(`${POLICY_REL} missing canonical marker ${marker} -> ${status}.`);
  }

  if (policy.reportOutputSchema?.mode !== MODE) results.errors.push(`${POLICY_REL} reportOutputSchema.mode must be ${MODE}.`);
  if (policy.reportOutputSchema?.neverRewritesFiles !== true) results.errors.push(`${POLICY_REL} reportOutputSchema.neverRewritesFiles must be true.`);
}

function validateTodoMarkers(relativePath, text, results) {
  const markers = markerLineMatches(text);
  for (const match of markers) {
    if (!requiredMarkers.has(match.marker)) {
      results.errors.push(`${relativePath}:${match.lineNumber} uses non-canonical status marker ${match.marker}.`);
    }
  }
  results.info.push(`${relativePath}: inspected ${markers.length} task-list status marker(s).`);
}

function getBranch(entry) {
  return entry.branch ?? entry.pr?.branch ?? null;
}

function getPrEvidence(entry) {
  return entry.prNumber ?? entry.prUrl ?? entry.pullRequestUrl ?? entry.pr?.number ?? entry.pr?.url ?? null;
}

function getChecks(entry) {
  if (Array.isArray(entry.checksRun)) return entry.checksRun;
  if (Array.isArray(entry.checks)) return entry.checks;
  return [];
}

function getCheckResults(entry) {
  if (Array.isArray(entry.checkResults)) return entry.checkResults;
  if (Array.isArray(entry.checks)) return entry.checks.map((check) => check?.result ?? check?.status ?? check?.outcome).filter(Boolean);
  return [];
}

function isCurrentStructuredEntry(entry) {
  return entry.taskStatusPolicyVersion !== undefined || entry.autoMergeEligibilityResult !== undefined || entry.autoRepairDecisionResult !== undefined || entry.protectedAreaConfirmation !== undefined || entry.checksRun !== undefined || entry.checkResults !== undefined || entry.timestamp !== undefined || entry.date !== undefined || entry.recordedAt !== undefined;
}

function entryLabel(entry, index) {
  return entry.taskId ?? entry.id ?? `entry[${index}]`;
}

function validateCompletedEntry(entry, index, results) {
  const label = entryLabel(entry, index);
  const currentFormat = isCurrentStructuredEntry(entry);
  const missing = [];

  if (!hasText(entry.taskId)) missing.push("taskId");
  if (!hasText(entry.title)) missing.push("title");
  if (!hasText(entry.status)) missing.push("status");
  if (!hasText(getBranch(entry))) missing.push("branch");
  if (!Array.isArray(entry.changedFiles) || entry.changedFiles.length === 0) missing.push("changedFiles");
  if (getChecks(entry).length === 0) missing.push("checksRun/checks");
  if (getCheckResults(entry).length === 0) missing.push("checkResults/checks.result");
  if (entry.autoMergeEligibilityResult === undefined) missing.push("autoMergeEligibilityResult");
  if (entry.autoRepairDecisionResult === undefined) missing.push("autoRepairDecisionResult");
  if (entry.protectedAreaConfirmation === undefined) missing.push("protectedAreaConfirmation");
  if (!Array.isArray(entry.followUps)) missing.push("followUps");
  if (!hasText(entry.nextRecommendedTask)) missing.push("nextRecommendedTask");
  if (!hasText(entry.timestamp) && !hasText(entry.date) && !hasText(entry.recordedAt)) missing.push("timestamp/date");

  if (missing.length > 0) {
    const message = `${WORK_LOG_REL} completed ${label} missing: ${missing.join(", ")}.`;
    if (currentFormat) results.errors.push(message);
    else results.warnings.push(`Legacy completed entry warning: ${message}`);
  }

  if (!getPrEvidence(entry)) results.warnings.push(`${WORK_LOG_REL} completed ${label} has no PR number/URL evidence; allowed only when no PR was created and that reason is recorded.`);
}

function validateBlockedEntry(entry, index, results) {
  const label = entryLabel(entry, index);
  const haystack = JSON.stringify(entry).toLowerCase();
  if (!/blocker|blocked|human.?review|review_required|stop condition|reason/u.test(haystack)) {
    results.errors.push(`${WORK_LOG_REL} blocked/review entry ${label} needs a blocker reason or human-review note.`);
  }
}

function parseDateLike(value) {
  if (!hasText(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateInProgressEntry(entry, index, policy, results) {
  const label = entryLabel(entry, index);
  const maxAgeHours = Number(policy?.inProgressRules?.maxAgeHoursWithoutExplanation ?? 24);
  const date = parseDateLike(entry.timestamp ?? entry.recordedAt ?? entry.date ?? entry.updatedAt);
  const haystack = JSON.stringify(entry).toLowerCase();
  const hasExplanation = /continu|block|reason|owner|session|human.?review|paused|waiting/u.test(haystack);
  if (!date) {
    results.warnings.push(`${WORK_LOG_REL} in-progress ${label} has no parseable timestamp/date; cannot determine staleness.`);
    return;
  }
  const ageHours = (Date.now() - date.getTime()) / 36e5;
  if (ageHours > maxAgeHours && !hasExplanation) {
    results.errors.push(`${WORK_LOG_REL} in-progress ${label} is older than ${maxAgeHours} hour(s) without an explanation.`);
  }
}

function validateDuplicateStaleEntry(entry, index, results) {
  const label = entryLabel(entry, index);
  const haystack = JSON.stringify(entry).toLowerCase();
  if (!/canonical|leading|superseded|duplicate|stale|replaced by|see /u.test(haystack)) {
    results.warnings.push(`${WORK_LOG_REL} stale/duplicate ${label} should name the canonical source when known.`);
  }
}

function validateWorkLog(workLog, policy, results) {
  const entries = asArray(workLog?.entries);
  if (!workLog || !Array.isArray(workLog.entries)) results.errors.push(`${WORK_LOG_REL} must contain an entries array.`);

  entries.forEach((entry, index) => {
    const status = normalizeStatus(entry.status);
    if (completedStatuses.has(status)) validateCompletedEntry(entry, index, results);
    if (blockedStatuses.has(status)) validateBlockedEntry(entry, index, results);
    if (inProgressStatuses.has(status)) validateInProgressEntry(entry, index, policy, results);
    if (staleStatuses.has(status) || duplicateStatuses.has(status)) validateDuplicateStaleEntry(entry, index, results);
  });

  results.info.push(`${WORK_LOG_REL}: inspected ${entries.length} work-log entr${entries.length === 1 ? "y" : "ies"}.`);
}

function inferTaskIdFromProgressId(id) {
  const match = String(id ?? "").match(/^PROGRESS-(.+?)-\d{4}-\d{2}-\d{2}-\d+$/u);
  return match ? match[1] : null;
}

function validateProgressLog(progressLog, results) {
  const entries = asArray(progressLog?.entries);
  if (!progressLog || !Array.isArray(progressLog.entries)) results.errors.push(`${PROGRESS_LOG_REL} must contain an entries array.`);

  entries.forEach((entry, index) => {
    const label = entry.id ?? `entry[${index}]`;
    for (const field of ["id", "date", "branch", "goal", "changedAreas", "productLogicChanged", "productionDeployTriggered", "notes"]) {
      if (entry[field] === undefined || entry[field] === null || entry[field] === "") results.errors.push(`${PROGRESS_LOG_REL} ${label} missing required field: ${field}`);
    }
    if (!entry.taskId && !inferTaskIdFromProgressId(entry.id)) {
      results.warnings.push(`${PROGRESS_LOG_REL} ${label} has no explicit or inferable taskId.`);
    }
  });

  results.info.push(`${PROGRESS_LOG_REL}: inspected ${entries.length} progress entr${entries.length === 1 ? "y" : "ies"}.`);
}

function renderSection(title, values, fallback) {
  return [`## ${title}`, "", values.length ? values.map((value) => `- ${value}`).join("\n") : fallback].join("\n");
}

function main() {
  const results = { errors: [], warnings: [], info: [] };
  const policy = readJson(POLICY_REL, results);
  const workLog = readJson(WORK_LOG_REL, results);
  const progressLog = readJson(PROGRESS_LOG_REL, results);
  const todoIndex = readText(TODO_INDEX_REL, results);
  const nextActions = readText(NEXT_ACTIONS_REL, results);

  validatePolicy(policy, results);
  validateTodoMarkers(TODO_INDEX_REL, todoIndex, results);
  validateTodoMarkers(NEXT_ACTIONS_REL, nextActions, results);
  validateWorkLog(workLog, policy, results);
  validateProgressLog(progressLog, results);

  const ready = results.errors.length === 0;
  const report = [
    "# WellFit Task Status Work Log Sync Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${MODE}`,
    `Never rewrites files: ${NEVER_REWRITES_FILES}`,
    `TASK_STATUS_SYNC_READY=${ready ? "true" : "false"}`,
    "",
    renderSection("Errors", results.errors, "No errors."),
    "",
    renderSection("Warnings", results.warnings, "No warnings."),
    "",
    renderSection("Info", results.info, "No info."),
    "",
    "## Boundaries",
    "",
    "- No TODO files were rewritten automatically.",
    "- Auto-merge remains disabled/report-only.",
    "- Auto-repair remains disabled/report-only.",
    "- No deployment is triggered by this check."
  ].join("\n");

  fs.mkdirSync(absolutePath(path.dirname(OUTPUT_REL)), { recursive: true });
  fs.writeFileSync(absolutePath(OUTPUT_REL), `${report}\n`, "utf8");

  console.log("WellFit Task Status Work Log Sync Check");
  console.log(`Mode: ${MODE}`);
  console.log(`Never rewrites files: ${NEVER_REWRITES_FILES}`);
  console.log(`TASK_STATUS_SYNC_READY=${ready ? "true" : "false"}`);
  console.log("");
  console.log(`Errors: ${results.errors.length}`);
  for (const error of results.errors) console.log(`- ERROR: ${error}`);
  console.log(`Warnings: ${results.warnings.length}`);
  for (const warning of results.warnings) console.log(`- WARNING: ${warning}`);
  console.log(`Report: ${OUTPUT_REL}`);

  if (!ready) process.exit(1);
}

main();
