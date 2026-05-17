# WellFit Agent Autopilot Runbook and Iteration Orchestrator

Status: active / staged autonomy governance documentation
Updated: 2026-05-17
Machine-readable control: `project-register/agent-autopilot.json`  
Dry-run entrypoint: `node scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs`

## Purpose

The WellFit Agent Autopilot is the single governed entrypoint for future Codex/AI agent iterations. It does **not** replace the existing WellFit governance, memory loop, task queue, risk classifier, definition of done, readiness matrix, work map, internal sources, roadmap, feedback, research, or insight registers. It orchestrates those existing sources into one safe dry run that tells an agent what it may inspect, which safe task is currently suggested, which risk gates apply, which checks must run, and where the iteration must stop for human approval before implementation, merge, or deployment.

Autopilot remains dry-run-only for `Stufe 4A`. Broader autonomy is split into explicit stages below; no stage may merge, deploy, approve protected work, or bypass its `project-register/` policy file.


## Stufe-4 autonomy stages

Autopilot language must not collapse all work into one vague end-to-end autonomy mode. Every run must declare exactly which stage is active and must cite the responsible policy file in `project-register/` before continuing.

| Stage | Meaning | Responsible policy file | Allowed outcome | Disabled/stop condition |
| --- | --- | --- | --- | --- |
| `Stufe 4A` | Autonomous analysis and task creation | `project-register/agent-autopilot.json` | Dry-run report with selected/suggested task, risk classification, required checks, affected files/registers, and stop conditions | Stop before any automatic file write, PR creation, merge, or deployment |
| `Stufe 4B` | Autonomous docs/register changes with PR | `project-register/agent-workflows.json` | Scoped documentation, register, governance, inventory, or report-only script update with commit, PR summary, checks, risks, and next task | Stop if runtime product logic, protected areas, or unlisted files are required |
| `Stufe 4C` | Limited runtime changes with allowlist | `project-register/approved-agent-build-runner-policy.json` | Small runtime change only when the human-approved task, allowlist, risk classifier, definition of done, required checks, and protected-scope gates all allow it | Stop on files outside allowlist, medium/high/critical uncertainty, protected authority, or missing checks |
| `Stufe 4D` | Safe auto-repairs | `project-register/auto-repair-policy.json` | Narrow repair of a concrete failed validation check when the policy says the repair is safe and bounded | Stop on broad refactors, test removal, runtime expansion, protected topics, or ambiguous failure cause |
| `Stufe 4E` | Merge recommendation | `project-register/auto-merge-policy.json` | Report-only recommendation for human merge consideration after checks, diff review, post-creation guard, and risk gates | Does not approve, enable, or perform a merge |
| `Stufe 4F` | Auto-merge, currently disabled | `project-register/auto-merge-policy.json` | No active execution outcome; only records that auto-merge remains disabled | Any attempt to auto-merge must stop unless the repository owner explicitly changes the policy |

## Source of truth hierarchy

Autopilot runs must honor the existing sources in this order:

