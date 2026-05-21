# Beta-1 Pilot Go/No-Go Matrix (AT Closed Beta Wave 1)

Status: readiness decision matrix (planning + evidence gating)
Date: 2026-05-21
Branch context: `readiness/beta1-pilot-go-no-go-matrix`
Scope: Closed Beta Wave 1 in Austria (25-50 testers)

## 1) Zweck

Diese Matrix definiert objektive Go/No-Go-Kriterien fuer den Start der AT Closed Beta Wave 1 mit 25-50 Testern.

## 2) Ampelsystem

- **GREEN** = erfuellt, Evidence vorhanden und nachvollziehbar dokumentiert
- **YELLOW** = teilweise erfuellt, begrenzter Pilot nur mit klarer Mitigation
- **RED** = blockiert, kein Pilotstart erlaubt
- **TBD** = noch nicht bewertet / Evidence fehlt

## 3) Go/No-Go Matrix

| Kategorie | Status | Required evidence | Current evidence source | Blocker | Mitigation | Owner | Must be GREEN before Wave 1? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login/Auth | TBD | Erfolgreicher Login/Logout fuer adult + guardian, denied flow ohne sensitive leaks | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; Manual Seed Evidence | Instabile Auth-Flows oder haeufige Login-Blocker | Vor Start Smoke erneut ausfuehren; P1/P0 Incident-Regeln aktivieren | Admin operator + QA | yes |
| Admin Panel | TBD | `/admin/beta1` erreichbar mit admin claim, Create/Publish-Flow bestaetigt | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md | Admin kann Missionen/Checkpoints/Glitches nicht vorbereiten | Blocker erfassen, fixen, Seed Run wiederholen | Admin operator | yes |
| Manual Seed Run | TBD | Seed Runbook-Schritte durchgefuehrt + Evidence Template ausgefuellt | BETA1_MANUAL_DEMO_SEED_RUNBOOK.md; BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md | Seed nicht abgeschlossen oder unvollstaendige Evidence | Manual Run komplett wiederholen, fehlende Felder dokumentieren | Admin operator | yes |
| Dashboard Read Projections | TBD | Published Missions + Projection Panels sichtbar/stabil | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; vorhandene Dashboard-Read-Projection Arbeit | Dashboard zeigt keine Missionsdaten oder instabil | Blocker isolieren, nur read/projection relevant beheben | Client QA | yes |
| Missions sichtbar | TBD | Mind. 5-10 Demo-Missionen als published sichtbar | BETA1_SEED_DEMO_CONTENT_PLAN.md; Seed Evidence | Published Status fehlt oder Read-Projektion leer | Mission Publish erneut pruefen, Evidence aktualisieren | Admin operator | yes |
| XP Wallet/Ledger Anzeige | TBD | Wallet/Ledger read-only Projektion konsistent; kein Crash | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; Device Evidence | Inkonsistente XP/Ledger Darstellung oder Crash | XP-Projection Smoke + Incident Tracking bis stabil | Client QA + Admin operator | yes |
| Guardian/Child Boundary | TBD | Child nur unter Guardian-Kontext; kein Child-Standalone Login | WELLFIT_BETA1_SCOPE.yaml; Test Users/Rollout Plan | Boundary unklar oder Child-Standalone moeglich | Pilot stoppen, Boundary klarstellen und erneut testen | Safety owner + QA | yes |
| Permission/Error Handling | TBD | Permission denied ohne Stacktrace/ohne sensible Details | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md | Sensitive Details leaken bei Errors | Error-Wording/Handling haerten, erneut validieren | Admin operator + QA | yes |
| Firestore/Functions Guardrails | GREEN | Keine neuen Functions/Rules fuer Pilotfreigabe noetig; Server bleibt Authority | WELLFIT_BETA1_SCOPE.yaml; bestehende Beta-1 Governance Docs | N/A in diesem Readiness-PR | Guardrails in jedem Evidence-PR erneut bestaetigen | Tech lead | yes |
| Emulator/CI Evidence | GREEN | CI/Emulator gruen fuer Beta-1 fokusierte Suites | BETA1_EMULATOR_VERIFICATION.md | Lokale Emulator-Unterschiede moeglich | CI als primares Gate + lokale Abweichung dokumentieren | QA/CI owner | yes |
| Mobile Device Evidence | TBD | Android Chrome + iPhone Safari Smoke Nachweis | BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md; Pilot Checklist | Kein Device-Nachweis vor Freigabe | Device Test-Run verpflichtend vor Wave 1 | QA | yes |
| Support/Incident Runbook | GREEN | Definierte Kanaele, Severity-Logik, Stop Conditions, Incident Template | BETA1_PILOT_SUPPORT_RUNBOOK.md | N/A nach Erstellung | Vor Start Kontakt-Owner benennen und testen | Support operator | yes |
| Privacy/Consent/Legal wording | TBD | Consent/Privacy wording geprueft fuer Beta-1 Kommunikation | WELLFIT_BETA1_SCOPE.yaml; TODO/rollout docs | Rechtstexte/Consent unklar oder fehlend | Review mit Legal/Privacy owner vor Start | Legal/Privacy owner | yes |
| Reality Glitch Safety | TBD | Sichere Locations, admin cancel readiness, klare Safety-Kommunikation | WELLFIT_BETA1_SCOPE.yaml; Seed Demo Content Plan | Safety unklar oder keine Abbruchlogik | Event pausieren, Safety Briefing + Evidence nachziehen | Safety owner + Admin operator | yes |
| Shop/Inventory WFXP-only | GREEN | Shop bleibt WellFit-XP only, kein Real-Money/IAP | WELLFIT_BETA1_SCOPE.yaml; Seed Demo Content Plan | N/A laut Scope | Sichtpruefung im Evidence-Run dokumentieren | Product owner + QA | yes |
| No Blockchain/Token/Cashout | GREEN | Keine Blockchain/Token/Cashout/Payment Felder in Beta-1 Flows | WELLFIT_BETA1_SCOPE.yaml | N/A laut Scope | Jede Abweichung als P0 Stop Condition behandeln | Product owner | yes |
| Tester Onboarding | TBD | Platzhalter-Testerrollen + Rollout-Kommunikation + Support-Kontakt | BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md | Onboarding unklar oder unvollstaendig | Onboarding-Checkliste vor Freigabe abschliessen | Rollout owner | yes |
| Stop Conditions | GREEN | Stop-Regeln dokumentiert und kommunikativ vorbereitet | Diese Matrix; BETA1_PILOT_SUPPORT_RUNBOOK.md | N/A nach Erstellung | Vor Start Stop-Communication als Template finalisieren | Incident commander | yes |

