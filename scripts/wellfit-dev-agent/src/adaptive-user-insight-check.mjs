#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, "project-register", "adaptive-user-insights.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "adaptive-user-insight-check.md");

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "purpose",
  "activationState",
  "sourceRegisters",
  "allowedAggregateSignals",
  "forbiddenRawSensitiveFields",
  "personalizationDimensions",
  "behaviorSignalCategories",
  "missionAdaptationRules",
  "buddyAdaptationRules",
  "difficultyTuningRules",
  "challengeRewardTuningBoundaries",
  "fairnessAndSafetyRules",
  "minimumSampleThresholds",
  "explainabilityRequirements",
  "humanReviewRequiredTriggers",
  "agentVisibleSummarySchema",
  "recommendationSchema",
  "entries"
];

const REQUIRED_FORBIDDEN_GROUPS = [
  { label: "health", terms: ["health", "watch", "medical"] },
  { label: "child/minor", terms: ["child", "minor"] },
  { label: "location", terms: ["location", "gps", "coordinates"] },
  { label: "camera/biometric", terms: ["camera", "biometric", "face", "sensor"] },
  { label: "personal identifiers", terms: ["names", "emails", "user ids", "device ids", "personal identifiers"] },
  { label: "payment/token/wallet", terms: ["payment", "token", "wallet"] },
  { label: "raw user messages", terms: ["raw user messages", "redacted"] },
  { label: "exact daily routine", terms: ["exact daily routine", "identify a person"] }
];

const REQUIRED_BOUNDARY_TERMS = [
  "token",
  "nft",
  "wallet",
  "payment",
  "betting",
  "reward authority",
  "ledger",
  "anti-cheat"
];

function rel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stringify(value) {
  return JSON.stringify(value, null, 2).toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function readRegister(results) {
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

function validateTopLevel(data, results) {
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in data)) results.fail.push(`Missing top-level field: ${field}.`);
  }

  for (const field of ["version", "updated", "purpose"]) {
    if (!hasText(data?.[field])) results.fail.push(`Top-level field ${field} is missing or empty.`);
  }

  if (data?.activationState !== "planning_only") {
    results.fail.push("activationState must remain planning_only.");
  }

  if (!Array.isArray(data?.entries)) results.fail.push("entries must be an array for future aggregate insight summaries.");
}

function validateSourcesAndSignals(data, results) {
  const sources = asArray(data?.sourceRegisters);
  const signals = asArray(data?.allowedAggregateSignals);
  const requiredSources = [
    "project-register/user-feedback.json",
    "project-register/feedback-analytics-loop.json",
    "project-register/research-recommendations.json",
    "project-register/product-readiness.json"
  ];

  if (sources.length === 0) results.fail.push("sourceRegisters must be a non-empty array.");
  for (const source of requiredSources) {
    if (!sources.includes(source)) results.fail.push(`sourceRegisters must include ${source}.`);
  }

  if (signals.length < 5) results.fail.push("allowedAggregateSignals must include multiple aggregate signal categories.");
  const signalText = stringify(signals);
  for (const term of ["aggregate", "cohort", "feedback", "mission", "buddy"]) {
    if (!signalText.includes(term)) results.fail.push(`allowedAggregateSignals must include ${term} coverage.`);
  }
}

function validateForbiddenFields(data, results) {
  const forbidden = asArray(data?.forbiddenRawSensitiveFields);
  if (forbidden.length === 0) results.fail.push("forbiddenRawSensitiveFields must be a non-empty array.");
  const forbiddenText = stringify(forbidden);

  for (const group of REQUIRED_FORBIDDEN_GROUPS) {
    if (!includesAny(forbiddenText, group.terms)) {
      results.fail.push(`forbiddenRawSensitiveFields must cover ${group.label}.`);
    }
  }
}

function validateAdaptationRules(data, results) {
  const requiredRulePaths = [
    ["missionAdaptationRules", "allowed"],
    ["missionAdaptationRules", "forbidden"],
    ["buddyAdaptationRules", "allowed"],
    ["buddyAdaptationRules", "forbidden"],
    ["difficultyTuningRules", "allowed"],
    ["difficultyTuningRules", "forbidden"],
    ["challengeRewardTuningBoundaries", "allowed"],
    ["challengeRewardTuningBoundaries", "forbidden"]
  ];

  for (const [section, field] of requiredRulePaths) {
    if (asArray(data?.[section]?.[field]).length === 0) results.fail.push(`${section}.${field} must be a non-empty array.`);
  }

  const boundaryText = stringify(data?.challengeRewardTuningBoundaries);
  for (const term of REQUIRED_BOUNDARY_TERMS) {
    if (!boundaryText.includes(term)) results.fail.push(`challengeRewardTuningBoundaries must include ${term} boundary.`);
  }
}

