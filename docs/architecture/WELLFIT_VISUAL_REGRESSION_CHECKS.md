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


## Manual Mobile/PWA tester checklist handoff

Status: `device_test_required` until a human tester reports real device results. This is a human handoff derived from the existing Mobile/PWA evidence template; it does not authorize runtime fixes, tracking, service-worker changes, permission-flow changes, reward/mission authority, deployment, auto-merge, or auto-repair.

### 1. Start here

1. Get the preview URL/build reference from the maintainer. Use this placeholder until supplied: `PREVIEW_URL_OR_LOCAL_HTTPS_TUNNEL`.
2. Open the same URL on each target browser/device below. Use HTTPS whenever camera or motion permissions are being tested; if HTTPS or a real device is unavailable, mark the affected rows `blocked` or `device_test_required`.
3. Test only the existing routes listed in this handoff. Do not create accounts with personal data, do not use real health/location/wallet/payment information, and do not change app settings beyond normal permission prompts.
4. Keep every untested or uncertain row as `device_test_required`; use `review_required` for unclear privacy, permission, WebGL, camera, pose/face, motion, or authority behavior.

### 2. Device/browser matrix

| Target | Minimum evidence to collect | Starting status |
|---|---|---|
| Android Chrome | Android model/version, Chrome version, URL mode, QR/PWA install affordance, camera accepted/denied, MediaPipe pose/face, DeviceMotion, WebGL/3D Flammi, navigation/scroll, reload/offline smoke. | `device_test_required` |
| Samsung Internet | Samsung model, One UI/browser versions, Samsung install wording/path, camera/canvas overlay, MediaPipe pose/face, DeviceMotion, WebGL stability, navigation/scroll. | `device_test_required` |
| iPhone Safari | iPhone model, iOS/Safari versions, Add-to-Home-Screen guidance, camera accepted/denied, iOS DeviceMotion prompt/limitations, MediaPipe fallback, WebGL/3D Flammi, navigation/reload/scroll. | `device_test_required` |
| Desktop responsive browser | Browser/version, viewport size near `390x844`, device-toolbar/emulation mode if used, route reachability, scroll/navigation, QR/install-dialog copy, fallback states. | `device_test_required` |

### 3. Route-by-route checklist

Use one row per device/browser/route. Mark untouched routes `device_test_required`.

| Route | Checklist focus | Status to use until tested |
|---|---|---|
| `/mobile` | Page loads, mobile shell/bottom navigation works, QR/install guidance is understandable, responsive scroll works, beta-safe wording is present, no token/NFT/wallet/payment/trading/payout behavior appears. | `device_test_required` |
| `/mobile/missionen` | Mission overview loads, touch targets are usable, bottom navigation works, Squat mission entry is reachable, no device signal is presented as final reward or mission-completion authority. | `device_test_required` |
| `/mobile/missionen/squat` | Camera accept and deny paths, HUD/countdown/timer, stop/finish controls, pose/skeleton fallback, small-screen usability, any logged-out/Firestore-unavailable messaging as observed. | `device_test_required` / `review_required` |
| `/mobile/buddy` | Buddy page loads, status/touch/scroll states are usable, beta wording remains safe, no token/NFT/wallet/reward-authority behavior appears. | `device_test_required` |
| `/mobile/analyse` | Camera accept and deny paths, MediaPipe pose/face loading or fallback, performance symptoms, local/ephemeral-processing expectations, safe non-camera fallback, no raw image/video/face-template storage evidence. | `device_test_required` / `review_required` |
| `/mobile/bewegung` | DeviceMotion permission accept/deny, HTTPS or weak-context limitation, sensor-unavailable fallback, no raw-motion persistence or reward authority. | `device_test_required` / `review_required` |
| `/mobile/einstellungen` | Mobile settings load, install/PWA hints are visible, privacy/beta wording remains safe, no consent expansion or protected-data prompt appears without review. | `device_test_required` |
| `/mobile/ar` | Camera/WebGL test mode, 3D Flammi/canvas load or fallback, camera/canvas layering, tap/call/move/pause controls, WebGL/camera fallback, performance/battery/heat notes, no Unity dependency or AR reward/mission authority. | `device_test_required` / `review_required` |