## 4) Wave-1-Startregel

**Wave 1 darf nur starten, wenn alle Kategorien mit `Must be GREEN before Wave 1 = yes` den Status GREEN haben.**

## 5) No-Go-Regeln (verbindlich)

Pilotstart ist **No-Go**, wenn mindestens einer der folgenden Punkte zutrifft:

1. Login ist instabil.
2. Admin kann Demo-Missionen nicht vorbereiten.
3. Dashboard zeigt Missionen nicht.
4. XP/Ledger ist inkonsistent oder crasht.
5. Child/Guardian-Boundary ist unklar.
6. Permission denied leakt sensible Details.
7. Safety Report Prozess ist unklar.
8. Reality Glitch Safety ist unklar.
9. Token/Cashout/Payment-Felder sind sichtbar.
10. Echte personenbezogene Daten waeren noetig.
11. Keine Support-Eskalation ist definiert.

## 6) Governance-Hinweise fuer den Evidence-Run

- Keine Runtime-Produktlogik aendern.
- Keine neuen Firebase Functions.
- Keine Firestore Rules Aenderungen.
- Keine Deploys.
- Keine Production Firebase IDs.
- Keine echten Tester-E-Mails oder personenbezogenen Daten.
- Finale Autoritaet bleibt serverseitig.
