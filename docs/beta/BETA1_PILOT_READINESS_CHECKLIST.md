# Beta-1 Pilot Readiness Checklist

Status: evidence-updated checklist (closed beta wave 1)
Date: 2026-05-21
Branch context: `readiness/beta1-pilot-evidence-gaps-close`

Zweck: Operative Checkliste vor Freigabe der AT Closed Beta Wave 1 (25-50 Tester).

## Pflicht-Checks vor Testerfreigabe

- [ ] Admin Seed erledigt (manual run gemaess Runbook).
  Evidence: Runbook vorhanden, aber kein ausgefuellter Execution-Nachweis.
- [ ] Evidence Template vollstaendig ausgefuellt.
  Evidence: Template vorhanden, kein dokumentierter ausgefuellter Lauf.
- [~] 5-10 Demo-Missionen vorhanden und veroeffentlicht.
  Evidence: Plan + Templates vorhanden; Published-Sichtnachweis aus aktuellem Pilotlauf fehlt.
- [~] 3-5 Demo-Checkpoints vorhanden.
  Evidence: Planung vorhanden; kein aktueller Seed-Execution-Nachweis.
- [~] 1-3 Reality Glitch Events vorbereitet (safe locations only).
  Evidence: Scope/Plan vorhanden; Safety-Execution-Evidence fehlt.
- [~] Dashboard Read Projections geprueft (Missionen/Wallet/Ledger sichtbar).
  Evidence: Implementierung dokumentiert; aktueller Pilot-Smoke noch offen.
- [ ] Android Chrome geprueft.
  Evidence: Device-Testplan vorhanden, kein Pilotnachweis.
- [ ] iPhone Safari geprueft.
  Evidence: Device-Testplan vorhanden, kein Pilotnachweis.
- [~] Support-Kontakt festgelegt (Platzhalter durch verantwortliche Rolle ersetzt).
  Evidence: Runbook vorhanden, Kontakt weiterhin Placeholder.
- [x] Stop-Communication vorbereitet (Pilot-Pause Vorlage vorhanden).
  Evidence: Stop Conditions in Matrix + Support Runbook dokumentiert.
- [x] Keine Echtgeld-/Token-/Cashout-Kommunikation in Beta-1 Material.
  Evidence: Scope + Matrix guardrails bestaetigt.
- [~] Guardian/Child Flows nur mit Guardian-Kontext.
  Evidence: Scope-Regel vorhanden; aktueller Ausfuehrungsnachweis fehlt.
- [~] Consent/Privacy Text geprueft.
  Evidence: Safety-Guardrails vorhanden; formale Abnahme-Evidence fehlt.

## Zusatzaussagen (Safety/Governance)

- [x] WellFit-XP bleibt internal only (WFXP non-monetary).
  Evidence: `WELLFIT_BETA1_SCOPE.yaml`.
- [x] Keine Blockchain/WFT/SUI/NFT/Cashout/IAP/DePIN/PvP-Stake Erwartung in Nutzertexten.
  Evidence: Scope + Go/No-Go Guardrails.
- [x] Keine echten personenbezogenen Daten verwendet.
  Evidence: docs/register-only Evidence Run mit Placeholder-Vorgaben.
- [x] Keine clientseitige Final-Authority fuer Rewards/Mission Completion.
  Evidence: bestehende Guardrails/Runbooks bestaetigt.

## Go-Entscheidung

- [ ] Alle Must-be-GREEN Kategorien in `BETA1_PILOT_GO_NO_GO_MATRIX.md` sind GREEN.
- [x] Kein aktiver RED-Blocker offen.
- [ ] Incident Owner + Eskalationsweg sind bekannt.

## Aktueller Status

**Wave 1 ist aktuell NO-GO (Stand 2026-05-21)**, bis die offenen Evidence-Gaps aus Manual Seed Run, Device-Smoke und operativer Support-/Boundary-/Wording-Abnahme geschlossen sind.


## Gap-close Referenzen

- `docs/beta/BETA1_PILOT_EVIDENCE_GAPS_CLOSE_PLAN.md`
- `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md`
- `docs/beta/BETA1_PILOT_STOP_COMMUNICATION_TEMPLATE.md`

Hinweis: Punkte bleiben bis zu echter Human/Manual Evidence auf offen/pending und duerfen nicht kuenstlich auf GREEN gesetzt werden.
