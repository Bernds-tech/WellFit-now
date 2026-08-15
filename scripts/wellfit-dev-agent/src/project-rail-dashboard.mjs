#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = "scripts/wellfit-dev-agent/output";
const JSON_OUTPUT = `${OUTPUT_DIR}/project-rail-dashboard.json`;
const MARKDOWN_OUTPUT = `${OUTPUT_DIR}/project-rail-dashboard.md`;
const INPUTS = {
  rail: "project-register/project-rail.json",
  taskQueue: "project-register/agent-task-queue.json",
  workLog: "project-register/agent-work-log.json",
  progressLog: "project-register/progress-log.json",
  continuity: "project-register/continuity-dependency-map.json",
  readiness: "project-register/product-readiness.json",
  ownership: "project-register/project-rail-active-ownership.json",
  currentState: "todolist/CURRENT_PROJECT_STATE.md",
  nextActions: "todolist/NEXT_ACTIONS.md",
  openDone: "todolist/MASTER_OPEN_DONE_LIST.md",
  doneLog: "todolist/DONE_LOG.md",
};
const MARKERS = {
  " ": "open",
  ">": "in_progress",
  x: "done",
  X: "done",
  "~": "partially_done",
  "!": "blocked",
  "-": "stale",
  D: "duplicate",
};

