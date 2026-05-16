# WellFit PR Diff Review Report

Status: active / report-only  
Updated: 2026-05-16  
Policy: `project-register/pr-diff-review-policy.json`  
Script: `scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs`  
Output: `scripts/wellfit-dev-agent/output/pr-diff-review-report.md`

## Purpose

The PR Diff Review Report framework applies the existing WellFit PR Review Agent governance to actual changed files and PR diffs before merge consideration. It is intentionally report-only: it helps future agents and reviewers see which files changed, how those files are classified, whether protected paths or protected topics are present, and which cross-reference, readiness, inventory, task-status, auto-merge, auto-repair, and post-creation guard evidence is expected.

This framework does **not** approve PRs, merge PRs, enable auto-merge, repair files, deploy, close PRs, or authorize protected runtime work.

## Inputs

The report script reads the existing governance sources instead of creating a parallel architecture:

- `project-register/pr-diff-review-policy.json`
- `project-register/pr-review-policy.json`
- `project-register/pr-post-creation-guard.json`
- `project-register/auto-merge-policy.json`
- `project-register/auto-repair-policy.json`
- `project-register/cross-reference-maintenance.json`
- `project-register/repository-inventory.json`
- `project-register/product-readiness.json`
- `project-register/task-status-policy.json`

The script inspects changed files with Git. By default it tries the best available base ref (`origin/main`, `main`, `origin/master`, or `master`) and also includes unstaged, staged, and untracked files. A base ref can be supplied when needed:

```bash
node scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs --base=origin/main
```

## Changed-file classifications

The policy classifies changed files into these review buckets:

- `docs_only`
- `registry_only`
- `agent_script`
- `runtime_app`
- `runtime_component`
- `runtime_lib`
- `firebase_functions`
- `firestore_rules`
- `public_assets`
- `package_manifest`
- `github_workflow`
- `native_unity`
- `unknown_or_review_required`

Runtime, protected, Unity, workflow, package, or unknown classifications are not automatically rejected by the report script, but they are surfaced for human review and must be handled according to `AGENTS.md`, the PR Review Agent policy, risk classifier, definition of done, and protected-area rules.

## Protected paths and protected topics

The report checks changed files and diff text against protected path and protected topic rules. Protected paths include app/runtime paths, Firebase Functions, Firestore rules, public assets, package manifests, GitHub workflows, Firebase config, and Unity/WellFitBuddyAR paths. Protected topics include token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, camera, face, biometric, motion, consent, Unity, and PR #13.

Protected findings are evidence for human review. They are never a signal to auto-approve, auto-merge, auto-repair, deploy, or bypass review.

## Impact sections

The generated Markdown report includes:

1. Git input sources and changed files.
2. Changed-file classification summary.
3. Protected path findings.
4. Protected topic findings.
5. Cross-reference impact from `cross-reference-maintenance.json`.
6. Product Readiness impact from `product-readiness.json`.
7. Repository Inventory impact from `repository-inventory.json`.
8. Task Status / Work-Log evidence expectations from `task-status-policy.json`.
9. Auto-merge report-only signal when an auto-merge report is available.
10. Auto-repair report-only signal when an auto-repair report is available.
11. PR post-creation guard signal when a post-creation report is available.
12. Human-review reasons and forbidden auto-actions.

## Quality-gate integration

`npm run agent:quality-gate` runs the PR Diff Review Report script as a report-only step. The quality gate validates that the step prints the non-authorizing signals:

- `Mode: REPORT_ONLY`
- `Never approves PRs: true`
- `Never merges PRs: true`
- `Never repairs files: true`
- `Never deploys: true`
- `PR_DIFF_REVIEW_READY=true|false`

The quality gate integration confirms the report executed safely. It does not convert the report into merge approval.

## Reviewer usage

Before merge consideration, reviewers or future agents should:

1. Run the report script, optionally with the PR base ref.
2. Read `scripts/wellfit-dev-agent/output/pr-diff-review-report.md`.
3. Confirm changed files match the PR description.
4. Resolve or explicitly acknowledge protected path/topic findings.
5. Confirm Work Map, TODO Index, Product Readiness, Repository Inventory, cross-reference, task-status/work-log, auto-merge, auto-repair, and post-creation guard evidence is present when relevant.
6. Stop for human review when the report indicates runtime, protected, Unity/PR #13, unknown, readiness, inventory, compliance, or governance-risk impact.

## Boundaries

The first version is report-only. It must not:

- approve PRs;
- merge PRs;
- enable auto-merge;
- repair files;
- deploy;
- close PRs;
- touch runtime product code;
- touch Unity/PR #13 work;
- modify token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, camera, face, biometric, motion, or consent logic;
- create duplicate architecture or parallel systems.

## Next recommended step

After this framework is stable, the next step toward a real Batch Execution Runner is to add a report-only Batch Execution Readiness Report that consumes the PR Diff Review Report output, task queue, work-log, and quality-gate reports to decide whether a future strictly limited runner should remain blocked, ask for human approval, or proceed to a narrow low-risk documentation/register task. That next step should still avoid runtime/protected changes and must not enable auto-merge, auto-repair, or deployment.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/pr-review-policy.json`, `project-register/pr-diff-review-policy.json`, `project-register/repository-inventory.json`, `project-register/product-readiness.json` und `project-register/cross-reference-maintenance.json`. Fuehre den PR Diff Review Report nur report-only aus, dokumentiere `PR_DIFF_REVIEW_READY=true/false`, und aktiviere niemals Auto-Approval, Auto-Merge, Auto-Repair, Deployment, Runtime-Code-Aenderungen oder Unity/PR-#13-Aktionen.
