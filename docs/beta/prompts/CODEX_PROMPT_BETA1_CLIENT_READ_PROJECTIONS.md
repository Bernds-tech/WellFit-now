# CODEX PROMPT - Beta-1 Client Read Projections (Implementation PR, future)

## Context
This prompt prepares a **future implementation PR** only after explicit approval. Do not execute implementation in planning-only tasks.

## Branch proposal
`runtime/beta1-client-read-projections`

## Allowed file scope after approval
- `app/**`
- `components/**`
- `lib/**`
- optional new client helper files

## Forbidden scope
- `functions/lib/**`
- `functions/**` server runtime logic
- `firestore.rules`
- deploy/config/secrets paths

## Goal
Enable client screens to read and display safe server-derived Beta-1 projections:
- published missions/locations/regions
- safe glitch events
- published shop/avatar catalogs
- owner/guardian-scoped wallet/ledger/attempt/evidence/completion/inventory/avatar projections
- guardian-linked child read-only projections

## Mandatory safety rules
- No client-side authority creation.
- No client final decisions for XP, mission completion, shop spend finalization, inventory grants, mayor share/assignment, glitch boosts, or admin actions.
- Keep WellFit-XP internal-only (no blockchain/NFT/cashout/real-money semantics).
- No public child profiles; no live child location exposure.

## Required checks
- `npm run lint`
- `npm run build`
- existing route checks relevant to touched screens
- no emulator/rules change required in this PR

## Stop conditions (hard)
Stop and open a separate backend PR plan if any of the following appears:
1. Additional server authority or callable is needed.
2. Firestore Rules changes are required.
3. Existing callable contract is insufficient/ambiguous for safe client reads.
4. Child-safety boundary cannot be guaranteed with current projection fields.

## Handoff expectation
Deliver changed UI/client files, explicit safety notes, and exact blockers for backend follow-up if stop conditions trigger.
