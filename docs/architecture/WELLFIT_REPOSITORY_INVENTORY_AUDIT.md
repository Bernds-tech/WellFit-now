# WellFit Repository Inventory and Coverage Audit

Updated: 2026-05-15

## Purpose

This audit gives future WellFit agents a single, non-runtime source for repository coverage before they choose or implement work. It complements the existing Work Map, TODO Index, Product Readiness Matrix, route/API registers, and cross-reference maintenance framework instead of replacing them.

The machine-readable inventory lives in [`project-register/repository-inventory.json`](../../project-register/repository-inventory.json). The report-only validator lives in [`scripts/wellfit-dev-agent/src/repository-inventory-check.mjs`](../../scripts/wellfit-dev-agent/src/repository-inventory-check.mjs).

## Scope

The inventory/check scans these repository areas:

- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `project-register/**`
- `todolist/**`
- `docs/**`
- `scripts/**`
- `public/**`
- `native/**` as read-only/protected inventory

The scan intentionally excludes generated or heavy paths:

- `**/node_modules/**`
- `.git/**`
- `.next/**`
- `**/out/**`, `**/dist/**`, `**/build/**`, `**/coverage/**`
- `scripts/wellfit-dev-agent/output/**`
- Unity generated folders under `native/unity/WellFitBuddyAR/{Library,Temp,Obj,Logs,Build,Builds}/**`

## Protected inventory areas

These areas are inventoried for visibility only and must not be modified by repository-inventory tasks:

- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `firestore.rules`
- `native/unity/WellFitBuddyAR/**`
- Any token, NFT, wallet, payment, betting, reward-authority, health, child, location, privacy, legal, AGB, Datenschutz, or Impressum topic path

Unity/AR files remain read-only for this audit. Do not merge, close, depend on, or alter old Unity PR #13 from this workstream.

## Coverage method

The validator compares repository files against existing sources of truth:

1. `todolist/WORK_MAP.md` textual file-path references.
2. `project-register/product-readiness.json` `leading_files` and `supporting_files`.
3. `project-register/repository-inventory.json` `mapped_files`.
4. `app/**/page.tsx` routes against `project-register/routes.json`.
5. `app/api/**/route.ts` routes against `project-register/apis.json`.
6. Protected path patterns from AGENTS.md and WellFit safety rules.
7. Likely stale/duplicate indicators such as `old`, `stale`, `duplicate`, `deprecated`, `legacy`, `backup`, `archive`, `handoff`, and `status` path markers, plus duplicate basenames.

Warnings are expected and are not automatic failures. They are triage signals for future documentation/register work. The script never rewrites files.

## Current inventory summary

At creation time, the inventory recorded:

- 591 scanned files across the required scope.
- 167 mapped files.
- 421 unmapped files.
- 334 protected/read-only files.
- 100 stale/duplicate candidate entries.
- 32 route-register entries.
- 9 API-register entries.
- 21 product-readiness modules.

Use `jq '.summary' project-register/repository-inventory.json` for the current machine-readable counts after future refreshes.

## How future agents should use this audit

Before editing WellFit:

1. Read `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, and `todolist/TODO_INDEX.md`.
2. Inspect `project-register/repository-inventory.json` for mapped/protected/unmapped/stale coverage in the affected topic.
3. Run `node scripts/wellfit-dev-agent/src/repository-inventory-check.mjs`.
4. If a file is unmapped, update existing leading registers/docs only when the current task justifies it.
5. If a file is protected, stop unless the user explicitly assigned that protected work and all human-review rules are satisfied.
6. If a stale/duplicate candidate appears, mark or cross-reference it in existing TODO/status docs; do not delete historical context automatically.

## Quality gate integration

`npm run agent:quality-gate` now runs the repository inventory check after the cross-reference maintenance check. The inventory check is PASS/FAIL for structural validation, but unmapped/protected/stale findings are warning/report sections so future agents can triage them without creating duplicate architecture.

## Recommended follow-up

- Keep `repository-inventory.json` refreshed through scoped documentation/register tasks, not automatic rewrites.
- Reduce unmapped warnings by adding justified references to existing Work Map, Product Readiness, route/API, or governance registers.
- Preserve protected runtime, compliance, and Unity areas unless a future task explicitly authorizes a narrow change.
- Continue using this inventory as a pre-flight map before expanding mission, buddy, economy, AR, route, API, or governance work.

## KI-Fortsetzungs-Prompt

Wenn du diese Inventur fortsetzt, lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/repository-inventory.json`, `project-register/product-readiness.json`, `project-register/routes.json`, `project-register/apis.json` und `project-register/cross-reference-maintenance.json`. Aktualisiere nur bestehende Register/Dokumentationsquellen, fuehre `node scripts/wellfit-dev-agent/src/repository-inventory-check.mjs` und `npm run agent:quality-gate` aus, dokumentiere Warnungen transparent und beruehre keine Runtime-, Compliance-, Reward-Authority- oder Unity/PR-#13-Dateien ohne expliziten Auftrag.
