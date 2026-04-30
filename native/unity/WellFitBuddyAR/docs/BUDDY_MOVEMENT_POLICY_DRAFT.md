# WellFit Buddy – Movement Policy Draft

Status: Draft fuer Refactor nach Unity Compile-/Android-Retest.

## Ziel

Die Buddy-Bewegung soll langfristig nicht in einzelnen Controllern verstreut entschieden werden. Walk, Jump, Return-to-user, Climb, JumpBoost und spaeter Follow/Companion sollen dieselben Bewegungsregeln verwenden.

## Warum eine Movement Policy?

Aktuell prueft `BuddyNavigationController` bereits:

- BuddyRoot vorhanden
- Buddy bewegt sich bereits
- Ziel zu weit entfernt
- Hoehenunterschied zu gross
- Jump erlaubt oder nicht

Das ist richtig, sollte aber langfristig als eigene Policy klarer strukturiert werden.

## Ziel-Komponente

Spaeter moegliche Datei:

```txt
Assets/Scripts/ARBuddy/BuddyMovementPolicy.cs
```

oder, falls wir flach bleiben:

```txt
Assets/Scripts/BuddyMovementPolicy.cs
```

## Verantwortlichkeiten

`BuddyMovementPolicy` entscheidet nur, ob eine Bewegung lokal visuell plausibel ist.

Sie darf nicht entscheiden:

- ob eine Mission erfuellt ist
- ob ein Reward ausgegeben wird
- ob XP/Punkte gebucht werden
- ob ein Nutzer betrogen hat
- ob ein Item/Faehigkeit freigeschaltet ist

## Eingaben

```txt
currentPosition
targetPosition
movementType
allowJump
isBuddyMoving
maxWalkDistanceMeters
maxJumpHeightDifferenceMeters
```

## Ausgabe

```txt
allowed: true/false
reason: none | buddy-root-missing | buddy-already-moving | target-too-far | height-too-large | jump-not-allowed
horizontalDistanceMeters
heightDifferenceMeters
suggestedMovementMode: walk | jump | reject
```

## Geplante Reasons

```txt
none
buddy-root-missing
buddy-already-moving
target-too-far
height-too-large
jump-not-allowed
no-plane-hit
surface-not-safe
surface-too-small
surface-too-steep
occluded
```

## Movement-Typen

```txt
walkToSurface
jumpToSurface
returnToUser
climbUp
jumpBoost
followUser
idleReposition
```

## Naechster Refactor nach Test

1. Aktuellen Unity-Stand kompilieren.
2. Falls `BuddyNavigationController` fehlerfrei ist, keine Sofort-Aenderung.
3. Danach `BuddyMovementPolicy` als kleine Klasse extrahieren.
4. Navigation-Diagnosen weiter aus Policy-Ergebnis speisen.
5. AnchorController nur noch Ziel ermitteln lassen, nicht Bewegungsdetails entscheiden lassen.

## Security Boundary

Movement Policy ist keine Anti-Cheat-Engine. Sie ist nur lokale AR-Plausibilitaet.

Backend/App duerfen sie spaeter als Diagnose verwenden, aber nicht als alleinigen Beweis fuer Mission Completion.
