# AI Buddy Personality & Tone Guard

## Status

- Agent id: `ai-buddy-personality-tone-guard`
- Planning priority for this batch: 2
- Risk level: `high`
- Execution capability: `report_only`
- Runtime authority granted: `false`
- Required human approval before runtime: `true`

## Why this guard exists

The WellFit Buddy will later speak directly with users. This guard defines the permitted and forbidden personality/tone envelope before any runtime Buddy prompt, UI copy, retention behavior, or API behavior is changed.

The first version is intentionally report-only: it creates documentation, register metadata, validator coverage, catalog visibility, and work-log evidence only.

## Connected governance and review surfaces

This guard is connected to these planning registers:

- `project-register/ethical-engagement-guard.json`
- `project-register/healthy-retention-agent.json`
- `project-register/human-motivation-engine.json`

It also names the Buddy runtime surfaces that future reviews must check, without granting this task write access to those surfaces:

- `app/buddy/**`
- `app/api/buddy-ki/route.ts`

## Scope

Defines report-only tone, personality, and safety review guardrails for future AI Buddy communication without changing prompts, UI, runtime chat, profiling, or protected-data handling.

Allowed artifact scope in this step is limited to:

- `docs/architecture/WELLFIT_AI_BUDDY_PERSONALITY_TONE_GUARD.md`
- `project-register/ai-buddy-personality-tone-guard.json`
- `scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs`
- `project-register/agent-catalog.json`
- `project-register/approved-agent-build-backlog.json`
- `project-register/agent-work-log.json`

## Allowed Buddy tones

Future Buddy copy may be reviewed as acceptable only when it remains within these tones:

| Tone | Requirement |
| --- | --- |
| `neugierig` | Ask open, low-pressure questions that invite reflection without extracting sensitive details. |
| `unterstützend` | Acknowledge effort, normalize pauses, and offer next small steps without judgment. |
| `spielerisch` | Use light, age-appropriate playfulness that does not create compulsion, pressure, or fear of missing out. |
| `respektvoll` | Respect autonomy, boundaries, consent, privacy, pace, and user choice. |
| `recovery-freundlich` | Treat rest, missed sessions, lower intensity, and recovery days as valid and healthy options. |
| `kindgerecht nur nach separater Child-Safety-Prüfung` | Child-appropriate Buddy tone may be used only after a separate Child-Safety-Prüfung explicitly approves the context, age assumptions, consent model, and runtime scope. |

## Forbidden Buddy tones

Future Buddy copy must block or escalate these tones:

| Forbidden tone | Blocked meaning |
| --- | --- |
| `Scham` | Language that makes users feel guilty, inferior, lazy, embarrassed, or lesser because of activity, recovery, body, learning pace, or missed sessions. |
| `Druck` | Urgent or coercive language that pushes activity despite fatigue, discomfort, consent limits, or user boundaries. |
| `Suchtmechanik` | Compulsive streak, scarcity, loss-aversion, FOMO, variable-reward, or similar wording designed to keep users hooked. |
| `medizinische Diagnose` | Diagnosing symptoms, illness, mental health status, injuries, recovery readiness, or treatment needs. |
| `finanzielle Versprechen` | Claims or implications that participation guarantees income, token value, payout, investment upside, or financial reward. |
| `manipulative Retention` | Personalized vulnerability exploitation, deceptive urgency, hidden persuasion, or retention tactics that override wellbeing. |

## Review rules

- Any child-facing or child-appropriate tone requires a separate Child-Safety-Prüfung before runtime use.
- Any medical-adjacent, financial-adjacent, reward-adjacent, mission-completion, or retention-sensitive Buddy copy remains `review_required`.
- The guard may identify risks, ask review questions, and suggest safe phrasing categories, but it must not rewrite `app/buddy/**` or `app/api/buddy-ki/route.ts` without a later explicit human-approved runtime scope.
- The ethical-engagement, healthy-retention, and human-motivation registers remain upstream context for wellbeing, autonomy, and non-manipulative engagement checks.

## Explicit non-goals for this step

This planning artifact must not change App Runtime, runtime prompts, user profiling, Firestore rules, Firebase Functions, UI execution, package manifests, deployment settings, GitHub workflows, public assets, or Unity files. It must not grant reward authority, mission completion authority, anti-cheat authority, health/child/location/legal/compliance authority, token/NFT/wallet/payment/betting capability, merge authority, deploy authority, approval authority, or auto-repair authority.

## Report-only inputs

The guard may read existing planning context, including the approved agent backlog, agent catalog, risk classifier, product readiness matrix, PR review policy, progress log, and agent work log. It may also read connected registers listed in its register file. Reading those sources creates governance evidence only and must not activate runtime behavior.

## Report-only outputs

Valid outputs are review artifacts only:

- `tone_risk_findings`
- `buddy_voice_review_questions`
- `safe_phrase_guidance`
- `protected_topic_flags`

Every protected or high-impact finding remains `review_required` until Bernd or another authorized owner approves an exact runtime scope, file allowlist, stop conditions, and tests.

## Validator contract

The validator at `scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs` checks that the register, architecture document, catalog entry, backlog entry, and work-log evidence agree on report-only status, runtime denial, protected boundaries, required artifact paths, required connections, allowed tones, and forbidden tones.

## Next safe maintenance task

Keep `ai-buddy-personality-tone-guard` synchronized across docs, register, validator, catalog, backlog, and build/work log. Do not implement runtime behavior from this artifact without a later explicit human-approved task.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/ai-buddy-personality-tone-guard.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-catalog.json`, `project-register/agent-work-log.json` und `scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs`. Arbeite nur an report-only Dokumentation, Register-Metadaten, Katalog-/Backlog-/Work-Log-Synchronisierung und Validatoren fuer diesen Agenten. Keine App Runtime, keine Nutzerprofilierung, keine Firestore-Regeln, keine Firebase Functions, keine UI-Ausfuehrung, keine geschuetzten Produktentscheidungen, kein Merge, kein Deploy und keine Auto-Reparatur aktivieren.
