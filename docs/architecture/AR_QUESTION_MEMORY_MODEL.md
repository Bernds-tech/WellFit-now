# WellFit – AR Question Memory Model

Stand: 2026-04-28
Status: Datenmodell-Anker fuer kontextuelle AR-Fragen, Wiederholschutz und Anti-Farming

## Zweck

Der AR-Buddy soll Fragen nicht beliebig wiederholen. Das System muss wissen, welche Frage, welches Objekt und welcher Ort bereits verwendet wurden.

Dieses Modell verhindert:

- dieselbe Blattfrage beliebig oft zu farmen
- identische Fragen am selben Ort zu oft zu stellen
- statische Aufgaben ohne Schwierigkeitserhoehung
- Punktevergabe ohne Historienbezug

## Grundsatz

Question Memory entscheidet nicht ueber Punkte.

Question Memory liefert nur Signale an die serverseitige Reward Policy:

```txt
Novelty
Wiederholung
Schwierigkeit
Cooldown
Farming-Risiko
```

## Collection: arQuestionMemory

Vorgeschlagene Felder:

```txt
memoryId
userId
buddyId optional
questionId
questionFingerprint
questionType
objectType
objectFingerprint optional
recognizedObjectLabel optional
locationHash
placeContextId optional
missionId optional
timesAsked
timesAnsweredCorrectly
timesAnsweredWrong
lastAskedAt
firstAskedAt
lastCorrectAt optional
lastWrongAt optional
difficultyLevel
nextAllowedAt
repeatPenaltyLevel
noveltyScore
riskLevel
createdAt
updatedAt
```

## questionFingerprint

Der Fingerprint soll semantisch gleiche oder sehr aehnliche Fragen zusammenfassen.

Beispiele:

```txt
Was ist das fuer ein Blatt? + Ahornblatt/Eichenblatt/Birkenblatt
Welches Blatt siehst du hier? + Ahorn/Eiche/Birke
```

Beide koennen denselben Fingerprint erhalten, wenn sie dieselbe Lernaufgabe abbilden.

## objectFingerprint

Optionaler Fingerprint fuer erkannte Objekte.

Beispiele:

```txt
leaf_maple_low_confidence
leaf_oak_high_confidence
tree_chestnut_location_park_001
```

## locationHash

Der Standort darf nicht roh und dauerhaft unnötig fein gespeichert werden.

Fuer den MVP reicht ein grober Hash oder Geohash, z. B. Park-/Gebietslevel statt exakter Privatstandort.

## Difficulty Progression

Wenn eine Frage wiederholt wird:

```txt
1. Wiederholung: andere Antwortoptionen
2. Wiederholung: Detailfrage
3. Wiederholung: schwierigere Frage oder weniger Punkte
4. zu haeufig: kein Reward oder Cooldown
```

Beispiel Blatt:

```txt
Level 1: Was ist das fuer ein Blatt?
Level 2: Woran erkennt man ein Ahornblatt?
Level 3: Welche Baumart hat gegenstaendige Blattstellung?
```

## Reward Policy Signale

Question Memory gibt an die Reward Policy:

```txt
questionNoveltyScore
locationNoveltyScore
repeatPenaltyLevel
difficultyLevel
nextAllowedAt
riskLevel
```

Die Reward Policy entscheidet daraus:

```txt
pointsPreview
xpPreview
rewardAllowed
manualReviewRequired
```

## Datenschutz

- Keine unnoetig exakten Privatstandorte speichern.
- Standortkontext nur mit Zustimmung.
- Fuer Kinder/Familien spaeter strengere Regeln.
- Fotos/Bilder nicht dauerhaft speichern, wenn nicht notwendig.
- Objektlabel und Evidence reichen fuer viele Aufgaben aus.

## Naechste Schritte

- [ ] TypeScript-Typ `ArQuestionMemory` definieren.
- [ ] Firestore-/Backend-Collection planen.
- [ ] TTL/Cooldown-Regeln definieren.
- [ ] Reward Policy Input mit Question Memory verbinden.
- [ ] Datenschutzstufe fuer Kinder-/Familienmodus definieren.
