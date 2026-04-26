# WellFit Native AR Bridge Contract

## Zweck

Die WellFit-App und die Unity-AR-Schicht muessen klar getrennt bleiben.

Unity rendert die echte AR-Welt und den Buddy. WellFit App/Backend steuert Nutzer, Missionen, KI-Guide, Rewards und Anti-Cheat.

## App -> Unity Commands

### startSession

Startet die AR Session.

Payload:

```json
{}
```

### stopSession

Stoppt die AR Session.

Payload:

```json
{}
```

### placeBuddyAtHitTest

Nutzer tippt auf Bildschirmkoordinate. Unity macht Raycast in echte Welt.

Payload:

```json
{
  "screenX": 0.5,
  "screenY": 0.5
}
```

Response/Event:

```json
{
  "event": "onAnchorCreated",
  "anchorId": "anchor_123",
  "surfaceType": "floor",
  "position": { "x": 0, "y": 0, "z": 1.2 }
}
```

### moveBuddyToAnchor

Bewegt Buddy zu vorhandenem Anchor.

Payload:

```json
{
  "anchorId": "anchor_123",
  "action": "walk"
}
```

### performBuddyAction

Startet Animation oder Verhalten.

Payload:

```json
{
  "action": "happy"
}
```

Moegliche Actions:

- idle
- lookAround
- walk
- hop
- jumpDown
- climbUp
- land
- happy
- return
- pointAtObject

## Unity -> App Events

### onArReady

AR Session ist bereit.

### onPlaneDetected

Eine Flaeche wurde erkannt.

```json
{
  "event": "onPlaneDetected",
  "surfaceId": "surface_1",
  "surfaceType": "horizontal",
  "label": "floor",
  "confidence": 0.75
}
```

### onAnchorCreated

Ein echter Weltanker wurde erzeugt.

### onBuddyPlaced

Buddy wurde an einem Anchor platziert.

### onBuddyActionStarted

Buddy-Animation oder Verhalten gestartet.

### onBuddyActionCompleted

Buddy-Animation oder Verhalten beendet.

### onBuddyReachedSurface

Buddy hat Ziel-Flaeche erreicht.

### onArError

AR-Fehler, Berechtigung oder nicht unterstuetztes Geraet.

## Sicherheitsregel

Unity-Events sind Beweise und Telemetrie, aber keine finale Autoritaet.

Nicht erlaubt in Unity:

- Punkte final vergeben
- Rewards final vergeben
- Mission Completion final setzen
- Token/WFT ausloesen
- Leaderboard final schreiben

Erlaubt in Unity:

- AR-Ereignisse melden
- Buddy-Animationen abspielen
- Raumanker verwalten
- Oberflaechen melden
- Nutzerinteraktionen melden

Finale Entscheidung liegt bei WellFit Backend/Cloud Functions/Firestore Rules.
