# WellFit Beta-1 Daily Mission Catalog

Status: canonical catalog implementation on branch `runtime/beta1-daily-mission-catalog`

## Single source

The canonical source for the first ten daily missions is:

`functions/config/beta1-daily-missions.json`

Both the Next.js daily-mission UI and Firebase Functions import this file. IDs, titles, descriptions, difficulty, duration, display type, server type, WFXP amount and evidence policy therefore cannot drift independently.

## Catalog boundaries

Every catalog entry must satisfy:

- unique stable `missionId`;
- WFXP reward between 1 and 100;
- one approved display type;
- one approved server mission type;
- `evidenceType = daily-user-confirmation`;
- `reviewRequired = true`;
- `childAllowed = false` for this first Beta-1 catalog;
- no monetary value;
- no token authorization;
- no cashout.

The current catalog contains ten missions with rewards from 5 to 12 WFXP.

## Admin publication

`adminEnsureDailyMissionCatalog` is admin-only. It validates the entire bundled catalog before writing. If one entry violates a required field or safety boundary, no catalog reconciliation is performed.

A successful reconciliation writes the ten stable IDs into the existing `missions` collection as published missions and records:

- catalog ID and version;
- canonical mission and display types;
- WFXP reward;
- child-disabled state;
- evidence policy with server review required;
- no raw-media requirement;
- no monetary, token or cashout authority.

Repeated reconciliation updates the same stable mission documents and does not create duplicate mission IDs.

## Runtime relationship

Catalog publication does not authorize completion or WFXP. The existing runtime remains:

`startMissionAttempt -> submitMissionEvidence -> adminReviewMissionEvidence -> completeMissionAttempt -> WFXP ledger`

Daily mission UI migration must use that same runtime. It must not restore the previous client-side XP, streak, level, points or Buddy writes.

## Admin UI

`/admin/beta1` includes a dedicated catalog card. It shows the catalog scope and invokes the admin-only reconciliation callable. The browser is only a control surface; Functions retain publication authority.

## Emulator evidence

`functions/test/beta1DailyMissionCatalogEmulatorTest.js` verifies:

- non-admin rejection;
- ten validated catalog entries;
- WFXP/no-token/no-cashout boundaries;
- disabled child profiles;
- published Firestore records and evidence policy;
- visibility through the existing `listMissions` callable;
- server-side attempt creation;
- idempotent reconciliation without duplicate records;
- admin audit creation.

The test is included in the existing Beta-1 emulator workflow.
