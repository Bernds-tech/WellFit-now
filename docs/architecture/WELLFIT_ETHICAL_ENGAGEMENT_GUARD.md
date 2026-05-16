# WellFit Ethical Engagement Guard

Status: report-only / planning-only framework  
Register: `project-register/ethical-engagement-guard.json`  
Validator: `scripts/wellfit-dev-agent/src/ethical-engagement-guard-check.mjs`  
Updated: 2026-05-16

## Purpose

The Ethical Engagement Guard defines how WellFit checks missions, rewards, AI Buddy messaging, retention mechanics, website claims, learning loops, social features, sponsor ideas, and monetization proposals against ethical engagement rules before any runtime implementation. It is a documentation/register/validation-only framework.

This first version does **not** change product behavior. It does **not** modify app routes, components, libraries, Firebase Functions, Firestore rules, public assets, Unity files, package configuration, legal copy, privacy logic, token/wallet/payment logic, mission-completion authority, reward authority, anti-cheat, or protected-data flows. It does **not** personalize users, track users, approve PRs, merge PRs, repair files, or deploy.

## Why WellFit needs an Ethical Engagement Guard

WellFit combines movement, learning, social play, an AI Buddy, missions, rewards, future partner ideas, and future economy concepts. Those areas can motivate users in healthy ways, but they can also become risky if they create pressure, shame, gambling-like reward loops, hidden advertising, purchase pressure, or protected-data-sensitive personalization.

The guard is the review layer that asks: is this engagement mechanic respectful, age-appropriate / altersgerecht, transparent, recoverable, consent-preserving, privacy-minimizing, and safe? If not, the concept must be blocked or marked `review_required` before implementation.

## Relationship to the Human Motivation Engine

The Human Motivation Engine defines healthy motivation principles: autonomy, competence, relatedness, identity, progress, recovery, safe social connection, playful learning, meaningful rewards, and consent/control.

The Ethical Engagement Guard complements it by converting those principles into a stricter validation frame for product ideas and public claims. The Motivation Engine explains what healthy motivation can support; the Ethical Engagement Guard identifies what must be allowed, reviewed, or forbidden across missions, rewards, Buddy tone, retention loops, social features, sponsor concepts, website claims, and monetization proposals.

Both frameworks remain report-only. Neither enables runtime personalization, protected-data processing, mission authority, reward authority, monetization, token/wallet/payment behavior, or product logic.

## Healthy retention versus manipulative engagement

Healthy retention means users return because WellFit helps them move, learn, recover, connect, and see meaningful progress. It should be easy to pause, safe to ignore, transparent, and supportive.

Manipulative engagement pressures users through fear, scarcity, shame, social threat, paid uncertainty, hidden sponsorship, sleep loss, endless escalation, or reduced choice. The guard therefore forbids manipulative FOMO, shame or guilt pressure, sleep-deprivation pressure, social humiliation, gambling-like rewards, lootbox money-near mechanics, age-inappropriate monetization, child-targeted purchase pressure, hidden sponsor pressure, dark-pattern notifications, paywall mission chains, endless pressure loops, punishment for rest, medical or weight-loss overclaims, token/payout hype, and betting or wager-like language.

## Age-appropriate / altersgerecht design

Age-appropriate design is required because WellFit may include family concepts, social challenges, learning loops, Buddy messaging, movement prompts, sponsor ideas, and future reward systems. Minors and family/guardian contexts require stricter review.

The guard requires age-appropriate / altersgerecht language, difficulty, mission length, Buddy tone, social visibility, sponsor content, and reward framing. It forbids shame, guilt, fear, pressure, monetization pressure, token/payout/gambling-like mechanics, and money-near rewards for minors. Permission denial must not create punishment where safe fallback is possible. All age-sensitive behavior stays planning-only until human, legal, privacy, safety, and product review approves a concrete implementation.

## How checks apply across WellFit areas

### Missions

Mission ideas must include safe alternatives where possible. Missing or expensive items must not create purchase pressure. Unsafe time, unsafe location, risky outdoor activity, AR/camera/location flows, minor/family context, privacy context, and permission-sensitive behavior remain `review_required`. Protected data cannot be direct reward authority or mission-completion authority.

### Rewards

Rewards remain internal points/XP/planning-only unless separately approved. The guard does not authorize client-side rewards, ledger writes, inventory unlocks, rare-item grants, mission completion, or anti-cheat outcomes. Token, payout, betting, wallet, payment, NFT, marketplace, staking, presale, trading, and money-near mechanics remain `review_required`. Variable rewards must not become gambling-like, lootbox-like, near-miss-driven, or paid-randomness-driven.

### AI Buddy tone

The AI Buddy may encourage without pressure, explain without manipulation, celebrate effort over perfection, use age-appropriate / altersgerecht language, and normalize recovery. It must avoid shame, guilt, fear, comparison pressure, hidden sponsor pressure, medical advice, psychological advice, financial advice, investment/payout/token advice, and authority decisions. Protected or sensitive cases remain `review_required` planning.

### Website claims

