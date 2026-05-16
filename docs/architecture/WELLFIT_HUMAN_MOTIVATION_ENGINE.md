# WellFit Human Motivation Engine

Status: report-only / planning-only framework  
Register: `project-register/human-motivation-engine.json`  
Validator: `scripts/wellfit-dev-agent/src/human-motivation-engine-check.mjs`  
Updated: 2026-05-16

## Purpose

The Human Motivation Engine defines how WellFit can encourage healthy, durable engagement before any runtime personalization, mission authority, reward authority, health-data logic, child flows, tokenization, wallet, payment, or monetization behavior is implemented. It is a documentation/register/validation-only framework.

This first version does **not** change product logic. It does **not** personalize users at runtime. It does **not** modify missions, rewards, Buddy behavior, app routes, Firebase Functions, Firestore rules, public assets, Unity, payment, wallet, token, NFT, betting, health, child, location, camera, biometric, consent, privacy, legal, or compliance behavior.

## Why WellFit uses healthy motivation instead of addictive design

WellFit should help people return because movement, learning, family connection, progress, and the Buddy feel useful and respectful. That is healthy retention.

WellFit must not use engagement pressure that reduces user agency or exploits vulnerability. The register explicitly forbids addictive design, manipulative FOMO, shame or guilt pressure, sleep-deprivation pressure, child-targeted monetization, gambling-like rewards, lootbox or money-near mechanics, hidden sponsor pressure, dark-pattern notifications, social humiliation, paywalled mission chains, and medical or weight-loss overclaims.

The distinction is simple:

- Healthy motivation gives users choice, clear value, fair recovery, visible progress, social support, and permission to rest.
- Addictive design pressures users through fear, scarcity, shame, social threat, paid uncertainty, endless escalation, or impaired choice.

## Core motivation principles

The engine is built around ten required principles:

1. **Autonomy**: users control goals, pace, reminders, social visibility, pause/recovery choices, and future personalization scope.
2. **Competence**: users should feel capable through achievable steps, educational feedback, skill-building, and clear next actions.
3. **Relatedness**: social and family loops should create belonging and encouragement without humiliation or coercive comparison.
4. **Identity**: WellFit may reinforce positive chosen identities such as learner, explorer, helper, teammate, or family supporter, never shame labels.
5. **Progress**: progress should be visible, explainable, recoverable, and connected to effort, learning, cooperation, and recovery.
6. **Recovery**: rest, lower-energy days, pauses, illness, travel, and recovery are valid outcomes, not failures.
7. **Safe social connection**: sharing and encouragement must be opt-in, supportive, privacy-aware, and age-appropriate.
8. **Playful learning**: movement, quizzes, story, visuals, sound, and avatar growth may make learning engaging without compulsion.
9. **Meaningful rewards**: rewards should recognize effort and learning without gambling-like uncertainty or money-near prize pressure.
10. **Consent and control**: sensitive signals, reminders, social exposure, and any future personalization remain user-controlled and review-required.

## Identity, progress, recovery, and family/social connection

Long-term engagement should come from a stable sense of growth rather than pressure. The framework therefore supports:

- chosen role identities, such as learner, explorer, helper, teammate, or family role model;
- progress summaries that include effort, skill, consistency, cooperation, and recovery;
- streak recovery and grace mechanics that avoid punishment for real life;
- family and social encouragement that is opt-in, cooperative, and non-humiliating;
- low-energy alternatives and clear stopping points.

Family and social features must not become pressure chains. Public shaming, punitive leaderboards, child-targeted monetization, sponsor pressure, or sharing protected data without explicit review are forbidden.

## AI Buddy motivation boundaries

The AI Buddy may motivate by being kind, calm, opt-in, explainable, and safe to ignore. It may:

- encourage effort, learning, cooperation, and recovery;
- suggest lighter alternatives or rest when the user indicates low energy;
- offer playful learning cues, stories, and avatar encouragement;
- ask for consent before reminders, sharing, or sensitive-context suggestions.

The Buddy must not:

- shame, guilt, pressure, or manipulate users;
- make medical, weight-loss, diagnosis, or treatment claims;
- nudge child-directed monetization or hidden sponsor pressure;
- use protected data for runtime personalization in this version;
- authorize mission completion, rewards, anti-cheat, purchases, token/NFT/wallet behavior, or ledger writes.

