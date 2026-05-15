#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_RECENT_COMPLETED_WINDOW = 4;
const BLOCKED_STATUSES = new Set(["blocked", "review_required", "done", "completed", "completed_initial_policy", "superseded", "stale"]);
const RISK_ORDER = new Map([["low", 0], ["medium", 1], ["high", 2], ["critical", 3]]);

function absolutePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolutePath(relativePath), "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(asArray(values).filter((value) => typeof value === "string" && value.length > 0))];
}

function renderList(values) {
  const items = unique(values);
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None specified";
}

function taskCategory(candidate) {
  return candidate?.taskCategory ?? candidate?.category ?? "uncategorized";
}

function isBlocked(candidate) {
  const status = String(candidate.status ?? "").toLowerCase();
  return BLOCKED_STATUSES.has(status) || asArray(candidate.blockedBy).length > 0 || candidate.blocked === true;
}

function hasDefinitionOfDone(definitionOfDone, candidate) {
  return Boolean(definitionOfDone.taskTypes?.[candidate.definitionOfDoneKey]);
}

function riskRank(candidate) {
  return RISK_ORDER.get(String(candidate.riskLevel ?? "critical").toLowerCase()) ?? 99;
}

function includesTaskId(value, taskId) {
  return typeof value === "string" && value.includes(taskId);
}

function entryMentionsTask(entry, taskId) {
  if (!entry || typeof entry !== "object") return false;
  const directFields = [entry.taskId, entry.id, entry.goal, entry.notes, entry.title, entry.nextRecommendedTask];
  if (directFields.some((value) => includesTaskId(value, taskId))) return true;
  return JSON.stringify(entry).includes(taskId);
}

function recentCompletedWindowSize(queue) {
  const configuredWindow = Number(queue.loopGuardPolicy?.recentCompletedWindow ?? queue.repeatSelectionPolicy?.recentCompletedWindow);
  return Number.isInteger(configuredWindow) && configuredWindow > 0 ? configuredWindow : DEFAULT_RECENT_COMPLETED_WINDOW;
}

function recentProgressCompletedTaskIds(progressLog, taskIds, windowSize) {
  return asArray(progressLog?.entries)
    .slice(-windowSize)
    .reverse()
    .flatMap((entry) => taskIds.filter((taskId) => entryMentionsTask(entry, taskId)));
}

function recentWorkLogCompletedTaskIds(workLog, windowSize) {
  return asArray(workLog?.entries)
    .filter((entry) => String(entry?.status ?? "").toLowerCase() === "done" && typeof entry?.taskId === "string")
    .slice(-windowSize)
    .reverse()
    .map((entry) => entry.taskId);
}

function recentlyCompletedTaskIds(queue, progressLog, workLog) {
  const taskIds = asArray(queue.taskCandidates)
    .map((candidate) => candidate.id)
    .filter((taskId) => typeof taskId === "string" && taskId.length > 0);
  const windowSize = recentCompletedWindowSize(queue);
  return unique([
    ...recentProgressCompletedTaskIds(progressLog, taskIds, windowSize),
    ...recentWorkLogCompletedTaskIds(workLog, windowSize)
  ]);
}

function loopGuardState(queue, candidates, recentCompletedIds) {
  const guardedPair = asArray(queue.loopGuardPolicy?.guardedTaskPair);
  const guardedSet = new Set(guardedPair);
  const recentSet = new Set(recentCompletedIds);
  const active = guardedPair.length > 0 && guardedPair.every((taskId) => recentSet.has(taskId));
  const guardedCategories = new Set(candidates
    .filter((candidate) => guardedSet.has(candidate.id))
    .map((candidate) => taskCategory(candidate)));

  return { active, guardedSet, guardedCategories };
}

function pathPatternMatches(pattern, candidatePath) {
  if (pattern.endsWith("/**")) return candidatePath === pattern.slice(0, -3) || candidatePath.startsWith(pattern.slice(0, -2));
  if (pattern.endsWith("/*")) return candidatePath.startsWith(pattern.slice(0, -1));
  return candidatePath === pattern || candidatePath.startsWith(`${pattern}/`);
}

