# WellFit Buddy – QA Test Matrix

Status: Draft fuer Testplanung nach Unity Compile-/Android-Retest
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Diese Matrix ordnet die AR-Buddy-Tests nach Bereichen, Risiko und erwarteten Ergebnissen.

Sie ergaenzt:

```txt
PC_RETEST_CHECKLIST_2026-05-01.md
BATCH_AR_BUDDY_RECALL_TEST.md
NEXT_AR_BUDDY_EXTENSION_BATCH.md
```

---

## Teststatus-Legende

```txt
[ ] offen
[x] bestanden
[!] fehlgeschlagen / kritisch
[~] teilweise / erneut pruefen
[>] spaeter
```

---

## 1. Build / Compile

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| BUILD-01 | Unity Projekt oeffnet | Import ohne harte Fehler | Hoch |
| BUILD-02 | C# Compile | Keine roten Compile-Errors | Hoch |
| BUILD-03 | Android Build | Build startet und installiert | Hoch |
| BUILD-04 | App Start | App startet auf Geraet | Hoch |
| BUILD-05 | Kamera Permission | Permission erscheint und funktioniert | Mittel |

---

## 2. AR Foundation / ARCore

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| AR-01 | AR Session startet | Kamera sichtbar | Hoch |
| AR-02 | Plane Detection | Boden/Tisch wird erkannt | Hoch |
| AR-03 | Raycast Hit | Tap auf Plane liefert Hit | Hoch |
| AR-04 | Raycast Miss | Tap ohne Plane erzeugt Reject | Mittel |
| AR-05 | Tracking Stabilitaet | Buddy bleibt raumfest | Hoch |

---

## 3. Buddy Placement

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| PLACE-01 | Buddy platzieren | Buddy erscheint auf Plane | Hoch |
| PLACE-02 | Anchor Event | `onAnchorCreated` | Mittel |
| PLACE-03 | Placed Event | `onBuddyPlaced` | Mittel |
| PLACE-04 | Kein Prefab | sauberer Fehler, kein Crash | Mittel |
| PLACE-05 | Kein RaycastManager | sauberer Fehler, kein Crash | Mittel |

---

## 4. Movement / Navigation

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| MOVE-01 | Kurzer Tap-Zielpunkt | Buddy laeuft hin | Hoch |
| MOVE-02 | Ziel erreicht | `onBuddyReachedSurface` + completed | Mittel |
| MOVE-03 | Ziel zu weit | Reject `target-too-far` | Mittel |
| MOVE-04 | Ziel zu hoch | Reject oder Jump je nach Regel | Mittel |
| MOVE-05 | Waehrend Bewegung erneut tippen | Reject `buddy-already-moving` | Mittel |
| MOVE-06 | Rotation | Buddy dreht weich in Richtung | Niedrig |

---

## 5. Rueckruf / Call Buddy

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| CALL-01 | Buddy rufen Button | Command startet Return | Hoch |
| CALL-02 | Gueltige Flaeche nahe Nutzer | Buddy laeuft zurueck | Hoch |
| CALL-03 | Keine Flaeche | Reject `no-plane-hit` | Mittel |
| CALL-04 | Buddy nicht platziert | Reject/Fehler ohne Crash | Mittel |
| CALL-05 | ActionStarted nur bei Start | Kein falsches Start-Event bei Reject | Mittel |

---

## 6. Auto-Return / Companion

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| AUTO-01 | Manueller Auto-Return | Return startet | Hoch |
| AUTO-02 | Auto AN/AUS | Toggle funktioniert | Mittel |
| AUTO-03 | Far-only AN | kein Spam wenn Buddy nah | Mittel |
| AUTO-04 | Cooldown | keine Dauerschleife | Mittel |
| AUTO-05 | Distanzanzeige | plausible horizontale Distanz | Mittel |
| AUTO-06 | Test/Product Distance Presets | Werte wechseln sichtbar | Niedrig |

---

## 7. Visuals

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| VIS-01 | Idle Motion AN/AUS | sichtbar, aber stabil | Niedrig |
| VIS-02 | Look-at-camera AN/AUS | Buddy schaut plausibel | Niedrig |
| VIS-03 | Distanzschutz | kein wildes Rotieren nah/fern | Mittel |
| VIS-04 | Keine Kamera | kein Crash | Mittel |

---

