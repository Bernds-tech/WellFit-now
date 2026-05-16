#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "approved-agent-build-runner-merge-gate-report.md");

const PATHS = {
  gate: "project-register/approved-agent-build-runner-merge-gate.json",
  backlog: "project-register/approved-agent-build-backlog.json",
  catalog: "project-register/agent-catalog.json",
  proposals: "project-register/agent-build-proposals.json",
  batchRunner: "project-register/batch-execution-runner-policy.json",
  autoMerge: "project-register/auto-merge-policy.json",
  autoRepair: "project-register/auto-repair-policy.json",
  prDiff: "project-register/pr-diff-review-policy.json",
  prPost: "project-register/pr-post-creation-guard.json",
  taskStatus: "project-register/task-status-policy.json",
  crossReference: "project-register/cross-reference-maintenance.json",
  workMap: "todolist/WORK_MAP.md",
  todoIndex: "todolist/TODO_INDEX.md",
  doc: "docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_MERGE_GATE.md"
};

const REQUIRED_TOP_LEVEL_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "maxAgentsPerRun",
  "allowedBacklogStatuses",
  "skippedBacklogStatuses",
  "inProgressPolicy",
  "selectionRules",
  "allowedFileScopes",
  "forbiddenFileScopes",
  "safeRepairPolicy",
  "requiredPreRunChecks",
  "requiredBuildChecks",
  "requiredPRGuardChecks",
  "mergeGateRules",
  "requiredOutputLines",
  "connectedPolicies",
  "reportOutput"
];

const REQUIRED_BUILD_CHECKS = [
  "npm run lint",
  "npx tsc --noEmit",
  "npm run build",
  "npm --prefix functions run check",
  "npm run agent:quality-gate",
  "git diff --check"
];

const REQUIRED_PR_GUARD_CHECKS = [
  "node scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs",
  "node scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs",
  "node scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs",
  "node scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs",
  "node scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs",
  "node scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs",
  "node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs"
];

const REQUIRED_FORBIDDEN_SCOPES = [
  "app/**",
  "components/**",
  "lib/**",
  "functions/**",
  "firestore.rules",
  "public/**",
  "firebase.json",
  ".github/**",
  "native/**",
  "native/unity/WellFitBuddyAR/**"
];

const REQUIRED_SAFE_REPAIR_FORBIDDEN = [
  "runtime_product_code",
  "ui_behavior",
  "firebase_functions_logic",
  "firestore_rules",
  "package_or_lockfile_change",
  "github_workflow_change",
  "unity_or_native_change",
  "legal_privacy_health_child_location_payment_reward_authority_change"
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function missingValues(actual, required) {
  const values = new Set(asArray(actual));
  return required.filter((value) => !values.has(value));
}

function extraValues(actual, allowed) {
  const allowedSet = new Set(allowed);
  return asArray(actual).filter((value) => !allowedSet.has(value));
}

function missingFields(object, fields) {
  return fields.filter((field) => !(field in object));
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details: String(details) });
}

function renderResults(results) {
  return results.map((result) => `- ${result.passed ? "PASS" : "FAIL"}: ${result.name} — ${result.details}`).join("\n");
}

function selectNextAgent(backlog, gate) {
  const eligibleStatuses = new Set(asArray(gate.allowedBacklogStatuses));
  return asArray(backlog.entries)
    .filter((entry) => eligibleStatuses.has(entry.status))
    .sort((a, b) => Number(a.suggestedBuildOrder ?? 9999) - Number(b.suggestedBuildOrder ?? 9999))[0] ?? null;
}

