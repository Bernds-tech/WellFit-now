# Countercheck Policy

Defines how the second-pass verification must be independent from the implementation pass.

## 1. Independent evidence rule
A countercheck must use at least one evidence source different from the source used to claim success.

Examples:
- implementation claim from task text -> countercheck with final diff + CI;
- build success -> countercheck with runtime/staging behavior;
- UI implementation -> countercheck with rendered preview/screenshot;
- database migration code -> countercheck with target-bound read-only verification;
- PR description -> countercheck with changed files and actual commit/check state.

A task author's own status text is never sufficient evidence by itself.

## 2. Freshness rule
Evidence used for final verification must belong to the current reviewed commit, branch/PR and target environment where applicable. Evidence from an older commit, stale deployment, previous device build or previous workflow run must be marked STALE and cannot close the task.

## 3. Negative / regression check
The countercheck must test not only the intended success path but the most relevant failure/regression path: wrong permissions, missing dependency, invalid input, stale state, unauthorized role, wrong repo boundary, rollback/fail-closed behavior or previously failing case as applicable.

## 4. Source triangulation
For high-impact work, require at least two independent evidence classes before `ACCEPTED` or `PRODUCTION_CONFIRMED`, for example:
- code/diff + automated test;
- automated test + staging/runtime evidence;
- runtime evidence + operator/device acceptance.

## 5. Countercheck separation
The execution receipt must separately record `Implementation evidence` and `Countercheck evidence`. They may not be identical text-only assertions.

## 6. Contradiction handling
If project memory, PR state, CI, runtime, device evidence or current code disagree, status becomes `RECONCILIATION_REQUIRED`; do not average or guess. Record the conflict in `RECONCILIATION.md` and resolve against current verified evidence.

## 7. Completion gate
A clean completion claim requires:
- current-commit evidence;
- independent countercheck evidence;
- no unresolved reconciliation finding for the task;
- no stale active work lock;
- no untracked started-work/open-loop dependency;
- required negative/regression path checked.
