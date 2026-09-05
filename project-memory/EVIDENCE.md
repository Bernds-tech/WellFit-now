# WellFit-now Evidence and Acceptance

Implementation and acceptance are separate states.

Status model: `IMPLEMENTED`, `IMPLEMENTED_NOT_VERIFIED`, `VERIFIED`, `COUNTERCHECKED`, `ACCEPTED`, `PRODUCTION_CONFIRMED`. Historical `DONE` remains valid only for v1 records.

Every evidence record should contain a unique evidence ID, related task/change ID, date, target/environment, evidence type, immutable reference where practical, result, limitations and acceptance state. Never store secrets or private user data.

## WFN-EV-021
- Related: WFN-RUDI-3D-001 / WFN-CR-007 / WFN-LOOP-017
- Date: 2026-09-05
- Target: public landing 3D Rudi world-presence, CTA emotion and table staging
- Type: owner live visual feedback plus corrective local build evidence
- Reference: PR #401 follow-up diff after functional head `944565028fb533023aeb53952c1855f223f75b0f`
- Result: replaced viewport-following perception with a body-level transparent 3D world outside the scrolling main element. Rudi holds his content-relative place during scroll until reaching complete-body safe bounds, then uses climb/run/jump catch-up states. A frame-loop scale override discovered during the follow-up is corrected so the requested reduction is effective at `0.66` instead of returning to `0.94`; autonomous travel begins more frequently. Distance-based login/register attention still adds head and spine tracking, rising excitement, CTA dialogue and celebration without replacing autonomous behavior. The table remains larger, brighter, correctly elevated and in the second scene. Targeted ESLint, asset validation and the complete production build pass locally.
- Limitations: real-browser/device visual acceptance and synchronization to the separate public ChatGPT Site remain open; the current rig still lacks facial morph targets and individual finger bones.
- Acceptance: IMPLEMENTED_NOT_VERIFIED

## WFN-EV-020
- Related: WFN-RUDI-3D-001 / WFN-LOOP-017
- Date: 2026-09-05
- Target: public landing 3D Rudi scale and movement stage
- Type: owner-supplied 16-second visual review plus corrective local build evidence
- Reference: owner video `WhatsApp Video 2026-09-05 at 09.02.25.mp4`; PR #401 follow-up diff
- Result: frame-by-frame review confirmed that the live Rudi is too large and that legs/props are clipped by a fixed renderer box. The repository implementation now uses a viewport-wide orthographic transparent stage and reduces model scale from `1.42` to `0.94`. A second corrective pass adds viewport-safe edge clamping, a responsive ground shadow, dedicated walk phases between actions, travel-facing direction, prop-only action phases and safely clamped dialogue. Targeted ESLint, `rudi:validate` and the complete production build pass.
- Limitations: the separate public ChatGPT Site has not yet received this correction. The supervised preview cannot launch this retained Next.js project because it forwards Vite-only flags, so post-change browser/device acceptance remains required. Functional head `944565028fb533023aeb53952c1855f223f75b0f` passed Build #1244, Container #229, Database #221, Beta 1 Emulator #200 and all Project Memory gates.
- Acceptance: IMPLEMENTED_NOT_VERIFIED

## WFN-EV-019
- Related: WFN-RUDI-3D-001 / WFN-CR-006
- Date: 2026-09-05
- Target: public landing 3D presentation bridge
- Type: exact-head repository and generated-asset verification
- Reference: PR #401 head `cfed7908d44a7d838044df95b55167b61b6b9179`; Meshy Actions runs `33880908596` and `33882908469`; materialization run `33933220732`
- Result: the colored textured 24-joint Rudi rig, ten compact animation clips, autonomous behavior component, separate cape and prop scenes passed Build #1239, Container #224, Database #216, Beta 1 Emulator #195 and all Project Memory gates.
- Limitations: CI does not prove browser/device visual acceptance; the current skeleton has hand bones but no individual finger joints; the public ChatGPT Site uses a separate release path.
- Acceptance: IMPLEMENTED_NOT_VERIFIED

