# WellFit todolist – Skalierbarkeits-Addendum

Version: 1.0
Stand: 2026-05-01
Kontext: AR-Buddy / Unity / Mobile AR / UI / Architektur

---

## Zweck

Dieses Addendum ergaenzt `todolist/README.md`, ohne die grosse zentrale README riskant umzuschreiben.

Es macht sichtbar, welche neuen Skalierbarkeitsdateien bei AR-/Buddy-/UI-Arbeit mitzulesen sind.

---

## Neue verbindliche ToDo-Datei

```txt
todolist/L - SKALIERBARKEIT - AR BUDDY UI UND ARCHITEKTUR.md
```

Diese Datei ist bei allen AR-/Buddy-/Mobile-AR-/UI-Aufgaben mitzulesen.

---

## Neue Chat-Start-Ergaenzung

```txt
todolist/CHAT_START_SCALABILITY_ADDENDUM.md
```

Diese Datei ergaenzt den Chat-Start und Handoff um Skalierbarkeitsregeln.

---

## Neue Unity-/AR-Buddy-Contracts

```txt
native/unity/WellFitBuddyAR/docs/BUDDY_COMMAND_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_CONTRACT.md
```

Diese Contracts ergaenzen die bestehenden Unity-Dokumente.

---

## Bereits vorhandene relevante Skalierungsdokumente

```txt
native/unity/WellFitBuddyAR/docs/BUDDY_ARCHITECTURE_SCALING_PLAN.md
native/unity/WellFitBuddyAR/docs/BUDDY_DEBUG_OVERLAY_REFACTOR_PLAN.md
native/unity/WellFitBuddyAR/docs/BUDDY_EVENT_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_ABILITY_STATE_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_GUIDE_MISSION_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_COMPANION_RADIUS_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_MOVEMENT_POLICY_DRAFT.md
native/unity/WellFitBuddyAR/docs/BUDDY_SURFACE_QUALITY_DRAFT.md
```

---

## Kurzregel

Bei AR-/Buddy-/UI-Arbeit gilt:

```txt
J = aktueller Arbeitsanker
K = Buddy/Avatar-Grundlogik
L = Skalierbarkeit
Contracts = konkrete technische Grenzen
Unity-Scripts = erst nach Lesen der Roadmap/Contracts bearbeiten
```

---

## Harte Skalierbarkeitsregeln

[!] Keine neuen Monolith-Seiten.
[!] Keine neuen Monolith-Controller.
[!] `BuddyCallDebugController.cs` nach erfolgreichem Retest splitten statt weiter vergroessern.
[!] Debug-UI, Product-UI und QA-/Diagnose-Export getrennt halten.
[!] Neue Commands zuerst im Contract definieren.
[!] Neue Product-UI-Hinweise zuerst im Contract definieren.
[!] Unity bleibt Visual-/Event-Schicht.
[!] App/Backend bleiben Autoritaet fuer Rewards, Items, Faehigkeiten, Completion, Economy und Security.

---

## Naechster Testanker

Solange Unity nicht lokal kompiliert/getestet wurde:

```txt
Keine weiteren riskanten Runtime-Scripts stapeln.
Nur Contracts, ToDo-Konsolidierung, Testplaene und Refactor-Plaene erweitern.
```

Nach lokalem Unity-Test:

```txt
Compilefehler beheben.
Android-Retest pruefen.
Debug-Overlay bewerten.
Dann erst Runtime-Refactor starten.
```