1. Direct human instructions for the current task.
2. `AGENTS.md` and any scoped `AGENTS.md` files.
3. Current-state and TODO governance: `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, and `todolist/NEXT_ACTIONS.md`.
4. Agent governance and memory registers: `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/agent-work-log.json`, and `project-register/progress-log.json`.
5. Product readiness and evidence registers: `project-register/product-readiness.json`, `project-register/internal-sources.json`, `project-register/master-roadmap-tasks.json`, `project-register/user-feedback.json`, `project-register/adaptive-user-insights.json`, and `project-register/research-recommendations.json`.
6. Architecture docs that are already referenced by the Work Map or registers.

If these sources conflict, the agent must stop, report the conflict, and ask for human clarification rather than creating a duplicate architecture or parallel system.

## Required first-read files

Every Autopilot iteration starts by reading these files before planning changes:

- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `todolist/NEXT_ACTIONS.md`
- `project-register/agent-workflows.json`
- `project-register/agent-task-queue.json`
- `project-register/risk-classifier.json`
- `project-register/definition-of-done.json`
- `project-register/agent-work-log.json`
- `project-register/progress-log.json`
- `project-register/product-readiness.json`
- `project-register/internal-sources.json`
- `project-register/master-roadmap-tasks.json`
- `project-register/user-feedback.json`
- `project-register/adaptive-user-insights.json`
- `project-register/research-recommendations.json`

## Iteration phases

The machine-readable phase list lives in `project-register/agent-autopilot.json`. Future agents must preserve these phases unless the repository owner explicitly changes the governance model.

### 1. `read_memory`

Read the required first-read files and scoped `AGENTS.md` instructions before selecting or editing anything.

### 2. `inspect_current_state`

Confirm branch, dependency state, visible worktree changes, relevant Work Map entries, and whether the requested task is documentation/registry/script-only or runtime product work.

### 3. `select_next_task`

Use `project-register/agent-task-queue.json`, `project-register/progress-log.json`, `project-register/agent-work-log.json`, and the existing suggestion script (`scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs`) to select the next non-blocked low/medium-risk task when the human request allows automatic selection. The picker must treat the latest relevant completed task in progress/work logs as recently completed and skip it for the immediate next selection when another safe non-blocked candidate exists. A narrower human request may override the suggestion only if it still satisfies the same safety gates.


### Task selection memory / cooldown

Autopilot must not loop forever on the same completed baseline task. The task picker uses `project-register/progress-log.json` and `project-register/agent-work-log.json` as memory inputs before ranking candidates. It now considers a small recent completed-task window instead of only one latest entry. If a recent relevant log entry identifies a completed task ID, such as `AGENT-DOC-BASELINE-CHECK`, the picker should skip that task once and prefer the next safe non-blocked low/medium-risk candidate with a valid definition-of-done key. If no other safe candidate exists, the picker may select the recently completed task again, but it must explain that fallback in its report. This cooldown does not permanently mark the queue task done and does not change the Autopilot `dry_run_only` state.

### Baseline / registry loop guard

The guarded pair is `AGENT-DOC-BASELINE-CHECK` plus `AGENT-REGISTRY-SYNC`. If both task IDs appear in the recent completed-task window, the picker treats that as a possible baseline/registry alternation loop. For the next selection pass only, it skips both guarded tasks when another safe low/medium-risk, non-blocked candidate with a valid definition-of-done key exists. When possible, the picker should also move to a different `taskCategory` rather than continuing the documentation-baseline or registry-sync category. With the current queue, this means a recently completed baseline/registry pair should move to the next safe different-category task, such as `AGENT-DRIFT-GAP-REGISTER-FOLLOWUP`, before returning to either guarded task.

If every otherwise safe candidate is either part of the guarded pair or no different-category candidate exists, the picker may fall back to the safest available task and must report that the baseline/registry loop guard could not divert selection. This fallback remains report-only and does not authorize merge, deployment, runtime product edits, or protected work.

### 4. `classify_risk`

Classify the selected or requested task with `project-register/risk-classifier.json`. Protected topics default to high or critical risk. If risk is unclear, classify it as high and stop before implementation.

### 5. `check_definition_of_done`

Map the task to a valid `definitionOfDoneKey` in `project-register/definition-of-done.json`. If no matching definition exists, stop and report the missing governance mapping.

### 6. `inspect_related_files`

Inspect only existing leading files mapped by `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/internal-sources.json`, product readiness entries, roadmap tasks, and relevant architecture docs. Do not create a duplicate architecture, task queue, register, route, API, or product subsystem.

### 7. `create_plan`

Create a small implementation or documentation plan. For dry-run Autopilot, the plan is report-only. For future implementation tasks, the plan must list allowed files, forbidden files, required checks, expected evidence, and stop conditions.

### 8. `run_validation_checks`

Run the checks required by `project-register/agent-autopilot.json`, the selected task, and `project-register/definition-of-done.json`. Dry-run Autopilot itself must exit `0` when it successfully reports governance state and must not write files.

### 9. `report_followups`

Report follow-ups from existing sources only. Use the existing follow-up and PR recorder scripts in report-only/dry-run modes. Do not auto-create high/critical follow-ups or new TODO systems.

### 10. `prepare_pr_summary`

Prepare a PR summary that names changed files, checks run, risks, skipped checks, dependencies, and the next recommended task. The summary must state that Autopilot remains dry-run-only when applicable.

### 11. `stop_for_human_approval`

Stop before merge, deploy, protected implementation, high/critical work, or any action requiring owner approval. Autopilot never merges and never deploys.

## Allowed actions

By stage, Autopilot allows only the actions authorized by the stage policy file. Current baseline allowances are:

- reading repository governance, TODO, architecture, and project-register files;
- running validation and report-only scripts;
- printing the selected next safe task, risk classification, required checks, affected files/registers, stop conditions, and planning-only/implementation status;
- preparing a human-readable plan and PR handoff;
- in `Stufe 4B`, updating governance documentation/registers only when explicitly requested by a human task, as done in normal PR workflow;
- in `Stufe 4C` and `Stufe 4D`, proceeding only inside the explicit allowlist/safe-repair boundaries from their policy files;
- in `Stufe 4E`, emitting a merge recommendation only;
- in `Stufe 4F`, stopping because real auto-merge is currently disabled.

## Forbidden actions

Autopilot must not:

- write files automatically during `agent-autopilot-dry-run.mjs`;
- merge, deploy, publish, close PRs, or treat `Stufe 4E` as approval;
- touch PR #13 or `native/unity/WellFitBuddyAR/**`;
- modify runtime product logic in documentation/registry/script-only tasks;
- create duplicate architecture, duplicate task systems, parallel registries, duplicate routes/APIs, or duplicate feature modules;
- modify token, NFT, wallet, payment, payout, marketplace, staking, presale, trading, betting, reward authority, final ledger, health, child, location, camera, privacy, consent, medical, legal, AGB, Datenschutz, Impressum, or compliance logic without explicit human approval and a review plan;
- expose secrets or server API keys.

## Risk gates and stop conditions

Autopilot must stop and report when:

- risk is high or critical;
- risk is unclear;
- protected topics are detected;
- the current branch is `main`;
- task files are outside the allowed mapped files;
- the work requires runtime product logic but the request is documentation/registry/script-only;
- the work would duplicate existing architecture or create a parallel system;
- validation files are missing or malformed;
- checks fail for code reasons;
- human approval is required and not present.

`Stufe 4A` is analysis/task creation only. `Stufe 4B` may implement low-risk documentation/register changes through normal branch/commit/PR workflow. `Stufe 4C` may touch runtime files only when a human-approved allowlist and `project-register/approved-agent-build-runner-policy.json` permit it. `Stufe 4D` may repair only the narrow failure class permitted by `project-register/auto-repair-policy.json`. `Stufe 4E` is a recommendation report. `Stufe 4F` is disabled and must stop before merge.

## Required checks

The default Autopilot validation bundle is:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm --prefix functions run check
npm run agent:quality-gate
node scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs
jq empty project-register/agent-autopilot.json
```

Task-specific checks from `project-register/agent-task-queue.json` and `project-register/definition-of-done.json` must be added when they are stricter.

## Required report output

Autopilot dry-run output must include:

- activation state;
- selected next safe task;
- selection source and rationale;
- risk classification;
- whether implementation is allowed or planning-only;
- definition-of-done key and evidence;
- required checks;
- affected registers/files;
- forbidden files/actions;
- stop conditions;
- product readiness, research recommendation, and adaptive insight context when present;
- no-merge/no-deploy reminder;
- human approval rule.

## Quality gate integration

`npm run agent:quality-gate` may run Autopilot `Stufe 4A` only in dry-run/report-only mode. A successful dry run means the orchestrator reported a safe plan and exited `0`; it does not authorize implementation, merge, deployment, protected work, or high/critical work. Later-stage checks may report readiness for `Stufe 4B`-`Stufe 4E`, but they still do not activate `Stufe 4F` auto-merge.

## KI-Fortsetzungs-Prompt

Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/agent-work-log.json`, `project-register/progress-log.json`, `project-register/product-readiness.json`, `project-register/internal-sources.json`, `project-register/master-roadmap-tasks.json`, `project-register/user-feedback.json`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json`, und diese Runbook-Datei. Fuehre `node scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs` aus, nutze nur bestehende fuehrende Dateien, stoppe bei hohem/kritischem/unklarem Risiko, ordne den Auftrag einer Stufe `4A` bis `4F` mit zustaendiger Policy-Datei zu, implementiere in `4A` nichts automatisch, merge/deploye nie, behandle `4F` als deaktiviert, und liefere eine Handoff-Zusammenfassung mit Checks, Risiken und naechstem sicheren Task.
