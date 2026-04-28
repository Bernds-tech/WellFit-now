# WellFit – AR Contextual Mission Reward Flow

Stand: 2026-04-28
Status: Architekturgrundlage fuer AR-Buddy, Raetselrallye, Objekterkennung und interne Punkteoekonomie

## Zweck

Diese Datei beschreibt, wie kontextuelle AR-Buddy-Aufgaben spaeter mit der internen Punkte-/Reward-Engine verbunden werden duerfen.

Beispiel:

```txt
Buddy entdeckt scheinbar ein Blatt
Kamera/KI erkennt das Blatt
Buddy fragt: Was ist das fuer ein Blatt?
Nutzer waehlt Antwort
Backend prueft Evidence
Reward-Algorithmus berechnet erlaubte Punkte
Server-Ledger schreibt Punkteereignis
Buddy zeigt emotionale Reaktion
```

## Harte Grenze

Nicht erlaubt:

```txt
Unity vergibt Punkte
Kamera/KI vergibt Punkte
Buddy-KI vergibt Punkte
Frontend vergibt Punkte
Mobile UI entscheidet Mission Completion
Client entscheidet Rewardhoehe
```

Erlaubt:

```txt
Unity/Kamera/Buddy/App erzeugen Events und Evidence
Backend prueft Kontext, Antwort, Ort, Wiederholung, Risiko und Caps
Reward-/Punkte-Algorithmus berechnet erlaubte Punkte
Serverseitiges Ledger schreibt Punkte-/XP-Event
```

## Datenfluss v1

```txt
1. AR-Session laeuft
2. Kamera/KI erkennt Objekt oder Kontext
3. Buddy formuliert Aufgabe
4. App zeigt Auswahl-Overlay
5. Nutzer waehlt Antwort
6. App erzeugt Evidence Event
7. Backend prueft Evidence
8. Question Memory prueft Wiederholung
9. Reward Policy berechnet Punkte/XP
10. Server-Ledger schreibt Reward Event
11. App/Buddy zeigt Ergebnis
```

## Evidence Event fuer AR-Frage

Mindestfelder:

```txt
userId
buddyId
missionId
questionId
questionType
objectType
recognizedObjectLabel
userAnswer
correctAnswer
isCorrect
locationHash oder geohash
placeContextId optional
confidence
clientTimestamp
arSessionId
markerId optional
riskSignals
```

## Question Memory / Wiederholschutz

Das System muss speichern:

```txt
questionId
questionFingerprint
objectFingerprint
locationHash
userId
timesAsked
timesAnsweredCorrectly
timesAnsweredWrong
lastAskedAt
difficultyLevel
nextAllowedAt
```

Regeln:

- gleiche Frage nicht beliebig oft farmbar
- gleiche Objektart am gleichen Ort reduziert Punkte oder erhoeht Schwierigkeit
- Wiederholung kann erlaubt sein, aber mit Variation
- bei haeufiger Wiederholung: weniger Punkte oder kein Reward
- Schwierigkeit steigt bei erneutem Auftreten

## Reward Algorithmus Input

Die Reward Engine braucht mindestens:

```txt
missionType = arRiddle | natureQuiz | locationRally | objectRecognition
baseDifficulty
userLevel
buddyLevel optional
answerCorrectness
questionNoveltyScore
locationNoveltyScore
repeatPenalty
dailyUserCap
missionTypeCap
systemReserveState
economyHealthScore
riskLevel
```

## Reward Algorithmus Output

```txt
pointsPreview
xpPreview
rewardAllowed
manualReviewRequired
capReason optional
riskReason optional
ledgerEventDraft
```

## Beispiel Blatt-Frage

```txt
recognizedObjectLabel = leaf
question = Was ist das fuer ein Blatt?
answers = Eichenblatt, Ahornblatt, Birkenblatt
correctAnswer = Ahornblatt
baseDifficulty = easy
questionNoveltyScore = high
repeatPenalty = none
riskLevel = low
```

Moegliches Ergebnis:

```txt
pointsPreview = 3
xpPreview = 5
rewardAllowed = true
```

Aber: Diese Werte kommen niemals aus Unity/Kamera/Buddy-KI, sondern nur aus der serverseitigen Reward Policy.

## Bezug zu G1

Diese Architektur folgt `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`:

```txt
Punkte zuerst
Server-Ledger zuerst
Anti-Cheat zuerst
Beta-Test zuerst
Blockchain danach
```

Die 25-Mrd.-Logik bleibt interne Punkte-/Economy-Simulation, bis die Alpha-/Beta-Testdaten stabil genug sind.

## Naechste technische Schritte

- [ ] Datentyp fuer AR Question Evidence definieren.
- [ ] Question Memory Collection planen.
- [ ] Reward Policy Input fuer AR-Raetsel definieren.
- [ ] Server-Ledger Event fuer AR-Fragen entwerfen.
- [ ] Anti-Farming-Regeln fuer Wiederholfragen definieren.
- [ ] UI bleibt Preview-only, bis Backend-Reward-Pfad existiert.
