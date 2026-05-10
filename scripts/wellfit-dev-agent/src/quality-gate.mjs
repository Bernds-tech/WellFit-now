#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const QUALITY_REPORT_PATH = path.join(OUTPUT_DIR, "quality-gate-report.md");
const NODE_COMMAND = process.execPath;

const agentSteps = [
  {
    label: "Agent config validation",
    script: "scripts/wellfit-dev-agent/src/validate-agent-config.mjs",
    displayCommand: "npm run agent:validate",
  },
  {
    label: "Alpha goal check",
    script: "scripts/wellfit-dev-agent/src/alpha-goal-check.mjs",
    displayCommand: "npm run agent:goal-check",
  },
  {
    label: "Memory sync",
    script: "scripts/wellfit-dev-agent/src/memory-sync.mjs",
    displayCommand: "npm run agent:memory-sync",
  },
  {
    label: "Coder prompt generation",
    script: "scripts/wellfit-dev-agent/src/generate-coder-prompts.mjs",
    displayCommand: "npm run agent:coder-prompts",
  },
  {
    label: "Dry run planning",
    script: "scripts/wellfit-dev-agent/src/dry-run.mjs",
    displayCommand: "npm run agent:dry-run",
  },
  {
    label: "Firestore economy rules check",
    script: "scripts/wellfit-dev-agent/src/firestore-economy-rules-check.mjs",
    displayCommand: "npm run agent:firestore-economy-rules-check",
  },
];

function runNodeStep(step) {
  const startedAt = new Date().toISOString();
  const scriptPath = path.join(ROOT, step.script);
  const result = spawnSync(NODE_COMMAND, [scriptPath], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });

  return {
    label: step.label,
    command: step.displayCommand,
    startedAt,
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ok: result.status === 0,
  };
}

function readTextSafe(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
  return fs.readFileSync(absolutePath, "utf8");
}

function parseNumber(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}:\\s*(\\d+)`, "i"));
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseCoveredTracks(text) {
  const direct = text.match(/Covered tracks:\s*(\d+)\/(\d+)/i);
  if (direct) {
    return { covered: Number.parseInt(direct[1], 10), total: Number.parseInt(direct[2], 10) };
  }

  const markdown = text.match(/Covered[^\n\r]*?(\d+)\s*\/\s*(\d+)/i);
  if (markdown) {
    return { covered: Number.parseInt(markdown[1], 10), total: Number.parseInt(markdown[2], 10) };
  }

  return { covered: null, total: null };
}

function assertCondition(checks, name, passed, details) {
  checks.push({ name, passed, details });
}

function renderStep(step) {
  return `### ${step.label}\n\n- Command: \`${step.command}\`\n- Exit code: ${step.exitCode}\n- Result: ${step.ok ? "PASS" : "FAIL"}\n\n<details><summary>stdout</summary>\n\n\`\`\`text\n${step.stdout.trim()}\n\`\`\`\n</details>\n\n${step.stderr.trim() ? `<details><summary>stderr</summary>\n\n\`\`\`text\n${step.stderr.trim()}\n\`\`\`\n</details>\n` : ""}`;
}

function renderChecks(checks) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...checks.map((check) => `| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${check.details} |`),
  ].join("\n");
}

function getStep(steps, label) {
  return steps.find((step) => step.label === label);
}

function main() {
  const steps = [];
  const checks = [];

  for (const step of agentSteps) {
    steps.push(runNodeStep(step));
  }

  for (const step of steps) {
    assertCondition(checks, `${step.label} exits successfully`, step.ok, `exitCode=${step.exitCode}`);
  }

  const goalReport = readTextSafe("scripts/wellfit-dev-agent/output/alpha-goal-check.md");
  const memoryReport = readTextSafe("scripts/wellfit-dev-agent/output/memory-sync-report.md");
  const dryRunReport = readTextSafe("scripts/wellfit-dev-agent/output/dry-run-report.md");
  const rulesReport = readTextSafe("scripts/wellfit-dev-agent/output/firestore-economy-rules-check.md");

  const alphaStep = getStep(steps, "Alpha goal check");
  const dryRunStep = getStep(steps, "Dry run planning");
  const memoryStep = getStep(steps, "Memory sync");
  const rulesStep = getStep(steps, "Firestore economy rules check");

  const covered = parseCoveredTracks(`${goalReport}\n${alphaStep?.stdout ?? ""}`);
  const missingIndex = parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Missing in TODO index/structure memory") ?? parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Missing in index");
  const missingPrompts = parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Files requiring KI-Fortsetzungs-Prompt but missing it") ?? parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Files without KI-Fortsetzungs-Prompt") ?? parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Missing prompts");
  const plannedMicroTasks = parseNumber(`${dryRunReport}\n${dryRunStep?.stdout ?? ""}`, "Planned micro-tasks");
  const rulesReportPassed = /Result:\s*PASS/i.test(`${rulesReport}\n${rulesStep?.stdout ?? ""}`);

  assertCondition(
    checks,
    "Alpha tracks fully covered",
    covered.covered !== null && covered.total !== null && covered.covered === covered.total,
    covered.covered === null ? "not found" : `${covered.covered}/${covered.total}`,
  );

  assertCondition(
    checks,
    "TODO index has no missing files",
    missingIndex === 0,
    missingIndex === null ? "not found" : String(missingIndex),
  );

  assertCondition(
    checks,
    "Required KI-Fortsetzungs-Prompts complete",
    missingPrompts === 0,
    missingPrompts === null ? "not found" : String(missingPrompts),
  );

  assertCondition(
    checks,
    "Dry run produced micro-tasks",
    plannedMicroTasks !== null && plannedMicroTasks > 0,
    plannedMicroTasks === null ? "not found" : String(plannedMicroTasks),
  );

  assertCondition(
    checks,
    "Firestore economy rules check passed",
    rulesReportPassed,
    rulesReportPassed ? "PASS" : "not found or FAIL",
  );

  const passed = checks.every((check) => check.passed);
  const report = `# WellFit Agent Quality Gate Report\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## Gate Checks\n\n${renderChecks(checks)}\n\n## Required Standard\n\n- Agent validation must pass.\n- Alpha goal check must cover all required tracks.\n- Memory sync must report zero missing indexed files.\n- Memory sync must report zero required missing KI-Fortsetzungs-Prompts.\n- Dry run must produce planned micro-tasks.\n- Firestore economy rules check must pass the current beta allow/deny guardrails.\n\n## Step Logs\n\n${steps.map(renderStep).join("\n\n")}\n\n## Next Action\n\n${passed ? "Quality gate passed. Continue with the next Beta-relevant task." : "Quality gate failed. Fix the failed checks before continuing with larger implementation work."}\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(QUALITY_REPORT_PATH, report, "utf8");

  console.log(`WellFit quality gate complete: ${path.relative(ROOT, QUALITY_REPORT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);

  for (const check of checks) {
    console.log(`${check.passed ? "OK" : "FAIL"}: ${check.name} (${check.details})`);
  }

  if (!passed) process.exit(1);
}

main();
