# Status – ToDo-Governance und Skalierbarkeit Handoff

Datum: 2026-05-01
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13 – Add local Unity AR Buddy companion project

---

## Kurzstand

Neben der Unity-/AR-Buddy-Skalierbarkeit wurde jetzt auch die Skalierbarkeit von `todolist/` selbst als verbindliche Arbeitsregel aufgenommen.

Ziel: WellFit soll nicht nur im Code modular bleiben, sondern auch in Roadmap, Handoff, Contracts, Addenda und Statusdateien.

---

## Neue/aktualisierte Governance-Dateien

```txt
todolist/L - SKALIERBARKEIT - AR BUDDY UI UND ARCHITEKTUR.md
todolist/TODOLIST_GOVERNANCE_CONTRACT.md
todolist/README_SCALABILITY_ADDENDUM.md
todolist/CHAT_START_SCALABILITY_ADDENDUM.md
todolist/NEXT_CHAT_HANDOFF_PROMPT.md
```

---

## Zentrale ToDo-Governance-Regeln

```txt
README.md = Index und konsolidierte Uebersicht
J - NÄCHSTE EMPFOHLENE ARBEIT = operativer Kurzanker
A-I / G1 / K / L = Themen-Roadmaps
*_ADDENDUM.md = dauerhafte thematische Ergaenzungen
status/YYYY-MM-DD-*.md = zeitbezogene Handoffs und Teststaende
native/.../docs/*_CONTRACT.md = technische Vertraege
native/.../docs/*_PLAN.md = Refactor-/Architekturplaene
native/.../docs/*_CHECKLIST.md = Test-/Runbook-Checklisten
```

---

## Harte Regeln gegen ToDo-Monolithen

[!] `J` bleibt operativer Kurzanker, nicht Langzeitarchiv.
[!] `README.md` bleibt Index, nicht Detailcontainer.
[!] Lange Details wandern in Addenda, Contracts, Plans oder Statusdateien.
[!] Handoffs enthalten Dateiliste + Kurzstand, nicht komplette Roadmap-Kopien.
[!] Inhalte nicht dreifach duplizieren.
[!] Wenn ein Thema mehr als 1–2 Bildschirmseiten braucht, eigene Datei anlegen.

---

## Warum das wichtig ist

Neue Chats koennen nur dann schnell und korrekt weiterarbeiten, wenn:

1. aktuelle Prioritaeten in `J` kurz sichtbar bleiben,
2. Detailthemen gezielt in Spezialdateien stehen,
3. alte Statusstaende nicht mit dauerhaften Masterregeln verwechselt werden,
4. Security-/Skalierungsregeln nicht in riesigen Dateien untergehen.

---

## Aktueller Bezug zu AR-Buddy

Bei AR-/Buddy-Arbeit gilt jetzt:

```txt
J = aktueller Arbeitsanker
K = Companion/Avatar-Grundlogik
L = Skalierbarkeit AR Buddy/UI/Architektur + ToDo-Skalierung
TODOLIST_GOVERNANCE_CONTRACT = Regeln fuer skalierbare ToDo-Pflege
BUDDY_*_CONTRACT/PLAN/CHECKLIST = technische Details
status/*.md = zeitbezogene Handoffs
```

---

## Stand der Unity-Arbeit bleibt unveraendert

Der naechste technische Unity-Schritt bleibt:

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

1. Unity Compile pruefen.
2. Compilefehler zuerst beheben.
3. Android Build/Run starten.
4. 4 Debug-Seiten testen.
5. Danach erst Runtime-Refactor oder neue Features.

---

## Naechste sichere Micro-Tasks ohne Unity-Test

[ ] `J` nur bei echten operativen Aenderungen aktualisieren.
[ ] Bei weiteren Planungen eigene Addenda/Contracts statt lange Hauptdateien verwenden.
[ ] Product-UI-Message-Key-Liste ausarbeiten.
[ ] App-/Backend-Event-Ingestion als separaten Contract planen.
[ ] Keine weiteren riskanten Unity-Runtime-Scripts bis Compile-/Android-Retest.

---

## Statusbewertung

[~] ToDo-Governance ist jetzt als Regelwerk vorhanden.
[~] Skalierbarkeit ist in Code-/UI-/Roadmap-Ebene verankert.
[ ] Umsetzung der Runtime-Refactors erst nach Unity-Retest.
