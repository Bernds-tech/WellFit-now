# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-RETENTION-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Abgelaufene Partner-Betriebsdaten sicher bereinigen

## Why this is next
PR #394 verifies bounded challenge issuance, confirmation attempts and privacy-minimal outcome counters. Before Production, expired short-lived operational records need an explicit, retry-safe cleanup lifecycle instead of relying on indefinite storage.

## Exact work
1. Add an admin/scheduled retry-safe cleanup processor for expired operation buckets and outcomes.
2. Prune expired active-proof entries without touching issued/redeemed audit authority.
3. Bound each cleanup batch and expose deterministic dry-run/result counts.
4. Cover repeated execution, partial batches and non-expired preservation in emulator tests.
5. Keep deployment scheduling, graphical QR presentation, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
