# WellFit PR Post-Creation Mergeability Guard

Stand: 2026-05-16

## Zweck

Der WellFit PR Post-Creation Mergeability Guard verhindert, dass kuenftige WellFit-Agenten nach dem Erstellen eines Pull Requests stoppen, ohne den frisch erstellten PR auf Mergeability, Required Checks, geschuetzte Pfade, Auto-Merge-Report, Auto-Repair-Report, PR-Review-Policy und Task-/Work-Log-Evidence zu pruefen.

Diese erste Version ist **report-only / policy-only**. Sie aktiviert keinen echten Auto-Merge, keine Self-Approval, kein Deployment und keine unbeschraenkte Auto-Reparatur.

## Fuehrende Dateien

- Maschinenlesbare Policy: `project-register/pr-post-creation-guard.json`
- Validator: `scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs`
- Bestehende PR-Review-Policy: `project-register/pr-review-policy.json`
- Auto-Merge-Report: `project-register/auto-merge-policy.json` und `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`
- Auto-Repair-Report: `project-register/auto-repair-policy.json` und `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs`
- Task-/Work-Log-Policy: `project-register/task-status-policy.json` und `scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs`

## Pflichtablauf nach PR-Erstellung

Nach dem Erstellen eines PRs muss ein Agent im PR-Bericht oder Handoff mindestens dokumentieren:

1. PR-URL oder PR-Nummer existiert.
2. Source Branch ist nicht `main`.
3. GitHub-Mergeability wurde nach der PR-Erstellung geprueft.
4. Required Workflow-/Check-Status wurde nach der PR-Erstellung geprueft.
5. Changed Files sind gelistet.
6. Protected Paths und geschuetzte Themen sind geprueft.
7. Auto-Merge-Eligibility wurde report-only gemeldet.
8. Auto-Repair-Decision wurde report-only gemeldet.
9. PR-Review-Policy wurde report-only gemeldet.
10. Task-Status-/Work-Log-Evidence ist vorhanden oder explizit begruendet deferred.
11. Die naechste empfohlene Aktion ist klar benannt.

## Mergeability- und Check-Status

Die Policy unterscheidet die Mergeability-Zustaende `mergeable`, `not_mergeable`, `unknown_pending_github_calculation`, `dirty_conflict`, `blocked_by_checks`, `blocked_by_review`, `blocked_by_policy` und `replaced`.

Check-Status werden als `success`, `failure`, `pending`, `skipped`, `missing` oder `unknown` gemeldet.

## Verhalten bei Problemen

Wenn ein neuer PR nicht mergeable oder nicht gruen ist, muss der Agent die Ursache klassifizieren:

- **Green handoff:** PR ist mergeable und Required Checks sind erfolgreich oder bewusst nicht erforderlich.
- **Safe repair guidance:** Nur bei expliziter Erlaubnis und nur fuer docs/register-only Metadatenprobleme wie Work-Map-/TODO-Index-Pointer, KI-Fortsetzungs-Prompt in neu hinzugefuegten Architekturdocs, JSON-Formatierung, Markdown-/Whitespace-Probleme oder fehlende Progress-/Work-Log-Evidence in erlaubten Dateien.
- **Replacement PR strategy:** Wenn der alte Branch nicht sicher repariert werden kann, darf eine Ersatz-PR-Strategie beschrieben werden. Die Ersatz-PR muss von aktuellem `main` starten, den genehmigten Deliverable-Scope erhalten, die ersetzte PR nennen und darf keinen Runtime-/Protected-Scope ausweiten.
- **Human review stop:** Sofort stoppen, wenn Runtime-Code, geschuetzte Pfade, Unity/PR #13, Token/NFT/Wallet/Payment/Betting/Economy Authority, Reward-/Mission-Completion-Authority, Health/Child/Location/Privacy/Legal/Compliance oder andere Source-of-Truth-Entscheidungen betroffen sind.

## PR #93 Lernpunkt

Wenn ein Fall wie PR #93 erneut auftritt und der PR nach Erstellung nicht mergeable ist, darf der Agent nicht mit einem blossen PR-Link stoppen. Er muss den Post-Creation Guard ausfuehren oder die entsprechenden Felder manuell berichten, den Konflikt/check failure klassifizieren und dann:

1. bei reinen docs/register-Metadatenproblemen eine erlaubte sichere Reparatur nur dann vorschlagen oder ausfuehren, wenn die Session dies explizit erlaubt,
2. bei nicht sicher reparierbarem Branch eine Replacement-PR-Strategie von aktuellem `main` beschreiben,
3. bei Runtime-/Protected-/Compliance-/Unity-/PR-#13-Beruehrung fuer Human Review stoppen.

## Nicht autorisierte Aktionen

Der Guard verbietet ausdruecklich:

- Auto-Merge,
- Self-Approval,
- Deployment,
- Protected Runtime Repair,
- Bypassing failed checks,
- Schliessen von PR #13,
- Aenderungen an Unity-Dateien,
- Aenderungen an Repository Settings.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/pr-post-creation-guard.json`, `project-register/pr-review-policy.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json` und `project-register/task-status-policy.json`. Nach dem Erstellen eines PRs muss der PR Post-Creation Mergeability Guard report-only beruecksichtigt werden: PR-URL/Nummer, Branch, Mergeability, Required Checks, Changed Files, Protected Paths, Auto-Merge-Report, Auto-Repair-Report, PR-Review-Policy, Task-/Work-Log-Evidence und Next Action berichten. Nicht mergen, nicht approven, nicht deployen, keine Unity-/PR-#13- oder Runtime-/Protected-Reparaturen ausfuehren und keine parallele Agent-Architektur anlegen.
