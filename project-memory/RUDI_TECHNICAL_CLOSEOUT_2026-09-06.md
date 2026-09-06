# Rudi Technical Closeout Receipt — 2026-09-06

Append-only closeout supplement for `RECEIPT-WFN-RUDI-3D-20260905`. The older receipt remains preserved as historical evidence of the superseded viewport/Site-v105 generation; this file records the later DOM-world and fallback-hardening completion without rewriting that history.

## RECEIPT-WFN-RUDI-3D-CLOSEOUT-20260906
- Task: `WFN-RUDI-3D-001` / `WFG-RUDI-WORLD-001`
- Risk: R2 reversible landing presentation bridge.
- Started from: historical PR #401 work plus owner-authority `WFG-CR-008` that superseded viewport clamping and the old props/renderer acceptance path.
- Preflight checked: WellFit-now `AGENTS.md`, mandatory local Project Memory, WellFit V9 master/contracts/dependencies/locks, live WellFit-now/WellFit/WellFit-Buddy main tips, prior Rudi/Puppet attempts and the current `RUDI_SITE_SYNC_MANIFEST.json`.
- DOM-world implementation: PR #401 exact head `54186ec16a617549acbaa0437b0b81ab36ee2abb` passed Build #1285, Container #270, Database #262, Beta Emulator #241 and Project Memory Guard/Quality/Status, then squash-merged as `9ae4f278a90d17d612f0399c40babd32c344e02b`.
- DOM-world result: one active `LivingRudiWorld`; F podium; real DOM surfaces including narrow letters/thin ledges; no viewport clamp; complete offscreen departure with bound surface; catch-up only after full offscreen + scroll settle; visible grounded walk/climb routes; DOM-owned locomotion; CTA gaze without relocation; foreground/background layering; old `LivingRudi3D.tsx` viewport/chapter controller deleted.
- Pre-Site hardening: PR #402 exact head `23318cdf395bd25e46f1b2a31499f14cc8afd51d` passed Build #1288, Container #273, Database #265 and Project Memory Guard #116 / Quality #123 / Status #131, then squash-merged as `b07d39938aeab4e32eddac7d19b8e15e22afacb7`.
- Hardening result: leaving WebGL cancels pending motion/journey timers and CTA attention; GLTF/Canvas failure enters controller-level static mode; route guides are WebGL-only; fallback waits for a real anchor; initial WebGL loading is limited to `walk`, `idle`, `inspect`, `celebrate`, `climb`. Beta Emulator correctly did not trigger because PR #402 changed only landing Rudi runtime/validator plus Project Memory and did not match the workflow's Firebase/mission/package path filters.
- Negative countercheck: no backend/auth/data/mission/reward/economy/location/camera/legal/native-Buddy authority changed; no public ChatGPT Site publication is inferred from either merge.
- Superseded follow-up: Site v105, viewport-safe body clamping, coffee/table/lounge scenes, finger-rig work and optional custom living-action generation are not current technical acceptance criteria. They require a new owner-approved scope after the DOM-world Site version is visually accepted.
- External acceptance boundary: WellFit `project-memory/RUDI_SITE_SYNC_MANIFEST.json` pins hardened source `b07d39938aeab4e32eddac7d19b8e15e22afacb7` and owns exact `wellfit-bewegt` synchronization plus ten fail-closed visual checks. Those Site checks are not WellFit-now technical completion gates.
- Technical result status: `VERIFIED` for WellFit-now repository implementation; public-Site delivery/visual acceptance remains `IMPLEMENTED_NOT_VERIFIED` under WellFit graphical authority.
- Work lock: `LOCK-WFN-RUDI-3D-001` RELEASED for technical implementation. Do not resume by default.
- Falsification question: a unique defect reproducible on hardened WellFit-now source `b07d399...`, or a newer owner-approved technical Rudi architecture, would require a fresh scoped task/lock. A failure found only during exact Site visual acceptance is first routed through WellFit graphical authority before any technical mutation.
