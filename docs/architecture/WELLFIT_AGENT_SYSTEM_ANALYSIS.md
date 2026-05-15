# WellFit Agent System Analysis

Stand: 2026-05-15  
Scope: Current WellFit agent, autopilot, governance, register, TODO, readiness, feedback/insight, roadmap, and validation system. This document is analysis-only and does not create a parallel architecture.

## 1. Purpose

WellFit already has a layered agent/governance system. Future agents must continue existing work in mapped files instead of creating duplicate architecture, duplicate TODO systems, or parallel runtime systems. This analysis explains the current components and points future agents to the cross-reference maintenance framework:

- Machine-readable framework: `project-register/cross-reference-maintenance.json`
- Human-readable runbook: `docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md`
- Validator: `scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs`

## 2. Current agent and governance components

### Repository-level rules

- `AGENTS.md` is the repository-wide rule file. It requires branch/PR workflow, forbids direct work on `main`, protects Unity/PR #13, and blocks unauthorized changes to token/NFT/wallet/payment, reward authority, health, child, location, privacy, legal, and compliance areas.
- `agents/AGENTS.md` applies inside `agents/` and documents the staged WellFit agent workflow, Stufe-4 mode, source-of-truth files, failure recovery, and completion conditions.
- `agents/modes/` contains staged operating modes and autonomous-development guidance.
- `agents/self-check.md`, `agents/failure-recovery-rules.md`, `agents/security-rules.md`, `agents/scalability-rules.md`, and `agents/documentation-rules.md` provide supporting guardrails.

### Machine-readable governance registers

- `project-register/agent-workflows.json` defines the active Stufe-4 workflow, first-read files, control registers, scripts, usage notes, autonomy boundaries, anti-duplication rule, and required checks before PR.
- `project-register/agent-task-queue.json` holds task candidates, selection rules, repeat-selection policy, loop guard policy, globally forbidden files/changes, default checks, JSON validation checks, and expected PR output.
- `project-register/agent-autopilot.json` defines the dry-run-only autopilot orchestrator: first-read files, iteration phases, allowed/forbidden actions, risk gates, stop conditions, human approval rules, and report output.
- `project-register/definition-of-done.json` and `project-register/risk-classifier.json` define completion and risk boundaries used by the task picker and governance checks.
- `project-register/agent-work-log.json`, `project-register/agent-follow-ups.json`, and `project-register/progress-log.json` are the memory/logging layer for completed work, follow-ups, and project progress.

### Source, route, API, feature, readiness, and roadmap registers

- `project-register/routes.json` is the route inventory for public, mobile, protected app, and system pages.
- `project-register/apis.json` is the API-route inventory.
- `project-register/features.json` maps feature domains and safety rules.
- `project-register/product-readiness.json` records module readiness, blockers, safe next tasks, duplicate warnings, and human-review guidance.
- `project-register/internal-sources.json` maps internal concept source groups to existing implementation and documentation locations.
- `project-register/master-roadmap-tasks.json` imports the historical WellFit master roadmap into the current source-of-truth hierarchy without replacing it.
- `project-register/visual-regression.json` defines optional route-backed visual smoke coverage.

### Research, feedback, and insight governance

- `project-register/research-recommendations.json` defines the internal-first research/recommendation agent: read internal sources first, use external research only when available/allowed, present three options, select one recommendation, classify risk, and require human review for protected topics.
- `project-register/user-feedback.json` defines privacy-aware feedback structures and agent-readable aggregate-only summaries.
- `project-register/feedback-analytics-loop.json` defines the feedback loop audit and aggregation boundaries.
- `project-register/adaptive-user-insights.json` defines a planning-only adaptive insight framework with aggregate-only data, no raw identifiers, threshold rules, explainability, and human-review triggers.

## 3. Current memory files

Future agents should treat these files as the current memory stack:

1. `AGENTS.md` for repository rules and protected areas.
2. `todolist/CURRENT_PROJECT_STATE.md` for current baseline, verified checks, open priorities, and risky/blocker areas.
3. `todolist/WORK_MAP.md` for topic-to-file routing and anti-duplication guidance.
4. `todolist/TODO_INDEX.md` for the TODO/source index and canonical pointers.
5. `todolist/NEXT_ACTIONS.md` for current safe next actions.
6. `project-register/agent-task-queue.json` for selectable tasks and loop guards.
7. `project-register/agent-workflows.json` for workflow/control-register relationships.
8. `project-register/agent-autopilot.json` for dry-run autopilot scope.
9. `project-register/agent-work-log.json`, `project-register/agent-follow-ups.json`, and `project-register/progress-log.json` for historical work and handoff memory.
10. `project-register/cross-reference-maintenance.json` for required cross-reference updates after future changes.

## 4. Current task-selection flow

The current safe task-selection flow is:

1. Read the required memory files (`AGENTS.md`, current project state, Work Map, TODO index, Next Actions, task queue, workflows, readiness, sources, and relevant registers).
2. Run or consult the next-task picker (`scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs`) and autopilot dry-run (`scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs`).
3. Select only a task that is not blocked, not protected without approval, and not a repeat/loop violation.
4. Classify risk using existing risk and definition-of-done registers.
5. Keep the task small, branch-scoped, and mapped to existing files.
6. Update documentation/registers after the change and run the Quality Gate.
7. Record outcomes and follow-ups through existing progress/work-log/follow-up mechanisms.

Autopilot is a planning/reporting helper, not an implementation engine. It reports safe candidate work, stop conditions, required checks, and files, but it must not merge, deploy, or rewrite protected areas.

## 5. Current cooldown and loop-guard behavior

The system uses several loop guards rather than a single cooldown timer:

- `project-register/agent-task-queue.json` contains `repeatSelectionPolicy` and `loopGuardPolicy` to prevent repeatedly selecting the same unresolved task or cycling on blocked work.
- `scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs` chooses a safe next task from the queue and reports `TASK_SELECTED` only when a suitable candidate exists.
- `scripts/wellfit-dev-agent/src/follow-up-detector.mjs` runs report-only and identifies follow-up work without rewriting history.
- `scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs --dry-run` validates PR outcome recording without mutating registers during the quality gate.
- `scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs` stays dry-run-only and stops before implementation, merge, or deploy.

Future agents must not bypass these loop guards by creating duplicate task queues or by repeatedly choosing the same documentation baseline task when a more specific mapped task is now available.

## 6. Current validation scripts

The Quality Gate orchestrates the current validation layer through `scripts/wellfit-dev-agent/src/quality-gate.mjs`. The notable checks include:

- Agent config validation: `validate-agent-config.mjs`
- Alpha goal coverage: `alpha-goal-check.mjs`
- Memory sync and prompt coverage: `memory-sync.mjs`, `generate-coder-prompts.mjs`
- Dry-run planning: `dry-run.mjs`
- Stufe-4 and governance controls: `stufe4-governance-check.mjs`, `agent-governance-control-check.mjs`
- Product readiness: `product-readiness-check.mjs`
- Route/API register and drift checks: `route-api-register-check.mjs`, `route-api-drift-detector.mjs`
- Concept-to-code gap analysis: `concept-to-code-gap-analyzer.mjs`
- Site, mobile Buddy, feedback, Firebase security, emulator plan, mission/buddy/economy, and Firestore economy checks
- Next-task, autopilot dry-run, follow-up detector, PR outcome dry-run, and TODO status sync
- Master roadmap, research recommendation, and adaptive user insight checks
- Cross-reference maintenance: `cross-reference-maintenance-check.mjs`

## 7. Current register families

The current register families are:

- **Execution/governance:** `agent-workflows.json`, `agent-task-queue.json`, `agent-autopilot.json`, `definition-of-done.json`, `risk-classifier.json`
- **Memory/logging:** `agent-work-log.json`, `agent-follow-ups.json`, `progress-log.json`
- **Product inventory:** `routes.json`, `apis.json`, `features.json`, `product-readiness.json`, `visual-regression.json`
- **Source and roadmap mapping:** `internal-sources.json`, `master-roadmap-tasks.json`
- **Research and insight:** `research-recommendations.json`, `user-feedback.json`, `feedback-analytics-loop.json`, `adaptive-user-insights.json`
- **Cross-reference maintenance:** `cross-reference-maintenance.json`

Future registers should only be added when an existing family cannot safely represent the information, and the new file must be linked in Work Map, TODO Index, workflows, task queue, internal sources when relevant, and cross-reference maintenance.

## 8. Current protected areas

Protected areas remain governed by `AGENTS.md` and the register risk gates:

- PR #13 and `native/unity/WellFitBuddyAR/**`
- Token, NFT, WFT, wallet, payment, purchase, payout, marketplace settlement, staking, presale, trading, DAO, and financial-equivalent mechanics
- Reward authority, mission completion authority, anti-cheat, leaderboard/payout authority, inventory unlocks, rare-item grants, PvP stakes, betting, and ledger-like writes
- Health, watch, child-safety, location, camera, biometric, privacy, consent, legal, Datenschutz, AGB, Impressum, and compliance messaging
- Secrets, server API keys, service accounts, production deploy, live deploy, merge-to-main, and production data writes

Documentation and registry updates may describe guardrails for these areas, but future agents must not implement or alter protected logic without explicit instruction and a review plan.

## 9. Current Autopilot limitations

Autopilot is intentionally limited:

- It is dry-run/report-only.
- It reads existing governance and selects a safe task candidate, but does not implement tasks.
- It must stop on high/critical risk, protected areas, unclear requirements, missing human approval, failing required checks, dirty/unexpected files, or merge/deploy requests.
- It must not work around existing source-of-truth files by creating a new architecture, route system, API system, readiness system, or TODO system.
- It must not merge, deploy, close PR #13, touch Unity files, or modify compliance/reward/payment/privacy logic.

## 10. What must happen after every future agent task

After every future agent task, agents must:

1. Identify which `changeCategories` in `project-register/cross-reference-maintenance.json` apply.
2. Inspect all `requiredInspectFiles` for those categories.
3. Update the relevant `requiredUpdateTargets` only when the current task actually changes their area.
4. Preserve historical TODO/status context; mark stale/duplicate content rather than deleting it.
5. Record useful outcome/risk/follow-up context in existing progress/work-log/register files.
6. Run the category-specific validation plus `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` and `npm run agent:quality-gate` when governance is in scope.
7. Report checks, skipped checks, known risks, dependency changes, branch name, and protected/runtime areas touched or explicitly untouched.

## 11. Maintenance note

This analysis is not a replacement for `AGENTS.md`, `WORK_MAP.md`, `TODO_INDEX.md`, or the machine-readable registers. If these files conflict, follow direct user/developer instructions first, then `AGENTS.md`, then the more specific register/runbook for the affected area.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und `project-register/cross-reference-maintenance.json`. Arbeite auf einem neuen task-spezifischen Branch, erstelle keine Parallelarchitektur, aktualisiere nur die bestehenden Register/TODO-/Architekturdateien, fuehre `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` sowie relevante Quality-Gate-Checks aus, und fasse im PR zusammen, welche Cross-Reference-Kategorien angewendet wurden. Runtime-Produktcode, geschuetzte Bereiche, Unity/PR #13 und Compliance-/Reward-/Payment-/Privacy-Logik nur mit explizitem Auftrag anfassen.
