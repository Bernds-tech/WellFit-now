# Project Memory Protocol v9

Operational memory for WellFit-now, the technical web/backend repository.

## Mandatory preflight
1. Read `AGENTS.md`, current runtime/canonical truth, `CURRENT_STATE.md`, `PROJECT_FINISHLINE.md`, `FINISHLINE_STATE.json`, `NEXT_BEST_ACTION.md`, `AUTO_HANDOFF.md`, `OWNER_ACTION_INBOX.md`, `SESSION_HANDOFF.md`, `STARTED_WORK.md`, `WORK_LOCKS.md`, `OPEN_LOOPS.md`, `TASK_LEDGER.md`, `DEPENDENCIES.md` and `DECISIONS.md`.
2. For any cross-repository work read `PROJECT_COORDINATION.json` and reconcile the relevant master state/contracts/dependencies/integration gates in `Bernds-tech/WellFit` before acceptance.
3. Read `CONVERGENCE_PLAN.json` before migration work; web/backend remains here until a responsibility is explicitly migrated.
4. Search `FAILED_ATTEMPTS.md`, `DO_NOT_ASSUME.md`, `ASSUMPTIONS.md`, `CONTRADICTIONS.md` and `CHANGE_REQUESTS.md` before repeating or extending prior work.
5. Reconcile current GitHub/main/PR/CI plus runtime/provider evidence required by the task.
6. Validate evidence freshness via `EVIDENCE_TTL.json` and tracked truth drift via `DRIFT_BASELINE.json`.

## V4 — Execution continuity
`STARTED_WORK.md`, `WORK_LOCKS.md`, `EXECUTION_RECEIPTS.md` and `RECONCILIATION.md` preserve unfinished work across chats/sessions.

## V5 — Quality and countercheck
`QUALITY_CONTROL.md`, `COUNTERCHECK_POLICY.md`, `ASSUMPTIONS.md` and `CONTRADICTIONS.md` enforce R1–R4 risk, evidence quorum, regression checks and rollback/recovery where applicable.

## V6 — Finishline and external acceptance
`PROJECT_FINISHLINE.md`, `FINISHLINE_STATE.json` and `EXTERNAL_ACCEPTANCE.md` separate implementation from provider/runtime/product acceptance.

## V7 — Freshness, drift, milestones and governance
`EVIDENCE_TTL.json`, `DRIFT_BASELINE.json`, `BRANCH_PROTECTION_CONTRACT.json` and `milestones/` prevent stale success and preserve accepted snapshots.

## V8 — Cross-chat, impact, owner inbox, auto-handoff and convergence
`MEMORY_V8_CONTROLS.json`, `OWNER_ACTION_INBOX.md`, `NEXT_BEST_ACTION.md`, `AUTO_HANDOFF.md` and `CONVERGENCE_PLAN.json` provide local resilience and planned-but-unscheduled convergence.

## V9 — Multi-repository orchestration
`PROJECT_COORDINATION.json` points to the single program master in `Bernds-tech/WellFit`. This repository remains authoritative for web/backend truth. Cross-repository acceptance must reconcile the relevant `WF-CONTRACT-*`, `WF-XDEP-*`, `WF-INT-*`, `XLOCK-*` and `WF-MIG-*` records in the master before completion.

## Repository boundaries
Do not restart or rewrite the app baseline. Do not infer WFP/WFXP/XP equivalence without an owner-reviewed product decision. Native AR/buddy remains in WellFit-Buddy and visual/landing remains in WellFit until explicitly migrated.

## Postflight
After meaningful cross-repo work, update local memory and the affected master orchestration records. Never create a competing program-level master in this repository.

Never store secrets, tokens, credentials, private user data or protected evidence here.
