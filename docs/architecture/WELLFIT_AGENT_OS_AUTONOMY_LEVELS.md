# WellFit Agent OS Autonomy Levels

Status: active governance baseline  
Updated: 2026-05-17  
Scope: Agent OS, Agent Control Center, agent catalog, task drafting, governance validators, PR handoff, and future runtime authority decisions.

## Purpose

This document defines the explicit autonomy ladder for WellFit agents. It prevents the current visible Agent OS from being mistaken for runtime authority and gives the registers a machine-readable contract for the current level, the next approvable level, and the blocked future levels.

The canonical machine-readable register is `project-register/agent-control-center.json`. The catalog mirror is `project-register/agent-catalog.json`.

## Current baseline

- **Current autonomy level:** Level 2 — Docs/Register/Validator execution with Commit/PR.
- **Next approvable level:** Level 3 — Safe UI-/Copy-/Test-only runtime changes with human approval.
- **Runtime authority:** Not granted.
- **Auto-merge/deploy:** Not active and not approvable under this policy.

Level 2 allows controlled documentation, register, and governance-validator work, including a reviewable branch, commit, and PR handoff. It does not allow product runtime behavior, production writes, approval buttons, merge, deploy, reward authority, mission-completion authority, protected compliance changes, or self-approval.

## Level definitions

| Level | Name | Allowed activities | Required gate | Explicitly blocked |
| --- | --- | --- | --- | --- |
| 0 | Read-only visibility | Read registers, docs, routes, checks, reports, and display existing Agent Center state. | No write execution. | File changes, task execution, approvals, runtime changes, merge, deploy. |
| 1 | Task-draft creation without execution | Create proposals, risk summaries, task drafts, allowed/blocked path suggestions, checks, stop conditions, and review plans. | Human review before any file write or execution. | Running implementation tasks, committing changes, PR creation, runtime changes, approval actions. |
| 2 | Docs/Register/Validator execution with Commit/PR | Update documentation, project registers, report-only validators, and governance references; run allowed checks; commit changes; create PR handoff. | Scope must stay in docs/register/validator governance paths and pass/record checks. | Runtime product behavior, protected-scope changes, production data writes, approval APIs/buttons, merge, deploy, self-approval. |
| 3 | Safe UI-/Copy-/Test-only runtime changes with human approval | Small UI copy, non-authoritative display-only UI, tests, snapshots, and safe wiring that cannot grant rewards, writes, payments, tokens, health/legal authority, or mission completion. | Human approval for the exact task, exact allowlist, required checks, audit note, and stop conditions. | Server authority changes, Firebase/production writes, protected compliance areas, wallet/token/payment/reward/mission authority, auto-merge/deploy. |
| 4 | Protected runtime work with Owner approval, review plan, and checks | Narrow protected runtime work only when Owner approves one exact task with a written review plan, exact path allowlist, checks, rollback/stop plan, and audit evidence. | Owner approval plus server-side role enforcement, audit log, exact allowlist validation, required checks, and stop conditions. | Broad autonomy, self-approval, unchecked protected changes, merge/deploy automation, bypassing failed checks. |
| 5 | Auto-merge/deploy future policy only | No current execution authority. This is reserved for a future separate policy. | Separate policy, separate implementation, explicit Owner decision, and independent safety review. | Any current auto-merge, auto-deploy, production release, or implicit promotion from Levels 0-4. |

## Runtime-authority rule

`runtimeAuthorityGranted` must remain `false` until all of the following exist and are wired into the real execution path:

1. Authenticated server-side role check for Owner/Admin approval authority.
2. Append-only audit log with actor, timestamp, scope, decision, checks, and reason.
3. Exact allowlist validation for paths, commands, data scopes, and runtime actions.
4. Stop conditions that abort on scope drift, failed checks, protected area mismatch, missing approval, or unexpected writes.
5. Self-approval block and separation between proposal author, executor, reviewer, and merger where applicable.
6. Required checks and review plan validation for each approved task.
7. Owner-only escalation for high, critical, or protected scopes.

A visible Admin Center, a built register, a validator, or a PR does not grant runtime authority by itself.

## Level 3 readiness checklist

Level 3 may be requested only after all items below are present for one exact task:

- Human approval references the task ID, branch/scope, files, commands, checks, and stop conditions.
- Allowlist contains only the exact UI/copy/test paths needed for the task.
- The change has no server authority, ledger, reward, mission-completion, anti-cheat, wallet, token, payment, health, child-safety, location, legal, privacy, Unity, merge, or deploy effect.
- Required tests are named before execution and results are included in the PR handoff.
- The Agent Control Center remains `runtimeAuthorityGranted=false` unless the runtime-authority rule above is fully satisfied in a separate task.

## Register links

- Canonical control state: `project-register/agent-control-center.json`
- Catalog mirror: `project-register/agent-catalog.json`
- PR review policy: `project-register/pr-review-policy.json`
- Task queue: `project-register/agent-task-queue.json`
- Approved backlog: `project-register/approved-agent-build-backlog.json`

## KI-Fortsetzungs-Prompt

Naechste KI: Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-control-center.json`, `project-register/agent-catalog.json`, `project-register/pr-review-policy.json`, `project-register/agent-task-queue.json` und dieses Dokument. Halte die Agent-OS-Autonomiestufe maschinenlesbar in `project-register/agent-control-center.json#/agentOsAutonomyLevels` und gespiegelt in `project-register/agent-catalog.json#/autonomyLevelState`. Aendere `runtimeAuthorityGranted` nur dann auf `true`, wenn serverseitige Rollenpruefung, Append-only-Audit-Log, exakte Allowlist-Validierung und Stop-Bedingungen im echten Ausfuehrungspfad vorhanden sind. Level 5 Auto-Merge/Deploy bleibt eine separate zukuenftige Policy; keine implizite Aktivierung, kein Merge, kein Deploy, keine Approval-Buttons und keine Protected-Runtime-Arbeit ohne Owner-Freigabe, Reviewplan und Checks.
