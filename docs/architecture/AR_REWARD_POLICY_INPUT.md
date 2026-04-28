# WellFit – AR Reward Policy Input

Stand: 2026-04-28
Status: Architekturanker fuer serverseitige Punkteberechnung aus AR Evidence

## Zweck

Diese Datei beschreibt, welche Eingaben die serverseitige Reward Policy fuer AR-Buddy-Fragen und Raetselrallyes braucht.

Wichtig:

```txt
AR UI, Unity, Kamera und Buddy-KI liefern keine Punktehoehe.
Sie liefern nur Evidence und Kontext.
```

## Input: ArRewardPolicyInput

Vorgeschlagene Felder:

```txt
userId
buddyId optional
missionId
missionType
questionId
questionType
objectType optional
recognizedObjectLabel optional
answerCorrectness
baseDifficulty
userLevel optional
buddyLevel optional
questionNoveltyScore
locationNoveltyScore
repeatPenaltyLevel
dailyUserCapState
missionTypeCapState
systemReserveState
economyHealthScore
riskLevel
evidenceQuality
clientTimestamp
serverTimestamp
```

## Frage-/Aufgabentypen

```txt
objectRecognition
natureQuiz
locationRiddle
historyQuestion
museumQuest
familyRally
schoolQuiz
nutritionQuestion
movementProof
```

## Difficulty

```txt
easy
medium
hard
expert
```

Die Difficulty darf von KI vorgeschlagen werden, aber der Server muss sie pruefen oder normalisieren.

## Novelty Scores

```txt
questionNoveltyScore: 0.0 bis 1.0
locationNoveltyScore: 0.0 bis 1.0
```

Beispiele:

```txt
Neue Frage, neuer Ort -> hoch
Gleiche Frage, gleicher Ort -> niedrig
Gleiche Objektart, aber neuer Kontext -> mittel
```

## Repeat Penalty

```txt
none
low
medium
high
blocked
```

Bei `blocked` darf keine Punktevergabe erfolgen.

## Risk Level

```txt
low
medium
high
manualReview
```

Beispiele:

- zu viele gleiche Fragen in kurzer Zeit
- Standort springt unrealistisch
- Objektlabel sehr unsicher
- Antwortmuster wirkt automatisiert
- Kamera-/Evidence-Kontext unvollstaendig

## Output: ArRewardPolicyResult

```txt
pointsPreview
xpPreview
rewardAllowed
manualReviewRequired
capReason optional
riskReason optional
repeatReason optional
ledgerEventDraft
```

## Beispiel: einfache Blattfrage

Input:

```txt
missionType = natureQuiz
questionType = objectRecognition
recognizedObjectLabel = maple_leaf
answerCorrectness = correct
baseDifficulty = easy
questionNoveltyScore = 0.9
locationNoveltyScore = 0.8
repeatPenaltyLevel = none
riskLevel = low
evidenceQuality = medium
```

Moeglicher Output:

```txt
pointsPreview = 3
xpPreview = 5
rewardAllowed = true
manualReviewRequired = false
```

## Beispiel: Wiederholte Farming-Frage

Input:

```txt
recognizedObjectLabel = maple_leaf
answerCorrectness = correct
baseDifficulty = easy
questionNoveltyScore = 0.1
locationNoveltyScore = 0.1
repeatPenaltyLevel = high
riskLevel = medium
```

Moeglicher Output:

```txt
pointsPreview = 0
xpPreview = 1
rewardAllowed = false
manualReviewRequired = false
repeatReason = repeated-question-same-location
```

## Bezug zu 25-Mrd.-Punkteoekonomie

Die Reward Policy muss langfristig die interne 25-Mrd.-Punkte-/Supply-Simulation beruecksichtigen:

```txt
DailyEmissionCap
UserDailyCap
MissionTypeCap
SystemReserveState
EconomyHealthScore
```

Dadurch kann eine leichte Frage nicht einfach immer gleich viele Punkte geben, wenn Systemgesundheit, Nutzerhistorie oder Tagescaps dagegen sprechen.

## Harte Regel

Der Buddy darf sagen:

```txt
Super gemacht! Ich pruefe, was du dafuer bekommst.
```

Er darf nicht autoritativ sagen:

```txt
Du bekommst garantiert 5 Punkte.
```

Erst nach Serverantwort darf die UI anzeigen:

```txt
+3 Punkte gutgeschrieben
```

## Naechste Schritte

- [ ] TypeScript-Typ `ArRewardPolicyInput` planen.
- [ ] TypeScript-Typ `ArRewardPolicyResult` planen.
- [ ] Verbindung zu Question Memory definieren.
- [ ] Verbindung zum serverseitigen Punkte-Ledger definieren.
- [ ] Reward Preview fuer AR-Fragen als ersten sicheren Schritt planen.
