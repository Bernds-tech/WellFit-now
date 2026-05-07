# WellFit – AR Buddy Event Ingestion Flow

Version: 1.0
Stand: 2026-05-01
Kontext: Unity AR Buddy / App / Backend / Firestore / Security

---

## Zweck

Dieses Dokument beschreibt, wie AR-/Buddy-/Guide-Events aus Unity spaeter in App und Backend aufgenommen werden sollen.

Wichtig: Unity-Events sind Hinweise, keine Autoritaet.

Sie koennen spaeter als Evidence-Hinweis, Diagnose oder UI-Signal dienen, aber niemals direkt Rewards, XP, Punkte, Mission Completion, Token, NFT, Jackpot, Burn, Leaderboard oder Anti-Cheat ausloesen.

---

## Zielbild

```txt
Unity AR Buddy
  -> App / Native Bridge
    -> optional lokale UI-Reaktion
    -> Backend Callable Function
      -> serverseitige Validierung
        -> Audit-/Evidence-/Review-Event
          -> spaetere Mission Evaluation
            -> serverseitige Completion-/Reward-Entscheidung
```

---

## Harte Grenze

Unity darf nur melden:

```txt
Ich habe etwas gesehen.
Ich habe eine Flaeche getroffen.
Buddy wurde platziert.
Buddy bewegt sich.
Buddy ist angekommen.
Eine Faehigkeit wurde versucht.
Eine Faehigkeit fehlt.
Ein Guide-Hinweis wurde gezeigt.
```

Unity darf nicht entscheiden:

```txt
Mission geschafft.
Reward verdient.
Nutzer besitzt Item.
Nutzer besitzt Faehigkeit.
Nutzer hat nicht betrogen.
Punkte/XP buchen.
Token/NFT ausgeben.
Leaderboard aktualisieren.
```

---

## Eventklassen

### 1. UI-only Events

Nur fuer lokale Anzeige oder Debug.

Beispiele:

```txt
onArReady
onBuddyContextUpdated
debug overlay toggles
```

Backend-Auswertung:

```txt
normalerweise nein
```

### 2. Diagnostic Events

Fuer QA, Logcat-Abgleich, Fehleranalyse.

Beispiele:

```txt
onArError
onBuddyActionRejected
surface/raycast diagnostics
```

Backend-Auswertung:

```txt
optional als Diagnose, nicht als Evidence
```

### 3. Evidence Candidate Events

Koennen spaeter als Hinweis fuer eine serverseitige Mission Evaluation dienen.

Beispiele:

```txt
onBuddyPlaced
onBuddyReachedSurface
onBuddyActionCompleted
onBuddyMissionSuggested
onBuddyCapabilityNeeded
```

Backend-Auswertung:

```txt
nur als Evidence-Kandidat, niemals alleinige Completion
```

---

## Geplanter App-Pfad

### Schritt 1 – Unity sendet Event

Unity erzeugt Event:

```json
{
  "contractVersion": "buddy-ar-v1",
  "source": "unity",
  "eventName": "onBuddyActionCompleted",
  "payloadType": "movement",
  "debugOnly": false,
  "payload": {
    "action": "returnToUser",
    "surfaceId": "surface_xxx"
  }
}
```

### Schritt 2 – App nimmt Event entgegen

App prueft lokal:

```txt
Ist Payload parsebar?
Ist contractVersion bekannt?
Ist debugOnly true/false?
Ist Eventname erlaubt?
```

App darf lokal:

```txt
UI aktualisieren
Debug anzeigen
Event an Backend weiterreichen
```

App darf nicht:

```txt
Reward buchen
Mission abschliessen
Punkte/XP schreiben
Item/Faehigkeit final freischalten
```

### Schritt 3 – Backend Callable Function

Geplante Callable Function:

```txt
recordArBuddyEvent
```

Aufgabe:

- Auth pruefen
- Payload validieren
- Eventname allowlisten
- debugOnly beachten
- Rate Limit / Cooldown pruefen
- Event als Audit-/Evidence-Kandidat speichern
- keine Reward-/Completion-Autorisierung

---

## Firestore-Zielcollection Draft

Moegliche Collection:

```txt
arBuddyEvents/{eventId}
```

Oder nutzerbezogen:

```txt
users/{userId}/arBuddyEvents/{eventId}
```

Draft-Felder:

```json
{
  "userId": "server-auth-uid",
  "sessionId": "optional-session-id",
  "contractVersion": "buddy-ar-v1",
  "source": "unity",
  "eventName": "onBuddyActionCompleted",
  "payloadType": "movement",
  "debugOnly": false,
  "payload": {},
  "createdAt": "serverTimestamp",
  "serverReceivedAt": "serverTimestamp",
  "validationStatus": "accepted-diagnostic",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false
}
```

