# WellFit Agent Autopilot Runbook and Iteration Orchestrator

Status: active / dry-run-only governance documentation  
Updated: 2026-05-14  
Machine-readable control: `project-register/agent-autopilot.json`  
Dry-run entrypoint: `node scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs`

## Purpose

The WellFit Agent Autopilot is the single governed entrypoint for future Codex/AI agent iterations. It does **not** replace the existing WellFit governance, memory loop, task queue, risk classifier, definition of done, readiness matrix, work map, internal sources, roadmap, feedback, research, or insight registers. It orchestrates those existing sources into one safe dry run that tells an agent what it may inspect, which safe task is currently suggested, which risk gates apply, which checks must run, and where the iteration must stop for human approval before implementation, merge, or deployment.

This first version is intentionally **dry-run only**. It must not write files automatically, implement product changes, merge branches, deploy, or auto-approve high/critical work.

## Source of truth hierarchy

Autopilot runs must honor the existing sources in this order:

1. Direct human instructions for the current task.
2. `AGENTS.md` and any scoped `AGENTS.md` files.
3. Current-state and TODO governance: `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, and `todolist/NEXT_ACTIONS.md`.
4. Agent governance registers: `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, and `project-register/agent-work-log.json`.
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

Use `project-register/agent-task-queue.json` and the existing suggestion script (`scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs`) to select the next non-blocked low/medium-risk task when the human request allows automatic selection. A narrower human request may override the suggestion only if it still satisfies the same safety gates.

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

In this first version, Autopilot allows only:

- reading repository governance, TODO, architecture, and project-register files;
- running validation and report-only scripts;
- printing the selected next safe task, risk classification, required checks, affected files/registers, stop conditions, and planning-only/implementation status;
- preparing a human-readable plan and PR handoff;
- updating Autopilot governance documentation/registers only when explicitly requested by a human task, as done in normal PR workflow.

## Forbidden actions

Autopilot must not:

- write files automatically during `agent-autopilot-dry-run.mjs`;
- merge, deploy, publish, or close PRs;
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

Medium-risk work is not automatically implemented by Autopilot. It can only be planned unless a human explicitly asks for scoped runtime work and the risk classifier permits it. Low-risk documentation, registry, and report-only script work may be implemented by a normal agent after planning, but the Autopilot dry-run script itself still writes nothing.

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

`npm run agent:quality-gate` may run Autopilot only in dry-run/report-only mode. A successful dry run means the orchestrator reported a safe plan and exited `0`; it does not authorize implementation, merge, deployment, protected work, or high/critical work.

## KI-Fortsetzungs-Prompt

Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/product-readiness.json`, `project-register/internal-sources.json`, `project-register/master-roadmap-tasks.json`, `project-register/user-feedback.json`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json`, und diese Runbook-Datei. Fuehre `node scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs` aus, nutze nur bestehende fuehrende Dateien, stoppe bei hohem/kritischem/unklarem Risiko, implementiere nichts automatisch, merge/deploye nie, und liefere eine PR-Handoff-Zusammenfassung mit Checks, Risiken und naechstem sicheren Task.
