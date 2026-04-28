# WellFitBuddyAR – First Phone AR Buddy Test

Stand: 2026-04-28

## Ziel

Diese Datei ist die kompakte Testkarte fuer den ersten echten Handy-Test.

Erfolg bedeutet:

```txt
Tap 1 -> Buddy wird auf realer ARCore-Plane platziert
Kameraschwenk -> Buddy bleibt raumfest
Tap 2 -> Buddy bewegt sich zu einem zweiten realen Plane-Punkt
Unity -> meldet nur AR-Events, keine Rewards/XP/Punkte/Completion
```

---

## 1. Vor dem Unity-Start

- [ ] Unity 2022.3 LTS mit Android Build Support installiert.
- [ ] AR Foundation installiert.
- [ ] ARCore XR Plugin installiert.
- [ ] XR Plugin Management aktiviert.
- [ ] Android / ARCore im XR Plugin Management aktiviert.
- [ ] Android-Handy ist ARCore-faehig.
- [ ] USB-Debugging ist aktiv.
- [ ] Raum ist hell genug und hat strukturierte Flaechen.

---

## 2. Scripts kopieren

Im Repo/Projektordner ausfuehren:

```bash
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.sh
```

oder Windows PowerShell:

```powershell
cd native/unity/WellFitBuddyAR
./tools/copy-scripts.ps1
```

Pflicht-Erfolg:

```txt
Event contract audit passed
```

Nicht weitermachen, wenn alte Eventnamen gemeldet werden.

---

## 3. Szene pruefen

Pflichtobjekte:

- [ ] AR Session.
- [ ] XR Origin.
- [ ] AR Camera.
- [ ] AR Plane Manager am XR Origin.
- [ ] AR Raycast Manager am XR Origin.
- [ ] AR Anchor Manager am XR Origin.
- [ ] WellFitARSystem.
- [ ] BuddyPlaceholder Prefab.

WellFitARSystem:

- [ ] WellFitNativeBridge.
- [ ] BuddyInputController.
- [ ] BuddyAnchorController.
- [ ] BuddyKiGuideController.
- [ ] BuddyDialogueEventBridge.

BuddyPlaceholder:

- [ ] sichtbarer Body/Head/Mesh.
- [ ] BuddyController.
- [ ] BuddyLookAtCamera.
- [ ] BuddyNavigationController.
- [ ] BuddyAbilityController.

---

## 4. Kritische Inspector-Referenzen

BuddyInputController:

- [ ] Anchor Controller -> BuddyAnchorController.
- [ ] Bridge -> WellFitNativeBridge.
- [ ] AR Camera -> AR Camera.
- [ ] Place On First Tap aktiviert.
- [ ] Move On Next Taps aktiviert.

BuddyAnchorController:

- [ ] Buddy Prefab -> BuddyPlaceholder.prefab.
- [ ] Bridge -> WellFitNativeBridge.
- [ ] AR Raycast Manager -> XR Origin.
- [ ] AR Anchor Manager -> XR Origin.
- [ ] Jump Height Threshold Meters ca. 0.12.

BuddyNavigationController:

- [ ] Walk Speed ca. 0.45.
- [ ] Jump Duration ca. 0.55.
- [ ] Jump Height ca. 0.22.
- [ ] Reached Distance Meters ca. 0.02.

---

## 5. Testablauf am Handy

1. App starten.
2. Kamera erlauben.
3. Handy langsam ueber Boden/Tisch bewegen.
4. Warten, bis eine Plane sichtbar oder stabil erkannt ist.
5. Tap 1 auf erkannte Flaeche.
6. Buddy erscheint.
7. Handy langsam schwenken.
8. Buddy bleibt im Raum an derselben Position.
9. Tap 2 auf andere erkannte Flaeche.
10. Buddy laeuft bei kleinem Hoehenunterschied.
11. Buddy springt bei groesserem Hoehenunterschied.

---

## 6. Erwartete Logs

```txt
WellFit AR Event: onAnchorCreated ...
WellFit AR Event: onBuddyPlaced ...
WellFit AR Event: onBuddyActionStarted {"action":"placeFromTap"...}
WellFit AR Event: onBuddyActionStarted {"action":"walkToSurface"...}
WellFit AR Event: onBuddyReachedSurface ...
WellFit AR Event: onBuddyActionCompleted {"action":"walkToSurface"...}
```

Bei Hoehenunterschied:

```txt
WellFit AR Event: onBuddyActionStarted {"action":"jumpToSurface"...}
WellFit AR Event: onBuddyActionCompleted {"action":"jumpToSurface"...}
```

---

## 7. Fehlerdiagnose

### Tap 1 trifft keine Plane

Erwarteter Fehler:

```txt
onArError {"code":"ar-no-plane-hit"}
```

Massnahmen:

- [ ] Handy langsamer bewegen.
- [ ] Bessere Beleuchtung.
- [ ] Texturierten Boden/Tisch verwenden.
- [ ] Plane Visualizer aktivieren.

### Buddy erscheint nicht

Pruefen:

- [ ] Buddy Prefab gesetzt?
- [ ] Mesh sichtbar und Scale sinnvoll?
- [ ] AR Raycast Manager gesetzt?
- [ ] AR Anchor Manager gesetzt?
- [ ] ARCore im XR Plugin Management aktiv?

### Buddy klebt am Display

Pruefen:

- [ ] Buddy ist Kind des ARAnchor-Transforms.
- [ ] Buddy wird nicht vor AR Camera gepinnt.
- [ ] AR Session laeuft wirklich.
- [ ] XR Origin korrekt eingerichtet.

### Tap 2 bewegt nicht

Pruefen:

- [ ] Erster Tap war erfolgreich.
- [ ] Zweiter Tap trifft eine Plane.
- [ ] BuddyNavigationController ist am Prefab.
- [ ] Walk Speed > 0.

---

## 8. Sicherheitscheck

In Unity bleibt verboten:

- [ ] Punktevergabe.
- [ ] XP-Vergabe.
- [ ] Reward-Freigabe.
- [ ] Mission Completion.
- [ ] Token-/WFT-Logik.
- [ ] Jackpot-/Burn-Logik.
- [ ] Leaderboard-Autoritaet.

Unity meldet nur AR-Events. App/Backend entscheiden spaeter ueber Evidence, Review, Completion und interne Rewards.
