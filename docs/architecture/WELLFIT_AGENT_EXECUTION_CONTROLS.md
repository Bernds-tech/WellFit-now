# WellFit Agent Execution Controls

Stand: 2026-05-14  
Status: aktiv / Architektur- und Governance-Dokumentation  
Fuehrende maschinenlesbare Dateien:

- `project-register/agent-task-queue.json`
- `project-register/definition-of-done.json`
- `project-register/risk-classifier.json`

## Zweck

Diese Datei erklaert die neuen maschinenlesbaren Agenten-Kontrollen fuer kuenftige Codex-/KI-Agenten. Die Kontrollen ergaenzen die bestehenden Regeln aus `AGENTS.md`, `project-register/agent-workflows.json`, `todolist/WORK_MAP.md`, `todolist/CURRENT_PROJECT_STATE.md` und `project-register/internal-sources.json`. Sie ersetzen diese Dateien nicht und erzeugen keine neue Produktarchitektur.

Ziel ist, dass ein Agent vor neuer WellFit-Arbeit automatisch beantworten kann:

1. Welche Dateien muss ich zuerst lesen?
2. Welche sichere naechste Aufgabe passt zur Anfrage?
3. Welches Risiko hat die Aufgabe?
4. Wann muss ich stoppen oder auf Planung/Dokumentation begrenzen?
5. Welche Definition of Done gilt fuer den Task-Typ?
6. Welche Checks und PR-Angaben sind Pflicht?

## Neue Register

### `project-register/agent-task-queue.json`

Dieses Register ist die maschinenlesbare Aufgaben-Warteschlange. Es enthaelt:

- globale First-Read-Dateien,
- globale Verbote und geschuetzte Bereiche,
- Standard-Checks,
- erwartete PR-Ausgabe,
- sichere Task-Kandidaten mit Prioritaet,
- erlaubte und verbotene Dateien pro Task,
- Stop-Bedingungen pro Task.

Agenten sollen immer den hoechstpriorisierten Kandidaten waehlen, der zur Nutzeranfrage passt und keine Stop-Bedingung verletzt. Wenn ein vorhandenes Thema bereits in `todolist/WORK_MAP.md` oder in `project-register/*.json` abgebildet ist, muss der Agent dort weiterarbeiten, statt eine parallele Architektur oder ein doppeltes System anzulegen.

### `project-register/definition-of-done.json`

Dieses Register definiert, was fuer verschiedene Task-Typen als erledigt gilt. Es enthaelt gemeinsame Kriterien und spezifische Done-Kriterien fuer:

- Dokumentationsaufgaben,
- Registry-Aufgaben,
- UI-Routen-Aufgaben,
- API-Routen-Aufgaben,
- Missionsaufgaben,
- Buddy-/KI-Aufgaben,
- Firebase-/Backend-Aufgaben,
- Feedback-/Analytics-Aufgaben,
- Unity-/AR-Planungsaufgaben,
- compliance-sensitive Planungsaufgaben.

Der Agent soll vor einer Aenderung einen `definitionOfDoneKey` auswaehlen und diesen im PR-Bericht nennen. Wenn kein passender Key existiert, ist das ein Signal, die Aufgabe zu stoppen oder zuerst die Governance-Dateien zu aktualisieren.

### `project-register/risk-classifier.json`

Dieses Register klassifiziert Aufgaben in vier Risikostufen:

- `low`: Dokumentation, Planung und Registry-Pflege ohne Runtime-Verhalten.
- `medium`: kleine, vorhandene UI/API/Feature-Aenderungen ohne Autoritaets- oder Compliance-Ausweitung.
- `high`: Backend, Firestore, Functions, native/AR, mission- oder reward-nahe Arbeit.
- `critical`: Token, NFT, Wallet, Payment, Betting, finale Reward-/Ledger-Autoritaet, Health/Child/Location/Privacy/Legal/Compliance, Unity/PR #13.

Die hoechste passende Risikostufe gewinnt. Kritische Treffer fuehren standardmaessig zu Stop oder Planung-only mit expliziter menschlicher Freigabe.