function validate(gate, backlog, catalog, proposals, policies) {
  const results = [];
  const missingTopFields = missingFields(gate, REQUIRED_TOP_LEVEL_FIELDS);
  addResult(results, "Gate register has required top-level fields", missingTopFields.length === 0, missingTopFields.length ? `missing: ${missingTopFields.join(", ")}` : "complete");
  addResult(results, "Gate activation state is report_only_merge_gate", gate.activationState === "report_only_merge_gate", gate.activationState ?? "missing");
  addResult(results, "Gate maxAgentsPerRun is exactly 1", gate.maxAgentsPerRun === 1, String(gate.maxAgentsPerRun ?? "missing"));

  const allowedStatusMissing = missingValues(gate.allowedBacklogStatuses, ["approved_for_build", "approved_for_planning"]);
  const allowedStatusExtra = extraValues(gate.allowedBacklogStatuses, ["approved_for_build", "approved_for_planning"]);
  addResult(results, "Gate only allows approved build/planning backlog statuses", allowedStatusMissing.length === 0 && allowedStatusExtra.length === 0, `missing=${allowedStatusMissing.join(",") || "none"}; extra=${allowedStatusExtra.join(",") || "none"}`);

  const skippedMissing = missingValues(gate.skippedBacklogStatuses, ["built", "blocked", "rejected", "duplicate", "superseded"]);
  addResult(results, "Gate skips terminal/unsafe backlog statuses", skippedMissing.length === 0 && String(gate.inProgressPolicy).includes("skip"), `missing=${skippedMissing.join(",") || "none"}; inProgressPolicy=${gate.inProgressPolicy ?? "missing"}`);

  const buildMissing = missingValues(gate.requiredBuildChecks, REQUIRED_BUILD_CHECKS);
  const prGuardMissing = missingValues(gate.requiredPRGuardChecks, REQUIRED_PR_GUARD_CHECKS);
  addResult(results, "Gate requires all build checks", buildMissing.length === 0, buildMissing.join(", ") || "complete");
  addResult(results, "Gate requires all PR guard checks", prGuardMissing.length === 0, prGuardMissing.join(", ") || "complete");

  const forbiddenMissing = missingValues(gate.forbiddenFileScopes, REQUIRED_FORBIDDEN_SCOPES);
  addResult(results, "Gate forbids runtime/protected file scopes", forbiddenMissing.length === 0, forbiddenMissing.join(", ") || "complete");

  const safeRepair = gate.safeRepairPolicy ?? {};
  const safeRepairForbiddenMissing = missingValues(safeRepair.forbiddenCategories, REQUIRED_SAFE_REPAIR_FORBIDDEN);
  addResult(results, "Safe repair is limited and never self-applies", safeRepair.enabledForGateDecision === true && safeRepair.neverRepairsByItself === true && safeRepair.requiresSeparatePatch === true, `enabled=${safeRepair.enabledForGateDecision}; neverRepairsByItself=${safeRepair.neverRepairsByItself}; requiresSeparatePatch=${safeRepair.requiresSeparatePatch}`);
  addResult(results, "Safe repair forbids runtime/protected categories", safeRepairForbiddenMissing.length === 0, safeRepairForbiddenMissing.join(", ") || "complete");

  const selected = selectNextAgent(backlog, gate);
  addResult(results, "Exactly one next approved agent can be selected", Boolean(selected), selected ? `${selected.id} (${selected.proposedAgentName})` : "none");
  addResult(results, "Selected agent is not terminal, blocked, or in progress", selected ? ![...asArray(gate.skippedBacklogStatuses), "in_progress"].includes(selected.status) : false, selected ? selected.status : "none");

  const catalogIds = new Set(asArray(catalog.entries).map((entry) => entry.id));
  addResult(results, "Agent catalog includes this gate", catalogIds.has("approved-agent-build-runner-merge-gate"), catalogIds.has("approved-agent-build-runner-merge-gate") ? "present" : "missing");
  addResult(results, "Proposal register exists for previous build evidence", asArray(proposals.entries).length > 0, `${asArray(proposals.entries).length} proposal entries`);

  for (const [name, policy] of Object.entries(policies)) {
    addResult(results, `${name} connected policy loaded`, policy && typeof policy === "object", policy?.activationState ?? policy?.version ?? "loaded");
  }

  const connectedMissing = missingValues(gate.connectedPolicies, [
    PATHS.backlog,
    PATHS.proposals,
    PATHS.catalog,
    PATHS.batchRunner,
    PATHS.autoMerge,
    PATHS.autoRepair,
    PATHS.prDiff,
    PATHS.prPost,
    PATHS.taskStatus,
    PATHS.crossReference
  ]);
  addResult(results, "Gate connects required governance policies", connectedMissing.length === 0, connectedMissing.join(", ") || "complete");

  const mergeGateText = asArray(gate.mergeGateRules).join("\n").toLowerCase();
  const missingChecksBlock = mergeGateText.includes("missing") && /merge_ready\s*(?:must be|=)\s*false/i.test(mergeGateText);
  addResult(results, "Missing checks explicitly block merge-ready", missingChecksBlock, missingChecksBlock ? "MISSING_CHECKS_BLOCK_MERGE=true" : "rule missing");

  addResult(results, "Human-readable doc exists", exists(PATHS.doc), PATHS.doc);
  const workMap = readText(PATHS.workMap);
  const todoIndex = readText(PATHS.todoIndex);
  addResult(results, "Work Map references gate", workMap.includes(PATHS.gate) && workMap.includes(PATHS.doc), "Work Map pointers checked");
  addResult(results, "TODO Index references gate", todoIndex.includes(PATHS.gate) && todoIndex.includes(PATHS.doc), "TODO Index pointers checked");

  const policyAllowsRealMerge = policies.autoMerge?.requiredPRState?.realAutoMergeEnabled === true;
  addResult(results, "Real auto-merge remains disabled in auto-merge policy", !policyAllowsRealMerge, `realAutoMergeEnabled=${policies.autoMerge?.requiredPRState?.realAutoMergeEnabled}`);

  return { results, selected };
}

