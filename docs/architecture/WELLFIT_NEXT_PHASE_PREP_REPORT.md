# WellFit Next Phase Preparation Report

Status: 2026-05-14  
Scope: Stabilize and organize the existing WellFit app before continuing mission features.  
Change level: low-risk cleanup plus documentation. No new mission features were implemented.

## 1. App structure and routes inspected

Current app structure uses the Next.js App Router under `app/`.

Observed route groups:

- Public entry/legal/help: `/`, `/register`, `/datenschutz`, `/agb`, `/impressum`, `/faq`, `/hilfe`.
- Desktop beta app: `/dashboard`, `/dashboard/anpassen`, `/buddy`, `/missionen/*`, `/punkte-shop`, `/marktplatz`, `/leaderboard`, `/analytics`, `/einstellungen`.
- Mobile beta app: `/mobile`, `/mobile/analyse`, `/mobile/ar`, `/mobile/bewegung`, `/mobile/buddy`, `/mobile/einstellungen`, `/mobile/missionen`, `/mobile/missionen/squat`.
- API routes: `/api/buddy-ki` plus economy preview/status routes under `/api/economy/*`.

Relevant shared layout components found:

- `app/components/AppShell.tsx` combines `AppSidebar`, shared background, content frame and `AppFooter`.
- `app/AppSidebar.tsx` is the main desktop navigation and brightness control shell.
- `app/AppFooter.tsx` is the shared desktop footer/reward strip.
- `app/components/LegalPageLayout.tsx` is used by the legal pages.
- `app/missionen/components/PreparedMissionPage.tsx` is a mission-specific shell that duplicates parts of `AppShell` intentionally for prepared mission routes.
- `app/mobile/components/MobileBottomNav.tsx` is the mobile bottom navigation.

## 2. Header, sidebar and footer consistency

Findings:

- `AppShell` is the cleanest reusable desktop shell and should be the preferred target for future non-special desktop pages.
- Dashboard, Buddy, Einstellungen, Tagesmissionen and several mission pages still compose their own shell with `AppSidebar` directly. This is not immediately unsafe, but it creates duplicated layout patterns.
- `PreparedMissionPage` deliberately keeps a mission-specific header/tabs/footer structure and should not be deleted during cleanup.
- Mobile pages use separate mobile navigation and should not be forced into the desktop shell.
- Legal pages use `LegalPageLayout` and should remain separate from authenticated/beta app chrome.

Safe next action: gradually migrate only simple desktop pages to `AppShell` when touching them for another reason. Do not do a broad layout rewrite.

## 3. Duplicate or obsolete code found

No risky code was deleted.

Low-risk cleanup completed:

- Removed React lint violations caused by synchronous state initialization in effects where state could safely be initialized lazily or derived.
- Removed unused local variables/parameters in local agent scripts.
- Kept the visual UI and routes unchanged.

Items to keep under review, not delete now:

- Multiple desktop shell patterns exist (`AppShell`, direct `AppSidebar`, mission-specific `PreparedMissionPage`). Treat as technical debt, not dead code.
- `SidebarLegacyBridge` still exists in the root layout and should be reviewed before any removal because it may support older navigation behavior.
- Unity `.disabled` C# files look intentional and should remain until a Unity-specific review confirms otherwise.
- `.vscode` files exist under `native/unity/WellFitBuddyAR`; do not commit new unrelated `.vscode` changes.

## 4. TODO/list/planning summary

Leading planning sources remain:

