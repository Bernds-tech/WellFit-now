#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/product-intelligence-agent.json";
const DOC_PATH = "docs/architecture/WELLFIT_PRODUCT_INTELLIGENCE_AGENT.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/product-intelligence-agent-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/product-intelligence-agent-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "productIntelligencePrinciples",
  "inputSources",
  "allowedAnalyses",
  "forbiddenAnalyses",
  "prioritizationRules",
  "productDecisionRules",
  "roadmapAlignmentRules",
  "websiteFindingRules",
  "userFeedbackRules",
  "readinessImpactRules",
  "riskClassificationRules",
  "revenueAndTrustRules",
  "humanReviewRequiredFor",
  "allowedOutputs",
  "forbiddenAutoActions",
  "reportOutputSchema"
];

const REQUIRED_PRINCIPLES = [
  "evidence_over_assumption",
  "user_value_first",
  "healthy_motivation",
  "trust_preservation",
  "safety_before_growth",
  "roadmap_alignment",
  "no_runtime_authority",
  "human_review_for_sensitive_decisions",
  "protected_data_minimization",
  "anti_duplicate_architecture"
];

const REQUIRED_INPUT_SOURCES = [
  "product-readiness.json",
  "agent-catalog.json",
  "approved-agent-build-backlog.json",
  "website-agent-backlog.json",
  "website-readiness.json",
  "adaptive-user-insights.json",
  "research-recommendations.json",
  "continuity-dependency-map.json",
  "master-roadmap-tasks.json",
  "internal-sources.json",
  "progress-log.json",
  "agent-work-log.json"
];

const REQUIRED_ALLOWED_ANALYSES = [
  "roadmap gap analysis",
  "product readiness prioritization",
  "website finding clustering",
  "user feedback theme analysis",
  "agent backlog prioritization",
  "feature dependency analysis",
  "risk-aware next task recommendation",
  "revenue/trust tradeoff framing",
  "hypothesis generation for human review",
  "product decision brief generation"
];

const REQUIRED_FORBIDDEN_ANALYSES = [
  "runtime user profiling",
  "sensitive health/child/location/camera/biometric inference",
  "automated legal/compliance conclusions",
  "automated reward authority decisions",
  "automated mission-completion authority decisions",
  "token/wallet/payment/investment recommendations",
  "dark-pattern growth optimization",
  "individual-user targeting without consent/review",
  "deployment or runtime configuration changes",
  "medical, psychological, financial or legal advice"
];

const REQUIRED_PRIORITIZATION_RULES = [
  "user value",
  "safety risk",
  "implementation readiness",
  "evidence strength",
  "revenue potential without trust loss",
  "dependency complexity",
  "protected-topic sensitivity",
  "required human review"
];

const REQUIRED_PRODUCT_DECISION_TERMS = [
  "Product Intelligence may recommend, cluster, prioritize and draft briefs.",
  "Product Intelligence must not make final product decisions automatically.",
  "High/critical/protected topics remain review_required.",
  "Runtime implementation requires separate scoped approval.",
  "Product decisions affecting health, child/minor, location, camera, biometric, consent, privacy, legal, token, wallet, payment, reward authority, mission authority or Unity remain human-review-required."
];

const REQUIRED_PROTECTED_REVIEW_TERMS = [
  "health",
  "child/minor",
  "location",
  "camera",
  "biometric",
  "consent",
  "privacy",
  "legal",
  "token",
  "wallet",
  "payment",
  "reward authority",
  "mission-completion authority",
  "Unity",
  "review_required"
];

