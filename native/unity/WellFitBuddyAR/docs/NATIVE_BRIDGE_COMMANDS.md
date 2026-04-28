# WellFitBuddyAR – Native Bridge Commands

Stand: 2026-04-28

## Ziel

Diese Datei beschreibt, wie die WellFit-App spaeter Befehle an Unity senden kann, damit der Buddy in der echten AR-Welt platziert, bewegt und geführt wird.

Unity bleibt dabei reine AR-/Rendering-/Event-Schicht. Rewards, Punkte, XP, Token/WFT, Jackpot, Leaderboards und finale Mission Completion bleiben ausserhalb von Unity.

## Eingehende Commands an Unity

### StartSession

```txt
StartSession()
```

Startet bzw. initialisiert die AR-Session-Logik.

Rueckmeldung:

```txt
onArReady { status: session-start-requested }
```

### StopSession

```txt
StopSession()
```

Stoppt bzw. beendet die AR-Session-Logik.

Rueckmeldung:

```txt
onArReady { status: session-stop-requested }
```

### PlaceBuddyAtScreenPointJson

```json
{ "x": 0.5, "y": 0.72 }
```

oder Pixelkoordinaten:

```json
{ "x": 540, "y": 1420 }
```

Verhalten:

1. Unity wandelt normalisierte Koordinaten in Screen-Pixel um.
2. BuddyAnchorController raycastet gegen erkannte AR-Plane.
3. ARAnchor wird erstellt.
4. Buddy wird auf der realen Fläche platziert.

Rueckmeldung:

```txt
onBuddyPlaced
onArError bei fehlender Plane oder fehlendem Controller
```

### MoveBuddyToScreenPointJson

```json
{ "x": 0.42, "y": 0.66 }
```

Verhalten:

1. Unity raycastet gegen erkannte AR-Plane.
2. Buddy läuft zu diesem realen Flächenpunkt.
3. Bei relevantem Höhenunterschied springt Buddy.

Rueckmeldung:

```txt
onBuddyActionStarted { action: walkToSurface }
onBuddyActionStarted { action: jumpToSurface }
onArError bei fehlender Plane
```

### ResetBuddyPlacement

```txt
ResetBuddyPlacement()
```

Setzt die Eingabelogik zurück. Der nächste Tap kann wieder als Erstplatzierung behandelt werden.

Rueckmeldung:

```txt
onBuddyActionStarted { action: resetPlacement }
```

### SuggestMissionJson

```json
{ "missionId": "demo_ar_walk_001", "reason": "backend-suggested" }
```

Leitet eine Missionsempfehlung an den Buddy-KI-Guide weiter.

Rueckmeldung:

```txt
onBuddyMissionSuggested
```

### ExplainMissingCapabilityJson

```json
{ "capabilityId": "climbUp" }
```

Leitet einen Fähigkeits-/Item-Hinweis an den Buddy-KI-Guide weiter.

Rueckmeldung:

```txt
onBuddyCapabilityNeeded
```

## Ausgehende Events von Unity an WellFit

```txt
onArReady
onArError
onBuddyPlaced
onBuddyActionStarted
onBuddyActionCompleted
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyDialogueShown
onArHintMarkerCreated
```

## Sicherheitsgrenze

Unity darf nicht entscheiden:

```txt
Reward
XP
Punkte
Token/WFT
Jackpot/Burn
Leaderboard
Mission Completion
Anti-Cheat-Freigabe
```

Unity darf nur melden:

```txt
AR-Session bereit
Plane erkannt
Buddy platziert
Buddy bewegt
Buddy-Aktion gestartet/beendet
Buddy-Dialog gezeigt
Mission empfohlen
Capability benötigt
AR-Hinweis erstellt
Fehler aufgetreten
```

## Nächster technischer Schritt

1. Unity-Projekt lokal erzeugen.
2. Scripts aus `Scripts/*.cs.txt` nach `Assets/Scripts/*.cs` kopieren.
3. `WellFitARSystem` GameObject anlegen.
4. `WellFitNativeBridge`, `BuddyInputController`, `BuddyAnchorController`, `BuddyKiGuideController`, `BuddyDialogueEventBridge` anhängen.
5. AR Foundation Manager referenzieren.
6. Android ARCore Build auf echtem Gerät testen.
