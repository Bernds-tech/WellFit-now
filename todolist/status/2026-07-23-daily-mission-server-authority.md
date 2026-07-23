# Daily Mission Server Authority — 2026-07-23

Status: implementation branch, awaiting CI and merge.

## Scope

- canonical Beta-1 daily mission catalog remains the only source of mission IDs, WFXP values and evidence policy
- daily preferences are written through authenticated Firebase callables
- progress, daily goal, streak and level are derived from server-owned mission completions and the WFXP wallet
- mission start reuses one unresolved attempt and applies a once-per-mission-per-Vienna-day boundary
- only `daily-user-confirmation` evidence is accepted for the daily catalog
- evidence remains pending until an admin decision; the browser grants no WFXP
- completion uses the existing mission completion and WFXP ledger runtime
- deterministic ledger idempotency blocks duplicate daily rewards even when a second attempt is injected
- the daily mission UI no longer writes XP, level, streak, mission completion, points or Buddy state

## Validation target

- repository product-boundary check
- Next.js and TypeScript production build
- Firebase Functions syntax/startup checks
- complete Beta-1 Firestore/callable emulator suite
- focused daily mission authority suite covering ownership, preference validation, review, completion, streak projection and duplicate-reward prevention

## Safety boundaries

- WFXP are internal Beta-1 points with no monetary value
- no token, NFT, payment, cashout or blockchain behavior is activated
- no Firebase deployment or production data write is part of this branch
- child profiles remain disabled for the first daily mission catalog

## Follow-up after merge

Harden the legacy `userDailyMissionState`, `userDailyStreaks` and `userLevels` Firestore rules to read-only after the merged UI path is verified green. The broader `users` temporary economy bridge remains a separate repository-wide migration because unrelated screens may still depend on it.
