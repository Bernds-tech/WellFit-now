# WellFit Admin-Approved Agent Autonomy

Updated: 2026-05-17
Status: governance proposal for the next autonomy stage; no runtime execution is activated by this document alone.

## Owner request

Bernd wants the Agent Center to become the single place where an admin approval confirms that an agent task should be implemented, after which the responsible agents execute the approved task and move the result toward live availability.

## Decision

The rule change is accepted as a staged policy direction, but it must not become an unrestricted one-click deploy. The Admin Center approval may authorize one exact task, one scope, one branch/PR handoff, and one required check set. A live release may happen only when the task tier explicitly allows it, all required checks pass, protected scopes are clear or separately approved, and the release target has an auditable deployment gate.

## Why direct one-click live is not safe yet

The current Agent Center is a read-only register console. It does not yet provide server-side identity verification, role checks, append-only approval logs, scope-bound execution tokens, CI status verification, mergeability verification, or deployment authority. Without those controls, a button that lets an agent implement and go live would bypass the safety model around rewards, mission completion, health, child safety, location, camera, legal, payment, token, Unity, and production data.

## Required autonomy stages

| Stage | Name | Admin approval effect | Live effect |
| --- | --- | --- | --- |
| A0 | Read-only visibility | Admin can inspect status only. | None. |
| A1 | Task draft approval | Admin can approve that a task draft is valid for planning. | None. |
| A2 | Docs/Register/Validator execution | Admin can allow one docs/register/check-script agent task, branch, commit, and PR handoff. | No product runtime live effect. |
| A3 | Safe runtime implementation | Admin can approve one exact low/medium-risk non-protected runtime task with explicit files and checks. | PR can be prepared; live release still waits for review/merge/deploy gate. |
| A4 | Protected runtime implementation | Owner can approve one exact protected task with review plan, tests, audit evidence, and stop conditions. | Manual release only after human review. |
| A5 | Controlled live release | Owner can approve release only after checks, PR review evidence, mergeability, protected-scope review, rollback plan, and deployment audit. | Live release allowed for that one approved task. |

## Minimum Admin Center approval record

Every real approval must store these fields before any agent execution starts:

- approval id
- authenticated actor id
- actor role
- task id
- agent id
- autonomy stage
- exact task description
- allowed files or path globs
- blocked files and protected scopes
- required checks
- required review plan
- stop conditions
- rollback or recovery note for live-facing tasks
- timestamp
- self-approval check result
- final decision: approved, rejected, or needs revision

## Execution rules after approval

1. The agent may execute only the approved task and only inside the approved path scope.
2. The agent must stop on dirty/unexpected files, protected path findings, missing checks, failed checks, missing audit fields, self-approval, or ambiguous approval text.
3. Low/medium non-protected changes may reach PR handoff after checks pass.
4. Protected changes require explicit owner approval and a review plan before implementation, then human review before merge.
5. Auto-live is not allowed for rewards, mission completion authority, token/wallet/payment logic, health, child safety, location, camera, legal/compliance, Unity, PR #13, Firestore rules, or Firebase Functions unless a dedicated owner-approved release policy names the exact task and checks.
6. Deploy/live release must be separated from implementation until CI, mergeability, deployment audit, and rollback checks are machine-verifiable.

## Policy changes needed next

- Add a server-side approval API with Firebase Auth role checks.
- Add append-only approval and execution audit collections.
- Add Admin Center buttons only after the API exists.
- Extend the runner to consume a signed/scope-bound approval record instead of broad register text.
- Add CI/check-status and mergeability verification before any release action.
- Keep `maxAgentsPerRun: 1` until multiple-agent conflict detection exists.

## Explicit non-goals for this step

- No auto-merge activation.
- No auto-deploy activation.
- No protected runtime authority activation.
- No reward or mission-completion authority movement to the client.
- No Unity or PR #13 action.
- No bypass of required checks or human review.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `project-register/agent-control-center.json`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-runner-policy.json`, `project-register/agent-task-draft-schema.json`, `project-register/agent-task-queue.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/pr-review-policy.json` und dieses Dokument. Arbeite als naechstes an einem kleinen, reviewbaren Owner-Approval-Runtime-Plan fuer den Admin Center. Aktiviere keine echten Approval-Buttons, keine Runtime-Ausfuehrung, kein Auto-Merge und kein Deploy, bis serverseitige Auth-/Rollenpruefung, Audit-Log, exakte Scope-Allowlist, Pflichtchecks, Stop-Bedingungen und Release-Gates implementiert und separat freigegeben sind.
