#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, "project-register", "product-readiness.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "product-readiness-check.md");

const REQUIRED_MODULE_IDS = [
  "landing_public_website",
  "registration_login",
  "dashboard",
  "missionen",
  "tagesmissionen",
  "wochenmissionen",
  "abenteuer",
  "wettkaempfe_pvp",
  "buddy_ki_buddy",
  "mobile_web",
  "mobile_ar_fallback",
  "unity_wellfitbuddyar",
  "economy_preview_internal_points",
  "points_shop",
  "marketplace",
  "leaderboard",
  "analytics",
  "user_feedback",
  "firebase_backend_firestore",
  "legal_privacy_compliance",
  "agent_governance"
];

const ALLOWED_STATUSES = new Set([
  "not_started",
  "concept_only",
  "planned",
  "prototype",
  "active_beta",
  "blocked",
  "review_required",
  "production_ready"
]);

const ALLOWED_RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);
const CRITICAL_SENSITIVE_MODULE_IDS = new Set([
  "wettkaempfe_pvp",
  "economy_preview_internal_points",
  "points_shop",
  "marketplace",
  "firebase_backend_firestore",
  "legal_privacy_compliance"
]);
const TOKEN_WALLET_PAYMENT_REWARD_AUTHORITY_MODULE_IDS = new Set([
  "wettkaempfe_pvp",
  "economy_preview_internal_points",
  "points_shop",
  "marketplace",
  "firebase_backend_firestore"
]);

function exists(filePath) {
  return fs.existsSync(filePath);
}

function rel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function readRegister(results) {
  if (!exists(REGISTER_PATH)) {
    results.push({ name: "project-register/product-readiness.json exists", passed: false, details: "missing" });
    return null;
  }

  results.push({ name: "project-register/product-readiness.json exists", passed: true, details: "found" });
  try {
    const data = JSON.parse(fs.readFileSync(REGISTER_PATH, "utf8"));
    results.push({ name: "product-readiness.json parses", passed: true, details: "valid JSON" });
    return data;
  } catch (error) {
    results.push({ name: "product-readiness.json parses", passed: false, details: error.message });
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details });
}

function moduleLabel(readinessModule) {
  return readinessModule?.id ?? "unknown-module";
}

function validateTopLevel(results, data) {
  addResult(results, "version is present", hasNonEmptyString(data?.version), data?.version ?? "missing");
  addResult(results, "updated date is present", hasNonEmptyString(data?.updated), data?.updated ?? "missing");
  addResult(results, "purpose is present", hasNonEmptyString(data?.purpose), hasNonEmptyString(data?.purpose) ? "present" : "missing");
  addResult(results, "status scale contains all allowed statuses", REQUIRED_MODULE_IDS.length > 0 && [...ALLOWED_STATUSES].every((status) => hasNonEmptyString(data?.status_scale?.[status])), "required statuses: " + [...ALLOWED_STATUSES].join(", "));
  addResult(results, "modules array is present", Array.isArray(data?.modules), Array.isArray(data?.modules) ? `${data.modules.length} modules` : "missing");
}

