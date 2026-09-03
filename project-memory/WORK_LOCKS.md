# Work Locks

Prevents two agents/sessions from independently working the same task.

## Rules
- Acquire a lock before substantive implementation.
- One active lock per Task ID. Related subtasks may have separate IDs.
- A second worker must inspect the existing lock and continue/coordinate rather than restart.
- Locks older than 24h are STALE, not free: reconcile `STARTED_WORK.md`, PRs, commits and receipts before replacing.
- Release only after updating `STARTED_WORK.md` and the execution receipt.

## Active locks

## LOCK-WFN-PARTNER-OPERATIONS-BASELINE
- Task: WFN-PARTNER-OPERATIONS-BASELINE
- Status: RELEASED
- Risk: R3
- Holder: ChatGPT session 2026-09-03
- Branch/PR: `codex/partner-operations-baseline-20260903` / PR #394
- Acquired: 2026-09-03 Europe/Vienna
- Scope: Firebase/backend-only presentation issuance/confirmation throttling and privacy-minimal operational counters. No graphics/UI, Production deploy, identity provider, payment, WFT, NFT, cashout or real partner activation.
- Released: 2026-09-03 after PR #394 head `8979e845e0e10f3c91e726450e81b1a7c522ebff` passed Build, Container, Database, Beta 1 Emulator and Project Memory gates.
- Resume from: no repository implementation remains; Production retention/threshold configuration is a separate release task.

## LOCK-WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE
- Task: WFN-PARTNER-OPERATOR-VERIFICATION-BASELINE
- Status: RELEASED
- Risk: R3
- Holder: ChatGPT session 2026-09-03
- Branch/PR: `codex/partner-operator-verification-20260903` / PR #393
- Acquired: 2026-09-03 Europe/Vienna
- Scope: Firebase/backend-only scoped operator authorization and short-lived redemption presentation proof. No graphics/UI, Production deploy, payment, WFT, NFT, cashout or real partner activation.
- Released: 2026-09-03 after PR #393 head `89778662ab0517ba04d8213678237efc27a67219` passed Build, Container, Database, Beta 1 Emulator and Project Memory gates.
- Resume from: no repository implementation remains; Production and partner acceptance are separate.

## LOCK-WFN-PARTNER-REDEMPTION-BASELINE
- Task: WFN-PARTNER-REDEMPTION-BASELINE
- Status: RELEASED
- Risk: R3
- Holder: ChatGPT session 2026-09-03
- Branch/PR: `codex/partner-redemption-baseline-20260903` / PR pending
- Acquired: 2026-09-03 Europe/Vienna
- Scope: Firebase/backend-only non-crypto partner offer and redemption authority. No graphical/UI work, Production deploy, payment, WFT, NFT, cashout or public partner activation.
- Released: 2026-09-03 after PR #392 head `81d370636e35b7ca8097d5d7fa8a31e17fb20316` passed Build, Container, Database, Beta 1 Emulator and Project Memory gates.
- Resume from: validate `beta1PartnerRedemption` transactions, negative emulator cases and Firestore client-deny rules.

## LOCK-WFN-TECH-TRUTH-20260903
- Task: WFN-TECH-TRUTH-20260903
- Status: RELEASED
- Risk: R2
- Holder: ChatGPT session 2026-09-03
- Branch/PR: `codex/mission-interactions-server-authority-20260903` / PR pending
- Acquired: 2026-09-03 Europe/Vienna
- Scope: read-only reconciliation of the current technical finishline against main, followed by Project Memory corrections only. No graphical/UI migration, no token/economy semantic change, no provider deploy and no native Buddy/AR mutation.
- Released: 2026-09-03 after Project Memory V8, V9 and quality checks passed.
- Resume from: record that legacy `users/{uid}` client writes, separate health consent/withdrawal and the account export/deletion implementation already exist on current main; select the first genuinely open technical Beta task from current code evidence.

## LOCK-WFN-AVATAR-PUPPET-001
- Task: WFN-AVATAR-PUPPET-001
- Status: RELEASED
- Risk: R2
- Holder: ChatGPT session 2026-08-28
- Branch/PR: `codex/avatar-puppet-attention-20260828` / PR pending
- Acquired: 2026-08-28 Europe/Vienna
- Scope: corrective web-only articulated head/body puppet attention for existing transparent mascot/avatar PNGs; no backend/native authority change.
- Released: 2026-08-29 after PR #390 merged with green exact-head gates.
- Resume from: do not resume in WellFit-now; public ChatGPT Site synchronization remains a separate WellFit graphical step.

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
