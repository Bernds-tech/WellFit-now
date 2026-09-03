# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Partner-Mitarbeiter für Einlösungen sicher begrenzen

## Why this is next
PR #392 verifies the non-crypto offer, claim, cancellation and admin-confirmation lifecycle. Before any real partner pilot, confirmation must no longer depend on a global admin claim: a partner operator needs least-privilege authority scoped to exactly one partner.

## Exact work
1. Define server-managed partner-operator assignments with partner scope and revocation state.
2. Replace global-admin-only fulfillment with scoped operator-or-admin authorization.
3. Introduce a short-lived, single-use presentation challenge without storing a reusable plaintext secret.
4. Deny cross-partner confirmation, expired challenge, revoked operator and replay.
5. Preserve owner cancellation/refund and immutable audit evidence.
6. Keep graphical QR presentation, Production partner onboarding, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