## WFN-EV-001
- Related: WFN-MEM-001
- Date: 2026-08-19
- Target: repository governance
- Type: merged repository controls
- Reference: Project Memory Protocol v1 and guard workflow on `main`
- Result: durable operational memory established
- Limitations: v1 did not separate open loops, dependencies, acceptance levels or stale scanning
- Acceptance: VERIFIED

## WFN-EV-002
- Related: WFN-MEM-005 / current technical baseline
- Date: 2026-08-19
- Target: repository/package verification
- Type: exact-head CI implementation evidence
- Reference: PR #380 head `f2f69f25aa37cb15ac183f8531dfb92add8591d5`; merge main `bf1559b0073b511bf15de39a57df5e548e6dd3ad`
- Result: Project Memory Guard, Project Memory Quality, Project Memory Status, Database Package Tests, Build and Container Build all completed successfully on the exact PR head.
- Limitations: repository/container/package verification is not Production, legal, owner or real-device acceptance.
- Acceptance: VERIFIED

## WFN-EV-003
- Related: WFN-AUTH-CONSENT-001
- Date: through 2026-08-20 reconciliation
- Target: Closed-Beta auth/session
- Type: implementation evidence
- Reference: merged PRs #369-#371 and `FINISHLINE_STATE.json`
- Result: age >=16, email verification, onboarding/account-status gating, HttpOnly server sessions, revocation and device-session management are implemented.
- Limitations: separate health-adjacent consent/withdrawal acceptance remains open.
- Acceptance: VERIFIED

## WFN-EV-004
- Related: WFN-TECH-LEGACY-001
- Date: 2026-08-20
- Target: mission/economy/Buddy server authority
- Type: implementation evidence
- Reference: current main plus `FINISHLINE_STATE.json`
- Result: attempt -> evidence -> admin review -> completion -> internal ledger -> wallet exists with replay/idempotency/audit protections; Buddy server actions/projections exist.
- Limitations: remaining legacy user writers/client compatibility have not yet been re-inventoried and removed; WFXP/WFP/XP terminology remains unresolved.
- Acceptance: VERIFIED

## WFN-EV-005
- Related: WFN-PRIVACY-001
- Date: 2026-08-20
- Target: account/session privacy
- Type: implementation evidence
- Reference: current main and `FINISHLINE_STATE.json`
- Result: device-session management does not persist IP/location for session display and supports revocation.
- Limitations: export, deletion/anonymization, consent withdrawal and full family/child lifecycle are not accepted.
- Acceptance: VERIFIED_NOT_ACCEPTED

## WFN-EV-006
- Related: WFN-XREPO-001
- Date: 2026-08-20
- Target: cross-repository ownership
- Type: independent countercheck evidence
- Reference: current WellFit-now source tree, current WellFit/WellFit-Buddy repositories, V9 master and latest owner-defined roles
- Result: WellFit-now is technical; WellFit is graphical; WellFit-Buddy is Buddy-specific. Graphical/UI and Unity Buddy AR code still physically resides in WellFit-now, creating ownership drift but not missing implementation.
- Limitations: no physical migration or exact cross-repo E2E acceptance has occurred.
- Acceptance: COUNTERCHECKED

## WFN-EV-007
- Related: WFN-RECON-20260820
- Date: 2026-08-20
- Target: GitHub governance
- Type: independent remote countercheck
- Reference: live GitHub `main` branch metadata
- Result: `main` is currently `protected=false`, contradicting the required remote posture in `BRANCH_PROTECTION_CONTRACT.json`.
- Limitations: connected GitHub capability cannot activate branch protection/rulesets.
- Acceptance: VERIFIED

## WFN-EV-008
- Related: stale PR reconciliation
- Date: 2026-08-20
- Target: current main versus open PRs
- Type: repository countercheck
- Reference: open PR metadata and current main
- Result: PR #263's owner-claim helper already exists on main; PR #13's Unity project is already physically represented on current main; PR #376 is superseded after V5 history carry-forward; PR #365/#363 are superseded by later coordination/runtime truth. PR #364 remains a distinct deferred future WFT-canonical decision.
- Limitations: closing a stale PR preserves history but does not imply its old branch was accepted as-is.
- Acceptance: COUNTERCHECKED

