# AI Buddy Personality & Tone Guard

## Status

- Agent id: `ai-buddy-personality-tone-guard`
- Planning priority for this batch: 2
- Risk level: `high`
- Execution capability: `report_only`
- Runtime authority granted: `false`
- Required human approval before runtime: `true`

## Why this agent is prioritized

Second priority because the Buddy will later speak directly with users. The first planning version is a report-only planning guard: it creates documentation, register metadata, validator coverage, catalog visibility, and work-log evidence only.

## Scope

Defines report-only tone, personality, and safety review guardrails for future AI Buddy communication without changing prompts, UI, runtime chat, profiling, or protected-data handling.

Allowed artifact scope in this step is limited to:

- `docs/architecture/WELLFIT_AI_BUDDY_PERSONALITY_TONE_GUARD.md`
- `project-register/ai-buddy-personality-tone-guard.json`
- `scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs`
- `project-register/agent-catalog.json`
- `project-register/approved-agent-build-backlog.json`
- `project-register/agent-work-log.json`

## Explicit non-goals for this step

This planning artifact must not change App Runtime, runtime prompts, user profiling, Firestore rules, Firebase Functions, UI execution, package manifests, deployment settings, GitHub workflows, public assets, or Unity files. It must not grant reward authority, mission completion authority, anti-cheat authority, health/child/location/legal/compliance authority, token/NFT/wallet/payment/betting capability, merge authority, deploy authority, approval authority, or auto-repair authority.

## Report-only inputs

The agent may read existing planning context, including the approved agent backlog, agent catalog, risk classifier, product readiness matrix, PR review policy, progress log, and agent work log. It may also read connected registers listed in its register file. Reading those sources creates governance evidence only and must not activate runtime behavior.

## Report-only outputs

Valid outputs are review artifacts only:

- `tone_risk_findings`
- `buddy_voice_review_questions`
- `safe_phrase_guidance`
- `protected_topic_flags`

Every protected or high-impact finding remains `review_required` until Bernd or another authorized owner approves an exact runtime scope, file allowlist, stop conditions, and tests.

## Validator contract

The validator at `scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs` checks that the register, architecture document, catalog entry, backlog entry, and work-log evidence agree on report-only status, runtime denial, protected boundaries, and required artifact paths.

## Next safe maintenance task

Keep `ai-buddy-personality-tone-guard` synchronized across docs, register, validator, catalog, backlog, and build/work log. Do not implement runtime behavior from this artifact without a later explicit human-approved task.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, project-register/ai-buddy-personality-tone-guard.json, project-register/approved-agent-build-backlog.json, project-register/agent-catalog.json, project-register/agent-work-log.json und scripts/wellfit-dev-agent/src/ai-buddy-personality-tone-guard-check.mjs. Arbeite nur an report-only Dokumentation, Register-Metadaten, Katalog-/Backlog-/Work-Log-Synchronisierung und Validatoren fuer diesen Agenten. Keine App Runtime, keine Nutzerprofilierung, keine Firestore-Regeln, keine Firebase Functions, keine UI-Ausfuehrung, keine geschuetzten Produktentscheidungen, kein Merge, kein Deploy und keine Auto-Reparatur aktivieren.
