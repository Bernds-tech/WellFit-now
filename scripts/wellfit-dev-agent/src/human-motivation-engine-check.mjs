#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/human-motivation-engine.json";
const DOC_PATH = "docs/architecture/WELLFIT_HUMAN_MOTIVATION_ENGINE.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/human-motivation-engine-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/human-motivation-engine-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "motivationPrinciples",
  "healthyRetentionRules",
  "forbiddenEngagementPatterns",
  "userMotivationDimensions",
  "adaptiveDifficultyInputs",
  "buddySupportBoundaries",
  "multisensoryLearningSignals",
  "familySocialConnectionRules",
  "recoveryPauseRules",
  "identityProgressRules",
  "childSafetyRules",
  "healthPrivacyRules",
  "rewardFairnessBoundaries",
  "monetizationTrustRules",
  "allowedOutputs",
  "forbiddenAutoActions",
  "humanReviewRequiredFor",
  "reportOutputSchema"
];

const REQUIRED_PRINCIPLES = [
  "autonomy",
  "competence",
  "relatedness",
  "identity",
  "progress",
  "recovery",
  "safe_social_connection",
  "playful_learning",
  "meaningful_rewards",
  "consent_and_control"
];

const REQUIRED_DIMENSIONS = {
  motivationStyle: ["gentle", "playful", "competitive", "educational", "social", "family", "exploratory"],
  energyState: ["high", "normal", "low", "tired", "stressed", "unknown"],
  learningStyle: ["visual", "auditory", "movement", "repetition", "quiz", "story", "mixed"],
  socialPreference: ["solo", "family", "friends", "team", "competition", "unknown"],
  difficultyFit: ["too_easy", "balanced", "too_hard", "unknown"],
  dropOffRisk: ["boredom", "overload", "shame", "privacy_concern", "technical_issue", "time_constraint", "low_motivation", "unknown"],
  rewardPreference: ["points", "avatar_growth", "story", "social_recognition", "learning_unlock", "cosmetic", "unknown"],
  sensitivityFlags: ["child", "family_mode", "older_adult", "health_sensitive", "privacy_sensitive", "low_confidence", "unknown"]
};

const REQUIRED_FORBIDDEN_PATTERNS = [
  "addictive_design",
  "manipulative_fomo",
  "shame_or_guilt_pressure",
  "sleep_deprivation_pressure",
  "child_targeted_monetization",
  "gambling_like_rewards",
  "lootbox_money_near_mechanics",
  "dark_pattern_notifications"
];

const REQUIRED_PROTECTED_REVIEW_TERMS = [
  "child",
  "health",
  "location",
  "camera",
  "face",
  "biometric",
  "consent",
  "privacy",
  "token",
  "nft",
  "wallet",
  "payment",
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
  addResult(results, "runtime personalization disabled", data.scope?.runtimePersonalizationEnabled === false, data.scope?.runtimePersonalizationEnabled ?? "missing");
  addResult(results, "runtime product logic disabled", data.scope?.runtimeProductLogicEnabled === false, data.scope?.runtimeProductLogicEnabled ?? "missing");

  const unsafeAllowedFiles = asArray(data.scope?.allowedFiles).filter(isForbiddenRuntimePattern);
  addResult(results, "allowedFiles avoid runtime/protected paths", unsafeAllowedFiles.length === 0, unsafeAllowedFiles.length ? `unsafe allowed files: ${unsafeAllowedFiles.join(", ")}` : "safe allowedFiles");
}

function validatePrinciples(data, results) {
  const principleIds = asArray(data.motivationPrinciples).map((principle) => typeof principle === "string" ? principle : principle?.id);
  const missing = missingValues(principleIds, REQUIRED_PRINCIPLES);
  addResult(results, "required motivation principles exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_PRINCIPLES.length} principles present`);
}

function validateHealthyRetention(data, results) {
  const allowed = asArray(data.healthyRetentionRules?.allowed);
  const forbidden = asArray(data.healthyRetentionRules?.forbidden);
  const text = stringify(data.healthyRetentionRules);
  addResult(results, "healthy retention allowed rules exist", allowed.length >= 8, `${allowed.length} allowed rules`);
  addResult(results, "healthy retention forbidden rules exist", forbidden.length >= 10, `${forbidden.length} forbidden rules`);

  for (const term of ["gentle", "progress", "family", "avatar", "learning", "streak", "pause", "reminder"]) {
    addResult(results, `healthy retention allowed covers ${term}`, text.includes(term), text.includes(term) ? "covered" : "missing");
  }

  for (const term of ["shame", "sleep", "fomo", "child", "gambling", "lootbox", "endless", "humiliation", "rest", "dark-pattern"]) {
    addResult(results, `healthy retention forbidden covers ${term}`, text.includes(term), text.includes(term) ? "covered" : "missing");
  }
}

function validateForbiddenPatterns(data, results) {
  const missing = missingValues(data.forbiddenEngagementPatterns, REQUIRED_FORBIDDEN_PATTERNS);
  addResult(results, "forbidden engagement patterns include FOMO/shame/gambling/child monetization/dark pattern/sleep deprivation", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_FORBIDDEN_PATTERNS.length} required patterns present`);
}

function validateDimensions(data, results) {
  const dimensions = data.userMotivationDimensions ?? {};
  for (const [dimension, requiredValues] of Object.entries(REQUIRED_DIMENSIONS)) {
    const values = asArray(dimensions[dimension]);
    const missing = missingValues(values, requiredValues);
    addResult(results, `userMotivationDimensions.${dimension} contains required values`, missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${requiredValues.length} values present`);
  }
}

