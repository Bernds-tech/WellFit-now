# Started Work Register

Canonical register for work that has started but is not yet fully completed.

## Rules
- Add an entry as soon as substantive work begins.
- Every active `IN_PROGRESS`, `PARTIAL`, `BLOCKED`, `IMPLEMENTED_NOT_VERIFIED` or `RECONCILIATION_REQUIRED` task must appear here until closed or superseded.
- Assign `Risk: R1|R2|R3|R4` before implementation continues.
- Never delete history; close with status, date, result, evidence and next step.
- Cross-link Task ID, Change Request, PR/branch, dependencies, work lock and execution receipt.

## Active work

## WFN-PARTNER-OPERATIONS-REPORTING-BASELINE
- Started: 2026-09-03
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R2
- Scope: admin-only bounded aggregate view of partner redemption states and operational outcomes without person-level or proof data.
- Branch/PR: `codex/partner-operations-reporting-20260903` / PR #396.
- Work lock: `LOCK-WFN-PARTNER-OPERATIONS-REPORTING-BASELINE`.
- Completed: admin-only per-collection-bounded aggregation for redemption state/partner, challenge state and coarse outcomes with freshness, explicit truncation and privacy-response tests; no graphical/UI work included.
- Evidence: PR #396 exact head `dae5b2590ff3d924236c39c198de6deb33ee6148`; Build #1219, Container #204, Database #196, Beta 1 Emulator #182 and Project Memory gates all succeeded.
- Still open: PR merge and graphical dashboard/Production monitoring only.
- Exact next step: merge PR #396; keep graphical presentation separate.
- Owner action needed: none for repository baseline.

## WFN-PARTNER-RETENTION-BASELINE
- Started: 2026-09-03
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: bounded retry-safe backend cleanup for expired partner operational records and active-proof projections while preserving redemption/audit authority.
- Branch/PR: `codex/partner-retention-baseline-20260903` / PR #395.
- Work lock: `LOCK-WFN-PARTNER-RETENTION-BASELINE`.
- Completed: admin-authorized dry-run/execute processor, global 200-mutation ceiling, expired record deletion, cursor-based active-proof pruning, cleanup audit and repeated/partial/non-expired emulator cases; no graphical/UI work included.
- Evidence: PR #395 exact head `4f80c3be09bf84e8c237538c3db78deb5004e9a8`; Build #1216, Container #201, Database #193, Beta 1 Emulator #180 and Project Memory gates all succeeded.
- Still open: PR merge and Production scheduling only.
- Exact next step: merge PR #395; retain scheduler/deployment activation as a separate release decision.
- Owner action needed: none for repository baseline; Production scheduling remains a later deployment decision.

## WFN-PARTNER-OPERATIONS-BASELINE
- Started: 2026-09-03
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: Firebase/backend-only transactional challenge-issuance and operator-confirmation throttling plus privacy-minimal outcome counters.
- Branch/PR: `codex/partner-operations-baseline-20260903` / PR #394.
- Work lock: `LOCK-WFN-PARTNER-OPERATIONS-BASELINE`.
- Completed: transactional five-per-minute user issuance limit, twelve-per-minute operator confirmation limit, three-active-proof cap, privacy-minimal outcome counters, client-deny rules, export/deletion coverage and focused concurrency/boundary tests; no graphical/UI work included.
- Evidence: PR #394 exact head `8979e845e0e10f3c91e726450e81b1a7c522ebff`; Build #1213, Container #198, Database #190, Beta 1 Emulator #178 and Project Memory gates all succeeded.
- Still open: PR merge, Production threshold/retention configuration and real-partner acceptance only.
- Exact next step: merge PR #394; retain Production activation as a separate release decision.
- Owner action needed: none for repository baseline; Production thresholds remain configurable operational policy later.

## WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE
- Started: 2026-09-03
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: least-privilege partner operator assignments and short-lived single-use presentation proof for partner redemption confirmation.
- Branch/PR: `codex/partner-operator-verification-20260903` / PR #393.
- Work lock: `LOCK-WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE`.
- Completed: server-managed partner-scoped operator assignment/revocation, five-minute single-use presentation proof with SHA-256-only storage, operator-or-admin confirmation, audit/privacy lifecycle integration and client-deny rules.
- Evidence: PR #393 exact head `89778662ab0517ba04d8213678237efc27a67219`; Build #1208, Container #193, Database #185, Beta 1 Emulator #174 and Project Memory gates all succeeded. Cross-partner, wrong/expired proof, replay and revoked-operator paths were denied.
- Still open: PR merge, Production deployment and real-partner operational acceptance only.
- Exact next step: merge PR #393, then separately add bounded issuance/confirmation abuse controls before a real partner pilot.
- Owner action needed: none for repository baseline; real partner identities remain outside this task.

