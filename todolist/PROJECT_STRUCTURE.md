# PROJECT STRUCTURE - WELLFIT

## Zweck
Diese Datei ist die zentrale Orientierung fuer Ordner, Dateien und gebaute Bereiche im WellFit-Projekt.

Sie soll jeder KI- oder Codex-Session helfen, schnell zu verstehen:
- wo welche Dateien liegen
- welche Bereiche bereits existieren
- wo neue Funktionen eingebaut werden sollen
- welche Dateien nicht geloescht werden duerfen
- welche Bereiche noch offen sind

## Wichtige Regel
Diese Datei wird laufend erweitert. Nichts loeschen, was noch relevant sein koennte. Veraltete Informationen lieber als `veraltet`, `offen` oder `zu pruefen` markieren.

## Bekannte zentrale Ordner

### `todolist/`
Projektgedaechtnis, Aufgaben, Prompts, Entscheidungen und Logs.

Wichtige Dateien:
- `MASTER_PROMPT_FOR_AI.md` - zentrale Arbeitsanweisung fuer KI/Codex
- `ARCHITECTURE_RULES.md` - Regeln fuer Skalierbarkeit und kleine Dateien
- `DATABASE_PLAN.md` - Datenbankplanung
- `NEXT_ACTIONS.md` - naechste Schritte bis Beta
- `DONE_LOG.md` - erledigte Arbeiten
- `PROJECT_STRUCTURE.md` - diese Strukturuebersicht
- `TODO_CONSOLIDATION.md` - Konsolidierung alter und kleiner TODO-Dateien ohne Loeschung

## TODO-Konsolidierung
Alte oder kleinere TODO-Dateien duerfen nicht geloescht werden. Sie sollen in `TODO_CONSOLIDATION.md` referenziert, markiert und in die neue Struktur uebernommen werden.

Markierungen:
- `offen`
- `erledigt`
- `duplikat`
- `veraltet`
- `zu pruefen`

## Noch zu pruefende Bereiche
Die tatsaechliche Code-Struktur muss weiter analysiert und hier nachgetragen werden.

Zu pruefen:
- Startseite / Landingpage
- Dashboard
- Navigation
- Missionen
- KI-Buddy
- Nutzerprofil / Avatar
- Wallet / Demo-Wallet
- Styles / CSS
- JavaScript / App-Logik
- Assets / Bilder / Logos
- Backend / API
- Datenbank / Datenmodelle

## Einbau-Regel fuer neue Features
Wenn eine neue Funktion gebaut wird, muss hier dokumentiert werden:
- Name des Features
- betroffene Dateien
- neuer Ordner, falls angelegt
- Status: geplant, in Arbeit, Demo, Beta, fertig
- naechster offener Punkt

## KI-Fortsetzungs-Prompt
Lies diese Datei zu Beginn jeder strukturellen Arbeit. Wenn du Dateien oder Ordner findest, die hier noch nicht dokumentiert sind, ergaenze sie. Wenn du neue Dateien anlegst oder wichtige Dateien aenderst, aktualisiere diese Strukturuebersicht. Loesche keine historischen Hinweise, sondern markiere sie bei Bedarf als veraltet oder zu pruefen.
