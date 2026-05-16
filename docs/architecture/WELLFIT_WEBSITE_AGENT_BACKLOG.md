# WellFit Website Agent Backlog and Findings Register

Status: active / report-only governance
Register: `project-register/website-agent-backlog.json`
Validator: `scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs`
Updated: 2026-05-16

## Why this backlog exists

The Website Agent Framework defines website-focused agents and route readiness boundaries, but future website agents also need a durable, machine-readable place to record findings. The backlog exists so Website Readiness Baseline Audits and focused website agents can preserve:

- open findings and route issues,
- conversion gaps and content gaps,
- SEO and discovery planning gaps,
- trust/compliance review items,
- mobile/PWA device evidence gaps,
- blocked items,
- follow-ups, and
- the next safe task for a future agent.

This prevents context loss when an audit finds something that is not safe to auto-fix. Findings must be stored as structured entries instead of only prose in PR comments or markdown summaries.

## How website agents record findings

Website agents should append or update entries in `project-register/website-agent-backlog.json` with the required schema fields defined by `backlogEntrySchema`:

- stable `id`, `title`, `status`, `severity`, and `findingType`,
- `route` from `project-register/website-readiness.json` or the literal `global`,
- `routeGroup`, `sourceAgent`, source evidence, and related registers,
- concrete `finding`, `evidence`, `recommendedAction`, and `nextSafeTask`,
- `allowedFiles`, `forbiddenFiles`, and `requiredChecks`,
- `humanReviewRequired` and `protectedTopics`, and
- created/updated dates.

Agents must use existing route, readiness, product-readiness, task-queue, workflow, and cross-reference registers. They must not create a parallel website architecture, route registry, design system, analytics pipeline, legal-review system, or runtime repair loop.

## Mapping findings to `website-readiness.json`

Every route-specific backlog entry must map to an existing route in `project-register/website-readiness.json`. Cross-route findings use `route: "global"` and `routeGroup: "global"`.

When a finding affects route readiness:

1. Record the concrete issue in the backlog first.
2. Keep `website-readiness.json` as the route/readiness summary, not the detailed finding log.
3. Do not advance `conversion_ready`, `investor_ready`, or `beta_ready` while related trust/compliance or protected-topic findings remain `review_required`, `human_review_required`, `blocked`, or `device_test_required`.
4. Only update readiness status after evidence exists and required review/checks pass.

## Turning findings into future `agent-task-queue` tasks

A backlog entry can become a future task only when the next step is clear, safe, and not already represented by an existing task. Future agents should:

1. Check `project-register/agent-task-queue.json` for an existing matching task.
2. Reuse or update that task instead of creating a duplicate.
3. Keep task scope aligned with the backlog entry's `allowedFiles`, `forbiddenFiles`, stop conditions, and protected-topic rules.
4. Preserve the backlog entry as evidence, then mark it `in_progress`, `done`, `duplicate`, `superseded`, or `stale` when appropriate.

The first recommended next task from this backlog is the **Website Readiness Baseline Audit**.

## Why `review_required` findings are preserved instead of auto-fixed

Legal, privacy, health, child, token, NFT, wallet, payment, betting, reward, investor, analytics, public-claim, consent, camera, biometric, location, mission-completion-authority, and anti-cheat findings can affect compliance, safety, public claims, or product authority. These findings must remain explicit review items until a human decision is available.

The backlog therefore records the issue, evidence, next safe task, and required review state. It does **not** authorize automatic edits to legal text, runtime pages, consent flows, analytics, rewards, payments, health data flows, child-safety behavior, token/NFT/wallet mechanics, or mission/reward authority.

## Mobile and device evidence handling

Mobile/PWA findings can use `device_test_required` when evidence is missing or incomplete. Entries should record:

- route(s) tested or still missing,
- device model, OS, browser, and viewport when known,
- permission/camera/PWA/fallback observations,
- route-specific pass/fail/blocked evidence,
- privacy or protected-topic concerns, and
- the next safe manual evidence task.

Missing device evidence is not a runtime failure. It is a preserved stop condition that blocks readiness advancement until evidence exists.

## Trust & Compliance blocks readiness advancement

Trust & Compliance findings block `conversion_ready`, `investor_ready`, and `beta_ready` advancement when they involve protected topics or public claims. Website agents may document risk and propose review tasks, but they must not auto-rewrite public claims or legal/compliance wording.

## Runtime changes are not enabled by this backlog

This backlog is registry-only and report-only. It never enables:

