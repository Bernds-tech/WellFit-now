#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, "firestore.rules");
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "firestore-economy-rules-check.md");

const forbiddenUserEconomyFields = [
  "points",
  "avatar",
  "lastMissionCompletedAt",
  "xp",
  "level",
  "stepsToday",
  "energy",
  "deviceLocation",
  "consent",
  "inventory",
];

const requiredSafeProfileFields = [
  "updatedAt",
  "lastLoginAt",
  "profile",
  "settings",
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

const ownerReadCollections = [...serverOnlyCollections];

const expectedChecks = [
  "/users/{uid} owner read -> ALLOW",
  "/users/{uid} client create -> DENY",
  "/users/{uid}.profile update -> ALLOW",
  "/users/{uid}.settings update -> ALLOW",
  "/users/{uid}.lastLoginAt update -> ALLOW",
  "/users/{uid}.points|xp|level|avatar|energy|stepsToday|lastMissionCompletedAt|deviceLocation update -> DENY",
  "/users/{uid}.consent|inventory top-level update -> DENY",
  "/userDailyMissionState owner read -> ALLOW",
  "/userDailyMissionState create/update/delete -> DENY",
  "/userDailyStreaks create/update/delete -> DENY",
  "/userLevels create/update/delete -> DENY",
  "/missionRewardEvents|missionRewardPreviews|missionCompletionEvaluations client writes -> DENY",
  "/ledgerEvents|auditEvents|userEconomyProjections|pointsSinkEvents client writes -> DENY",
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
  for (const field of forbiddenUserEconomyFields) {
    addCheck(checks, `Protected users field '${field}' absent from client allowlist`, !hasQuotedField(safeProfileBody, field), field);
  }

  const temporaryBridgeBody = getFunctionBody(rules, "hasOnlyTemporaryEconomyBridgeKeys");
  addCheck(checks, "Temporary economy bridge helper removed", temporaryBridgeBody.length === 0, "hasOnlyTemporaryEconomyBridgeKeys must not exist");
  const combinedWritableBody = getFunctionBody(rules, "hasOnlyUserWritableKeys");
  addCheck(checks, "Combined bridge helper removed", combinedWritableBody.length === 0, "hasOnlyUserWritableKeys must not exist");

  const userBody = getMatchBody(rules, "users");
  addCheck(checks, "User documents remain owner-readable", /allow\s+read\s*:\s*if\s+isOwner\(userId\)\s*;/.test(userBody), "users/{userId} read owner only");
  addCheck(checks, "User client create denied", /allow\s+create\s*:\s*if\s+false\s*;/.test(userBody), "users/{userId} creation uses server authority");
  addCheck(checks, "User update uses safe profile gate only", /allow\s+update\s*:\s*if\s+isOwner\(userId\)\s*&&\s*hasOnlySafeUserProfileKeys\(\)\s*;/.test(userBody), "profile/settings/activity timestamps only");
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
  const report = `# Firestore Economy Rules Check\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## Scope\n\nThis static WellFit guard verifies the post-migration posture. Client creation of users/{userId} is denied. Only non-authoritative profile/settings maps and activity timestamps remain owner-writable. Points, XP, level, Buddy/avatar, steps, energy, device location, consent, inventory, mission completion and protected economy collections remain server-authoritative.\n\n## Expected Beta Allow/Deny Cases\n\n${expectedChecks.map((item) => `- ${item}`).join("\n")}\n\n## Checks\n\n${renderChecks(checks)}\n\n## Important Limits\n\n- This static check does not replace Firebase Emulator tests.\n- It does not prove production deployment, real-device behavior, legal approval or penetration-test readiness.\n- Health, consent and account-lifecycle writes require dedicated server-authority work beyond this economy bridge removal.\n- No token, NFT, payout, purchase, real-money or blockchain function is activated by this check.\n`;

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
