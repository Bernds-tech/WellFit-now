# Issue #8 – AR-Buddy Implementation Log

Stand: 2026-04-28

## Fokus

Issue #8: `AR-Buddy: Bewegungsverhalten wie Referenzvideo umsetzen`

Ziel des aktuellen Arbeitsblocks:

```txt
Erster echter Handy-Test:
Buddy wird auf realer Flaeche platziert,
bleibt beim Kameraschwenk raumfest,
und bewegt sich zu einem zweiten Tap-Punkt.
```

Keine Missionslogik, keine Punkte, keine XP, keine Rewards, keine Completion in Unity.

---

## Umgesetzte Micro-Tasks

### 1. Tap-State gehaertet

Datei:

```txt
Scripts/BuddyInputController.cs.txt
```

Aenderung:

- `PlaceBuddyAtScreenPoint(...)` wird jetzt als boolescher Erfolgspfad behandelt.
- `buddyHasBeenPlaced` wird nur noch gesetzt, wenn die AR-Plane wirklich getroffen und der Buddy wirklich platziert wurde.
- Fehlende Controller melden jetzt erlaubte `onArError`-Events mit Code.
- Ignorierte Taps melden `onBuddyActionRejected` statt generischem Fehler.

Warum wichtig:

Vorher konnte ein fehlgeschlagener erster Tap intern trotzdem als platziert gelten. Dadurch waere Tap 2 als Move interpretiert worden, obwohl noch kein echter Buddy-Anchor existierte.

### 2. AR Foundation Pfad explizit gemacht

Datei:

```txt
Scripts/BuddyAnchorController.cs.txt
```

Aenderung:

- AR Foundation Namespaces sind jetzt direkter Bestandteil der Vorlage.
- Raycast Manager und Anchor Manager sind explizite Inspector-Felder unter `AR Foundation`.
- Fehlende Prefab-/Raycast-/Anchor-Referenzen melden konkrete `onArError`-Codes.

Warum wichtig:

Der erste echte Android-Test soll klar scheitern, wenn AR Foundation Setup fehlt, statt still in einen Demo-/Fallback-Pfad zu laufen.

### 3. Anchor-/Surface-Events ergaenzt

Datei:

```txt
Scripts/BuddyAnchorController.cs.txt
```

Aenderung:

- Platzierung erzeugt jetzt `onAnchorCreated`.
- `onBuddyPlaced` enthaelt `anchorId`, `surfaceId`, `status` und `source`.
- Bewegung enthaelt `surfaceId` und vorhandenen `anchorId`.

Warum wichtig:

Diese IDs sind die spaetere Bruecke zu Evidence-/Review-/Backend-Events, ohne Unity Reward- oder Completion-Autoritaet zu geben.

### 4. Navigation meldet Erreichen des Zielpunkts

Datei:

```txt
Scripts/BuddyNavigationController.cs.txt
```

Aenderung:

- `SetBridge(...)` und `SetTargetSurfaceId(...)` ergaenzt.
- Walk und Jump speichern aktuelle Aktion.
- Nach Zielerreichung werden gemeldet:
  - `onBuddyReachedSurface`
  - `onBuddyActionCompleted`
- Jump dreht den Buddy ebenfalls Richtung Ziel.

Warum wichtig:

Der erste Handy-Test kann nicht nur Start-Events, sondern auch Bewegungsabschluss im Unity Debug Log pruefen.

### 5. Surface Nodes referenzierbar gemacht

Datei:

```txt
Scripts/BuddySurfaceNode.cs.txt
```

Aenderung:

- `surfaceId` ergaenzt.
- Surface Nodes bleiben reine AR-Hilfsobjekte ohne Reward-/Completion-Autoritaet.

Warum wichtig:

Spaetere Boden-/Tisch-/Couch-/Kastl-Ziele koennen sauber referenziert werden.

### 6. Script-Doku auf Event-Allowlist gebracht

Datei:

```txt
Scripts/README.md
```

Aenderung:

- Alte Eventnamen entfernt.
- Aktuelle erlaubte Events dokumentiert.
- Event Contract Audit als Pflichtschritt dokumentiert.

Warum wichtig:

Copy-Skript, Event Contract und Script-README widersprechen sich nicht mehr.

### 7. Kompakte Handy-Testkarte angelegt

Datei:

```txt
docs/FIRST_PHONE_AR_BUDDY_TEST.md
```

Aenderung:

- Kurze operative Checkliste fuer den echten Handy-Test angelegt.
- Enthält Scene-Referenzen, Inspector-Felder, Testablauf, erwartete Logs, Fehlerdiagnose und Sicherheitscheck.

Warum wichtig:

Der erste reale ARCore-Test kann schneller und eindeutiger ausgefuehrt werden, ohne mehrere lange Runbooks parallel lesen zu muessen.

### 8. Unity README aktualisiert

Datei:

```txt
README.md
```

Aenderung:

- Verweis auf `docs/FIRST_PHONE_AR_BUDDY_TEST.md` ergaenzt.
- Bridge-Commands und Mindest-Prototyp aktualisiert.

---

## Erwarteter Handy-Test nach aktuellem Stand

```txt
1. Unity-Projekt lokal erzeugen.
2. AR Foundation / ARCore XR Plugin / XR Plugin Management installieren.
3. Scripts kopieren und Event Contract Audit bestehen.
4. Szene nach SCENE_SETUP.md verdrahten.
5. Android Build & Run auf ARCore-Handy.
6. Tap 1 auf erkannte Plane.
7. Buddy erscheint am Anchor.
8. Kameraschwenk: Buddy bleibt raumfest.
9. Tap 2 auf erkannte Plane.
10. Buddy laeuft oder springt zum Zielpunkt.
11. Debug Logs zeigen onAnchorCreated, onBuddyPlaced, onBuddyActionStarted, onBuddyReachedSurface, onBuddyActionCompleted.
```

---

## Offene naechste Micro-Tasks

- [ ] Unity-Projekt lokal erzeugen.
- [ ] AR Foundation / ARCore XR Plugin / XR Plugin Management installieren.
- [ ] Scene nach `SCENE_SETUP.md` aufbauen.
- [ ] `FIRST_PHONE_AR_BUDDY_TEST.md` am echten ARCore-Handy abarbeiten.
- [ ] Falls Compile-Fehler auftreten: konkrete Unity-Konsole in Issue #8 dokumentieren.
- [ ] Danach Animationen minimal verbessern: idle, walk, hop, land.
- [ ] Danach App-/Native-Bridge real anbinden.

---

## Sicherheitsstatus

Bestaetigt:

- Unity meldet nur AR-Events.
- Keine Punktevergabe in Unity.
- Keine XP-Vergabe in Unity.
- Keine Reward-Freigabe in Unity.
- Keine Mission Completion in Unity.
- Keine Token-/WFT-/NFT-/Trading-Funktion in Unity.
- Keine Jackpot-/Burn-/Leaderboard-Autoritaet in Unity.
