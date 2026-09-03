# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-OPERATIONS-REPORTING-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Partnerbetrieb datenschutzarm auswerten

## Why this is next
PR #395 verifies bounded retention cleanup. Before a real partner pilot, administrators need a bounded aggregate view of offer/redemption health and abuse-control outcomes without exposing proofs or unnecessary person-level data.

## Exact work
1. Add an admin-only bounded aggregate operations summary.
2. Report counts by redemption state, partner and coarse outcome category without returning token hashes or raw proofs.
3. Bound scanned records and expose truncation/freshness explicitly.
4. Cover non-admin denial, empty state, aggregation and privacy-minimal response tests.
5. Keep dashboard graphics, Production monitoring, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
