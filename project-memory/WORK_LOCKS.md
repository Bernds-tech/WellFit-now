# Work Locks

Prevents two agents/sessions from independently working the same task.

## Rules
- Acquire a lock before substantive implementation.
- One active lock per Task ID. Related subtasks may have separate IDs.
- A second worker must inspect the existing lock and continue/coordinate rather than restart.
- Locks older than 24h are STALE, not free: reconcile `STARTED_WORK.md`, PRs, commits and receipts before replacing.
- Release only after updating `STARTED_WORK.md` and the execution receipt.

## Active locks

## LOCK-WFN-AVATAR-ATTN-001
- Task: WFN-AVATAR-ATTN-001
- Status: ACTIVE
- Risk: R2
- Holder: ChatGPT session 2026-08-26
- Branch/PR: `codex/avatar-attention-20260826` / PR pending
- Acquired: 2026-08-26 Europe/Vienna
- Scope: web-only pointer/focus attention presentation for existing WellFit mascot/avatar images; no backend/native authority change.
- Resume from: `app/components/AvatarAttentionSystem.tsx` plus `app/layout.tsx`; run exact branch CI/browser countercheck before merge.

## Resume requirements

- `WFN-TECH-LEGACY-001`: acquire a fresh lock before changing runtime, Firestore rules or compatibility writers.
- `WFN-AUTH-CONSENT-001`: acquire a fresh lock before auth/consent mutation.
- `WFN-PRIVACY-001`: acquire a fresh lock before state-changing account lifecycle work.
- `WFN-XREPO-001`: no migration lock exists; a specific reviewed `WF-MIG-*` task must acquire one before moving/removing physical code.

## Superseded legacy branch ownership

PRs #13, #263, #363, #365 and #376 are not active locks. Their branches are historical/superseded and must not be used as implicit ownership of current work.
