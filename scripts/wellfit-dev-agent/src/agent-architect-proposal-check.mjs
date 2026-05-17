#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POLICY_REL = "project-register/agent-architect-policy.json";
const PROPOSALS_REL = "project-register/agent-build-proposals.json";
const BACKLOG_REL = "project-register/approved-agent-build-backlog.json";
const WORK_MAP_REL = "todolist/WORK_MAP.md";
const TODO_INDEX_REL = "todolist/TODO_INDEX.md";
const DOC_REL = "docs/architecture/WELLFIT_AGENT_ARCHITECT_PROPOSAL_AGENT.md";
const CHECK_SCRIPT_REL = "scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs";
const GENERATOR_SCRIPT_REL = "scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs";
const OUTPUT_REL = "scripts/wellfit-dev-agent/output/agent-architect-proposal-report.md";

const REQUIRED_POLICY_FIELDS = [
  "version",
  "updated",
  "activationState",
  "purpose",
  "requiredInputs",
  "selectionRules",
  "proposalRules",
  "promptGenerationRules",
  "connectedAgentCountingRules",
  "connectedRegisterCountingRules",
  "riskClassificationRules",
  "forbiddenAutoActions",
  "humanReviewRequiredFor",
  "reportOutputSchema"
];

const REQUIRED_PROPOSAL_FIELDS = [
  "id",
  "proposedAgentName",
  "sourceApprovedBacklogId",
  "status",
  "artifactStatus",
  "executionCapability",
  "allowedWriteScopes",
  "forbiddenWriteScopes",
  "requiresHumanApprovalForRuntime",
  "reason",
  "expectedBenefit",
  "riskLevel",
  "connectedAgents",
  "connectedRegisters",
  "connectedAgentCount",
  "connectedRegisterCount",
  "requiredDocs",
  "requiredRegisters",
  "requiredValidationScripts",
  "allowedFiles",
  "forbiddenFiles",
  "humanReviewRequired",
  "buildPromptSummary",
  "generatedBuildPromptLocation",
  "nextRecommendedAction",
  "createdDate",
  "updatedDate"
];

const REQUIRED_STATUSES = ["drafted", "proposed", "approved", "rejected", "superseded", "built", "blocked"];
const REQUIRED_ARTIFACT_STATUSES = ["planned", "governance_built", "validator_built", "runtime_capable"];
const REQUIRED_EXECUTION_CAPABILITIES = ["report_only", "docs_register_write", "safe_runtime_write", "repair_capable", "pr_capable"];
const REQUIRED_REFERENCES = [POLICY_REL, PROPOSALS_REL, DOC_REL, CHECK_SCRIPT_REL, GENERATOR_SCRIPT_REL];
const REQUIRED_FORBIDDEN_ACTIONS = [
  "create_future_agent_automatically",
  "approve_pr",
  "merge_pr",
  "enable_auto_merge",
  "enable_auto_repair",
  "repair_files",
  "deploy"
];

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function readText(relativePath) {
  return exists(relativePath) ? fs.readFileSync(absolute(relativePath), "utf8") : "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function add(results, name, passed, details) {
  results.push({ name, passed, details });
}

