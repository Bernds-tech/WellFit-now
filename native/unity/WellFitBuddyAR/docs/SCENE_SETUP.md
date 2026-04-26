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

- WellFitNativeBridge
- BuddyController
- BuddyAnchorController
- BuddyNavigationController
- BuddyDialogueEventBridge
- BuddyLookAtCamera
- BuddyPlaceholder

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
10. Nutzer tippt Buddy.
11. Buddy startet happy animation.
12. App/Bridge meldet Event zurueck an WellFit.

## Scene Flow v2

1. Mehrere erkannte Flaechen werden als Surface Nodes verwaltet.
2. Buddy kann in kleinem Radius um Anchor laufen.
3. Buddy kann zu nahem Surface Node springen.
4. Hoehenunterschied entscheidet Animation:
   - hoeher: hop oder climbUp
   - tiefer: jumpDown und land
5. Missionen koennen Buddy-Zielpunkte anfragen.

## Wichtige Produktgrenze

Unity entscheidet nicht ueber Rewards, Punkte, Token oder Mission Completion.

Unity meldet nur AR-Events:

- Buddy platziert
- Buddy Aktion gestartet
- Buddy Aktion beendet
- Surface erkannt
- Nutzerinteraktion erkannt

WellFit Backend/App entscheidet ueber:

- Mission gueltig
- XP/Punkte
- Streaks
- Rewards
- Anti-Cheat
