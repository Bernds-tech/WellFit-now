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
- Status: RESOLVED
- Resolution/action: active finishline work was carried into V5 Task/Started/Loop/Evidence/Assumption/Dependency registers by PR #381 and remains explicitly open where evidence is incomplete.
- Evidence: PR #381 merged on 2026-08-20; current `FINISHLINE_STATE.json` and registers.

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
- Resolution/action: WFN-MEM-005 has been restored in the current reconciliation; PR #376 was closed after carry-forward.
- Evidence: PR #375 merge and PR #381 reconciliation.

## CTR-WFN-004
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: stale PR #263
- Risk: R2
- Source A: old PR #263
- Claim A: owner-claim helper still needs to be introduced through that branch.
- Source B: current main
- Claim B: `scripts/admin/set-owner-claim.mjs` already exists.
- Stronger/current evidence: current main file.
- Status: RESOLVED
- Resolution/action: stale duplicate branch is superseded; do not merge duplicate implementation.
- Evidence: current `scripts/admin/set-owner-claim.mjs` and reconciliation history.

## CTR-WFN-005
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: stale PR #13 / WFN-XREPO-001
- Risk: R3
- Source A: old PR #13
- Claim A: Unity Buddy AR project still needs to be introduced by merging the old branch.
- Source B: current main + cross-repo master
- Claim B: Unity Buddy AR project is already physically present under WellFit-now and must be reconciled/migrated toward the Buddy domain rather than reintroduced.
- Stronger/current evidence: current source tree and V9 memory.
- Status: RESOLVED
- Resolution/action: later Buddy migration uses a fresh scoped `WF-MIG-*` task with rollback/device evidence; do not merge old Unity branch as a shortcut.
- Evidence: current main and V9 ownership state.

## CTR-WFN-006
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task/change: PR #363 / #365
- Risk: R2
- Source A: older audit/coordination PRs
- Claim A: their runtime/coordination baseline still needs direct merge.
- Source B: later Project Rail, V6-V9 Project Memory, current runtime/finishline and current main
- Claim B: later main has superseded the relevant truth/governance path.
- Stronger/current evidence: current main and later merge history.
- Status: RESOLVED
- Resolution/action: preserve historical PR evidence; any unique still-needed finding must become a fresh scoped task rather than merging old baselines.
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
- Stronger/current evidence: owner-defined role split persisted in all three repositories and V9 master.
- Status: RESOLVED
- Resolution/action: PR #381 reconciled the role split and subsequent role-boundary PR #382 locked the technical role; reopen only on a newer explicit role decision.
- Evidence: PR #381 and PR #382 merged; current local/master role contracts.

Never resolve a contradiction by deleting the older record. Record which source was stale or wrong and why.

## CTR-WFN-009
- Date: 2026-09-03
- Updated: 2026-09-03
- Related task/change: WFN-TECH-LEGACY-001 / WFN-AUTH-CONSENT-001 / WFN-PRIVACY-001
- Risk: R3
- Source A: `CURRENT_STATE.md`, `FINISHLINE_STATE.json`, `NEXT_BEST_ACTION.md` and the 2026-08-20 handoff registers.
- Claim A: legacy `users/{uid}` writes, separate health consent/withdrawal and account export/deletion implementation remain substantially open.
- Source B: current main `d374e4db4777406d93a8aad72adc10ab47db216f` and implementation/test history.
- Claim B: legacy user client writes are already denied and removed; separate consent decisions plus withdrawal and health-data deletion exist; export, deletion request/cancel and deletion processing exist with emulator coverage.
- Stronger/current evidence: current code, Firestore rules and tests.
- Status: RESOLVED
- Resolution/action: correct the stale local finishline from PARTIAL implementation to repository-VERIFIED while retaining explicit Production/legal/provider limitations.
- Evidence: `firestore.rules`, `functions/lib/beta1UserPreferences.js`, `functions/lib/beta1AccountLifecycle.js`, `functions/lib/beta1AccountDeletionProcessor.js` and their corresponding emulator tests.

## CTR-WFN-010
- Date: 2026-09-06
- Updated: 2026-09-06
- Related task/change: WFN-RUDI-3D-001 / WFN-CR-007 / WellFit WFG-CR-008
- Risk: R2
- Source A: active WellFit-now Rudi memory after PR #401
- Claim A: Site v105, viewport-safe body bounds, delayed viewport catch-up, coffee/table/lounge props, finger articulation and optional custom living actions remain the current Rudi acceptance/follow-up path.
- Source B: later owner graphical direction plus merged PRs #401/#402 and WellFit `RUDI_SITE_SYNC_MANIFEST.json`.
- Claim B: the accepted current bridge is a DOM-surface world with no viewport clamp, complete offscreen departure, grounded surface routes and fail-closed static/WebGL lifecycle; the old viewport/chapter controller and props scenes are deleted/not active; technical implementation is complete at hardened merge `b07d39938aeab4e32eddac7d19b8e15e22afacb7`; only exact Site sync/visual acceptance remains externally.
- Stronger/current evidence: owner-authority `WFG-CR-008`; PR #401 merge `9ae4f278...`; PR #402 merge `b07d399...`; current WellFit Site-sync manifest.
- Status: RESOLVED
- Resolution/action: release the technical Rudi lock, mark the technical Rudi task VERIFIED, close technical Rudi loop #017, supersede WFN-CR-007's viewport-era decision and route all remaining Rudi acceptance to WellFit graphical/Sites memory. `WFN-LOOP-009` remains OPEN because it belongs to the distinct Puppet visual-verification obligation and is not closed by Rudi technical closeout.
- Falsification question: a newer owner-approved Rudi architecture or a unique unmerged technical defect on the hardened source would require reopening a separately scoped task; historical Site-v105/props evidence alone does not.
