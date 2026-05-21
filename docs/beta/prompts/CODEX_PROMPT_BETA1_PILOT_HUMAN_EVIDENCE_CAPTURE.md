# CODEX PROMPT - Beta-1 Pilot Human Evidence Capture

## Branch-Vorschlag

`readiness/beta1-human-evidence-capture`

## Ziel

Von Human Operator (z. B. Bernd/Team) bereitgestellte Pilot-Evidence strukturiert in die Evidence-Pack-Templates eintragen und Matrix/Checklist/Summary nur anhand real nachvollziehbarer Nachweise aktualisieren.

## Pflichtregeln

- Keine Runtime-Aenderungen (`app/**`, `components/**`, `lib/**`, `functions/**` etc.).
- Keine neuen Firebase Functions.
- Keine Firestore Rules Aenderungen.
- Keine Deploys.
- Keine echten E-Mails/Namen.
- Keine PII.
- Keine Production Firebase IDs.
- Screenshots nur als Referenz (`screenshotRef`) dokumentieren; keine sensiblen Inhalte committen.
- Matrix-Status nur auf GREEN setzen, wenn Evidence wirklich vorhanden und nachvollziehbar ist.
- Bei RED/P0 sofort stoppen und als Stop-Condition dokumentieren.

## Zu aktualisierende Dateien

- `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` (mit echten Laufresultaten, aber anonymisiert)
- `docs/beta/BETA1_PILOT_EVIDENCE_SUMMARY.md`
- `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`
- `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md`
- optional: `docs/beta/BETA1_PILOT_EVIDENCE_RUN.md` (Follow-up Abschnitt)
- `project-register/agent-work-log.json`
- `project-register/progress-log.json`
- `todolist/NEXT_ACTIONS.md`
- `todolist/TODO_INDEX.md`

## Evidence-Quellen

- `docs/beta/BETA1_PILOT_EVIDENCE_GAPS_CLOSE_PLAN.md`
- `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md`
- `docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md`
- `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`
- `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md`

## Entscheidungsregel

- Wave 1 bleibt NO-GO, solange Must-be-GREEN Kriterien ohne reale Evidence sind.
- Kein künstliches GREEN fuer TBD/YELLOW ohne Nachweis.

## Output-Erwartung

- Klarer Evidence-Diff je Gap (geschlossen/offen/blocked).
- Explizite Liste: was wurde human-evidenced, was bleibt offen.
- Go/No-Go-Status mit Datum.

## Masterplan-Referenz

- `docs/beta/BETA1_AGENT_ADMIN_AND_LIVE_READINESS_MASTERPLAN.md`
- Human Evidence Capture muss vor einer Wave-1-Go-Freigabe abgeschlossen und nachvollziehbar dokumentiert sein.
