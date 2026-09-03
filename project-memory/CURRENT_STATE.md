# WellFit-now Current State

Last reconciled: 2026-09-03

## Project role
WellFit-now is the **technical WellFit repository**. It owns web/backend, authentication, data, APIs, mission/economy/server authority, security/runtime and general technical application/mobile logic. `Bernds-tech/WellFit` owns the graphical/UI/landing domain. `Bernds-tech/WellFit-Buddy` owns Buddy behavior, Buddy presentation/animation and Buddy-specific AR/camera interaction. Cross-repository bridge work requires an explicit contract/task ID.

## Canonical execution context
- Repository `AGENTS.md` remains mandatory.
- For runtime/roadmap work, use `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md` plus the protected Beta-1 canonical truth files identified by `AGENTS.md` and current code/tests.
- Do not restart or rewrite the app; extend the existing baseline.

## Current technical finishline
- Closed-Beta authentication/session hardening is merged: age >=16, email verification, onboarding/account-status gating, server-managed HttpOnly sessions, revocation and device-session management.
- Auth/consent is repository-VERIFIED: health personalization, health improvement and analytics decisions are separate, optional and versioned; withdrawal writes a revocation history and removes stored private health fields. Legal and Production acceptance remain external.
- Account/privacy is repository-VERIFIED: export, deletion request/cancellation, session revocation, guardian blocking and the irreversible deletion processor exist with emulator tests. Production scheduling/retention/legal acceptance remain external.
- Backend runtime and server-authoritative mission/reward foundations are repository-verified, not Production-confirmed.
- Legacy `users/{uid}` client authority is repository-closed: current rules deny create/update/delete, the browser only reads the owner projection and server onboarding/settings functions own writes. Production rules deployment remains separately evidenced.
- WFXP runtime terminology versus canonical WFP + separate XP requires an explicit owner-reviewed migration; no silent rename/conversion is allowed.
- Physical ownership drift remains: graphical/UI code and Unity Buddy AR code still exist in this repository even though their domain authorities are WellFit and WellFit-Buddy respectively.

## Stale PR posture
- PR #376 is superseded by the merged later Project Memory chain but contains V5 reconciliation history that must be retained in current registers before closure.
- PR #365 is superseded by Project Rail/V9 coordination.
- PR #363 is an older runtime-truth audit whose relevant findings have been superseded by later runtime/memory baselines; preserve history, do not merge the stale branch.
- PR #263 is superseded because `scripts/admin/set-owner-claim.mjs` already exists on current main.
- PR #13 is a stale Unity upload branch; the Unity project is already physically present in current main and must not be merged as a shortcut.
- PR #364 remains a deferred owner-reviewed future WFT canonical change; it is not current Beta-1 runtime authority and must not be merged automatically.

## Do not repeat by default
- Do not create a parallel UI shell or parallel architecture.
- Do not merge old Unity PR #13 as a shortcut.
- Do not infer WFP/WFXP/XP equivalence without the dedicated owner-reviewed migration decision.
- Do not move token/NFT/trading/payment authority into clients.
- Do not move general technical mobile/application logic into WellFit-Buddy merely because Buddy-specific AR belongs there.

## Exact next safe technical work
- Selected local action: `WFN-PARTNER-OPERATIONS-REPORTING-BASELINE`
1. add an admin-only bounded aggregate operations summary;
2. report partner/redemption/outcome state without raw proofs or token hashes;
3. expose scan truncation/freshness and prove privacy-minimal responses;
4. preserve graphical/UI and Buddy repository boundaries; no cross-repo assembly in this task.
