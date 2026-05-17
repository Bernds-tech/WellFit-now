# WellFit Mission Factory Agent

Status: `report_only`  
Updated: 2026-05-17  
Register: `project-register/mission-factory-agent.json`  
Validator: `scripts/wellfit-dev-agent/src/mission-factory-agent-check.mjs`

## Purpose

The Mission Factory Agent is a report-only planning framework for mission concept inventory, mission planning briefs, dependency maps, readiness checklists, and human-review question lists. It does not create runtime missions, change mission routes, authorize completion, grant rewards or XP, perform anti-cheat decisions, activate location/camera/health/child/privacy/legal/token/wallet/payment/Unity behavior, or deploy anything.

This first version exists so future mission work can be assessed against the existing WellFit mission, economy, buddy, product-readiness, continuity, and TODO mappings before implementation. It must extend mapped files and current architecture rather than creating duplicate mission engines or parallel systems.

## Allowed report-only work

- Inventory mission concepts from existing mapped sources.
- Draft mission planning briefs for human review.
- Map mission dependencies to existing product-readiness, features, continuity, and TODO sources.
- Produce mission readiness checklists and safety boundary reports.
- Draft non-runtime acceptance criteria.
- List protected-topic flags and human-review questions.
- Recommend the next safe documentation/register/validator task.

## Forbidden work

The Mission Factory Agent must not:

- generate runtime missions or mutate mission product code;
- authorize mission completion, rewards, XP, inventory unlocks, rare-item grants, anti-cheat decisions, PvP outcomes, payouts, or financial-equivalent outcomes;
- activate client-side final authority for completion or reward mechanics;
- use location, GPS, camera, biometric, face, health, child/minor, consent, privacy, legal, token, NFT, wallet, payment, betting, staking, marketplace, presale, Unity, AR, native WellFitBuddyAR, or PR #13 behavior;
- make deployments, configuration changes, PR approvals, merges, or repairs.

## Source-of-truth order

Mission Factory must read the existing source map before proposing anything:

1. `AGENTS.md`
2. `todolist/CURRENT_PROJECT_STATE.md`
3. `todolist/WORK_MAP.md`
4. `todolist/TODO_INDEX.md`
5. `project-register/product-readiness.json`
6. `project-register/features.json`
7. `project-register/risk-classifier.json`
8. `project-register/continuity-dependency-map.json`
9. existing agent registers for Product Intelligence, Human Motivation, Ethical Engagement, Adaptive Difficulty, and Multisensory Learning

If ownership, source authority, safety boundaries, or runtime implications are unclear, the output is `review_required`, not implementation.

## Mission authority boundaries

The Mission Factory Agent may describe preview-only concepts. Final mission completion, reward or XP grants, anti-cheat outcomes, inventory unlocks, rare item grants, challenge payouts, and other financial-equivalent effects require server authority or a separate explicitly approved implementation plan. Client-side final authority is not allowed.

## Protected topics remain review_required

Any mission concept involving health or medical-adjacent claims, child/minor safety, location/GPS/geofencing/routes, camera/face/biometric/sensor evidence, consent, privacy, legal/compliance wording, token/NFT/wallet/payment/payout/betting/investment mechanics, reward authority, mission completion authority, anti-cheat, PvP stakes, Unity, AR, native WellFitBuddyAR, or PR #13 is marked `review_required` or `blocked` until separately approved.

## Report schema

A valid report-only output includes:

- mission concept ID;
- existing source files used;
- mission type label;
- user value hypothesis;
- protected-topic flags;
- authority boundary (`server_authority` or `review_required`);
- readiness status (`draft`, `review_required`, or `blocked`);
- dependencies;
- human-review questions;
- next safe task.

## Relationship to existing agents

- Product Intelligence Agent can prioritize mission opportunities, but Mission Factory owns mission-specific planning boundaries.
- Human Motivation Engine supplies healthy motivation, autonomy, and anti-pressure constraints.
- Ethical Engagement Guard supplies non-manipulation, consent, and trust boundaries.
- Adaptive Difficulty Agent can inform aggregate difficulty-readiness planning, but no runtime tuning is enabled.
- Multisensory Learning Engine can inform learning-channel planning, but no AR, Unity, sensor, or protected-data behavior is enabled.
- Continuity Dependency Sentinel prevents forgotten source-of-truth and dependency links.

## Quality gate

The validator confirms the register, this architecture note, Work Map, TODO Index, and non-authorizing safety signals are present. The Quality Gate runs the validator and requires `MISSION_FACTORY_AGENT_READY=true` before this report-only framework is considered synchronized.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/mission-factory-agent.json`, `project-register/product-readiness.json`, `project-register/features.json`, `project-register/risk-classifier.json`, `project-register/continuity-dependency-map.json`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/product-intelligence-agent.json`, `project-register/human-motivation-engine.json`, `project-register/ethical-engagement-guard.json`, `project-register/adaptive-difficulty-agent.json`, `project-register/multisensory-learning-engine.json`, `project-register/research-recommendations.json` und `project-register/adaptive-user-insights.json`. Arbeite nur im bestehenden Mission-Factory-Register, Architekturdoc, Validator und den zugeordneten Governance-Referenzen. Keine Runtime-Dateien, keine App-/Component-/Lib-/Functions-/Firestore-/Public-/Package-/Firebase-/GitHub-/Unity-Aenderungen, keine Mission-Runtime, keine Mission-Completion- oder Reward-Autoritaet, keine Anti-Cheat-Entscheidungen, keine Token-/Wallet-/Payment-/Betting-/NFT-Aktivierung, keine Location-/Camera-/Health-/Child-/Privacy-/Legal-Logik. Geschuetzte Themen bleiben `review_required`.
