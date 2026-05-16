# WellFit Adaptive Difficulty Agent

**Status:** report-only / planning-only  
**Updated:** 2026-05-16  
**Register:** `project-register/adaptive-difficulty-agent.json`  
**Validator:** `scripts/wellfit-dev-agent/src/adaptive-difficulty-agent-check.mjs`

## Purpose

The Adaptive Difficulty Agent defines how WellFit can later **suggest** safe mission difficulty, mission duration, Buddy tone, learning format, activity intensity, recovery mode, and social/solo mode without enabling runtime personalization or protected-data profiling now.

This first version is documentation, registry, and validation only. It does not change missions, Buddy copy, recommendations, rewards, completion decisions, notifications, UI, APIs, Firebase Functions, Firestore rules, Unity, or any runtime product logic.

## Why adaptive difficulty is needed

WellFit combines movement, learning, Buddy support, social challenge mechanics, and future AR experiences. A fixed mission difficulty can be too easy for some users, too intense for others, or unsafe in sensitive contexts. A planning-safe adaptive framework helps future teams reason about:

- whether a mission is too hard, too easy, too long, confusing, or socially uncomfortable;
- when a shorter or recovery-first mission is safer than escalation;
- when Buddy tone should become gentler, more explanatory, playful, or recovery-focused;
- when a visual, audio, movement, quiz, story, or mixed learning format might be more accessible;
- when solo, family, team, or competition modes require consent, fairness, age-appropriate design, or review;
- when protected contexts must stop the idea and require human/legal/privacy/safety review.

The agent exists to prevent a future implementation from turning adaptive difficulty into manipulative engagement, unsafe health inference, child/minor profiling, reward manipulation, or mission-completion authority.

## Relationship to Human Motivation Engine and Ethical Engagement Guard

The Adaptive Difficulty Agent complements the previous frameworks instead of duplicating them:

- **Human Motivation Engine:** supplies healthy motivation principles such as autonomy, competence, recovery, family/social connection, playful learning, meaningful rewards, and consent/control. Adaptive difficulty uses those principles to keep challenge balanced and user-controlled.
- **Ethical Engagement Guard:** blocks FOMO, shame, gambling-like loops, sleep pressure, age-inappropriate monetization, dark patterns, public humiliation, and manipulative retention. Adaptive difficulty inherits those boundaries when deciding whether a difficulty suggestion is allowed, blocked, or review_required.
- **Adaptive User Insight:** remains the source for aggregate-safe, planning-only insight categories and sample-threshold thinking. Adaptive difficulty may consume only planning-safe categories, not raw identifiers or protected data.

Any future product implementation must pass through these existing frameworks rather than creating a parallel personalization or engagement architecture.

## Adaptive difficulty is not runtime personalization

Adaptive difficulty in this framework means **report-only suggestion design**. It can describe possible categories such as `shorter`, `recovery`, `gentle Buddy tone`, `mixed learning format`, `solo`, or `competition_review_required`, but it cannot apply those choices to a user at runtime.

Runtime personalization would mean live or automated changes to a user's mission, Buddy tone, activity intensity, social mode, reward state, or completion decision. That is explicitly not enabled. Future runtime work would need a separate scoped proposal, human review, consent/privacy boundaries, protected-topic review, tests, and server-authority decisions where applicable.

## Planning-safe, aggregate-safe, consent-aware signals

Allowed signals are intentionally narrow:

- aggregate completion rate;
- aggregate drop-off pattern;
- explicit user preference;
- explicit difficulty feedback;
- mission rating;
- optional family mode flag;
- non-sensitive route/device test evidence;
- documented age band only when consent and review allow it;
- planning-safe Buddy feedback category;
- review-required protected-context flags.

Forbidden signals include raw health data, raw GPS/location history, raw camera/video/image data, face/biometric data, child/minor sensitive data without guardian/privacy review, exact daily routine, names/emails/user IDs/device IDs, payment/token/wallet data, medical diagnosis, weight-loss claims, gambling/betting behavior, and protected data used as direct reward or mission-completion authority.

Protected-context flags may only lower risk, block the suggestion, or mark `review_required`. They must not increase pressure, personalize at runtime, authorize rewards, or complete missions.

## Age-appropriate / altersgerecht boundaries

Age-sensitive and family contexts are stricter than default contexts. For minors:

- difficulty, mission length, language, social exposure, learning load, and Buddy tone must be age-appropriate/altersgerecht;
- family/guardian context remains review_required;
- no pressure, shame, fear, gambling-like framing, token/wallet/payment, or money-near difficulty escalation is allowed;
- long outdoor, AR, location-sensitive, or competition experiences require guardian/privacy/safety review before any runtime use;
- denying permissions, choosing pause, muting reminders, or refusing sharing must never increase difficulty or create punishment.

All age-sensitive runtime behavior remains planning-only until separate human/legal/privacy review approves a future implementation.

## Safe suggestion dimensions

The register defines these report-only dimensions:

