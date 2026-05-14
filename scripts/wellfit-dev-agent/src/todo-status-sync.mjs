#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FILES_TO_SCAN = ["todolist/NEXT_ACTIONS.md", "todolist/TODO_INDEX.md"];
const VALID_MARKERS = new Map([
  [" ", "open"],
  [">", "in progress"],
  ["x", "done"],
  ["~", "partially done"],
  ["!", "blocked/review required"],
  ["-", "stale/superseded"],
  ["D", "duplicate"]
]);

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function markerLabel(marker) {
  return VALID_MARKERS.get(marker) ?? "unknown";
}

function scanMarkers(file, text) {
  const findings = [];
  const counts = Object.fromEntries([...VALID_MARKERS.values()].map((label) => [label, 0]));
  const lines = text.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const bracketIndex = line.search(/\[[^\]]*\]/u);
    if (bracketIndex === -1) return;

    const prefix = line.slice(0, bracketIndex).trim();
    const isLikelyTodoMarker = prefix === "" || prefix === "-" || /^[-*+]$/u.test(prefix) || /^\d+\.$/u.test(prefix);
    if (!isLikelyTodoMarker) return;

    const match = line.slice(bracketIndex).match(/^\[([^\]]*)\]/u);
    if (!match) return;

    const marker = match[1];
    if (marker.length !== 1 || !VALID_MARKERS.has(marker)) {
      findings.push({ file, line: index + 1, kind: "invalid_marker", marker: `[${marker}]`, text: line.trim() });
      return;
    }

    counts[markerLabel(marker)] += 1;
  });

  return { findings, counts };
}

function headingLevel(line) {
  const match = line.match(/^(#{1,6})\s+/u);
  return match ? match[1].length : null;
}

function sectionHasLeadingFileLink(lines) {
  const sectionText = lines.join("\n");
  return /`(?:todolist|docs|project-register|scripts|app|components|lib|functions|native|public)\//u.test(sectionText) || /(?:Fuehrende|Führende|Leading|Quelle|Source|Related|Verwandte)\b/iu.test(sectionText);
}

function scanSections(file, text) {
  const lines = text.split(/\r?\n/u);
  const sections = [];

  for (let index = 0; index < lines.length; index += 1) {
    const level = headingLevel(lines[index]);
    if (level === null) continue;

    let end = lines.length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const nextLevel = headingLevel(lines[cursor]);
      if (nextLevel !== null && nextLevel <= level) {
        end = cursor;
        break;
      }
    }

    const body = lines.slice(index + 1, end);
    const hasTodoMarker = body.some((line) => /^\s*(?:[-*+]\s*)?\[[^\]]*\]/u.test(line));
    if (!hasTodoMarker) continue;
    if (sectionHasLeadingFileLink(body)) continue;

    sections.push({ file, line: index + 1, heading: lines[index].replace(/^#+\s*/u, "").trim() });
  }

  return sections;
}

function mergeCounts(allCounts, nextCounts) {
  for (const [key, value] of Object.entries(nextCounts)) allCounts[key] = (allCounts[key] ?? 0) + value;
}

function renderCounts(counts) {
  return [...VALID_MARKERS.values()].map((label) => `- ${label}: ${counts[label] ?? 0}`).join("\n");
}

function main() {
  const malformed = [];
  const missingLeadingLinks = [];
  const counts = {};

  for (const file of FILES_TO_SCAN) {
    const text = readText(file);
    const markerScan = scanMarkers(file, text);
    malformed.push(...markerScan.findings);
    mergeCounts(counts, markerScan.counts);
    missingLeadingLinks.push(...scanSections(file, text));
  }

  const passed = malformed.length === 0;
  console.log("WellFit TODO Status Sync");
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log("");
  console.log("Defined markers:");
  for (const [marker, label] of VALID_MARKERS.entries()) console.log(`- [${marker}] ${label}`);
  console.log("");
  console.log("Marker counts:");
  console.log(renderCounts(counts));
  console.log("");
  console.log("Malformed or unknown status markers:");
  if (malformed.length === 0) console.log("- None found.");
  else for (const item of malformed) console.log(`- ${item.file}:${item.line} ${item.marker} ${item.text}`);
  console.log("");
  console.log("TODO sections missing obvious links to leading files:");
  if (missingLeadingLinks.length === 0) console.log("- None found.");
  else for (const item of missingLeadingLinks) console.log(`- ${item.file}:${item.line} ${item.heading}`);
  console.log("");
  console.log("Rewrite mode: disabled. This first version is validation/reporting only.");

  if (!passed) process.exit(1);
}

main();
