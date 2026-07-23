# Daily State Firestore Hardening — 2026-07-23

Status: implementation branch, awaiting CI and merge.

## Scope

- `userDailyMissionState`, `userDailyStreaks` and `userLevels` are owner-readable legacy projections
- client create, update and delete are denied for all three collections
- daily preferences continue through `saveDailyMissionPreferences`
- daily progress, goal, streak and level continue through `getDailyMissionProgress`
- the broader `users/{userId}` compatibility bridge is intentionally unchanged

## Validation

- static Firestore economy rules check
- focused Firestore Rules Emulator owner/other/anonymous coverage
- complete Beta-1 Firestore and callable emulator suite
- Next.js and TypeScript production build

## Boundaries

- WFXP remain internal Beta-1 points without monetary value or cashout
- no payment, token, NFT or blockchain feature is activated
- no Firebase production deployment or production data write is part of this branch

## Next migration target

Inventory the remaining active writers for `users.points`, `users.xp`, `users.level`, `users.stepsToday`, `users.avatar`, `users.lastMissionCompletedAt`, `users.energy` and `users.deviceLocation`, then migrate one product area at a time before removing any additional rule key.
