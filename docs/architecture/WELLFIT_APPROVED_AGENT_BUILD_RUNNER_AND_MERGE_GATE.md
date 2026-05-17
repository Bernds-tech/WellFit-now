# WellFit Approved Agent Build Runner and Merge Gate

Status: report-only framework
Updated: 2026-05-16
Primary policy: `project-register/approved-agent-build-runner-policy.json`
State register: `project-register/agent-build-runner-state.json`
Merge-gate register: `project-register/approved-agent-build-runner-merge-gate.json`

## Why this runner exists

The Approved Agent Build Runner exists because WellFit now has an approved backlog of future governance agents, but autonomous execution must not outrun review, checks, or protected-scope guardrails. The project owner has approved the backlog entries in `project-register/approved-agent-build-backlog.json` for sequential future building. That approval is not permission to change runtime product code, skip required checks, merge when evidence is missing, self-approve, deploy, or touch protected areas.

The immediate risk addressed by this framework is the PR #109 pattern: a PR body can state that heavy checks were not executed in the current session and should be run later by CI or a maintainer. Under this runner, that is classified as `not_merge_ready`. A required check is merge evidence only when the exact command was actually run and passed, or when a GitHub required check is available and successful. Missing, skipped, unknown, pending, delegated-to-future-CI, or environment-blocked checks fail the merge gate.

## How this differs from Agent Architect

The Agent Architect & Proposal Agent proposes the next safe future-agent build by reading the catalog, approved backlog, extension policy, risk sources, and continuity map. It generates a human-readable build prompt but does not execute that prompt.

The Approved Agent Build Runner is the later governed execution and merge-gate layer. Its first version remains report-only: it validates policy, selects the next eligible approved backlog entry during dry run, and lists the files and checks that would be required. The activation path is now explicitly staged so PR creation, merge recommendation, and real auto-merge cannot be conflated.


## Separated capability states

The policy now separates three future capability states instead of treating PR creation as auto-merge readiness:

1. `pr_creation_allowed`: the agent may create a PR for an approved, in-scope, non-main branch after required evidence is recorded. This state permits PR creation only; it does not permit merge, approval, self-approval, deployment, closing replacement PRs, or treating the PR as merge-ready.
2. `merge_recommendation_allowed`: the agent may recommend merge only when the concrete PR exists and all required local checks, required GitHub checks, mergeability, branch-protection requirements, review rules, human-approval evidence, and protected-scope gates are green. This state permits a recommendation, not the merge action itself.
3. `auto_merge_allowed`: remains disabled. It may not be enabled until GitHub checks, branch protection, review rules, and human approval are machine-readably proven for the concrete PR and a separate human-approved policy update explicitly enables real auto-merge.

The first meaningful next step is `pr_creation_allowed`, not `auto_merge_allowed`. A PR can be useful for review and CI evidence before the project has enough machine-readable proof to allow any automatic merge behavior.

## Approved backlog source and one-agent selection

The runner reads `project-register/approved-agent-build-backlog.json` as the source of already human-approved future-agent candidates. It sorts eligible entries by `suggestedBuildOrder` and selects only the first entry whose status remains eligible for planning/build and whose `alreadyHumanApproved` flag is true.

`maxAgentsPerRun` is fixed at `1` for the first real activation. Future increases require a separate approved policy update. The current dry run therefore selects one candidate for reporting only and never builds it.

## Generated prompts

The runner remains compatible with `scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs`. That proposal script can create the next prompt from the approved backlog. The runner treats the prompt as build input, not as merge evidence. A generated prompt may guide a future one-agent implementation, but the future PR must still provide exact local and GitHub check evidence before the merge gate can pass.

## Required checks and evidence

The policy separates required checks into pre-build, build, post-build, post-PR, and merge-gate groups. Required local commands include lint, TypeScript, build, Firebase Functions check, `git diff --check`, JSON validation for changed project-register files, quality gate, PR diff review, PR post-creation guard, auto-merge eligibility, auto-repair decision, task status/work-log sync, Agent Catalog/Backlog checks, and Agent Architect proposal checks.

A PR must record exact commands and results. PR body claims must match executed checks. If a command was not run, the merge gate fails. If GitHub required checks are unavailable, unknown, pending, missing, or failing, the merge gate fails unless a separate explicit human override is present.


## Corrected report-only merge-gate semantics

The merge-gate validator now separates configuration readiness from concrete merge readiness:

- `REPORT_ONLY_MERGE_GATE=true` means this gate only reports and validates safety semantics.
- `GATE_CONFIGURATION_READY=true` means the gate configuration, register, documentation, validator output, and Quality Gate integration are valid.
- `MERGE_READY=false` is the expected safe report-only state when a concrete PR still lacks post-PR mergeability evidence, required GitHub check success, complete local-check evidence, or human review.
- `MISSING_CHECKS_BLOCK_MERGE=true` keeps missing, unknown, pending, skipped, failed, or environment-blocked checks as actual merge blockers.
- `SAFE_REPAIR_LIMITED=true`, `AUTO_MERGE_ALLOWED=false`, `NEVER_MERGES=true`, and `NEVER_DEPLOYS=true` keep the runner non-authorizing; `pr_creation_allowed` and `merge_recommendation_allowed` remain separate from real auto-merge.
- `APPROVED_AGENT_BUILD_RUNNER_MERGE_GATE_READY=true` is emitted only when the gate configuration is valid.

