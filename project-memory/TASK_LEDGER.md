# WellFit-now Task Ledger

Keep history append-only; supersede rather than delete.

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
- Status: PARTIAL
- Risk: R3
- Goal: remove remaining legacy user/economy/Buddy client-write compatibility by migrating all remaining writers to server-authoritative paths.
- Result: server-authoritative mission/economy/Buddy foundations exist, but current finishline still identifies legacy `users/{uid}` initialization/writers and compatibility fields as incomplete migration work.
- Evidence: current runtime/finishline state, Firestore/economy architecture and current main `bf1559b0073b511bf15de39a57df5e548e6dd3ad`.
- Negative/fail-closed path: client attempts must remain unable to mint rewards, authorize mission completion or bypass protected server paths; each migration step requires rules/regression evidence before compatibility removal.
- Rollback/recovery: migrate one writer/field family at a time; retain the prior compatibility path until exact consumers and tests prove the replacement, then remove deliberately in a separately reviewable change.
- Next step: inventory exact remaining readers/writers/fields and bind each to an owner/server migration task before changing runtime.

## WFN-AUTH-CONSENT-001
- Date: active before 2026-08-20
- Status: PARTIAL
- Risk: R3
- Goal: close authentication/consent finishline after the Closed-Beta session hardening.
- Completed: PRs #369-#371 established age >=16, email verification, onboarding/account gating, HttpOnly server sessions, revocation and device-session management.
- Still open: separate/informed health-adjacent consent posture, withdrawal and exact acceptance evidence.
- Evidence: `FINISHLINE_STATE.json`, current main and PR #369-#371 history.
- Negative/fail-closed path: unverified/incomplete/inactive users remain denied; health personalization must not silently default to consent.
- Rollback/recovery: consent/session changes require reversible staged rollout and must not weaken current access gates.
- Next step: map current registration/consent fields and withdrawal paths against canonical/privacy requirements and create the smallest scoped remediation.

## WFN-PRIVACY-001
- Date: active before 2026-08-20
- Status: PARTIAL
- Risk: R3
- Goal: complete account/privacy lifecycle acceptance.
- Completed: session display avoids storing IP/location and active device sessions can be revoked.
- Still open: user data export, deletion/anonymization, consent withdrawal and complete family/child lifecycle acceptance.
- Evidence: `FINISHLINE_STATE.json`, current session implementation and current main.
- Negative/fail-closed path: deletion/export must not expose other users' data or leave privileged/reward authority dangling.
- Rollback/recovery: destructive lifecycle work requires recoverable staged design and audit-safe retention boundaries before production activation.
- Next step: inventory lifecycle endpoints/data ownership and define exact acceptance/retention evidence before implementation.

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
- Status: COUNTERCHECKED
- Risk: R2
- Goal: make existing Rudi/Buddy/avatar graphics across the current web app attentively follow fine-pointer input and look toward interactive controls such as login/register without changing product/server authority.
- Starting state: mascot/avatar images were static; no registered attention implementation or active lock existed. UI code remains physically in WellFit-now although WellFit is the graphical authority.
- Action: added a global `AvatarAttentionSystem` client component and mounted it in the root layout. It auto-discovers qualifying images, eases pointer-follow transforms, prioritizes hovered/focused control centers, adds a short pointer-down pulse and respects coarse-pointer/reduced-motion clients.
- Result: PR #387 final head `3a6bdfb43e1f613614301eb5f9952071ecf79202` passed Build #1194, Container Build #179, Database Package Tests #171 and Project Memory Guard/Quality/Status; the PR was mergeable and merged to main as `f687d2ba7c7bc46450301b9c92dbc0845feffa5f`.
- Evidence: PR #387; final-head CI named above; merged main revision `f687d2ba7c7bc46450301b9c92dbc0845feffa5f`; implementation commits `15347fa7e451976afe8f59400ac9978394608046` and `5c88cb9f9f8421ed6fa7ed2647ea4edd46329855` retained in PR history.
- Negative/fail-closed path: no auth/navigation semantics, backend/data, mission/reward/economy authority, camera/location or Unity/native runtime changed; coarse pointers and reduced-motion clients get no pointer animation.
- Rollback/recovery: revert merged PR #387; no data migration or server state is involved.
- Falsification question: a visual regression from transform composition, a missed qualifying avatar, or evidence that the selected canonical/Sites surface uses a different source requires reconciliation before visual acceptance.
- Next step: keep `WFN-LOOP-008` open for runnable browser/preview evidence and Sites-v71 synchronization; no implementation lock remains active.
