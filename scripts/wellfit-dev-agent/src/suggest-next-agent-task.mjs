#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DISALLOWED_AUTOMATIC_RISK_LEVELS = new Set(["high", "critical"]);
const BLOCKED_STATUSES = new Set(["blocked", "review_required", "done", "superseded", "stale"]);
const RISK_ORDER = new Map([["low", 0], ["medium", 1], ["high", 2], ["critical", 3]]);

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

function latestProgressCompletedTaskIds(progressLog, taskIds) {
  const entries = asArray(progressLog?.entries);
  if (entries.length === 0) return [];

  const latestEntry = entries[entries.length - 1];
  return taskIds.filter((taskId) => entryMentionsTask(latestEntry, taskId));
}

function latestWorkLogCompletedTaskIds(workLog) {
  const entries = asArray(workLog?.entries);
  const latestDoneEntry = [...entries].reverse().find((entry) => {
    const status = String(entry?.status ?? "").toLowerCase();
    return status === "done" && typeof entry?.taskId === "string";
  });

  return latestDoneEntry?.taskId ? [latestDoneEntry.taskId] : [];
}

function recentlyCompletedTaskIds(queue, progressLog, workLog) {
  const taskIds = asArray(queue.taskCandidates)
    .map((candidate) => candidate.id)
    .filter((taskId) => typeof taskId === "string" && taskId.length > 0);

  return [...new Set([
    ...latestProgressCompletedTaskIds(progressLog, taskIds),
    ...latestWorkLogCompletedTaskIds(workLog)
  ])];
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
  const selected = candidates.find((candidate) => !recentlyCompletedSet.has(candidate.id)) ?? candidates[0] ?? null;
  const skippedRecentlyCompleted = candidates
    .filter((candidate) => recentlyCompletedSet.has(candidate.id) && candidate.id !== selected?.id)
    .map((candidate) => candidate.id);

  if (!selected) return { selected: null, recentlyCompletedTaskIds: recentCompletedIds, skippedRecentlyCompleted, reason: "No non-blocked low/medium risk task with a valid definition-of-done key is available." };

  const contextMentions = countMentions(`${currentState}\n${workMap}`, [selected.id, selected.title, ...(selected.allowedFiles ?? [])]);
  const riskLevel = riskClassifier.riskLevels?.[selected.riskLevel];
  const reason = [
    `Selected because it is the safest available non-blocked candidate (${selected.riskLevel} risk) with priority ${selected.priority ?? "not set"}.`,
    `Definition-of-done key \`${selected.definitionOfDoneKey}\` exists.`,
    skippedRecentlyCompleted.length > 0 ? `Skipped recently completed task(s): ${skippedRecentlyCompleted.join(", ")}.` : recentCompletedIds.includes(selected.id) ? "Recently completed task cooldown could not skip the selected task because no other safe candidate was available." : "No recently completed higher-ranked task needed to be skipped.",
    contextMentions > 0 ? `Current state / Work Map context references ${contextMentions} related item(s).` : "No direct context mention was required; global queue ordering applies.",
    (riskLevel?.defaultAgentAction || riskLevel?.maximumDefaultAction) ? `Risk classifier default action: ${riskLevel.defaultAgentAction ?? riskLevel.maximumDefaultAction}.` : "Risk classifier level exists but has no default action field."
  ].join(" ");

  return { selected, recentlyCompletedTaskIds: recentCompletedIds, skippedRecentlyCompleted, reason };
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
