#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "scripts", "wellfit-dev-agent", "output");
const QUALITY_REPORT_PATH = path.join(OUTPUT_DIR, "quality-gate-report.md");
const NODE_COMMAND = process.execPath;

const agentSteps = [
  { label: "Agent config validation", script: "scripts/wellfit-dev-agent/src/validate-agent-config.mjs", displayCommand: "npm run agent:validate" },
  { label: "Alpha goal check", script: "scripts/wellfit-dev-agent/src/alpha-goal-check.mjs", displayCommand: "npm run agent:goal-check" },
  { label: "Memory sync", script: "scripts/wellfit-dev-agent/src/memory-sync.mjs", displayCommand: "npm run agent:memory-sync" },
  { label: "Coder prompt generation", script: "scripts/wellfit-dev-agent/src/generate-coder-prompts.mjs", displayCommand: "npm run agent:coder-prompts" },
  { label: "Dry run planning", script: "scripts/wellfit-dev-agent/src/dry-run.mjs", displayCommand: "npm run agent:dry-run" },
  { label: "Stufe 4 governance check", script: "scripts/wellfit-dev-agent/src/stufe4-governance-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/stufe4-governance-check.mjs" },
  { label: "Agent governance control check", script: "scripts/wellfit-dev-agent/src/agent-governance-control-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/agent-governance-control-check.mjs" },
  { label: "Product readiness check", script: "scripts/wellfit-dev-agent/src/product-readiness-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/product-readiness-check.mjs" },
  { label: "Website agent framework check", script: "scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs" },
  { label: "Website agent backlog check", script: "scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs" },
  { label: "Continuity dependency sentinel check", script: "scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs" },
  { label: "Route API register check", script: "scripts/wellfit-dev-agent/src/route-api-register-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/route-api-register-check.mjs" },
  { label: "Visual route smoke check", script: "scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs", args: ["--report-only"], displayCommand: "node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs --report-only" },
  { label: "Route/API drift detector", script: "scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs" },
  { label: "Concept-to-code gap analyzer", script: "scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs" },
  { label: "Site route audit", script: "scripts/wellfit-dev-agent/src/site-route-audit.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/site-route-audit.mjs" },
  { label: "Mobile Buddy UX audit", script: "scripts/wellfit-dev-agent/src/mobile-buddy-ux-audit.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/mobile-buddy-ux-audit.mjs" },
  { label: "Feedback loop audit", script: "scripts/wellfit-dev-agent/src/feedback-loop-audit.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/feedback-loop-audit.mjs" },
  { label: "Firebase security audit", script: "scripts/wellfit-dev-agent/src/firebase-security-audit.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/firebase-security-audit.mjs" },
  { label: "Firestore emulator test plan check", script: "scripts/wellfit-dev-agent/src/firestore-emulator-test-plan-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/firestore-emulator-test-plan-check.mjs" },
  { label: "Mission Buddy Economy audit", script: "scripts/wellfit-dev-agent/src/mission-buddy-economy-audit.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/mission-buddy-economy-audit.mjs" },
  { label: "Firestore economy rules check", script: "scripts/wellfit-dev-agent/src/firestore-economy-rules-check.mjs", displayCommand: "npm run agent:firestore-economy-rules-check" },
  { label: "Next agent task suggestion", script: "scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs" },
  { label: "Agent Autopilot dry run", script: "scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs" },
  { label: "Batch Autopilot dry run", script: "scripts/wellfit-dev-agent/src/autopilot-batch-dry-run.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/autopilot-batch-dry-run.mjs" },
  { label: "Batch Autopilot limited execution check", script: "scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs" },
  { label: "Batch Execution Runner check", script: "scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs" },
  { label: "Auto-merge eligibility check", script: "scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs" },
  { label: "Auto-repair decision check", script: "scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs" },
  { label: "PR post-creation guard check", script: "scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs" },
  { label: "Follow-up detector", script: "scripts/wellfit-dev-agent/src/follow-up-detector.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/follow-up-detector.mjs" },
  { label: "PR outcome recorder dry run", script: "scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs", args: ["--dry-run"], displayCommand: "node scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs --dry-run" },
  { label: "TODO status sync", script: "scripts/wellfit-dev-agent/src/todo-status-sync.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/todo-status-sync.mjs" },
  { label: "Task status work-log sync check", script: "scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs" },
  { label: "Master roadmap task check", script: "scripts/wellfit-dev-agent/src/master-roadmap-task-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/master-roadmap-task-check.mjs" },
  { label: "Research recommendation check", script: "scripts/wellfit-dev-agent/src/research-recommendation-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/research-recommendation-check.mjs" },
  { label: "Adaptive user insight check", script: "scripts/wellfit-dev-agent/src/adaptive-user-insight-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/adaptive-user-insight-check.mjs" },
  { label: "Cross-reference maintenance check", script: "scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs" },
  { label: "Repository inventory check", script: "scripts/wellfit-dev-agent/src/repository-inventory-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/repository-inventory-check.mjs" },
  { label: "PR review policy check", script: "scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs" },
  { label: "PR diff review report", script: "scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs" },
  { label: "Agent extension policy check", script: "scripts/wellfit-dev-agent/src/agent-extension-policy-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/agent-extension-policy-check.mjs" },
  { label: "Agent catalog/backlog check", script: "scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs" },
  { label: "Agent Architect proposal check", script: "scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs" },
  { label: "Generate next agent build proposal", script: "scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs", displayCommand: "node scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs" }
];

