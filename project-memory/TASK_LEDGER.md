# WellFit-now Task Ledger

Keep history append-only; supersede rather than delete.

## WFN-PARTNER-CATALOG-ADMIN-READ-BASELINE
- Date: 2026-09-03
- Status: IN_PROGRESS
- Risk: R2
- Goal: provide the current safe mutation inputs without blind offer IDs or exposing raw audit actors.
- Scope: admin-only bounded cursor projection of lifecycle, revision and aggregate inventory facts.
- Negative path: non-admin access, unbounded scans and actor/raw revision disclosure remain denied.
- Next step: implement and verify focused emulator paths.

## WFN-PARTNER-CATALOG-GOVERNANCE-BASELINE
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Goal: make partner offer administration revision-safe without changing graphical catalog presentation.
- Scope: create-only offer registration, controlled draft terms, explicit publish/pause/retire, explicit capacity adjustment, optimistic concurrency and immutable audit revisions.
- Negative/fail-closed path: duplicate creation, stale revisions, retired reactivation, published term rewrites and capacity below consumed inventory must be denied.
- Rollback/recovery: isolated callable/revision/rules/test changes can be reverted before any Production deployment; existing redemptions remain authoritative.
- Result: offer creation is create-only and draft-first; term, capacity and lifecycle changes are transactional and revision-checked; published terms, stale writes, inventory resets and retired reactivation fail closed.
- Evidence: WFN-EV-015; PR #397 head `6e02ef5007a3423728f322ae5a9a4e0b64542120` passed all required exact-head gates.
- Next step: merge PR #397; separately add a bounded admin catalog projection.

## WFN-MEM-001
- Date: 2026-08-19
- Status: DONE
- Goal: Introduce durable project memory and duplicate-work prevention.
- Starting state: Strong `AGENTS.md` and runtime-state governance existed, but no dedicated micro-attempt/change-request ledger.
- Action: Added Project Memory Protocol v1 structure and PR guard.
- Result: Operational execution memory established.
- Evidence: `project-memory/` and `.github/workflows/project-memory-guard.yml`.
- Next step: Extend this system; do not create a competing ledger.
- Do not repeat: Extend this system; do not create a competing ledger.

## WFN-MEM-005
- Date: 2026-08-19
- Status: ACCEPTED
- Risk: R3
- Goal: Complete the V2-V5 Project Memory upgrade and make project-memory-first execution/counterchecking the default.
- Action: Added open-loop/dependency/evidence/session-handoff/do-not-assume controls; standing authorizations and generated status; mandatory execution policy; STARTED_WORK, WORK_LOCKS, EXECUTION_RECEIPTS, ASSUMPTIONS, CONTRADICTIONS and QUALITY_CONTROL; Risk R1-R4, quorum, evidence freshness, negative/fail-closed checks, scope-diff guard, rollback/recovery proof, falsification and milestone closeout.
- Result: V5 merged via PR #375; later V6-V9 and the real-work baseline were merged without removing V5 obligations.
- Evidence: PR #375 merge `ec831cda0b6775783a30a9c2d6b78151cd2366ea`; later V9/current-main memory chain; historical reconciliation PR #376.
- Next step: Apply V5+ automatically to all substantive work and keep unfinished product/runtime work explicit in active registers.
- Do not repeat: Do not merge/revive PR #376 as a second memory source after this history is carried forward.

## WFN-TECH-LEGACY-001
- Date: active before 2026-08-20
- Status: VERIFIED
- Risk: R3
- Goal: remove remaining legacy user/economy/Buddy client-write compatibility by migrating all remaining writers to server-authoritative paths.
- Result: current-main inventory confirms server-authoritative onboarding/settings and mission/economy/Buddy foundations; `/users/{uid}` permits owner reads only and denies all client mutation; no active browser writer remains.
- Evidence: migration commit `95028dc`, current main `d374e4db4777406d93a8aad72adc10ab47db216f`, `firestore.rules`, repository search and rules checks.
- Negative/fail-closed path: client attempts must remain unable to mint rewards, authorize mission completion or bypass protected server paths; each migration step requires rules/regression evidence before compatibility removal.
- Rollback/recovery: migrate one writer/field family at a time; retain the prior compatibility path until exact consumers and tests prove the replacement, then remove deliberately in a separately reviewable change.
- Next step: do not recreate legacy user writes; separately verify Production deployment evidence when preparing the Closed Beta.

