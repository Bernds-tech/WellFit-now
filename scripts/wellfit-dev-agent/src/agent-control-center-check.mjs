#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/agent-control-center-report.md";
const CONTROL_CENTER_PATH = "project-register/agent-control-center.json";
const PROPOSALS_PATH = "project-register/agent-proposals.json";
const REQUIRED_PROPOSAL_FIELDS = [
  "id",
  "title",
  "type",
  "status",
  "risk_level",
  "summary",
  "expected_value",
  "affected_areas",
  "allowed_paths",
  "blocked_paths",
  "protected_scopes",
  "requires_human_approval",
  "created_by",
  "next_action",
  "checks_required",
  "can_auto_execute",
  "can_auto_merge",
  "can_auto_deploy"
];
const HIGH_CRITICAL = new Set(["high", "critical"]);
const PROTECTED_PATH_GLOBS = [
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
  "native/**",
  "native/unity/WellFitBuddyAR/**"
];
const REQUIRED_PROTECTED_SCOPE_SIGNALS = [
  "token",
  "wallet",
  "payment",
  "health",
  "child",
  "location",
  "camera",
  "privacy",
  "legal",
  "reward",
  "mission",
  "unity",
  "deploy"
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function normalizePath(filePath) {
  return String(filePath ?? "").replaceAll("\\", "/").replace(/^\.\//u, "");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(glob) {
  const normalized = normalizePath(glob);
  let source = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegExp(char);
    }
  }
  return new RegExp(`${source}$`);
}

function matchesGlob(filePath, glob) {
  return globToRegExp(glob).test(normalizePath(filePath));
}

function changedFiles() {
  const diff = spawnSync("git", ["diff", "--name-only", "HEAD", "--"], { cwd: ROOT, encoding: "utf8", shell: false });
  const untracked = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8", shell: false });
  return [...new Set(`${diff.stdout ?? ""}\n${untracked.stdout ?? ""}`
    .split(/\r?\n/u)
    .map((filePath) => normalizePath(filePath.trim()))
    .filter(Boolean))]
    .sort();
}

function pushResult(results, name, passed, details) {
  results.push({ name, passed, details });
}

