# WellFitBuddyAR – AR Event Contract

Stand: 2026-04-28

## Ziel

Unity meldet AR-Ereignisse an die WellFit-App. Die App oder das Backend entscheidet danach, ob daraus Mission Evidence, Review, Completion oder spaeter interne Rewards entstehen.

Unity ist niemals Reward-Autoritaet.

## Grundregel

```txt
Unity -> meldet Ereignis
App -> nimmt Ereignis entgegen
Backend -> prueft Evidence, Kontext, Risiko und spaetere Completion
```

## Sicherheitsgrenze

Unity darf nicht autorisieren:

- Rewards
- XP
- Punkte
- Token/WFT
- Jackpot/Burn
- Leaderboards
- finale Mission Completion

Auch die Web-/App-Bridge normalisiert AR-Buddy-Events defensiv:

```txt
rewardAuthorized=false
missionCompletionAuthorized=false
```

Diese Flags sind nur Sicherheitsindikatoren und keine Freigabe. Eine spaetere Freigabe darf ausschliesslich serverseitig nach Evidence-, Kontext-, Risiko- und Anti-Cheat-Pruefung entstehen.

## Event Envelope

Jedes Event soll langfristig diese Grundstruktur haben:

```json
{
  "eventId": "evt_...",
  "eventType": "onBuddyPlaced",
  "userId": "optional-client-context",
  "buddyId": "default",
  "missionId": "optional",
  "arSessionId": "optional",
  "anchorId": "optional",
  "surfaceId": "optional",
  "markerId": "optional",
  "capabilityId": "optional",
  "itemId": "optional",
  "clientTimestamp": "optional",
  "rewardAuthorized": false,
  "missionCompletionAuthorized": false,
  "payload": {}
}
```

## Allowlist v1

Fuer den ersten Unity-/ARCore-Build sind diese Eventnamen erlaubt:

```txt
onArReady
onPlaneDetected
onAnchorCreated
onBuddyPlaced
onBuddyActionStarted
onBuddyActionCompleted
onBuddyActionRejected
onBuddyReachedSurface
onBuddyContextUpdated
onBuddyDialogueShown
onBuddyDialogueCompleted
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyMissionProgress
onArHintMarkerCreated
onArHintMarkerFocused
onArHintMarkerResolved
onArError
```

## Core Events

### onArReady

Unity meldet, dass AR Session, Kamera und Grundsystem bereit sind.

Payload:

```json
{
  "status": "ready"
}
```

### onPlaneDetected

Eine horizontale Flaeche wurde erkannt.

Payload:

```json
{
  "surfaceId": "surface_001",
  "surfaceKind": "Unknown",
  "confidence": 0.5
}
```

### onAnchorCreated

Ein AR Anchor wurde durch Hit-Test/Raycast erstellt.

Payload:

```json
{
  "anchorId": "anchor_001",
  "surfaceId": "surface_001"
}
```

### onBuddyPlaced

Buddy wurde an einem Anchor platziert.

Payload:

```json
{
  "anchorId": "anchor_001",
  "status": "placed"
}
```

### onBuddyActionStarted

Buddy startet eine Aktion, zum Beispiel Springen, Klettern, Scannen oder Hinweis holen.

Payload:

```json
{
  "ability": "ClimbUp",
  "capabilityId": "climbUp",
  "targetId": "marker_001"
}
```

### onBuddyActionCompleted

Buddy hat eine Aktion beendet. Dieses Event ist nur ein AR-Aktionssignal und keine Mission Completion.

Payload:

```json
{
  "ability": "ClimbUp",
  "capabilityId": "climbUp",
  "targetId": "marker_001",
  "status": "completed"
}
```

### onBuddyActionRejected

Unity konnte eine Aktion nicht starten, meistens weil eine Capability fehlt.

Payload:

```json
{
  "reason": "capability-missing",
  "capabilityId": "climbUp"
}
```

### onBuddyReachedSurface

Buddy hat eine Flaeche erreicht.

Payload:

```json
{
  "surfaceId": "surface_002",
  "surfaceKind": "Table"
}
```

### onBuddyContextUpdated

Unity meldet, dass sich der Buddy-/Guide-Kontext geaendert hat, zum Beispiel Mission, Empfehlung, Rewardstatus oder Stimmung.

Payload:

```json
{
  "status": "guide-context-updated",
  "missionId": "demo_tree_clue_001",
  "missionType": "arRiddle",
  "recommendation": "demo_tree_clue_001",
  "ageBand": "adult",
  "rewardStatus": "preview-only",
  "mood": "Curious"
}
```

### onBuddyDialogueShown

Buddy zeigt oder triggert einen Dialog.

Payload:

```json
{
  "messageKey": "mission.start.suggestion"
}
```

### onBuddyDialogueCompleted

Nutzer oder App hat Dialog abgeschlossen. Ein geleerter Dialog kann ebenfalls hierüber mit Status `cleared` gemeldet werden.

Payload:

```json
{
  "status": "completed"
}
```

### onBuddyMissionSuggested

Buddy empfiehlt eine Mission.

Payload:

```json
{
  "missionId": "demo_tree_clue_001",
  "reason": "nearby-safe-mission",
  "rewardStatus": "preview-only"
}
```

### onBuddyCapabilityNeeded

Buddy weist auf fehlende Ausruestung oder Faehigkeit hin.

Payload:

```json
{
  "capabilityId": "climbUp",
  "reason": "capability-needed"
}
```

### onBuddyMissionProgress

Unity meldet einen nicht-autorisierenden Fortschrittsstatus. Dieser Status ist nur Evidence/Signal und keine Completion- oder Reward-Freigabe.

Payload:

```json
{
  "missionId": "demo_tree_clue_001",
  "progressStatus": "needs-help",
  "rewardStatus": "preview-only"
}
```

### onArHintMarkerCreated

Ein AR-Hinweis oder Marker wurde platziert.

Payload:

```json
{
  "markerId": "marker_001",
  "missionId": "demo_tree_clue_001",
  "type": "Clue"
}
```

### onArHintMarkerFocused

Nutzer/Buddy fokussiert einen Marker.

Payload:

```json
{
  "markerId": "marker_001"
}
```

### onArHintMarkerResolved

Marker wurde geloest oder erledigt. Dieses Event ist nur ein Marker-Signal und keine finale Mission Completion.

Payload:

```json
{
  "markerId": "marker_001",
  "status": "resolved-preview-only",
  "rewardStatus": "preview-only"
}
```

### onArError

Unity meldet AR-Fehler.

Payload:

```json
{
  "message": "No plane hit",
  "code": "ar-no-plane-hit"
}
```

## Backend-Mapping

Diese Events koennen spaeter in folgende Backend-Collections einfliessen:

- `buddyArEvents`
- `missionBuddyEvents`
- `trackingProofEvents`
- `missionEvidenceReviews`
- `missionPatternReviews`
- `missionCooldownReviews`

## Wichtig fuer Stufe 1/2

Der erste AR-Build schreibt noch nicht zwingend ins Backend. Zuerst soll er zeigen:

- Kamera startet
- Flaeche erkannt
- Anchor erzeugt
- Buddy bleibt an Weltposition
- Buddy schaut zur Kamera
- einfache Events werden an WellFitNativeBridge gemeldet
- keine Reward-/Completion-Autoritaet in Unity oder Web-Fallback entsteht
