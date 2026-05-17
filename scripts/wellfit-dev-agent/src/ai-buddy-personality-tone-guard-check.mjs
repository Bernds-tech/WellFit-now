#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENTRY_ID = "ai-buddy-personality-tone-guard";
const REGISTER_PATH = "project-register/ai-buddy-personality-tone-guard.json";
const DOC_PATH = "docs/architecture/WELLFIT_AI_BUDDY_PERSONALITY_TONE_GUARD.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs";
const CATALOG_PATH = "project-register/agent-catalog.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const WORK_LOG_PATH = "project-register/agent-work-log.json";
const REQUIRED_PATHS = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH, CATALOG_PATH, BACKLOG_PATH, WORK_LOG_PATH];

const REQUIRED_CONNECTED_REGISTERS = [
  "project-register/ethical-engagement-guard.json",
  "project-register/healthy-retention-agent.json",
  "project-register/human-motivation-engine.json"
];

const REQUIRED_REVIEW_SURFACES = [
  "app/buddy/**",
  "app/api/buddy-ki/route.ts"
];

const REQUIRED_ALLOWED_TONE_LABELS = [
  "neugierig",
  "unterstützend",
  "spielerisch",
  "respektvoll",
  "recovery-freundlich",
  "kindgerecht nur nach separater Child-Safety-Prüfung"
];

