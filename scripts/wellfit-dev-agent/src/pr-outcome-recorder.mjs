#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WORK_LOG_PATH = "project-register/agent-work-log.json";
const REQUIRED_FIELDS = ["prNumber", "title", "status", "changedFiles", "checks", "followUps", "nextRecommendedTask"];
const ALLOWED_STATUSES = new Set(["merged", "closed", "open", "draft", "superseded"]);

function parseArgs(argv) {
  const args = { dryRun: false, localWrite: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--local-write") args.localWrite = true;
    else if (arg.startsWith("--input=")) args.input = arg.slice("--input=".length);
    else if (arg === "--input") args.input = argv[++index];
    else if (arg.startsWith("--pr-number=")) args.prNumber = Number.parseInt(arg.slice("--pr-number=".length), 10);
    else if (arg === "--pr-number") args.prNumber = Number.parseInt(argv[++index], 10);
    else if (arg.startsWith("--title=")) args.title = arg.slice("--title=".length);
    else if (arg === "--title") args.title = argv[++index];
    else if (arg.startsWith("--status=")) args.status = arg.slice("--status=".length);
    else if (arg === "--status") args.status = argv[++index];
  }
  return args;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function loadOutcome(args) {
  if (args.input) return { ...JSON.parse(fs.readFileSync(path.join(ROOT, args.input), "utf8")), ...args };
  const hasInlineOutcome = args.prNumber !== undefined || args.title !== undefined || args.status !== undefined;
  if (!hasInlineOutcome && args.dryRun) return { schemaOnly: true };
  return {
    prNumber: args.prNumber,
    title: args.title,
    status: args.status,
    changedFiles: [],
    checks: [],
    followUps: [],
    nextRecommendedTask: undefined
  };
}

function validateOutcome(outcome) {
  const errors = [];
  if (outcome.schemaOnly) return errors;
  for (const field of REQUIRED_FIELDS) {
    if (outcome[field] === undefined || outcome[field] === null || outcome[field] === "") errors.push(`Missing required field: ${field}`);
  }
  if (!Number.isInteger(outcome.prNumber) || outcome.prNumber <= 0) errors.push("PR number must be a positive integer.");
  if (outcome.status && !ALLOWED_STATUSES.has(outcome.status)) errors.push(`Status must be one of: ${[...ALLOWED_STATUSES].join(", ")}.`);
  for (const field of ["changedFiles", "checks", "followUps"]) if (!Array.isArray(outcome[field])) errors.push(`${field} must be an array.`);
  if (Array.isArray(outcome.checks)) {
    outcome.checks.forEach((check, index) => {
      if (!check.command || !check.result) errors.push(`checks[${index}] must include command and result.`);
    });
  }
  return errors;
}

function toWorkLogEntry(outcome, workLog) {
  return {
    taskId: outcome.taskId ?? `PR-${outcome.prNumber}`,
    title: outcome.title,
    status: outcome.status === "merged" ? "done" : "review_required",
    pr: {
      branch: outcome.branch ?? null,
      number: outcome.prNumber,
      url: outcome.prUrl ?? null,
      title: outcome.title
    },
    changedFiles: outcome.changedFiles,
    checks: outcome.checks,
    followUps: outcome.followUps,
    nextRecommendedTask: outcome.nextRecommendedTask,
    updatedTodoFiles: outcome.updatedTodoFiles ?? [],
    riskLevel: outcome.riskLevel ?? "low",
    definitionOfDoneKey: outcome.definitionOfDoneKey ?? null,
    recordedAt: new Date().toISOString(),
    recorder: "scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs",
    workLogVersion: workLog.version
  };
}

function renderUsage() {
  return [
    "Usage:",
    "  node scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs --dry-run --input path/to/outcome.json",
    "  node scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs --local-write --input path/to/outcome.json",
    "",
    "Required outcome fields: PR number, title, status, changed files, checks, follow-ups, next recommended task.",
    "This first version does not call GitHub and does not need GitHub credentials.",
    "Writes are disabled unless --local-write is provided."
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const workLog = readJson(WORK_LOG_PATH);
  const outcome = loadOutcome(args);
  const errors = validateOutcome(outcome);
  const canWrite = args.localWrite && errors.length === 0;
  const entry = errors.length === 0 && !outcome.schemaOnly ? toWorkLogEntry(outcome, workLog) : null;

  console.log("WellFit PR Outcome Recorder");
  console.log(`Mode: ${args.localWrite ? "LOCAL_WRITE" : "DRY_RUN"}`);
  console.log("GitHub credentials required: no");
  console.log("");
  console.log(renderUsage());
  console.log("");
  console.log("Validation:");
  if (outcome.schemaOnly) console.log("- PASS: schema-only dry run; provide --input to validate a concrete PR outcome.");
  else if (errors.length === 0) console.log("- PASS");
  else for (const error of errors) console.log(`- FAIL: ${error}`);
  console.log("");
  console.log("Work-log entry preview:");
  console.log(entry ? JSON.stringify(entry, null, 2) : (outcome.schemaOnly ? "No entry preview in schema-only dry run." : "No entry preview because validation failed."));

  if (args.localWrite && outcome.schemaOnly) {
    console.log("\nNo files written. --local-write requires a concrete --input file or inline outcome fields.");
    process.exit(1);
  }

  if (canWrite) {
    const nextLog = { ...workLog, updated: new Date().toISOString().slice(0, 10), entries: [...(workLog.entries ?? []), entry] };
    writeJson(WORK_LOG_PATH, nextLog);
    console.log(`\nWrote ${WORK_LOG_PATH}.`);
  } else {
    console.log("\nNo files written. Provide --local-write with a valid --input file to append locally.");
  }

  if (!args.dryRun && !args.localWrite && errors.length > 0) process.exit(1);
  if (args.localWrite && errors.length > 0) process.exit(1);
}

main();
