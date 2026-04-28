# WellFit – AR Riddle Firestore Security Plan

Stand: 2026-04-28
Status: Security- und Datenmodellplan fuer AR-Fragen, Raetselrallyes und Punktealgorithmus

## Zweck

Dieser Plan beschreibt die spaeteren Collections und Schreibrechte fuer AR-Raetselrallyes.

Ziel:

```txt
Client darf Evidence senden.
Client darf niemals Reward Ledger schreiben.
Client darf niemals Punkte/XP autorisieren.
```

## Vorgeschlagene Collections

```txt
arQuestionEvidence
arQuestionMemory
arRewardPreviews
arRewardLedgerEvents
arRallyDrafts
```

## arQuestionEvidence

Zweck:

```txt
Antwort-/Objekt-/Kontext-Evidence aus Mobile, Unity oder Web-Fallback.
```

Schreibrechte v1:

```txt
Client: create nur fuer eigene userId und nur mit rewardAuthorized=false, missionCompletionAuthorized=false, pointsGranted=false
Server: read/write
```

Keine direkten Punktefelder erlauben ausser `pointsGranted=false`.

## arQuestionMemory

Zweck:

```txt
Wiederholschutz, Novelty, Difficulty, Anti-Farming.
```

Schreibrechte:

```txt
Client: kein write
Server: read/write
```

Client darf diese Daten hoechstens ueber sichere API-Zusammenfassungen sehen.

## arRewardPreviews

Zweck:

```txt
Serverseitige Vorschau, was eine Antwort ungefaehr wert sein koennte.
Noch keine Buchung.
```

Schreibrechte:

```txt
Client: kein write
Server: create/update
Client: read nur eigene Preview, falls UX notwendig
```

## arRewardLedgerEvents

Zweck:

```txt
Finale serverseitige Punkte-/XP-Buchung.
```

Schreibrechte:

```txt
Client: kein write
Server: create only
```

Client-Schreibversuch muss in Emulator-Tests `PERMISSION_DENIED` ergeben.

## arRallyDrafts

Zweck:

```txt
KI-/Server-generierte Rallye-Vorschlaege im Nahbereich des Nutzers.
```

Schreibrechte:

```txt
Client: request ueber API/Function
Server: create/update
Client: read eigene oder freigegebene Drafts
```

## Sicherheitsregeln

Immer pruefen:

```txt
request.auth != null
request.auth.uid == resource.userId oder request.resource.data.userId
keine rewardAuthorized=true
keine missionCompletionAuthorized=true
keine pointsGranted=true im Evidence Event
keine clientseitigen Punkte-/XP-Felder im Ledger
```

## Emulator-Testfaelle

- [ ] Client kann eigene Evidence mit Flags false erstellen.
- [ ] Client kann Evidence mit `rewardAuthorized=true` nicht erstellen.
- [ ] Client kann Evidence mit `pointsGranted=true` nicht erstellen.
- [ ] Client kann `arQuestionMemory` nicht schreiben.
- [ ] Client kann `arRewardPreviews` nicht schreiben.
- [ ] Client kann `arRewardLedgerEvents` nicht schreiben.
- [ ] Server/Admin kann Ledger Event schreiben.

## Bezug zu G1

Diese Regeln folgen G1:

```txt
Punkte zuerst
Server-Ledger zuerst
Anti-Cheat zuerst
Beta-Test zuerst
Blockchain danach
```

## Naechste Schritte

- [ ] Bestehende Firestore Rules pruefen.
- [ ] Konkrete Rule-Blöcke fuer neue Collections entwerfen.
- [ ] Emulator-Testplan erweitern.
- [ ] Erst danach produktive Reward-Preview-Funktion bauen.
