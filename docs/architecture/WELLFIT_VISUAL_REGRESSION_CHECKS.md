# WellFit Visual Regression and Screenshot Checks

Status: active / optional QA plan
Updated: 2026-05-15
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



## Mobile/PWA device visual smoke plan

The mobile/PWA device plan extends visual smoke expectations without turning them into strict pixel tests. It covers the existing routes `/mobile`, `/mobile/missionen`, `/mobile/missionen/squat`, `/mobile/buddy`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/einstellungen`, and `/mobile/ar` on these manual targets:

- Android Chrome: `device_test_required` for QR/install dialog, PWA install affordance, camera permission acceptance/denial, MediaPipe pose/face loading, DeviceMotion, WebGL/3D Flammi, reload/offline smoke, and mobile navigation.
- Samsung Internet: `device_test_required` for the same checks plus Samsung-specific install wording, camera/canvas overlay, and WebGL stability.
- iPhone Safari: `device_test_required` for Add-to-Home-Screen guidance, camera permission, MediaPipe fallback, iOS DeviceMotion permission/limitations, WebGL/3D Flammi, and navigation/reload behavior.
- Desktop responsive browser: `device_test_required` for a mobile viewport smoke of route reachability, scrollability, QR/install-dialog copy, and fallback states.

Route expectations stay smoke/tolerant:

- `/mobile` and `/mobile/einstellungen`: verify install/QR guidance, mobile shell, bottom navigation, privacy/beta wording, and absence of token/NFT/wallet/payment/trading/payout behavior.
- `/mobile/missionen` and `/mobile/missionen/squat`: verify mission navigation, camera acceptance/denial, HUD visibility, timers/countdown, stop/complete controls, pose/skeleton fallback, and that camera/pose/motion/AR signals are not final reward or mission-completion authority.
- `/mobile/buddy`: verify buddy status and touch/scroll states without strict avatar-frame matching.
- `/mobile/analyse`: verify MediaPipe pose/face loading, camera denied/accepted states, local/ephemeral-data expectations, and fallback messaging; unclear device behavior is `review_required`.
- `/mobile/bewegung`: verify DeviceMotion permission, weak-context/HTTPS limitations, sensor unavailable/denied states, and no raw-motion persistence or reward authority.
- `/mobile/ar`: verify camera/WebGL canvas layering, 3D Flammi load/fallback, tap/call/move controls, and performance symptoms such as FPS, battery, and heat as `device_test_required` observations only.

Screenshots from these routes are QA evidence only. Do not require strict pixel matching for AR/canvas, camera previews, avatar/buddy animation, mission timers, pose skeletons, or dynamic beta state. If browser support, real devices, HTTPS, permissions, camera, motion sensors, or WebGL are unavailable, record the limitation as `SKIPPED_BROWSER_UNAVAILABLE`, `device_test_required`, or `review_required` instead of changing runtime code.

Safety boundaries for mobile screenshots and device notes:

- Do not capture or commit real user data, raw images/video, face templates, biometric data, health/watch data, precise location, raw motion/sensor streams, wallet/payment state, or final reward-authority evidence.
- Do not activate token, NFT, wallet, payment, trading, payout, marketplace, production tracking, new consent fields, service-worker behavior, or reward/mission authority while performing visual/device checks.
- Keep generated screenshots, videos, traces, and notes out of source control unless a maintainer explicitly approves a curated non-sensitive artifact in a separate task.

## Optional screenshot comparison modes

Pixel matching means comparing a newly captured **current** screenshot with an approved **baseline** screenshot and measuring how many rendered pixels differ. It is useful for catching unintended layout, spacing, color, typography, and responsive breakage that route-smoke checks may miss, but it can be noisy when fonts, animations, timestamps, browser binaries, seeded data, or device rendering are not deterministic.

WellFit therefore starts from safe, non-blocking modes in `project-register/visual-regression.json`:

- `off` — no screenshot comparison is expected for that route. This is the default for protected app-preview routes until an approved test-user/session plan and seeded demo data exist.
- `smoke` — route registration and optional screenshot capture only. Missing baselines do not fail checks.
- `tolerant` — future baseline/current comparison may allow a small `pixelThreshold` and `maxDiffRatio`, plus narrow route-scoped ignored dynamic areas. This mode is still optional/report-only unless a maintainer creates a dedicated visual-review job.
- `strict` — future exact or near-exact comparison for deterministic pages only. Strict mode must not be added to the main build or quality gate without explicit maintainer approval.

The checker currently performs report-only readiness detection: if generated current screenshots and matching baseline filenames are both present in ignored agent output paths, it reports `VISUAL_COMPARISON_READY`; if current screenshots exist but baselines do not, it reports `VISUAL_BASELINE_MISSING`. Missing baselines are expected during this preparation phase and must not fail CI, `npm run build`, or `npm run agent:quality-gate`.

## Why smoke/tolerant first

WellFit uses smoke and tolerant comparison before strict matching because the app includes dynamic marketing surfaces, mobile beta previews, avatar/buddy interactions, mission progress widgets, and future AR/canvas experiences. These can legitimately vary between browser versions, animation frames, local preview data, and test environments. A tolerant path lets agents collect evidence and identify whether comparison would be possible without turning visual QA into a flaky blocker.

Strict pixel matching is allowed only when all of the following are true:

- The route is public or uses an approved non-sensitive seeded demo session.
- The page has deterministic content, fonts, viewport, reduced animation, and stable data.
- Baseline screenshots were reviewed in a dedicated small PR or review artifact.
- Dynamic areas are either absent or documented with narrow route-scoped masks in `ignoredDynamicAreas`.
- The check remains outside the main build unless a maintainer explicitly creates and approves a separate visual-review CI job.

Dynamic AR, avatar/buddy, and mission pages should not use strict matching yet. AR/canvas previews, avatar idle frames, mission progress, timers, and demo state can change without product regressions; strict pixel checks on those pages would create false failures and could pressure agents to hide important dynamic UI or compliance-sensitive content. Keep these routes `smoke` or carefully `tolerant` until deterministic fixtures and masks are approved.

## Browser availability and non-blocking behavior

Browser execution is optional. The checker looks for supported browser runners (`@playwright/test` or `playwright`) and never installs them automatically.

Expected non-blocking results:

- `SKIPPED_BROWSER_UNAVAILABLE` — no supported browser runner is installed or browser launch fails because the environment lacks browser binaries.
- `SKIPPED_BASE_URL_UNAVAILABLE` — browser support exists, but no reachable preview URL was provided.
- `VISUAL_COMPARISON_READY` — current and baseline screenshots with matching filenames exist, so a future optional comparison could run.
- `VISUAL_BASELINE_MISSING` — current screenshots exist, but matching baseline screenshots are missing; this is report-only and non-failing.

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
- `VISUAL_COMPARISON_READY` / `VISUAL_BASELINE_MISSING` as report markers, not build-blocking result states

This keeps visual validation visible to future agents while preserving non-flaky CI/build behavior.

## Risks and guardrails

- Do not use this plan to bypass auth, capture private data, or validate compliance-sensitive flows with real data.
- Do not add mandatory browser dependencies or browser installation steps to the main build from this plan.
- Do not modify product logic while responding to visual-regression findings unless a separate scoped task explicitly permits it.
- Do not create duplicate architecture; extend this document, `project-register/visual-regression.json`, and existing wellfit-dev-agent scripts only.

## Next recommended hardening task

When a maintainer approves browser tooling, add a small optional package script and documented local preview command that still remains non-blocking in CI unless an explicit visual-review job is created. After that, propose a tiny reviewed baseline set for deterministic public routes only; keep mobile AR/avatar/mission pages smoke or tolerant until masks and seeded fixtures are approved.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/routes.json`, `project-register/visual-regression.json`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json` und diese Datei. Fuehre danach `node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs` oder im Quality-Gate-Kontext `node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs --report-only` aus. Bearbeite nur die bestehende Visual-Regression-Registry, Work Map, TODO-Index oder wellfit-dev-agent Checks; erstelle keine Parallelarchitektur, installiere keine Browser automatisch, committe keine Screenshot-Artefakte und aendere keine Produktlogik oder geschuetzten Compliance-/Reward-/Health-/Privacy-/Unity-Bereiche.
