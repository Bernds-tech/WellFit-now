#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTER = path.join(ROOT, "project-register", "feedback-analytics-loop.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "feedback-loop-audit.md");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
  const issues = [];
  const warnings = [];

  if (!fs.existsSync(REGISTER)) {
    issues.push("Missing project-register/feedback-analytics-loop.json");
  }

  if (issues.length === 0) {
    const register = readJson(REGISTER);
    const rules = register.privacyRules ?? {};
    const signals = register.signals ?? [];
    const loop = register.optimizationLoop ?? [];

    if (rules.trackingCodeActive !== false) issues.push("trackingCodeActive must be false");
    if (rules.requiresConsentBeforeTracking !== true) issues.push("requiresConsentBeforeTracking must be true");
    if (rules.noRealUserDataInAgentReports !== true) issues.push("noRealUserDataInAgentReports must be true");
    if (rules.productionActivationRequiresManualApproval !== true) issues.push("productionActivationRequiresManualApproval must be true");

    for (const id of ["SIGNAL-PAGE-FRICTION", "SIGNAL-UX-FEEDBACK", "SIGNAL-ANALYTICS-FUTURE", "SIGNAL-CLARITY-FUTURE"]) {
      if (!signals.some((signal) => signal.id === id)) issues.push(`Missing signal ${id}`);
    }

    if (loop.length < 5) warnings.push("Optimization loop should contain at least five explicit steps.");
  }

  const passed = issues.length === 0;
  const report = [
    "# Feedback Loop Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "This audit validates the planned feedback and optimization loop. It does not add scripts, cookies or user-data processing.",
    "",
    "## Issues",
    "",
    issues.length ? issues.map((item) => `- ${item}`).join("\n") : "No blocking issues detected.",
    "",
    "## Warnings",
    "",
    warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "No warnings.",
    "",
    "## Required Standard",
    "",
    "- Feedback collection starts with manual preview observations.",
    "- Automated analytics remain consent-gated and require manual approval.",
    "- Agent reports must not contain real user data.",
    "- Production activation requires explicit approval."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit feedback loop audit complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (issues.length) for (const item of issues) console.log(`- ${item}`);
  if (!passed) process.exit(1);
}

main();
