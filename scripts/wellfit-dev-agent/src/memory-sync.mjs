#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AGENT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent");
const CONFIG_PATH = path.join(AGENT_DIR, "wellfit-agent.config.json");
const OUTPUT_PATH = path.join(AGENT_DIR, "output", "memory-sync-report.md");

const SCAN_DIRS = ["todolist", "docs", "scripts/wellfit-dev-agent"];
const IGNORE_DIR_NAMES = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "output"]);
const TEXT_EXTENSIONS = new Set([".md", ".txt", ".json", ".mjs", ".js", ".ts", ".tsx"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function walk(relativeDir, result = []) {
  const absoluteDir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) return result;

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (IGNORE_DIR_NAMES.has(entry.name)) continue;

    const relativePath = normalizePath(path.join(relativeDir, entry.name));
    const absolutePath = path.join(ROOT, relativePath);

    if (entry.isDirectory()) {
      walk(relativePath, result);
      continue;
    }

    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXTENSIONS.has(extension) && !relativePath.startsWith("todolist/")) continue;

    result.push(relativePath);
  }

  return result;
}

function readTextSafe(relativePath) {
  try {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function isTodoLike(relativePath, content) {
  const haystack = `${relativePath}\n${content.slice(0, 3000)}`.toLowerCase();
  return (
    relativePath.toLowerCase().startsWith("todolist/") ||
    haystack.includes("todo") ||
    haystack.includes("roadmap") ||
    haystack.includes("ki-fortsetzungs-prompt") ||
    haystack.includes("coder") ||
    haystack.includes("agent") ||
    haystack.includes("alpha") ||
    haystack.includes("beta")
  );
}

function hasContinuationPrompt(content) {
  const lower = content.toLowerCase();
  return lower.includes("ki-fortsetzungs-prompt") || lower.includes("fortsetzungs-prompt") || lower.includes("continuation prompt");
}

function countOpenTaskMarkers(content) {
  return content.split(/\r?\n/).filter((line) => /^\s*-?\s*\[ \]/u.test(line.trim()) || /^\s*\[ \]/u.test(line.trim())).length;
}

function collectReferencedFiles(config, indexContent, consolidationContent, structureContent) {
  const fromConfig = [
    ...(config.sourceOfTruth ?? []),
    ...Object.values(config.topicFiles ?? {}).flat(),
    config.outputPath,
    config.goalCheckOutputPath,
    config.coderPromptOutputDir,
  ];

  const combined = `${indexContent}\n${consolidationContent}\n${structureContent}`;
  const markdownRefs = [...combined.matchAll(/`([^`]+)`/g)].map((match) => match[1]);

  return unique([...fromConfig, ...markdownRefs]).filter((value) => typeof value === "string" && value.includes("/"));
}

function renderTable(rows) {
  if (rows.length === 0) return "No items.";

  return [
    "| Datei | Status | Offene Marker | Prompt | Empfehlung |",
    "|---|---:|---:|---|---|",
    ...rows.map((row) => `| \`${row.file}\` | ${row.status} | ${row.openTasks} | ${row.prompt} | ${row.recommendation} |`),
  ].join("\n");
}

function renderMissingRefs(rows) {
  if (rows.length === 0) return "No missing referenced files.";
  return rows.map((file) => `- \`${file}\``).join("\n");
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) throw new Error(`Missing config: ${CONFIG_PATH}`);

  const config = readJson(CONFIG_PATH);
  const indexContent = readTextSafe("todolist/TODO_INDEX.md");
  const consolidationContent = readTextSafe("todolist/TODO_CONSOLIDATION.md");
  const structureContent = readTextSafe("todolist/PROJECT_STRUCTURE.md");

  const scannedFiles = unique(SCAN_DIRS.flatMap((dir) => walk(dir)));
  const todoLikeFiles = scannedFiles
    .map((file) => ({ file, content: readTextSafe(file) }))
    .filter((entry) => isTodoLike(entry.file, entry.content));

  const memoryCombined = `${indexContent}\n${consolidationContent}\n${structureContent}`;
  const referencedFiles = collectReferencedFiles(config, indexContent, consolidationContent, structureContent);
  const missingReferencedFiles = referencedFiles.filter((file) => !exists(file) && !file.endsWith("/") && !file.includes("output/"));

  const tableRows = todoLikeFiles.map((entry) => {
    const isIndexed = memoryCombined.includes(entry.file);
    const prompt = hasContinuationPrompt(entry.content) ? "yes" : "missing";
    const openTasks = countOpenTaskMarkers(entry.content);
    const status = isIndexed ? "indexed" : "missing-in-index";

    let recommendation = "ok";
    if (!isIndexed && prompt === "missing") recommendation = "index + prompt";
    else if (!isIndexed) recommendation = "add to TODO_INDEX.md";
    else if (prompt === "missing") recommendation = "add KI prompt";

    return { file: entry.file, status, openTasks, prompt, recommendation };
  });

  const missingInIndex = tableRows.filter((row) => row.status === "missing-in-index");
  const missingPrompts = tableRows.filter((row) => row.prompt === "missing");

  const generatedAt = new Date().toISOString();
  const report = `# WellFit Memory Sync Report

Generated: ${generatedAt}
Mode: dry-run report only
Agent: ${config.agentName} ${config.version}

## Summary

- Scanned files: ${scannedFiles.length}
- TODO-/Roadmap-/Agent-like files: ${todoLikeFiles.length}
- Missing in TODO index/structure memory: ${missingInIndex.length}
- Files without KI-Fortsetzungs-Prompt: ${missingPrompts.length}
- Missing referenced files: ${missingReferencedFiles.length}

## Important Boundary

This command does not modify project files. It only writes this report.
Existing TODOs, Roadmaps and source files are not changed or deleted.

## TODO Memory Coverage Table

${renderTable(tableRows)}

## Files Missing In Index

${missingInIndex.length === 0 ? "No missing TODO-like files detected." : missingInIndex.map((row) => `- \`${row.file}\``).join("\n")}

## Files Missing KI-Fortsetzungs-Prompt

${missingPrompts.length === 0 ? "No files missing continuation prompts detected." : missingPrompts.map((row) => `- \`${row.file}\``).join("\n")}

## Missing Referenced Files

${renderMissingRefs(missingReferencedFiles)}

## Recommended Next Actions

1. Add missing TODO-like files to \`todolist/TODO_INDEX.md\`.
2. Add missing cross references to \`todolist/PROJECT_STRUCTURE.md\` when they describe real project areas.
3. Add KI-Fortsetzungs-Prompt sections to important TODO files that do not have one.
4. Do not delete old TODOs. Mark old content as \`erledigt\`, \`duplikat\`, \`veraltet\`, \`offen\` or \`zu pruefen\`.
5. Re-run \`npm run agent:memory-sync\` after changes.
`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report, "utf8");

  console.log("WellFit memory sync dry-run complete: scripts/wellfit-dev-agent/output/memory-sync-report.md");
  console.log(`Scanned files: ${scannedFiles.length}`);
  console.log(`TODO-like files: ${todoLikeFiles.length}`);
  console.log(`Missing in index: ${missingInIndex.length}`);
  console.log(`Missing prompts: ${missingPrompts.length}`);
}

main();
