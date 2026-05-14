# WORK MAP - WELLFIT

Status: leading topic-to-file map / documentation consolidation  
Date: 2026-05-14  
Scope: map existing work only; do not create new feature architecture from this file.

## How to use this map

- Read `AGENTS.md`, `CURRENT_PROJECT_STATE.md`, this file and `TODO_INDEX.md` before feature work.
- For each topic, continue in the listed existing files.
- If a file looks stale or duplicate, mark/link it in `TODO_INDEX.md` or the relevant leading file; do not delete it.
- If product logic, compliance, rewards, payments, health, child safety, location, camera, privacy, Unity or Firestore authority is involved, treat the work as high-risk and require explicit review.

## Topic map

### 1. App shell / layout / navigation

- **Status:** started / active beta with technical-debt cleanup open.
- **Leading files:**
  - `app/components/AppShell.tsx`
  - `app/AppSidebar.tsx`
  - `app/AppFooter.tsx`
  - `app/components/SidebarLegacyBridge.tsx`
  - `project-register/routes.json`
  - `todolist/PROJECT_STRUCTURE.md`
  - `todolist/CODEBASE_FEATURE_MAP.md`
- **Supporting files:**
  - `app/components/LegalPageLayout.tsx`
  - `app/missionen/components/PreparedMissionPage.tsx`
  - `app/mobile/components/MobileBottomNav.tsx`
  - `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md`
  - `docs/architecture/WELLFIT_NEXT_PHASE_PREP_REPORT.md`
- **Do-not-duplicate warning:** Do not introduce a parallel design system or second app shell. Existing desktop shell, mission shell and mobile shell patterns already exist.
- **Next safe work location:** Small shell consistency changes in `app/components/AppShell.tsx`, `app/AppSidebar.tsx`, `app/AppFooter.tsx`, or route-specific pages after route inventory and visual testing.
- **Risk level:** Medium; visible UI/navigation regressions are likely if changed broadly.

### 2. Dashboard

- **Status:** active beta / started; local preferences implemented, Firestore sync open.
- **Leading files:**
  - `app/dashboard/page.tsx`
  - `app/dashboard/anpassen/page.tsx`
  - `app/dashboard/hooks/useDashboardPreferences.ts`
  - `app/dashboard/components/DashboardSavedCardsPanel.tsx`
  - `todolist/WF-DASH-PERSIST-001 - Dashboard Preferences lokal.md`
  - `project-register/features.json` (`FEATURE-DASHBOARD`)
- **Supporting files:**
  - `app/dashboard/components/*`
  - `app/dashboard/hooks/useDashboardActions.ts`
  - `app/dashboard/hooks/useDashboardUser.ts`
  - `app/dashboard/lib/*`
  - `app/dashboard/types.ts`
  - `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`
- **Do-not-duplicate warning:** Do not build a second dashboard preference model or new dashboard route. Use the existing hook and saved-card panel.
- **Next safe work location:** Browser/test pass for `/dashboard` and `/dashboard/anpassen`; then plan Firestore sync as a separate reviewed task.
- **Risk level:** Medium; dashboard touches projection, points display and user-visible progress.

### 3. Missionen

- **Status:** active beta / partially server-preview integrated.
- **Leading files:**
  - `app/missionen/tagesmissionen/*`
  - `app/missionen/challenge/*`
  - `app/missionen/wochenmissionen/*`
  - `app/missionen/abenteuer/*`
  - `app/missionen/wettkaempfe/*`
  - `app/missionen/favoriten/page.tsx`
  - `app/missionen/history/page.tsx`
  - `todolist/F - FIREBASE  - REALTIME - MISSIONEN`
  - `project-register/features.json` (`FEATURE-MISSIONS`)
