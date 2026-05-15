# WellFit Batch Autopilot Limited Execution Framework

Status: report/check-only planning framework  
Updated: 2026-05-15  
Leading register: `project-register/autopilot-batch-execution-policy.json`  
Related dry-run policy: `project-register/autopilot-batch-policy.json`  
Validation script: `scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs`

## Purpose

The Batch Autopilot Limited Execution framework defines the safety envelope for a future, strictly limited agent that could execute a very small sequence of low-risk documentation, register, governance, and inventory tasks. It extends the existing task queue, dry-run batch planner, risk classifier, definition of done, auto-merge guard, auto-repair guard, progress log, and work log.

This first version is intentionally **report/check-only**. It validates the future execution boundary but does not execute tasks, edit files, create pull requests, merge, repair, deploy, approve itself, or change runtime product behavior.

## Activation boundary

The machine-readable policy uses `activationState: limited_execution_planning`. That state means:

- the checker may read governance files and report readiness;
- the checker may print `BATCH_LIMITED_EXECUTION_READY=true` or `BATCH_LIMITED_EXECUTION_READY=false`;
- the quality gate may run the checker in report-only mode;
- no real batch execution is enabled;
- no pull request is created by the checker;
- no auto-merge, auto-repair, deployment, or self-approval is allowed.

Any future move beyond this planning state requires explicit human approval, a separate review plan, and updated evidence that the same protected-area constraints still hold.

## Allowed future execution categories

The policy permits only these future execution categories:

- `documentation_baseline`
- `registry_sync`
- `repository_inventory_mapping`
- `agent_governance_docs`
- `progress_log_update`
- `cross_reference_maintenance`
- `product_readiness_registry_update`
- `route_api_drift_registry_followup`
- `concept_gap_registry_followup`

These categories are deliberately limited to documentation/register/governance/inventory follow-up work already represented by the existing WellFit governance architecture. They are not product implementation categories.

## Forbidden execution categories

The policy blocks runtime product work and protected topics, including:

- runtime product code;
- UI, mission, Buddy, Firebase Functions, Firestore Rules, Unity, or AR implementation;
- reward authority or final ledger behavior;
- economy, token, NFT, wallet, payment, betting, purchase, payout, marketplace, staking, presale, or trading work;
- health, child-safety, location, privacy, compliance, or legal logic changes.

The checker treats medium, high, critical, or unclear risk as a stop condition for future batch execution.

## Path boundaries

Allowed future execution paths are limited to:

- `project-register/*.json`
- `todolist/*.md`
- `docs/architecture/*.md`
- `scripts/wellfit-dev-agent/src/*check.mjs`
- `scripts/wellfit-dev-agent/src/*dry-run.mjs`

Forbidden paths include:

- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `firestore.rules`
- `native/unity/WellFitBuddyAR/**`
- `package.json` unless explicitly approved
- `package-lock.json` unless explicitly approved
- `public/**` unless explicitly approved

The checker is conservative: if a candidate's allowed files are outside the future execution allow-list or intersect a forbidden path, the candidate is not executable by the limited batch framework.

## Required safety gates

Before any future limited execution can be considered, the framework requires:

1. first-read governance files and registers to be available and valid;
2. branch state to be clear and not `main` or `master`;
3. human approval before any future execution or PR creation;
4. all candidate tasks to be low risk;
5. all executable candidates to use only allowed categories and paths;
6. auto-merge policy to remain `report_only`;
7. auto-repair policy to remain `report_only`;
8. deployment to remain forbidden;
9. first-version checker behavior to remain report/check-only.

## Script behavior

`scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs` reads:

- `project-register/autopilot-batch-execution-policy.json`
- `project-register/autopilot-batch-policy.json`
- `project-register/auto-merge-policy.json`
- `project-register/auto-repair-policy.json`
- `project-register/agent-task-queue.json`
- `project-register/progress-log.json`
- `project-register/agent-work-log.json`

It verifies policy shape, task-category/path boundaries, protected-topic blocking, disabled auto-merge, disabled auto-repair, no deployment, and required human approval. It outputs readiness and reasons, writes no task changes, and performs no PR, merge, repair, deployment, or approval action.

## Quality gate integration

`scripts/wellfit-dev-agent/src/quality-gate.mjs` runs the limited execution checker as a report-only step. The quality gate verifies that the script exits successfully, reports `Mode: REPORT_CHECK_ONLY`, prints `BATCH_LIMITED_EXECUTION_READY=true` or `false`, and confirms that the first version never executes tasks, creates PRs, merges, repairs, deploys, or approves its own work.

## Relationship to existing Batch Autopilot dry run

The existing dry-run policy remains the planner for reporting candidate task sequences. The limited execution policy is a separate safety boundary for a possible future executor. It does not duplicate the task queue or introduce a parallel architecture; it references the existing dry-run policy, task queue, risk classifier, definition of done, progress log, and work log.

## Non-goals

This framework does not:

- enable real batch execution;
- create pull requests from the checker;
- merge or approve pull requests;
- run auto-repair loops;
- deploy or promote previews;
- modify runtime product code;
- touch Unity / WellFitBuddyAR files or PR #13;
- alter protected economy, health, child-safety, privacy, compliance, or legal logic.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/autopilot-batch-execution-policy.json`, `project-register/autopilot-batch-policy.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/progress-log.json`, `project-register/agent-work-log.json` und `scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs`. Halte diese erste Version report/check-only, aktiviere keine echte Batch-Ausfuehrung, erstelle keine PRs aus dem Checker, merge/repariere/deploye nicht, beruehre keine Runtime-/Unity-/PR-13-/Compliance-geschuetzten Bereiche und pflege neue Verweise nur in den bestehenden Work-Map-/TODO-/Registerdateien statt eine parallele Architektur anzulegen.
