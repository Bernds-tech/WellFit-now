#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, "project-register", "auto-merge-policy.json");
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "auto-merge-eligibility-report.md");
const MODE = "REPORT_ONLY";
const NEVER_MERGES = true;

const docsRegistryPrefixes = [
  "AGENTS.md",
  "README.md",
  "docs/",
  "todolist/",
  "project-register/",
  "agents/",
  "scripts/wellfit-dev-agent/"
];

const docsRegistryExtensions = new Set([".md", ".json", ".mjs", ".js", ".txt", ".yml", ".yaml"]);

const expectedRequiredChecks = [
  "npm run lint",
  "npx tsc --noEmit",
  "npm run build",
  "npm --prefix functions run check",
  "npm run agent:quality-gate",
  "node scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs",
  "jq empty project-register/auto-merge-policy.json",
  "npm run agent:autopilot:dry-run"
];

function runGit(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", shell: false });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//u, "");
}

function globToRegex(pattern) {
  let normalized = normalizePath(pattern).replace(/ unless explicitly approved$/u, "");
  normalized = normalized.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  normalized = normalized.replaceAll("**", "__DOUBLE_STAR__");
  normalized = normalized.replaceAll("*", "[^/]*");
  normalized = normalized.replaceAll("__DOUBLE_STAR__", ".*");
  return new RegExp(`^${normalized}$`, "u");
}

function matchesPattern(filePath, pattern) {
  const normalized = normalizePath(filePath);
  const exactPattern = normalizePath(pattern).replace(/ unless explicitly approved$/u, "");
  if (!exactPattern.includes("*")) return normalized === exactPattern;
  return globToRegex(exactPattern).test(normalized);
}

function readPolicy() {
  const text = fs.readFileSync(POLICY_PATH, "utf8");
  return JSON.parse(text);
}

function getMergeBase() {
  const candidates = ["origin/main", "main"];
  for (const candidate of candidates) {
    const result = runGit(["merge-base", "HEAD", candidate]);
    if (result.ok && result.stdout.trim()) return result.stdout.trim();
  }
  return null;
}

function getChangedFiles() {
  const base = getMergeBase();
  const fileSets = [];

  if (base) {
    const committed = runGit(["diff", "--name-only", `${base}...HEAD`]);
    if (committed.ok) fileSets.push(...committed.stdout.split(/\r?\n/u));
  }

  const unstaged = runGit(["diff", "--name-only"]);
  if (unstaged.ok) fileSets.push(...unstaged.stdout.split(/\r?\n/u));

  const staged = runGit(["diff", "--cached", "--name-only"]);
  if (staged.ok) fileSets.push(...staged.stdout.split(/\r?\n/u));

  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  if (untracked.ok) fileSets.push(...untracked.stdout.split(/\r?\n/u));

  return unique(fileSets.map((file) => normalizePath(file.trim()))).sort();
}

function getDiffText() {
  const base = getMergeBase();
  const chunks = [];
  if (base) {
    const committed = runGit(["diff", "--unified=0", `${base}...HEAD`]);
    if (committed.ok) chunks.push(committed.stdout);
  }
  const unstaged = runGit(["diff", "--unified=0"]);
  if (unstaged.ok) chunks.push(unstaged.stdout);
  const staged = runGit(["diff", "--cached", "--unified=0"]);
  if (staged.ok) chunks.push(staged.stdout);

  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  if (untracked.ok) {
    for (const file of untracked.stdout.split(/\r?\n/u).map((entry) => entry.trim()).filter(Boolean)) {
      const absolutePath = path.join(ROOT, file);
      if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
        chunks.push(`diff --git a/${file} b/${file}\n+++ b/${file}\n${fs.readFileSync(absolutePath, "utf8")}`);
      }
    }
  }
  return chunks.join("\n");
}

