#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FEATURES = path.join(ROOT, "project-register", "features.json");
const APIS = path.join(ROOT, "project-register", "apis.json");
const CROSS = path.join(ROOT, "project-register", "cross-references.json");
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "mission-buddy-economy-audit.md");

const requiredFeatures = [
  "FEATURE-MISSIONS",
  "FEATURE-BUDDY",
  "FEATURE-POINTS-SHOP",
  "FEATURE-ECONOMY-PREVIEW-APIS"
];

const requiredFeatureRules = {
  "FEATURE-MISSIONS": ["no-client-completion-authority", "evidence-before-reward", "no-token-reward"],
  "FEATURE-BUDDY": ["no-reward-authority", "server-provider-only"],
  "FEATURE-POINTS-SHOP": ["internal-points-only", "no-real-purchase", "no-token-transfer"],
  "FEATURE-ECONOMY-PREVIEW-APIS": ["preview-only", "draft-only", "no-final-firestore-write-until-approved"]
};

const requiredApis = [
  "/api/economy/complete-mission",
  "/api/economy/reward-preview",
  "/api/economy/spend-preview",
  "/api/economy/buddy-sync-preview",
  "/api/economy/health-preview",
  "/api/economy/user-projection",
  "/api/economy/persistence-status",
  "/api/buddy-ki"
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listFeatureIds(register) {
  return new Set((register.features ?? []).map((item) => item.id));
}

function findFeature(register, id) {
  return (register.features ?? []).find((item) => item.id === id);
}

function listApiRoutes(register) {
  return new Set((register.apiRoutes ?? []).map((item) => typeof item === "string" ? item : item.route));
}

function apiEntry(register, route) {
  return (register.apiRoutes ?? []).find((item) => (typeof item === "string" ? item : item.route) === route);
}

function hasRule(feature, rule) {
  return (feature.rules ?? []).includes(rule);
}

function main() {
  const issues = [];
  const warnings = [];

  for (const file of [FEATURES, APIS, CROSS]) {
    if (!fs.existsSync(file)) issues.push(`Missing ${path.relative(ROOT, file)}`);
  }

  if (issues.length === 0) {
    const features = readJson(FEATURES);
    const apis = readJson(APIS);
    const cross = readJson(CROSS);
    const featureIds = listFeatureIds(features);
    const apiRoutes = listApiRoutes(apis);

    for (const featureId of requiredFeatures) {
      if (!featureIds.has(featureId)) {
        issues.push(`Missing required feature ${featureId}`);
        continue;
      }
      const feature = findFeature(features, featureId);
      for (const rule of requiredFeatureRules[featureId] ?? []) {
        if (!hasRule(feature, rule)) issues.push(`${featureId} missing rule ${rule}`);
      }
    }

    for (const route of requiredApis) {
      if (!apiRoutes.has(route)) {
        issues.push(`Missing required API ${route}`);
        continue;
      }
      const entry = apiEntry(apis, route);
      const authority = typeof entry === "string" ? "unspecified" : (entry.authority ?? "unspecified");
      if (["/api/economy/reward-preview", "/api/economy/spend-preview", "/api/economy/buddy-sync-preview", "/api/economy/health-preview"].includes(route) && !authority.includes("preview")) {
        issues.push(`${route} must remain preview authority, found ${authority}`);
      }
      if (route === "/api/buddy-ki" && authority !== "suggestion-only") {
        issues.push(`${route} must remain suggestion-only, found ${authority}`);
      }
    }

    const refs = cross.references ?? [];
    const hasMissionCompletionRef = refs.some((ref) => ref.source === "FEATURE-MISSIONS" && String(ref.target).includes("complete-mission"));
    const hasBuddyRef = refs.some((ref) => ref.source === "FEATURE-BUDDY" && String(ref.target).includes("buddy-ki"));
    const hasShopRef = refs.some((ref) => ref.source === "FEATURE-POINTS-SHOP" && String(ref.target).includes("spend-preview"));
    if (!hasMissionCompletionRef) warnings.push("Missing cross-reference FEATURE-MISSIONS -> complete-mission");
    if (!hasBuddyRef) warnings.push("Missing cross-reference FEATURE-BUDDY -> buddy-ki");
    if (!hasShopRef) warnings.push("Missing cross-reference FEATURE-POINTS-SHOP -> spend-preview");
  }

  const passed = issues.length === 0;
  const report = [
    "# Mission / Buddy / Economy Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "This audit validates registry-level authority boundaries for missions, buddy and internal economy preview flows. It does not modify product logic, APIs, Firestore rules or user data.",
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
    "- Missions must not have client-side completion authority.",
    "- Buddy must remain suggestion/guide logic and must not authorize rewards.",
    "- Points shop must remain internal-points-only and no real purchase/transfer.",
    "- Economy APIs must remain preview/draft-only until server ledger authority is implemented."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit Mission/Buddy/Economy audit complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (issues.length) for (const item of issues) console.log(`- ${item}`);
  if (!passed) process.exit(1);
}

main();
