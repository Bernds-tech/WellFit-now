# WellFit Agent System Analysis

Status: active governance analysis  
Updated: 2026-05-15  
Scope: documentation, registry, and validation-script governance only; no runtime product logic.

## Purpose

This analysis summarizes the current WellFit agent/autopilot/governance system so future agents understand the existing control surfaces before changing routes, APIs, product modules, agent scripts, roadmap items, feedback/insight systems, research governance, or documentation baselines.

It does not create a parallel architecture. It points to the existing canonical files and to the cross-reference maintenance framework in `project-register/cross-reference-maintenance.json` and `docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md`.

## Current agent / governance components

| Component | Canonical files | Role |
|---|---|---|
| Human repository rules | `AGENTS.md` | Highest local repository instruction set for branch, PR, safety, protected areas, TODO preservation, and reporting rules. |
| Current memory baseline | `todolist/CURRENT_PROJECT_STATE.md`, `todolist/NEXT_ACTIONS.md` | Current state, verified baseline, open priorities, protected areas, and next-action context. |
| Work and TODO maps | `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` | Topic-to-file routing map and index of planning/status/docs/scripts. |
| Agent workflows | `project-register/agent-workflows.json` | Machine-readable Stufe-4 workflow, control registers, phases, required reads, checks, and anti-duplication rules. |
| Task selection | `project-register/agent-task-queue.json`, `scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs` | Ranked safe task candidates, allowed/forbidden files, definition-of-done keys, stop conditions, cooldown, and loop guard. |
| Autopilot dry run | `project-register/agent-autopilot.json`, `scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs`, `docs/architecture/WELLFIT_AGENT_AUTOPILOT_RUNBOOK.md` | Dry-run-only orchestration from memory read through task selection, risk gates, validation planning, PR handoff, and stop for approval. |
| Risk / definition of done | `project-register/risk-classifier.json`, `project-register/definition-of-done.json` | Risk levels, protected areas, stop rules, and evidence requirements. |
| Cross-reference maintenance | `project-register/cross-reference-maintenance.json`, `docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md`, `scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` | Required inspect/update matrix for future changes across registers, TODOs, docs, readiness, agent scripts, and validation checks. |
| Quality gate | `scripts/wellfit-dev-agent/src/quality-gate.mjs` | Aggregates validation/report-only scripts and fails when required governance checks are missing or unsafe. |

## Current memory files

The primary memory files are:

- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `todolist/NEXT_ACTIONS.md`
- `project-register/agent-work-log.json`
- `project-register/progress-log.json`
- `project-register/agent-follow-ups.json`
- `project-register/product-readiness.json`
- `project-register/internal-sources.json`
- `project-register/master-roadmap-tasks.json`
- `project-register/user-feedback.json`
- `project-register/research-recommendations.json`
- `project-register/adaptive-user-insights.json`

These files must be read before broad agent/governance changes and kept as pointers to existing systems rather than replacement architecture.

## Current task-selection flow

