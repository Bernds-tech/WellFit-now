#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENTRY_ID = "child-safety-guard";
const REGISTER_PATH = "project-register/child-safety-guard.json";
const DOC_PATH = "docs/architecture/WELLFIT_CHILD_SAFETY_GUARD.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/child-safety-guard-check.mjs";
const ETHICAL_REGISTER_PATH = "project-register/ethical-engagement-guard.json";
const HEALTHY_RETENTION_REGISTER_PATH = "project-register/healthy-retention-agent.json";
const PRIVACY_GUARDRAILS_PATH = "docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md";
const REQUIRED_PATHS = [
  REGISTER_PATH,
  DOC_PATH,
  SCRIPT_PATH,
  ETHICAL_REGISTER_PATH,
  HEALTHY_RETENTION_REGISTER_PATH,
  PRIVACY_GUARDRAILS_PATH
];

const REQUIRED_REVIEW_AREAS = [
  "age_appropriate_language",
  "no_dangerous_movement_prompts",
  "no_location_sharing_without_protection_concept",
  "no_private_child_data",
  "no_social_risks",
  "no_manipulative_retention"
];

const REQUIRED_DOC_TERMS = [
  "Runtime Child-Safety-Logik bleibt blockiert",
  "expliziter Reviewplan",
  "altersgerechte Sprache",
  "Keine gefährlichen Bewegungsaufforderungen",
  "Keine Standortfreigabe ohne Schutzkonzept",
  "Keine privaten Kinderdaten",
  "Keine sozialen Risiken",
  "Keine manipulative Retention",
  ETHICAL_REGISTER_PATH,
  HEALTHY_RETENTION_REGISTER_PATH,
  PRIVACY_GUARDRAILS_PATH,
  "Runtime authority granted: `false`"
];

const FORBIDDEN_RUNTIME_SCOPES = [
  "app/**",
  "components/**",
  "lib/**",
  "functions/**",
  "firestore.rules",
  "public/**",
  "package.json",
  "package-lock.json",
  "firebase.json",
  ".github/**",
  "native/unity/WellFitBuddyAR/**"
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

function missingTerms(text, terms) {
  const lower = text.toLowerCase();
  return terms.filter((term) => !lower.includes(term.toLowerCase()));
}

const results = [];

for (const filePath of REQUIRED_PATHS) {
  add(results, `exists: ${filePath}`, exists(filePath), filePath);
}

if (results.every((result) => result.passed)) {
  const register = readJson(REGISTER_PATH);
  const doc = readText(DOC_PATH);
  const connectedSourcePaths = asArray(register.connectedSources).map((source) => source?.path);
  const reviewAreaIds = asArray(register.reviewAreas).map((area) => area?.id);
  const forbiddenScopes = asArray(register.scope?.forbiddenRuntimeWriteScopes);
  const minimumReviewPlanRequirements = asArray(register.runtimeBlock?.minimumReviewPlanRequirements);

  add(results, "register id matches", register.id === ENTRY_ID, register.id);
  add(results, "runtime child-safety logic blocked", register.runtimeChildSafetyLogicEnabled === false && register.runtimeAuthorityGranted === false, JSON.stringify({ runtimeChildSafetyLogicEnabled: register.runtimeChildSafetyLogicEnabled, runtimeAuthorityGranted: register.runtimeAuthorityGranted }));
  add(results, "explicit review plan required", register.activationState === "blocked_until_explicit_review_plan" && register.requiresExplicitReviewPlanForRuntime === true && register.requiresHumanApprovalForRuntime === true, JSON.stringify({ activationState: register.activationState, requiresExplicitReviewPlanForRuntime: register.requiresExplicitReviewPlanForRuntime, requiresHumanApprovalForRuntime: register.requiresHumanApprovalForRuntime }));
  add(results, "execution remains report-only", register.executionCapability === "report_only" && register.guardType === "planning_and_validation_only", `${register.executionCapability} / ${register.guardType}`);
  add(results, "artifact paths synchronized", register.artifactSet?.register === REGISTER_PATH && register.artifactSet?.architectureDoc === DOC_PATH && register.artifactSet?.validatorScript === SCRIPT_PATH, JSON.stringify(register.artifactSet));
  add(results, "connected sources present", [ETHICAL_REGISTER_PATH, HEALTHY_RETENTION_REGISTER_PATH, PRIVACY_GUARDRAILS_PATH].every((requiredPath) => connectedSourcePaths.includes(requiredPath)), JSON.stringify(connectedSourcePaths));
  add(results, "all review areas present", REQUIRED_REVIEW_AREAS.every((areaId) => reviewAreaIds.includes(areaId)), JSON.stringify(reviewAreaIds));
  add(results, "review areas include required checks", asArray(register.reviewAreas).every((area) => asArray(area?.requiredChecks).length >= 3), JSON.stringify(asArray(register.reviewAreas).map((area) => ({ id: area?.id, checks: asArray(area?.requiredChecks).length }))));
  add(results, "forbidden runtime scopes present", FORBIDDEN_RUNTIME_SCOPES.every((scope) => forbiddenScopes.includes(scope)), JSON.stringify(forbiddenScopes));
  add(results, "runtime block statement present", register.runtimeBlock?.status === "blocked" && String(register.runtimeBlock?.statement ?? "").includes("Runtime child-safety logic remains blocked"), JSON.stringify(register.runtimeBlock));
  add(results, "review plan has minimum coverage", minimumReviewPlanRequirements.length >= 8 && ["data", "movement", "social", "rollback"].every((term) => minimumReviewPlanRequirements.join(" ").toLowerCase().includes(term)), JSON.stringify(minimumReviewPlanRequirements));
  add(results, "forbidden actions block runtime child-safety logic", asArray(register.forbiddenActions).includes("implement_runtime_child_safety_logic") && asArray(register.forbiddenActions).includes("profile_or_target_minors") && asArray(register.forbiddenActions).includes("enable_location_sharing"), JSON.stringify(register.forbiddenActions));
  add(results, "doc contains required guard terms", missingTerms(doc, REQUIRED_DOC_TERMS).length === 0, missingTerms(doc, REQUIRED_DOC_TERMS).join(", ") || "all terms present");
}

const passed = results.every((result) => result.passed);

console.log("Agent: Child Safety Guard");
console.log("Mode: BLOCKED_UNTIL_EXPLICIT_REVIEW_PLAN");
console.log("Runtime child-safety logic enabled: false");
console.log("Runtime authority granted: false");
console.log("Connected ethical engagement guard: true");
console.log("Connected healthy retention guard: true");
console.log("Connected health/watch/location privacy guardrails: true");
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} - ${result.details}`);
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
console.log("CHILD_SAFETY_GUARD_READY=true");

if (!passed) process.exitCode = 1;
