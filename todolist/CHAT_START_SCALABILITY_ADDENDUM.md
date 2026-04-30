# WELLFIT – Chat-Start Skalierbarkeits-Addendum

Version: 1.0
Stand: 2026-05-01
Repository: Bernds-tech/WellFit-now
Kontext: AR-Buddy / Unity / Mobile AR / UI / Architektur

---

## Zweck

Dieses Addendum ergaenzt `todolist/CHAT_START_PROMPT.md` und `todolist/NEXT_CHAT_HANDOFF_PROMPT.md` um verbindliche Skalierbarkeitsregeln.

Es soll in neuen Chats immer dann mitgelesen werden, wenn an folgenden Bereichen gearbeitet wird:

- Unity AR Buddy
- Mobile AR
- Buddy UI
- Debug Overlay
- Product UI
- App-/Backend-Commands an Unity
- Event-/State-Vertraege
- Mission-/Guide-/Ability-Erweiterungen

---

## Pflichtdateien bei AR-/Buddy-/UI-Arbeit

Zusätzlich zu den bestehenden Pflichtdateien lesen:

```txt
todolist/L - SKALIERBARKEIT - AR BUDDY UI UND ARCHITEKTUR.md
native/unity/WellFitBuddyAR/docs/BUDDY_COMMAND_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_ARCHITECTURE_SCALING_PLAN.md
native/unity/WellFitBuddyAR/docs/BUDDY_DEBUG_OVERLAY_REFACTOR_PLAN.md
```

---

## Verbindliche Skalierbarkeitsregeln

[!] Keine neuen Monolith-Seiten.
[!] Keine neuen Monolith-Controller.
[!] Kein dauerhaftes Weiterstapeln in `BuddyCallDebugController.cs`.
[!] Debug-UI, Produkt-UI und QA-/Diagnose-Export bleiben getrennt.
[!] Produkt-UI darf nicht aus Unity-`OnGUI` abgeleitet werden.
[!] Neue Commands zuerst im Contract definieren, danach Runtime-Code.
[!] Neue Product-UI-Hinweise zuerst als HintType/MessageKey/UserAction definieren.
[!] Neue Missionstypen, Avatarfaehigkeiten oder Surface-Regeln brauchen zuerst Contract/Draft oder kleine abgegrenzte Komponente.
[!] Unity bleibt reine AR-/Visualisierungs-/Event-Schicht.
[!] App/Backend bleiben Autoritaet fuer Rewards, Items, Faehigkeiten, Completion, Economy und Security.

---

## Drei UI-Ebenen

Bei jeder AR-/Buddy-UI-Entscheidung pruefen, welche Ebene betroffen ist:

```txt
1. Product UI
   Nutzerfreundliche Hinweise und wenige klare Aktionen.

2. Dev Debug UI
   Interne Testbuttons und Diagnosen fuer Entwicklung/QA.

3. Diagnose-/QA-Export
   Strukturierte Events, Logs und Contract-Payloads fuer Analyse.
```

Diese Ebenen duerfen nicht vermischt werden.

---

## Erlaubter Arbeitsmodus, wenn Unity gerade nicht getestet werden kann

Wenn der Nutzer nicht am PC/Unity testen kann:

[ ] Keine weiteren riskanten Unity-Runtime-Scripts stapeln.
[ ] Keine Scene-/Prefab-YAML riskant patchen.
[ ] Keine grosse Code-Aufteilung vor Compile-Test.
[ ] Keine neue Debug-Page in `BuddyCallDebugController.cs` stapeln.
[x] Stattdessen Contracts, ToDo-Konsolidierung, Event-/State-Drafts, Product-UI-Planung oder Testplaene ausarbeiten.

---

## Reihenfolge nach naechstem erfolgreichen Unity-Test

1. Compile-/Runtime-Fehler beheben.
2. Android-Retest bestaetigen.
3. Debug-Overlay anhand Handy-Test beurteilen.
4. `BuddyCallDebugController.cs` in kleinere Debug-Komponenten splitten.
5. Product-UI separat planen/implementieren.
6. App-/Backend-Commands schrittweise an Contract angleichen.
7. Event-/State-Versionierung einfuehren.

---

## Dauerhafte Security-Grenze

Unity und Product-UI duerfen niemals autorisieren:

```txt
Punkte
XP
Rewards
Mission Completion
Token/WFT
NFTs
Jackpot/Burn
Leaderboards
Anti-Cheat
Item-Freischaltungen
Faehigkeits-Freischaltungen
```

App/Backend bleiben Autoritaet.

---

## Kurzfassung fuer neue Chats

Bei AR-/Buddy-/UI-Aufgaben immer zuerst pruefen:

```txt
J = aktueller Arbeitsanker
K = AR-Buddy Companion/Avatar-Grundlogik
L = Skalierbarkeit / UI / Architektur
Unity docs = konkrete Contracts und Testplaene
```

Dann nur kleine Micro-Tasks umsetzen und bei fehlendem Unity-Test keine riskanten Runtime-Erweiterungen stapeln.
