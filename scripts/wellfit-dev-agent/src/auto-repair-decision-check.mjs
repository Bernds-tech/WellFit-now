#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, "project-register", "auto-repair-policy.json");
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "auto-repair-decision-report.md");
const QUALITY_REPORT_PATH = path.join(OUTPUT_DIR, "quality-gate-report.md");
const MODE = "SAFE_DOCS_REGISTER_JSON_FORMAT_REPAIR_ALLOWED";
const NEVER_REPAIRS = false;
const NEVER_MERGES = true;

const safeClassifiers = [
  {
    category: "markdown trailing whitespace or final-newline formatting in docs/register markdown",
    test: (text) => /markdown/i.test(text) && /trailing whitespace|no-trailing-spaces|MD009|final newline|no-newline/i.test(text)
  },
  {
    category: "JSON formatting or parse error in project-register files",
    test: (text) => /project-register\/.*\.json/i.test(text) && /json|jq|parse|format/i.test(text)
  },
  {
    category: "missing TODO_INDEX pointer for newly added governance doc",
    test: (text) => /TODO index|TODO_INDEX|missing in index/i.test(text) && /docs\/architecture|governance doc|architecture doc/i.test(text)
  },
  {
    category: "missing WORK_MAP pointer for newly added governance register",
    test: (text) => /WORK_MAP|Work Map/i.test(text) && /project-register\/.*\.json|governance register|register/i.test(text)
  },
  {
    category: "missing KI-Fortsetzungs-Prompt in newly added architecture doc",
    test: (text) => /KI-Fortsetzungs-Prompt|Missing KI-Fortsetzungs-Prompt|missing continuation prompt/i.test(text) && /docs\/architecture|architecture doc/i.test(text)
  },
  {
    category: "missing progress-log or work-log evidence when all changed files remain in allowed docs/register scope",
    test: (text) => /progress-log|work-log|task-status|task status/i.test(text) && /project-register|todolist|docs\/architecture/i.test(text)
  }
];

function readTextSafe(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function runGit(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function getChangedFiles() {
  const files = new Set();
  for (const args of [["diff", "--name-only"], ["diff", "--cached", "--name-only"], ["ls-files", "--others", "--exclude-standard"]]) {
    const result = runGit(args);
    if (!result.ok) continue;
    for (const line of result.stdout.split(/\r?\n/u).map((entry) => normalizePath(entry.trim())).filter(Boolean)) files.add(line);
  }
  return [...files].sort();
}

function extractQualityGateFailures(reportText) {
  const failures = [];
  const tableLinePattern = /^\|\s*([^|]+?)\s*\|\s*FAIL\s*\|\s*([^|]*?)\s*\|\s*$/gimu;
  for (const match of reportText.matchAll(tableLinePattern)) {
    const check = match[1].trim();
    if (check.toLowerCase() === "check") continue;
    failures.push({ source: "quality-gate-report", check, details: match[2].trim() });
  }

  const stepPattern = /###\s+([^\n]+)\n\n- Command:\s+`([^`]+)`\n- Exit code:\s+([^\n]+)\n- Result:\s+FAIL/gimu;
  for (const match of reportText.matchAll(stepPattern)) {
    failures.push({ source: "quality-gate-step", check: match[1].trim(), details: `${match[2].trim()} exitCode=${match[3].trim()}` });
  }

  return failures;
}

function extractOutputFailures() {
  const failures = [];
  if (!fs.existsSync(OUTPUT_DIR)) return failures;
  for (const entry of fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith(".md")).sort()) {
    if (["quality-gate-report.md", "auto-repair-decision-report.md"].includes(entry)) continue;
    const relativeSource = `scripts/wellfit-dev-agent/output/${entry}`;
    const text = readTextSafe(path.join(OUTPUT_DIR, entry));
    const resultMatch = text.match(/Result:\s*(FAIL|ERROR)\b/i);
    if (resultMatch) failures.push({ source: relativeSource, check: entry.replace(/\.md$/u, ""), details: `Result: ${resultMatch[1].toUpperCase()}` });
  }
  return failures;
}

function uniqueFailures(failures) {
  const seen = new Set();
  const result = [];
  for (const failure of failures) {
    const key = `${failure.source}|${failure.check}|${failure.details}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(failure);
  }
  return result;
}

function classifyFailure(failure) {
  const haystack = `${failure.source}\n${failure.check}\n${failure.details}`;
  const matches = safeClassifiers.filter((classifier) => classifier.test(haystack));
  return {
    ...failure,
    matchedCategory: matches.length === 1 ? matches[0].category : null,
    safelyRepairable: matches.length === 1
  };
}

function findForbiddenPathMatches(policy, changedFiles, failures) {
  const patterns = policy.forbiddenRepairPaths ?? [];
  const candidatePaths = new Set(changedFiles);
  const pathPattern = /(?:^|[\s`'"(])((?:app|components|lib|functions|public|native|native\/unity|native\/unity\/WellFitBuddyAR|\.github)\/[^\s`'"),]+|firestore\.rules|firebase\.json|package(?:-lock)?\.json)(?=$|[\s`'"),])/giu;
  for (const failure of failures) {
    const text = `${failure.source}\n${failure.check}\n${failure.details}`;
    for (const match of text.matchAll(pathPattern)) candidatePaths.add(normalizePath(match[1]));
  }

  const matches = [];
  for (const file of candidatePaths) {
    for (const pattern of patterns) {
      if (matchesPattern(file, pattern)) matches.push({ file, pattern });
    }
  }
  return matches;
}

function findForbiddenTopicMatches(policy, text) {
  const matches = [];
  for (const topic of policy.forbiddenRepairTopics ?? []) {
    const escaped = topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "iu");
    if (regex.test(text)) matches.push({ topic, source: "available reports or changed paths" });
  }
  return matches;
}

