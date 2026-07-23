# WellFit Beta-1 Buddy Care WFXP Runtime

Status: runtime implementation on branch `runtime/beta1-buddy-care-wfxp-backend`

## Purpose

This runtime slice replaces the unsafe idea of changing `users.points` and `users.avatar` directly from the dashboard when feeding the Buddy. It reuses the existing Beta-1 collections and callable-function architecture:

- `shopItems`
- `itemDefinitions`
- `shopPurchaseIntents`
- `shopPurchaseEvents`
- `xpWallets`
- `xpLedgerEvents`
- `ledgerEvents`
- `userInventory`
- `userAvatars`
- `adminActions`
- `auditEvents`

No parallel economy, avatar store, wallet, payment or token system is introduced.

## Canonical Beta-1 Buddy food

The admin-only callable `adminEnsureBuddyFoodItem` creates or reconciles one published catalog item:

- shop item ID: `buddy_food_basic`
- item definition ID: `buddy_food_basic`
- title: `Flammi Energie-Snack`
- category: `buddy-care`
- price: `5 WFXP`
- consumable: `true`
- effect type: `buddy-hunger`
- effect amount: `10`
- child allowed: `true`, still requiring guardian permission and consent
- real money: `false`
- IAP: `false`
- tokenized: `false`

Only an authenticated admin can publish/reconcile this catalog record.

## Server-owned Buddy projection

`getBuddyCareProjection` reads or initializes the existing `userAvatars` projection for the authenticated user or guardian-controlled child profile.

Initial Beta-1 care values:

- hunger: `70`
- energy: `100`
- mood: `100`
- level: `1`
- XP total: `0`

Clients may read this bounded projection but cannot write it directly under the existing Firestore Rules.

## Atomic WFXP purchase

`completeXpShopPurchase` performs the following operations in one Firestore transaction:

1. verifies the authenticated owner and pending intent;
2. verifies the quoted WFXP price and internal-only item flags;
3. verifies the server-owned WFXP wallet balance;
4. appends canonical and legacy-compatible ledger records;
5. updates the WFXP wallet projection;
6. creates the purchase event;
7. creates exactly one inventory item;
8. marks the intent completed;
9. appends deterministic admin/audit records.

If the wallet balance is insufficient, the intent is rejected and no ledger, purchase event or inventory grant is created.

A completed or inconsistent intent cannot be executed again.

## Atomic Buddy-food consumption

`consumeBuddyFoodItem` validates ownership, child permissions/consent, server-granted inventory state and the approved Buddy-care effect. In one Firestore transaction it:

1. marks the inventory item consumed and sets quantity to zero;
2. updates the server-owned `userAvatars` hunger projection;
3. records deterministic audit evidence.

Repeated consumption is idempotent and cannot increase hunger twice or debit WFXP twice. Feeding is rejected without consuming the item when hunger is already full.

## Security boundaries

- WFXP has no monetary value.
- No cashout, payment, NFT, token or blockchain action is authorized.
- Purchase quotes originate from the published server catalog.
- Wallet, ledger, inventory and Buddy state remain server-authoritative.
- Child purchases and consumption require the existing guardian relationship, shop permission and active shop consent.
- Consumables cannot be equipped as cosmetics.
- No Firebase deployment or production write is part of this repository change.

## Emulator evidence

`functions/test/beta1BuddyCareEmulatorTest.js` verifies:

- admin-only catalog creation;
- internal-only catalog flags;
- server Buddy initialization;
- exact WFXP debit and wallet projection;
- atomic ledger/purchase/inventory/audit creation;
- duplicate-purchase rejection;
- ownership enforcement;
- one-time Buddy hunger effect;
- idempotent repeated consumption;
- insufficient-balance rejection without inventory grant;
- no token or cashout authorization.

The test is part of the existing `beta1:test:emulator` GitHub Actions workflow.

## Next integration step

After this backend passes CI and is merged, the existing dashboard Buddy-feed button can be migrated to:

`published shop item -> purchase intent -> atomic WFXP purchase -> consume inventory item -> refresh WFXP and Buddy read projections`

The old direct browser writes to `users.points` and `users.avatar` must then be removed rather than retained as a second source of truth.