Website, public, investor, legal, health, child/minor, token, payment, wallet, NFT, betting, sponsor, privacy, AI, and reward claims remain review-required without human review. The guard blocks medical cure claims, guaranteed weight-loss claims, investment or profit claims, token price claims, guaranteed rewards, hidden sponsor claims, and exaggerated AI/health/privacy/safety claims.

### Sponsor and partner ideas

Sponsor participation must be transparent and age-appropriate / altersgerecht. Sponsored missions must not hide advertising, pressure minors, require purchases, require protected data disclosure, override safety, or override fairness. Partner health, wellness, educational, AI, privacy, environmental, performance, and reward claims require human review.

### Social features and learning loops

Social features should support opt-in encouragement, cooperative learning, and safe connection. They must avoid humiliation, public failure labels, coercive comparison, harassment, hidden advertising, protected-data exposure, and pressure to overtrain. Learning loops should connect movement, reflection, quizzes, stories, and progress in ways that remain pause-friendly and non-punitive.

### Monetization concepts

Monetization ideas must be transparent, optional, age-appropriate / altersgerecht, and non-essential for healthy mission completion. The guard blocks purchase pressure, paywall mission chains, scarcity timers, dark-pattern subscription flows, child-targeted purchase pressure, and purchase-to-avoid-shame mechanics. Fair detours and non-purchase alternatives must be planned before paid features could affect missions, learning, social participation, or rewards.

## Recovery and pause protections

Recovery protects users from pressure loops. Rest can be progress. Missed days should not create shame. Streak recovery should be fair, explainable, non-punitive, and accessible. Users may pause, mute, reschedule, or decline reminders without punishment. Fatigue, stress, unsafe context, illness, weather, privacy concern, or low energy must not trigger harder pressure.

WellFit must not encourage sleep loss, overtraining, unsafe activity, unsafe routes, trespassing, distracted movement, or ignoring pain, illness, fatigue, weather, privacy, or safety concerns.

## Protected data and review-required boundaries

Health, child/minor, family/guardian, location, camera, face, biometric, motion, consent, and privacy data remain protected. Raw images, videos, biometrics, health data, location traces, face data, and protected signals must not be stored by default. Protected data may not be direct mission-completion authority, reward authority, anti-cheat authority, monetization trigger, sponsor trigger, or social ranking authority.

Any future use of protected data requires minimization, explicit consent where applicable, safe fallback, retention boundaries, purpose limitation, user control, and human/legal/privacy review. Runtime tracking, profiling, personalization, protected-data collection, protected-data storage, and protected-data inference are not enabled by this framework.

## Connections to existing WellFit governance

- **Product Readiness**: the guard provides ethical-engagement readiness boundaries for modules before product implementation.
- **Adaptive User Insight**: any future insight loop must remain aggregate, planning-only, privacy-minimized, and review_required for protected contexts.
- **Website Agents**: website audits can use the guard to flag unsafe public claims, hidden sponsor claims, monetization pressure, or exaggerated AI/health/privacy/reward language.
- **Mission Factory**: mission concepts can be checked for safe alternatives, no purchase pressure, no unsafe routes, and no protected-data authority before runtime work.
- **Reward Fairness Guard / economy guardrails**: reward concepts can be checked for fairness, anti-farming, no client authority, no gambling-like rewards, and no token/payout hype.
- **Human Motivation Engine**: healthy motivation principles provide the positive design baseline; the Ethical Engagement Guard blocks manipulative engagement patterns.
- **Future Product Intelligence**: future intelligence systems must consume only reviewed, minimized, non-sensitive, report-only findings until explicit human approval defines runtime boundaries.

## Why this framework does not enable runtime product behavior

The guard exists to document and validate boundaries only. The validator parses a JSON register, checks required principles and forbidden patterns, verifies Work Map and TODO Index references, and writes a report-only markdown file. It does not import product code, call product APIs, write runtime files, personalize users, collect data, approve PRs, merge, repair, deploy, or authorize rewards/missions/monetization.

Any future implementation must be a separate, human-approved, narrowly scoped task with legal/privacy/safety/product review for protected topics.

## KI-Fortsetzungs-Prompt

Wenn kuenftige Agenten den Ethical Engagement Guard fortsetzen, zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/ethical-engagement-guard.json`, `docs/architecture/WELLFIT_ETHICAL_ENGAGEMENT_GUARD.md`, `project-register/human-motivation-engine.json`, `docs/architecture/WELLFIT_HUMAN_MOTIVATION_ENGINE.md`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/product-readiness.json`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json`, `project-register/website-agents.json`, `project-register/website-agent-backlog.json`, `project-register/risk-classifier.json` und `scripts/wellfit-dev-agent/src/ethical-engagement-guard-check.mjs` lesen. Nur die bestehende Register-/Dokumentations-/Validator-Architektur erweitern; keine parallele Ethical-Engagement-Architektur, keine Runtime-Engagement-Logik, keine Personalisierung, kein Tracking/Profiling, keine Reward-/Mission-Authority, keine Monetarisierung und keine protected health/child/minor/location/camera/face/biometric/motion/consent/privacy/token/wallet/payment/NFT/betting/legal/compliance-Aenderung ohne separaten human-reviewed Auftrag aktivieren.
