# WellFit Auto-Repair Policy

Status: report-only
Updated: 2026-05-15
Machine-readable policy: `project-register/auto-repair-policy.json`
Validation script: `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs`

## Purpose

The WellFit Auto-Repair Policy defines when a future agent may report that a failed check looks safe enough for a narrowly scoped automatic repair attempt. The first version is intentionally report-only. It does not modify files, does not run repairs, does not merge branches, does not deploy, and does not bypass human review.

This policy extends the existing WellFit governance stack: `AGENTS.md`, the TODO index, the Work Map, the agent task queue, the risk classifier, the definition of done, the auto-merge policy, the autopilot dry run, cross-reference maintenance, repository inventory, and the quality gate. It is not a duplicate architecture and must remain aligned with those leading files.

## Activation boundary

`activationState` is `report_only`. While that value remains in force:

- the decision check may read the auto-repair policy and existing quality-gate output;
- the decision check may classify failed checks as safely repairable or not safely repairable;
- the decision check may print `AUTO_REPAIR_ALLOWED=true` or `AUTO_REPAIR_ALLOWED=false`;
- the quality gate may include the check as report-only evidence;
- no repair command may run automatically;
- no local or remote merge, deploy, rebase, force-push, or PR action may be performed by this guard.

Any future move away from report-only requires explicit human approval, a separate review plan, and an updated definition of done.

## Maximum attempts

The policy sets `maxRepairAttempts` to `2`. This is a future ceiling only. Because the current activation state is report-only, the script never consumes attempts and never performs attempt loops. If automatic repair is explicitly approved later, an agent must stop when the same failure persists after two attempts or when a new failure appears.

## Safe repair categories

Only these categories may be classified as potentially safe:

1. markdown trailing whitespace;
2. JSON formatting or parse error in project-register docs/register files;
3. missing `TODO_INDEX.md` pointer for a newly added governance doc;
4. missing `WORK_MAP.md` pointer for a newly added governance register;
5. missing `KI-Fortsetzungs-Prompt` in a newly added architecture doc;
6. quality-gate registry pointer mismatch.

A category match is not permission to edit. It only means the report-only decision can say the failure appears safely repairable if all required evidence is present and no stop condition applies.

## Forbidden paths

The policy must stop and report `AUTO_REPAIR_ALLOWED=false` if a failure touches, mentions as an edit target, or appears to require changes in:

- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `firestore.rules`
- `native/unity/WellFitBuddyAR/**`
- `package.json` unless explicitly approved
- `package-lock.json` unless explicitly approved

These paths can still be fixed by a human-approved task, but not by the auto-repair guard.

## Forbidden topics

The policy must stop for human review when the failure or likely repair topic involves token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, Unity, or PR #13.

The guard is deliberately conservative. If protected words appear in a report because the task is documenting guardrails, the check may still classify the current failure as not safe for automatic repair. That false negative is acceptable for the first report-only version.

## Required evidence

A future agent may only consider a repair attempt when the report includes:

- failing command and exit code;
- quality-gate report path when available;
- exact failed check name or parser error;
- exact file paths involved;
- matched safe repair category;
- confirmation that no forbidden path matched;
- confirmation that no forbidden topic matched;
- current attempt count;
- post-repair command result if a future approved repair mode ever exists;
- human review note for any ineligible or stopped condition.

## Decision model

The report-only script returns `AUTO_REPAIR_ALLOWED=false` when any of these conditions apply:

1. the policy is missing or malformed;
2. `activationState` is not `report_only`;
3. no failed check can be detected from available reports;
4. a failure does not match exactly one allowed failure type;
5. a failure references a forbidden path;
6. a failure references a forbidden topic;
7. required evidence is missing or ambiguous;
8. a repair would require runtime product code, protected compliance/product logic, dependency changes, merge/deploy actions, Unity work, or PR #13 action;
9. the future attempt count would exceed `maxRepairAttempts`.

The script may report `AUTO_REPAIR_ALLOWED=true` only when all detected failures are within the allow-list, all required evidence is present, and every stop condition remains false. In report-only mode, that output is advisory and does not authorize edits.

## Quality gate integration

`scripts/wellfit-dev-agent/src/quality-gate.mjs` runs `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs` as a report-only step. The quality gate verifies that the check runs, confirms `Mode: REPORT_ONLY`, confirms `Never repairs: true`, confirms `Never merges: true`, and records the `AUTO_REPAIR_ALLOWED=true|false` line.

The quality gate does not require the current branch to be auto-repairable. A normal passing branch with no failures should usually report `AUTO_REPAIR_ALLOWED=false` because no repair is needed.

## Non-goals

This guard does not:

- edit files;
- format files;
- run repair commands;
- install dependencies;
- update package manifests or lockfiles;
- change runtime product code;
- change token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, Unity, or PR #13 logic;
- merge, deploy, approve, rebase, force-push, or close pull requests.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/auto-repair-policy.json`, `project-register/auto-merge-policy.json`, `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/cross-reference-maintenance.json`, `project-register/repository-inventory.json` und `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs`. Halte Auto-Repair report-only, aktiviere keine echten Reparaturen, fuehre keine Merge-/Deploy-Aktion aus, beruehre keine Runtime-Produktdateien und pflege neue Verweise nur in den bestehenden Work-Map-/TODO-/Registerdateien statt eine parallele Architektur anzulegen.