function getNumstat() {
  const base = getMergeBase();
  const commands = [];
  if (base) commands.push(["diff", "--numstat", `${base}...HEAD`]);
  commands.push(["diff", "--numstat"], ["diff", "--cached", "--numstat"]);

  let additions = 0;
  let deletions = 0;
  for (const args of commands) {
    const result = runGit(args);
    if (!result.ok) continue;
    for (const line of result.stdout.split(/\r?\n/u)) {
      const [added, deleted] = line.trim().split(/\s+/u);
      if (!added || !deleted || added === "-" || deleted === "-") continue;
      additions += Number.parseInt(added, 10) || 0;
      deletions += Number.parseInt(deleted, 10) || 0;
    }
  }

  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  if (untracked.ok) {
    for (const file of untracked.stdout.split(/\r?\n/u).map((entry) => entry.trim()).filter(Boolean)) {
      const absolutePath = path.join(ROOT, file);
      if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
        additions += fs.readFileSync(absolutePath, "utf8").split(/\r?\n/u).length;
      }
    }
  }

  return { additions, deletions };
}

function isDocsRegistryOnly(filePath) {
  const normalized = normalizePath(filePath);
  const hasAllowedPrefix = docsRegistryPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix));
  const extension = path.extname(normalized);
  return hasAllowedPrefix && docsRegistryExtensions.has(extension);
}

function findForbiddenPathMatches(files, policy) {
  const patterns = policy.forbiddenAutoMergePaths ?? [];
  const matches = [];
  for (const file of files) {
    for (const pattern of patterns) {
      if (matchesPattern(file, pattern)) matches.push({ file, pattern });
    }
  }
  return matches;
}

function findForbiddenTopicMatches(files, diffText, policy) {
  const topics = policy.forbiddenAutoMergeTopics ?? [];
  const matches = [];
  for (const topic of topics) {
    const escaped = topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "iu");
    for (const file of files) {
      if (regex.test(file)) matches.push({ topic, file, source: "path" });
    }
    if (regex.test(diffText)) matches.push({ topic, file: "<git diff>", source: "diff" });
  }
  return matches;
}

function requiredChecksListed(policy) {
  return Array.isArray(policy.requiredChecks)
    && policy.requiredChecks.length > 0
    && policy.requiredChecks.every((check) => typeof check === "string" && check.trim().length > 0)
    && expectedRequiredChecks.every((check) => policy.requiredChecks.includes(check));
}

function renderReport(report) {
  const forbiddenPathRows = report.forbiddenPathMatches.length
    ? report.forbiddenPathMatches.map((match) => `- \`${match.file}\` matches \`${match.pattern}\``).join("\n")
    : "- None";
  const forbiddenTopicRows = report.forbiddenTopicMatches.length
    ? report.forbiddenTopicMatches.map((match) => `- \`${match.topic}\` in ${match.source} (${match.file})`).join("\n")
    : "- None";
  const changedFileRows = report.changedFiles.length ? report.changedFiles.map((file) => `- \`${file}\``).join("\n") : "- None detected";
  const reasonRows = report.reasons.map((reason) => `- ${reason}`).join("\n");

  return `# WellFit Auto-Merge Eligibility Report\n\nGenerated: ${new Date().toISOString()}\nMode: ${MODE}\nNever merges: ${NEVER_MERGES}\nActivation state: ${report.activationState}\nAUTO_MERGE_ELIGIBLE=${report.autoMergeEligible ? "true" : "false"}\n\n## Reasons\n\n${reasonRows}\n\n## Changed files\n\nChanged file count: ${report.changedFileCount}\nAdditions: ${report.additions}\nDeletions: ${report.deletions}\nDocs/registry-only: ${report.docsRegistryOnly}\n\n${changedFileRows}\n\n## Forbidden path matches\n\n${forbiddenPathRows}\n\n## Forbidden topic matches\n\n${forbiddenTopicRows}\n\n## Required checks listed in policy\n\nRequired checks listed: ${report.requiredChecksListed}\n\n${report.requiredChecks.map((check) => `- \`${check}\``).join("\n")}\n\n## Safety note\n\nThis script is report-only. It does not merge, approve, deploy, enable auto-merge, or change repository settings.\n`;
}

