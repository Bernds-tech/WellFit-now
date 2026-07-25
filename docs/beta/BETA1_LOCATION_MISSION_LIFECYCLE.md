# Beta-1 Location Mission Lifecycle

Status: 2026-07-25  
Scope: Challenge and Adventure user experience over the existing server-authoritative runtime

## Purpose

This document defines the canonical user-facing lifecycle for WellFit location missions. It does not introduce a second mission engine. Challenge and Adventure continue to use their existing Firebase callables, Firestore projections, evidence review and WFXP ledger authority.

The shared presentation layer exists so that every screen communicates the same safety model:

- local UI state is never completion or reward authority;
- an existing server attempt is resumed instead of duplicated;
- review approval is not yet completion;
- only the completion callable may write the internal WFXP reward;
- internal WFXP are non-transferable progress points without monetary value or cash-out;
- submitted raw coordinates are used for proximity validation and are not written into the mission record.

## Challenge lifecycle

Canonical stages:

1. **Start** — the server verifies a safely published nearby Challenge location and creates or reuses the location-bound attempt.
2. **Bestätigung** — the allowed location evidence is submitted for that attempt.
3. **Review** — the evidence remains pending, is approved, rejected or requires additional evidence.
4. **WFXP** — after approval, the completion callable records exactly one completion and one internal WFXP ledger reward.

Recovery rules:

- repeated starts reuse the existing attempt;
- pending or approved attempts can be checked without creating new evidence;
- rejected or incomplete evidence is resubmitted on the existing attempt;
- location-bound resubmission remains tied to the original server-authorized start location;
- a missing server projection blocks the action instead of falling back to a local completion;
- a completed Challenge cannot produce another completion or reward.

## Adventure lifecycle

Canonical stages:

1. **Zugang** — at a safely published nearby start location, the server atomically creates or reuses the Adventure attempt and records the one-time internal WFXP access debit.
2. **Bestätigung** — after access exists, the Adventure completion evidence is submitted on that attempt.
3. **Review** — the evidence is reviewed through the existing admin evidence flow.
4. **WFXP** — after approval, the completion callable records exactly one completion and the internal reward WFXP.

Recovery rules:

- an already paid access remains active after interruption, logout, reload or rejected evidence;
- repeated access calls are idempotent and must not create a second debit;
- evidence resubmission reuses the paid attempt;
- review-status refresh does not create evidence, a debit or a reward;
- approved evidence still requires the explicit completion step;
- a completed Adventure cannot debit access or grant reward WFXP again.

## Presentation states

The shared resolver distinguishes:

- login required;
- server projection loading;
- server projection unavailable;
- ready to start or activate access;
- existing attempt or access active;
- review pending;
- review approved but not completed;
- evidence rejected;
- additional evidence required;
- server processing;
- completed.

Challenge, Adventure, Daily and Weekly screens derive labels, progress and action availability from this resolver. Screen-specific context is supplied through mission variants rather than separate status implementations.

## Location and privacy boundary

Location missions use the already existing nearby-location and start-radius policies:

- only server-published mission locations are eligible;
- the start radius remains 500 metres;
- the UI may display the published location title, locality, country code and computed distance projection;
- the mission attempt stores the published location identity and server-derived distance evidence;
- client-submitted latitude and longitude are not returned as mission data and are not persisted in the mission record;
- no background tracking, movement history or new analytics collection is added by this lifecycle UX.

## Authority boundary

This slice adds no new authority for:

- mission creation or publication;
- evidence approval;
- mission completion;
- WFXP balance or ledger mutation;
- location publication;
- account, payment, token, NFT, blockchain or cash-out operations;
- Firebase deployment or production data access.

The browser remains a presentation and command surface. Existing server callables and Firestore records remain final authority.

## Validation

The normal Build workflow enforces:

- deterministic standard, Challenge and Adventure lifecycle-state tests;
- presence of the shared lifecycle implementation on both location-mission pages;
- absence of parallel local review-label resolvers;
- absence of obsolete city-specific day or week authority wording;
- the existing runtime, database, release-package, repository-boundary and production-build checks.

The full Beta-1 emulator suite continues to verify the underlying Challenge and Adventure access, evidence, completion, location and ledger behavior.
