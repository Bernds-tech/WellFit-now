# WellFit Cross-Reference Maintenance Agent

Stand: 2026-05-15  
Machine-readable source: `project-register/cross-reference-maintenance.json`  
Validator: `scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs`

## Purpose

The Cross-Reference Maintenance Agent is not a new product architecture. It is a maintenance layer for the existing WellFit governance system. Its job is to ensure that future route, API, module, agent, roadmap, readiness, feedback, insight, visual-regression, Unity/AR, compliance, or documentation changes update the existing source-of-truth files instead of creating duplicate systems.

## Required rule after every agent task

Every future agent task must answer these questions before the PR summary is complete:

1. Which change categories in `project-register/cross-reference-maintenance.json` apply?
2. Which required files were inspected?
3. Which required update targets changed, and which were inspected but did not need changes?
4. Were protected runtime/product areas touched? If not, explicitly say they were untouched.
5. Which validation commands were run, skipped, or blocked?

## Source-of-truth hierarchy

Use the existing hierarchy:

1. Direct user/developer instructions.
2. `AGENTS.md` and scoped `AGENTS.md` files.
3. `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, and `todolist/NEXT_ACTIONS.md`.
4. Machine-readable registers in `project-register/`.
5. Architecture docs in `docs/architecture/`.
6. Validation scripts in `scripts/wellfit-dev-agent/src/`.

Do not introduce a second Work Map, second TODO index, second readiness matrix, second route/API registry, or second agent orchestrator.

## Change categories

The machine-readable registry currently defines these categories:

- `route_added_or_changed`
- `api_added_or_changed`
- `feature_or_product_module_changed`
- `agent_script_added_or_changed`
- `quality_gate_changed`
- `roadmap_task_added_or_changed`
- `product_readiness_changed`
- `feedback_or_analytics_changed`
- `adaptive_user_insight_changed`
- `research_recommendation_changed`
- `internal_source_map_changed`
- `visual_regression_changed`
- `documentation_baseline_changed`
- `unity_or_ar_changed`
- `compliance_or_privacy_changed`

Each category lists required files to inspect, required update targets, forbidden auto-updates, human-review rules, validation requirements, and examples.

## Category-to-register examples

### Routes

When a route is added or changed, inspect/update as relevant:

- `project-register/routes.json`
- `project-register/features.json`
- `project-register/product-readiness.json`
- `project-register/visual-regression.json`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `project-register/progress-log.json`

Run route/API register and drift checks, visual smoke in report-only mode when relevant, cross-reference maintenance check, and the quality gate.

### APIs

When an API changes, inspect/update as relevant:

- `project-register/apis.json`
- `project-register/features.json`
- `project-register/product-readiness.json`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `project-register/progress-log.json`

Run API register/drift validation, Firebase Functions syntax checks when backend code is involved, cross-reference maintenance check, and the quality gate.

### Agent scripts and Quality Gate

When an agent script or Quality Gate changes, inspect/update as relevant:

- `project-register/agent-workflows.json`
- `project-register/agent-task-queue.json`
- `project-register/agent-autopilot.json`
- `project-register/agent-work-log.json`
- `project-register/progress-log.json`
- `scripts/wellfit-dev-agent/src/quality-gate.mjs`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`

Do not weaken stop conditions or dry-run-only constraints without human review.

### Roadmap, readiness, research, feedback, and insights

For roadmap/readiness/research/feedback/insight changes, keep the existing registers synchronized:

- `project-register/master-roadmap-tasks.json`
- `project-register/product-readiness.json`
- `project-register/internal-sources.json`
- `project-register/research-recommendations.json`
- `project-register/user-feedback.json`
- `project-register/feedback-analytics-loop.json`
- `project-register/adaptive-user-insights.json`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`
- `todolist/NEXT_ACTIONS.md`

Feedback and adaptive insight work remains planning-only, aggregate-only, and agent-safe. No raw user identifiers or sensitive data may be exposed to agents.

### Unity/AR and compliance/privacy

Unity/AR and compliance/privacy are human-review-heavy categories. Documentation or planning updates may map the work, but agents must not:

- Touch `native/unity/WellFitBuddyAR/**` without explicit instruction.
- Merge, close, depend on, or shortcut through PR #13.
- Final-authorize rewards, mission completion, anti-cheat, payments, payouts, token/NFT/wallet logic, or betting from client/UI work.
- Modify legal/privacy/compliance wording or sensitive data behavior without explicit instruction and a review plan.

## Validator expectations

`cross-reference-maintenance-check.mjs` verifies that:

- `project-register/cross-reference-maintenance.json` parses.
- All required change categories exist.
- Each category has `requiredInspectFiles`, `requiredUpdateTargets`, `forbiddenAutoUpdates`, and `humanReviewRules`.
- Referenced files exist.
- `todolist/WORK_MAP.md` and `todolist/TODO_INDEX.md` reference the registry, this doc, and the validator.
- Major `project-register/*.json` files are covered by at least one category, with warnings if coverage is missing.

The check prints PASS, FAIL, and WARNING sections and exits non-zero on failures.

## PR reporting expectation

For future PRs, include a short cross-reference note:

```md
Cross-reference maintenance:
- Categories applied: route_added_or_changed, visual_regression_changed
- Inspected: routes.json, features.json, product-readiness.json, visual-regression.json, WORK_MAP.md, TODO_INDEX.md
- Updated: routes.json, visual-regression.json, WORK_MAP.md
- Inspected but unchanged: features.json, product-readiness.json, TODO_INDEX.md
- Protected/runtime areas: untouched
- Validation: cross-reference-maintenance-check and quality gate passed
```

## Maintenance boundary

This framework is documentation/registry/validation only. It does not authorize runtime product changes and does not replace existing governance. If a future task changes the framework itself, apply `agent_script_added_or_changed`, `quality_gate_changed`, and `documentation_baseline_changed` categories.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und `project-register/cross-reference-maintenance.json`. Arbeite auf einem neuen task-spezifischen Branch, erstelle keine Parallelarchitektur, aktualisiere nur die bestehenden Register/TODO-/Architekturdateien, fuehre `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` sowie relevante Quality-Gate-Checks aus, und fasse im PR zusammen, welche Cross-Reference-Kategorien angewendet wurden. Runtime-Produktcode, geschuetzte Bereiche, Unity/PR #13 und Compliance-/Reward-/Payment-/Privacy-Logik nur mit explizitem Auftrag anfassen.
