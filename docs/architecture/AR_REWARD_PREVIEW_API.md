# WellFit – AR Reward Preview API

Stand: 2026-04-28
Status: Architekturanker fuer serverseitige Reward Preview aus AR-Fragen

## Zweck

Diese Datei beschreibt den ersten sicheren Serverpfad fuer AR-Buddy-Fragen.

Ziel ist eine Preview-Berechnung, keine produktive Punktebuchung.

```txt
AR Question Evidence -> Server prueft -> Reward Preview Result -> UI zeigt Vorschau oder wartet auf Ledger-Freigabe
```

## Warum Preview zuerst?

AR-Fragen und Raetselrallyes koennen leicht farmbar werden, wenn Client, Kamera oder Buddy selbst Punkte vergeben.

Darum gilt:

```txt
Client erzeugt Evidence
Server berechnet Preview
Produktives Ledger kommt spaeter
```

## Vorgeschlagener Endpoint

```txt
POST /api/ar/reward-preview
```

Alternative spaeter:

```txt
Callable Function: previewArQuestionReward
```

## Request Body

Typischer Request:

```txt
ArQuestionEvidenceEvent
```

Wichtige Felder:

```txt
userId
missionId
questionId
questionFingerprint
questionType
selectedAnswerId
source
clientTimestamp
rewardAuthorized=false
missionCompletionAuthorized=false
pointsGranted=false
```

## Server-Pruefung

Der Server muss mindestens pruefen:

```txt
User authentifiziert
Mission existiert oder ist als Demo/Preview erlaubt
QuestionId bekannt oder generierbar
Antwort pruefbar
Question Memory abrufbar
Daily/User/MissionType Caps abrufbar
Risk Signals berechenbar
```

## Interner Ablauf

```txt
1. Evidence entgegennehmen
2. harte Client-Flags ignorieren/normalisieren
3. Antwort serverseitig pruefen
4. Question Memory lesen
5. Repeat-/Novelty-Signale berechnen
6. ArRewardPolicyInput erzeugen
7. Reward Policy ausfuehren
8. ArRewardPolicyResult zurueckgeben
9. noch kein produktives Ledger schreiben
```

## Response Body

```txt
ArRewardPolicyResult
```

Beispiel:

```json
{
  "pointsPreview": 3,
  "xpPreview": 5,
  "rewardAllowed": true,
  "manualReviewRequired": false
}
```

## Wichtige Grenze

Auch wenn `rewardAllowed=true` in der Preview steht, ist das noch keine finale Buchung.

Produktive Buchung braucht spaeter einen separaten Serverpfad:

```txt
submitArQuestionReward
writeRewardLedgerEvent
```

## Client-Verhalten

Erlaubt:

```txt
Buddy sagt: Gute Antwort, ich pruefe deine Punkte.
UI zeigt: Punkte werden geprueft.
UI zeigt nach Preview: voraussichtlich +3 Punkte.
```

Nicht erlaubt:

```txt
Client schreibt Punkte direkt ins Profil.
Client erhoeht XP direkt.
Client markiert Mission final abgeschlossen.
```

## Fehlerantworten

Moegliche Gruende:

```txt
question-repeat-blocked
user-daily-cap-reached
mission-type-cap-reached
low-evidence-quality
manual-review-required
unknown-question
invalid-answer
unauthorized
```

## Beziehung zu spaeterem Ledger

Preview ist Schritt 1.

Produktiver Zielpfad spaeter:

```txt
ArQuestionEvidenceEvent
-> ArRewardPreview
-> Server Completion/Reward Decision
-> RewardLedgerEvent
-> User points/XP update
```

## Naechste Schritte

- [ ] API-Route oder Callable Function als Preview-only Stub planen.
- [ ] Keine Punktebuchung in der ersten Version.
- [ ] Firestore Rules fuer Evidence und Ledger getrennt planen.
- [ ] Tests fuer blocked/repeat/cap/manual-review Faelle vorbereiten.
