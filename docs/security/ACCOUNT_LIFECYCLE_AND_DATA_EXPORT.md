# WellFit Account Lifecycle and Data Export

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
- audit evidence for export, deletion request and cancellation.

It does not activate a token, wallet transfer, payment, payout, NFT or blockchain function.

## Runtime collections

All lifecycle collections are Firebase Admin / callable-only and fall through to the Firestore default-deny rule:

- `accountLifecycleRecords/{userId}`
- `userDataExportJobs/{userId}`
- `userDataExportChunks/{userId}__{chunkIndex}`
- future: `accountDeletionTombstones/{anonymizedDeletionId}`

The browser cannot directly create, read, update or delete these documents.

## Data export flow

1. The Firebase client reauthenticates the current email/password user.
2. `requestUserDataExport` verifies the recent Firebase `auth_time` claim.
3. The server reads only user-scoped account, consent, private-profile, Buddy, mission, WFXP, inventory, family and audit records.
4. Firestore timestamps and supported values are converted to JSON-safe values.
5. The export is split into bounded JSON chunks.
6. Every chunk receives a SHA-256 integrity hash and a 24-hour expiry.
7. The browser downloads every chunk through `downloadUserDataExportChunk`, verifies its SHA-256 hash, assembles the sections and creates one local JSON download.
8. A repeated request during the validity window reuses the existing ready job.

The export never includes password hashes or Firebase private keys. Firebase Admin `getUser` exposes only safe account metadata such as email, verification state, provider IDs and sign-in timestamps.

## Deletion request flow

1. The user reauthenticates.
2. The callable requires the authenticated email and the explicit text `LOESCHEN`.
3. The server checks active Guardian and child-profile dependencies.
4. A sole Guardian of an active child profile cannot request deletion.
5. The server records `deletion-pending`, the request timestamp and a scheduled date seven days later.
6. The minimal `users/{uid}` projection mirrors the account freeze.
7. Shared WFXP ledger writes are rejected while the request is pending.
8. `cancelAccountDeletion` restores the account to `active` before irreversible processing starts.

## Deliberate boundary

This implementation schedules and cancels deletion. It does not yet perform irreversible erasure. The separate deletion-processor workstream must:

- acquire an idempotent processing lease;
- re-check Guardian dependencies;
- delete or anonymize user-scoped Firestore records in bounded pages;
- detach the user from shared family records without orphaning child profiles;
- close internal WFXP projections without creating transfers or cash-out rights;
- delete the Firebase Authentication user last;
- write only a non-identifying deletion tombstone;
- support safe retries after partial failure;
- include emulator tests for every collection family.

## Deployment expectations

The repository remains the canonical executable source. A later Firebase deployment must publish Functions and Firestore Rules from the same tested commit. Real Firebase credentials, service-account keys and production data must never be committed to GitHub.
