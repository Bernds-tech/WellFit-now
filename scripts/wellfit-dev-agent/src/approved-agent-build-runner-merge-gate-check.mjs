#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER_PATH = "project-register/approved-agent-build-runner-merge-gate.json";
const DOC_PATH = "docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md";
const QUALITY_GATE_PATH = "scripts/wellfit-dev-agent/src/quality-gate.mjs";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/approved-agent-build-runner-merge-gate-check-report.md";

const REQUIRED_TRUE_SIGNALS = [
  "REPORT_ONLY_MERGE_GATE",
  "GATE_CONFIGURATION_READY",
  "MISSING_CHECKS_BLOCK_MERGE",
  "SAFE_REPAIR_LIMITED",
  "NEVER_MERGES",
  "NEVER_DEPLOYS",
  "APPROVED_AGENT_BUILD_RUNNER_MERGE_GATE_READY"
];
const REQUIRED_FALSE_SIGNALS = ["MERGE_READY"];
const REQUIRED_TEXT_REFERENCES = [
  "GATE_CONFIGURATION_READY=true",
  "MERGE_READY=false",
  "MISSING_CHECKS_BLOCK_MERGE=true"
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function add(results, name, passed, details) {
  results.push({ name, passed, details });
}

function renderChecks(checks) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...checks.map((check) => `| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${check.details} |`)
  ].join("\n");
}

function renderReport({ checks, signals }) {
  const gateConfigurationReady = checks.every((check) => check.passed);
  return `# Approved Agent Build Runner Merge Gate Check\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY_MERGE_GATE\nResult: ${gateConfigurationReady ? "PASS" : "FAIL"}\n\n## Semantic Split\n\n- GATE_CONFIGURATION_READY=true means the report-only gate configuration is valid.\n- MERGE_READY=false means this concrete merge is not ready yet; that is expected until required local, post-PR, GitHub check, mergeability, and human-review evidence exists.\n- Missing checks still block actual merge readiness.\n- The validator exits non-zero only when GATE_CONFIGURATION_READY=false.\n\n## Signals\n\n${Object.entries(signals).map(([key, value]) => `- ${key}=${value}`).join("\n")}\n\n## Checks\n\n${renderChecks(checks)}\n`;
}

function main() {
  const checks = [];
  let gate;
  let doc = "";
  let qualityGate = "";

  try {
    gate = readJson(REGISTER_PATH);
    doc = readText(DOC_PATH);
    qualityGate = readText(QUALITY_GATE_PATH);
  } catch (error) {
    console.error(`Failed to read merge-gate inputs: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const signals = gate.signals ?? {};
  add(checks, "register activation is report_only", gate.activationState === "report_only", `activationState=${gate.activationState ?? "missing"}`);
  for (const signal of REQUIRED_TRUE_SIGNALS) add(checks, `${signal}=true`, signals[signal] === true, `${signal}=${signals[signal]}`);
  for (const signal of REQUIRED_FALSE_SIGNALS) add(checks, `${signal}=false`, signals[signal] === false, `${signal}=${signals[signal]}`);
  add(checks, "semantic split documents configuration readiness", /gate configuration readiness/i.test(`${gate.semanticSplit?.gateConfigurationReadyMeaning ?? ""} ${gate.semanticSplit?.expectedReportOnlyState ?? ""}`), "GATE_CONFIGURATION_READY is defined separately from MERGE_READY");
  add(checks, "semantic split documents merge readiness", /concrete pull request/i.test(gate.semanticSplit?.mergeReadyMeaning ?? ""), "MERGE_READY requires concrete PR evidence");
  add(checks, "validator exit rule ignores expected MERGE_READY=false", /exits non-zero only when GATE_CONFIGURATION_READY=false/i.test(gate.semanticSplit?.validatorExitRule ?? ""), gate.semanticSplit?.validatorExitRule ?? "missing");
  add(checks, "missing checks block actual merge readiness", gate.missingCheckHandling?.missingChecksBlockActualMerge === true && gate.signals?.MISSING_CHECKS_BLOCK_MERGE === true, "missing checks remain merge blockers");
  add(checks, "missing checks do not invalidate gate configuration", gate.missingCheckHandling?.missingChecksDoNotInvalidateGateConfiguration === true, "report-only configuration can pass while merge readiness is blocked");
  add(checks, "safe repair remains limited", gate.safeRepairBoundaries?.limited === true && Array.isArray(gate.safeRepairBoundaries?.forbiddenFor) && gate.safeRepairBoundaries.forbiddenFor.length > 0, "limited docs/register/validator repairs only");
  add(checks, "protected runtime scope untouched", gate.protectedScopeConfirmation?.runtimeProductCodeTouched === false && gate.protectedScopeConfirmation?.protectedAreasTouched === false && gate.protectedScopeConfirmation?.unityOrPr13Touched === false, "no runtime/protected/Unity scope in gate semantics");
  add(checks, "architecture doc explains corrected signals", REQUIRED_TEXT_REFERENCES.every((text) => doc.includes(text)), "doc includes GATE_CONFIGURATION_READY=true, MERGE_READY=false, and MISSING_CHECKS_BLOCK_MERGE=true");
  add(checks, "Quality Gate accepts report-only false merge readiness", /approvedAgentBuildRunnerMergeGateReady/.test(qualityGate) && /MERGE_READY=false/i.test(qualityGate) && /GATE_CONFIGURATION_READY=true/i.test(qualityGate), "quality-gate checks the split signals instead of failing on MERGE_READY=false");

  const gateConfigurationReady = checks.every((check) => check.passed);
  const outputSignals = {
    REPORT_ONLY_MERGE_GATE: true,
    GATE_CONFIGURATION_READY: gateConfigurationReady,
    MERGE_READY: false,
    MISSING_CHECKS_BLOCK_MERGE: true,
    SAFE_REPAIR_LIMITED: true,
    NEVER_MERGES: true,
    NEVER_DEPLOYS: true,
    APPROVED_AGENT_BUILD_RUNNER_MERGE_GATE_READY: gateConfigurationReady
  };

  fs.mkdirSync(absolute(path.dirname(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), renderReport({ checks, signals: outputSignals }), "utf8");

  console.log(`Approved Agent Build Runner Merge Gate report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY_MERGE_GATE");
  console.log("Report-only merge gate: true");
  console.log("Never merges: true");
  console.log("Never deploys: true");
  console.log("Missing checks block merge: true");
  console.log("Safe repair limited: true");
  for (const [key, value] of Object.entries(outputSignals)) console.log(`${key}=${value}`);
  if (!gateConfigurationReady) process.exit(1);
}

main();
