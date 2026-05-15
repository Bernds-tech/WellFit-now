#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POLICY_REL = "project-register/pr-review-policy.json";
const POLICY_PATH = path.join(ROOT, POLICY_REL);
const WORK_MAP_REL = "todolist/WORK_MAP.md";
const TODO_INDEX_REL = "todolist/TODO_INDEX.md";
const DOC_REL = "docs/architecture/WELLFIT_PR_REVIEW_AGENT.md";
const SCRIPT_REL = "scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs";
const MODE = "REPORT_ONLY";
const NEVER_APPROVES = true;
const NEVER_MERGES = true;
const NEVER_REPAIRS = true;
const NEVER_MODIFIES_FILES = true;

const requiredTopLevelFields = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "requiredReviewInputs",
  "requiredReviewChecklist",
  "protectedAreaChecks",
  "crossReferenceChecks",
  "readinessChecks",
  "inventoryChecks",
  "autoMergeChecks",
  "autoRepairChecks",
  "requiredPRDescriptionFields",
  "humanReviewRequiredFor",
  "forbiddenAutoApprovalTopics",
  "reportOutputSchema"
];

const requiredChecklistIds = [
  "changed_files_listed",
  "risk_level_stated",
  "definition_of_done_key_stated",
  "checks_run_listed",
  "protected_files_untouched_or_reviewed",
  "work_map_todo_index_updated_when_relevant",
  "product_readiness_updated_when_relevant",
  "repository_inventory_considered_when_relevant",
  "cross_reference_maintenance_applied",
  "no_duplicate_architecture_or_parallel_system",
  "auto_merge_eligibility_reported",
  "auto_repair_decision_reported",
  "next_recommended_task_stated"
];

const requiredProtectedAreaIds = [
  "PR_13",
  "UNITY_WELLFIT_BUDDY_AR",
  "APP_ROUTING_AND_RUNTIME",
  "COMPONENTS_RUNTIME_UI",
  "LIB_RUNTIME_LOGIC",
  "FIREBASE_FUNCTIONS",
  "FIRESTORE_RULES",
  "TOKEN_NFT_WALLET_PAYMENT",
  "REWARD_AUTHORITY",
  "MISSION_COMPLETION_AUTHORITY",
  "SENSITIVE_COMPLIANCE_TOPICS"
];

