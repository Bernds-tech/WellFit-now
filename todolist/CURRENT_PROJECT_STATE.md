# CURRENT PROJECT STATE - WELLFIT

Status: leading current-state file / documentation consolidation  
Date: 2026-05-14  
Scope: `todolist/` consolidation only; no product logic changed.

## 1. Purpose and reading order

This file is the leading short state file for future Codex/AI agents. It consolidates the current project baseline from every file under `todolist/`, the referenced registers in `project-register/`, and architecture documents referenced by the TODO files.

Read in this order before new WellFit work:

1. `AGENTS.md` - repository safety, branch, PR and compliance rules.
2. `todolist/CURRENT_PROJECT_STATE.md` - current project state and next safe tasks.
3. `todolist/WORK_MAP.md` - topic-to-file map and do-not-duplicate warnings.
4. `todolist/TODO_INDEX.md` - full TODO/list index and status table.
5. `todolist/NEXT_ACTIONS.md` - operational next-actions backlog.
6. `todolist/PROJECT_STRUCTURE.md` and `todolist/CODEBASE_FEATURE_MAP.md` - existing files, routes and modules before creating anything new.
7. `project-register/routes.json`, `project-register/apis.json`, `project-register/features.json` - machine-readable route/API/feature baseline.

## 2. Current verified baseline

### Repository and governance

- Work must not happen directly on `main`; use a branch and PR.
- TODO, list, roadmap, status, planning, register and handoff files must not be deleted.
- Stale or duplicate TODO content must be marked and linked to a leading file instead of removed.
- This consolidation creates two leading documentation files:
  - `todolist/CURRENT_PROJECT_STATE.md` - leading current-state file.
  - `todolist/WORK_MAP.md` - leading topic-to-file map.

### Product baseline from registers

- Public pages are registered for `/`, `/register`, legal pages and help/FAQ.
- Protected/beta app pages are registered for dashboard, buddy, mission routes, points shop, marketplace, leaderboard, analytics and settings.
- Mobile beta routes are registered for `/mobile`, `/mobile/analyse`, `/mobile/ar`, `/mobile/bewegung`, `/mobile/buddy`, `/mobile/einstellungen`, `/mobile/missionen` and `/mobile/missionen/squat`.
- Economy API routes are registered as preview/status/draft-only routes, not final reward or token authority.
- Feature registry marks Dashboard, Missionen, Buddy, Punkte-Shop, Analytics and Mobile-Web as active beta or active beta preview areas.
- Marketplace is registered as active/placeholder with review required and no token/NFT/trading activation in MVP.


### Validation in this consolidation branch

The documentation consolidation branch was checked with:

- `npm run lint` - pass.
- `npx tsc --noEmit` - pass.
- `npm run build` - pass; Next.js generated 34/34 static pages and listed 9 API routes.
- `npm --prefix functions run check` - pass.
- `npm run agent:quality-gate` - first run failed because `todolist/WORK_MAP.md` and `docs/architecture/STUFE_4_GOVERNANCE_BIS_G_ABSCHLUSS.md` needed KI prompts and the governance architecture file needed an index entry; after low-risk documentation fixes, the rerun passed with TODO index missing files 0 and missing prompts 0.

### Safety baseline

- Internal points/XP/reward simulation is allowed for beta UX.
- Final ledger authority, mission completion authority, anti-cheat, rare-item grants and reward authorization must stay server-side or explicitly draft/preview until reviewed.
- Token, NFT, wallet, trading, staking, presale, paid points, payouts and real purchases are not active beta features.
- Health, child-safety, watch, camera and location topics are documented as guarded/high-risk and must not be expanded without explicit instruction and a review plan.
- Unity AR work is isolated under `native/unity/WellFitBuddyAR`; do not delete, overwrite or depend on old PR #13.

## 3. Completed work summary

The TODO/status folder records these completed or started-and-tested blocks:

- Dashboard refactor and dashboard preferences are started: local card preferences, saved cards panel and dashboard customization are documented in `WF-DASH-PERSIST-001 - Dashboard Preferences lokal.md`.
- Mobile and Wettkämpfe routes previously returned HTTP 200 in production status notes.
- RewardPreview, mission reward policy, NFC duplicate-scan protection, mission evidence review, cooldown/pattern review and proof-quality dampening have status notes showing emulator/build confirmations.
- Challenge economy path has been prepared and locally/live visibly tested as a server-near preview path; repeated completion did not double-credit in the documented test.
- User projection API and Firestore economy emulator/rules guardrail checks have dedicated status notes.
- Roadmap consolidation after the master upload confirmed that avatar inventory, rare items, internal points shop, competitions, internal stakes, NFC, buddy abilities and server-side economy authority already exist as roadmap/guardrail topics and must not be rebuilt as parallel systems.
- Buddy-KI endpoint and provider/runbook architecture exist as suggestion-only / no-reward-authority foundations.
- Web-beta roadmap without Buddy AR exists as a leading architecture route for the next web beta phase.
- Local/self-hosted agent, code inventory, quality gate and site audit concepts exist and should be used for governance checks.

