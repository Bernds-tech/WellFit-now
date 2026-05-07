# WellFit – Alpha Blocker Register P0

Version: 1.0
Stand: 2026-05-01
Zweck: Offene P0-Blocker fuer testbare Alpha sichtbar halten

---

## Grundsatz

Dieses Register enthaelt nur echte P0-Blocker.

P1/P2/P3-Themen gehoeren nicht hierher, auch wenn sie wichtig sind.

---

## Blocker-Status

```txt
[OPEN] offen
[WAITING] wartet auf Test/Info
[FIXING] in Bearbeitung
[RESOLVED] geloest
[NOT_BLOCKING] kein P0-Blocker
```

---

## BLOCKER-001 – Unity Debug-Batch nicht erneut kompiliert

Status:

```txt
[OPEN]
```

Beschreibung:

```txt
Der grosse Unity Debug-/Diagnose-Batch wurde nach dem erfolgreichen Android-Smoke-Test noch nicht erneut in Unity kompiliert oder auf Android getestet.
```

Auswirkung:

```txt
Keine sichere Runtime-Weiterentwicklung moeglich.
Keine Debug-Overlay-Refactors starten.
Keine Product-UI Runtime starten.
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

## BLOCKER-002 – Android-Retest der 4 Debug-Seiten offen

Status:

```txt
[OPEN]
```

Beschreibung:

```txt
Die neuen Debug-Seiten Rueckruf, Visuals, Faehigkeiten und Guide sind vorbereitet, aber noch nicht auf dem Android-Geraet getestet.
```

Auswirkung:

```txt
Nicht sicher, ob Overlay-Layout, Buttons, Referenzen und Events auf dem Geraet funktionieren.
```

Naechster Schritt:

```txt
PC_RETEST_CHECKLIST_2026-05-01.md abarbeiten.
```

---

## BLOCKER-003 – Eventnamen/Payloads noch nicht durch Retest bestaetigt

Status:

```txt
[WAITING]
```

Beschreibung:

```txt
Event-/State-Versionierung und Backend-Ingestion sind geplant, aber echte Eventnamen/Payloads muessen im Retest bestaetigt werden.
```

Auswirkung:

```txt
Backend Event API und Mobile Event Router duerfen noch nicht implementiert werden.
```

Naechster Schritt:

```txt
Unity Console / Logcat beim Retest beobachten.
```

---

## BLOCKER-004 – P0 Game Loop nach AR-Retest erneut pruefen

Status:

```txt
[WAITING]
```

Beschreibung:

```txt
Mission/Game-Loop ist vorbereitet, muss aber nach AR-Buddy-Stabilisierung wieder im Zusammenhang mit Mobile/AR geprueft werden.
```

Auswirkung:

```txt
Alpha ist erst fertig, wenn Buddy/AR und einfacher Mission-/Feedback-Loop zusammen funktionieren.
```

Naechster Schritt:

```txt
Nach erfolgreichem AR-Retest /mobile/ar und Missionsfluss erneut pruefen.
```

---

## Nicht als P0-Blocker behandeln

Diese Themen sind wichtig, aber nicht P0-blockierend:

```txt
Voice Runtime
TTS
viele Avatar-Profile
NFTs
WFT Token
Marketplace
DePIN
B2B
Debug-Overlay-Split, solange aktuelles Overlay testbar ist
Product-UI Runtime, solange Debug/Basic UI fuer Test reicht
```

---

## Aktualisierungsregel

Nach jedem PC-/Unity-Test:

1. offene Blocker aktualisieren.
2. geloeste Blocker auf `[RESOLVED]` setzen.
3. neue echte P0-Blocker ergaenzen.
4. P1/P2/P3-Themen nicht in dieses Register aufnehmen.

---

## Status

[~] P0 Blocker Register angelegt.
[ ] Retest-Ergebnis offen.
