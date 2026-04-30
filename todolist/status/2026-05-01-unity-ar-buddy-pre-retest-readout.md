# Status – Unity AR Buddy Pre-Retest Readout

Datum: 2026-05-01
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13 – Add local Unity AR Buddy companion project
Arbeitsmodus: Pre-Retest / keine riskanten Unity-Script-Stapelungen vor lokalem Compile-Test

## Kurzstand

Der aktuelle Repository-Stand bestaetigt: PR #13 ist der aktive Unity-Branch und enthaelt das lokale Unity-Projekt unter `native/unity/WellFitBuddyAR`. Der erste Android-ARCore-Smoke-Test war erfolgreich. Der danach eingebaute Debug-/Diagnose-Batch ist noch nicht erneut lokal in Unity kompiliert oder auf Android getestet.

PR #12 bleibt als separates Todo-/Konzept-PR offen. PR #13 ist fuer die naechste Unity-Arbeit massgeblich.

## Gelesene Kernbereiche

- `todolist/NEXT_CHAT_HANDOFF_PROMPT.md`
- `todolist/CHAT_START_PROMPT.md`
- `todolist/AUTONOMOUS_ITERATION_MODE.md`
- `todolist/README.md`
- `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`
- `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md`
- `todolist/status/2026-04-30-unity-ar-buddy-debug-batch-handoff.md`
- `native/unity/WellFitBuddyAR/docs/NEXT_AR_BUDDY_EXTENSION_BATCH.md`
- `native/unity/WellFitBuddyAR/docs/BUDDY_EVENT_CONTRACT.md`
- Unity-Scripts im AR-Buddy-Pfad, insbesondere Bridge, Bootstrap, Debug Overlay, Anchor, Navigation, Auto-Return, Ability, KI-Guide, Buddy Visuals und Look-at-Camera.

## Code-Readout vor lokalem Unity-Test

### 1. Bridge / Eventgrenze

`WellFitNativeBridge` sammelt Eventdiagnosen und sendet nur AR-/Buddy-/Guide-Events per `SendEventToWellFit`. Die Bridge autorisiert keine Rewards, XP, Punkte, Token, NFT, Mission Completion, Leaderboards, Jackpot, Burn oder Anti-Cheat.

Aktuelle Eventdiagnose:

- letzter Eventname
- letzter Payload
- Eventzaehler
- gekuerzte Payload-Anzeige fuer Debug Overlay

### 2. Debug Bootstrap

`BuddyDebugSceneBootstrap` installiert zur Laufzeit ein Debug-Objekt `BuddyCallDebug`, haengt `BuddyCompanionAutoReturnController` und `BuddyCallDebugController` an und verdrahtet Bridge, Anchor und Auto-Return.

Das ist fuer den naechsten Retest sinnvoll, weil kein riskanter YAML-/Prefab-Patch noetig ist. Danach sollte das Debug Overlay sauberer hinter Dev-Flag oder in eine Dev-Szene verschoben werden.

### 3. Debug Overlay

`BuddyCallDebugController` ist bewusst gross und testorientiert. Es enthaelt vier Seiten:

1. Rueckruf & Auto-Return
2. Visuals & Verhalten
3. Faehigkeiten & Events
4. KI-Guide & Missionen

Bewertung:

- gut fuer schnellen Android-Retest
- nicht als Produktions-UI geeignet
- nach Retest refaktorieren oder per Dev-Flag ausblenden

### 4. Anchor / Surface / Recall

`BuddyAnchorController` behandelt Placement, Move und Call-to-user ueber ARRaycast auf `PlaneWithinPolygon`. Ungueltige Plane-Hits werden abgelehnt und als AR-/Buddy-Reject-Events gemeldet.

Noch offen nach Retest:

- Re-Anchor nach erfolgreicher Bewegung/Rueckruf stabilisieren
- Surface-Quality einfuehren
- Plane-Missing-Hinweis sichtbar machen
- Tap-Zielmarker ergaenzen

### 5. Navigation / Movement Policy

`BuddyNavigationController` begrenzt Bewegung aktuell ueber:

