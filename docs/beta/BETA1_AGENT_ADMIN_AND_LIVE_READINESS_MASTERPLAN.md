# BETA1 Agent Admin and Live Readiness Masterplan

Stand: 2026-05-21  
Status: planning_only

## 1) Zweck

Dieser Masterplan steuert zwei parallele, aber strikt kontrollierte Beta-1-Ziele:

- **Track A (Agent Admin Phase 1):** sichere, serverseitig pruefbare Admin-Freigabe fuer Agent-Aufgaben vorbereiten.
- **Track B (Live Readiness):** NO-GO-Luecken fuer die erste geschlossene Testphase (25-50 Tester:innen) systematisch schliessen.

Wichtiger Grundsatz: **keine Runtime-Autonomie ohne serverseitige Rollenpruefung + Audit-Log + Human Review/Handoff.**

## 2) Aktueller Stand

- Agent-Autopilot ist aktuell auf **docs/register/check-script automation** begrenzt.
- Runtime-Autonomie ist **nicht** freigegeben.
- Serverseitige Rollenpruefung + Audit-Log fehlen als kritischer Gap vor Runtime-Freigaben.
- Beta-1 Pilot ist weiterhin **NO-GO**, da Human/Manual Evidence fuer Must-be-GREEN-Kriterien fehlt.
- Bereits vorhandene Planungsartefakte: Admin Panel Plan, Client Read Projections Plan, Demo Content Plan, Manual Seed Runbook, Go/No-Go Matrix.
- Die Live-Seiten **Marktplatz, Leaderboard, Punkte-Shop, Analytics & Stats** sind noch nicht beta-live-ready ausgearbeitet.

## 3) Track A - Agent Admin Phase 1

- **A1 - docs/register/check-script automation freigeben:** nur nicht-runtime, scope-bound Planung/Check-Skripte.
- **A2 - serverseitige Rollenpruefung planen:** Rollenmodell fuer proposal/review/approve/execute serverseitig absichern.
- **A3 - Audit-Log-Modell planen:** unveraenderbare Nachvollziehbarkeit je Freigabe/Execution-Schritt.
- **A4 - Approval-/Execution-Lifecycle definieren:** proposal -> review -> approve -> execute -> checks -> PR handoff -> human merge.
- **A5 - Allowlist/Blocked Paths pro Task definieren:** exakte Files/Scopes je Task vor Ausfuehrung festlegen.
- **A6 - erst danach begrenzte Runtime-Autonomie:** nur narrow scope, mit Audit-Pflicht und Stop-Bedingungen.

## 4) Track B - Beta Live Readiness

- **B1 - Evidence-Gaps schliessen** (Must-be-GREEN Luecken aus Matrix/Checklist).
- **B2 - Manual Seed Run durchfuehren** (human executed, evidence-backed).
- **B3 - Device Evidence Android/iPhone** erfassen und verifizieren.
- **B4 - Dashboard/Mission/Wallet Evidence** mit realen Pilotablauf-Nachweisen.
- **B5 - Guardian/Child Boundary Evidence** inkl. No-Public-Child-Profile Grenzen.
- **B6 - Privacy/Consent Wording Evidence** dokumentieren.
- **B7 - Support/Incident Owner finalisieren** inkl. Erreichbarkeit/Eskalation.
- **B8 - Live-Seiten beta-ready planen:** Marktplatz, Leaderboard, Punkte-Shop, Analytics & Stats.

## 5) Abhaengigkeiten

| dependency | requiredBefore | currentStatus | risk | nextAction |
|---|---|---|---|---|
| Serverseitige Rollenpruefung | Runtime-Agent-Execution | gap_open | high | Rollenmodell in AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN konkretisieren |
| Audit-Log pro Freigabe/Execution | Runtime-Agent-Execution | gap_open | high | verpflichtende Audit-Felder + blocking rule festlegen |
| Approval-/Execution-Lifecycle | Agent Runtime Freigabe | partial_plan | medium | proposal->human merge Lifecycle verbindlich machen |
| Human Evidence Pack (Manual Seed + Devices) | Wave-1 Go Entscheidung | gap_open | high | Human-Evidence-Capture vor Go/No-Go erzwingen |
| Guardian/Child + Privacy Evidence | Closed Beta Release | partial | high | fehlende Nachweise priorisiert schliessen |
| Support/Incident Owner/Contact | Pilot Livebetrieb | partial | medium | finale Owner-/On-call-Zuordnung dokumentieren |
| Live-Seiten Data Boundaries | Runtime-Implementierung je Seite | gap_open | high | BETA1_LIVE_PAGES_READINESS_PLAN als Runtime-Scope Vorlage |

## 6) Reihenfolge (Empfehlung)

