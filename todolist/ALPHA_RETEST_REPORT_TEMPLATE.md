# WellFit – Alpha Retest Report Template

Version: 1.0
Stand: 2026-05-01
Zweck: Einheitliche Ergebnisnotiz fuer Unity-/Android-/AR-Buddy-Retests

---

## Kontext

Branch:

```txt
wellfit/upload-local-unity-ar-buddy
```

Unity-Projekt:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

PR:

```txt
PR #13 – Add local Unity AR Buddy companion project
```

---

## 1. Git / Pull

```txt
Datum/Uhrzeit:
Commit/Head-SHA:
git pull --ff-only erfolgreich: ja/nein
lokaler Arbeitsordner korrekt: ja/nein
alter Backup-Ordner nicht verwendet: ja/nein
```

---

## 2. Unity Compile

```txt
Unity Version:
Projekt importiert: ja/nein
Compile gruen: ja/nein
Anzahl roter Console Errors:
Erster roter Fehler:
Datei/Zeile:
Screenshot/Foto vorhanden: ja/nein
```

Wenn Compile rot:

```txt
Nicht weiter testen.
Ersten Compilefehler beheben.
```

---

## 3. Android Build / Run

```txt
Android Build gestartet: ja/nein
Build erfolgreich: ja/nein
Install auf Geraet erfolgreich: ja/nein
App startet: ja/nein
Geraet/Modell:
Android Version:
```

Fehler:

```txt
Buildfehler:
Installfehler:
Startfehler:
```

---

## 4. AR Basis

```txt
Kamera sichtbar: ja/nein
Kamera-Berechtigung abgefragt: ja/nein
ARCore aktiv: ja/nein
Plane Detection sichtbar/erkennbar: ja/nein
Raycast auf Boden/Tisch moeglich: ja/nein
```

---

## 5. Buddy Basis

```txt
Buddy platzieren: ja/nein
Buddy bleibt raumfest: ja/nein
Buddy bewegen: ja/nein
Buddy stoppt am Ziel: ja/nein
Buddy rufen: ja/nein
Buddy Reject bei ungueltiger Flaeche: ja/nein
```

Notizen:

```txt

```

---

## 6. Debug-Seite 1 – Rueckruf & Auto-Return

```txt
Buddy rufen Button: ja/nein
Rueckruf testen: ja/nein
Auto AN/AUS: ja/nein
Nur weit weg AN/AUS: ja/nein
Timing schnell/normal: ja/nein
Abstand Test/Produkt: ja/nein
Request-/Reject-Zaehler plausibel: ja/nein
Cooldown plausibel: ja/nein
```

Fehler/Notizen:

```txt

```

---

## 7. Debug-Seite 2 – Visuals & Verhalten

```txt
Idle AN/AUS: ja/nein
Blick AN/AUS: ja/nein
Diagnose reset: ja/nein
Look-at-camera stabil: ja/nein
kein wildes Rotieren: ja/nein
```

Fehler/Notizen:

```txt

```

---

## 8. Debug-Seite 3 – Faehigkeiten & Events

```txt
Faehigkeiten AN/AUS: ja/nein
Scan testen: ja/nein
Hinweis holen testen: ja/nein
Tragen testen: ja/nein
Zeigen testen: ja/nein
Klettern testen: ja/nein
Sprung testen: ja/nein
Reject bei fehlender Faehigkeit sichtbar: ja/nein
ActionStarted bei aktivierter Demo-Faehigkeit sichtbar: ja/nein
```

Fehler/Notizen:

```txt

```

---

## 9. Debug-Seite 4 – KI-Guide & Missionen

```txt
Mission Gehen: ja/nein
Mission Scannen: ja/nein
Fehlt Sprungboost: ja/nein
Guide leeren: ja/nein
Guide-Diagnose sichtbar: ja/nein
keine Reward-/Completion-Autoritaet: ja/nein
```

Fehler/Notizen:

```txt

```

---

## 10. Layout / Bedienbarkeit

```txt
Overlay passt auf Display: ja/nein
Buttons erreichbar: ja/nein
Diagnose zu gross: ja/nein
Compact Mode hilfreich: ja/nein
Screenshots vorhanden: ja/nein
```

Verbesserungsvorschlag:

```txt

```

---

## 11. Security Boundary

In Unity sichtbar/gefunden:

```txt
Punkte-Autoritaet: nein/ja
XP-Autoritaet: nein/ja
Reward-Autoritaet: nein/ja
Mission-Completion-Autoritaet: nein/ja
Token/WFT: nein/ja
NFT: nein/ja
Jackpot/Burn: nein/ja
Leaderboard: nein/ja
Anti-Cheat-Urteil: nein/ja
```

Wenn irgendwo ja:

```txt
Sofort markieren und nicht weiter ausbauen.
```

---

## 12. Gesamturteil

```txt
Compile: gruen/rot
Android Build: gruen/rot
AR Basis: gruen/rot/teilweise
Buddy Basis: gruen/rot/teilweise
Debug Overlay: gruen/rot/teilweise
Security Boundary: eingehalten/kritisch
```

Naechste Entscheidung:

```txt
[ ] Compilefix
[ ] Runtimefix
[ ] Debug Overlay splitten
[ ] Product UI vorbereiten
[ ] Event Envelope vorbereiten
[ ] Retest wiederholen
```

---

## 13. Dateien fuer Fehlerbehebung

Bei Fehlern zuerst pruefen:

```txt
WellFitNativeBridge.cs
BuddyDebugSceneBootstrap.cs
BuddyCallDebugController.cs
BuddyCompanionAutoReturnController.cs
BuddyAnchorController.cs
BuddyNavigationController.cs
BuddyAbilityController.cs
BuddyKiGuideController.cs
BuddyController.cs
BuddyLookAtCamera.cs
```

---

## Status

[ ] Noch nicht ausgefuellt.