function renderResults(results) {
  return ["| Check | Status | Details |", "| --- | --- | --- |", ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details} |`)].join("\n");
}

function main() {
  const results = [];
  const controlExists = fs.existsSync(absolute(CONTROL_CENTER_PATH));
  const proposalsExists = fs.existsSync(absolute(PROPOSALS_PATH));
  pushResult(results, `${CONTROL_CENTER_PATH} exists`, controlExists, controlExists ? "found" : "missing");
  pushResult(results, `${PROPOSALS_PATH} exists`, proposalsExists, proposalsExists ? "found" : "missing");

  const control = controlExists ? readJson(CONTROL_CENTER_PATH) : {};
  const proposals = proposalsExists ? readJson(PROPOSALS_PATH) : { proposals: [] };
  const proposalEntries = asArray(proposals.proposals);

  const missingFields = [];
  const unsafeRisk = [];
  const unsafeMerge = [];
  const unsafeDeploy = [];
  const missingProtectedBlocks = [];

  for (const proposal of proposalEntries) {
    for (const field of REQUIRED_PROPOSAL_FIELDS) {
      if (!(field in proposal)) missingFields.push(`${proposal.id ?? "unknown"}.${field}`);
    }

    const risk = String(proposal.risk_level ?? "").toLowerCase();
    const manualOnly = String(proposal.next_action ?? "").toLowerCase().includes("manual-only");
    if (HIGH_CRITICAL.has(risk) && proposal.can_auto_execute === true && !manualOnly) {
      unsafeRisk.push(`${proposal.id}: ${risk} has can_auto_execute=true`);
    }
    if (proposal.can_auto_merge === true) unsafeMerge.push(proposal.id ?? "unknown");
    if (proposal.can_auto_deploy === true) unsafeDeploy.push(proposal.id ?? "unknown");

    const blockedPaths = asArray(proposal.blocked_paths).join("\n");
    const protectedScopes = asArray(proposal.protected_scopes).join("\n").toLowerCase();
    const hasRuntimeBlocked = /app\/\*\*|components\/\*\*|lib\/\*\*|functions\/\*\*|firestore\.rules|native\/\*\*/iu.test(blockedPaths);
    const hasProtectedScope = protectedScopes.length > 0;
    if (!hasRuntimeBlocked || !hasProtectedScope) missingProtectedBlocks.push(proposal.id ?? "unknown");
  }

  pushResult(results, "Proposal required fields complete", missingFields.length === 0, missingFields.length ? missingFields.join(", ") : "all required fields present");
  pushResult(results, "High/Critical risk is not automatically approved", unsafeRisk.length === 0, unsafeRisk.length ? unsafeRisk.join(", ") : "no high/critical auto-execute violations");
  pushResult(results, "can_auto_merge is never true", unsafeMerge.length === 0, unsafeMerge.length ? unsafeMerge.join(", ") : "all proposals keep can_auto_merge=false");
  pushResult(results, "can_auto_deploy is never true", unsafeDeploy.length === 0, unsafeDeploy.length ? unsafeDeploy.join(", ") : "all proposals keep can_auto_deploy=false");
  pushResult(results, "Protected scopes are blocked in each proposal", missingProtectedBlocks.length === 0, missingProtectedBlocks.length ? missingProtectedBlocks.join(", ") : "blocked paths and protected scopes present");

  const humanApprovalText = JSON.stringify(control.human_approval_required_for ?? []) + JSON.stringify(control.approval_rules ?? []);
  pushResult(results, "Human Approval Gate is documented", /human|owner|approval|freigabe/iu.test(humanApprovalText), "human approval rules present");

  const curiosityText = JSON.stringify(control.controlled_curiosity ?? {}) + JSON.stringify(proposalEntries.filter((proposal) => proposal.type === "research_request"));
  pushResult(results, "Controlled Curiosity is proposal/approval based", /proposal/iu.test(curiosityText) && /approval|approve|freigabe/iu.test(curiosityText), "controlled curiosity proposal flow present");

  const protectedScopeText = asArray(control.protected_scopes).join("\n").toLowerCase();
  const missingProtectedSignals = REQUIRED_PROTECTED_SCOPE_SIGNALS.filter((signal) => !protectedScopeText.includes(signal));
  pushResult(results, "Control Center protected-scope registry is broad enough", missingProtectedSignals.length === 0, missingProtectedSignals.length ? missingProtectedSignals.join(", ") : "required protected-scope signals present");

  const modifiedProtectedFiles = changedFiles().filter((filePath) => PROTECTED_PATH_GLOBS.some((glob) => matchesGlob(filePath, glob)));
  pushResult(results, "This task does not modify runtime/protected files", modifiedProtectedFiles.length === 0, modifiedProtectedFiles.length ? modifiedProtectedFiles.join(", ") : "changed files stay outside runtime/protected paths");

  const passed = results.every((result) => result.passed);
  const report = `# Agent Control Center Check\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${passed ? "PASS" : "FAIL"}\nAGENT_CONTROL_CENTER_READY=${passed ? "true" : "false"}\n\n## Boundaries\n\n- Never modifies runtime files: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never deploys: true\n- Never activates protected scopes: true\n- Human Approval Gate required for protected/high/critical work: true\n- Controlled Curiosity requires proposal/approval flow: true\n\n## Checks\n\n${renderResults(results)}\n`;

  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log(`WellFit Agent Control Center check report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never deploys: true");
  console.log("Never activates protected scopes: true");
  console.log("Human Approval Gate required for protected/high/critical work: true");
  console.log("Controlled Curiosity requires proposal/approval flow: true");
  console.log(`AGENT_CONTROL_CENTER_READY=${passed ? "true" : "false"}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  if (!passed) process.exit(1);
}

main();
