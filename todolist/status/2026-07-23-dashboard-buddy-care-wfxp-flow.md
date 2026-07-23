# Dashboard Buddy Care WFXP Flow

Status: implemented on branch `runtime/dashboard-buddy-care-wfxp-flow`; merge requires green GitHub Build.

## Replaced client bridge

The dashboard no longer writes Buddy-food effects to `users.points` or `users.avatar` and no longer uses the legacy SpendPreview as purchase authority.

## New flow

1. Dashboard reads the canonical WFXP wallet and server-owned `userAvatars` Buddy-care projection.
2. Dashboard reads the published `buddy_food_basic` catalog item and its server price.
3. Feed action first looks for an already purchased, available Buddy-food inventory item.
4. Only when no such item exists, it creates a server purchase intent and completes the atomic WFXP purchase.
5. The server consumes exactly one inventory item and updates Buddy hunger.
6. Dashboard refreshes WFXP and Buddy read projections.

This retry order recovers safely when a purchase committed but the browser did not receive the response: the next action consumes the existing inventory item instead of buying another one.

## UI and authority boundaries

- Feeding is disabled without a canonical WFXP wallet.
- Feeding is disabled without the server-owned Buddy-care projection.
- Feeding is disabled until the canonical energy snack is published by an admin.
- Feeding is disabled at full hunger or insufficient WFXP balance.
- The `/admin/beta1` page exposes an admin-only catalog reconciliation action.
- No client wallet, ledger, inventory-grant or Buddy-state write authority is added.
- No real money, IAP, token, NFT, cashout or blockchain behavior is activated.

## Next cleanup task

Update remaining dashboard economy wording and legacy projection notices so they distinguish the active Beta-1 WFXP wallet/Buddy authority from still-transitional step and economy-health preview fields.
