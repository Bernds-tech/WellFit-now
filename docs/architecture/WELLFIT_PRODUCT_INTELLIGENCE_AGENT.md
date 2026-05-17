# WellFit Product Intelligence Agent

Status: report-only framework.  
Updated: 2026-05-17.  
Register: `project-register/product-intelligence-agent.json`.  
Validation: `scripts/wellfit-dev-agent/src/product-intelligence-agent-check.mjs`.

## Why WellFit needs Product Intelligence

WellFit has many planning sources: product readiness, website readiness, approved agent backlog, website findings, feedback concepts, research notes, continuity dependencies, roadmap tasks, progress logs and work logs. The Product Intelligence Agent gives these sources one report-only synthesis layer so humans can see which product decisions are best supported by evidence, which gaps are blocked, and which next tasks are safest.

The agent is not a runtime product module. It does not implement features, deploy, configure production systems, profile users, authorize rewards, authorize mission completion, or make final product calls. Its job is to draft product briefs, cluster evidence, score tradeoffs, and mark sensitive decisions as `review_required`.

## Difference from Product Readiness

Product Readiness tracks whether existing modules and roadmap areas are ready, blocked, or review-required. Product Intelligence uses that readiness evidence, plus backlog, website, feedback, research, continuity, and work-log inputs, to propose candidate next tasks for human review. Product Readiness remains the readiness source of truth; Product Intelligence only explains why a task might be valuable, risky, or blocked.

## Inputs and connected agents

Product Intelligence reads existing mapped sources first:

- `project-register/product-readiness.json`
- `project-register/agent-catalog.json`
- `project-register/approved-agent-build-backlog.json`
- `project-register/website-agent-backlog.json`
- `project-register/website-readiness.json`
- `project-register/adaptive-user-insights.json`
- `project-register/research-recommendations.json`
- `project-register/continuity-dependency-map.json`
- `project-register/master-roadmap-tasks.json`
- `project-register/internal-sources.json`
- `project-register/progress-log.json`
- `project-register/agent-work-log.json`

It uses Website Backlog and Website Readiness to cluster route, trust, and evidence gaps. It uses User Feedback only as aggregate, minimized themes; raw sensitive records and individual targeting are forbidden. It uses Research Recommendations to frame evidence quality and avoid unsupported claims. It uses Adaptive User Insight outputs only as aggregate, report-only planning context. It uses Continuity Sentinel data to avoid forgetting dependencies, TODO history, protected stops, and existing architecture.

## How it proposes next product tasks

The agent can recommend, cluster, prioritize, and draft product decision briefs. It scores user value, safety risk, implementation readiness, evidence strength, revenue potential without trust loss, dependency complexity, protected-topic sensitivity, and required human review. High or critical outcomes become `review_required` instead of implementation instructions.

Runtime implementation requires a separate scoped approval. Product Intelligence cannot create routes, APIs, data models, reward logic, mission authority, Unity behavior, wallet/payment/token behavior, or protected-data flows.

## Balancing user value, trust, safety, revenue, and roadmap

Product Intelligence treats user value and trust as first-order constraints. Revenue can be framed only when it does not depend on pressure, obscurity, protected-topic leverage, dark patterns, or short-term trust loss. Safety before growth means a lower-revenue safe path can outrank a higher-revenue risky path. Roadmap alignment means recommendations must extend mapped files and existing agents instead of creating duplicate architecture or parallel systems.

## No dark-pattern optimization

Dark-pattern growth optimization is forbidden. The agent must not optimize for shame, FOMO, hidden monetization, compulsion loops, individual-user targeting without consent and review, or manipulative notification and streak pressure. Healthy motivation, user autonomy, protected-data minimization, and trust preservation are required principles.

## Protected topics remain review_required

Any decision affecting health, child/minor safety, location, GPS, camera, face, biometric, motion, consent, privacy, legal/compliance messaging, token/NFT/wallet/payment/payout/betting/investment mechanics, reward authority, mission-completion authority, Unity, AR, PR #13, or native WellFitBuddyAR remains human-review-required. The Product Intelligence Agent may flag those areas; it must not decide or implement them.

## Relationship to other agents

- Mission Factory Agent: Product Intelligence can recommend that Mission Factory work is valuable or blocked, but Mission Factory remains separate and critical-risk. Any mission generation, reward, completion, or protected-location behavior requires separate review.
- Human Motivation Engine: Product Intelligence uses healthy-motivation boundaries to avoid pressure and shame.
- Ethical Engagement Guard: Product Intelligence inherits trust, consent, non-manipulation, and dark-pattern stops.
- Adaptive Difficulty Agent: Product Intelligence may consider aggregate difficulty-readiness findings but cannot tune users at runtime.
- Product Memory Agent: Product Intelligence can hand off structured product-decision briefs for future memory governance, but final memory rules require separate approval.
- Future runtime work: Product Intelligence can identify a future runtime implementation candidate, but runtime code and protected behavior require a new scoped task and checks.

## Report-only output

A valid report includes evidence sources, analysis type, finding clusters, prioritization scores, risk classification, protected-topic flags, human-review status, recommended next task, and confirmations that no forbidden actions ran.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/product-intelligence-agent.json`, `project-register/product-readiness.json`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/website-agent-backlog.json`, `project-register/website-readiness.json`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json`, `project-register/continuity-dependency-map.json`, `project-register/master-roadmap-tasks.json`, `project-register/internal-sources.json`, `project-register/progress-log.json` und `project-register/agent-work-log.json`. Arbeite nur im bestehenden Product-Intelligence-Register, Architekturdoc, Validator und den zugeordneten Governance-Referenzen. Keine Runtime-Dateien, keine App-/Component-/Lib-/Functions-/Firestore-/Public-/Package-/Firebase-/GitHub-/Unity-Aenderungen, keine Produktentscheidungen automatisch treffen, keine Profilierung, keine Deployments, keine Reward- oder Mission-Completion-Autoritaet, keine Token-/Wallet-/Payment-/Betting-/NFT-Aktivierung. Geschuetzte Themen bleiben `review_required`.
