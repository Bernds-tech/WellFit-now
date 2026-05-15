#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "autopilot-batch-limited-execution-check.md");

const REQUIRED_ALLOWED_CATEGORIES = [
  "documentation_baseline",
  "registry_sync",
  "repository_inventory_mapping",
  "agent_governance_docs",
  "progress_log_update",
  "cross_reference_maintenance",
  "product_readiness_registry_update",
  "route_api_drift_registry_followup",
  "concept_gap_registry_followup"
];

const REQUIRED_FORBIDDEN_CATEGORIES = [
  "runtime_product_code",
  "UI implementation",
  "mission implementation",
  "Buddy implementation",
  "Firebase Functions implementation",
  "Firestore Rules changes",
  "Unity / AR implementation",
  "reward authority",
  "economy / token / wallet / payment",
  "health / child / location / privacy / compliance / legal changes"
];

const REQUIRED_ALLOWED_PATHS = [
  "project-register/*.json",
  "todolist/*.md",
  "docs/architecture/*.md",
  "scripts/wellfit-dev-agent/src/*check.mjs",
  "scripts/wellfit-dev-agent/src/*dry-run.mjs"
];

const REQUIRED_FORBIDDEN_PATH_PREFIXES = [
  "app/**",
  "components/**",
  "lib/**",
  "functions/**",
  "firestore.rules",
  "native/unity/WellFitBuddyAR/**",
  "package.json",
  "package-lock.json",
  "public/**"
];

const BLOCKED_STATUSES = new Set(["blocked", "review_required", "done", "completed", "completed_initial_policy", "superseded", "stale"]);

function absolutePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolutePath(relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(asArray(values).filter((value) => typeof value === "string" && value.length > 0))];
}

function includesAll(actual, required) {
  const actualSet = new Set(asArray(actual));
  return required.filter((item) => !actualSet.has(item));
}

function normalizeForbiddenPath(pattern) {
  return String(pattern).replace(/\s+unless explicitly approved$/iu, "");
}

