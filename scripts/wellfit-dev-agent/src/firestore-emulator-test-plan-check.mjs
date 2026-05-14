#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "firestore-emulator-test-plan-check.md");

const REQUIRED_DOCS = [
  "docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md",
  "docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md",
  "docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md"
];

const REQUIRED_TOPICS = [
  {
    id: "user-isolation",
    alternatives: [
      ["User A", "User B"],
      ["other user", "owner profile"]
    ]
  },
  { id: "deny-client-points-write", terms: ["points", "client"] },
  { id: "deny-client-xp-write", terms: ["XP", "client"] },
  { id: "reward-guardrails", terms: ["reward", "guardrail"] },
  { id: "ledger-path", terms: ["ledger", "server"] },
  { id: "emulator", terms: ["emulator"] },
  { id: "projection", terms: ["projection"] }
];

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function containsAll(haystack, terms) {
  const lower = haystack.toLowerCase();
  return terms.every((term) => lower.includes(term.toLowerCase()));
}

function topicCovered(haystack, topic) {
  if (topic.terms) return containsAll(haystack, topic.terms);
  return (topic.alternatives ?? []).some((terms) => containsAll(haystack, terms));
}

function topicNeedText(topic) {
  if (topic.terms) return topic.terms.join(", ");
  return (topic.alternatives ?? []).map((terms) => `[${terms.join(", ")}]`).join(" OR ");
}

function main() {
  const missingDocs = REQUIRED_DOCS.filter((file) => !exists(file));
  const combined = REQUIRED_DOCS.filter(exists).map(read).join("\n\n---\n\n");
  const missingTopics = REQUIRED_TOPICS.filter((topic) => !topicCovered(combined, topic));
  const passed = missingDocs.length === 0 && missingTopics.length === 0;

  const report = [
    "# Firestore Emulator Test Plan Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    "This check validates that the Firestore economy hardening/emulator test plan covers the required security topics. It does not start emulators, does not deploy rules, and does not access user data.",
    "",
    "## Required Docs",
    "",
    REQUIRED_DOCS.map((file) => `- ${exists(file) ? "OK" : "MISSING"}: \`${file}\``).join("\n"),
    "",
    "## Missing Topics",
    "",
    missingTopics.length ? missingTopics.map((topic) => `- \`${topic.id}\` needs terms: ${topicNeedText(topic)}`).join("\n") : "No missing required topics.",
    "",
    "## Required Standard",
    "",
    "- User isolation must be documented, either as User A/User B or equivalent other-user/owner-profile wording.",
    "- Client-side points/XP/reward write attempts must be covered.",
    "- Server ledger/projection path must be documented.",
    "- Emulator-based rules testing must be explicitly planned.",
    "- No productive Firestore rules hardening without emulator validation."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log(`WellFit Firestore emulator test plan check complete: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Missing docs: ${missingDocs.length}`);
  console.log(`Missing topics: ${missingTopics.length}`);

  if (missingDocs.length) {
    console.log("Missing docs:");
    for (const file of missingDocs) console.log(`- ${file}`);
  }

  if (missingTopics.length) {
    console.log("Missing topics:");
    for (const topic of missingTopics) console.log(`- ${topic.id}: ${topicNeedText(topic)}`);
  }

  if (!passed) process.exit(1);
}

main();
