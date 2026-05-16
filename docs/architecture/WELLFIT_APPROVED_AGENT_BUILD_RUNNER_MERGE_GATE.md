# WellFit Approved Agent Build Runner + Merge Gate

**Status:** report-only merge gate / controlled activation foundation  
**Updated:** 2026-05-16  
**Register:** `project-register/approved-agent-build-runner-merge-gate.json`  
**Validator:** `scripts/wellfit-dev-agent/src/approved-agent-build-runner-merge-gate-check.mjs`

## Purpose

The Approved Agent Build Runner + Merge Gate is the safety layer that prevents the next approved WellFit agent-build task from being treated as merge-ready when required checks are missing. It reads the approved agent backlog, selects one eligible next agent, validates the required build and PR guard sequence, and reports a merge-gate decision.

This first implementation is intentionally a **gate**, not a self-merging bot. It does not create agents automatically, invoke Codex, open pull requests, approve pull requests, merge, deploy, or repair runtime files by itself.

## Why this exists

The approved agent backlog now contains multiple future WellFit agents and guards. Some are medium risk, and many touch high/critical planning areas such as rewards, children, health, location, monetization, user memory, Buddy tone, and recovery. A runner must therefore prove that it can stop when evidence is incomplete before any later real execution mode is considered.

The immediate safety requirement is:

> Missing checks, skipped checks, failed checks, unknown checks, or absent PR guard evidence must never be interpreted as merge-ready.

## Selection model

The gate reads `project-register/approved-agent-build-backlog.json` and selects exactly one eligible entry:

1. Eligible statuses: `approved_for_build` and `approved_for_planning`.
2. Skipped statuses: `built`, `blocked`, `rejected`, `duplicate`, `superseded`, and `in_progress` unless a later explicit resume task targets that exact entry.
3. Sorting: `suggestedBuildOrder` ascending.
4. Maximum selected agents per run: `1`.

With the current backlog, after the already-started Motivation/Ethics/Adaptive entries are skipped until status-sync, the next selected entry is expected to be `multisensory-learning-engine`.

## Required checks before merge-ready can ever be true

The policy requires all of these to be recorded as passing before any future merge-ready handoff:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm --prefix functions run check`
- `npm run agent:quality-gate`
- `git diff --check`
- `node scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs`
- `node scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs`
- `node scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`
- `node scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs`
- `node scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs`
- `node scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs`
- `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs`

If any required check is missing, failed, skipped, unknown, stale, or not recorded, the gate must report `MERGE_READY=false`.

## Safe repair boundary

The gate may classify safe repair opportunities only for documentation/register/governance hygiene:

- Markdown link or heading fixes.
- JSON schema or metadata fixes.
- TODO / Work Map reference fixes.
- Expected PR output or handoff text fixes.
- Quality-gate reference synchronization.

It must not repair runtime code, UI behavior, Firebase Functions logic, Firestore rules, package files, GitHub workflows, Unity/native files, or protected legal/privacy/health/child/location/payment/reward-authority topics by itself.

## Forbidden actions

The gate must never by itself:

- create the selected agent automatically;
- build more than one agent per run;
- open, approve, merge, or close pull requests;
- enable GitHub auto-merge;
- deploy;
- repair runtime files;
- touch Unity/PR #13 work;
- alter reward, mission authority, token, wallet, payment, health, child, location, privacy, legal, compliance, camera, biometric, or production authority logic.

## Validator output

Run:

```bash
node scripts/wellfit-dev-agent/src/approved-agent-build-runner-merge-gate-check.mjs
```

Expected safe output includes:

- `Mode: REPORT_ONLY_MERGE_GATE`
- `APPROVED_AGENT_BUILD_RUNNER_READY=true`
- `SELECTED_AGENT_BUILD_ID=<id>`
- `MAX_AGENTS_PER_RUN=1`
- `MISSING_CHECKS_BLOCK_MERGE=true`
- `MERGE_READY=false`
- `Never creates agents automatically: true`
- `Never opens PRs automatically: true`
- `Never approves PRs: true`
- `Never merges PRs by itself: true`
- `Never deploys: true`

The report is written to `scripts/wellfit-dev-agent/output/approved-agent-build-runner-merge-gate-report.md`, which is generated output and should not be committed.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/approved-agent-build-runner-merge-gate.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-catalog.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/pr-diff-review-policy.json` und `project-register/pr-post-creation-guard.json`. Waehle hoechstens einen approved Agent pro Run, erzwinge alle Pflichtchecks, setze `MERGE_READY=false`, sobald Check-Evidence fehlt, und aendere keine Runtime-, Protected-, Unity-, Package-, GitHub-Workflow- oder Deploy-Dateien ohne separate explizite Freigabe.
