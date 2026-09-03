# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-CATALOG-REVISION-READ-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Angebotsrevisionen kontrolliert auditieren

## Why this is next
PR #398 verifies the privacy-minimal current catalog projection. The next bounded technical gap is controlled access to immutable revision history for explicit administrative audits without expanding the normal operational response.

## Exact work
1. Add an explicit admin-only revision-history callable scoped to one offer.
2. Bound results and provide deterministic revision pagination.
3. Keep raw history out of the default catalog projection.
4. Cover non-admin denial, cross-offer isolation and limits/cursors.
5. Keep catalog graphics, Production partner onboarding, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
