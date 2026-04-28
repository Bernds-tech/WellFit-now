# WELLFIT – Autonomes Iterieren / Micro-Task-Modus

Version: 1.0
Repository: Bernds-tech/WellFit-now
Zweck: Arbeitsweise beschleunigen, ohne Sicherheits- und Architekturregeln zu verlieren.

---

## Grundprinzip

Bei Entwicklungs-, Architektur-, UI-/UX-, Bugfix- und Roadmap-Aufgaben soll eigenstaendig in mehreren kleinen, logisch abgeschlossenen Schritten gearbeitet werden.

Nicht bei jedem kleinen Teilschritt nachfragen.

Stattdessen:

1. aktuellen Code und relevante Roadmap lesen,
2. betroffene Dateien bestimmen,
3. naechste 4 bis 8 sinnvolle Micro-Tasks planen,
4. Micro-Tasks nacheinander ausfuehren,
5. nach jedem abgeschlossenen Teilschritt Datei/Commit erzeugen,
6. relevante todolist-/Architekturdateien aktualisieren,
7. Build-/Test-/Deployment-Risiken nennen,
8. nur fragen, wenn wirklich blockiert.

---

## Wann autonom weiterarbeiten?

Autonom weiterarbeiten bei:

- kleinen Bugfixes,
- UI-/UX-Korrekturen,
- Refactorings ohne Architekturbruch,
- Komponenten-Auslagerung,
- Hook-/Helper-Verbesserungen,
- Doku-/Roadmap-Konsolidierung,
- Test-/Build-Hinweisen,
- klaren Folgefehlern aus Build oder Screenshot,
- klaren naechsten Schritten aus `todolist/J`.

---

## Wann nachfragen?

Nachfragen nur bei:

- mehreren gleichwertigen Architekturwegen,
- produktkritischen oder irreversiblen Entscheidungen,
- fehlender Freigabe oder blockiertem Zugriff,
- Kosten-/Provider-/Secret-Entscheidungen,
- Designentscheidungen, die nicht aus Roadmap oder Nutzerwunsch ableitbar sind,
- sicherheitsrelevanten Konflikten,
- rechtlichen/App-Store-/Token-/Krypto-Fragen mit Auswirkung auf Produktstrategie.

---

## Micro-Task-Regel

Lieber viele kleine Schritte als eine grosse, unuebersichtliche Aenderung.

Gute Micro-Tasks:

- eine Komponente verbessern,
- einen Hook korrigieren,
- eine Route reparieren,
- eine Doku-Datei ergaenzen,
- eine Roadmap-Datei aktualisieren,
- einen Buildfehler beheben,
- eine kleine UI-Ueberdeckung korrigieren,
- ein Issue anlegen oder aktualisieren.

Schlechte Micro-Tasks:

- riesige Monolith-Datei weiter vergroessern,
- mehrere Themen ungetrennt in einem Commit vermischen,
- sicherheitskritische Client-Logik einbauen,
- Reward-/Punkte-/Mission-Completion-Logik im Frontend autorisieren,
- Mobile-App mit Token-/Trading-/NFT-Marktplatz-Funktionen vermischen.

---

## Beschleunigungsregeln

1. Bei klarer Richtung direkt handeln.
2. Bei Buildfehlern sofort betroffene Datei analysieren und fixen.
3. Bei Screenshots zuerst sichtbaren Fehler priorisieren.
4. Bei Mobile-/AR-/Buddy-Themen parallel pruefen:
   - UI,
   - Kamera/Tracking,
   - Buddy-KI,
   - Native-AR-Zielpfad,
   - Roadmap/J-Status.
5. Bei KI-Themen parallel pruefen:
   - Frontend-Provider,
   - Backend-Endpoint,
   - Rules-Fallback,
   - Safety-Flags,
   - keine Client-Secrets.
6. Bei Unity-/ARCore-Themen parallel pflegen:
   - Scripts,
   - Runbooks,
   - Scene Setup,
   - Android Player Settings,
   - Validation Checklists,
   - Issues.
7. Nach relevanten Fortschritten `todolist/J` oder passende Architekturdatei aktualisieren.
8. Wenn eine grosse Datei blockiert, Addendum-Datei anlegen statt Arbeit zu verlieren.

---

## Harte Grenzen

Autonomie gilt nur innerhalb der WellFit-Masterregeln.

Nie autonom verletzen:

- keine clientseitige Autoritaet fuer Punkte, Rewards, Einsaetze, Jackpot, Burn, Mission Completion, Leaderboards oder Anti-Cheat,
- keine Token-/Trading-/NFT-Marktplatz-Funktionen in der Mobile App,
- keine API-/Provider-Schluessel im Frontend,
- keine medizinischen Diagnosen,
- keine harte Scham-/Drucksprache als Standard,
- keine neuen grossen Monolith-Dateien,
- kein localStorage als Hauptspeicher fuer produktkritische Daten,
- Unity meldet nur AR-Events,
- KI schlaegt vor, Backend/App entscheidet,
- Punkteoekonomie zuerst, Blockchain/WFT/NFT erst spaeter.

---

## Empfohlene Antwortform bei laufender Umsetzung

Kurz und umsetzungsorientiert:

```txt
Aktueller Fokus
Geplante Micro-Tasks 1-4
Umgesetzt
Naechster Test / Build-Hinweis
Blocker, falls vorhanden
```

Bei laengeren Arbeitsbloecken duerfen mehrere Micro-Tasks direkt nacheinander umgesetzt werden.

---

## Start-Regel fuer neue Chats

Diese Datei ist zusammen mit `todolist/CHAT_START_PROMPT.md`, `todolist/README.md` und `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` mitzudenken.

Wenn die Aufgabe Entwicklung/Architektur betrifft, gilt:

```txt
CHAT_START_PROMPT.md = Rolle, Sicherheitsrahmen, Startablauf
AUTONOMOUS_ITERATION_MODE.md = Arbeitsgeschwindigkeit und Micro-Task-Modus
J - NÄCHSTE EMPFOHLENE ARBEIT = aktueller operativer Fokus
```
