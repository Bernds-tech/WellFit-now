# WellFit Autopilot Batch Mode (Dry Run Only)

Status: active governance note
Updated: 2026-05-15
Leading register: `project-register/autopilot-batch-policy.json`
Validation script: `scripts/wellfit-dev-agent/src/autopilot-batch-dry-run.mjs`

## Purpose

The Batch Autopilot dry run lets future WellFit agents produce a short, safe, report-only sequence of candidate tasks. It extends the existing single-task Autopilot and task queue controls without creating a second task architecture.

This first version is planning-only. It must not execute tasks, edit files, create pull requests, merge, deploy, run repairs, approve its own work, or touch protected product areas.

## Inputs

Batch planning uses the existing governance stack:

- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `project-register/agent-autopilot.json`
- `project-register/agent-task-queue.json`
- `project-register/risk-classifier.json`
- `project-register/definition-of-done.json`
- `project-register/auto-merge-policy.json`
- `project-register/auto-repair-policy.json`
- `project-register/cross-reference-maintenance.json`
- `project-register/repository-inventory.json`
- `project-register/progress-log.json`
- `project-register/agent-work-log.json`
- `project-register/autopilot-batch-policy.json`

## Allowed scope

The batch dry run may plan only low-risk documentation, registry, governance, inventory, and analysis tasks already represented in `project-register/agent-task-queue.json`.

Allowed candidates must:

1. have a risk level listed in `allowedTaskRiskLevels`,
2. have a task category listed in `allowedTaskCategories`,
3. have a valid `definitionOfDoneKey`,
4. avoid all `forbiddenPaths`,
5. respect the existing cooldown and loop guard rules from the task queue, and
6. report required checks before any future implementation.

## Forbidden scope

Batch mode must stop instead of planning or executing work that would touch:

- runtime product code under `app/**`, `components/**`, `lib/**`, `functions/**`, or `firestore.rules`,
- Unity / `native/unity/WellFitBuddyAR/**` or PR #13,
- package manifests or lockfiles unless a human explicitly approves them,
- token, NFT, wallet, payment, betting, trading, payout, marketplace, staking, presale, reward authority, mission completion authority, anti-cheat authority, health, watch, child-safety, location, camera, privacy, consent, legal, or compliance logic.

## Cooldown and loop guard

The batch script reads `progress-log.json` and `agent-work-log.json`, then applies the same recent-completion window and guarded baseline/registry pair policy used by the single-task picker. Recently completed tasks are skipped when another safe candidate exists. If the guarded baseline/registry pair appears in the recent window, the planner prefers a different task category.

## Auto-merge and auto-repair

Auto-merge and auto-repair are included only as future considerations in the report:

- Auto-merge reference: `project-register/auto-merge-policy.json`
- Auto-repair reference: `project-register/auto-repair-policy.json`

Batch mode does not call these policies as authorization to merge or repair. It only prints that they remain future, report-only considerations.

## Output contract

The script must print:

- `BATCH_AUTOPILOT_MODE=DRY_RUN`,
- `Result: DRY_RUN`,
- selected planned tasks up to `maxPlannedTasks`,
- each task's risk, category, allowed files, forbidden files, required checks, and stop conditions,
- batch stop conditions,
- auto-merge as future consideration only,
- auto-repair as future consideration only,
- confirmation that the dry run never writes files, creates PRs, merges, deploys, repairs, or approves its own work.

## Quality gate integration

`scripts/wellfit-dev-agent/src/quality-gate.mjs` runs the batch dry-run script in report-only mode and fails if the script does not report dry-run safety markers.

## Future activation requirements

Real batch execution is intentionally not enabled. Any future activation would require a separate human-approved policy change, updated risk controls, explicit write boundaries, test evidence, PR review, and new stop-before-merge/deploy rules. This document and policy are not approval for that future work.

## Human-approved manual session guardrail

The dry-run policy remains `dry_run_only`; the dry-run script must still never write files, create PRs, merge, deploy, repair, or approve work. A human may separately approve a manual, bounded Batch Autopilot work session, but that session must stay inside the existing task queue and the existing governance/register architecture.

For the controlled session `BATCH-AUTOPILOT-SESSION-2-2026-05-15`, the selected tasks are:

1. `AGENT-AUTOPILOT-BATCH-DRY-RUN`
2. `AGENT-PR-REVIEW-POLICY-GOVERNANCE`

Both tasks are low-risk `registry_task` governance tasks from the current dry-run output. The second task is allowed in the same PR only because it shares the same agent-governance scope, requires no product source-of-truth decision, and can be completed through existing docs/register cross-reference maintenance. If any task requires runtime code, protected product areas, Unity/PR #13, package manifests, public assets, deployment, auto-merge, auto-repair, or unclear source-of-truth decisions, the session must stop instead of widening scope.

The PR handoff for any approved manual session must list selected tasks, why each was safe, whether one or two tasks were executed, changed files, checks, cross-reference maintenance decisions, report-only auto-merge/auto-repair/PR-review results, and explicit confirmations that real auto-merge, real auto-repair, deployment, runtime product changes, and protected-area changes did not occur.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/autopilot-batch-policy.json`, `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/cross-reference-maintenance.json`, `project-register/repository-inventory.json`, `project-register/progress-log.json`, `project-register/agent-work-log.json` und `scripts/wellfit-dev-agent/src/autopilot-batch-dry-run.mjs`. Halte Batch Autopilot dry-run-only/report-only, aktiviere keine echte Batch-Ausfuehrung, kein Auto-Merge und kein Auto-Repair, schreibe aus dem Batch-Script keine Dateien, beruehre keine Runtime-/Unity-/PR-13-/Compliance-geschuetzten Bereiche und pflege neue Verweise nur in den bestehenden Work-Map-/TODO-/Registerdateien statt eine parallele Architektur anzulegen.
