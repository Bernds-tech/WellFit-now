# Dashboard WFXP Wallet Projection

Status: implemented on branch `runtime/dashboard-wfxp-wallet-projection`; merge requires green GitHub Build.

## Change

- The dashboard balance now prefers the existing server-owned `xpWallets` projection.
- When a WFXP wallet exists, its balance replaces the old client/preview balance in the main dashboard economy card.
- Mission completion dispatches `wellfit-beta1-projection-updated`; both the main dashboard projection and the detailed Beta-1 panel reload.
- If no WFXP wallet exists or the read is unavailable, the existing server-preview/local fallback remains visible and is not promoted to final authority.

## Authority boundary

- WFXP balance is server-authoritative and client read-only.
- Avatar and step display fields remain on the existing transitional projection until their own migration.
- No token, blockchain, cashout, payment, or NFT behavior is activated.
- No direct client WFXP write path is added.

## Next migration target

Move Buddy feeding from direct `users.points` / `users.avatar` writes to the existing WFXP shop, inventory and server-owned `userAvatars` projection.
