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

function extractTasks(file, maxTasks) {
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
      risk: classifyRisk(text, file.relativePath),
    });

    if (tasks.length >= maxTasks) break;
  }

  return tasks;
}

function classifyRisk(text, filePath) {
  const haystack = `${filePath} ${text}`.toLowerCase();

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

  if (criticalTerms.some((term) => haystack.includes(term))) {
    return "review-required-critical";
  }

  if (backendTerms.some((term) => haystack.includes(term))) {
    return "review-required-backend";
  }

  return "agent-safe-dry-run";
}

function planMicroTasks(tasks, maxPlanned) {
  const safeTasks = tasks.filter((task) => task.risk === "agent-safe-dry-run");
  const reviewTasks = tasks.filter((task) => task.risk !== "agent-safe-dry-run");

  return [...safeTasks, ...reviewTasks].slice(0, maxPlanned).map((task, index) => ({
    order: index + 1,
    ...task,
  }));
}

function renderReport({ config, args, files, tasks, plan }) {
  const generatedAt = new Date().toISOString();
  const missingFiles = files.filter((file) => !file.ok);

  return `# WellFit Dev Agent Dry-Run Report

Generated: ${generatedAt}
Agent: ${config.agentName} ${config.version}
Mode: ${config.mode}
Topic: ${args.topic ?? config.defaultTopic}

## Summary

- Files requested: ${files.length}
- Files missing: ${missingFiles.length}
- Open tasks extracted: ${tasks.length}
- Planned micro-tasks: ${plan.length}

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
            `### ${task.order}. ${task.text}\n\n- Source: \`${task.file}:${task.line}\`\n- Status: \`[${task.status}]\`\n- Risk: \`${task.risk}\`\n`,
        )
        .join("\n")
}

## Missing Files

${missingFiles.length === 0 ? "No missing files." : missingFiles.map((file) => `- \`${file.relativePath}\``).join("\n")}

## Files Read

${files.map((file) => `- ${file.ok ? "[x]" : "[!]"} \`${file.relativePath}\``).join("\n")}

## Review Notes

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
  const tasks = existingFiles.flatMap((file) => extractTasks(file, config.maxOpenTasksPerFile));
  const plan = planMicroTasks(tasks, config.maxPlannedMicroTasks);
  const report = renderReport({ config, args, files, tasks, plan });

  const outputPath = path.join(ROOT, config.outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report, "utf8");

  console.log(`WellFit Dev Agent dry-run complete: ${config.outputPath}`);
  console.log(`Planned micro-tasks: ${plan.length}`);
}

main();
