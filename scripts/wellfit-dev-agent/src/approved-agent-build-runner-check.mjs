#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POLICY_PATH = "project-register/approved-agent-build-runner-policy.json";
const STATE_PATH = "project-register/agent-build-runner-state.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const CATALOG_PATH = "project-register/agent-catalog.json";
const PROPOSALS_PATH = "project-register/agent-build-proposals.json";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const DOC_PATH = "docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md";
const CHECK_PATH = "scripts/wellfit-dev-agent/src/approved-agent-build-runner-check.mjs";
const DRY_RUN_PATH = "scripts/wellfit-dev-agent/src/approved-agent-build-runner-dry-run.mjs";
const QUALITY_GATE_PATH = "scripts/wellfit-dev-agent/src/quality-gate.mjs";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/approved-agent-build-runner-check-report.md";

const REQUIRED_POLICY_FIELDS = [
  "version", "updated", "activationState", "purpose", "approvedBacklogSource", "maxAgentsPerRun",
  "allowedAgentBuildCategories", "forbiddenAgentBuildCategories", "allowedPaths", "forbiddenPaths",
  "requiredPreBuildChecks", "requiredBuildChecks", "requiredPostBuildChecks", "requiredPostPRChecks",
  "requiredMergeGateChecks", "requiredCheckEvidenceRules", "missingCheckHandlingRules", "safeRepairAttemptRules",
  "unsafeRepairStopRules", "mergeEligibilityRules", "autoMergeBoundaries", "workLogUpdateRules",
  "catalogBacklogUpdateRules", "continuityUpdateRules", "replacementPRRules", "stopConditions",
  "forbiddenAutoActions", "reportOutputSchema"
];
const REQUIRED_STATE_FIELDS = ["version", "updated", "activationState", "purpose", "lastEvaluatedBacklogEntry", "lastGeneratedPrompt", "lastRunnerDryRun", "lastRepairAttempt", "lastMergeGateEvaluation", "entries"];
const REQUIRED_ALLOWED_CATEGORIES = ["report_only_agent_framework", "documentation_register_validation_agent", "governance_agent", "planning_only_product_agent", "website_agent_governance", "motivation_ethics_agent_governance"];
const FORBIDDEN_CATEGORY_TERMS = ["runtime_product_code", "UI implementation", "mission implementation", "Buddy runtime implementation", "Firebase Functions implementation", "Firestore Rules changes", "Unity / AR implementation", "reward authority", "mission completion authority", "economy / token / wallet / payment", "health / child / location / privacy / compliance / legal changes", "package or deployment changes"];
const REQUIRED_ALLOWED_PATHS = ["project-register/*.json", "todolist/*.md", "docs/architecture/*.md", "scripts/wellfit-dev-agent/src/*check.mjs", "scripts/wellfit-dev-agent/src/*dry-run.mjs", "scripts/wellfit-dev-agent/src/*report.mjs", "scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs"];
const REQUIRED_FORBIDDEN_PATHS = ["app/**", "components/**", "lib/**", "functions/**", "firestore.rules", "public/**", "package.json", "package-lock.json", "firebase.json", ".github/**", "native/**", "native/unity/WellFitBuddyAR/**", "PR #13 / Unity paths"];
const MANDATORY_PRE = ["node scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs", "node scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs", "node scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs", "npm run agent:autopilot:dry-run", "npm run agent:quality-gate"];
const MANDATORY_BUILD = ["git diff --check", "jq empty on every changed project-register/*.json file", "npm run lint", "npx tsc --noEmit", "npm run build", "npm --prefix functions run check", "npm run agent:quality-gate", "any new agent-specific validator created by the build", "node scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs"];
const MANDATORY_POST_PR = ["node scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs", "node scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs", "node scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs", "node scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs", "node scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs", "node scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs", "npm run agent:quality-gate"];
const MANDATORY_MERGE_TERMS = ["PR exists", "PR branch is not main", "PR is mergeable", "required GitHub checks are success", "required local checks were actually executed and passed", "no runtime/protected files changed"];
const SAFE_REPAIR_IDS = ["markdown_trailing_whitespace", "missing_final_newline", "json_formatting_or_parse_errors_project_register", "missing_work_map_pointer", "missing_todo_index_pointer", "missing_ki_fortsetzung_prompt", "missing_expected_pr_output", "missing_required_output_locations_or_next_task", "missing_quality_gate_report_only_validator_registration", "missing_catalog_backlog_proposal_metadata", "missing_progress_or_work_log_evidence"];
const UNSAFE_STOP_TERMS = ["app/**", "components/**", "lib/**", "functions/**", "firestore.rules", "public/**", "package.json/package-lock.json", "firebase.json or .github/**", "native/** or Unity/PR #13", "reward authority", "mission-completion authority", "health/child/location/camera/biometric/consent/privacy/legal/compliance", "source-of-truth ambiguity", "high/critical risk"];
const REQUIRED_REFERENCES = [POLICY_PATH, STATE_PATH, DOC_PATH, CHECK_PATH, DRY_RUN_PATH];
const ALLOWED_POLICY_ACTIVATION_STATES = ["report_only", "single_agent_docs_execution", "single_agent_docs_register_build"];

