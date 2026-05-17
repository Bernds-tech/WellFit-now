#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENTRY_ID = 'reward-fairness-guard-report-agent';
const REGISTER_PATH = "project-register/reward-fairness-guard-report-agent.json";
const DOC_PATH = "docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD_REPORT_AGENT.md";
const SCRIPT_PATH = "scripts/wellfit-dev-agent/src/reward-fairness-guard-report-agent-check.mjs";
const CATALOG_PATH = "project-register/agent-catalog.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const WORK_LOG_PATH = "project-register/agent-work-log.json";
const REQUIRED_PATHS = [REGISTER_PATH, DOC_PATH, SCRIPT_PATH, CATALOG_PATH, BACKLOG_PATH, WORK_LOG_PATH];

function absolute(relativePath) { return path.join(ROOT, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), "utf8"); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function add(results, name, passed, details) { results.push({ name, passed, details: String(details) }); }
function includesAll(text, terms) { const lower = text.toLowerCase(); return terms.filter((term) => !lower.includes(term.toLowerCase())); }

const results = [];
for (const filePath of REQUIRED_PATHS) add(results, `exists: ${filePath}`, exists(filePath), filePath);

if (results.every((result) => result.passed)) {
  const register = readJson(REGISTER_PATH);
  const doc = readText(DOC_PATH);
  const catalog = readJson(CATALOG_PATH);
  const backlog = readJson(BACKLOG_PATH);
  const workLog = readJson(WORK_LOG_PATH);
  const catalogEntry = asArray(catalog.entries).find((entry) => entry?.id === ENTRY_ID);
  const backlogEntry = asArray(backlog.entries).find((entry) => entry?.id === ENTRY_ID);
  const workLogEntry = asArray(workLog.entries).find((entry) => entry?.taskId === `APPROVED-AGENT-PLANNING-${ENTRY_ID}`);

  add(results, "register id matches", register.id === ENTRY_ID, register.id);
  add(results, "register is report-only", register.activationState === "report_only" && register.executionCapability === "report_only", `${register.activationState} / ${register.executionCapability}`);
  add(results, "runtime authority denied", register.runtimeAuthorityGranted === false && register.requiresHumanApprovalForRuntime === true, JSON.stringify({ runtimeAuthorityGranted: register.runtimeAuthorityGranted, requiresHumanApprovalForRuntime: register.requiresHumanApprovalForRuntime }));
  add(results, "runtime user profiling denied", register.profileUsersAtRuntime === false, String(register.profileUsersAtRuntime));
  add(results, "forbidden runtime scopes present", ["app/**", "functions/**", "firestore.rules", "native/unity/WellFitBuddyAR/**"].every((scope) => asArray(register.forbiddenWriteScopes).includes(scope)), JSON.stringify(register.forbiddenWriteScopes));
  add(results, "artifact paths synchronized", register.artifactSet?.architectureDoc === DOC_PATH && register.artifactSet?.register === REGISTER_PATH && register.artifactSet?.validatorScript === SCRIPT_PATH, JSON.stringify(register.artifactSet));
  add(results, "doc states boundaries", includesAll(doc, ["report_only", "Runtime authority granted: `false`", "must not change App Runtime", "user profiling", "Firestore rules", "Firebase Functions", "UI execution"]).length === 0, includesAll(doc, ["report_only", "Runtime authority granted: `false`", "must not change App Runtime", "user profiling", "Firestore rules", "Firebase Functions", "UI execution"]).join(", ") || "all terms present");
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
console.log(`Agent: Reward Fairness Guard Report Agent`);
console.log("Mode: REPORT_ONLY");
console.log("Never modifies runtime files: true");
console.log("Never profiles users: true");
console.log("Never changes Firestore rules: true");
console.log("Never changes Firebase Functions: true");
console.log("Never executes UI: true");
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} - ${result.details}`);
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
console.log("REWARD_FAIRNESS_GUARD_REPORT_AGENT_READY=true");
if (!passed) process.exitCode = 1;
