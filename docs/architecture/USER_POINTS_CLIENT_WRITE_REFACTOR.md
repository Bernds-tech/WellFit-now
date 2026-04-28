# WellFit – User Points Client Write Refactor

Stand: 2026-04-28
Status: Security-Risikoanker fuer spaetere Firestore-Rules-Haertung

## Zweck

In den aktuellen `firestore.rules` sind in `/users/{userId}` noch alte client-writable Felder sichtbar, darunter:

```txt
points
xp
level
energy
stepsToday
lastMissionCompletedAt
```

Das ist fuer MVP-/UI-Prototypen historisch entstanden, widerspricht aber langfristig der verbindlichen G1-Regel:

```txt
Punkte zuerst
Server-Ledger zuerst
Anti-Cheat zuerst
Beta-Test zuerst
Blockchain danach
```

## Problem

Langfristig duerfen Nutzer keine produktkritischen Economy-Felder direkt im eigenen User-Dokument schreiben.

Nicht erlaubt im Zielsystem:

```txt
Client erhoeht points
Client erhoeht xp
Client setzt level
Client setzt reward-/mission-completion-relevante Felder
Client schreibt Economy-Fortschritt ohne Serverpruefung
```

## Warum wichtig fuer AR-Riddle

AR-Riddle wurde bereits so geplant, dass Evidence, Question Memory, Reward Preview und Ledger getrennt bleiben.

Wenn `/users.points` client-writable bleibt, koennte spaeter trotzdem ein Umweg entstehen:

```txt
AR-Frage beantwortet -> Client schreibt points direkt in users/{userId}
```

Dieser Pfad muss spaeter geschlossen werden.

## Zielarchitektur

```txt
Client sendet Evidence
Server prueft Evidence/Policy/Caps/Risk
Server schreibt RewardLedgerEvent
Server aktualisiert User-Punkte/XP oder aggregierte UserStats
Client liest Ergebnis
```

## Migrationsstrategie

Stufe 1 – Dokumentieren und Tests vorbereiten:

- [x] Risikoanker dokumentieren.
- [ ] Emulator-Test fuer direkte User-points-Updates vorbereiten.
- [ ] Alle UI-Stellen finden, die `users.points`, `xp`, `level`, `energy` direkt schreiben.

Stufe 2 – Serverpfad einfuehren:

- [ ] Serverfunktion fuer Punkte-/XP-Updates definieren.
- [ ] Ledger-Event als Quelle der Wahrheit einfuehren.
- [ ] UserStats als abgeleitete Ansicht definieren.

Stufe 3 – Rules haerten:

- [ ] `points`, `xp`, `level`, `energy` aus client-writable Keys entfernen.
- [ ] Client-Update-Versuche im Emulator mit PERMISSION_DENIED erwarten.
- [ ] Nur Server/Admin darf Economy-Felder schreiben.

## Betroffene Bereiche

```txt
firestore.rules
users/{userId}
userLevels/{userId}
userDailyStreaks/{userId}
missionRewardEvents
AR-Riddle Reward Ledger
Tagesmissionen MVP-Reward-UI
```

## Harte Grenze

Keine neue Funktion darf sich auf clientseitige Punkte-/XP-Schreibrechte verlassen.

Neue Features muessen sofort serverseitig oder preview-only geplant werden.