- **Supporting files:**
  - `app/missionen/lib/clientMissionHistory.ts`
  - `app/missionen/lib/missionBuddyBridge.ts`
  - `app/missionen/components/MissionStatusBadge.tsx`
  - `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`
  - `docs/architecture/KI_BUDDY_MISSION_ENGINE.md`
  - `docs/architecture/MISSION_TYPES_AND_AR_SIDE_QUESTS.md`
  - `docs/architecture/MISSION_HISTORY_FAVORITES_SIDEQUESTS.md`
  - `docs/architecture/MISSION_UI_STATUS_BADGES.md`
  - `docs/architecture/MISSION_DRAFT_SECURITY_PLAN.md`
  - `docs/architecture/MISSION_DRAFT_PREVIEW_API.md`
  - `docs/architecture/MISSION_DRAFT_FIRESTORE_RULES_DRAFT.md`
  - `docs/architecture/MISSION_DRAFT_EMULATOR_TEST_PLAN.md`
  - `todolist/status/2026-05-12-challenge-economy-path-prepared.md`
  - `todolist/status/2026-05-12-challenge-buddy-consistency-ok.md`
- **Do-not-duplicate warning:** Do not create a new mission system, history system or reward engine. Extend the existing mission folders and server-preview pattern.
- **Next safe work location:** Continue converting MVP/client-only reward flows to existing server preview/completion APIs and history/favorites bridge.
- **Risk level:** High; mission completion and rewards must not become client-authoritative.

### 4. Buddy / KI buddy

- **Status:** active beta as guide/suggestion system; provider path prepared; no reward authority.
- **Leading files:**
  - `app/buddy/page.tsx`
  - `app/buddy/components/*`
  - `app/buddy/hooks/useBuddyState.ts`
  - `app/buddy/lib/*`
  - `app/api/buddy-ki/route.ts`
  - `todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE`
  - `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md`
- **Supporting files:**
  - `app/mobile/buddy/page.tsx`
  - `app/mobile/ar/page.tsx`
  - `docs/architecture/BUDDY_KI_INTEGRATION.md`
  - `docs/architecture/BUDDY_KI_GUIDE_DATA_MODEL.md`
  - `docs/architecture/BUDDY_KI_MODEL_PROVIDER_RUNBOOK.md`
  - `docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md`
  - `todolist/ROADMAP_BUDDY_PHASES_ADDENDUM`
  - `todolist/J1 - ISSUE 8 AR-BUDDY MICRO-TASK LOG`
- **Do-not-duplicate warning:** Do not create a second Buddy state store, second KI endpoint or client-side provider secret path.
- **Next safe work location:** Existing Buddy components/libs and `/api/buddy-ki` for suggestion-only guide behavior.
- **Risk level:** Medium/High; provider secrets and reward suggestions need strict server/no-authority boundaries.

### 5. Mobile web

- **Status:** active beta.
- **Leading files:**
  - `app/mobile/page.tsx`
  - `app/mobile/components/MobileBottomNav.tsx`
  - `app/mobile/components/MobileHeader.tsx`
  - `app/mobile/components/MobileFocusCards.tsx`
  - `app/mobile/components/MobileQuickActions.tsx`
  - `app/mobile/lib/mobileHome.ts`
  - `app/mobile/types.ts`
  - `project-register/routes.json` mobile pages
  - `project-register/features.json` (`FEATURE-MOBILE-WEB`)
- **Supporting files:**
  - `app/mobile/analyse/page.tsx`
  - `app/mobile/ar/page.tsx`
  - `app/mobile/bewegung/page.tsx`
  - `app/mobile/buddy/page.tsx`
  - `app/mobile/einstellungen/page.tsx`
  - `app/mobile/missionen/page.tsx`
  - `todolist/H - MOBILE - AR - TRACKING - KI`
  - `todolist/status/2026-04-26-mobile-wettkaempfe-http-200-ok.md`
- **Do-not-duplicate warning:** Do not create a separate mobile app shell inside desktop components. Do not add token/NFT/trading/presale flows to mobile beta.
- **Next safe work location:** Existing `app/mobile/*` pages and components; keep WebGL/AR demos clearly fallback/demo where relevant.
- **Risk level:** Medium/High due to mobile app-store/compliance language and tracking/privacy implications.

### 6. AR / Unity / WellFitBuddyAR

- **Status:** started / isolated / high-risk; native AR is not part of normal web beta work.
- **Leading files:**
  - `native/unity/WellFitBuddyAR/` (do not touch unless explicitly requested)
  - `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY`
  - `todolist/J1 - ISSUE 8 AR-BUDDY MICRO-TASK LOG`
  - `todolist/status/2026-04-27-ar-event-contract-prepared.md`
