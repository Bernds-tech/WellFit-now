# Beta-1 Buddy Care WFXP Backend

Status: implemented on branch `runtime/beta1-buddy-care-wfxp-backend`; merge requires green Build and complete Beta-1 emulator tests.

## Implemented

- Canonical internal Buddy-food item at 5 WFXP.
- Admin-only catalog reconciliation.
- Atomic server purchase across intent, wallet, ledger, purchase event, inventory and audit records.
- Server-owned Buddy-care projection in the existing `userAvatars` collection.
- One-time consumable inventory effect for Buddy hunger.
- Idempotent repeated consumption.
- Guardian permission and consent enforcement for child profiles.
- Dedicated emulator test added to the existing Beta-1 suite.

## Deliberately not changed in this backend block

- No dashboard button was changed yet.
- No direct production deployment was performed.
- No real money, token, NFT, cashout or blockchain behavior was added.

## Next task after merge

Migrate the existing dashboard Buddy-feed action from direct `users.points` / `users.avatar` writes to the server-authoritative WFXP Buddy-care flow, then remove the obsolete client bridge imports and code.
