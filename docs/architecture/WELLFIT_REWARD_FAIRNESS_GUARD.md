# WellFit Reward Fairness Guard

## Status

- Register: `project-register/reward-fairness-guard.json`
- Validator: `scripts/wellfit-dev-agent/src/reward-fairness-guard-check.mjs`
- Mode: `REPORT_ONLY`
- Runtime reward authority granted: `false`
- Runtime mission completion authority granted: `false`
- Runtime anti-cheat authority granted: `false`

## Purpose

The Reward Fairness Guard is a planning, reporting, and blocker agent for WellFit reward concepts. It reviews whether internal points, XP, streaks, mission completion, challenge rewards, anti-cheat, beginner/advanced balancing, and no-pay-to-win rules are represented before a later implementation is considered.

This guard is deliberately non-authoritative. It may produce reports, findings, blockers, and human-review questions only. It must not write rewards, write points, write XP, write streaks, authorize mission completion, authorize challenge rewards, enforce anti-cheat, or change runtime product logic.

## Connected source-of-truth files

The guard must remain connected to these existing guardrails:

| Source | Required use |
| --- | --- |
| `project-register/mission-buddy-economy-flow.json` | Inherit preview-only Mission/Buddy/Economy boundaries, including no frontend reward finalization and no frontend mission-completion finalization. |
| `project-register/risk-classifier.json` | Treat reward authority, mission completion, anti-cheat, money-near mechanics, protected-data inputs, and compliance-adjacent changes as high or critical risk until explicitly reviewed. |
| `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md` | Keep points, XP, streaks, and beta rewards internal, non-money-near, clearly framed, and separated from token/NFT/wallet/payment/payout concepts. |
| `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` | Preserve server-authoritative completion and Firestore hardening requirements before any final reward or completion write is considered. |

## Prüfbereiche

### 1. Interne Punkte

- Internal points remain beta/internal mechanics and must not become cash, token, payout balance, wallet balance, NFT value, or a client-authoritative ledger.
- The frontend, Buddy, AR client, and local scripts may preview or submit evidence only; they must not final-write point grants or deductions.
- Points must not buy challenge wins, anti-cheat bypasses, mission completion, rare-item certainty, or social ranking dominance.

### 2. XP

- XP should recognize safe effort, learning, consistency, cooperation, and recovery without guaranteeing health, weight, medical, financial, or psychological outcomes.
- XP must not be final-authorized by the client, Buddy, AR runtime, or UI state.
- XP curves must leave room for beginners, accessibility needs, illness, travel, rest, and lower-energy days.

### 3. Streaks

- Streaks should motivate healthy rhythm without punishing rest, recovery, illness, travel, consent denial, or safe breaks.
- Paid streak repair, sponsor-driven streak repair, scarcity timers, or shame-based rescue prompts are blocker patterns.
- Streak wording must avoid guilt, fear, public embarrassment, sleep-loss pressure, and manipulative FOMO.

### 4. Mission Completion

- Mission completion can be previewed, suggested, or submitted with evidence, but final completion authority requires the approved server-side path.
- Client code, Buddy responses, AR events, and UI interactions must not final-authorize completion.
- Protected data such as health, location, camera, biometric, face, child/minor, or consent-sensitive signals must not become direct completion authority without explicit human/legal/privacy/safety review.

### 5. Challenge Rewards

- Challenge rewards remain internal, transparent, non-cash, non-token, non-wagering, and non-payout by default.
- Challenge design must avoid humiliation, coercive comparison, overtraining pressure, hidden sponsor pressure, and gambling-like variable rewards.
- Reward allocation should consider accessibility, novice paths, advanced mastery, team balance, anti-farming, recovery, and appeal/review needs.

### 6. Anti-Cheat

- This guard may only report anti-cheat risks and blockers; it cannot enforce anti-cheat, deny rewards, or mark users as cheating.
- Anti-cheat authority requires server-side review, explainability, appeal/review planning, privacy minimization, and avoidance of protected-data overreach.
- Client-controlled values, paid status, sponsored participation, or protected data must not be sole anti-cheat authority.

