# Unity Scripts Placeholder

Dieses Verzeichnis enthält C#-Vorlagen als `.cs.txt`, damit sie vor der lokalen Unity-Projekterzeugung sauber im Repository liegen können.

Nach dem Erzeugen des Unity-Projekts `native/unity/WellFitBuddyAR` werden die Vorlagen nach Unity kopiert als:

```txt
Assets/Scripts/*.cs
```

## Vorlagen

- `WellFitNativeBridge.cs.txt`
- `BuddyController.cs.txt`
- `BuddyAnchorController.cs.txt`
- `BuddyLookAtCamera.cs.txt`
- `BuddySurfaceNode.cs.txt`
- `BuddyNavigationController.cs.txt`
- `BuddyAbilityController.cs.txt`

## Zweck der Vorlagen

### WellFitNativeBridge

Verbindet Unity-Ereignisse mit der WellFit-App/Bridge. Unity meldet nur Events, entscheidet aber keine Rewards.

### BuddyController

Basissteuerung für Buddy-State, Animationen und einfache Aktionen.

### BuddyAnchorController

Setzt den Buddy per AR Raycast auf eine erkannte Fläche und bindet ihn an einen echten AR Anchor.

### BuddyLookAtCamera

Sorgt dafür, dass der Buddy weich zur Kamera beziehungsweise zum Nutzer schaut.

### BuddySurfaceNode

Repräsentiert erkannte oder manuell markierte Flächen wie Boden, Tisch, Couch, Kastl oder Plattform.

### BuddyNavigationController

Erlaubt einfache Bewegung, WalkTo, JumpTo und Sprung zwischen Surface Nodes.

### BuddyAbilityController

Verwaltet Fähigkeiten wie climbUp, jumpBoost, fetchClue, scanObject, carry und markiert fehlende Capability als rejected Event.

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
