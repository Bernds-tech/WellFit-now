#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/ethical-engagement-guard.json";
const DOC_PATH = "docs/architecture/WELLFIT_ETHICAL_ENGAGEMENT_GUARD.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/ethical-engagement-guard-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/ethical-engagement-guard-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "ethicalEngagementPrinciples",
  "allowedEngagementPatterns",
  "forbiddenEngagementPatterns",
  "ageAppropriateDesignRules",
  "recoveryAndPauseRules",
  "aiBuddyToneRules",
  "missionDesignRules",
  "rewardDesignRules",
  "socialFeatureRules",
  "monetizationTrustRules",
  "websiteClaimRules",
  "sponsorPartnerRules",
  "protectedDataRules",
  "humanReviewRequiredFor",
  "allowedOutputs",
  "forbiddenAutoActions",
  "reportOutputSchema"
];

const REQUIRED_PRINCIPLES = [
  "healthy_retention",
  "autonomy",
  "consent_and_control",
  "age_appropriate_design",
  "dignity_and_no_shame",
  "recovery_and_rest",
  "transparency",
  "fairness",
  "trust_preserving_rewards",
  "safe_social_connection",
  "privacy_minimization",
  "no_manipulative_pressure"
];

const REQUIRED_ALLOWED_PATTERNS = [
  "gentle_daily_rituals",
  "visible_progress",
  "age_appropriate_buddy_encouragement",
  "optional_family_or_social_support",
  "recovery_streak_protection",
  "pause_friendly_progress",
  "user_controlled_reminders",
  "learning_through_movement",
  "meaningful_non_money_near_rewards",
  "transparent_mission_goals",
  "fair_detours_before_purchase_pressure",
  "positive_identity_building"
];

const REQUIRED_FORBIDDEN_PATTERNS = [
  "manipulative_fomo",
  "shame_or_guilt_pressure",
  "sleep_deprivation_pressure",
  "social_humiliation",
  "gambling_like_rewards",
  "lootbox_money_near_mechanics",
  "age_inappropriate_monetization",
  "child_targeted_purchase_pressure",
  "hidden_sponsor_pressure",
  "dark_pattern_notifications",
  "paywall_mission_chains",
  "endless_pressure_loops",
  "punishment_for_rest",
  "medical_or_weight_loss_overclaim",
  "token_or_payout_hype",
  "betting_or_wager_like_language"
];

const REQUIRED_FORBIDDEN_TOPICS = [
  "fomo",
  "shame",
  "gambling",
  "lootbox",
  "sleep",
  "dark_pattern",
  "age_inappropriate_monetization",
  "social_humiliation",
  "paywall"
];

const REQUIRED_PROTECTED_REVIEW_TERMS = [
  "health",
  "child",
  "minor",
  "family_guardian",
  "location",
  "camera",
  "face",
  "biometric",
  "motion",
  "consent",
  "privacy",
  "token",
  "nft",
  "wallet",
  "payment",
  "payout",
  "betting",
  "reward_authority",
  "mission_completion_authority"
];

const REQUIRED_REFERENCES = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH];
const FORBIDDEN_RUNTIME_PREFIXES = ["app/", "components/", "lib/", "functions/", "public/", ".github/", "native/unity/WellFitBuddyAR/"];
const FORBIDDEN_RUNTIME_EXACT = new Set(["firestore.rules", "package.json", "package-lock.json", "firebase.json"]);

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

