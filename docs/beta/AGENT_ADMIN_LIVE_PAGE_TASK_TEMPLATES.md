# Agent Admin Live Page Task Templates

Stand: 2026-05-21  
Status: planning_only

Diese Vorlagen sind fuer spaetere admin-freigebbare Agent Task Proposals gedacht. In diesem PR wird keine Runtime-Ausfuehrung gestartet.

## 1) professional_ui_foundation

- targetTrack: `beta1_live_pages_runtime`
- riskLevel: `medium`
- suggestedBranch: `runtime/beta1-professional-ui-foundation`
- promptRef: `docs/beta/prompts/CODEX_PROMPT_BETA1_PROFESSIONAL_UI_FOUNDATION.md`
- allowedFiles: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`
- blockedFiles: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`, `public/**`
- protectedScopes: child/location/health/privacy/legal, reward-authority, token/nft/payment/cashout/blockchain
- requiredChecks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:validate`
- humanMergeRequired: `true`
- autoMerge: `false`
- autoDeploy: `false`

## 2) points_shop_page

- targetTrack: `beta1_live_pages_runtime`
- riskLevel: `high`
- suggestedBranch: `runtime/beta1-points-shop-page`
- promptRef: `docs/beta/prompts/CODEX_PROMPT_BETA1_POINTS_SHOP_PAGE.md`
- allowedFiles: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`
- blockedFiles: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`
- protectedScopes: payment/iap, token/nft/wft/sui, client final spend authority
- requiredChecks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:quality-gate`
- humanMergeRequired: `true`
- autoMerge: `false`
- autoDeploy: `false`

## 3) leaderboard_readonly

- targetTrack: `beta1_live_pages_runtime`
- riskLevel: `high`
- suggestedBranch: `runtime/beta1-leaderboard-readonly`
- promptRef: `docs/beta/prompts/CODEX_PROMPT_BETA1_LEADERBOARD_READONLY.md`
- allowedFiles: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`
- blockedFiles: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`
- protectedScopes: public child profiles, sensitive location, privacy/opt-out bypass
- requiredChecks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:validate`
- humanMergeRequired: `true`
- autoMerge: `false`
- autoDeploy: `false`

## 4) analytics_stats_own_view

- targetTrack: `beta1_live_pages_runtime`
- riskLevel: `high`
- suggestedBranch: `runtime/beta1-analytics-stats-own-view`
- promptRef: `docs/beta/prompts/CODEX_PROMPT_BETA1_ANALYTICS_STATS_OWN_VIEW.md`
- allowedFiles: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`
- blockedFiles: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`
- protectedScopes: health diagnosis, child/location raw data, foreign user raw data
- requiredChecks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:quality-gate`
- humanMergeRequired: `true`
- autoMerge: `false`
- autoDeploy: `false`

## 5) marketplace_preview

- targetTrack: `beta1_live_pages_runtime`
- riskLevel: `medium`
- suggestedBranch: `runtime/beta1-marketplace-preview-placeholder`
- promptRef: `docs/beta/prompts/CODEX_PROMPT_BETA1_MARKETPLACE_PREVIEW.md`
- allowedFiles: `app/**`, `components/**`, `lib/**`, `docs/beta/**`, `todolist/**`, `project-register/**`
- blockedFiles: `functions/**`, `firestore.rules`, `firebase.json`, `.github/**`, `native/**`
- protectedScopes: trading, wallet connect, nft/token/cashout/payment semantics
- requiredChecks: `npm run lint`, `npm run build`, `git diff --check`, `npm run agent:validate`
- humanMergeRequired: `true`
- autoMerge: `false`
- autoDeploy: `false`