function validateThresholdsAndReview(data, results) {
  const thresholds = data?.minimumSampleThresholds;
  if (!thresholds || typeof thresholds !== "object") {
    results.fail.push("minimumSampleThresholds must exist.");
  } else {
    for (const field of ["defaultCohortMinimum", "sensitiveOrFairnessAdjacentMinimum", "challengeRewardAdjacentMinimum"]) {
      if (typeof thresholds[field] !== "number" || thresholds[field] < 1) results.fail.push(`minimumSampleThresholds.${field} must be a positive number.`);
    }
    if (!hasText(thresholds.smallCohortAction)) results.fail.push("minimumSampleThresholds.smallCohortAction must explain the insufficient-sample action.");
  }

  if (asArray(data?.explainabilityRequirements).length < 4) {
    results.fail.push("explainabilityRequirements must include multiple required explanation fields.");
  }

  const triggers = asArray(data?.humanReviewRequiredTriggers);
  const triggerText = stringify(triggers);
  if (triggers.length === 0) results.fail.push("humanReviewRequiredTriggers must be a non-empty array.");
  if (!triggerText.includes("high")) results.fail.push("humanReviewRequiredTriggers must cover high changes.");
  if (!triggerText.includes("critical")) results.fail.push("humanReviewRequiredTriggers must cover critical changes.");
  if (!triggerText.includes("implementationallowed=false")) results.fail.push("humanReviewRequiredTriggers must keep implementationAllowed=false for high/critical review.");
}

function validateAgentVisibleSchema(data, results) {
  const schema = data?.agentVisibleSummarySchema;
  if (!schema || typeof schema !== "object") {
    results.fail.push("agentVisibleSummarySchema must exist.");
    return;
  }

  if (schema.rawUserIdentifiersAllowed !== false) {
    results.fail.push("agentVisibleSummarySchema.rawUserIdentifiersAllowed must be false.");
  }
  if (schema.rawUserDataIncluded !== false) {
    results.fail.push("agentVisibleSummarySchema.rawUserDataIncluded must be false.");
  }

  const schemaText = stringify(schema);
  for (const forbidden of ["user id", "user_id", "email", "device id", "name"]) {
    if (schemaText.includes(forbidden) && !schemaText.includes("without raw user identifiers")) {
      results.fail.push(`agentVisibleSummarySchema must not include raw identifier field ${forbidden}.`);
    }
  }

  for (const field of ["aggregateSignalCategories", "cohortSize", "thresholdStatus", "excludedSensitiveFields", "limitations"]) {
    if (!(field in schema)) results.fail.push(`agentVisibleSummarySchema must include ${field}.`);
  }
}

function validateRecommendationSchema(data, results) {
  const schema = data?.recommendationSchema;
  if (!schema || typeof schema !== "object") {
    results.fail.push("recommendationSchema must exist.");
    return;
  }

  for (const field of ["recommendedChangeType", "recommendation", "rationale", "riskLevel", "humanReviewRequired", "implementationAllowed", "protectedAreasTouched", "nextSafeTask"]) {
    if (!(field in schema)) results.fail.push(`recommendationSchema must include ${field}.`);
  }

  if (schema.implementationAllowed !== false) results.fail.push("recommendationSchema.implementationAllowed must default to false.");
}

function writeReport(results) {
  const passed = results.fail.length === 0;
  const report = `# Adaptive User Insight Check\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## Checks\n\n${results.fail.length ? results.fail.map((item) => `- FAIL: ${item}`).join("\n") : "- PASS: Adaptive User Insight governance is planning-only, aggregate-only, privacy-bounded, and review-gated."}\n\n## Registry\n\n- ${rel(REGISTER_PATH)}\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");
  console.log(`Adaptive user insight check complete: ${rel(OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  if (!passed) {
    for (const failure of results.fail) console.log(`FAIL: ${failure}`);
    process.exit(1);
  }
}

function main() {
  const results = { fail: [] };
  const data = readRegister(results);
  if (data) {
    validateTopLevel(data, results);
    validateSourcesAndSignals(data, results);
    validateForbiddenFields(data, results);
    validateAdaptationRules(data, results);
    validateThresholdsAndReview(data, results);
    validateAgentVisibleSchema(data, results);
    validateRecommendationSchema(data, results);
  }
  writeReport(results);
}

main();
