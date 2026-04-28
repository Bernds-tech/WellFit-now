# WellFitBuddyAR – Unity Setup Checklist

Stand: 2026-04-28

## Ziel dieses Setups

Der erste echte AR-Test soll nicht mehr nur ein Overlay sein.

Ziel ist:

```txt
Handy-Kamera sieht reale Welt
→ ARCore/ARKit erkennt Boden/Flaechen
→ Nutzer tippt auf erkannte Flaeche
→ Buddy erscheint dort als 3D-Objekt
→ Nutzer tippt auf weiteren realen Flaechenpunkt
→ Buddy laeuft oder springt dorthin
→ Buddy bleibt beim Schwenken an Weltposition
```

Unity darf dabei keine Rewards, Punkte, XP, Token/WFT oder Mission Completion autorisieren.

---

## 1. Lokale Voraussetzungen

- [ ] Unity Hub installieren/öffnen.
- [ ] Unity 2022.3 LTS installieren.
- [ ] Android Build Support installieren.
- [ ] Android SDK & NDK Tools installieren.
- [ ] OpenJDK über Unity-Installer mitinstallieren.
- [ ] Android-Handy mit ARCore-Unterstützung bereitlegen.
- [ ] USB-Debugging auf Android aktivieren.
- [ ] iOS Build Support später auf macOS installieren.

---

## 2. Projekt erzeugen

- [ ] Unity Hub öffnen.
- [ ] Neues Projekt erzeugen.
- [ ] Template: 3D Core als Start verwenden.
- [ ] Projektname: `WellFitBuddyAR`.
- [ ] Pfad: `native/unity/WellFitBuddyAR`.
- [ ] Projekt einmal öffnen und speichern.

Hinweis:

Ein echtes Unity-Projekt wird lokal erzeugt. Das Repository enthält aktuell Roadmap, Doku und C#-Vorlagen.

---

## 3. Pakete installieren

Unity Package Manager:

- [ ] AR Foundation installieren.
- [ ] ARCore XR Plugin installieren.
- [ ] ARKit XR Plugin installieren.
- [ ] XR Plugin Management installieren.
- [ ] Input System optional später.

Project Settings:

- [ ] XR Plugin Management aktivieren.
- [ ] Android: ARCore aktivieren.
- [ ] iOS: ARKit später aktivieren.
- [ ] Android Minimum API prüfen.
- [ ] Camera Permission / ARCore Requirements prüfen.

---

## 4. Szene anlegen

- [ ] Szene `WellFitBuddyAR` anlegen.
- [ ] AR Session anlegen.
- [ ] XR Origin anlegen.
- [ ] AR Camera prüfen.
- [ ] AR Plane Manager hinzufügen.
- [ ] AR Raycast Manager hinzufügen.
- [ ] AR Anchor Manager hinzufügen.
- [ ] AR Occlusion Manager optional später hinzufügen.
- [ ] Plane Visualizer optional aktivieren, damit erkannte Flaechen sichtbar werden.

---

## 5. Scripts übernehmen

Vorlagen aus:

```txt
native/unity/WellFitBuddyAR/Scripts/*.cs.txt
```

nach Unity-Projekt kopieren als:

```txt
native/unity/WellFitBuddyAR/Assets/Scripts/*.cs
```

Empfohlener Weg über Copy-Skript:

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

Pflicht-Erfolgsmeldung vor dem Öffnen/Kompilieren in Unity:

```txt
Event contract audit passed
```

Wenn das Copy-Skript wegen veralteter AR-Eventnamen abbricht, keine Unity-Kompilierung starten. Erst die gemeldete alte Script-Kopie oder Vorlage bereinigen.

Pflichtdateien fuer ersten echten AR-Buddy-Test:

- [ ] `WellFitNativeBridge.cs`
- [ ] `BuddyInputController.cs`
- [ ] `BuddyAnchorController.cs`
- [ ] `BuddyController.cs`
- [ ] `BuddyLookAtCamera.cs`
- [ ] `BuddyNavigationController.cs`
- [ ] `BuddyAbilityController.cs`
- [ ] `BuddyKiGuideController.cs`
- [ ] `BuddyDialogueEventBridge.cs`
- [ ] `ArMissionHintMarker.cs`

Optional/spaeter:

- [ ] `BuddySurfaceNode.cs`

---

## 6. WellFitARSystem GameObject einrichten

GameObject erstellen:

```txt
WellFitARSystem
```

Komponenten anhaengen:

