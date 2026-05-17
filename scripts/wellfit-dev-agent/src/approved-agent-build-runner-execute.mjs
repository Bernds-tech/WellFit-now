#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const POLICY_PATH = "project-register/approved-agent-build-runner-policy.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const EXECUTION_STATE = "single_agent_docs_execution";
const PROTECTED_BRANCHES = new Set(["main", "master"]);
const ELIGIBLE_STATUSES = new Set(["approved_for_build", "approved_for_planning"]);
const EXISTING_AGENT_CHECKS = [
  [process.execPath, ["scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs"]],
  [process.execPath, ["scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs"]],
  [process.execPath, ["scripts/wellfit-dev-agent/src/approved-agent-build-runner-check.mjs"]],
  ["npm", ["run", "agent:quality-gate"]]
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(glob) {
  const normalized = normalizePath(glob);
  let source = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegExp(char);
    }
  }
  return new RegExp(`${source}$`);
}

function matchesGlob(filePath, glob) {
  if (glob.includes("PR #")) return false;
  return globToRegExp(glob).test(normalizePath(filePath));
}

function matchesAny(filePath, globs) {
  return asArray(globs).some((glob) => matchesGlob(filePath, glob));
}

function run(command, args, options = {}) {
  const display = [command, ...args].join(" ");
  console.log(`\n$ ${display}`);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    shell: false
  });
  if (result.error) {
    throw new Error(`${display} failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = options.capture ? `\n${result.stdout ?? ""}${result.stderr ?? ""}` : "";
    throw new Error(`${display} failed with exit code ${result.status}.${detail}`);
  }
  return result.stdout?.trim() ?? "";
}

function runGit(args, options = {}) {
  return run("git", args, options);
}

function currentBranch() {
  return runGit(["branch", "--show-current"], { capture: true });
}

function changedFiles() {
  const tracked = runGit(["diff", "--name-only", "HEAD", "--"], { capture: true });
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"], { capture: true });
  return [...new Set(`${tracked}\n${untracked}`
    .split(/\r?\n/u)
    .map((filePath) => normalizePath(filePath.trim()))
    .filter(Boolean))]
    .sort();
}

function selectApprovedBacklogEntry(backlog) {
  const eligibleEntries = asArray(backlog.entries)
    .filter((entry) => entry?.alreadyHumanApproved === true)
    .filter((entry) => ELIGIBLE_STATUSES.has(entry?.status))
    .sort((a, b) => Number(a.suggestedBuildOrder ?? 9999) - Number(b.suggestedBuildOrder ?? 9999) || String(a.id).localeCompare(String(b.id)));

  const selected = eligibleEntries[0] ?? null;
  if (!selected) {
    throw new Error("No approved backlog entry with an eligible execution status was found.");
  }
  console.log(`Selected exactly one approved backlog entry: ${selected.id} (${selected.proposedAgentName ?? "unnamed"})`);
  return selected;
}

function allowedCheckScriptsFor(selectedEntry) {
  return asArray(selectedEntry.requiredValidationScripts)
    .map(normalizePath)
    .filter((filePath) => matchesGlob(filePath, "scripts/wellfit-dev-agent/src/*-check.mjs"));
}

function strictAllowed(filePath, selectedEntry) {
  if (matchesAny(filePath, ["docs/architecture/*.md", "project-register/*.json", "todolist/*.md"])) {
    return true;
  }
  return allowedCheckScriptsFor(selectedEntry).includes(normalizePath(filePath));
}

function validateChangedFiles(files, policy, selectedEntry) {
  if (files.length === 0) {
    throw new Error("No changed files found to validate and commit.");
  }

  const violations = [];
  for (const filePath of files) {
    const policyAllowed = matchesAny(filePath, policy.allowedPaths);
    const policyForbidden = matchesAny(filePath, policy.forbiddenPaths);
    const capabilityAllowed = strictAllowed(filePath, selectedEntry);
    if (!policyAllowed) violations.push(`${filePath}: not covered by policy.allowedPaths`);
    if (policyForbidden) violations.push(`${filePath}: matches policy.forbiddenPaths`);
    if (!capabilityAllowed) violations.push(`${filePath}: outside first-executor capability allowlist`);
  }

  if (violations.length > 0) {
    throw new Error(`Changed-file validation failed:\n- ${violations.join("\n- ")}`);
  }

  console.log("Changed-file validation passed:");
  for (const filePath of files) console.log(`- ${filePath}`);
}

function validateChangedJson(files) {
  const jsonFiles = files.filter((filePath) => matchesGlob(filePath, "project-register/*.json"));
  for (const filePath of jsonFiles) {
    readJson(filePath);
    console.log(`JSON validation passed: ${filePath}`);
  }
}

function runRequiredChecks(files) {
  runGit(["diff", "--check"]);
  validateChangedJson(files);
  for (const [command, args] of EXISTING_AGENT_CHECKS) {
    run(command, args);
  }
}

function commitChanges(files, selectedEntry) {
  runGit(["add", "--", ...files]);
  const staged = runGit(["diff", "--cached", "--name-only"], { capture: true });
  if (!staged) {
    throw new Error("No staged changes remained after git add; refusing to create an empty commit.");
  }
  const safeId = String(selectedEntry.id ?? "approved-agent").replace(/[^a-zA-Z0-9_.-]/g, "-");
  runGit(["commit", "-m", `Add approved agent docs execution for ${safeId}`]);
}

function assertNoMergeOrDeployIntent() {
  const argv = process.argv.slice(2).join(" ").toLowerCase();
  const forbiddenTerms = ["merge", "deploy", "release", "firebase deploy", "vercel"];
  const matched = forbiddenTerms.find((term) => argv.includes(term));
  if (matched) {
    throw new Error(`Forbidden executor action requested: ${matched}. This executor never merges or deploys.`);
  }
}

function main() {
  assertNoMergeOrDeployIntent();
  const policy = readJson(POLICY_PATH);

  if (policy.activationState !== EXECUTION_STATE) {
    console.log(`Approved agent build runner executor inactive: policy activationState is '${policy.activationState}', expected '${EXECUTION_STATE}'.`);
    console.log("No files changed, no checks executed, no commit created.");
    return;
  }

  if (Number(policy.maxAgentsPerRun) !== 1) {
    throw new Error(`Expected policy.maxAgentsPerRun to be 1, got ${policy.maxAgentsPerRun}.`);
  }

  const branch = currentBranch();
  if (!branch) throw new Error("Detached HEAD is not allowed for approved runner execution.");
  if (PROTECTED_BRANCHES.has(branch)) {
    throw new Error(`Refusing to execute on protected branch '${branch}'. Use a task-specific branch.`);
  }
  console.log(`Current branch allowed: ${branch}`);

  const backlog = readJson(BACKLOG_PATH);
  const selectedEntry = selectApprovedBacklogEntry(backlog);
  const filesBeforeChecks = changedFiles();
  validateChangedFiles(filesBeforeChecks, policy, selectedEntry);
  runRequiredChecks(filesBeforeChecks);
  const filesAfterChecks = changedFiles();
  validateChangedFiles(filesAfterChecks, policy, selectedEntry);
  commitChanges(filesAfterChecks, selectedEntry);
  console.log("Approved agent docs execution completed successfully. No merge or deploy was performed.");
}

try {
  main();
} catch (error) {
  console.error(`Approved agent build runner executor failed: ${error.message}`);
  process.exitCode = 1;
}
