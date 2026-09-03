# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-REDEMPTION-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Nicht-kryptografische Partnerbelohnungen serverautoritativ einlösen

## Why this is next
Current-main reconciliation proves the earlier legacy-writer, health-consent withdrawal and account-lifecycle implementation gaps are already repository-closed or repository-verified. The current execution order therefore advances to the first absent product slice: a non-crypto partner reward/redemption path with strict server authority.

## Exact work
1. Define partner, offer, issuance and redemption records with explicit lifecycle states.
2. Require authenticated user ownership, active partner/offer state, expiry and one-time idempotency checks.
3. Keep issue/redeem/cancel authority in Firebase callables; clients remain read-only.
4. Add negative emulator tests for cross-user access, replay, expired offers and inactive partners.
5. Record immutable audit evidence without exposing exact child location or private health data.
6. Keep WFXP/WFP/XP renaming, WFT, token, NFT, cashout and payments outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
