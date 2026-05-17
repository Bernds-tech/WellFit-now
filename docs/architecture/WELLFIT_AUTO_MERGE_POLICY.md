# WellFit Auto-Merge Eligibility Policy

Status: report-only  
Updated: 2026-05-15  
Machine-readable policy: `project-register/auto-merge-policy.json`  
Validation script: `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`

## Purpose

The Auto-Merge Eligibility Guard lets future WellFit agents report whether a pull request would be safe to consider for automatic merge at some later date. The first version is deliberately dry-run/report-only. It does not enable GitHub auto-merge, does not merge branches, does not approve pull requests, and does not bypass human review.

The guard extends the existing agent governance, task queue, risk classifier, definition of done, repository inventory, cross-reference maintenance, and quality-gate flow. It must not create a parallel architecture or replace the existing PR handoff rules.

## Activation boundary

`activationState` is `report_only`. While that value remains in force:

- the script may inspect git diffs and produce a local eligibility report;
- the script may print `AUTO_MERGE_ELIGIBLE=true` or `AUTO_MERGE_ELIGIBLE=false`;
- the quality gate may include the script as a report-only step;
- no local or remote merge command may be run by this guard;
- a human reviewer still owns merge decisions.

Any attempt to change the policy away from `report_only` requires explicit human approval and a separate review plan.

## Numbered autonomy stages

This policy intentionally distinguishes the desired autonomy roadmap from the currently safe operating mode. The current auto-merge policy remains `activationState: report_only`; the numbered stages below are governance vocabulary, not automatic activation.

| Stage | Activation value | Auto-merge/deploy effect | Current status |
| --- | --- | --- | --- |
| 1.0 | `report_only` | Report-only analysis of scope, checks, and blockers. | Active for the auto-merge policy. |
| 1.1 | `docs_register_check_script_pr_handoff` | Allows only docs/register/check-script branch, commit, and PR handoff in the separate approved runner policy; it does not merge. | Allowed only where the runner policy separately permits it. |
| 1.2 | `safe_docs_register_json_format_repair_with_rerun_evidence` | Allows only safe docs/register JSON-format repair with same-branch commit and rerun evidence in the separate repair policy; it does not merge. | Allowed only where the safe-repair policy separately permits it. |
| 1.3 | `merge_deploy_eligibility_report_only` | May produce eligibility reports for merge/deploy readiness, including missing evidence and blockers. | Report-only target; no actual merge, deploy, approval, PR close, repository-setting change, or environment mutation. |
| 2.0 | `manual_merge_assistant_future_optional` | Optional future manual merge assistant may prepare human-facing merge handoff only after explicit owner approval. | Not active; no autonomous merge or self-approval. |
| 3.0 | `deploy_assistant_future_optional` | Optional future deploy assistant may prepare deploy handoff only after explicit owner approval, hosted CI evidence, rollback plan, environment separation, and protected-scope exclusion. | Not active; no autonomous deploy. |

The discrepancy is intentional: WellFit may want a future merge/deploy assistant, but the current safety posture supports only report-only eligibility for those actions. Missing, pending, skipped, unknown, failed, environment-blocked, self-approved, or local-only evidence must keep merge/deploy execution disabled.

## Eligible categories

A future PR can only be considered eligible when its category is one of the policy allow-list entries:

- `documentation_baseline`
- `registry_sync`
- `agent_governance_docs`
- `progress_log_update`
- `repository_inventory_mapping`

These categories are intentionally limited to documentation, registry, governance, progress, and inventory mapping work. Runtime product work is out of scope.

## Forbidden paths

The policy blocks automatic merge consideration for these paths:

- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `firestore.rules`
- `native/unity/WellFitBuddyAR/**`
- `package.json` unless explicitly approved
- `package-lock.json` unless explicitly approved

A match does not mean the PR is wrong; it means the PR requires human review and cannot be marked auto-merge eligible by this guard.

## Forbidden topics

The policy blocks automatic merge consideration when the diff or changed-file path contains protected topics including token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, Unity, or PR #13 references.

This is a conservative guard. Documentation that intentionally lists protected topics may therefore be reported ineligible, which is acceptable for a report-only first version.

## Required checks

The policy requires the following checks to be listed for an eligible PR:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm --prefix functions run check`
- `npm run agent:quality-gate`
- `node scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`
- `jq empty project-register/auto-merge-policy.json`
- `npm run agent:autopilot:dry-run`

Future CI integration may pass explicit check-result evidence to the script, but this first version only validates that the required check list is present in the policy and reports local eligibility conditions.

## Decision model

The script reports ineligible when any of these conditions apply:

1. the policy is missing or malformed;
2. `activationState` is not `report_only`;
3. changed files cannot be inspected;
4. changed files are not documentation/register/governance-script-only;
5. a forbidden path matches;
6. a forbidden topic keyword appears in a changed-file path or diff;
7. required checks are not listed in the policy;
8. changed-file, addition, or deletion counts exceed the configured maxima.

The output always includes reasons so a reviewer can see whether a PR failed due to scope, protected path/topic, missing check evidence, or size.

## Quality gate integration

`scripts/wellfit-dev-agent/src/quality-gate.mjs` runs the eligibility script as a report-only step. The quality gate only verifies that the script runs and that it confirms `Mode: REPORT_ONLY` and `Never merges: true`; the quality gate does not require every current PR to be auto-merge eligible.

## Non-goals

This guard does not:

- merge pull requests;
- enable repository auto-merge settings;
- approve reviews;
- replace human review;
- modify runtime product code;
- grant exceptions for protected paths or topics;
- change token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, Unity, or PR #13 logic.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/auto-merge-policy.json`, `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json` und `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`. Halte den Auto-Merge Eligibility Guard report-only, aktiviere kein echtes Auto-Merge, beruehre keine Runtime-Produktdateien und dokumentiere jede Aenderung in den bestehenden Work-Map-/TODO-/Registereintraegen statt eine parallele Architektur anzulegen.