- runtime website/app/mobile/legal changes,
- edits to `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, package files, Firebase config, GitHub workflow files, or Unity files,
- auto-merge,
- auto-repair,
- PR approval,
- deployment, or
- protected-topic logic changes.

The validator only reads registers/docs and writes its report to `scripts/wellfit-dev-agent/output/website-agent-backlog-report.md` when run.

## Website Readiness Baseline Audit — 2026-05-16

Status: completed as a report-only baseline audit.
Scope: public pages, legal pages, desktop beta pages, mobile/PWA pages, protected/review-required pages, existing Website Agent Framework registers, Website Agent Backlog, Product Readiness, route registry, repository inventory, and visual-regression registry.

### Evidence used

- `npm run agent:autopilot:dry-run` confirmed dry-run-only planning and no merge/deploy behavior.
- `npm run agent:quality-gate` ran the website framework/backlog/readiness checks safely. The initial run reported `FAIL` only because `pr-diff-review-report.mjs` exits non-zero before a PR exists; the quality-gate report still recorded the PR diff review script as report-only and all website checks as safe.
- `node scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs` passed and confirmed report-only/no-runtime/no-merge/no-repair/no-deploy boundaries.
- `node scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs` passed and confirmed machine-readable backlog validity.
- `node scripts/wellfit-dev-agent/src/product-readiness-check.mjs` passed and kept sensitive/critical modules out of `production_ready`.
- `node scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs` passed with 31 discovered app pages, 9 discovered API routes, 32 registered pages, and no missing route/API register entries.
- `node scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs` reported `SKIPPED_BROWSER_UNAVAILABLE`; no screenshots were generated and no baseline/current screenshot comparison evidence exists in this environment.
- `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` passed.
- `node scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs` passed.

### Current readiness summary

| Route group | Baseline classification | Notes |
|---|---|---|
| Public pages | `draft` or `usable`; not `conversion_ready` | `/`, `/register`, `/faq`, and `/hilfe` exist in the route/readiness registers. `/register` remains review-gated because waitlist/beta signup can touch privacy, consent, and beta public claims. Public pages still need conversion, content, SEO, route/link, protected-claim, and visual smoke evidence before advancement. |
| Legal pages | `review_required` | `/datenschutz`, `/agb`, and `/impressum` remain human-review-required. This audit did not change legal wording or runtime legal pages. |
| Desktop beta pages | `usable`, `draft`, or `review_required`; not `beta_ready` | `/dashboard`, `/buddy`, `/missionen`, mission subroutes, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, and `/einstellungen` remain beta/review-gated according to existing Product Readiness and Website Readiness metadata. The baseline added readiness metadata for registered subroutes `/dashboard/anpassen`, `/missionen/challenge`, `/missionen/favoriten`, and `/missionen/history` because those routes are already present in `project-register/routes.json` and discovered by the drift detector. |
| Mobile/PWA pages | `draft` or `review_required`; device evidence required | `/mobile`, `/mobile/missionen`, `/mobile/buddy`, `/mobile/einstellungen`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/ar`, and `/mobile/missionen/squat` remain blocked from readiness advancement until route-specific phone/device, viewport, permission, PWA, fallback, and visual smoke evidence exists. |
| Protected/review-required pages | `review_required` | Competition/PvP, betting/stakes, rewards, mission completion, anti-cheat, points shop, marketplace/token/NFT/payment/economy, analytics/privacy/consent, AI Buddy, health/child, camera/AR/biometric, investor, and public-claim topics remain human-review-required. |

### Top route gaps

1. **Visual/mobile smoke evidence gap:** the visual smoke checker could not run browser screenshots in this environment (`SKIPPED_BROWSER_UNAVAILABLE`), so no route can advance based on screenshot evidence alone.
2. **Mobile/PWA device evidence gap:** existing Product Readiness records first manual `/mobile/ar` evidence, but Android device model/OS/Chrome metadata and route-by-route phone coverage remain missing.
3. **Route/link integrity follow-up:** the route registry is drift-clean, but the Website Readiness baseline preserves `/challenge` as a review-required alias to `/missionen/challenge`; a dedicated route/link audit should decide whether any public/navigation expectation exists without creating a duplicate route.
4. **Protected-topic review gap:** legal/privacy, health, child, token/NFT/payment/economy, rewards, mission completion, betting/PvP, analytics, AI Buddy, camera/AR, investor, and public-claim routes cannot advance to `conversion_ready`, `investor_ready`, or `beta_ready` without human review evidence.
5. **Content/conversion/SEO gap:** public pages are not conversion-ready because conversion goals, protected-claim substantiation, content completeness, SEO/discovery, and link evidence remain planning/report-only.

### Review-required items

