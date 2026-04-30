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

In der aktiven AR-Testszene pruefen:

- `ARRaycastManager` ist vorhanden.
- `ARAnchorManager` ist vorhanden.
- `BuddyAnchorController` ist vorhanden.
- `WellFitNativeBridge` ist vorhanden.
- `BuddyAnchorController.buddyPrefab` ist gesetzt.
- `WellFitNativeBridge.buddyAnchorController` ist gesetzt.
- `BuddyAnchorController.bridge` ist gesetzt.

Optional fuer Batch-Test:

1. Leeres GameObject `BuddyCallDebug` erstellen.
2. `BuddyCallDebugController` anhaengen.
3. `BuddyCompanionAutoReturnController` anhaengen.
4. In `BuddyCallDebugController.bridge` die `WellFitNativeBridge` setzen.
5. In `BuddyCallDebugController.autoReturnController` den Auto-Return-Controller setzen.
6. In `BuddyCompanionAutoReturnController.anchorController` den `BuddyAnchorController` setzen.
7. `BuddyCompanionAutoReturnController.autoReturnEnabled` zuerst aus lassen.

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
