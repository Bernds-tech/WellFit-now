# WellFit-now Next Best Action

- Selected action: `WFN-PARTNER-OPERATIONS-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R3`
- Title: Einlösungs-Missbrauch technisch begrenzen

## Why this is next
PR #393 verifies least-privilege partner operators and short-lived single-use presentation proofs. Before any real partner pilot, challenge issuance and confirmation still need bounded abuse controls plus privacy-minimal operational signals.

## Exact work
1. Add transactional per-user challenge issuance throttling and a small active-challenge cap.
2. Add transactional per-operator confirmation attempt throttling without storing IP or location.
3. Record privacy-minimal outcome codes and counters for operational review.
4. Cover boundary reset, parallel/replay and denial paths in emulator tests.
5. Keep graphical QR presentation, Production onboarding, WFT/token/payment/cashout outside this task.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