- **Supporting files:**
  - `todolist/J8.2 - AR BUDDY EVENT SECURITY ADDENDUM.md`
  - `todolist/J8.3 - AR RAETSELRALLYE REWARD ALGORITHMUS ADDENDUM.md`
  - `docs/architecture/AR_CONTEXTUAL_MISSION_REWARD_FLOW.md`
  - `docs/architecture/AR_LOCATION_RADIUS_AND_RALLY_GENERATION.md`
  - `docs/architecture/AR_QUESTION_EVIDENCE_EVENT.md`
  - `docs/architecture/AR_QUESTION_MEMORY_MODEL.md`
  - `docs/architecture/AR_REWARD_POLICY_INPUT.md`
  - `docs/architecture/AR_REWARD_PREVIEW_API.md`
  - `docs/architecture/AR_REWARD_LEDGER_EVENT.md`
  - `docs/architecture/AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md`
  - `docs/architecture/AR_RIDDLE_FIRESTORE_RULES_DRAFT.md`
  - `docs/architecture/AR_RIDDLE_EMULATOR_TEST_PLAN.md`
- **Do-not-duplicate warning:** Do not recreate Unity project files, overwrite Unity scripts, or mix old PR #13 into current work. Unity emits events only; app/backend decide mission/reward/anti-cheat.
- **Next safe work location:** Documentation/contract alignment only unless an explicit Unity task is requested; web fallback remains under `app/mobile/ar/page.tsx`.
- **Risk level:** High.

### 7. Economy / points / rewards

- **Status:** active draft/preview; internal points only; final ledger authority open.
- **Leading files:**
  - `app/api/economy/*`
  - `app/dashboard/lib/serverPreviewApi.ts`
  - `app/dashboard/lib/serverProjectionApi.ts`
  - `app/missionen/*/server*Api.ts`
  - `app/punkte-shop/ShopSpendPreviewPanel.tsx`
  - `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS`
  - `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`
  - `project-register/apis.json`
  - `project-register/features.json` (`FEATURE-ECONOMY-PREVIEW-APIS`)
- **Supporting files:**
  - `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`
  - `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md`
  - `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`
  - `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md`
  - `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md`
  - `todolist/status/2026-04-27-consolidated-security-reward-status.md`
  - `todolist/status/2026-05-12-points-shop-paid-points-backlog-not-active.md`
- **Do-not-duplicate warning:** Do not create new economy APIs, ledgers, paid-points logic or token/wallet paths outside the existing preview/draft architecture.
- **Next safe work location:** Existing economy API routes and documented hardening path, with tests and no final write authority unless approved.
- **Risk level:** High.

### 8. Firebase / backend / Firestore

- **Status:** started / emulator-backed guardrails in place; hardening open.
- **Leading files:**
  - `functions/index.js`
  - `functions/lib/missionRewardPolicy.js`
  - `functions/lib/missionEvidenceReview.js`
  - `functions/lib/missionPatternReview.js`
  - `functions/lib/missionCooldownReview.js`
  - `functions/lib/missionContext.js`
  - `firestore.rules`
  - `functions/test/*`
  - `todolist/DATABASE_PLAN.md`
- **Supporting files:**
  - `functions/EMULATOR_TEST_PLAN.md`
  - `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md`
  - `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`
  - `docs/architecture/USER_ECONOMY_WRITE_SEARCH_NOTES.md`
  - `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md`
  - `todolist/status/2026-05-10-firestore-economy-emulator-pass.md`
  - `todolist/status/2026-05-10-firestore-economy-rules-guardrail-check-prepared.md`
  - cooldown/evidence/pattern/reward status notes under `todolist/status/`.
- **Do-not-duplicate warning:** Do not add parallel backend authority paths. Do not loosen Firestore rules without an emulator/regression plan.
- **Next safe work location:** Existing Functions libs/tests and Firestore hardening docs.
- **Risk level:** High.

### 9. Auth / users / profile

