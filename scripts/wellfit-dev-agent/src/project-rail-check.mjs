#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = "scripts/wellfit-dev-agent/output/project-rail-check.md";
const RAIL = "project-register/project-rail.json";
const CONTROL = "project-register/agent-control-center.json";
const STATUS = "project-register/task-status-policy.json";

const orderedExpected = [
  "idea",
  "analysis",
  "owner_decision_if_required",
  "planned",
  "ready",
  "in_progress",
  "testing",
  "review",
  "pr_created",
  "merged",
  "verified",
  "done",
];
const sideExpected = ["blocked", "deferred", "rejected"];
const planningExpected = [
  "task_id",
  "problem",
  "goal",
  "scope",
  "non_goals",
  "dependencies",
  "allowed_paths",
  "blocked_paths",
  "risk_level",
  "owner_decision_required",
  "required_checks",
  "rollback_or_stop_plan",
  "definition_of_done",
  "expected_follow_up_sources",
];
const dashboardExpected = [
  "goal",
  "current_phase",
  "progress",
  "in_progress",
  "ready_next",
  "blocked",
  "owner_decisions",
  "open_prs",
  "failed_checks",
  "recently_done",
  "next_safe_parallel_batch",
];

const abs = (p) => path.join(ROOT, p);
const fileExists = (p) => {
  try {
    return fs.statSync(abs(p)).isFile();
  } catch {
    return false;
  }
};
const readJson = (p) => {
  const value = JSON.parse(fs.readFileSync(abs(p), "utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${p} must contain a JSON object`);
  }
  return value;
};
const same = (a, b) =>
  Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);
const contains = (a, b) => Array.isArray(a) && b.every((v) => a.includes(v));
const unique = (a) => [...new Set(a)];
const checks = [];
const warnings = [];
const check = (name, passed, details) => checks.push({ name, passed, details });

for (const p of [RAIL, CONTROL, STATUS, "docs/architecture/WELLFIT_PROJECT_RAIL.md"]) {
  check(`Required control file exists: ${p}`, fileExists(p), p);
}

let rail;
let control;
let statusPolicy;
for (const [label, p, setter] of [
  ["Project Rail", RAIL, (v) => (rail = v)],
  ["Agent Control Center", CONTROL, (v) => (control = v)],
  ["Task status policy", STATUS, (v) => (statusPolicy = v)],
]) {
  try {
    setter(readJson(p));
    check(`${label} JSON parses`, true, p);
  } catch (error) {
    check(`${label} JSON parses`, false, error.message);
  }
}

function validateMap(label, map, validTargets, railStates) {
  const mapping = map ?? {};
  check(
    `${label} compatibility covers every rail state`,
    railStates.every((state) => Object.hasOwn(mapping, state)),
    `mapped=${Object.keys(mapping).length}/${railStates.length}`,
  );
  for (const state of railStates) {
    const targets = mapping[state];
    const valid =
      Array.isArray(targets) &&
      targets.length > 0 &&
      targets.every((target) => validTargets.has(target));
    check(
      `${label} mapping for ${state}`,
      valid,
      Array.isArray(targets) ? targets.join(", ") : "missing",
    );
  }
}

