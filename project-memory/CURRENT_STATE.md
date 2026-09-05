# WellFit-now Current State

Last reconciled: 2026-09-06

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
- Task: `WFN-RUDI-3D-001` under graphical authority `WFG-RUDI-WORLD-001` / `WFG-CR-008`.
- Physical implementation remains in this repository only because the current landing runtime has not yet migrated under `WF-MIG-001`.
- Merged DOM-world baseline: PR #401 exact head `54186ec16a617549acbaa0437b0b81ab36ee2abb` passed Build #1285, Container #270, Database #262, Beta Emulator #241 and Project Memory Guard/Quality/Status, then squash-merged as `9ae4f278a90d17d612f0399c40babd32c344e02b`.
- `F` in `WellFit` is the initial climb/podium. Explicit narrow letters and thin lines/ledges remain valid surfaces; random tiny generic DOM fragments are rejected.
- Runtime footing, climb edges, offscreen detection, catch-up route geometry and autonomous surface-to-surface journey geometry share `app/components/landing/rudiWorldGeometry.mjs`.
- Rudi is intentionally not viewport-clamped. His bound element may scroll completely out of view. Catch-up begins only after the surface is fully offscreen and scrolling settles.
- Catch-up and autonomous moves are physically staged: horizontal walk segment, visible guide, vertical climb segment, then walk onto the target surface. Imported Hips translation is flattened so DOM-route geometry, not clip root motion, owns locomotion.
- CTA attention changes gaze/body response without relocating Rudi through empty space and is cleared on scroll so an offscreen CTA cannot trap the avatar in an attention state.
- Lifecycle hardening in the merged baseline includes Strict-Effects-safe animation restart, one cancellable completion-timer authority and model-ready initial-climb timing.
- Accessibility/performance in the merged baseline: below desktop the 3D world is not mounted; `prefers-reduced-motion: reduce` uses a static DOM-bound fallback; module-level GLTF preloads are absent; Canvas pointer events are disabled; GLTF/Canvas failures are contained by a fallback boundary.
- Layering: foreground remains below the sticky header and background/peek state is rendered below normal landing content. The older chapter-based prop/performance controller was deliberately removed; coffee/table/lounge scenes are not part of the active runtime claim and may be reintroduced later only on top of an accepted physical-world model.
- Manual Meshy tooling is hardened: reviewed run IDs are workflow inputs, direct default-branch materialization is rejected, materialized assets receive Rudi/lint/type/build validation before bot push, and partial paid living-action artifacts upload even if a later generation step fails.
- Machine validation is integrated into `npm run rudi:validate`, including deterministic geometry tests and source invariants for scroll-follow, narrow letters, thin ledges, full-offscreen thresholds, walk/climb route sampling, reachability, reduced-motion fallback, model-ready entrance timing, timer cancellation, Strict-Effects replay and root-motion ownership.
- Bounded pre-Site hardening is active in PR #402 under `XLOCK-WF-RUDI-FALLBACK-20260906`. Static audit of the merged controller found two pre-sync defects that can be proven without changing the DOM-world design: (1) error-boundary/static/reduced-motion transitions could leave an already scheduled WebGL journey completion alive behind the static fallback; (2) the active controller fetched five animation clips (`run`, `alert`, `point`, `jump`, `sit`) that it never selected.
- PR #402 correction: all non-WebGL presentation transitions cancel the shared motion timer, discard unfinished journeys, clear CTA attention and settle the current DOM anchor; WebGL/GLTF failure notifies the parent controller and enters the same static mode; route guides exist only in WebGL mode; the fallback stays hidden until a real anchor exists; initial runtime loading is limited to `walk`, `idle`, `inspect`, `celebrate` and `climb`. Optional unused GLB assets remain materialized for later separately scoped living scenes.
- PR #402 is not yet acceptance evidence until exact-head required CI passes. The public `wellfit-bewegt` ChatGPT Site is not modified by this PR and still requires exact-source synchronization plus real-WebGL owner/device visual acceptance.

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
- Do not reintroduce the superseded viewport-lag/viewport-clamp Rudi model or the deleted parallel `LivingRudi3D` controller.
- Do not claim the public ChatGPT Site changed merely because repository Rudi code or WellFit coordination is green.

## Exact next safe technical work
- Selected local action: `WFN-CI-INSTALL-RESILIENCE-BASELINE`
1. preserve lockfile-exact dependency installation;
2. reduce avoidable registry/audit/funding requests in required workflows;
3. prove every required exact-head gate still runs and passes;
4. keep runtime, graphical/UI, deployment and product semantics unchanged.

The owner-directed Rudi bridge is a separately registered cross-repository graphical task and does not replace the technical repository's local next-action ordering.