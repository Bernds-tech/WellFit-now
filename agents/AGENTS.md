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
- `agents/modes/README.md`
- `agents/modes/stufe-1.md`
- `agents/modes/stufe-2.md`
- `agents/modes/stufe-3.md`
- `agents/modes/stufe-4.md`
- `agents/modes/stufe-4-autonomous-development.md`
- `agents/self-check.md`
- `agents/failure-recovery-rules.md`
- `agents/security-rules.md`
- `agents/scalability-rules.md`
- `agents/documentation-rules.md`
- `project-register/routes.json`
- `project-register/apis.json`
- `project-register/features.json`
- `project-register/todos.json`
- `project-register/decisions.json`
- `project-register/cross-references.json`
- `project-register/product-rules.json`
- `project-register/progress-log.json`
- `project-register/agent-workflows.json`
- `project-register/wellfit-beta1-canonical-truth.json` (read-only, owner-only changes)
- `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md` (read-only, owner-only changes)
- `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md` (read-only, owner-only changes)

## Arbeitsstufen

- Stufe 1 = Analyse + Bestandsaufnahme + Dokumentation, ohne Codeaenderung
- Stufe 2 = kleine sichere Aenderungen + Dokumentation + begrenzte Tests
- Stufe 3 = Code-/UI-/Feature-Aenderung + Tests + Dokumentation + Preview
- Stufe 4 = autonom arbeiten, Nebenseiten pruefen, Fehler beheben, dokumentieren, Preview liefern, nicht live schalten

## Stufe 4

Wenn Bernd `Stufe 4` schreibt, gilt automatisch:

- Agent + Selbstkorrektur + Nebenseiten-Crawl
- alle betroffenen Seiten, Nebenseiten, APIs und Produktbereiche erfassen
- bestehende Todos pruefen, bevor neue Aufgaben angelegt werden
- Fehler sammeln, selbst korrigieren und Tests wiederholen
- Dokumentation, Todos, Decisions, Cross-References und Progress Log aktualisieren
- Preview/Pull Request liefern
- nie automatisch live deployen

Details stehen in `agents/modes/stufe-4.md` und im phasenbasierten Workflow `agents/modes/stufe-4-autonomous-development.md`.

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

## Failure Recovery

Wenn eine Aenderung durch Tool-Limit, Dateigroesse, Sicherheitsblock, fehlende Berechtigung oder Merge-Konflikt nicht umgesetzt werden kann, darf sie nicht im Chat verloren gehen.

Pflicht:

- Blocker benennen
- betroffene Datei nennen
- exakten Patch oder gewuenschten Eintrag dokumentieren
- kleinere Alternative vorschlagen
- Issue-/PR-Kommentar, Todo, Progress-Log oder Pending-Fix-Datei anlegen
- nicht behaupten, die Aenderung sei erledigt

Details stehen in `agents/failure-recovery-rules.md`.

## Abschlussbedingungen

Ein Agent darf nur abschliessen, wenn mindestens gilt:

- Ziel verstanden und dokumentiert
- betroffene Routen/APIs/Features erfasst
- Self Check ausgefuehrt
- relevante Projektregister aktualisiert
- Tests/Quality Gate ausgefuehrt oder sauber als Blocker dokumentiert
- Preview/PR oder klarer naechster Schritt dokumentiert

## Blocker-Regel

Bei echten Blockern muss ein Eintrag in `project-register/decisions.json`, `project-register/progress-log.json`, `project-register/todos.json` oder `project-register/pending-fixes/` entstehen mit:

- Blocker-ID
- Ursache
- betroffene Dateien/Seiten/APIs
- Optionen
- Empfehlung
- benoetigte Entscheidung

## Canonical Truth Schutzregel (Owner-only)

Die Beta-1 Canonical-Truth-Dateien sind verpflichtende Lesebasis, aber fuer normale Agent-/Automation-/Codex-Tasks schreibgeschuetzt:

- `project-register/wellfit-beta1-canonical-truth.json`
- `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
- `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`

Aenderungen sind nur mit expliziter Bernd-/Owner-Freigabe in der Aufgabe erlaubt. Ohne diese Freigabe muss der Agent blockieren und den vorgeschlagenen Patch in einem nicht-geschuetzten Handoff/Register dokumentieren.

