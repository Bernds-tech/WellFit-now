# WellFitBuddyAR – First Android ARCore Runbook

Stand: 2026-04-28

## Ziel

Dieses Runbook beschreibt den ersten echten ARCore-Test auf einem Android-Handy.

Zielbild:

```txt
Android-Handy startet Unity-AR-App
→ Kamera zeigt reale Umgebung
→ ARCore erkennt horizontale Flaeche
→ erster Tap platziert Buddy auf realer Flaeche
→ zweiter Tap bewegt Buddy zu neuer realer Position
→ Buddy bleibt beim Schwenken an Weltposition
```

Wichtig:

- WebGL/PWA bleibt Demo/Fallback.
- Echter AR-Buddy braucht Unity AR Foundation + ARCore/ARKit.
- Unity meldet nur AR-Events.
- Backend/App entscheiden spaeter Rewards, Mission Completion, Punkte, XP und Anti-Cheat.

---

## 1. Hardware-Voraussetzungen

- [ ] Android-Handy mit ARCore-Unterstuetzung.
- [ ] USB-Kabel.
- [ ] Entwickleroptionen am Handy aktiviert.
- [ ] USB-Debugging aktiviert.
- [ ] Genug Akku oder Stromversorgung.
- [ ] Heller Raum mit sichtbarem Boden/Tisch.

Testumgebung:

- [ ] Boden frei sichtbar.
- [ ] Tisch oder Couch optional als zweite Flaeche.
- [ ] Handy langsam bewegen, damit ARCore Flaechen erkennen kann.

---

## 2. Unity Installation

Unity Hub:

- [ ] Unity Hub installieren.
- [ ] Unity 2022.3 LTS installieren.

Unity Module:

- [ ] Android Build Support.
- [ ] Android SDK & NDK Tools.
- [ ] OpenJDK.

Optional spaeter:

- [ ] iOS Build Support auf macOS.

---

## 3. Projekt lokal erzeugen

Pfad:

```txt
native/unity/WellFitBuddyAR
```

Schritte:

- [ ] Unity Hub öffnen.
- [ ] New Project.
- [ ] Template: 3D Core.
- [ ] Project Name: `WellFitBuddyAR`.
- [ ] Location: `native/unity/WellFitBuddyAR`.
- [ ] Projekt erstellen.
- [ ] Einmal öffnen und speichern.

---

## 4. Pakete installieren

Unity Package Manager:

- [ ] AR Foundation.
- [ ] ARCore XR Plugin.
- [ ] XR Plugin Management.
- [ ] ARKit XR Plugin optional/spaeter.

Project Settings:

```txt
Edit → Project Settings → XR Plug-in Management
```

- [ ] Android Tab öffnen.
- [ ] ARCore aktivieren.

Player Settings Android:

- [ ] Package Name setzen, z. B. `io.wellfit.buddyar`.
- [ ] Minimum API Level prüfen.
- [ ] Target Architecture: ARM64.
- [ ] Internet Access optional.
- [ ] Camera Permission / AR Required prüfen.

---

## 5. Szene erstellen

Szene:

```txt
Assets/Scenes/WellFitBuddyAR.unity
```

GameObjects:

- [ ] AR Session.
- [ ] XR Origin.
- [ ] AR Camera.
- [ ] AR Plane Manager am XR Origin.
- [ ] AR Raycast Manager am XR Origin.
- [ ] AR Anchor Manager am XR Origin.
- [ ] Optional: AR Occlusion Manager spaeter.

WellFit System:

```txt
WellFitARSystem
```

Komponenten:

- [ ] WellFitNativeBridge.
- [ ] BuddyInputController.
- [ ] BuddyAnchorController.
- [ ] BuddyKiGuideController.
- [ ] BuddyDialogueEventBridge.

---

## 6. Scripts kopieren

Quelle:

```txt
native/unity/WellFitBuddyAR/Scripts/*.cs.txt
```

Ziel:

```txt
native/unity/WellFitBuddyAR/Assets/Scripts/*.cs
```

Kopieren/umbenennen:

- [ ] WellFitNativeBridge.cs.txt → WellFitNativeBridge.cs
- [ ] BuddyInputController.cs.txt → BuddyInputController.cs
- [ ] BuddyAnchorController.cs.txt → BuddyAnchorController.cs
- [ ] BuddyController.cs.txt → BuddyController.cs
- [ ] BuddyLookAtCamera.cs.txt → BuddyLookAtCamera.cs
- [ ] BuddyNavigationController.cs.txt → BuddyNavigationController.cs
- [ ] BuddyAbilityController.cs.txt → BuddyAbilityController.cs
- [ ] BuddyKiGuideController.cs.txt → BuddyKiGuideController.cs
- [ ] BuddyDialogueEventBridge.cs.txt → BuddyDialogueEventBridge.cs
- [ ] ArMissionHintMarker.cs.txt → ArMissionHintMarker.cs
- [ ] BuddySurfaceNode.cs.txt → BuddySurfaceNode.cs optional/spaeter

