#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/reward-fairness-guard.json";
const DOC_PATH = "docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/reward-fairness-guard-check.mjs";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/reward-fairness-guard-report.md";

const CONNECTED_SOURCES = [
  "project-register/mission-buddy-economy-flow.json",
  "project-register/risk-classifier.json",
  "docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md",
  "docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md"
];

const REVIEW_AREAS = [
  "internal_points",
  "xp",
  "streaks",
  "mission_completion",
  "challenge_rewards",
  "anti_cheat",
  "beginner_advanced_fairness",
  "no_pay_to_win"
];

const REQUIRED_FORBIDDEN_ACTIONS = [
  "write_rewards",
  "write_points",
  "write_xp",
  "write_streaks",
  "authorize_mission_completion",
  "authorize_challenge_rewards",
  "authorize_anti_cheat_enforcement",
  "modify_runtime_files",
  "change_firestore_rules",
  "change_firebase_functions",
  "enable_pay_to_win_mechanics",
  "profile_users_at_runtime"
];

const REQUIRED_ALLOWED_OUTPUTS = [
  "reward_fairness_report",
  "fairness_blockers",
  "server_authority_flags",
  "pay_to_win_flags",
  "anti_cheat_review_flags",
  "beginner_advanced_balance_notes",
  "human_review_required_questions"
];

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
  const actualSet = new Set(asArray(actual));
  return required.filter((item) => !actualSet.has(item));
}

function isForbiddenRuntimePattern(value) {
  if (typeof value !== "string") return false;
  return FORBIDDEN_RUNTIME_EXACT.has(value) || FORBIDDEN_RUNTIME_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function validateFiles(results) {
  const requiredFiles = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH, ...CONNECTED_SOURCES];
  for (const filePath of requiredFiles) {
    addResult(results, `file exists: ${filePath}`, exists(filePath), filePath);
  }
}

function validateRegister(data, results) {
  addResult(results, "register id matches", data.id === "reward-fairness-guard", data.id ?? "missing");
  addResult(results, "activationState is report_only", data.activationState === "report_only", data.activationState ?? "missing");
  addResult(results, "runtime reward writes disabled", data.scope?.runtimeRewardWritesEnabled === false, String(data.scope?.runtimeRewardWritesEnabled));
  addResult(results, "runtime completion authority disabled", data.scope?.runtimeCompletionAuthorityEnabled === false, String(data.scope?.runtimeCompletionAuthorityEnabled));
  addResult(results, "runtime anti-cheat authority disabled", data.scope?.runtimeAntiCheatAuthorityEnabled === false, String(data.scope?.runtimeAntiCheatAuthorityEnabled));
  addResult(results, "runtime personalization/tracking/profiling disabled", data.scope?.runtimePersonalizationEnabled === false && data.scope?.runtimeTrackingEnabled === false && data.scope?.runtimeProfilingEnabled === false, JSON.stringify({ runtimePersonalizationEnabled: data.scope?.runtimePersonalizationEnabled, runtimeTrackingEnabled: data.scope?.runtimeTrackingEnabled, runtimeProfilingEnabled: data.scope?.runtimeProfilingEnabled }));

  const unsafeAllowedFiles = asArray(data.scope?.allowedFiles).filter(isForbiddenRuntimePattern);
  addResult(results, "allowedFiles avoid runtime/protected paths", unsafeAllowedFiles.length === 0, unsafeAllowedFiles.length ? `unsafe allowed files: ${unsafeAllowedFiles.join(", ")}` : "safe allowedFiles");

  const sourcePaths = asArray(data.connectedSources).map((source) => source?.path);
  const missingSources = missingValues(sourcePaths, CONNECTED_SOURCES);
  addResult(results, "connected sources are registered", missingSources.length === 0, missingSources.length ? `missing: ${missingSources.join(", ")}` : "all connected sources present");

  addResult(results, "artifact paths synchronized", data.artifactSet?.architectureDoc === DOC_PATH && data.artifactSet?.register === REGISTER_PATH && data.artifactSet?.validatorScript === SCRIPT_PATH, JSON.stringify(data.artifactSet ?? null));

  const reviewAreaIds = asArray(data.reviewAreas).map((area) => area?.id);
  const missingAreas = missingValues(reviewAreaIds, REVIEW_AREAS);
  addResult(results, "all reward fairness review areas exist", missingAreas.length === 0, missingAreas.length ? `missing: ${missingAreas.join(", ")}` : `${REVIEW_AREAS.length} review areas present`);

  const areasWithoutChecks = asArray(data.reviewAreas).filter((area) => asArray(area?.checks).length < 3).map((area) => area?.id ?? "unknown");
  addResult(results, "each review area has at least three checks", areasWithoutChecks.length === 0, areasWithoutChecks.length ? `too few checks: ${areasWithoutChecks.join(", ")}` : "checks present");

  const missingAllowedOutputs = missingValues(data.allowedOutputs, REQUIRED_ALLOWED_OUTPUTS);
  addResult(results, "allowed outputs are report/blocker only", missingAllowedOutputs.length === 0, missingAllowedOutputs.length ? `missing: ${missingAllowedOutputs.join(", ")}` : "allowed report outputs present");

  const missingForbiddenActions = missingValues(data.forbiddenActions, REQUIRED_FORBIDDEN_ACTIONS);
  addResult(results, "forbidden actions block writes and authority", missingForbiddenActions.length === 0, missingForbiddenActions.length ? `missing: ${missingForbiddenActions.join(", ")}` : "write/authority actions forbidden");

  const combined = stringify(data);
  addResult(results, "no pay-to-win boundary present", combined.includes("pay-to-win") || combined.includes("pay_to_win"), "pay-to-win wording present");
  addResult(results, "server authority boundary present", combined.includes("server-authoritative") || combined.includes("server-side authority") || combined.includes("server-ledger"), "server authority wording present");
}