function validatePolicy(policy, results) {
  const missing = REQUIRED_POLICY_FIELDS.filter((field) => policy?.[field] === undefined || policy?.[field] === null);
  add(results, "policy required fields", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${REQUIRED_POLICY_FIELDS.length} fields present`);
  add(results, "policy activationState is report_only", policy?.activationState === "report_only", policy?.activationState ?? "missing");
  add(results, "policy requiredInputs include approved backlog", asArray(policy?.requiredInputs).includes(BACKLOG_REL), asArray(policy?.requiredInputs).includes(BACKLOG_REL) ? "present" : "missing approved backlog input");
  add(results, "policy selects one agent only", JSON.stringify(policy).includes("one_agent_only") || JSON.stringify(policy).includes("exactly one"), "one-agent selection language checked");
  const forbidden = new Set(asArray(policy?.forbiddenAutoActions));
  const missingForbidden = REQUIRED_FORBIDDEN_ACTIONS.filter((action) => !forbidden.has(action));
  add(results, "policy forbidden auto-actions", missingForbidden.length === 0, missingForbidden.length ? `missing: ${missingForbidden.join(", ")}` : "required no-build/no-merge/no-repair/no-deploy actions present");
}

function validateProposals(proposals, backlog, results) {
  const statuses = new Set(asArray(proposals?.proposalStatuses));
  const missingStatuses = REQUIRED_STATUSES.filter((status) => !statuses.has(status));
  add(results, "proposal statuses include required lifecycle", missingStatuses.length === 0, missingStatuses.length ? `missing: ${missingStatuses.join(", ")}` : `${REQUIRED_STATUSES.length} statuses present`);
  const missingArtifactStatuses = REQUIRED_ARTIFACT_STATUSES.filter((status) => !asArray(proposals?.artifactStatuses).includes(status));
  add(results, "proposal artifactStatuses include required values", missingArtifactStatuses.length === 0, missingArtifactStatuses.length ? `missing: ${missingArtifactStatuses.join(", ")}` : `${REQUIRED_ARTIFACT_STATUSES.length} values present`);
  const missingExecutionCapabilities = REQUIRED_EXECUTION_CAPABILITIES.filter((capability) => !asArray(proposals?.executionCapabilities).includes(capability));
  add(results, "proposal executionCapabilities include required values", missingExecutionCapabilities.length === 0, missingExecutionCapabilities.length ? `missing: ${missingExecutionCapabilities.join(", ")}` : `${REQUIRED_EXECUTION_CAPABILITIES.length} values present`);

  const schemaMissing = REQUIRED_PROPOSAL_FIELDS.filter((field) => proposals?.proposalSchema?.[field] === undefined);
  add(results, "proposalSchema requires required fields", schemaMissing.length === 0, schemaMissing.length ? `missing: ${schemaMissing.join(", ")}` : `${REQUIRED_PROPOSAL_FIELDS.length} schema fields present`);

  const backlogIds = new Set(asArray(backlog?.entries).map((entry) => entry.id));
  const entries = asArray(proposals?.entries);
  add(results, "proposal entries array exists", Array.isArray(proposals?.entries), `${entries.length} entries`);

  for (const entry of entries) {
    const missing = REQUIRED_PROPOSAL_FIELDS.filter((field) => entry?.[field] === undefined || entry?.[field] === null || (typeof entry?.[field] === "string" && entry[field].trim() === ""));
    add(results, `proposal ${entry?.id ?? "<unknown>"} required fields`, missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "all required fields present");
    add(results, `proposal ${entry?.id ?? "<unknown>"} status is allowed`, statuses.has(entry?.status), entry?.status ?? "missing");
    add(results, `proposal ${entry?.id ?? "<unknown>"} artifactStatus is allowed`, asArray(proposals?.artifactStatuses).includes(entry?.artifactStatus), entry?.artifactStatus ?? "missing");
    add(results, `proposal ${entry?.id ?? "<unknown>"} executionCapability is allowed`, asArray(proposals?.executionCapabilities).includes(entry?.executionCapability), entry?.executionCapability ?? "missing");
    add(results, `proposal ${entry?.id ?? "<unknown>"} write scopes are arrays`, Array.isArray(entry?.allowedWriteScopes) && Array.isArray(entry?.forbiddenWriteScopes), `allowed=${Array.isArray(entry?.allowedWriteScopes)}; forbidden=${Array.isArray(entry?.forbiddenWriteScopes)}`);
    add(results, `proposal ${entry?.id ?? "<unknown>"} runtime approval flag is boolean`, typeof entry?.requiresHumanApprovalForRuntime === "boolean", String(entry?.requiresHumanApprovalForRuntime));
    add(results, `proposal ${entry?.id ?? "<unknown>"} source backlog exists`, backlogIds.has(entry?.sourceApprovedBacklogId), entry?.sourceApprovedBacklogId ?? "missing");
    add(results, `proposal ${entry?.id ?? "<unknown>"} connectedAgentCount matches`, asArray(entry?.connectedAgents).length === entry?.connectedAgentCount, `${asArray(entry?.connectedAgents).length}/${entry?.connectedAgentCount}`);
    add(results, `proposal ${entry?.id ?? "<unknown>"} connectedRegisterCount matches`, asArray(entry?.connectedRegisters).length === entry?.connectedRegisterCount, `${asArray(entry?.connectedRegisters).length}/${entry?.connectedRegisterCount}`);
    add(results, `proposal ${entry?.id ?? "<unknown>"} humanReviewRequired true`, entry?.humanReviewRequired === true, String(entry?.humanReviewRequired));
  }
}

function validateBacklog(backlog, results) {
  const architect = asArray(backlog?.entries).find((entry) => entry.id === "agent-architect-proposal-agent");
  add(results, "approved backlog contains Agent Architect entry", Boolean(architect), architect ? architect.status : "missing");
  if (architect) {
    add(results, "Agent Architect backlog is built or superseded after this task", ["built", "superseded"].includes(architect.status), architect.status);
    add(results, "Agent Architect backlog remains human-review required", architect.humanApprovalRequired === true, String(architect.humanApprovalRequired));
  }
}

function validateWorkMapTodo(results) {
  const workMap = readText(WORK_MAP_REL);
  const todoIndex = readText(TODO_INDEX_REL);
  for (const file of REQUIRED_REFERENCES) {
    add(results, `Work Map references ${file}`, workMap.includes(file), workMap.includes(file) ? "referenced" : "missing");
    add(results, `TODO Index references ${file}`, todoIndex.includes(file), todoIndex.includes(file) ? "referenced" : "missing");
  }
}

function renderTable(results) {
  return [
    "| Check | Status | Details |",
    "|---|---|---|",
    ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${String(result.details).replace(/\|/gu, "\\|")} |`)
  ].join("\n");
}

