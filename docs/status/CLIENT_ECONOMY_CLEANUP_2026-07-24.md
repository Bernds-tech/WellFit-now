# Client economy cleanup — 2026-07-24

This cleanup removes four unused legacy modules that were not imported by the active product:

- `lib/missionCompletion.ts`
- `lib/avatarMultiplier.ts`
- `lib/userAnalytics.ts`
- `lib/aiMissionGenerator.ts`

The removed modules contained an obsolete browser-authorized path for mission progress, points, reward multipliers, analytics and generated missions. The active product now uses server callables for mission evidence/review/completion, the internal ledger, Buddy actions, shop spend and onboarding.

The dashboard no longer creates a missing `users/{uid}` document with default points, XP, level, steps, energy or avatar values. A missing profile is shown as a read-only local fallback and requires the secure onboarding flow.

## Remaining work

Firestore still contains a temporary compatibility update list for legacy `users/{uid}` fields. It must remain until every remaining user-document writer is classified. The next hardening step is:

1. separate safe profile/settings changes from protected economy and health changes;
2. migrate the remaining legitimate writers;
3. deny client creation of `users/{uid}`;
4. remove the temporary economy field list;
5. prove client denials and server success paths in the Firebase emulators.

No production deployment, blockchain, token, NFT, payment, payout or cash-out behavior is introduced by this cleanup.
