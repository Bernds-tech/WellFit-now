#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MODE = "PR_HANDOFF_ALLOWED_NO_MERGE";
const NEVER_INSPECTS_PRIVATE_GITHUB_CREDENTIALS = true;
const NEVER_MERGES = true;
const NEVER_APPROVES = true;
const NEVER_REPAIRS_FILES = false;
const NEVER_DEPLOYS = true;

const POLICY_REL = "project-register/pr-post-creation-guard.json";
const WORK_MAP_REL = "todolist/WORK_MAP.md";
const TODO_INDEX_REL = "todolist/TODO_INDEX.md";

const requiredTopLevelFields = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "requiredPostPRChecks",
  "mergeabilityStates",
  "checkStatusStates",
  "safeRepairEligibilityRules",
  "replacementPRRules",
  "stopForHumanReviewRules",
  "forbiddenAutoActions",
  "requiredEvidence",
  "requiredPRDescriptionFields",
  "interactionWithAutoMergePolicy",
  "interactionWithAutoRepairPolicy",
  "interactionWithTaskStatusPolicy",
  "reportOutputSchema"
];

const requiredPostPRCheckIds = [
  "pr_url_or_number_exists",
  "pr_branch_is_not_main",
  "mergeability_inspected_after_creation",
  "required_check_status_inspected_after_creation",
  "changed_files_listed",
  "protected_paths_checked",
  "auto_merge_eligibility_reported",
  "auto_repair_decision_reported",
  "pr_review_policy_reported",
  "task_status_or_work_log_entry_present_or_deferred",
  "next_recommended_action_stated"
];

const requiredMergeabilityStates = [
  "mergeable",
  "not_mergeable",
  "unknown_pending_github_calculation",
  "dirty_conflict",
  "blocked_by_checks",
  "blocked_by_review",
  "blocked_by_policy",
  "replaced"
];

const requiredCheckStatusStates = ["success", "failure", "pending", "skipped", "missing", "unknown"];

const requiredForbiddenRepairAreas = [
  "runtime_product_code_repair",
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
  "token_nft_wallet_payment_betting_economy_authority_repair",
  "reward_authority_or_mission_completion_authority_repair",
  "health_child_location_privacy_legal_compliance_repair",
  "pr_13_or_unity_repair",
  "source_of_truth_judgment_beyond_docs_register_metadata"
];

const requiredForbiddenAutoActions = [
  "no auto-merge",
  "no self-approval",
  "no deployment",
  "no protected runtime repair",
  "no bypassing failed checks",
  "no closing PR #13",
  "no modifying Unity files",
  "no changing repository settings"
];