function runNodeStep(step) {
  const scriptPath = path.join(ROOT, step.script);
  const result = spawnSync(NODE_COMMAND, [scriptPath, ...(step.args ?? [])], { cwd: ROOT, encoding: "utf8", shell: false });
  return { label: step.label, command: step.displayCommand, exitCode: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "", ok: result.status === 0 };
}

function readTextSafe(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
  return fs.readFileSync(absolutePath, "utf8");
}

function parseNumber(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}:\\s*(\\d+)`, "i"));
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseCoveredTracks(text) {
  const direct = text.match(/Covered tracks:\s*(\d+)\/(\d+)/i);
  if (direct) return { covered: Number.parseInt(direct[1], 10), total: Number.parseInt(direct[2], 10) };
  const markdown = text.match(/Covered[^\n\r]*?(\d+)\s*\/\s*(\d+)/i);
  if (markdown) return { covered: Number.parseInt(markdown[1], 10), total: Number.parseInt(markdown[2], 10) };
  return { covered: null, total: null };
}

function extractMarkdownListSection(text, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`## ${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  const match = text.match(regex);
  if (!match) return [];
  return match[1].split(/\r?\n/u).map((line) => line.trim()).filter((line) => line.startsWith("- `") && line.endsWith("`"))
    .map((line) => line.replace(/^- `/, "").replace(/`$/, ""));
}

function formatDetailCount(count, files) {
  if (count === null) return "not found";
  if (!files || files.length === 0) return String(count);
  return `${count}: ${files.join(", ")}`;
}

function assertCondition(checks, name, passed, details) { checks.push({ name, passed, details }); }

