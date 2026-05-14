# WellFit Internal Source Map

Stand: 2026-05-14  
Status: Maschinenlesbare Registry ergaenzt; keine Produktlogik-Aenderung

## Zweck

Diese Datei erklaert die maschinenlesbare Registry `project-register/internal-sources.json`.

Die Registry verbindet WellFit-interne Konzept- und Quellgruppen mit bereits vorhandenen Repository-Bereichen. Future Codex/AI-Agenten sollen dadurch schnell erkennen:

- welche Konzepte bereits als Roadmap, Architektur, Register oder Codebereich existieren,
- wo die fuehrenden Implementierungsdateien liegen,
- welche Bereiche ausdruecklich noch nicht implementiert sind,
- welche Safety-/Compliance-Grenzen gelten,
- wo eine naechste sichere Fortsetzung stattfinden darf,
- welche Systeme nicht doppelt aufgebaut werden duerfen.

## Pflicht vor Konzept- oder Featurearbeit

Vor Arbeit an Konzepten, Missionen, Buddy, AR, Economy, Feedback, Analytics, Business, B2B, Tokenomics oder sensiblen Daten zuerst lesen:

1. `AGENTS.md`
2. `todolist/CURRENT_PROJECT_STATE.md`
3. `todolist/WORK_MAP.md`
4. `todolist/TODO_INDEX.md`
5. `project-register/internal-sources.json`
6. die in der jeweiligen Source-Group genannten Architektur-/TODO-Dateien

## Fuehrende maschinenlesbare Datei

`project-register/internal-sources.json` ist die maschinenlesbare Quelle fuer diese Map.

Top-Level-Felder:

- `version`
- `updated`
- `purpose`
- `governance`
- `sourceGroups`

Jede `sourceGroups[]`-Gruppe enthaelt:

- `id`
- `name`
- `topics`
- `supportingConceptFiles`
- `alreadyStartedInRepo`
- `notYetImplemented`
- `leadingImplementationFiles`
- `doNotDuplicateWarnings`
- `nextSafeWorkLocation`
- `riskLevel`

## Source-Groups

Die Registry enthaelt aktuell diese Gruppen:

| Source-Group | Risiko | Fuehrende Fortsetzung |
|---|---:|---|
| Master concept / Master-Bibel | medium | `todolist/WORK_MAP.md`, `todolist/NEXT_ACTIONS.md`, `project-register/internal-sources.json` |
| Whitepaper / investor documents | high | `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`, `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md` |
| Pre-Sale / Tokenomics documents | critical | `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md`, `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md` |
| Avatar / KI-Buddy documents | medium | `docs/architecture/BUDDY_KI_INTEGRATION.md`, `docs/architecture/BUDDY_KI_GUIDE_DATA_MODEL.md`, `app/buddy/`, `lib/buddyKi/` |
| Spielplaetze / Kinder | critical | `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`, `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`, `docs/architecture/MISSION_TYPES_AND_AR_SIDE_QUESTS.md` |
| Erwachsene / Active Breaks | high | `docs/architecture/MISSION_TYPES_AND_AR_SIDE_QUESTS.md`, `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`, `app/mobile/bewegung/page.tsx` |
| Familien | high | `docs/architecture/MISSION_TYPES_AND_AR_SIDE_QUESTS.md`, `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` |
| Ernaehrung / Abnehmen | critical | `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`, `todolist/NEXT_ACTIONS.md` |
| Soziales / AR Battle / Gilden | critical | `docs/architecture/COMPETITION_INTERNAL_STAKES_GUARDRAILS.md`, `docs/architecture/AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md`, `app/missionen/challenge/page.tsx` |
| Unity / WellFitBuddyAR | critical | `docs/architecture/AR_CONTEXTUAL_MISSION_REWARD_FLOW.md`, `docs/architecture/AR_REWARD_PREVIEW_API.md`, `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY` |
| Business model / B2B / monetization | high | `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`, `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md`, `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md` |
| Feedback / Analytics / Optimization loop | high | `project-register/user-feedback.json`, `docs/architecture/USER_FEEDBACK_DATABASE_FLOW.md`, `project-register/feedback-analytics-loop.json` |

## Global do-not-duplicate warnings

These warnings apply across all source groups:

- Do not create a second app shell, navigation system, mission engine, reward ledger, economy model, Buddy KI provider layer, AR event authority path, feedback pipeline, or agent-governance system.
- Do not activate token, NFT, wallet, payment, presale, trading, staking, payout, betting, or final reward authority flows from concept documents.
- Do not expand health, child, location, camera, privacy, consent, or compliance logic from concept documents without an explicit reviewed task.
- Do not touch PR #13 or overwrite/delete Unity files under `native/unity/WellFitBuddyAR`.

## How future agents should use this map

1. Identify the concept/source group.
2. Read `supportingConceptFiles` for context.
3. Continue only in `leadingImplementationFiles` or `nextSafeWorkLocation`.
4. Preserve the `doNotDuplicateWarnings`.
5. If the source group says `notYetImplemented`, treat it as guarded backlog, not permission to implement.
6. For `high` or `critical` risk groups, stop before product logic and request/rely on an explicit reviewed task.

## Relationship to existing maps

This file does not replace `todolist/WORK_MAP.md` or `todolist/TODO_INDEX.md`.

- `todolist/WORK_MAP.md` remains the human-readable topic-to-file map.
- `todolist/TODO_INDEX.md` remains the TODO/planning index.
- `project-register/internal-sources.json` adds a machine-readable source-concept layer that points back to those existing maps and registers.

## Maintenance rule

When a new internal concept document or major source bundle is added, update only the relevant source group in `project-register/internal-sources.json` and this explanatory file. Do not create a parallel architecture registry.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, diese Datei und `project-register/internal-sources.json`. Wenn du an einem WellFit-Konzept oder einer internen Quelle weiterarbeitest, finde zuerst die passende `sourceGroups[]`-Gruppe in `project-register/internal-sources.json`, lies die dort genannten `supportingConceptFiles`, arbeite nur in `leadingImplementationFiles` oder `nextSafeWorkLocation`, und respektiere alle `doNotDuplicateWarnings`. Implementiere keine Produktlogik aus Konzepttexten, wenn die Gruppe `high` oder `critical` ist oder das Feld `notYetImplemented` den Bereich als Backlog/Guarded ausweist. Loesche keine TODO-, Register- oder Architekturdateien und erstelle keine parallele Architektur.
