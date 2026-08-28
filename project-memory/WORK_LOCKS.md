# Work Locks

Prevents two agents/sessions from independently working the same task.

## Rules
- Acquire a lock before substantive implementation.
- One active lock per Task ID. Related subtasks may have separate IDs.
- A second worker must inspect the existing lock and continue/coordinate rather than restart.
- Locks older than 24h are STALE, not free: reconcile `STARTED_WORK.md`, PRs, commits and receipts before replacing.
- Release only after updating `STARTED_WORK.md` and the execution receipt.

## Active locks

## LOCK-WFN-AVATAR-PUPPET-001
- Task: WFN-AVATAR-PUPPET-001
- Status: ACTIVE
- Risk: R2
- Holder: ChatGPT session 2026-08-28
- Branch/PR: `codex/avatar-puppet-attention-20260828` / PR pending
- Acquired: 2026-08-28 Europe/Vienna
- Scope: corrective web-only articulated head/body puppet attention for existing transparent mascot/avatar PNGs; no backend/native authority change.
- Resume from: replace `AvatarAttentionSystem.tsx` whole-image transforms with separate head/body layers and per-asset pivots; verify build/CI and a runnable GitHub preview where available. Public ChatGPT Site synchronization remains a separate WellFit graphical step.

## Stale/superseded locks

## LOCK-WFN-AVATAR-ATTN-001
- Task: WFN-AVATAR-ATTN-001
- Status: STALE
- Risk: R2
- Holder: ChatGPT session 2026-08-26
- Branch/PR: `codex/avatar-attention-20260826` / merged PR #387
- Acquired: 2026-08-26 Europe/Vienna
- Reconciled: 2026-08-28 after owner live validation and superseded closeout PR #388.
- Scope/result: whole-image pointer transforms are merged historical code but are not accepted as head tracking and do not update the public ChatGPT Site.
- Resume from: do not resume this lock; use `LOCK-WFN-AVATAR-PUPPET-001`.

## Resume requirements

- `WFN-TECH-LEGACY-001`: acquire a fresh lock before changing runtime, Firestore rules or compatibility writers.
- `WFN-AUTH-CONSENT-001`: acquire a fresh lock before auth/consent mutation.
- `WFN-PRIVACY-001`: acquire a fresh lock before state-changing account lifecycle work.
- `WFN-XREPO-001`: no migration lock exists; a specific reviewed `WF-MIG-*` task must acquire one before moving/removing physical code.

## Superseded legacy branch ownership

PRs #13, #263, #363, #365 and #376 are not active locks. Their branches are historical/superseded and must not be used as implicit ownership of current work.
