# Health Claims Guard Report Agent

## Status

- Agent id: `health-claims-guard-report-agent`
- Planning priority for this batch: 5
- Risk level: `critical`
- Execution capability: `report_only`
- Runtime authority granted: `false`
- Required human approval before runtime: `true`

## Why this agent is prioritized

Critical guard prioritized report-only for medical-adjacent wording and health/wellbeing claim review. The first planning version is a critical report-only guard: it creates documentation, register metadata, validator coverage, catalog visibility, and work-log evidence only.

## Scope

Reports unsupported health, medical-adjacent, recovery, overuse, biometric, watch-data, and wellbeing claim risks while never changing health logic, claims, data flows, UI copy, or compliance messaging.

Allowed artifact scope in this step is limited to:

- `docs/architecture/WELLFIT_HEALTH_CLAIMS_GUARD_REPORT_AGENT.md`
- `project-register/health-claims-guard-report-agent.json`
- `scripts/wellfit-dev-agent/src/health-claims-guard-report-agent-check.mjs`
- `project-register/agent-catalog.json`
- `project-register/approved-agent-build-backlog.json`
- `project-register/agent-work-log.json`

## Explicit non-goals for this step

This planning artifact must not change App Runtime, runtime prompts, user profiling, Firestore rules, Firebase Functions, UI execution, package manifests, deployment settings, GitHub workflows, public assets, or Unity files. It must not grant reward authority, mission completion authority, anti-cheat authority, health/child/location/legal/compliance authority, token/NFT/wallet/payment/betting capability, merge authority, deploy authority, approval authority, or auto-repair authority.

## Report-only inputs

The agent may read existing planning context, including the approved agent backlog, agent catalog, risk classifier, product readiness matrix, PR review policy, progress log, and agent work log. It may also read connected registers listed in its register file. Reading those sources creates governance evidence only and must not activate runtime behavior.

## Report-only outputs

Valid outputs are review artifacts only:

- `health_claim_findings`
- `evidence_gap_flags`
- `review_required_questions`
- `blocked_implementation_notes`

Every protected or high-impact finding remains `review_required` until Bernd or another authorized owner approves an exact runtime scope, file allowlist, stop conditions, and tests.

## Validator contract

The validator at `scripts/wellfit-dev-agent/src/health-claims-guard-report-agent-check.mjs` checks that the register, architecture document, catalog entry, backlog entry, and work-log evidence agree on report-only status, runtime denial, protected boundaries, and required artifact paths.

## Next safe maintenance task

Keep `health-claims-guard-report-agent` synchronized across docs, register, validator, catalog, backlog, and build/work log. Do not implement runtime behavior from this artifact without a later explicit human-approved task.

## KI-Fortsetzungs-Prompt

Wenn du hier weiterarbeitest, lies zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, project-register/health-claims-guard-report-agent.json, project-register/approved-agent-build-backlog.json, project-register/agent-catalog.json, project-register/agent-work-log.json und scripts/wellfit-dev-agent/src/health-claims-guard-report-agent-check.mjs. Arbeite nur an report-only Dokumentation, Register-Metadaten, Katalog-/Backlog-/Work-Log-Synchronisierung und Validatoren fuer diesen Agenten. Keine App Runtime, keine Nutzerprofilierung, keine Firestore-Regeln, keine Firebase Functions, keine UI-Ausfuehrung, keine geschuetzten Produktentscheidungen, kein Merge, kein Deploy und keine Auto-Reparatur aktivieren.
