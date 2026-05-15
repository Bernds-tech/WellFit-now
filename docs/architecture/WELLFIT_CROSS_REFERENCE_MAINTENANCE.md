# WellFit Cross-Reference Maintenance Agent

Status: active governance framework  
Updated: 2026-05-15  
Scope: documentation, registry, and validation-script maintenance only; no runtime product logic.

## Purpose

The Cross-Reference Maintenance Agent is a governance framework for future WellFit agents. It explains which canonical registers, TODO files, Work Map entries, readiness files, validation scripts, and docs must be inspected or updated whenever a route, API, product module, agent script, roadmap item, feedback/insight system, research policy, visual QA surface, Unity/AR planning item, compliance/privacy area, or governance file changes.

This framework does not create a second architecture. It extends the existing mapped system through:

- `project-register/cross-reference-maintenance.json`
- `scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs`
- `docs/architecture/WELLFIT_AGENT_SYSTEM_ANALYSIS.md`
- existing Work Map and TODO Index pointers

## Operating rule

For every future task:

1. Read the leading memory files: `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, and `todolist/NEXT_ACTIONS.md`.
2. Identify the matching `changeCategories[].id` in `project-register/cross-reference-maintenance.json`.
3. Inspect all `requiredInspectFiles` for that category.
4. Update only existing canonical `requiredUpdateTargets` when there is verified evidence.
5. Do not auto-update forbidden protected areas.
6. Request human review when the category or specific rule requires it.
7. Run the category validation requirements, the cross-reference maintenance check, and the full quality gate.
8. Report exactly which cross-references were inspected, updated, deferred, or blocked.

## Change category coverage

The machine-readable register currently covers at least these categories:

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
- `agent_task_queue_or_autopilot_changed`
- `risk_or_definition_of_done_changed`

## Required cross-reference behavior

| Change type | Minimum cross-reference expectation |
|---|---|
| Route changes | Inspect/update route, page, feature, readiness, visual regression, Work Map, TODO Index, current/next-action status, and progress memory when applicable. |
| API changes | Inspect/update API, feature, readiness, risk/DoD, Work Map, TODO Index, and progress memory; protected authority/security changes require human review. |
| Product module changes | Inspect/update features, readiness, internal sources, product rules, Work Map, TODO Index, current/next actions, and progress memory. |
| Agent script / quality-gate changes | Inspect/update agent workflows, task queue, Autopilot, cross-reference register, Work Map, TODO Index, current state, quality gate, and validation docs. |
| Roadmap changes | Inspect/update master roadmap tasks, TODO files, readiness links, current/next actions, and progress memory. |
| Feedback/analytics/insight/research changes | Inspect/update feedback, analytics loop, adaptive insight, research recommendation, feature/readiness, Work Map, and TODO Index pointers while preserving aggregate-only/sensitive-data boundaries. |
| Internal source / concept mapping changes | Inspect/update internal sources, readiness, feature links, Work Map, TODO Index, and drift/gap docs without implying unimplemented product behavior. |
| Visual regression changes | Inspect/update visual-regression register, visual QA docs, route/feature links, Work Map, and TODO Index; do not commit screenshots unless explicitly requested. |
| Documentation baseline changes | Inspect/update leading TODO/current-state/next-action files and agent governance registers only when useful; do not delete historical context. |
| Unity/AR or compliance/privacy changes | Planning-only by default; do not touch Unity files, PR #13, legal/privacy/compliance logic, reward authority, or sensitive-data logic without explicit human approval. |

## Forbidden auto-updates

The framework must never be used to auto-update:

- `native/unity/WellFitBuddyAR/**` or PR #13.
- Runtime product code in `app/**`, `components/**`, `lib/**`, `functions/**`, or `firestore.rules` for documentation/registry/script-only tasks.
- Token, NFT, wallet, payment, payout, marketplace, staking, presale, trading, betting, or reward-authority behavior.
- Health, watch, child-safety, location, camera, privacy, consent, legal, AGB, Datenschutz, Impressum, medical-adjacent, or compliance logic.
- Duplicate architecture, duplicate registers, duplicate route/API systems, duplicate feature modules, duplicate economy ledgers, duplicate mission systems, duplicate feedback systems, or duplicate Unity bridges.

## Human review required

Human review is required when:

- A category is `unity_or_ar_changed` or `compliance_or_privacy_changed`.
- An API change affects authority, security, reward, payment, wallet, privacy, or sensitive data.
- A product-readiness change advances a blocked, review-required, high-risk, or protected module.
- A risk classifier, definition-of-done, stop-condition, or quality-gate change weakens a safeguard.
- A cross-reference update would assert behavior that is not verified by existing source files or docs.

## Validation

Run:

```bash
node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs
jq empty project-register/cross-reference-maintenance.json
npm run agent:quality-gate
```

The checker validates that:

- The register parses.
- All required change categories exist.
- Every category includes `requiredInspectFiles`, `requiredUpdateTargets`, `forbiddenAutoUpdates`, and `humanReviewRules`.
- Referenced repository files exist.
- `todolist/WORK_MAP.md` and `todolist/TODO_INDEX.md` reference the register, this doc, and the checker.
- Major project-register JSON files are covered by at least one category.

## PR reporting expectations

Every PR that changes governance, registers, docs, routes, APIs, modules, or validation scripts should state:

- Which cross-reference category was used.
- Which required files were inspected.
- Which required update targets changed or were intentionally deferred.
- Which forbidden/protected areas were untouched.
- Which validation commands ran and their results.
- Any human-review follow-up required.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/cross-reference-maintenance.json` und `docs/architecture/WELLFIT_AGENT_SYSTEM_ANALYSIS.md`. Waehle die passende Change Category, pruefe requiredInspectFiles, aktualisiere nur bestehende requiredUpdateTargets, fuehre `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` und `npm run agent:quality-gate` aus und dokumentiere geschuetzte Bereiche als unangetastet.
