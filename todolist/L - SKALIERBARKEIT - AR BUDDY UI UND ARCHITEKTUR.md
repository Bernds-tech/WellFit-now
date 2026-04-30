# WELLFIT – L: SKALIERBARKEIT – AR BUDDY, UI UND ARCHITEKTUR

Status: Verbindliche Skalierbarkeits-Ergaenzung fuer AR-Buddy-/Unity-/Mobile-/UI-Arbeit
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: PR #13 – Add local Unity AR Buddy companion project

---

## Zweck

Diese Datei stellt sicher, dass WellFit beim weiteren Ausbau nicht in grosse, schwer wartbare Monolith-Seiten, Monolith-Controller, vermischte UI-/Produkt-/Debug-Logik oder unuebersichtliche ToDo-Monolithen hineinwaechst.

Sie gilt besonders fuer:

- Unity AR Buddy
- Mobile AR-Seiten
- Buddy-Debug-Overlay
- Buddy-Produkt-UI
- App-/Backend-Command-Vertraege
- Event-/State-Vertraege
- Mission-/Guide-/Ability-Erweiterungen
- ToDo-/Roadmap-Struktur
- Handoff-/Statusdokumente

---

## 1. Grundsatz

WellFit muss modular skalieren.

Neue Funktionen duerfen nicht einfach an bestehende grosse Dateien angehaengt werden, wenn dadurch:

- eine Datei mehrere Verantwortlichkeiten uebernimmt,
- Debug-UI und Produkt-UI vermischt werden,
- Unity lokale Produkt-/Reward-/Security-Entscheidungen trifft,
- App-/Backend-Vertraege unklar bleiben,
- spaetere Tests oder Refactors deutlich riskanter werden,
- `todolist/` unuebersichtlich wird,
- neue Chats den aktuellen Stand nicht mehr schnell erfassen koennen.

---

## 2. Harte Skalierbarkeitsregeln

[!] Keine neuen Monolith-Seiten.
[!] Keine neuen Monolith-Controller.
[!] Kein dauerhaftes Weiterstapeln in `BuddyCallDebugController.cs`.
[!] Keine produktive UI direkt aus Unity-`OnGUI` ableiten.
[!] Debug-UI, Produkt-UI und Diagnose-/QA-Export bleiben getrennt.
[!] Unity bleibt reine AR-/Visualisierungs-/Event-Schicht.
[!] App/Backend bleiben Autoritaet fuer Rewards, Items, Faehigkeiten, Completion, Economy und Security.
[!] Neue Missionstypen, Avatarfaehigkeiten oder Surface-Regeln brauchen zuerst Contract/Draft oder klar abgegrenzte kleine Komponente.
[!] Wenn eine Datei sichtbar zu gross wird, wird zuerst gesplittet oder ein Addendum/Plan geschrieben, statt weiter anzubauen.
[!] Wenn eine ToDo-Datei sichtbar zu gross wird, wird ein thematisches Addendum angelegt und in `J`/Handoff referenziert.

---

## 3. Drei UI-Ebenen

WellFit-AR braucht langfristig drei getrennte UI-Ebenen:

### 3.1 Produkt-UI

Zielgruppe: normale Nutzer, Kinder, Familien, Senioren.

Eigenschaften:

- kurze klare Hinweise
- keine technischen Diagnosen
- keine Debug-Buttons
- keine Economy-/Reward-/Completion-Autoritaet
- altersgerecht
- familienfreundlich
- keine Scham-/Drucksprache

Beispiele:

```txt
Zeig mir kurz den Boden.
Das ist noch zu weit fuer mich.
Dafuer brauche ich spaeter eine Sprung-Faehigkeit.
Ich bin bei dir.
```

### 3.2 Dev-Debug-UI

Zielgruppe: Entwicklung und QA.

Eigenschaften:

- Testbuttons fuer Placement, Move, Return, Auto-Return, Visuals, Abilities, Guide
- Diagnosen sichtbar
- nur in Dev-Builds oder Debug-Szene
- nicht fuer normale Nutzer
- keine Produktlogik
- keine Reward-/Completion-Autoritaet

### 3.3 Diagnose-/QA-Export

Zielgruppe: Entwickler, Backend, QA, spaeter Analytics/Audit.

Eigenschaften:

- strukturierte Eventlisten
- Contract-Versionen
- klare Payloads
- keine direkte Reward-Autoritaet
- spaeter nutzbar als Evidence-Hinweis, aber nie alleiniger Beweis

---

## 4. Unity-Schichtenmodell

Neue AR-Buddy-Funktionen muessen in eine dieser Schichten passen:

1. Bridge Layer
2. AR/Anchor Layer
3. Navigation Layer
4. Companion Layer
5. Ability Layer
6. KI-Guide Layer
7. Debug Layer
8. Visual/Animation Layer
9. Product UI Layer

Wenn eine Funktion mehrere Schichten betrifft, wird sie in mehrere Micro-Tasks zerlegt.