## WFN-EV-009
- Related: WFN-TECH-TRUTH-20260903 / WFN-TECH-LEGACY-001 / WFN-AUTH-CONSENT-001 / WFN-PRIVACY-001
- Date: 2026-09-03
- Target: current-main technical finishline
- Type: exact code/rules/test inventory
- Reference: `d374e4db4777406d93a8aad72adc10ab47db216f`, migration commit `95028dc`, current `firestore.rules`, consent and account-lifecycle modules/tests
- Result: `/users/{uid}` browser writes are absent and rules deny all client mutation; health personalization/improvement/analytics decisions and revocations are separated and audited; export and deletion lifecycle including guardian blocking and irreversible processing are implemented with emulator coverage.
- Limitations: this reconciliation did not prove the currently deployed Production rules/functions, legal acceptance, scheduler operation or a real-device flow.
- Acceptance: VERIFIED

## WFN-EV-010
- Related: WFN-PARTNER-REDEMPTION-BASELINE / PR #392
- Date: 2026-09-03
- Target: server-authoritative non-crypto partner reward lifecycle
- Type: exact-head CI plus emulator negative-path evidence
- Reference: PR #392 head `81d370636e35b7ca8097d5d7fa8a31e17fb20316`; Build #1205, Container Build #190, Database Package Tests #182, Beta 1 Emulator Tests #172 and Project Memory Guard/Quality/Status.
- Result: partner/offer admin authority, active catalog, atomic WFXP claim, one-per-user replay protection, expiry/inactive/stock/balance checks, adult-only boundary, account deletion freeze, cancellation/refund, fulfillment confirmation, audit and client-deny rules all passed.
- Limitations: no Production deploy, payment/token/cashout activation, partner-operator identity or real partner pilot was performed.
- Acceptance: VERIFIED

## WFN-EV-011
- Related: WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE / PR #393
- Date: 2026-09-03
- Target: partner-scoped redemption verification
- Type: exact-head CI plus emulator negative-path evidence
- Reference: PR #393 head `89778662ab0517ba04d8213678237efc27a67219`; Build #1208, Container Build #193, Database Package Tests #185, Beta 1 Emulator Tests #174 and Project Memory Guard/Quality/Status.
- Result: active partner-scoped operators and global admins can confirm only with a valid owner-issued single-use proof; cross-partner, revoked operator, wrong token, expired token and replay paths are denied. Plaintext proofs are not persisted, and operator/challenge records are denied to clients and included in privacy export/deletion handling.
- Limitations: repository evidence is not Production deployment, physical partner identity verification, device scanning UX, fraud monitoring or real-partner acceptance.
- Acceptance: VERIFIED

## WFN-EV-012
- Related: WFN-PARTNER-OPERATIONS-BASELINE / PR #394
- Date: 2026-09-03
- Target: partner-redemption abuse controls and operational counters
- Type: exact-head CI plus emulator concurrency/boundary evidence
- Reference: PR #394 head `8979e845e0e10f3c91e726450e81b1a7c522ebff`; Build #1213, Container Build #198, Database Package Tests #190, Beta 1 Emulator Tests #178 and Project Memory Guard/Quality/Status.
- Result: transactional one-minute limits cap presentation issuance at five per user and confirmation attempts at twelve per operator; three-active-proof cap, parallel boundary behavior, outcome aggregation, privacy export/deletion and client-deny rules passed.
- Limitations: counters use repository-defined Beta thresholds; Production TTL/retention configuration, monitoring policy and real-partner acceptance were not performed.
- Acceptance: VERIFIED

## WFN-EV-013
- Related: WFN-PARTNER-RETENTION-BASELINE / PR #395
- Date: 2026-09-03
- Target: expired partner operational data cleanup
- Type: exact-head CI plus emulator lifecycle evidence
- Reference: PR #395 head `4f80c3be09bf84e8c237538c3db78deb5004e9a8`; Build #1216, Container Build #201, Database Package Tests #193, Beta 1 Emulator Tests #180 and Project Memory Guard/Quality/Status.
- Result: admin-only safe-default dry-run and bounded execute cleanup deletes expired rate/outcome/challenge records, prunes expired activity entries, preserves live/redemption/audit authority, supports cursor continuation and is idempotent on repeat.
- Limitations: no Production schedule/deployment or provider retention policy was activated.
- Acceptance: VERIFIED

