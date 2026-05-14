#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "stufe4-governance-check.md");

const requiredFiles = [
  "agents/AGENTS.md",
  "agents/modes/README.md",
  "agents/modes/stufe-1.md",
  "agents/modes/stufe-2.md",
  "agents/modes/stufe-3.md",
  "agents/modes/stufe-4.md",
  "agents/self-check.md",
  "agents/security-rules.md",
  "agents/scalability-rules.md",
  "agents/documentation-rules.md",
  "agents/failure-recovery-rules.md",
  "project-register/routes.json",
  "project-register/pages.json",
  "project-register/features.json",
  "project-register/apis.json",
  "project-register/todos.json",
  "project-register/decisions.json",
  "project-register/cross-references.json",
  "project-register/product-rules.json",
  "project-register/progress-log.json"
];

const jsonFiles = requiredFiles.filter((file) => file.endsWith(".json"));

function fileExists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

const missing = requiredFiles.filter((file) => !fileExists(file));
const invalidJson = [];

for (const file of jsonFiles) {
  if (!fileExists(file)) continue;
  try {
    JSON.parse(read(file));
  } catch (error) {
    invalidJson.push(`${file}: ${error.message}`);
  }
}

const passed = missing.length === 0 && invalidJson.length === 0;
const report = [
  "# Stufe 4 Governance Check",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Result: ${passed ? "PASS" : "FAIL"}`,
  "",
  "## Missing required files",
  "",
  missing.length ? missing.map((file) => `- \`${file}\``).join("\n") : "No missing files.",
  "",
  "## Invalid JSON files",
  "",
  invalidJson.length ? invalidJson.map((file) => `- \`${file}\``).join("\n") : "No invalid JSON files.",
  "",
  "## Required standard",
  "",
  "- Agent mode files for Stufe 1-4 must exist.",
  "- Self-check and rule files must exist.",
  "- Project-register JSON files must exist and parse successfully."
].join("\n");

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, report, "utf8");

console.log(`WellFit Stufe 4 governance check complete: ${path.relative(ROOT, OUT)}`);
console.log(`Result: ${passed ? "PASS" : "FAIL"}`);

if (missing.length) {
  console.log("Missing required files:");
  for (const file of missing) console.log(`- ${file}`);
}

if (invalidJson.length) {
  console.log("Invalid JSON files:");
  for (const file of invalidJson) console.log(`- ${file}`);
}

if (!passed) process.exit(1);
