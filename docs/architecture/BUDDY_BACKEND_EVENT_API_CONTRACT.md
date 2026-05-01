# WellFit – Buddy Backend Event API Contract

Status: Draft fuer spaetere serverseitige Aufnahme von Unity-/AR-Buddy-Events
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Dieses Dokument beschreibt die spaetere Backend-API, mit der AR-/Buddy-/Guide-Events aus Unity oder Mobile sicher aufgenommen werden koennen.

Wichtig: Diese API ist nur fuer Logging, Diagnose und spaetere Evidence-Kandidaten gedacht. Sie vergibt keine Punkte, keine XP, keine Rewards und bestaetigt keine Mission Completion.

---

## Harte Grundregel

Jedes eingehende Buddy-/AR-Event wird serverseitig gespeichert mit:

```txt
rewardAuthorized=false
missionCompletionAuthorized=false
```

Auch ein valides Event ist nur ein Hinweis, kein Beweis und keine Auszahlung.

---

## Geplante Callable Function

Name Draft:

```txt
recordBuddyArEvent
```

Aufgabe:

- Auth pruefen
- Payload validieren
- Eventname gegen Allowlist pruefen
- Contract-Version pruefen
- Session-/Mission-Kontext optional verknuepfen
- Rate-Limits anwenden
- Event serverseitig mit `serverTimestamp` loggen
- keine Rewards/XP/Punkte/Completion autorisieren

---

## Request Payload Draft

```json
{
  "contractVersion": "buddy-ar-v1",
  "eventName": "onBuddyActionStarted",
  "payloadType": "movement",
  "sessionId": "ar_session_001",
  "missionId": "optional_mission_id",
  "buddyId": "default_buddy",
  "requestId": "optional-client-request-id",
  "debugOnly": false,
  "clientTimestampMs": 0,
  "payload": {
    "action": "returnToUser",
    "surfaceId": "surface_xxx",
    "anchorId": "anchor_001"
  }
}
```

---

## Response Draft

```json
{
  "ok": true,
  "eventId": "server_event_id",
  "ingestionStatus": "logged-only",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false
}
```

Moegliche `ingestionStatus` Werte:

```txt
logged-only
evidence-candidate
ignored-debug
rejected-invalid-payload
rejected-event-not-allowed
rejected-rate-limit
rejected-session-missing
```

---

## Firestore Collection Draft

```txt
buddyArEvents/{eventId}
```

Moegliche Felder:

```json
{
  "userId": "auth.uid",
  "sessionId": "ar_session_001",
  "missionId": "optional_mission_id",
  "buddyId": "default_buddy",
  "contractVersion": "buddy-ar-v1",
  "eventName": "onBuddyActionStarted",
  "payloadType": "movement",
  "payload": {},
  "debugOnly": false,
  "clientTimestampMs": 0,
  "createdAt": "serverTimestamp",
  "source": "unity-via-app",
  "ingestionStatus": "logged-only",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false
}
```

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

Neue Events duerfen erst aufgenommen werden, wenn sie im passenden Unity/Event-Contract dokumentiert sind.

---

## Payload-Groessenlimit

Draft:

```txt
maxPayloadBytes: 4096
maxStringFieldLength: 256
maxEventNameLength: 80
maxRequestIdLength: 120
```

Ziel:

- Event-Spam und grosse Payloads begrenzen
- Debug-Fehler isolieren
- Firestore-Kosten kontrollieren

---

## Rate-Limit Draft

Moegliche Caps:

```txt
UserPerMinuteCap: 60 Buddy-Events
UserPerSessionCap: 500 Buddy-Events
DebugOnlyPerSessionCap: 1000 Buddy-Events
RejectedEventCooldown: 2 Sekunden pro Eventname
```

Diese Werte sind Draft und muessen nach echten Tests angepasst werden.

---

## Security-Regeln

Die Callable Function muss:

1. `context.auth` verlangen.
2. direkte Client-Writes auf `buddyArEvents` blockieren.
3. Eventnamen allowlisten.
4. unbekannte Contract-Versionen ablehnen oder als `ignored` speichern.
5. `rewardAuthorized=false` setzen.
6. `missionCompletionAuthorized=false` setzen.
7. `serverTimestamp` verwenden.
8. Payload normalisieren und groesse begrenzen.
9. Debug-only Events nicht als Evidence-Kandidaten behandeln.

---

## Firestore Rules Draft

```txt
match /buddyArEvents/{eventId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow write: if false;
}
```

Cloud Functions schreiben serverseitig ueber Admin SDK.

---

## Evidence-Kopplung spaeter

Ein Event kann spaeter als Evidence-Kandidat markiert werden, wenn:

- Auth gueltig war
- Session gueltig war
- Mission-Kontext passt
- Eventname erlaubt ist
- Rate-Limits nicht verletzt wurden
- Payload plausibel ist
- `debugOnly=false`

Aber selbst dann gilt:

```txt
Evidence-Kandidat != Mission Completion
Evidence-Kandidat != Reward
```

---

## Emulator-Testplan Draft

Spaeter testen:

1. Direkter Client-Write auf `buddyArEvents` wird abgelehnt.
2. Authenticated callable schreibt Event mit `rewardAuthorized=false`.
3. Unknown EventName wird abgelehnt.
4. Zu grosse Payload wird abgelehnt.
5. Debug-only Event wird als `ignored-debug` oder `logged-only` gespeichert.
6. Rate-Limit wird simuliert.
7. Event ohne Session bleibt `logged-only`.

---

## Nicht vor Unity-Retest implementieren

[!] Kein produktiver `recordBuddyArEvent` Code vor Unity Compile-/Android-Retest.
[!] Keine direkte Mission-Completion-Kopplung.
[!] Keine Punkte-/XP-/Reward-Kopplung.

---

## Naechste Micro-Tasks nach Unity-Retest

[ ] Eventnamen aus Logcat/Unity Console bestaetigen.
[ ] finalen Event Envelope festlegen.
[ ] Callable Stub planen.
[ ] Firestore Rules/Indexes planen.
[ ] Emulator-Testplan in `functions/` ergaenzen.
[ ] erst danach Implementierung starten.
