#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const NODE_COMMAND = process.execPath;
const STOP_RISK_LEVELS = new Set(["high", "critical"]);

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
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None specified";
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

function implementationStatus(riskLevel, autopilot) {
  const normalizedRisk = String(riskLevel ?? "high").toLowerCase();
  if (autopilot.activationState === "dry_run_only") return "planning-only: Autopilot dry run never writes files or implements changes.";
  if (STOP_RISK_LEVELS.has(normalizedRisk)) return "not allowed: high/critical risk requires human approval and stop-before-implementation.";
  if (normalizedRisk === "medium") return "planning-only unless a human explicitly approves scoped runtime work.";
  return "allowed only through normal agent workflow after plan/checks; not by this dry-run script.";
}

function main() {
  const autopilot = readJson("project-register/agent-autopilot.json");
  const queue = readJson("project-register/agent-task-queue.json");
  const riskClassifier = readJson("project-register/risk-classifier.json");
  const definitionOfDone = readJson("project-register/definition-of-done.json");
  const productReadiness = readJson("project-register/product-readiness.json");
  const researchRecommendations = readJsonWhenPresent("project-register/research-recommendations.json");
  const adaptiveUserInsights = readJsonWhenPresent("project-register/adaptive-user-insights.json");

  const suggestion = runTaskSuggestion();
  const selectedTaskId = suggestion.fields["task id"];
  const selectedTask = selectedTaskId ? findTaskById(queue, selectedTaskId) : null;
  const riskLevel = selectedTask?.riskLevel ?? suggestion.fields["risk level"] ?? "high";
  const normalizedRisk = String(riskLevel).toLowerCase();
  const riskDefinition = riskClassifier.riskLevels?.[normalizedRisk] ?? null;
  const doneKey = selectedTask?.definitionOfDoneKey ?? suggestion.fields["definition of done"];
  const done = doneKey ? definitionOfDone.taskTypes?.[doneKey] : null;
  const requiredChecks = unique([
    ...asArray(autopilot.requiredChecks),
    ...asArray(queue.defaultRequiredChecks),
    ...asArray(selectedTask?.requiredChecks),
    ...asArray(done?.requiredChecks)
  ]);
  const affectedFiles = unique([
    "project-register/agent-autopilot.json",
    "project-register/agent-task-queue.json",
    "project-register/risk-classifier.json",
    "project-register/definition-of-done.json",
    "project-register/product-readiness.json",
    "project-register/research-recommendations.json",
    "project-register/adaptive-user-insights.json",
    ...asArray(selectedTask?.allowedFiles)
  ]);
  const forbiddenFiles = unique([
    ...asArray(queue.globalForbiddenFiles),
    ...asArray(selectedTask?.forbiddenFiles)
  ]);
  const stopConditions = unique([
    ...asArray(autopilot.stopConditions),
    ...asArray(queue.globalForbiddenChanges),
    ...asArray(selectedTask?.stopConditions)
  ]);
  const readiness = productReadinessSummary(productReadiness);
  const mustStopForRisk = STOP_RISK_LEVELS.has(normalizedRisk);

  console.log("WellFit Agent Autopilot Dry Run");
  console.log("");
  console.log("Result: DRY_RUN");
  console.log(`Activation state: ${autopilot.activationState}`);
  console.log(`Implementation status: ${implementationStatus(normalizedRisk, autopilot)}`);
  console.log(`No merge/deploy: ${autopilot.noMergeNoDeployRule?.message ?? "Autopilot never merges or deploys."}`);
  console.log("");
  console.log("Required first-read files:");
  console.log(renderList(autopilot.requiredFirstReadFiles));
  console.log("");
  console.log("Iteration phases:");
  console.log(renderList(asArray(autopilot.iterationPhases).map((phase) => phase.id)));
  console.log("");
  console.log("Selected next safe task:");
  if (selectedTask) {
    console.log(`- Task ID: ${selectedTask.id}`);
    console.log(`- Title: ${selectedTask.title}`);
    console.log(`- Selection source: ${suggestion.command}`);
    console.log(`- Selection rationale: ${suggestion.fields.reason ?? "See suggestion output below."}`);
  } else {
    console.log("- None selected by suggestion script.");
    console.log(`- Selection source: ${suggestion.command}`);
    console.log(`- Suggestion exit code: ${suggestion.exitCode}`);
  }
  console.log("");
  console.log("Task selection memory:");
  console.log(`- Recently completed tasks considered: ${suggestion.fields["recently completed tasks considered"] ?? "not reported"}`);
  console.log(`- Skipped by cooldown: ${suggestion.fields["skipped by cooldown"] ?? "not reported"}`);
  console.log(`- Memory rule: ${autopilot.taskSelectionMemoryRule?.recentlyCompletedSkipRule ?? queue.repeatSelectionPolicy?.cooldownGuidance ?? "No memory rule configured."}`);
  console.log("");
  console.log("Risk classification:");
  console.log(`- Level: ${normalizedRisk}`);
  console.log(`- Description: ${riskDefinition?.description ?? "No matching risk definition found; treat as high risk."}`);
  console.log(`- Stop for risk: ${mustStopForRisk ? "yes" : "no"}`);
  console.log(`- Human approval rule: ${mustStopForRisk ? "required before implementation" : "required before merge/deploy and any protected work"}`);
  console.log("");
  console.log("Definition of done:");
  console.log(`- Key: ${doneKey ?? "missing"}`);
  console.log("- Required evidence:");
  console.log(renderList(done?.requiredEvidence));
  console.log("");
  console.log("Required checks:");
  console.log(renderList(requiredChecks));
  console.log("");
  console.log("Affected registers/files to inspect or include in planning:");
  console.log(renderList(affectedFiles));
  console.log("");
  console.log("Forbidden files/actions:");
  console.log(renderList([...forbiddenFiles, ...asArray(autopilot.forbiddenActions)]));
  console.log("");
  console.log("Stop conditions:");
  console.log(renderList(stopConditions));
  console.log("");
  console.log("Product readiness context:");
  console.log(`- Modules tracked: ${readiness.moduleCount}`);
  console.log("- Blocked/review/high-risk modules noted:");
  console.log(renderList(readiness.blockedOrReview));
  console.log("");
  console.log("Optional insight/research context:");
  console.log(`- ${optionalRegisterSummary("Research recommendations", researchRecommendations)}`);
  console.log(`- ${optionalRegisterSummary("Adaptive user insights", adaptiveUserInsights)}`);
  console.log("");
  console.log("Suggestion script output:");
  console.log(suggestion.stdout.trim() || "(no stdout)");
  if (suggestion.stderr.trim()) {
    console.log("");
    console.log("Suggestion script stderr:");
    console.log(suggestion.stderr.trim());
  }
  console.log("");
  console.log("Autopilot reminder: dry run completed without writing files. Stop for human approval before implementation, merge, deployment, or any high/critical/protected work.");

  if (suggestion.exitCode !== 0) {
    console.log("Autopilot note: next-task suggestion did not select a task, but dry-run reporting completed.");
  }

  process.exit(0);
}

main();