const requiredReferences = [POLICY_REL, DOC_REL, SCRIPT_REL];

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readText(relativePath, results) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    results.fail.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readPolicy(results) {
  if (!fs.existsSync(POLICY_PATH)) {
    results.fail.push(`Missing policy: ${POLICY_REL}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  } catch (error) {
    results.fail.push(`${POLICY_REL} is not valid JSON: ${error.message}`);
    return null;
  }
}

function validateTopLevel(policy, results) {
  for (const field of requiredTopLevelFields) {
    if (policy?.[field] === undefined || policy?.[field] === null) results.fail.push(`Missing top-level field: ${field}`);
  }

  if (!hasText(policy?.version)) results.fail.push("version must be a non-empty string.");
  if (!hasText(policy?.updated)) results.fail.push("updated must be a non-empty string.");
  if (policy?.activationState !== "report_only") results.fail.push("activationState must be report_only.");
  if (!hasText(policy?.purpose)) results.fail.push("purpose must be a non-empty string.");
}

function validateChecklist(policy, results) {
  const checklist = asArray(policy?.requiredReviewChecklist);
  const ids = new Set(checklist.map((item) => item?.id).filter(Boolean));

  for (const requiredId of requiredChecklistIds) {
    if (!ids.has(requiredId)) results.fail.push(`Missing required checklist item: ${requiredId}`);
  }

  for (const item of checklist) {
    if (!hasText(item?.id)) results.fail.push("Checklist item has missing id.");
    if (!hasText(item?.label)) results.fail.push(`Checklist item ${item?.id ?? "<unknown>"} has missing label.`);
    if (!hasText(item?.requiredEvidence)) results.fail.push(`Checklist item ${item?.id ?? "<unknown>"} has missing requiredEvidence.`);
  }
}

function validateProtectedAreas(policy, results) {
  const protectedAreas = asArray(policy?.protectedAreaChecks);
  const ids = new Set(protectedAreas.map((item) => item?.id).filter(Boolean));

  for (const requiredId of requiredProtectedAreaIds) {
    if (!ids.has(requiredId)) results.fail.push(`Missing protected-area check: ${requiredId}`);
  }

  for (const item of protectedAreas) {
    if (!hasText(item?.id)) results.fail.push("Protected-area item has missing id.");
    if (!hasText(item?.displayName)) results.fail.push(`Protected-area item ${item?.id ?? "<unknown>"} has missing displayName.`);
    if (asArray(item?.pathsOrTopics).length === 0) results.fail.push(`Protected-area item ${item?.id ?? "<unknown>"} has no pathsOrTopics.`);
    if (!hasText(item?.requiredReviewAction)) results.fail.push(`Protected-area item ${item?.id ?? "<unknown>"} has missing requiredReviewAction.`);
  }
}

function validateAutoSections(policy, results) {
  const autoMerge = policy?.autoMergeChecks ?? {};
  const autoRepair = policy?.autoRepairChecks ?? {};

  if (autoMerge.activationStateRequired !== "report_only") results.fail.push("autoMergeChecks.activationStateRequired must be report_only.");
  if (autoMerge.neverMerges !== true) results.fail.push("autoMergeChecks.neverMerges must be true.");
  if (autoMerge.neverApproves !== true) results.fail.push("autoMergeChecks.neverApproves must be true.");
  if (!hasText(autoMerge.requiredScript)) results.fail.push("autoMergeChecks.requiredScript is missing.");
  if (!String(autoMerge.requiredOutputPattern ?? "").includes("AUTO_MERGE_ELIGIBLE")) results.fail.push("autoMergeChecks.requiredOutputPattern must mention AUTO_MERGE_ELIGIBLE.");

  if (autoRepair.activationStateRequired !== "report_only") results.fail.push("autoRepairChecks.activationStateRequired must be report_only.");
  if (autoRepair.neverRepairs !== true) results.fail.push("autoRepairChecks.neverRepairs must be true.");
  if (autoRepair.neverMerges !== true) results.fail.push("autoRepairChecks.neverMerges must be true.");
  if (autoRepair.neverApproves !== true) results.fail.push("autoRepairChecks.neverApproves must be true.");
  if (!hasText(autoRepair.requiredScript)) results.fail.push("autoRepairChecks.requiredScript is missing.");
  if (!String(autoRepair.requiredOutputPattern ?? "").includes("AUTO_REPAIR_ALLOWED")) results.fail.push("autoRepairChecks.requiredOutputPattern must mention AUTO_REPAIR_ALLOWED.");
}

function validateReportSchema(policy, results) {
  const schema = policy?.reportOutputSchema ?? {};
  if (schema.mode !== MODE) results.fail.push("reportOutputSchema.mode must be REPORT_ONLY.");
  if (schema.neverApproves !== true) results.fail.push("reportOutputSchema.neverApproves must be true.");
  if (schema.neverMerges !== true) results.fail.push("reportOutputSchema.neverMerges must be true.");
  if (schema.neverRepairs !== true) results.fail.push("reportOutputSchema.neverRepairs must be true.");
  if (schema.neverDeploys !== true) results.fail.push("reportOutputSchema.neverDeploys must be true.");
}

function validateReferences(results) {
  const workMap = readText(WORK_MAP_REL, results);
  const todoIndex = readText(TODO_INDEX_REL, results);

  for (const reference of requiredReferences) {
    if (!workMap.includes(reference)) results.fail.push(`${WORK_MAP_REL} does not reference ${reference}.`);
    if (!todoIndex.includes(reference)) results.fail.push(`${TODO_INDEX_REL} does not reference ${reference}.`);
  }
}

function renderList(items, fallback) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : fallback;
}

function main() {
  const results = { pass: [], fail: [], warn: [] };
  const policy = readPolicy(results);

  if (policy) {
    validateTopLevel(policy, results);
    validateChecklist(policy, results);
    validateProtectedAreas(policy, results);
    validateAutoSections(policy, results);
    validateReportSchema(policy, results);
  }

  validateReferences(results);

  const ready = results.fail.length === 0;
  if (ready) {
    results.pass.push(`${POLICY_REL} parsed successfully.`);
    results.pass.push(`All ${requiredChecklistIds.length} required checklist fields exist.`);
    results.pass.push(`All ${requiredProtectedAreaIds.length} protected-area checks exist.`);
    results.pass.push(`${WORK_MAP_REL} and ${TODO_INDEX_REL} reference the policy, doc, and script.`);
    results.pass.push("Auto-merge and auto-repair checks are included as report-only and non-authorizing.");
  }

  console.log("WellFit PR review policy check complete");
  console.log(`Mode: ${MODE}`);
  console.log(`Never approves PRs: ${NEVER_APPROVES}`);
  console.log(`Never merges PRs: ${NEVER_MERGES}`);
  console.log(`Never repairs files: ${NEVER_REPAIRS}`);
  console.log(`Never modifies files: ${NEVER_MODIFIES_FILES}`);
  console.log(`PR_REVIEW_POLICY_READY=${ready ? "true" : "false"}`);
  console.log("\nPASS");
  console.log(renderList(results.pass, "- No explicit pass details recorded."));
  console.log("\nFAIL");
  console.log(renderList(results.fail, "- No failures."));
  console.log("\nWARNING");
  console.log(renderList(results.warn, "- No warnings."));

  if (!ready) process.exit(1);
}

main();
