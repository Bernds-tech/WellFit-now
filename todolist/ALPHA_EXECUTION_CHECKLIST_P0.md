# WellFit – Alpha Execution Checklist P0

Version: 1.0
Stand: 2026-05-01
Zweck: Konkrete Ausfuehrungsreihenfolge fuer die testbare Alpha

---

## Grundsatz

Diese Checkliste ist enger als `ALPHA_SCOPE_P0.md`.

Sie beschreibt nicht die gesamte Vision, sondern die konkrete Reihenfolge, damit WellFit als testbare Alpha funktioniert.

---

## P0-Regel

Wenn eine Aufgabe nicht direkt hilft bei:

```txt
Build laeuft
AR-Buddy funktioniert
Mission/Game Loop funktioniert
Punkte/XP bleiben intern
Backend/Security bleibt Autoritaet
```

wird sie nicht geloescht, aber nicht als Alpha-Blocker behandelt.

---

## Phase P0.1 – Unity/AR-Buddy Retest

Status: offen

Pflichtschritte:

```txt
[ ] Branch pullen
[ ] Unity-Projekt oeffnen
[ ] Import/Compile abwarten
[ ] Unity Console pruefen
[ ] Compilefehler zuerst beheben
[ ] Android Build/Run starten
[ ] Kamera/ARCore pruefen
[ ] Buddy platzieren
[ ] Buddy bewegen
[ ] Buddy rufen
[ ] 4 Debug-Seiten testen
```

Referenzen:

```txt
native/unity/WellFitBuddyAR/docs/PC_RETEST_CHECKLIST_2026-05-01.md
native/unity/WellFitBuddyAR/docs/BUDDY_QA_TEST_MATRIX.md
```

Abbruchregel:

```txt
Wenn Compile rot: keine Featurearbeit. Nur Compilefix.
Wenn Runtime rot: keine Featurearbeit. Nur Runtimefix.
```

---

## Phase P0.2 – Build-/Runtime-Fix

Status: wartend auf Retest-Ergebnis

Moegliche betroffene Dateien:

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

Regel:

```txt
Ein Fehlerbild nach dem anderen.
Keine grossen Refactors, solange Fehler nicht verstanden sind.
```

---

## Phase P0.3 – Minimal stabiler AR-Buddy

Status: offen

Definition:

```txt
[ ] Buddy kann platziert werden.
[ ] Buddy bleibt raumfest.
[ ] Buddy kann zu gueltigen Flaechen laufen.
[ ] Buddy lehnt ungueltige Ziele sauber ab.
[ ] Buddy kann gerufen werden.
[ ] Debug-Overlay ist bedienbar.
[ ] Keine NullReference-Fehler im Basisfluss.
[ ] Unity autorisiert keine Rewards/Completion.
```

---

## Phase P0.4 – Minimaler Game Loop

Status: teilweise vorhanden / nach AR-Retest erneut pruefen

Muss fuer Alpha sichtbar sein:

```txt
[ ] Nutzer sieht Mission/Challenge.
[ ] Nutzer versteht naechsten Schritt.
[ ] Buddy/Guide kann einfachen Hinweis geben.
[ ] Interne Punkte/XP oder RewardPreview ist als Feedback erkennbar.
[ ] Echte Rewards bleiben serverseitig / nicht Unity.
```

Nicht fuer P0 noetig:

```txt
KI-generierte Missionen fuer alle Zielgruppen
Voice Runtime
NFTs
Token
Marketplace
B2B-Partnereditor
```

---

## Phase P0.5 – Backend/Security-Grundlage bestaetigen

Status: bereits teilweise vorbereitet, erneut pruefen wenn Alpha naeher rueckt

Muss gelten:

```txt
[ ] Direkte Client-Writes auf kritische Collections blockiert.
[ ] Callable Functions fuer sicherheitsnahe Aktionen genutzt.
[ ] Reward/Completion nicht clientautoritativ.
[ ] Emulator-/Smoke-Test-Grundlage vorhanden.
[ ] Mobile bleibt frei von Token-/Trading-/NFT-Marktplatzfunktionen.
```

---

## Phase P0.6 – Alpha-Testpaket

Status: spaeter

Fuer erste echte Tester vorbereiten:

```txt
[ ] Testgeraet/Android Build bereit.
[ ] bekannte Testschritte dokumentiert.
[ ] Fehlerbericht-Format vorhanden.
[ ] klare Alpha-Grenzen kommuniziert.
[ ] keine Token-/NFT-Erwartung erzeugen.
```

---

## Nicht ablenken lassen

Nicht P0:

```txt
Voice Runtime
Wake Word
viele finale Avatar-Modelle
NFTs
WFT Token
Marketplace
DePIN
B2B Plattform
komplexe Avatar-Vererbung
freie Voice Chats
```

Diese Themen bleiben erhalten, aber sie blockieren P0 nicht.

---

## Aktueller groesster Blocker

```txt
Unity Debug-Batch wurde nach dem letzten erfolgreichen Android-Smoke-Test noch nicht erneut kompiliert/getestet.
```

Naechster echter technischer Schritt:

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Unity-Projekt:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

---

## Status

[~] P0-Ausfuehrungscheckliste angelegt.
[ ] Unity-Retest offen.
[ ] Alpha noch nicht fertig.