function globToRegExp(pattern) {
  const normalized = normalizeForbiddenPath(pattern);
  const escaped = normalized.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const source = escaped
    .replace(/\*\*\//gu, "(?:.*/)?")
    .replace(/\*\*/gu, ".*")
    .replace(/\*/gu, "[^/]*");
  return new RegExp(`^${source}$`, "u");
}

function patternMatches(pattern, candidatePath) {
  const normalizedPattern = normalizeForbiddenPath(pattern);
  if (normalizedPattern.endsWith("/**")) {
    const prefix = normalizedPattern.slice(0, -3);
    return candidatePath === prefix || candidatePath.startsWith(`${prefix}/`);
  }
  return globToRegExp(normalizedPattern).test(candidatePath);
}

function pathAllowed(candidatePath, allowedPatterns) {
  return asArray(allowedPatterns).some((pattern) => patternMatches(pattern, candidatePath));
}

function pathForbidden(candidatePath, forbiddenPatterns) {
  return asArray(forbiddenPatterns).some((pattern) => patternMatches(pattern, candidatePath));
}

function taskCategory(candidate) {
  return candidate?.taskCategory ?? candidate?.category ?? "uncategorized";
}

function isBlocked(candidate) {
  const status = String(candidate.status ?? "").toLowerCase();
  return BLOCKED_STATUSES.has(status) || asArray(candidate.blockedBy).length > 0 || candidate.blocked === true;
}

function textMentionsForbiddenTopic(candidate, forbiddenTopics) {
  const haystack = JSON.stringify({
    id: candidate.id,
    title: candidate.title,
    category: candidate.category,
    taskCategory: candidate.taskCategory,
    allowedFiles: candidate.allowedFiles,
    forbiddenFiles: candidate.forbiddenFiles,
    requiredChecks: candidate.requiredChecks,
    stopConditions: candidate.stopConditions
  }).toLowerCase();

  return asArray(forbiddenTopics)
    .filter((topic) => typeof topic === "string" && topic.length > 0)
    .filter((topic) => haystack.includes(topic.toLowerCase()));
}

function candidateReasons(candidate, policy) {
  const reasons = [];
  const riskLevel = String(candidate.riskLevel ?? "").toLowerCase();
  const category = taskCategory(candidate);
  const allowedFiles = asArray(candidate.allowedFiles);
  const filesOutsideAllowedPaths = allowedFiles.filter((file) => !pathAllowed(file, policy.allowedPaths));
  const filesInForbiddenPaths = allowedFiles.filter((file) => pathForbidden(file, policy.forbiddenPaths));
  const forbiddenTopics = textMentionsForbiddenTopic(candidate, policy.forbiddenTopics);

  if (isBlocked(candidate)) reasons.push("task_status_is_blocked_done_superseded_stale_or_review_required");
  if (riskLevel !== "low") reasons.push(`risk_not_low:${riskLevel || "missing"}`);
  if (!asArray(policy.allowedExecutionCategories).includes(category)) reasons.push(`category_not_allowed:${category}`);
  if (asArray(policy.forbiddenExecutionCategories).includes(category)) reasons.push(`category_forbidden:${category}`);
  if (!candidate.definitionOfDoneKey) reasons.push("definition_of_done_key_missing");
  if (allowedFiles.length === 0) reasons.push("allowed_files_missing");
  if (filesOutsideAllowedPaths.length > 0) reasons.push(`allowed_files_outside_policy:${filesOutsideAllowedPaths.join(",")}`);
  if (filesInForbiddenPaths.length > 0) reasons.push(`allowed_files_intersect_forbidden_paths:${filesInForbiddenPaths.join(",")}`);
  if (forbiddenTopics.length > 0) reasons.push(`forbidden_topics_detected:${unique(forbiddenTopics).join(",")}`);

  return reasons;
}

function currentBranch() {
  const result = spawnSync("git", ["branch", "--show-current"], { cwd: ROOT, encoding: "utf8", shell: false });
  if (result.status !== 0) return "";
  return result.stdout.trim();
}

function renderList(values) {
  const items = unique(values);
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function reportLine(label, value) {
  return `- ${label}: ${value}`;
}

function main() {
  const reasons = [];
  const policy = readJson("project-register/autopilot-batch-execution-policy.json");
  const batchDryRunPolicy = readJson("project-register/autopilot-batch-policy.json");
  const autoMergePolicy = readJson("project-register/auto-merge-policy.json");
  const autoRepairPolicy = readJson("project-register/auto-repair-policy.json");
  const queue = readJson("project-register/agent-task-queue.json");
  const progressLog = readJson("project-register/progress-log.json");
  const workLog = readJson("project-register/agent-work-log.json");

  if (policy.activationState !== "limited_execution_planning") reasons.push("activationState_is_not_limited_execution_planning");
  if (batchDryRunPolicy.activationState !== "dry_run_only") reasons.push("batch_dry_run_policy_not_dry_run_only");
  if (autoMergePolicy.activationState !== "report_only") reasons.push("auto_merge_policy_not_report_only");
  if (autoRepairPolicy.activationState !== "report_only") reasons.push("auto_repair_policy_not_report_only");

  const missingAllowedCategories = includesAll(policy.allowedExecutionCategories, REQUIRED_ALLOWED_CATEGORIES);
  const unexpectedAllowedCategories = asArray(policy.allowedExecutionCategories).filter((category) => !REQUIRED_ALLOWED_CATEGORIES.includes(category));
  const missingForbiddenCategories = includesAll(policy.forbiddenExecutionCategories, REQUIRED_FORBIDDEN_CATEGORIES);
  const missingAllowedPaths = includesAll(policy.allowedPaths, REQUIRED_ALLOWED_PATHS);
  const missingForbiddenPaths = REQUIRED_FORBIDDEN_PATH_PREFIXES.filter((required) => !asArray(policy.forbiddenPaths).some((actual) => normalizeForbiddenPath(actual) === required));

  if (missingAllowedCategories.length > 0) reasons.push(`missing_allowed_execution_categories:${missingAllowedCategories.join(",")}`);
  if (unexpectedAllowedCategories.length > 0) reasons.push(`unexpected_allowed_execution_categories:${unexpectedAllowedCategories.join(",")}`);
  if (missingForbiddenCategories.length > 0) reasons.push(`missing_forbidden_execution_categories:${missingForbiddenCategories.join(",")}`);
  if (missingAllowedPaths.length > 0) reasons.push(`missing_allowed_paths:${missingAllowedPaths.join(",")}`);
  if (missingForbiddenPaths.length > 0) reasons.push(`missing_forbidden_paths:${missingForbiddenPaths.join(",")}`);

  if (policy.noAutoMergeRule?.mustRemainDisabled !== true || policy.noAutoMergeRule?.requiredActivationState !== "report_only") reasons.push("auto_merge_disable_rule_missing_or_weak");
  if (policy.noAutoRepairRule?.mustRemainDisabled !== true || policy.noAutoRepairRule?.requiredActivationState !== "report_only") reasons.push("auto_repair_disable_rule_missing_or_weak");
  if (policy.noDeployRule?.deploymentForbidden !== true) reasons.push("deployment_forbidden_rule_missing_or_weak");
  if (policy.humanApprovalRules?.humanApprovalRequiredBeforeAnyFutureExecution !== true) reasons.push("human_approval_before_execution_missing");
  if (policy.humanApprovalRules?.selfApprovalForbidden !== true) reasons.push("self_approval_forbidden_rule_missing");
  if (policy.prCreationRules?.firstVersionNeverCreatesPullRequests !== true) reasons.push("first_version_pr_creation_not_blocked");

  const branch = currentBranch();
  if (!branch) reasons.push("current_branch_unclear");
  if (["main", "master"].includes(branch)) reasons.push(`current_branch_forbidden:${branch}`);

  const candidateResults = asArray(queue.taskCandidates).map((candidate) => ({
    id: candidate.id ?? "missing-id",
    title: candidate.title ?? "Untitled",
    category: taskCategory(candidate),
    reasons: candidateReasons(candidate, policy)
  }));
  const executableCandidates = candidateResults.filter((candidate) => candidate.reasons.length === 0);
  const blockedCandidates = candidateResults.filter((candidate) => candidate.reasons.length > 0);

  const executableLimit = Number(policy.maxExecutableTasks);
  if (!Number.isInteger(executableLimit) || executableLimit < 1) reasons.push("maxExecutableTasks_missing_or_invalid");
  if (executableCandidates.length > executableLimit) reasons.push(`executable_candidate_count_exceeds_limit:${executableCandidates.length}/${executableLimit}`);
  if (!Number.isInteger(Number(policy.maxRuntimeMinutes)) || Number(policy.maxRuntimeMinutes) < 1) reasons.push("maxRuntimeMinutes_missing_or_invalid");

  const progressEntries = asArray(progressLog.entries).length;
  const workLogEntries = asArray(workLog.entries).length;

  const ready = reasons.length === 0;
  const safetyConfirmations = [
    "Never executes tasks in first version: true",
    "Never creates pull requests in first version: true",
    "Never merges: true",
    "Never repairs: true",
    "Never deploys: true",
    "Never approves own work: true",
    "Auto-merge remains disabled: true",
    "Auto-repair remains disabled: true",
    "Human approval required before execution: true"
  ];

  const report = `# WellFit Batch Autopilot Limited Execution Check\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_CHECK_ONLY\nBATCH_LIMITED_EXECUTION_READY=${ready ? "true" : "false"}\nResult: ${ready ? "PASS" : "FAIL"}\n\n## Policy State\n\n${[
    reportLine("Activation state", policy.activationState),
    reportLine("Batch dry-run activation state", batchDryRunPolicy.activationState),
    reportLine("Auto-merge activation state", autoMergePolicy.activationState),
    reportLine("Auto-repair activation state", autoRepairPolicy.activationState),
    reportLine("Current branch", branch || "unknown"),
    reportLine("Max executable tasks", policy.maxExecutableTasks),
    reportLine("Max runtime minutes", policy.maxRuntimeMinutes),
    reportLine("Progress log entries read", progressEntries),
    reportLine("Agent work log entries read", workLogEntries)
  ].join("\n")}\n\n## Safety Confirmations\n\n${renderList(safetyConfirmations)}\n\n## Reasons\n\n${renderList(reasons.length ? reasons : ["limited_execution_policy_ready_for_report_check_only"])}\n\n## Executable Candidate Summary\n\n${renderList(executableCandidates.map((candidate) => `${candidate.id}: ${candidate.title} (${candidate.category})`))}\n\n## Blocked Candidate Summary\n\n${renderList(blockedCandidates.slice(0, 20).map((candidate) => `${candidate.id}: ${candidate.reasons.join("; ")}`))}\n\n## First Version Boundary\n\nThis checker never executes tasks, creates pull requests, merges, repairs, deploys, or approves its own work. It only reports whether the future limited execution policy is internally ready for human review.\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log("WellFit Batch Autopilot Limited Execution Check");
  console.log("Mode: REPORT_CHECK_ONLY");
  console.log(`BATCH_LIMITED_EXECUTION_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  console.log(`Activation state: ${policy.activationState}`);
  console.log(`Batch dry-run activation state: ${batchDryRunPolicy.activationState}`);
  console.log(`Auto-merge activation state: ${autoMergePolicy.activationState}`);
  console.log(`Auto-repair activation state: ${autoRepairPolicy.activationState}`);
  console.log(`Current branch: ${branch || "unknown"}`);
  console.log("Never executes tasks in first version: true");
  console.log("Never creates pull requests in first version: true");
  console.log("Never merges: true");
  console.log("Never repairs: true");
  console.log("Never deploys: true");
  console.log("Never approves own work: true");
  console.log("Auto-merge remains disabled: true");
  console.log("Auto-repair remains disabled: true");
  console.log("Human approval required before execution: true");
  console.log(`Executable candidates: ${executableCandidates.length}`);
  for (const candidate of executableCandidates) console.log(`- ${candidate.id}: ${candidate.title} (${candidate.category})`);
  console.log("Reasons:");
  for (const reason of reasons.length ? reasons : ["limited_execution_policy_ready_for_report_check_only"]) console.log(`- ${reason}`);
  console.log(`Report: ${path.relative(ROOT, OUTPUT_PATH)}`);

  if (!ready) process.exit(1);
}

main();