function intersectsForbiddenPaths(candidate, policy) {
  const allowedFiles = asArray(candidate.allowedFiles);
  return asArray(policy.forbiddenPaths).filter((forbiddenPath) =>
    allowedFiles.some((allowedFile) => pathPatternMatches(forbiddenPath, allowedFile) || pathPatternMatches(allowedFile, forbiddenPath))
  );
}

function candidateRejectionReasons(candidate, policy, definitionOfDone) {
  const reasons = [];
  const riskLevel = String(candidate.riskLevel ?? "").toLowerCase();
  const category = taskCategory(candidate);
  const forbiddenIntersections = intersectsForbiddenPaths(candidate, policy);

  if (isBlocked(candidate)) reasons.push("blocked_done_superseded_stale_or_review_required");
  if (!asArray(policy.allowedTaskRiskLevels).includes(riskLevel)) reasons.push(`risk_not_allowed:${riskLevel || "missing"}`);
  if (!asArray(policy.allowedTaskCategories).includes(category)) reasons.push(`category_not_allowed:${category}`);
  if (asArray(policy.forbiddenTaskCategories).includes(category)) reasons.push(`category_forbidden:${category}`);
  if (!hasDefinitionOfDone(definitionOfDone, candidate)) reasons.push(`definition_of_done_missing:${candidate.definitionOfDoneKey ?? "missing"}`);
  if (forbiddenIntersections.length > 0) reasons.push(`allowed_files_intersect_forbidden_paths:${forbiddenIntersections.join(",")}`);

  return reasons;
}

function selectPlannedTasks(queue, policy, definitionOfDone, progressLog, workLog) {
  const recentCompletedIds = recentlyCompletedTaskIds(queue, progressLog, workLog);
  const recentlyCompletedSet = new Set(recentCompletedIds);
  const rejected = [];
  const safeCandidates = [];

  for (const candidate of asArray(queue.taskCandidates)) {
    const reasons = candidateRejectionReasons(candidate, policy, definitionOfDone);
    if (reasons.length > 0) rejected.push({ id: candidate.id, reasons });
    else safeCandidates.push(candidate);
  }

  safeCandidates.sort((a, b) => {
    const riskDifference = riskRank(a) - riskRank(b);
    if (riskDifference !== 0) return riskDifference;
    return Number(a.priority ?? 9999) - Number(b.priority ?? 9999);
  });

  const guard = loopGuardState(queue, safeCandidates, recentCompletedIds);
  const nonRecentCandidates = safeCandidates.filter((candidate) => !recentlyCompletedSet.has(candidate.id));
  const preferred = guard.active
    ? nonRecentCandidates.filter((candidate) => !guard.guardedSet.has(candidate.id) && !guard.guardedCategories.has(taskCategory(candidate)))
    : nonRecentCandidates;
  const fallback = safeCandidates.filter((candidate) => !preferred.includes(candidate));
  const plannedTasks = [...preferred, ...fallback].slice(0, Number(policy.maxPlannedTasks));

  return {
    plannedTasks,
    recentCompletedIds,
    skippedByCooldown: safeCandidates.filter((candidate) => recentlyCompletedSet.has(candidate.id) && !plannedTasks.includes(candidate)).map((candidate) => candidate.id),
    loopGuardActive: guard.active,
    loopGuardSkipped: guard.active ? safeCandidates.filter((candidate) => guard.guardedSet.has(candidate.id) && !plannedTasks.includes(candidate)).map((candidate) => candidate.id) : [],
    rejected
  };
}

function taskChecks(policy, queue, candidate, definitionOfDone) {
  const done = definitionOfDone.taskTypes?.[candidate.definitionOfDoneKey];
  return unique([
    ...asArray(policy.requiredChecksPerTask),
    ...asArray(queue.defaultRequiredChecks),
    ...asArray(candidate.requiredChecks),
    ...asArray(done?.requiredChecks)
  ]);
}

function taskStopConditions(policy, queue, candidate) {
  return unique([
    ...asArray(policy.stopConditions),
    ...asArray(queue.globalForbiddenChanges),
    ...asArray(candidate.stopConditions)
  ]);
}

