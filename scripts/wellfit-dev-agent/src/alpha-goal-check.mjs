#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AGENT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent");
const CONFIG_PATH = path.join(AGENT_DIR, "wellfit-agent.config.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readTextSafe(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return { ok: false, relativePath, content: "", error: "missing" };
  }

  return {
    ok: true,
    relativePath,
    content: fs.readFileSync(absolutePath, "utf8"),
    error: null,
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalize(value) {
  return String(value).toLowerCase().normalize("NFC");
}

function includesAny(haystack, terms) {
  return terms.some((term) => haystack.includes(normalize(term)));
}

function resolveGoalFiles(config) {
  return unique([
    ...config.sourceOfTruth,
    ...(config.topicFiles.mobileArBuddy ?? []),
    ...(config.topicFiles.rewardsEconomy ?? []),
    ...(config.topicFiles.businessWebsiteLegal ?? []),
    ...(config.topicFiles.agentArchitecture ?? []),
  ]);
}

function extractTaskLines(file) {
  return file.content
    .split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter((entry) => /^\[( |x|~|!|>)\]\s+/.test(entry.text));
}

function classifyLineStatus(text) {
  const match = text.match(/^\[( |x|~|!|>)\]/u);
  if (!match) return "unknown";

  const marker = match[1];
  if (marker === " ") return "open";
  if (marker === "x") return "done";
  if (marker === "~") return "in_progress";
  if (marker === "!") return "critical_or_blocked";
  if (marker === ">") return "backlog";
  return "unknown";
}

function analyzeTrack(track, files) {
  const matches = [];

  for (const file of files.filter((candidate) => candidate.ok)) {
    const taskLines = extractTaskLines(file);
    for (const entry of taskLines) {
      const haystack = normalize(`${file.relativePath} ${entry.text}`);
      if (!includesAny(haystack, track.keywords ?? [])) continue;

      matches.push({
        file: file.relativePath,
        line: entry.line,
        text: entry.text,
        status: classifyLineStatus(entry.text),
      });
    }
  }

  const statusCounts = matches.reduce((accumulator, match) => {
    accumulator[match.status] = (accumulator[match.status] ?? 0) + 1;
    return accumulator;
  }, {});

  const hasActiveWork = matches.some((match) => ["open", "in_progress", "critical_or_blocked"].includes(match.status));
  const hasDone = matches.some((match) => match.status === "done");
  const onlyBacklog = matches.length > 0 && matches.every((match) => match.status === "backlog");

  let health = "missing";
  if (matches.length === 0) health = "missing";
  else if (onlyBacklog) health = "backlog-only";
  else if (hasActiveWork && hasDone) health = "active-with-foundation";
  else if (hasActiveWork) health = "active";
  else if (hasDone) health = "done-or-foundation";

  return {
    ...track,
    health,
    matches,
    statusCounts,
  };
}

function detectBacklogDrift(config, files) {
  const signals = config.firstTestRunGoals?.backlogSignals ?? [];
  const matches = [];

  for (const file of files.filter((candidate) => candidate.ok)) {
    for (const entry of extractTaskLines(file)) {
      const haystack = normalize(`${file.relativePath} ${entry.text}`);
      if (!includesAny(haystack, signals)) continue;
      if (classifyLineStatus(entry.text) === "backlog") continue;

      matches.push({
        file: file.relativePath,
        line: entry.line,
        text: entry.text,
        status: classifyLineStatus(entry.text),
      });
    }
  }

  return matches;
}

function renderStatusCounts(counts) {
  const entries = Object.entries(counts);
  if (entries.length === 0) return "none";
  return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
}

function renderTrack(track) {
  const topMatches = track.matches.slice(0, 8);

  return `## ${track.label}

- Track ID: \`${track.id}\`
- Health: \`${track.health}\`
- Matches: ${track.matches.length}
- Status: ${renderStatusCounts(track.statusCounts)}

${
  topMatches.length === 0
    ? "No matching roadmap/task lines found."
    : topMatches.map((match) => `- \`${match.file}:${match.line}\` \`${match.status}\` ${match.text}`).join("\n")
}
`;
}

function renderReport({ config, files, tracks, drift }) {
  const generatedAt = new Date().toISOString();
  const coveredTracks = tracks.filter((track) => !["missing", "backlog-only"].includes(track.health)).length;
  const threshold = config.firstTestRunGoals?.minimumCoverageWarningThreshold ?? 5;
  const missingTracks = tracks.filter((track) => track.health === "missing");
  const backlogOnlyTracks = tracks.filter((track) => track.health === "backlog-only");
  const isOnTrack = coveredTracks >= threshold && drift.length === 0;

  return `# WellFit Alpha Goal Check

Generated: ${generatedAt}
Question: ${config.firstTestRunGoals?.goalQuestion ?? "Are we on track for testable alpha?"}

## Verdict

${isOnTrack ? "✅ On track for first test runs." : "⚠️ Needs attention before first test runs."}

## Summary

- Goal tracks configured: ${tracks.length}
- Covered active/foundation tracks: ${coveredTracks}
- Coverage warning threshold: ${threshold}
- Missing tracks: ${missingTracks.length}
- Backlog-only tracks: ${backlogOnlyTracks.length}
- Backlog-drift items detected: ${drift.length}

## Immediate Guidance

${
  isOnTrack
    ? "Continue prioritizing AR-Buddy, playable missions, internal points/XP, backend security, QA, deployment and privacy."
    : "Focus work back onto the Alpha core: AR-Buddy, playable missions, internal points/XP, backend security, QA/deployment and privacy. Move Token/NFT/Marketplace/DePIN/B2B work to backlog unless it directly supports test runs."
}

## Missing / Weak Tracks

${
  [...missingTracks, ...backlogOnlyTracks].length === 0
    ? "No missing or backlog-only tracks."
    : [...missingTracks, ...backlogOnlyTracks].map((track) => `- \`${track.id}\` ${track.label} — ${track.health}`).join("\n")
}

## Backlog Drift

These items match long-term/backlog signals but are not marked as backlog.

${
  drift.length === 0
    ? "No backlog drift detected."
    : drift.slice(0, 30).map((item) => `- \`${item.file}:${item.line}\` \`${item.status}\` ${item.text}`).join("\n")
}

---

${tracks.map(renderTrack).join("\n---\n\n")}

## Files Read

${files.map((file) => `- ${file.ok ? "[x]" : "[!]"} \`${file.relativePath}\``).join("\n")}
`;
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) throw new Error(`Missing config: ${CONFIG_PATH}`);

  const config = readJson(CONFIG_PATH);
  if (!config.firstTestRunGoals?.enabled) {
    console.log("First test run goal check is disabled.");
    return;
  }

  const files = resolveGoalFiles(config).map(readTextSafe);
  const tracks = (config.firstTestRunGoals.minimumRequiredTracks ?? []).map((track) => analyzeTrack(track, files));
  const drift = detectBacklogDrift(config, files);
  const report = renderReport({ config, files, tracks, drift });

  const outputPath = path.join(ROOT, config.goalCheckOutputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report, "utf8");

  console.log(`WellFit Alpha goal check complete: ${config.goalCheckOutputPath}`);
  console.log(`Covered tracks: ${tracks.filter((track) => !["missing", "backlog-only"].includes(track.health)).length}/${tracks.length}`);
  console.log(`Backlog drift items: ${drift.length}`);
}

main();
