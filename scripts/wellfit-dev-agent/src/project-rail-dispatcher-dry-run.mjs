#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAIL_PATH = "project-register/project-rail.json";
const QUEUE_PATH = "project-register/agent-task-queue.json";
const OWNERSHIP_PATH = "project-register/project-rail-active-ownership.json";
const OUTPUT_DIR = "scripts/wellfit-dev-agent/output";
const REPORT_PATH = `${OUTPUT_DIR}/project-rail-dispatcher-dry-run.md`;
const JSON_PATH = `${OUTPUT_DIR}/project-rail-dispatcher-dry-run.json`;

const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), "utf8"));
const normalizePath = (value) =>
  String(value ?? "")
    .replaceAll("\\", "/")
    .replace(/\*\*.*$/u, "")
    .replace(/\*.*$/u, "")
    .replace(/\/+$/u, "");
const overlap = (left, right) => {
  const a = normalizePath(left);
  const b = normalizePath(right);
  return Boolean(a && b && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)));
};
const allowedPaths = (task) =>
  Array.isArray(task.allowedFiles)
    ? task.allowedFiles
    : Array.isArray(task.allowed_paths)
      ? task.allowed_paths
      : [];
const blockedPaths = (task) =>
  Array.isArray(task.forbiddenFiles)
    ? task.forbiddenFiles
    : Array.isArray(task.blocked_paths)
      ? task.blocked_paths
      : [];
const dependencies = (task) =>
  Array.isArray(task.dependencies)
    ? task.dependencies
    : Array.isArray(task.dependsOn)
      ? task.dependsOn
      : Array.isArray(task.depends_on)
        ? task.depends_on
        : [];
const requiresOwner = (task) =>
  task.ownerDecisionRequired === true ||
  task.owner_decision_required === true ||
  task.humanApprovalRequired === true ||
  task.requiresHumanApproval === true;
const risk = (task) =>
  String(task.riskLevel ?? task.risk_level ?? task.risk ?? "unknown")
    .trim()
    .toLowerCase();
const priority = (task) => {
  const value = Number.parseInt(String(task.priority ?? "999"), 10);
  return Number.isFinite(value) ? value : 999;
};
const reservationPaths = (reservation) =>
  Array.isArray(reservation.allowed_paths)
    ? reservation.allowed_paths
    : Array.isArray(reservation.allowedPaths)
      ? reservation.allowedPaths
      : Array.isArray(reservation.file_ownership)
        ? reservation.file_ownership
        : [];
const activeReservation = (reservation) =>
  ["active", "in_progress", "reserved"].includes(
    String(reservation.status ?? "").toLowerCase(),
  );
const touchesLanding = (paths) =>
  paths.some((candidate) =>
    /(?:^|\/)(?:landing|Landing)|app\/components\/landing|app\/page/iu.test(candidate),
  );

const aliases = {
  task_id: ["task_id", "taskId", "id"],
  problem: ["problem", "purpose", "reason"],
  goal: ["goal", "title", "purpose"],
  scope: ["scope", "purpose"],
  non_goals: ["non_goals", "nonGoals", "forbiddenChanges"],
  dependencies: ["dependencies", "dependsOn", "depends_on"],
  allowed_paths: ["allowed_paths", "allowedFiles"],
  blocked_paths: ["blocked_paths", "forbiddenFiles"],
  risk_level: ["risk_level", "riskLevel", "risk"],
  owner_decision_required: [
    "owner_decision_required",
    "ownerDecisionRequired",
    "humanApprovalRequired",
    "requiresHumanApproval",
  ],
  required_checks: ["required_checks", "requiredChecks"],
  rollback_or_stop_plan: ["rollback_or_stop_plan", "stopConditions", "rollbackPlan"],
  definition_of_done: ["definition_of_done", "definitionOfDone", "definitionOfDoneKey"],
  expected_follow_up_sources: ["expected_follow_up_sources", "expectedPrOutput", "followUps"],
};

function missingFields(task, required) {
  return required.filter((field) => !(aliases[field] ?? [field]).some((key) => Object.hasOwn(task, key)));
}
function reservationConflicts(task, reservations) {
  const paths = allowedPaths(task);
  return reservations.filter(activeReservation).flatMap((reservation) => {
    const intersections = paths.filter((candidate) =>
      reservationPaths(reservation).some((owned) => overlap(candidate, owned)),
    );
    return intersections.length
      ? [{ task: reservation.task_id ?? reservation.taskId ?? "unknown", paths: intersections }]
      : [];
  });
}
function selectedConflict(task, selected) {
  const paths = allowedPaths(task);
  return selected.find((entry) =>
    paths.some((candidate) => allowedPaths(entry.source).some((owned) => overlap(candidate, owned))),
  );
}
function ownsHotspot(task, hotspots) {
  return allowedPaths(task).some((candidate) => hotspots.some((hotspot) => overlap(candidate, hotspot)));
}
function dependencyResult(task, allTasks) {
  const ids = dependencies(task);
  if (!ids.length) return { ready: true, missing: [], unresolved: [] };
  const byId = new Map(
    allTasks.map((entry) => [String(entry.id ?? entry.taskId ?? entry.task_id ?? ""), entry]),
  );
  const missing = [];
  const unresolved = [];
  for (const dependencyId of ids) {
    const dependency = byId.get(String(dependencyId));
    if (!dependency) {
      missing.push(String(dependencyId));
      continue;
    }
    const status = String(dependency.status ?? dependency.state ?? "").toLowerCase();
    if (!["done", "completed", "merged", "verified"].includes(status)) unresolved.push(String(dependencyId));
  }
  return { ready: !missing.length && !unresolved.length, missing, unresolved };
}
function report(result) {
  return [
    "# WellFit Project Rail Dispatcher Dry Run",
    "",
    "- Mode: DRY_RUN",
    "- Never executes tasks: true",
    "- Never creates branches or PRs: true",
    "- Never modifies project sources: true",
    `- PROJECT_RAIL_DISPATCHER_READY=${result.contract_ready}`,
    `- Selected safe tasks: ${result.selected.length}`,
    "",
    "## Selected next safe parallel batch",
    "",
    ...(result.selected.length
      ? result.selected.flatMap((task) => [
          `- ${task.id}: ${task.title} — priority ${task.priority}, risk ${task.risk}`,
          `  - Allowed paths: ${task.allowed_paths.join(", ") || "none"}`,
        ])
      : ["- No task selected."]),
    "",
    "## Blocked or skipped candidates",
    "",
    ...(result.blocked.length
      ? result.blocked.slice(0, 50).map((item) => `- ${item.id}: ${item.reason}`)
      : ["- None."]),
    "",
    "## Active ownership reservations",
    "",
    ...(result.active_reservations.length
      ? result.active_reservations.map(
          (reservation) =>
            `- ${reservation.task_id ?? reservation.taskId ?? "unknown"} — ${reservationPaths(reservation).join(", ")}`,
        )
      : ["- None."]),
    "",
    "## Safety",
    "",
    "- Landing-page paths are excluded while parallel landing work is active.",
    "- Hotspot files remain serial by default.",
    "- Missing planning fields, decisions, dependencies or ownership clearance block selection.",
    "- This dry run creates no reservation and executes no task.",
    "",
  ].join("\n");
}

