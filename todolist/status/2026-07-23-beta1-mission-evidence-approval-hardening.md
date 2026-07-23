# Beta-1 Mission Evidence Approval Hardening

Status: implemented on branch `security/beta1-mission-evidence-approval`; merge requires green Build and focused Beta-1 emulator checks.

## Problem closed by this change

The previous `completeMissionAttempt` path required only that an evidence document existed. It did not require an explicit server-side review decision before XP authorization.

## Implemented behavior

- Evidence submission remains non-authoritative and starts as `pending-server-review`.
- Only an authenticated admin may set `approved`, `rejected`, or `needs-more-evidence`.
- Mission completion requires evidence with both `reviewStatus=approved` and `serverValidationStatus=evidence-approved`.
- Completion and the WFXP ledger event reference the approved evidence.
- Duplicate completion is idempotent and returns the existing completion/ledger context.
- Evidence cannot be rewritten after the mission is completed.
- WFXP remains internal, non-monetary, non-tokenized, and without cashout.

## Required checks

- `npm run build`
- `npm --prefix functions run check`
- `.github/workflows/beta1-emulator-tests.yml`

## Next product step after merge

Migrate the existing dashboard mission UI away from direct client writes and onto the server-authoritative Beta-1 attempt/evidence/read-projection path. Do not create a second mission engine.
