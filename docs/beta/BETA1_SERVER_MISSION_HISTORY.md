# Beta-1 Server Mission History

Status: 2026-07-25  
Scope: authenticated read-only projection for the existing mission runtime

## Problem removed

The previous History screen combined two non-canonical sources:

- browser-local entries from `localStorage`;
- a direct client query against a legacy Firestore `history` collection.

Neither source was the final authority for an existing mission attempt, evidence review, completion or internal WFXP ledger booking. The page could therefore not reliably distinguish a client-side success message from a server-confirmed completion.

The local projection module has been removed. The History page no longer uses a Firestore listener and no longer treats browser state as mission history.

## Canonical source

`getMissionHistory` is an authenticated Firebase callable. It reads only existing server-authoritative records owned by the caller:

- `missionAttempts`;
- `missionEvidence`;
- `missionCompletions`;
- public mission catalog metadata from `missions`.

The callable creates no History collection and performs no write. It derives one entry per mission attempt and uses the most recent evidence and completion records for that attempt.

## Status model

The projection exposes these explicit states:

- `started` — server attempt exists; evidence is not yet pending;
- `review-pending` — evidence is waiting for review;
- `review-approved` — evidence is approved, but completion has not yet been requested;
- `rejected` — evidence was rejected and can be resubmitted on the existing attempt;
- `needs-more-evidence` — additional evidence is required on the existing attempt;
- `completed` — completion exists and includes an internal WFXP ledger event;
- `server-inconsistent` — an old or incomplete record claims completion without the required ledger evidence.

An approved review is deliberately not shown as completed. A completion without a ledger reference is deliberately not shown as successful.

## Privacy-minimized response

The callable does not return:

- user IDs or email addresses;
- child profile IDs;
- raw attempt, evidence, completion or ledger IDs;
- raw location IDs or coordinates;
- evidence storage references;
- evidence metadata or media content;
- free text review notes.

The browser receives an opaque SHA-256-derived `historyId`, public mission ID/title/category, canonical status, safe period projection, boolean location/family scope, and verified internal WFXP amounts only when a ledger-backed completion exists.

Adventure access is represented only by:

- whether the one-time access debit exists;
- the internal WFXP access amount.

The underlying access ledger ID is not returned.

## Ownership and isolation

The callable requires Firebase Authentication and queries both `ownerUserId` and `userId` for compatibility with existing Beta-1 records. Results are deduplicated by Firestore path and include only records belonging to the authenticated caller.

A second user cannot receive the first user's mission entries. The client validates the authority envelope and rejects responses that claim to include raw evidence, raw location, record identifiers, writes, tokens, cash-out or real money.

## Read-only and non-monetary boundary

The projection reports:

- `progressAuthority: server-read`;
- `writesPerformed: false`;
- `noMonetaryValue: true`;
- `tokenAuthorized: false`;
- `cashoutAllowed: false`;
- `realMoney: false`.

Internal WFXP remain non-transferable progress points. The History page grants no mission completion, reward, payment, token, NFT, transfer or payout authority.

## Safe scan boundary

Each source collection is scanned with a hard per-query ceiling. The response exposes `scanTruncated` when this ceiling is reached. The UI warns that pagination is required instead of silently presenting the result as complete.

## Validation

Deterministic unit tests verify:

- category and status derivation;
- review approval remains separate from completion;
- ledger evidence is required for completed status;
- Adventure access and period projections;
- opaque history IDs;
- removal of raw source identifiers and protected data;
- ordering and result limits.

The Auth/Firestore/Functions emulator test verifies:

- login is required;
- cross-user isolation;
- pending, approved, started, completed and inconsistent records;
- no raw Evidence, location, child, storage or ledger values in the response;
- deterministic repeated reads;
- server-side limit enforcement;
- no writes to `auditEvents`, `adminActions` or legacy `history`.

The existing mission-quality validator blocks reintroduction of local History, direct `onSnapshot` reads or a parallel Firestore `history` projection.