const abs = (p) => path.join(ROOT, p);
const compact = (value, max = 180) => {
  const text = String(value ?? "").replace(/\s+/gu, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
};
function readText(p, warnings) {
  try {
    return fs.readFileSync(abs(p), "utf8");
  } catch {
    warnings.push(`Missing or unreadable text source: ${p}`);
    return "";
  }
}
function readJson(p, warnings) {
  try {
    return JSON.parse(fs.readFileSync(abs(p), "utf8"));
  } catch {
    warnings.push(`Missing, unreadable or invalid JSON source: ${p}`);
    return null;
  }
}
function deepObjects(value, output = [], seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return output;
  seen.add(value);
  if (!Array.isArray(value)) output.push(value);
  for (const child of Object.values(value)) deepObjects(child, output, seen);
  return output;
}
function firstString(object, keys) {
  for (const key of keys) {
    const value = object?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
function firstBoolean(object, keys) {
  for (const key of keys) if (typeof object?.[key] === "boolean") return object[key];
  return null;
}
function normalizeStatus(raw) {
  const value = String(raw ?? "").trim().toLowerCase().replaceAll("-", "_");
  if (!value) return "unknown";
  if (/blocked|review_required|pending_approval|needs_revision/u.test(value)) return "blocked";
  if (/execution_running|checks_running|in_progress|pr_created|review/u.test(value)) return "in_progress";
  if (/ready|approved|execution_allowed|planned|open|draft|proposal|candidate/u.test(value)) return "ready";
  if (/done|completed|verified|merged|production_ready/u.test(value)) return "done";
  if (/partial/u.test(value)) return "partially_done";
  if (/defer/u.test(value)) return "deferred";
  if (/reject/u.test(value)) return "rejected";
  if (/stale|superseded/u.test(value)) return "stale";
  if (/duplicate/u.test(value)) return "duplicate";
  return value;
}
function objectToItem(object, source) {
  const id = firstString(object, ["taskId", "task_id", "id", "key", "slug", "proposalId"]);
  const title = firstString(object, ["title", "goal", "name", "purpose", "label", "summary"]);
  const rawStatus = firstString(object, ["status", "state", "taskStatus", "activationState", "readiness", "phase"]);
  if (!id && !title) return null;
  if (!rawStatus && !Object.hasOwn(object, "priority")) return null;
  const priorityValue = Number.parseInt(String(object.priority ?? "999"), 10);
  return {
    id: compact(id || title, 100),
    title: compact(title || id, 220),
    status: normalizeStatus(rawStatus || "candidate"),
    rawStatus: rawStatus || "candidate",
    priority: Number.isFinite(priorityValue) ? priorityValue : 999,
    risk: firstString(object, ["riskLevel", "risk_level", "risk"]) || "unknown",
    ownerDecision:
      firstBoolean(object, ["ownerDecisionRequired", "owner_decision_required", "humanApprovalRequired", "requiresHumanApproval"]) === true,
    branch: firstString(object, ["branch", "head", "sourceBranch"]),
    source,
    allowedPaths: Array.isArray(object.allowedFiles)
      ? object.allowedFiles
      : Array.isArray(object.allowed_paths)
        ? object.allowed_paths
        : [],
  };
}
function collectItems(value, source) {
  if (!value) return [];
  return deepObjects(value).map((object) => objectToItem(object, source)).filter(Boolean);
}
function parseTodoItems(text, source) {
  const items = [];
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*-\s*\[([ >xX~!\-D])\]\s*(.+?)\s*$/u);
    if (!match) continue;
    items.push({
      id: compact(match[2], 100),
      title: compact(match[2], 220),
      status: MARKERS[match[1]] ?? "unknown",
      rawStatus: `[${match[1]}]`,
      priority: 999,
      risk: "unknown",
      ownerDecision: /bernd|owner|entscheidung|freigabe|approval/iu.test(match[2]),
      branch: "",
      source,
      allowedPaths: [],
    });
  }
  return items;
}
function dedupe(items) {
  const map = new Map();
  for (const item of items) {
    const key = `${item.id}::${item.title}`;
    const existing = map.get(key);
    if (!existing || item.priority < existing.priority) map.set(key, item);
  }
  return [...map.values()];
}
function cleanPath(value) {
  return String(value ?? "").replaceAll("\\", "/").replace(/\*\*.*$/u, "").replace(/\*.*$/u, "").replace(/\/+$/u, "");
}
function overlap(left, right) {
  const a = cleanPath(left);
  const b = cleanPath(right);
  return Boolean(a && b && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)));
}
function touchesLanding(item) {
  return (item.allowedPaths ?? []).some((p) => /(?:^|\/)(?:landing|Landing)|app\/components\/landing|app\/page/iu.test(p));
}
function conflictsWithReservations(item, reservations) {
  return reservations.some((reservation) => {
    const reserved = reservation.allowed_paths ?? reservation.allowedPaths ?? reservation.file_ownership ?? [];
    return (item.allowedPaths ?? []).some((candidate) => reserved.some((owned) => overlap(candidate, owned)));
  });
}
function selectSafeBatch(items, rail, ownership) {
  const reservations = Array.isArray(ownership?.active_reservations)
    ? ownership.active_reservations.filter((entry) => ["active", "in_progress", "reserved"].includes(String(entry.status ?? "").toLowerCase()))
    : [];
  const hotspots = rail.parallel_work?.hotspots_are_serial_by_default ?? [];
  const candidates = items
    .filter((item) => item.status === "ready")
    .filter((item) => ["low", "unknown"].includes(item.risk.toLowerCase()))
    .filter((item) => !item.ownerDecision && !touchesLanding(item) && !conflictsWithReservations(item, reservations))
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
  const selected = [];
  for (const candidate of candidates) {
    const paths = candidate.allowedPaths ?? [];
    const directConflict = selected.some((other) => paths.some((p) => (other.allowedPaths ?? []).some((q) => overlap(p, q))));
    if (directConflict) continue;
    const ownsHotspot = paths.some((p) => hotspots.some((h) => overlap(p, h)));
    const selectedOwnsHotspot = selected.some((other) => (other.allowedPaths ?? []).some((p) => hotspots.some((h) => overlap(p, h))));
    if (ownsHotspot && selectedOwnsHotspot) continue;
    selected.push(candidate);
    if (selected.length >= (rail.dispatcher_contract?.max_parallel_default ?? 3)) break;
  }
  return selected;
}
function failedChecks(values) {
  const failures = [];
  for (const object of values.flatMap((value) => deepObjects(value ?? {}))) {
    const status = firstString(object, ["result", "status", "checkResult"]);
    if ((status && /fail|error|red|blocked/iu.test(status)) || object.ok === false || object.passed === false) {
      failures.push(compact(firstString(object, ["command", "name", "title", "id"]) || status || "failed check"));
    }
  }
  return [...new Set(failures)].slice(0, 20);
}
function list(items, empty) {
  if (!items.length) return `- ${empty}`;
  return items.slice(0, 20).map((item) => {
    const meta = [item.id !== item.title ? `ID: ${item.id}` : "", item.branch ? `Branch: ${item.branch}` : "", item.source ? `Source: ${item.source}` : ""].filter(Boolean).join(" · ");
    return `- ${item.title}${meta ? ` — ${meta}` : ""}`;
  }).join("\n");
}

