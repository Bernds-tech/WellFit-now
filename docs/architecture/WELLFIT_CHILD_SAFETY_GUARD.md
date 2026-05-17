# WellFit Child Safety Guard

Status: `blocked_until_explicit_review_plan`  
Updated: 2026-05-17  
Runtime child-safety logic enabled: `false`  
Runtime authority granted: `false`

## Purpose

The Child Safety Guard is a planning, documentation, and validation-only guard for child/minor-facing WellFit concepts. It defines review areas for language, movement prompts, location sharing, private child data, social risk, and manipulative retention before any product runtime work is allowed.

This guard does **not** implement onboarding, age gates, consent flows, moderation, location sharing, mission enforcement, reward authorization, notifications, user profiling, Firestore rules, Firebase Functions, UI behavior, Unity/AR behavior, or any runtime child-safety logic.

## Source of truth

- Register: `project-register/child-safety-guard.json`
- Validator: `scripts/wellfit-dev-agent/src/child-safety-guard-check.mjs`
- Ethical engagement dependency: `project-register/ethical-engagement-guard.json`
- Healthy retention dependency: `project-register/healthy-retention-agent.json`
- Privacy/location dependency: `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`

## Runtime block

Runtime Child-Safety-Logik bleibt blockiert, bis ein expliziter Reviewplan existiert. The review plan must name owners/reviewers, exact files and data fields, UI/API/rules surfaces, age-band assumptions, consent/guardian model, data-minimization and deletion rules, movement-safety taxonomy, social-risk controls, healthy-retention boundaries, tests, rollback plan, and the authority boundary that clients must not final-authorize rewards or mission completion.

Until that plan exists, safe work is limited to:

- Register maintenance.
- Architecture documentation.
- Validator checks.
- Human-review questions.
- Non-runtime acceptance criteria.
- Source mapping to the connected governance files.

## Prüfbereiche

### 1. Altersgerechte Sprache

WellFit child/minor-facing concepts must use age-appropriate language that is understandable, respectful, dignity-preserving, and pressure-free. Copy must avoid shame, fear, guilt, body pressure, medical overclaims, payout hype, hidden sponsor pressure, or child-targeted monetization.

### 2. Keine gefährlichen Bewegungsaufforderungen

Missions and Buddy prompts must not encourage traffic-risk, height-risk, water-risk, night-risk, unsafe speed, unsafe load, exhaustion, pain, or unsupervised hazardous movement. Movement ideas need safe alternatives, rest language, and review where minors, public spaces, AR, camera, watch, or motion signals are involved.

### 3. Keine Standortfreigabe ohne Schutzkonzept

No exact location sharing, live tracking, public child check-ins, school/home route disclosure, nearby discovery, or meetup mechanics may be enabled without a separate child-safety, privacy, consent, security, moderation, and fallback review plan. Location refusal must not shame or punish users when safe alternatives are possible.

### 4. Keine privaten Kinderdaten

Do not collect, expose, export, or infer unnecessary private child data such as exact birth date, school, class, address, guardian identity, health details, photos, face data, exact location history, contact details, or family relationships. If child/minor context is unavoidable after review, prefer age bands, aggregate status, ephemeral evidence, least-privilege access, and explicit retention/deletion rules.

### 5. Keine sozialen Risiken

Child/minor social concepts must avoid public shaming, direct messaging with unknown users, unmoderated meetups, follower pressure, ranking humiliation, bullying vectors, doxxing risk, and adult-minor discovery surfaces. Any future social scope requires opt-in design, privacy defaults, moderation/reporting/blocking, guardian/supervision assumptions review, and safe non-social alternatives.

### 6. Keine manipulative Retention

Retention patterns for minors must not use FOMO, loss aversion, scarcity timers, shame streaks, endless loops, sleep-loss pressure, dark-pattern notifications, or child-targeted purchase/payment/token/NFT pressure. Engagement must preserve pause, recovery, opt-out, reminder control, transparency, and safe alternatives.

## Connected guardrails

- `project-register/ethical-engagement-guard.json` supplies the broader ethical engagement, age-appropriate design, dignity, consent, transparency, recovery, trust-preserving rewards, safe social connection, privacy minimization, and no-manipulative-pressure boundaries.
- `project-register/healthy-retention-agent.json` supplies the report-only healthy retention frame: pause/recovery, opt-out, user agency, dark-pattern avoidance, no notification automation, no user profiling, and no reward/mission authority.
- `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` supplies the protected data frame for child/minor, health, watch, camera, motion, location, consent, minimization, fallback, and review-required constraints.

## Forbidden runtime work

This guard must not be used to directly change:

- `app/**`
- `components/**`
- `lib/**`
- `functions/**`
- `firestore.rules`
- `public/**`
- package or Firebase configuration
- GitHub automation
- Unity/AR runtime files under `native/unity/WellFitBuddyAR/**`

Any child-safety runtime implementation, consent/privacy runtime behavior, social child feature, location sharing, notification/retention automation, user profiling, reward authority, mission-completion authority, Firestore rule change, Firebase Function change, or Unity/AR behavior remains `review_required` and blocked until the explicit review plan exists.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `project-register/child-safety-guard.json`, `project-register/ethical-engagement-guard.json`, `project-register/healthy-retention-agent.json`, `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` und diese Datei. Arbeite nur an Register-, Dokumentations- oder Validator-Synchronisierung. Keine Runtime-Child-Safety-Logik, keine App-/Component-/Lib-/Functions-/Firestore-/Public-/Package-/Firebase-/GitHub-/Unity-Aenderungen, keine Datenerhebung, keine Standortfreigabe, keine sozialen Kinderfeatures, keine Nutzerprofilierung, keine Notification-/Retention-Automation und keine Reward-/Mission-Completion-Autoritaet ohne expliziten Reviewplan.