---

## 5. Zielstruktur fuer Debug-Overlay

Nach erfolgreichem Unity-Compile-/Android-Retest soll das aktuelle Debug-Overlay aus `BuddyCallDebugController.cs` aufgeteilt werden.

Ziel-Dateien:

```txt
BuddyDebugOverlayRoot.cs
BuddyDebugDiagnosticsPanel.cs
BuddyDebugReturnPage.cs
BuddyDebugVisualPage.cs
BuddyDebugAbilityPage.cs
BuddyDebugGuidePage.cs
BuddyDebugStyle.cs
BuddyDebugControllerFinder.cs
```

Regeln:

[ ] Root verwaltet Sichtbarkeit, Page-Routing und gemeinsamen Status.
[ ] DiagnosticsPanel zeigt nur Diagnose-Daten.
[ ] ReturnPage testet Rueckruf/Auto-Return.
[ ] VisualPage testet Idle/Look/Animation.
[ ] AbilityPage testet Faehigkeits-Events.
[ ] GuidePage testet KI-Guide-/Mission-Hinweise.
[ ] Style kapselt Layoutwerte.
[ ] ControllerFinder kapselt Referenzsuche.

---

## 6. Skalierbare Product-UI fuer AR

Die spaetere Nutzer-UI darf nicht aus dem Debug-Overlay entstehen.

Geplante Product-UI-Bereiche:

[ ] `BuddyProductHintView` – kurze AR-Hinweise.
[ ] `BuddyProductActionPrompt` – Nutzeraktion bestaetigen, z. B. Buddy rufen.
[ ] `BuddyProductGuideBubble` – Buddy-Dialog/Guide-Hinweis.
[ ] `BuddyProductSurfaceHint` – Boden/Tisch/Surface-Hinweise.
[ ] `BuddyProductAbilityHint` – fehlende Faehigkeit erklaeren.
[ ] `BuddyProductSafetyHint` – kindersichere/ortsbezogene Hinweise.

Nicht erlaubt:

[!] keine Debug-Diagnosen im Produktmodus
[!] keine Rewards/XP/Punkte im Unity-Produkt-UI autorisieren
[!] keine Token-/NFT-/Trading-/Presale-Funktion in Mobile/Unity
[!] keine technischen Fehlermeldungen ungefiltert an Kinder/Nutzer zeigen

---

## 7. App-/Backend-Command-Vertraege vorbereiten

Damit Unity nicht direkt Produktlogik entscheidet, braucht es klare Befehle von App/Backend nach Unity.

Geplante Commands:

```txt
placeBuddy
moveBuddy
callBuddyToUser
resetPlacement
applyAbilityState
applyGuideSuggestion
clearGuide
setCompanionMode
setDebugMode
```

Grundregel:

Unity fuehrt Commands visuell aus und meldet Events zurueck. App/Backend entscheidet, was daraus folgt.

---

## 8. Event-/State-Versionierung

Alle produktnahen Unity-Events sollen spaeter versioniert werden.

Geplante Pflichtfelder:

```json
{
  "contractVersion": "buddy-ar-v1",
  "source": "unity",
  "eventName": "onBuddyActionStarted",
  "timestampClientMs": 0,
  "debugOnly": false
}
```

Status:

[ ] Contract-Versionen in Bridge einfuehren.
[ ] Debug-Events und Produkt-Events trennen.
[ ] Eventnamen zentralisieren.
[ ] Payloads vereinheitlichen.
[ ] App-/Backend-Auswertung erst nach Contract-Stabilisierung.

---

## 9. Skalierbare Daten-/State-Objekte

Einzelne Boolean-/String-Felder sind fuer den Test okay, aber spaeter brauchen wir kleine State-Objekte.

Geplante State-Objekte:

```txt
BuddyAbilityState
BuddyGuideState
BuddyCompanionState
BuddyMovementState
BuddySurfaceState
BuddyDebugState
BuddyProductHintState
```

Regel:

[ ] State-Objekte duerfen Unity anzeigen helfen.
[!] State-Objekte duerfen keine Rewards/Completion/Economy autorisieren.

---

## 10. Skalierbarkeit der ToDo-Listen

`todolist/` ist die Arbeitszentrale und muss selbst skalierbar bleiben.

### 10.1 ToDo-Grundregeln

[!] `J - NÄCHSTE EMPFOHLENE ARBEIT` bleibt der operative Kurzanker, nicht das Archiv fuer alles.
[!] Lange Detailthemen bekommen eigene Addendum-/Contract-Dateien.
[!] `README.md` bleibt Index und konsolidierte Uebersicht, nicht endloser Detailcontainer.
[!] Neue grosse Themen bekommen eigene Datei mit Buchstabe oder klarer Zusatzdatei.
[!] Statusdateien unter `todolist/status/` halten zeitbezogene Handoffs, nicht dauerhafte Masterregeln.
[!] Erledigte Aufgaben bleiben sichtbar, aber Details duerfen in Status-/Archivdateien verschoben werden.
[!] Neue Chat-Handoffs muessen nur die relevanten Dateien referenzieren, nicht komplette Inhalte duplizieren.

