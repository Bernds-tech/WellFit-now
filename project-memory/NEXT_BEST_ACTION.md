# WellFit-now Next Best Action

- Selected action: `WFN-CI-INSTALL-RESILIENCE-BASELINE`
- Status: `EXECUTABLE`
- Risk: `R2`
- Title: CI-Paketinstallation stabilisieren

## Why this is next
PR #399 completed the bounded revision audit. Two successive verification cycles then showed long npm dependency-install stalls across otherwise healthy jobs, making CI feedback slower and less reliable.

## Exact work
1. Keep lockfile-exact `npm ci` semantics.
2. Prefer the setup-node npm cache before registry retrieval.
3. Disable audit/funding requests that do not contribute to build verification.
4. Apply the same install posture to required CI and protected release workflows.
5. Prove the exact workflow changes through required PR checks without deploying.

## Parallel-safe work
Device/Unity evidence remains a separate owner-machine task and graphical work remains in `Bernds-tech/WellFit`.

## Safety
No Production deploy, no dependency or lockfile change, no skipped verification, no token/NFT/payment activation, no silent currency rename, no native AR ownership move, and no broad rewrite.
