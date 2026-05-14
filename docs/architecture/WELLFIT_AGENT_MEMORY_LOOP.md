# WellFit Agent Memory Loop

Status: active / governance documentation  
Updated: 2026-05-14  
Leading files: `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/agent-work-log.json`, `project-register/agent-follow-ups.json`

## Purpose

The WellFit agent memory loop gives future agents a repeatable way to choose the next safe task, perform only scoped work, record what changed, update TODO status, and leave a clear follow-up for the next run. It extends the existing WellFit governance structure and must not replace `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, or the project-register files.

## 1. How an agent starts

1. Confirm the current branch is not `main`; create a focused task branch before changing files.
2. Read the required first-read files:
   - `AGENTS.md`
   - `todolist/CURRENT_PROJECT_STATE.md`
   - `todolist/WORK_MAP.md`
   - `todolist/TODO_INDEX.md`
   - `todolist/NEXT_ACTIONS.md`
   - `project-register/agent-workflows.json`
   - `project-register/agent-task-queue.json`
   - `project-register/definition-of-done.json`
   - `project-register/risk-classifier.json`
3. Classify the task using `project-register/risk-classifier.json` before touching files.
4. Use the existing Work Map and project-register entries to find the leading files. Do not create duplicate architecture, duplicate routes, duplicate systems, or parallel registries.

## 2. How an agent selects a task

Run the next-task picker:

```bash
node scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs
```

The picker reads `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `todolist/CURRENT_PROJECT_STATE.md`, and `todolist/WORK_MAP.md`. It selects the safest non-blocked task by skipping blocked, high-risk, and critical-risk candidates. The output includes the task title, reason, risk level, allowed files, forbidden files, required checks, expected PR output, and stop conditions.

Agents may override the suggestion only when the human request is narrower and still satisfies the same safety gates. High or critical risk tasks must not be selected automatically.

## 3. How an agent records work

After checks and before final handoff, validate the PR outcome in dry-run mode:

```bash
node scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs --dry-run
```

For merged PRs, the recorder defines the local append format for `project-register/agent-work-log.json` and validates the required fields before any write: PR number, title, status, changed files, checks, follow-ups, and next recommended task. This first version does not call GitHub and does not require GitHub credentials. It writes only when a future agent supplies a valid input file plus the explicit `--local-write` flag.

The resulting work-log entry should include:

- task id and title
- final status
- PR branch, title, number, and URL if available
- changed files
- checks and results
- follow-ups
- the next recommended task

The work log is append-only guidance. Do not delete historical entries; if an entry becomes wrong, add a corrective follow-up entry.

## 4. How an agent marks TODOs

Use the canonical TODO status markers:

| Marker | Meaning |
|---|---|
| `[ ]` | open |
| `[>]` | in progress |
| `[x]` | done |
| `[~]` | partially done |
| `[!]` | blocked/review required |
| `[-]` | stale/superseded |
| `[D]` | duplicate |

Run the validation-only TODO status sync before committing:

```bash
node scripts/wellfit-dev-agent/src/todo-status-sync.mjs
```

The first version reports malformed or unknown status markers and TODO sections that may be missing links to leading files. It does not rewrite files automatically.

## 5. How an agent creates follow-ups

Run the report-only detector after task work and before handoff:

```bash
node scripts/wellfit-dev-agent/src/follow-up-detector.mjs
```

The detector reads `todolist/WORK_MAP.md`, `todolist/CURRENT_PROJECT_STATE.md`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, and optional `project-register/internal-sources.json` / `project-register/user-feedback.json`. It reports categories tracked in `project-register/agent-follow-ups.json`, including API proposals, Firestore collection proposals, route/register/feedback/governance changes, mission/economy mentions, and UI route touches. It is report-only in this version and never auto-approves high or critical follow-ups.

Create follow-ups in existing leading files only:

- `todolist/NEXT_ACTIONS.md` for near-term priority work.
- `todolist/TODO_INDEX.md` for index and cross-reference visibility.
- `project-register/agent-work-log.json` for the next recommended task and run-level handoff.
- Relevant existing project-register files when the follow-up is registry-specific.

Do not create a new TODO file, architecture map, queue, or task system unless the repository owner explicitly requests one and `todolist/WORK_MAP.md` confirms no leading file exists.

## 6. How an agent stops for human approval

Stop and ask for human approval instead of implementing when any task would:

- touch PR #13 or `native/unity/WellFitBuddyAR/**`
- change token, NFT, wallet, payment, betting, payout, staking, trading, marketplace, or presale behavior
- change final reward authority, XP/points authority, mission completion authority, anti-cheat, ledger writes, inventory unlocks, or rare-item grants
- expand health, child, location, camera, biometric, privacy, consent, medical-adjacent, legal, AGB, Datenschutz, Impressum, or compliance logic
- require runtime product logic changes when the task is documentation/register/script-only
- reveal secrets or server API keys
- conflict with leading files without a clear source of truth

## Required checks

For governance/script-only work, run the repository checks requested by `AGENTS.md` and the task queue, including:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm --prefix functions run check`
- `npm run agent:quality-gate`
- `node scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs`
- `node scripts/wellfit-dev-agent/src/follow-up-detector.mjs`
- `node scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs --dry-run`
- `node scripts/wellfit-dev-agent/src/todo-status-sync.mjs`
- `jq empty project-register/agent-follow-ups.json`

## KI-Fortsetzungs-Prompt

Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, diese Datei und die Agent-Control-Register. Nutze `suggest-next-agent-task.mjs`, waehle nur einen sicheren nicht-blockierten Task, validiere PR-Outcomes mit `pr-outcome-recorder.mjs --dry-run`, pruefe Follow-ups report-only mit `follow-up-detector.mjs`, dokumentiere Ergebnisse in `project-register/agent-work-log.json`, validiere TODO-Marker mit `todo-status-sync.mjs`, und erstelle Follow-ups nur in vorhandenen fuehrenden Dateien.
