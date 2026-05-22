# Agent Admin Server Roles and Audit Plan

Stand: 2026-05-21  
Status: planning_only

## 1) Ziel

Serverseitige Rollenpruefung und revisionssicheres Audit-Log fuer Admin-Freigaben von Agent-Aufgaben vorbereiten, damit spaetere Runtime-Schritte kontrolliert und nachvollziehbar bleiben.

## 2) Rollen

- `owner`
- `admin_operator`
- `agent_supervisor`
- `readonly_observer`
- `agent_executor_service`
- `support_operator`

## 3) Freigabemodell

1. `proposal`
2. `review`
3. `approve`
4. `execute`
5. `checks`
6. `pr handoff`
7. `human merge`

Regel: Kein Schritt darf den naechsten Zustand erreichen, wenn Role-Check oder Audit-Eintrag fehlt.

## 4) Audit-Log-Felder

- `auditId`
- `actorId` (placeholder)
- `actorRole`
- `action`
- `taskId`
- `promptRef`
- `allowedFiles`
- `blockedFiles`
- `riskLevel`
- `timestamp`
- `result`
- `checkSummary`
- `prRef`
- `evidenceRef`
- `checksum`

## 5) Serverseitige Pflicht

- keine client-only Admin-Freigabe
- kein localStorage-Admin
- keine URL-Admin-Flags
- keine Runtime-Freigabe ohne Audit
- fehlender Audit blockiert Execution

## 6) Freigabestufen

- `phase1_docs_register_check_scripts`
- `phase2_admin_role_audit_backend`
- `phase3_limited_runtime_readonly_client`
- `phase4_limited_runtime_ui`
- `phase5_no_protected_autonomy_without_review`

## 7) Blocked Scopes

- token/payment/cashout/blockchain
- child/location/health/privacy/legal
- reward authority / XP ledger / mission completion
- firestore.rules
- functions authority
- deploy/secrets

## 8) Akzeptanzkriterien

- Role checks serverseitig
- Audit Records bei jeder Freigabe
- Execution ohne Audit unmoeglich
- PR-Handoff statt Auto-Merge
- Stop bei protected scopes

## Zusatzhinweis fuer Folge-PRs

Implementierungsschritte fuer Backend/Rules sind **separat** und nur nach expliziter Owner-Freigabe auf einem Runtime-Branch zulaessig.

## Runtime Slice Update (PR runtime/agent-admin-server-roles-audit)
- Added server-side callable foundation for agent task proposals/approvals/executions/check-results/audit-trail.
- Enforced server role checks for owner/admin_operator/agent_supervisor/readonly_observer/support_operator/agent_executor_service.
- Added protected-scope blocking for token/nft/payment/cashout/blockchain/sui/wft and child/health/location/privacy/legal unless explicit owner scoped override.
- Runtime autonomy remains NOT fully enabled: no auto execution, no auto merge, no auto deploy.

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
- Agent-Admin server callables now enforce Beta-1 canonical truth owner-only guardrails in proposal/approval/queue/handoff/worker/policy snapshots.
- Non-owner tasks can reference canonical truth files as required reading, but cannot include them in editable allowedFiles.
- Change requests must be documented in `todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md`.
