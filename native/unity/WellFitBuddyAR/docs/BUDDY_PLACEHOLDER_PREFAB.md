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

## Inspector-Felder fuer ersten Build

### BuddyController

```txt
Animator: optional leer lassen, solange es nur Placeholder-Geometrie gibt
Camera Transform: optional leer lassen oder AR Camera setzen
```

Hinweis: Ohne Animator sind `PlayIdle`, `PlayWalk`, `PlayHappy` und `PlayHop` im ersten Test unkritisch, weil sie null-safe sind.

### BuddyLookAtCamera

```txt
Camera Transform: AR Camera setzen oder leer lassen, wenn Camera.main vorhanden ist
Turn Speed: 6
Keep Upright: true
```

### BuddyNavigationController

```txt
Buddy Root: BuddyPlaceholder Root
Walk Speed: 0.45
Jump Duration: 0.55
Jump Height: 0.22
```

Wenn `Buddy Root` leer bleibt, setzt das Script im `Awake()` automatisch `transform` als Root.

### BuddyAbilityController

```txt
Navigation Controller: BuddyNavigationController am BuddyPlaceholder
Bridge: optional leer fuer ersten reinen ARCore-Test
```

Fähigkeiten wie `canClimbUp`, `canJumpBoost`, `canFetchClue`, `canScanObject`, `canCarry` bleiben im ersten Test standardmäßig `false`.

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

## Typische Prefab-Fehler

### Buddy erscheint nicht

Pruefen:

```txt
BuddyAnchorController -> Buddy Prefab gesetzt?
Body/Head Mesh sichtbar?
Scale nicht 0?
Material nicht voll transparent?
```

### Buddy bewegt sich nicht

Pruefen:

```txt
BuddyNavigationController vorhanden?
Buddy Root gesetzt oder automatisch transform?
Walk Speed groesser als 0?
Zweiter Tap trifft echte AR-Plane?
```

### Buddy schaut nicht zur Kamera

Pruefen:

```txt
BuddyLookAtCamera vorhanden?
Camera Transform gesetzt oder Camera.main vorhanden?
Keep Upright aktiviert?
```

### Compile-Fehler wegen Animator

Im ersten Placeholder-Test kann Animator leer bleiben. Nur wenn ein Animator Controller verwendet wird, muessen Trigger wie `idle`, `walk`, `happy`, `hop` im Animator existieren.

## Spaeterer Ersatz

Der Placeholder wird spaeter durch ein echtes GLB/FBX-Buddy-Modell mit Animationen ersetzt.

Root-Komponenten und Referenzen sollen gleich bleiben.
