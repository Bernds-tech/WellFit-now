#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "batch-execution-runner-check.md");

const POLICY_PATH = "project-register/batch-execution-runner-policy.json";
const BATCH_EXECUTION_POLICY_PATH = "project-register/autopilot-batch-execution-policy.json";
const BATCH_DRY_RUN_POLICY_PATH = "project-register/autopilot-batch-policy.json";
const TASK_QUEUE_PATH = "project-register/agent-task-queue.json";
const AUTO_MERGE_POLICY_PATH = "project-register/auto-merge-policy.json";
const AUTO_REPAIR_POLICY_PATH = "project-register/auto-repair-policy.json";
const PR_POST_CREATION_GUARD_PATH = "project-register/pr-post-creation-guard.json";

const REQUIRED_ALLOWED_RISK_LEVELS = ["low"];
const REQUIRED_ALLOWED_CATEGORIES = [
  "documentation_baseline",
  "registry_sync",
  "repository_inventory_mapping",
  "agent_governance_docs",
  "progress_log_update",
  "cross_reference_maintenance",
  "product_readiness_registry_update",
  "route_api_drift_registry_followup",
  "concept_gap_registry_followup",
  "pr_review_governance",
  "pr_diff_review_governance",
  "task_status_governance"
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
  "mission completion authority",
  "economy / token / wallet / payment",
  "health / child / location / privacy / compliance / legal changes"
];
const REQUIRED_ALLOWED_PATHS = [
  "project-register/*.json",
  "todolist/*.md",
  "docs/architecture/*.md",
  "scripts/wellfit-dev-agent/src/*check.mjs",
  "scripts/wellfit-dev-agent/src/*dry-run.mjs",
  "scripts/wellfit-dev-agent/src/*report.mjs"
];
const REQUIRED_FORBIDDEN_PATHS = [
  "app/**",
  "components/**",
  "lib/**",
  "functions/**",
  "firestore.rules",
  "public/**",
  "package.json",
  "package-lock.json",
  "firebase.json",
  ".github/**",
  "native/unity/WellFitBuddyAR/**",
  "native/**",
  "PR #13 / Unity paths"
];
const REQUIRED_POST_PR_CHECKS = [
  "auto-merge eligibility check",
  "auto-repair decision check",
  "PR review policy check",
  "PR post-creation guard check",
  "PR diff review report",
  "task-status/work-log check",
  "quality gate"
];
const REQUIRED_FORBIDDEN_AUTO_ACTIONS = [
  "execute tasks autonomously",
  "create pull requests automatically",
  "approve pull requests",
  "merge pull requests",
  "close pull requests",
  "auto-repair files",
  "deploy",
  "modify runtime product code",
  "modify protected areas",
  "bypass human review"
];
const ALLOWED_RUNNER_ACTIVATION_STATES = ["framework_only", "single_agent_docs_execution"];

function absolutePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolutePath(relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function includesAll(actual, required) {
  const actualSet = new Set(asArray(actual));
  return required.filter((item) => !actualSet.has(item));
}

function hasOnly(actual, allowed) {
  const allowedSet = new Set(allowed);
  return asArray(actual).filter((item) => !allowedSet.has(item));
}

function textIncludesAny(values, terms) {
  const haystack = asArray(values).join("\n").toLowerCase();
  return terms.filter((term) => haystack.includes(term.toLowerCase()));
}

function collectPolicyChecks(policy, batchExecutionPolicy, batchPolicy, taskQueue, autoMergePolicy, autoRepairPolicy, prPostCreationGuard) {
  const checks = [];
  const add = (name, passed, details) => checks.push({ name, passed, details });

  const missingAllowedCategories = includesAll(policy.allowedTaskCategories, REQUIRED_ALLOWED_CATEGORIES);
  const extraAllowedCategories = hasOnly(policy.allowedTaskCategories, REQUIRED_ALLOWED_CATEGORIES);
  const missingForbiddenCategories = includesAll(policy.forbiddenTaskCategories, REQUIRED_FORBIDDEN_CATEGORIES);
  const missingAllowedPaths = includesAll(policy.allowedPaths, REQUIRED_ALLOWED_PATHS);
  const extraAllowedPaths = hasOnly(policy.allowedPaths, REQUIRED_ALLOWED_PATHS);
  const missingForbiddenPaths = includesAll(policy.forbiddenPaths, REQUIRED_FORBIDDEN_PATHS);
  const missingPostPrChecks = includesAll(policy.requiredPostPRChecks, REQUIRED_POST_PR_CHECKS);
  const missingForbiddenAutoActions = includesAll(policy.forbiddenAutoActions, REQUIRED_FORBIDDEN_AUTO_ACTIONS);

  add("Runner activation state is framework_only or approved single-agent docs execution", ALLOWED_RUNNER_ACTIVATION_STATES.includes(policy.activationState), policy.activationState ?? "missing");
  add("Runner maxTasksPerRun is <= 2", Number.isInteger(policy.maxTasksPerRun) && policy.maxTasksPerRun <= 2, String(policy.maxTasksPerRun ?? "missing"));
  add("Runner only allows low risk", includesAll(policy.allowedTaskRiskLevels, REQUIRED_ALLOWED_RISK_LEVELS).length === 0 && hasOnly(policy.allowedTaskRiskLevels, REQUIRED_ALLOWED_RISK_LEVELS).length === 0, `allowed=${asArray(policy.allowedTaskRiskLevels).join(",") || "missing"}`);
  add("Runner allowed categories are the approved low-risk governance set", missingAllowedCategories.length === 0 && extraAllowedCategories.length === 0, `missing=${missingAllowedCategories.join(",") || "none"}; extra=${extraAllowedCategories.join(",") || "none"}`);
  add("Runner forbidden categories include protected implementation and authority categories", missingForbiddenCategories.length === 0, missingForbiddenCategories.join(",") || "complete");
  add("Runner allowed paths are strictly documentation/register/governance script paths", missingAllowedPaths.length === 0 && extraAllowedPaths.length === 0, `missing=${missingAllowedPaths.join(",") || "none"}; extra=${extraAllowedPaths.join(",") || "none"}`);
  add("Runner forbidden paths include runtime, package, GitHub, public, native, Unity, and PR #13 boundaries", missingForbiddenPaths.length === 0, missingForbiddenPaths.join(",") || "complete");
  add("Runner required post-PR checks include PR diff and post-creation guard", missingPostPrChecks.length === 0 && textIncludesAny(policy.requiredPostPRChecks, ["PR diff review report", "PR post-creation guard check"]).length === 2, missingPostPrChecks.join(",") || "complete");
  add("Runner forbidden auto-actions block execution, PR creation, merge, repair, deploy, and approval", missingForbiddenAutoActions.length === 0, missingForbiddenAutoActions.join(",") || "complete");

  add("Limited execution policy remains planning/report-only", batchExecutionPolicy.activationState === "limited_execution_planning", batchExecutionPolicy.activationState ?? "missing");
  add("Limited execution maxExecutableTasks is <= 2", Number.isInteger(batchExecutionPolicy.maxExecutableTasks) && batchExecutionPolicy.maxExecutableTasks <= 2, String(batchExecutionPolicy.maxExecutableTasks ?? "missing"));
  add("Batch dry-run policy remains dry_run_only", batchPolicy.activationState === "dry_run_only", batchPolicy.activationState ?? "missing");
  add("Task queue is available for future selection checks", asArray(taskQueue.taskCandidates).length > 0, `${asArray(taskQueue.taskCandidates).length} candidates`);

  add("Auto-merge remains disabled/report-only", autoMergePolicy.activationState === "report_only", autoMergePolicy.activationState ?? "missing");
  add("Auto-repair remains disabled or limited to safe docs/register JSON repair", ["report_only", "safe_docs_register_json_format_repair_allowed"].includes(autoRepairPolicy.activationState), autoRepairPolicy.activationState ?? "missing");
  add("Deployment remains forbidden", policy.stopConditions?.includes("deployment_not_forbidden") === true && policy.forbiddenAutoActions?.includes("deploy") === true && batchExecutionPolicy.noDeployRule?.deploymentForbidden === true, `runnerDeployForbidden=${policy.forbiddenAutoActions?.includes("deploy") === true}; limitedPolicyDeployForbidden=${batchExecutionPolicy.noDeployRule?.deploymentForbidden === true}`);
  add("Human review is required before merge", batchExecutionPolicy.humanApprovalRules?.mergeApprovalOwnedByHumanReviewer === true && asArray(prPostCreationGuard.stopForHumanReviewRules).length > 0 && asArray(prPostCreationGuard.forbiddenAutoActions).includes("no auto-merge"), `mergeApprovalOwnedByHumanReviewer=${batchExecutionPolicy.humanApprovalRules?.mergeApprovalOwnedByHumanReviewer === true}`);
  add("Runner report schema exposes BATCH_EXECUTION_RUNNER_READY", policy.reportOutputSchema?.readinessFlag === "BATCH_EXECUTION_RUNNER_READY=true|false", policy.reportOutputSchema?.readinessFlag ?? "missing");

  return checks;
}

function renderChecks(checks) {
  return ["| Check | Status | Details |", "|---|---|---|", ...checks.map((check) => `| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${check.details} |`)].join("\n");
}

function main() {
  const policy = readJson(POLICY_PATH);
  const batchExecutionPolicy = readJson(BATCH_EXECUTION_POLICY_PATH);
  const batchPolicy = readJson(BATCH_DRY_RUN_POLICY_PATH);
  const taskQueue = readJson(TASK_QUEUE_PATH);
  const autoMergePolicy = readJson(AUTO_MERGE_POLICY_PATH);
  const autoRepairPolicy = readJson(AUTO_REPAIR_POLICY_PATH);
  const prPostCreationGuard = readJson(PR_POST_CREATION_GUARD_PATH);

  const checks = collectPolicyChecks(policy, batchExecutionPolicy, batchPolicy, taskQueue, autoMergePolicy, autoRepairPolicy, prPostCreationGuard);
  const ready = checks.every((check) => check.passed);
  const failed = checks.filter((check) => !check.passed).map((check) => `${check.name}: ${check.details}`);

  const report = `# Batch Execution Runner Check\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_CHECK_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nBATCH_EXECUTION_RUNNER_READY=${ready ? "true" : "false"}\n\n## Safety Confirmations\n\n- Never executes tasks: true\n- Never creates PRs: true\n- Never merges: true\n- Never repairs: true\n- Never deploys: true\n- Never approves PRs: true\n- Auto-merge remains disabled/report-only: ${autoMergePolicy.activationState === "report_only"}\n- Auto-repair remains disabled or limited to safe docs/register JSON repair: ${["report_only", "safe_docs_register_json_format_repair_allowed"].includes(autoRepairPolicy.activationState)}\n- Deployment remains forbidden: ${batchExecutionPolicy.noDeployRule?.deploymentForbidden === true}\n- Human review required before merge: ${batchExecutionPolicy.humanApprovalRules?.mergeApprovalOwnedByHumanReviewer === true}\n\n## Gate Checks\n\n${renderChecks(checks)}\n\n## Failed Reasons\n\n${failed.length ? failed.map((reason) => `- ${reason}`).join("\n") : "No failed checks."}\n\n## Non-Execution Boundary\n\nThis script only reads policy/register files and writes this report. It never selects tasks for execution, never edits task files, never creates pull requests, never approves, never merges, never repairs, and never deploys.\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log("Mode: REPORT_CHECK_ONLY");
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  console.log(`BATCH_EXECUTION_RUNNER_READY=${ready ? "true" : "false"}`);
  console.log("Never executes tasks: true");
  console.log("Never executes runtime/protected tasks: true");
  console.log(`Docs/register/check-script execution may be activated: ${policy.activationState === "single_agent_docs_execution"}`);
  console.log("Never creates PRs: true");
  console.log("Never merges: true");
  console.log("Never repairs: true");
  console.log("Never deploys: true");
  console.log("Never approves PRs: true");
  console.log(`Report: ${path.relative(ROOT, OUTPUT_PATH)}`);
  if (!ready) for (const reason of failed) console.log(`FAIL: ${reason}`);
  if (!ready) process.exit(1);
}

main();