The validator must exit `0` when `GATE_CONFIGURATION_READY=true`, even while `MERGE_READY=false`. It must exit non-zero only when `GATE_CONFIGURATION_READY=false`. Therefore a report-only PR can pass validation and Quality Gate while still reporting that actual merge readiness is blocked until complete evidence exists.

## Missing-check handling

Missing required checks block both merge recommendation and merge. The runner must try to run missing checks before deciding. If a check cannot run because of environment or tooling limitations, the result is `environment_blocked` and the PR is not merge-ready. If a check fails for safe docs/register/governance reasons, a future activated runner may attempt safe repair within the same PR branch. If a check fails because of runtime, protected, high-risk, or product-judgment scope, the runner must stop, mark `repair_required`, and create a report/repair plan instead of merging.

## Safe repair rules

Safe repair is deliberately narrow. It may only address documentation/register/governance issues such as Markdown trailing whitespace, missing final newlines, JSON formatting or parse errors in `project-register/*.json`, missing Work Map or TODO Index pointers, missing KI-Fortsetzungs-Prompt sections in newly added architecture docs, missing `expectedPrOutput` in a task-queue entry, missing continuity output locations or next recommended tasks, missing quality-gate registration for a report-only governance validator, missing catalog/backlog/proposal metadata for the one newly built approved agent, and missing work-log/progress-log evidence while changes remain in allowed docs/register paths.

A safe repair must be committed as a new commit on the same PR branch, rerun the failed checks, rerun the full required build and post-PR checks, record the repair attempt, and remain unmerged until all required checks pass.

## When the runner stops instead of merging

The runner stops instead of recommending or performing merge when any protected/runtime path changes, any high/critical risk or source-of-truth ambiguity appears, any required check is missing or failing, GitHub mergeability is unknown/dirty/blocked/pending/failed, auto-repair reports unresolved `repair_required`, PR diff review reports protected path findings, no task/work-log evidence exists, or any deploy, approval, self-approval, repository-setting, PR #13, or Unity action is detected.

## Runtime and protected changes remain blocked

This framework is documentation/register/validation-script only. It does not authorize changes to `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, `package.json`, `package-lock.json`, `firebase.json`, `.github/**`, `native/**`, `native/unity/WellFitBuddyAR/**`, PR #13, token/NFT/wallet/payment/economy authority, reward authority, mission completion authority, health, child, location, camera, biometric, consent, privacy, legal, or compliance logic.

Protected topics may be mentioned as safety boundaries in governance docs. They do not become implementation permission. If protected runtime files change, the runner must stop and report.

## Avoiding the PR #109 missing-check risk

Under this gate, a PR body that says checks were not executed and should be run later is not merge-ready. The gate requires executed local check evidence and successful required GitHub checks. Delegating required checks to later CI without visible success evidence is treated the same as missing evidence. The runner must attempt to complete missing safe checks, attempt only allowed safe repairs if needed, and refuse merge recommendation or merge until every required check is green.

## Future activation path

After this report-only framework passes policy validation and quality gate checks, a separate human-approved task may continue controlled one-agent execution for the next eligible backlog entry. The next sensible activation is `pr_creation_allowed`: allow the agent to create a reviewable PR for in-scope work while still blocking merge, approval, self-approval, deployment, and auto-merge enablement.

Only after PR creation is stable should a later policy step consider `merge_recommendation_allowed`, and only when all local checks, GitHub checks, branch protection, review rules, human-approval evidence, and protected-scope gates are green. `auto_merge_allowed` remains disabled until those same requirements are machine-readably proven and a separate human-approved policy update enables it. Multisensory Learning Engine has already been selected by the first controlled activation; future activation should continue only from the approved backlog order, preserve `maxAgentsPerRun: 1`, report exact evidence, avoid protected/runtime paths, and pass the full merge gate before any merge recommendation.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/approved-agent-build-runner-policy.json`, `project-register/approved-agent-build-runner-merge-gate.json`, `project-register/agent-build-runner-state.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-catalog.json`, `project-register/agent-build-proposals.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/pr-review-policy.json`, `project-register/pr-post-creation-guard.json`, `project-register/pr-diff-review-policy.json`, `project-register/task-status-policy.json`, `project-register/continuity-dependency-map.json`, `scripts/wellfit-dev-agent/src/approved-agent-build-runner-check.mjs`, `scripts/wellfit-dev-agent/src/approved-agent-build-runner-dry-run.mjs`, `scripts/wellfit-dev-agent/src/approved-agent-build-runner-merge-gate-check.mjs` und `scripts/wellfit-dev-agent/src/quality-gate.mjs`. Arbeite weiter nur am bestehenden Approved-Agent-Build-Runner- und Merge-Gate-Rahmen. Baue keine Future Agents automatisch; aktiviere als nächsten sinnvollen Schritt nur nach separater Freigabe `pr_creation_allowed` für PR-Erstellung ohne Merge, Approval, Self-Approval, Deployment oder Auto-Merge; empfehle Merge nur in `merge_recommendation_allowed`, wenn alle Checks und Review-/Branch-Protection-/Human-Approval-Nachweise grün sind; halte `auto_merge_allowed` deaktiviert, bis GitHub-Checks, Branch Protection, Review-Regeln und Human-Approval maschinenlesbar nachgewiesen und separat genehmigt sind; repariere nicht automatisch, deploye nicht, fasse keine Runtime-/Protected-/Unity-/PR-#13-Dateien an und erweitere `maxAgentsPerRun` nicht ohne separate Freigabe.
