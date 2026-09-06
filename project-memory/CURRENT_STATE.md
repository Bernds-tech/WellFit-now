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
- Task: `WFN-RUDI-3D-001` under graphical authority `WFG-RUDI-WORLD-001` / `WFG-CR-008`. The remaining release step is owned by WellFit graphical/Sites coordination, not by a second technical Rudi implementation.
- Physical implementation remains in this repository only because the current landing runtime has not yet migrated under `WF-MIG-001`.
- DOM-world foundation: PR #401 exact head `54186ec16a617549acbaa0437b0b81ab36ee2abb` passed Build #1285, Container #270, Database #262, Beta Emulator #241 and Project Memory Guard/Quality/Status, then squash-merged as immutable baseline `9ae4f278a90d17d612f0399c40babd32c344e02b`.
- Pre-Site fallback hardening: PR #402 exact head `23318cdf395bd25e46f1b2a31499f14cc8afd51d` passed Build #1288, Container #273, Database #265 and Project Memory Guard #116 / Quality #123 / Status #131, then squash-merged as immutable hardened source `b07d39938aeab4e32eddac7d19b8e15e22afacb7`. Beta Emulator did not trigger because the workflow is path-filtered to Firebase/mission/package scopes and PR #402 changed only landing Rudi runtime/validator plus Project Memory.
- `F` in `WellFit` is the initial climb/podium. Explicit narrow letters and thin lines/ledges remain valid surfaces; random tiny generic DOM fragments are rejected.
- Runtime footing, climb edges, offscreen detection, catch-up route geometry and autonomous surface-to-surface journey geometry share `app/components/landing/rudiWorldGeometry.mjs`.
- Rudi is intentionally not viewport-clamped. His bound element may scroll completely out of view. Catch-up begins only after the surface is fully offscreen and scrolling settles.
- Catch-up and autonomous moves are physically staged: horizontal walk segment, visible guide, vertical climb segment, then walk onto the target surface. Imported Hips translation is flattened so DOM-route geometry, not clip root motion, owns locomotion.
- CTA attention changes gaze/body response without relocating Rudi through empty space and is cleared on scroll so an offscreen CTA cannot trap the avatar in an attention state.
- Lifecycle/accessibility hardening: Strict-Effects-safe animation restart, one cancellable completion-timer authority, model-ready initial climb, no 3D mount below desktop, Canvas pointer pass-through and static DOM-bound fallback for reduced motion or WebGL failure.
- PR #402 additionally makes every transition out of WebGL cancel pending motion/journeys and CTA attention, propagates GLTF/Canvas failure into controller-level static mode, mounts route guides only while WebGL motion is active and keeps the static fallback hidden until a real DOM anchor exists.
- Initial WebGL loading now fetches only the five clips the active controller can select: `walk`, `idle`, `inspect`, `celebrate`, `climb`. Optional `run`, `alert`, `point`, `jump` and `sit` assets remain materialized for future separately scoped living scenes but are not charged to the initial active controller.
- Layering: foreground remains below the sticky header and background/peek state is rendered below normal landing content. The older chapter-based `LivingRudi3D.tsx` controller is deleted. Coffee/table/lounge scenes from that removed controller are **not** part of the active runtime claim and must not be used as the next technical step.
- Manual Meshy tooling remains branch-safe, parameterized and self-validating; partial paid living-action artifacts are preserved on later generation failure.
- Machine validation is integrated into `npm run rudi:validate`, including deterministic geometry and source invariants for DOM footing, offscreen/catch-up behavior, grounded journeys, reduced-motion/static lifecycle, error fallback and active-clip loading.
- Public-Site boundary: GitHub merges do not update the separately hosted `wellfit-bewegt` ChatGPT Site. WellFit `project-memory/RUDI_SITE_SYNC_MANIFEST.json` is the transfer authority and is pinned to hardened source `b07d39938aeab4e32eddac7d19b8e15e22afacb7`. Site version 105 is historical older-renderer evidence only.
- Exact next Rudi step: none in WellFit-now runtime. The next unproven action is to synchronize the hardened source into the exact editable Site and run the ten graphical real-WebGL acceptance checks under WellFit authority.

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
- Do not resume coffee/table/lounge props or custom living-action generation as if they were the current accepted Rudi runtime.
- Do not claim the public ChatGPT Site changed merely because repository Rudi code or WellFit coordination is green.

## Exact next safe technical work
- Selected local action remains `WFN-CI-INSTALL-RESILIENCE-BASELINE` as historical completed technical ordering; subsequent technical planning must revalidate `NEXT_BEST_ACTION.md` against live main before starting a new product slice.
- The owner-directed Rudi bridge is technically complete in this repository. Its remaining Site synchronization/visual acceptance belongs to WellFit graphical authority.