- `todolist/NEXT_ACTIONS.md`
- `todolist/TODO_INDEX.md`
- `todolist/TODO_CONSOLIDATION.md`
- `todolist/PROJECT_STRUCTURE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `project-register/routes.json`
- `project-register/apis.json`
- `project-register/features.json`

Open technical themes before larger mission work:

1. Reconfirm build/server/install stability after each baseline cleanup.
2. Continue TODO/list consolidation by marking stale/duplicate files rather than deleting them.
3. Keep beta-facing economy wording limited to internal points/XP and draft/preview flows.
4. Continue moving mission reward/completion authority away from client-side MVP paths toward server-side previews, ledger drafts and Firestore/Functions hardening.
5. Review dashboard/navigation shell duplication gradually.
6. Keep health, location, camera, child-safety and consent work review-gated.
7. Keep blockchain, token, NFT, wallet, trading, presale, payout and real betting work out of active mobile/beta flows.

## 5. WellFitBuddyAR / Unity status

`native/unity/WellFitBuddyAR` is present and was not modified.

Observed state:

- Unity docs, runbooks, bridge contracts and setup checklists are present.
- `Scripts/*.cs.txt` contains templates for core AR bridge/controller classes.
- `Assets/Scripts` contains a smaller live/disabled subset.
- Template scripts not currently present as live or disabled `Assets/Scripts/*.cs` basenames include:
  - `BuddyAbilityController.cs`
  - `BuddyAnchorController.cs`
  - `BuddyController.cs`
  - `BuddyDialogueEventBridge.cs`
  - `BuddyInputController.cs`
  - `BuddyKiGuideController.cs`
  - `BuddyLookAtCamera.cs`
  - `BuddyNavigationController.cs`
  - `WellFitNativeBridge.cs`
- Extra live/disabled asset scripts without direct template basename matches include:
  - `BuddyCallDebugController.cs`
  - `BuddyCompanionAutoReturnController.cs`
  - `BuddyDebugSceneBootstrap.cs`
  - `SimpleARPlacementTest.cs`

Risk note: some live Unity scripts reference bridge/anchor classes that currently appear only as templates. Do not overwrite or delete Unity files. Next Unity work should be a dedicated Unity delta/compile-readiness task.

## 6. Checks run

- Dependency check: `node_modules`, `node_modules/.bin/eslint` and `node_modules/.bin/next` were present, so `npm install` was skipped.
- `npm run lint`: passed after low-risk cleanup.
- `npm --prefix functions run check`: passed.
- `npm run build`: failed because this environment cannot fetch Google Fonts through `next/font` from `fonts.googleapis.com` (`CONNECT tunnel failed, response 403` confirmed with `curl`). This is an environment/network limitation, not caused by the cleanup changes.

## 7. Prioritized roadmap for next coding tasks

1. **Build environment unblock (low/medium risk)**: decide whether local/CI builds should keep using Google font fetches or switch to a local-font fallback. This affects `app/layout.tsx` and should preserve the current visual identity.
2. **Route/register alignment (low risk)**: run or update route/API inventory and reconcile generated route counts with `project-register/*` and `todolist/LAST_BUILD_STATUS.md`.
3. **Desktop shell consolidation plan (medium risk)**: document which pages should use `AppShell` and only migrate one low-risk page at a time.
4. **Mission authority hardening (medium/high risk)**: continue server-side mission completion, ledger draft, Firestore rules and emulator test work before adding new mission features.
5. **Unity AR readiness report (low risk analysis, medium risk implementation)**: compare Unity templates and live assets, identify compile blockers, and keep PR #13 untouched.
6. **Beta wording pass (low/medium risk)**: review visible mission/shop/marketplace/competition wording for premature token/NFT/wallet/payment/betting language without changing compliance-critical logic.

## KI-Fortsetzungs-Prompt

Lies vor der naechsten Entwicklungsphase zuerst `todolist/LAST_BUILD_STATUS.md`, `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md` und die Projektregister. Nutze diesen Report nur als historischen Vorbereitungsnachweis nach PR #41-#43: Routen, Shells und Unity wurden inventarisiert, aber Produktlogik wurde nicht veraendert. Fuehre neue Baseline-Ergebnisse in `todolist/LAST_BUILD_STATUS.md` fort und halte Unity/PR #13 sowie Token-, NFT-, Wallet-, Payment-, Reward-Authority-, Health-, Child-, Location-, Privacy- und Compliance-Logik reviewpflichtig.
