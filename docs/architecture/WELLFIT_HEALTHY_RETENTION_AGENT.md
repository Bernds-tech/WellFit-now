# WellFit Healthy Retention Agent

Status: `report_only`
Updated: 2026-05-17

## Purpose

The Healthy Retention Agent is a report-only governance framework for reviewing WellFit retention ideas before any runtime work is considered. It focuses on sustainable motivation, user agency, pause/recovery options, consent-aware engagement, and dark-pattern avoidance while extending the existing WellFit motivation, ethical engagement, adaptive insight, product-readiness, and continuity registers.

This framework does not implement retention features, trigger notifications, personalize users, change streaks, grant rewards, authorize missions, deploy, approve PRs, merge PRs, repair files, or touch runtime product code.

## Source of truth

- Register: `project-register/healthy-retention-agent.json`
- Validator: `scripts/wellfit-dev-agent/src/healthy-retention-agent-check.mjs`
- Quality gate: `scripts/wellfit-dev-agent/src/quality-gate.mjs`
- Related sources: `project-register/adaptive-user-insights.json`, `project-register/product-readiness.json`, `project-register/risk-classifier.json`, `project-register/human-motivation-engine.json`, `project-register/ethical-engagement-guard.json`, `project-register/continuity-dependency-map.json`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, and `todolist/CURRENT_PROJECT_STATE.md`.

## Allowed report-only outputs

- Retention idea wellbeing review.
- Healthy engagement risk report.
- Pause and recovery checklist.
- Retention experiment planning brief.
- User-agency and opt-out checklist.
- Dark-pattern boundary report.
- Aggregate feedback theme summary.
- Human-review question list.
- Non-runtime acceptance criteria draft.
- Existing source-of-truth mapping.

## Forbidden outputs and boundaries

The Healthy Retention Agent must not produce or perform:

- Runtime retention implementation.
- Individual-user targeting, profiling, or runtime personalization.
- Push notification, streak, urgency, scarcity, loss-aversion, or reactivation automation.
- Mission completion, reward, XP, anti-cheat, payout, or financial-equivalent authorization.
- Health, child/minor, location, camera, biometric, face, consent, privacy, legal, token, wallet, payment, betting, NFT, Unity, AR, native, or PR #13 implementation.
- Deployment, configuration changes, PR approval, PR merge, or file repair authority.

Protected or ambiguous retention topics are `review_required` until a separate scoped approval exists.

## Review checklist

A Healthy Retention report must identify:

1. The existing source-of-truth files being extended.
2. The user value and wellbeing rationale.
3. User agency, pause, recovery, and opt-out considerations.
4. Dark-pattern and overuse risk.
5. Protected-topic flags.
6. Confirmation that individual-user profiling and runtime personalization stay forbidden.
7. Confirmation that reward and mission authority remain server-side or `review_required`.
8. Human-review questions and the next safe documentation/register task.

## Quality gate signal

The validator writes `scripts/wellfit-dev-agent/output/healthy-retention-agent-report.md` and emits `HEALTHY_RETENTION_AGENT_READY=true` only when the register, documentation, TODO mapping, non-authorizing signals, and quality-gate path are synchronized.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/healthy-retention-agent.json`, `project-register/adaptive-user-insights.json`, `project-register/product-readiness.json`, `project-register/risk-classifier.json`, `project-register/human-motivation-engine.json`, `project-register/ethical-engagement-guard.json`, `project-register/adaptive-difficulty-agent.json`, `project-register/product-intelligence-agent.json`, `project-register/continuity-dependency-map.json`, `project-register/agent-catalog.json` und `project-register/approved-agent-build-backlog.json`. Arbeite nur im bestehenden Healthy-Retention-Register, Architekturdoc, Validator und den zugeordneten Governance-Referenzen. Keine Runtime-Dateien, keine App-/Component-/Lib-/Functions-/Firestore-/Public-/Package-/Firebase-/GitHub-/Unity-Aenderungen, keine Runtime-Retention, keine Nutzerprofilierung, keine Notification-Automation, keine Streak-/Reward-Aenderungen, keine Mission-Completion- oder Reward-Autoritaet, keine Token-/Wallet-/Payment-/Betting-/NFT-Aktivierung, keine Location-/Camera-/Health-/Child-/Privacy-/Legal-Logik. Geschuetzte Themen bleiben `review_required`.