1. **Zuerst:** Agent Rollen-/Audit-Plan finalisieren (Track A2-A4).
2. **Parallel:** Human Evidence Capture vorbereiten/organisieren (Track B1-B7).
3. **Danach:** Live-Seiten-Readiness-Scope pro Seite finalisieren (Track B8).
4. **Erst dann:** Runtime-Implementierungen in kleinen, getrennten PRs (mit klarer Allowlist).

## 7) Warum nicht alles automatisch

- Agents duerfen aktuell **keine Runtime-Aenderungen** ohne serverseitige Approval-/Audit-Absicherung vornehmen.
- Der Pilot darf **nicht** ohne belegte Human Evidence freigegeben werden.
- Live-Seiten duerfen keine falsche Authority suggerieren und keine Token/Cashout/Real-Money-Erwartung erzeugen.
- WellFit-XP bleibt in Beta-1 internal-only; finale Entscheidungen bleiben serverseitig und human-reviewed.

## Guardrails fuer diesen Masterplan

- Keine Runtime-Produktlogik in diesem PR.
- Keine Functions-/Rules-Aenderungen in diesem PR.
- Keine Deploys, keine Secrets, keine Production-IDs.
- Keine Token/NFT/Payment/Cashout/IAP/Blockchain-Aktivierung.
- Keine Agent-Runtime-Autonomie-Aktivierung.
- Keine Pilotfreigabe ohne Evidence.

## Increment: Agent Admin Roles + Audit Foundation
- Implemented Firestore-backed lifecycle collections: agentTaskProposals, agentTaskApprovals, agentTaskExecutions, agentTaskAuditLog, agentTaskCheckResults.
- Added callable gates for proposal/review/approve/reject/queue/check-result/list/audit-trail with mandatory audit writes.
- Firestore rules keep all writes client-blocked for these collections.
- Human merge and PR handoff remain required.

- 2026-05-21: Runtime slice PR-Handoff Queue ergänzt (Execution-Handoff-Felder, prepare/mark/block/list Callables, requiredChecks-Metadaten, humanMergeRequired=true). Kein Auto-Merge, kein Auto-Deploy, keine automatische Codeausführung.


## 2026-05-21 Safe Codex Handoff Prompts
- Added `agentTaskHandoffPrompts` handoff model with audit-ready fields and copy-status flow.
- Added callables: `generateAgentTaskCodexPrompt`, `getAgentTaskCodexPrompt`, `markAgentTaskCodexPromptCopied`, `listAgentTaskHandoffPrompts`.
- Admin UI flow is manual-only; no auto-run, no GitHub API, no auto-merge/deploy; human merge required.
- Next recommended branch: `plan/beta1-live-pages-runtime-scope` (alternative: `runtime/agent-admin-live-page-task-template`).


## Update: Agent Worker Queue Foundation
- Collection `agentTaskWorkerQueue` added as metadata-only queue with `humanMergeRequired=true`, `autoMerge=false`, `autoDeploy=false`.
- New callables: create/claim/update/checks/pr-prepared/block/list/get for worker queue.
- No automatic code execution, no GitHub API integration, no auto-merge/deploy. Human merge remains required.
- Next recommended branch: `runtime/agent-admin-supervised-pr-creation-plan` (alternative: `readiness/beta1-human-device-evidence-fill`).

- 2026-05-21: PR runtime/agent-admin-automation-gates-completion ergänzt Automation Gates (Admin-Zustimmung + required checks + quality gate/override + production second owner approval). Runner bleibt metadata_only; keine echte GitHub API, kein echtes Deploy ohne sichere Server-Secrets/Owner-Freigabe.

- 2026-05-21: Follow-up fix branch `fix/agent-admin-production-deploy-second-approval` finalisiert Production-Second-Approval: nach 2. Owner-Freigabe werden `autoDeployApproved=true`, `autoDeploy=true`, Status `approved_for_production_deploy` und Worker snapshots gesetzt. Runner bleibt `metadata_only`; weiterhin keine echte GitHub API und kein echtes Deploy. PR #210 fachlich ersetzt durch PR #211.

- 2026-05-21: Branch `fix/agent-admin-runner-deploy-gate-semantics` haertet Runner-Gate-Semantik: deployAllowed fuer preview/staging/production getrennt (production weiter nur mit zweiter Owner-Freigabe), mergeAllowed metadata ergaenzt, Worker-Statusupdates erhalten genehmigte autoMerge/autoDeploy Snapshots bei neutralen Updates. Runner bleibt metadata_only; keine echte GitHub API, kein echtes Deploy, keine Secrets/Production IDs. Naechster empfohlener Branch: `runtime/agent-admin-supervised-runner-real-github-integration`.


## 2026-05-22 update
- Beta-1 canonical truth guardrails are now part of Agent Admin automation gates and metadata-only runner flow.
- Runner remains metadata_only; no real GitHub API integration and no real deploy activation in this step.