- [ ] `WellFitNativeBridge`
- [ ] `BuddyInputController`
- [ ] `BuddyAnchorController`
- [ ] `BuddyKiGuideController`
- [ ] `BuddyDialogueEventBridge`

Referenzen setzen:

### BuddyInputController

- [ ] `Anchor Controller` -> `BuddyAnchorController` auf `WellFitARSystem`
- [ ] `Bridge` -> `WellFitNativeBridge`
- [ ] `AR Camera` -> AR Camera aus XR Origin

### BuddyAnchorController

- [ ] `Buddy Prefab` -> BuddyPlaceholder Prefab
- [ ] `Bridge` -> `WellFitNativeBridge`
- [ ] `Navigation Controller` optional leer lassen; wird am Buddy gesucht/angelegt
- [ ] `Raycast Manager` -> AR Raycast Manager am XR Origin
- [ ] `Anchor Manager` -> AR Anchor Manager am XR Origin

### WellFitNativeBridge

- [ ] `Buddy Anchor Controller` -> `BuddyAnchorController`
- [ ] `Buddy Input Controller` -> `BuddyInputController`
- [ ] `Buddy Ki Guide Controller` -> `BuddyKiGuideController`

### BuddyKiGuideController

- [ ] `Bridge` -> `WellFitNativeBridge`
- [ ] `Dialogue Bridge` -> `BuddyDialogueEventBridge`

### BuddyDialogueEventBridge

- [ ] `Bridge` -> `WellFitNativeBridge`

---

## 7. Buddy Placeholder Prefab bauen

GameObject erstellen:

```txt
BuddyPlaceholder
```

Empfohlene erste Struktur:

```txt
BuddyPlaceholder
  Mesh / Capsule oder einfacher Drache-Placeholder
  Shadow Blob
```

Komponenten:

- [ ] `BuddyController`
- [ ] `BuddyLookAtCamera`
- [ ] `BuddyNavigationController`
- [ ] `BuddyAbilityController`

Prefab erstellen:

- [ ] BuddyPlaceholder als Prefab speichern unter `Assets/Prefabs/BuddyPlaceholder.prefab`.
- [ ] Prefab im `BuddyAnchorController` verknuepfen.

---

## 8. Erster echter AR-Flow

Testablauf:

1. App auf Android ARCore-Handy starten.
2. Kamera zeigt reale Umgebung.
3. Handy langsam bewegen, bis Boden/Flaeche erkannt wird.
4. Erster Tap auf erkannte Flaeche.
5. Buddy erscheint auf dieser realen Flaeche.
6. Handy schwenken.
7. Buddy bleibt an Weltposition.
8. Zweiter Tap auf andere erkannte Flaeche.
9. Buddy laeuft oder springt dorthin.
10. Unity loggt Events:
    - `onBuddyPlaced`
    - `onBuddyActionStarted` mit `walkToSurface` oder `jumpToSurface`
    - ggf. `onArError`

---

## 9. Erster Android ARCore Build

- [ ] Android-Gerät mit ARCore-Unterstützung anschließen.
- [ ] USB-Debugging aktivieren.
- [ ] Build Settings -> Android auswählen.
- [ ] Switch Platform ausführen.
- [ ] Player Settings prüfen.
- [ ] Development Build aktivieren.
- [ ] Build & Run testen.

---

## 10. Erfolgskriterien erster Build

- [ ] Kamera startet.
- [ ] AR Session läuft.
- [ ] Horizontale Fläche wird erkannt.
- [ ] Tap auf Fläche setzt Anchor.
- [ ] Buddy Placeholder erscheint am Anchor.
- [ ] Buddy bleibt beim Schwenken an Weltposition.
- [ ] Buddy schaut zur Kamera.
- [ ] Zweiter Tap bewegt Buddy zu neuem Punkt.
- [ ] Höhenunterschied nutzt JumpTo statt WalkTo.
- [ ] Keine Rewards/XP/Punkte werden in Unity autorisiert.

---

## 11. Bekannte Grenzen v1

- [!] Couch/Tisch/Kastl werden nur erkannt, wenn ARCore/ARKit sie als ausreichend klare horizontale Plane erkennt.
- [!] Echte Hindernislogik kommt spaeter ueber Depth/Occlusion/Scene Mesh.
- [!] Klettern, Balancieren, Treppen, Hindernisse und Raum-Mesh sind Stufe 2/3.
- [!] WebGL-/Browser-Demo bleibt nur Fallback, kein echtes World Tracking.
