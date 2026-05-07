# TODO INDEX - WELLFIT

## Zweck
Diese Datei ist der zentrale Index fuer alle TODO-Dateien, Arbeitslisten, Prompts und Querverweise im WellFit-Projekt.

Ziel:
- jede TODO-Datei auffindbar machen
- Verweise zwischen TODOs dokumentieren
- verhindern, dass Aufgaben vergessen werden
- spaeteren KI-/Codex-Sessions sofort zeigen, wo was steht

## Wichtige Regel
Keine TODO-Datei loeschen. Wenn eine Datei veraltet oder doppelt ist, hier markieren und auf die fuehrende Datei verweisen.

## Zentrale TODO- und Steuerdateien

| Datei | Zweck | Verweise |
|---|---|---|
| `todolist/MASTER_PROMPT_FOR_AI.md` | zentrale Arbeitsanweisung fuer KI/Codex | verweist auf `NEXT_ACTIONS.md`, `PROJECT_STRUCTURE.md`, `TODO_CONSOLIDATION.md`, `TODO_INDEX.md` |
| `todolist/NEXT_ACTIONS.md` | operative Aufgaben bis Beta | verweist auf alle Bereichs-TODOs |
| `todolist/TODO_CONSOLIDATION.md` | Konsolidierung alter TODOs ohne Loeschung | verweist auf Alt-TODOs, sobald gefunden |
| `todolist/PROJECT_STRUCTURE.md` | Datei- und Ordneruebersicht | verweist auf gebaute Bereiche und Feature-Dateien |
| `todolist/DONE_LOG.md` | erledigte Arbeiten | verweist auf geaenderte Dateien und abgeschlossene Aufgaben |
| `todolist/ARCHITECTURE_RULES.md` | Skalierbarkeit und kleine Dateien | verweist auf Struktur- und Feature-Entscheidungen |
| `todolist/DATABASE_PLAN.md` | Datenbankplanung | verweist auf Missionen, Nutzer, KI-Buddy, Wallet, Gamification |

## Noch zu uebernehmende Alt-TODOs
Status: zu pruefen.

Die vorhandenen alten kleineren TODO-Dateien muessen durch lokalen Scan oder Codex vollstaendig gefunden und hier aufgenommen werden.

Fuer jede gefundene Alt-TODO-Datei eintragen:

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `pfad/datei.md` | offen / erledigt / duplikat / veraltet / zu pruefen | Kurzbeschreibung | Ziel-Datei | uebernehmen / markieren / referenzieren |

## Querverweis-Regel
Jede wichtige TODO-Datei soll enthalten:
- Link zur fuehrenden Datei
- Link zu verwandten TODOs
- Link zu betroffenen Code-Dateien
- KI-Fortsetzungs-Prompt
- Status: offen, in Arbeit, erledigt, duplikat, veraltet oder zu pruefen

## KI-Fortsetzungs-Prompt
Lies diesen Index zuerst, wenn du mit TODOs arbeitest. Suche danach alle TODO-Dateien im Repository. Ergaenze gefundene Dateien in diesem Index. Uebertrage wichtige offene Aufgaben nach `NEXT_ACTIONS.md`. Loesche keine TODO-Dateien. Markiere doppelte oder veraltete Inhalte nur und setze Verweise auf die fuehrende Datei.
