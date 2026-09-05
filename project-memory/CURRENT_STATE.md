# WellFit-now Current State

Last reconciled: 2026-09-05

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

## Active graphical bridge: DOM-bound living Rudi
- Task: `WFN-RUDI-3D-001` under graphical authority `WFG-RUDI-WORLD-001` / `WFG-CR-008`; cross-repo coordination is tracked in `Bernds-tech/WellFit` PR #29.
- Physical implementation remains in this repository only because the current landing runtime has not yet migrated under `WF-MIG-001`.
- Runtime implementation baseline `e19d15f3bbe51740d53d954dcb7777623d8cf3e6` replaces viewport-following mascot behavior with a DOM-surface world model. Subsequent commits on PR #401 reconcile Project Memory only and do not change this runtime baseline.
- `F` in `WellFit` is the initial climb/podium. Explicit narrow letters and thin lines/ledges remain valid surfaces; random tiny generic DOM fragments are rejected.
- Runtime footing, climb edges, offscreen detection, catch-up route geometry and autonomous surface-to-surface journey geometry share `app/components/landing/rudiWorldGeometry.mjs`.
- Rudi is intentionally not viewport-clamped. His bound element may scroll completely out of view. Catch-up begins only after the surface is fully offscreen and scrolling settles.
- Catch-up and autonomous moves are physically staged: horizontal walk segment, visible guide, vertical climb segment, then walk onto the target surface. No intentional hovering, free-flight or visible teleport path is part of the target model.
- CTA attention changes gaze/body response without relocating Rudi through empty space.
- Machine validation is integrated into `npm run rudi:validate`, including deterministic geometry tests for scroll-follow, narrow letters, thin ledges, full-offscreen thresholds, walk/climb route sampling, reachability and directional catch-up.
- Runtime baseline `e19d15f3bbe51740d53d954dcb7777623d8cf3e6` passed Build #1275, Container Build #260, Database Package Tests #252, Beta 1 Emulator Tests #231 and Project Memory Guard/Quality/Status. The current PR head must also be green before merge because Project Memory is part of the required exact-head evidence.
- Acceptance boundary: repository CI verifies code/invariants, not the separately hosted public `wellfit-bewegt` ChatGPT Site. That Site is not claimed synchronized to this exact DOM-bound implementation and still requires exact-source sync plus real-WebGL owner/device visual acceptance.

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
- Do not reintroduce the superseded viewport-lag/viewport-clamp Rudi model as the target behavior.
- Do not claim the public ChatGPT Site changed merely because PR #401 or WellFit coordination is green.

## Exact next safe technical work
- Selected local action: `WFN-CI-INSTALL-RESILIENCE-BASELINE`
1. preserve lockfile-exact dependency installation;
2. reduce avoidable registry/audit/funding requests in required workflows;
3. prove every required exact-head gate still runs and passes;
4. keep runtime, graphical/UI, deployment and product semantics unchanged.

The owner-directed Rudi bridge is a separately registered cross-repository graphical task and does not replace the technical repository's local next-action ordering.