function validateRequiredModules(results, modulesById) {
  const missing = REQUIRED_MODULE_IDS.filter((id) => !modulesById.has(id));
  addResult(results, "all required modules exist", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_MODULE_IDS.length}/${REQUIRED_MODULE_IDS.length} found`);
}

function validateModuleShape(results, readinessModule) {
  const label = moduleLabel(readinessModule);
  addResult(results, `${label} has allowed status`, ALLOWED_STATUSES.has(readinessModule?.status), readinessModule?.status ?? "missing");
  addResult(results, `${label} has risk level`, ALLOWED_RISK_LEVELS.has(readinessModule?.risk_level), readinessModule?.risk_level ?? "missing");
  addResult(results, `${label} has leading files`, hasNonEmptyArray(readinessModule?.leading_files), hasNonEmptyArray(readinessModule?.leading_files) ? `${readinessModule.leading_files.length} files` : "missing");
  addResult(results, `${label} has next safe task`, hasNonEmptyString(readinessModule?.next_safe_task), hasNonEmptyString(readinessModule?.next_safe_task) ? "present" : "missing");
  addResult(results, `${label} has required checks`, hasNonEmptyArray(readinessModule?.required_checks_before_status_can_advance), hasNonEmptyArray(readinessModule?.required_checks_before_status_can_advance) ? `${readinessModule.required_checks_before_status_can_advance.length} checks` : "missing");
  addResult(results, `${label} has do-not-duplicate warning`, hasNonEmptyString(readinessModule?.do_not_duplicate_warning), hasNonEmptyString(readinessModule?.do_not_duplicate_warning) ? "present" : "missing");
  addResult(results, `${label} has blockers array`, Array.isArray(readinessModule?.current_blockers), Array.isArray(readinessModule?.current_blockers) ? `${readinessModule.current_blockers.length} blockers` : "missing");
}

function validateSafetyStatus(results, modules) {
  const criticalProductionReady = modules
    .filter((readinessModule) => readinessModule?.risk_level === "critical" && readinessModule?.status === "production_ready")
    .map((readinessModule) => readinessModule.id);
  addResult(results, "no critical module is production_ready", criticalProductionReady.length === 0, criticalProductionReady.length ? `critical production_ready: ${criticalProductionReady.join(", ")}` : "none");

  const sensitiveProductionReady = modules
    .filter((readinessModule) => (CRITICAL_SENSITIVE_MODULE_IDS.has(readinessModule?.id) || TOKEN_WALLET_PAYMENT_REWARD_AUTHORITY_MODULE_IDS.has(readinessModule?.id)) && readinessModule?.status === "production_ready")
    .map((readinessModule) => readinessModule.id);
  addResult(results, "token/wallet/payment/reward-authority areas are not production_ready", sensitiveProductionReady.length === 0, sensitiveProductionReady.length ? `sensitive production_ready: ${sensitiveProductionReady.join(", ")}` : "none");

  const unityModule = modules.find((readinessModule) => readinessModule?.id === "unity_wellfitbuddyar");
  const unityProtected = unityModule && ["blocked", "review_required"].includes(unityModule.status) && unityModule.human_approval_required === true;
  addResult(results, "Unity/PR #13 remains blocked or review-required", Boolean(unityProtected), unityModule ? `status=${unityModule.status}; human_approval_required=${unityModule.human_approval_required}` : "missing");

  const namedSensitiveProductionReady = modules
    .filter((readinessModule) => readinessModule?.status === "production_ready")
    .filter((readinessModule) => /token|wallet|payment|reward.authority|nft|marketplace|pvp|wettkaempfe|points.shop|economy/iu.test(`${readinessModule.id} ${readinessModule.name} ${readinessModule.do_not_duplicate_warning}`))
    .map((readinessModule) => readinessModule.id);
  addResult(results, "named token/wallet/payment/NFT/PvP/economy modules are not production_ready", namedSensitiveProductionReady.length === 0, namedSensitiveProductionReady.length ? namedSensitiveProductionReady.join(", ") : "none");
}

function validateReferencedLeadingFiles(results, modules) {
  const missing = [];
  for (const readinessModule of modules) {
    for (const leadingFile of asArray(readinessModule?.leading_files)) {
      const absolutePath = path.join(ROOT, leadingFile);
      if (!exists(absolutePath)) missing.push(`${readinessModule.id}: ${leadingFile}`);
    }
  }
  addResult(results, "leading files resolve in repository", missing.length === 0, missing.length ? `missing: ${missing.join("; ")}` : "all found");
}

function renderResults(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${String(result.details).replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function writeReport(results) {
  const passed = results.every((result) => result.passed);
  const report = [
    "# Product Readiness Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    renderResults(results),
    "",
    "## Rule",
    "",
    "The WellFit product readiness matrix must remain machine-readable, include all required modules, keep critical/sensitive modules out of production_ready, and keep Unity/PR #13 blocked or review-required until explicit human approval."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");
}

function main() {
  const results = [];
  const data = readRegister(results);
  if (data) {
    validateTopLevel(results, data);
    const modules = asArray(data.modules);
    const modulesById = new Map(modules.map((readinessModule) => [readinessModule?.id, readinessModule]));
    validateRequiredModules(results, modulesById);
    for (const readinessModule of modules) validateModuleShape(results, readinessModule);
    validateSafetyStatus(results, modules);
    validateReferencedLeadingFiles(results, modules);
  }

  writeReport(results);
  const passed = results.every((result) => result.passed);
  console.log(`WellFit product readiness check complete: ${rel(OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  for (const result of results) console.log(`${result.passed ? "OK" : "FAIL"}: ${result.name} (${result.details})`);
  if (!passed) process.exit(1);
}

main();
