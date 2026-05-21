# Beta-1 Pilot Evidence Run (AT Closed Beta Wave 1)

Status: first evidence consolidation run (docs/register-only)
Date: 2026-05-21
Branch context: `readiness/beta1-pilot-evidence-run`
Scope: Austria Closed Beta Wave 1 (25-50 testers)

## 1) Zweck

Dieses Dokument sammelt den **ersten strukturierten Readiness-Nachweis** fuer die AT Closed Beta Wave 1.

Wichtig:
- Planning-Dokumente zaehlen als Planungsevidence.
- Ohne echte manuelle Durchfuehrung oder Testnachweis wird ein Punkt **nicht GREEN** markiert.
- Dieser Run ist docs/register-only und fuehrt keine Runtime/Firebase/Rules-Aenderung aus.

## 2) Evidence-Status

| evidenceArea | sourceDocument | currentStatus | evidenceSummary | missingEvidence | blocker | nextAction |
| --- | --- | --- | --- | --- | --- | --- |
| Emulator/CI Evidence | `docs/beta/BETA1_EMULATOR_VERIFICATION.md` | GREEN | Emulator/CI-Verifikation ist fuer Beta-1 bereits dokumentiert und als gruen vermerkt. | Keine neue Luecke fuer diesen Punkt. | none | Bei jedem Folge-PR weiterhin als Gate referenzieren. |
| Admin Panel vorhanden | `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md`, `project-register/progress-log.json` | GREEN | Integration + Validation-Hardening sind dokumentiert; Admin-Slice wurde bereits umgesetzt. | Frische Live-Sitzungs-Evidence fuer aktuellen Pilotlauf. | none | Im Manual Seed Run konkrete Session-Evidence nachtragen. |
| Admin Validation vorhanden | `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md`, `project-register/progress-log.json` | GREEN | Validation/UX-Hardening (PR #184/#185) dokumentiert, inklusive Guardrail-Kontext. | Aktuelle manuelle Validierungsdurchlaeufe aus Pilotfenster. | none | Bei Evidence-Gap-Close einen kurzen Validation-Smoke anhängen. |
| Manual Seed Runbook vorhanden | `docs/beta/BETA1_MANUAL_DEMO_SEED_RUNBOOK.md` | GREEN | Detailliertes manuelles Runbook mit Stop-Bedingungen und Sicherheitsgrenzen vorhanden. | Keine. | none | Als Pflichtreferenz fuer echten Seed-Run beibehalten. |
| Manual Seed Run tatsaechlich durchgefuehrt | `docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md` | TBD | Template existiert, aber es liegt in diesem Repo-Stand kein ausgefuellter, datierter Run-Nachweis vor. | Ausgefuellte Evidence mit Zeitstempel, Placeholder-Testerkeys, Ergebnisstatus. | fehlende Manual-Execution-Evidence | Manual Seed Run real durchfuehren und Evidence ablegen/verlinken. |
| Dashboard Read Projections vorhanden | `project-register/progress-log.json`, `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md` | GREEN | Read-Projections wurden implementiert und in vorherigen Slices dokumentiert. | Frischer Pilotlauf-Screenshot/Testnotiz fuer Stabilitaet. | none | Bei Gap-Close-Branch Read-Projections kurz manuell gegenpruefen. |
| Published Missions sichtbar | `docs/beta/BETA1_SEED_DEMO_CONTENT_PLAN.md`, `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md` | YELLOW | Plan und Erwartung sind klar, aber es fehlt ein aktueller Nachweis, dass in der Zielumgebung bereits publizierte Missionen sichtbar sind. | Sichtnachweis nach Seed-Run (Mission count + visibility). | fehlende runtime/manual Sicht-Evidence | Nach Manual Seed Run Published-Mission-Evidence dokumentieren. |
| XP Wallet/Ledger Anzeige geprueft | `project-register/progress-log.json`, `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md` | YELLOW | Feature-Slice dokumentiert, aber kein aktueller Wave-1-Readiness-Test mit Ergebnisprotokoll vorhanden. | Aktueller Smoke-Nachweis fuer konsistente Wallet/Ledger-Anzeige. | fehlende aktuelle Smoke-Evidence | Wallet/Ledger im Device-/Dashboard-Smoke explizit abhaken. |
| Device Evidence Android Chrome | `docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md` | TBD | Device-Testvorgehen ist geplant, aber kein spezifischer Beta-1 Pilotnachweis fuer Android Chrome vorhanden. | Datierter Testeintrag mit Device/OS/Browser + Ergebnis. | fehlende Device-Execution | Android-Chrome-Smoke vor Wave 1 verpflichtend ausfuehren. |
| Device Evidence iPhone Safari | `docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md` | TBD | iPhone-Safari-Plan ist vorhanden, aber kein konkreter Pilotnachweis abgelegt. | Datierter Testeintrag mit iPhone/Safari-Version + Ergebnis. | fehlende Device-Execution | iPhone-Safari-Smoke vor Wave 1 verpflichtend ausfuehren. |
| Support Runbook vorhanden | `docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md` | GREEN | Runbook mit Severity-Modell, Incident-Kategorien und Stop Conditions liegt vor. | Keine. | none | Im Folge-PR nur Kontakt-/Owner-Platzhalter ersetzen (ohne PII im Repo). |
| Incident Stop Conditions vorhanden | `docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md`, `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md` | GREEN | Stop-Regeln sind explizit und konsistent dokumentiert. | Optional: kurze Team-Readout-Bestaetigung ausserhalb Repo. | none | Vor Wave 1 Incident-Briefing verbindlich durchfuehren. |
| Guardian/Child Boundary Evidence | `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md` | YELLOW | Scope und Rollout-Plan definieren Boundary (kein Child-Standalone-Login), aber kein aktueller Flow-Nachweis aus Pilot-Execution. | Manueller Boundary-Test mit denied/allowed Flow Evidence. | fehlende Execution-Evidence | Guardian/Child Smoke in Gap-Close-Branch dokumentieren. |
| Privacy/Consent/Legal wording Evidence | `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md` | YELLOW | Guardrails und Scope existieren, aber explizite Wortlaut-Abnahme fuer Wave-1-Kommunikation fehlt. | Review-Notiz/Sign-off mit Datum (ohne sensible Daten). | fehlende freigabefaehige Wording-Evidence | Privacy/Consent/Legal wording pass dokumentieren. |
| Reality Glitch Safety Evidence | `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/BETA1_SEED_DEMO_CONTENT_PLAN.md` | YELLOW | Safety-Rahmen (safe locations, cancel) ist geplant, aber kein manueller Sicherheitsnachweis fuer reale Pilotvorbereitung. | Durchgefuehrter Safety-Check je geplantes Glitch-Event. | fehlende Safety-Execution-Evidence | Safety-Checkliste pro Glitch-Template ausfuellen. |
| Shop/Inventory WFXP-only Evidence | `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/BETA1_SEED_DEMO_CONTENT_PLAN.md` | GREEN | Scope schliesst Echtgeld/IAP aus und definiert WFXP-only fuer Beta-1. | Optional visuelle Gegenpruefung aus Pilot-Screenflow. | none | Als hartes Guardrail fuer alle Folgearbeiten markieren. |
| No Blockchain/Token/Cashout Evidence | `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md` | GREEN | Scope/Governance verbieten Blockchain/Token/Cashout fuer Beta-1 und sind konsistent dokumentiert. | Keine. | none | Bei jeder Pilot-Evidence-Aktualisierung als Pflichtcheck bestaetigen. |
| Tester Onboarding Evidence | `docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md` | YELLOW | Onboarding-Struktur mit Platzhalter-Testern ist vorhanden, aber kein Nachweis eines abgeschlossenen Dry-Run-Onboardings. | Abgehakte Onboarding-Checkliste mit anonymen Testerkeys. | fehlende Onboarding-Execution-Evidence | Rollout-Dry-Run (ohne echte PII) dokumentieren. |

## 3) Bewertungsregel dieses Runs

- **GREEN** nur bei ausreichender, belastbarer Evidence.
- **YELLOW/TBD** bei planning-only oder fehlender aktueller Ausfuehrung.
- In diesem ersten Evidence-Run wurden **keine Punkte ohne Nachweis auf GREEN hochgestuft**.

## 4) Ergebnis fuer Wave-1-Freigabe

Aktueller Status: **NO-GO**.

Begruendung (must-be-green noch nicht erfuellt):
- Manual Seed Run Execution fehlt (TBD).
- Mobile Device Evidence fehlt (TBD fuer Android/iPhone).
- Mehrere operative Punkte sind nur planning-level (YELLOW), z. B. Missionssichtbarkeit, Wallet/Ledger-Smoke, Guardian/Child Execution, Onboarding Execution.
