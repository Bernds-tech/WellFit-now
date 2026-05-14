# WellFit Route/API Drift Detector and Concept-to-Code Gap Analyzer

Status: active governance baseline  
Scope: validation-only agent tooling; no product logic changes; no automatic rewrites

## Purpose

WellFit already has route, API, feature, internal-source, product-readiness, Work Map, and agent workflow registers. Future Codex/AI agents must extend those mapped files instead of creating duplicate systems. This document defines the first validation-only detectors that compare the current repository against those registers before larger implementation work continues.

## Detector scripts

| Script | Purpose | Output | Gate behavior |
|---|---|---|---|
| `scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs` | Scans `app/**/page.tsx` and `app/**/route.ts`, compares discovered App Router pages and API routes against `project-register/routes.json`, `project-register/apis.json`, `project-register/features.json`, and `project-register/product-readiness.json`. | `scripts/wellfit-dev-agent/output/route-api-drift-detector.md` | Fails only for missing static route/API register entries that are safe to classify. Protected or unclear route/API gaps are warnings. |
| `scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs` | Compares `project-register/internal-sources.json` concept groups against `todolist/WORK_MAP.md` and `project-register/product-readiness.json`. | `scripts/wellfit-dev-agent/output/concept-to-code-gap-analyzer.md` | Concept mapping gaps are warnings unless they affect active beta modules. Duplicate-architecture risks are report-only guardrails. |

Both scripts are intentionally read-only. They never rewrite register, TODO, architecture, route, API, economy, compliance, Unity, or product files.

## Route/API drift rules

The route/API detector checks for:

1. **Missing register entries**: a discovered page/API file exists but no corresponding route is registered.
2. **Stale register entries**: a route/API entry exists in the register but the corresponding App Router file is no longer discovered.
3. **Feature link gaps**: registered active pages/APIs that are not referenced by `project-register/features.json`.
4. **Risk/readiness gaps**: registered active pages/APIs that are not clearly linked to `project-register/product-readiness.json` leading files.
5. **Authority/security API gaps**: API entries missing authority/security metadata.

Missing static routes/APIs fail only when the detector can classify them as safe enough to require immediate register alignment. Routes or APIs matching protected/high-critical concepts such as token, NFT, wallet, payment, marketplace, PvP, reward, economy, health, child-safety, privacy, legal, or compliance remain warnings for human classification.

## Concept-to-code gap rules

The gap analyzer checks for:

1. Concept source groups without a clear `alreadyStartedInRepo` and existing `leadingImplementationFiles` or `supportingConceptFiles` mapping.
2. Leading implementation areas from `internal-sources.json` that are not referenced in `todolist/WORK_MAP.md` or `project-register/product-readiness.json`.
3. Duplicate architecture risks inferred from do-not-duplicate warnings and shared implementation file mappings.
4. Active beta concept groups with no clear code/supporting file mapping.

Concept gaps usually remain warnings because high/critical areas must not be auto-fixed. A gap fails only when it clearly affects active beta module mapping.

## Quality gate integration

`npm run agent:quality-gate` now runs both detectors after the existing route/API register check and before downstream site/UX/security audits. `PASS_WITH_WARNINGS` is accepted for these detectors so the quality gate can preserve existing warnings while failing on safe, actionable drift.

## Agent usage

Before adding routes, APIs, product systems, or planning files, future agents should run:

```bash
node scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs
node scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs
npm run agent:quality-gate
```

If warnings appear, continue work only in the existing mapped files named by `todolist/WORK_MAP.md`, `project-register/internal-sources.json`, and `project-register/product-readiness.json`. Do not create a parallel architecture map, route register, API register, feature register, economy ledger, buddy system, mission system, feedback system, or Unity bridge.

## Current expected warning categories

The first detector baseline may report warnings for stale entries or incomplete cross-links that existed before this tool was added. Those warnings are intentionally visible so future PRs can resolve them in small registry-only follow-up tasks without changing product behavior.

## Next recommended hardening task

Create a registry-only follow-up that reviews each warning from the two generated reports and updates only the canonical registers when a human-safe source-of-truth can be verified. Do not auto-fix high/critical or compliance-sensitive areas.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/routes.json`, `project-register/apis.json`, `project-register/features.json`, `project-register/internal-sources.json`, `project-register/product-readiness.json` und diese Datei. Fuehre danach `node scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs` und `node scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs` aus. Bearbeite nur verifizierte Registry-/Work-Map-Luecken in bestehenden Dateien, erstelle keine Parallelarchitektur, aendere keine Produktlogik und fixe High-/Critical-/Compliance-Bereiche nicht automatisch.
