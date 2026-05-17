#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/health-claims-guard.json";
const DOC_PATH = "docs/architecture/WELLFIT_HEALTH_CLAIMS_GUARD.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/health-claims-guard-check.mjs";
const CONNECTED_PATHS = [
  "docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md",
  "project-register/risk-classifier.json",
  "project-register/product-rules.json",
];
const REQUIRED_PATHS = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH, ...CONNECTED_PATHS];
const FORBIDDEN_LABELS = [
  "medizinische Heilversprechen",
  "Diagnose",
  "Therapieersatz",
  "garantierte Gesundheitswirkung",
  "krankheitsbezogene Aussagen ohne Prüfung",
];
const ALLOWED_LABELS = [
  "Bewegung kann unterstützen",
  "Motivation",
  "allgemeines Wohlbefinden",
  "keine medizinische Beratung",
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

function normalize(value) {
  return String(value).toLocaleLowerCase("de-DE");
}

function includesLabel(collection, label) {
  const expected = normalize(label);
  return asArray(collection).some((entry) => normalize(entry?.label ?? entry).includes(expected));
}

function missingTerms(text, terms) {
  const normalized = normalize(text);
  return terms.filter((term) => !normalized.includes(normalize(term)));
}

function add(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

const results = [];
for (const filePath of REQUIRED_PATHS) add(results, `exists: ${filePath}`, exists(filePath), filePath);

if (results.every((result) => result.passed)) {
  const register = readJson(REGISTER_PATH);
  const doc = readText(DOC_PATH);

  add(results, "register id matches", register.id === "health-claims-guard", register.id);
  add(results, "register active", register.status === "active" && register.activationState === "governance_active", `${register.status} / ${register.activationState}`);
  add(results, "runtime authority denied", register.runtimeAuthorityGranted === false, String(register.runtimeAuthorityGranted));
  add(results, "medical-adjacent review required", register.requiresHumanReviewForMedicalAdjacentClaims === true, String(register.requiresHumanReviewForMedicalAdjacentClaims));
  add(results, "critical claim risk", register.claimRiskLevel === "critical", register.claimRiskLevel);

  for (const label of FORBIDDEN_LABELS) {
    add(results, `forbidden claim defined: ${label}`, includesLabel(register.forbiddenClaims, label), JSON.stringify(register.forbiddenClaims ?? []));
  }

  for (const label of ALLOWED_LABELS) {
    add(results, `allowed cautious language defined: ${label}`, includesLabel(register.allowedCautiousLanguage, label), JSON.stringify(register.allowedCautiousLanguage ?? []));
  }

  const connected = asArray(register.connectedGuardrails);
  for (const filePath of CONNECTED_PATHS) {
    add(results, `connected guardrail registered: ${filePath}`, connected.includes(filePath), JSON.stringify(connected));
  }

  add(results, "artifact paths synchronized", register.artifactSet?.architectureDoc === DOC_PATH && register.artifactSet?.register === REGISTER_PATH && register.artifactSet?.validatorScript === SCRIPT_PATH, JSON.stringify(register.artifactSet ?? null));
  add(results, "validator token synchronized", register.validator?.path === SCRIPT_PATH && register.validator?.expectedReadyToken === "HEALTH_CLAIMS_GUARD_READY=true", JSON.stringify(register.validator ?? null));

  const docTerms = [
    ...FORBIDDEN_LABELS,
    ...ALLOWED_LABELS,
    ...CONNECTED_PATHS,
    "review_required",
    "does not provide medical advice",
    "not medical advice",
  ];
  const missing = missingTerms(doc, docTerms);
  add(results, "architecture doc contains required guard terms", missing.length === 0, missing.join(", ") || "all terms present");
}

const passed = results.every((result) => result.passed);
console.log("Agent: WellFit Health Claims Guard");
console.log("Mode: GOVERNANCE_ACTIVE");
console.log("Runtime authority granted: false");
console.log("Medical-adjacent claims require human review: true");
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} - ${result.details}`);
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
console.log("HEALTH_CLAIMS_GUARD_READY=true");
if (!passed) process.exitCode = 1;
