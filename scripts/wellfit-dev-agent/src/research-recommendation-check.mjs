#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, "project-register", "research-recommendations.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "research-recommendation-check.md");

const REQUIRED_INTERNAL_FIRST_SOURCES = [
  "AGENTS.md",
  "todolist/CURRENT_PROJECT_STATE.md",
  "todolist/WORK_MAP.md",
  "todolist/TODO_INDEX.md",
  "project-register/agent-workflows.json",
  "project-register/agent-task-queue.json",
  "project-register/risk-classifier.json",
  "project-register/definition-of-done.json",
  "project-register/internal-sources.json",
  "project-register/master-roadmap-tasks.json",
  "project-register/product-readiness.json"
];

const PROTECTED_TOPIC_MATCHES = [
  { label: "Unity/PR #13", terms: ["Unity", "PR #13", "native/unity/WellFitBuddyAR"] },
  { label: "token/wallet/payment", terms: ["token", "wallet", "payment", "NFT"] },
  { label: "reward authority", terms: ["reward authority", "final ledger", "mission completion", "anti-cheat"] },
  { label: "health/child/location/privacy/compliance", terms: ["health", "child", "location", "privacy", "compliance", "Datenschutz"] }
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

function readJson(results) {
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

function includesAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function validateTopLevel(data, results) {
  for (const field of ["version", "updated", "purpose"]) {
    if (!hasText(data?.[field])) results.fail.push(`Top-level field ${field} is missing or empty.`);
  }

  if (!Array.isArray(data?.decisionLogEntries)) results.fail.push("decisionLogEntries must be an array.");
}

function validateInternalFirst(data, results) {
  const sources = asArray(data?.requiredInternalFirstReadSources);
  if (sources.length === 0) results.fail.push("requiredInternalFirstReadSources must be a non-empty array.");

  const missingSources = REQUIRED_INTERNAL_FIRST_SOURCES.filter((source) => !sources.includes(source));
  if (missingSources.length > 0) results.fail.push(`Missing required internal first-read sources: ${missingSources.join(", ")}.`);

  if (data?.internalFirstRule?.required !== true) results.fail.push("internalFirstRule.required must be true.");
  if (!hasText(data?.internalFirstRule?.description)) results.fail.push("internalFirstRule.description is missing.");
}

function validateExternalResearchPolicy(data, results) {
  const policy = data?.externalResearchPolicy;
  if (policy?.optional !== true) results.fail.push("externalResearchPolicy.optional must be true.");
  if (policy?.mandatory !== false) results.fail.push("externalResearchPolicy.mandatory must be false.");
  if (policy?.mustNotAssumeAvailability !== true) results.fail.push("externalResearchPolicy.mustNotAssumeAvailability must be true.");
  if (policy?.requiresExplicitInternetAvailability !== true) results.fail.push("externalResearchPolicy.requiresExplicitInternetAvailability must be true.");
  if (!hasText(policy?.ifUnavailable)) results.fail.push("externalResearchPolicy.ifUnavailable must explain internal-only fallback.");
}

function validateSources(data, results) {
  if (asArray(data?.allowedSourceTypes).length === 0) results.fail.push("allowedSourceTypes must be a non-empty array.");
  if (asArray(data?.forbiddenSourceTypes).length === 0) results.fail.push("forbiddenSourceTypes must be a non-empty array.");
}

function validateRecommendationFormat(data, results) {
  const format = data?.recommendationFormat;
  const requiredFields = asArray(format?.requiredFields);
  const requiredReportFields = ["options", "recommendedOptionId", "riskClassification", "humanReviewRequired"];
  const missingFields = requiredReportFields.filter((field) => !requiredFields.includes(field));
  if (missingFields.length > 0) results.fail.push(`recommendationFormat.requiredFields is missing: ${missingFields.join(", ")}.`);

  const minOptions = format?.optionsRule?.minimumOptions;
  if (data?.requiredThreeOptions !== true) results.fail.push("requiredThreeOptions must be true.");
  if (typeof minOptions !== "number" || minOptions < 3) results.fail.push("recommendationFormat.optionsRule.minimumOptions must require at least 3 options.");

  if (format?.selectedOptionRule?.required !== true) results.fail.push("recommendationFormat.selectedOptionRule.required must be true.");
  if (format?.selectedOptionRule?.exactlyOneSelectedOption !== true) results.fail.push("recommendationFormat.selectedOptionRule.exactlyOneSelectedOption must be true.");
  if (data?.requiredRecommendationField !== "recommendedOptionId") results.fail.push("requiredRecommendationField must be recommendedOptionId.");

  const template = data?.reportTemplate;
  const options = asArray(template?.options);
  if (options.length < 3) results.fail.push("reportTemplate.options must include at least 3 options.");
  if (!hasText(template?.recommendedOptionId)) results.fail.push("reportTemplate.recommendedOptionId must select one option.");
  const matchingOptions = options.filter((option) => option?.id === template?.recommendedOptionId);
  if (matchingOptions.length !== 1) results.fail.push("reportTemplate.recommendedOptionId must match exactly one option id.");
}

function validateRiskAndReview(data, results) {
  const levels = asArray(data?.riskClassification?.allowedLevels);
  for (const level of ["low", "medium", "high", "critical"]) {
    if (!levels.includes(level)) results.fail.push(`riskClassification.allowedLevels must include ${level}.`);
  }

  const reviewRules = data?.humanReviewRequiredRules;
  const alwaysRequired = asArray(reviewRules?.alwaysRequiredWhenRiskIs);
  for (const level of ["high", "critical"]) {
    if (!alwaysRequired.includes(level)) results.fail.push(`humanReviewRequiredRules.alwaysRequiredWhenRiskIs must include ${level}.`);
  }

  if (reviewRules?.alwaysRequiredForProtectedTopics !== true) results.fail.push("humanReviewRequiredRules.alwaysRequiredForProtectedTopics must be true.");
  if (!hasText(reviewRules?.highCriticalImplementationRule)) results.fail.push("humanReviewRequiredRules.highCriticalImplementationRule is missing.");
  if (!/never be implemented without explicit human approval/i.test(reviewRules?.highCriticalImplementationRule ?? "")) {
    results.fail.push("humanReviewRequiredRules.highCriticalImplementationRule must prohibit high/critical implementation without explicit human approval.");
  }
}

function validateControlledCuriosity(data, results) {
  const flow = data?.controlledCuriosityFlow;
  if (!flow || typeof flow !== "object") {
    results.fail.push("controlledCuriosityFlow must be documented.");
    return;
  }

  const flowText = stringify(flow).toLowerCase();
  const requiredSignals = [
    "knowledge_gap",
    "research_proposal",
    "purpose",
    "allowed_source_types",
    "forbidden_source_types",
    "risk_level",
    "expected_value",
    "affected_wellfit_areas",
    "owner",
    "admin",
    "store_research_result_document",
    "independent_source_and_risk_review",
    "roadmap",
    "website",
    "investor_text",
    "product_concept"
  ];
  const missingSignals = requiredSignals.filter((signal) => !flowText.includes(signal));
  if (missingSignals.length > 0) results.fail.push(`controlledCuriosityFlow is missing required signals: ${missingSignals.join(", ")}.`);

  const block = flow?.automaticInternetResearchBlock;
  if (!asArray(block?.blockedWithoutExplicitApprovalForRiskLevels).includes("high")) {
    results.fail.push("controlledCuriosityFlow must block automatic internet research for high risk without explicit approval.");
  }
  if (!asArray(block?.blockedWithoutExplicitApprovalForRiskLevels).includes("critical")) {
    results.fail.push("controlledCuriosityFlow must block automatic internet research for critical risk without explicit approval.");
  }
  if (block?.blockedWithoutExplicitApprovalForProtectedTopics !== true) {
    results.fail.push("controlledCuriosityFlow must block automatic internet research for protected topics without explicit approval.");
  }
  if (flow?.adoptionPolicy?.requiresIndependentSourceRiskReview !== true) {
    results.fail.push("controlledCuriosityFlow.adoptionPolicy must require independent source/risk review.");
  }
}

function validateProtectedTopics(data, results) {
  const protectedText = `${asArray(data?.protectedTopics).join("\n")}\n${stringify(data?.humanReviewRequiredRules)}\n${stringify(data?.riskClassification)}`;
  for (const match of PROTECTED_TOPIC_MATCHES) {
    if (!includesAll(protectedText, match.terms)) {
      results.fail.push(`Protected topics must include ${match.label}: expected terms ${match.terms.join(", ")}.`);
    }
  }
}

function renderList(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None.";
}

function writeReport(results) {
  const passed = results.fail.length === 0;
  const report = [
    "# Research Recommendation Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## PASS",
    "",
    passed ? "- Research recommendation governance checks passed." : "- Some checks failed; see FAIL section.",
    "",
    "## FAIL",
    "",
    renderList(results.fail),
    "",
    "## WARNING",
    "",
    renderList(results.warn)
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");
}

function main() {
  const results = { fail: [], warn: [] };
  const data = readJson(results);

  if (data) {
    validateTopLevel(data, results);
    validateInternalFirst(data, results);
    validateExternalResearchPolicy(data, results);
    validateSources(data, results);
    validateRecommendationFormat(data, results);
    validateRiskAndReview(data, results);
    validateControlledCuriosity(data, results);
    validateProtectedTopics(data, results);
  }

  writeReport(results);
  const passed = results.fail.length === 0;

  console.log("WellFit Research Recommendation Check");
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log("");
  console.log("PASS:");
  console.log(passed ? "- Research recommendation governance checks passed." : "- Some checks failed; see FAIL section.");
  console.log("");
  console.log("FAIL:");
  console.log(renderList(results.fail));
  console.log("");
  console.log("WARNING:");
  console.log(renderList(results.warn));

  if (!passed) process.exit(1);
}

main();
