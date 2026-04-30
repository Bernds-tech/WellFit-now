# PC Retest Checklist – Unity AR Buddy Debug Batch

Datum: 2026-05-01
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13
Unity-Projekt: `C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR`

---

## 0. Ziel

Diese Checkliste ist fuer den naechsten lokalen PC-/Android-Test nach dem grossen Debug-Batch.

Der letzte Android-Smoke-Test war erfolgreich, aber der aktuelle Debug-Batch wurde danach noch nicht erneut kompiliert/getestet.

---

## 1. Repository aktualisieren

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Nicht verwenden:

```txt
C:\wellfit\WellFitBuddyAR
```

Der alte Ordner ist nur Backup.

---

## 2. Unity oeffnen

Unity-Projekt oeffnen:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

Dann:

1. Import abwarten.
2. Compile abwarten.
3. Console oeffnen.
4. Erst Fehler lesen, nicht sofort Build starten.

---

## 3. Compile-Check

### Gruen

Weiter zu Android Build/Run, wenn:

```txt
Keine roten Compile-Errors in Unity Console.
```

### Rot

Wenn Compile-Errors auftreten:

1. Exakten ersten roten Fehler kopieren.
2. Datei + Zeile notieren.
3. Nicht mehrere Fehler interpretieren, bevor der erste echte Compilerfehler behoben ist.
4. Keine weiteren Features bauen.
5. Fehler in Chat geben.

Wichtig:

```txt
Ein Folgefehler kann durch den ersten Compile-Error entstehen.
Immer zuerst den ersten echten Fehler beheben.
```

---

## 4. Android Build/Run

Wenn Compile gruen:

1. Android Target pruefen.
2. ARCore/Android Player Settings nicht spontan umstellen, falls Build vorher lief.
3. Geraet verbinden.
4. Build And Run starten.
5. Kamera-Berechtigung erlauben.

---

## 5. Basis-AR-Test

[ ] Kamera startet.
[ ] ARCore laeuft.
[ ] Plane Detection sichtbar/aktiv.
[ ] Boden/Tisch scannen.
[ ] Buddy platzieren.
[ ] Buddy bleibt raumfest.
[ ] Buddy zu Tap-Ziel bewegen.
[ ] Keine roten Runtime-Errors sichtbar.

Erwartete Events/Logs:

```txt
onArReady
onAnchorCreated
onBuddyPlaced
onBuddyActionStarted
onBuddyReachedSurface
onBuddyActionCompleted
```

---

## 6. Debug-Seite 1 – Rueckruf & Auto-Return

Testen:

[ ] Buddy rufen.
[ ] Rueckruf testen.
[ ] Auto AN/AUS.
[ ] Nur weit weg AN/AUS.
[ ] Timing schnell.
[ ] Timing normal.
[ ] Abstand Test.
[ ] Abstand Produkt.

Beobachten:

[ ] Distanzanzeige plausibel.
[ ] Cooldown sichtbar.
[ ] Request-/Reject-Zaehler aendern sich.
[ ] Kein Rueckruf-Spam.
[ ] Bei keiner Flaeche: Reject statt Absturz.

Moegliche Rejects:

```txt
no-plane-hit
buddy-not-placed
buddy-already-moving
target-too-far
controller-rejected
```

---

## 7. Debug-Seite 2 – Visuals & Verhalten

Testen:

[ ] Idle AN/AUS.
[ ] Blick AN/AUS.
[ ] Diagnose reset.

Beobachten:

[ ] Idle-Bobbing wirkt sichtbar, aber nicht extrem.
[ ] Look-at-camera dreht Buddy plausibel.
[ ] Kein wildes Rotieren bei sehr geringer Distanz.
[ ] Toggle funktioniert ohne NullReferenceException.

---

## 8. Debug-Seite 3 – Faehigkeiten & Events

Testen zuerst mit Faehigkeiten AUS:

[ ] Scan testen.
[ ] Hinweis holen testen.
[ ] Tragen testen.
[ ] Zeigen testen.
[ ] Klettern testen.
[ ] Sprung testen.

Erwartung bei AUS:

```txt
onBuddyActionRejected
reason=capability-missing
```

Dann:

[ ] Faehigkeiten AN/AUS aktivieren.
[ ] Alle Tests erneut ausfuehren.

Erwartung bei AN:

```txt
onBuddyActionStarted
```

Beobachten:

[ ] Ability-Start-/Reject-Zaehler plausibel.
[ ] Letzte/abgelehnte Faehigkeit wird angezeigt.
[ ] Keine Reward-/XP-/Punkte-Logik.

---

## 9. Debug-Seite 4 – KI-Guide & Missionen

Testen:

[ ] Mission: Gehen.
[ ] Mission: Scannen.
[ ] Fehlt: Sprungboost.
[ ] Guide leeren.
[ ] Diagnose reset.

Erwartete Events:

```txt
onBuddyMissionSuggested
onBuddyCapabilityNeeded
onBuddyContextUpdated
```

Beobachten:

[ ] Mission-ID sichtbar.
[ ] Reason sichtbar.
[ ] Guide-Event-Zaehler steigt.
[ ] Kein Reward, keine Completion, keine Economy-Autoritaet.

---

## 10. Layout-/Skalierbarkeitsbeobachtung

Screenshots oder Notizen machen:

[ ] Ist Overlay zu gross?
[ ] Sind Buttons auf dem Handy erreichbar?
[ ] Ueberdeckt Debug die AR-Szene zu stark?
[ ] Muss eine Seite weiter paginiert werden?
[ ] Welche Seite soll zuerst extrahiert werden?

Wichtig:

```txt
Nach erfolgreichem Test soll BuddyCallDebugController.cs nicht weiter wachsen.
Naechster Schritt waere Split in Root + DiagnosticsPanel + einzelne Pages.
```

---

## 11. Security-Check waehrend Retest

Im Test darf Unity niemals:

[ ] Punkte vergeben.
[ ] XP vergeben.
[ ] Rewards vergeben.
[ ] Mission Completion bestaetigen.
[ ] Token/WFT ausgeben.
[ ] NFTs freischalten.
[ ] Jackpot/Burn ausfuehren.
[ ] Leaderboard schreiben.
[ ] Anti-Cheat entscheiden.

Wenn irgendwo solche Begriffe als Autoritaet auftauchen:

```txt
Sofort stoppen und melden.
```

---

## 12. Ergebnisnotiz nach Test

Nach dem Test bitte notieren:

```txt
Unity Compile: gruen/rot
Android Build: erfolgreich/fehlgeschlagen
App startet: ja/nein
Kamera/ARCore: ja/nein
Buddy Placement: ja/nein
Buddy Move: ja/nein
Rueckruf: ja/nein
Auto-Return: ja/nein
Visual Toggles: ja/nein
Ability Events: ja/nein
Guide Events: ja/nein
Fehler/Console/Logcat:
Screenshots vorhanden:
```

---

## 13. Naechste Arbeit je nach Ergebnis

### Wenn Compile rot

[ ] Ersten Compile-Error beheben.
[ ] Keine neuen Features.

### Wenn Runtime rot

[ ] NullReference/ARCore/Raycast-Fehler beheben.
[ ] Keine neuen Features.

### Wenn Android-Test gruen

[ ] Debug-Overlay refaktorieren.
[ ] Product-UI getrennt planen.
[ ] Event-/State-Versionierung vorbereiten.
[ ] Tap-Zielmarker / Plane-Missing-Hinweis / Surface-Quality ergaenzen.

---

## 14. Pull-Hinweis

Vor jedem Testlauf erneut:

```powershell
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```
