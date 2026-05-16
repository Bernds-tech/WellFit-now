#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/adaptive-difficulty-agent.json";
const DOC_PATH = "docs/architecture/WELLFIT_ADAPTIVE_DIFFICULTY_AGENT.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/adaptive-difficulty-agent-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/adaptive-difficulty-agent-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "difficultyPrinciples",
  "allowedDifficultySignals",
  "forbiddenDifficultySignals",
  "difficultyDimensions",
  "ageAppropriateDifficultyRules",
  "recoveryModeRules",
  "buddyToneAdjustmentRules",
  "missionLengthRules",
  "learningFormatRules",
  "socialModeRules",
  "safetyAndConsentRules",
  "protectedDataRules",
  "rewardAuthorityBoundaries",
  "missionCompletionAuthorityBoundaries",
  "fairnessAndAccessibilityRules",
  "humanReviewRequiredFor",
  "allowedOutputs",
  "forbiddenAutoActions",
  "reportOutputSchema"
];

const REQUIRED_PRINCIPLES = [
  "balanced_challenge",
  "user_control",
  "age_appropriate_adjustment",
  "recovery_before_pressure",
  "safety_first",
  "accessibility",
  "privacy_minimization",
  "no_shame_or_fomo",
  "evidence_over_assumption",
  "human_review_for_sensitive_cases"
];

const REQUIRED_ALLOWED_SIGNALS = [
  "aggregate_completion_rate",
  "aggregate_drop_off_pattern",
  "explicit_user_preference",
  "explicit_difficulty_feedback",
  "mission_rating",
  "optional_family_mode_flag",
  "non_sensitive_route_device_test_evidence",
  "documented_age_band_review_allowed",
  "planning_safe_buddy_feedback_category",
  "review_required_protected_context_flags"
];

const REQUIRED_FORBIDDEN_SIGNALS = [
  "raw_health_data",
  "raw_location_gps_history",
  "raw_camera_video_image_data",
  "face_biometric_data",
  "child_minor_sensitive_data_without_guardian_privacy_review",
  "exact_daily_routine",
  "names_emails_user_ids_device_ids",
  "payment_token_wallet_data",
  "medical_diagnosis",
  "weight_loss_claims",
  "gambling_betting_behavior",
  "protected_data_used_as_direct_reward_or_mission_completion_authority"
];

const REQUIRED_DIMENSIONS = {
  physicalIntensity: ["low", "moderate", "high", "review_required"],
  missionDuration: ["short", "medium", "long", "review_required"],
  cognitiveLoad: ["simple", "balanced", "complex", "review_required"],
  socialMode: ["solo", "family", "team", "competition", "review_required"],
  buddyTone: ["gentle", "playful", "coach", "explanatory", "recovery", "review_required"],
  learningFormat: ["visual", "audio", "movement", "quiz", "story", "mixed", "review_required"],
  locationSensitivity: ["indoor", "safe_outdoor", "supervised_outdoor", "review_required"],
  evidenceConfidence: ["low", "medium", "high", "review_required"]
};

const REQUIRED_PROTECTED_REVIEW_TERMS = [
  "health",
  "child",
  "minor",
  "family_guardian",
  "location",
  "gps",
  "camera",
  "image",
  "video",
  "face",
  "biometric",
  "consent",
  "privacy",
  "legal",
  "token",
  "nft",
  "wallet",
  "payment",
  "payout",
  "betting",
  "reward_authority",
  "mission_completion_authority",
  "runtime_personalization",
  "runtime_difficulty_tuning",
  "overtraining",
  "sleep_loss",
  "unsafe_activity"
];

