# Mobile Squat Server Authority — 2026-07-23

Status: implementation branch, awaiting CI and merge.

## Scope

- canonical mission `daily-squats-15`, target 15 reps, reward 9 WFXP
- camera and pose inference remain on-device
- no raw image or video upload/storage
- tracking sessions and pose proofs are created through authenticated Firebase callables
- pose proof is bounded, idempotent and owner-scoped
- mission evidence waits for admin review
- only server completion can write WFXP
- mobile screen reads existing daily mission status and supports pending, approved, rejected and completed states
- old direct `trackingSessions`, `users.points`, `users.avatar` and `missionBuddyEvents` client bridge removed
- admin queue shows only a verified safe pose summary, never raw metadata values or media

## Validation

- repository product-boundary check
- Next.js and TypeScript production build
- Firebase Functions syntax/startup checks
- complete Beta-1 emulator suite
- focused mobile pose suite covering ownership, session type, idempotency, privacy, admin projection, review, completion and exact ledger count

## Safety boundaries

- WFXP remain internal and non-monetary
- no token, payment, NFT, cashout or blockchain behavior
- no automatic completion or reward from the camera client
- no medical diagnosis or health claim
- no Firebase deployment or production data write

## Follow-up after merge

Inventory the next remaining active `users/{userId}` economy writer and migrate one product area at a time before narrowing the general Firestore compatibility bridge.
