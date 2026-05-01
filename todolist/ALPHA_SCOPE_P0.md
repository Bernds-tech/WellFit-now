# WellFit – Alpha Scope P0

Version: 1.0
Stand: 2026-05-01
Zweck: Minimal notwendiger Scope fuer eine testbare WellFit-Alpha

---

## Grundsatz

Dieses Dokument definiert, was WellFit wirklich braucht, um als erste testbare Alpha zu funktionieren.

Nichts aus anderen ToDo-Dateien wird geloescht. Alles ausserhalb dieses Dokuments kann wichtig sein, ist aber nicht automatisch Alpha-blockierend.

---

## P0-Ziel

Eine testbare Alpha ist erreicht, wenn ein echter Nutzer:

1. sich anmelden kann,
2. in die Mobile-/AR-Erfahrung kommt,
3. einen Buddy sieht,
4. den Buddy platzieren, bewegen und rufen kann,
5. einfache Missionen/Challenges versteht,
6. interne Punkte/XP als Feedback sieht,
7. keine manipulierbare Reward-/Completion-Logik im Client hat,
8. Backend-/Rules-Grundschutz aktiv ist,
9. Build/Deployment reproduzierbar getestet ist.

---

## P0-Bereich 1 – Zugang und Nutzerbasis

Muss vorhanden sein:

```txt
Login
Registrierung
Nutzerprofil-Grundlage
Session/Auth stabil
```

Nicht P0-blockierend:

```txt
komplexe Social-Profile
voller Avatar-Marktplatz
Token-/Wallet-Onboarding
```

---

## P0-Bereich 2 – Mobile / AR Einstieg

Muss vorhanden sein:

```txt
Mobile AR Einstieg
Unity AR-Projekt lauffaehig
Android Build/Run erfolgreich
ARCore Kamera sichtbar
Plane Detection / Raycast funktioniert
Buddy kann platziert werden
Buddy bleibt raumfest
Buddy kann bewegt werden
Buddy kann gerufen werden
```

Aktueller naechster Schritt:

```txt
Unity Compile pruefen
Android Build/Run
4 Debug-Seiten testen
```

---

## P0-Bereich 3 – Buddy Basis

Muss vorhanden sein:

```txt
Buddy sichtbar
Buddy Platzierung
Buddy Bewegung
Buddy Rueckruf
einfaches Debug-/QA-Overlay
keine Rewards/Completion in Unity
```

Nicht P0-blockierend:

```txt
viele Avatar-Typen
Voice Chat
finale Product-UI
komplexe Persoenlichkeitsprofile
```

---

## P0-Bereich 4 – Missionen / Game Loop

Muss vorhanden sein:

```txt
einfache Missionen oder Challenges
ein verstaendlicher Ablauf
Start / Fortschritt / Abschluss-Preview
interne Punkte-/XP-Preview
```

Wichtig:

```txt
Client darf UI-Feedback zeigen.
Backend bleibt spaeter Autoritaet fuer echte Completion und Rewards.
```

Nicht P0-blockierend:

```txt
KI-generierte Missionen fuer alle Altersgruppen
voller Partner-Quest-Editor
Museum-/Stadt-/B2B-Missionen
```

---

## P0-Bereich 5 – Interne Punkte / XP

Muss vorhanden sein:

```txt
interne Punkte/XP als Produktfeedback
keine echte Token-Ausschuettung
keine NFTs
keine Blockchain-Abhaengigkeit
serverseitige Richtung fuer Ledger/Audit klar
```

Nicht P0-blockierend:

```txt
echter WFT
NFT-Marktplatz
Trading
Staking
Presale
```

---

## P0-Bereich 6 – Backend / Security

Muss vorhanden sein:

```txt
Firebase/Firestore Rules fuer kritische Collections
Callable Functions fuer sicherheitsnahe Aktionen
keine direkten Client-Writes auf kritische Daten
Reward-/Completion-Autoritaet nicht im Client
Emulator-/Smoke-Test-Grundlage
```

Nicht P0-blockierend:

```txt
vollstaendige Backend Event Ingestion fuer alle AR-Events
komplexes Anti-Cheat-System
produktives Punkte-Ledger mit allen Caps
```

---

## P0-Bereich 7 – Build / QA / Deployment

Muss vorhanden sein:

```txt
lokaler Build pruefbar
Android Build pruefbar
Production Build pruefbar
bekannte Testchecklisten
Fehlerbehebung nach klarer Reihenfolge
```

Nicht P0-blockierend:

```txt
voll automatisierte Unity CI
vollstaendige Device Farm
vollstaendiges QA-Dashboard
```

---

## P0-Ausgeschlossen

Diese Themen bleiben erhalten, sind aber nicht Alpha-blockierend:

```txt
Voice Interaction
Wake Word
freie Voice-Chats
viele Avatar-Typen
NFTs
WFT Token
Blockchain
Marketplace
DAO
Staking
DePIN
B2B Whitelabel
Partnerplattformen
komplexe Lebenslang-Avatar-Systeme
```

---

## P0-Definition of Done

Eine P0-Alpha gilt als fertig, wenn:

```txt
[ ] Web/Mobile Basis laeuft.
[ ] Login/Register funktionieren.
[ ] Unity AR-Buddy kompiliert.
[ ] Android Build/Run funktioniert.
[ ] Buddy platzieren/bewegen/rufen funktioniert.
[ ] einfache Mission/Game-Loop funktioniert.
[ ] interne Punkte/XP werden angezeigt oder vorbereitet.
[ ] keine Client-/Unity-Autoritaet fuer Rewards/Completion besteht.
[ ] Firebase/Backend-Security-Grundlage ist getestet.
[ ] Build-/Retest-Checklisten sind vorhanden.
```

---

## Aktueller P0-Blocker

```txt
Unity Debug-Batch wurde nach dem letzten erfolgreichen Android-Smoke-Test noch nicht erneut kompiliert/getestet.
```

Naechster Schritt:

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Dann Unity oeffnen:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

---

## Entscheidungsregel

Wenn neue Arbeit vorgeschlagen wird:

```txt
Hilft sie P0 direkt?
Ja -> priorisieren.
Nein -> behalten, aber P1/P2/P3/REFERENCE einordnen.
```
