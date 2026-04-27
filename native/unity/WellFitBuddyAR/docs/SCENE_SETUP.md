# WellFitBuddyAR Scene Setup

## Scene Name

`WellFitBuddyAR`

## Required GameObjects

### AR Foundation Core

- AR Session
- XR Origin
- AR Camera
- AR Plane Manager
- AR Raycast Manager
- AR Anchor Manager
- AR Occlusion Manager optional spaeter

### WellFit AR Objects

- WellFitARSystem
- WellFitNativeBridge
- BuddyController
- BuddyAnchorController
- BuddyNavigationController
- BuddyAbilityController
- BuddyKiGuideController
- BuddyDialogueEventBridge
- BuddyLookAtCamera
- ArMissionHintMarker
- BuddyPlaceholder

## Scene Object: WellFitARSystem

Empfohlene Komponenten:

- WellFitNativeBridge
- BuddyAnchorController
- BuddyKiGuideController
- BuddyDialogueEventBridge

Referenzen:

- BuddyAnchorController -> AR Raycast Manager
- BuddyAnchorController -> AR Anchor Manager
- BuddyAnchorController -> Buddy Prefab
- BuddyAnchorController -> WellFitNativeBridge
- BuddyKiGuideController -> WellFitNativeBridge
- BuddyDialogueEventBridge -> WellFitNativeBridge

## Buddy Prefab

Empfohlene Komponenten:

- BuddyController
- BuddyLookAtCamera
- BuddyNavigationController
- BuddyAbilityController

Optionale Kinder:

- Mesh / Placeholder
- Shadow Blob
- Hint Pointer

## Scene Flow v1

1. App startet AR Session.
2. AR Plane Manager sucht horizontale Flaechen.
3. UI fordert Nutzer auf, Boden oder Flaeche zu scannen.
4. Nutzer tippt auf erkannte Flaeche.
5. AR Raycast Manager gibt Weltposition zurueck.
6. AR Anchor Manager erstellt Anchor.
7. Buddy wird am Anchor platziert.
8. Buddy startet idle animation.
9. Buddy richtet Blick grob zur Kamera.
10. WellFitNativeBridge meldet `onBuddyPlaced`.
11. Nutzer tippt Buddy.
12. Buddy startet happy animation.
13. WellFitNativeBridge meldet `onBuddyActionStarted` und `onBuddyActionCompleted`.

## Scene Flow v2

1. Mehrere erkannte Flaechen werden als Surface Nodes verwaltet.
2. Buddy kann in kleinem Radius um Anchor laufen.
3. Buddy kann zu nahem Surface Node springen.
4. Hoehenunterschied entscheidet Animation:
   - hoeher: hop oder climbUp
   - tiefer: jumpDown und land
5. Missionen koennen Buddy-Zielpunkte anfragen.
6. ArMissionHintMarker kann Hinweise in der Umgebung markieren.
7. BuddyKiGuideController kann Mission, Dialog oder Capability-Hinweis melden.

## AR Event Contract

Siehe:

```txt
docs/AR_EVENT_CONTRACT.md
```

Wichtige Events:

- onArReady
- onPlaneDetected
- onAnchorCreated
- onBuddyPlaced
- onBuddyActionStarted
- onBuddyActionCompleted
- onBuddyActionRejected
- onBuddyReachedSurface
- onBuddyDialogueShown
- onBuddyMissionSuggested
- onBuddyCapabilityNeeded
- onArHintMarkerCreated
- onArHintMarkerFocused
- onArHintMarkerResolved
- onArError

## Wichtige Produktgrenze

Unity entscheidet nicht ueber Rewards, Punkte, Token oder Mission Completion.

Unity meldet nur AR-Events:

- Buddy platziert
- Buddy Aktion gestartet
- Buddy Aktion beendet
- Surface erkannt
- Nutzerinteraktion erkannt
- Hinweis/Marker erstellt
- Dialog/Empfehlung ausgelöst

WellFit Backend/App entscheidet ueber:

- Mission gueltig
- XP/Punkte
- Streaks
- Rewards
- Anti-Cheat
- Completion