function validateProtectedReview(data, results) {
  const review = asArray(data.humanReviewRequiredFor);
  const reviewText = stringify(review);
  for (const term of REQUIRED_PROTECTED_REVIEW_TERMS) {
    addResult(results, `humanReviewRequiredFor covers ${term}`, reviewText.includes(term), reviewText.includes(term) ? "review_required" : "missing");
  }

  const boundaryText = stringify({
    childSafetyRules: data.childSafetyRules,
    healthPrivacyRules: data.healthPrivacyRules,
    rewardFairnessBoundaries: data.rewardFairnessBoundaries,
    monetizationTrustRules: data.monetizationTrustRules,
    forbiddenAutoActions: data.forbiddenAutoActions
  });

  for (const phrase of ["protected_review_required", "reward", "mission", "token", "wallet", "payment", "child", "health", "privacy"]) {
    addResult(results, `protected boundaries include ${phrase}`, boundaryText.includes(phrase), boundaryText.includes(phrase) ? "covered" : "missing");
  }
}

function validateForbiddenAutoActions(data, results) {
  const text = stringify(data.forbiddenAutoActions);
  for (const phrase of ["modify runtime files", "personalize users at runtime", "approve", "merge", "auto-repair", "deploy"]) {
    addResult(results, `forbiddenAutoActions prohibit ${phrase}`, text.includes(phrase), text.includes(phrase) ? "prohibited" : "missing");
  }
}

function validateReferences(results) {
  const workMap = exists(WORK_MAP_PATH) ? readText(WORK_MAP_PATH) : "";
  const todoIndex = exists(TODO_INDEX_PATH) ? readText(TODO_INDEX_PATH) : "";
  for (const file of REQUIRED_REFERENCES) {
    addResult(results, `Work Map references ${file}`, workMap.includes(file), workMap.includes(file) ? "referenced" : "missing");
    addResult(results, `TODO Index references ${file}`, todoIndex.includes(file), todoIndex.includes(file) ? "referenced" : "missing");
  }
}

function renderTable(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details.replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function renderReport(results, ready) {
  return `# WellFit Human Motivation Engine Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nHUMAN_MOTIVATION_ENGINE_READY=${ready ? "true" : "false"}\n\n## Summary\n\n- Register: \`${REGISTER_PATH}\`\n- Architecture doc: \`${DOC_PATH}\`\n- Validator: \`${SCRIPT_PATH}\`\n- Runtime personalization enabled: false\n- Runtime product logic enabled: false\n\n## Checks\n\n${renderTable(results)}\n\n## Safety Confirmations\n\n- Never modifies runtime files: true\n- Never personalizes users at runtime: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables auto-merge: true\n- Never enables auto-repair: true\n- Protected topics remain human-review-required: true\n`;
}

function main() {
  const results = [];
  let data;

  for (const file of [REGISTER_PATH, DOC_PATH, SCRIPT_PATH, WORK_MAP_PATH, TODO_INDEX_PATH]) {
    addResult(results, `${file} exists`, exists(file), exists(file) ? "found" : "missing");
  }

  try {
    data = readJson(REGISTER_PATH);
    addResult(results, `${REGISTER_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    addResult(results, `${REGISTER_PATH} parses as JSON`, false, error.message);
  }

  if (data) {
    validateTopLevel(data, results);
    validatePrinciples(data, results);
    validateHealthyRetention(data, results);
    validateForbiddenPatterns(data, results);
    validateDimensions(data, results);
    validateProtectedReview(data, results);
    validateForbiddenAutoActions(data, results);
  }

  validateReferences(results);

  const ready = results.every((result) => result.passed);
  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), renderReport(results, ready), "utf8");

  console.log("WellFit Human Motivation Engine Check");
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never personalizes users at runtime: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Never enables auto-merge: true");
  console.log("Never enables auto-repair: true");
  console.log(`HUMAN_MOTIVATION_ENGINE_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
