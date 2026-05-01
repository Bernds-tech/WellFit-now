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

function parseArgs(argv) {
  const result = {
    topic: null,
    includeRewards: false,
    includeBusiness: false,
    includeBuddy: false,
    includeBacklog: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--topic") {
      result.topic = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === "--include-rewards") result.includeRewards = true;
    if (value === "--include-business") result.includeBusiness = true;
    if (value === "--include-buddy") result.includeBuddy = true;
    if (value === "--include-backlog") result.includeBacklog = true;
  }

  return result;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function resolveFiles(config, args) {
  const files = [...config.sourceOfTruth];
  const topic = args.topic ?? config.defaultTopic;

  if (topic && config.topicFiles[topic]) {
    files.push(...config.topicFiles[topic]);
  }

  if (args.includeRewards) files.push(...(config.topicFiles.rewardsEconomy ?? []));
  if (args.includeBusiness) files.push(...(config.topicFiles.businessWebsiteLegal ?? []));
  if (args.includeBuddy) files.push(...(config.topicFiles.mobileArBuddy ?? []));

  return unique(files);
}

function normalizeText(value) {
  return value.toLowerCase().normalize("NFC");
}

function includesAny(haystack, terms) {
  return terms.some((term) => haystack.includes(normalizeText(term)));
}

function classifyAlphaScope(text, filePath, config) {
  if (!config.alphaScope?.enabled) return "unclassified";

  const haystack = normalizeText(`${filePath} ${text}`);
  const priorityKeywords = config.alphaScope.priorityKeywords ?? [];
  const backlogKeywords = config.alphaScope.backlogKeywords ?? [];

  const hasPrioritySignal = includesAny(haystack, priorityKeywords);
  const hasBacklogSignal = includesAny(haystack, backlogKeywords);

  if (hasPrioritySignal && !hasBacklogSignal) return "alpha-critical";
  if (hasPrioritySignal && hasBacklogSignal) return "alpha-review-needed";
  if (hasBacklogSignal) return "backlog";

  return "alpha-supporting";
}

function extractTasks(file, maxTasks, config) {
  const lines = file.content.split(/\r?\n/);
  const tasks = [];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    const match = trimmed.match(/^\[( |x|~|!|>)\]\s*(.+)$/u);
    if (!match) continue;

    const status = match[1];
    const text = match[2].trim();

    if (status === "x") continue;

    tasks.push({
      file: file.relativePath,
      line: index + 1,
      status,
      text,
      alphaScope: classifyAlphaScope(text, file.relativePath, config),
      risk: classifyRisk(text, file.relativePath),
    });

    if (tasks.length >= maxTasks) break;
  }

  return tasks;
}

function classifyRisk(text, filePath) {
  const haystack = normalizeText(`${filePath} ${text}`);

  const criticalTerms = [
    "reward",
    "punkte",
    "xp",
    "mission completion",
    "completion",
    "anti-cheat",
    "anticheat",
    "jackpot",
    "burn",
    "einsatz",
    "token",
    "nft",
    "firestore rules",
    "functions",
    "ledger",
    "systemreserve",
    "auszahlung",
  ];

  const backendTerms = [
    "backend",
    "firebase",
    "firestore",
    "cloud function",
    "serverseitig",
    "api",
    "emulator",
  ];

  if (includesAny(haystack, criticalTerms)) {
    return "review-required-critical";
  }

  if (includesAny(haystack, backendTerms)) {
    return "review-required-backend";
  }

  return "agent-safe-dry-run";
}

function scopeRank(task) {
  const ranks = {
    "alpha-critical": 0,
    "alpha-review-needed": 1,
    "alpha-supporting": 2,
    unclassified: 3,
    backlog: 4,
  };

  return ranks[task.alphaScope] ?? 9;
}

function riskRank(task) {
  const ranks = {
    "agent-safe-dry-run": 0,
    "review-required-backend": 1,
    "review-required-critical": 2,
  };

  return ranks[task.risk] ?? 9;
}

function planMicroTasks(tasks, maxPlanned, args) {
  const eligibleTasks = args.includeBacklog ? tasks : tasks.filter((task) => task.alphaScope !== "backlog");

  return [...eligibleTasks]
    .sort((a, b) => scopeRank(a) - scopeRank(b) || riskRank(a) - riskRank(b))
    .slice(0, maxPlanned)
    .map((task, index) => ({
      order: index + 1,
      ...task,
    }));
}

