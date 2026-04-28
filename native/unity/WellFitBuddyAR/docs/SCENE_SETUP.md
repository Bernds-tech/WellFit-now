# WellFitBuddyAR Scene Setup

## Scene Name

`WellFitBuddyAR`

## Vorab: Scripts kopieren und Event Contract Audit bestehen

Vor dem Aufbau oder der Validierung der Szene muessen die aktuellen C#-Vorlagen nach Unity kopiert werden.

macOS/Linux/Git Bash:

```bash
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.sh
```

Windows PowerShell:

```powershell
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.ps1
```

Pflicht-Erfolgsmeldung:

```txt
Event contract audit passed
```

Wenn der Audit alte Eventnamen meldet, zuerst die gemeldeten Script-Kopien oder Vorlagen bereinigen. Unity erst danach kompilieren lassen.

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
- BuddyInputController
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
- BuddyInputController
- BuddyAnchorController
- BuddyKiGuideController
- BuddyDialogueEventBridge

Referenzen:

- BuddyInputController -> BuddyAnchorController
- BuddyInputController -> WellFitNativeBridge
- BuddyInputController -> AR Camera
- BuddyAnchorController -> AR Raycast Manager
- BuddyAnchorController -> AR Anchor Manager
- BuddyAnchorController -> Buddy Prefab
- BuddyAnchorController -> WellFitNativeBridge
- BuddyKiGuideController -> WellFitNativeBridge
- BuddyKiGuideController -> BuddyDialogueEventBridge
- BuddyDialogueEventBridge -> WellFitNativeBridge

## Buddy Prefab

Empfohlene Komponenten auf `BuddyPlaceholder`:

- BuddyController
- BuddyLookAtCamera
- BuddyNavigationController
- BuddyAbilityController

Optionale Kinder:

- Mesh / Placeholder
- Shadow Blob
- Hint Pointer

Wichtige Inspector-Hinweise fuer den ersten Placeholder-Test:

```txt
BuddyController -> Animator: optional leer lassen
BuddyLookAtCamera -> Camera Transform: AR Camera setzen oder Camera.main verwenden
BuddyNavigationController -> Buddy Root: BuddyPlaceholder Root oder leer fuer Auto-Fallback
BuddyAbilityController -> Navigation Controller: BuddyNavigationController setzen
BuddyAbilityController -> Bridge: optional leer fuer ersten reinen ARCore-Test
```

Details siehe:

```txt
docs/BUDDY_PLACEHOLDER_PREFAB.md
```

## Scene Flow v1

1. App startet AR Session.
2. AR Plane Manager sucht horizontale Flaechen.
3. UI fordert Nutzer auf, Boden oder Flaeche zu scannen.
4. Nutzer tippt auf erkannte Flaeche.
5. BuddyInputController leitet den Tap an BuddyAnchorController weiter.
6. AR Raycast Manager gibt Weltposition zurueck.
7. AR Anchor Manager erstellt Anchor.
8. Buddy wird am Anchor platziert.
9. Buddy startet idle animation, falls Animator vorhanden ist.
10. Buddy richtet Blick grob zur Kamera.
11. WellFitNativeBridge meldet `onBuddyPlaced`.
12. Nutzer tippt erneut auf erkannte Flaeche.
13. BuddyAnchorController entscheidet: laufen oder bei Hoehenunterschied springen.
14. BuddyNavigationController fuehrt WalkTo oder JumpTo aus.
15. WellFitNativeBridge meldet `onBuddyActionStarted` und spaeter `onBuddyActionCompleted`.

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
docs/UNITY_EVENT_CONTRACT_AUDIT.md
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
- onBuddyContextUpdated
- onBuddyDialogueShown
- onBuddyDialogueCompleted
- onBuddyMissionSuggested
- onBuddyCapabilityNeeded
- onBuddyMissionProgress
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
