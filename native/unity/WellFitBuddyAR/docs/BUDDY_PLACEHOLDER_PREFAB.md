# WellFitBuddyAR – Buddy Placeholder Prefab Guide

Stand: 2026-04-28

## Ziel

Der erste echte ARCore-Test braucht noch keinen finalen Drachen. Er braucht ein stabiles sichtbares Buddy-Prefab, das auf einer echten AR-Plane platziert und zu angetippten Punkten bewegt werden kann.

## Prefab-Pfad

```txt
Assets/Prefabs/BuddyPlaceholder.prefab
```

Empfohlene Ordner:

```txt
Assets/Prefabs
Assets/Materials
Assets/Models/Placeholder
Assets/Animations/Buddy
```

## Minimaler GameObject-Aufbau

```txt
BuddyPlaceholder
  Body
  Head
  LeftEye
  RightEye
  ShadowBlob
```

## Root-Komponenten

Auf `BuddyPlaceholder`:

- `BuddyController`
- `BuddyLookAtCamera`
- `BuddyNavigationController`
- `BuddyAbilityController`

Transform:

```txt
Position: 0, 0, 0
Rotation: 0, 0, 0
Scale: 1, 1, 1
```

## Erste Geometrie

### Body

```txt
Sphere
Position: 0, 0.25, 0
Scale: 0.35, 0.35, 0.35
Material: BuddyPlaceholder.mat
```

### Head

```txt
Sphere
Position: 0, 0.62, 0.12
Scale: 0.24, 0.24, 0.24
Material: BuddyPlaceholder.mat
```

### Eyes

```txt
Small Sphere
LeftEye Position: -0.07, 0.67, 0.31
RightEye Position: 0.07, 0.67, 0.31
Scale: 0.035, 0.035, 0.035
Material: EyeDark.mat
```

### ShadowBlob

```txt
Cylinder oder flache Disc
Position: 0, 0.01, 0
Scale: 0.45, 0.01, 0.45
Material: ShadowBlob.mat
```

## BuddyNavigationController Startwerte

```txt
Walk Speed: 0.45
Jump Duration: 0.55
Jump Height: 0.22
Buddy Root: BuddyPlaceholder Root
```

## Verbindung im BuddyAnchorController

Auf `WellFitARSystem`:

```txt
BuddyAnchorController -> Buddy Prefab -> BuddyPlaceholder.prefab
BuddyAnchorController -> Bridge -> WellFitNativeBridge
BuddyAnchorController -> AR Raycast Manager -> XR Origin
BuddyAnchorController -> AR Anchor Manager -> XR Origin
```

## Erwarteter erster Test

1. ARCore erkennt Flaeche.
2. Nutzer tippt auf Flaeche.
3. `BuddyPlaceholder` erscheint auf realer Flaeche.
4. Buddy bleibt beim Schwenken an Weltposition.
5. Zweiter Tap bewegt Buddy per `WalkTo`.
6. Bei Hoehenunterschied wird `JumpTo` genutzt.

## Spaeterer Ersatz

Der Placeholder wird spaeter durch ein echtes GLB/FBX-Buddy-Modell mit Animationen ersetzt.

Root-Komponenten und Referenzen sollen gleich bleiben.
