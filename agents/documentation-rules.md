# WellFit Documentation Rules fuer Agenten

## Ziel

Dokumentation ist Teil des Produkts. Sie verhindert, dass Aufgaben, Entscheidungen, Sicherheitsregeln und Querverweise vergessen werden.

## Grundregeln

- Keine alten Todo-, Architektur-, Roadmap- oder Statusdateien loeschen.
- Veraltete Inhalte markieren statt entfernen.
- Doppelte Aufgaben als `duplikat` markieren und auf fuehrende Aufgabe verweisen.
- Erledigte Aufgaben im passenden Log dokumentieren.
- Neue Produktentscheidungen im Decision Log erfassen.
- Neue oder geaenderte Routen/APIs/Features im Projektregister erfassen.

## Pflichtdateien je nach Aenderung

### Neue/geaenderte Route

- `project-register/routes.json`
- `project-register/pages.json`
- `project-register/cross-references.json`

### Neue/geaenderte API

- `project-register/apis.json`
- `project-register/features.json`
- `project-register/cross-references.json`

### Neue/geaenderte Funktion

- `project-register/features.json`
- `project-register/todos.json`
- `project-register/progress-log.json`

### Offene Produktentscheidung

- `project-register/decisions.json`

### Dokumentations-/Todo-Konsolidierung

- `todolist/TODO_INDEX.md`
- `todolist/TODO_CONSOLIDATION.md`
- `todolist/NEXT_ACTIONS.md`
- `todolist/DONE_LOG.md`

## Fortschrittslog

`project-register/progress-log.json` soll nachvollziehbar speichern:

- Datum
- Issue/PR/Branch
- Ziel
- geaenderte Register
- geaenderte Produktbereiche
- Tests/Checks
- offene Risiken
- naechster Schritt

## KI-Fortsetzungs-Prompt

Jede fuehrende Dokumentationsdatei soll einen kurzen KI-Fortsetzungs-Prompt enthalten oder auf eine fuehrende Datei verweisen.
