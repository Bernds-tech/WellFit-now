#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, "firestore.rules");
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "firestore-economy-rules-check.md");

const requiredUserBridgeFields = [
  "points",
  "avatar",
  "lastMissionCompletedAt",
  "xp",
  "level",
  "stepsToday",
  "energy",
  "deviceLocation",
];

const requiredSafeProfileFields = [
  "updatedAt",
  "lastLoginAt",
  "profile",
  "settings",
  "consent",
  "inventory",
];

const dailyReadOnlyCollections = [
  "userDailyMissionState",
  "userDailyStreaks",
  "userLevels",
];

const serverOnlyCollections = [
  "missionRewardEvents",
  "missionRewardPreviews",
  "missionCompletionEvaluations",
  "ledgerEvents",
  "auditEvents",
  "userEconomyProjections",
  "pointsSinkEvents",
];

const ownerReadCollections = [
  "missionRewardEvents",
  "missionRewardPreviews",
  "missionCompletionEvaluations",
  "ledgerEvents",
  "auditEvents",
  "userEconomyProjections",
  "pointsSinkEvents",
];

const expectedChecks = [
  "/users/{uid}.profile update -> ALLOW",
  "/users/{uid}.settings update -> ALLOW",
  "/users/{uid}.points update -> ALLOW for the remaining repository-wide MVP bridge",
  "/userDailyMissionState owner read -> ALLOW",
  "/userDailyMissionState create/update/delete -> DENY",
  "/userDailyStreaks create/update/delete -> DENY",
  "/userLevels create/update/delete -> DENY",
  "/missionRewardEvents create -> DENY",
  "/missionRewardPreviews create -> DENY",
  "/missionCompletionEvaluations create -> DENY",
  "/ledgerEvents create -> DENY",
  "/auditEvents create -> DENY",
  "/userEconomyProjections create -> DENY",
  "/pointsSinkEvents create -> DENY",
];

function normalize(text) {
  return text.replace(/\r\n/g, "\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFunctionBody(rules, functionName) {
  const marker = `function ${functionName}()`;
  const markerIndex = rules.indexOf(marker);
  if (markerIndex === -1) return "";

  const start = rules.indexOf("{", markerIndex);
  if (start === -1) return "";

  let depth = 0;
  for (let index = start; index < rules.length; index += 1) {
    const char = rules[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return rules.slice(start + 1, index);
    }
  }

  return "";
}

function getMatchBody(rules, collectionName) {
  const pattern = new RegExp(`match\\s+/${escapeRegExp(collectionName)}/\\{[^}]+\\}\\s*\\{`, "m");
  const match = rules.match(pattern);
  if (!match || typeof match.index !== "number") return "";

  const start = match.index + match[0].length - 1;
  let depth = 0;
  for (let index = start; index < rules.length; index += 1) {
    const char = rules[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return rules.slice(start + 1, index);
    }
  }

  return "";
}

function hasQuotedField(body, field) {
  return new RegExp(`["']${escapeRegExp(field)}["']`).test(body);
}

function addCheck(checks, name, passed, details) {
  checks.push({ name, passed, details });
}

function renderChecks(checks) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...checks.map((check) => `| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${check.details} |`),
  ].join("\n");
}

