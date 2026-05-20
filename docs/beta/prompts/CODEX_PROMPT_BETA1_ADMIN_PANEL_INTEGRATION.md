# CODEX PROMPT - Beta-1 Admin Panel Integration (Implementation PR, future)

## Context
This prompt prepares a **future implementation PR** only after explicit approval. Do not execute implementation in planning-only tasks.

## Branch proposal
`runtime/beta1-admin-panel-integration`

## Allowed file scope after approval
- `app/admin/**`
- `components/admin/**`
- `lib/admin/**`
- optional admin client helper files

## Forbidden scope
- `functions/lib/**`
- `functions/**` server runtime logic
- `firestore.rules`
- deploy/config/secrets paths

## Goal
Integrate Admin UI screens with existing admin callables so admin users can operate mission/checkpoint/shop/glitch/safety flows without introducing new authority paths.

## Mandatory safety rules
- Verify `admin` custom claim before any admin action.
- No normal-user access to admin actions.
- Critical actions must include reason/audit fields where callable contracts require them.
- No token/NFT/cashout/real-money semantics.
- No client authority for XP/mission/shop/inventory/mayor/glitch/admin final decisions.

## Required checks
- `npm run lint`
- `npm run build`
- admin route checks and navigation/access guard checks

## Stop conditions (hard)
Stop and open a separate backend PR plan if any of the following appears:
1. Required callable does not exist.
2. Callable contract is missing fields needed for mandatory audit/reason.
3. Admin claim model is unclear or inconsistent.
4. Rules/backend support is required to preserve security boundaries.

## Handoff expectation
Deliver admin UI integration diff, claim-gating evidence, test outputs, and explicit backend blockers when stop conditions trigger.
