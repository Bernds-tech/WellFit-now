# WellFit – AR Reward Ledger Event

Stand: 2026-04-28
Status: Architekturanker fuer spaetere serverseitige Punktebuchung aus AR-Fragen

## Zweck

Diese Datei beschreibt den spaeteren produktiven Ledger-Event fuer AR-Fragen.

Wichtig:

```txt
Reward Preview ist keine Buchung.
Ledger Event ist die spaetere serverseitige Buchung.
```

## Harte Regel

Nur Server/Backend darf Ledger Events schreiben.

Nicht erlaubt:

```txt
Unity schreibt Ledger
Mobile UI schreibt Ledger
Buddy-KI schreibt Ledger
Kamera-KI schreibt Ledger
Web-Fallback schreibt Ledger
```

## Vorgeschlagener Eventtyp

```txt
arQuestionRewardGranted
```

## Ledger Event Felder

```txt
ledgerEventId
userId
buddyId optional
missionId
sourceEvidenceEventId
questionId
questionFingerprint
questionType
pointsGranted
xpGranted
rewardPolicyVersion
rewardReason
capSnapshotId optional
systemReserveSnapshotId optional
economyHealthScore optional
riskLevel
manualReviewId optional
createdAt
createdBy = server
```

## Punkte-Supply-Bezug

Der Ledger-Event muss spaeter mit der internen 25-Mrd.-Punkteoekonomie kompatibel sein.

Relevante Inputs:

```txt
DailyEmissionCap
UserDailyCap
MissionTypeCap
SystemReserveState
EconomyHealthScore
RepeatPenalty
RiskLevel
```

## Beziehung zu Evidence

Jeder Ledger Event muss auf Evidence zurueckfuehrbar sein:

```txt
sourceEvidenceEventId -> arQuestionAnswered
```

Ohne Evidence kein Ledger Event.

## Beziehung zu Question Memory

Vor Ledger-Buchung muss Question Memory aktualisiert oder geprueft werden:

```txt
Frage wiederholt?
Ort wiederholt?
Schwierigkeit korrekt?
Farming-Risiko?
Cooldown aktiv?
```

## Beispiel

```json
{
  "ledgerEventId": "ledger_arq_001",
  "userId": "user_123",
  "missionId": "nature_leaf_demo_001",
  "sourceEvidenceEventId": "ar_evt_abc",
  "questionId": "leaf_identification_easy_001",
  "questionType": "objectRecognition",
  "pointsGranted": 3,
  "xpGranted": 5,
  "rewardPolicyVersion": "ar-reward-preview-v1",
  "rewardReason": "correct-new-easy-question",
  "riskLevel": "low",
  "createdBy": "server"
}
```

## Nicht im Ledger Event

Nicht speichern als Autoritaet:

```txt
clientClaimedPoints
buddyClaimedPoints
cameraClaimedPoints
unityClaimedPoints
```

## Naechste Schritte

- [ ] Ledger Event TypeScript-Typ planen.
- [ ] Firestore Collection fuer Reward Ledger definieren.
- [ ] Security Rules: Client darf nicht schreiben.
- [ ] Emulator-Test: Client-Schreibversuch muss PERMISSION_DENIED ergeben.
- [ ] Serverfunktion fuer spaetere Buchung entwerfen.
