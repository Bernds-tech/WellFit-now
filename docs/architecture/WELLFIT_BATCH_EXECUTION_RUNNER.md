# WellFit Batch Execution Runner Framework

Status: framework-only / report-check-only  
Updated: 2026-05-16  
Leading register: `project-register/batch-execution-runner-policy.json`  
Validation script: `scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs`  
Related policies: `project-register/autopilot-batch-execution-policy.json`, `project-register/autopilot-batch-policy.json`, `project-register/task-status-policy.json`, `project-register/pr-review-policy.json`, `project-register/pr-post-creation-guard.json`, `project-register/pr-diff-review-policy.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/cross-reference-maintenance.json`, `project-register/repository-inventory.json`

## Purpose

The Batch Execution Runner framework is the missing connector between the existing Batch Autopilot planner, limited-execution policy, task queue, status/work-log evidence, cross-reference maintenance, PR handoff, PR Diff Review Report, and PR Post-Creation Mergeability Guard.

This first version is intentionally guarded. It defines the policy and validation checks for a future runner that may later execute at most one or two explicitly approved low-risk documentation/register/governance/inventory tasks. It does **not** execute tasks yet, create pull requests, approve pull requests, merge, repair files, deploy, close pull requests, self-approve, or change runtime product behavior.

## Activation boundary

`project-register/batch-execution-runner-policy.json` uses `activationState: framework_only`.

That state means:

- the policy may be validated by `batch-execution-runner-check.mjs`;
- the quality gate may run the checker as report-only evidence;
- future execution flow may be described, but not activated;
- no task is selected for real execution by this checker;
- no pull request is created by this checker;
- auto-merge, auto-repair, self-approval, deployment, and protected-area changes remain disabled.

Any move from `framework_only` to a real controlled one-task runner must be a separate human-reviewed change with a new branch, explicit approval, and passing evidence that all protected boundaries still hold.

## Allowed future scope

The future runner may only consider tasks that are all of the following:

1. `riskLevel: low`;
2. one of the approved documentation/register/governance categories in the policy;
3. bounded to `project-register/*.json`, `todolist/*.md`, `docs/architecture/*.md`, or report/check/dry-run scripts under `scripts/wellfit-dev-agent/src/`;
4. backed by task status and work-log evidence;
5. cross-reference checked against the Work Map, TODO Index, repository inventory, and relevant registers;
6. followed by PR handoff evidence and post-PR report checks.

The runner policy caps future work at `maxTasksPerRun: 2`. The recommended next activation step is even narrower: a controlled one-task local-only runner dry execution with human approval and no PR automation.

## Forbidden scope

The framework forbids runtime and protected-area changes, including:

- `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, package manifests, `firebase.json`, `.github/**`, `native/**`, `native/unity/WellFitBuddyAR/**`, and PR #13 / Unity paths;
- UI, mission, Buddy, Firebase Functions, Firestore Rules, Unity, AR, reward authority, mission completion authority, economy/token/wallet/payment, health, child, location, privacy, compliance, or legal logic changes;
- auto-merge, auto-repair, self-approval, deployment, preview promotion, PR closing, or bypassing human review.

## Required flow when future activation is approved

A future implementation must still remain policy-driven:

1. **Pre-run checks**: read repository instructions, current state, Work Map, TODO Index, runner policy, existing batch policies, task queue, autopilot, task-status, PR-review, post-creation guard, PR-diff, auto-merge, auto-repair, cross-reference, and inventory registers.
2. **Task selection checks**: accept only ready low-risk tasks in approved categories and allowed paths; stop for blocked, stale, done, review-required, protected, or unclear tasks.
3. **Local execution boundary**: in this first framework there is no execution; future activation must start with one task and must not touch runtime/protected files.
4. **Post-run checks**: run lint, typecheck, build, Functions check, quality gate, runner check, PR diff report, post-creation guard, task-status/work-log check, cross-reference check, and `git diff --check`.
5. **PR handoff**: include changed files, checks, policy summary, report-only result, status/work-log and cross-reference evidence, protected-area confirmation, and next recommended task.
6. **Post-PR checks**: run/report auto-merge eligibility, auto-repair decision, PR review policy, PR post-creation guard, PR diff review report, task-status/work-log check, and quality gate.

## Validation script behavior

`scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs` reads the runner policy plus the existing batch execution policy, batch dry-run policy, task queue, auto-merge policy, auto-repair policy, and PR post-creation guard. It validates:

- `maxTasksPerRun <= 2`;
- only `low` risk is allowed;
- approved allowed categories are exact and forbidden categories are present;
- allowed paths are exact and forbidden paths are present;
- required post-PR checks include PR Diff Review Report and PR Post-Creation Guard;
- auto-merge and auto-repair remain `report_only`;
- deployment remains forbidden;
- human review remains required before merge;
- the checker prints `BATCH_EXECUTION_RUNNER_READY=true` or `false`.

The script writes only `scripts/wellfit-dev-agent/output/batch-execution-runner-check.md`. It never executes tasks, creates PRs, approves, merges, repairs, deploys, or modifies product files.

## Relationship to existing architecture

This is not a parallel system. The framework extends the existing mapped governance chain:

- Batch Autopilot dry run remains the planner.
- Batch Limited Execution remains the earlier safety envelope.
- Task Status & Work-Log Sync remains the evidence model.
- Cross-Reference Maintenance remains the anti-duplication and mapped-file follow-up model.
- PR Review Agent, PR Diff Review Report, PR Post-Creation Guard, Auto-Merge Eligibility, and Auto-Repair Decision remain report-only post-PR checks.

## Next recommended step

After this framework is reviewed, the next safe step is a separate PR for a **controlled one-task runner activation plan** that still runs local-only, requires explicit human approval, selects exactly one low-risk documentation/register task, and stops before PR creation, merge, repair, deploy, or protected-area changes.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/batch-execution-runner-policy.json`, `project-register/autopilot-batch-execution-policy.json`, `project-register/autopilot-batch-policy.json`, `project-register/agent-task-queue.json`, `project-register/agent-autopilot.json`, `project-register/task-status-policy.json`, `project-register/pr-review-policy.json`, `project-register/pr-post-creation-guard.json`, `project-register/pr-diff-review-policy.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/cross-reference-maintenance.json`, `project-register/repository-inventory.json`, `scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs`, `scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs`, `scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs` und `scripts/wellfit-dev-agent/src/quality-gate.mjs`. Halte `activationState: framework_only`, fuehre den Runner nur report/check-only aus, aktiviere keine autonome Task-Ausfuehrung, keine PR-Erstellung durch den Runner, kein Auto-Merge, kein Auto-Repair, keine Self-Approval, kein Deployment und keine Runtime-/Protected-/Unity-/PR-#13-Aenderungen; erweitere nur die bestehende Work-Map-/TODO-/Register-Architektur.