### 10.2 Empfohlene ToDo-Schichten

```txt
README.md                       = Index, Struktur, konsolidierte Uebersicht
J - NÄCHSTE EMPFOHLENE ARBEIT   = operativer Fokus und naechste Schritte
A-I / G1 / K / L                = verbindliche Themen-Roadmaps
*_ADDENDUM.md                   = thematische Erweiterungen ohne Hauptdateien aufzublaehen
status/*.md                     = zeitbezogene Handoffs und Test-/Arbeitsstaende
native/.../docs/*.md            = technische Contracts/Runbooks fuer konkrete Subsysteme
```

### 10.3 Wann neue ToDo-Datei statt bestehende Datei erweitern?

Neue Datei anlegen, wenn:

[ ] ein Thema mehr als ca. 1–2 Bildschirmseiten Detail braucht.
[ ] eine Hauptdatei dadurch unlesbar wuerde.
[ ] es ein eigener Arbeitsbereich ist, z. B. Skalierbarkeit, Product-UI, Commands, Retest.
[ ] der Inhalt eher Contract/Runbook/Status als Roadmap ist.
[ ] mehrere kuenftige Chats den Inhalt gezielt laden sollen.

Bestehende Datei nur kurz referenzieren, wenn:

[ ] sie nur den Arbeitsanker setzen muss.
[ ] ein Link/Dateiname reicht.
[ ] die Details schon in einem Addendum stehen.

### 10.4 Namenskonvention

Empfohlen:

```txt
A-J/G1/K/L                      = grosse Roadmap-/Masterbereiche
todolist/*_ADDENDUM.md          = dauerhafte Ergaenzungen
todolist/status/YYYY-MM-DD-*.md = zeitbezogene Handoffs
native/.../docs/*_CONTRACT.md   = technische Vertraege
native/.../docs/*_PLAN.md       = Refactor-/Architekturplaene
native/.../docs/*_CHECKLIST.md  = Test-/Runbook-Checklisten
```

### 10.5 Pflege-Regel

Bei jeder groesseren Aenderung:

1. Detail in passende Addendum-/Contract-/Status-Datei schreiben.
2. `J` nur kurz aktualisieren: Was ist neu? Was ist naechster Schritt?
3. Handoff nur mit Dateiliste und Kurzstand aktualisieren.
4. Keine Inhalte dreifach duplizieren.
5. Alte Regeln nicht loeschen, sondern als erledigt `[x]`, spaeter `[>]` oder kritisch `[!]` markieren.

---

## 11. Aktuelle Micro-Tasks ohne Handy-Test

Da der aktuelle Debug-Batch noch nicht lokal kompiliert wurde, sind bis zum naechsten Test nur risikoarme Aufgaben erlaubt:

[x] Skalierbarkeitsregeln in Unity-Dokumenten ergaenzt.
[x] Skalierbarkeitsregeln als eigene ToDo-Datei in `todolist/` angelegt.
[x] App-/Backend-Command-Vertrag fuer Buddy-Befehle entworfen.
[x] Product-UI-Hinweisvertrag fuer AR-Buddy entworfen.
[x] Event-/State-Versionierung konkretisiert.
[x] Debug-/Produkt-/QA-Trennung in `J - NÄCHSTE EMPFOHLENE ARBEIT` referenziert.
[x] ToDo-Listen-Skalierbarkeit in dieser Datei ergaenzt.
[ ] ToDo-Governance als eigenes Addendum/Contract pflegen.
[ ] Nach Unity-Test Debug-Overlay in kleine Komponenten splitten.

---

## 12. Naechster PC-Test bleibt unveraendert

Am PC:

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
2. Compile-Fehler zuerst beheben.
3. Android Build/Run starten.
4. 4 Debug-Seiten testen.
5. Danach erst Runtime-Refactor oder neue Features.

---

## 13. Dauerhafte Architekturgrenze

Unity darf niemals autorisieren:

[!] Punkte
[!] XP
[!] Rewards
[!] Mission Completion
[!] Token/WFT
[!] NFTs
[!] Jackpot/Burn
[!] Leaderboards
[!] Anti-Cheat
[!] Item-Freischaltungen
[!] Faehigkeits-Freischaltungen

Backend/App bleiben Autoritaet fuer:

[ ] Mission gueltig
[ ] Evidence gueltig
[ ] Item gueltig
[ ] Faehigkeit gueltig
[ ] Completion gueltig
[ ] Reward gueltig
[ ] XP/Punkte gueltig
[ ] Anti-Cheat gueltig
[ ] Economy Caps gueltig
[ ] Parent-/Kinder-/Alterskontext gueltig
