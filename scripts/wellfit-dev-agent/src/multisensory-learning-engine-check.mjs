#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/multisensory-learning-engine.json";
const DOC_PATH = "docs/architecture/WELLFIT_MULTISENSORY_LEARNING_ENGINE.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/multisensory-learning-engine-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/multisensory-learning-engine-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "learningPrinciples",
  "multisensoryChannels",
  "movementLearningRules",
  "visualLearningRules",
  "audioLearningRules",
  "storyLearningRules",
  "quizAndReflectionRules",
  "arAndEnvironmentRules",
  "buddyExplanationRules",
  "socialFamilyLearningRules",
  "ageAppropriateLearningRules",
  "accessibilityRules",
  "protectedDataRules",
  "rewardAuthorityBoundaries",
  "missionCompletionAuthorityBoundaries",
  "allowedOutputs",
  "forbiddenAutoActions",
  "humanReviewRequiredFor",
  "reportOutputSchema"
];

const REQUIRED_PRINCIPLES = [
  "learning_through_movement",
  "embodied_cognition",
  "playful_discovery",
  "age_appropriate_explanation",
  "multimodal_reinforcement",
  "autonomy",
  "competence",
  "relatedness",
  "reflection",
  "accessibility",
  "privacy_minimization",
  "no_medical_or_psychological_diagnosis"
];

const REQUIRED_CHANNELS = [
  "visual",
  "audio",
  "movement",
  "story",
  "quiz",
  "social",
  "environment",
  "buddy_explanation",
  "optional_ar",
  "reflection"
];

const REQUIRED_RULE_FIELDS = [
  "movementLearningRules",
  "visualLearningRules",
  "audioLearningRules",
  "storyLearningRules",
  "quizAndReflectionRules",
  "arAndEnvironmentRules",
  "buddyExplanationRules",
  "socialFamilyLearningRules",
  "ageAppropriateLearningRules",
  "accessibilityRules"
];

const REQUIRED_PROTECTED_REVIEW_TERMS = [
  "health",
  "child",
  "minor",
  "location",
  "camera",
  "face",
  "biometric",
  "motion",
  "consent",
  "privacy",
  "review_required",
  "raw images",
  "raw images, videos, biometrics, health, and location data must not be stored by default",
  "protected data may not be direct reward or mission-completion authority",
  "runtime tracking, profiling, or personalization is not enabled"
];

const REQUIRED_AR_TERMS = [
  "AR/environment signals are planning-only",
  "Unity and PR #13 remain untouched",
  "Camera, location, and AR behavior remains review_required",
  "No unsafe routes, night pressure, street crossing pressure, or location-authority reward logic is allowed",
  "Environment tasks need safe fallback"
];

const REQUIRED_BUDDY_TERMS = [
  "Buddy explanations must be age-appropriate",
  "Buddy must explain without pressure or shame",
  "Buddy must not give medical, psychological, financial, or legal advice",
  "Buddy can support learning, reflection, and motivation within Ethical Engagement boundaries",
  "Protected or sensitive cases remain review_required"
];

const REQUIRED_AUTHORITY_TERMS = [
  "Learning completion does not authorize",
  "not final mission-completion authority",
  "not final reward authority",
  "server/backend/review-required",
  "No token, payout, wallet, NFT, betting"
];

