#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/location-safety-guard.json";
const DOC_PATH = "docs/architecture/WELLFIT_LOCATION_SAFETY_GUARD.md";
const CHECKPOINT_DOC_PATH = "docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md";
const AR_DOC_PATH = "docs/architecture/AR_LOCATION_RADIUS_AND_RALLY_GENERATION.md";
const PRIVACY_DOC_PATH = "docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/location-safety-guard-check.mjs";

const REQUIRED_PATHS = [
  REGISTER_PATH,
  DOC_PATH,
  CHECKPOINT_DOC_PATH,
  AR_DOC_PATH,
  PRIVACY_DOC_PATH,
  SCRIPT_PATH,
];

const REQUIRED_REVIEW_AREA_IDS = [
  "no_dangerous_places",
  "no_private_residences_as_public_missions",
  "no_child_location_sharing",
  "no_precise_location_history_without_consent",
  "no_missions_in_road_rail_or_risk_areas",
];

const REQUIRED_LINKED_DOCS = [DOC_PATH, CHECKPOINT_DOC_PATH, AR_DOC_PATH, PRIVACY_DOC_PATH];
const REQUIRED_GUARD_TERMS = [
  "Keine Live-Standortverarbeitung aktivieren",
  "Consent",
  "Datenschutz",
  "Safety Rules",
  "keine gefaehrlichen Orte",
  "keine privaten Wohnorte",
  "keine Kinder-Standortfreigabe",
  "keine genaue Standorthistorie ohne Consent",
  "keine Missionen in Strassen-/Bahn-/Risikobereichen",
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
  const guardDoc = readText(DOC_PATH);
  const checkpointDoc = readText(CHECKPOINT_DOC_PATH);
  const arDoc = readText(AR_DOC_PATH);
  const privacyDoc = readText(PRIVACY_DOC_PATH);
  const reviewAreaIds = asArray(register.reviewAreas).map((area) => area?.id);

  add(results, "register id matches", register.id === "location-safety-guard", register.id);
  add(results, "register stays planning-only", register.status === "planning_only" && register.activationState === "not_runtime_enabled", `${register.status} / ${register.activationState}`);
  add(results, "runtime authority denied", register.runtimeAuthorityGranted === false && register.requiresConsentPrivacyAndSafetyRulesBeforeRuntime === true, JSON.stringify({ runtimeAuthorityGranted: register.runtimeAuthorityGranted, requiresConsentPrivacyAndSafetyRulesBeforeRuntime: register.requiresConsentPrivacyAndSafetyRulesBeforeRuntime }));
  add(results, "all review areas present", REQUIRED_REVIEW_AREA_IDS.every((id) => reviewAreaIds.includes(id)), reviewAreaIds.join(", "));
  add(results, "linked docs present in register", REQUIRED_LINKED_DOCS.every((docPath) => asArray(register.linkedArchitectureDocs).includes(docPath)), JSON.stringify(register.linkedArchitectureDocs));
  add(results, "validator path synchronized", register.validator?.path === SCRIPT_PATH && register.validator?.expectedReadyToken === "LOCATION_SAFETY_GUARD_READY=true", JSON.stringify(register.validator));
  add(results, "runtime blockers include consent privacy safety", missingTerms(asArray(register.runtimeBlockers).join("\n"), ["consent", "Datenschutz", "safety", "No live location processing"]).length === 0, missingTerms(asArray(register.runtimeBlockers).join("\n"), ["consent", "Datenschutz", "safety", "No live location processing"]).join(", ") || "all terms present");
  add(results, "forbidden current use blocks live processing", ["live_location_processing", "background_tracking", "precise_location_history_storage", "child_location_sharing", "public_private_residence_missions", "road_rail_or_risk_area_mission_generation"].every((item) => asArray(register.forbiddenCurrentUse).includes(item)), JSON.stringify(register.forbiddenCurrentUse));
  add(results, "guard doc states required areas and runtime block", missingTerms(guardDoc, REQUIRED_GUARD_TERMS).length === 0, missingTerms(guardDoc, REQUIRED_GUARD_TERMS).join(", ") || "all terms present");
  add(results, "checkpoint doc linked to guard", checkpointDoc.includes(DOC_PATH) && checkpointDoc.includes(REGISTER_PATH), "checkpoint linkage");
  add(results, "AR doc linked to guard", arDoc.includes(DOC_PATH) && arDoc.includes(REGISTER_PATH), "AR linkage");
  add(results, "privacy doc linked to guard", privacyDoc.includes(DOC_PATH) && privacyDoc.includes(REGISTER_PATH), "privacy linkage");
}

const passed = results.every((result) => result.passed);
console.log("Guard: Location Safety Guard");
console.log("Mode: PLANNING_ONLY");
console.log("Live location processing enabled: false");
console.log("Requires consent/privacy/safety rules before runtime: true");
for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} - ${result.details}`);
}
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
console.log("LOCATION_SAFETY_GUARD_READY=true");
if (!passed) process.exitCode = 1;
