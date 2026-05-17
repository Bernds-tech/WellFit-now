#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/healthy-retention-agent.json";
const DOC_PATH = "docs/architecture/WELLFIT_HEALTHY_RETENTION_AGENT.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/healthy-retention-agent-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/healthy-retention-agent-report.md";

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "healthyRetentionPrinciples",
  "inputSources",
  "allowedOutputs",
  "forbiddenOutputs",
  "retentionReviewRules",
  "retentionAuthorityBoundaries",
  "protectedReviewTopics",
  "healthyRetentionChecklist",
  "reportSchema",
  "nonAuthorizingSignals",
  "qualityGateIntegration",
  "nextSafeMaintenanceTask"
];

const REQUIRED_PRINCIPLES = [
  "wellbeing_first_retention",
  "user_agency_and_exit_paths",
  "recovery_and_pause_respect",
  "non_addictive_engagement",
  "protected_data_minimization",
  "anti_duplicate_architecture",
  "no_runtime_authority"
];

const REQUIRED_INPUTS = [
  "project-register/adaptive-user-insights.json",
  "project-register/product-readiness.json",
  "project-register/risk-classifier.json",
  "project-register/human-motivation-engine.json",
  "project-register/ethical-engagement-guard.json",
  "project-register/continuity-dependency-map.json",
  "todolist/WORK_MAP.md",
  "todolist/TODO_INDEX.md",
  "todolist/CURRENT_PROJECT_STATE.md"
];

const REQUIRED_FORBIDDEN_OUTPUTS = [
  "runtime retention implementation",
  "individual-user targeting or profiling",
  "runtime personalization decisions",
  "push notification, streak, urgency, scarcity, loss-aversion, or reactivation automation",
  "mission completion authorization",
  "reward or XP authorization",
  "Unity, AR, native, or PR #13 implementation",
  "deployment or configuration changes"
];

const REQUIRED_PROTECTED_TOPICS = [
  "health or medical-adjacent claims",
  "child/minor safety and age-appropriate design",
  "location, GPS, geofence, route, or outdoor safety",
  "camera, face, biometric, motion, or sensor evidence",
  "consent, privacy, legal, compliance, AGB, Datenschutz, or Impressum wording",
  "token, NFT, wallet, payment, payout, betting, staking, marketplace, presale, or investment mechanics",
  "reward authority, mission completion authority, anti-cheat, PvP stakes, or financial-equivalent outcomes",
  "Unity, AR, native WellFitBuddyAR, or PR #13",
  "dark patterns, addictive loops, coercive retention, or manipulative urgency"
];

const REQUIRED_NON_AUTHORIZING_TRUE = [
  "neverModifiesRuntimeFiles",
  "neverPersonalizesUsersAtRuntime",
  "neverTracksOrProfilesUsersAtRuntime",
  "neverTriggersNotifications",
  "neverModifiesStreaksOrRewards",
  "neverAuthorizesMissionCompletion",
  "neverAuthorizesRewards",
  "neverActivatesLocationCameraHealthChildLegalTokenWalletPaymentUnityBehavior",
  "neverApprovesPrs",
  "neverMergesPrs",
  "neverRepairsFiles",
  "neverDeploys",
  "protectedTopicsRemainReviewRequired"
];

const REQUIRED_REFERENCES = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH];
const FORBIDDEN_RUNTIME_PATTERNS = ["app/", "components/", "lib/", "functions/", "public/", "native/unity/WellFitBuddyAR/", "firestore.rules", "package.json", "package-lock.json", "firebase.json"];

function absolute(relativePath) { return path.join(ROOT, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), "utf8"); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function add(results, name, passed, details) { results.push({ name, passed, details: String(details) }); }
function missingValues(actual, required) {
  const values = new Set(asArray(actual));
  return required.filter((value) => !values.has(value));
}
function missingFields(object, fields) { return fields.filter((field) => !(field in object)); }