const REQUIRED_FORBIDDEN_AUTO_ACTIONS = [
  "modify_runtime_files",
  "personalize_users_at_runtime",
  "track_or_profile_users_at_runtime",
  "activate_runtime_learning_engine",
  "activate_ar_or_unity_behavior",
  "approve_prs",
  "merge_prs",
  "auto_repair_files",
  "deploy",
  "enable_reward_authority",
  "enable_mission_completion_authority",
  "enable_token_nft_wallet_payment_betting_or_money_near_mechanics"
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

function idsFromArray(items) {
  return asArray(items).map((item) => typeof item === "string" ? item : item?.id).filter(Boolean);
}

function missingValues(actual, required) {
  const set = new Set(asArray(actual));
  return required.filter((value) => !set.has(value));
}

function includesAllText(haystack, terms) {
  const normalized = String(haystack).toLowerCase();
  return terms.filter((term) => !normalized.includes(term.toLowerCase()));
}

function isForbiddenRuntimePattern(value) {
  if (typeof value !== "string") return false;
  return FORBIDDEN_RUNTIME_EXACT.has(value) || FORBIDDEN_RUNTIME_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

function validateTopLevel(data, results) {
  const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in data));
  addResult(results, "required top-level fields exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_TOP_LEVEL_FIELDS.length} fields present`);
  addResult(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");
  addResult(results, "runtime learning personalization disabled", data.scope?.runtimeLearningPersonalizationEnabled === false, data.scope?.runtimeLearningPersonalizationEnabled ?? "missing");
  addResult(results, "runtime tracking disabled", data.scope?.runtimeTrackingEnabled === false, data.scope?.runtimeTrackingEnabled ?? "missing");
  addResult(results, "runtime product logic disabled", data.scope?.runtimeProductLogicEnabled === false, data.scope?.runtimeProductLogicEnabled ?? "missing");
  addResult(results, "runtime AR and Unity disabled", data.scope?.runtimeArBehaviorEnabled === false && data.scope?.runtimeUnityBehaviorEnabled === false, `ar=${data.scope?.runtimeArBehaviorEnabled}; unity=${data.scope?.runtimeUnityBehaviorEnabled}`);
}

function validatePrinciples(data, results) {
  const ids = idsFromArray(data.learningPrinciples);
  const missing = missingValues(ids, REQUIRED_PRINCIPLES);
  addResult(results, "required learning principles exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_PRINCIPLES.length} principles present`);
}

function validateChannels(data, results) {
  const missing = missingValues(data.multisensoryChannels, REQUIRED_CHANNELS);
  addResult(results, "required multisensory channels exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_CHANNELS.length} channels present`);
}

function validateRuleSets(data, results) {
  const missing = REQUIRED_RULE_FIELDS.filter((field) => !(field in data) || collectStrings(data[field]).length === 0);
  addResult(results, "movement/visual/audio/story/quiz/AR/Buddy/social/age/accessibility rules exist", missing.length === 0, missing.length ? `missing or empty: ${missing.join(", ")}` : `${REQUIRED_RULE_FIELDS.length} rule sets present`);

  const arMissing = includesAllText(stringify(data.arAndEnvironmentRules), REQUIRED_AR_TERMS);
  addResult(results, "AR/environment boundaries remain planning-only and Unity untouched", arMissing.length === 0, arMissing.length ? `missing terms: ${arMissing.join(" | ")}` : "required AR/environment terms present");

  const buddyMissing = includesAllText(stringify(data.buddyExplanationRules), REQUIRED_BUDDY_TERMS);
  addResult(results, "Buddy explanation boundaries exist", buddyMissing.length === 0, buddyMissing.length ? `missing terms: ${buddyMissing.join(" | ")}` : "required Buddy terms present");
}

function validateProtectedData(data, results) {
  const missing = includesAllText(stringify(data.protectedDataRules), REQUIRED_PROTECTED_REVIEW_TERMS);
  addResult(results, "protected topics require human review", missing.length === 0, missing.length ? `missing terms: ${missing.join(" | ")}` : "protected/review_required terms present");

  const humanReviewText = stringify(data.humanReviewRequiredFor);
  const reviewTerms = ["health", "child", "minor", "location", "camera", "face", "biometric", "motion", "consent", "privacy", "reward", "mission", "unity", "ar"];
  const missingReview = reviewTerms.filter((term) => !humanReviewText.includes(term));
  addResult(results, "humanReviewRequiredFor covers protected learning topics", missingReview.length === 0, missingReview.length ? `missing: ${missingReview.join(", ")}` : "protected topics listed");
}

function validateAuthority(data, results) {
  const authorityText = `${stringify(data.rewardAuthorityBoundaries)}\n${stringify(data.missionCompletionAuthorityBoundaries)}`;
  const missing = includesAllText(authorityText, REQUIRED_AUTHORITY_TERMS);
  addResult(results, "reward and mission authority boundaries exist", missing.length === 0, missing.length ? `missing terms: ${missing.join(" | ")}` : "authority boundary terms present");
}

function validateForbiddenActions(data, results) {
  const missing = missingValues(data.forbiddenAutoActions, REQUIRED_FORBIDDEN_AUTO_ACTIONS);
  addResult(results, "forbidden auto-actions prevent runtime, merge, repair, deploy, and authority changes", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_FORBIDDEN_AUTO_ACTIONS.length} forbidden actions present`);
}

function validateReferences(results) {
  const workMap = readText(WORK_MAP_PATH);
  const todoIndex = readText(TODO_INDEX_PATH);
  const missingWorkMap = REQUIRED_REFERENCES.filter((ref) => !workMap.includes(ref));
  const missingTodo = REQUIRED_REFERENCES.filter((ref) => !todoIndex.includes(ref));
  addResult(results, "Work Map references register/doc/script", missingWorkMap.length === 0, missingWorkMap.length ? `missing: ${missingWorkMap.join(", ")}` : "all references present");
  addResult(results, "TODO Index references register/doc/script", missingTodo.length === 0, missingTodo.length ? `missing: ${missingTodo.join(", ")}` : "all references present");
}

function validateNoRuntimeFilesChanged(results) {
  const changedCandidates = process.env.MULTISENSORY_LEARNING_ENGINE_CHANGED_FILES
    ? process.env.MULTISENSORY_LEARNING_ENGINE_CHANGED_FILES.split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean)
    : [];
  const forbidden = changedCandidates.filter(isForbiddenRuntimePattern);
  addResult(results, "no runtime files declared for this report-only validator", forbidden.length === 0, forbidden.length ? `forbidden changed files declared: ${forbidden.join(", ")}` : "no forbidden runtime files declared");
}

function renderResults(results) {
  return results.map((result) => `- ${result.passed ? "PASS" : "FAIL"}: ${result.name} — ${result.details}`).join("\n");
}

function main() {
  const results = [];
  addResult(results, "register exists", exists(REGISTER_PATH), REGISTER_PATH);
  addResult(results, "architecture doc exists", exists(DOC_PATH), DOC_PATH);
  addResult(results, "validator script exists", exists(SCRIPT_PATH), SCRIPT_PATH);

  const data = readJson(REGISTER_PATH);
  validateTopLevel(data, results);
  validatePrinciples(data, results);
  validateChannels(data, results);
  validateRuleSets(data, results);
  validateProtectedData(data, results);
  validateAuthority(data, results);
  validateForbiddenActions(data, results);
  validateReferences(results);
  validateNoRuntimeFilesChanged(results);

  const ready = results.every((result) => result.passed);
  const report = `# Multisensory Learning Engine Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nMULTISENSORY_LEARNING_ENGINE_READY=${ready ? "true" : "false"}\n\n## Non-Authorizing Boundary\n\n- Never modifies runtime files: true\n- Never personalizes users at runtime: true\n- Never tracks or profiles users at runtime: true\n- Never activates runtime learning engine: true\n- Never activates AR or Unity behavior: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables reward authority: true\n- Never enables mission-completion authority: true\n- Never enables token/NFT/wallet/payment/betting/money-near mechanics: true\n\n## Validation Results\n\n${renderResults(results)}\n\n## Required Channels\n\n${REQUIRED_CHANNELS.map((channel) => `- ${channel}`).join("\n")}\n\n## Protected / Review Required Summary\n\nHealth, child/minor, location, camera, face, biometric, motion, consent, privacy, Unity/AR, reward-authority, and mission-completion-authority topics remain protected/review_required. Raw images, videos, biometrics, health, and location data must not be stored by default. Learning, quiz, movement, AR, Buddy, social, visual, audio, and environment signals are not final reward or mission-completion authority.\n`;

  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log(`WellFit Multisensory Learning Engine report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never personalizes users at runtime: true");
  console.log("Never tracks or profiles users at runtime: true");
  console.log("Never activates AR or Unity behavior: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Never enables reward authority: true");
  console.log("Never enables mission-completion authority: true");
  console.log(`MULTISENSORY_LEARNING_ENGINE_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);

  if (!ready) process.exitCode = 1;
}

main();
