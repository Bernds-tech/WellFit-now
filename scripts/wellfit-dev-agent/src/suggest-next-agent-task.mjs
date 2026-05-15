#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DISALLOWED_AUTOMATIC_RISK_LEVELS = new Set(["high", "critical"]);
const BLOCKED_STATUSES = new Set(["blocked", "review_required", "done", "superseded", "stale"]);
const RISK_ORDER = new Map([["low", 0], ["medium", 1], ["high", 2], ["critical", 3]]);
const DEFAULT_RECENT_COMPLETED_WINDOW = 4;

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readJsonWhenPresent(relativePath, fallback = null) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isBlocked(candidate) {
  const status = String(candidate.status ?? "").toLowerCase();
  return BLOCKED_STATUSES.has(status) || asArray(candidate.blockedBy).length > 0 || candidate.blocked === true;
}

function riskRank(candidate) {
  return RISK_ORDER.get(String(candidate.riskLevel ?? "critical").toLowerCase()) ?? 99;
}

function hasDefinitionOfDone(definitionOfDone, candidate) {
  return Boolean(definitionOfDone.taskTypes?.[candidate.definitionOfDoneKey]);
}

function countMentions(text, values) {
  return asArray(values).filter((value) => typeof value === "string" && text.includes(value.replace(/\*\*?/gu, ""))).length;
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

function unique(values) {
  return [...new Set(asArray(values).filter((value) => typeof value === "string" && value.length > 0))];
}

function recentProgressCompletedTaskIds(progressLog, taskIds, windowSize) {
  const entries = asArray(progressLog?.entries);
  if (entries.length === 0) return [];

  return entries
    .slice(-windowSize)
    .reverse()
    .flatMap((entry) => taskIds.filter((taskId) => entryMentionsTask(entry, taskId)));
}

function recentWorkLogCompletedTaskIds(workLog, windowSize) {
  const entries = asArray(workLog?.entries);
  return entries
    .filter((entry) => {
      const status = String(entry?.status ?? "").toLowerCase();
      return status === "done" && typeof entry?.taskId === "string";
    })
    .slice(-windowSize)
    .reverse()
    .map((entry) => entry.taskId);
}

function recentCompletedWindowSize(queue) {
  const configuredWindow = Number(queue.loopGuardPolicy?.recentCompletedWindow ?? queue.repeatSelectionPolicy?.recentCompletedWindow);
  return Number.isInteger(configuredWindow) && configuredWindow > 0 ? configuredWindow : DEFAULT_RECENT_COMPLETED_WINDOW;
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

function taskCategory(candidate) {
  return candidate?.taskCategory ?? candidate?.category ?? "uncategorized";
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

function chooseTask(queue, riskClassifier, definitionOfDone, currentState, workMap, progressLog, workLog) {
  const candidates = asArray(queue.taskCandidates)
    .filter((candidate) => !isBlocked(candidate))
    .filter((candidate) => !DISALLOWED_AUTOMATIC_RISK_LEVELS.has(String(candidate.riskLevel ?? "").toLowerCase()))
    .filter((candidate) => hasDefinitionOfDone(definitionOfDone, candidate));

  candidates.sort((a, b) => {
    const riskDifference = riskRank(a) - riskRank(b);
    if (riskDifference !== 0) return riskDifference;
    return Number(a.priority ?? 9999) - Number(b.priority ?? 9999);
  });

  const recentCompletedIds = recentlyCompletedTaskIds(queue, progressLog, workLog);
  const recentlyCompletedSet = new Set(recentCompletedIds);
  const guard = loopGuardState(queue, candidates, recentCompletedIds);
  const nonRecentCandidates = candidates.filter((candidate) => !recentlyCompletedSet.has(candidate.id));
  const differentCategoryLoopGuardCandidates = guard.active
    ? nonRecentCandidates.filter((candidate) => !guard.guardedSet.has(candidate.id) && !guard.guardedCategories.has(taskCategory(candidate)))
    : [];
  const selected = differentCategoryLoopGuardCandidates[0] ?? nonRecentCandidates[0] ?? candidates[0] ?? null;
  const skippedRecentlyCompleted = candidates
    .filter((candidate) => recentlyCompletedSet.has(candidate.id) && candidate.id !== selected?.id)
    .map((candidate) => candidate.id);
  const loopGuardSkipped = guard.active
    ? candidates.filter((candidate) => guard.guardedSet.has(candidate.id) && candidate.id !== selected?.id).map((candidate) => candidate.id)
    : [];
  const loopGuardDifferentCategoryUnavailable = guard.active && differentCategoryLoopGuardCandidates.length === 0;
  const loopGuardFallback = guard.active && nonRecentCandidates.length === 0;

  if (!selected) return { selected: null, recentlyCompletedTaskIds: recentCompletedIds, skippedRecentlyCompleted, loopGuardActive: guard.active, loopGuardSkipped, loopGuardFallback, loopGuardDifferentCategoryUnavailable, reason: "No non-blocked low/medium risk task with a valid definition-of-done key is available." };

  const contextMentions = countMentions(`${currentState}\n${workMap}`, [selected.id, selected.title, ...(selected.allowedFiles ?? [])]);
  const riskLevel = riskClassifier.riskLevels?.[selected.riskLevel];
  const reason = [
    `Selected because it is the safest available non-blocked candidate (${selected.riskLevel} risk) with priority ${selected.priority ?? "not set"}.`,
    `Definition-of-done key \`${selected.definitionOfDoneKey}\` exists.`,
    skippedRecentlyCompleted.length > 0 ? `Skipped recently completed task(s): ${skippedRecentlyCompleted.join(", ")}.` : recentCompletedIds.includes(selected.id) ? "Recently completed task cooldown could not skip the selected task because no other safe candidate was available." : "No recently completed higher-ranked task needed to be skipped.",
    guard.active ? (loopGuardFallback ? "Baseline/registry loop guard was active but no other safe candidate existed, so the safest available candidate was selected." : loopGuardDifferentCategoryUnavailable ? `Baseline/registry loop guard was active; no different-category safe candidate existed, so selected next safe category \`${taskCategory(selected)}\`.` : `Baseline/registry loop guard was active; skipped guarded pair task(s) once and preferred different category \`${taskCategory(selected)}\`.`) : "Baseline/registry loop guard was not active.",
    contextMentions > 0 ? `Current state / Work Map context references ${contextMentions} related item(s).` : "No direct context mention was required; global queue ordering applies.",
    (riskLevel?.defaultAgentAction || riskLevel?.maximumDefaultAction) ? `Risk classifier default action: ${riskLevel.defaultAgentAction ?? riskLevel.maximumDefaultAction}.` : "Risk classifier level exists but has no default action field."
  ].join(" ");

  return { selected, recentlyCompletedTaskIds: recentCompletedIds, skippedRecentlyCompleted, loopGuardActive: guard.active, loopGuardSkipped, loopGuardFallback, loopGuardDifferentCategoryUnavailable, reason };
}

function renderList(values) {
  const items = asArray(values);
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None specified";
}

function renderTask(queue, definitionOfDone, choice) {
  if (!choice.selected) {
    return [`WellFit Next Agent Task Suggestion`, ``, `Result: STOP`, `Reason: ${choice.reason}`].join("\n");
  }

  const task = choice.selected;
  const done = definitionOfDone.taskTypes?.[task.definitionOfDoneKey] ?? {};
  const expectedPrOutput = asArray(task.expectedPrOutput).length ? task.expectedPrOutput : asArray(queue.expectedPrOutput?.mustMention);
  const requiredChecks = [...new Set([...asArray(queue.defaultRequiredChecks), ...asArray(task.requiredChecks), ...asArray(done.requiredChecks)])];

  return [
    "WellFit Next Agent Task Suggestion",
    "",
    "Result: TASK_SELECTED",
    `Task ID: ${task.id}`,
    `Title: ${task.title}`,
    `Reason: ${choice.reason}`,
    `Risk level: ${task.riskLevel}`,
    `Definition of done: ${task.definitionOfDoneKey}`,
    `Recently completed tasks considered: ${choice.recentlyCompletedTaskIds?.length ? choice.recentlyCompletedTaskIds.join(", ") : "none"}`,
    `Skipped by cooldown: ${choice.skippedRecentlyCompleted?.length ? choice.skippedRecentlyCompleted.join(", ") : "none"}`,
    `Loop guard active: ${choice.loopGuardActive ? "yes" : "no"}`,
    `Loop guard skipped: ${choice.loopGuardSkipped?.length ? choice.loopGuardSkipped.join(", ") : "none"}`,
    `Loop guard fallback: ${choice.loopGuardFallback ? "yes" : "no"}`,
    `Different-category unavailable: ${choice.loopGuardDifferentCategoryUnavailable ? "yes" : "no"}`,
    `Task category: ${taskCategory(task)}`,
    "",
    "Allowed files:",
    renderList(task.allowedFiles),
    "",
    "Forbidden files:",
    renderList([...asArray(queue.globalForbiddenFiles), ...asArray(task.forbiddenFiles)]),
    "",
    "Required checks:",
    renderList(requiredChecks),
    "",
    "Expected PR output:",
    renderList(expectedPrOutput),
    "",
    "Stop conditions:",
    renderList([...asArray(queue.globalForbiddenChanges), ...asArray(task.stopConditions)]),
    "",
    "Definition-of-done evidence:",
    renderList(done.requiredEvidence),
    "",
    "Automatic selection guardrail: high and critical risk tasks are never selected automatically by this script."
  ].join("\n");
}

function main() {
  const queue = readJson("project-register/agent-task-queue.json");
  const riskClassifier = readJson("project-register/risk-classifier.json");
  const definitionOfDone = readJson("project-register/definition-of-done.json");
  const currentState = readText("todolist/CURRENT_PROJECT_STATE.md");
  const workMap = readText("todolist/WORK_MAP.md");
  const progressLog = readJsonWhenPresent("project-register/progress-log.json", { entries: [] });
  const workLog = readJsonWhenPresent("project-register/agent-work-log.json", { entries: [] });

  const choice = chooseTask(queue, riskClassifier, definitionOfDone, currentState, workMap, progressLog, workLog);
  console.log(renderTask(queue, definitionOfDone, choice));
  if (!choice.selected) process.exit(1);
}

main();