## WFN-PARTNER-REDEMPTION-BASELINE
- Started: 2026-09-03
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: server-authoritative, non-crypto partner catalog, offers, WFXP claim and admin-confirmed redemption for adult Beta users.
- Branch/PR: `codex/partner-redemption-baseline-20260903` / PR pending.
- Work lock: `LOCK-WFN-PARTNER-REDEMPTION-BASELINE`.
- Completed: partner/offer admin callables, active-offer listing, atomic one-per-user claim, WFXP ledger debit, inventory decrement, account-deletion freeze, replay protection, owner cancellation/refund, admin confirmation, audit events, export/deletion coverage and Firestore client-deny rules.
- Evidence: PR #392 exact head `81d370636e35b7ca8097d5d7fa8a31e17fb20316`; Build #1205, Container #190, Database #182, Beta 1 Emulator #172 and Project Memory gates all succeeded.
- Still open: Production deployment and real-partner operational acceptance only.
- Exact next step: merge PR #392; later design scoped partner-operator identity/fulfillment before any real partner pilot.
- Owner action needed: none; real partner onboarding and Production activation remain separate.

## WFN-TECH-TRUTH-20260903
- Started: 2026-09-03
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R2
- Scope: reconcile stale technical Project Memory against current `main` without combining graphical and technical repositories.
- Branch/PR: `codex/mission-interactions-server-authority-20260903` / merged PR #391.
- Work lock: `LOCK-WFN-TECH-TRUTH-20260903`.
- Completed so far: exact current-main inventory proves `/users/{uid}` client create/update/delete is denied; no active browser writer to that document remains; separate health-personalization/improvement/analytics decisions and withdrawal history exist; export, deletion request/cancellation and irreversible deletion processing exist with tests.
- Completed: finishline/current-state/next-action/evidence registers reconciled; V8, V9 and Project Memory quality checks pass; non-crypto partner redemption selected as the next bounded technical product slice.
- Still open: merge this memory correction before starting the next runtime feature.
- Exact next step: open and merge the reconciliation PR, then acquire a separate implementation lock for `WFN-PARTNER-REDEMPTION-BASELINE`.
- Owner action needed: none for this reconciliation.

## WFN-AVATAR-PUPPET-001
- Started: 2026-08-28
- Updated: 2026-08-29
- Status: VERIFIED
- Risk: R2
- Scope: corrective articulated 2D head/body attention for existing web mascot/avatar PNGs, superseding whole-image cursor transforms as the target behavior.
- Branch/PR: `codex/avatar-puppet-attention-20260828` / PR pending.
- Work lock: `LOCK-WFN-AVATAR-PUPPET-001`.
- Cross-repo authority: `WFG-CR-007`; WellFit remains graphical authority. Public ChatGPT Site source is separate and is not claimed modified by this branch.
- Completed so far: owner live failure reconciled; WFN-CR-005 registered; stale WFN-AVATAR-ATTN lock superseded; existing transparent Buddy asset family inventoried.
- Completed: articulated head/body layers, per-asset pivots, pointer/CTA targeting, idle/click response and reduced-motion/coarse-pointer fallback merged through PR #390; exact head passed Build #1198, Container #183, Database #175 and Project Memory gates.
- Still open: synchronization and visual acceptance on the separate public ChatGPT Site belongs to WellFit graphical authority.
- Exact next step: none in WellFit-now technical runtime.
- Owner action needed: none for technical implementation; public Site publication remains a separate explicit visual release decision.

## WFN-TECH-LEGACY-001
- Started: before 2026-08-20
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: inventory and migrate remaining legacy `users/{uid}` economy/Buddy writers and client compatibility fields to server-authoritative paths.
- Branch/PR: no implementation branch active; reconciliation only on `automation/reconcile-20260820`.
- Work lock: acquire before runtime/rules mutation.
- Dependencies: current server-authoritative mission/economy/Buddy flows; exact writer/reader inventory; Firestore/rules regression suite.
- Assumptions: exact remaining writer set is not yet reverified; record as NEEDS_VERIFICATION.
- Completed so far: server-authoritative mission completion, ledger/wallet and Buddy action foundations are present and repository-verified.
- Completed: exact inventory confirms no active client writer; `firestore.rules` denies all client mutation on `/users/{uid}`; migration commit `95028dc` removed the compatibility bridge.
- Still open: Production deployment evidence only.
- Evidence so far: WFN-EV-009, current main `d374e4db4777406d93a8aad72adc10ab47db216f`.
- Exact next step: none at repository implementation level; never recreate the removed path.
- Owner action needed: only if migration changes canonical WFP/WFXP/XP semantics.