Wenn Compile-Fehler wegen AR Foundation auftreten:

- [ ] Pruefen, ob AR Foundation installiert ist.
- [ ] Pruefen, ob ARCore XR Plugin installiert ist.
- [ ] Pruefen, ob XR Plugin Management aktiv ist.

---

## 7. Buddy Placeholder Prefab

Erstellen:

```txt
Assets/Prefabs/BuddyPlaceholder.prefab
```

Minimaler Aufbau:

```txt
BuddyPlaceholder
  Capsule oder kleiner Mesh-Placeholder
  Shadow Blob optional
```

Komponenten auf BuddyPlaceholder:

- [ ] BuddyController.
- [ ] BuddyLookAtCamera.
- [ ] BuddyNavigationController.
- [ ] BuddyAbilityController.

Prefab im `BuddyAnchorController` referenzieren.

---

## 8. Referenzen verbinden

### WellFitNativeBridge

- [ ] Buddy Anchor Controller → BuddyAnchorController.
- [ ] Buddy Input Controller → BuddyInputController.
- [ ] Buddy Ki Guide Controller → BuddyKiGuideController.

### BuddyInputController

- [ ] Anchor Controller → BuddyAnchorController.
- [ ] Bridge → WellFitNativeBridge.
- [ ] AR Camera → AR Camera.

### BuddyAnchorController

- [ ] Buddy Prefab → BuddyPlaceholder Prefab.
- [ ] Bridge → WellFitNativeBridge.
- [ ] Raycast Manager → XR Origin / AR Raycast Manager.
- [ ] Anchor Manager → XR Origin / AR Anchor Manager.

### BuddyKiGuideController

- [ ] Bridge → WellFitNativeBridge.
- [ ] Dialogue Bridge → BuddyDialogueEventBridge.

### BuddyDialogueEventBridge

- [ ] Bridge → WellFitNativeBridge.

---

## 9. Build Settings

```txt
File → Build Settings
```

- [ ] Android auswählen.
- [ ] Switch Platform.
- [ ] Szene `WellFitBuddyAR` hinzufügen.
- [ ] Development Build aktivieren.
- [ ] Script Debugging optional.
- [ ] Android-Handy per USB anschließen.
- [ ] Build And Run.

---

## 10. Testablauf auf Handy

1. App starten.
2. Kamera erlauben.
3. Handy langsam über Boden/Tisch bewegen.
4. Warten, bis Plane sichtbar/erkannt ist.
5. Auf erkannte Fläche tippen.
6. Buddy sollte erscheinen.
7. Handy nach links/rechts schwenken.
8. Buddy sollte an realer Weltposition bleiben.
9. Auf zweite erkannte Fläche tippen.
10. Buddy sollte laufen oder springen.

---

## 11. Erfolgskriterien

- [ ] Kamera startet.
- [ ] ARCore-Session läuft.
- [ ] Horizontale Fläche wird erkannt.
- [ ] Erster Tap platziert Buddy.
- [ ] Buddy bleibt bei Kameraschwenk raumfest.
- [ ] Zweiter Tap bewegt Buddy zu echtem Flächenpunkt.
- [ ] Höhenunterschied nutzt JumpTo.
- [ ] Unity sendet Events in Debug Log.
- [ ] Keine Punkte/Rewards/XP werden in Unity autorisiert.

---

## 12. Typische Fehler

### Kein Plane Hit

Symptom:

```txt
onArError: No plane hit
```

Loesung:

- Handy langsamer bewegen.
- Boden besser beleuchten.
- Auf strukturierte Fläche zeigen.
- Plane Visualizer aktivieren.

### Buddy erscheint nicht

Pruefen:

- Buddy Prefab im BuddyAnchorController gesetzt?
- AR Raycast Manager gesetzt?
- AR Anchor Manager gesetzt?
- ARCore aktiviert?

### Compile-Fehler ARFoundation

Pruefen:

- AR Foundation installiert?
- ARCore XR Plugin installiert?
- Namespaces vorhanden?

### Build startet nicht auf Handy

Pruefen:

- USB-Debugging aktiv?
- Android Build Support installiert?
- ARM64 aktiv?
- Package Name gesetzt?

---

## 13. Danach

Nach erfolgreichem ersten ARCore-Test:

- [ ] Buddy-Animationen ersetzen: idle, walk, hop, land.
- [ ] Surface Nodes fuer Couch/Tisch/Kastl testen.
- [ ] Occlusion/Depth pruefen.
- [ ] Native Bridge zur WellFit-App anbinden.
- [ ] AR-Buddy-Events ans Backend weiterleiten.
- [ ] Keine Reward-Autoritaet in Unity einbauen.