const REQUIRED_FORBIDDEN_AUTO_ACTIONS = [
  "modify_runtime_files",
  "personalize_users_at_runtime",
  "tune_difficulty_at_runtime",
  "profile_protected_data",
  "approve_prs",
  "merge_prs",
  "auto_repair_files",
  "deploy",
  "enable_product_logic",
  "enable_reward_authority",
  "enable_mission_completion_authority",
  "enable_monetization"
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

function idsFromArray(items) {
  return asArray(items).map((item) => typeof item === "string" ? item : item?.id).filter(Boolean);
}

function validateTopLevel(data, results) {
  const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in data));
  addResult(results, "required top-level fields exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_TOP_LEVEL_FIELDS.length} fields present`);
  addResult(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");
  addResult(results, "runtime personalization disabled", data.scope?.runtimePersonalizationEnabled === false, data.scope?.runtimePersonalizationEnabled ?? "missing");
  addResult(results, "runtime product logic disabled", data.scope?.runtimeProductLogicEnabled === false, data.scope?.runtimeProductLogicEnabled ?? "missing");
  addResult(results, "runtime difficulty tuning disabled", data.scope?.runtimeDifficultyTuningEnabled === false, data.scope?.runtimeDifficultyTuningEnabled ?? "missing");
  addResult(results, "protected data profiling disabled", data.scope?.protectedDataProfilingEnabled === false, data.scope?.protectedDataProfilingEnabled ?? "missing");

  const unsafeAllowedFiles = asArray(data.scope?.allowedFiles).filter(isForbiddenRuntimePattern);
  addResult(results, "allowedFiles avoid runtime/protected paths", unsafeAllowedFiles.length === 0, unsafeAllowedFiles.length ? `unsafe allowed files: ${unsafeAllowedFiles.join(", ")}` : "safe allowedFiles");
}

function validatePrinciples(data, results) {
  const missing = missingValues(idsFromArray(data.difficultyPrinciples), REQUIRED_PRINCIPLES);
  addResult(results, "required difficulty principles exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_PRINCIPLES.length} principles present`);
}

function validateSignals(data, results) {
  const allowedMissing = missingValues(idsFromArray(data.allowedDifficultySignals), REQUIRED_ALLOWED_SIGNALS);
  const forbiddenMissing = missingValues(data.forbiddenDifficultySignals, REQUIRED_FORBIDDEN_SIGNALS);
  const allowedText = stringify(data.allowedDifficultySignals);
  addResult(results, "allowed planning-safe signals exist", allowedMissing.length === 0, allowedMissing.length ? `missing: ${allowedMissing.join(", ")}` : `${REQUIRED_ALLOWED_SIGNALS.length} signals present`);
  addResult(results, "forbidden sensitive/protected signals exist", forbiddenMissing.length === 0, forbiddenMissing.length ? `missing: ${forbiddenMissing.join(", ")}` : `${REQUIRED_FORBIDDEN_SIGNALS.length} signals present`);
  addResult(results, "allowed signals are report-only/not runtime", allowedText.includes("not_enabled"), "runtimeUse not_enabled present");
}

function validateDimensions(data, results) {
  const dimensions = data.difficultyDimensions ?? {};
  for (const [dimension, requiredValues] of Object.entries(REQUIRED_DIMENSIONS)) {
    const missing = missingValues(dimensions[dimension], requiredValues);
    addResult(results, `difficultyDimensions.${dimension} contains required values`, missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${requiredValues.length} values present`);
  }
}

function validateRuleSections(data, results) {
  const sections = [
    ["ageAppropriateDifficultyRules", 6],
    ["recoveryModeRules", 6],
    ["buddyToneAdjustmentRules", 6],
    ["missionLengthRules", 5],
    ["learningFormatRules", 5],
    ["socialModeRules", 5],
    ["safetyAndConsentRules", 5],
    ["protectedDataRules", 5],
    ["rewardAuthorityBoundaries", 4],
    ["missionCompletionAuthorityBoundaries", 4],
    ["fairnessAndAccessibilityRules", 5]
  ];

  for (const [section, minimum] of sections) {
    const rules = asArray(data[section]);
    addResult(results, `${section} exist`, rules.length >= minimum, `${rules.length}/${minimum} rules`);
  }

  const text = stringify(data);
  addResult(results, "age rules use age-appropriate/altersgerecht wording", text.includes("age-appropriate") && text.includes("altersgerecht"), "age-appropriate and altersgerecht present");
  addResult(results, "recovery rules block pressure and medical advice", text.includes("rest can be progress") && text.includes("medical advice") && text.includes("overtraining"), "recovery safeguards present");
  addResult(results, "Buddy tone rules block comparison/shame/guilt", text.includes("comparison pressure") && text.includes("shame") && text.includes("guilt"), "Buddy tone safeguards present");
  addResult(results, "mission length rules block unsafe/time/payment escalation", text.includes("unsafe-time") && text.includes("payment") && text.includes("long outdoor"), "mission length safeguards present");
  addResult(results, "learning format rules block sensitive profiling/diagnosis", text.includes("sensitive profiling") && text.includes("diagnosis"), "learning safeguards present");
  addResult(results, "social mode rules block forced participation/public shame", text.includes("force participation") && text.includes("public shame"), "social safeguards present");
}

function validateProtectedReview(data, results) {
  const missing = missingValues(data.humanReviewRequiredFor, REQUIRED_PROTECTED_REVIEW_TERMS);
  const combinedText = stringify(data);
  addResult(results, "protected topics require human review", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_PROTECTED_REVIEW_TERMS.length} protected terms present`);
  addResult(results, "protected topics are review_required", combinedText.includes("review_required"), "review_required present");
  addResult(results, "protected data cannot authorize rewards or mission completion", combinedText.includes("protected data may not be direct reward authority") && combinedText.includes("mission-completion authority"), "authority boundary present");
}

function validateAuthorityBoundaries(data, results) {
  const rewardText = stringify(data.rewardAuthorityBoundaries);
  const missionText = stringify(data.missionCompletionAuthorityBoundaries);
  addResult(results, "reward authority boundaries exist and block rewards", rewardText.includes("never grants") && rewardText.includes("enable") === false && rewardText.includes("direct reward authority"), "reward boundary present");
  addResult(results, "mission completion authority boundaries exist and block completion", missionText.includes("never completes") && missionText.includes("direct mission-completion authority"), "mission boundary present");
  addResult(results, "report schema disables runtime/reward/mission authority", data.reportOutputSchema?.rewardAuthorityEnabled === false && data.reportOutputSchema?.missionCompletionAuthorityEnabled === false && data.reportOutputSchema?.runtimePersonalizationEnabled === false && data.reportOutputSchema?.runtimeProductLogicEnabled === false, "schema authority booleans false");
}

function validateForbiddenAutoActions(data, results) {
  const missing = missingValues(data.forbiddenAutoActions, REQUIRED_FORBIDDEN_AUTO_ACTIONS);
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
    validateSignals(data, results);
    validateDimensions(data, results);
    validateRuleSections(data, results);
    validateProtectedReview(data, results);
    validateAuthorityBoundaries(data, results);
    validateForbiddenAutoActions(data, results);
  }
  validateReferences(results);

  const ready = results.every((result) => result.passed);
  const report = `# Adaptive Difficulty Agent Check Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nADAPTIVE_DIFFICULTY_AGENT_READY=${ready ? "true" : "false"}\n\n## Safety Boundaries\n\n- Never modifies runtime files: true\n- Never personalizes users at runtime: true\n- Never tunes difficulty at runtime: true\n- Never profiles protected data: true\n- Never enables reward authority: true\n- Never enables mission-completion authority: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables token, NFT, wallet, payment, betting, health, child/minor, location, camera, face, biometric, consent, privacy, legal, or product logic: true\n\n## Validation Results\n\n${renderResults(results)}\n\n## Output Schema\n\n- mode: REPORT_ONLY\n- ready: boolean\n- safe difficulty suggestions: report-only\n- Buddy tone / mission length / learning format / social mode suggestions: report-only\n- protected review flags: report-only\n- Work Map/TODO Index reference status: report-only\n`;

  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never personalizes users at runtime: true");
  console.log("Never tunes difficulty at runtime: true");
  console.log("Never profiles protected data: true");
  console.log("Never enables reward authority: true");
  console.log("Never enables mission-completion authority: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`ADAPTIVE_DIFFICULTY_AGENT_READY=${ready ? "true" : "false"}`);
  console.log(`Report: ${OUTPUT_PATH}`);

  if (!ready) {
    console.log(renderResults(results));
    process.exit(1);
  }
}

main();
