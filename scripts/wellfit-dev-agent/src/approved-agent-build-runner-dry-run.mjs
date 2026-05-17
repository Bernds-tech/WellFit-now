#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POLICY_PATH = "project-register/approved-agent-build-runner-policy.json";
const STATE_PATH = "project-register/agent-build-runner-state.json";
const BACKLOG_PATH = "project-register/approved-agent-build-backlog.json";
const CATALOG_PATH = "project-register/agent-catalog.json";
const PROPOSALS_PATH = "project-register/agent-build-proposals.json";
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/approved-agent-build-runner-dry-run-report.md";
const ELIGIBLE_STATUSES = new Set(["approved_for_build", "approved_for_planning"]);
const ACTIVE_DOCS_REGISTER_BUILD_STATE = "single_agent_docs_register_build";
const ALLOWED_POLICY_ACTIVATION_STATES = new Set(["report_only", ACTIVE_DOCS_REGISTER_BUILD_STATE]);

function absolute(relativePath) { return path.join(ROOT, relativePath); }
function readJson(relativePath) { return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8")); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function renderList(values) { return asArray(values).length ? asArray(values).map((value) => `- ${typeof value === "string" ? value : JSON.stringify(value)}`).join("\n") : "- none"; }
function selectNext(backlog) {
  return [...asArray(backlog.entries)]
    .filter((entry) => entry.alreadyHumanApproved === true)
    .filter((entry) => ELIGIBLE_STATUSES.has(entry.status))
    .sort((a, b) => Number(a.suggestedBuildOrder ?? 9999) - Number(b.suggestedBuildOrder ?? 9999))[0] ?? null;
}
function expectedFiles(entry) {
  if (!entry) return [];
  return unique([...asArray(entry.requiredDocs), ...asArray(entry.requiredRegisters), ...asArray(entry.requiredValidationScripts), "project-register/agent-catalog.json", "project-register/approved-agent-build-backlog.json", "project-register/agent-build-proposals.json", "project-register/continuity-dependency-map.json", "todolist/WORK_MAP.md", "todolist/TODO_INDEX.md"]);
}

function main() {
  const policy = readJson(POLICY_PATH);
  const state = readJson(STATE_PATH);
  const backlog = readJson(BACKLOG_PATH);
  const catalog = readJson(CATALOG_PATH);
  const proposals = readJson(PROPOSALS_PATH);
  const selected = selectNext(backlog);
  const maxOne = Number(policy.maxAgentsPerRun) === 1;
  const nonMutatingDryRun = ALLOWED_POLICY_ACTIVATION_STATES.has(policy.activationState) && state.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE;
  const docsExecutionActivated = policy.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE;
  const ready = Boolean(selected) && maxOne && nonMutatingDryRun;
  const catalogMatches = selected ? asArray(catalog.entries).filter((entry) => asArray(selected.connectedAgents).includes(entry.id)).map((entry) => entry.id) : [];
  const existingProposal = selected ? asArray(proposals.entries).find((entry) => entry.sourceApprovedBacklogId === selected.id || entry.proposedAgentName === selected.proposedAgentName) : null;
  const requiredChecks = {
    preBuild: policy.requiredPreBuildChecks,
    build: policy.requiredBuildChecks,
    postBuild: policy.requiredPostBuildChecks,
    postPR: policy.requiredPostPRChecks,
    mergeGate: policy.requiredMergeGateChecks
  };
  const report = `# Approved Agent Build Runner Dry Run\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${ready ? "PASS" : "FAIL"}\nAPPROVED_AGENT_BUILD_RUNNER_DRY_RUN_READY=${ready ? "true" : "false"}\n\n## Non-Execution Boundaries\n\n- Dry-run invocation never builds agents itself: true\n- Policy allows scoped docs/register/validator agent builds outside this dry-run: ${docsExecutionActivated}\n- Dry-run invocation never creates PRs itself: true\n- Never merges PRs: true\n- Never repairs files: true\n- Never deploys: true\n- Active docs/register build state in policy: ${policy.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE}\n- Active docs/register build state in runner state: ${state.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE}\n- Non-mutating dry-run mode: ${nonMutatingDryRun}\n- Docs/register/check-script execution activated by policy: ${docsExecutionActivated}\n- maxAgentsPerRun is 1: ${maxOne}\n\n## Selected Next Approved Agent\n\n${selected ? `- Backlog id: \`${selected.id}\`\n- Name: ${selected.proposedAgentName}\n- Status: \`${selected.status}\`\n- Suggested build order: \`${selected.suggestedBuildOrder}\`\n- Priority: \`${selected.priority}\`\n- Risk level: \`${selected.riskLevel}\`\n- Existing generated proposal: ${existingProposal ? `\`${existingProposal.id}\`` : "none yet"}\n- Catalog-connected agents matched: ${catalogMatches.length ? catalogMatches.map((id) => `\`${id}\``).join(", ") : "none"}` : "No eligible approved backlog entry selected."}\n\n## Required Files To Create Or Update For Selected Agent\n\n${renderList(expectedFiles(selected))}\n\n## Allowed Files\n\n${renderList(policy.allowedPaths)}\n\n## Forbidden Files\n\n${renderList(policy.forbiddenPaths)}\n\n## Required Checks\n\n### Pre-build\n\n${renderList(requiredChecks.preBuild)}\n\n### Build\n\n${renderList(requiredChecks.build)}\n\n### Post-build\n\n${renderList(requiredChecks.postBuild)}\n\n### Post-PR\n\n${renderList(requiredChecks.postPR)}\n\n## Safe Repair Categories\n\n${renderList(asArray(policy.safeRepairAttemptRules).map((rule) => rule.allowed ?? rule.id))}\n\n## Merge Gate Requirements\n\n${renderList(requiredChecks.mergeGate)}\n\n## Missing-Check Handling\n\n${renderList(policy.missingCheckHandlingRules)}\n\n## Dry Run Decision\n\nThis dry run selected at most one already approved future agent and did not build it. Missing required checks, pending GitHub checks, unavailable check evidence, runtime/protected findings, unresolved repair requirements, and environment blocks remain non-merge-ready.\n`;
  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log(`WellFit approved agent build runner dry-run report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Dry-run invocation never builds agents itself: true");
  console.log(`Policy allows scoped docs/register/validator agent builds: ${docsExecutionActivated}`);
  console.log("Dry-run invocation never creates PRs itself: true");
  console.log("Never merges PRs: true");
  console.log("Never repairs files: true");
  console.log("Never deploys: true");
  console.log(`Selected backlog entry: ${selected ? selected.id : "none"}`);
  console.log(`Selected agent: ${selected ? selected.proposedAgentName : "none"}`);
  console.log(`maxAgentsPerRun is 1: ${maxOne}`);
  console.log(`APPROVED_AGENT_BUILD_RUNNER_DRY_RUN_READY=${ready ? "true" : "false"}`);
  console.log(`Result: ${ready ? "PASS" : "FAIL"}`);
  if (!ready) process.exit(1);
}

main();
