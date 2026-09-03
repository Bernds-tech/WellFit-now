# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-CATALOG-ADMIN-READ-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Partnerkatalog sicher administrativ lesen

## Why this is next
PR #397 verifies revision-safe offer mutation. The next bounded technical gap is an admin-only catalog projection: controlled writes require the current revision and lifecycle state, which must be retrievable without blind document knowledge or exposing raw audit actors.

## Exact work
1. Add an admin-only bounded offer list/detail projection.
2. Include current revision, lifecycle state and aggregate inventory facts required for safe commands.
3. Omit actor IDs and raw immutable revision records from the default response.
4. Cover non-admin denial, explicit limits/cursors and privacy-negative paths.
5. Keep catalog graphics, Production partner onboarding, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
