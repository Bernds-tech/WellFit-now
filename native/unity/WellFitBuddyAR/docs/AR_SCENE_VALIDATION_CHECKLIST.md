# WellFitBuddyAR – AR Scene Validation Checklist

Stand: 2026-04-28

## Ziel

Diese Checkliste wird nach dem Aufbau der Unity-Szene verwendet, um zu prüfen, ob der echte AR-Buddy technisch korrekt verdrahtet ist.

Ziel:

```txt
Tap 1 -> Buddy auf realer Plane platzieren
Tap 2 -> Buddy zu realem Plane-Punkt bewegen
Kameraschwenk -> Buddy bleibt an Weltposition
```

## 0. Script Copy / Event Contract Audit

Vor der Szene-Validierung muss das Copy-Skript erfolgreich gelaufen sein.

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

Pflicht-Ergebnis:

```txt
Event contract audit passed
```

- [ ] C#-Vorlagen wurden nach `Assets/Scripts/*.cs` kopiert.
- [ ] Event Contract Audit wurde bestanden.
- [ ] Keine alten AR-Eventnamen in `Assets/Scripts/*.cs` vorhanden.

## 1. Scene Objects vorhanden

- [ ] `AR Session` vorhanden.
- [ ] `XR Origin` vorhanden.
- [ ] `AR Camera` vorhanden.
- [ ] `AR Plane Manager` am XR Origin vorhanden.
- [ ] `AR Raycast Manager` am XR Origin vorhanden.
- [ ] `AR Anchor Manager` am XR Origin vorhanden.
- [ ] `WellFitARSystem` vorhanden.

## 2. WellFitARSystem Komponenten

- [ ] `WellFitNativeBridge` vorhanden.
- [ ] `BuddyInputController` vorhanden.
- [ ] `BuddyAnchorController` vorhanden.
- [ ] `BuddyKiGuideController` vorhanden.
- [ ] `BuddyDialogueEventBridge` vorhanden.

## 3. WellFitNativeBridge Referenzen

- [ ] Buddy Anchor Controller gesetzt.
- [ ] Buddy Input Controller gesetzt.
- [ ] Buddy Ki Guide Controller gesetzt.

## 4. BuddyInputController Referenzen

- [ ] Anchor Controller gesetzt.
- [ ] Bridge gesetzt.
- [ ] AR Camera gesetzt.
- [ ] Place On First Tap aktiviert.
- [ ] Move On Next Taps aktiviert.

## 5. BuddyAnchorController Referenzen

- [ ] Buddy Prefab gesetzt.
- [ ] Bridge gesetzt.
- [ ] AR Raycast Manager gesetzt.
- [ ] AR Anchor Manager gesetzt.

## 6. Buddy Prefab

- [ ] `BuddyPlaceholder.prefab` existiert.
- [ ] Prefab hat sichtbaren Mesh-Teil.
- [ ] Prefab hat `BuddyController`.
- [ ] Prefab hat `BuddyLookAtCamera`.
- [ ] Prefab hat `BuddyNavigationController`.
- [ ] Prefab hat `BuddyAbilityController`.
- [ ] Scale ist fuer AR sichtbar, aber nicht riesig.

Empfohlener Start:

```txt
Scale Root: 1,1,1
Body Sphere: ca. 0.35m
Head Sphere: ca. 0.24m
```

## 7. AR Plane Detection

- [ ] Im Test erscheinen erkannte Planes oder Debug-Visualisierung.
- [ ] Boden wird nach langsamem Kameraschwenk erkannt.
- [ ] Tisch/Couch wird optional erkannt, wenn ARCore genug Merkmale findet.

Wenn keine Plane erkannt wird:

```txt
Mehr Licht
Handy langsamer bewegen
Texturierten Boden/Tisch verwenden
Plane Visualizer aktivieren
```

## 8. Tap 1 – Platzierung

Erwartung:

- [ ] Erster Tap auf erkannte Plane erzeugt Raycast-Hit.
- [ ] ARAnchor wird erstellt.
- [ ] Buddy wird am Anchor erzeugt.
- [ ] Event `onBuddyPlaced` wird geloggt.

Fehlerbilder:

```txt
onArError: No plane hit
onArError: Anchor creation failed
onArError: BuddyAnchorController missing
```

## 9. Kameraschwenk-Test

Nach Platzierung:

- [ ] Handy langsam nach links/rechts schwenken.
- [ ] Buddy bleibt an realer Weltposition.
- [ ] Buddy klebt nicht am Bildschirm.
- [ ] Buddy skaliert/perspektivisch plausibel.

Wenn Buddy am Bildschirm klebt:

```txt
Kein echter ARAnchor oder falsche Parent-Hierarchie
Buddy nicht an Anchor Transform gebunden
AR Foundation Setup pruefen
```

## 10. Tap 2 – Bewegung

Erwartung:

- [ ] Zweiter Tap auf erkannte Plane ruft `MoveBuddyToScreenPoint`.
- [ ] Buddy nutzt `WalkTo`, wenn Hoehenunterschied klein ist.
- [ ] Buddy nutzt `JumpTo`, wenn Hoehenunterschied groesser ist.
- [ ] Event `onBuddyActionStarted` wird geloggt.

## 11. Debug Logs pruefen

Erwartete Logs:

```txt
WellFit AR Event: onArReady ...
WellFit AR Event: onBuddyPlaced ...
WellFit AR Event: onBuddyActionStarted { action: walkToSurface }
WellFit AR Event: onBuddyActionStarted { action: jumpToSurface }
```

## 12. Sicherheitscheck

In Unity darf nicht passieren:

- [ ] Keine Punktevergabe.
- [ ] Keine XP-Vergabe.
- [ ] Keine Reward-Freigabe.
- [ ] Keine Mission Completion.
- [ ] Keine Token-/WFT-Logik.
- [ ] Keine Jackpot-/Burn-Logik.

Unity darf nur AR-Events melden.

## 13. Erfolgskriterium fuer v1

Der erste echte AR-Prototyp gilt als technisch erfolgreich, wenn:

```txt
Buddy erscheint auf echter erkannter Flaeche
Buddy bleibt beim Schwenken raumfest
Buddy bewegt sich zu zweitem Tap-Punkt
Keine Reward-/Punkte-Autoritaet in Unity
```
