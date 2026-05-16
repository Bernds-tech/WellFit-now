# WellFit Website Agent Framework

Status: active / report-only governance  
Updated: 2026-05-16  
Leading registers: `project-register/website-agents.json`, `project-register/website-readiness.json`

## Purpose

The Website Agent Framework defines a controlled website-focused agent layer for the WellFit public website, desktop beta routes, and mobile/PWA routes. It exists to make the website stable, conversion-ready, investor-ready, and beta-ready before larger product intelligence, AI Buddy expansion, gamification, adaptive learning, analytics, experiments, or self-improving website capabilities are implemented.

This framework is documentation, registry, and validation-script governance only. It does not authorize runtime website changes and does not replace existing WellFit governance.

## Why website agents are separate from coding agents

Website agents are separated from coding agents because their first responsibility is evaluation, evidence collection, route/readiness mapping, and risk classification. Coding agents may eventually implement approved changes, but website agents should first answer:

- Which routes are public acquisition surfaces, legal surfaces, desktop beta surfaces, mobile/PWA surfaces, or protected/review-required surfaces?
- Which routes are only `draft`, which are `usable`, and which are blocked by review requirements?
- Which claims or route behaviors touch legal, privacy, health, child-safety, token/economy, payment, reward, investor, analytics, camera/AR, or compliance-sensitive topics?
- Which existing files/registers already own the route or concept, so no duplicate architecture is created?

This separation prevents website-readiness tasks from silently becoming runtime product changes, legal copy changes, tracking changes, reward-authority changes, or parallel route/design systems.

## Route handling model

### Public pages

Public pages such as `/`, `/register`, `/faq`, and `/hilfe` are evaluated for completion, route/link integrity, content clarity, SEO/discovery, trust, and conversion readiness. Conversion work remains report-only until a scoped runtime task is approved. `/register` also remains sensitive because waitlist and beta signup flows can implicate privacy, consent, public claims, and eligibility expectations.

### Legal pages

Legal pages such as `/datenschutz`, `/agb`, and `/impressum` are always `review_required` for wording or compliance changes. Website agents may inventory, reference, and report gaps, but they must not alter legal text or compliance messaging.

### Desktop beta pages

Desktop beta routes such as `/dashboard`, `/buddy`, `/missionen/*`, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, and `/einstellungen` are evaluated against beta readiness, Product Readiness, route integrity, visual evidence, and protected-topic rules. They must not gain client-side final authority for rewards, mission completion, anti-cheat, inventory, leaderboards, points, payments, or economy logic through this framework.

### Mobile/PWA pages

Mobile/PWA routes such as `/mobile`, `/mobile/missionen`, `/mobile/missionen/squat`, `/mobile/buddy`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/einstellungen`, and `/mobile/ar` require mobile-first and manual-device evidence. Camera, AR, pose, movement, health-adjacent, privacy, consent, and reward implications remain `review_required`. Device evidence should be recorded as a readiness report or manual evidence handoff, not by changing runtime mobile/PWA code.

### Protected or review-required pages

Routes involving marketplace/economy, token/NFT, payments, rewards, competitions, betting/PvP stakes, analytics, AI Buddy, camera/AR, health, child-safety, investor claims, or public claims must remain `review_required` until reviewed by the appropriate human owner. A route must not be advanced to `conversion_ready` or `beta_ready` when sensitive topics are present unless the registry explicitly records human review as required and complete.

## How the website agents work together

- **Website Completion Agent** establishes route-level gaps, readiness status, and next safe tasks.
- **Route & Link Integrity Agent** compares route entries with `project-register/routes.json` and flags missing aliases or duplicate-route risks.
- **Mobile First Agent** gates mobile/PWA evidence, viewport, PWA install, permissions, and device-specific concerns.
- **Visual Regression Website Agent** uses the existing visual-regression register and route smoke checks; it does not create a second screenshot architecture.
- **Website Content Agent** identifies content gaps and protected claims that need review.
- **Trust & Compliance Agent** blocks sensitive legal/privacy/health/child/token/payment/reward/economy claims from unsafe advancement.
- **Landingpage Conversion Agent** prepares conversion-readiness audits without changing the landing page.
- **SEO & Discovery Agent** maps search/discovery gaps without editing metadata or structured data until approved.
- **Beta Waitlist Agent** reviews `/register` readiness while preserving auth, consent, and data-collection boundaries.
- **Investor Page Agent** keeps investor-facing claims substantiated and review-required.
- **Analytics & Experiment Agent** keeps analytics and experiments planning-only until privacy and consent gates exist.
- **Self-Improving Website Agent** is explicitly constrained to planning/report-only mode until analytics, consent, safety, and human-review gates exist.

## Runtime changes are not enabled

This framework does not permit modifications to `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, package files, Firebase configuration, GitHub workflows, or Unity files. The new validation script is report-only and must never approve, merge, repair, deploy, or alter runtime pages. Future runtime changes need a separate scoped task, existing AGENTS.md rules, route/register checks, protected-topic review, and a normal PR.

## Sensitive topics remain review_required

The following topics must be marked `review_required` in website-readiness reporting and must not be treated as conversion-ready, investor-ready, or beta-ready without explicit human review:

- legal, Datenschutz, AGB, Impressum, compliance, privacy, consent
- health, watch data, camera, AR, face/pose/biometric, child-safety, location
- token, NFT, wallet, payment, purchase, payout, marketplace, staking, presale, trading
- rewards, XP/points final authority, mission completion authority, anti-cheat, inventory/rare items, leaderboard authority, PvP/competition stakes, betting
- investor claims, public performance/traction/revenue claims, analytics, experiments, personalization, self-improving website behavior

## Website-readiness reports

Future agents should produce website-readiness reports that include:

1. route or route group reviewed
2. current `readinessStatus`
3. leading files and supporting registers used
4. related Website Agents involved
5. known gaps and protected topics
6. next safe task
7. required checks and evidence status
8. human-review-required triggers
9. confirmation that no runtime code, legal wording, auto-merge, auto-repair, approval, deployment, or protected logic changed

Reports should update `project-register/website-readiness.json` only when a scoped documentation/register task authorizes it. They should never rewrite runtime route files on their own.

## Connections to existing governance

This framework extends, rather than duplicates, existing WellFit governance:

- **Product Readiness**: website route statuses must align with module readiness and protected-topic blockers in `project-register/product-readiness.json`.
- **Repository Inventory**: leading/supporting files should stay aligned with `project-register/repository-inventory.json` and inventory checks.
- **Route/API registers**: route entries are validated against `project-register/routes.json`; `/challenge` is explicitly flagged as a review-required alias because the existing registered route is `/missionen/challenge`.
- **Visual Regression**: visual evidence must use `project-register/visual-regression.json` and the existing visual route smoke check.
- **Cross-Reference Maintenance**: governance changes must stay linked through `project-register/cross-reference-maintenance.json`, `todolist/WORK_MAP.md`, and `todolist/TODO_INDEX.md`.
- **Agent Task Queue / Quality Gate**: the report-only website-agent check is integrated into `scripts/wellfit-dev-agent/src/quality-gate.mjs` and should be run before future website-readiness work.

## KI-Fortsetzungs-Prompt

Naechste KI/Codex-Session: Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/website-agents.json`, `project-register/website-readiness.json` und dieses Dokument. Fuehre `node scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs` aus, bevor Website-Readiness-Aenderungen geplant werden. Arbeite nur in bestehenden Registern/Docs, erstelle keine parallele Website-Architektur, und halte legal/privacy/health/child/token/payment/reward/investor/public-claim Themen `review_required`, bis ein menschlicher Review vorliegt.
