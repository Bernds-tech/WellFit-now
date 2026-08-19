# Project Memory Protocol v1

This directory is the operational memory for WellFit-now. It complements code, tests, Git history, `AGENTS.md`, current runtime-state documents and protected Beta-1 canonical truth.

## Mandatory preflight
1. Read `CURRENT_STATE.md`, `TASK_LEDGER.md`, `DECISIONS.md`, `FAILED_ATTEMPTS.md` and `CHANGE_REQUESTS.md`.
2. Read repository `AGENTS.md` and the current runtime/canonical files required by it.
3. Check git status, current branch and recent commits/PRs.
4. Search for an existing task/change ID and prior attempt before starting a new path.
5. Do not repeat DONE, REJECTED, SUPERSEDED or failed approaches unless new evidence is recorded first.

## Mandatory postflight
After meaningful work, update the task ledger and any changed current state; record new decisions, failed approaches and new user ideas. Never silently expand scope.

## Status vocabulary
`TODO`, `IN_PROGRESS`, `BLOCKED`, `PARTIAL`, `DONE`, `REJECTED`, `SUPERSEDED`, `DEFERRED`, `DUPLICATE`.

## New ideas
New owner ideas first enter `CHANGE_REQUESTS.md`, then become an existing-task subtask, new accepted task, deferred item, rejected item or duplicate. Do not rewrite historical completed tasks to absorb later scope.

## Evidence
Each attempt should record ID, date, goal, starting state, action, result, failure/cause, decision, commit/PR/evidence, next step and do-not-repeat guidance.

Never store secrets, tokens, credentials, private user data or protected evidence here.