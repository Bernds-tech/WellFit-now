# WellFit-now Open Loops

Use this register for started, partial, blocked or implemented-but-unverified follow-up work that could otherwise disappear between sessions. Link each loop to an existing task/change ID whenever possible.

## WFN-LOOP-016
- Related: WFN-CI-INSTALL-RESILIENCE-BASELINE
- Status: OPEN
- Updated: 2026-09-04
- Gap: repeated exact-head checks spent several minutes stalled in root or Functions dependency installation.
- Close when: cache-preferred lockfile-exact installs pass Build, Database, Beta Emulator, Container and Project Memory gates on the exact PR head.

## WFN-LOOP-001
- Related: WFN-MEM-001
- Status: CLOSED
- Updated: 2026-08-19
- Gap: v1 project memory lacked open-loop/dependency/evidence/stale-work controls.
- Result: Closed by later Project Memory upgrades.

## WFN-LOOP-002
- Related: WFN-TECH-LEGACY-001
- Status: CLOSED
- Updated: 2026-09-03
- Gap: server-authoritative foundations exist, but remaining legacy user/economy/Buddy writer and compatibility-field migration is not accepted.
- Resolution: current-main inventory confirms all `/users/{uid}` client mutation is denied, browser code only reads the owner projection and server functions own onboarding/settings writes. Historical migration commit `95028dc` removed the remaining compatibility bridge.
- Limitation: Production deployment evidence remains a separate release gate.

## WFN-LOOP-003
- Related: WFN-AUTH-CONSENT-001
- Status: CLOSED
- Updated: 2026-09-03
- Gap: Closed-Beta auth/session is hardened, but health-adjacent consent separation/withdrawal is incomplete.
- Resolution: separate health-personalization, health-improvement and analytics decisions, versioned history, withdrawal and private-health deletion exist with emulator coverage. Legal/Production acceptance remains external.

## WFN-LOOP-004
- Related: WFN-PRIVACY-001
- Status: CLOSED
- Updated: 2026-09-03
- Gap: export, deletion/anonymization, consent withdrawal and complete family/child lifecycle remain unaccepted.
- Resolution: repository implementation and negative-path tests exist for export, deletion request/cancel, guardian blocking and retry-safe irreversible processing. Production scheduler/retention/legal acceptance remains an external finishline gate.

## WFN-LOOP-005
- Related: WFN-XREPO-001
- Status: OPEN
- Updated: 2026-08-20
- Gap: graphical/UI and Unity Buddy AR code still physically lives in the technical repo while WellFit and WellFit-Buddy are the domain authorities; general technical mobile logic remains WellFit-now.
- Close when: explicit migration/retention decisions and exact cross-repo contract/E2E evidence reconcile physical code location without duplicate authority.

## WFN-LOOP-006
- Related: WFN-MEM-005 / PR #376
- Status: SUPERSEDED
- Updated: 2026-08-20
- Gap: V5 chat reconciliation PR stayed open after later V6-V9/main work.
- Resolution: WFN-MEM-005 history is now carried into current main-bound reconciliation; close PR #376 after this reconciliation merges.

## WFN-LOOP-007
- Related: stale PR cleanup
- Status: OPEN
- Updated: 2026-08-20
- Gap: PRs #13, #263, #363, #365 and #376 remain open despite current-main evidence showing them stale/superseded in whole or in relevant scope. PR #364 is intentionally different: deferred owner-reviewed future WFT canon work.
- Close when: the proven superseded PRs are closed with history preserved and #364 remains explicitly deferred rather than accidentally merged.

## WFN-LOOP-008
- Related: WFN-AVATAR-ATTN-001 / PR #387
- Status: SUPERSEDED
- Updated: 2026-08-28
- Gap: whole-image attention code was technically verified but failed the requested visual target and did not update the public ChatGPT Site.
- Resolution: preserve PR #387 as historical technical evidence; use WFN-LOOP-009 / WFN-AVATAR-PUPPET-001 for the corrective articulated implementation.

## WFN-LOOP-009
- Related: WFN-AVATAR-PUPPET-001 / WFG-CR-007
- Status: OPEN
- Updated: 2026-08-28
- Gap: the corrective articulated head/body puppet renderer is not yet implemented and visually verified. Public ChatGPT Site synchronization remains outside this GitHub branch.
- Close when: shared puppet rendering passes exact build/CI, a runnable GitHub surface visibly proves independent head/body movement and CTA targeting without regressions, and WellFit later verifies/ports it to the actual ChatGPT Site source.
- Next check: implement per-asset head/body clips and pivots, then verify the existing LandingHeroV5 Luma surface.

## WFN-LOOP-010
- Related: WFN-PARTNER-OPERATIONS-BASELINE / PR #394
- Status: CLOSED
- Updated: 2026-09-03
- Gap: transactional partner-operation limits, active-proof cap, operational counters and tests required exact-head verification.
- Resolution: PR #394 head `8979e845e0e10f3c91e726450e81b1a7c522ebff` passed Beta 1 Emulator #178, Build #1213, Container #198, Database #190 and all Project Memory gates.
- Limitation: Production TTL/retention setup and a real partner pilot are external acceptance steps.

## WFN-LOOP-011
- Related: WFN-PARTNER-RETENTION-BASELINE
- Status: CLOSED
- Updated: 2026-09-03
- Gap: bounded partner retention cleanup required exact-head emulator/CI verification.
- Resolution: PR #395 head `4f80c3be09bf84e8c237538c3db78deb5004e9a8` passed dry-run, partial/repeat execution, live-data preservation and every required gate.
- Limitation: no Production scheduler or deployment was activated.

## WFN-LOOP-012
- Related: WFN-PARTNER-OPERATIONS-REPORTING-BASELINE
- Status: CLOSED
- Updated: 2026-09-03
- Gap: privacy-minimal bounded partner reporting required exact-head emulator/CI verification.
- Resolution: PR #396 head `dae5b2590ff3d924236c39c198de6deb33ee6148` passed non-admin denial, aggregate, truncation and forbidden-field checks plus every repository gate.
- Limitation: no graphical dashboard or Production monitoring was added.

## WFN-LOOP-013
- Related: WFN-PARTNER-CATALOG-GOVERNANCE-BASELINE
- Status: CLOSED
- Updated: 2026-09-03
- Gap: partner offer updates could reset inventory and rewrite published terms without revision or concurrency protection.
- Resolution: PR #397 exact head passed separated transactional commands, immutable client-denied revisions, stale/concurrent mutation rejection, published-term protection and terminal retirement tests.
- Limitation: Production deployment and real-partner acceptance remain external.

## Rules
- WFN-LOOP-015 / WFN-PARTNER-CATALOG-REVISION-READ-BASELINE is CLOSED: PR #399 passed explicit admin authorization, offer isolation, cursor bounds and all exact-head gates.
- WFN-LOOP-014 / WFN-PARTNER-CATALOG-ADMIN-READ-BASELINE is CLOSED: PR #398 passed bounded admin projection authorization, cursor and privacy tests plus all exact-head gates.
- `PARTIAL`, `BLOCKED`, `IMPLEMENTED_NOT_VERIFIED`, `IN_PROGRESS` and `RECONCILIATION_REQUIRED` tasks require an open-loop reference or explicit no-follow-up rationale.
- Never delete historical loops; close or supersede them explicitly.
- Loop states: `OPEN`, `BLOCKED`, `CLOSED`, `SUPERSEDED`.