function main() {
  const policy = readJson("project-register/autopilot-batch-policy.json");
  const queue = readJson("project-register/agent-task-queue.json");
  const progressLog = readJson("project-register/progress-log.json");
  const workLog = readJson("project-register/agent-work-log.json");
  const definitionOfDone = readJson("project-register/definition-of-done.json");

  if (policy.activationState !== "dry_run_only") {
    console.log("BATCH_AUTOPILOT_MODE=STOP");
    console.log("Result: STOP");
    console.log("Reason: activationState_is_not_dry_run_only");
    process.exit(1);
  }

  const selection = selectPlannedTasks(queue, policy, definitionOfDone, progressLog, workLog);

  console.log("WellFit Batch Autopilot Dry Run");
  console.log("BATCH_AUTOPILOT_MODE=DRY_RUN");
  console.log("Result: DRY_RUN");
  console.log(`Activation state: ${policy.activationState}`);
  console.log(`Max planned tasks: ${policy.maxPlannedTasks}`);
  console.log(`Max runtime minutes: ${policy.maxRuntimeMinutes}`);
  console.log("Never writes files: true");
  console.log("Never creates pull requests: true");
  console.log("Never merges: true");
  console.log("Never deploys: true");
  console.log("Never repairs: true");
  console.log("Never approves own work: true");
  console.log("Auto-merge eligibility: future consideration only; no merge is enabled or performed.");
  console.log("Auto-repair: future consideration only; no repair is enabled or performed.");
  console.log("");
  console.log("Task selection memory:");
  console.log(`- Recently completed tasks considered: ${selection.recentCompletedIds.length ? selection.recentCompletedIds.join(", ") : "none"}`);
  console.log(`- Skipped by cooldown: ${selection.skippedByCooldown.length ? selection.skippedByCooldown.join(", ") : "none"}`);
  console.log(`- Loop guard active: ${selection.loopGuardActive ? "yes" : "no"}`);
  console.log(`- Loop guard skipped: ${selection.loopGuardSkipped.length ? selection.loopGuardSkipped.join(", ") : "none"}`);
  console.log(`- Cooldown rule: ${queue.repeatSelectionPolicy?.cooldownGuidance ?? "No cooldown rule configured."}`);
  console.log(`- Loop guard rule: ${queue.loopGuardPolicy?.rule ?? "No loop guard configured."}`);
  console.log("");
  console.log(`Planned tasks: ${selection.plannedTasks.length}`);

  selection.plannedTasks.forEach((candidate, index) => {
    console.log("");
    console.log(`Planned task ${index + 1}: ${candidate.id}`);
    console.log(`- Title: ${candidate.title}`);
    console.log(`- Risk: ${String(candidate.riskLevel ?? "unknown").toLowerCase()}`);
    console.log(`- Category: ${taskCategory(candidate)}`);
    console.log(`- Definition of done: ${candidate.definitionOfDoneKey ?? "missing"}`);
    console.log("- Allowed files:");
    console.log(renderList(candidate.allowedFiles));
    console.log("- Forbidden files:");
    console.log(renderList(unique([...asArray(queue.globalForbiddenFiles), ...asArray(candidate.forbiddenFiles), ...asArray(policy.forbiddenPaths)])));
    console.log("- Required checks:");
    console.log(renderList(taskChecks(policy, queue, candidate, definitionOfDone)));
    console.log("- Stop conditions:");
    console.log(renderList(taskStopConditions(policy, queue, candidate)));
    console.log("- Auto-merge eligibility: future_consideration_only");
    console.log("- Auto-repair: future_consideration_only");
  });

  console.log("");
  console.log("Batch stop conditions:");
  console.log(renderList(policy.stopConditions));
  console.log("");
  console.log("Rejected or unsafe candidates summarized:");
  console.log(renderList(selection.rejected.slice(0, 12).map((item) => `${item.id}: ${item.reasons.join("; ")}`)));
  console.log("");
  console.log("Batch Autopilot reminder: dry run completed without writing files, creating PRs, merging, deploying, repairing, or approving work.");
}

main();
