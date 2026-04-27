# WellFitBuddyAR – Unity Setup Checklist

Stand: 2026-04-27

## Lokale Voraussetzungen

- [ ] Unity Hub installieren/öffnen.
- [ ] Unity 2022.3 LTS installieren.
- [ ] Android Build Support installieren.
- [ ] Android SDK & NDK Tools installieren.
- [ ] OpenJDK über Unity-Installer mitinstallieren.
- [ ] iOS Build Support später auf macOS installieren.

## Projekt erzeugen

- [ ] Unity Hub öffnen.
- [ ] Neues Projekt erzeugen.
- [ ] Template: 3D Core oder URP Mobile prüfen.
- [ ] Projektname: `WellFitBuddyAR`.
- [ ] Pfad: `native/unity/WellFitBuddyAR`.
- [ ] Projekt einmal öffnen und speichern.

## Pakete installieren

Unity Package Manager:

- [ ] AR Foundation installieren.
- [ ] ARCore XR Plugin installieren.
- [ ] ARKit XR Plugin installieren.
- [ ] XR Plugin Management installieren.
- [ ] Input System optional später.

Project Settings:

- [ ] XR Plugin Management aktivieren.
- [ ] Android: ARCore aktivieren.
- [ ] iOS: ARKit aktivieren.
- [ ] Android Minimum API prüfen.
- [ ] Camera Permission / ARCore Requirements prüfen.

## Szene anlegen

- [ ] Szene `WellFitBuddyAR` anlegen.
- [ ] AR Session anlegen.
- [ ] XR Origin anlegen.
- [ ] AR Camera prüfen.
- [ ] AR Plane Manager hinzufügen.
- [ ] AR Raycast Manager hinzufügen.
- [ ] AR Anchor Manager hinzufügen.
- [ ] AR Occlusion Manager optional später hinzufügen.
- [ ] Buddy Placeholder anlegen.

## Scripts übernehmen

Vorlagen aus:

```txt
native/unity/WellFitBuddyAR/Scripts/*.cs.txt
```

nach Unity-Projekt kopieren als:

```txt
Assets/Scripts/*.cs
```

Minimal:

- [ ] `WellFitNativeBridge.cs`
- [ ] `BuddyController.cs`
- [ ] `BuddyAnchorController.cs`
- [ ] `BuddyLookAtCamera.cs`
- [ ] `BuddySurfaceNode.cs`
- [ ] `BuddyNavigationController.cs`
- [ ] `BuddyAbilityController.cs`

## Erster Android ARCore Build

- [ ] Android-Gerät mit ARCore-Unterstützung anschließen.
- [ ] USB-Debugging aktivieren.
- [ ] Build Settings -> Android auswählen.
- [ ] Player Settings prüfen.
- [ ] Development Build aktivieren.
- [ ] Build & Run testen.

## Erfolgskriterien erster Build

- [ ] Kamera startet.
- [ ] AR Session läuft.
- [ ] Horizontale Fläche wird erkannt.
- [ ] Tap auf Fläche setzt Anchor.
- [ ] Buddy Placeholder erscheint am Anchor.
- [ ] Buddy bleibt beim Schwenken an Weltposition.
- [ ] Buddy schaut zur Kamera.
- [ ] Keine Rewards/XP/Punkte werden in Unity autorisiert.