function renderStep(step) {
  return `### ${step.label}\n\n- Command: \`${step.command}\`\n- Exit code: ${step.exitCode}\n- Result: ${step.ok ? "PASS" : "FAIL"}\n\n<details><summary>stdout</summary>\n\n\`\`\`text\n${step.stdout.trim()}\n\`\`\`\n</details>\n\n${step.stderr.trim() ? `<details><summary>stderr</summary>\n\n\`\`\`text\n${step.stderr.trim()}\n\`\`\`\n</details>\n` : ""}`;
}

function renderChecks(checks) {
  return ["| Check | Status | Details |", "|---|---|---|", ...checks.map((check) => `| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${check.details} |`)].join("\n");
}

function getStep(steps, label) { return steps.find((step) => step.label === label); }

function main() {
  const steps = agentSteps.map(runNodeStep);
  const checks = [];
  for (const step of steps) assertCondition(checks, `${step.label} exits successfully`, step.ok, `exitCode=${step.exitCode}`);

  const goalReport = readTextSafe("scripts/wellfit-dev-agent/output/alpha-goal-check.md");
  const memoryReport = readTextSafe("scripts/wellfit-dev-agent/output/memory-sync-report.md");
  const dryRunReport = readTextSafe("scripts/wellfit-dev-agent/output/dry-run-report.md");
  const rulesReport = readTextSafe("scripts/wellfit-dev-agent/output/firestore-economy-rules-check.md");
  const governanceReport = readTextSafe("scripts/wellfit-dev-agent/output/stufe4-governance-check.md");
  const agentGovernanceControlReport = readTextSafe("scripts/wellfit-dev-agent/output/agent-governance-control-check.md");
  const productReadinessReport = readTextSafe("scripts/wellfit-dev-agent/output/product-readiness-check.md");
  const websiteAgentFrameworkStep = getStep(steps, "Website agent framework check");
  const websiteAgentBacklogReport = readTextSafe("scripts/wellfit-dev-agent/output/website-agent-backlog-report.md");
  const websiteAgentBacklogStep = getStep(steps, "Website agent backlog check");
  const routeApiReport = readTextSafe("scripts/wellfit-dev-agent/output/route-api-register-check.md");
  const visualRouteSmokeReport = readTextSafe("scripts/wellfit-dev-agent/output/visual-route-smoke-check.md");
  const routeApiDriftReport = readTextSafe("scripts/wellfit-dev-agent/output/route-api-drift-detector.md");
  const conceptToCodeGapReport = readTextSafe("scripts/wellfit-dev-agent/output/concept-to-code-gap-analyzer.md");
  const siteRouteReport = readTextSafe("scripts/wellfit-dev-agent/output/site-route-audit-report.md");
  const mobileBuddyUxReport = readTextSafe("scripts/wellfit-dev-agent/output/mobile-buddy-ux-audit.md");
  const feedbackLoopReport = readTextSafe("scripts/wellfit-dev-agent/output/feedback-loop-audit.md");
  const firebaseSecurityReport = readTextSafe("scripts/wellfit-dev-agent/output/firebase-security-audit.md");
  const emulatorPlanReport = readTextSafe("scripts/wellfit-dev-agent/output/firestore-emulator-test-plan-check.md");
  const missionBuddyEconomyReport = readTextSafe("scripts/wellfit-dev-agent/output/mission-buddy-economy-audit.md");
  const masterRoadmapTaskReport = readTextSafe("scripts/wellfit-dev-agent/output/master-roadmap-task-check.md");
  const researchRecommendationReport = readTextSafe("scripts/wellfit-dev-agent/output/research-recommendation-check.md");
  const adaptiveUserInsightReport = readTextSafe("scripts/wellfit-dev-agent/output/adaptive-user-insight-check.md");
  const crossReferenceMaintenanceReport = readTextSafe("scripts/wellfit-dev-agent/output/cross-reference-maintenance-check.md");
  const repositoryInventoryReport = readTextSafe("scripts/wellfit-dev-agent/output/repository-inventory-check.md");
  const autoMergeEligibilityReport = readTextSafe("scripts/wellfit-dev-agent/output/auto-merge-eligibility-report.md");
  const autoRepairDecisionReport = readTextSafe("scripts/wellfit-dev-agent/output/auto-repair-decision-report.md");
  const prDiffReviewReport = readTextSafe("scripts/wellfit-dev-agent/output/pr-diff-review-report.md");
  const batchLimitedExecutionReport = readTextSafe("scripts/wellfit-dev-agent/output/autopilot-batch-limited-execution-check.md");
  const batchExecutionRunnerReport = readTextSafe("scripts/wellfit-dev-agent/output/batch-execution-runner-check.md");
  const taskStatusWorkLogReport = readTextSafe("scripts/wellfit-dev-agent/output/task-status-work-log-check.md");
  const continuityDependencyReport = readTextSafe("scripts/wellfit-dev-agent/output/continuity-dependency-report.md");
  const agentExtensionPolicyReport = readTextSafe("scripts/wellfit-dev-agent/output/agent-extension-policy-report.md");
  const agentCatalogBacklogReport = readTextSafe("scripts/wellfit-dev-agent/output/agent-catalog-backlog-report.md");
  const agentArchitectProposalReport = readTextSafe("scripts/wellfit-dev-agent/output/agent-architect-proposal-report.md");
  const nextAgentBuildProposalReport = readTextSafe("scripts/wellfit-dev-agent/output/next-agent-build-proposal.md");

  const alphaStep = getStep(steps, "Alpha goal check");
  const dryRunStep = getStep(steps, "Dry run planning");
  const memoryStep = getStep(steps, "Memory sync");
  const rulesStep = getStep(steps, "Firestore economy rules check");
  const nextTaskStep = getStep(steps, "Next agent task suggestion");
  const autopilotDryRunStep = getStep(steps, "Agent Autopilot dry run");
  const batchAutopilotDryRunStep = getStep(steps, "Batch Autopilot dry run");
  const batchLimitedExecutionStep = getStep(steps, "Batch Autopilot limited execution check");
  const batchExecutionRunnerStep = getStep(steps, "Batch Execution Runner check");
  const autoMergeEligibilityStep = getStep(steps, "Auto-merge eligibility check");
  const autoRepairDecisionStep = getStep(steps, "Auto-repair decision check");
  const followUpDetectorStep = getStep(steps, "Follow-up detector");
  const prOutcomeRecorderStep = getStep(steps, "PR outcome recorder dry run");
  const todoStatusStep = getStep(steps, "TODO status sync");
  const taskStatusWorkLogStep = getStep(steps, "Task status work-log sync check");
  const routeApiDriftStep = getStep(steps, "Route/API drift detector");
  const visualRouteSmokeStep = getStep(steps, "Visual route smoke check");
  const conceptToCodeGapStep = getStep(steps, "Concept-to-code gap analyzer");
  const prReviewPolicyStep = getStep(steps, "PR review policy check");
  const prDiffReviewStep = getStep(steps, "PR diff review report");
  const continuityDependencyStep = getStep(steps, "Continuity dependency sentinel check");
  const agentExtensionPolicyStep = getStep(steps, "Agent extension policy check");
  const agentCatalogBacklogStep = getStep(steps, "Agent catalog/backlog check");
  const agentArchitectProposalStep = getStep(steps, "Agent Architect proposal check");
  const nextAgentBuildProposalStep = getStep(steps, "Generate next agent build proposal");

  const covered = parseCoveredTracks(`${goalReport}\n${alphaStep?.stdout ?? ""}`);
  const missingIndex = parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Missing in TODO index/structure memory") ?? parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Missing in index");
  const missingPrompts = parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Files requiring KI-Fortsetzungs-Prompt but missing it") ?? parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Files without KI-Fortsetzungs-Prompt") ?? parseNumber(`${memoryReport}\n${memoryStep?.stdout ?? ""}`, "Missing prompts");
  const missingIndexFiles = extractMarkdownListSection(memoryReport, "Files Missing In Index");
  const missingPromptFiles = extractMarkdownListSection(memoryReport, "Files Missing KI-Fortsetzungs-Prompt");
  const plannedMicroTasks = parseNumber(`${dryRunReport}\n${dryRunStep?.stdout ?? ""}`, "Planned micro-tasks");
  const rulesReportPassed = /Result:\s*PASS/i.test(`${rulesReport}\n${rulesStep?.stdout ?? ""}`);
  const nextTaskSuggestionPassed = /Result:\s*TASK_SELECTED/i.test(nextTaskStep?.stdout ?? "");
  const autopilotDryRunPassed = /Result:\s*DRY_RUN/i.test(autopilotDryRunStep?.stdout ?? "") && /dry run completed without writing files/i.test(autopilotDryRunStep?.stdout ?? "");
  const batchAutopilotDryRunPassed = /BATCH_AUTOPILOT_MODE=DRY_RUN/i.test(batchAutopilotDryRunStep?.stdout ?? "") && /Result:\s*DRY_RUN/i.test(batchAutopilotDryRunStep?.stdout ?? "") && /Never writes files:\s*true/i.test(batchAutopilotDryRunStep?.stdout ?? "") && /Never merges:\s*true/i.test(batchAutopilotDryRunStep?.stdout ?? "") && /Never repairs:\s*true/i.test(batchAutopilotDryRunStep?.stdout ?? "") && /future consideration only/i.test(batchAutopilotDryRunStep?.stdout ?? "");
  const batchLimitedExecutionPassed = /Mode:\s*REPORT_CHECK_ONLY/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`) && /BATCH_LIMITED_EXECUTION_READY=(?:true|false)/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`) && /Never executes tasks in first version:\s*true/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`) && /Never creates pull requests in first version:\s*true/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`) && /Never merges:\s*true/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`) && /Never repairs:\s*true/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${batchLimitedExecutionReport}\n${batchLimitedExecutionStep?.stdout ?? ""}`);
  const batchExecutionRunnerReady = /Mode:\s*REPORT_CHECK_ONLY/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`) && /BATCH_EXECUTION_RUNNER_READY=(?:true|false)/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`) && /Never executes tasks:\s*true/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`) && /Never creates PRs:\s*true/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`) && /Never merges:\s*true/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`) && /Never repairs:\s*true/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${batchExecutionRunnerReport}\n${batchExecutionRunnerStep?.stdout ?? ""}`);
  const followUpDetectorPassed = /Result:\s*REPORT_ONLY/i.test(followUpDetectorStep?.stdout ?? "");
  const autoMergeEligibilityReportOnly = /Mode:\s*REPORT_ONLY/i.test(`${autoMergeEligibilityReport}\n${autoMergeEligibilityStep?.stdout ?? ""}`) && /Never merges:\s*true/i.test(`${autoMergeEligibilityReport}\n${autoMergeEligibilityStep?.stdout ?? ""}`) && /AUTO_MERGE_ELIGIBLE=(?:true|false)/i.test(`${autoMergeEligibilityReport}\n${autoMergeEligibilityStep?.stdout ?? ""}`);
  const autoRepairDecisionReportOnly = /Mode:\s*REPORT_ONLY/i.test(`${autoRepairDecisionReport}\n${autoRepairDecisionStep?.stdout ?? ""}`) && /Never repairs:\s*true/i.test(`${autoRepairDecisionReport}\n${autoRepairDecisionStep?.stdout ?? ""}`) && /Never merges:\s*true/i.test(`${autoRepairDecisionReport}\n${autoRepairDecisionStep?.stdout ?? ""}`) && /AUTO_REPAIR_ALLOWED=(?:true|false)/i.test(`${autoRepairDecisionReport}\n${autoRepairDecisionStep?.stdout ?? ""}`);
  const prOutcomeRecorderPassed = /Mode:\s*DRY_RUN/i.test(prOutcomeRecorderStep?.stdout ?? "");
  const todoStatusSyncPassed = /Result:\s*PASS/i.test(todoStatusStep?.stdout ?? "");
  const taskStatusWorkLogReady = /Mode:\s*REPORT_ONLY/i.test(`${taskStatusWorkLogReport}\n${taskStatusWorkLogStep?.stdout ?? ""}`) && /Never rewrites files:\s*true/i.test(`${taskStatusWorkLogReport}\n${taskStatusWorkLogStep?.stdout ?? ""}`) && /TASK_STATUS_SYNC_READY=true/i.test(`${taskStatusWorkLogReport}\n${taskStatusWorkLogStep?.stdout ?? ""}`);
  const routeApiDriftPassed = /Result:\s*PASS(?:_WITH_WARNINGS)?/i.test(`${routeApiDriftReport}\n${routeApiDriftStep?.stdout ?? ""}`);
  const visualRouteSmokePassed = /Result:\s*(?:PASS|PASS_WITH_WARNINGS|SKIPPED_BROWSER_UNAVAILABLE|SKIPPED_BASE_URL_UNAVAILABLE|REPORT_ONLY)/i.test(`${visualRouteSmokeReport}\n${visualRouteSmokeStep?.stdout ?? ""}`);
  const conceptToCodeGapPassed = /Result:\s*PASS(?:_WITH_WARNINGS)?/i.test(`${conceptToCodeGapReport}\n${conceptToCodeGapStep?.stdout ?? ""}`);
  const prReviewPolicyReady = /Mode:\s*REPORT_ONLY/i.test(prReviewPolicyStep?.stdout ?? "") && /Never approves PRs:\s*true/i.test(prReviewPolicyStep?.stdout ?? "") && /Never merges PRs:\s*true/i.test(prReviewPolicyStep?.stdout ?? "") && /Never repairs files:\s*true/i.test(prReviewPolicyStep?.stdout ?? "") && /Never modifies files:\s*true/i.test(prReviewPolicyStep?.stdout ?? "") && /PR_REVIEW_POLICY_READY=true/i.test(prReviewPolicyStep?.stdout ?? "");
  const prDiffReviewReady = /Mode:\s*REPORT_ONLY/i.test(`${prDiffReviewReport}\n${prDiffReviewStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${prDiffReviewReport}\n${prDiffReviewStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${prDiffReviewReport}\n${prDiffReviewStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${prDiffReviewReport}\n${prDiffReviewStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${prDiffReviewReport}\n${prDiffReviewStep?.stdout ?? ""}`) && /PR_DIFF_REVIEW_READY=(?:true|false)/i.test(`${prDiffReviewReport}\n${prDiffReviewStep?.stdout ?? ""}`);
  const websiteAgentFrameworkReady = /Mode:\s*REPORT_ONLY/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /Never modifies files:\s*true/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /Never updates runtime pages:\s*true/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /Never approves PRs:\s*true/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /Never merges:\s*true/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /Never repairs:\s*true/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /Never deploys:\s*true/i.test(websiteAgentFrameworkStep?.stdout ?? "") && /WEBSITE_AGENT_FRAMEWORK_READY=true/i.test(websiteAgentFrameworkStep?.stdout ?? "");
  const websiteAgentBacklogReady = /Mode:\s*REPORT_ONLY/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`) && /Never modifies runtime pages:\s*true/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`) && /WEBSITE_AGENT_BACKLOG_READY=true/i.test(`${websiteAgentBacklogReport}\n${websiteAgentBacklogStep?.stdout ?? ""}`);
  const continuityDependencyReady = /Mode:\s*REPORT_ONLY/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /Never modifies files automatically:\s*true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /Never creates tasks automatically:\s*true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`) && /CONTINUITY_DEPENDENCY_SENTINEL_READY=true/i.test(`${continuityDependencyReport}\n${continuityDependencyStep?.stdout ?? ""}`);
  const agentExtensionPolicyReady = /Mode:\s*REPORT_ONLY/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /Never creates agents:\s*true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /Never creates agent registers:\s*true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`) && /AGENT_EXTENSION_POLICY_READY=true/i.test(`${agentExtensionPolicyReport}\n${agentExtensionPolicyStep?.stdout ?? ""}`);
  const agentCatalogBacklogReady = /Mode:\s*REPORT_ONLY/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /Never creates agents automatically:\s*true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /Never modifies runtime files:\s*true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`) && /AGENT_CATALOG_BACKLOG_READY=true/i.test(`${agentCatalogBacklogReport}\n${agentCatalogBacklogStep?.stdout ?? ""}`);
  const agentArchitectProposalReady = /Mode:\s*REPORT_ONLY/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /Never builds agents:\s*true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /Never modifies runtime files:\s*true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`) && /AGENT_ARCHITECT_PROPOSAL_READY=true/i.test(`${agentArchitectProposalReport}\n${agentArchitectProposalStep?.stdout ?? ""}`);
  const nextAgentBuildProposalReady = /Mode:\s*REPORT_ONLY/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /Never creates agents automatically:\s*true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /Never modifies runtime files:\s*true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /Never approves PRs:\s*true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /Never merges PRs:\s*true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /Never repairs files:\s*true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /Never deploys:\s*true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`) && /NEXT_AGENT_BUILD_PROPOSAL_READY=true/i.test(`${nextAgentBuildProposalReport}\n${nextAgentBuildProposalStep?.stdout ?? ""}`);

  assertCondition(checks, "Alpha tracks fully covered", covered.covered !== null && covered.total !== null && covered.covered === covered.total, covered.covered === null ? "not found" : `${covered.covered}/${covered.total}`);
  assertCondition(checks, "TODO index has no missing files", missingIndex === 0, formatDetailCount(missingIndex, missingIndexFiles));
  assertCondition(checks, "Required KI-Fortsetzungs-Prompts complete", missingPrompts === 0, formatDetailCount(missingPrompts, missingPromptFiles));
  assertCondition(checks, "Dry run produced micro-tasks", plannedMicroTasks !== null && plannedMicroTasks > 0, plannedMicroTasks === null ? "not found" : String(plannedMicroTasks));
  assertCondition(checks, "Stufe 4 governance check passed", /Result:\s*PASS/i.test(governanceReport), /Result:\s*PASS/i.test(governanceReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Agent governance control check passed", /Result:\s*PASS/i.test(agentGovernanceControlReport), /Result:\s*PASS/i.test(agentGovernanceControlReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Product readiness check passed", /Result:\s*PASS/i.test(productReadinessReport), /Result:\s*PASS/i.test(productReadinessReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Website agent framework check reported safely", websiteAgentFrameworkReady, websiteAgentFrameworkReady ? "REPORT_ONLY and WEBSITE_AGENT_FRAMEWORK_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Website agent backlog check reported safely", websiteAgentBacklogReady, websiteAgentBacklogReady ? "REPORT_ONLY and WEBSITE_AGENT_BACKLOG_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Continuity dependency sentinel check reported safely", continuityDependencyReady, continuityDependencyReady ? "REPORT_ONLY and CONTINUITY_DEPENDENCY_SENTINEL_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Route/API register check passed", /Result:\s*PASS/i.test(routeApiReport), /Result:\s*PASS/i.test(routeApiReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Route/API drift detector passed", routeApiDriftPassed, routeApiDriftPassed ? "PASS or PASS_WITH_WARNINGS" : "not found or FAIL");
  assertCondition(checks, "Visual route smoke check reported safely", visualRouteSmokePassed, visualRouteSmokePassed ? "PASS, PASS_WITH_WARNINGS, SKIPPED, or REPORT_ONLY" : "not found or unsafe FAIL");
  assertCondition(checks, "Concept-to-code gap analyzer passed", conceptToCodeGapPassed, conceptToCodeGapPassed ? "PASS or PASS_WITH_WARNINGS" : "not found or FAIL");
  assertCondition(checks, "Site route audit passed", /Result:\s*PASS/i.test(siteRouteReport), /Result:\s*PASS/i.test(siteRouteReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Mobile Buddy UX audit passed", /Result:\s*PASS/i.test(mobileBuddyUxReport), /Result:\s*PASS/i.test(mobileBuddyUxReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Feedback loop audit passed", /Result:\s*PASS/i.test(feedbackLoopReport), /Result:\s*PASS/i.test(feedbackLoopReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Firebase security audit passed", /Result:\s*PASS/i.test(firebaseSecurityReport), /Result:\s*PASS/i.test(firebaseSecurityReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Firestore emulator test plan check passed", /Result:\s*PASS/i.test(emulatorPlanReport), /Result:\s*PASS/i.test(emulatorPlanReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Mission Buddy Economy audit passed", /Result:\s*PASS/i.test(missionBuddyEconomyReport), /Result:\s*PASS/i.test(missionBuddyEconomyReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Firestore economy rules check passed", rulesReportPassed, rulesReportPassed ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Next agent task suggestion selected a safe task", nextTaskSuggestionPassed, nextTaskSuggestionPassed ? "TASK_SELECTED" : "not found or STOP");
  assertCondition(checks, "Agent Autopilot dry run reported without rewriting", autopilotDryRunPassed, autopilotDryRunPassed ? "DRY_RUN" : "not found or unsafe output");
  assertCondition(checks, "Batch Autopilot dry run reported without rewriting", batchAutopilotDryRunPassed, batchAutopilotDryRunPassed ? "DRY_RUN" : "not found or unsafe output");
  assertCondition(checks, "Batch Autopilot limited execution check reported without executing", batchLimitedExecutionPassed, batchLimitedExecutionPassed ? "REPORT_CHECK_ONLY" : "not found or unsafe output");
  assertCondition(checks, "Batch Execution Runner check reported without executing", batchExecutionRunnerReady, batchExecutionRunnerReady ? "REPORT_CHECK_ONLY" : "not found or unsafe output");
  assertCondition(checks, "Auto-merge eligibility check reported without merging", autoMergeEligibilityReportOnly, autoMergeEligibilityReportOnly ? "REPORT_ONLY" : "not found or unsafe output");
  assertCondition(checks, "Auto-repair decision check reported without repairing", autoRepairDecisionReportOnly, autoRepairDecisionReportOnly ? "REPORT_ONLY" : "not found or unsafe output");
  assertCondition(checks, "Follow-up detector reported without rewriting", followUpDetectorPassed, followUpDetectorPassed ? "REPORT_ONLY" : "not found or FAIL");
  assertCondition(checks, "PR outcome recorder dry run completed", prOutcomeRecorderPassed, prOutcomeRecorderPassed ? "DRY_RUN" : "not found or FAIL");
  assertCondition(checks, "TODO status sync passed", todoStatusSyncPassed, todoStatusSyncPassed ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Task status/work-log sync check reported safely", taskStatusWorkLogReady, taskStatusWorkLogReady ? "REPORT_ONLY and TASK_STATUS_SYNC_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Master roadmap task check passed", /Result:\s*PASS/i.test(masterRoadmapTaskReport), /Result:\s*PASS/i.test(masterRoadmapTaskReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Research recommendation check passed", /Result:\s*PASS/i.test(researchRecommendationReport), /Result:\s*PASS/i.test(researchRecommendationReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Adaptive user insight check passed", /Result:\s*PASS/i.test(adaptiveUserInsightReport), /Result:\s*PASS/i.test(adaptiveUserInsightReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Cross-reference maintenance check passed", /Result:\s*PASS/i.test(crossReferenceMaintenanceReport), /Result:\s*PASS/i.test(crossReferenceMaintenanceReport) ? "PASS" : "not found or FAIL");
  assertCondition(checks, "Repository inventory check reported safely", /Result:\s*PASS/i.test(repositoryInventoryReport), /Result:\s*PASS/i.test(repositoryInventoryReport) ? "PASS with warning sections allowed" : "not found or FAIL");
  assertCondition(checks, "PR review policy check reported safely", prReviewPolicyReady, prReviewPolicyReady ? "REPORT_ONLY and PR_REVIEW_POLICY_READY=true" : "not found or unsafe output");
  assertCondition(checks, "PR diff review report ran safely", prDiffReviewReady, prDiffReviewReady ? "REPORT_ONLY and PR_DIFF_REVIEW_READY reported" : "not found or unsafe output");
  assertCondition(checks, "Agent extension policy check reported safely", agentExtensionPolicyReady, agentExtensionPolicyReady ? "REPORT_ONLY and AGENT_EXTENSION_POLICY_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Agent catalog/backlog check reported safely", agentCatalogBacklogReady, agentCatalogBacklogReady ? "REPORT_ONLY and AGENT_CATALOG_BACKLOG_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Agent Architect proposal check reported safely", agentArchitectProposalReady, agentArchitectProposalReady ? "REPORT_ONLY and AGENT_ARCHITECT_PROPOSAL_READY=true" : "not found or unsafe output");
  assertCondition(checks, "Next agent build proposal generated safely", nextAgentBuildProposalReady, nextAgentBuildProposalReady ? "REPORT_ONLY and NEXT_AGENT_BUILD_PROPOSAL_READY=true" : "not found or unsafe output");

  const passed = checks.every((check) => check.passed);
  const report = `# WellFit Agent Quality Gate Report\n\nGenerated: ${new Date().toISOString()}\nResult: ${passed ? "PASS" : "FAIL"}\n\n## Gate Checks\n\n${renderChecks(checks)}\n\n## Required Standard\n\n- Agent validation must pass.\n- Alpha goal check must cover all required tracks.\n- Memory sync must report zero missing indexed files.\n- Memory sync must report zero required missing KI-Fortsetzungs-Prompts.\n- Dry run must produce planned micro-tasks.\n- Stufe 4 governance check must pass.\n- Agent governance control check must pass.\n- Website agent framework check must validate website agents, website-readiness routes, Work Map/TODO Index references, and report-only/no-runtime/no-merge/no-repair/no-deploy boundaries.\n- Route/API register check must pass.\n- Visual route smoke check must report safely in optional/report-only mode and must not require browser support.\n- Site route audit must pass.\n- Mobile Buddy UX audit must pass.\n- Feedback loop audit must pass.\n- Firebase security audit must pass.\n- Firestore emulator test plan check must pass.\n- Mission Buddy Economy audit must pass.\n- Firestore economy rules check must pass the current beta allow/deny guardrails.\n- Next agent task suggestion must select a non-blocked safe task.\n- Auto-merge eligibility check must run in report-only mode and confirm it never merges.\n- TODO status sync must report no malformed or unknown status markers.\n- Master roadmap task check must validate imported roadmap task safety and mappings.\n- Research recommendation check must validate internal-first, optional external research, three-option recommendation, risk, human-review, and protected-topic rules.\n- Adaptive user insight check must validate planning-only, aggregate-only, no raw identifiers, sample thresholds, explainability, and high/critical human-review guardrails.\n- Cross-reference maintenance check must validate change categories, referenced files, Work Map/TODO Index links, and major register coverage.\n- PR review policy check must validate required review checklist, protected-area checks, Work Map/TODO Index links, auto-merge reporting, auto-repair reporting, and report-only/no-approval/no-merge/no-repair/no-file-modification boundaries.\n- Agent Extension Policy check must validate extension-vs-new-agent proposal rules, Work Map/TODO Index links, forbidden auto-actions, human-review boundaries, and report-only/no-agent-creation/no-approval/no-merge/no-repair/no-deploy signals.\n\n## Exact Memory Sync Failures\n\n### Files Missing In Index\n\n${missingIndexFiles.length ? missingIndexFiles.map((file) => `- \`${file}\``).join("\n") : "No missing index files reported."}\n\n### Files Missing KI-Fortsetzungs-Prompt\n\n${missingPromptFiles.length ? missingPromptFiles.map((file) => `- \`${file}\``).join("\n") : "No missing continuation prompts reported."}\n\n## Step Logs\n\n${steps.map(renderStep).join("\n\n")}\n\n## Next Action\n\n${passed ? "Quality gate passed. Continue with the next Beta-relevant task." : "Quality gate failed. Fix the failed checks before continuing with larger implementation work."}\n`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(QUALITY_REPORT_PATH, report, "utf8");

  console.log(`WellFit quality gate complete: ${path.relative(ROOT, QUALITY_REPORT_PATH)}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  for (const check of checks) console.log(`${check.passed ? "OK" : "FAIL"}: ${check.name} (${check.details})`);
  if (!passed && missingIndexFiles.length > 0) for (const file of missingIndexFiles) console.log(`- ${file}`);
  if (!passed) process.exit(1);
}

main();
