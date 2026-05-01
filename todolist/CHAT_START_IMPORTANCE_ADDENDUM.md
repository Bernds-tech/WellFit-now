# WELLFIT – Chat-Start Wichtigkeits-Addendum

Version: 1.0
Stand: 2026-05-01
Repository: Bernds-tech/WellFit-now
Zweck: Neue Chats sollen ToDos nach Fertigstellungsrelevanz einordnen.

---

## Grundsatz

Nichts aus den ToDo-Listen wird geloescht.

Stattdessen wird jede Aufgabe nach Wichtigkeit fuer die Fertigstellung eingeordnet.

---

## Pflichtdatei

Bei neuen Chats zusaetzlich lesen:

```txt
todolist/TODOLIST_IMPORTANCE_CLASSIFICATION.md
```

Diese Datei ergaenzt:

```txt
todolist/TODOLIST_GOVERNANCE_CONTRACT.md
todolist/J - NÄCHSTE EMPFOHLENE ARBEIT
todolist/L - SKALIERBARKEIT - AR BUDDY UI UND ARCHITEKTUR.md
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

## Arbeitsregel

Bei jeder Aufgabe zuerst fragen:

```txt
Hilft es direkt P0?
Entfernt es ein Build-, Test- oder Sicherheitsrisiko?
Macht es den naechsten Unity-/Mobile-/Backend-Test moeglich?
Verhindert es einen spaeteren Architekturbruch?
```

Wenn nein:

```txt
Nicht loeschen.
Als P1/P2/P3/REFERENCE/ARCHIVE einordnen.
Nicht als aktiven Sprint-Block behandeln.
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

## P1 danach

```txt
Debug-Overlay splitten
Product-UI getrennt vom Debug-Overlay vorbereiten
Tap-Zielmarker
Plane-Missing-Hinweise
Surface Quality
Re-Anchor
Companion Radius finalisieren
erste App-/Unity-Commands
Event Envelope vorbereiten
Avatar-Profilstruktur MVP
```

---

## P2/P3 bleiben erhalten

Voice, viele Avatar-Typen, echte Tokens, NFTs, Marketplace, DePIN, B2B, freie Voice-Chats und grosse Partnerplattformen bleiben dokumentiert.

Sie blockieren aber nicht die testbare Alpha.

---

## Antwortregel fuer neue Chats

Wenn nach Prioritaet gefragt wird:

```txt
Nicht sagen: Das brauchen wir nicht.
Sagen: Das bleibt erhalten, aber die Wichtigkeit ist P0/P1/P2/P3.
```

---

## Ergebnis

WellFit bleibt gross gedacht, aber die Umsetzung bleibt fokussiert.