if (rail) {
  const ordered = rail.lifecycle?.ordered_states ?? [];
  const side = rail.lifecycle?.side_states ?? [];
  const allStates = [...ordered, ...side];

  check("Ordered lifecycle is exact", same(ordered, orderedExpected), ordered.join(" -> "));
  check("Side states are exact", same(side, sideExpected), side.join(", "));
  check(
    "Lifecycle states are unique",
    unique(allStates).length === allStates.length,
    `unique=${unique(allStates).length}, total=${allStates.length}`,
  );
  check(
    "No side state overlaps ordered lifecycle",
    side.every((state) => !ordered.includes(state)),
    side.join(", "),
  );
  check("No-skip rule is enabled", rail.lifecycle?.no_skip_rule === true, String(rail.lifecycle?.no_skip_rule));
  check(
    "Agent-finished does not mean DONE",
    rail.lifecycle?.agent_claims_finished_are_not_done === true,
    String(rail.lifecycle?.agent_claims_finished_are_not_done),
  );

  const sources = Object.values(rail.authoritative_sources ?? {}).filter((v) => typeof v === "string");
  check(
    "Authoritative sources are non-empty and unique",
    sources.length > 0 && unique(sources).length === sources.length,
    `sources=${sources.length}`,
  );
  for (const source of sources) check(`Authoritative source exists: ${source}`, fileExists(source), source);

  check(
    "Planning gate contains mandatory fields",
    contains(rail.planning_gate?.required_fields, planningExpected),
    `fields=${rail.planning_gate?.required_fields?.length ?? 0}`,
  );
  check(
    "Missing planning fields block execution",
    rail.planning_gate?.missing_field_action === "blocked",
    String(rail.planning_gate?.missing_field_action),
  );

  const targets = rail.completion_sync?.must_reconcile ?? [];
  check("Completion sync has targets", targets.length > 0, `targets=${targets.length}`);
  check("Completion sync targets are unique", unique(targets).length === targets.length, `unique=${unique(targets).length}`);
  for (const target of targets) check(`Completion target exists: ${target}`, fileExists(target), target);
  check(
    "DONE is blocked until completion sync",
    rail.completion_sync?.automatic_done_without_sync === false,
    String(rail.completion_sync?.automatic_done_without_sync),
  );

  check(
    "Dashboard contract contains mandatory sections",
    contains(rail.dashboard_contract?.required_sections, dashboardExpected),
    `sections=${rail.dashboard_contract?.required_sections?.length ?? 0}`,
  );

  const scripts = Object.values(rail.implementation?.scripts ?? {}).filter((v) => typeof v === "string");
  for (const script of scripts) check(`Implementation exists: ${script}`, fileExists(script), script);

  const ownership = rail.dispatcher_contract?.active_ownership_register;
  check("Active ownership register configured", typeof ownership === "string" && ownership.length > 0, ownership ?? "missing");
  if (ownership) check("Active ownership register exists", fileExists(ownership), ownership);

  if (statusPolicy) {
    const statuses = new Set(
      (statusPolicy.canonicalStatusMarkers ?? [])
        .map((entry) => entry?.status)
        .filter((value) => typeof value === "string"),
    );
    validateMap("Task-status policy", rail.status_compatibility?.task_status_policy, statuses, allStates);
  }
  if (control) {
    const statuses = new Set((control.proposal_statuses ?? []).filter((value) => typeof value === "string"));
    validateMap("Agent Control Center", rail.status_compatibility?.agent_control_center, statuses, allStates);
  }

  if (!String(rail.current_scope?.landing_page_parallel_work ?? "").includes("Landing")) {
    warnings.push("Landing-page isolation is not clearly documented.");
  }
}

const errors = checks.filter((item) => !item.passed);
const ready = errors.length === 0;
const report = [
  "# WellFit Project Rail Check",
  "",
  "- Mode: REPORT_ONLY",
  "- Never rewrites source files: true",
  `- PROJECT_RAIL_READY=${ready}`,
  `- Errors: ${errors.length}`,
  `- Warnings: ${warnings.length}`,
  "",
  "## Checks",
  "",
  "| Check | Status | Details |",
  "|---|---|---|",
  ...checks.map((item) => `| ${item.name.replaceAll("|", "\\|")} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.details).replaceAll("|", "\\|")} |`),
  "",
  "## Errors",
  "",
  ...(errors.length ? errors.map((item) => `- ${item.name}: ${item.details}`) : ["- None"]),
  "",
  "## Warnings",
  "",
  ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- None"]),
  "",
].join("\n");

fs.mkdirSync(path.dirname(abs(OUT)), { recursive: true });
fs.writeFileSync(abs(OUT), report, "utf8");
process.stdout.write([
  "WellFit Project Rail Check",
  "Mode: REPORT_ONLY",
  "Never rewrites source files: true",
  `PROJECT_RAIL_READY=${ready}`,
  `Report: ${OUT}`,
  "",
].join("\n"));
process.exitCode = ready ? 0 : 1;
