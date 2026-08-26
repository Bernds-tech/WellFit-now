# Work Locks

Prevents two agents/sessions from independently working the same task.

## Rules
- Acquire a lock before substantive implementation.
- One active lock per Task ID. Related subtasks may have separate IDs.
- A second worker must inspect the existing lock and continue/coordinate rather than restart.
- Locks older than 24h are STALE, not free: reconcile `STARTED_WORK.md`, PRs, commits and receipts before replacing.
- Release only after updating `STARTED_WORK.md` and the execution receipt.

## Active locks

None for avatar attention.

## Resume requirements

- `WFN-TECH-LEGACY-001`: acquire a fresh lock before changing runtime, Firestore rules or compatibility writers.
- `WFN-AUTH-CONSENT-001`: acquire a fresh lock before auth/consent mutation.
- `WFN-PRIVACY-001`: acquire a fresh lock before state-changing account lifecycle work.
- `WFN-XREPO-001`: no migration lock exists; a specific reviewed `WF-MIG-*` task must acquire one before moving/removing physical code.

## Released locks

## LOCK-WFN-AVATAR-ATTN-001
- Task: WFN-AVATAR-ATTN-001
- Status: RELEASED
- Risk: R2
- Holder: ChatGPT session 2026-08-26
- Branch/PR: `codex/avatar-attention-20260826` / PR #387
- Acquired: 2026-08-26 Europe/Vienna
- Released: 2026-08-26 after final-head Build #1194, Container Build #179, Database Package Tests #171 and Project Memory Guard/Quality/Status all passed and PR #387 merged as `f687d2ba7c7bc46450301b9c92dbc0845feffa5f`.
- Scope: web-only pointer/focus attention presentation for existing WellFit mascot/avatar images; no backend/native authority change.
- Follow-up boundary: visual browser/Sites-v71 acceptance remains tracked by `WFN-LOOP-008`; it does not keep the physical implementation lock active.

## Superseded legacy branch ownership

PRs #13, #263, #363, #365 and #376 are not active locks. Their branches are historical/superseded and must not be used as implicit ownership of current work.
