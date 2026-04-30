# WellFit Buddy – Event & State Versioning Plan

Status: Draft fuer skalierbare Unity/App/Backend-Kopplung
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Dokument legt fest, wie Unity-Events, App-Commands und sichtbare Buddy-States spaeter versioniert werden sollen.

Ziel ist, dass WellFit wachsen kann, ohne dass App, Backend und Unity bei jeder neuen Buddy-Funktion ungeordnet auseinanderlaufen.

---

## Grundregel

Jedes produktnahe Event und jeder produktnahe Command braucht langfristig:

```txt
contractVersion
source
eventName oder command
payloadType
debugOnly
```

Debug-Events duerfen kurzfristig einfacher sein. Produktnahe Auswertung durch App/Backend soll erst nach stabiler Versionierung erfolgen.

---

## Event-Envelope Draft

```json
{
  "contractVersion": "buddy-ar-v1",
  "source": "unity",
  "eventName": "onBuddyActionStarted",
  "payloadType": "movement",
  "timestampClientMs": 0,
  "debugOnly": false,
  "payload": {
    "action": "returnToUser",
    "surfaceId": "surface_xxx",
    "anchorId": "anchor_001"
  }
}
```

---

## Command-Envelope Draft

```json
{
  "contractVersion": "buddy-command-v1",
  "source": "app",
  "command": "callBuddyToUser",
  "requestId": "local-request-001",
  "debugOnly": false,
  "payload": {
    "screenPoint": {
      "x": 0.5,
      "y": 0.35,
      "normalized": true
    }
  }
}
```

---

## State-Envelope Draft

```json
{
  "contractVersion": "buddy-state-v1",
  "source": "app-backend-validated",
  "stateType": "abilityState",
  "buddyId": "default_buddy",
  "debugOnly": false,
  "payload": {
    "abilities": {
      "climbUp": true,
      "jumpBoost": false,
      "scanObject": true
    }
  }
}
```

---

## Geplante Contract-Versionen

```txt
buddy-ar-v1          Unity -> App/Backend Events
buddy-command-v1     App/Backend -> Unity Commands
buddy-state-v1       App/Backend -> Unity visible state
buddy-product-ui-v1  Product UI hints/messages
buddy-debug-v1       Dev/QA debug-only diagnostics
```

---

## Eventgruppen

### AR Session

```txt
onArReady
onArError
onBuddyContextUpdated
```

### Anchor / Surface

```txt
onAnchorCreated
onBuddyPlaced
onBuddyReachedSurface
```

### Movement / Action

```txt
onBuddyActionStarted
onBuddyActionCompleted
onBuddyActionRejected
```

### Guide / Mission Preview

```txt
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyDialogueShown
```

### Command Result

```txt
onBuddyCommandReceived
onBuddyCommandCompleted
onBuddyCommandRejected
```

---

## State-Typen

Geplante State-Typen:

```txt
abilityState
companionState
guideState
movementState
surfaceState
productHintState
debugState
```

---

## Regeln fuer `debugOnly`

```txt
debugOnly=true
```

Bedeutet:

- nur fuer Dev/QA
- nicht fuer Produktlogik
- nicht als Evidence auswerten
- nicht als Mission Completion nutzen
- nicht fuer Reward/XP/Punkte nutzen

```txt
debugOnly=false
```

Bedeutet:

- darf App-/Backend-seitig gelesen werden
- bleibt trotzdem nur Hinweis/Signal
- ist keine alleinige Autoritaet fuer Completion, Reward oder Anti-Cheat

---

## Request-ID / Correlation-ID

Spaeter soll jeder App-Command optional eine `requestId` erhalten.

Unity-Events koennen diese ID zurueckmelden:

```json
{
  "requestId": "local-request-001",
  "eventName": "onBuddyCommandCompleted"
}
```

Nutzen:

- App weiss, welcher Button/Command zu welchem Event gehoert.
- QA kann Ablauf nachvollziehen.
- Backend kann Events sauber gruppieren.

---

## Security Boundary

Versionierung macht Events strukturierter, aber nicht autoritativer.

Auch versionierte Events duerfen nicht direkt autorisieren:

- Punkte
- XP
- Rewards
- Mission Completion
- Token/WFT
- NFTs
- Jackpot/Burn
- Leaderboards
- Anti-Cheat
- Item-Freischaltung
- Faehigkeits-Freischaltung

App/Backend pruefen spaeter serverseitig, ob Events als Evidence-Hinweis taugen.

---

## Migration vom aktuellen Stand

Aktuell sendet `WellFitNativeBridge.SendEventToWellFit(eventName, payloadJson)` einfache Eventnamen und JSON-Strings.

Sichere spaetere Migration:

1. Compile-/Android-Retest abwarten.
2. Eventnamen aus Unity Console/Logcat sammeln.
3. Zentrale Eventnamen-Datei planen.
4. Envelope-Builder fuer Events vorbereiten.
5. Debug-Events markieren.
6. App-/Backend-Auswertung erst nach stabiler Envelope-Version.

---

## Nicht vor Retest implementieren

[!] Keine Bridge-Grossoperation vor Unity-Compile-Test.
[!] Keine Event-Migration vor Android-Retest.
[!] Keine produktive Backend-Auswertung ungeversionierter Unity-Events.

---

## Naechste Micro-Tasks nach Retest

[ ] Eventnamen aus Logcat/Unity Console erfassen.
[ ] `BuddyEventNames` oder vergleichbare zentrale Konstante planen.
[ ] `BuildEventEnvelope` planen.
[ ] `BuildCommandResultEvent` planen.
[ ] Debug-/Produkt-Events trennen.
[ ] App-/Backend-Event-Ingestion separat planen.
