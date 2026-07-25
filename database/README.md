# WellFit versioned Firestore migrations and seeds

Updated: 2026-07-25  
Status: executable GitHub package; no production database operation performed

## Purpose

This directory makes the current Firestore baseline reproducible without turning GitHub into a secret store or allowing an accidental production write.

It provides:

- ordered migration and seed manifests;
- SHA-256 integrity checks over every operation module and its source files;
- dry-run as the default;
- explicit project confirmation before a real write;
- a transactional lease against parallel operators;
- completed, failed and retryable operation records;
- idempotent migrations;
- reconciling seeds that upsert stable document IDs without creating duplicates;
- emulator coverage for the complete package.

The runtime continues to use internal, non-monetary `WFXP`. It is not silently renamed to Canonical-Truth `WFP` or avatar `XP`; that owner decision remains a separate migration gate.

## Structure

```text
database/
├── manifests/
│   ├── migrations.json
│   └── seeds.json
├── migrations/
├── seeds/
├── lib/
└── README.md

functions/scripts/database/
└── runDatabaseOperation.js
```

The canonical mission source remains under `functions/config/`. Seeds reference those existing files; they do not create a second catalog.

## Dry-run

Dry-run performs reads and builds a plan but writes nothing:

```bash
npm run database:validate
npm --prefix functions run database:migrations:plan
npm --prefix functions run database:seeds:plan
```

A single operation can be selected:

```bash
node functions/scripts/database/runDatabaseOperation.js \
  --kind=migration \
  --id=20260725_001_remove_legacy_user_economy_fields \
  --json
```

## Emulator execution

```bash
npx firebase emulators:exec \
  --only firestore \
  --project demo-no-project \
  "npm --prefix functions run database:emulator"
```

The GitHub workflow uses only this emulator path. It contains no deployment command and no production credentials.

## Production execution gate

A future production operator must use the exact tested Git commit and set all approval fields:

```bash
export GCLOUD_PROJECT="<firebase-project-id>"
export WELLFIT_DATABASE_EXECUTION_APPROVED=true
export WELLFIT_DATABASE_TARGET_PROJECT="<firebase-project-id>"
export WELLFIT_DATABASE_OPERATOR="<named-operator>"
export WELLFIT_DATABASE_CHANGE_TICKET="<approved-change-ticket>"
export WELLFIT_RELEASE_SHA="<full-40-character-git-sha>"

npm --prefix functions run database:migrations:plan

node functions/scripts/database/runDatabaseOperation.js \
  --kind=migration \
  --all \
  --execute \
  --confirm-project="<firebase-project-id>"
```

Destructive migrations also require both:

```bash
export WELLFIT_DATABASE_ALLOW_DESTRUCTIVE=true

node functions/scripts/database/runDatabaseOperation.js \
  --kind=migration \
  --all \
  --execute \
  --allow-destructive \
  --confirm-project="<firebase-project-id>"
```

Seed execution uses the same production gate:

```bash
node functions/scripts/database/runDatabaseOperation.js \
  --kind=seed \
  --all \
  --execute \
  --confirm-project="<firebase-project-id>"
```

## Runtime records

All records are Firebase Admin only and remain denied by the Firestore client default-deny fallback:

```text
databaseMigrationRuns/{migrationId}
databaseSeedRuns/{seedId}
databaseOperationLeases/{kind}
databaseOperationAudit/{auditId}
databaseSchemaState/current
```

Migrations with status `completed` and an unchanged checksum are skipped on repeat. A checksum change under an already completed migration ID is rejected.

Seeds intentionally reconcile on repeat. They merge canonical data into stable IDs such as `missions/daily-squats-15`; missing catalog documents are never deleted automatically.

## Initial migrations

1. Remove legacy client-authorized economy fields from `users`.
2. Backfill active account-lifecycle authority records.
3. Remove forbidden raw health/free-text/medication details from private profiles.
4. Normalize WFXP wallet and ledger safety metadata.
5. Record the current schema baseline and the still-open WFXP/WFP/XP terminology decision.

The two privacy/economy cleanup migrations are marked destructive because they delete legacy fields. Their production execution requires the additional destructive approval gate.

## Initial seeds

The seed manifest reconciles:

- ten daily missions;
- three weekly missions;
- six location-based Challenges;
- four location-based Adventures.

No mission location coordinates are seeded. Real places must first pass the existing location safety review and publication process; a generic database script may not invent or publish locations.

## Rollback and recovery

Firestore migrations are not treated like reversible SQL DDL. Before production execution:

1. export the affected collections;
2. retain the release manifest and checksums;
3. run the plan against staging;
4. review operation and warning counts;
5. execute one ordered entry at a time;
6. verify the run record and application smoke tests.

A failed run keeps a `failed` record and releases its lease. After correcting the cause, the same checksum can be retried. Never overwrite a live database with an unverified backup as an improvised rollback.
