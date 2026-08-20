# Contradiction / Reconciliation Register

Any conflict between project memory and actual Git/PR/CI/runtime evidence is recorded here and forces `RECONCILIATION_REQUIRED` until resolved.

Statuses: `OPEN`, `RECONCILIATION_REQUIRED`, `RESOLVED`, `SUPERSEDED`.

## CTR-WFN-001
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: WFN-TECH-LEGACY-001 / WFN-AUTH-CONSENT-001 / WFN-PRIVACY-001
- Risk: R3
- Source A: pre-reconciliation `TASK_LEDGER.md`, `STARTED_WORK.md`, `OPEN_LOOPS.md`, `EVIDENCE.md`
- Claim A: no substantive active technical work was represented beyond governance.
- Source B: `FINISHLINE_STATE.json` and current runtime state
- Claim B: auth/consent, privacy/account lifecycle, legacy writer migration and cross-repo drift are explicitly partial/open.
- Stronger/current evidence: current finishline + current main.
- Status: RECONCILIATION_REQUIRED
- Resolution/action: carry every active finishline item into V5 Task/Started/Loop/Evidence/Assumption/Dependency registers; resolve after this reconciliation merges.
- Evidence: current main `bf1559b0073b511bf15de39a57df5e548e6dd3ad`; `FINISHLINE_STATE.json`.

## CTR-WFN-002
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: governance
- Risk: R3
- Source A: `BRANCH_PROTECTION_CONTRACT.json`
- Claim A: main requires PR/status checks/conversation resolution and blocks force-push/delete.
- Source B: live GitHub branch metadata
- Claim B: `main` reports `protected=false` with no enforced required checks.
- Stronger/current evidence: live GitHub branch API.
- Status: RECONCILIATION_REQUIRED
- Resolution/action: maintain branch+PR discipline operationally; owner must activate protection/ruleset through GitHub UI when available.
- Evidence: live branch metadata 2026-08-20.

## CTR-WFN-003
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: WFN-MEM-005 / PR #376
- Risk: R2
- Source A: current-main `TASK_LEDGER.md` before this reconciliation
- Claim A: only WFN-MEM-001 history existed.
- Source B: PR #376 / merged PR #375
- Claim B: V5 WFN-MEM-005 was ACCEPTED and must remain in the append-only ledger.
- Stronger/current evidence: PR #375 merge plus PR #376 historical reconciliation.
- Status: RESOLVED
- Resolution/action: WFN-MEM-005 has been restored in the current reconciliation; PR #376 can be closed after merge.
- Evidence: PR #375 merge `ec831cda0b6775783a30a9c2d6b78151cd2366ea` and current reconciliation diff.

## CTR-WFN-004
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: stale PR #263
- Risk: R2
- Source A: open PR #263
- Claim A: owner-claim helper still needs to be introduced through that branch.
- Source B: current main
- Claim B: `scripts/admin/set-owner-claim.mjs` already exists.
- Stronger/current evidence: current main file.
- Status: RESOLVED
- Resolution/action: close #263 as superseded after reconciliation merge; do not merge duplicate stale branch.
- Evidence: current `scripts/admin/set-owner-claim.mjs`.

## CTR-WFN-005
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: stale PR #13 / WFN-XREPO-001
- Risk: R3
- Source A: old open PR #13
- Claim A: Unity Buddy AR project still needs to be introduced by merging this 136-commit branch.
- Source B: current main + cross-repo master
- Claim B: Unity Buddy AR project is already physically present under WellFit-now and must be reconciled/migrated toward the Buddy domain rather than reintroduced.
- Stronger/current evidence: current source tree and V9 memory.
- Status: RESOLVED
- Resolution/action: close PR #13 after reconciliation merge; later Buddy migration uses a fresh scoped `WF-MIG-*` task with rollback/device evidence.
- Evidence: current main and V9 ownership state.

## CTR-WFN-006
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: PR #363 / #365
- Risk: R2
- Source A: older open audit/coordination PRs
- Claim A: their runtime/coordination baseline still needs direct merge.
- Source B: later Project Rail, V6-V9 Project Memory, current runtime/finishline and current main
- Claim B: later main has superseded the relevant truth/governance path.
- Stronger/current evidence: current main and later merge history.
- Status: RESOLVED
- Resolution/action: preserve historical PRs but close #363/#365 as superseded after reconciliation merge; any unique still-needed finding must become a fresh scoped task rather than merging old baselines.
- Evidence: current main, Project Rail and V9 memory.

## CTR-WFN-007
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: PR #364
- Risk: R3
- Source A: old draft PR #364
- Claim A: WFT hard cap 25B can be merged as current canonical/runtime truth.
- Source B: current Beta-1 canonical truth
- Claim B: Beta-1 has internal WFP max system supply 25B while WFT is future/inactive and does not currently carry the draft's immutable max-total-supply change on main.
- Stronger/current evidence: current `wellfit-beta1-canonical-truth.json`.
- Status: RECONCILIATION_REQUIRED
- Resolution/action: keep #364 open/deferred for explicit owner-reviewed future WFT canonical decision; never treat the draft as active Beta-1 or merge automatically.
- Evidence: current canonical truth on main.

## CTR-WFN-008
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: WFN-XREPO-001
- Risk: R3
- Source A: earlier local/cross-repo memory wording
- Claim A: WellFit-Buddy owns native AR/mobile/buddy generally.
- Source B: latest owner-defined domain split
- Claim B: WellFit-now is technical, WellFit is graphical, WellFit-Buddy is Buddy-specific; general technical mobile logic remains technical.
- Stronger/current evidence: latest owner direction plus matching three-repository reconciliation.
- Status: RECONCILIATION_REQUIRED
- Resolution/action: update all local/master contract/dependency wording consistently; close only after all three reconciliation PRs land.
- Evidence: current reconciliation branches.

Never resolve a contradiction by deleting the older record. Record which source was stale or wrong and why.
