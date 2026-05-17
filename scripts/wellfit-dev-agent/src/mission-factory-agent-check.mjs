#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/mission-factory-agent.json";
const DOC_PATH = "docs/architecture/WELLFIT_MISSION_FACTORY_AGENT.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/mission-factory-agent-check.mjs";
const WORK_MAP_PATH = "todolist/WORK_MAP.md";
const TODO_INDEX_PATH = "todolist/TODO_INDEX.md";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/mission-factory-agent-report.md";

const REQUIRED_REFERENCES = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH];
const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "missionFactoryPrinciples",
  "inputSources",
  "allowedOutputs",
  "forbiddenOutputs",
  "missionPlanningRules",
  "missionAuthorityBoundaries",
  "protectedReviewTopics",
  "readinessChecklist",
  "reportSchema",
  "nonAuthorizingSignals",
  "qualityGateIntegration"
];
const REQUIRED_PRINCIPLES = [
  "report_only_planning",
  "extend_existing_mission_architecture",
  "human_review_before_runtime_missions",
  "server_authority_for_completion_and_rewards",
  "healthy_motivation",
  "protected_data_minimization",
  "anti_duplicate_architecture",
  "no_runtime_authority"
];
const REQUIRED_INPUTS = [
  "project-register/product-readiness.json",
  "project-register/features.json",
  "project-register/risk-classifier.json",
  "project-register/continuity-dependency-map.json",
  "project-register/product-intelligence-agent.json",
  "project-register/human-motivation-engine.json",
  "project-register/ethical-engagement-guard.json",
  "project-register/adaptive-difficulty-agent.json",
  "project-register/multisensory-learning-engine.json",
  "todolist/WORK_MAP.md",
  "todolist/TODO_INDEX.md",
  "todolist/CURRENT_PROJECT_STATE.md"
];
const REQUIRED_ALLOWED_OUTPUTS = [
  "mission concept inventory",
  "mission planning brief",
  "mission dependency map",
  "mission readiness checklist",
  "mission safety boundary report",
  "human-review question list",
  "non-runtime acceptance criteria draft"
];
const REQUIRED_FORBIDDEN_OUTPUTS = [
  "runtime mission generation",
  "mission completion authorization",
  "reward or XP authorization",
  "anti-cheat decisions",
  "location-triggered runtime behavior",
  "client-side final authority for missions or rewards"
];
const REQUIRED_PROTECTED_TOPICS = [
  "health or medical-adjacent claims",
  "child/minor safety",
  "location, GPS, geofence, route, or outdoor safety",
  "camera, face, biometric, motion, or sensor evidence",
  "consent, privacy, legal, compliance, AGB, Datenschutz, or Impressum wording",
  "token, NFT, wallet, payment, payout, betting, staking, marketplace, presale, or investment mechanics",
  "reward authority, mission completion authority, anti-cheat, PvP stakes, or financial-equivalent outcomes",
  "Unity, AR, native WellFitBuddyAR, or PR #13"
];
const REQUIRED_NON_AUTHORIZING_TRUE = [
  "neverModifiesRuntimeFiles",
  "neverCreatesRuntimeMissions",
  "neverAuthorizesMissionCompletion",
  "neverAuthorizesRewards",
  "neverTracksOrProfilesUsersAtRuntime",
  "neverActivatesLocationCameraHealthChildLegalTokenWalletPaymentUnityBehavior",
  "neverApprovesPrs",
  "neverMergesPrs",
  "neverRepairsFiles",
  "neverDeploys",
  "protectedTopicsRemainReviewRequired"
];
const FORBIDDEN_RUNTIME_PATTERNS = [
  "app/",
  "components/",
  "lib/",
  "functions/",
  "firestore.rules",
  "public/",
  "package.json",
  "package-lock.json",
  "firebase.json",
  ".github/",
  "native/unity/WellFitBuddyAR/"
];

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

