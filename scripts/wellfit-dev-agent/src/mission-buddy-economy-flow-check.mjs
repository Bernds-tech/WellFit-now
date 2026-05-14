#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FLOW_PATH = path.join(ROOT, "project-register", "mission-buddy-economy-flow.json");
const FEATURES_PATH = path.join(ROOT, "project-register", "features.json");
const APIS_PATH = path.join(ROOT, "project-register", "apis.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "mission-buddy-economy-flow-check.md");

const REQUIRED_FLOWS = [
  "FLOW-MISSION-COMPLETE-PREVIEW",
  "FLOW-BUDDY-SYNC-PREVIEW",
  "FLOW-POINTS-SHOP-SPEND-PREVIEW",
  "FLOW-DASHBOARD-PROJECTION"
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function asSet(items) {
  return new Set(items);
}

function main() {
  const issues = [];
  const warnings = [];

  for (const file of [FLOW_PATH, FEATURES_PATH, APIS_PATH]) {
    if (!fs.existsSync(file)) issues.push(`Missing ${path.relative(ROOT, file)}`);
  }

  if (issues.length === 0) {
    const flowMap = readJson(FLOW_PATH);
    const features = readJson(FEATURES_PATH);
    const apis = readJson(APIS_PATH);
    const featureIds = asSet((features.features ?? []).map((item) => item.id));
    const apiRoutes = asSet((apis.apiRoutes ?? []).map((item) => typeof item === "string" ? item : item.route));
    const flows = flowMap.flows ?? [];
    const flowIds = asSet(flows.map((flow) => flow.id));

    if (flowMap.authorityRules?.frontendMayFinalizeRewards !== false) issues.push("frontendMayFinalizeRewards must be false");
    if (flowMap.authorityRules?.frontendMayFinalizeMissionCompletion !== false) issues.push("frontendMayFinalizeMissionCompletion must be false");
    if (flowMap.authorityRules?.buddyMayAuthorizeRewards !== false) issues.push("buddyMayAuthorizeRewards must be false");
    if (flowMap.authorityRules?.serverLedgerRequiredForFinalAuthority !== true) issues.push("serverLedgerRequiredForFinalAuthority must be true");

    for (const required of REQUIRED_FLOWS) {
      if (!flowIds.has(required)) issues.push(`Missing required flow ${required}`);
    }

    for (const flow of flows) {
      if (!featureIds.has(flow.sourceFeature)) issues.push(`${flow.id} references missing feature ${flow.sourceFeature}`);
      if (!flow.serverAuthorityRequired) issues.push(`${flow.id} must require server authority`);
      if (!String(flow.authority ?? "").includes("preview") && !String(flow.authority ?? "").includes("suggestion") && !String(flow.authority ?? "").includes("projection")) {
        warnings.push(`${flow.id} authority should be preview/suggestion/projection-oriented: ${flow.authority}`);
      }
      for (const api of flow.apis ?? []) {
        if (!apiRoutes.has(api)) issues.push(`${flow.id} references missing API ${api}`);
      }
      const forbidden = new Set(flow.forbidden ?? []);
      for (const forbiddenTerm of ["cashout", "token-transfer", "nft-purchase", "final-client-reward"]) {
        if (["FLOW-MISSION-COMPLETE-PREVIEW", "FLOW-POINTS-SHOP-SPEND-PREVIEW"].includes(flow.id) && !forbidden.has(forbiddenTerm) && forbiddenTerm !== "token-transfer") {
          warnings.push(`${flow.id} does not explicitly forbid ${forbiddenTerm}`);
        }
      }
    }
  }

  const passed = issues.length === 0;
  const report = [
    "# Mission / Buddy / Economy Flow Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "This check validates the machine-readable Mission -> Buddy -> Economy flow map. It does not modify product logic, APIs, Firestore rules or user data.",
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
    "- Final reward and mission completion authority must not be in the frontend.",
    "- Buddy must not authorize rewards.",
    "- Final authority requires server-ledger/projection path.",
    "- All referenced APIs and features must exist in project-register."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit Mission/Buddy/Economy flow check complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (issues.length) for (const item of issues) console.log(`- ${item}`);
  if (!passed) process.exit(1);
}

main();
