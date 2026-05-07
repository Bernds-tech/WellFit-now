# WellFit – Alpha Retest Decision Matrix

Version: 1.0
Stand: 2026-05-01
Zweck: Entscheidung nach Unity-/Android-/AR-Buddy-Retest

---

## Grundsatz

Nach dem Retest wird nicht geraten.

Das Ergebnis entscheidet den naechsten Schritt.

---

## Fall A – Unity Compile rot

### Symptom

```txt
Unity Console zeigt rote Compile Errors.
Android Build wird nicht gestartet.
```

### Entscheidung

```txt
Nur Compilefix.
Keine Features.
Kein Refactor.
Keine Product-UI.
```

### Vorgehen

1. Ersten roten Fehler kopieren.
2. Datei/Zeile notieren.
3. Ursache beheben.
4. Unity Compile erneut pruefen.
5. Erst bei gruen weiter.

### Wahrscheinliche Dateien

```txt
WellFitNativeBridge.cs
BuddyCallDebugController.cs
BuddyDebugSceneBootstrap.cs
BuddyAbilityController.cs
BuddyKiGuideController.cs
```

---

## Fall B – Compile gruen, Android Build rot

### Symptom

```txt
Unity kompiliert, aber Android Build/Install scheitert.
```

### Entscheidung

```txt
Nur Build-/Android-Konfiguration pruefen.
Keine Runtime-Features.
```

### Moegliche Bereiche

```txt
AndroidManifest.xml
ProjectSettings
Packages
XR Settings
ARCore Loader
Player Settings
```

---

## Fall C – App startet, AR/Kamera rot

### Symptom

```txt
App startet, aber Kamera/ARCore/Plane Detection funktioniert nicht.
```

### Entscheidung

```txt
AR Foundation / ARCore Setup pruefen.
Keine Buddy-Features erweitern.
```

### Moegliche Bereiche

```txt
AR Session
AR Session Origin / XR Origin
ARRaycastManager
ARPlaneManager
ARAnchorManager
Android Permission
ARCore Settings
```

---

## Fall D – AR funktioniert, Buddy Placement rot

### Symptom

```txt
Kamera/Planes funktionieren, aber Buddy erscheint nicht.
```

### Entscheidung

```txt
BuddyAnchorController / Prefab Setup pruefen.
```

### Moegliche Ursachen

```txt
buddyPrefab fehlt
ARRaycastManager fehlt
ARAnchorManager fehlt
Bridge nicht gesetzt
Prefab Name/Instanz nicht erwartbar
```

---

## Fall E – Placement gut, Movement rot

### Symptom

```txt
Buddy erscheint, aber Bewegung zu Ziel funktioniert nicht oder bricht falsch ab.
```

### Entscheidung

```txt
NavigationController und Movement-Rejects pruefen.
```

### Moegliche Ursachen

```txt
buddyRoot fehlt
IsMoving bleibt haengen
maxWalkDistance zu niedrig
heightDifference falsch
surfaceId/target nicht gesetzt
```

---

## Fall F – Movement gut, Rueckruf rot

### Symptom

```txt
Buddy bewegt sich normal, aber Buddy rufen / Auto-Return funktioniert nicht.
```

### Entscheidung

```txt
CallBuddyToUserJson und AutoReturn Controller pruefen.
```

### Moegliche Ursachen

```txt
ScreenPoint trifft keine Plane
Buddy nicht gefunden
anchorController fehlt
autoReturnController nicht verdrahtet
cooldown/farOnly blockiert
```

---

## Fall G – Debug-Seite 3 / Abilities rot

### Symptom

```txt
Ability Buttons erzeugen Fehler oder keine Events.
```

### Entscheidung

```txt
AbilityController-Referenzen und Demo-State pruefen.
```

### Moegliche Ursachen

```txt
BuddyAbilityController fehlt
navigationController fehlt
bridge fehlt
Demo-Faehigkeiten nicht aktiv
```

---

## Fall H – Debug-Seite 4 / Guide rot

### Symptom

```txt
Guide Buttons erzeugen Fehler oder keine Events.
```

### Entscheidung

```txt
BuddyKiGuideController / DialogueBridge pruefen.
```

### Moegliche Ursachen

```txt
bridge fehlt
dialogueBridge fehlt
GuideController nicht gefunden
DebugController findet Guide nicht
```

---

## Fall I – Alles technisch gruen, Overlay schlecht bedienbar

### Symptom

```txt
Funktioniert, aber UI ist zu gross oder unpraktisch.
```

### Entscheidung

```txt
P1 starten: Debug Overlay splitten / Layout verbessern.
```

### Referenzen

```txt
BUDDY_DEBUG_OVERLAY_SPLIT_SPEC.md
RUNTIME_REFACTOR_CHECKLIST.md
BUDDY_QA_TEST_MATRIX.md
```

---

## Fall J – Alles gruen

### Entscheidung

```txt
P0.3 als bestanden markieren.
Dann P1-Reihenfolge starten.
```

P1-Reihenfolge:

```txt
1. Debug Overlay splitten
2. Product UI getrennt vorbereiten
3. Event Envelope vorbereiten
4. Tap-Zielmarker
5. Plane-Missing-Hinweis
6. Surface Quality
7. Re-Anchor pruefen
```

---

## Fall K – Security Boundary verletzt

### Symptom

```txt
Unity oder Mobile scheint Rewards, Completion, Punkte, Token, NFT oder Anti-Cheat zu autorisieren.
```

### Entscheidung

```txt
Sofort stoppen.
Architektur korrigieren.
Keine weiteren Features.
```

### Grundregel

```txt
Unity/App duerfen melden und anzeigen.
Backend entscheidet.
```

---

## Ergebnislogik

```txt
Compile rot -> Compilefix
Build rot -> Buildfix
AR rot -> AR Foundation/ARCore fix
Buddy rot -> Buddy Controller fix
Overlay schlecht -> P1 Debug-Refactor
Alles gruen -> P1 starten
Security kritisch -> Architekturfix
```

---

## Status

[x] Entscheidungsmatrix angelegt.
[ ] Retest-Ergebnis offen.
