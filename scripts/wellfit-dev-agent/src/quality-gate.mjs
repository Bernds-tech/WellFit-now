#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const QUALITY_REPORT_PATH = path.join(OUTPUT_DIR, "quality-gate-report.md");

function runStep(label, command, args) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  return {
    label,
    command: `${command} ${args.join(" ")}`,
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
  const match = text.match(/Covered tracks:\s*(\d+)\/(\d+)/i);
  if (!match) return { covered: null, total: null };
  return { covered: Number.parseInt(match[1], 10), total: Number.parseInt(match[2], 10) };
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

function main() {
  const steps = [];
  const checks = [];

  steps.push(runStep("Agent config validation", "npm", ["run", "agent:validate"]));
  steps.push(runStep("Alpha goal check", "npm", ["run", "agent:goal-check"]));
  steps.push(runStep("Memory sync", "npm", ["run", "agent:memory-sync"]));
  steps.push(runStep("Coder prompt generation", "npm", ["run", "agent:coder-prompts"]));
  steps.push(runStep("Dry run planning", "npm", ["run", "agent:dry-run"]));

  for (const step of steps) {
    assertCondition(checks, `${step.label} exits successfully`, step.ok, `exitCode=${step.exitCode}`);
  }

  const goalReport = readTextSafe("scripts/wellfit-dev-agent/output/alpha-goal-check.md");
  const memoryReport = readTextSafe("scripts/wellfit-dev-agent/output/memory-sync-report.md");
  const dryRunReport = readTextSafe("scripts/wellfit-dev-agent/output/dry-run-report.md");

  const covered = parseCoveredTracks(goalReport);
  const missingIndex = parseNumber(memoryReport, "Missing in TODO index/structure memory");
  const missingPrompts = parseNumber(memoryReport, "Files requiring KI-Fortsetzungs-Prompt but missing it") ?? parseNumber(memoryReport, "Files without KI-Fortsetzungs-Prompt");
  const plannedMicroTasks = parseNumber(dryRunReport, "Planned micro-tasks");

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

  const passed = checks.every((check) => check.passed);
  const report = `# WellFit Agent Quality Gate Report\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## Gate Checks\n\n${renderChecks(checks)}\n\n## Required Standard\n\n- Agent validation must pass.\n- Alpha goal check must cover all required tracks.\n- Memory sync must report zero missing indexed files.\n- Memory sync must report zero required missing KI-Fortsetzungs-Prompts.\n- Dry run must produce planned micro-tasks.\n\n## Step Logs\n\n${steps.map(renderStep).join("\n\n")}\n\n## Next Action\n\n${passed ? "Quality gate passed. Continue with the next Beta-relevant task." : "Quality gate failed. Fix the failed checks before continuing with larger implementation work."}\n`;

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
