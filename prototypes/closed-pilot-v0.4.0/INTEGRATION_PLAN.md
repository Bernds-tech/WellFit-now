# Closed Pilot v0.4.0 → WellFit-now Integration Plan

## Objective

Transfer proven prototype behavior into the existing WellFit architecture without replacing its application shell, Firebase model, governance controls or canonical truth.

## Recommended sequence

1. Inventory canonical mission, buddy, economy-preview, checkpoint, analytics and admin modules.
2. Map prototype domain concepts to existing TypeScript types and Firestore preview schemas.
3. Port streak and achievement calculations as pure, deterministic domain functions.
4. Port quest-route ordering, station validation and idempotency rules behind server-preview authority.
5. Add QR rotation and telemetry only after privacy, location, reward-authority and emulator review.
6. Keep all points, XP and completion outcomes preview-only until Functions, Rules and emulator tests prove server authority.

## Prototype evidence

| Area | Evidence |
|---|---|
| Automated tests | 25 passed |
| Type safety | passed |
| Browser scripts | syntax passed |
| Runtime flow | protected login, route completion and backup executed |
| Dependencies | production audit reported 0 vulnerabilities |
| Local release | `wellfit-pilot-v0.4.0` / `868497f` |
| Archive digest | `c65db1a095161801308e502326c041e2238f4035fba08176148cc59545f748bb` |

## Explicit exclusions

- no merge to `main` without review
- no deployment
- no production Firebase writes
- no wallet, token, NFT, staking or payout activation
- no gambling or stake-based PvP
- no client-authoritative rewards or mission completion
- no new health, child, biometric, camera or location-data persistence
