# WellFit – ToDo Governance Contract

Version: 1.1
Stand: 2026-05-01
Zweck: Skalierbare Pflege von `todolist/` und Wichtigkeitssteuerung

---

## 1. Warum dieses Dokument existiert

`todolist/` ist die operative Quelle fuer Roadmap, Status, Handoff und Entwicklerfokus.

Wenn dieser Ordner selbst unstrukturiert waechst, werden neue Chats langsamer, Entscheidungen schwer nachvollziehbar und wichtige Sicherheitsregeln koennen uebersehen werden.

Dieses Dokument legt fest, wie die ToDo-Listen skalierbar gepflegt werden.

---

## 2. Rollen der wichtigsten Dateien

```txt
README.md
```

Index, Struktur, konsolidierte Uebersicht. Keine Detailflut.

```txt
J - NÄCHSTE EMPFOHLENE ARBEIT
```

Operativer Fokus. Zeigt aktuellen Stand, naechste Schritte, Risiken. Kein Langzeitarchiv fuer jedes Detail.

```txt
TODOLIST_IMPORTANCE_CLASSIFICATION.md
```

Priorisiert ToDo-Inhalte nach Fertigstellungsrelevanz:

```txt
P0 = testbare Alpha
P1 = gute Beta
P2 = Ausbau nach stabiler Beta
P3 = Vision / spaeter
REFERENCE = Nachschlagewerk
ARCHIVE = historisch / Status
```

```txt
A-I / G1 / K / L
```

Verbindliche Themen-Roadmaps.

```txt
*_ADDENDUM.md
```

Dauerhafte thematische Ergaenzungen, ohne Hauptdateien aufzublaehen.

```txt
todolist/status/YYYY-MM-DD-*.md
```

Zeitbezogene Handoffs, Teststaende, Arbeitspakete, Ergebnisprotokolle.

```txt
native/unity/WellFitBuddyAR/docs/*.md
```

Technische Contracts, Runbooks, Checklisten und Architekturplaene fuer Unity/AR-Buddy.

---

## 3. Regeln fuer neue Inhalte

### In `J` schreiben, wenn:

[ ] es den aktuellen Fokus betrifft.
[ ] es die naechsten 3–10 Micro-Tasks beeinflusst.
[ ] es ein Blocker, Risiko oder unmittelbarer Testschritt ist.
[ ] es nur kurz zusammengefasst werden muss.
[ ] es P0 oder direkt P1 betrifft.

### In eigene Addendum-/Contract-Datei schreiben, wenn:

[ ] es laenger als 1–2 Bildschirmseiten wird.
[ ] es ein eigenes Thema ist.
[ ] es spaeter wiederholt mitzulesen ist.
[ ] es ein technischer Vertrag, Testplan oder Refactor-Plan ist.
[ ] es `J`, `README` oder eine Roadmap-Datei unuebersichtlich machen wuerde.
[ ] es P2/P3 ist, aber als Referenz erhalten bleiben soll.

### In `status/` schreiben, wenn:

[ ] es ein zeitbezogener Arbeitsstand ist.
[ ] es ein Test-Handoff ist.
[ ] es ein Ergebnisprotokoll ist.
[ ] es nicht dauerhaft als Master-Regel gebraucht wird.

---

## 4. Namenskonventionen

```txt
A - ... bis J - ...          = Master-Roadmap-Struktur
G1 / K / L                  = verbindliche Erweiterungen mit eigenem Themenblock
*_ADDENDUM.md               = dauerhafte Ergaenzung
*_CONTRACT.md               = Vertrag / klare technische Grenze
*_PLAN.md                   = Refactor-/Architekturplan
*_CHECKLIST.md              = Test- oder Runbook-Checkliste
status/YYYY-MM-DD-*.md      = zeitbezogener Status/Handoff
```

---

## 5. Statussystem

```txt
[ ] Offen
[x] Fertig
[~] In Arbeit
[!] Blockiert / kritisch
[>] Spaeter / Backlog
```

Regel:

- nicht loeschen, wenn historisch relevant
- erledigte Punkte auf `[x]`
- spaetere Punkte auf `[>]`
- kritische Punkte auf `[!]`
- laufende Punkte auf `[~]`

---

## 6. Wichtigkeitssteuerung

Alle neuen und bestehenden Themen sollen nach `TODOLIST_IMPORTANCE_CLASSIFICATION.md` betrachtet werden.