const requiredReferences = [
  POLICY_REL,
  "docs/architecture/WELLFIT_PR_POST_CREATION_MERGEABILITY_GUARD.md",
  "scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs"
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

function readText(relativePath, results) {
  try {
    return fs.readFileSync(absolute(relativePath), "utf8");
  } catch (error) {
    results.fail.push(`Unable to read ${relativePath}: ${error.message}`);
    return "";
  }
}

function readPolicy(results) {
  try {
    return JSON.parse(readText(POLICY_REL, results));
  } catch (error) {
    results.fail.push(`${POLICY_REL} is not valid JSON: ${error.message}`);
    return null;
  }
}

function validateTopLevel(policy, results) {
  for (const field of requiredTopLevelFields) {
    if (!(field in policy)) results.fail.push(`Missing top-level field: ${field}`);
  }
  if (policy.activationState !== "pr_handoff_allowed_no_merge") results.fail.push("activationState must be pr_handoff_allowed_no_merge.");
  if (!hasText(policy.purpose)) results.fail.push("purpose must be a non-empty string.");
}

function validateRequiredPostPRChecks(policy, results) {
  const checks = asArray(policy.requiredPostPRChecks);
  const ids = new Set(checks.map((item) => item?.id).filter(Boolean));

  for (const requiredId of requiredPostPRCheckIds) {
    if (!ids.has(requiredId)) results.fail.push(`Missing required post-PR check: ${requiredId}`);
  }

  for (const item of checks) {
    if (!hasText(item?.id)) results.fail.push("Post-PR check has missing id.");
    if (!hasText(item?.label)) results.fail.push(`Post-PR check ${item?.id ?? "<unknown>"} has missing label.`);
    if (!hasText(item?.requiredEvidence)) results.fail.push(`Post-PR check ${item?.id ?? "<unknown>"} has missing requiredEvidence.`);
  }
}

function validateStateList(policy, field, requiredValues, results) {
  const values = new Set(asArray(policy[field]));
  for (const requiredValue of requiredValues) {
    if (!values.has(requiredValue)) results.fail.push(`${field} is missing ${requiredValue}.`);
  }
}

function validateSafeRepairRules(policy, results) {
  const rules = policy.safeRepairEligibilityRules ?? {};
  if (rules.activationState !== "safe_docs_register_json_format_repair_allowed") results.fail.push("safeRepairEligibilityRules.activationState must be safe_docs_register_json_format_repair_allowed.");
  if (rules.repairMustRemainWithinAllowedDocsRegisterScope !== true) results.fail.push("safeRepairEligibilityRules.repairMustRemainWithinAllowedDocsRegisterScope must be true.");

  const forbiddenAreas = new Set(asArray(rules.forbiddenRepairAreas));
  for (const requiredArea of requiredForbiddenRepairAreas) {
    if (!forbiddenAreas.has(requiredArea)) results.fail.push(`safeRepairEligibilityRules.forbiddenRepairAreas is missing ${requiredArea}.`);
  }
}

function validateReplacementRules(policy, results) {
  const rules = policy.replacementPRRules ?? {};
  const requiredBooleanRules = [
    "allowedOnlyWhenOldBranchCannotBeSafelyRepaired",
    "mustStartFromCurrentMain",
    "mustPreserveApprovedDeliverable",
    "mustStateWhichPRItReplaces",
    "noRuntimeOrProtectedScopeExpansionAllowed",
    "requiresHumanReviewForProtectedOrHighRiskScope"
  ];

  for (const field of requiredBooleanRules) {
    if (rules[field] !== true) results.fail.push(`replacementPRRules.${field} must be true.`);
  }
  if (!hasText(rules.oldPRClosureRule)) results.fail.push("replacementPRRules.oldPRClosureRule must be present.");
}

function validateForbiddenAutoActions(policy, results) {
  const actions = new Set(asArray(policy.forbiddenAutoActions));
  for (const action of requiredForbiddenAutoActions) {
    if (!actions.has(action)) results.fail.push(`forbiddenAutoActions is missing ${action}.`);
  }
}

function validatePolicyInteractions(policy, results) {
  const interactions = [
    ["interactionWithAutoMergePolicy", "AUTO_MERGE_ELIGIBLE", "doesNotAuthorizeMerge"],
    ["interactionWithAutoRepairPolicy", "AUTO_REPAIR_ALLOWED", "authorizesOnlySafeDocsRegisterJsonRepairs"],
    ["interactionWithTaskStatusPolicy", "task-status-work-log-check.mjs", "requiresProgressOrWorkLogEvidenceOrExplicitDeferral"]
  ];

  for (const [field, outputPattern, guardField] of interactions) {
    const section = policy[field] ?? {};
    if (field !== "interactionWithAutoRepairPolicy" && section.reportOnly !== true) results.fail.push(`${field}.reportOnly must be true.`);
    if (!String(section.requiredOutputPattern ?? section.script ?? "").includes(outputPattern)) results.fail.push(`${field} must reference ${outputPattern}.`);
    if (section[guardField] !== true) results.fail.push(`${field}.${guardField} must be true.`);
  }
}

function validateReportSchema(policy, results) {
  const schema = policy.reportOutputSchema ?? {};
  if (schema.mode !== MODE) results.fail.push("reportOutputSchema.mode must be PR_HANDOFF_ALLOWED_NO_MERGE.");
  if (!String(schema.readyOutputPattern ?? "").includes("PR_POST_CREATION_GUARD_READY")) results.fail.push("reportOutputSchema.readyOutputPattern must mention PR_POST_CREATION_GUARD_READY.");
  if (schema.neverInspectsPrivateGitHubCredentials !== true) results.fail.push("reportOutputSchema.neverInspectsPrivateGitHubCredentials must be true.");
  if (schema.neverMerges !== true) results.fail.push("reportOutputSchema.neverMerges must be true.");
  if (schema.neverApproves !== true) results.fail.push("reportOutputSchema.neverApproves must be true.");
  if (schema.repairsOnlyWhenAutoRepairPolicyAllowsSafeDocsRegisterJsonFixes !== true) results.fail.push("reportOutputSchema.repairsOnlyWhenAutoRepairPolicyAllowsSafeDocsRegisterJsonFixes must be true.");
  if (schema.neverDeploys !== true) results.fail.push("reportOutputSchema.neverDeploys must be true.");
}

function validateReferences(results) {
  const workMap = readText(WORK_MAP_REL, results);
  const todoIndex = readText(TODO_INDEX_REL, results);

  for (const reference of requiredReferences) {
    if (!workMap.includes(reference)) results.fail.push(`${WORK_MAP_REL} does not reference ${reference}.`);
    if (!todoIndex.includes(reference)) results.fail.push(`${TODO_INDEX_REL} does not reference ${reference}.`);
  }
}

function renderList(items, fallback) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : fallback;
}

