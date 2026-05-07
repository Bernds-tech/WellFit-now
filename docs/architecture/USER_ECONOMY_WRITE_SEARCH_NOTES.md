# WellFit – User Economy Write Search Notes

Stand: 2026-04-28
Status: Suchnotiz / Security-Refactor-Vorbereitung

## Zweck

Diese Notiz dokumentiert den ersten Suchstand zu direkten Client-Schreibstellen fuer Punkte/XP/Level/Energy.

## Gepruefte Suchbegriffe

```txt
updateDoc points xp level energy increment setDoc users
points xp missionCompleted lastMissionCompletedAt userDailyMissionState userLevels userDailyStreaks
```

## Ergebnis

Die Suche zeigte als klaren Risikoanker vor allem `firestore.rules`, weil dort historisch noch user-writable Felder sichtbar sind:

```txt
points
xp
level
energy
stepsToday
lastMissionCompletedAt
```

Konkrete neue AR-Riddle-Client-Schreibstellen wurden bei dieser ersten Suche nicht gefunden.

## Bewertung

Das Risiko liegt aktuell weniger in neuem AR-Riddle-Code, sondern in alten Rules-/MVP-Pfaden, die spaeter direkte Economy-Updates ermoeglichen koennten.

## Empfehlung

Naechster Refactor-Block:

```txt
1. Alle UI-/Hook-/Helper-Dateien mit Mission-Reward-Bezug gezielt suchen.
2. Alte Tagesmissions-Client-Reward-Logik isolieren.
3. User-Economy-Felder aus client-writable Keys entfernen, sobald Server-Ledger bereit ist.
4. Emulator-Test: Client update /users.points muss PERMISSION_DENIED ergeben.
```

## Verbindung zu AR-Riddle

AR-Riddle darf diese alten Pfade nicht nutzen.

Der einzig erlaubte Zielpfad bleibt:

```txt
Evidence -> Question Memory -> Reward Policy -> Server Ledger -> UserStats
```

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