function absolute(relativePath) { return path.join(ROOT, relativePath); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), "utf8"); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function add(results, name, passed, details) { results.push({ name, passed, details }); }
function missing(actual, required) { const hay = new Set(asArray(actual)); return required.filter((item) => !hay.has(item)); }
function containsAllText(values, requiredTerms) { const text = asArray(values).map((value) => typeof value === "string" ? value : JSON.stringify(value)).join("\n"); return requiredTerms.filter((term) => !text.toLowerCase().includes(term.toLowerCase())); }
function renderList(values) { return values.length ? values.map((value) => `- ${value}`).join("\n") : "- none"; }
function renderResults(results) { return ["| Check | Status | Details |", "|---|---|---|", ...results.map((r) => `| ${r.name} | ${r.passed ? "PASS" : "FAIL"} | ${String(r.details).replace(/\|/g, "\\|")} |`)].join("\n"); }

function main() {
  const policy = readJson(POLICY_PATH);
  const state = readJson(STATE_PATH);
  readJson(BACKLOG_PATH);
  readJson(CATALOG_PATH);
  readJson(PROPOSALS_PATH);

  const workMap = readText(WORK_MAP_PATH);
  const todoIndex = readText(TODO_INDEX_PATH);
  const qualityGate = readText(QUALITY_GATE_PATH);
  const results = [];

  add(results, "Policy has required top-level fields", missing(Object.keys(policy), REQUIRED_POLICY_FIELDS).length === 0, missing(Object.keys(policy), REQUIRED_POLICY_FIELDS).join(", ") || "complete");
  add(results, "State has required top-level fields", missing(Object.keys(state), REQUIRED_STATE_FIELDS).length === 0, missing(Object.keys(state), REQUIRED_STATE_FIELDS).join(", ") || "complete");
  add(results, "Policy activation is report-only or approved single-agent docs/register build execution", ALLOWED_POLICY_ACTIVATION_STATES.includes(policy.activationState), policy.activationState);
  add(results, "State is report-only", state.activationState === "report_only", state.activationState);
  add(results, "maxAgentsPerRun is <= 1 for first activation", Number(policy.maxAgentsPerRun) <= 1, String(policy.maxAgentsPerRun));
  add(results, "Allowed categories are exactly approved governance categories", missing(policy.allowedAgentBuildCategories, REQUIRED_ALLOWED_CATEGORIES).length === 0 && missing(REQUIRED_ALLOWED_CATEGORIES, policy.allowedAgentBuildCategories).length === 0, JSON.stringify(policy.allowedAgentBuildCategories));
  add(results, "Forbidden categories include runtime/protected classes", containsAllText(policy.forbiddenAgentBuildCategories, FORBIDDEN_CATEGORY_TERMS).length === 0, containsAllText(policy.forbiddenAgentBuildCategories, FORBIDDEN_CATEGORY_TERMS).join(", ") || "complete");
  add(results, "Allowed paths match docs/register/validator policy", missing(policy.allowedPaths, REQUIRED_ALLOWED_PATHS).length === 0 && missing(REQUIRED_ALLOWED_PATHS, policy.allowedPaths).length === 0, JSON.stringify(policy.allowedPaths));
  add(results, "Forbidden paths include protected/runtime paths", missing(policy.forbiddenPaths, REQUIRED_FORBIDDEN_PATHS).length === 0, missing(policy.forbiddenPaths, REQUIRED_FORBIDDEN_PATHS).join(", ") || "complete");
  add(results, "Required pre-build checks include mandatory commands", missing(policy.requiredPreBuildChecks, MANDATORY_PRE).length === 0, missing(policy.requiredPreBuildChecks, MANDATORY_PRE).join(", ") || "complete");
  add(results, "Required build checks include mandatory commands", missing(policy.requiredBuildChecks, MANDATORY_BUILD).length === 0, missing(policy.requiredBuildChecks, MANDATORY_BUILD).join(", ") || "complete");
  add(results, "Required post-PR checks include mandatory commands", missing(policy.requiredPostPRChecks, MANDATORY_POST_PR).length === 0, missing(policy.requiredPostPRChecks, MANDATORY_POST_PR).join(", ") || "complete");
  add(results, "Merge gate requires core mergeability and evidence", containsAllText(policy.requiredMergeGateChecks, MANDATORY_MERGE_TERMS).length === 0, containsAllText(policy.requiredMergeGateChecks, MANDATORY_MERGE_TERMS).join(", ") || "complete");
  add(results, "Missing-check handling blocks merge", containsAllText(policy.missingCheckHandlingRules, ["Missing required checks block merge", "attempt to run missing checks", "environment_blocked", "do not merge"]).length === 0, containsAllText(policy.missingCheckHandlingRules, ["Missing required checks block merge", "attempt to run missing checks", "environment_blocked", "do not merge"]).join(", ") || "complete");
  add(results, "Required check evidence rejects PR #109-style missing checks", containsAllText(policy.requiredCheckEvidenceRules, ["skipped", "not run", "missing", "unknown", "pending", "delegated to future CI", "PR #109", "not_merge_ready"]).length === 0, containsAllText(policy.requiredCheckEvidenceRules, ["skipped", "not run", "missing", "unknown", "pending", "delegated to future CI", "PR #109", "not_merge_ready"]).join(", ") || "complete");
  add(results, "Safe repair categories are limited to allowed docs/register/governance fixes", missing(asArray(policy.safeRepairAttemptRules).map((rule) => rule.id), SAFE_REPAIR_IDS).length === 0 && asArray(policy.safeRepairAttemptRules).length === SAFE_REPAIR_IDS.length, JSON.stringify(asArray(policy.safeRepairAttemptRules).map((rule) => rule.id)));
  add(results, "Safe repair execution requires rerun and new PR-branch commit", containsAllText(policy.safeRepairExecutionRequirements, ["new commit in the same PR branch", "rerun the failed checks", "rerun full required build and post-PR checks", "record repair attempt", "do not merge until all required checks pass"]).length === 0, containsAllText(policy.safeRepairExecutionRequirements, ["new commit in the same PR branch", "rerun the failed checks", "rerun full required build and post-PR checks", "record repair attempt", "do not merge until all required checks pass"]).join(", ") || "complete");
  add(results, "Unsafe repair stop rules include protected/runtime areas", containsAllText(policy.unsafeRepairStopRules, UNSAFE_STOP_TERMS).length === 0, containsAllText(policy.unsafeRepairStopRules, UNSAFE_STOP_TERMS).join(", ") || "complete");
  add(results, "Merge eligibility blocks unknown/missing/pending checks", containsAllText(policy.mergeEligibilityRules, ["unknown", "pending", "failed", "missing", "repair_required", "protected path findings"]).length === 0, containsAllText(policy.mergeEligibilityRules, ["unknown", "pending", "failed", "missing", "repair_required", "protected path findings"]).join(", ") || "complete");
  add(results, "Forbidden auto-actions block approval/merge/deploy/unrestricted repair", containsAllText(policy.forbiddenAutoActions, ["approve PRs", "self-approve", "merge with missing checks", "enable unrestricted auto-merge", "enable unrestricted auto-repair", "deploy", "PR #13", "Unity"]).length === 0, containsAllText(policy.forbiddenAutoActions, ["approve PRs", "self-approve", "merge with missing checks", "enable unrestricted auto-merge", "enable unrestricted auto-repair", "deploy", "PR #13", "Unity"]).join(", ") || "complete");
  add(results, "Work Map references policy, doc, scripts, and state", REQUIRED_REFERENCES.every((file) => workMap.includes(file)), REQUIRED_REFERENCES.filter((file) => !workMap.includes(file)).join(", ") || "complete");
  add(results, "TODO Index references policy, doc, scripts, and state", REQUIRED_REFERENCES.every((file) => todoIndex.includes(file)), REQUIRED_REFERENCES.filter((file) => !todoIndex.includes(file)).join(", ") || "complete");
  add(results, "Quality gate includes runner check", qualityGate.includes(CHECK_PATH), CHECK_PATH);
  add(results, "Quality gate includes runner dry run", qualityGate.includes(DRY_RUN_PATH), DRY_RUN_PATH);

  const ready = results.every((r) => r.passed);
  const report = `# Approved Agent Build Runner Check Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_CHECK_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nAPPROVED_AGENT_BUILD_RUNNER_READY=${ready ? "true" : "false"}\n\n## Safety Confirmations\n\n- Policy allows docs/register/validator agent builds: true\n- Never builds runtime agents: true\n- PR creation allowed for scoped docs/register agent builds: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Missing checks are not merge-ready: true\n- PR #109-style future-CI-only check evidence is not_merge_ready: true\n\n## Validation Results\n\n${renderResults(results)}\n\n## Required References\n\n${renderList(REQUIRED_REFERENCES)}\n`;
  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log(`WellFit approved agent build runner check report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_CHECK_ONLY");
  console.log("Policy allows docs/register/validator agent builds: true");
  console.log("Never builds runtime agents: true");
  console.log(`Docs/register/check-script execution may be activated: ${["single_agent_docs_execution", "single_agent_docs_register_build"].includes(policy.activationState)}`);
  console.log("PR creation allowed for scoped docs/register agent builds: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Missing checks are not merge-ready: true");
  console.log("PR #109-style missing-check PRs are not_merge_ready: true");
  console.log(`APPROVED_AGENT_BUILD_RUNNER_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
