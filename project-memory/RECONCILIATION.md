# Project Reconciliation

This is the mandatory consistency check between project memory and actual repository state.

## Invariants
1. Every active task (`IN_PROGRESS`, `PARTIAL`, `BLOCKED`, `IMPLEMENTED_NOT_VERIFIED`) must have a matching `STARTED_WORK.md` record.
2. Every substantive active task must have one current `WORK_LOCKS.md` lock or an explicit no-lock rationale.
3. Every meaningful implementation session must produce an `EXECUTION_RECEIPTS.md` receipt.
4. A merged PR must not leave its task falsely `IN_PROGRESS`; reconcile to the actual evidence state.
5. A closed/unmerged PR must not make its task disappear; record blocked, superseded or next step.
6. A task cannot be `ACCEPTED`/`PRODUCTION_CONFIRMED` without matching evidence.
7. Open loops/dependencies created by a change must remain visible until explicitly closed.
8. Any mismatch between Git/PR/CI/runtime state and project memory creates a reconciliation finding and blocks a clean completion claim.

## Required daily/working-session check
Compare `TASK_LEDGER.md`, `STARTED_WORK.md`, `WORK_LOCKS.md`, `OPEN_LOOPS.md`, `DEPENDENCIES.md`, `EVIDENCE.md`, `EXECUTION_RECEIPTS.md`, open PRs/branches and current CI. Resolve or record every mismatch.

## Finding template
```text
## RECON-YYYY-NNN
- Detected:
- Task:
- Mismatch:
- Actual Git/PR/CI state:
- Memory state:
- Required correction:
- Status: OPEN|RESOLVED|SUPERSEDED
- Resolved:
```
