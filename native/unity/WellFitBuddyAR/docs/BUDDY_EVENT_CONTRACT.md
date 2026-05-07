# WellFit Buddy – Unity Event Contract Draft

Status: Draft fuer App-/Backend-Abgleich nach Unity Debug-Batch.

## Zweck

Dieses Dokument beschreibt, welche Events Unity melden darf und wie App/Backend diese Events spaeter einordnen sollen.

Unity-Events sind Hinweise, keine Autoritaet.

## Grundregel

Unity sendet nur Beobachtungen und Visualisierungsereignisse.

Unity entscheidet nicht:

- ob eine Mission abgeschlossen ist
- ob Punkte/XP vergeben werden
- ob ein Reward freigeschaltet wird
- ob ein Item oder eine Faehigkeit wirklich vorhanden ist
- ob ein Nutzer betrogen hat

## Eventgruppen

### AR Session Events

```txt
onArReady
onArError
onBuddyContextUpdated
```

Verwendung:

- App weiss, ob AR bereit ist.
- App kann Fehlermeldungen anzeigen.
- App kann Diagnose speichern.

### Anchor / Surface Events

```txt
onAnchorCreated
onBuddyPlaced
onBuddyReachedSurface
```

Payload-Kerne:

```json
{
  "anchorId": "anchor_001",
  "surfaceId": "surface_xxx",
  "status": "placed"
}
```

Bedeutung:

- Buddy wurde auf erkannter AR-Flaeche platziert.
- Surface-ID ist technische Diagnose, kein Reward-Beweis.

### Movement Events

```txt
onBuddyActionStarted
onBuddyActionCompleted
onBuddyActionRejected
```

Moegliche Actions:

```txt
walkToSurface
jumpToSurface
returnToUser
callBuddyToUser
climbUp
jumpBoost
fetchClue
scanObject
carry
pointAtObject
resetPlacement
```

Moegliche Reject-Reasons:

```txt
no-plane-hit
buddy-not-placed
buddy-already-moving
target-too-far
height-too-large
jump-not-allowed
capability-missing
controller-rejected
```

### Ability Events

```txt
onBuddyActionStarted
onBuddyActionRejected
```

Faehigkeiten aktuell als Event-/Diagnosekonzept:

```txt
climbUp
jumpBoost
fetchClue
scanObject
carry
pointAtObject
```

Wichtig:

Unity kann melden, dass eine Faehigkeit benutzt oder abgelehnt wurde. Unity darf aber nicht entscheiden, ob die Faehigkeit gekauft, verdient oder freigeschaltet ist. Das muss spaeter aus App/Backend kommen.

### KI Guide Events

```txt
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyContextUpdated
```

Payload-Kerne:

```json
{
  "missionId": "debug_ar_walk",
  "reason": "debug-button",
  "rewardStatus": "preview-only"
}
```

Wichtig:

`rewardStatus=preview-only` bedeutet: keine echte Vergabe, keine Completion, keine Economy-Autoritaet.

## App-/Backend-Verhalten spaeter

App/Backend sollen Unity-Events behandeln als:

1. UI-Signal
2. Diagnose-Signal
3. Evidence-Hinweis
4. optionaler Trigger fuer serverseitige Validierung

Nicht als:

1. finale Mission Completion
2. finale Reward-Entscheidung
3. Anti-Cheat Urteil
4. Token-/NFT-/WFT-Aktion

## Versionierung

Spaeter sollte jedes Event optional enthalten:

```json
{
  "contractVersion": "buddy-ar-v1",
  "source": "unity",
  "timestampClientMs": 0
}
```

Aktuell ist das noch nicht zwingend eingebaut, weil der Fokus auf erstem Unity-/Android-Test liegt.

## Naechste Schritte

1. Nach Unity-Retest echte Eventnamen in Logcat/Unity Console pruefen.
2. App-/Backend-seitigen Eventvertrag daraus ableiten.
3. `contractVersion` einfuehren.
4. Event-Payloads vereinheitlichen.
5. Debug-Events und Produkt-Events trennen.
