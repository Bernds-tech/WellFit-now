# Batch-Test: AR-Buddy Rueckruf, Auto-Return und Bewegungsgrenzen

Status: Sammeltest-Checkliste fuer PR #13 / `wellfit/upload-local-unity-ar-buddy`.

## Ziel

Mehrere AR-Buddy-Grundlagen in einem Android-Testlauf pruefen:

- Buddy platzieren
- Buddy manuell bewegen
- Buddy per Button zurueckrufen
- Auto-Return einmalig ausloesen
- Auto-Return kurz aktivieren/deaktivieren
- Bewegungsgrenzen und Rejection-Events beobachten

## Vor dem Build

Repository am PC:

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Unity-Projekt:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

Nicht verwenden:

```txt
C:\wellfit\WellFitBuddyAR
```

## Scene Setup

Der Debug-Aufbau wird jetzt automatisch durch diesen Bootstrap vorbereitet:

```txt
Assets/Scripts/BuddyDebugSceneBootstrap.cs
```

Beim Laden der Szene macht der Bootstrap automatisch:

1. `WellFitNativeBridge` suchen.
2. `BuddyAnchorController` suchen.
3. Falls das vorhandene Scene-Objekt `WellFitARSystem` deaktiviert ist, wird es aktiviert.
4. GameObject `BuddyCallDebug` erstellen, falls es fehlt.
5. `BuddyCallDebugController` anhaengen, falls es fehlt.
6. `BuddyCompanionAutoReturnController` anhaengen, falls es fehlt.
7. `WellFitNativeBridge` ins Feld `bridge` setzen.
8. `BuddyAnchorController` ins Feld `anchorController` setzen.
9. Auto-Return beim Start aus lassen.

Manuelles Drag-and-drop ist dadurch fuer den ersten Sammeltest nicht mehr noetig.

Trotzdem in der aktiven AR-Testszene pruefen:

- `ARRaycastManager` ist vorhanden.
- `ARAnchorManager` ist vorhanden.
- `BuddyAnchorController` ist vorhanden.
- `WellFitNativeBridge` ist vorhanden.
- `BuddyAnchorController.buddyPrefab` ist gesetzt.
- `WellFitNativeBridge.buddyAnchorController` ist gesetzt.
- `BuddyAnchorController.bridge` ist gesetzt.

## Hinweis zu zwei Eingabewegen

Die Szene enthaelt aktuell noch den alten `SimpleARPlacementTest` und zusaetzlich das modulare `WellFitARSystem`.

Fuer den Sammeltest ist das akzeptabel. Langfristig soll `SimpleARPlacementTest` nur noch als historische Working-Testscene erhalten bleiben, waehrend `WellFitARSystem` der modulare Hauptpfad wird.

## Test A – Platzierung

1. App starten.
2. Kamera-Berechtigung erlauben.
3. Boden/Tisch scannen.
4. Einmal auf gueltige Flaeche tippen.

Erwartung:

- Buddy erscheint.
- Log/Event: `onAnchorCreated`.
- Log/Event: `onBuddyPlaced`.
- Buddy bleibt raumfest.

## Test B – Manuelle Bewegung

1. Auf zweite gueltige Flaeche tippen.

Erwartung:

- Buddy laeuft oder springt zur Flaeche.
- Log/Event: `onBuddyActionStarted`.
- Log/Event: `onBuddyReachedSurface`.
- Log/Event: `onBuddyActionCompleted`.

## Test C – Buddy rufen

1. Buddy auf eine entfernte, aber nahe genug liegende Flaeche bewegen.
2. Button `Buddy rufen` antippen.

Erwartung:

- Buddy nutzt den Rueckruf-Flow.
- Zielpunkt ist ungefaehr Bildschirmmitte / leicht oberhalb.
- Bei gueltiger Flaeche laeuft Buddy zurueck.
- Bei fehlender Flaeche: `onBuddyActionRejected` mit `reason=no-plane-hit`.

## Test D – Auto-Return einmalig

1. Button `Auto-Return einmal testen` antippen.

Erwartung:

- Gleicher Rueckruf-Flow wie Test C.
- Kein Reward, keine XP, keine Completion.

## Test E – Auto-Return AN/AUS

1. Button `Auto-Return: AUS` antippen.
2. Kurz warten.
3. Wieder deaktivieren.

Erwartung:

- Controller fordert in Intervallen Rueckruf an.
- Fuer den ersten Test nur kurz aktivieren.
- Keine Endlosschleife mit Rewards oder Mission Completion.

## Test F – Bewegungsgrenzen

1. Zu weit entfernte Flaeche antippen.
2. Falls moeglich eine stark unterschiedliche Hoehe antippen.
3. Waehrend Buddy laeuft erneut tippen.

Erwartung:

- Rejection-Events statt stillem Fehler.
- Moegliche Reasons:
  - `target-too-far`
  - `height-too-large`
  - `jump-not-allowed`
  - `buddy-already-moving`
  - `no-plane-hit`

## Security-Erwartung

Unity darf in keinem Test schreiben oder autorisieren:

- Punkte
- XP
- Rewards
- Mission Completion
- Token/WFT
- NFTs
- Jackpot/Burn
- Leaderboards
- Anti-Cheat

Alle Tests sind reine AR-/Visualisierungs- und Eventtests.

## Bekannte Einschraenkung

Auto-Return ist aktuell ein sicherer Test-Hook. Er misst noch nicht selbst die echte Distanz zwischen Kamera und Buddy, sondern loest denselben Rueckruf-Flow kontrolliert aus. Die echte Companion-Radius-Kopplung folgt nach dem ersten stabilen Android-Test.