## WFN-AUTH-CONSENT-001
- Started: before 2026-08-20
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: close auth/consent after Closed-Beta session hardening.
- Branch/PR: no implementation branch active.
- Work lock: acquire before auth/consent mutation.
- Dependencies: canonical privacy/product requirements; existing PR #369-#371 access gates.
- Assumptions: current consent/health-adjacent fields and withdrawal flow require exact code revalidation before changes.
- Completed so far: age >=16, email verification, onboarding/status gating, server sessions, revocation/device sessions.
- Completed: informed/separate optional consent model, versioned decisions, withdrawal and private-health deletion with emulator coverage.
- Still open: legal and Production acceptance.
- Evidence so far: `FINISHLINE_STATE.json`, PR #369-#371.
- Exact next step: map current registration/consent state and negative paths without weakening existing gates.
- Owner action needed: only for product/legal consent wording decisions.

## WFN-PRIVACY-001
- Started: before 2026-08-20
- Updated: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Scope: account export/deletion/anonymization/withdrawal and complete family/child lifecycle acceptance.
- Branch/PR: no implementation branch active.
- Work lock: acquire before state-changing lifecycle work.
- Dependencies: data ownership map, retention/audit requirements, auth/session revocation.
- Assumptions: no completion claim until destructive and negative-path acceptance exists.
- Completed so far: privacy-conscious device-session display and session revocation.
- Completed: export, deletion request/cancel, anonymization/deletion processor, withdrawal and guardian blocking with emulator coverage.
- Still open: Production scheduler/retention/legal acceptance and real-user lifecycle proof.
- Evidence so far: `FINISHLINE_STATE.json` and current session code.
- Exact next step: produce data/lifecycle inventory and acceptance matrix before mutation.
- Owner action needed: external/legal decisions where applicable.

## WFN-XREPO-001
- Started: 2026-08-19
- Updated: 2026-08-20
- Status: RECONCILIATION_REQUIRED
- Risk: R3
- Scope: reconcile graphical and Buddy ownership drift while retaining WellFit-now as technical authority.
- Branch/PR: matching memory reconciliation branches across WellFit/WellFit-now/WellFit-Buddy.
- Work lock: no code-migration lock until a specific `WF-MIG-*` task is approved.
- Dependencies: V9 contracts/dependencies, graphical baseline selection, Buddy device/migration evidence.
- Assumptions: general technical mobile logic remains in WellFit-now unless explicitly changed by owner.
- Completed so far: cross-repo V9 master and real physical ownership state documented.
- Still open: local role correction, graphical baseline, Buddy source migration decision/device acceptance, exact cross-repo E2E.
- Evidence so far: current main trees and V9 master.
- Exact next step: finish memory reconciliation; do not physically migrate code in this task.
- Owner action needed: only for later migration/acceptance decisions.

## Closed / superseded work

## WFN-AVATAR-ATTN-001
- Started: 2026-08-26
- Superseded: 2026-08-28
- Status: SUPERSEDED
- Risk: R2
- Scope: initial whole-image pointer-attention experiment across Buddy/Rudi/avatar surfaces.
- Branch/PR: `codex/avatar-attention-20260826` / merged PR #387; attempted closeout PR #388 closed unmerged as superseded.
- Result: code/build/container verification succeeded in WellFit-now, but the implementation rotates/translates the entire flat image and does not provide accepted head articulation; it also did not update the actual public ChatGPT Site.
- Evidence: PR #387, owner live validation 2026-08-28, WFG-CR-007 / CTR-WFG-006.
- Do not repeat: do not equate whole-image transform with head tracking and do not infer public Site acceptance from GitHub CI.

## WFN-MEM-005
- Started: 2026-08-19
- Closed: 2026-08-19
- Status: ACCEPTED
- Risk: R3
- Scope: V2-V5 Project Memory governance.
- Result: merged via PR #375 and retained in later memory versions.
- Evidence: merge `ec831cda0b6775783a30a9c2d6b78151cd2366ea`; later V9/current-main governance.
