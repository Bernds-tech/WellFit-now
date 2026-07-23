# Dashboard Mission Review Completion Loop

Status: implemented on branch `runtime/dashboard-mission-review-completion-loop`; merge requires green Build and focused Beta-1 emulator tests.

## Closed loop

1. Dashboard starts an existing published Beta-1 mission.
2. Dashboard submits minimal Evidence as `pending-server-review`.
3. A localStorage record keeps only the user's own attempt/evidence IDs and display status; it grants no authority and contains no raw evidence.
4. Admin reviews Evidence through the existing server-authoritative queue.
5. User selects `Prüfstatus aktualisieren`.
6. `getMissionAttemptStatus` returns only the user's own bounded review/completion state.
7. If Evidence is approved, the dashboard calls the existing `completeMissionAttempt` callable.
8. Completion writes the WFXP ledger server-side and the read-only Beta-1 projection panel refreshes.

## Safety properties

- Status reads require Firebase Auth and ownership of both Attempt and Evidence.
- Status responses expose no raw metadata, storage references, images, videos, or other-user data.
- Pending, rejected, or incomplete Evidence cannot authorize Completion or WFXP.
- Completion remains idempotent and token/cashout behavior remains disabled.
- A rejected or incomplete local pending record may be dismissed, while server audit data remains intact.
- No direct dashboard writes to mission points, XP, level, steps, avatar state, or completion state are reintroduced.

## Evidence

- Dedicated emulator test covers pending, cross-user denial, approved, completion-ready and completed states.
- Existing Beta-1 callable and evidence-admin suites remain part of the same CI workflow.

## Next migration target

Replace the remaining dashboard Buddy-food client bridge with the existing Beta-1 server-side WFXP shop/inventory path and a server-owned Buddy projection. Do not create a second economy or avatar model.