### 7. Fairness für Anfänger/Fortgeschrittene

- Beginners need achievable missions, safe alternatives, onboarding-friendly reward pacing, and protection from social humiliation.
- Advanced users need meaningful mastery without making beginner progress irrelevant or unsafe.
- Balancing must account for accessibility, recovery, age-appropriate design, context, and non-discrimination without this guard enabling runtime profiling.

### 8. Keine Pay-to-win Mechanik

- Payment, purchases, subscriptions, sponsors, tokens, NFTs, wallets, payouts, marketplaces, and betting/wagering features must not buy completion, XP superiority, challenge wins, anti-cheat bypass, or reward authority.
- Any paid or sponsored concept requires fair non-purchase alternatives and explicit human review before implementation.
- Lootbox-like rewards, paid randomness, paid streak rescue loops, scarcity timers, payout hype, token hype, and money-near advantage loops are blockers.

## Allowed outputs

The agent may create or print:

- reward fairness reports
- fairness blockers
- server-authority flags
- no-pay-to-win flags
- anti-cheat review flags
- beginner/advanced balance notes
- human-review questions

## Forbidden outputs and actions

The agent must not:

- write rewards, points, XP, streaks, ledgers, inventory unlocks, rare-item grants, or challenge rewards
- authorize mission completion, challenge completion, reward grants, or anti-cheat enforcement
- change `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, package manifests, Firebase config, GitHub workflows, or Unity files
- activate token, NFT, wallet, payment, payout, marketplace, staking, presale, trading, betting, or pay-to-win behavior
- profile users at runtime or use protected health, child/minor, location, camera, biometric, face, consent, or privacy-sensitive data as direct reward authority

## Blocker standard

A blocker must be reported when a proposed reward or completion idea includes any of these patterns:

1. Frontend/Buddy/AR/client final authority for rewards, points, XP, streaks, mission completion, or anti-cheat.
2. Token, NFT, wallet, payout, payment, marketplace, staking, presale, trading, betting, wagering, or cash-equivalent advantage.
3. Pay-to-win, paid completion, paid challenge win, paid anti-cheat bypass, paid XP superiority, or paid streak rescue without fair non-purchase alternatives.
4. Shame, FOMO, social humiliation, sleep-loss pressure, overtraining pressure, gambling-like variable rewards, or lootbox-like mechanics.
5. Protected-data reward authority without explicit reviewed design and server-side minimization.
6. Beginner exclusion, advanced-user dominance loops, inaccessible missions, or reward pacing that ignores recovery and safe alternatives.

## Validation

Run the guard check with:

```bash
node scripts/wellfit-dev-agent/src/reward-fairness-guard-check.mjs
```

The check validates that the register, documentation, connected source files, review areas, and report-only boundaries are present. It writes only an ignored Markdown report under `scripts/wellfit-dev-agent/output/` and must not modify runtime files.

## KI-Fortsetzungs-Prompt

Wenn kuenftige Agenten den Reward Fairness Guard fortsetzen, zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/reward-fairness-guard.json`, `docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD.md`, `scripts/wellfit-dev-agent/src/reward-fairness-guard-check.mjs`, `project-register/mission-buddy-economy-flow.json`, `project-register/risk-classifier.json`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`, `project-register/reward-fairness-guard-report-agent.json` und `docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD_REPORT_AGENT.md` lesen. Nur report-only Register, Dokumentation, Validatoren, Berichte und Blocker erweitern; keine Rewards, Punkte, XP, Streaks, Challenge Rewards, Mission Completion oder Anti-Cheat final schreiben oder autorisieren, keine Runtime-Dateien aendern und keine Pay-to-win-, Token-, NFT-, Wallet-, Payment-, Payout-, Marketplace-, Staking-, Presale-, Trading- oder Betting-Mechanik aktivieren.
