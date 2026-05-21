# CODEX PROMPT — Beta-1 Pilot Readiness Execution (Evidence Run)

## Branch proposal

`readiness/beta1-pilot-evidence-run`

## Ziel

Evidence fuer Beta-1 Pilotfreigabe sammeln aus:

- Manual Seed Run
- Device Tests (Android Chrome + iPhone Safari)
- Dashboard Checks (Read Projections)
- Support Runbook Readiness

## Verbindliche Grenzen

- Keine Runtime-Produktlogik aendern.
- Keine neuen Firebase Functions.
- Keine Firestore Rules Aenderungen.
- Keine UI-Erweiterung ausser minimaler Doku-/Readiness-Nachweis.
- Keine echten personenbezogenen Daten.
- Keine echten Tester-E-Mails.
- Keine Firebase Production IDs.
- Keine automatischen Writes.
- Finale Autoritaet bleibt serverseitig.

## Pflicht-Input vor Start

- `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`
- `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md`
- `docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md`
- `docs/beta/BETA1_MANUAL_DEMO_SEED_RUNBOOK.md`
- `docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md`

## Arbeitsauftrag

1. Manual Seed Run gemaess Runbook ausfuehren (ohne automatische Writes).
2. Evidence Template vollstaendig ausfuellen (nur Placeholder-Testerkeys).
3. Android Chrome + iPhone Safari Smoke dokumentieren.
4. Dashboard-Projections fuer Missions/Wallet/Ledger/Inventory/Shop pruefen.
5. Support-Kanaele/Owner/Incident-Log Placeholder fuer Pilotstart konkretisieren.
6. Go/No-Go Matrix aktualisieren (Status je Kategorie setzen).
7. Bei RED-Status sofort stoppen und nur Blocker dokumentieren.

## Stop-Regel

**Sofort stoppen bei RED-Status** oder wenn fuer Abschluss eine verbotene Aenderung noetig waere (Runtime/Firebase Rules/Functions/PII/Production IDs).