---

## Server Validation

Server prueft:

```txt
Auth vorhanden
Eventname erlaubt
Contract-Version bekannt
Payload-Groesse begrenzt
Payload-Typ erlaubt
Rate-Limit pro Nutzer
Session-Kontext plausibel
Keine verbotenen Felder
```

Verbotene Felder in Unity/App-Payload:

```txt
rewardAmount
xpAmount
pointsAmount
tokenAmount
nftId
missionCompleted
antiCheatPassed
leaderboardScore
jackpotAmount
burnAmount
```

Wenn solche Felder auftauchen:

```txt
Event ablehnen oder sanitizen
Security-Diagnose schreiben
niemals autorisieren
```

---

## Validation Status Draft

```txt
accepted-diagnostic
accepted-evidence-candidate
rejected-invalid-contract
rejected-unknown-event
rejected-debug-only
rejected-payload-too-large
rejected-forbidden-field
rejected-rate-limited
rejected-unauthenticated
```

---

## Event Allowlist Draft

Erlaubte Eventnamen fuer spaetere Ingestion:

```txt
onArReady
onArError
onAnchorCreated
onBuddyPlaced
onBuddyActionStarted
onBuddyActionCompleted
onBuddyReachedSurface
onBuddyActionRejected
onBuddyDialogueShown
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyContextUpdated
onBuddyCommandReceived
onBuddyCommandCompleted
onBuddyCommandRejected
```

---

## Evidence Candidate Policy

Nicht jedes Event ist Evidence.

```txt
onArReady                         = UI/diagnostic
onArError                         = diagnostic
onAnchorCreated                   = diagnostic/evidence candidate optional
onBuddyPlaced                     = evidence candidate optional
onBuddyActionStarted              = diagnostic
onBuddyActionCompleted            = evidence candidate optional
onBuddyReachedSurface             = evidence candidate optional
onBuddyActionRejected             = diagnostic
onBuddyMissionSuggested           = diagnostic/guide context
onBuddyCapabilityNeeded           = diagnostic/guide context
```

Auch Evidence Candidates bleiben nur Hinweise.

Mission Completion braucht spaeter Kombination aus:

```txt
Mission-Kontext
User Auth
Zeitfenster
Ort/Radius falls erlaubt
Proof-/Evidence-Qualitaet
Item-/Ability-Status serverseitig
Anti-Farming-/Cooldown-Regeln
Parent-/Age-/Safety-Kontext
Manual Review bei Risiko
```

---

## Rate Limit Draft

Mindestschutz:

```txt
maxEventsPerMinutePerUser
maxDebugEventsPerMinutePerUser
maxPayloadBytes
maxEventsPerSession
```

Ziel:

- Debug-Spam verhindern
- manipulierte Clients bremsen
- Kosten kontrollieren
- Backend stabil halten

---

## App-/Backend-Fluss fuer Commands

Commands laufen in Gegenrichtung:

```txt
Backend/App entscheidet sichtbaren Zustand
  -> App sendet Command an Unity
    -> Unity visualisiert
      -> Unity meldet Result Event
        -> App/Backend speichert optional Diagnose/Evidence Candidate
```

Beispiel:

```txt
Backend validiert Ability-State
App sendet applyAbilityState an Unity
Unity zeigt Faehigkeit an/aus
Nutzer drueckt Scan
Unity meldet scanObject attempt
Backend prueft spaeter, ob Mission Evidence daraus werden darf
```

---

## Nicht im MVP

Noch nicht produktiv aktivieren:

[>] automatische Reward-Auszahlung aus AR-Events
[>] automatische Completion aus Unity-Event
[>] Leaderboard aus AR-Event
[>] Token-/NFT-/WFT-Ausloesung
[>] Clientseitige Anti-Cheat-Entscheidung

---

## Naechste Micro-Tasks

[ ] Nach Unity-Retest echte Eventnamen aus Console/Logcat erfassen.
[ ] `recordArBuddyEvent` als Callable Function planen.
[ ] Event Allowlist in Backend-Draft uebernehmen.
[ ] Forbidden Field Sanitizer planen.
[ ] Firestore Rules fuer arBuddyEvents planen.
[ ] App-seitigen Event Queue / Retry-Plan entwerfen.
[ ] Debug-only Events lokal halten oder serverseitig stark begrenzen.

---

## Security Summary

AR-Buddy-Events koennen WellFit spaeter reich machen an Kontext, aber nicht reich an Manipulationsflaechen.

Daher gilt:

```txt
Unity meldet.
App vermittelt.
Backend validiert.
Server entscheidet.
```