function renderReport(results, ready) {
  return `# WellFit Agent Architect & Proposal Agent Report\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nAGENT_ARCHITECT_PROPOSAL_READY=${ready ? "true" : "false"}\n\n## Checks\n\n${renderTable(results)}\n\n## Safety Confirmations\n\n- Never builds agents: true\n- Never modifies runtime files: true\n- Never approves PRs: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Never enables auto-merge: true\n- Never enables auto-repair: true\n- Human review required for every generated proposal: true\n`;
}

function main() {
  const results = [];
  for (const file of [POLICY_REL, PROPOSALS_REL, BACKLOG_REL, WORK_MAP_REL, TODO_INDEX_REL, DOC_REL, CHECK_SCRIPT_REL, GENERATOR_SCRIPT_REL]) {
    add(results, `${file} exists`, exists(file), exists(file) ? "found" : "missing");
  }

  let policy;
  let proposals;
  let backlog;
  try {
    policy = readJson(POLICY_REL);
    add(results, `${POLICY_REL} parses as JSON`, true, "valid JSON");
  } catch (error) {
    add(results, `${POLICY_REL} parses as JSON`, false, error.message);
  }
  try {
    proposals = readJson(PROPOSALS_REL);
    add(results, `${PROPOSALS_REL} parses as JSON`, true, "valid JSON");
  } catch (error) {
    add(results, `${PROPOSALS_REL} parses as JSON`, false, error.message);
  }
  try {
    backlog = readJson(BACKLOG_REL);
    add(results, `${BACKLOG_REL} parses as JSON`, true, "valid JSON");
  } catch (error) {
    add(results, `${BACKLOG_REL} parses as JSON`, false, error.message);
  }

  if (policy) validatePolicy(policy, results);
  if (proposals && backlog) validateProposals(proposals, backlog, results);
  if (backlog) validateBacklog(backlog, results);
  validateWorkMapTodo(results);

  const ready = results.every((result) => result.passed);
  fs.mkdirSync(path.dirname(absolute(OUTPUT_REL)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_REL), renderReport(results, ready), "utf8");

  console.log(`WellFit Agent Architect & Proposal Agent report written: ${OUTPUT_REL}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never builds agents: true");
  console.log("Never modifies runtime files: true");
  console.log("Never approves PRs: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log("Never enables auto-merge: true");
  console.log("Never enables auto-repair: true");
  console.log(`AGENT_ARCHITECT_PROPOSAL_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