function countBy(values, key) {
  return values.reduce((accumulator, value) => {
    const group = value[key] ?? "unknown";
    accumulator[group] = (accumulator[group] ?? 0) + 1;
    return accumulator;
  }, {});
}

function renderObjectList(object) {
  const entries = Object.entries(object);
  if (entries.length === 0) return "- none";

  return entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function renderReport({ config, args, files, tasks, plan }) {
  const generatedAt = new Date().toISOString();
  const missingFiles = files.filter((file) => !file.ok);
  const alphaCounts = countBy(tasks, "alphaScope");
  const riskCounts = countBy(tasks, "risk");

  return `# WellFit Dev Agent Dry-Run Report

Generated: ${generatedAt}
Agent: ${config.agentName} ${config.version}
Mode: ${config.mode}
Topic: ${args.topic ?? config.defaultTopic}
Alpha filter: ${config.alphaScope?.enabled ? "enabled" : "disabled"}
Backlog included: ${args.includeBacklog ? "yes" : "no"}

## Summary

- Files requested: ${files.length}
- Files missing: ${missingFiles.length}
- Open tasks extracted: ${tasks.length}
- Planned micro-tasks: ${plan.length}

## Alpha Scope Breakdown

${renderObjectList(alphaCounts)}

## Risk Breakdown

${renderObjectList(riskCounts)}

## Write Policy

\`\`\`json
${JSON.stringify(config.writePolicy, null, 2)}
\`\`\`

## Safety Boundary

This dry-run does not modify product code, backend logic, Firestore Rules, Rewards, Points, XP, Mission Completion, Anti-Cheat, Token/NFT logic, or production deployments.

## Planned Micro-Tasks

${
  plan.length === 0
    ? "No micro-tasks planned."
    : plan
        .map(
          (task) =>
            `### ${task.order}. ${task.text}\n\n- Source: \`${task.file}:${task.line}\`\n- Status: \`[${task.status}]\`\n- Alpha scope: \`${task.alphaScope}\`\n- Risk: \`${task.risk}\`\n`,
        )
        .join("\n")
}

## Backlog Tasks Excluded By Default

${
  tasks.filter((task) => task.alphaScope === "backlog").length === 0
    ? "No backlog tasks detected."
    : tasks
        .filter((task) => task.alphaScope === "backlog")
        .slice(0, 20)
        .map((task) => `- \`${task.file}:${task.line}\` ${task.text}`)
        .join("\n")
}

## Missing Files

${missingFiles.length === 0 ? "No missing files." : missingFiles.map((file) => `- \`${file.relativePath}\``).join("\n")}

## Files Read

${files.map((file) => `- ${file.ok ? "[x]" : "[!]"} \`${file.relativePath}\``).join("\n")}

## Review Notes

- Tasks marked \`backlog\` are excluded unless \`--include-backlog\` is passed.
- Tasks marked \`review-required-critical\` must not be implemented autonomously.
- Backend, Reward, Mission Completion, Firestore Rules, Economy, Anti-Cheat and Token/NFT related work must stay with explicit review.
- The current parallel backend coder should not be disturbed by this agent dry-run.
`;
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Missing config: ${CONFIG_PATH}`);
  }

  const config = readJson(CONFIG_PATH);
  const args = parseArgs(process.argv.slice(2));
  const relativeFiles = resolveFiles(config, args);
  const files = relativeFiles.map(readTextSafe);
  const existingFiles = files.filter((file) => file.ok);
  const tasks = existingFiles.flatMap((file) => extractTasks(file, config.maxOpenTasksPerFile, config));
  const plan = planMicroTasks(tasks, config.maxPlannedMicroTasks, args);
  const report = renderReport({ config, args, files, tasks, plan });

  const outputPath = path.join(ROOT, config.outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report, "utf8");

  console.log(`WellFit Dev Agent dry-run complete: ${config.outputPath}`);
  console.log(`Open tasks extracted: ${tasks.length}`);
  console.log(`Planned micro-tasks: ${plan.length}`);
}

main();
