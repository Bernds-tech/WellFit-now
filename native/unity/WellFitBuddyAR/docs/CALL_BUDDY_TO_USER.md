# Call Buddy To User – Unity Bridge

Status: vorbereitet fuer PR #13 / `wellfit/upload-local-unity-ar-buddy`.

## Ziel

Der Nutzer oder die App kann den AR-Buddy zurueck in Nutzernaehe rufen, ohne dass Unity Punkte, Rewards, Mission Completion oder Anti-Cheat-Entscheidungen trifft.

Unity bleibt reine AR-/Visualisierungs- und Event-Schicht.

## Neuer Bridge-Aufruf

```csharp
CallBuddyToUserJson(string payloadJson)
```

Beispiel-Payload:

```json
{
  "x": 0.5,
  "y": 0.35
}
```

`x` und `y` koennen normalisiert (`0..1`) oder als Pixelwerte uebergeben werden. Ohne gueltige Werte nutzt Unity standardmaessig einen Punkt mittig/leicht oberhalb der Bildschirmmitte, damit per AR-RayCast eine reale Flaeche nahe beim Nutzer gesucht wird.

## Ablauf

1. App ruft `WellFitNativeBridge.CallBuddyToUserJson(...)` auf.
2. `WellFitNativeBridge` berechnet den Screen-Point.
3. `BuddyAnchorController.CallBuddyToScreenPoint(...)` raycastet auf `TrackableType.PlaneWithinPolygon`.
4. Bei gueltiger Flaeche laeuft der Buddy via `BuddyNavigationController.WalkTo(...)` zur Zielposition.
5. Unity meldet nur AR-Events wie `onBuddyActionStarted`, `onBuddyReachedSurface`, `onBuddyActionCompleted` oder `onBuddyActionRejected`.

## Sicherheitsgrenze

Unity darf bei diesem Flow niemals autorisieren:

- Punkte
- XP
- Rewards
- Mission Completion
- Token/WFT
- NFTs
- Jackpot/Burn
- Leaderboards
- Anti-Cheat

Die App/Backend-Schicht entscheidet spaeter, ob ein AR-Event relevant, plausibel oder rewardfaehig ist.

## Unity-Scene-Anbindung

In der Unity-Szene muessen verbunden sein:

- `WellFitNativeBridge.buddyAnchorController`
- `BuddyAnchorController.bridge`
- `BuddyAnchorController.raycastManager`
- `BuddyAnchorController.anchorManager`
- `BuddyAnchorController.buddyPrefab`
- optional vorhandener `BuddyNavigationController`

## Debug-Button im Testbuild

Fuer den schnellen lokalen Test gibt es:

```txt
Assets/Scripts/BuddyCallDebugController.cs
```

Scene-Setup:

1. In der AR-Szene ein leeres GameObject erstellen, z. B. `BuddyCallDebug`.
2. `BuddyCallDebugController` an dieses GameObject haengen.
3. Das `WellFitNativeBridge`-Objekt in das Feld `bridge` ziehen.
4. `showDebugButton` aktiv lassen.
5. Build starten.
6. Unten im Bild erscheint der Button `Buddy rufen`.

Der Button ruft intern auf:

```csharp
CallBuddyToUserJson("{\"x\":0.5,\"y\":0.35}")
```

## Manueller Test

1. AR-Szene starten.
2. Boden oder Tisch scannen.
3. Buddy per Tap platzieren.
4. Buddy weiter weg auf eine andere erkannte Flaeche bewegen.
5. Button `Buddy rufen` antippen oder `CallBuddyToUserJson({"x":0.5,"y":0.35})` ausloesen.
6. Erwartung: Buddy laeuft zur naechsten erkannten Flaeche in Nutzernaehe.
7. Wenn keine Flaeche gefunden wird, muss `onBuddyActionRejected` mit `reason=no-plane-hit` geloggt werden.

## Naechste Schritte

- App-/Button-Befehl mit `CallBuddyToUserJson` verbinden.
- Debug-UI im Unity-Testbuild auf echtem Android-Geraet pruefen.
- Spaeter Re-Anchor nach Rueckkehr sauber ausbauen.
- Spaeter Companion-Radius und automatische Rueckkehr an denselben Flow anschliessen.
