# Stufe 4 - Agent + Selbstkorrektur + Nebenseiten-Crawl

## Kurzbefehl

Wenn Bernd `Stufe 4` schreibt, gilt dieser Modus automatisch.

## Bedeutung

```txt
Agent + Selbstkorrektur + Nebenseiten-Crawl
```

Die KI arbeitet nicht nur eine Einzeldatei ab. Sie ordnet den Auftrag zuerst einer klar begrenzten Stufe-4-Teilstufe zu und fuehrt nur die dort erlaubten Schritte aus.


## Teilstufen und Policy-Dateien

`Stufe 4` ist ein Sammelmodus mit praezisen Teilstufen. Vor jeder Arbeit muss die passende Policy-Datei im `project-register/` gelesen und im Abschlussbericht genannt werden.

| Teilstufe | Bedeutung | Zustaendige Policy-Datei im `project-register/` | Ergebnis |
| --- | --- | --- | --- |
| `Stufe 4A` | Autonome Analyse und Task-Erstellung | `project-register/agent-autopilot.json` | Report mit Task-Vorschlag, Risiko, Definition-of-Done, betroffenen Dateien und Stop-Bedingungen; keine automatischen Datei-Aenderungen. |
| `Stufe 4B` | Autonome Docs-/Register-Aenderungen mit PR | `project-register/agent-workflows.json` | Reviewbarer Commit/PR fuer Dokumentation, Register oder Report-only-Governance; keine Runtime-Produktlogik. |
| `Stufe 4C` | Begrenzte Runtime-Aenderungen mit Allowlist | `project-register/approved-agent-build-runner-policy.json` | Kleinster erlaubter Runtime-Diff nur innerhalb einer expliziten Allowlist und nur mit passenden Checks. |
| `Stufe 4D` | Sichere Auto-Reparaturen | `project-register/auto-repair-policy.json` | Eng begrenzter Fix fuer einen validierten Fehler; keine Testentfernung, keine breiten Refactors. |
| `Stufe 4E` | Merge-Empfehlung | `project-register/auto-merge-policy.json` | Report-only Merge-Einschaetzung fuer menschliche Entscheidung; kein automatisches Mergen. |
| `Stufe 4F` | Auto-Merge, derzeit deaktiviert | `project-register/auto-merge-policy.json` | Kein aktiver Ausfuehrungsmodus; Auto-Merge bleibt deaktiviert, bis der Repository Owner ihn ausdruecklich aktiviert. |

## Pflichtablauf

1. Ziel verstehen
2. Konzept pruefen und verbessern
3. bestehende Dokumentation und Source-of-Truth-Dateien lesen
4. Struktur ableiten
5. betroffene Seiten, Nebenseiten, APIs und Produktbereiche identifizieren
6. bestehende Todos pruefen
7. neue Aufgaben nur dann anlegen, wenn keine passende Aufgabe existiert
8. Querverweise setzen
9. Code bauen oder aendern, falls der Auftrag Codearbeit umfasst
10. Tests ausfuehren
11. Fehler sammeln
12. Fehler selbst analysieren und korrigieren
13. Tests wiederholen
14. Self Check ausfuehren
15. Dokumentation aktualisieren
16. Preview/Pull Request liefern
17. auf manuelle Freigabe fuer Livegang warten

## Stop-Regeln

Der Agent darf nicht stoppen, nur weil eine Datei geaendert wurde.

Der Agent darf erst stoppen, wenn eine der folgenden Bedingungen gilt:

### Erfolgreich

- definierter Zielzustand erreicht
- alle betroffenen Seiten/API-Bereiche erfasst
- relevante Tests ausgefuehrt oder begruendet nicht ausfuehrbar
- Fehler behoben oder dokumentiert
- Projektregister aktualisiert
- Self Check abgeschlossen
- Pull Request/Preview oder klarer naechster Schritt dokumentiert

### Echter Blocker

- fehlende Produktentscheidung
- fehlende Credentials oder Testuser
- externe Plattform nicht erreichbar
- widerspruechliche Anforderungen
- Sicherheitsregel verhindert gewuenschte Umsetzung

Blocker muessen in `project-register/decisions.json` oder `project-register/progress-log.json` dokumentiert werden.

## Nebenseiten-Crawl

Bei Stufe 4 muessen nicht nur Hauptseiten, sondern auch Nebenseiten und abhaengige APIs beruecksichtigt werden.

Pflichtquellen:

- `project-register/routes.json`
- `project-register/pages.json`
- `project-register/apis.json`
- `project-register/features.json`
- vorhandene Next.js App-Routen
- vorhandene API-Routen

## Dokumentationspflicht

Bei relevanten Aenderungen aktualisieren:

- `project-register/todos.json`
- `project-register/decisions.json`
- `project-register/cross-references.json`
- `project-register/progress-log.json`
- passende `todolist/*`-Dateien, sofern sie fuehrend sind

## Sicherheitsgrenze

Stufe 4 bedeutet nicht Production-Autonomie.

Verboten ohne ausdrueckliche Freigabe:

- Production Deploy
- Firebase-Rules-Haertung ohne Testplan
- echte Punkte-/Reward-Autoritaet aktivieren
- Token/WFT/NFT/Wallet/echte Kaeufe aktivieren
- Secrets veraendern oder offenlegen
- bestehende Todo- oder Roadmap-Dateien loeschen

## Ergebnisformat im Pull Request

Jeder Stufe-4-PR muss enthalten:

- Ziel
- betroffene Routen
- betroffene APIs
- betroffene Features
- aktualisierte Registerdateien
- durchgefuehrte Tests
- Self-Check-Ergebnis
- bekannte Restrisiken
- Preview-/Testhinweise
