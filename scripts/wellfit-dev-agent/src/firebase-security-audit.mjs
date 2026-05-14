#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, "firestore.rules");
const OUTPUT_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "firebase-security-audit.md");

const REQUIRED_SERVER_ONLY_COLLECTIONS = [
  "ledgerEvents",
  "auditEvents",
  "userEconomyProjections",
  "pointsSinkEvents",
  "missionRewardEvents",
  "missionRewardPreviews",
  "missionCompletionEvaluations",
  "missionEvidenceReviews",
  "trackingProofEvents"
];

const EXPECTED_TEMPORARY_BRIDGES = [
  "hasOnlyTemporaryEconomyBridgeKeys",
  "userDailyMissionState",
  "userDailyStreaks",
  "userLevels"
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function hasCollectionBlock(rules, collection) {
  return rules.includes(`match /${collection}/`);
}

function collectionHasClientWriteDenied(rules, collection) {
  const pattern = new RegExp(`match \\/${collection}\\/\\{[^}]+\\} \\{([\\s\\S]*?)\\n\\s*\\}`, "u");
  const match = rules.match(pattern);
  if (!match) return false;
  return /allow create, update, delete:\s*if false;/u.test(match[1]) || /allow read, write:\s*if false;/u.test(match[1]);
}

function lineOf(rules, term) {
  const lines = rules.split(/\r?\n/u);
  const index = lines.findIndex((line) => line.includes(term));
  return index >= 0 ? index + 1 : null;
}

function main() {
  if (!fs.existsSync(RULES_PATH)) throw new Error("Missing firestore.rules");
  const rules = read(RULES_PATH);
  const issues = [];
  const warnings = [];
  const notes = [];

  for (const collection of REQUIRED_SERVER_ONLY_COLLECTIONS) {
    if (!hasCollectionBlock(rules, collection)) {
      issues.push(`Missing rule block for ${collection}`);
      continue;
    }
    if (!collectionHasClientWriteDenied(rules, collection)) {
      issues.push(`${collection} does not clearly deny client create/update/delete`);
    }
  }

  for (const bridge of EXPECTED_TEMPORARY_BRIDGES) {
    if (rules.includes(bridge)) {
      warnings.push(`Temporary MVP bridge present: ${bridge} at line ${lineOf(rules, bridge) ?? "unknown"}`);
    } else {
      notes.push(`Temporary bridge not found: ${bridge}`);
    }
  }

  const fallbackDeny = /match \/\{document=\*\*\}\s*\{\s*allow read, write:\s*if false;/su.test(rules);
  if (!fallbackDeny) issues.push("Missing final catch-all deny rule");

  const signedInHelper = rules.includes("function isSignedIn()");
  const ownerHelper = rules.includes("function isOwner(userId)");
  if (!signedInHelper) issues.push("Missing isSignedIn helper");
  if (!ownerHelper) issues.push("Missing isOwner helper");

  const passed = issues.length === 0;
  const report = [
    "# Firebase / Firestore Security Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "This audit is static only. It does not deploy rules, does not access Firebase, and does not read or write user data.",
    "",
    "## Issues",
    "",
    issues.length ? issues.map((item) => `- ${item}`).join("\n") : "No blocking issues detected.",
    "",
    "## Warnings / Temporary MVP Bridges",
    "",
    warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "No temporary bridge warnings detected.",
    "",
    "## Notes",
    "",
    notes.length ? notes.map((item) => `- ${item}`).join("\n") : "No notes.",
    "",
    "## Required Standard",
    "",
    "- Ledger, audit, reward, proof and projection collections must deny client create/update/delete.",
    "- Temporary MVP bridge rules must be visible and documented until server authority replaces them.",
    "- A final catch-all deny rule must exist.",
    "- This check must not change firestore.rules by itself."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log(`WellFit Firebase security audit complete: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (issues.length) {
    console.log("Issues:");
    for (const item of issues) console.log(`- ${item}`);
  }
  if (warnings.length) {
    console.log("Warnings:");
    for (const item of warnings) console.log(`- ${item}`);
  }

  if (!passed) process.exit(1);
}

main();
