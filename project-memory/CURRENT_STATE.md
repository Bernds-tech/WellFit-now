# WellFit-now Current State

Last initialized: 2026-08-19

## Project role
WellFit-now is the technical web/backend product repository. Visual/landing work belongs in `Bernds-tech/WellFit`; native AR/buddy/mobile work belongs in `Bernds-tech/WellFit-Buddy` unless an explicit bridge task is accepted.

## Canonical execution context
- Repository `AGENTS.md` remains mandatory.
- For runtime/roadmap work, use `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md` plus the protected Beta-1 canonical truth files identified by `AGENTS.md`.
- Do not restart or rewrite the app; extend the existing baseline.

## Current execution themes
- Registration/consent hardening and remaining legacy writer migration.
- Account lifecycle/device session/privacy controls.
- Backend readiness and server-authoritative reward/mission boundaries.
- Keep Unity AR isolated from web beta work unless explicitly bridged.

## Do not repeat by default
- Do not create a parallel UI shell or parallel architecture.
- Do not merge old Unity PR #13 as a shortcut.
- Do not infer WFP/WFXP/XP equivalence without the dedicated owner-reviewed migration decision.
- Do not move token/NFT/trading/payment authority into the client.

Before changing this file, verify current `main`, tests and the runtime-state document.