#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "stufe4-governance-check.md");
const NODE = process.execPath;

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

function runMojibakeCheck() {
  const script = path.join(ROOT, "scripts", "wellfit-dev-agent", "src", "mojibake-check.mjs");
  if (!fs.existsSync(script)) return { ok: false, stdout: "", stderr: "Missing mojibake-check.mjs" };
  const result = spawnSync(NODE, [script], { cwd: ROOT, encoding: "utf8", shell: false });
  return { ok: result.status === 0, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
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

const mojibake = runMojibakeCheck();
const passed = missing.length === 0 && invalidJson.length === 0 && mojibake.ok;
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
  "## Mojibake check",
  "",
  mojibake.ok ? "PASS" : "FAIL",
  "",
  "```text",
  `${mojibake.stdout.trim()}${mojibake.stderr.trim() ? `\n${mojibake.stderr.trim()}` : ""}`,
  "```",
  "",
  "## Required standard",
  "",
  "- Agent mode files for Stufe 1-4 must exist.",
  "- Self-check and rule files must exist.",
  "- Project-register JSON files must exist and parse successfully.",
  "- Documentation/register files must not contain known broken encoding patterns."
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

if (!mojibake.ok) {
  console.log("Mojibake check failed.");
  if (mojibake.stdout.trim()) console.log(mojibake.stdout.trim());
  if (mojibake.stderr.trim()) console.log(mojibake.stderr.trim());
}

if (!passed) process.exit(1);