### 4. Permission checklist

| Permission/surface | Test both paths when possible | Required note | Default status |
|---|---|---|---|
| Camera | Accepted and denied on `/mobile/missionen/squat`, `/mobile/analyse`, `/mobile/ar`. | Browser/OS prompt summary, preview/fallback behavior, no raw media captured or committed. | `device_test_required` |
| Pose/face/MediaPipe | Load and failure/fallback on `/mobile/missionen/squat`, `/mobile/analyse`. | Loading/fallback behavior, visible skeleton/analysis state if any, performance symptoms, no biometric persistence. | `device_test_required` / `review_required` |
| DeviceMotion | Accepted and denied/unavailable on `/mobile/bewegung`. | HTTPS requirement, prompt path, observed safe response, no raw sensor history or reward authority. | `device_test_required` / `review_required` |
| WebGL/3D Flammi | Load and unavailable/fallback on `/mobile/ar`. | Canvas/3D state, camera layering, controls, performance/heat/battery symptoms, no Unity/native dependency. | `device_test_required` / `review_required` |
| PWA install/QR | Browser install/Add-to-Home-Screen path on `/mobile` and `/mobile/einstellungen`. | Prompt/menu wording, installed-PWA mode only if actually tested, no app-store/payment/wallet claims. | `device_test_required` |

### 5. Screenshots, recordings, and privacy boundaries

Capture only non-sensitive QA evidence that helps reproduce layout, install, permission, fallback, navigation, or performance issues. Good evidence: screenshots of generic UI, permission prompt wording summaries, browser/device versions, viewport notes, and links to approved non-sensitive artifacts.

Do **not** record or upload real faces, homes, raw camera/video, face templates, biometric data, health/watch data, precise location, raw sensor streams, real account data, wallet/payment state, child data, secrets, or anything that could imply final reward, payout, anti-cheat, leaderboard, inventory, mission-completion, token, NFT, trading, staking, presale, or marketplace authority.

### 6. Copy/paste tester result format

Paste one block per meaningful finding or per route/device row. Leave unknown fields as `device_test_required`; do not invent outcomes.

```md
Mobile/PWA Manual Test Result
Date: YYYY-MM-DD
Tester:
Preview URL / build reference: PREVIEW_URL_OR_LOCAL_HTTPS_TUNNEL
Device/browser: Android Chrome | Samsung Internet | iPhone Safari | Desktop responsive browser
Device model + OS/browser version:
Route: /mobile | /mobile/missionen | /mobile/missionen/squat | /mobile/buddy | /mobile/analyse | /mobile/bewegung | /mobile/einstellungen | /mobile/ar
Checklist item:
Expected result:
Actual result: device_test_required
Status: device_test_required
Severity: low | medium | high | critical
Screenshot/video evidence reference: placeholder or approved non-sensitive link
Privacy/safety notes: no sensitive face/video/health/location/sensor/wallet/payment/reward evidence captured
Follow-up needed: none | device retest | docs clarification | runtime-fix proposal needing separate approval | privacy/security review
```

### 7. Status, severity, and follow-up rules

- `pass`: observed behavior matches the checklist and no privacy/safety concern was found.
- `fail`: observed behavior does not match the checklist and needs a scoped follow-up.
- `blocked`: the tester could not complete the check because of missing device, browser, HTTPS, preview URL, permission, account/session, or environment setup.
- `device_test_required`: not yet tested on a real target or not enough evidence to decide.
- `review_required`: unclear behavior touching camera, face/pose, motion, location, privacy, safety, protected data, WebGL/AR, reward/mission authority, or compliance boundaries.

Severity guidance: use `low` for copy/usability issues, `medium` for route-specific mobile/PWA breakage with a workaround, `high` for major route/permission/install failures or likely privacy confusion, and `critical` only for suspected sensitive-data exposure, security issues, protected-data expansion, or reward/mission/economy authority activation.

