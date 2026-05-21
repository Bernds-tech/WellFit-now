# Beta-1 Pilot Go/No-Go Matrix (AT Closed Beta Wave 1)

Status: readiness decision matrix (evidence-updated)
Date: 2026-05-21
Branch context: `readiness/beta1-pilot-evidence-run`
Scope: Closed Beta Wave 1 in Austria (25-50 testers)

## 1) Zweck

Diese Matrix definiert objektive Go/No-Go-Kriterien fuer den Start der AT Closed Beta Wave 1 mit 25-50 Testern.

## 2) Ampelsystem

- **GREEN** = erfuellt, Evidence vorhanden und nachvollziehbar dokumentiert
- **YELLOW** = teilweise erfuellt, begrenzter Pilot nur mit klarer Mitigation
- **RED** = blockiert, kein Pilotstart erlaubt
- **TBD** = noch nicht bewertet / Execution-Evidence fehlt

## 3) Go/No-Go Matrix

| Kategorie | Status | Required evidence | Current evidence source | Blocker | Mitigation | Owner | Must be GREEN before Wave 1? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login/Auth | YELLOW | Erfolgreicher Login/Logout fuer adult + guardian, denied flow ohne sensitive leaks | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Aktuelle Pilot-Execution-Evidence fehlt | Auth-Smoke im Evidence-Gap-Run dokumentieren | Admin operator + QA | yes |
| Admin Panel | GREEN | `/admin/beta1` erreichbar mit admin claim, Create/Publish-Flow bestaetigt | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; progress-log.json | Kein akuter Blocker dokumentiert | Im Manual Seed Run frisch bestaetigen | Admin operator | yes |
| Manual Seed Run | TBD | Seed Runbook-Schritte durchgefuehrt + Evidence Template ausgefuellt | BETA1_MANUAL_DEMO_SEED_RUNBOOK.md; BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md; BETA1_PILOT_EVIDENCE_RUN.md | Durchgefuehrter Run-Nachweis fehlt | Manual Run komplett ausfuehren und Evidence erfassen | Admin operator | yes |
| Dashboard Read Projections | GREEN | Published Missions + Projection Panels sichtbar/stabil | progress-log.json; BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md | Keine neue Execution-Notiz im aktuellen Pilotfenster | Zielgerichteten Dashboard-Smoke nachziehen | Client QA | yes |
| Missions sichtbar | YELLOW | Mind. 5-10 Demo-Missionen als published sichtbar | BETA1_SEED_DEMO_CONTENT_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Published-Sichtbarkeit noch nicht als Run-Evidence belegt | Nach Seed-Run Mission-Visibility belegen | Admin operator | yes |
| XP Wallet/Ledger Anzeige | YELLOW | Wallet/Ledger read-only Projektion konsistent; kein Crash | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Aktueller Konsistenznachweis fehlt | Wallet/Ledger Smoke inkl. Ergebnis protokollieren | Client QA + Admin operator | yes |
| Guardian/Child Boundary | YELLOW | Child nur unter Guardian-Kontext; kein Child-Standalone Login | WELLFIT_BETA1_SCOPE.yaml; BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md | Laufender Execution-Nachweis fehlt | Guardian/Child Boundary-Tests dokumentieren | Safety owner + QA | yes |
| Permission/Error Handling | YELLOW | Permission denied ohne Stacktrace/ohne sensible Details | BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Kein aktueller denied-flow Nachweis | Denied-flow Smoke erneut und mit Evidence loggen | Admin operator + QA | yes |
| Firestore/Functions Guardrails | GREEN | Keine neuen Functions/Rules fuer Pilotfreigabe noetig; Server bleibt Authority | WELLFIT_BETA1_SCOPE.yaml; BETA1_PILOT_EVIDENCE_RUN.md | none | Guardrails pro Folge-PR bestaetigen | Tech lead | yes |
| Emulator/CI Evidence | GREEN | CI/Emulator gruen fuer Beta-1 fokussierte Suites | BETA1_EMULATOR_VERIFICATION.md | none | CI als primaeres Gate beibehalten | QA/CI owner | yes |
| Mobile Device Evidence | TBD | Android Chrome + iPhone Safari Smoke Nachweis | BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Device-Smoke nicht durchgefuehrt/nicht nachgewiesen | Device-Run verpflichtend vor Wave 1 | QA | yes |
| Support/Incident Runbook | YELLOW | Definierte Kanaele, Severity-Logik, Stop Conditions, Incident Template + benannte Pilot-Kontaktrolle | BETA1_PILOT_SUPPORT_RUNBOOK.md; BETA1_PILOT_EVIDENCE_RUN.md | Support-Kontakt weiterhin placeholder | Placeholder vor Wave 1 durch verantwortliche Rolle ersetzen | Support operator | yes |
| Privacy/Consent/Legal wording | YELLOW | Consent/Privacy wording geprueft fuer Beta-1 Kommunikation | WELLFIT_BETA1_SCOPE.yaml; BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Abnahme-/Review-Nachweis fehlt | Privacy/Legal wording review dokumentieren | Legal/Privacy owner | yes |
| Reality Glitch Safety | YELLOW | Sichere Locations, admin cancel readiness, klare Safety-Kommunikation | WELLFIT_BETA1_SCOPE.yaml; BETA1_SEED_DEMO_CONTENT_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Konkrete Safety-Execution fehlt | Safety-Dry-Run mit Evidence nachziehen | Safety owner + Admin operator | yes |
| Shop/Inventory WFXP-only | GREEN | Shop bleibt WellFit-XP only, kein Real-Money/IAP | WELLFIT_BETA1_SCOPE.yaml; BETA1_SEED_DEMO_CONTENT_PLAN.md | none | WFXP-only bei Smoke bestaetigen | Product owner + QA | yes |
| No Blockchain/Token/Cashout | GREEN | Keine Blockchain/Token/Cashout/Payment Felder in Beta-1 Flows | WELLFIT_BETA1_SCOPE.yaml; BETA1_PILOT_EVIDENCE_RUN.md | none | Jede Abweichung als P0 Stop Condition behandeln | Product owner | yes |
| Tester Onboarding | YELLOW | Platzhalter-Testerrollen + Rollout-Kommunikation + Support-Kontakt | BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md; BETA1_PILOT_EVIDENCE_RUN.md | Kein abgeschlossener Onboarding-Dry-Run belegt | Onboarding-Checklist mit Placeholder-Keys durchgehen | Rollout owner | yes |
| Stop Conditions | GREEN | Stop-Regeln dokumentiert und kommunikativ vorbereitet | BETA1_PILOT_SUPPORT_RUNBOOK.md; BETA1_PILOT_EVIDENCE_RUN.md | none | Vor Start Stop-Template Team-Ready bestaetigen | Incident commander | yes |

## 4) Wave-1-Startregel

**Wave 1 darf nur starten, wenn alle Kategorien mit `Must be GREEN before Wave 1 = yes` den Status GREEN haben.**

## 5) Aktueller Entscheidungsstatus

**NO-GO (Stand 2026-05-21)**, da mehrere Must-be-GREEN-Kategorien noch YELLOW/TBD sind (u. a. Manual Seed Run, Mobile Device Evidence, Missions sichtbar, XP Wallet/Ledger, Guardian/Child Boundary, Privacy/Consent/Legal wording).

## 6) Governance-Hinweise fuer den Evidence-Run

- Keine Runtime-Produktlogik aendern.
- Keine neuen Firebase Functions.
- Keine Firestore Rules Aenderungen.
- Keine Deploys.
- Keine Production Firebase IDs.
- Keine echten Tester-E-Mails oder personenbezogenen Daten.
- Finale Autoritaet bleibt serverseitig.