- **Status:** started / beta forms and settings/profile UI exist; final data model still open.
- **Leading files:**
  - `app/register/*`
  - `app/components/login/*`
  - `app/components/UserProfileBadge.tsx`
  - `app/einstellungen/*`
  - `app/dashboard/hooks/useDashboardUser.ts`
  - `app/dashboard/lib/dashboardUser.ts`
  - `todolist/B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT`
  - `todolist/DATABASE_PLAN.md`
- **Supporting files:**
  - `project-register/routes.json` (`/register`, `/einstellungen`)
  - `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`
  - `todolist/CHAT_START_PROMPT.md`
- **Do-not-duplicate warning:** Do not add a second registration/profile flow or expose secrets/provider keys to client auth code.
- **Next safe work location:** Existing register/settings/profile components and documented database plan.
- **Risk level:** Medium/High because profile settings may touch biometrics, privacy and consent.

### 10. Marketplace / points shop

- **Status:** points shop active beta sink preview; marketplace placeholder/review-required; paid points inactive backlog.
- **Leading files:**
  - `app/punkte-shop/page.tsx`
  - `app/punkte-shop/ShopSpendPreviewPanel.tsx`
  - `app/marktplatz/page.tsx`
  - `app/api/economy/spend-preview/route.ts`
  - `project-register/features.json` (`FEATURE-POINTS-SHOP`, `FEATURE-MARKETPLACE`)
  - `todolist/status/2026-05-12-points-shop-paid-points-backlog-not-active.md`
- **Supporting files:**
  - `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`
  - `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md`
  - `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md`
  - `docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md`
  - `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`
- **Do-not-duplicate warning:** Do not activate real purchases, wallet, NFT, token transfers, payout or trading. Do not create another shop/economy route.
- **Next safe work location:** Existing points shop spend-preview UI/API as internal beta sink only.
- **Risk level:** High.

### 11. Competitions / PvP / betting-sensitive areas

- **Status:** started/planned with guardrails; no betting/payout authority.
- **Leading files:**
  - `app/missionen/wettkaempfe/page.tsx`
  - `app/missionen/wettkaempfe/GoogleCompetitionMap.tsx`
  - `docs/architecture/COMPETITION_INTERNAL_STAKES_GUARDRAILS.md`
  - `docs/architecture/AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md`
  - `project-register/routes.json` (`/missionen/wettkaempfe`, `/leaderboard`)
- **Supporting files:**
  - `app/leaderboard/page.tsx`
  - `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS`
  - `todolist/status/2026-04-26-mobile-wettkaempfe-http-200-ok.md`
  - `todolist/status/2026-05-12-roadmap-consolidation-master-upload-done.md`
- **Do-not-duplicate warning:** Do not build betting, spectator bets, payouts, token stakes or real-money PvP. Internal stakes must remain guarded/draft.
- **Next safe work location:** Existing Wettkämpfe/leaderboard UI and guardrail docs only.
- **Risk level:** High.

### 12. Analytics / feedback loop

- **Status:** active beta / planning for quality audit and feedback loops.
- **Leading files:**
  - `app/analytics/page.tsx`
  - `app/mobile/analyse/page.tsx`
  - `project-register/features.json` (`FEATURE-ANALYTICS`)
  - `docs/architecture/WELLFIT_SITE_QUALITY_AUDIT_AGENT.md`
  - `scripts/wellfit-dev-agent/src/site-quality-audit.mjs`
- **Supporting files:**
  - `scripts/wellfit-dev-agent/src/code-inventory.mjs`
  - `scripts/wellfit-dev-agent/src/quality-gate.mjs`
  - `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md`
  - `todolist/CHAT_START_AGENT_AND_CODER_ADDENDUM.md`
- **Do-not-duplicate warning:** Do not add real user tracking, heatmaps or session replay without privacy/consent review.
- **Next safe work location:** Local static/site quality audit agent and existing analytics pages.
- **Risk level:** Medium/High due to privacy implications.

### 13. Legal / privacy / compliance

