# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-CATALOG-GOVERNANCE-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Partnerangebote revisionssicher verwalten

## Why this is next
PR #396 verifies bounded aggregate operations reporting. The next technical risk is offer administration: updating a published offer must not silently reset sold inventory or rewrite commercial terms behind already issued redemptions.

## Exact work
1. Separate offer creation from controlled lifecycle updates.
2. Prevent inventory reset and incompatible term changes after redemptions exist.
3. Add explicit pause/retire transitions and immutable offer revision audit.
4. Cover concurrent update, issued-redemption and forbidden-transition paths.
5. Keep catalog graphics, Production partner onboarding, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
