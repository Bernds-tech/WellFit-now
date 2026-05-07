# WellFit – Buddy Event Ingestion Plan

Status: Draft fuer spaetere App-/Backend-Auswertung von Unity-Buddy-Events
Branch: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Unity meldet AR-/Buddy-/Guide-Events. Dieses Dokument beschreibt, wie App/Backend diese Events spaeter sicher aufnehmen koennen, ohne Unity zur Autoritaet fuer Rewards, Mission Completion oder Anti-Cheat zu machen.

---

## Grundregel

Unity-Events sind Hinweise.

Sie koennen spaeter genutzt werden als:

- UI-Signal
- Diagnose-Signal
- QA-/Debug-Log
- Evidence-Hinweis fuer serverseitige Pruefung

Sie sind niemals direkt:

- Mission Completion
- Reward-Entscheidung
- XP-/Punkte-Buchung
- Token-/NFT-Aktion
- Anti-Cheat-Urteil

---

## Event-Quelle

Quelle:

```txt
Unity / WellFitNativeBridge / AR-Buddy Controllers
```

Aktuell:

```txt
SendEventToWellFit(eventName, payloadJson)
```

Spaeter:

```txt
versionierter Event Envelope
```

---

## Ingestion-Stufen

### Stufe 0 – Lokal / Debug

Aktueller Zustand.

- Unity loggt Events lokal.
- Debug-Overlay zeigt Eventcount und letztes Event.
- Keine Backend-Auswertung.
- Keine Reward-/Completion-Logik.

### Stufe 1 – App empfängt Events

Mobile/App-Schicht nimmt Unity-Events entgegen.

Erlaubt:

- UI aktualisieren
- Diagnose anzeigen
- lokale Session-Logs sammeln

Nicht erlaubt:

- Punkte buchen
- Mission abschliessen
- Items freischalten

### Stufe 2 – Backend Event Log

App sendet ausgewählte Events an Backend/Callable Function.

Erlaubt:

- serverseitiges Event-Log schreiben
- Rate-Limits anwenden
- Session-Zugehoerigkeit pruefen
- Owner/User pruefen

Nicht erlaubt:

- Event direkt als Reward akzeptieren

### Stufe 3 – Evidence Review

Backend kann Events als einen von mehreren Evidence-Hinweisen bewerten.

Weitere moegliche Evidence:

- TrackingSession
- NFC-/QR-Scan
- GPS-/Radius-Kontext
- Zeitfenster
- Parent-/Altersmodus
- Mission-Kontext
- Proof-Quality
- Pattern-/Cooldown-Review

### Stufe 4 – Mission Completion Evaluation

Nur Backend entscheidet, ob eine Mission reviewbar, abgelehnt oder spaeter abschliessbar ist.

Unity-Event bleibt nur ein Baustein.

---

## Geplantes Event-Log-Datenmodell

Draft Collection:

```txt
buddyArEvents/{eventId}
```

Moegliche Felder:

```json
{
  "userId": "serverAuthUid",
  "sessionId": "tracking_or_ar_session_id",
  "buddyId": "default_buddy",
  "contractVersion": "buddy-ar-v1",
  "eventName": "onBuddyActionStarted",
  "payloadType": "movement",
  "payload": {},
  "debugOnly": false,
  "createdAt": "serverTimestamp",
  "clientTimestampMs": 0,
  "source": "unity",
  "ingestionStatus": "logged-only",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false
}
```

---

## Pflichtfelder fuer Safety

```txt
rewardAuthorized=false
missionCompletionAuthorized=false
ingestionStatus=logged-only | evidence-candidate | ignored | rejected
```

Diese Felder verhindern Missverstaendnisse: Ein Event-Log ist keine Auszahlung und kein Completion-Beweis.

---

## Callable Function Draft

Moeglicher spaeterer Name:

```txt
recordBuddyArEvent
```

Aufgaben:

1. Auth pruefen.
2. Payload validieren.
3. ContractVersion pruefen.
4. Eventname allowlisten.
5. Rate-Limit pruefen.
6. Session-/Mission-Kontext optional pruefen.
7. Event mit `rewardAuthorized=false` und `missionCompletionAuthorized=false` speichern.

---

## Firestore Rules Draft

Regeln:

- Client darf Events nicht direkt schreiben.
- Client darf eigene Events ggf. lesen.
- Nur Cloud Functions schreiben `buddyArEvents`.

---

## Event Allowlist Draft

```txt
onArReady
onArError
onAnchorCreated
onBuddyPlaced
onBuddyActionStarted
onBuddyActionCompleted
onBuddyActionRejected
onBuddyReachedSurface
onBuddyDialogueShown
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyContextUpdated
onBuddyCommandReceived
onBuddyCommandCompleted
onBuddyCommandRejected
```

---

## Abuse-/Rate-Limit-Risiken

Risiken:

- Event-Spam durch wiederholte Buttons
- gefaelschte Payloads aus manipuliertem Client
- alte Events erneut senden
- Events ohne gueltige Session

Gegenmassnahmen:

- Auth required
- Callable statt direkter Firestore Write
- serverTimestamp
- requestId / idempotencyKey spaeter
- UserDailyEventCap
- SessionEventCap
- EventNameAllowlist
- Payload groesse begrenzen
- debugOnly Events nicht fuer Evidence nutzen

---

## Verbindung zu bestehenden Architekturdateien

Relevant:

```txt
docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
native/unity/WellFitBuddyAR/docs/BUDDY_EVENT_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_EVENT_STATE_VERSIONING_PLAN.md
native/unity/WellFitBuddyAR/docs/BUDDY_COMMAND_CONTRACT.md
```

---

## Nicht vor Unity-Retest implementieren

[!] Keine produktive Event-Ingestion vor lokalem Compile-/Android-Retest.
[!] Keine Backend-Auswertung ungepruefter Unity-Events.
[!] Keine Reward-/Completion-Kopplung an Unity-Events.

---

## Naechste Micro-Tasks nach Retest

[ ] Eventnamen aus Unity-Retest bestaetigen.
[ ] Event Envelope finalisieren.
[ ] `recordBuddyArEvent` als Stub planen.
[ ] Firestore Collection/Rules planen.
[ ] Emulator-Test fuer direkte Client-Write-Blockade planen.
[ ] Integration mit Mission Evidence Review nur als Evidence-Hinweis planen.