let rail;
let queue;
let ownership;
try {
  rail = readJson(RAIL_PATH);
  queue = readJson(QUEUE_PATH);
  ownership = readJson(OWNERSHIP_PATH);
} catch (error) {
  process.stderr.write(`Cannot initialize dispatcher: ${error.message}\n`);
  process.exitCode = 1;
}

if (rail && queue && ownership) {
  const tasks = Array.isArray(queue.taskCandidates) ? queue.taskCandidates : [];
  const reservations = Array.isArray(ownership.active_reservations) ? ownership.active_reservations : [];
  const required = rail.planning_gate?.required_fields ?? [];
  const hotspots = rail.parallel_work?.hotspots_are_serial_by_default ?? [];
  const maxParallel = rail.dispatcher_contract?.max_parallel_default ?? 3;
  const autoRisks = new Set(rail.dispatcher_contract?.auto_selectable_risk_levels ?? ["low"]);
  const selected = [];
  const blocked = [];

  for (const task of [...tasks].sort((a, b) => priority(a) - priority(b))) {
    const id = String(task.id ?? task.taskId ?? task.task_id ?? "unknown");
    const title = String(task.title ?? task.goal ?? task.purpose ?? id);
    const taskRisk = risk(task);
    const paths = allowedPaths(task);
    const missing = missingFields(task, required);
    const deps = dependencyResult(task, tasks);
    const reservationHits = reservationConflicts(task, reservations);
    const parallelHit = selectedConflict(task, selected);
    const hotspotHit = ownsHotspot(task, hotspots) && selected.some((entry) => ownsHotspot(entry.source, hotspots));

    let reason = null;
    if (missing.length) reason = `planning gate incomplete: ${missing.join(", ")}`;
    else if (!autoRisks.has(taskRisk)) reason = `risk ${taskRisk} is not auto-selectable`;
    else if (requiresOwner(task)) reason = "owner/human decision required";
    else if (!deps.ready) reason = `dependencies unresolved (missing: ${deps.missing.join(", ") || "none"}; open: ${deps.unresolved.join(", ") || "none"})`;
    else if (!paths.length) reason = "no allowed file ownership declared";
    else if (touchesLanding(paths)) reason = "landing-page work is isolated for parallel development";
    else if (reservationHits.length) reason = `active reservation conflict with ${reservationHits.map((hit) => hit.task).join(", ")}`;
    else if (parallelHit) reason = `selected-batch file conflict with ${parallelHit.id}`;
    else if (hotspotHit) reason = "serial hotspot already owned in selected batch";

    if (reason) {
      blocked.push({ id, title, reason });
      continue;
    }
    selected.push({
      id,
      title,
      priority: priority(task),
      risk: taskRisk,
      allowed_paths: paths,
      blocked_paths: blockedPaths(task),
      required_checks: task.requiredChecks ?? task.required_checks ?? [],
      source: task,
    });
    if (selected.length >= maxParallel) break;
  }

  const output = {
    generated_at: new Date().toISOString(),
    mode: "DRY_RUN",
    never_executes_tasks: true,
    never_creates_branches_or_prs: true,
    never_modifies_project_sources: true,
    contract_ready: Array.isArray(tasks) && Array.isArray(reservations) && required.length > 0 && maxParallel > 0,
    max_parallel: maxParallel,
    selected: selected.map(({ source, ...entry }) => entry),
    blocked,
    active_reservations: reservations.filter(activeReservation),
  };
  fs.mkdirSync(abs(OUTPUT_DIR), { recursive: true });
  fs.writeFileSync(abs(JSON_PATH), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(abs(REPORT_PATH), report(output), "utf8");
  process.stdout.write([
    "WellFit Project Rail Dispatcher Dry Run",
    "Mode: DRY_RUN",
    "Never executes tasks: true",
    "Never creates branches or PRs: true",
    "Never modifies project sources: true",
    `PROJECT_RAIL_DISPATCHER_READY=${output.contract_ready}`,
    `Selected safe tasks: ${output.selected.length}`,
    `Report: ${REPORT_PATH}`,
    "",
  ].join("\n"));
  process.exitCode = output.contract_ready ? 0 : 1;
}