function hasRequiredEvidence(failures) {
  return failures.length > 0 && failures.every((failure) => failure.source && failure.check && failure.details);
}

function renderList(values) {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : "- none";
}

function renderDetectedFailures(failures) {
  if (!failures.length) return "No failed checks detected in the available reports.";
  return failures.map((failure) => [
    `- Source: ${failure.source}`,
    `  - Check: ${failure.check}`,
    `  - Details: ${failure.details}`,
    `  - Matched category: ${failure.matchedCategory ?? "none"}`,
    `  - Safely repairable: ${failure.safelyRepairable ? "true" : "false"}`
  ].join("\n")).join("\n");
}

function main() {
  let policy;
  const reasons = [];
  let policyRead = true;

  try {
    policy = readJson(POLICY_PATH);
  } catch (error) {
    policyRead = false;
    policy = { activationState: "missing_or_malformed", maxRepairAttempts: 0, forbiddenRepairPaths: [], forbiddenRepairTopics: [] };
    reasons.push(`Policy could not be read: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (policy.activationState !== "safe_docs_register_json_format_repair_allowed") reasons.push(`activationState must be safe_docs_register_json_format_repair_allowed; found ${policy.activationState}`);

  // The quality gate invokes this checker as one of its own steps. Avoid reading a stale
  // quality-gate report from a previous invocation, otherwise old failures can make
  // the current safe-repair decision self-referential and inaccurate.
  const qualityReport = "";
  const changedFiles = getChangedFiles();
  const detectedFailures = uniqueFailures([
    ...extractQualityGateFailures(qualityReport),
    ...(qualityReport ? [] : extractOutputFailures())
  ]).map(classifyFailure);
  const forbiddenPathMatches = findForbiddenPathMatches(policy, changedFiles, detectedFailures);
  const failureAndPathText = [changedFiles.join("\n"), ...detectedFailures.map((failure) => `${failure.source}\n${failure.check}\n${failure.details}`)].join("\n");
  const forbiddenTopicMatches = findForbiddenTopicMatches(policy, failureAndPathText);
  const requiredEvidencePresent = hasRequiredEvidence(detectedFailures);

  if (!qualityReport) reasons.push("No current quality-gate report was used; inspected individual output reports only to avoid stale self-referential quality-gate failures.");
  if (!detectedFailures.length) reasons.push("No failed check was detected; no automatic repair is needed or allowed.");
  for (const failure of detectedFailures.filter((entry) => !entry.safelyRepairable)) reasons.push(`Failure is not in the safe repair allow-list: ${failure.check} (${failure.details})`);
  if (forbiddenPathMatches.length) reasons.push(`Forbidden repair path match found: ${forbiddenPathMatches.map((match) => `${match.file} -> ${match.pattern}`).join(", ")}`);
  if (forbiddenTopicMatches.length) reasons.push(`Forbidden repair topic match found: ${forbiddenTopicMatches.map((match) => match.topic).join(", ")}`);
  if (detectedFailures.length && !requiredEvidencePresent) reasons.push("Required failure evidence is incomplete.");
  if (!policyRead) reasons.push("Policy read failure requires human review.");

  const autoRepairAllowed = policyRead
    && policy.activationState === "safe_docs_register_json_format_repair_allowed"
    && detectedFailures.length > 0
    && detectedFailures.every((failure) => failure.safelyRepairable)
    && forbiddenPathMatches.length === 0
    && forbiddenTopicMatches.length === 0
    && requiredEvidencePresent;

  if (autoRepairAllowed) reasons.push("All detected failures match safe docs/register/JSON-format repair categories, with no forbidden path or topic matches. This checker only reports the decision; any repair must be a same-branch commit followed by rerun evidence.");

  const report = `# WellFit Auto-Repair Decision Report\n\nGenerated: ${new Date().toISOString()}\nMode: ${MODE}\nActivation state: ${policy.activationState}\nAUTO_REPAIR_ALLOWED=${autoRepairAllowed ? "true" : "false"}\nMax repair attempts: ${policy.maxRepairAttempts ?? 0}\nNever repairs: ${NEVER_REPAIRS}\nNever merges: ${NEVER_MERGES}\n\n## Reasons\n\n${renderList(reasons)}\n\n## Detected Failures\n\n${renderDetectedFailures(detectedFailures)}\n\n## Forbidden Path Matches\n\n${forbiddenPathMatches.length ? forbiddenPathMatches.map((match) => `- ${match.file} -> ${match.pattern}`).join("\n") : "No forbidden repair path matches detected."}\n\n## Forbidden Topic Matches\n\n${forbiddenTopicMatches.length ? forbiddenTopicMatches.map((match) => `- ${match.topic} (${match.source})`).join("\n") : "No forbidden repair topic matches detected."}\n\n## Safe-Repair Boundary\n\nThis script only reports whether a safe docs/register/JSON-format repair is allowed. Repairs remain limited to the policy allowlist, require a same-branch commit and rerun evidence, and must never merge or deploy.\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("WellFit Auto-Repair Decision Check");
  console.log(`Mode: ${MODE}`);
  console.log(`Activation state: ${policy.activationState}`);
  console.log(`AUTO_REPAIR_ALLOWED=${autoRepairAllowed ? "true" : "false"}`);
  console.log(`Max repair attempts: ${policy.maxRepairAttempts ?? 0}`);
  console.log(`Never repairs: ${NEVER_REPAIRS}`);
  console.log(`Never merges: ${NEVER_MERGES}`);
  console.log("Reasons:");
  console.log(renderList(reasons));
  console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`);

  if (!policyRead) process.exit(1);
}

main();