function validateConnectedSources(results) {
  if (!exists("project-register/mission-buddy-economy-flow.json")) return;
  const flow = readJson("project-register/mission-buddy-economy-flow.json");
  addResult(results, "mission/buddy/economy forbids frontend reward finalization", flow.authorityRules?.frontendMayFinalizeRewards === false, String(flow.authorityRules?.frontendMayFinalizeRewards));
  addResult(results, "mission/buddy/economy forbids frontend completion finalization", flow.authorityRules?.frontendMayFinalizeMissionCompletion === false, String(flow.authorityRules?.frontendMayFinalizeMissionCompletion));
  addResult(results, "mission/buddy/economy requires server ledger", flow.authorityRules?.serverLedgerRequiredForFinalAuthority === true, String(flow.authorityRules?.serverLedgerRequiredForFinalAuthority));

  if (exists("project-register/risk-classifier.json")) {
    const riskText = readText("project-register/risk-classifier.json").toLowerCase();
    addResult(results, "risk classifier covers final reward authority", riskText.includes("final_reward_authority") || riskText.includes("reward authority"), "reward authority risk wording present");
    addResult(results, "risk classifier covers anti-cheat", riskText.includes("anti_cheat") || riskText.includes("anti-cheat"), "anti-cheat risk wording present");
  }
}

function validateDoc(results) {
  if (!exists(DOC_PATH)) return;
  const doc = readText(DOC_PATH);
  const lower = doc.toLowerCase();
  const requiredTerms = [
    "interne punkte",
    "xp",
    "streaks",
    "mission completion",
    "challenge rewards",
    "anti-cheat",
    "fairness für anfänger/fortgeschrittene",
    "keine pay-to-win mechanik",
    "must not write rewards",
    "must not final-authorize completion",
    "project-register/mission-buddy-economy-flow.json",
    "project-register/risk-classifier.json",
    "docs/architecture/internal_economy_guardrails.md",
    "docs/architecture/economy_server_completion_and_firestore_hardening.md"
  ];
  const missingTerms = requiredTerms.filter((term) => !lower.includes(term));
  addResult(results, "documentation covers review areas, boundaries, and connected sources", missingTerms.length === 0, missingTerms.length ? `missing terms: ${missingTerms.join(", ")}` : "required terms present");
}

function renderResults(results) {
  return results.map((result) => `- ${result.passed ? "PASS" : "FAIL"}: ${result.name} (${result.details})`).join("\n");
}

function main() {
  const results = [];
  let data = null;

  validateFiles(results);

  try {
    data = readJson(REGISTER_PATH);
    addResult(results, "register parses as JSON", true, REGISTER_PATH);
  } catch (error) {
    addResult(results, "register parses as JSON", false, error.message);
  }

  if (data) validateRegister(data, results);
  validateConnectedSources(results);
  validateDoc(results);

  const ready = results.every((result) => result.passed);
  const report = `# Reward Fairness Guard Check Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nREWARD_FAIRNESS_GUARD_READY=${ready ? "true" : "false"}\n\n## Safety Boundaries\n\n- Never writes rewards: true\n- Never writes points: true\n- Never writes XP: true\n- Never writes streaks: true\n- Never authorizes mission completion: true\n- Never authorizes challenge rewards: true\n- Never enforces anti-cheat: true\n- Never modifies runtime files: true\n- Never changes Firestore rules or Firebase Functions: true\n- Never enables pay-to-win, token, wallet, payment, NFT, payout, betting, or marketplace logic: true\n\n## Validation Results\n\n${renderResults(results)}\n`;

  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log("Mode: REPORT_ONLY");
  console.log("Never writes rewards: true");
  console.log("Never authorizes completion: true");
  console.log("Never enforces anti-cheat: true");
  console.log("Never modifies runtime files: true");
  console.log(`REWARD_FAIRNESS_GUARD_READY=${ready ? "true" : "false"}`);
  console.log(`Report: ${OUTPUT_PATH}`);

  if (!ready) {
    console.log(renderResults(results));
    process.exit(1);
  }
}

main();
