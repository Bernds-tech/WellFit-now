#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AGENT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent");
const OUTPUT_PATH = path.join(AGENT_DIR, "output", "apply-memory-prompts-report.md");

const SCAN_DIRS = ["todolist", "docs/architecture"];
const IGNORE_DIR_NAMES = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "output"]);
const TEXT_EXTENSIONS = new Set([".md", ".txt"]);

function parseArgs(argv) {
  return {
    write: argv.includes("--write"),
    includeStatus: argv.includes("--include-status"),
  };
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(relativeDir, result = []) {
  const absoluteDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) return result;

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (IGNORE_DIR_NAMES.has(entry.name)) continue;

    const relativePath = normalizePath(path.join(relativeDir, entry.name));

    if (entry.isDirectory()) {
      walk(relativePath, result);
      continue;
    }

    if (!entry.isFile()) continue;
    if (entry.name === ".gitkeep") continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXTENSIONS.has(extension) && !relativePath.startsWith("todolist/")) continue;

    result.push(relativePath);
  }

  return result;
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function writeText(relativePath, content) {
  fs.writeFileSync(path.join(ROOT, relativePath), content, "utf8");
}

function hasContinuationPrompt(content) {
  const lower = content.toLowerCase();
  return lower.includes("ki-fortsetzungs-prompt") || lower.includes("fortsetzungs-prompt") || lower.includes("continuation prompt");
}

function isStatusLog(relativePath) {
  return relativePath.startsWith("todolist/status/");
}

function shouldSkip(relativePath, args) {
  if (relativePath.endsWith(".gitkeep")) return true;
  if (isStatusLog(relativePath) && !args.includeStatus) return true;
  if (relativePath === "todolist/DONE_LOG.md") return true;
  if (relativePath === "todolist/TODO_INDEX.md") return true;
  if (relativePath === "todolist/TODO_CONSOLIDATION.md") return true;
  if (relativePath === "todolist/PROJECT_STRUCTURE.md") return true;
  if (relativePath === "todolist/NEXT_ACTIONS.md") return true;
  if (relativePath === "todolist/DATABASE_PLAN.md") return true;
  if (relativePath === "todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md") return true;
  return false;
}

function inferLeadingFiles(relativePath) {
  if (relativePath.includes("FIREBASE") || relativePath.includes("PUNKTE") || relativePath.includes("REWARD") || relativePath.includes("MISSION") || relativePath.includes("AR_RIDDLE") || relativePath.includes("USER_POINTS")) {
    return "`todolist/DATABASE_PLAN.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`";
  }

  if (relativePath.includes("MOBILE") || relativePath.includes("AR") || relativePath.includes("BUDDY") || relativePath.includes("UNITY") || relativePath.includes("AVATAR")) {
    return "`todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md`";
  }

  if (relativePath.includes("BUSINESS") || relativePath.includes("WEBSITE") || relativePath.includes("LEGAL") || relativePath.includes("DASHBOARD")) {
    return "`todolist/NEXT_ACTIONS.md`, `todolist/PROJECT_STRUCTURE.md`, `todolist/TODO_INDEX.md`";
  }

  if (relativePath.includes("AGENT") || relativePath.includes("CODER") || relativePath.includes("CHAT")) {
    return "`todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `scripts/wellfit-dev-agent/README.md`";
  }

  return "`todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`";
}

function promptBlock(relativePath) {
  const leadingFiles = inferLeadingFiles(relativePath);
  return `\n\n## KI-Fortsetzungs-Prompt\n\nLies zuerst \`todolist/MASTER_PROMPT_FOR_AI.md\`, \`todolist/TODO_INDEX.md\`, \`todolist/NEXT_ACTIONS.md\` und die fuehrenden Dateien: ${leadingFiles}.\n\nArbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als \`veraltet\`, \`duplikat\`, \`erledigt\`, \`offen\` oder \`zu pruefen\`.\n\nWenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in \`todolist/TODO_INDEX.md\` oder uebertrage sie nach \`todolist/NEXT_ACTIONS.md\`. Dokumentiere erledigte Arbeit in \`todolist/DONE_LOG.md\`.\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = SCAN_DIRS.flatMap((dir) => walk(dir));
  const candidates = [];
  const skipped = [];

  for (const file of files) {
    if (shouldSkip(file, args)) {
      skipped.push(file);
      continue;
    }

    const content = readText(file);
    if (hasContinuationPrompt(content)) continue;

    candidates.push(file);
  }

  const changed = [];
  if (args.write) {
    for (const file of candidates) {
      const content = readText(file).replace(/\s+$/u, "");
      writeText(file, `${content}${promptBlock(file)}\n`);
      changed.push(file);
    }
  }

  const report = `# Apply Memory Prompts Report\n\nGenerated: ${new Date().toISOString()}\nMode: ${args.write ? "write" : "dry-run"}\n\n## Summary\n\n- Files scanned: ${files.length}\n- Files skipped by policy: ${skipped.length}\n- Files missing KI-Fortsetzungs-Prompt: ${candidates.length}\n- Files changed: ${changed.length}\n\n## Changed Files\n\n${changed.length === 0 ? "No files changed." : changed.map((file) => `- \`${file}\``).join("\n")}\n\n## Candidates\n\n${candidates.length === 0 ? "No candidates." : candidates.map((file) => `- \`${file}\``).join("\n")}\n\n## Skipped Files\n\n${skipped.length === 0 ? "No skipped files." : skipped.map((file) => `- \`${file}\``).join("\n")}\n\n## Boundary\n\nThis script only appends a KI-Fortsetzungs-Prompt block. It does not delete or rewrite existing TODO content.\n`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log(`WellFit apply-memory-prompts ${args.write ? "write" : "dry-run"} complete: scripts/wellfit-dev-agent/output/apply-memory-prompts-report.md`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Files changed: ${changed.length}`);
  if (!args.write && candidates.length > 0) {
    console.log("Dry-run only. Re-run with: npm run agent:apply-memory-prompts:write");
  }
}

main();
