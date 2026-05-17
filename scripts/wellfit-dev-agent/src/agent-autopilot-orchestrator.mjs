#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const NODE_COMMAND = process.execPath;
const ACTIVE_DOCS_REGISTER_BUILD_STATE = "single_agent_docs_register_build";
const APPROVED_BUILD_STATUSES = new Set(["approved_for_build", "approved_for_planning"]);
const APPROVED_BUILD_POLICY_STATES = new Set(["report_only", ACTIVE_DOCS_REGISTER_BUILD_STATE]);
const HIGH_RISK_LEVELS = new Set(["high", "critical"]);

const PATHS = {
  autopilot: "project-register/agent-autopilot.json",
  queue: "project-register/agent-task-queue.json",
  riskClassifier: "project-register/risk-classifier.json",
  definitionOfDone: "project-register/definition-of-done.json",
  productReadiness: "project-register/product-readiness.json",
  researchRecommendations: "project-register/research-recommendations.json",
  adaptiveUserInsights: "project-register/adaptive-user-insights.json",
  approvedBuildPolicy: "project-register/approved-agent-build-runner-policy.json",
  approvedBuildState: "project-register/agent-build-runner-state.json",
  approvedBuildBacklog: "project-register/approved-agent-build-backlog.json",
  agentCatalog: "project-register/agent-catalog.json",
  agentBuildProposals: "project-register/agent-build-proposals.json"
};

function absolutePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolutePath(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readJsonWhenPresent(relativePath) {
  const filePath = absolutePath(relativePath);
  if (!fs.existsSync(filePath)) return { present: false, data: null };
  return { present: true, data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(asArray(values).filter(Boolean))];
}

function renderList(values) {
  const items = unique(values);
  return items.length ? items.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`).join("\n") : "- None specified";
}

function parseSuggestion(stdout) {
  const fields = {};
  for (const line of stdout.split(/\r?\n/u)) {
    const match = line.match(/^([^:]+):\s*(.*)$/u);
    if (!match) continue;
    fields[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return fields;
}

function runTaskSuggestion() {
  const script = "scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs";
  const result = spawnSync(NODE_COMMAND, [absolutePath(script)], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false
  });

  return {
    command: `node ${script}`,
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    fields: parseSuggestion(result.stdout ?? "")
  };
}

function findTaskById(queue, taskId) {
  return asArray(queue.taskCandidates).find((task) => task.id === taskId) ?? null;
}

function selectNextApprovedAgent(backlog) {
  return [...asArray(backlog.entries)]
    .filter((entry) => entry.alreadyHumanApproved === true)
    .filter((entry) => APPROVED_BUILD_STATUSES.has(entry.status))
    .sort((a, b) => Number(a.suggestedBuildOrder ?? 9999) - Number(b.suggestedBuildOrder ?? 9999))[0] ?? null;
}

function expectedApprovedAgentFiles(entry) {
  if (!entry) return [];
  return unique([
    ...asArray(entry.requiredDocs),
    ...asArray(entry.requiredRegisters),
    ...asArray(entry.requiredValidationScripts),
    PATHS.agentCatalog,
    PATHS.approvedBuildBacklog,
    PATHS.agentBuildProposals,
    "project-register/continuity-dependency-map.json",
    "todolist/WORK_MAP.md",
    "todolist/TODO_INDEX.md"
  ]);
}

function productReadinessSummary(productReadiness) {
  const modules = productReadiness.modules && typeof productReadiness.modules === "object" ? Object.entries(productReadiness.modules) : [];
  const blockedOrReview = modules
    .filter(([, module]) => ["blocked", "review_required"].includes(String(module.status ?? "").toLowerCase()) || ["high", "critical"].includes(String(module.riskLevel ?? module.risk ?? "").toLowerCase()))
    .map(([id, module]) => `${id} (${module.status ?? "status_unknown"}${module.riskLevel || module.risk ? `, risk ${module.riskLevel ?? module.risk}` : ""})`);

  return {
    moduleCount: modules.length,
    blockedOrReview: blockedOrReview.slice(0, 12)
  };
}

function optionalRegisterSummary(label, optionalRegister) {
  if (!optionalRegister.present) return `${label}: not present`;
  const data = optionalRegister.data;
  if (Array.isArray(data)) return `${label}: present (${data.length} top-level entries)`;
  if (data && typeof data === "object") return `${label}: present (keys: ${Object.keys(data).slice(0, 10).join(", ") || "none"})`;
  return `${label}: present`;
}

function buildRepoTaskRoute(context) {
  const { autopilot, queue, riskClassifier, definitionOfDone, suggestion } = context;
  const selectedTaskId = suggestion.fields["task id"];
  const selectedTask = selectedTaskId ? findTaskById(queue, selectedTaskId) : null;
  const riskLevel = selectedTask?.riskLevel ?? suggestion.fields["risk level"] ?? "high";
  const normalizedRisk = String(riskLevel).toLowerCase();
  const doneKey = selectedTask?.definitionOfDoneKey ?? suggestion.fields["definition of done"];
  const done = doneKey ? definitionOfDone.taskTypes?.[doneKey] : null;
  const workflowWriteAllowed = Boolean(selectedTask) && !HIGH_RISK_LEVELS.has(normalizedRisk) && autopilot.activationState !== "dry_run_only";

  return {
    mode: "repo_task",
    source: PATHS.queue,
    sourceDetail: suggestion.command,
    selectedLabel: selectedTask ? `${selectedTask.id} — ${selectedTask.title}` : "none",
    selectedId: selectedTask?.id ?? "none",
    riskLevel: normalizedRisk,
    riskDescription: riskClassifier.riskLevels?.[normalizedRisk]?.description ?? "No matching risk definition found; treat as high risk.",
    definitionOfDoneKey: doneKey ?? "missing",
    requiredEvidence: asArray(done?.requiredEvidence),
    allowedFiles: unique([
      PATHS.autopilot,
      PATHS.queue,
      PATHS.riskClassifier,
      PATHS.definitionOfDone,
      PATHS.productReadiness,
      PATHS.researchRecommendations,
      PATHS.adaptiveUserInsights,
      ...asArray(selectedTask?.allowedFiles)
    ]),
    forbiddenFiles: unique([...asArray(queue.globalForbiddenFiles), ...asArray(selectedTask?.forbiddenFiles), ...asArray(autopilot.forbiddenActions)]),
    stopConditions: unique([...asArray(autopilot.stopConditions), ...asArray(queue.globalForbiddenChanges), ...asArray(selectedTask?.stopConditions)]),
    checks: unique([
      ...asArray(autopilot.requiredChecks),
      ...asArray(queue.defaultRequiredChecks),
      ...asArray(selectedTask?.requiredChecks),
      ...asArray(done?.requiredChecks)
    ]),
    permissions: {
      dryRunWritesAllowed: false,
      workflowWritesAllowed: workflowWriteAllowed,
      workflowCommitAllowed: workflowWriteAllowed,
      workflowPrHandoffAllowed: workflowWriteAllowed,
      reason: workflowWriteAllowed
        ? "Low/medium-risk repository task may proceed only through the normal scoped workflow after the dry run; dry-run invocation itself remains non-mutating."
        : "No selected low/medium-risk repository task is available or Autopilot is dry-run-only/high-risk."
    },
    suggestion
  };
}

function buildApprovedAgentRoute(context) {
  const { policy, state, backlog, catalog, proposals, selectedApprovedAgent } = context;
  const maxOne = Number(policy.maxAgentsPerRun) === 1;
  const nonMutatingDryRun = APPROVED_BUILD_POLICY_STATES.has(policy.activationState) && state.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE;
  const docsExecutionActivated = policy.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE;
  const catalogMatches = selectedApprovedAgent ? asArray(catalog.entries).filter((entry) => asArray(selectedApprovedAgent.connectedAgents).includes(entry.id)).map((entry) => entry.id) : [];
  const existingProposal = selectedApprovedAgent ? asArray(proposals.entries).find((entry) => entry.sourceApprovedBacklogId === selectedApprovedAgent.id || entry.proposedAgentName === selectedApprovedAgent.proposedAgentName) : null;
  const routeAllowed = Boolean(selectedApprovedAgent) && maxOne && nonMutatingDryRun;

  return {
    mode: "approved_agent_build",
    source: PATHS.approvedBuildBacklog,
    sourceDetail: `${PATHS.approvedBuildBacklog} via ${PATHS.approvedBuildPolicy}`,
    selectedLabel: selectedApprovedAgent ? `${selectedApprovedAgent.id} — ${selectedApprovedAgent.proposedAgentName}` : "none",
    selectedId: selectedApprovedAgent?.id ?? "none",
    riskLevel: selectedApprovedAgent?.riskLevel ?? "unknown",
    definitionOfDoneKey: selectedApprovedAgent?.definitionOfDoneKey ?? "approved_agent_build_runner_policy",
    requiredEvidence: [
      `Existing generated proposal: ${existingProposal ? existingProposal.id : "none yet"}`,
      `Catalog-connected agents matched: ${catalogMatches.length ? catalogMatches.join(", ") : "none"}`,
      `maxAgentsPerRun is 1: ${maxOne}`,
      `Runner state is ${ACTIVE_DOCS_REGISTER_BUILD_STATE}: ${state.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE}`
    ],
    allowedFiles: unique([...expectedApprovedAgentFiles(selectedApprovedAgent), ...asArray(policy.allowedPaths)]),
    forbiddenFiles: asArray(policy.forbiddenPaths),
    stopConditions: unique([
      "no_eligible_human_approved_backlog_entry",
      "max_agents_per_run_is_not_1",
      "runner_policy_or_state_not_single_agent_docs_register_build",
      "candidate_requires_runtime_or_protected_files",
      "candidate_touches_forbidden_paths",
      "required_check_fails_for_code_reason",
      "missing_or_pending_check_evidence",
      "would_merge_deploy_self_approve_or_auto_repair",
      ...asArray(policy.missingCheckHandlingRules),
      ...asArray(policy.unsafeRepairStopRules)
    ]),
    checks: unique([
      ...asArray(policy.requiredPreBuildChecks),
      ...asArray(policy.requiredBuildChecks),
      ...asArray(policy.requiredPostBuildChecks),
      ...asArray(policy.requiredPostPRChecks),
      ...asArray(policy.requiredMergeGateChecks)
    ]),
    permissions: {
      dryRunWritesAllowed: false,
      workflowWritesAllowed: routeAllowed && docsExecutionActivated,
      workflowCommitAllowed: routeAllowed && docsExecutionActivated,
      workflowPrHandoffAllowed: routeAllowed && docsExecutionActivated,
      reason: routeAllowed && docsExecutionActivated
        ? "Approved-agent build policy allows one already human-approved docs/register/validator agent build outside this dry-run; dry-run invocation itself remains non-mutating."
        : "Approved-agent build route is not executable until policy/state, maxAgentsPerRun, and an eligible backlog entry all align."
    }
  };
}

function chooseRoute(context) {
  const { autopilot, policy, state, selectedApprovedAgent } = context;
  const rule = autopilot.routingRule ?? {};
  const approvedBuildRouteAvailable = Boolean(selectedApprovedAgent)
    && policy.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE
    && state.activationState === ACTIVE_DOCS_REGISTER_BUILD_STATE
    && Number(policy.maxAgentsPerRun) === 1;

  if (approvedBuildRouteAvailable) {
    return {
      route: buildApprovedAgentRoute(context),
      decisionReason: rule.conflictResolution ?? "Approved-agent build route is available and takes precedence so Autopilot and the approved build runner select the same next work."
    };
  }

  return {
    route: buildRepoTaskRoute(context),
    decisionReason: rule.repoTaskFallback ?? "No eligible approved-agent build route is available; fall back to the general repo/task queue."
  };
}

function renderReport(context, routeDecision) {
  const { autopilot, productReadiness, researchRecommendations, adaptiveUserInsights } = context;
  const { route, decisionReason } = routeDecision;
  const readiness = productReadinessSummary(productReadiness);

  console.log("WellFit Agent Autopilot Orchestrator Dry Run");
  console.log("");
  console.log("Result: DRY_RUN");
  console.log(`Activation state: ${autopilot.activationState}`);
  console.log(`Routing rule: ${autopilot.routingRule?.id ?? "missing"}`);
  console.log(`Decision: ${decisionReason}`);
  console.log(`No merge/deploy: ${autopilot.noMergeNoDeployRule?.message ?? "Autopilot never merges or deploys."}`);
  console.log("");
  console.log("Chosen route:");
  console.log(`- Mode: ${route.mode}`);
  console.log(`- Source: ${route.source}`);
  console.log(`- Source detail: ${route.sourceDetail}`);
  console.log(`- Selected task/agent: ${route.selectedLabel}`);
  console.log(`- Selected id: ${route.selectedId}`);
  console.log(`- Risk level: ${route.riskLevel}`);
  console.log(`- Definition of done: ${route.definitionOfDoneKey}`);
  console.log("");
  console.log("Allowed files:");
  console.log(renderList(route.allowedFiles));
  console.log("");
  console.log("Forbidden files/actions:");
  console.log(renderList(route.forbiddenFiles));
  console.log("");
  console.log("Stop conditions:");
  console.log(renderList(route.stopConditions));
  console.log("");
  console.log("Checks to run:");
  console.log(renderList(route.checks));
  console.log("");
  console.log("Write / commit / PR handoff permissions:");
  console.log(`- Dry-run writes allowed: ${route.permissions.dryRunWritesAllowed}`);
  console.log(`- Workflow writes allowed after dry run: ${route.permissions.workflowWritesAllowed}`);
  console.log(`- Workflow commit allowed after dry run: ${route.permissions.workflowCommitAllowed}`);
  console.log(`- Workflow PR handoff allowed after dry run: ${route.permissions.workflowPrHandoffAllowed}`);
  console.log(`- Permission reason: ${route.permissions.reason}`);
  console.log("");
  console.log("Required evidence:");
  console.log(renderList(route.requiredEvidence));
  console.log("");
  console.log("Required first-read files:");
  console.log(renderList(autopilot.requiredFirstReadFiles));
  console.log("");
  console.log("Product readiness context:");
  console.log(`- Modules tracked: ${readiness.moduleCount}`);
  console.log("- Blocked/review/high-risk modules noted:");
  console.log(renderList(readiness.blockedOrReview));
  console.log("");
  console.log("Optional insight/research context:");
  console.log(`- ${optionalRegisterSummary("Research recommendations", researchRecommendations)}`);
  console.log(`- ${optionalRegisterSummary("Adaptive user insights", adaptiveUserInsights)}`);

  if (route.mode === "repo_task" && route.suggestion) {
    console.log("");
    console.log("Task selection memory:");
    console.log(`- Recently completed tasks considered: ${route.suggestion.fields["recently completed tasks considered"] ?? "not reported"}`);
    console.log(`- Skipped by cooldown: ${route.suggestion.fields["skipped by cooldown"] ?? "not reported"}`);
    console.log(`- Loop guard active: ${route.suggestion.fields["loop guard active"] ?? "not reported"}`);
    console.log(`- Task category: ${route.suggestion.fields["task category"] ?? "not reported"}`);
    console.log("");
    console.log("Suggestion script output:");
    console.log(route.suggestion.stdout.trim() || "(no stdout)");
    if (route.suggestion.stderr.trim()) {
      console.log("");
      console.log("Suggestion script stderr:");
      console.log(route.suggestion.stderr.trim());
    }
  }

  console.log("");
  console.log("Autopilot reminder: this dry run completed without writing files, selected exactly one path, and did not write files. Stop before implementation outside the chosen mode, merge, deployment, self-approval, protected work, or conflicting task execution.");
}

export function main() {
  const context = {
    autopilot: readJson(PATHS.autopilot),
    queue: readJson(PATHS.queue),
    riskClassifier: readJson(PATHS.riskClassifier),
    definitionOfDone: readJson(PATHS.definitionOfDone),
    productReadiness: readJson(PATHS.productReadiness),
    researchRecommendations: readJsonWhenPresent(PATHS.researchRecommendations),
    adaptiveUserInsights: readJsonWhenPresent(PATHS.adaptiveUserInsights),
    policy: readJson(PATHS.approvedBuildPolicy),
    state: readJson(PATHS.approvedBuildState),
    backlog: readJson(PATHS.approvedBuildBacklog),
    catalog: readJson(PATHS.agentCatalog),
    proposals: readJson(PATHS.agentBuildProposals)
  };

  context.suggestion = runTaskSuggestion();
  context.selectedApprovedAgent = selectNextApprovedAgent(context.backlog);

  const routeDecision = chooseRoute(context);
  renderReport(context, routeDecision);
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
