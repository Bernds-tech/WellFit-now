# WellFit PR Review Agent Governance

Status: active / report-only governance  
Leading register: `project-register/pr-review-policy.json`  
Validator: `scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs`

## Purpose

The WellFit PR Review Agent is a review framework for Codex Code Reviews and future WellFit agents. It defines what every pull request must be checked against before a human considers merge: changed files, risk, definition of done, protected areas, Work Map / TODO Index alignment, Product Readiness, repository inventory, cross-reference maintenance, auto-merge eligibility, auto-repair decision, no-duplicate-architecture rules, and the next recommended task.

This governance layer is **report-only**. It does not approve PRs, does not merge PRs, does not repair files, does not deploy, and does not bypass human review.

## Source files to read before review

A PR reviewer should read or use these existing WellFit sources instead of inventing a parallel review system:

- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `project-register/risk-classifier.json`
- `project-register/definition-of-done.json`
- `project-register/cross-reference-maintenance.json`
- `project-register/repository-inventory.json`
- `project-register/product-readiness.json`
- `project-register/auto-merge-policy.json`
- `project-register/auto-repair-policy.json`
- `project-register/agent-task-queue.json`
- `project-register/agent-workflows.json`
- `project-register/pr-review-policy.json`

## Required review checklist

Every PR review report must confirm or reject these items:

1. Changed files are listed.
2. Risk level is stated from `project-register/risk-classifier.json`.
3. Definition-of-done key is stated from `project-register/definition-of-done.json`.
4. Checks run are listed with results; failures are not hidden.
5. Protected files are untouched or explicitly reviewed.
6. `todolist/WORK_MAP.md` and `todolist/TODO_INDEX.md` are updated when relevant.
7. `project-register/product-readiness.json` is updated when relevant.
8. `project-register/repository-inventory.json` is considered when relevant.
9. Cross-reference maintenance was applied using `project-register/cross-reference-maintenance.json`.
10. No duplicate architecture or parallel system was created.
11. Auto-merge eligibility result is reported as report-only.
12. Auto-repair decision result is reported as report-only.
13. Next recommended task is stated.

## Protected-area review

The review must explicitly check these areas and topics:

- PR #13
- `native/unity/WellFitBuddyAR/**`
- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `firestore.rules`
- token / NFT / wallet / payment / purchase / payout / marketplace / staking / presale / trading
- reward authority and final ledger authority
- mission completion authority and anti-cheat
- health, watch, child-safety, location, camera, privacy, consent, legal, AGB, Datenschutz, Impressum, and compliance topics

Touching a protected path or topic does not become acceptable because a script reports `true`. It requires the relevant human review and explicit approval path from `AGENTS.md` and `project-register/risk-classifier.json`.

## Cross-reference, readiness, and inventory expectations

- Use `project-register/cross-reference-maintenance.json` to decide which existing registers, docs, TODO files, and scripts need review or updates.
- Use `project-register/product-readiness.json` and `docs/architecture/WELLFIT_PRODUCT_READINESS_MATRIX.md` when a PR changes module readiness, blockers, safe next tasks, beta status, or production-readiness claims.
- Use `project-register/repository-inventory.json` and `docs/architecture/WELLFIT_REPOSITORY_INVENTORY_AUDIT.md` for broad repository changes, new file groups, route/API mapping changes, or inventory coverage questions.
- Update existing leading files only. Do not create duplicate architecture, duplicate registries, duplicate shells, duplicate route maps, or parallel product systems.

## Auto-merge and auto-repair boundaries

The PR Review Agent must report both outcomes when relevant:

- `AUTO_MERGE_ELIGIBLE=true/false` from `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`
- `AUTO_REPAIR_ALLOWED=true/false` from `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs`

These outputs are informational only. They never approve a PR, never merge a PR, never enable auto-merge, never repair files, never deploy, and never remove the need for human review.

## Validator

Run:

```bash
node scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs
```

The validator parses `project-register/pr-review-policy.json`, checks that required checklist and protected-area entries exist, checks that Work Map and TODO Index reference the policy/doc/script, checks that auto-merge and auto-repair sections are present, and prints:

```text
PR_REVIEW_POLICY_READY=true
```

or:

```text
PR_REVIEW_POLICY_READY=false
```

The validator never approves, merges, repairs, deploys, or modifies files.

## PR description fields

A WellFit PR description should include:

- Changed files
- Risk level
- Definition-of-done key
- Checks run
- Protected-area review
- Work Map / TODO Index decision
- Product Readiness decision
- Repository inventory decision
- Cross-reference maintenance result
- No-duplicate-architecture confirmation
- Auto-merge eligibility result, report-only
- Auto-repair decision result, report-only
- Known risks or skipped checks
- Next recommended task

## Continuation rule

Future agents should extend this governance through `project-register/pr-review-policy.json`, this document, and `scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs`. Do not create a separate PR review architecture or a second review policy system.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/pr-review-policy.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/cross-reference-maintenance.json`, `project-register/repository-inventory.json`, `project-register/product-readiness.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/agent-task-queue.json` und `project-register/agent-workflows.json`. Halte die PR-Review-Governance report-only, aktiviere keine Auto-Approval-, Auto-Merge-, Auto-Repair- oder Deploy-Funktion, beruehre keine Runtime-Produktdateien oder geschuetzten Bereiche ohne expliziten Auftrag, und fuehre `node scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs` sowie relevante Quality-Gate-Checks aus. Aktualisiere nur bestehende Work-Map-/TODO-/Registereintraege und erstelle keine parallele PR-Review-Architektur.
