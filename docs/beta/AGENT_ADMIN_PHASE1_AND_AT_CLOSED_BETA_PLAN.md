# Agent Admin Phase 1 + AT Closed Beta (25-50) Execution Plan

Stand: 2026-05-20
Status: planning_only

## Ziel

Umsetzung in kontrollierten Stufen:

1. Agent-Admin Freigabe Phase 1 nur fuer docs/register/check-script Automation
2. Serverseitige Rollen + Audit-Log fuer Admin-Freigaben schliessen
3. Pilot-Readiness Sprint mit Device-Evidence, Backend-Guardrail-Evidence und Support-Runbook
4. Closed Beta fuer 25-50 Tester:innen in Oesterreich mit klaren Kriterien und Stop-Conditions
5. Erst danach: eng allowlistete Runtime-Autonomie

## Phase 1: Agent-Admin Freigabe (docs/register/check-script only)

### Scope
- Erlaubt: docs/, project-register/, scripts/wellfit-dev-agent/src/*check.mjs, *dry-run.mjs, *report.mjs
- Nicht erlaubt: Runtime-Produktcode, Firestore Rules, produktive Functions-Authority, Auto-Merge, Auto-Deploy

### Definition of Done
- `project-register/agent-control-center.json` und `project-register/agent-autopilot.json` bleiben auf report/docs-register-safe Stufe
- Quality Gate laeuft grün
- PR- und Mergeability-Evidence wird dokumentiert

## Kritischer Gap: Serverseitige Rollen + Audit-Log

### Muss geschlossen sein vor Runtime-Autonomie
- Serverseitige Rollenpruefung fuer Admin-Aktionen
- Audit-Log mit: actor, role, action, taskId/proposalId, timestamp, result, checksum/evidence link
- Explicit deny fuer protected scopes ohne Owner-Freigabe

### Akzeptanzkriterien
- Kein client-only Role-Bypass moeglich
- Jede Freigabe/Ausfuehrung revisionssicher nachvollziehbar
- Fehlende Audit-Eintraege blockieren Freigabe

## Pilot-Readiness Sprint

### A) Device Evidence
- Browser/Devices: Android Chrome, Samsung Internet, iPhone Safari, Desktop Responsive
- Pflichtstatus je Test: pass/fail/blocked/device_test_required/review_required
- Evidence in bestehenden Registern/Statusdateien dokumentieren

### B) Backend Guardrail Evidence
- Lint/Build/Functions check/Quality Gate
- Guardrail-Checks fuer Reward/Mission/Protected Scopes
- Emulator-Blocker transparent als environment limitation dokumentieren

### C) Support Runbook
- Incident-Klassen (P0-P3)
- Reaktionszeiten und Eskalationspfad
- Rollback/Feature-Stop bei Sicherheits- oder Datenrisiken
- Tester-Kommunikationsvorlagen (Known Limits / Preview-Status)

## AT Closed Beta 25-50

### Ein-/Ausschlusskriterien
- Einschluss:
  - Device-Anforderungen erfuellt
  - Zustimmung zu Beta-Hinweisen und Datenschutzhinweisen
  - Nutzung innerhalb freigegebener Beta-Features
- Ausschluss:
  - Protected-/Review-required Flows ohne explizite Freigabe
  - Erwartung finaler Reward-/Mission-Autoritaet
  - Nutzung fuer finanzielle/medizinische Entscheidungen

### Stop-Conditions
- Sicherheits-/Privacy-Vorfall
- Reward-/Mission-Authority Drift Richtung Client
- Fehlende Guardrail-Evidence in einem Release-Zyklus
- Kritische Regression in Mobile/PWA Kernpfaden

## Nachgelagerte Erweiterung: Runtime-Autonomie (allowlistet)

Erst nach erfolgreichem Pilot und expliziter Owner-Freigabe:
- pro Task exakte runtime allowlist
- harte blocked paths
- verpflichtende Tests + human merge decision
- keine Freigabe fuer Token/Wallet/Payment/Health/Child/Location/Legal ohne separaten Reviewplan

## Empfohlene Reihenfolge (ausfuehrbar)

1. Phase-1-Freigabe formal bestaetigen (docs/register/check-script only)
2. Rollen/Audit-Log Backend-Implementierung und Nachweis
3. Pilot-Readiness Sprint in einem eigenen Branch umsetzen
4. AT Closed Beta 25-50 starten mit Monitoring und Stop-Conditions
5. Runtime-Autonomie nur stufenweise und scoped erweitern
