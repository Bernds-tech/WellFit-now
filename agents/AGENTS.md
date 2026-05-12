# WellFit AGENTS.md

## Zweck

Diese Datei ist die verbindliche Arbeitsanweisung fuer KI-, Codex-, Copilot- oder Self-Hosted-Agenten im WellFit-Repository.

Das bestehende Projekt wird nicht neu gestartet. Es wird als Baseline uebernommen und kontrolliert erweitert.

## Grundprinzip

```txt
Ziel verstehen -> Konzept pruefen -> Struktur ableiten -> Seiten erfassen -> Aufgaben erstellen -> Code bauen -> automatisch testen -> Fehler beheben -> Dokumentation aktualisieren -> Preview liefern -> Nutzerfeedback auswerten -> weiter optimieren
```

## Source-of-Truth vor jeder Arbeit

Vor jeder strukturellen oder produktrelevanten Arbeit lesen:

- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/TODO_INDEX.md`
- `todolist/TODO_CONSOLIDATION.md`
- `todolist/NEXT_ACTIONS.md`
- `todolist/PROJECT_STRUCTURE.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `todolist/LAST_BUILD_STATUS.md`
- `scripts/wellfit-dev-agent/wellfit-agent.config.json`
- `agents/modes/stufe-4.md`
- `agents/self-check.md`
- `project-register/routes.json`
- `project-register/apis.json`
- `project-register/features.json`
- `project-register/todos.json`
- `project-register/decisions.json`
- `project-register/cross-references.json`

## Stufe 4

Wenn Bernd `Stufe 4` schreibt, gilt automatisch:

- Agent + Selbstkorrektur + Nebenseiten-Crawl
- alle betroffenen Seiten, Nebenseiten, APIs und Produktbereiche erfassen
- bestehende Todos pruefen, bevor neue Aufgaben angelegt werden
- Fehler sammeln, selbst korrigieren und Tests wiederholen
- Dokumentation, Todos, Decisions, Cross-References und Progress Log aktualisieren
- Preview/Pull Request liefern
- nie automatisch live deployen

Details stehen in `agents/modes/stufe-4.md`.

## Arbeitsregeln

- Niemals direkt auf `main` arbeiten.
- Immer Branch/PR-Workflow nutzen.
- Bestehende Todo-, Architektur-, Roadmap- und Statusdateien nicht loeschen.
- Veraltete Inhalte markieren, nicht entfernen.
- Doppelte Aufgaben markieren und auf fuehrende Aufgabe verweisen.
- Bestehende Module erweitern, keine Parallelmodule bauen.
- Bei Unsicherheit Decision Log aktualisieren statt wild zu raten.
- Keine Produktlogik ohne dokumentierten Zusammenhang veraendern.

## Sicherheitsgrenzen

- Kein Production Deploy ohne ausdrueckliche Freigabe.
- Keine Secrets ins Frontend oder in Dokumente schreiben.
- Keine echten Token, NFTs, WFT, Wallets, Auszahlungen oder echten Kaeufe aktivieren.
- Punkte, XP, Rewards, Einsaetze und Mission Completion duerfen nicht clientseitig autorisiert werden.
- Firebase-/Firestore-Regeln nur mit Guardrail- und Emulator-Testplan veraendern.

## Abschlussbedingungen

Ein Agent darf nur abschliessen, wenn mindestens gilt:

- Ziel verstanden und dokumentiert
- betroffene Routen/APIs/Features erfasst
- Self Check ausgefuehrt
- relevante Projektregister aktualisiert
- Tests/Quality Gate ausgefuehrt oder sauber als Blocker dokumentiert
- Preview/PR oder klarer naechster Schritt dokumentiert

## Blocker-Regel

Bei echten Blockern muss ein Eintrag in `project-register/decisions.json` oder `project-register/progress-log.json` entstehen mit:

- Blocker-ID
- Ursache
- betroffene Dateien/Seiten/APIs
- Optionen
- Empfehlung
- benoetigte Entscheidung
