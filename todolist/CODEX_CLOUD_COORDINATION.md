# WellFit Codex Cloud Coordination

Status: coordination index only. It does not replace any existing WellFit TODO, register, Canonical Truth or agent-governance file.

## Existing system remains authoritative

Before autonomous work, continue to use the hierarchy already defined by the repository:

1. `AGENTS.md`
2. `todolist/CURRENT_PROJECT_STATE.md`
3. `todolist/WORK_MAP.md`
4. `todolist/TODO_INDEX.md`
5. `todolist/NEXT_ACTIONS.md`
6. relevant `project-register/*.json`
7. relevant architecture, beta and safety documentation

`agents/modes/stufe-4-autonomous-development.md` remains the detailed autonomous workflow. Do not create a second TODO tree, second register system or parallel architecture.

## Current owner-approved delivery target

The active target is an Adult Closed Beta in which Gerhard can complete the normal end-to-end user path: registration, email verification, secure login/session, recoverable onboarding, dashboard/settings, Buddy, Daily/Weekly/Challenge/Adventure missions, movement/pose evidence, admin review, completion/reward, internal balance/inventory/history, Mobile/PWA, export/logout/account basics.

The mission authority remains: `attempt -> evidence -> admin review -> completion -> internal ledger -> internal wallet`.

## Hard scope boundaries

Do not activate Blockchain, SUI, WFT or other real tokens, NFTs, cash-out, real wallet/transfer functions, real-money purchase flows, betting/PvP stakes, public Marketplace, Mayor or Reality Glitch as Beta features.

WFXP/WFP/XP remains an owner decision. Do not rename or migrate it autonomously.

Native AR/Unity, Guardian/Child, Marketplace, partner/future economy, Health Connect/HealthKit and public social discovery may only be analyzed or separately prepared unless explicitly approved.

## Current owner decisions

- First Closed Beta: invite-only adults, minimum age 18.
- Preferred session architecture: server-managed Firebase session cookies with fail-closed route/session protection.
- Do not add a new browser-test dependency without first naming the exact dependency and reason.

## Mandatory task start

Every Codex Cloud task must:

- start from current `main` on a task-specific branch;
- read the leading files above;
- search `WORK_MAP`, `TODO_INDEX`, project registers, existing branches/PRs and architecture docs before creating a new task or file;
- reuse the existing task/register entry where possible;
- declare file ownership and conflict hot spots;
- classify risk under the existing Stufe-4 policies;
- define checks before implementation.

## Mandatory task finish

Every task must:

- update the existing relevant TODO/register/work-log evidence instead of creating a duplicate status system;
- report branch, commit, PR, changed files, checks, blockers and next safe task;
- push its branch to GitHub and open a PR against `main` before calling the handoff complete;
- never merge to `main`, deploy live, or change protected Canonical Truth without explicit owner approval.

## Immediate Closed-Beta work queue

The existing TODO/register system remains canonical. These are the current high-priority slices that must be represented there rather than duplicated elsewhere:

1. Auth/session/route guard: only verified, initialized, active users may access protected routes; explicit handling for signed-out, unverified, uninitialized, frozen and deletion-pending states.
2. Onboarding recovery after the auth/session interface is stable.
3. Quality baseline: lint, Functions check, build and agent quality gate green without runtime-semantic shortcuts.
4. Browser/emulator Gerhard journey with deterministic synthetic data.
5. Mobile/PWA real-device evidence for Android Chrome/PWA and iOS Safari/PWA, including permissions, pose, background/foreground, reconnect, login persistence and logout.
6. Closed-Beta navigation: normal users see only approved Beta destinations; out-of-scope modules stay in the repository but are not presented as Gerhard's core journey.
7. App Check and Buddy-KI hardening only after the required auth/test interfaces are stable.

## Conflict rules

- `proxy.ts`: Auth/session package owns it exclusively.
- Login/Register: Auth first, onboarding recovery second.
- `functions/index.js`: one Functions-core owner at a time; prefer isolated `functions/lib/*` modules.
- `firestore.rules`: serial changes only with emulator evidence.
- `package.json`/lockfiles: no incidental dependency changes.
- `project-register/*` and central TODO indexes: respect the existing governance ownership rules.
- `native/unity/WellFitBuddyAR` and PR #13: untouched unless explicitly approved.

## Work log rule

Do not create per-task parallel history documents. Use existing progress/work-log registers and the PR as the immutable task record. The PR must state goal, changed files, checks, known limitations, owner/external blockers and the next recommended task.
