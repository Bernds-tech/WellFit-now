# WellFit – Alpha Bug Triage Template

Version: 1.0
Stand: 2026-05-01
Zweck: Einheitliche Bewertung von Alpha-Testfehlern

---

## Grundsatz

Nicht jeder Fehler ist gleich wichtig.

Fehler werden nach Auswirkung auf P0/P1/P2/P3 bewertet.

---

## Fehler-ID

```txt
BUG-YYYYMMDD-001
```

---

## Kurzbeschreibung

```txt
Was ist passiert?
```

---

## Umgebung

```txt
Branch:
Commit/Head-SHA:
Geraet:
Android/iOS/Web:
Unity Version:
App/Build-Version:
```

---

## Reproduktionsschritte

```txt
1.
2.
3.
```

---

## Erwartetes Verhalten

```txt
Was haette passieren sollen?
```

---

## Tatsaechliches Verhalten

```txt
Was ist wirklich passiert?
```

---

## Screenshots / Logs

```txt
Screenshot vorhanden: ja/nein
Unity Console Log vorhanden: ja/nein
Logcat vorhanden: ja/nein
Fehlermeldung:
```

---

## Bereich

Eine Auswahl:

```txt
Build
Unity Compile
Android Build
ARCore / Kamera
Plane Detection
Raycast
Buddy Placement
Buddy Movement
Buddy Recall
Auto Return
Debug Overlay
Ability Events
Guide Events
Mobile UI
Mission Game Loop
Backend / Firebase
Security Boundary
Performance
Layout / UX
```

---

## Prioritaet

```txt
P0-BLOCKER = Alpha kann nicht getestet werden
P0-HIGH = Alpha stark beeintraechtigt
P1 = wichtig fuer Beta, Alpha kann weitergehen
P2 = spaeterer Ausbau
P3 = Vision / nicht relevant fuer aktuellen Test
```

---

## Schweregrad

```txt
S0 = App/Build blockiert komplett
S1 = Kernfluss blockiert
S2 = Feature funktioniert teilweise nicht
S3 = Layout/UX stoerend
S4 = kosmetisch / spaeter
```

---

## Sicherheitsrelevanz

```txt
Security relevant: ja/nein
Wenn ja: welche Grenze betroffen?
```

Moegliche Grenzen:

```txt
Client/Unity autorisiert Reward
Client/Unity autorisiert Completion
Client/Unity autorisiert Punkte/XP
Client/Unity beruehrt Token/NFT
Client schreibt kritische Daten direkt
```

---

## Naechste Entscheidung

```txt
[ ] Compilefix
[ ] Buildfix
[ ] Runtimefix
[ ] Refactor spaeter
[ ] Product UI spaeter
[ ] Backend spaeter
[ ] Kein P0-Blocker
```

---

## Verantwortlicher Bereich

```txt
Unity
Mobile/App
Backend/Firebase
Roadmap/Docs
Design/UX
Unklar
```

---

## Status

```txt
OPEN
IN_PROGRESS
WAITING_FOR_RETEST
RESOLVED
NOT_REPRODUCIBLE
NOT_BLOCKING
```

---

## Abschlussnotiz

```txt
Fix-Commit:
Retest bestanden: ja/nein
Noch offen:
```
