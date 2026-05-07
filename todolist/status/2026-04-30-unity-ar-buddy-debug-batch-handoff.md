# Status – Unity AR Buddy Debug-Batch Handoff

Datum: 2026-04-30
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13 – Add local Unity AR Buddy companion project

## Kurzstand

Der lokale Unity-ARCore-Smoke-Test war erfolgreich. Kamera, ARCore, Plane/Raycast, Buddy-Anzeige, Bewegung und Debug-Buttons liefen auf dem Samsung-Testgeraet ohne sichtbare Fehler.

Danach wurde ein umfangreicher, aber weiterhin rein visueller/diagnostischer Unity-Debug-Batch eingebaut. Dieser Batch ist noch nicht erneut in Unity kompiliert oder auf Android getestet.

## Skalierbarkeitsbewertung

Die aktuelle Loesung ist fuer den naechsten Testlauf bewusst modular genug aufgebaut:

- `WellFitNativeBridge` sammelt und sendet Events, autorisiert aber nichts.
- `BuddyAnchorController` verantwortet AR-Raycasts, Anchor-/Surface-Diagnosen und Platzierungs-/Move-/Recall-Flows.
- `BuddyNavigationController` kapselt Walk/Jump, Distanz-/Hoehenregeln und Navigation-Diagnose.
- `BuddyCompanionAutoReturnController` kapselt Auto-Return, Timer, Cooldown, Distanzschwellen und Diagnose.
- `BuddyAbilityController` kapselt nur Faehigkeits-Events und Rejects, keine Freischaltungen/Rewards.
- `BuddyKiGuideController` kapselt KI-Guide-/Missionsempfehlungs-Diagnosen, bleibt preview-only.
- `BuddyCallDebugController` ist aktuell bewusst ein Dev-/Test-Overlay und sollte spaeter aus Produktlogik herausgeloest oder per Dev-Flag deaktiviert werden.

Wichtig: Das Debug-Overlay ist inzwischen gross. Fuer den naechsten Build ist das okay, weil es den Test beschleunigt. Danach sollte es in eine sauberere Dev-Schicht ausgelagert werden.

## Eingebaute Testbereiche

1. AR-Buddy platzieren/bewegen.
2. Buddy rufen / Return-to-user.
3. Auto-Return mit Countdown, Cooldown, Far-only und Distanz-Presets.
4. Buddy found/not-found Diagnose.
5. Navigation-Diagnose: Action, Moving, Ziel-Surface, Distanz, Hoehe, Reject-Reason.
6. Anchor-Diagnose: Anchor-Status, Raycast-Status, Surface-ID, Hit-Position.
7. Bridge-Diagnose: Event-Zaehler, letztes Event, gekuerzter Payload.
8. Ability-Diagnose: aktive Faehigkeiten, Start-/Reject-Zaehler, letzte/abgelehnte Faehigkeit.
9. Ability-Testbuttons: Scan, Hinweis holen, Klettern, Sprung, Tragen, Zeigen.
10. Idle-Breathing/Bobbing.
11. Look-at-camera mit Distanzschutz.
12. KI-Guide-Diagnose: Mission, Reason, letztes Guide-Event, Zaehler.
13. KI-Guide-Testbuttons: Walk-Mission, Scan-Mission, fehlender JumpBoost, Guide leeren.
14. Debug-Overlay mit vier Seiten und Diagnose an/aus.

## Naechster zwingender Schritt

Am PC:

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Unity oeffnen:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

Dann:

1. Unity compile/import abwarten.
2. Console auf Fehler pruefen.
3. Falls Compile-Fehler auftreten: zuerst diese beheben.
4. Android Build/Run ausfuehren.
5. Vier Debug-Seiten testen.
6. Ergebnisse dokumentieren.

## Testreihenfolge

1. Szene starten und Kamera/ARCore bestaetigen.
2. Buddy platzieren.
3. Buddy bewegen.
4. Seite `Rueckruf`: Buddy rufen, Rueckruf testen, Auto AN/AUS, Far-only, Timing, Abstand-Presets.
5. Seite `Visual`: Idle AN/AUS, Blick AN/AUS.
6. Seite `Faehigk.`: Faehigkeiten AUS testen, dann AN testen, Scan, Hinweis, Tragen, Zeigen, Klettern, Sprung.
7. Seite `Guide`: Walk-Mission, Scan-Mission, fehlender Sprungboost, Guide leeren.
8. Diagnose ausblenden und pruefen, ob Bedienung praktikabel bleibt.

## Sicherheitsgrenzen

Unity bleibt reine AR-/Visualisierungs-/Event-Schicht.

Unity darf niemals autorisieren:

- Punkte
- XP
- Rewards
- Mission Completion
- Token/WFT
- NFTs
- Jackpot/Burn
- Leaderboards
- Anti-Cheat

Backend/App bleiben Autoritaet fuer Rewards, Items, Faehigkeiten, Completion, Economy und Security.

## Offene technische Risiken

1. Der Debug-Batch ist nach dem erfolgreichen Smoke-Test noch nicht kompiliert worden.
2. `BuddyCallDebugController` ist gross geworden und sollte spaeter refaktoriert werden.
3. OnGUI ist fuer Debug okay, aber nicht finale Produktions-UI.
4. Scene-/Prefab-Setup wurde absichtlich nicht hart in YAML gepatcht; Bootstrap setzt Debug-Komponenten automatisch.
5. Re-Anchor nach Rueckruf/Move ist noch nicht final.
6. Echte Companion-Radius-Logik ist vorbereitet, aber noch nicht final produktlogisch angebunden.
7. Tap-Zielmarker, Surface-Quality und Plane-Missing-Hinweise fehlen noch.

## Empfohlene naechste Micro-Tasks nach Retest

1. Compile-/Runtime-Fehler beheben.
2. Debug-Overlay hinter Dev-Flag legen.
3. Debug-UI aus `BuddyCallDebugController` in kleinere Debug-Komponenten splitten.
4. Tap-Zielmarker ergaenzen.
5. Plane-Missing-Hinweis im AR-Test anzeigen.
6. Surface-Quality / Hit-Quality einfuehren.
7. Re-Anchor nach erfolgreicher Bewegung stabilisieren.
8. Companion-Radius mit echter Kamera-Buddy-Distanz verbinden.
9. Unity-Events mit App-/Backend-Eventvertrag abgleichen.
10. Danach erst weitere Produktlogik/Backend-Kopplung.
