# WellFit Native AR Bridge Contract

## Zweck

Die WellFit-App und die Unity-AR-Schicht muessen klar getrennt bleiben.

Unity rendert die echte AR-Welt und den Buddy. WellFit App/Backend steuert Nutzer, Missionen, KI-Guide, Inventar, NFC, Rewards und Anti-Cheat.

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
- fetchClue
- scanObject
- carryItem

### equipBuddyItem

Unity visualisiert ein bereits serverseitig validiertes Item am Buddy.

Payload:

```json
{
  "inventoryItemId": "inv_123",
  "itemId": "rope_001",
  "slot": "back",
  "unityPrefabKey": "items/rope_001"
}
```

### setBuddyCapability

Unity erhaelt eine bereits serverseitig validierte Faehigkeit.

Payload:

```json
{
  "capabilityId": "climbUp",
  "unlocked": true,
  "unlockedByItemId": "rope_001"
}
```

### requestCapabilityAction

App fordert eine Buddy-Aktion an, wenn Backend bestaetigt hat, dass Item/Faehigkeit gueltig ist.

Payload:

```json
{
  "capabilityId": "fetchClue",
  "requiredItemId": "rope_001",
  "missionId": "rally_tree_001",
  "targetAnchorId": "anchor_tree_hint_01"
}
```

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

### onBuddyItemEquipped

Unity hat ein validiertes Item sichtbar am Buddy angebracht.

### onBuddyItemUsed

Unity hat eine Item-Aktion gestartet oder abgeschlossen.

```json
{
  "event": "onBuddyItemUsed",
  "inventoryItemId": "inv_123",
  "itemId": "rope_001",
  "capabilityId": "climbUp",
  "missionId": "rally_tree_001",
  "status": "completed"
}
```

### onBuddyCapabilityActionCompleted

Unity meldet, dass eine Faehigkeitsaktion abgeschlossen wurde.

```json
{
  "event": "onBuddyCapabilityActionCompleted",
  "capabilityId": "fetchClue",
  "missionId": "rally_tree_001",
  "targetAnchorId": "anchor_tree_hint_01",
  "status": "completed"
}
```

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
- Items final freischalten
- NFC-Scans final validieren
- Faehigkeiten final freischalten

Erlaubt in Unity:

- AR-Ereignisse melden
- Buddy-Animationen abspielen
- validierte Items visualisieren
- validierte Faehigkeiten ausfuehren
- Raumanker verwalten
- Oberflaechen melden
- Nutzerinteraktionen melden

Finale Entscheidung liegt bei WellFit Backend/Cloud Functions/Firestore Rules.
