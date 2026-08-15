# WellFit Project Rail

Status: active control plane  
Updated: 2026-08-15

## Purpose

The Project Rail connects the existing WellFit Agent OS, TODO system, runtime truth, task queue, work logs, readiness registers and PR governance into one mandatory end-to-end operating path. It does not create a second planning system and does not replace existing sources of truth.

Machine-readable contract: `project-register/project-rail.json`.

## The rail

Every material item moves through the same path:

`IDEA -> ANALYSIS -> OWNER DECISION (if required) -> PLANNED -> READY -> IN PROGRESS -> TESTING -> REVIEW -> PR CREATED -> MERGED -> VERIFIED -> DONE`

Side states are `BLOCKED`, `DEFERRED`, and `REJECTED`.

A task is never `DONE` because an agent says it is finished. `DONE` requires merge evidence, required checks, post-merge verification, synchronized planning/register state, and capture of all follow-up work.

## Planning before building

Before a task becomes `READY`, the existing queue/proposal system must provide:

- task ID;
- problem and goal;
- scope and non-goals;
- dependencies;
- exact allowed and blocked paths;
- risk classification;
- whether Bernd/Owner approval is required;
- required tests/checks;
- rollback or stop plan;
- Definition of Done;
- expected follow-up sources.

Missing required planning data means `BLOCKED`, not an invitation for the implementation agent to guess.

## Existing systems remain authoritative

Use the hierarchy already defined by `AGENTS.md`:

1. `main` code and passing tests for actual runtime behavior;
2. `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md` for current execution context;
3. owner-controlled Beta-1 Canonical Truth for product/economy boundaries;
4. `CURRENT_PROJECT_STATE`, `WORK_MAP`, `TODO_INDEX`, `NEXT_ACTIONS`, project registers and historical TODOs according to their documented authority.

The Project Rail only connects these sources.

## Dispatcher behavior

A coordinator may choose a next task only when it is `READY`, dependencies are satisfied, no active task owns conflicting files, required owner decisions exist, and risk policy allows execution.

Every active task reserves task ID, branch, allowed paths and file ownership in `project-register/project-rail-active-ownership.json`. Hotspot files are serial by default. Parallel work is encouraged only for genuinely independent packages.

The initial dispatcher is intentionally dry-run only. It can propose a safe batch but cannot execute tasks, create branches, create PRs, merge or deploy.

## Completion synchronization

After a PR is merged, a completion-sync pass must reconcile the existing current-state, next-actions, open/done, done-log, task-queue, work-log, progress-log, continuity/dependency and product-readiness sources.

The sync records task ID, PR, commit, changed files, checks, verified behavior, limitations, new follow-ups, next safe tasks and owner decisions created or resolved.

No automatic `DONE` is permitted before this reconciliation.

The initial completion-sync implementation is dry-run only. It validates an optional evidence JSON file and produces a proposed reconciliation plan without rewriting any source file.

## Owner attention model

Bernd should be interrupted only for real decisions or gates: owner/product decisions, protected-scope approval, external credentials/access, material risk/scope drift, impossible verification, or human merge/release gates.

Routine analysis, safe documentation synchronization, normal test execution and non-blocking follow-up capture should proceed without repeated questions.

## Dashboard view

The first dashboard is generated as Markdown and JSON. It exposes:

- goal and current phase;
- progress;
- in-progress work;
- ready-next tasks;
- blocked work;
- decisions waiting for Bernd;
- open-PR handoff status;
- failed checks;
- recently completed work;
- next safe parallel batch;
- active file-ownership reservations.

A future Agent Center UI may render this contract, but UI is not required for the control plane to work. The current repository-only dashboard does not query live GitHub PR state; that requires connector/API enrichment outside the local report generator.

## Implemented control scripts

The following controls are implemented without runtime authority:

- `scripts/wellfit-dev-agent/src/project-rail-check.mjs`
  - validates authoritative files, lifecycle order, planning gate, status compatibility, completion-sync targets, dashboard contract and implementation paths;
  - writes `scripts/wellfit-dev-agent/output/project-rail-check.md`;
  - fails closed on structural inconsistencies.
- `scripts/wellfit-dev-agent/src/project-rail-dashboard.mjs`
  - aggregates existing queue, work-log, progress, continuity, readiness and TODO markers;
  - writes Markdown and JSON dashboards;
  - never changes project sources.
- `scripts/wellfit-dev-agent/src/project-rail-dispatcher-dry-run.mjs`
  - checks planning completeness, risk, owner decisions, dependencies, active ownership, hotspot conflicts and landing-page isolation;
  - proposes up to the configured number of non-conflicting low-risk tasks;
  - never executes or reserves tasks.
- `scripts/wellfit-dev-agent/src/project-rail-completion-sync-dry-run.mjs`
  - validates the completion-evidence contract and every required reconciliation target;
  - generates a reviewed-patch plan only;
  - never rewrites TODOs or registers.
- `scripts/wellfit-dev-agent/src/project-rail-suite.mjs`
  - runs all four controls in one report-only/dry-run suite.

Run the standalone suite with:

```bash
node scripts/wellfit-dev-agent/src/project-rail-suite.mjs
```

## Active file ownership

`project-register/project-rail-active-ownership.json` is the exclusive reservation register. It does not replace Git branches or the task queue.

The current register records Bernd's parallel landing-page work. Project Rail tasks must avoid:

- `app/components/landing/**`;
- `app/page.tsx`;
- `public/landing/**`.

The reservation remains active until Bernd releases it or the landing task is explicitly handed back to the Project Rail.

## Safety boundaries

Current implementation is report-only or dry-run:

- no runtime product task execution;
- no automatic branch or PR creation;
- no TODO or register rewriting;
- no self-approval;
- no merge or deploy;
- no Firebase, Functions, Firestore Rules, economy, reward authority, token, NFT, payment, Unity or production changes;
- no landing-page runtime changes.

## Current Closed-Beta boundary

Current goal: a stable adult invite-only Closed Beta that Gerhard can test end-to-end as a normal user.

Do not activate blockchain/token/NFT/cash-out/real-money wallet transfer/public marketplace/Mayor/Reality Glitch work in this beta. Do not autonomously migrate WFXP/WFP/XP terminology or data semantics.

Landing-page work may continue in parallel. Project-Rail implementation must avoid landing-page runtime files unless a later explicit task requires them.

## Next implementation wave

1. Run the standalone suite against the complete repository and repair only Project Rail contract defects.
2. Integrate the suite into the existing quality gate after standalone results are stable.
3. Add fixtures for valid/invalid planning records, dependency chains, ownership conflicts and completion evidence.
4. Extend completion sync from a report to a deterministic proposed-diff generator; keep source writes disabled.
5. Add live GitHub PR enrichment through the connected coordinator layer, not through local repository secrets.
6. Add a reviewed reservation-creation/release command before any dispatcher gains execution capability.
7. Only after these controls are proven, evaluate a higher Agent OS autonomy level under the existing autonomy policy.

## KI-Fortsetzungs-Prompt

Naechste KI: Lies zuerst `AGENTS.md`, `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `project-register/project-rail.json`, `project-register/project-rail-active-ownership.json`, `project-register/agent-control-center.json`, `project-register/agent-task-queue.json` und dieses Dokument. Fuehre vor weiterer Project-Rail-Arbeit `node scripts/wellfit-dev-agent/src/project-rail-suite.mjs` aus. Erweitere bestehende Agent-OS-, Task-, Work-Log-, Continuity-, Readiness- und PR-Governance statt Parallelregister anzulegen. Halte Landing-Dateien reserviert, alle Source-Rewrites reviewpflichtig und Merge/Deploy menschlich kontrolliert.