function validateRegister(data, results) {
  add(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");
  const missingTopLevel = missingFields(data, REQUIRED_TOP_LEVEL_FIELDS);
  add(results, "register has required top-level fields", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : "complete");
  add(results, "purpose is report-only and retention scoped", /report-only|report_only/i.test(data.purpose ?? "") && /retention/i.test(data.purpose ?? ""), data.purpose ?? "missing");

  const missingPrinciples = missingValues(data.healthyRetentionPrinciples, REQUIRED_PRINCIPLES);
  add(results, "healthy retention principles cover wellbeing/non-authority", missingPrinciples.length === 0, missingPrinciples.length ? `missing: ${missingPrinciples.join(", ")}` : "complete");

  const missingInputs = missingValues(data.inputSources, REQUIRED_INPUTS);
  add(results, "input sources extend existing governance registers", missingInputs.length === 0, missingInputs.length ? `missing: ${missingInputs.join(", ")}` : "complete");

  add(results, "allowed outputs are report/planning only", asArray(data.allowedOutputs).length >= 8 && asArray(data.allowedOutputs).every((item) => !/implement|authorize|trigger|deploy/i.test(item)), `${asArray(data.allowedOutputs).length} outputs`);
  const missingForbiddenOutputs = missingValues(data.forbiddenOutputs, REQUIRED_FORBIDDEN_OUTPUTS);
  add(results, "forbidden outputs block runtime retention authority", missingForbiddenOutputs.length === 0, missingForbiddenOutputs.length ? `missing: ${missingForbiddenOutputs.join(", ")}` : "complete");

  const rules = data.retentionReviewRules ?? {};
  add(results, "retention review extends existing sources", rules.mustExtendExistingSources === true, rules.mustExtendExistingSources ?? "missing");
  add(results, "runtime implementation requires separate approval", rules.runtimeImplementationRequiresSeparateApproval === true, rules.runtimeImplementationRequiresSeparateApproval ?? "missing");
  add(results, "anti-duplicate architecture rule exists", /duplicate|parallel|replacement/i.test(rules.antiDuplicateArchitecture ?? ""), rules.antiDuplicateArchitecture ?? "missing");
  add(results, "ambiguity stops as review_required", /review_required/i.test(rules.stopForAmbiguity ?? ""), rules.stopForAmbiguity ?? "missing");

  const authority = data.retentionAuthorityBoundaries ?? {};
  add(results, "agent cannot personalize users at runtime", authority.agentMayPersonalizeUsersAtRuntime === false, authority.agentMayPersonalizeUsersAtRuntime ?? "missing");
  add(results, "agent cannot trigger notifications", authority.agentMayTriggerNotifications === false, authority.agentMayTriggerNotifications ?? "missing");
  add(results, "agent cannot modify streaks or rewards", authority.agentMayModifyStreaksOrRewards === false, authority.agentMayModifyStreaksOrRewards ?? "missing");
  add(results, "agent cannot authorize missions", authority.agentMayAuthorizeMissions === false, authority.agentMayAuthorizeMissions ?? "missing");
  add(results, "agent cannot authorize rewards", authority.agentMayAuthorizeRewards === false, authority.agentMayAuthorizeRewards ?? "missing");
  add(results, "report-only agent authorizes nothing", asArray(authority.reportOnlyAgentMayAuthorize).length === 0, `${asArray(authority.reportOnlyAgentMayAuthorize).length} authorizations`);
  add(results, "human review covers retention and protected topics", /notification|streak|health|child|privacy|reward/i.test(asArray(authority.humanReviewRequiredFor).join("\n")), asArray(authority.humanReviewRequiredFor).join("; ") || "missing");

  const missingProtectedTopics = missingValues(data.protectedReviewTopics, REQUIRED_PROTECTED_TOPICS);
  add(results, "protected topics remain review_required", missingProtectedTopics.length === 0, missingProtectedTopics.length ? `missing: ${missingProtectedTopics.join(", ")}` : "complete");

  const nonAuthorizing = data.nonAuthorizingSignals ?? {};
  const missingSignals = REQUIRED_NON_AUTHORIZING_TRUE.filter((field) => nonAuthorizing[field] !== true);
  add(results, "non-authorizing signals are true", missingSignals.length === 0, missingSignals.length ? `not true: ${missingSignals.join(", ")}` : "complete");

  const integration = data.qualityGateIntegration ?? {};
  add(results, "quality gate script path is registered", integration.script === SCRIPT_PATH, integration.script ?? "missing");
  add(results, "ready signal is registered", integration.readySignal === "HEALTHY_RETENTION_AGENT_READY=true", integration.readySignal ?? "missing");

  const serialized = JSON.stringify(data);
  const runtimePatterns = FORBIDDEN_RUNTIME_PATTERNS.filter((pattern) => serialized.includes(`\"${pattern}`));
  add(results, "register does not allow runtime/protected file paths", runtimePatterns.length === 0, runtimePatterns.length ? `runtime patterns: ${runtimePatterns.join(", ")}` : "no runtime allowed file paths found");
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
  return `# WellFit Healthy Retention Agent Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nHEALTHY_RETENTION_AGENT_READY=${ready ? "true" : "false"}\n\n## Checks\n\n${renderTable(results)}\n\n## Non-Authorizing Boundary\n\n- Never modifies runtime files: true\n- Never personalizes users at runtime: true\n- Never tracks or profiles users at runtime: true\n- Never triggers notifications: true\n- Never modifies streaks or rewards: true\n- Never authorizes mission completion: true\n- Never authorizes rewards: true\n- Never activates location/camera/health/child/legal/token/wallet/payment/Unity behavior: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Protected topics remain review_required: true\n`;
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

  console.log(`WellFit Healthy Retention Agent report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never personalizes users at runtime: true");
  console.log("Never tracks or profiles users at runtime: true");
  console.log("Never triggers notifications: true");
  console.log("Never modifies streaks or rewards: true");
  console.log("Never authorizes mission completion: true");
  console.log("Never authorizes rewards: true");
  console.log("Never activates location/camera/health/child/legal/token/wallet/payment/Unity behavior: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Protected topics remain review_required: true");
  console.log(`HEALTHY_RETENTION_AGENT_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
