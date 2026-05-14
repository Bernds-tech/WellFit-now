# WellFit Visual Regression and Screenshot Checks

Status: active / optional QA plan  
Updated: 2026-05-14  
Leading register: `project-register/visual-regression.json`  
Related files: `project-register/routes.json`, `scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs`, `scripts/wellfit-dev-agent/src/quality-gate.mjs`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`

## Purpose

This document defines the safe WellFit visual regression and screenshot check plan for future Codex/AI agents. The goal is to help agents validate important WellFit routes before and after UI changes without changing product logic, creating a parallel test architecture, or making the main build flaky when browser support is unavailable.

The machine-readable source of truth is `project-register/visual-regression.json`. This document explains how agents should use that register and the optional `visual-route-smoke-check.mjs` helper.

## Scope

Allowed scope:

- Validate that routes configured for visual checks are already present in `project-register/routes.json`.
- Optionally take local screenshots for selected public and mobile beta-preview pages when a browser runner and local preview URL are available.
- Document protected-route auth blockers instead of using real credentials or capturing private data.
- Write generated reports and screenshots only under `scripts/wellfit-dev-agent/output/`, which is ignored by Git.
- Integrate with `npm run agent:quality-gate` only in report-only mode.

Out of scope:

- Product logic changes.
- Mandatory browser checks in CI or the main build.
- New route, shell, design-system, or app architecture.
- Token, NFT, wallet, payment, betting, reward authority, health, child, location, privacy, legal, compliance, or Unity changes.
- Real user data, real credentials, production sessions, or sensitive screenshots.

## Route groups

`project-register/visual-regression.json` groups routes into:

1. **Public core** — public landing, registration, legal, FAQ, and help pages that can be validated without credentials.
2. **Mobile beta preview** — mobile beta-preview routes that should preserve the current mobile UX and beta-safe wording.
3. **Protected app preview** — dashboard, mission, buddy, settings, and other app routes that need an approved test-user/session plan or a documented auth blocker before full screenshot approval.

Every route in the visual register must also exist in `project-register/routes.json`. The checker fails on register drift in strict mode and reports it without failing in report-only mode.

## Viewports

The visual register currently defines two standard viewports:

- Desktop: `1440x900`.
- Mobile standard: `390x844` with mobile emulation metadata.

Future agents may add more viewports only through `project-register/visual-regression.json` and this document, not by creating a second screenshot plan.

## Browser availability and non-blocking behavior

Browser execution is optional. The checker looks for supported browser runners (`@playwright/test` or `playwright`) and never installs them automatically.

Expected non-blocking results:

- `SKIPPED_BROWSER_UNAVAILABLE` — no supported browser runner is installed or browser launch fails because the environment lacks browser binaries.
- `SKIPPED_BASE_URL_UNAVAILABLE` — browser support exists, but no reachable preview URL was provided.

Both skip states are environment-safe and should exit `0` after route-register validation passes. The quality gate runs the checker with `--report-only`, so browser availability cannot make the main agent gate flaky.

## How to run

Route-register validation and optional browser smoke check:

```bash
node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs
```

Report-only mode used by the quality gate:

```bash
node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs --report-only
```

Optional browser run against a local preview:

```bash
WELLFIT_VISUAL_BASE_URL=http://127.0.0.1:3000 node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs
```

The script writes its Markdown report to `scripts/wellfit-dev-agent/output/visual-route-smoke-check.md`. If screenshots are created, they go under `scripts/wellfit-dev-agent/output/visual-route-smoke-check/` and must not be committed.

## Screenshot requirement rules

Screenshots are required for perceptible UI changes when the environment supports them and the affected routes are accessible safely. Agents should capture or document screenshots for:

- Landing, registration, help, legal, app shell, navigation, footer, dashboard, mission, buddy, and settings UI changes.
- Mobile beta-preview flows and mobile navigation changes.
- Route layout changes that may affect responsive rendering.

If a protected route needs auth, agents must use an approved test account or seeded demo state. If that is unavailable, document the blocker in the PR instead of using real credentials or sensitive data.

## Artifact policy

Generated screenshots, traces, videos, and browser caches are local QA artifacts only. They belong under `scripts/wellfit-dev-agent/output/`, which is ignored by Git. Do not commit generated browser artifacts unless a maintainer explicitly requests a curated static evidence file in a future task.

## Quality gate integration

`npm run agent:quality-gate` runs `visual-route-smoke-check.mjs --report-only` as an optional step. The quality gate accepts the checker when it reports any of these outcomes:

- `PASS`
- `PASS_WITH_WARNINGS`
- `SKIPPED_BROWSER_UNAVAILABLE`
- `SKIPPED_BASE_URL_UNAVAILABLE`
- `REPORT_ONLY`

This keeps visual validation visible to future agents while preserving non-flaky CI/build behavior.

## Risks and guardrails

- Do not use this plan to bypass auth, capture private data, or validate compliance-sensitive flows with real data.
- Do not add mandatory browser dependencies or browser installation steps to the main build from this plan.
- Do not modify product logic while responding to visual-regression findings unless a separate scoped task explicitly permits it.
- Do not create duplicate architecture; extend this document, `project-register/visual-regression.json`, and existing wellfit-dev-agent scripts only.

## Next recommended hardening task

When a maintainer approves browser tooling, add a small optional package script and documented local preview command that still remains non-blocking in CI unless an explicit visual-review job is created.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/routes.json`, `project-register/visual-regression.json`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json` und diese Datei. Fuehre danach `node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs` oder im Quality-Gate-Kontext `node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs --report-only` aus. Bearbeite nur die bestehende Visual-Regression-Registry, Work Map, TODO-Index oder wellfit-dev-agent Checks; erstelle keine Parallelarchitektur, installiere keine Browser automatisch, committe keine Screenshot-Artefakte und aendere keine Produktlogik oder geschuetzten Compliance-/Reward-/Health-/Privacy-/Unity-Bereiche.
