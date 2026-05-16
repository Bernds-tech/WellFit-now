# WellFit Continuity & Dependency Sentinel

Stand: 2026-05-16
Status: report-only governance framework

## Purpose

The WellFit Continuity & Dependency Sentinel exists because the repository now has many helpful agent systems, but framework work can still leave important next steps behind in prose. The Sentinel preserves the open points that future agents must not forget:

- follow-up tasks that still need a machine-readable backlog, status register, or output register;
- `review_required`, `blocked`, `device_test_required`, and `human_review_required` items;
- dependency chains between Agent Task Queue, Autopilot, Batch Execution Runner, PR Review, PR Diff Review, PR Post-Creation Guard, Repository Inventory, Product Readiness, Cross-Reference Maintenance, Progress Log, and Agent Work Log;
- required next files and affected registers after each framework task;
- the next logical task that should continue existing work instead of creating duplicate architecture.

The first version is intentionally **report-only**. It does not create tasks, rewrite TODOs, approve PRs, merge, repair, deploy, or change runtime/product code.

## Files

- Machine-readable map: `project-register/continuity-dependency-map.json`
- Human-readable runbook: `docs/architecture/WELLFIT_CONTINUITY_DEPENDENCY_SENTINEL.md`
- Report-only validator: `scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs`
- Report output: `scripts/wellfit-dev-agent/output/continuity-dependency-report.md`

## How this differs from Cross-Reference Maintenance

Cross-Reference Maintenance answers: **when a file changes, which existing registers, TODOs, docs, and validation scripts must be checked for consistency?** It is a change-category coverage system.

The Continuity & Dependency Sentinel answers: **which open points, blocked dependencies, review gates, required future output files, and next-agent handoffs must remain visible after a task ends?** It is a memory and dependency chain system.

Use both together:

1. Cross-Reference Maintenance identifies which maps/registers need synchronization for a change category.
2. The Sentinel records unresolved dependency chains and next actions that should not disappear from future handoffs.

## How this differs from Task Status & Work Log Sync

Task Status & Work Log Sync answers: **did the current task have coherent status markers, changed-file evidence, check results, PR evidence, and work/progress log handoff fields?** It validates execution evidence.

The Sentinel answers: **what remains open after that evidence exists, what blocks advancement, and where should the next agent continue?** It preserves open points across tasks, especially when a new governance framework needs additional machine-readable support files.

A future task can be fully logged and still leave Sentinel entries open. Do not mark a Sentinel entry `done` until its dependency outputs and register updates exist.

## How it prevents forgotten open points

The Sentinel prevents forgotten work by requiring each important dependency to have:

- a stable `id`;
- a `status` using the canonical Sentinel statuses;
- a `source` file that introduced or owns the point;
- an `ownerAgent`;
- explicit `dependencies` using canonical dependency types;
- `affectedRegisters` that future agents must inspect;
- `requiredOutputLocations` so missing machine-readable files are visible;
- a concrete `nextRecommendedTask`;
- a `reason` for blocked/review-required items;
- a `humanReviewRequired` flag.

The validator fails if required fields are missing, if canonical statuses/dependencies drift, if `review_required` or `blocked` entries lack a reason, if `mustNotForget=true` entries lack a next task, or if Work Map / TODO Index links are missing.

## How future agents should add entries

Add a Sentinel entry when a task creates or updates governance, automation, framework, inventory, readiness, review, or agent systems and leaves any follow-up that could be forgotten.

Use an existing entry when possible. Do not create duplicate architecture or a parallel backlog. New entries should be narrow and should point to existing registers first.

Required entry fields:

- `id`: stable identifier such as `CDS-010-short-topic`;
- `title`: concise human title;
- `status`: one of the Sentinel `statusValues`;
- `source`: existing file that owns the open point;
- `ownerAgent`: responsible future agent/framework;
- `mustNotForget`: true for handoff-critical open points;
- `reason`: required for blocked/review-required/human-review/device-test items;
- `dependencies`: one or more canonical dependency types;
- `affectedRegisters`: existing registers that must be checked when resolving it;
- `requiredOutputLocations`: files/reports that must exist or be created by a future approved task;
- `nextRecommendedTask`: one concrete next step;
- `humanReviewRequired`: true when protected topics, automation activation, or blocked/review-required gates need humans.

## How entries become Agent Task Queue tasks

The Sentinel **does not create tasks automatically**. A future agent may convert an entry into `project-register/agent-task-queue.json` only in a normal docs/register PR, after reading AGENTS.md, CURRENT_PROJECT_STATE, WORK_MAP, TODO_INDEX, NEXT_ACTIONS, the relevant source policy, and this map.

When converting an entry into an Agent Task Queue task:

1. Keep the task scoped to the existing affected registers and required output locations.
2. Preserve protected-path and human-review constraints.
3. Add or update work-log/progress-log evidence after the task.
4. Keep the Sentinel entry open until the new task actually produces the required outputs.
5. Mark the Sentinel entry `done` only when the output files, validation script/report, and related register references exist.

## Preserving `review_required` and blocked items

`review_required`, `human_review_required`, `device_test_required`, and `blocked` entries are not failures. They are explicit stop conditions and handoff obligations.

Future agents must not silently remove, downgrade, or mark them done. They require one of:

- concrete output evidence proving the dependency is resolved;
- explicit human-review approval documented in the appropriate register/work-log;
- a new successor Sentinel entry if the old one is superseded.

Automation-related blocked entries must keep their blocking dependency types (`blocks_auto_merge`, `blocks_auto_repair`, `blocks_batch_execution`, or `blocks_product_readiness_advance`) until a separate human-reviewed policy change removes them.

## How the next agent uses the map

Before continuing governance or framework work, the next agent should:

1. Read AGENTS.md, CURRENT_PROJECT_STATE, WORK_MAP, TODO_INDEX, NEXT_ACTIONS, then `project-register/continuity-dependency-map.json`.
2. Run `node scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs`.
3. Pick the most relevant open entry instead of inventing a parallel system.
4. Update the affected existing registers and required output locations.
5. Run the standard checks and the Sentinel check.
6. In the PR, state which Sentinel entries remain open, blocked, review-required, or done.

Current next recommended task: **Website Agent Framework with website-agent backlog/status register**. This is represented by the initial Website Agent Framework Sentinel entry and should remain report-only/docs-register-script work until explicitly changed.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und `project-register/continuity-dependency-map.json`. Waehle die naechste offene Sentinel-Dependency nur dann aus, wenn sie in bestehenden Registern/Docs fortgefuehrt werden kann. Erstelle keine Parallelarchitektur, aktiviere keine automatische Task-Erstellung, kein Auto-Merge, kein Auto-Repair, keine PR-Approval, kein Deployment und keine Runtime-/Produkt-/Unity-/PR-#13-Aenderungen. Aktualisiere bei Abschluss die betroffenen Register, Work-/Progress-Log-Evidence und den Sentinel-Eintrag mit klarer Begruendung fuer weiterhin offene, `review_required`, `blocked` oder `device_test_required` Punkte.