- Legal pages and legal/privacy/compliance wording.
- `/register` privacy/consent/beta public-claim expectations.
- Dashboard, settings, mission, reward, progress, history, favorites, and customization surfaces where profile/privacy/progress authority can be implied.
- Competition/PvP/challenge/leaderboard routes where betting, stakes, anti-cheat, public rankings, rewards, or mission authority can be implied.
- Points shop, marketplace, token/NFT/payment/economy/investor/public-claim routes.
- Analytics, experiments, adaptive insights, consent, and privacy-sensitive measurement.
- Mobile/PWA health, motion, camera, AR, biometric, child, AI Buddy, permission, and reward/mission completion implications.

### Blocked items

- No legal/privacy/health/child/token/payment/reward/investor/public-claim route may be marked `conversion_ready`, `investor_ready`, or `beta_ready` from this audit.
- No runtime website/app/mobile/legal code, product logic, protected data flow, package/config, Firebase, GitHub workflow, or Unity file may be changed by this audit.
- Browser screenshot comparison is blocked in this environment until a supported browser runner and baseline/current screenshot process are available.
- Mobile/PWA readiness advancement is blocked until route-specific human/device evidence is recorded.

### Routes needing human/device evidence

- All mobile/PWA routes: `/mobile`, `/mobile/missionen`, `/mobile/missionen/squat`, `/mobile/buddy`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/einstellungen`, and `/mobile/ar`.
- Protected desktop beta routes with reward, mission, economy, analytics, competition, or privacy implications: `/dashboard`, `/dashboard/anpassen`, `/buddy`, `/missionen`, `/missionen/tagesmissionen`, `/missionen/wochenmissionen`, `/missionen/abenteuer`, `/missionen/challenge`, `/missionen/wettkaempfe`, `/missionen/favoriten`, `/missionen/history`, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, and `/einstellungen`.

### Routes needing trust/compliance review

- Legal pages: `/datenschutz`, `/agb`, `/impressum`.
- Public/beta claim pages: `/register`, `/faq`, `/hilfe`, and `/`.
- Protected product routes: `/buddy`, mission routes, challenge/PvP routes, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, mobile health/camera/AR/Buddy routes, and any investor/token/public-claim surface.

### Routes needing content/conversion/SEO review

- `/`, `/register`, `/faq`, and `/hilfe` should be handled by a future report-only Landingpage Conversion Audit or SEO & Discovery Planning Audit before runtime copy or metadata changes.
- Legal pages can be inventoried for route/link presence but need human legal review for wording changes.

### Routes needing visual/mobile smoke evidence

- Public visual smoke: `/`, `/register`, `/faq`, and `/hilfe`.
- Desktop beta smoke: `/dashboard`, `/dashboard/anpassen`, `/buddy`, mission subroutes, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, and `/einstellungen`.
- Mobile/PWA smoke and device evidence: all `/mobile/**` routes, especially `/mobile/ar` and `/mobile/missionen/squat` because camera/AR/health/biometric/reward implications remain review-required.

### Machine-readable updates made

- `project-register/website-readiness.json` now records this baseline audit summary and adds supported readiness entries for registered routes `/dashboard/anpassen`, `/missionen/challenge`, `/missionen/favoriten`, and `/missionen/history`.
- `project-register/website-agent-backlog.json` marks `WAB-001` as completed for this baseline, refreshes evidence on route/link, trust/compliance, and mobile/PWA backlog items, and adds `WAB-009` for the current visual/mobile smoke evidence gap.

### Next safe website task

Recommended next task: **Route & Link Integrity Audit** if the team wants to resolve `/challenge` alias/navigation evidence and registered subroute link coverage first; otherwise **Landingpage Conversion Audit** is safe for public-page conversion/content/SEO planning only. Given the alias and visual evidence findings, Route & Link Integrity Audit is the safer immediate next task.


## Route & Link Integrity Audit — 2026-05-16

Status: completed as a report-only route/link integrity audit.
Backlog entry: `WAB-003` marked `done` in `project-register/website-agent-backlog.json`.
Scope: public routes, legal routes, desktop beta routes, mobile/PWA routes, route aliases, canonical route decisions, stale route references, review-required route risks, and safe follow-up tasks.

### Evidence used

- `project-register/routes.json` registers public, legal, desktop beta, mobile/PWA, and system route groups.
- `project-register/website-readiness.json` contains 32 route readiness entries, including the preserved `/challenge` readiness alias that maps to `/missionen/challenge`.
- `project-register/features.json`, `project-register/product-readiness.json`, `project-register/repository-inventory.json`, and `project-register/visual-regression.json` preserve product, protected-topic, inventory, and visual/device boundaries.
- `node scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs` reported no missing route/API register entries during the audit command run.
- Static route/link inspection found registered internal route literals across the existing public/legal, desktop beta, and mobile/PWA surfaces; dynamic clickability, auth/preview behavior, redirect behavior, external links, and device/PWA permission flows still need future runtime/browser validation.

### Public route integrity

| Route | Integrity finding | Status | Next safe action |
|---|---|---|---|
| `/` | Registered as a public landing route and present in readiness metadata. Link/conversion evidence is still report-only. | `draft` / not `conversion_ready` | Handle CTA/content/link hierarchy in a future Landingpage Conversion Audit without editing runtime code in this audit. |
| `/register` | Registered public route and linked from existing login/landing flow evidence. Privacy, consent, beta signup, and public-claim implications remain protected. | `review_required` | Keep consent/privacy findings human-review-required; use Beta Waitlist or Trust & Compliance audit before runtime changes. |
| `/faq` and `/hilfe` | Registered public/help routes. Existing docs/registers support route presence, but no browser click-through evidence was generated. | `draft` / `usable` depending readiness entry | Future runtime link validation should verify header/sidebar/footer/help navigation behavior. |

No supported public-route metadata change was made to `routes.json` or `features.json`; no duplicate public route was created.

### Legal route integrity

| Route | Integrity finding | Status | Next safe action |
|---|---|---|---|
| `/datenschutz` | Registered and preserved as legal/privacy route. Route presence can be inventoried, but wording and consent/privacy claims are legal-review controlled. | `review_required` | Trust & Compliance Website Audit; do not edit legal wording in an automated route/link task. |
| `/agb` | Registered and preserved as legal/terms route with payment/reward-adjacent implications. | `review_required` | Human legal/compliance review before any wording or flow changes. |
| `/impressum` | Registered and preserved as legal/public-claim route. | `review_required` | Human review for legal/public claim changes; future runtime validation may only test link reachability. |

Legal pages remain route-present but not compliance-cleared. This audit changed no Datenschutz, AGB, Impressum, legal, privacy, consent, or compliance runtime wording.

### Desktop beta route integrity

| Route group | Integrity finding | Status | Next safe action |
|---|---|---|---|
| Dashboard/settings | `/dashboard`, `/dashboard/anpassen`, and `/einstellungen` are registered and represented in readiness metadata. Profile/progress/customization/privacy implications remain review-gated where applicable. | `usable` or `review_required` | Future runtime link validation should verify navigation and auth/preview behavior without moving authority client-side. |
| Mission routes | `/missionen` is registered as `active-redirect`; mission subroutes are registered, including `/missionen/challenge`, `/missionen/favoriten`, and `/missionen/history`. | `usable`, `draft`, or `review_required` | Preserve existing mission architecture; validate redirects/click paths in browser evidence before proposing navigation changes. |
| Economy/social/analytics routes | `/punkte-shop`, `/marktplatz`, `/leaderboard`, and `/analytics` are registered but protected by economy, reward, public ranking, privacy, analytics, and/or authority concerns. | `review_required` where sensitive | Trust & Compliance Website Audit before conversion or readiness advancement. |
| Buddy route | `/buddy` is registered but AI Buddy and privacy/personalization implications remain review-gated. | `review_required` | Keep route/link audit report-only; do not change Buddy behavior or data flows. |

Desktop beta routes have no supported route-register drift to fix in this audit. The audit does not authorize sidebar, footer, AppShell, mission navigation, reward, marketplace, leaderboard, analytics, Buddy, or settings runtime changes.

### Mobile/PWA route integrity

| Route group | Integrity finding | Status | Next safe action |
|---|---|---|---|
| Mobile home/navigation | `/mobile`, `/mobile/missionen`, `/mobile/buddy`, and `/mobile/einstellungen` are registered and readiness-mapped. | `draft` or `review_required` | Future mobile/browser evidence must verify bottom navigation, viewport, PWA install, and route-specific behavior. |
| Mobile health/camera/AR | `/mobile/analyse`, `/mobile/bewegung`, `/mobile/ar`, and `/mobile/missionen/squat` are registered but involve health, motion, camera, AR, biometric/pose, permission, mission, and reward implications. | `review_required` / `device_test_required` | Collect route-specific device evidence; do not change camera, AR, health, consent, or reward logic. |

Mobile/PWA route presence is documented, but device model, OS, browser, viewport, PWA install, permission, fallback, and screenshot evidence remain incomplete.

### Route aliases and canonical route decisions

| Alias or route | Canonical/register evidence | Audit decision |
|---|---|---|
| `/challenge` | `website-readiness.json` preserves `/challenge` as `not_registered_review_required_alias` mapped to `/missionen/challenge`; `routes.json` registers `/missionen/challenge`, not `/challenge`. | Keep `/challenge` as a review-required alias only. Do not create a duplicate route or redirect without human product/navigation review. |
| `/missionen` | `routes.json` marks `/missionen` as `active-redirect`, and mission navigation/register evidence points to mission subroutes. | Treat `/missionen` as the existing redirect surface; future browser evidence should verify redirect behavior before any navigation proposal. |
| `/missionen/challenge` | Registered protected mission route and readiness canonical for challenge content. | Keep canonical route review-required because challenge/PvP can imply competition, betting/stakes, mission completion, anti-cheat, and rewards. |

### Stale route references and unclear mappings

- **Stale/preserved alias:** `/challenge` is the only supported stale/alias route reference found by this report-only pass. It remains `review_required` and mapped to `/missionen/challenge`; no route/register/runtime change was made.
- **No supported route-register drift:** the route/API drift detector reported no missing route/API register entries during this audit, so `routes.json` and `features.json` were not changed.
- **Unclear runtime behavior:** literal route presence does not prove clickability, auth/preview handling, redirect behavior, PWA install behavior, permissions, or mobile device behavior. Those items require future runtime/browser/device validation and should stay report-only until evidence exists.

### Routes needing human review

- Legal and compliance routes: `/datenschutz`, `/agb`, `/impressum`.
- Public/beta claim and consent surfaces: `/`, `/register`, `/faq`, `/hilfe`.
- Desktop protected routes: `/buddy`, mission routes, `/missionen/challenge`, `/missionen/wettkaempfe`, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, `/dashboard/anpassen`, and `/einstellungen` where privacy/profile/progress/economy/authority concerns are present.
- Mobile/PWA protected routes: `/mobile/analyse`, `/mobile/bewegung`, `/mobile/ar`, `/mobile/missionen/squat`, `/mobile/buddy`, and `/mobile/missionen` where health, camera, AR, biometric/pose, child-safety, privacy, AI Buddy, mission, or reward implications may apply.

### Routes needing future runtime link validation

Future browser/device validation should verify registered route reachability, redirects, navigation affordances, protected-route behavior, external links, mobile/PWA install state, permissions, and screenshots for:

- Public/legal/help: `/`, `/register`, `/datenschutz`, `/agb`, `/impressum`, `/faq`, `/hilfe`.
- Desktop beta: `/dashboard`, `/dashboard/anpassen`, `/buddy`, `/missionen`, `/missionen/tagesmissionen`, `/missionen/wochenmissionen`, `/missionen/abenteuer`, `/missionen/challenge`, `/missionen/wettkaempfe`, `/missionen/favoriten`, `/missionen/history`, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, `/einstellungen`.
- Mobile/PWA: `/mobile`, `/mobile/missionen`, `/mobile/missionen/squat`, `/mobile/buddy`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/einstellungen`, `/mobile/ar`.

### Machine-readable updates made

- `project-register/website-agent-backlog.json` marks `WAB-003` as `done`, records `/challenge` as the preserved alias finding, and sets the next safe task to Trust & Compliance Website Audit or Landingpage Conversion Audit.
- `project-register/website-readiness.json` adds a `routeLinkIntegrityAudit` report summary and keeps `/challenge` and `/missionen/challenge` review-required.
- `routes.json` and `features.json` were left unchanged because no supported route/register drift requiring metadata changes was verified.

### Safe next tasks

Recommended next task: **Trust & Compliance Website Audit** because the route/link audit did not find a safe route-register fix, while legal/privacy, challenge/PvP, rewards/economy, analytics, health/camera/AR, AI Buddy, mobile/PWA, and public-claim surfaces remain `review_required`. If the team wants to start with lower-risk public-page optimization instead, the alternative is **Landingpage Conversion Audit** in report-only mode.

## KI-Fortsetzungs-Prompt

Naechste KI/Codex-Session: Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/website-agents.json`, `project-register/website-readiness.json`, `project-register/website-agent-backlog.json` und dieses Dokument. Fuehre `node scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs` und `node scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs` aus, bevor Website-Findings oder Website-Readiness-Aenderungen geplant werden. Nutze den Backlog fuer maschinenlesbare Findings, halte protected Topics `review_required`, erstelle keine parallele Website-Architektur, und aendere keine Runtime-Seiten, Legal-Texte, Tracking-, Reward-, Payment-, Token-, Health-, Child-, Camera-, Location-, Consent-, Unity-, Auto-Merge-, Auto-Repair-, Approval- oder Deployment-Logik.
