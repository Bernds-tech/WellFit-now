# Beta-1 Pilot Evidence Gaps Close Plan

Status: docs/register-only readiness plan
Date: 2026-05-21
Branch context: `readiness/beta1-pilot-evidence-gaps-close`

## 1) Zweck

Konkreter, nachweisorientierter Plan, um die aktuell dokumentierten Wave-1-NO-GO-Luecken kontrolliert zu schliessen.

Wichtig:
- Diese Datei spricht **keine Pilotfreigabe** aus.
- Wave 1 bleibt NO-GO, bis alle Must-be-GREEN Kriterien mit realer Evidence belegt sind.
- Keine Runtime-/Functions-/Rules-Aenderung im Rahmen dieses Plan-PRs.

## 2) Gap-Tabelle

| gapId | category | currentStatus | whyNotGreen | requiredEvidence | exactManualAction | evidenceTemplateToUse | ownerPlaceholder | stopCondition | expectedResult | canBeClosedByCodexAlone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| manual_seed_execution | Execution | TBD | Seed-Run nur als Runbook/Template vorhanden, kein datierter Durchfuehrungsnachweis | Vollstaendig ausgefuellte Manual-Seed-Evidence mit pass/fail/blocked pro Schritt | Runbook Schritt fuer Schritt in nicht-produktiver Pilotumgebung durchfuehren, Evidence tabellarisch erfassen | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 1), `docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md` | `owner_admin_operator` | Permission denied, unerwartete Server-Fehler, P0/RED Safety-Risiko | Seed-Ablauf nachvollziehbar dokumentiert, offene Defekte klar markiert | no |
| android_chrome_device_evidence | Device | TBD | Kein aktueller Wave-1 Device-Smoke-Nachweis | Datierter Android+Chrome Lauf mit Route/Flow + Ergebnis + Screenshot-Referenz ohne PII | Android Chrome Testmatrix ausfuehren (Login, Dashboard, Mission visibility, Wallet/Ledger read) | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 2) | `owner_mobile_qa` | Crash, Blocker bei Kernflow, sensible Daten sichtbar | Reproduzierbarer Android Chrome Pilot-Nachweis liegt vor | no |
| iphone_safari_device_evidence | Device | TBD | Kein aktueller iPhone Safari Nachweis im Pilotkontext | Datierter iPhone Safari Lauf mit identischen Kernflows und status | iPhone Safari Smoke auf definierter OS/Safari-Version durchfuehren und erfassen | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 3) | `owner_mobile_qa` | Crash, harte UI-Blocker, Datenleck | Reproduzierbarer iPhone Safari Pilot-Nachweis liegt vor | no |
| published_missions_visibility | Mission Readiness | YELLOW | Planung vorhanden, aber kein Execution-Beleg fuer published Sichtbarkeit | Nachweis sichtbarer publizierter Missionen (Anzahl + Screens) | Nach Manual Seed im Client-Dashboard Mission-Liste pruefen und dokumentieren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 4) | `owner_admin_operator_and_client_qa` | 0 publizierte Missionen sichtbar trotz erwartetem Seed | Published Sichtbarkeit im Ziel-Setup belegt | no |
| xp_wallet_ledger_smoke | Projection Integrity | YELLOW | Feature dokumentiert, aber kein frischer Smoke-Nachweis | Read-only Wallet/Ledger Konsistenznachweis inkl. denied/no-write Verhalten | Wallet/Ledger in Pilotflow oeffnen, Werte/Rendering/Fehlerfreiheit dokumentieren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 4) | `owner_client_qa` | Inkonsistente Anzeige, Fehlerzustand, ungeplante Schreibaktion | Wallet/Ledger Read-Projektionen stabil und ohne Client-Autoritaet | no |
| guardian_child_boundary | Safety Boundary | YELLOW | Scope-Definition vorhanden, Execution-Evidence fehlt | Allowed/denied Boundary-Flows ohne Child-Standalone Login | Guardian-first Flow + Child Boundary denied/allowed testweise ausfuehren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 5) | `owner_safety_qa` | Child standalone login moeglich, Datenleck, unklare Guardian-Bindung | Boundary-Nachweis erfuellt Scope-Guardrails | no |
| privacy_consent_legal_wording | Compliance Wording | YELLOW | Required review dokumentiert, aber kein aktueller Review-Nachweis | Datierter Review-Eintrag mit freigegebenem Placeholder-Wording | Privacy/Consent/Legal Beta-Kommunikation gegen Scope/Runbook pruefen und protokollieren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 6) | `owner_privacy_legal` | Uneindeutiges Wording, fehlende Consent-Sicht, Child-Safety Konflikt | Required review nachvollziehbar abgeschlossen oder sauber blocked | no |
| support_contact_replacement | Operations | YELLOW | Support-Kontakt ist Placeholder und nicht ersetzt | Placeholder durch Rollen-Kontakt (ohne PII) inkl. Erreichbarkeitsfenster | Support-Runbook mit Rollenalias aktualisieren, keine realen personenbezogenen Kontaktdaten eintragen | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 7) | `owner_support_lead` | Nur private Personendaten verfuegbar oder ungeklaerte Eskalation | Kontakt-Placeholder als Rolle ersetzt und Wave-1 tauglich | no |
| tester_onboarding_dry_run | Rollout Ops | YELLOW | Rollout-Plan vorhanden, aber kein Dry-Run-Evidence | Abgehakter Dry-Run mit anonymen testerKeys und Ergebnis | Onboarding-Checkliste mit Placeholder-Testern durchlaufen und Ergebnis dokumentieren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 8) | `owner_rollout_ops` | PII noetig, kritische Onboarding-Blocker, Consent unklar | Onboarding-Dry-Run reproduzierbar dokumentiert | no |
| reality_glitch_safety_execution | Safety Execution | YELLOW | Safety-Rahmen geplant, aber kein manueller Sicherheitsnachweis | Eventbezogene Safety-Evidence (safe location, cancel readiness, wording) | Pro Glitch-Template Safety-Dry-Run + Cancel-Pfad dokumentieren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 9) | `owner_glitch_safety` | Unsichere Location, Cancel nicht verfuegbar, unklare Safety-Kommunikation | Safety-Execution pro geplantem Event nachweisbar | no |
| permission_denied_no_leak | Security/Errors | YELLOW | Denied-flow als Kriterium vorhanden, aber kein aktueller no-leak Nachweis | Nachweis permission denied ohne Stacktrace/sensitive leakage | Absichtlich denied Admin-/Client-Flow triggern und Response/UX dokumentieren | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (Section 10) | `owner_admin_qa` | Sensitive Daten, interne Details, stack traces im UI | Denied/no-leak Verhalten fuer Pilot nachgewiesen | no |

## 3) Umsetzungshinweise

- Alle oben gelisteten Gaps benoetigen reale Human/Manual Execution und sind daher `canBeClosedByCodexAlone = no`.
- Codex kann vorbereiten, strukturieren, validieren und dokumentieren, aber nicht echte Device-/Operator-Evidence simulieren.
- Eine spaetere Statusaenderung auf GREEN darf nur nach belegter Evidence erfolgen.