- `maxWalkDistanceMeters`
- `maxJumpHeightDifferenceMeters`
- `reachedDistanceMeters`
- Reject-Reasons wie `target-too-far`, `height-too-large`, `jump-not-allowed`, `buddy-already-moving`

Das passt zur Sicherheitsrichtung: Unity visualisiert Bewegung und lehnt lokale AR-Ziele ab, trifft aber keine Reward-/Completion-Entscheidung.

### 6. Auto-Return / Companion Radius

`BuddyCompanionAutoReturnController` berechnet Kamera-Buddy-Abstand horizontal, bietet Test- und Produkt-Distanz-Presets und kann manuell oder automatisch Rueckruf ausloesen.

Wichtig fuer Retest:

- Test-Abstand: Nah/Fern auf kurze Werte pruefen
- Produkt-Abstand: 5 m / 25 m nur Diagnose, nicht direkt als finaler Produktstandard behandeln
- pruefen, ob BuddyTransform immer gefunden wird (`RuntimeBuddyPlaceholder`, `RuntimeGreenBuddyBall`, `BuddyPlaceholder(Clone)`, `BuddyPlaceholder`)

### 7. Ability / Guide Event Wiring

`BuddyAbilityController` und `BuddyKiGuideController` bleiben preview-/diagnoseorientiert. Sie melden Faehigkeitsstarts, Rejects, Mission Suggestions und fehlende Faehigkeiten.

Test-Risiko:

Falls `bridge` oder `dialogueBridge` in Prefab/Scene nicht serialisiert sind, koennen Ability-/Guide-Buttons zwar interne Diagnosewerte aendern, aber keine Bridge-Events senden. Das ist kein Security-Problem, aber beim Retest in Seite 3/4 gezielt zu pruefen.

## Sicherheitsbewertung

Bisher im gelesenen Unity-Code nicht gefunden:

- keine Punktevergabe
- keine XP-Vergabe
- keine Token-/WFT-Logik
- keine NFT-Logik
- keine Jackpot-/Burn-Logik
- keine Mission-Completion-Autorisierung
- keine Leaderboard-Autorisierung
- keine Anti-Cheat-Entscheidung

Damit bleibt die harte Grenze eingehalten: Unity visualisiert und meldet nur AR-/Buddy-/Guide-Events. App/Backend bleiben Autoritaet.

## Naechster zwingender PC-Schritt

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Unity-Projekt oeffnen:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

Dann:

1. Unity Import/Compile abwarten.
2. Console Errors zuerst beheben.
3. Android Build/Run ausfuehren.
4. 4 Debug-Seiten in der Reihenfolge testen:
   - Rueckruf & Auto-Return
   - Visuals & Verhalten
   - Faehigkeiten & Events
   - KI-Guide & Missionen
5. Logcat/Unity Console auf Eventnamen, NullReferenceExceptions und ARCore-/Raycast-Fehler pruefen.

## Konkrete Micro-Tasks nach lokalem Retest

Wenn Compile-Fehler auftreten:

1. Exakten Unity-Console-Fehler in den Chat geben.
2. Zuerst Compile-Fix im betroffenen Script.
3. Danach keine Feature-Erweiterung, bis Build wieder startet.

Wenn Compile gruen und Android-Retest gut ist:

1. Debug Overlay hinter Dev-Flag legen.
2. Ability-/Guide-Bridge-Referenzen robust setzen.
3. Tap-Zielmarker ergaenzen.
4. Plane-Missing-Hinweis ergaenzen.
5. Surface-Quality-Diagnose einfuehren.
6. Re-Anchor nach erfolgreichem Move/Return planen oder implementieren.
7. Companion-Radius mit echter Kamera-Buddy-Distanz finalisieren.

## Nicht tun vor Retest

- Keine weiteren grossen Runtime-Scripts stapeln.
- Keine Scene-/Prefab-YAML manuell riskant patchen.
- Keine Reward-/Economy-/Completion-Logik in Unity einbauen.
- Keine Library/Temp/Logs/Obj/Build/Builds/node_modules/APK-Dateien committen.