## 4. Open work summary

Continue existing modules instead of creating new systems:

1. **Repository baseline and governance alignment**
   - Keep `TODO_INDEX.md`, `CURRENT_PROJECT_STATE.md`, `WORK_MAP.md`, project registers and status files aligned.
   - Run code inventory/quality gate after broad changes.

2. **UI shell stability**
   - Verify landing, dashboard, sidebar, footer, mobile navigation, legal/help pages and mission routes.
   - Consolidate duplicated desktop shell patterns only in small UI-safe steps.

3. **Dashboard and projection**
   - Browser-test `/dashboard`, `/dashboard/anpassen` and `/dashboard/meine-karten` if still present.
   - Firestore sync for dashboard preferences is intentionally not active; plan separately.

4. **Mission continuation**
   - Continue in existing mission files under `app/missionen/` and existing economy preview APIs.
   - Convert remaining MVP/client reward paths toward server preview/completion patterns.
   - Keep evidence/manual-review/rejected paths auditable.

5. **Economy/backend hardening**
   - Continue `RewardPreview -> Completion -> Ledger -> Audit -> Projection` only as reviewed server-side/draft work.
   - Maintain Firestore rules guardrails and emulator tests.

6. **Buddy/KI**
   - Continue suggestion-only Buddy-KI guide/data-model work; no reward or completion authority.
   - Keep provider secrets server-side only.

7. **Mobile web and AR split**
   - Mobile web beta may continue as touch-first Web/PWA.
   - Unity/native AR remains isolated and should not be mixed into the web beta path unless explicitly requested.

8. **Safety wording / compliance review**
   - Keep mobile and beta-facing flows free of premature token/NFT/wallet/payment/betting language.
   - Treat legal/privacy/compliance changes as high-risk and explicit-review only.

## 5. Blocked or risky areas

| Area | Risk | Current stance |
|---|---:|---|
| Token/NFT/wallet/trading/staking/presale | High | Backlog only; not active in beta/mobile. |
| Paid points / real purchases / payouts | High | Backlog after beta; do not activate. |
| Reward authority / mission completion / rare item grants | High | No client final authority; server-side preview/draft only until reviewed. |
| Betting, PvP stakes, competitions | High | Internal beta/guardrail planning only; no real betting or payouts. |
| Health/watch/location/camera/child safety | High | Guarded documentation only unless explicit review plan exists. |
| Unity / WellFitBuddyAR | High | Isolated; do not delete/overwrite or touch PR #13. |
| Firestore rules / Functions authority | Medium/High | Use emulator/rules guardrails; do not loosen rules casually. |
| Duplicate TODO architecture | Medium | Use `WORK_MAP.md` and `TODO_INDEX.md`; mark stale/duplicate, do not delete. |
| App shell duplication | Medium | Technical debt; consolidate only after route inventory and screenshots/tests. |

## 6. Files future agents must read first

Minimum required reading for general work:

- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `todolist/NEXT_ACTIONS.md`
- `todolist/PROJECT_STRUCTURE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/routes.json`
- `project-register/apis.json`
- `project-register/features.json`

Add topic-specific files from `WORK_MAP.md` before touching any feature.

## 7. Next recommended tasks in order

1. Run and keep green: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm --prefix functions run check`, `npm run agent:quality-gate`.
2. If a governance check reports missing TODO index entries, update only the relevant TODO/index rows.
3. Verify the current route/API inventory against `project-register/routes.json` and `project-register/apis.json` after any route/API change.
4. Do a UI-shell stability pass with screenshots only if visible UI changes are made.
5. Continue mission/economy hardening in existing files, with preview/draft/server authority boundaries intact.
6. Continue Buddy-KI guide/data-model work as suggestion-only.
7. Keep Unity/native AR work separate unless the task explicitly requests AR bridge planning.

## 8. Continuation prompt for next AI/Codex task

```text
You are continuing WellFit documentation/product work. First read AGENTS.md, todolist/CURRENT_PROJECT_STATE.md, todolist/WORK_MAP.md, todolist/TODO_INDEX.md, todolist/NEXT_ACTIONS.md, todolist/PROJECT_STRUCTURE.md, todolist/CODEBASE_FEATURE_MAP.md, and the project-register JSON files. Do not work on main. Do not delete TODO/planning files. Do not touch Unity or PR #13 unless explicitly asked. Do not create duplicate feature systems. Pick the next task from CURRENT_PROJECT_STATE and WORK_MAP, continue in the listed existing files, preserve server-authority/economy/compliance guardrails, run the required checks, commit, and prepare a PR.
```

## 9. Todelist inspection coverage

This consolidation inspected the top-level `todolist/` files, all `todolist/status/*.md` files, and the referenced `project-register/routes.json`, `project-register/apis.json`, `project-register/features.json` files. Architecture files referenced from TODOs were reviewed for topic mapping and guardrails. Historical files remain in place; this file does not replace them as historical evidence.