- `physicalIntensity`: low, moderate, high, review_required;
- `missionDuration`: short, medium, long, review_required;
- `cognitiveLoad`: simple, balanced, complex, review_required;
- `socialMode`: solo, family, team, competition, review_required;
- `buddyTone`: gentle, playful, coach, explanatory, recovery, review_required;
- `learningFormat`: visual, audio, movement, quiz, story, mixed, review_required;
- `locationSensitivity`: indoor, safe_outdoor, supervised_outdoor, review_required;
- `evidenceConfidence`: low, medium, high, review_required.

Low confidence defaults to no action, safer suggestions, or review_required rather than escalation.

## Buddy tone, mission length, learning format, and social mode

Safe suggestions must preserve user control:

- **Buddy tone:** move toward gentle or recovery when difficulty is too hard, energy is low, or aggregate patterns suggest overload. Avoid comparison pressure, shame, guilt, scolding, fear, and public ranking pressure.
- **Mission length:** suggest shorter missions for low energy, time constraints, too-hard feedback, or aggregate overload. Longer missions remain optional and review_required in sensitive contexts.
- **Learning format:** use explicit preferences or aggregate-safe feedback. Mixed formats are allowed; sensitive profiling and diagnosis from learning behavior are forbidden.
- **Social mode:** solo should remain available. Team and competition modes must be optional, fair, anti-humiliation reviewed, and age-appropriate. Family mode requires privacy/guardian review.

## Recovery before pressure

Recovery is a first-class safe outcome. Rest can be progress. Missed days, tired/stressed/low-energy feedback, overload, and time constraints should lead to gentle return, shorter missions, recovery tone, or pause—not punishment or harder pressure. Recovery suggestions must not become medical advice. Overtraining, sleep loss, unsafe activity, or unsafe-time escalation must be blocked or review_required.

## Reward and mission authority are not enabled

The Adaptive Difficulty Agent cannot grant, withhold, boost, reduce, authorize, or finalize rewards, XP, points, inventory, rare items, tokens, NFTs, payouts, purchases, or money-near benefits. It also cannot complete, reject, verify, final-authorize, or anti-cheat clear missions.

Difficulty fit, Buddy tone, learning format, age band, aggregate patterns, or protected context may never be direct reward authority or mission-completion authority. Future reward and mission authority remain separate, server-authoritative, protected, and review_required.

## Connections to existing and future systems

- **Adaptive User Insight:** provides aggregate-safe insight categories and minimum-threshold thinking.
- **Mission Factory Agent:** future mission generation can consult these boundaries before proposing difficulty variants, but cannot bypass review.
- **Product Intelligence Agent:** future product reports can use these dimensions to summarize aggregate friction without protected profiling.
- **Product Readiness:** tracks this framework as a report-only readiness component, not runtime readiness.
- **Website Agents:** trust/compliance and website-readiness agents should reference these boundaries before making public claims about personalization or adaptive difficulty.
- **Future runtime implementation:** must be a separate task with consent, protected-data, age, fairness, accessibility, reward-authority, mission-authority, and safety review.

## Validation

Run the report-only validator:

```bash
node scripts/wellfit-dev-agent/src/adaptive-difficulty-agent-check.mjs
```

The validator writes `scripts/wellfit-dev-agent/output/adaptive-difficulty-agent-report.md` and reports `ADAPTIVE_DIFFICULTY_AGENT_READY=true` only when the register, Work Map, TODO Index, protected review boundaries, authority boundaries, and no-runtime/no-personalization constraints are present.

## KI-Fortsetzungs-Prompt

Naechste KI: Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/adaptive-difficulty-agent.json`, `docs/architecture/WELLFIT_ADAPTIVE_DIFFICULTY_AGENT.md`, `scripts/wellfit-dev-agent/src/adaptive-difficulty-agent-check.mjs`, `project-register/human-motivation-engine.json`, `docs/architecture/WELLFIT_HUMAN_MOTIVATION_ENGINE.md`, `project-register/ethical-engagement-guard.json`, `docs/architecture/WELLFIT_ETHICAL_ENGAGEMENT_GUARD.md`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/product-readiness.json`, `project-register/risk-classifier.json`, `project-register/continuity-dependency-map.json` und `project-register/agent-task-queue.json`. Fuehre kuenftige Aenderungen am Adaptive Difficulty Agent nur register-/dokumentations-/validator-only aus: keine Runtime-Personalisierung, kein Difficulty Tuning, kein protected-data Profiling, keine Mission-/Reward-Autoritaet, keine Token-/NFT-/Wallet-/Payment-/Betting-/Unity-Aenderung, keine Auto-Merge-/Auto-Repair-/Approval-/Deployment-Autoritaet. Halte health, child/minor, family/guardian, location/GPS, camera/image/video/audio, face/biometric, consent, privacy, legal/compliance, token/wallet/payment/NFT, betting, reward authority und mission completion authority review_required. Naechste empfohlene Aufgabe bleibt Multisensory Learning Engine.
