# WellFit Project Rail

Status: active control-plane proposal  
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

Every active task reserves task ID, branch, allowed paths and file ownership. Hotspot files are serial by default. Parallel work is encouraged only for genuinely independent packages.

## Completion synchronization

After a PR is merged, a completion-sync pass must reconcile the existing current-state, next-actions, open/done, done-log, task-queue, work-log, progress-log, continuity/dependency and product-readiness sources.

The sync records PR, commit, changed files, checks, verified behavior, limitations, new follow-ups, next safe tasks and owner decisions created or resolved.

No automatic `DONE` is permitted before this reconciliation.

## Owner attention model

Bernd should be interrupted only for real decisions or gates: owner/product decisions, protected-scope approval, external credentials/access, material risk/scope drift, impossible verification, or human merge/release gates.

Routine analysis, safe documentation synchronization, normal test execution and non-blocking follow-up capture should proceed without repeated questions.

## Dashboard view

The first dashboard does not need a new web application. A generated Markdown/JSON control view is enough if it always exposes:

- goal and current phase;
- progress;
- in-progress work;
- ready-next tasks;
- blocked work;
- decisions waiting for Bernd;
- open PRs;
- failed checks;
- recently completed work;
- next safe parallel batch.

A future Agent Center UI may render this contract, but UI is not required for the control plane to work.

## Current Closed-Beta boundary

Current goal: a stable adult invite-only Closed Beta that Gerhard can test end-to-end as a normal user.

Do not activate blockchain/token/NFT/cash-out/real-money wallet transfer/public marketplace/Mayor/Reality Glitch work in this beta. Do not autonomously migrate WFXP/WFP/XP terminology or data semantics.

Landing-page work may continue in parallel. Project-Rail implementation must avoid landing-page runtime files unless a later explicit task requires them.

## Next implementation wave

1. Validate this Project Rail against the existing Agent Control Center lifecycle and task-status policy; extend existing validators rather than creating duplicates.
2. Add a report-only rail consistency check that proves required source files exist and lifecycle/status vocabularies remain compatible.
3. Add a report-only control summary generator using existing registers.
4. Wire post-merge completion-sync as a proposed/dry-run operation first; no autonomous TODO rewriting until its diff and conflict behavior are proven.
5. Extend the existing dispatcher/batch runner to require `READY`, dependency clearance and file-ownership clearance before selecting work.
6. Only after those controls are proven, evaluate a higher Agent OS autonomy level under the existing autonomy policy.