## 8. Ability Events

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| ABIL-01 | Faehigkeiten AUS + Scan | Reject capability-missing | Mittel |
| ABIL-02 | Faehigkeiten AN + Scan | ActionStarted scanObject | Mittel |
| ABIL-03 | FetchClue | Event oder Reject | Mittel |
| ABIL-04 | Carry | Event oder Reject | Niedrig |
| ABIL-05 | PointAtObject | Event oder Reject | Niedrig |
| ABIL-06 | ClimbUp | Jump/Climb Event oder Reject | Mittel |
| ABIL-07 | JumpBoost | Jump Event oder Reject | Mittel |
| ABIL-08 | Keine Bridge gesetzt | keine NullReference, Diagnose sichtbar | Hoch |

---

## 9. KI Guide Events

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| GUIDE-01 | Walk Mission | onBuddyMissionSuggested | Mittel |
| GUIDE-02 | Scan Mission | onBuddyMissionSuggested | Mittel |
| GUIDE-03 | Missing JumpBoost | onBuddyCapabilityNeeded | Mittel |
| GUIDE-04 | Guide leeren | onBuddyContextUpdated | Mittel |
| GUIDE-05 | DialogueBridge fehlt | kein Crash | Hoch |

---

## 10. Debug Overlay Layout

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| UI-01 | Overlay sichtbar | Buttons erreichbar | Mittel |
| UI-02 | Compact Mode | klappt ein/aus | Niedrig |
| UI-03 | Diagnose an/aus | Anzeige wechselt | Niedrig |
| UI-04 | Page Tabs | 4 Seiten erreichbar | Mittel |
| UI-05 | Kleine Displays | Buttons nicht unbedienbar | Mittel |
| UI-06 | Overlay verdeckt AR | bewerten mit Screenshot | Niedrig |

---

## 11. Product UI Vorbereitung

Noch nicht Runtime-Ziel, aber beim Test beobachten:

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| PUI-01 | No-plane Situation | braucht Product Hint | Mittel |
| PUI-02 | Too-far Situation | braucht Product Hint | Mittel |
| PUI-03 | Missing Ability | braucht Product Hint | Mittel |
| PUI-04 | Returning | braucht Product Hint | Niedrig |
| PUI-05 | Safety Hint | spaeter sinnvoll | Niedrig |

---

## 12. Security Matrix

Diese Punkte muessen in jedem Test unveraendert bleiben:

| ID | Test | Erwartung | Risiko |
|---|---|---|---|
| SEC-01 | Unity Rewards | keine Reward-Autoritaet | Kritisch |
| SEC-02 | Unity XP/Punkte | keine XP-/Punkte-Autoritaet | Kritisch |
| SEC-03 | Unity Completion | keine Mission Completion | Kritisch |
| SEC-04 | Unity Token/NFT | keine Token-/NFT-Logik | Kritisch |
| SEC-05 | Unity Anti-Cheat | kein Anti-Cheat-Urteil | Kritisch |
| SEC-06 | Debug Events | nur Diagnose/Preview | Hoch |

---

## 13. Retest-Auswertung

Nach Test ausfuellen:

```txt
Compile: [ ] gruen [ ] rot
Android Build: [ ] gruen [ ] rot
AR Session: [ ] gruen [ ] rot
Placement: [ ] gruen [ ] rot
Movement: [ ] gruen [ ] rot
Call Buddy: [ ] gruen [ ] rot
Auto Return: [ ] gruen [ ] rot
Visuals: [ ] gruen [ ] rot
Abilities: [ ] gruen [ ] rot
Guide: [ ] gruen [ ] rot
Overlay Layout: [ ] gut [ ] zu gross [ ] blockiert
Security Boundary: [ ] eingehalten [ ] kritisch
```

---

## 14. Entscheidung nach Test

### Wenn Compile rot

Nur Compilefix.

### Wenn Runtime rot

Nur Runtimefix.

### Wenn Test groesstenteils gruen

Naechste Reihenfolge:

1. Debug Overlay splitten.
2. Product UI separat planen/implementieren.
3. Event Envelope vorbereiten.
4. Tap-Zielmarker ergaenzen.
5. Surface Quality ergaenzen.
6. Re-Anchor pruefen.

---

## 15. Nicht vor Test

[!] Keine neuen Runtime-Features.
[!] Keine Scene-YAML-Grosspatches.
[!] Keine Backend-Ingestion-Implementierung.
[!] Keine Reward-/Completion-Kopplung.
