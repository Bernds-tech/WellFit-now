# WellFit – AR Buddy Backend Functions Plan

Version: 1.0
Stand: 2026-05-01
Kontext: Unity AR Buddy / App / Firebase Functions / Firestore / Mission Evidence

---

## Zweck

Dieses Dokument plant die serverseitigen Functions fuer AR-Buddy-Events.

Ziel: Unity-Events koennen spaeter kontrolliert aufgenommen, validiert, gespeichert und fuer Mission-Evidence vorbereitet werden, ohne Rewards, XP, Punkte, Completion oder Economy clientseitig zu autorisieren.

---

## Grundsatz

```txt
Unity meldet.
App vermittelt.
Backend validiert.
Server entscheidet.
```

AR-Buddy-Events sind nie direkte Autoritaet.

---

## Geplante Modulstruktur

Moeglicher spaeterer Pfad:

```txt
functions/src/arBuddy/
  recordArBuddyEvent.ts
  validateArBuddyEvent.ts
  sanitizeArBuddyPayload.ts
  rateLimitArBuddyEvent.ts
  classifyArBuddyEvent.ts
  buildArBuddyEventRecord.ts
  index.ts
```

Optional spaeter:

```txt
functions/src/arBuddy/evaluateArMissionEvidence.ts
functions/src/arBuddy/arBuddyEventAllowlist.ts
functions/src/arBuddy/arBuddyForbiddenFields.ts
```

---

## 1. recordArBuddyEvent

### Zweck

Callable Function, die AR-/Buddy-/Guide-Events aus App/Unity annimmt.

### Verantwortungen

[ ] Auth pruefen.
[ ] Payload grob parsen.
[ ] Event validieren.
[ ] Payload sanitizen.
[ ] Rate Limit anwenden.
[ ] Event klassifizieren.
[ ] Firestore Audit-/Evidence-Kandidat schreiben.
[ ] Immer `rewardAuthorized=false` setzen.
[ ] Immer `missionCompletionAuthorized=false` setzen.

### Nicht erlaubt

[!] keine Rewards ausgeben
[!] keine XP/Punkte buchen
[!] keine Mission Completion setzen
[!] keine Token/NFT/WFT-Logik
[!] kein Leaderboard schreiben
[!] keine finale Anti-Cheat-Entscheidung

---

## 2. validateArBuddyEvent

### Zweck

Prueft, ob ein Event formal erlaubt ist.

### Eingaben

```txt
uid
contractVersion
eventName
payloadType
debugOnly
payload
sessionId optional
```

### Pruefungen

[ ] User ist authentifiziert.
[ ] `contractVersion` ist erlaubt.
[ ] `eventName` steht auf Allowlist.
[ ] `payloadType` ist erlaubt.
[ ] Payload ist Objekt.
[ ] Payload-Groesse unter Limit.
[ ] Keine verbotenen Felder.
[ ] `debugOnly` korrekt boolean oder fallback false.

### Ergebnis

```ts
type ArBuddyValidationResult = {
  ok: boolean;
  status: string;
  sanitizedPayload: Record<string, unknown>;
  reasons: string[];
};
```

---

## 3. sanitizeArBuddyPayload

### Zweck

Entfernt oder blockiert Felder, die Unity/App nicht senden duerfen.

### Forbidden Fields

```txt
rewardAmount
xpAmount
pointsAmount
tokenAmount
wftAmount
nftId
missionCompleted
missionCompletionAuthorized
rewardAuthorized
antiCheatPassed
leaderboardScore
jackpotAmount
burnAmount
itemGranted
capabilityGranted
```

### Strategie

Phase 1:

```txt
Wenn forbidden field vorhanden: Event rejecten.
```

Spaeter optional:

```txt
Payload sanitizen und Security-Diagnose schreiben.
```

---

## 4. rateLimitArBuddyEvent

### Zweck

Schuetzt Backend vor Spam, manipulierten Clients und Debug-Flooding.

### Minimum Draft

```txt
maxEventsPerMinutePerUser = 60
maxDebugEventsPerMinutePerUser = 120
maxEvidenceCandidateEventsPerMinutePerUser = 30
maxPayloadBytes = 4096
```

### Ergebnisstatus

```txt
accepted
rejected-rate-limited
```

### Wichtig

Rate Limit ist Schutz, keine Anti-Cheat-Entscheidung.

---

## 5. classifyArBuddyEvent

### Zweck

Ordnet ein Event ein.

### Klassen

```txt
ui-only
diagnostic
evidence-candidate
command-result
unknown
```