Follow-up reporting: include route, device/browser, exact status, severity, safe artifact link or placeholder, reproduction steps, and whether the next task is docs clarification, device retest, runtime-fix proposal, or privacy/security review. Runtime fixes require a separate scoped task/PR with explicitly allowed files.


## Manual Mobile/PWA device evidence template

Use this template only when a human runs real Mobile/PWA checks on an actual target device or a desktop responsive browser. Codex/cloud agents must leave unknown outcomes as `device_test_required` and must not infer camera, motion, WebGL, PWA-install, performance, privacy, or browser behavior from local builds. Keep evidence references as placeholders or links to approved non-sensitive storage; do not commit raw screenshots/videos that expose people, faces, homes, health data, location, account data, wallet/payment state, or final reward evidence.

Allowed status values for every row: `pass`, `fail`, `blocked`, `device_test_required`, `review_required`.
Allowed severity values: `low`, `medium`, `high`, `critical`. Use `critical` only for safety, privacy, compliance, data exposure, protected-area, reward-authority, or security issues that need immediate human triage.

Copy one row per route/device/browser/permission combination that was actually checked:

| Field | Evidence entry |
|---|---|
| Test date | `YYYY-MM-DD` |
| Tester | `name / role` |
| Device model | `e.g. Pixel 8, Galaxy S24, iPhone 15, desktop model` |
| OS version | `e.g. Android 15, One UI version, iOS 18.x, macOS/Windows/Linux version` |
| Browser/app mode | `Android Chrome / Samsung Internet / iPhone Safari / Desktop responsive browser / installed PWA if applicable` |
| Route tested | `/mobile`, `/mobile/missionen`, `/mobile/missionen/squat`, `/mobile/buddy`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/einstellungen`, or `/mobile/ar` |
| Expected result | `Expected smoke behavior from the device test plan` |
| Actual result | `Observed behavior only; do not guess` |
| Status | `pass / fail / blocked / device_test_required / review_required` |
| Screenshot/video evidence reference | `placeholder/link to approved non-sensitive artifact; do not commit raw sensitive media` |
| Notes | `Browser/version quirks, network/HTTPS setup, viewport, reload/offline notes, repro steps` |
| Privacy/safety notes | `Permission prompt behavior, no raw media/sensor/location/health/wallet/payment/reward evidence captured, or review need` |
| Follow-up action | `None / docs note / runtime-fix proposal needing separate approval / privacy review / device retest` |
| Severity | `low / medium / high / critical` |

### Device/browser evidence sections

Create one subsection for each target below and keep unchecked items as `device_test_required`:

- **Android Chrome** — record Android version, Chrome version, HTTPS/localhost setup, QR/install prompt path, camera acceptance/denial, MediaPipe pose/face behavior, DeviceMotion behavior, WebGL/3D Flammi behavior, reload/offline smoke, navigation/scroll behavior, and any performance symptoms.
- **Samsung Internet** — record Samsung device/One UI/browser versions, Samsung install path wording, camera/canvas overlay behavior, WebGL stability, mobile navigation/scroll behavior, and the same permission cases as Android Chrome.
- **iPhone Safari** — record iPhone/iOS/Safari versions, Add-to-Home-Screen path, camera acceptance/denial, iOS DeviceMotion prompt/limitations, MediaPipe fallback behavior, WebGL/3D Flammi behavior, navigation/reload/scroll behavior, and any Safari-specific blockers.
- **Desktop responsive browser** — record browser/version, viewport size, emulation/device-toolbar mode if used, route reachability, scroll/navigation, QR/install-dialog copy, fallback states, and whether desktop shell duplication is absent.

### Route evidence sections

Use these route sections without creating new routes or duplicate app shells:

| Route | Expected manual evidence focus | Default untested status |
|---|---|---|
| `/mobile` | Mobile landing shell, bottom navigation, QR/install dialog, PWA guidance, responsive scroll, beta-safe wording, no token/NFT/wallet/payment/trading/payout activation. | `device_test_required` |
| `/mobile/missionen` | Mission overview, touch targets, bottom navigation, path into Squat mission, no final client reward/mission-completion authority from device signals. | `device_test_required` |
| `/mobile/missionen/squat` | Camera accepted/denied, HUD/countdown/timer, stop/finish controls, skeleton/pose fallback, small-screen usability, logged-out/Firestore-unavailable messaging as observed. | `device_test_required` / `review_required` |
| `/mobile/buddy` | Buddy status, touch/scroll behavior, beta wording, no token/NFT/wallet/reward-authority behavior. | `device_test_required` |
| `/mobile/analyse` | Camera accepted/denied, MediaPipe pose/face loading/failure, performance, local/ephemeral-processing expectations, safe non-camera fallback, no raw images/videos/face templates saved. | `device_test_required` / `review_required` |
| `/mobile/bewegung` | DeviceMotion accepted/denied, HTTPS/weak-context behavior, sensor unavailable fallback, no raw-motion persistence or reward authority. | `device_test_required` / `review_required` |
| `/mobile/einstellungen` | Mobile settings, install/PWA hints, privacy/beta wording, no consent expansion without review. | `device_test_required` |
| `/mobile/ar` | Camera AR test mode, WebGL/3D Flammi canvas, rear-camera/canvas overlay, tap/call/move/pause controls, WebGL/camera fallback, performance/battery/heat observations, no Unity dependency or AR reward/mission authority. | `device_test_required` / `review_required` |

### Permission-sensitive evidence checklist

Record each of these as a separate evidence row when tested; otherwise leave `device_test_required`:

| Check | Routes most likely involved | Evidence notes required | Default untested status |
|---|---|---|---|
| Camera accepted | `/mobile/missionen/squat`, `/mobile/analyse`, `/mobile/ar` | Permission prompt path, browser/OS wording summary, whether preview/overlay appears, no raw media committed. | `device_test_required` |
| Camera denied | `/mobile/missionen/squat`, `/mobile/analyse`, `/mobile/ar` | Denial path, fallback copy/state, ability to recover or continue safely. | `device_test_required` |
| Pose/face/MediaPipe loads | `/mobile/missionen/squat`, `/mobile/analyse` | Load state, visible fallback/skeleton/analysis behavior, performance symptoms, no biometric persistence. | `device_test_required` |
| Pose/face/MediaPipe fails | `/mobile/missionen/squat`, `/mobile/analyse` | Failure state, user-facing fallback, browser console notes only if non-sensitive. | `device_test_required` / `review_required` |
| DeviceMotion permission accepted | `/mobile/bewegung` | Prompt/permission path, HTTPS requirement, observed motion response, no raw sensor history captured. | `device_test_required` |
| DeviceMotion permission denied | `/mobile/bewegung` | Denial/fallback behavior, clear safe messaging, no reward authority. | `device_test_required` |
| WebGL/3D Flammi loads | `/mobile/ar` | Canvas/3D load, camera layering, controls, browser/device performance symptoms. | `device_test_required` |
| WebGL unavailable fallback | `/mobile/ar` | Fallback copy/state, no crash/blank critical path, no Unity/native dependency introduced. | `device_test_required` / `review_required` |
| PWA install/QR flow | `/mobile`, `/mobile/einstellungen` | QR dialog, browser install/Add-to-Home-Screen path, installed-PWA mode if actually tested, no app-store/payment/wallet claims. | `device_test_required` |

### Evidence summary template

At the end of a manual pass, add a short non-sensitive summary outside runtime code:

```md
Manual Mobile/PWA Device Evidence Summary
Date:
Tester:
Preview URL / build reference:
Devices/browsers covered:
Routes covered:
Permission-sensitive checks covered:
Counts: pass=0 / fail=0 / blocked=0 / device_test_required=0 / review_required=0
High/critical findings:
Artifacts reference folder/link:
Privacy/safety confirmation:
Runtime/product/protected-code changes made: none
Recommended follow-up:
```

Do not use this template to self-approve runtime fixes. A failed or review-required device finding should become a separate scoped task/PR with explicit allowed files and review plan.

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