const warnings = [];
const rail = readJson(INPUTS.rail, warnings);
if (!rail) {
  process.stderr.write("Project Rail register unavailable.\n");
  process.exitCode = 1;
} else {
  const jsonSources = {
    taskQueue: readJson(INPUTS.taskQueue, warnings),
    workLog: readJson(INPUTS.workLog, warnings),
    progressLog: readJson(INPUTS.progressLog, warnings),
    continuity: readJson(INPUTS.continuity, warnings),
    readiness: readJson(INPUTS.readiness, warnings),
    ownership: readJson(INPUTS.ownership, warnings),
  };
  const textSources = {
    currentState: readText(INPUTS.currentState, warnings),
    nextActions: readText(INPUTS.nextActions, warnings),
    openDone: readText(INPUTS.openDone, warnings),
    doneLog: readText(INPUTS.doneLog, warnings),
  };
  const items = dedupe([
    ...collectItems(jsonSources.taskQueue, INPUTS.taskQueue),
    ...collectItems(jsonSources.workLog, INPUTS.workLog),
    ...collectItems(jsonSources.progressLog, INPUTS.progressLog),
    ...collectItems(jsonSources.continuity, INPUTS.continuity),
    ...collectItems(jsonSources.readiness, INPUTS.readiness),
    ...parseTodoItems(textSources.nextActions, INPUTS.nextActions),
    ...parseTodoItems(textSources.openDone, INPUTS.openDone),
    ...parseTodoItems(textSources.doneLog, INPUTS.doneLog),
  ]);
  const inProgress = items.filter((item) => item.status === "in_progress");
  const ready = items.filter((item) => item.status === "ready").sort((a, b) => a.priority - b.priority);
  const blocked = items.filter((item) => item.status === "blocked");
  const ownerDecisions = items.filter((item) => item.ownerDecision || /owner|bernd|entscheidung|freigabe/iu.test(item.title));
  const done = items.filter((item) => item.status === "done").slice(-20).reverse();
  const failures = failedChecks([jsonSources.workLog, jsonSources.progressLog]);
  const batch = selectSafeBatch(items, rail, jsonSources.ownership);
  const reservations = Array.isArray(jsonSources.ownership?.active_reservations) ? jsonSources.ownership.active_reservations : [];
  const counts = {
    total: items.length,
    open_or_ready: ready.length,
    in_progress: inProgress.length,
    blocked: blocked.length,
    done: done.length,
    owner_decisions: ownerDecisions.length,
    failed_checks: failures.length,
  };
  const dashboard = {
    generated_at: new Date().toISOString(),
    mode: "REPORT_ONLY",
    never_modifies_project_sources: true,
    repository_only_view: true,
    goal: rail.current_scope?.goal ?? "Unknown",
    current_phase: rail.implementation?.current_phase ?? "Project Rail control-plane implementation",
    progress: counts,
    in_progress: inProgress.slice(0, 20),
    ready_next: ready.slice(0, 20),
    blocked: blocked.slice(0, 20),
    owner_decisions: ownerDecisions.slice(0, 20),
    open_prs: {
      status: "external_github_enrichment_required",
      note: "Repository-only generator cannot query live GitHub PR state.",
    },
    failed_checks: failures,
    recently_done: done,
    next_safe_parallel_batch: batch,
    active_file_ownership: reservations,
    warnings,
    sources: INPUTS,
  };
  const markdown = [
    "# WellFit Project Rail Dashboard",
    "",
    `Generated: ${dashboard.generated_at}`,
    "",
    "- Mode: REPORT_ONLY",
    "- Never modifies project sources: true",
    "- Live GitHub PR enrichment: not available in repository-only mode",
    "",
    "## Goal",
    "",
    dashboard.goal,
    "",
    "## Current phase",
    "",
    dashboard.current_phase,
    "",
    "## Progress",
    "",
    `- Total discovered task/status items: ${counts.total}`,
    `- Ready/open: ${counts.open_or_ready}`,
    `- In progress: ${counts.in_progress}`,
    `- Blocked/review required: ${counts.blocked}`,
    `- Recently done captured: ${counts.done}`,
    `- Owner decisions surfaced: ${counts.owner_decisions}`,
    `- Failed checks surfaced: ${counts.failed_checks}`,
    "",
    "## In progress",
    "",
    list(inProgress, "No active work discovered in repository sources."),
    "",
    "## Ready next",
    "",
    list(ready, "No ready/open task discovered."),
    "",
    "## Blocked",
    "",
    list(blocked, "No blocked item discovered."),
    "",
    "## Owner decisions",
    "",
    list(ownerDecisions, "No owner decision discovered."),
    "",
    "## Open PRs",
    "",
    "- Live GitHub PR status requires connector/API enrichment outside this repository-only generator.",
    "",
    "## Failed checks",
    "",
    ...(failures.length ? failures.map((item) => `- ${item}`) : ["- None discovered."]),
    "",
    "## Recently done",
    "",
    list(done, "No completed item discovered."),
    "",
    "## Next safe parallel batch",
    "",
    list(batch, "No non-conflicting low-risk batch could be selected."),
    "",
    "## Active file ownership",
    "",
    ...(reservations.length
      ? reservations.map((entry) => `- ${entry.task_id ?? entry.taskId ?? "unknown"} — ${(entry.allowed_paths ?? entry.allowedPaths ?? []).join(", ") || "no paths recorded"}`)
      : ["- No active reservations."]),
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
  ].join("\n");
  fs.mkdirSync(abs(OUTPUT_DIR), { recursive: true });
  fs.writeFileSync(abs(JSON_OUTPUT), `${JSON.stringify(dashboard, null, 2)}\n`, "utf8");
  fs.writeFileSync(abs(MARKDOWN_OUTPUT), markdown, "utf8");
  process.stdout.write([
    "WellFit Project Rail Dashboard",
    "Mode: REPORT_ONLY",
    "Never modifies project sources: true",
    "PROJECT_RAIL_DASHBOARD_READY=true",
    `JSON: ${JSON_OUTPUT}`,
    `Markdown: ${MARKDOWN_OUTPUT}`,
    "",
  ].join("\n"));
}