function add(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function missingValues(actual, required) {
  const values = new Set(asArray(actual));
  return required.filter((value) => !values.has(value));
}

function missingFields(object, fields) {
  return fields.filter((field) => !(field in object));
}

function validateRegister(data, results) {
  const missingTopLevel = missingFields(data, REQUIRED_TOP_LEVEL_FIELDS);
  add(results, "register has required top-level fields", missingTopLevel.length === 0, missingTopLevel.length ? `missing: ${missingTopLevel.join(", ")}` : "complete");
  add(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");
  add(results, "purpose states report-only", /report-only/i.test(data.purpose ?? ""), data.purpose ?? "missing");

  const missingPrinciples = missingValues(data.missionFactoryPrinciples, REQUIRED_PRINCIPLES);
  add(results, "required Mission Factory principles exist", missingPrinciples.length === 0, missingPrinciples.length ? `missing: ${missingPrinciples.join(", ")}` : "complete");

  const missingInputs = missingValues(data.inputSources, REQUIRED_INPUTS);
  add(results, "required mapped input sources exist", missingInputs.length === 0, missingInputs.length ? `missing: ${missingInputs.join(", ")}` : "complete");

  const missingAllowedOutputs = missingValues(data.allowedOutputs, REQUIRED_ALLOWED_OUTPUTS);
  add(results, "allowed outputs are report-only planning artifacts", missingAllowedOutputs.length === 0, missingAllowedOutputs.length ? `missing: ${missingAllowedOutputs.join(", ")}` : "complete");

  const missingForbiddenOutputs = missingValues(data.forbiddenOutputs, REQUIRED_FORBIDDEN_OUTPUTS);
  add(results, "forbidden outputs block runtime mission authority", missingForbiddenOutputs.length === 0, missingForbiddenOutputs.length ? `missing: ${missingForbiddenOutputs.join(", ")}` : "complete");

  const planningRules = data.missionPlanningRules ?? {};
  add(results, "mission planning extends existing sources", planningRules.mustExtendExistingSources === true, planningRules.mustExtendExistingSources ?? "missing");
  add(results, "runtime implementation requires separate approval", planningRules.runtimeImplementationRequiresSeparateApproval === true, planningRules.runtimeImplementationRequiresSeparateApproval ?? "missing");
  add(results, "anti-duplicate architecture rule exists", /duplicate|parallel|replacement/i.test(planningRules.antiDuplicateArchitecture ?? ""), planningRules.antiDuplicateArchitecture ?? "missing");
  add(results, "ambiguity stops as review_required", /review_required/i.test(planningRules.stopForAmbiguity ?? ""), planningRules.stopForAmbiguity ?? "missing");

  const authority = data.missionAuthorityBoundaries ?? {};
  add(results, "client cannot finalize completion", authority.clientMayFinalizeCompletion === false, authority.clientMayFinalizeCompletion ?? "missing");
  add(results, "client cannot authorize rewards", authority.clientMayAuthorizeRewards === false, authority.clientMayAuthorizeRewards ?? "missing");
  add(results, "report-only agent authorizes nothing", asArray(authority.reportOnlyAgentMayAuthorize).length === 0, `${asArray(authority.reportOnlyAgentMayAuthorize).length} authorizations`);
  const serverAuthority = asArray(authority.serverAuthorityRequiredFor).join("\n");
  add(results, "server authority required for completion and rewards", /mission completion/i.test(serverAuthority) && /reward or XP grants/i.test(serverAuthority), serverAuthority || "missing");

  const missingProtectedTopics = missingValues(data.protectedReviewTopics, REQUIRED_PROTECTED_TOPICS);
  add(results, "protected topics remain review_required", missingProtectedTopics.length === 0, missingProtectedTopics.length ? `missing: ${missingProtectedTopics.join(", ")}` : "complete");

  const nonAuthorizing = data.nonAuthorizingSignals ?? {};
  const missingSignals = REQUIRED_NON_AUTHORIZING_TRUE.filter((field) => nonAuthorizing[field] !== true);
  add(results, "non-authorizing signals are true", missingSignals.length === 0, missingSignals.length ? `not true: ${missingSignals.join(", ")}` : "complete");

  const integration = data.qualityGateIntegration ?? {};
  add(results, "quality gate script path is registered", integration.script === SCRIPT_PATH, integration.script ?? "missing");
  add(results, "ready signal is registered", integration.readySignal === "MISSION_FACTORY_AGENT_READY=true", integration.readySignal ?? "missing");

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
  return `# WellFit Mission Factory Agent Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nMISSION_FACTORY_AGENT_READY=${ready ? "true" : "false"}\n\n## Checks\n\n${renderTable(results)}\n\n## Non-Authorizing Boundary\n\n- Never modifies runtime files: true\n- Never creates runtime missions: true\n- Never authorizes mission completion: true\n- Never authorizes rewards: true\n- Never tracks or profiles users at runtime: true\n- Never activates location/camera/health/child/legal/token/wallet/payment/Unity behavior: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Protected topics remain review_required: true\n`;
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

  console.log(`WellFit Mission Factory Agent report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never creates runtime missions: true");
  console.log("Never authorizes mission completion: true");
  console.log("Never authorizes rewards: true");
  console.log("Never tracks or profiles users at runtime: true");
  console.log("Never activates location/camera/health/child/legal/token/wallet/payment/Unity behavior: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`MISSION_FACTORY_AGENT_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
