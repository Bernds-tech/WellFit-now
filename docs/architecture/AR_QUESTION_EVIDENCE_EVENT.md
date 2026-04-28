# WellFit – AR Question Evidence Event

Stand: 2026-04-28
Status: Architekturanker fuer Evidence aus AR-Buddy-Fragen

## Zweck

Dieses Dokument definiert, was aus einer AR-Buddy-Frage an das Backend gesendet werden darf.

Wichtig:

```txt
Evidence ist kein Reward.
Evidence ist kein Punkteereignis.
Evidence ist keine Mission Completion.
```

## Beispielablauf

```txt
Buddy zeigt Blattfrage
Nutzer waehlt Antwort
App erzeugt AR Question Evidence Event
Backend prueft Antwort und Kontext
Reward Policy berechnet Punkte
Server-Ledger schreibt Punkte nur bei erlaubtem Ergebnis
```

## Event Name

Vorgeschlagener interner Eventtyp:

```txt
arQuestionAnswered
```

Dieser Eventtyp ist fuer Backend-/Evidence-Pfade gedacht, nicht als Unity-v1-Eventname.

## Payload Mindestfelder

```txt
eventId
userId
buddyId optional
missionId
arSessionId optional
questionId
questionFingerprint
questionType
objectType optional
recognizedObjectLabel optional
recognizedObjectConfidence optional
locationHash optional
placeContextId optional
questionText
answerOptions
selectedAnswerId
selectedAnswerText
correctAnswerId optional
isCorrect optional
clientTimestamp
serverReceivedAt
source = mobile-ar | unity-ar | web-fallback
```

## Antwortbewertung

Die Antwort kann in zwei Stufen bewertet werden:

```txt
Client/UI: nur Auswahl erfassen
Backend: autoritativ richtig/falsch pruefen
```

Wenn die richtige Antwort aus Sicherheitsgruenden nicht im Client liegen soll:

```txt
correctAnswerId bleibt serverseitig
Client sendet nur selectedAnswerId
Backend loest Frage anhand questionId auf
```

## Objekt-/Kamera-Kontext

Optional:

```txt
recognizedObjectLabel = maple_leaf
recognizedObjectConfidence = 0.72
objectBoundingHint = optional
imageStored = false by default
```

Grundsatz:

- Fotos/Bilder nur speichern, wenn wirklich noetig und erlaubt.
- Fuer viele MVP-Faelle reicht Objektlabel + Confidence + Fragekontext.

## Standort-Kontext

Optional:

```txt
locationHash
placeContextId
nearbyPoiId
```

Keine unnoetig exakten Privatstandorte speichern.

## Security Flags

```txt
rewardAuthorized = false
missionCompletionAuthorized = false
pointsGranted = false
```

Diese Werte bleiben im Evidence Event false. Punkte entstehen erst spaeter in einem separaten serverseitigen Ledger Event.

## Backend-Auswertung

Backend erzeugt aus Evidence spaeter:

```txt
ArRewardPolicyInput
QuestionMemoryUpdate
RewardLedgerEvent optional
ManualReview optional
```

## Anti-Farming Signale

Evidence kann Signale enthalten:

```txt
sameQuestionRecentlyAsked
sameLocationRecentlyUsed
lowObjectConfidence
rapidAnswerPattern
suspiciousLocationJump
```

Diese Signale duerfen die Reward Policy beeinflussen.

## Beispiel Blattfrage

```json
{
  "eventType": "arQuestionAnswered",
  "missionId": "nature_leaf_demo_001",
  "questionId": "leaf_identification_easy_001",
  "questionType": "objectRecognition",
  "objectType": "leaf",
  "recognizedObjectLabel": "maple_leaf",
  "recognizedObjectConfidence": 0.72,
  "questionText": "Was ist das fuer ein Blatt?",
  "answerOptions": ["Eichenblatt", "Ahornblatt", "Birkenblatt"],
  "selectedAnswerId": "maple_leaf",
  "source": "mobile-ar",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false,
  "pointsGranted": false
}
```

## Harte Grenze

Dieses Event darf niemals direkt Punkte schreiben.

Es darf nur der Einstieg in die serverseitige Pruefung sein.
