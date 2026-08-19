# Project Memory Quality Control v5

This file defines mandatory controls and countercontrols for substantive work.

## Risk levels
- R1: documentation, labels, non-runtime housekeeping.
- R2: normal product/UI/application changes with bounded blast radius.
- R3: auth, data model, API, backend authority, infrastructure, signing, privacy-sensitive or cross-repo changes.
- R4: Production, billing, security controls, destructive data operations, restore/backup, legal/compliance activation, secrets or release/publishing boundaries.

Every substantive task records `Risk: R1|R2|R3|R4` before implementation. Unknown risk defaults upward, never downward.

## Completion quorum
A task cannot advance beyond VERIFIED unless the quorum for its risk level is met.
- R1: diff/scope check + one relevant evidence class.
- R2: implementation evidence + independent countercheck + regression/negative-path check where relevant.
- R3: at least two independent evidence classes, current CI/test evidence, dependency/assumption reconciliation and rollback plan when state can change.
- R4: all applicable repository/security/governance checks green, at least two independent evidence classes, target-bound runtime/staging evidence, explicit rollback/recovery plan, proof of negative/fail-closed behavior, and any protected-boundary approval still required by policy.

Evidence classes include: code/diff review, automated tests, CI/security checks, staging/runtime evidence, real-device/operator acceptance, database/read-only verification, and owner acceptance. Repeating the same self-report twice is one evidence class, not two.

## Evidence freshness
Evidence is valid only when bound to the current relevant commit/PR/build/target. If the head changes materially, stale evidence must be rerun or explicitly revalidated.

## Proof of absence / negative path
For fixes and controls, identify what must no longer happen. Verify at least one meaningful negative, regression or fail-closed path whenever applicable. Security, auth, billing, data-integrity and authority changes require this by default.

## Rollback / recovery proof
For R3/R4 state-changing work, record before acceptance:
- rollback or recovery method;
- affected state/data;
- whether rollback was tested, simulated or only reviewed;
- any irreversible step.
No `PRODUCTION_CONFIRMED` status without a credible recovery path unless irreversibility was explicitly approved.

## Scope-diff guard
Before completion compare intended scope with the final diff. Unexpected files, dependencies, generated output, migrations, permissions or configuration changes trigger `RECONCILIATION_REQUIRED` until explained or removed.

## Assumption verification
Critical assumptions belong in `ASSUMPTIONS.md`. Each is VERIFIED, INVALIDATED or NEEDS_VERIFICATION and includes source/evidence. Assumptions about current branch, deployment, migration state, runtime/provider state, external approvals or device/build state must never be inferred from old chat context.

## Contradiction matrix
Contradictions among TASK_LEDGER, STARTED_WORK, WORK_LOCKS, OPEN_LOOPS, DEPENDENCIES, EXECUTION_RECEIPTS, EVIDENCE, PR/CI and runtime/device/target state belong in `CONTRADICTIONS.md` and force `RECONCILIATION_REQUIRED` until resolved.

Examples:
- Task says DONE but PR is open or CI is red.
- PR merged but STARTED_WORK remains active with no explicit follow-up.
- Task says BLOCKED but dependency is already resolved.
- Evidence refers to an older commit/build/target.
- Work is active without STARTED_WORK or an applicable Work Lock.

## Completion state machine
Use: `TODO -> IN_PROGRESS -> IMPLEMENTED -> VERIFIED -> COUNTERCHECKED -> ACCEPTED -> PRODUCTION_CONFIRMED` as applicable. `BLOCKED`, `PARTIAL`, `IMPLEMENTED_NOT_VERIFIED`, `RECONCILIATION_REQUIRED`, `REJECTED`, `SUPERSEDED`, `DEFERRED` and `DUPLICATE` remain valid side states.

`IMPLEMENTED` means code/change exists. `VERIFIED` means direct evidence exists. `COUNTERCHECKED` means an independent second-pass check has challenged the result. `ACCEPTED` means the required quorum is met. `PRODUCTION_CONFIRMED` requires real target evidence where applicable.

## Falsification question
Before COUNTERCHECKED, answer: `What observation would prove our conclusion wrong?` Then check the strongest practical falsifier or explain why it cannot currently be checked.

## Milestone closeout
Before declaring a milestone/phase complete, reconcile all related tasks, STARTED_WORK, OPEN_LOOPS, dependencies, failed attempts, change requests, PRs, CI/security status, assumptions, contradictions and evidence. Any unresolved item is explicitly carried forward; it may not disappear because the milestone label changed.
