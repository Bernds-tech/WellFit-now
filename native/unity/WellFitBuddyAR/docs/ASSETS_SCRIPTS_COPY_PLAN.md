# WellFitBuddyAR – Assets/Scripts Copy Plan

Stand: 2026-04-28

## Ziel

Die C#-Vorlagen liegen im Repository als `.cs.txt`, damit sie vor der lokalen Unity-Projekterzeugung sauber versioniert sind.

Nach dem Erzeugen des Unity-Projekts muessen sie in Unity als echte `.cs`-Dateien angelegt werden.

## Quelle

```txt
native/unity/WellFitBuddyAR/Scripts/*.cs.txt
```

## Ziel im Unity-Projekt

```txt
native/unity/WellFitBuddyAR/Assets/Scripts/*.cs
```

## Automatisch kopieren

Windows PowerShell:

```powershell
cd native/unity/WellFitBuddyAR
powershell -ExecutionPolicy Bypass -File tools/copy-scripts.ps1
```

macOS/Linux/Git Bash:

```bash
cd native/unity/WellFitBuddyAR
chmod +x tools/copy-scripts.sh
./tools/copy-scripts.sh
```

## Zu kopierende Dateien

- [ ] `Scripts/WellFitNativeBridge.cs.txt` -> `Assets/Scripts/WellFitNativeBridge.cs`
- [ ] `Scripts/BuddyInputController.cs.txt` -> `Assets/Scripts/BuddyInputController.cs`
- [ ] `Scripts/BuddyController.cs.txt` -> `Assets/Scripts/BuddyController.cs`
- [ ] `Scripts/BuddyAnchorController.cs.txt` -> `Assets/Scripts/BuddyAnchorController.cs`
- [ ] `Scripts/BuddyLookAtCamera.cs.txt` -> `Assets/Scripts/BuddyLookAtCamera.cs`
- [ ] `Scripts/BuddySurfaceNode.cs.txt` -> `Assets/Scripts/BuddySurfaceNode.cs`
- [ ] `Scripts/BuddyNavigationController.cs.txt` -> `Assets/Scripts/BuddyNavigationController.cs`
- [ ] `Scripts/BuddyAbilityController.cs.txt` -> `Assets/Scripts/BuddyAbilityController.cs`
- [ ] `Scripts/BuddyKiGuideController.cs.txt` -> `Assets/Scripts/BuddyKiGuideController.cs`
- [ ] `Scripts/BuddyDialogueEventBridge.cs.txt` -> `Assets/Scripts/BuddyDialogueEventBridge.cs`
- [ ] `Scripts/ArMissionHintMarker.cs.txt` -> `Assets/Scripts/ArMissionHintMarker.cs`

## Empfohlene Unity-Hierarchie

```txt
Assets/
  Scenes/
    WellFitBuddyAR.unity
  Scripts/
    WellFitNativeBridge.cs
    BuddyInputController.cs
    BuddyController.cs
    BuddyAnchorController.cs
    BuddyLookAtCamera.cs
    BuddySurfaceNode.cs
    BuddyNavigationController.cs
    BuddyAbilityController.cs
    BuddyKiGuideController.cs
    BuddyDialogueEventBridge.cs
    ArMissionHintMarker.cs
  Prefabs/
    BuddyPlaceholder.prefab
    SurfaceNode.prefab
    HintMarker.prefab
  Materials/
    BuddyPlaceholder.mat
    ShadowBlob.mat
  Models/
    Placeholder/
  Animations/
    Buddy/
```

## Szene-Verknuepfung

### Scene Object: WellFitARSystem

Komponenten:

- `WellFitNativeBridge`
- `BuddyInputController`
- `BuddyAnchorController`
- `BuddyKiGuideController`
- `BuddyDialogueEventBridge`

Referenzen:

- BuddyInputController -> BuddyAnchorController
- BuddyInputController -> WellFitNativeBridge
- BuddyInputController -> AR Camera
- BuddyAnchorController -> Buddy Prefab
- BuddyAnchorController -> AR Raycast Manager
- BuddyAnchorController -> AR Anchor Manager
- BuddyAnchorController -> WellFitNativeBridge

### Buddy Prefab

Komponenten:

- `BuddyController`
- `BuddyLookAtCamera`
- `BuddyNavigationController`
- `BuddyAbilityController`

Optionale Kinder:

- Mesh / Placeholder Capsule
- Shadow Blob
- Hint Pointer

### Surface Node Prefab

Komponenten:

- `BuddySurfaceNode`

### Hint Marker Prefab

Komponenten:

- `ArMissionHintMarker`

## Kompilierhinweis

`BuddyAnchorController.cs` nutzt AR Foundation Klassen. Falls Unity noch kein AR Foundation Paket installiert hat, kann es Compile-Fehler geben. Erst Pakete installieren, dann Scripts aktivieren.

## Sicherheitsgrenze

Diese Scripts duerfen keine Rewards, XP, Punkte, Token/WFT oder Mission Completion autorisieren.

Sie melden nur Events an WellFit. Backend/App entscheidet spaeter ueber Gueltigkeit und Rewards.