- **Status:** active pages; compliance logic/text changes high-risk.
- **Leading files:**
  - `app/datenschutz/page.tsx`
  - `app/agb/page.tsx`
  - `app/impressum/page.tsx`
  - `app/faq/page.tsx`
  - `app/hilfe/page.tsx`
  - `app/components/LegalPageLayout.tsx`
  - `project-register/features.json` (`FEATURE-LEGAL`)
- **Supporting files:**
  - `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`
  - `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md`
  - `AGENTS.md`
  - `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`
- **Do-not-duplicate warning:** Do not create alternate legal pages or change compliance messaging casually. No token/NFT/payment/health claims without explicit review.
- **Next safe work location:** Existing legal pages/layout only when explicitly requested.
- **Risk level:** High.

### 14. Agents / quality gate / governance

- **Status:** active governance system.
- **Leading files:**
  - `AGENTS.md`
  - `agents/AGENTS.md`
  - `todolist/MASTER_PROMPT_FOR_AI.md`
  - `todolist/TODO_INDEX.md`
  - `todolist/NEXT_ACTIONS.md`
  - `todolist/CURRENT_PROJECT_STATE.md`
  - `todolist/WORK_MAP.md`
  - `scripts/wellfit-dev-agent/wellfit-agent.config.json`
  - `scripts/wellfit-dev-agent/src/quality-gate.mjs`
- **Supporting files:**
  - `agents/modes/*.md`
  - `agents/self-check.md`
  - `agents/security-rules.md`
  - `agents/documentation-rules.md`
  - `agents/failure-recovery-rules.md`
  - `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md`
  - `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md`
  - `docs/architecture/WELLFIT_SITE_QUALITY_AUDIT_AGENT.md`
- **Do-not-duplicate warning:** Do not create a new governance index outside the existing TODO/register/agent structure.
- **Next safe work location:** `todolist/` and existing `project-register/` files for documentation-only governance updates.
- **Risk level:** Medium.

### 15. Docs / concept / investor materials

- **Status:** historical plus active planning; preserve context.
- **Leading files:**
  - `todolist/MASTER_OPEN_DONE_LIST.md`
  - `todolist/TODO_CONSOLIDATION.md`
  - `todolist/PROJECT_STRUCTURE.md`
  - `todolist/CODEBASE_FEATURE_MAP.md`
  - `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md`
  - `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md`
  - `docs/architecture/WELLFIT_NEXT_PHASE_PREP_REPORT.md`
- **Supporting files:**
  - `todolist/A - MASTER-REGELN - STATUSSYSTEM`
  - `todolist/B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT`
  - `todolist/C - STRATEGISCHE GRUNDENTSCHEIDUNGEN`
  - `todolist/D - VERBINDLICHE REIHENFOLGE`
  - `todolist/E - AKTUELLER UMSETZUNGSSTAND - VORHANDEN`
  - `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`
  - `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`
  - `todolist/status/*.md`
- **Do-not-duplicate warning:** Do not create a new master roadmap unless explicitly asked. Preserve historical roadmap files and add leading links instead.
- **Next safe work location:** Existing TODO index/current-state/work-map files for consolidation; existing architecture docs for topic-specific planning.
- **Risk level:** Medium.

## File status guidance

- **Leading/current:** `CURRENT_PROJECT_STATE.md`, `WORK_MAP.md`, `TODO_INDEX.md`, `NEXT_ACTIONS.md`, `PROJECT_STRUCTURE.md`, `CODEBASE_FEATURE_MAP.md`, `MASTER_OPEN_DONE_LIST.md`, project-register JSON files.
- **Historical/supporting:** legacy lettered roadmap files (`A` through `J`), addenda, status notes and chat prompts. Keep them for context and link them to leading files.
- **Duplicate/stale handling:** mark as `duplikat`, `veraltet` or `historisch` in `TODO_INDEX.md` or local top notes when needed; never delete.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `todolist/PROJECT_STRUCTURE.md`, `todolist/CODEBASE_FEATURE_MAP.md` und die `project-register/*.json` Dateien. Nutze diese Work Map, um bestehende fuehrende Dateien und naechste sichere Arbeitsorte zu finden. Erstelle keine parallelen Systeme und loesche keine historischen TODO-, Status- oder Architekturdateien.