Regel:

```txt
P0/P1 = aktiv fuer Fertigstellung relevant
P2/P3 = behalten, aber nicht Alpha blockieren
REFERENCE = bei Bedarf lesen
ARCHIVE = nicht als Sprint-Fokus behandeln
```

Neue Arbeit wird nur priorisiert, wenn sie mindestens eine dieser Fragen positiv beantwortet:

```txt
Hilft es direkt zur testbaren Alpha?
Entfernt es ein Sicherheits-/Build-/Test-Risiko?
Macht es den naechsten Unity-/Mobile-/Backend-Test moeglich?
Verhindert es spaeteren Architekturbruch?
```

---

## 7. Keine dreifache Duplikation

Informationen duerfen nicht unkontrolliert in mehreren Dateien vollstaendig kopiert werden.

Besser:

1. Detail in Spezialdatei.
2. Kurzverweis in `J`.
3. Kurzverweis im Handoff.
4. Optional Index im README/Addendum.

Schlecht:

- denselben langen Inhalt in `J`, `README`, Handoff und Status kopieren
- grosse Roadmap-Dateien immer weiter verlaengern
- alte Handoffs als Master-Regeln behandeln

---

## 8. Handoff-Regel

Ein Handoff soll enthalten:

```txt
Branch
PR
wichtige Dateien
aktueller Status
P0/P1/P2/P3-Einordnung, falls relevant
naechster Test/Build-Schritt
Risiken
konkrete Micro-Tasks
```

Ein Handoff soll nicht enthalten:

```txt
vollstaendige Kopie aller Roadmap-Dateien
zu lange historische Details
ungetestete Behauptungen
```

---

## 9. Pull-/Branch-Regel fuer ToDo-Arbeit

Bei GitHub-Aenderungen:

[ ] auf aktivem Feature-Branch arbeiten
[ ] keine direkten main-Commits
[ ] kleine klare Commits
[ ] relevante Roadmap oder Addendum aktualisieren
[ ] bei PR-Arbeit optional kompakten PR-Kommentar setzen

---

## 10. Skalierbarkeit bei neuen Themen

Wenn ein neues grosses Thema entsteht, z. B.:

```txt
Product UI
Command Contracts
Event Versioning
Companion Radius
Surface Quality
Mission Reward Ledger
Punkteoekonomie
App Store Compliance
Voice Interaction
Avatar Profile
```

Dann:

1. Wichtigkeit bestimmen: P0/P1/P2/P3/REFERENCE/ARCHIVE.
2. pruefen, ob vorhandene Datei passt.
3. falls nicht: eigene Addendum-/Contract-/Plan-Datei anlegen.
4. `J` nur kurz referenzieren, wenn P0/P1.
5. Handoff-Datei nur Dateiliste + Kurzstand ergaenzen.

---

## 11. Review-Regel

Vor groesseren ToDo-Aenderungen pruefen:

[ ] Wird eine Hauptdatei zu gross?
[ ] Ist das Thema besser als Addendum?
[ ] Muss `J` wirklich Details enthalten oder reicht ein Verweis?
[ ] Ist die Wichtigkeit P0/P1/P2/P3 klar?
[ ] Sind Security-Grenzen klar?
[ ] Ist der naechste konkrete Micro-Task erkennbar?
[ ] Ist der Status `[ ]/[x]/[~]/[!]/[>]` sauber?

---

## 12. Aktuelle Anwendung auf AR-Buddy

Fuer den aktuellen AR-Buddy-Block gilt:

```txt
J = operativer Fokus
K = Companion/Avatar-Grundlogik
L = Skalierbarkeit AR Buddy/UI/Architektur + ToDo-Skalierung
TODOLIST_IMPORTANCE_CLASSIFICATION = Fertigstellungsrelevanz
CHAT_START_SCALABILITY_ADDENDUM = neuer Chat-Kontext
README_SCALABILITY_ADDENDUM = Index-Ergaenzung
BUDDY_*_CONTRACT/PLAN/CHECKLIST = technische Details
status/*.md = zeitbezogene Handoffs
```

---

## 13. Ergebnis

`todolist/` bleibt so langfristig nutzbar:

- schnell lesbar
- modular
- thematisch getrennt
- handoff-faehig
- testfaehig
- sicherheitsbewusst
- priorisiert nach Fertigstellungsrelevanz
- skalierbar fuer viele parallele Arbeitsbereiche