## WFN-AUTH-CONSENT-001
- Date: active before 2026-08-20
- Status: VERIFIED
- Risk: R3
- Goal: close authentication/consent finishline after the Closed-Beta session hardening.
- Completed: PRs #369-#371 established age >=16, email verification, onboarding/account gating, HttpOnly server sessions, revocation and device-session management.
- Completed: separate optional health-personalization, health-improvement and analytics decisions; versioned event history; withdrawal and private-health deletion with emulator evidence.
- Still open: legal wording/retention review and Production acceptance only.
- Evidence: `FINISHLINE_STATE.json`, current main and PR #369-#371 history.
- Negative/fail-closed path: unverified/incomplete/inactive users remain denied; health personalization must not silently default to consent.
- Rollback/recovery: consent/session changes require reversible staged rollout and must not weaken current access gates.
- Next step: retain the fail-closed implementation and obtain external legal/Production acceptance before public health-data use.

## WFN-PRIVACY-001
- Date: active before 2026-08-20
- Status: VERIFIED
- Risk: R3
- Goal: complete account/privacy lifecycle acceptance.
- Completed: session display avoids storing IP/location and active device sessions can be revoked.
- Completed: scoped JSON export, deletion request/cancel, session revocation, guardian dependency blocking, anonymization/deletion processor and consent withdrawal with emulator coverage.
- Still open: Production scheduler/retention/legal acceptance and full real-user lifecycle proof.
- Evidence: `FINISHLINE_STATE.json`, current session implementation and current main.
- Negative/fail-closed path: deletion/export must not expose other users' data or leave privileged/reward authority dangling.
- Rollback/recovery: destructive lifecycle work requires recoverable staged design and audit-safe retention boundaries before production activation.
- Next step: obtain Production and legal evidence before enabling irreversible public-account processing.

## WFN-TECH-TRUTH-20260903
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R2
- Goal: reconcile stale 2026-08-20 technical finishline claims against current main before continuing implementation.
- Result: legacy user-client authority, separate health consent withdrawal and account export/deletion are already implemented at repository level; the next absent technical product slice is non-crypto partner redemption.
- Evidence: WFN-EV-009 and CTR-WFN-009.
- Next step: implement `WFN-PARTNER-REDEMPTION-BASELINE` on a separate scoped branch/lock after this reconciliation merges.
- Do not repeat: do not restart the already completed legacy-writer or consent/account-lifecycle implementation work merely because older handoff text says PARTIAL.

## WFN-PARTNER-REDEMPTION-BASELINE
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Goal: add a server-authoritative non-crypto partner reward/redemption path for the adult Beta.
- Scope: partner and offer administration, active catalog projection, atomic WFXP claim, one-per-user replay protection, inventory/expiry/partner-state validation, admin fulfillment confirmation and privacy-minimal audit.
- Result: repository implementation additionally supports owner cancellation with atomic WFXP refund and inventory restoration; partner redemptions participate in export and deletion processing.
- Evidence: WFN-EV-010; PR #392 head `81d370636e35b7ca8097d5d7fa8a31e17fb20316` passed all required exact-head CI gates.
- Negative/fail-closed path: unauthenticated/non-admin mutations, inactive or expired offers, exhausted stock, insufficient WFXP, child profiles and account-deletion freezes are denied; clients cannot write partner authority collections.
- Rollback/recovery: revert the isolated module/index/rules changes before Production deployment; no provider or partner is activated by repository code.
- Next step: merge PR #392; Production and real-partner acceptance remain separate.

## WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Goal: replace global-admin-only partner fulfillment with least-privilege partner-scoped verification.
- Scope: server-managed operator assignment, revocation, short-lived hashed presentation challenge and single-use confirmation.
- Result: partner operators are restricted to their assigned active partner; an owner-issued 32-byte proof expires after five minutes, is stored only as a SHA-256 hash and is consumed atomically with redemption confirmation. Global admins retain an explicit override path.
- Evidence: WFN-EV-011; PR #393 head `89778662ab0517ba04d8213678237efc27a67219`; all required exact-head gates succeeded.
- Negative/fail-closed path: cross-partner operators, revoked assignments, expired/wrong proof and replay cannot redeem or expose another user's data.
- Rollback/recovery: revert the isolated operator/challenge extension; keep PR #392 admin-only baseline intact until replacement passes exact-head gates.
- Next step: merge PR #393; then add bounded abuse controls and operational signals as a separate backend task.

## WFN-PARTNER-OPERATIONS-BASELINE
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Goal: bound automated presentation issuance and operator confirmation attempts before a real partner pilot.
- Scope: server-side fixed-window counters, a small active-proof cap, privacy-minimal outcome categories and emulator boundary/concurrency tests.
- Result: fixed-window counters stop concurrent callers at five user issuances and twelve operator attempts per minute; at most three proofs remain active; outcome aggregates omit IP/location and all internal records are client-denied and covered by account export/deletion.
- Evidence: WFN-EV-012; PR #394 head `8979e845e0e10f3c91e726450e81b1a7c522ebff`; all required exact-head gates succeeded.
- Negative/fail-closed path: concurrent callers cannot exceed configured limits; rejected attempts cannot expose another user, bypass partner scope or persist IP/location.
- Rollback/recovery: revert isolated counter collections and callable extensions; PR #393 verification remains valid without operational telemetry.
- Next step: merge PR #394; Production TTL/retention and partner-pilot acceptance remain separate.

## WFN-PARTNER-RETENTION-BASELINE
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R3
- Goal: prevent indefinite storage of short-lived partner operational records without weakening redemption or audit evidence.
- Scope: admin-authorized bounded dry-run/execute processor for expired rate/outcome/challenge records and stale active-proof projections.
- Result: safe-default dry-run and admin execution remove only expired short-lived records, cap cleanup mutations at 200, provide a cursor for bounded activity scans, preserve live/redemption/audit data and remain idempotent on repeat.
- Evidence: WFN-EV-013; PR #395 head `4f80c3be09bf84e8c237538c3db78deb5004e9a8`; all required exact-head gates succeeded.
- Negative/fail-closed path: non-admin callers, non-expired records and immutable redemption/audit authority remain untouched; each execution is globally batch-bounded and repeatable.
- Rollback/recovery: revert the isolated processor/registration/test changes; existing records remain server-protected and account-deletion coverage remains intact.
- Next step: merge PR #395; Production scheduling remains separate.

## WFN-PARTNER-OPERATIONS-REPORTING-BASELINE
- Date: 2026-09-03
- Status: VERIFIED
- Risk: R2
- Goal: make partner-pilot health inspectable without exposing proof secrets or person-level operational data.
- Scope: bounded admin-only aggregation of redemption status by partner plus challenge/outcome totals with freshness and truncation metadata.
- Result: bounded aggregate-only callable reports redemption state by partner, challenge state and coarse outcomes with freshness/truncation; no raw documents, user/operator IDs, proof tokens or hashes are returned.
- Evidence: WFN-EV-014; PR #396 head `dae5b2590ff3d924236c39c198de6deb33ee6148`; all required exact-head gates succeeded.
- Negative/fail-closed path: non-admin callers are denied and responses cannot contain user IDs, operator IDs, token hashes, presentation tokens or raw documents.
- Rollback/recovery: revert the isolated callable/test extension; underlying redemption authority and counters remain unchanged.
- Next step: merge PR #396; graphical dashboard/Production monitoring remain separate.

