#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "mojibake-check.md");
const SCAN_DIRS = ["todolist", "docs", "agents", "project-register"];
const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "output", "dist", "build", "out"]);
const EXTENSIONS = new Set([".md", ".txt", ".json"]);

const PATTERNS = [
  { label: "broken en dash", value: "\u00e2\u20ac\u201c" },
  { label: "broken ae", value: "\u00c3\u00a4" },
  { label: "broken oe", value: "\u00c3\u00b6" },
  { label: "broken ue", value: "\u00c3\u00bc" },
  { label: "broken ss", value: "\u00c3\u0178" },
  { label: "broken Ae", value: "\u00c3\u201e" },
  { label: "broken Oe", value: "\u00c3\u2013" },
  { label: "broken Ue", value: "\u00c3\u0153" },
];

function norm(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(relativeDir, result = []) {
  const absDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absDir)) return result;
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const abs = path.join(absDir, entry.name);
    const rel = norm(path.relative(ROOT, abs));
    if (entry.isDirectory()) walk(rel, result);
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) result.push(rel);
  }
  return result;
}

function findIssues(file) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const lines = text.split(/\r?\n/u);
  const issues = [];
  for (let index = 0; index < lines.length; index += 1) {
    for (const pattern of PATTERNS) {
      if (lines[index].includes(pattern.value)) {
        issues.push({ file, line: index + 1, label: pattern.label, value: pattern.value });
      }
    }
  }
  return issues;
}

function main() {
  const files = [...new Set(SCAN_DIRS.flatMap((dir) => walk(dir)))].sort();
  const issues = files.flatMap(findIssues);
  const passed = issues.length === 0;

  const report = [
    "# Mojibake / Encoding Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Result: ${passed ? "PASS" : "FAIL"}`,
    "",
    `Scanned files: ${files.length}`,
    `Issues: ${issues.length}`,
    "",
    "## Issues",
    "",
    issues.length ? issues.map((item) => `- \`${item.file}\`: line ${item.line} (${item.label})`).join("\n") : "No mojibake patterns detected.",
    "",
    "## Rule",
    "",
    "Known broken encoding patterns in documentation/register files must be fixed before Stufe-4 work is considered complete."
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, report, "utf8");

  console.log(`WellFit mojibake check complete: ${path.relative(ROOT, OUT)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Scanned files: ${files.length}`);
  console.log(`Issues: ${issues.length}`);

  if (issues.length) {
    console.log("Mojibake issues:");
    for (const issue of issues) console.log(`- ${issue.file}: line ${issue.line} (${issue.label})`);
  }

  if (!passed) process.exit(1);
}

main();
