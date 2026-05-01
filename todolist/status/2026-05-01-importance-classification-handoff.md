# Status – ToDo Importance Classification Handoff

Datum: 2026-05-01
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Kurzstand

Die ToDo-Listen wurden nicht geloescht oder gekuerzt.

Stattdessen wurde eine Wichtigkeitslogik eingefuehrt, damit klar ist, was fuer die erste Fertigstellung notwendig ist und was spaeterer Ausbau bleibt.

---

## Neue Dateien

```txt
todolist/TODOLIST_IMPORTANCE_CLASSIFICATION.md
todolist/CHAT_START_IMPORTANCE_ADDENDUM.md
```

Aktualisiert:

```txt
todolist/TODOLIST_GOVERNANCE_CONTRACT.md
```

---

## Wichtigkeitsstufen

```txt
P0 = Muss fuer testbare Alpha
P1 = Wichtig fuer gute Beta
P2 = Ausbau nach stabiler Beta
P3 = Vision / spaeter
REFERENCE = Nachschlagewerk / Contract / Plan
ARCHIVE = historisch / Status
```

---

## Aktueller P0-Fokus

```txt
Unity Branch pullen
Unity Compile pruefen
Android Build/Run testen
4 Debug-Seiten testen
Compile-/Runtime-Fehler beheben
AR-Buddy Basis stabilisieren
Missionen / Challenges als Game Loop stabil halten
interne Punkte/XP und Backend-Autoritaet schuetzen
```

---

## Nicht loeschen

P2/P3-Themen bleiben erhalten, aber blockieren die Alpha nicht:

```txt
Voice
viele Avatar-Typen
NFTs
Token/WFT
Marketplace
DePIN
B2B
freie Voice-Chats
Partnerplattformen
```

---

## Entscheidungsregel

Bei jeder neuen Aufgabe:

1. Hilft es P0 direkt?
2. Entfernt es ein Sicherheits-, Build- oder Test-Risiko?
3. Macht es den naechsten Test moeglich?
4. Verhindert es spaeteren Architekturbruch?

Wenn nein: nicht loeschen, sondern P1/P2/P3/REFERENCE/ARCHIVE zuordnen.

---

## Naechster technischer Schritt bleibt unveraendert

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

1. Compile pruefen.
2. Android Build/Run.
3. 4 Debug-Seiten testen.
4. Fehler beheben.

---

## Status

[x] Wichtigkeitsklassifikation eingefuehrt.
[x] Nichts geloescht.
[x] P0/P1/P2/P3 Arbeitslogik festgelegt.
[ ] Unity-Retest offen.
