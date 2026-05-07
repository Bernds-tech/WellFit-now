# ARCHITECTURE RULES - WELLFIT

## Ziel
WellFit muss von Beginn an skalierbar, wartbar und modular aufgebaut werden.

## Grundsatz
Keine riesigen Einzeldateien. Grosse Funktionen werden in kleine, klare Dateien, Komponenten und Module aufgeteilt.

## Aufteilung
- UI-Komponenten getrennt halten
- Logik getrennt von Darstellung halten
- Datenmodelle getrennt dokumentieren
- Konfigurationen zentral halten
- Wiederverwendbare Funktionen auslagern
- Texte und Inhalte moeglichst getrennt vom Code halten

## Empfohlene Bereiche
- app / frontend
- components
- pages
- services
- data
- database
- ai
- missions
- user
- wallet
- docs oder todolist

## Skalierungsregeln
- Jede Datei soll einen klaren Zweck haben.
- Neue Funktionen sollen nicht einfach in bestehende grosse Dateien hineingestopft werden.
- Wenn eine Datei zu gross wird, muss sie aufgeteilt werden.
- Wiederholter Code soll in gemeinsame Funktionen oder Komponenten verschoben werden.
- Demo-Funktionen muessen spaeter klar von echten Produktivfunktionen unterscheidbar sein.

## Sicherheitsregeln
- Secrets niemals im Frontend speichern.
- API-Zugriffe spaeter ueber Backend oder sichere Server-Funktionen fuehren.
- Nutzer- und Gesundheitsdaten muessen besonders geschuetzt werden.
- Datenbankzugriffe duerfen nicht direkt unsicher aus dem Client erfolgen.

## Beta-Regel
Bis zur Beta ist Geschwindigkeit wichtig, aber nicht auf Kosten der Grundstruktur. Lieber kleine stabile Schritte als grosse unkontrollierte Umbauten.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

