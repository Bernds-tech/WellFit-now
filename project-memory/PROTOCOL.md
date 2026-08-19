# Project Memory Protocol v2

Operational memory for WellFit-now. It complements code, tests, Git history, `AGENTS.md`, runtime-state documents and protected canonical truth.

## Mandatory preflight
1. Read `AGENTS.md` and the current runtime/canonical files it requires.
2. Read `CURRENT_STATE.md`, `SESSION_HANDOFF.md`, `OPEN_LOOPS.md`, `TASK_LEDGER.md`, `DEPENDENCIES.md` and `DECISIONS.md`.
3. Search `FAILED_ATTEMPTS.md`, `DO_NOT_ASSUME.md` and `CHANGE_REQUESTS.md` for the intended area and prior attempts.
4. Read `PROJECT_REGISTRY.md` before work that may belong to WellFit or WellFit-Buddy.
5. Check git status, branch, recent commits/PRs and any drift-prone external state needed by the task.
6. Search existing task/change/cross-project IDs before creating new work.
7. Never repeat completed/rejected/superseded/failed approaches without new recorded evidence.

## New ideas and cross-project work
Every new owner idea first enters `CHANGE_REQUESTS.md` and is classified as `NEW`, `EXISTS_PARTIALLY`, `DUPLICATE`, `DEFERRED` or `REJECTED`. Cross-repository work uses `XPROJ-YYYY-NNN` plus local subtasks/dependencies.

## Status model
Use `TODO`, `IN_PROGRESS`, `BLOCKED`, `PARTIAL`, `IMPLEMENTED`, `IMPLEMENTED_NOT_VERIFIED`, `VERIFIED`, `ACCEPTED`, `PRODUCTION_CONFIRMED`, `REJECTED`, `SUPERSEDED`, `DEFERRED`, `DUPLICATE`. Historical `DONE` remains valid for v1 records only.

Implementation is not acceptance. Evidence belongs in `EVIDENCE.md` and must match the target: tests/workflow, staging, device/operator acceptance, or production confirmation as applicable.

## Open loops and dependencies
Every meaningful unfinished follow-up belongs in `OPEN_LOOPS.md`. `PARTIAL`, `BLOCKED` and `IMPLEMENTED_NOT_VERIFIED` tasks require an open-loop reference or explicit no-follow-up rationale. Check `DEPENDENCIES.md` before implementation and never accept a dependent task while a required dependency remains unresolved.

## Decision revalidation
New decisions should include `Class: PERMANENT|REVIEWABLE`; reviewable decisions require a `Review trigger:`. Once the trigger arrives, create/refresh an open loop until the decision is revalidated.

## Mandatory postflight
Update the task ledger/current state, open loops, dependencies, evidence, decisions, failed attempts and change requests as applicable. Update `SESSION_HANDOFF.md` whenever work pauses at a non-obvious state. Revalidate `DO_NOT_ASSUME.md` facts when relied upon.

## Stale control
Active `IN_PROGRESS`, `BLOCKED`, `PARTIAL`, `IMPLEMENTED_NOT_VERIFIED`, `OPEN` and `BLOCKED` loop records must carry `Updated: YYYY-MM-DD`. Items older than 14 days are stale and must be reviewed, closed, superseded or substantively refreshed. An automated workflow scans for them.

Never store secrets, tokens, credentials, private user data or protected evidence here.
