# Beta-1 Daily Mission Catalog

Status: implemented on branch `runtime/beta1-daily-mission-catalog`; merge requires green Build and complete Beta-1 emulator tests.

## Implemented

- One versioned JSON source for frontend and Functions.
- Ten stable daily mission IDs.
- Admin-only catalog validation and reconciliation.
- Published records in the existing `missions` collection.
- WFXP rewards from 5 to 12.
- Required `daily-user-confirmation` Evidence and server review.
- Child Profiles disabled for this first catalog.
- No token, cashout or monetary value.
- Admin UI control and focused emulator coverage.

## Next task after merge

Migrate the daily mission page from client-side XP, streak, level, points and Buddy writes to the existing Attempt/Evidence/Review/Completion/WFXP runtime while retaining only safe UI preferences such as favorites and daily slot selection.
