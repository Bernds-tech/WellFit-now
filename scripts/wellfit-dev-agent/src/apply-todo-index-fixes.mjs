#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TODO_INDEX_PATH = path.join(ROOT, "todolist", "TODO_INDEX.md");
const MEMORY_REPORT_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "output", "memory-sync-report.md");

const KNOWN_INDEX_LINES = new Map([
  [
    "docs/architecture/WELLFIT_SITE_QUALITY_AUDIT_AGENT.md",
    {
      section: "## Architektur- und Sicherheitsdokumente",
      anchor: "`docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md`",
      line: "| `docs/architecture/WELLFIT_SITE_QUALITY_AUDIT_AGENT.md` | aktiv | Site-Quality-Audit-Agent fuer Routen-, Seitenqualitaets- und Nebenseitenpruefung | Agentenstrategie / Site QA | nach sichtbaren Website-/Routen-Aenderungen nutzen |",
    },
  ],
  [
    "scripts/wellfit-dev-agent/src/site-quality-audit.mjs",
    {
      section: "## Dev-Agent Dateien",
      anchor: "`scripts/wellfit-dev-agent/src/code-inventory.mjs`",
      line: "| `scripts/wellfit-dev-agent/src/site-quality-audit.mjs` | aktiv / Code | crawlt/prueft Site-Qualitaet, Routen und sichtbare Seitenqualitaet | Agent-Code / Site QA | nach sichtbaren Website-/Routen-Aenderungen ausfuehren |",
    },
  ],
]);

function readText(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function extractMarkdownListSection(text, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`## ${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  const match = text.match(regex);
  if (!match) return [];

  return match[1]
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- `") && line.endsWith("`"))
    .map((line) => line.replace(/^- `/, "").replace(/`$/, ""));
}

function insertKnownLine(indexContent, fix) {
  if (indexContent.includes(fix.line)) return { content: indexContent, changed: false, reason: "already-present" };

  const lines = indexContent.split(/\r?\n/u);
  const sectionIndex = lines.findIndex((line) => line.trim() === fix.section);
  if (sectionIndex === -1) {
    return { content: indexContent, changed: false, reason: `section-not-found: ${fix.section}` };
  }

  const nextSectionIndex = lines.findIndex((line, index) => index > sectionIndex && line.startsWith("## "));
  const sectionEnd = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
  const anchorIndex = lines.findIndex((line, index) => index > sectionIndex && index < sectionEnd && line.includes(fix.anchor));

  if (anchorIndex !== -1) {
    lines.splice(anchorIndex + 1, 0, fix.line);
    return { content: lines.join("\n"), changed: true, reason: "inserted-after-anchor" };
  }

  const tableEnd = lines.findIndex((line, index) => index > sectionIndex && index < sectionEnd && line.trim() === "");
  const insertAt = tableEnd === -1 ? sectionEnd : tableEnd;
  lines.splice(insertAt, 0, fix.line);
  return { content: lines.join("\n"), changed: true, reason: "inserted-at-section-end" };
}

function main() {
  const write = process.argv.includes("--write");

  if (!fs.existsSync(TODO_INDEX_PATH)) {
    throw new Error("Missing todolist/TODO_INDEX.md");
  }

  if (!fs.existsSync(MEMORY_REPORT_PATH)) {
    throw new Error("Missing memory-sync report. Run npm run agent:memory-sync first.");
  }

  const missingFiles = extractMarkdownListSection(readText(MEMORY_REPORT_PATH), "Files Missing In Index");
  let indexContent = readText(TODO_INDEX_PATH);

  const results = [];
  for (const file of missingFiles) {
    const fix = KNOWN_INDEX_LINES.get(file);
    if (!fix) {
      results.push({ file, status: "no-known-fix" });
      continue;
    }

    const result = insertKnownLine(indexContent, fix);
    indexContent = result.content;
    results.push({ file, status: result.changed ? "fixed" : result.reason });
  }

  if (write && results.some((result) => result.status === "fixed")) {
    fs.writeFileSync(TODO_INDEX_PATH, indexContent, "utf8");
  }

  console.log("WellFit TODO index fix check complete.");
  console.log(`Mode: ${write ? "write" : "dry-run"}`);
  console.log(`Missing files from memory sync: ${missingFiles.length}`);

  for (const result of results) {
    console.log(`${result.status}: ${result.file}`);
  }

  const unknown = results.filter((result) => result.status === "no-known-fix");
  if (unknown.length > 0) {
    console.log("Unknown missing files need manual index mapping:");
    for (const result of unknown) console.log(`- ${result.file}`);
    process.exitCode = 1;
  }
}

main();
