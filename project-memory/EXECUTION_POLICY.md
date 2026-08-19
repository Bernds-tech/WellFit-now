# Execution Policy v5

Mandatory default for all substantive agent, Codex, automation, repository, infrastructure, configuration and implementation work.

## Owner standing instruction
Agents must not wait to be told to check first. Preflight, duplicate/regression checking and independent counterchecking are automatic.

## Mandatory preflight
Before substantive action:
1. Read `AGENTS.md` and current canonical/runtime sources required there.
2. Read/search `CURRENT_STATE.md`, `TASK_LEDGER.md`, `CHANGE_REQUESTS.md`, `DECISIONS.md`, `FAILED_ATTEMPTS.md`, `OPEN_LOOPS.md`, `DEPENDENCIES.md`, `EVIDENCE.md`, `DO_NOT_ASSUME.md`, `SESSION_HANDOFF.md`, `PROJECT_STATUS.md`, `CROSS_PROJECT_MASTER_STATUS.md`, `AUTHORIZATIONS.md`, `STARTED_WORK.md`, `WORK_LOCKS.md`, `EXECUTION_RECEIPTS.md`, `RECONCILIATION.md`, `QUALITY_CONTROL.md`, `ASSUMPTIONS.md` and `CONTRADICTIONS.md` when present.
3. Verify actual branch/head, working tree, relevant PRs/checks and current runtime/external state.
4. Search existing task/change IDs and prior attempts.
5. Classify the task `Risk: R1|R2|R3|R4` using `QUALITY_CONTROL.md` before implementation; uncertainty defaults upward.
6. Record critical assumptions and verify them before relying on them.
7. Define planned success evidence, negative/fail-closed evidence where relevant, and rollback/recovery expectations for R3/R4 state-changing work.

Verified repository/runtime evidence outranks chat memory. Conflicts must be recorded in `CONTRADICTIONS.md`, not silently reconciled.

## Started-work and work-lock rule
As soon as substantive work begins, create/refresh `STARTED_WORK.md` including Risk, acquire/update `WORK_LOCKS.md`, and create the opening portion of an execution receipt. Unfinished work remains visible until explicitly closed, superseded or transferred with an exact next step.

## Mandatory duplicate/regression check
Before editing, confirm the work is not already implemented, the same approach has not failed/rejected without new evidence, scope belongs here, dependencies are satisfied or recorded blocked, and the intended change does not silently reverse a durable decision/security boundary.

## Scope-diff guard
Before completion compare intended scope with the final diff. Unexpected files, migrations, permissions, dependencies, generated output or configuration changes force `RECONCILIATION_REQUIRED` until explained or removed.

## Mandatory independent countercheck
Before merge/completion/success reporting:
1. Re-read goal and acceptance criteria.
2. Inspect final diff.
3. Verify current commit/PR/build/target evidence; stale evidence does not count.
4. Check at least one meaningful negative/regression/fail-closed path where applicable.
5. Answer: `What observation would prove our conclusion wrong?` and test the strongest practical falsifier or record why unavailable.
6. Re-check dependencies, assumptions, open loops and contradictions.
7. Reconcile TASK_LEDGER, STARTED_WORK, WORK_LOCKS, EXECUTION_RECEIPTS, EVIDENCE, PR/CI and runtime state.
8. Apply the Risk-level completion quorum from `QUALITY_CONTROL.md`. R3/R4 require at least two independent evidence classes; duplicate self-reports count once.
9. Record rollback/recovery proof for R3/R4 state-changing work.
10. Finish the execution receipt, update memory, and release/update the lock.

## Completion state machine
Use `TODO -> IN_PROGRESS -> IMPLEMENTED -> VERIFIED -> COUNTERCHECKED -> ACCEPTED -> PRODUCTION_CONFIRMED` as applicable. `BLOCKED`, `PARTIAL`, `IMPLEMENTED_NOT_VERIFIED`, `RECONCILIATION_REQUIRED`, `REJECTED`, `SUPERSEDED`, `DEFERRED`, `DUPLICATE` remain valid side states. Never jump from implementation directly to accepted without required evidence/quorum.

## Stop conditions
Do not bypass red governance/security checks, missing dependencies/secrets, contradictory verified evidence, invalid assumptions, protected production/billing/destructive/compliance/publishing boundaries, or previous failed approaches without new justification.

## Milestone closeout
Before declaring a phase/milestone complete, run the project-wide closeout in `QUALITY_CONTROL.md`: reconcile all related tasks, started work, locks, loops, dependencies, failed attempts, change requests, PR/CI, assumptions, contradictions and evidence. Unresolved work is explicitly carried forward.

## Standing permissions
Reuse permissions in `AUTHORIZATIONS.md` without asking again where technically and safely allowed. Platform confirmations and protected/destructive boundaries still apply.

## Core invariant
**Project memory -> actual Git/runtime state -> prior attempts -> Risk/assumptions -> started-work/lock -> dependencies/evidence plan -> action -> negative/falsification check -> independent countercheck -> quorum/reconciliation -> execution receipt -> memory update.**