const REQUIRED_FORBIDDEN_ACTIONS = [
  "modify_runtime_files",
  "make_product_decisions_automatically",
  "profile_users_at_runtime",
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

function absolute(relativePath) { return path.join(ROOT, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), "utf8"); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function stringify(value) { return JSON.stringify(value ?? null, null, 2); }
function add(results, name, passed, details) { results.push({ name, passed, details: String(details) }); }
function missingValues(actual, required) { const set = new Set(asArray(actual)); return required.filter((value) => !set.has(value)); }
function includesTerms(value, terms) { const text = stringify(value).toLowerCase(); return terms.filter((term) => !text.includes(term.toLowerCase())); }
function isForbiddenRuntimePattern(value) { return typeof value === "string" && (FORBIDDEN_RUNTIME_EXACT.has(value) || FORBIDDEN_RUNTIME_PREFIXES.some((prefix) => value.startsWith(prefix))); }
function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

function validateRegister(data, results) {
  const missingTopLevel = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in data));
  add(results, "required top-level fields exist", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : "complete");
  add(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");

  const missingPrinciples = missingValues(data.productIntelligencePrinciples, REQUIRED_PRINCIPLES);
  add(results, "product intelligence principles exist", missingPrinciples.length === 0, missingPrinciples.length ? `missing: ${missingPrinciples.join(", ")}` : "complete");

  const missingSources = missingValues(data.inputSources, REQUIRED_INPUT_SOURCES);
  add(results, "input sources exist", missingSources.length === 0, missingSources.length ? `missing: ${missingSources.join(", ")}` : "complete");

  const missingAllowed = missingValues(data.allowedAnalyses, REQUIRED_ALLOWED_ANALYSES);
  add(results, "allowed analyses exist", missingAllowed.length === 0, missingAllowed.length ? `missing: ${missingAllowed.join(", ")}` : "complete");

  const missingForbidden = missingValues(data.forbiddenAnalyses, REQUIRED_FORBIDDEN_ANALYSES);
  add(results, "forbidden analyses exist", missingForbidden.length === 0, missingForbidden.length ? `missing: ${missingForbidden.join(", ")}` : "complete");

  const missingPrioritization = REQUIRED_PRIORITIZATION_RULES.filter((field) => !(field in (data.prioritizationRules ?? {})));
  add(results, "prioritization rules exist", missingPrioritization.length === 0, missingPrioritization.length ? `missing: ${missingPrioritization.join(", ")}` : "complete");

  const missingDecisionTerms = includesTerms(data.productDecisionRules, REQUIRED_PRODUCT_DECISION_TERMS);
  add(results, "product decision rules exist", missingDecisionTerms.length === 0, missingDecisionTerms.length ? `missing terms: ${missingDecisionTerms.join(", ")}` : "complete");

  const protectedText = `${stringify(data.humanReviewRequiredFor)}\n${stringify(data.productDecisionRules)}\n${stringify(data.riskClassificationRules)}`;
  const missingProtectedReview = REQUIRED_PROTECTED_REVIEW_TERMS.filter((term) => !protectedText.toLowerCase().includes(term.toLowerCase()));
  add(results, "protected topics require human review", missingProtectedReview.length === 0, missingProtectedReview.length ? `missing: ${missingProtectedReview.join(", ")}` : "complete");

  const forbiddenActions = new Set(asArray(data.forbiddenAutoActions));
  const missingForbiddenActions = REQUIRED_FORBIDDEN_ACTIONS.filter((action) => !forbiddenActions.has(action));
  add(results, "forbidden auto-actions preserve non-authority", missingForbiddenActions.length === 0, missingForbiddenActions.length ? `missing: ${missingForbiddenActions.join(", ")}` : "complete");

  const runtimePatterns = collectStrings(data).filter(isForbiddenRuntimePattern);
  add(results, "register does not allow runtime file patterns", runtimePatterns.length === 0, runtimePatterns.length ? `forbidden runtime patterns: ${runtimePatterns.join(", ")}` : "no runtime file paths found");
}

function validateReferences(results) {
  const workMap = exists(WORK_MAP_PATH) ? readText(WORK_MAP_PATH) : "";
  const todoIndex = exists(TODO_INDEX_PATH) ? readText(TODO_INDEX_PATH) : "";
  for (const file of REQUIRED_REFERENCES) {
    add(results, `Work Map references ${file}`, workMap.includes(file), workMap.includes(file) ? "referenced" : "missing");
    add(results, `TODO Index references ${file}`, todoIndex.includes(file), todoIndex.includes(file) ? "referenced" : "missing");
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
  return `# WellFit Product Intelligence Agent Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nPRODUCT_INTELLIGENCE_AGENT_READY=${ready ? "true" : "false"}\n\n## Checks\n\n${renderTable(results)}\n\n## Non-Authorizing Boundary\n\n- Never modifies runtime files: true\n- Never makes product decisions automatically: true\n- Never personalizes users at runtime: true\n- Never tracks or profiles users at runtime: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables reward authority: true\n- Never enables mission-completion authority: true\n- Never changes runtime configuration: true\n- Never modifies Unity or PR #13 files: true\n- Protected topics remain review_required: true\n`;
}

function main() {
  const results = [];
  for (const file of [REGISTER_PATH, DOC_PATH, SCRIPT_PATH, WORK_MAP_PATH, TODO_INDEX_PATH]) {
    add(results, `${file} exists`, exists(file), exists(file) ? "found" : "missing");
  }

  let data;
  try {
    data = readJson(REGISTER_PATH);
    add(results, `${REGISTER_PATH} parses as JSON`, true, "valid JSON");
  } catch (error) {
    add(results, `${REGISTER_PATH} parses as JSON`, false, error.message);
  }

  if (data) validateRegister(data, results);
  validateReferences(results);

  const ready = results.every((result) => result.passed);
  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), renderReport(results, ready), "utf8");

  console.log(`WellFit Product Intelligence Agent report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never makes product decisions automatically: true");
  console.log("Never personalizes users at runtime: true");
  console.log("Never tracks or profiles users at runtime: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Never enables reward authority: true");
  console.log("Never enables mission-completion authority: true");
  console.log(`PRODUCT_INTELLIGENCE_AGENT_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