const REQUIRED_FORBIDDEN_TONE_LABELS = [
  "Scham",
  "Druck",
  "Suchtmechanik",
  "medizinische Diagnose",
  "finanzielle Versprechen",
  "manipulative Retention"
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

function missingItems(actualItems, expectedItems) {
  return expectedItems.filter((item) => !actualItems.includes(item));
}

function missingTextTerms(text, terms) {
  const lower = text.toLowerCase();
  return terms.filter((term) => !lower.includes(term.toLowerCase()));
}

function toneLabels(toneItems) {
  return asArray(toneItems)
    .map((tone) => tone?.label)
    .filter(Boolean);
}

const results = [];
for (const filePath of REQUIRED_PATHS) add(results, `exists: ${filePath}`, exists(filePath), filePath);
for (const filePath of [...REQUIRED_CONNECTED_REGISTERS, "app/api/buddy-ki/route.ts"]) {
  add(results, `connected file exists: ${filePath}`, exists(filePath), filePath);
}
add(results, "connected app/buddy directory exists", exists("app/buddy"), "app/buddy");

if (results.every((result) => result.passed)) {
  const register = readJson(REGISTER_PATH);
  const doc = readText(DOC_PATH);
  const catalog = readJson(CATALOG_PATH);
  const backlog = readJson(BACKLOG_PATH);
  const workLog = readJson(WORK_LOG_PATH);
  const catalogEntry = asArray(catalog.entries).find((entry) => entry?.id === ENTRY_ID);
  const backlogEntry = asArray(backlog.entries).find((entry) => entry?.id === ENTRY_ID);
  const workLogEntry = asArray(workLog.entries).find((entry) => entry?.taskId === `APPROVED-AGENT-PLANNING-${ENTRY_ID}`);
  const allowedToneLabels = toneLabels(register.tonePolicy?.allowedTones);
  const forbiddenToneLabels = toneLabels(register.tonePolicy?.forbiddenTones);
  const missingAllowedToneLabels = missingItems(allowedToneLabels, REQUIRED_ALLOWED_TONE_LABELS);
  const missingForbiddenToneLabels = missingItems(forbiddenToneLabels, REQUIRED_FORBIDDEN_TONE_LABELS);
  const missingConnectedRegisters = missingItems(asArray(register.connectedRegisters), REQUIRED_CONNECTED_REGISTERS);
  const missingReviewSurfaces = missingItems(asArray(register.connectedRuntimeSurfacesForReviewOnly), REQUIRED_REVIEW_SURFACES);
  const missingDocTerms = missingTextTerms(doc, [
    "report_only",
    "Runtime authority granted: `false`",
    "project-register/ethical-engagement-guard.json",
    "project-register/healthy-retention-agent.json",
    "project-register/human-motivation-engine.json",
    "app/buddy/**",
    "app/api/buddy-ki/route.ts",
    ...REQUIRED_ALLOWED_TONE_LABELS,
    ...REQUIRED_FORBIDDEN_TONE_LABELS,
    "must not change App Runtime",
    "user profiling",
    "Firestore rules",
    "Firebase Functions",
    "UI execution"
  ]);

  add(results, "register id matches", register.id === ENTRY_ID, register.id);
  add(results, "register is report-only", register.activationState === "report_only" && register.executionCapability === "report_only", `${register.activationState} / ${register.executionCapability}`);
  add(results, "runtime authority denied", register.runtimeAuthorityGranted === false && register.requiresHumanApprovalForRuntime === true, JSON.stringify({ runtimeAuthorityGranted: register.runtimeAuthorityGranted, requiresHumanApprovalForRuntime: register.requiresHumanApprovalForRuntime }));
  add(results, "runtime user profiling denied", register.profileUsersAtRuntime === false, String(register.profileUsersAtRuntime));
  add(results, "forbidden runtime scopes present", ["app/**", "functions/**", "firestore.rules", "native/unity/WellFitBuddyAR/**"].every((scope) => asArray(register.forbiddenWriteScopes).includes(scope)), JSON.stringify(register.forbiddenWriteScopes));
  add(results, "artifact paths synchronized", register.artifactSet?.architectureDoc === DOC_PATH && register.artifactSet?.register === REGISTER_PATH && register.artifactSet?.validatorScript === SCRIPT_PATH, JSON.stringify(register.artifactSet));
  add(results, "connected registers present", missingConnectedRegisters.length === 0, missingConnectedRegisters.join(", ") || "all connected registers present");
  add(results, "connected Buddy review surfaces present", missingReviewSurfaces.length === 0, missingReviewSurfaces.join(", ") || "all Buddy review surfaces present");
  add(results, "allowed Buddy tones present", missingAllowedToneLabels.length === 0, missingAllowedToneLabels.join(", ") || "all allowed tones present");
  add(results, "forbidden Buddy tones present", missingForbiddenToneLabels.length === 0, missingForbiddenToneLabels.join(", ") || "all forbidden tones present");
  add(results, "child-safe tone is gated by separate Child-Safety review", allowedToneLabels.includes("kindgerecht nur nach separater Child-Safety-Prüfung") && JSON.stringify(register.tonePolicy).includes("separate Child-Safety-Prüfung"), "child-safe tone remains separately gated");
  add(results, "doc states boundaries and tone policy", missingDocTerms.length === 0, missingDocTerms.join(", ") || "all terms present");
  add(results, "catalog entry present", Boolean(catalogEntry), ENTRY_ID);
  add(results, "catalog entry report-only", catalogEntry?.executionCapability === "report_only" && catalogEntry?.requiresHumanApprovalForRuntime === true, JSON.stringify(catalogEntry ?? null));
  add(results, "catalog artifact paths present", asArray(catalogEntry?.primaryRegisters).includes(REGISTER_PATH) && asArray(catalogEntry?.humanReadableDocs).includes(DOC_PATH) && asArray(catalogEntry?.validationScripts).includes(SCRIPT_PATH), JSON.stringify(catalogEntry ?? null));
  add(results, "backlog entry present", Boolean(backlogEntry), ENTRY_ID);
  add(results, "backlog status in planning/build evidence state", ["approved_for_planning", "in_progress", "built"].includes(backlogEntry?.status), backlogEntry?.status ?? "missing");
  add(results, "backlog required artifact paths present", asArray(backlogEntry?.requiredDocs).includes(DOC_PATH) && asArray(backlogEntry?.requiredRegisters).includes(REGISTER_PATH) && asArray(backlogEntry?.requiredValidationScripts).includes(SCRIPT_PATH), JSON.stringify(backlogEntry ?? null));
  add(results, "work log entry present", Boolean(workLogEntry), ENTRY_ID);
  add(results, "work log records no runtime changes", asArray(workLogEntry?.changedFiles).every((filePath) => !filePath.startsWith("app/") && !filePath.startsWith("components/") && !filePath.startsWith("lib/") && !filePath.startsWith("functions/") && filePath !== "firestore.rules"), JSON.stringify(workLogEntry?.changedFiles ?? []));
}

const passed = results.every((result) => result.passed);
console.log("Agent: AI Buddy Personality & Tone Guard");
console.log("Mode: REPORT_ONLY");
console.log("Never modifies runtime files: true");
console.log("Never profiles users: true");
console.log("Never changes Firestore rules: true");
console.log("Never changes Firebase Functions: true");
console.log("Never executes UI: true");
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} - ${result.details}`);
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
console.log(`AI_BUDDY_PERSONALITY_TONE_GUARD_READY=${passed ? "true" : "false"}`);
if (!passed) process.exitCode = 1;