1. Read the required first-read files from `AGENTS.md`, the TODO/memory files, and the project registers.
2. Inspect branch, worktree state, dependency state, and whether the requested task is documentation/registry/script-only or runtime work.
3. Use `project-register/agent-task-queue.json` and `scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs` to rank non-blocked safe tasks.
4. Use `project-register/risk-classifier.json` to classify risk; unclear or protected work stops or becomes planning-only.
5. Verify the task has a valid `definitionOfDoneKey` in `project-register/definition-of-done.json`.
6. Inspect related mapped files from `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, route/API/feature/readiness registers, internal sources, roadmap, feedback, insight, and research registers.
7. Run validation/report-only scripts required by the task and the quality gate.
8. Prepare a PR handoff and stop before merge/deploy/protected work.

## Current cooldown and loop-guard behavior

The task picker uses `project-register/progress-log.json` and `project-register/agent-work-log.json` as task-selection memory. Recently completed task IDs are skipped for the immediate next selection when another safe non-blocked candidate exists.

The baseline/registry loop guard watches the guarded pair:

- `AGENT-DOC-BASELINE-CHECK`
- `AGENT-REGISTRY-SYNC`

When both appear in the recent completed-task window, the picker skips both once and prefers the highest-ranked safe task from another `taskCategory`. If no different-category candidate exists, the picker may fall back to the safest available task but must report why.

## Current validation scripts

The current quality gate runs these major script families:

- Agent config, goal, dry-run, memory, and coder-prompt checks.
- Stufe-4 and agent-governance-control checks.
- Product readiness, route/API register, route/API drift, and concept-to-code gap checks.
- Visual route smoke, site route audit, mobile Buddy UX audit, feedback loop audit, Firebase security audit, Firestore emulator test plan check, mission/buddy/economy audit, and Firestore economy rules check.
- Next task suggestion, Autopilot dry run, follow-up detector, PR outcome recorder dry run, TODO status sync, master roadmap task check, research recommendation check, adaptive user insight check, and cross-reference maintenance check.

## Current register families

| Register family | Files |
|---|---|
| Route/API/feature inventory | `project-register/routes.json`, `project-register/pages.json`, `project-register/apis.json`, `project-register/features.json` |
| Product/readiness/rules | `project-register/product-readiness.json`, `project-register/product-rules.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json` |
| Agent governance | `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/agent-autopilot.json`, `project-register/agent-work-log.json`, `project-register/agent-follow-ups.json`, `project-register/progress-log.json` |
| Concept/roadmap/source maps | `project-register/internal-sources.json`, `project-register/master-roadmap-tasks.json`, `project-register/cross-references.json`, `project-register/todos.json`, `project-register/decisions.json` |
| Feedback/research/insight | `project-register/user-feedback.json`, `project-register/feedback-analytics-loop.json`, `project-register/research-recommendations.json`, `project-register/adaptive-user-insights.json` |
| Visual / flow guardrails | `project-register/visual-regression.json`, `project-register/mission-buddy-economy-flow.json` |
| Cross-reference maintenance | `project-register/cross-reference-maintenance.json` |

## Current protected areas

Protected areas include:

- `native/unity/WellFitBuddyAR/**` and PR #13.
- Token, NFT, wallet, payment, payout, marketplace, staking, presale, trading, betting, and other financial-equivalent mechanics.
- Reward authority, final ledger writes, mission completion authority, anti-cheat, inventory unlocks, and rare item grants.
- Health/watch data, child safety, location, camera, privacy, consent, legal, AGB, Datenschutz, Impressum, medical-adjacent logic, and compliance messaging.
- Secrets and server API keys.

For these topics, future agents must either stop, remain planning-only, or obtain explicit human approval with a clear review plan.

## Current Autopilot limitations

- Autopilot is `dry_run_only`; it must not write files, merge, deploy, publish, or close PRs.
- It can recommend a safe task, list risk/checks/files/stop conditions, and prepare a handoff, but human approval is required before implementation and all protected work.
- It must not create duplicate architecture or parallel systems.
- It relies on current registers and generated reports; unverified route/API/feature claims remain stop conditions.
- High and critical risk tasks are never automatically selected for implementation.

## What must happen after every future agent task

After every future task, the agent must:

1. Identify the relevant change category in `project-register/cross-reference-maintenance.json`.
2. Inspect every `requiredInspectFiles` entry for that category.
3. Update only existing `requiredUpdateTargets` that are necessary and verifiable.
4. Preserve historical TODO/status context; never delete or replace old planning files.
5. Avoid duplicate architecture, duplicate registers, duplicate app shells, duplicate route/API systems, and duplicate product modules.
6. Apply all `forbiddenAutoUpdates` and `humanReviewRules` before editing.
7. Run the category validation requirements plus `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` and `npm run agent:quality-gate`.
8. Report changed files, checks, risks, dependency status, protected-area status, and next recommended task in the PR.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `project-register/cross-reference-maintenance.json` und `docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md`. Bestimme vor jeder Aenderung die passende Change Category, pruefe alle requiredInspectFiles, aktualisiere nur bestehende requiredUpdateTargets, vermeide Parallelarchitektur und fuehre die Cross-Reference- sowie Quality-Gate-Checks aus.