function main() {
  const results = { pass: [], fail: [], warn: [] };
  const policy = readPolicy(results);

  if (policy) {
    validateTopLevel(policy, results);
    validateRequiredPostPRChecks(policy, results);
    validateStateList(policy, "mergeabilityStates", requiredMergeabilityStates, results);
    validateStateList(policy, "checkStatusStates", requiredCheckStatusStates, results);
    validateSafeRepairRules(policy, results);
    validateReplacementRules(policy, results);
    validateForbiddenAutoActions(policy, results);
    validatePolicyInteractions(policy, results);
    validateReportSchema(policy, results);
  }

  validateReferences(results);

  const ready = results.fail.length === 0;
  if (ready) {
    results.pass.push(`${POLICY_REL} parsed successfully.`);
    results.pass.push(`All ${requiredPostPRCheckIds.length} required post-PR checks exist.`);
    results.pass.push("All required mergeability and check status states exist.");
    results.pass.push("Safe repair docs/register boundary, replacement PR rules, and forbidden auto actions are present.");
    results.pass.push(`${WORK_MAP_REL} and ${TODO_INDEX_REL} reference the policy, doc, and script.`);
  }

  console.log("WellFit PR post-creation mergeability guard check complete");
  console.log(`Mode: ${MODE}`);
  console.log(`Never inspects private GitHub credentials: ${NEVER_INSPECTS_PRIVATE_GITHUB_CREDENTIALS}`);
  console.log(`Never merges PRs: ${NEVER_MERGES}`);
  console.log(`Never approves PRs: ${NEVER_APPROVES}`);
  console.log(`Repairs limited to auto-repair policy safe docs/register JSON fixes: ${!NEVER_REPAIRS_FILES}`);
  console.log(`Never deploys: ${NEVER_DEPLOYS}`);
  console.log(`PR_POST_CREATION_GUARD_READY=${ready ? "true" : "false"}`);
  console.log("\nPASS");
  console.log(renderList(results.pass, "- No explicit pass details recorded."));
  console.log("\nFAIL");
  console.log(renderList(results.fail, "- No failures."));
  console.log("\nWARNING");
  console.log(renderList(results.warn, "- No warnings."));

  if (!ready) process.exit(1);
}

main();
