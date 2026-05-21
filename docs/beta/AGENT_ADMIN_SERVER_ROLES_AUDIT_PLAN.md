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