function stringify(value) {
  return JSON.stringify(value ?? null, null, 2).toLowerCase();
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function missingValues(actual, required) {
  const set = new Set(asArray(actual));
  return required.filter((value) => !set.has(value));
}

function isForbiddenRuntimePattern(value) {
  if (typeof value !== "string") return false;
  return FORBIDDEN_RUNTIME_EXACT.has(value) || FORBIDDEN_RUNTIME_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function validateTopLevel(data, results) {
  const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in data));
  addResult(results, "required top-level fields exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_TOP_LEVEL_FIELDS.length} fields present`);
  addResult(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");
  addResult(results, "runtime product logic disabled", data.scope?.runtimeProductLogicEnabled === false, data.scope?.runtimeProductLogicEnabled ?? "missing");
  addResult(results, "runtime personalization disabled", data.scope?.runtimePersonalizationEnabled === false, data.scope?.runtimePersonalizationEnabled ?? "missing");
  addResult(results, "runtime tracking disabled", data.scope?.runtimeTrackingEnabled === false, data.scope?.runtimeTrackingEnabled ?? "missing");
  addResult(results, "runtime profiling disabled", data.scope?.runtimeProfilingEnabled === false, data.scope?.runtimeProfilingEnabled ?? "missing");

  const unsafeAllowedFiles = asArray(data.scope?.allowedFiles).filter(isForbiddenRuntimePattern);
  addResult(results, "allowedFiles avoid runtime/protected paths", unsafeAllowedFiles.length === 0, unsafeAllowedFiles.length ? `unsafe allowed files: ${unsafeAllowedFiles.join(", ")}` : "safe allowedFiles");
}

function validatePrinciples(data, results) {
  const principleIds = asArray(data.ethicalEngagementPrinciples).map((principle) => typeof principle === "string" ? principle : principle?.id);
  const missing = missingValues(principleIds, REQUIRED_PRINCIPLES);
  addResult(results, "required ethical engagement principles exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_PRINCIPLES.length} principles present`);
}

function validatePatterns(data, results) {
  const allowedMissing = missingValues(data.allowedEngagementPatterns, REQUIRED_ALLOWED_PATTERNS);
  const forbiddenMissing = missingValues(data.forbiddenEngagementPatterns, REQUIRED_FORBIDDEN_PATTERNS);
  const forbiddenText = stringify(data.forbiddenEngagementPatterns);
  const missingTopics = REQUIRED_FORBIDDEN_TOPICS.filter((topic) => !forbiddenText.includes(topic));

  addResult(results, "required allowed engagement patterns exist", allowedMissing.length === 0, allowedMissing.length ? `missing: ${allowedMissing.join(", ")}` : `${REQUIRED_ALLOWED_PATTERNS.length} allowed patterns present`);
  addResult(results, "required forbidden engagement patterns exist", forbiddenMissing.length === 0, forbiddenMissing.length ? `missing: ${forbiddenMissing.join(", ")}` : `${REQUIRED_FORBIDDEN_PATTERNS.length} forbidden patterns present`);
  addResult(results, "forbidden pattern coverage includes FOMO/shame/gambling/lootbox/sleep/dark/age/social/paywall pressure", missingTopics.length === 0, missingTopics.length ? `missing topics: ${missingTopics.join(", ")}` : "covered");
}

function validateRuleSections(data, results) {
  const sections = [
    ["ageAppropriateDesignRules", 7],
    ["recoveryAndPauseRules", 6],
    ["aiBuddyToneRules", 7],
    ["missionDesignRules", 6],
    ["rewardDesignRules", 6],
    ["websiteClaimRules", 5],
    ["sponsorPartnerRules", 6],
    ["protectedDataRules", 5]
  ];

  for (const [section, minimum] of sections) {
    const rules = asArray(data[section]);
    addResult(results, `${section} exist`, rules.length >= minimum, `${rules.length}/${minimum} rules`);
  }

  const ageText = stringify(data.ageAppropriateDesignRules);
  addResult(results, "age rules use age-appropriate/altersgerecht wording", ageText.includes("age-appropriate") || ageText.includes("altersgerecht"), "age wording present");

  const protectedText = stringify(data.protectedDataRules);
  addResult(results, "protected data rules block runtime tracking/profiling", protectedText.includes("runtime tracking") && protectedText.includes("profiling") && protectedText.includes("not enabled"), "runtime tracking/profiling not enabled");
}

function validateProtectedReview(data, results) {
  const reviewTerms = asArray(data.humanReviewRequiredFor);
  const missing = missingValues(reviewTerms, REQUIRED_PROTECTED_REVIEW_TERMS);
  const combinedText = stringify(data);

  addResult(results, "protected topics require human review", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_PROTECTED_REVIEW_TERMS.length} protected terms present`);
  addResult(results, "protected topics are review_required in register", combinedText.includes("review_required"), "review_required present");
  addResult(results, "protected data cannot authorize rewards or mission completion", combinedText.includes("protected data may not be direct reward authority") || (combinedText.includes("protected data") && combinedText.includes("mission-completion authority")), "authority boundary present");
}

function validateForbiddenAutoActions(data, results) {
  const actions = asArray(data.forbiddenAutoActions);
  const requiredActions = [
    "modify_runtime_files",
    "personalize_users_at_runtime",
    "track_or_profile_users_at_runtime",
    "approve_prs",
    "merge_prs",
    "auto_repair_files",
    "deploy",
    "enable_product_logic",
    "enable_reward_authority",
    "enable_mission_completion_authority",
    "enable_monetization"
  ];
  const missing = missingValues(actions, requiredActions);
  addResult(results, "forbidden auto-actions block runtime/personalization/approval/merge/repair/deploy", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "forbidden actions present");
}

function validateReferences(results) {
  const existing = REQUIRED_REFERENCES.filter(exists);
  addResult(results, "required files exist", existing.length === REQUIRED_REFERENCES.length, existing.length === REQUIRED_REFERENCES.length ? "register/doc/script exist" : `missing: ${REQUIRED_REFERENCES.filter((file) => !exists(file)).join(", ")}`);

  const workMap = exists(WORK_MAP_PATH) ? readText(WORK_MAP_PATH) : "";
  const todoIndex = exists(TODO_INDEX_PATH) ? readText(TODO_INDEX_PATH) : "";
  const missingWorkMap = REQUIRED_REFERENCES.filter((file) => !workMap.includes(file));
  const missingTodoIndex = REQUIRED_REFERENCES.filter((file) => !todoIndex.includes(file));

  addResult(results, "Work Map references register/doc/script", missingWorkMap.length === 0, missingWorkMap.length ? `missing: ${missingWorkMap.join(", ")}` : "references present");
  addResult(results, "TODO Index references register/doc/script", missingTodoIndex.length === 0, missingTodoIndex.length ? `missing: ${missingTodoIndex.join(", ")}` : "references present");
}

function renderResults(results) {
  return results.map((result) => `- ${result.passed ? "PASS" : "FAIL"}: ${result.name} (${result.details})`).join("\n");
}

function main() {
  const results = [];
  let data = null;

  try {
    data = readJson(REGISTER_PATH);
    addResult(results, "register parses as JSON", true, REGISTER_PATH);
  } catch (error) {
    addResult(results, "register parses as JSON", false, error.message);
  }

  if (data) {
    validateTopLevel(data, results);
    validatePrinciples(data, results);
    validatePatterns(data, results);
    validateRuleSections(data, results);
    validateProtectedReview(data, results);
    validateForbiddenAutoActions(data, results);
  }
  validateReferences(results);

  const ready = results.every((result) => result.passed);
  const report = `# Ethical Engagement Guard Check Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nETHICAL_ENGAGEMENT_GUARD_READY=${ready ? "true" : "false"}\n\n## Safety Boundaries\n\n- Never modifies runtime files: true\n- Never personalizes users at runtime: true\n- Never tracks or profiles users at runtime: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables rewards, missions, monetization, token/wallet/payment/NFT/betting, protected-data, health, child/minor, location, camera, face, biometric, consent, privacy, or product logic: true\n\n## Validation Results\n\n${renderResults(results)}\n\n## Output Schema\n\n- mode: REPORT_ONLY\n- ready: boolean\n- protected review flags: report-only\n- forbidden engagement flags: report-only\n- Work Map/TODO Index reference status: report-only\n`;

  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log(`Mode: REPORT_ONLY`);
  console.log(`Never modifies runtime files: true`);
  console.log(`Never personalizes users at runtime: true`);
  console.log(`Never tracks or profiles users at runtime: true`);
  console.log(`Never approves PRs: true`);
  console.log(`Never merges PRs: true`);
  console.log(`Never repairs files: true`);
  console.log(`Never deploys: true`);
  console.log(`ETHICAL_ENGAGEMENT_GUARD_READY=${ready ? "true" : "false"}`);
  console.log(`Report: ${OUTPUT_PATH}`);

  if (!ready) {
    console.log(renderResults(results));
    process.exit(1);
  }
}

main();