function main() {
  if (!fs.existsSync(RULES_PATH)) {
    console.error("firestore.rules not found.");
    process.exit(1);
  }

  const rules = normalize(fs.readFileSync(RULES_PATH, "utf8"));
  const checks = [];

  addCheck(checks, "Rules version is v2", /rules_version\s*=\s*['"]2['"]\s*;/.test(rules), "rules_version = '2'");
  addCheck(checks, "Default deny fallback exists", /match\s+\/\{document=\*\*\}\s*\{[\s\S]*allow\s+read\s*,\s*write\s*:\s*if\s+false\s*;[\s\S]*\}/.test(rules), "match /{document=**} denies read/write");

  const safeProfileBody = getFunctionBody(rules, "hasOnlySafeUserProfileKeys");
  addCheck(checks, "Safe profile helper exists", safeProfileBody.length > 0, "hasOnlySafeUserProfileKeys()");
  for (const field of requiredSafeProfileFields) {
    addCheck(checks, `Safe profile field '${field}' allowed`, hasQuotedField(safeProfileBody, field), field);
  }

  const temporaryBridgeBody = getFunctionBody(rules, "hasOnlyTemporaryEconomyBridgeKeys");
  addCheck(checks, "Temporary economy bridge helper exists", temporaryBridgeBody.length > 0, "hasOnlyTemporaryEconomyBridgeKeys()");
  for (const field of requiredUserBridgeFields) {
    addCheck(checks, `Temporary economy bridge field '${field}' still allowed`, hasQuotedField(temporaryBridgeBody, field), field);
  }

  const userBody = getMatchBody(rules, "users");
  addCheck(checks, "User documents remain owner-readable", /allow\s+read\s*:\s*if\s+isOwner\(userId\)\s*;/.test(userBody), "users/{userId} read owner only");
  addCheck(checks, "User update uses writable-key gate", /allow\s+update\s*:\s*if\s+isOwner\(userId\)\s*&&\s*hasOnlyUserWritableKeys\(\)\s*;/.test(userBody), "profile/settings and remaining MVP bridge only");
  addCheck(checks, "User delete denied", /allow\s+delete\s*:\s*if\s+false\s*;/.test(userBody), "users/{userId} delete denied");

  for (const collectionName of dailyReadOnlyCollections) {
    const body = getMatchBody(rules, collectionName);
    addCheck(checks, `${collectionName} rule exists`, body.length > 0, collectionName);
    addCheck(
      checks,
      `${collectionName} client create/update/delete denied`,
      /allow\s+create\s*,\s*update\s*,\s*delete\s*:\s*if\s+false\s*;/.test(body),
      "allow create, update, delete: if false",
    );
  }

  const dailyMissionStateBody = getMatchBody(rules, "userDailyMissionState");
  addCheck(
    checks,
    "userDailyMissionState owner read guard present",
    /allow\s+read\s*:\s*if\s+isSignedIn\(\)\s*&&\s*stateId\.matches\(request\.auth\.uid\s*\+\s*'_\.\*'\)\s*;/.test(dailyMissionStateBody),
    "document ID is scoped to authenticated owner",
  );
  for (const collectionName of ["userDailyStreaks", "userLevels"]) {
    const body = getMatchBody(rules, collectionName);
    addCheck(
      checks,
      `${collectionName} owner read guard present`,
      /allow\s+read\s*:\s*if\s+isOwner\(userId\)\s*;/.test(body),
      "isOwner(userId)",
    );
  }

  for (const collectionName of serverOnlyCollections) {
    const body = getMatchBody(rules, collectionName);
    addCheck(checks, `${collectionName} rule exists`, body.length > 0, collectionName);
    addCheck(
      checks,
      `${collectionName} client create/update/delete denied`,
      /allow\s+create\s*,\s*update\s*,\s*delete\s*:\s*if\s+false\s*;/.test(body),
      "allow create, update, delete: if false",
    );
  }

  for (const collectionName of ownerReadCollections) {
    const body = getMatchBody(rules, collectionName);
    addCheck(
      checks,
      `${collectionName} owner read guard present`,
      /allow\s+read\s*:\s*if\s+isReadableByOwnerUserId\(\)\s*;/.test(body),
      "resource.data.userId == request.auth.uid via helper",
    );
  }

  const passed = checks.every((check) => check.passed);
  const report = `# Firestore Economy Rules Check\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## Scope\n\nThis static WellFit guardrail verifies the current staged hardening posture. Safe user profile keys and the remaining repository-wide users economy bridge stay separated. The legacy daily mission state, streak and level collections are owner-readable but client read-only after the daily mission callable migration. Server-authority economy collections continue to deny client create/update/delete writes.\n\n## Expected Beta Allow/Deny Cases\n\n${expectedChecks.map((item) => `- ${item}`).join("\n")}\n\n## Checks\n\n${renderChecks(checks)}\n\n## Important Limits\n\n- This check does not replace Firebase Emulator tests.\n- It does not yet remove the broader temporary points, XP, level or avatar fields from users/{userId}; unrelated consumers must migrate first.\n- It must stay aligned with \`docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md\`.\n- No token, NFT, payout, purchase or blockchain function is activated by this check.\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log(`Firestore economy rules check: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  for (const check of checks) {
    console.log(`${check.passed ? "OK" : "FAIL"}: ${check.name} (${check.details})`);
  }

  if (!passed) process.exit(1);
}

main();
