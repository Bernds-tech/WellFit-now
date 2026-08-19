# Execution Policy

This file defines the mandatory execution protocol for all agent, Codex, automation, repository, infrastructure, configuration and implementation work.

## Owner standing instruction

The project owner has explicitly instructed that agents must not wait to be told to "check first". The checks below are mandatory by default before any substantive action.

## Mandatory preflight — first pass

Before changing code, configuration, infrastructure, workflows, data, roadmap state, release state or project memory:

1. Read `AGENTS.md`.
2. Read `project-memory/CURRENT_STATE.md`.
3. Read `project-memory/TASK_LEDGER.md`.
4. Read `project-memory/CHANGE_REQUESTS.md` when scope or ideas are involved.
5. Read `project-memory/DECISIONS.md`.
6. Search `project-memory/FAILED_ATTEMPTS.md` for the task, error, component and proposed approach.
7. Read `project-memory/OPEN_LOOPS.md`, `DEPENDENCIES.md`, `EVIDENCE.md`, `DO_NOT_ASSUME.md`, `SESSION_HANDOFF.md`, `PROJECT_STATUS.md`, `CROSS_PROJECT_MASTER_STATUS.md`, `AUTHORIZATIONS.md`, `STARTED_WORK.md`, `WORK_LOCKS.md`, `EXECUTION_RECEIPTS.md` and `RECONCILIATION.md` when present.
8. Check the actual current Git branch, head commit, working tree, relevant open PRs and current CI/check status.
9. Search for an existing task ID or change request that already covers the work.
10. Compare the intended action against existing code and current runtime evidence. Do not infer completion from chat history alone.

If any source conflicts, current verified repository/runtime evidence wins over conversational memory; record the conflict instead of silently choosing a version.

## Started-work rule

As soon as substantive work begins, create or refresh the task entry in `STARTED_WORK.md` and acquire/update the corresponding `WORK_LOCKS.md` lock before implementation continues. Unfinished work must remain visible until it is explicitly closed, superseded or transferred with an exact next step.

## Mandatory duplicate / regression check

Before implementing a proposed fix or feature:

- confirm it is not already implemented;
- confirm the same attempted solution has not already failed or been rejected;
- confirm it does not reopen a superseded decision;
- confirm it belongs in this repository;
- confirm dependencies are satisfied or explicitly recorded as blocked;
- identify what evidence will prove the change works before writing it.

## Mandatory second-pass countercheck

Before declaring work complete, merging, or reporting success, perform an independent countercheck:

1. Re-read the task goal and acceptance criteria.
2. Inspect the final diff rather than relying on memory of edits.
3. Re-run or inspect the relevant tests/checks/evidence.
4. Verify no unrelated files or scope changes slipped in.
5. Verify no previous working behavior, decision or security boundary was unintentionally reversed.
6. Re-check open loops and dependencies created by the change.
7. Reconcile `TASK_LEDGER.md`, `STARTED_WORK.md`, `WORK_LOCKS.md`, `OPEN_LOOPS.md`, `DEPENDENCIES.md`, `EVIDENCE.md`, `EXECUTION_RECEIPTS.md`, PR/branch state and CI/runtime evidence.
8. Write an execution receipt for meaningful work and release/update the work lock.
9. Update project memory with result, evidence, failed attempts, blockers and exact next step.
10. A task may be called `DONE` only when its required evidence exists; otherwise use `IMPLEMENTED_NOT_VERIFIED`, `VERIFIED`, `BLOCKED`, `PARTIAL` or another accurate state.

## Stop conditions

Do not proceed blindly when:

- current evidence contradicts project memory;
- the same approach is recorded as failed without new evidence;
- a required dependency or secret is absent;
- a security/governance check is red and the proposed action would merely bypass it;
- the action crosses a protected production, billing, destructive-data, compliance or publishing boundary requiring explicit confirmation.

Record the blocker and continue with unrelated safe work when possible.

## Standing authorization boundary

`AUTHORIZATIONS.md` records durable owner permissions for normal project work. These standing permissions should be reused without asking again where technically and safely permitted. They do not override platform confirmation requirements, missing credentials, repository protection, destructive-operation safeguards or explicit safety boundaries.

## Core invariant

**Project memory -> actual Git/runtime state -> previous attempts -> started-work/lock -> dependency/evidence check -> action -> independent countercheck -> reconciliation -> execution receipt -> memory update.**
