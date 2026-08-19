# WellFit-now Real Work Baseline — 2026-08-19

## What is actually implemented

### Product/Web shell
- Public landing, registration, login, password reset, FAQ/help/legal routes.
- Authenticated dashboard, settings, missions, Buddy, points shop, leaderboard, analytics and mobile-web surfaces.
- Mobile-web camera/AR fallback and squat/pose flow.
- Landing/UI implementation still physically lives here even though `Bernds-tech/WellFit` is the intended future visual authority.

### Closed-Beta account/security work
Merged PRs #369-#371 provide:
- self-registration age floor of 16;
- email-verification, onboarding and active-account gating before app access;
- server-managed HttpOnly web sessions;
- immediate revocation / logout-all-devices;
- server guards for dashboard/admin/Buddy/economy routes;
- session UID binding for economy preview endpoints;
- maximum active-session handling and device-session management;
- coarse device/browser labels without storing IP/location for session display.

### Missions and internal economy
- Server-authoritative mission lifecycle: `attempt -> evidence -> admin review -> completion -> internal ledger -> internal wallet`.
- Daily/weekly/challenge/adventure foundations and worldwide location-aware mission logic.
- Idempotent/replay-protected reward writes, audit events and protected collection boundaries.
- Internal balance currently uses `WFXP` in runtime; no monetary value, no cash-out, no blockchain/token authority.
- Canonical product terminology still requires explicit reconciliation because product truth separates spendable WFP from avatar XP.

### Buddy/backend
- Server-authoritative Buddy projections/actions for feeding, care, play, cleaning, calling and recovery search.
- Rules-based `/api/buddy-ki` fallback is known to work; remote model-provider activation remains a separate external/config task.
- Buddy/AI may suggest or guide but does not authorize rewards or mission completion.

### Location and privacy-safe mission foundations
- Worldwide published mission locations, geo-cell search, exact distance checks and location safety review fingerprints.
- Raw location is intended to be transient for proximity decisions rather than persisted in mission evidence/completions.

### Native/AR code physically present here
- `native/unity/WellFitBuddyAR` contains a real Unity project structure with Assets, Packages, ProjectSettings, Scripts, docs and tools.
- Existing issues #4/#8 describe first-device ARCore validation and movement/world-tracking goals.
- This code has not yet been migrated to the intended native authority repo `Bernds-tech/WellFit-Buddy`.

### Governance/Agent OS
- Project Rail control plane is merged (PR #367): planning gate, lifecycle, file ownership, dry-run dispatcher, completion-sync dry run and CI.
- Issue #368 remains a real open next wave for deterministic positive/negative fixtures and fail-closed coverage before higher autonomy.

## Important open product work

1. Separate/finish consent and health-adjacent personalization choices; do not default sensitive personalization silently.
2. Inventory and migrate remaining legacy `users/*` economy/Buddy writers; then remove temporary client-write compatibility fields.
3. Complete account data export, deletion/anonymization and consent withdrawal.
4. Resolve WFXP vs WFP/XP terminology/data-model migration by explicit owner decision.
5. Baseline remote Buddy-AI provider only server-side and verify fallback.
6. Collect real-device Mobile/PWA/Pose evidence.
7. Validate native ARCore/Unity on a real device; do not treat emulator/build success as AR acceptance.
8. Migrate/reconcile visual and native code ownership with WellFit and WellFit-Buddy without duplication.
9. Build privacy-safe pilot telemetry and later a non-crypto partner reward/redemption path.
10. Keep token/NFT/trading/payment authority out of the current beta.

## Current open GitHub work that still matters
- #368 Project Rail Wave 2 fixtures/fail-closed coverage.
- #3 settings refactor continuation.
- #1 mission UI alignment + later Firestore migration/realtime mission sync.
- #4 first real Android ARCore Buddy build/device test.
- #5 remote Buddy-KI provider activation/test.
- #6 mobile AR web fallback device test.
- #7 scalability architecture guardrails.
- #8 AR Buddy movement/world-tracking behavior.
- #9 desktop/web Buddy guide.
- #10 contextual AR puzzles/object recognition/question memory.
- #11 mission logic for existing mission pages.

## Do not assume
- No Production environment/operational deployment acceptance is proven by repository builds.
- No paid pilot, partner redemption, legal acceptance or real-user retention evidence is proven here.
- Do not silently merge WFXP, WFP and XP semantics.
- Do not claim native ownership has moved to WellFit-Buddy yet.