function renderReport(results, selected, ready) {
  const selectedId = selected?.id ?? "none";
  return `# Approved Agent Build Runner + Merge Gate Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY_MERGE_GATE\nResult: ${ready ? "PASS" : "FAIL"}\nAPPROVED_AGENT_BUILD_RUNNER_READY=${ready ? "true" : "false"}\nSELECTED_AGENT_BUILD_ID=${selectedId}\nMAX_AGENTS_PER_RUN=1\nMISSING_CHECKS_BLOCK_MERGE=true\nMERGE_READY=false\n\n## Selected Agent\n\n${selected ? `- ID: \`${selected.id}\`\n- Name: ${selected.proposedAgentName}\n- Status: \`${selected.status}\`\n- Risk level: \`${selected.riskLevel}\`\n- Suggested build order: \`${selected.suggestedBuildOrder}\`` : "No eligible approved agent selected."}\n\n## Gate Results\n\n${renderResults(results)}\n\n## Safety Confirmations\n\n- Never creates agents automatically: true\n- Never opens PRs automatically: true\n- Never approves PRs: true\n- Never merges PRs by itself: true\n- Never repairs runtime files: true\n- Never deploys: true\n\n## Merge Gate Decision\n\nMERGE_READY=false because this validator only proves the gate is configured. Future merge-ready status requires recorded passing evidence for every required build and PR guard check. Missing, failed, skipped, unknown, stale, or absent checks must keep MERGE_READY=false.\n`;
}

function main() {
  const gate = readJson(PATHS.gate);
  const backlog = readJson(PATHS.backlog);
  const catalog = readJson(PATHS.catalog);
  const proposals = readJson(PATHS.proposals);
  const policies = {
    batchRunner: readJson(PATHS.batchRunner),
    autoMerge: readJson(PATHS.autoMerge),
    autoRepair: readJson(PATHS.autoRepair),
    prDiff: readJson(PATHS.prDiff),
    prPost: readJson(PATHS.prPost),
    taskStatus: readJson(PATHS.taskStatus),
    crossReference: readJson(PATHS.crossReference)
  };

  const { results, selected } = validate(gate, backlog, catalog, proposals, policies);
  const ready = results.every((result) => result.passed);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, renderReport(results, selected, ready), "utf8");

  console.log(`WellFit approved agent build runner merge gate report written: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log("Mode: REPORT_ONLY_MERGE_GATE");
  console.log(`APPROVED_AGENT_BUILD_RUNNER_READY=${ready ? "true" : "false"}`);
  console.log(`SELECTED_AGENT_BUILD_ID=${selected?.id ?? "none"}`);
  console.log("MAX_AGENTS_PER_RUN=1");
  console.log("MISSING_CHECKS_BLOCK_MERGE=true");
  console.log("MERGE_READY=false");
  console.log("Never creates agents automatically: true");
  console.log("Never opens PRs automatically: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs by itself: true");
  console.log("Never deploys: true");
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);

  if (!ready) {
    for (const result of results.filter((item) => !item.passed)) console.log(`FAIL: ${result.name} (${result.details})`);
    process.exit(1);
  }
}

main();
