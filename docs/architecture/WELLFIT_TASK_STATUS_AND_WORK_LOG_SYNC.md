# WellFit Task Status and Work Log Sync Governance

Updated: 2026-05-16  
Activation state: `report_only`

## Purpose

This document defines the structured task-status and work-log sync layer for future WellFit Autopilot and Batch Autopilot sessions. It strengthens the existing memory loop across:

- `todolist/TODO_INDEX.md`
- `todolist/NEXT_ACTIONS.md`
- `todolist/WORK_MAP.md`
- `project-register/agent-task-queue.json`
- `project-register/progress-log.json`
- `project-register/agent-work-log.json`
- `project-register/task-status-policy.json`
- PR outcome, PR review, auto-merge, auto-repair, and quality-gate reports

The first version is intentionally **report-only**. It validates consistency and evidence, but it never rewrites TODO files, queue entries, progress entries, work-log entries, PRs, branches, merges, repairs, deployments, runtime product code, or protected areas automatically.

## Canonical status markers

Future TODO/list work should use only these status markers in task-list lines:

| Marker | Canonical status | Meaning |
| --- | --- | --- |
| `[ ]` | `open` | Known task; not started. |
| `[>]` | `in_progress` | Actively being worked or intentionally reserved by an agent/session. |
| `[x]` | `done` | Completed with recorded evidence. |
| `[~]` | `partially_done` | Useful completed subset, but remaining scope or validation is explicit. |
| `[!]` | `blocked_or_review_required` | Blocked, unsafe, unclear, protected, or awaiting human review. |
| `[-]` | `stale_or_superseded` | No longer leading; should point to the current source when known. |
| `[D]` | `duplicate` | Duplicates another canonical task/file and should point to it when known. |

Do not introduce extra marker dialects in `TODO_INDEX.md` or `NEXT_ACTIONS.md`. If a legacy file uses words such as `review_required`, `blocked`, `device_test_required`, or `planning_only`, preserve them as explanatory prose, not as new checkbox markers.

## Completed task evidence

Every newly completed agent task should record, at minimum:

- `taskId`
- `title`
- `status`
- `branch`
- PR number or PR URL when a PR exists
- `changedFiles`
- `checksRun`
- `checkResults`
- `autoMergeEligibilityResult`
- `autoRepairDecisionResult`
- `protectedAreaConfirmation`
- `followUps`
- `nextRecommendedTask`
- timestamp or date

Existing older entries may not contain every new field. The validator reports those as legacy warnings instead of rewriting history.

## Progress log expectations

Progress entries should keep their current lightweight shape, but task-linked progress should include or infer a task ID. New entries should prefer an explicit `taskId` field when they represent a specific task. Existing `PROGRESS-<TASK-ID>-<DATE>-<N>` IDs remain acceptable as inferred evidence.

## In-progress, blocked, stale, and duplicate rules

- `in_progress` items older than the configured threshold need an explanation, owner/session note, blocker note, or continuation note.
- `blocked_or_review_required` items need a blocker reason, human-review note, or next safe action.
- `stale_or_superseded` items should identify the current leading source when known.
- `duplicate` items should identify the canonical task or file when known.
- No task status may be auto-cleared by this first validator.

## Batch Autopilot implications

Before future longer sessions, Batch Autopilot must read both `progress-log.json` and `agent-work-log.json` to avoid loops and stale selections. A real batch session must record every executed task separately and summarize completed, blocked, skipped, follow-up, PR, changed-file, and check evidence. This document does not authorize real auto-merge, auto-repair, deployment, or protected runtime implementation.

## Validator

Run:

```bash
node scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs
```

The validator:

- parses `project-register/task-status-policy.json`
- parses `project-register/agent-work-log.json`
- parses `project-register/progress-log.json`
- inspects `TODO_INDEX.md` and `NEXT_ACTIONS.md` task-list markers
- validates canonical markers
- validates required work-log evidence for current-format completed entries where possible
- validates progress-log task-ID references where applicable
- reports stale `in_progress`, missing blocked reasons, and missing PR/check evidence
- prints `TASK_STATUS_SYNC_READY=true` or `TASK_STATUS_SYNC_READY=false`
- prints optional-link warnings without rewriting files

## Protected boundaries

This governance layer is documentation/register/validation-script only. It must not touch runtime product code, product routes, components, `lib/**`, Firebase Functions, Firestore Rules, package manifests, public assets, GitHub workflows, Unity files, token/NFT/wallet/payment/betting logic, reward authority, mission completion authority, health, child, location, privacy, legal, or compliance logic.

## Next recommended step

After this report-only layer is stable, the next step toward a real Batch Execution Runner is a human-reviewed design for a local-write-only task outcome appender that can append **structured** work-log/progress entries from a validated input file, still without auto-merging, auto-repairing, deploying, or rewriting TODO files automatically.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/task-status-policy.json`, `project-register/agent-work-log.json`, `project-register/progress-log.json` und diese Datei. Fuehre `node scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs` aus. Behandle alle Ergebnisse als report-only, schreibe TODO-Dateien nicht automatisch um, aktiviere weder Auto-Merge noch Auto-Repair, und dokumentiere neue Task-Abschluesse mit Task-ID, Branch, PR-/Check-/Changed-File-/Follow-up-/Next-Task-Evidence.
