# Unity Scripts Placeholder

Dieses Verzeichnis enthält C#-Vorlagen als `.cs.txt`, damit sie vor der lokalen Unity-Projekterzeugung sauber im Repository liegen können.

Nach dem Erzeugen des Unity-Projekts `native/unity/WellFitBuddyAR` werden die Vorlagen nach Unity kopiert als:

```txt
Assets/Scripts/*.cs
```

## Vorlagen

- `WellFitNativeBridge.cs.txt`
- `BuddyInputController.cs.txt`
- `BuddyController.cs.txt`
- `BuddyAnchorController.cs.txt`
- `BuddyLookAtCamera.cs.txt`
- `BuddySurfaceNode.cs.txt`
- `BuddyNavigationController.cs.txt`
- `BuddyAbilityController.cs.txt`
- `BuddyKiGuideController.cs.txt`
- `BuddyDialogueEventBridge.cs.txt`
- `ArMissionHintMarker.cs.txt`

## Zweck der Vorlagen

### WellFitNativeBridge

Verbindet Unity-Ereignisse mit der WellFit-App/Bridge. Unity meldet nur Events, entscheidet aber keine Rewards.

### BuddyInputController

Verarbeitet Touch-/Editor-Taps in der AR-Szene.

- erster Tap: Buddy per `PlaceBuddyAtScreenPoint` auf erkannter realer Fläche platzieren
- setzt den internen Platzierungsstatus nur, wenn die Platzierung wirklich erfolgreich war
- weitere Taps: Buddy per `MoveBuddyToScreenPoint` zu angetipptem realem Flächenpunkt laufen oder springen lassen
- meldet Fehler an WellFit, wenn AnchorController fehlt

### BuddyController

Basissteuerung für Buddy-State, Animationen und einfache Aktionen.

### BuddyAnchorController

Setzt den Buddy per AR Raycast auf eine erkannte Fläche, bindet ihn an einen echten AR Anchor und bewegt ihn zu angetippten realen Flächenpunkten.

Wichtige v1-Events:

- `onAnchorCreated`
- `onBuddyPlaced`
- `onBuddyActionStarted`
- `onArError`

### BuddyLookAtCamera

Sorgt dafür, dass der Buddy weich zur Kamera beziehungsweise zum Nutzer schaut.

### BuddySurfaceNode

Repräsentiert erkannte oder manuell markierte Flächen wie Boden, Tisch, Couch, Kastl oder Plattform.

Wichtig:

- `surfaceId` dient als stabile Event-Referenz für spätere Surface-/Reached-Events.
- Surface Nodes sind zuerst Hilfsobjekte, keine Reward- oder Completion-Autorität.

### BuddyNavigationController

Erlaubt einfache Bewegung, WalkTo, JumpTo und Sprung zwischen Surface Nodes.

Wichtige v1-Events:

- `onBuddyReachedSurface`
- `onBuddyActionCompleted`
- `onBuddyActionRejected`

### BuddyAbilityController

Verwaltet Fähigkeiten wie climbUp, jumpBoost, fetchClue, scanObject, carry und markiert fehlende Capability als rejected Event.

### BuddyKiGuideController

Verwaltet den aktuellen Guide-Kontext für Mission, Empfehlung, Altersband, Rewardstatus, benötigte Fähigkeit, benötigtes Item und Buddy-Stimmung.

Er meldet nur erlaubte AR-Event-Contract-Namen wie:

- `onBuddyContextUpdated`
- `onBuddyMissionSuggested`
- `onBuddyCapabilityNeeded`
- `onBuddyMissionProgress`
- `onBuddyDialogueShown`
- `onBuddyDialogueCompleted`

Der Controller darf keine Rewards, XP, Punkte oder Mission Completion autorisieren.

### BuddyDialogueEventBridge

Verwaltet einfache Dialog-Events und eine Dialog-Queue zwischen Unity-Buddy und WellFit-App.

Er meldet Events wie:

- `onBuddyDialogueShown`
- `onBuddyDialogueCompleted`

### ArMissionHintMarker

Repräsentiert einen AR-Hinweis oder Missionsmarker in der Unity-Szene.

Er meldet Events wie:

- `onArHintMarkerCreated`
- `onArHintMarkerFocused`
- `onArHintMarkerResolved`

## Event Contract Audit

Vor dem Öffnen/Kompilieren in Unity immer das Copy-Skript ausführen:

```bash
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.sh
```

oder unter Windows PowerShell:

```powershell
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.ps1
```

Pflichtmeldung:

```txt
Event contract audit passed
```

Wenn alte Eventnamen gemeldet werden, nicht kompilieren. Erst Vorlagen oder kopierte Script-Dateien bereinigen.

## Sicherheitsgrenze

Unity darf nicht autorisieren:

- Rewards
- XP
- Punkte
- Token/WFT
- Jackpot/Burn
- Leaderboard-Ergebnisse
- finale Mission Completion

Unity meldet nur AR-Ereignisse. Backend/App entscheidet über Gültigkeit, Evidence, Completion und spätere interne Rewards.
