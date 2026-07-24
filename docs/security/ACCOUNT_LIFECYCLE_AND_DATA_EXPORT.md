# WellFit Account Lifecycle, Data Export and Deletion Processor

Updated: 2026-07-24
Status: implemented in code; production deployment not performed

## Purpose

This module provides the closed-beta account lifecycle required before a real pilot:

- privacy-safe user data export;
- recent-auth protection for sensitive actions;
- revocation of Firebase refresh sessions;
- a cancellable account-deletion request;
- a seven-day grace period;
- mutation freeze for the server-authoritative WFXP ledger;
- Guardian dependency protection for active child profiles;
- an admin-authorized Dry-Run and irreversible deletion processor;
- audit evidence for export, deletion request and cancellation;
- a minimal, non-identifying deletion tombstone.

It does not activate a token, wallet transfer, payment, payout, NFT or blockchain function.

## Runtime collections

All lifecycle collections are Firebase Admin / callable-only and fall through to the Firestore default-deny rule:

- `accountLifecycleRecords/{userId}`
- `userDataExportJobs/{userId}`
- `userDataExportChunks/{userId}__{chunkIndex}`
- `accountDeletionTombstones/{randomDeletionId}`

The browser cannot directly create, read, update or delete these documents.

## Data export flow

1. The Firebase client reauthenticates the current email/password user.
2. `requestUserDataExport` verifies the recent Firebase `auth_time` claim.
3. The server reads only user-scoped account, consent, private-profile, Buddy, mission, WFXP, inventory, family and audit records.
4. Audit records are selected by subject/owner scope; an administrator acting on another user does not pull that other user's target metadata into the administrator's export.
5. Firestore timestamps and supported values are converted to JSON-safe values.
6. The export is split into bounded JSON chunks.
7. Every chunk receives a SHA-256 integrity hash and a 24-hour expiry.
8. Every chunk download again requires recent authentication.
9. The browser verifies each hash, assembles the sections and creates one local JSON download.
10. A repeated request during the validity window reuses the existing ready job.

The export never includes password hashes or Firebase private keys. Firebase Admin `getUser` exposes only safe account metadata such as email, verification state, provider IDs and sign-in timestamps.

## Deletion request flow

1. The user reauthenticates.
2. The callable requires the authenticated email and the explicit text `LOESCHEN`.
3. The server checks active Guardian and child-profile dependencies.
4. A sole Guardian of an active child profile cannot request deletion.
5. The server records `deletion-pending`, the request timestamp and a scheduled date seven days later.
6. The minimal `users/{uid}` projection mirrors the account freeze.
7. New WFXP credits and spends are rejected while the request is pending. Retries of an already committed idempotent ledger event remain safe.
8. `cancelAccountDeletion` restores the account to `active` before irreversible processing starts. Requests blocked during processor preflight are also cancellable.

## Deletion processor

The processor is exposed only through admin-authorized callable functions:

- `adminPreviewDueAccountDeletions`
- `adminProcessAccountDeletion`
- `adminProcessDueAccountDeletions`

Execution defaults to Dry-Run. Irreversible processing requires `dryRun: false`.

The processor performs these phases:

1. verify that the grace period has expired;
2. acquire a transactionally protected, expiring processing lease;
3. re-check active children and Guardian ownership after lease acquisition;
4. fail closed when an Evidence record still references an external media file;
5. revoke refresh tokens and disable the Firebase Auth account;
6. detach the user from shared family and child records;
7. delete archived child profiles that would otherwise become orphaned;
8. delete user-scoped mission, Evidence, Buddy, WFXP, inventory, export, location and account records in bounded batches;
9. delete audit records whose subject is the user;
10. anonymize the actor of cross-account audit records and remove the original actor metadata;
11. delete Firebase Authentication last;
12. write a random, non-identifying tombstone and atomically remove the lifecycle record.

## Family and Guardian rules

- An active child profile must always retain at least one Guardian.
- If another Guardian remains, the deleting user is detached and the child profile remains active.
- An archived child profile with no other Guardian is removed together with child-scoped records.
- A newly created sole-Guardian dependency discovered after the original request blocks processing before Firebase Auth is disabled.

## Fail-closed storage boundary

The current product normally stores only minimized Evidence summaries. If a record nevertheless contains a Cloud Storage or media path, the processor stops with `deletion-blocked` before disabling Firebase Auth. A storage-aware erasure adapter must remove that object before the request can be processed.

## Retry and recovery behavior

- A 15-minute lease prevents two processors from deleting the same account concurrently.
- A stale lease may be reacquired.
- Processing phases are recorded in `accountLifecycleRecords` until completion.
- On a recoverable failure the lease expires immediately, while the account remains frozen for safe retry.
- If Firebase Auth was already removed during a partial previous attempt, a retry treats `auth/user-not-found` as idempotent.
- The lifecycle record and tombstone are finalized in one Firestore transaction.

## Tombstone minimization

The tombstone stores:

- random deletion ID;
- processor and policy versions;
- completion time;
- aggregate deletion counts;
- aggregate family-detachment results;
- boolean evidence that Auth was disabled/deleted;
- explicit flags that no token transfer, cash-out or real-money action was created.

It does not store the original UID, email address, Health data or raw location.

## Deliberate production boundary

No scheduled production trigger is activated in this repository state. The processor is callable by an authorized administrator and is fully emulator-testable. A later infrastructure PR may connect `adminProcessDueAccountDeletions` to a protected scheduler only after:

- a Firebase production project exists;
- production Admin claims and App Check are configured;
- backup and restore procedures are validated;
- the storage-erasure adapter is configured;
- a human approves the production deletion policy.

## Deployment expectations

The repository remains the canonical executable source. A later Firebase deployment must publish Functions and Firestore Rules from the same tested commit. Real Firebase credentials, service-account keys and production data must never be committed to GitHub.
