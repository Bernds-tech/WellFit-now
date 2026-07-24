# WellFit Runtime State — 2026-07-24

Status: current implementation and execution reference for GitHub development.

This document records what is actually present in the repository after the merge of PR #323. It does not replace the owner-controlled Beta-1 Canonical Truth and does not activate production, blockchain, token, payment, deployment or legal authority.

## Operating mode

- Canonical repository: `Bernds-tech/WellFit-now`.
- Development is GitHub-only through scoped branches and pull requests.
- There is no active WellFit server, SSH target, PM2 process or authorized Firebase production deployment.
- GitHub Actions build the Next.js application and run Auth/Firestore/Functions emulator tests.
- Production secrets, Firebase project values and provider keys are not committed.

## Current main baseline

PR #323 (`Make WellFit missions globally location-aware`) was squash-merged to `main` on 2026-07-24.

Main now includes:

- user-local IANA calendar periods instead of Vienna-wide day/week authority;
- worldwide server-published mission locations;
- multi-resolution geo-cell indexing and exact Haversine distance checks;
- privacy-safe nearby search budgets;
- Adventure and Challenge location authority;
- worldwide Reality Glitch regions and proximity checks;
- mission-location safety reviews with server-generated SHA-256 fingerprints;
- App Check rollout preparation without production enforcement;
- Firestore rule alignment and extensive emulator coverage.

Merge commit: `3aa96535936f922e587a1cf1a643101e0c4e6088`.

## Implemented product baseline

### Web and account shell

- public landing, registration, login, password reset, FAQ, help and legal routes;
- authenticated dashboard, settings, missions, Buddy, shop, marketplace placeholder, leaderboard and analytics surfaces;
- Mobile Web routes, camera/AR fallback and a squat/pose mission flow;
- Firebase Authentication and Firestore client integration.

### Mission authority

The active server flow is:

`attempt -> evidence -> admin review -> completion -> internal ledger -> internal wallet`

Implemented safeguards include owner scoping, approved-evidence requirements, deterministic/idempotent reward writes, replay protection, audit events and client write denial on protected mission collections.

Daily, weekly, Challenge and Adventure flows use shared server catalogs and callable projections. Adventure and Challenge starts require a published, safety-reviewed nearby location where configured.

### Internal economy

The runtime currently names the internal balance `WFXP`. It is server-authorized and explicitly marked:

- no monetary value;
- no blockchain backing;
- no cash-out;
- no real-money purchase authority;
- no token authorization.

Wallet, ledger, lifetime-earned/lifetime-spent, shop spend, inventory grants, Buddy care spend and audit records are present.

Important terminology issue: the owner-controlled Beta-1 Canonical Truth uses `WFP` for the spendable internal currency and separates non-spendable avatar `XP`. The runtime still uses `WFXP` in several modules. Do not silently rename or merge these concepts. Resolve the naming/data-model migration in a dedicated owner-reviewed task.

### Buddy

Server-authoritative Buddy projections and actions exist for feeding, care, play, cleaning, calling and recovery search. The runtime controls WFXP costs, cooldowns, wallet changes, ledger events, audit events and Buddy state transitions.

### Family and child foundation

The backend includes guardian family accounts, child profiles, guardian links, parental consent, child permissions and child-profile archiving. Child profiles have no standalone login. The complete parent-facing lifecycle and legal/privacy review are not finished.

### Global locations

Worldwide locations are admin-published and must pass a documented safety review. The safety fingerprint binds material location fields and mission assignments. Material tampering invalidates the review and removes the location from user flows until an authorized re-review.

Raw user coordinates are processed transiently for proximity decisions and are not intended to be persisted in attempts, evidence, completions, Adventure access events or Glitch participant records.

## Current validation evidence

The PR #323 head passed:

- repository product-boundary check;
- Next.js production build;
- Firestore economy posture check;
- Functions syntax and startup checks;
- full Beta-1 Auth/Firestore/Functions emulator suite;
- worldwide calendar, location, Adventure, Challenge, Reality Glitch, privacy, rate-limit, dense-index and location-tampering tests.

These are repository and emulator results. They are not production, legal, security-audit, real-device or real-user evidence.

## Known gaps and risks

### Highest-priority product gaps

1. Registration collects too much health-adjacent data and currently combines multiple consent purposes. Health personalization must not default to true without a separate informed choice.
2. Registration still initializes legacy economy/Buddy fields directly in `users/{uid}`.
3. Firestore still permits a temporary compatibility set of client writes to `users.points`, `users.xp`, `users.level`, `users.avatar`, `users.energy`, `users.stepsToday`, `users.lastMissionCompletedAt` and `users.deviceLocation`.
4. Remaining consumers of those legacy fields must be migrated before the compatibility bridge is removed.
5. Email verification, hardened session handling, admin-claim operational setup, account suspension, data export, account deletion and consent withdrawal are incomplete.
6. There is no production environment, monitoring, backup verification, load evidence or incident process in operation.
7. There is no verified paid pilot, partner redemption flow or cohort/retention evidence in the repository.
8. Native AR remains separate and unverified; PR #13 must not be merged or modified without explicit owner instruction.

### Documentation drift

Several May 2026 status and readiness documents describe missions and economy as preview-only even though server-authoritative runtime paths now exist. Historical files must be preserved, but future work must use this document plus the actual `main` code as the current runtime reference.

### Scope boundary

The repository contains internal prototypes or guarded code for Mayor and Reality Glitch mechanics. The owner-controlled Beta-1 Canonical Truth lists those as post-Beta-1 roadmap items. They must remain non-monetary, non-production and non-payout until a dedicated scope decision reconciles product phase and runtime exposure.

## Execution order

1. Harden registration, consent and server-side user initialization.
2. Inventory and migrate every remaining legacy `users` economy/Buddy writer.
3. Remove temporary Firestore client-write compatibility fields.
4. Add email verification, secure route/session guards and operational admin-claim setup.
5. Add consent withdrawal, user data export and account deletion/anonymization flows.
6. Add privacy-safe pilot telemetry for activation, mission completion, review latency, rejection reasons and return behavior.
7. Implement a non-crypto partner reward/redemption path and partner administration.
8. Collect real-device Mobile/PWA/Pose evidence.
9. Prepare a small adult Closed Beta before children, native AR, public social discovery, token, NFT, PvP stakes or DePIN expansion.

## Canonical-source order

For implementation decisions use:

1. `main` code and passing tests for actual runtime behavior;
2. this current runtime-state document for execution context;
3. the owner-controlled Beta-1 Canonical Truth for product/economy boundaries;
4. historical TODOs and older concept/whitepaper material as background, not automatic runtime authority.

Any conflict that changes currency semantics, child safety, health data, rewards, payments, blockchain, public location exposure or production authority requires an explicit scoped decision rather than silent reconciliation.
