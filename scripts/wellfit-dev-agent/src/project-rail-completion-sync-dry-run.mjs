#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAIL_PATH = "project-register/project-rail.json";
const OUTPUT_DIR = "scripts/wellfit-dev-agent/output";
const REPORT_PATH = `${OUTPUT_DIR}/project-rail-completion-sync-dry-run.md`;
const JSON_PATH = `${OUTPUT_DIR}/project-rail-completion-sync-dry-run.json`;
const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), "utf8"));
const fileExists = (p) => {
  try {
    return fs.statSync(abs(p)).isFile();
  } catch {
    return false;
  }
};
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;

function parseArgs(argv) {
  const result = { evidence: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--evidence") {
      result.evidence = argv[index + 1] ?? null;
      index += 1;
    }
  }
  return result;
}
function validateEvidence(evidence, required) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return ["Evidence must be a JSON object."];
  }
  const errors = [];
  for (const field of required) {
    const value = evidence[field];
    const valid = Array.isArray(value)
      ? true
      : value && typeof value === "object"
        ? true
        : value !== undefined && value !== null && value !== "";
    if (!valid) errors.push(`Missing or empty evidence field: ${field}`);
  }
  for (const field of [
    "changed_files",
    "checks_and_results",
    "new_follow_ups",
    "next_safe_tasks",
    "owner_decisions_created_or_resolved",
  ]) {
    if (evidence[field] !== undefined && !Array.isArray(evidence[field])) {
      errors.push(`${field} must be an array.`);
    }
  }
  return errors;
}
function targetAction(targetPath, evidence) {
  const hints = [];
  if (/CURRENT_PROJECT_STATE/iu.test(targetPath)) hints.push("update verified baseline, limitations and continuation state");
  if (/NEXT_ACTIONS/iu.test(targetPath)) hints.push("close completed task and add next safe tasks");
  if (/MASTER_OPEN_DONE_LIST/iu.test(targetPath)) hints.push("move or annotate item with evidence-backed status");
  if (/DONE_LOG/iu.test(targetPath)) hints.push("append PR, commit, checks and verified behavior");
  if (/agent-task-queue/iu.test(targetPath)) hints.push("reconcile queue state without inventing a duplicate task");
  if (/agent-work-log/iu.test(targetPath)) hints.push("append required work-log evidence");
  if (/progress-log/iu.test(targetPath)) hints.push("append progress linked to task and PR");
  if (/continuity-dependency-map/iu.test(targetPath)) hints.push("preserve follow-ups, blockers and dependency chains");
  if (/product-readiness/iu.test(targetPath)) hints.push("advance readiness only when verified evidence supports it");
  return {
    path: targetPath,
    exists: fileExists(targetPath),
    update_mode: path.extname(targetPath).toLowerCase() === ".json"
      ? "reviewed_json_patch_required"
      : "reviewed_human_readable_patch_required",
    reason: hints.join("; ") || "reconcile completion evidence with the existing leading source",
    automatic_write_allowed: false,
    evidence_reference: evidence && nonEmpty(evidence.task_id) ? evidence.task_id : "not_provided",
  };
}
function render({ contractReady, evidenceProvided, evidenceReady, evidenceErrors, targets, required, evidence }) {
  return [
    "# WellFit Project Rail Completion Sync Dry Run",
    "",
    "- Mode: DRY_RUN",
    "- Never rewrites source files: true",
    `- PROJECT_RAIL_COMPLETION_SYNC_CONTRACT_READY=${contractReady}`,
    `- PROJECT_RAIL_COMPLETION_EVIDENCE_PROVIDED=${evidenceProvided}`,
    `- PROJECT_RAIL_COMPLETION_EVIDENCE_READY=${evidenceReady}`,
    "",
    "## Evidence contract",
    "",
    ...required.map((field) => `- \`${field}\``),
    "",
    "## Evidence summary",
    "",
    evidenceProvided
      ? `- Task: ${evidence?.task_id ?? "missing"}`
      : "- No evidence file supplied. This run validates the contract and emits a patch-plan template only.",
    evidenceProvided
      ? `- PR: ${evidence?.merged_pr ?? "missing"}`
      : "- Use `--evidence <path>` after a merge to validate one completion record.",
    "",
    "## Proposed reconciliation plan",
    "",
    "| Source | Exists | Update mode | Reason |",
    "|---|---|---|---|",
    ...targets.map((target) => `| ${target.path} | ${target.exists ? "yes" : "no"} | ${target.update_mode} | ${target.reason.replaceAll("|", "\\|")} |`),
    "",
    "## Evidence errors",
    "",
    ...(evidenceErrors.length ? evidenceErrors.map((error) => `- ${error}`) : ["- None"]),
    "",
    "## Safety",
    "",
    "- No TODO, register, runtime, Firebase, landing-page, workflow, package, Unity or production file was modified.",
    "- A later write-enabled sync must present the complete proposed diff for review before applying it.",
    "- DONE remains prohibited until evidence is valid and every reconciliation target is reviewed.",
    "",
  ].join("\n");
}

const args = parseArgs(process.argv.slice(2));
let rail;
try {
  rail = readJson(RAIL_PATH);
} catch (error) {
  process.stderr.write(`Cannot read ${RAIL_PATH}: ${error.message}\n`);
  process.exitCode = 1;
}

if (rail) {
  const required = rail.completion_sync?.must_capture ?? [];
  const reconciliation = rail.completion_sync?.must_reconcile ?? [];
  let evidence = null;
  let evidenceErrors = [];
  const evidenceProvided = nonEmpty(args.evidence);
  if (evidenceProvided) {
    try {
      evidence = readJson(args.evidence);
      evidenceErrors = validateEvidence(evidence, required);
    } catch (error) {
      evidenceErrors = [`Cannot read evidence file: ${error.message}`];
    }
  }
  const targets = reconciliation.map((target) => targetAction(target, evidence));
  const contractReady =
    required.length > 0 &&
    reconciliation.length > 0 &&
    targets.every((target) => target.exists) &&
    rail.completion_sync?.automatic_done_without_sync === false;
  const evidenceReady = evidenceProvided && evidenceErrors.length === 0;
  const result = {
    generated_at: new Date().toISOString(),
    mode: "DRY_RUN",
    never_rewrites_source_files: true,
    contract_ready: contractReady,
    evidence_provided: evidenceProvided,
    evidence_ready: evidenceReady,
    evidence_errors: evidenceErrors,
    required_evidence_fields: required,
    proposed_reconciliation_targets: targets,
    safety: {
      automatic_write_allowed: false,
      automatic_done_allowed: false,
      human_review_required_before_any_patch: true,
    },
  };
  fs.mkdirSync(abs(OUTPUT_DIR), { recursive: true });
  fs.writeFileSync(abs(JSON_PATH), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(abs(REPORT_PATH), render({ contractReady, evidenceProvided, evidenceReady, evidenceErrors, targets, required, evidence }), "utf8");
  process.stdout.write([
    "WellFit Project Rail Completion Sync Dry Run",
    "Mode: DRY_RUN",
    "Never rewrites source files: true",
    `PROJECT_RAIL_COMPLETION_SYNC_CONTRACT_READY=${contractReady}`,
    `PROJECT_RAIL_COMPLETION_EVIDENCE_PROVIDED=${evidenceProvided}`,
    `PROJECT_RAIL_COMPLETION_EVIDENCE_READY=${evidenceReady}`,
    `Report: ${REPORT_PATH}`,
    "",
  ].join("\n"));
  if (!contractReady || (evidenceProvided && !evidenceReady)) process.exitCode = 1;
}
