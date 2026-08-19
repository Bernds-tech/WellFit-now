# WellFit-now Next Best Action

- Selected action: `WFN-LEGACY-WRITER-MIGRATION-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Verbleibende Legacy-User-Writer inventarisieren und serverautoritativ migrieren

## Why this is next
Closed-Beta session/auth hardening is already merged and repository/runtime gates are green. The highest-risk technical debt still documented in the current runtime truth is the compatibility bridge that permits legacy client writes to user economy/Buddy/progress fields.

## Exact work
1. Inventory every current reader/writer of legacy `users/{uid}` fields: points, xp, level, avatar, energy, stepsToday, lastMissionCompletedAt and deviceLocation plus any remaining Buddy/economy initialization fields.
2. Classify each as `SERVER_AUTHORITY`, `CLIENT_READ_ONLY`, `MIGRATE`, or `REMOVE`.
3. Migrate one bounded writer group at a time behind existing server-authoritative APIs/functions.
4. Add negative/emulator tests proving clients cannot regain reward/completion authority.
5. Do not remove the compatibility bridge until all consumers are proven migrated.
6. Keep WFXP/WFP/XP semantic changes out of this task; that requires its own owner-reviewed decision.

## Parallel-safe work
Project Rail issue #368 fixture coverage can proceed independently because it does not change product runtime.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