### Draft Mapping

```txt
onArReady                         ui-only
onArError                         diagnostic
onAnchorCreated                   diagnostic
onBuddyPlaced                     evidence-candidate
onBuddyActionStarted              diagnostic
onBuddyActionCompleted            evidence-candidate
onBuddyReachedSurface             evidence-candidate
onBuddyActionRejected             diagnostic
onBuddyDialogueShown              diagnostic
onBuddyMissionSuggested           diagnostic
onBuddyCapabilityNeeded           diagnostic
onBuddyContextUpdated             ui-only
onBuddyCommandReceived            command-result
onBuddyCommandCompleted           command-result
onBuddyCommandRejected            command-result
```

---

## 6. buildArBuddyEventRecord

### Zweck

Baut den Firestore-Datensatz einheitlich.

### Draft Record

```json
{
  "userId": "server-auth-uid",
  "sessionId": "optional",
  "contractVersion": "buddy-ar-v1",
  "source": "unity",
  "eventName": "onBuddyActionCompleted",
  "payloadType": "movement",
  "eventClass": "evidence-candidate",
  "debugOnly": false,
  "payload": {},
  "validationStatus": "accepted-evidence-candidate",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false,
  "createdAt": "serverTimestamp",
  "serverReceivedAt": "serverTimestamp"
}
```

---

## Firestore Ziel

Empfohlen fuer Owner-Read und klare Nutzertrennung:

```txt
users/{userId}/arBuddyEvents/{eventId}
```

Alternative fuer zentrale Auswertung spaeter:

```txt
arBuddyEvents/{eventId}
```

Empfehlung fuer MVP:

```txt
users/{userId}/arBuddyEvents/{eventId}
```

---

## Firestore Rules Ziel

Client darf nicht direkt schreiben:

```txt
users/{userId}/arBuddyEvents/{eventId}
  read: owner
  create/update/delete: false
```

Nur Callable Function schreibt serverseitig.

---

## Callable Response Draft

```json
{
  "ok": true,
  "eventId": "generated-id",
  "validationStatus": "accepted-evidence-candidate",
  "eventClass": "evidence-candidate",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false
}
```

Bei Reject:

```json
{
  "ok": false,
  "validationStatus": "rejected-forbidden-field",
  "reasons": ["payload contains rewardAmount"],
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false
}
```

---

## Integration mit bestehender Mission-/Tracking-Architektur

Bestehende bzw. vorbereitete Serverpfade bleiben massgeblich:

```txt
createTrackingSession
recordTrackingProof
createMissionBuddyEvent
evaluateMissionContext
evaluateMissionCompletion
```

`recordArBuddyEvent` soll diese nicht ersetzen, sondern ergaenzen.

AR-Buddy-Events koennen spaeter als Evidence-Kandidaten in `evaluateMissionCompletion` einfliessen.

---

## Sicherheitsinvarianten

Jeder Codepfad setzt:

```txt
rewardAuthorized = false
missionCompletionAuthorized = false
```

Auch bei `ok=true`.

`ok=true` bedeutet nur:

```txt
Event wurde angenommen und gespeichert.
```

Nicht:

```txt
Mission erledigt.
Reward verdient.
```

---

## Teststrategie spaeter

### Unit Tests

[ ] valid event accepted.
[ ] unknown event rejected.
[ ] forbidden field rejected.
[ ] unauthenticated rejected.
[ ] payload too large rejected.
[ ] debugOnly event classified correctly.
[ ] evidence candidate never authorizes reward/completion.

### Emulator Tests

[ ] callable writes user-owned event.
[ ] direct client write blocked.
[ ] owner read allowed.
[ ] other user read blocked.
[ ] rate limit simulated.

---

## Nicht vor Unity-Retest implementieren

[!] Keine produktive Event-Ingestion aktivieren, bevor Unity-Eventnamen im Android-Retest verifiziert sind.
[!] Keine Firestore Rules deployen, ohne Emulator-Test.
[!] Keine Mission Completion an diese Events koppeln.

---

## Naechste sichere Micro-Tasks

[x] Event-Ingestion-Flow dokumentiert.
[x] Backend Functions Plan dokumentiert.
[ ] Mission Evidence Evaluation Draft fuer AR-Buddy-Events erstellen.
[ ] Firestore Rules Draft fuer `users/{userId}/arBuddyEvents` planen.
[ ] Emulator-Testplan fuer `recordArBuddyEvent` vorbereiten.
[ ] Nach Unity-Retest Eventnamen gegen Allowlist abgleichen.