## Adaptive difficulty without unsafe profiling

Adaptive difficulty is allowed only as a future suggestion framework. The first version does not tune runtime missions.

Safe planning inputs include self-reported difficulty fit, aggregate completion friction, explicit easier/balanced/harder choices, user-selected available time, user-selected learning format, and opt-in family/team preference without child profiling.

Unsafe or review-required inputs include raw health data, watch data, biometrics, face/camera data, precise location, child data, payment data, wallet/token data, raw private messages, medical inference, weight-loss inference, stress diagnosis, protected-class profiling, or vulnerability scoring.

Future suggestions should:

- offer a difficulty band rather than silently changing authority;
- give easier and recovery options with equal dignity;
- explain why a suggestion exists;
- use aggregate/planning signals first;
- require human review before sensitive personalization.

## Data minimization and protected topics

Protected topics remain `review_required`. This includes child, family-mode child behavior, health, watch data, location, camera, face, biometric, consent, privacy, medical or weight-loss claims, token, NFT, wallet, payment, betting, marketplace, reward authority, mission completion authority, anti-cheat, ledger, sponsor/monetization pressure, runtime personalization, and protected data use.

The Human Motivation Engine does not collect, store, process, or infer protected user data. It only defines planning categories and validation checks.

## Reward and monetization trust boundaries

Rewards may be discussed only as meaningful internal planning concepts. They should recognize effort, learning, consistency, cooperation, recovery, and completion. Final reward, XP, point, mission-completion, anti-cheat, inventory, rare-item, and ledger authority remains server-side/review-required and unchanged.

Forbidden reward and monetization patterns include gambling-like rewards, paid randomness, lootbox-style mechanics, wager-like escalation, money-near prizes, child-targeted monetization, hidden sponsor pressure, paywalled mission chains, and token/NFT/wallet/payment/trading/payout/staking/presale activation.

## Connections to existing WellFit governance

This framework extends mapped governance rather than creating parallel systems:

- **Adaptive User Insight**: provides aggregate/planning-only insight boundaries; the Human Motivation Engine consumes only safe motivation dimensions and keeps protected data minimized/review-required.
- **Research & Recommendation**: supports internal-first recommendation discipline, risk classification, and human-review escalation for protected topics.
- **Website Agents**: can use the framework later for report-only UX audits around healthy motivation copy, but not runtime personalization.
- **Product Readiness**: records that motivation governance is a planning readiness layer and does not advance runtime readiness by itself.
- **Mission Factory**: future mission generation should use these healthy motivation rules before creating mission loops, but no Mission Factory runtime logic is enabled here.
- **Ethical Engagement Guard**: should be the next recommended task and should convert these forbidden engagement patterns into a focused report-only guard.
- **Future Product Intelligence**: may later use aggregate, consented, explainable signals, but must inherit the protected/review-required boundaries and avoid unsafe profiling.

## Validator and quality gate

The validator runs in report-only mode and writes `scripts/wellfit-dev-agent/output/human-motivation-engine-report.md`. It checks required fields, principles, healthy retention rules, forbidden engagement patterns, motivation dimensions, protected-topic human review, and Work Map/TODO Index references.

The quality gate invokes the validator as report-only. A passing validator only means the framework is documented and mapped; it does not authorize product behavior.

## Next recommended task

Create the **Ethical Engagement Guard** as a report-only framework that operationalizes the forbidden engagement patterns, dark-pattern notification boundaries, FOMO/shame/gambling/child-monetization checks, and protected-review escalation before any runtime engagement logic is implemented.

## KI-Fortsetzungs-Prompt

Naechste KI: Lies `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/human-motivation-engine.json`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json`, `project-register/product-readiness.json`, `project-register/risk-classifier.json` und `scripts/wellfit-dev-agent/src/human-motivation-engine-check.mjs`. Fuehre die naechste Aufgabe als **Ethical Engagement Guard** nur report-only aus: keine Runtime-Dateien, keine Runtime-Personalisierung, keine geschuetzten Daten, keine Mission-/Reward-Autoritaet, keine Token-/NFT-/Wallet-/Payment-/Betting-/Unity-Aenderung, keine Auto-Merge-/Auto-Repair-/Approval-/Deployment-Autoritaet. Halte child, health, location, camera, biometric, consent, privacy, monetization, reward authority und mission completion authority review_required.