## WFN-XREPO-001
- Date: 2026-08-19 to 2026-08-20
- Status: RECONCILIATION_REQUIRED
- Risk: R3
- Goal: align physical code location with the owner-defined domains without duplicating or silently moving authority.
- Current truth: WellFit-now is technical; WellFit is graphical; WellFit-Buddy is the Buddy domain. General technical mobile/application logic stays technical unless it is specifically Buddy behavior/presentation/AR.
- Drift: current graphical/UI code and Unity Buddy AR code still physically exist in WellFit-now.
- Evidence: V9 master, current source tree, current owner role decision, corresponding reconciliation branches in all three repositories.
- Negative/fail-closed path: no migration may delete the source or switch authority until destination build/integration evidence exists and rollback is defined.
- Rollback/recovery: migration ledger must preserve old authority until destination verification and cross-repo acceptance are complete.
- Next step: reconcile graphical candidate PR #2 in WellFit and Buddy ownership/device task in WellFit-Buddy; do not move general technical mobile logic.

## WFN-RECON-20260820
- Date: 2026-08-20
- Status: VERIFIED
- Risk: R2
- Goal: reconcile current Project Memory with main, finishline, open PRs and cross-repo roles.
- Result: found active technical gaps missing from V5 registers, stale/superseded PRs, branch-protection enforcement drift and over-broad Buddy/mobile role wording.
- Evidence: current main/PR/branch metadata, `FINISHLINE_STATE.json`, current cross-repo master.
- Falsification question: What observation would prove our conclusion wrong? A newer accepted technical release/finishline, a still-needed unique diff in a PR classified superseded, or exact runtime/device evidence contradicting these states would force RECONCILIATION_REQUIRED before closure.
- Next step: merge this memory-only reconciliation after green checks, close only proven superseded PRs, keep PR #364 deferred, then execute WFN-TECH-LEGACY-001.

## WFN-AVATAR-ATTN-001
- Date: 2026-08-26
- Status: SUPERSEDED
- Risk: R2
- Goal: initial whole-image pointer attention for existing Rudi/Buddy/avatar graphics.
- Action: added global `AvatarAttentionSystem` whole-image translate/rotate/scale behavior via PR #387.
- Result: technically green and merged, but owner live validation on 2026-08-28 proved that the actual public ChatGPT Site showed no movement and the implementation did not provide true independent head articulation. Closeout PR #388 was closed unmerged as superseded.
- Evidence: merged PR #387; WFG-CR-007; CTR-WFG-006; owner live validation 2026-08-28.
- Rollback/recovery: historical code is replaced by WFN-AVATAR-PUPPET-001; no data migration exists.
- Do not repeat: do not claim whole-image rotation as head tracking or GitHub CI as public Site acceptance.

## WFN-AVATAR-PUPPET-001
- Date: 2026-08-28
- Status: IN_PROGRESS
- Risk: R2
- Goal: provide visibly independent head/body mouse and CTA attention for existing transparent mascot/avatar PNGs while preserving WellFit graphical authority and all technical/server boundaries.
- Starting state: old whole-image engine is merged but visually insufficient; public ChatGPT Site is a separate source and remains unmodified by this branch.
- Action: replace the old renderer with overlapping head/body clones from the same transparent PNG, per-asset crop/pivot configuration, head-led 3D-style transforms, delayed torso lean, CTA priority, click nod, idle breathing and reduced-motion/coarse-pointer fallback.
- Evidence: branch `codex/avatar-puppet-attention-20260828`; `LOCK-WFN-AVATAR-PUPPET-001`; `XLOCK-WF-AVATAR-PUPPET-20260828`; WFN-CR-005 / WFG-CR-007.
- Negative/fail-closed path: no navigation/auth semantics, backend/data, mission/reward/economy authority, camera/location or Unity/native runtime changes; public Site publication is explicitly outside this branch.
- Rollback/recovery: revert the scoped renderer PR; the original PNG files and server state remain unchanged.
- Next step: run exact branch Build/Container/DB/Project Memory gates and obtain runnable visual evidence on the GitHub landing before any graphical acceptance or Site port.