## Pflichtablauf fuer kuenftige Agenten

1. Branch pruefen: nicht auf `main` arbeiten.
2. First-read-Dateien aus `agent-task-queue.json` lesen.
3. Nutzerauftrag gegen `risk-classifier.json` klassifizieren.
4. Bestehende fuehrende Dateien ueber `WORK_MAP.md`, `agent-workflows.json`, `internal-sources.json`, `routes.json`, `apis.json`, `features.json` und ggf. `user-feedback.json` bestimmen.
5. Task-Kandidat aus `agent-task-queue.json` auswaehlen.
6. Definition-of-Done-Key aus `definition-of-done.json` auswaehlen.
7. Stop-Bedingungen pruefen.
8. Nur die erlaubten Dateien anfassen.
9. Pflichtchecks ausfuehren oder klare Umgebungslimitierung dokumentieren.
10. PR mit Zusammenfassung, Checks, Risiken und naechstem empfohlenem Task erstellen.

## Stop- und Planning-only-Regeln

Ein Agent muss stoppen oder auf reine Planung/Dokumentation begrenzen, wenn eine Aufgabe eines der folgenden Themen beruehrt:

- PR #13 oder `native/unity/WellFitBuddyAR`,
- Token, NFT, Wallet, Payment, Purchase, Payout, Marketplace, Staking, Presale, Trading oder WFT,
- Betting, PvP-Stakes oder Competition-Payouts,
- finale Rewards, XP, Punkte, Mission Completion, Anti-Cheat, Ledger, Inventory Unlocks oder Rare Items,
- Health, Watch, Location, Camera, Child-Safety, Biometrics, Privacy, Consent oder medical-adjacent logic,
- Legal, AGB, Datenschutz, Impressum oder Compliance-Messaging,
- Secrets oder Server-Keys im Frontend,
- doppelte Shells, Design-Systeme, APIs, Routen, Feature-Module, Datenmodelle, Ledger oder Economy-Systeme.

Planung-only ist erlaubt, wenn die Nutzeranfrage genau Planung, Architektur, Inventarisierung oder Risikoanalyse verlangt und keine Runtime- oder user-facing Compliance-Aenderung noetig ist.

## Verbindung zu bestehenden Dateien

Die neuen Kontrollen sind bewusst Querverweise, keine neue Produktlogik:

- `AGENTS.md` bleibt die menschliche Regelquelle.
- `project-register/agent-workflows.json` bleibt der maschinenlesbare Workflow-Rahmen.
- `todolist/CURRENT_PROJECT_STATE.md` bleibt die aktuelle Agent-Memory-Datei.
- `todolist/WORK_MAP.md` bleibt die fuehrende Topic-to-File-Map gegen Doppelarbeit.
- `todolist/TODO_INDEX.md` bleibt der Index fuer TODO-, Status- und Architekturdateien.
- `project-register/internal-sources.json` bleibt die Internal-Source-to-Implementation-Map.
- `project-register/routes.json`, `project-register/apis.json` und `project-register/features.json` bleiben die Route-/API-/Feature-Inventare.
- `project-register/user-feedback.json` bleibt die fuehrende maschinenlesbare Grenze fuer Feedback- und Analytics-Planung.

## Nicht-Ziele

Diese Arbeit implementiert keine Runtime-Funktion, keine neue Route, keine API, keine UI, keine Firebase-Logik, keine Unity-Logik und keine Produktentscheidung. Sie aktiviert keine Token-/NFT-/Wallet-/Payment-/Betting- oder Reward-Autoritaet und aendert keine Health-/Child-/Location-/Privacy-/Compliance-Logik.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json` und `project-register/definition-of-done.json`. Klassifiziere den Nutzerauftrag, waehle einen Task-Kandidaten und einen Definition-of-Done-Key, pruefe Stop-Bedingungen, und arbeite nur in den erlaubten bestehenden Dateien. Wenn geschuetzte Bereiche betroffen sind, stoppe oder erstelle nur Planung mit expliziten Freigabepunkten. Keine parallelen Systeme anlegen.