## WFN-EV-014
- Related: WFN-PARTNER-OPERATIONS-REPORTING-BASELINE / PR #396
- Date: 2026-09-03
- Target: privacy-minimal partner operations reporting
- Type: exact-head CI plus emulator authorization/privacy evidence
- Reference: PR #396 head `dae5b2590ff3d924236c39c198de6deb33ee6148`; Build #1219, Container Build #204, Database Package Tests #196, Beta 1 Emulator Tests #182 and Project Memory Guard/Quality/Status.
- Result: admin-only bounded summary aggregates redemptions by partner/state, challenge states and coarse outcome counts; freshness/truncation is explicit and responses omit user/operator IDs, tokens, hashes and raw records.
- Limitations: no graphical dashboard, Production monitoring or real-partner acceptance was performed.
- Acceptance: VERIFIED

## WFN-EV-015
- Related: WFN-PARTNER-CATALOG-GOVERNANCE-BASELINE / PR #397
- Date: 2026-09-03
- Target: partner offer catalog mutation authority
- Type: exact-head CI plus emulator concurrency/negative-path evidence
- Reference: PR #397 head `6e02ef5007a3423728f322ae5a9a4e0b64542120`; Build #1223, Container Build #208, Database Package Tests #200, Beta 1 Emulator Tests #185 and Project Memory Guard/Quality/Status.
- Result: duplicate creation, published term rewrites, stale/concurrent updates, inventory reset and retired reactivation are denied; explicit transitions/capacity changes preserve consumed inventory and append client-denied immutable revisions.
- Limitations: no Production deploy, graphical catalog administration or real-partner acceptance was performed.
- Acceptance: VERIFIED

## WFN-EV-016
- Related: WFN-PARTNER-CATALOG-ADMIN-READ-BASELINE / PR #398
- Date: 2026-09-03
- Target: administrative partner catalog projection
- Type: exact-head CI plus emulator authorization/pagination/privacy evidence
- Reference: PR #398 head `a3a0e1b8ddc8644d5be297613eb36807f6744fd9`; Build #1226, Container #211, Database #203, Beta 1 Emulator #187 and Project Memory gates.
- Result: admin-only pages are capped at 100, cursor-stable and contain current lifecycle/revision/inventory facts without audit actor identifiers or raw revision documents.
- Limitations: no graphical administration, Production deployment or real-partner acceptance was performed.
- Acceptance: VERIFIED

## WFN-EV-017
- Related: WFN-PARTNER-CATALOG-REVISION-READ-BASELINE / PR #399
- Date: 2026-09-04
- Target: explicit administrative partner-offer revision audit
- Type: exact-head CI plus emulator authorization/pagination/isolation evidence
- Reference: PR #399 head `325f5016d857712ae6e3dcb2c8a063cf1d5b61b6`; Build #1230, Container #215, Database #207, Beta 1 Emulator #190 and Project Memory gates.
- Result: admin-only revision pages are offer-scoped, capped at 100 and cursor-stable; non-admin, cross-offer cursor and missing-offer requests fail closed while ordinary catalog reads remain privacy-minimal.
- Limitations: no graphical administration, Production deployment or real-partner acceptance was performed.
- Acceptance: VERIFIED

## WFN-EV-018
- Related: WFN-CI-INSTALL-RESILIENCE-BASELINE / PR #400
- Date: 2026-09-04
- Target: cache-preferred lockfile-exact CI dependency installation
- Type: exact-head workflow/configuration evidence
- Reference: PR #400 head `e5ade2893c505a6c61206001129bf31cbc45df4d`; Build #1233, Container #218, Database #210, Beta 1 Emulator #192 and Project Memory gates.
- Result: all required checks passed with cache-preferred root and Functions `npm ci` commands and without dependency, lockfile, trigger or runtime changes.
- Limitations: no Production deployment was run and external package-registry availability cannot be guaranteed by repository configuration.
- Acceptance: VERIFIED