function main() {
  const reasons = [];
  let policy;

  try {
    policy = readPolicy();
  } catch (error) {
    const fallbackReport = {
      activationState: "policy_unreadable",
      autoMergeEligible: false,
      reasons: [`Policy could not be read or parsed: ${error.message}`],
      changedFiles: [],
      changedFileCount: 0,
      additions: 0,
      deletions: 0,
      docsRegistryOnly: false,
      forbiddenPathMatches: [],
      forbiddenTopicMatches: [],
      requiredChecks: [],
      requiredChecksListed: false,
      neverMerges: NEVER_MERGES
    };
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(REPORT_PATH, renderReport(fallbackReport), "utf8");
    console.log(`Mode: ${MODE}`);
    console.log(`Never merges: ${NEVER_MERGES}`);
    console.log("AUTO_MERGE_ELIGIBLE=false");
    console.log(fallbackReport.reasons[0]);
    process.exit(1);
  }

  const changedFiles = getChangedFiles();
  const diffText = getDiffText();
  const { additions, deletions } = getNumstat();
  const docsRegistryOnly = changedFiles.length > 0 && changedFiles.every(isDocsRegistryOnly);
  const forbiddenPathMatches = findForbiddenPathMatches(changedFiles, policy);
  const forbiddenTopicMatches = findForbiddenTopicMatches(changedFiles, diffText, policy);
  const checksListed = requiredChecksListed(policy);

  if (policy.activationState !== "report_only") reasons.push(`Policy activationState is ${policy.activationState}; only report_only is allowed.`);
  if (changedFiles.length === 0) reasons.push("No changed files were detected from git diff; eligibility cannot be established.");
  if (!docsRegistryOnly) reasons.push("Changed files are not limited to documentation, registry, or governance-script files.");
  if (forbiddenPathMatches.length > 0) reasons.push("Forbidden path match detected; human review is required.");
  if (forbiddenTopicMatches.length > 0) reasons.push("Forbidden topic keyword detected in changed paths or diff; human review is required.");
  if (!checksListed) reasons.push("Required checks are missing, malformed, or incomplete in project-register/auto-merge-policy.json.");
  if (changedFiles.length > policy.maxChangedFilesForAutoMerge) reasons.push(`Changed file count ${changedFiles.length} exceeds maxChangedFilesForAutoMerge ${policy.maxChangedFilesForAutoMerge}.`);
  if (additions > policy.maxAdditionsForAutoMerge) reasons.push(`Additions ${additions} exceed maxAdditionsForAutoMerge ${policy.maxAdditionsForAutoMerge}.`);
  if (deletions > policy.maxDeletionsForAutoMerge) reasons.push(`Deletions ${deletions} exceed maxDeletionsForAutoMerge ${policy.maxDeletionsForAutoMerge}.`);
  if (reasons.length === 0) reasons.push("All report-only eligibility conditions passed. Human review is still required before any real merge policy is enabled.");

  const autoMergeEligible = reasons.length === 1 && reasons[0].startsWith("All report-only eligibility conditions passed");
  const report = {
    activationState: policy.activationState,
    autoMergeEligible,
    reasons,
    changedFiles,
    changedFileCount: changedFiles.length,
    additions,
    deletions,
    docsRegistryOnly,
    forbiddenPathMatches,
    forbiddenTopicMatches,
    requiredChecks: policy.requiredChecks ?? [],
    requiredChecksListed: checksListed,
    neverMerges: NEVER_MERGES
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, renderReport(report), "utf8");

  console.log(`WellFit auto-merge eligibility report: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Mode: ${MODE}`);
  console.log(`Never merges: ${NEVER_MERGES}`);
  console.log(`AUTO_MERGE_ELIGIBLE=${autoMergeEligible ? "true" : "false"}`);
  for (const reason of reasons) console.log(`- ${reason}`);
}

main();
