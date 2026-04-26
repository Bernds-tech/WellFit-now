# WellFit – Refactor & Stabilisierung

Quelle: Version 2.8, Version 3.0 und aktueller Code-Stand

---

## PHASE 1 – Refactor zuerst: große Dateien aufteilen

TASK-ID: WF-REFACTOR-000
STATUS: [~] In Arbeit

Ziel:
Erst Dateistruktur und Wartbarkeit stabilisieren, bevor neue Features weiter ausgebaut werden.

Akzeptanzkriterien:
[ ] Keine große App-Seite bleibt als schwer wartbare Monolith-Datei.
[ ] Wiederverwendbare Layout-Bausteine liegen zentral.
[ ] Seitenlogik, UI-Komponenten, Daten, Types und Helper sind getrennt.
[ ] Jede Änderung ist kleiner, kontrollierbarer und build-sicherer.

---

TASK-ID: WF-REFACTOR-001 – Tagesmissionen modularisiert
STATUS: [x] Basis erledigt

Erledigt:
[x] app/missionen/tagesmissionen/page.tsx verkleinert.
[x] MissionTile.tsx erstellt.
[x] MissionDetails.tsx erstellt.
[x] DailyHeader.tsx erstellt.
[x] DailySlots.tsx erstellt.
[x] FavoritesStrip.tsx erstellt.
[x] MissionPool.tsx erstellt.
[x] missions.ts erstellt.
[x] rewardEngine.ts erstellt.
[x] useDailyMissionFirebase.ts erstellt.

Offen:
[ ] Prüfen, ob page.tsx weiter verkleinert werden soll.
[ ] Types ggf. in types.ts auslagern.
[ ] Hooks ggf. weiter teilen: persistence, level, streak, reward.

---

TASK-ID: WF-REFACTOR-002 – Dashboard modularisieren
STATUS: [x] Basis umgesetzt

Ziel:
Dashboard wie Tagesmissionen in kleinere Dateien aufteilen.

Erledigt:
[x] Dashboard Header ausgelagert.
[x] Avatar-/User-Karte ausgelagert.
[x] Fortschritts-/Punktekarte ausgelagert.
[x] Firebase-/Realtime-Logik in Hook ausgelagert.
[x] Dashboard Types ausgelagert.
[x] page.tsx deutlich kleiner gemacht.
[x] Keine Firebase-Logik direkt tief im JSX.

Offen:
[ ] Weitere Prüfung auf Rest-Monolithen.
[ ] Gemeinsames AppLayout für eingeloggte Bereiche prüfen.

---

TASK-ID: WF-REFACTOR-003 – Einstellungen modularisieren
STATUS: [ ] Offen

Ziel:
Einstellungen in kleinere Komponenten und Hooks aufteilen.

Umsetzung:
[ ] Formularbereiche auslagern.
[ ] Permissions/Berechtigungen auslagern.
[ ] Firebase-Lade-/Speicherlogik in Hook auslagern.
[ ] Validierung / Types auslagern.

Akzeptanzkriterien:
[ ] Einstellungen sind wartbar und später realtime-fähig.

---

TASK-ID: WF-REFACTOR-004 – Wochenmissionen modularisieren
STATUS: [ ] Offen

Ziel:
Wochenmissionen strukturieren, aber inhaltlich nicht weiter ausbauen.

Umsetzung:
[ ] Header / Tabs / Cards / Details trennen.
[ ] Daten/Types/Helper auslagern.
[ ] Keine neue Missionslogik vor AR-Konzeptentscheidung.

---

TASK-ID: WF-REFACTOR-005 – Abenteuer modularisieren
STATUS: [ ] Offen

Ziel:
Abenteuer-Seite strukturieren, aber inhaltlich nicht weiter ausbauen.

Umsetzung:
[ ] Reise-/Kostenlogik trennen.
[ ] Cards und Details auslagern.
[ ] Daten/Types/Helper auslagern.

---

TASK-ID: WF-REFACTOR-006 – Challenge modularisieren
STATUS: [ ] Offen

Ziel:
Challenge-Seite strukturieren, aber inhaltlich nicht weiter ausbauen.

Umsetzung:
[ ] Kategorien auslagern.
[ ] Challenge Cards auslagern.
[ ] Daten/Types/Helper auslagern.

---

TASK-ID: WF-REFACTOR-007 – Wettkämpfe modularisieren
STATUS: [ ] Offen

Ziel:
Wettkämpfe strukturieren, aber noch keine echte PvP-/Einsatzlogik ausbauen.

Umsetzung:
[ ] Jackpot Header auslagern.
[ ] Wettkampf Cards auslagern.
[ ] Einsatz-/Burn-Simulation klar als Simulation isolieren.
[ ] Types/Helper auslagern.

---

TASK-ID: WF-REFACTOR-008 – Favoriten modularisieren und State später anbinden
STATUS: [ ] Offen

Ziel:
Favoriten-Seite strukturieren.

Umsetzung:
[ ] UI-Komponenten trennen.
[ ] Später echten Favoriten-State anbinden.

---

TASK-ID: WF-REFACTOR-009 – History modularisieren und State später vereinheitlichen
STATUS: [ ] Offen

Ziel:
History-Seite strukturieren.

Umsetzung:
[ ] UI-Komponenten trennen.
[ ] Firestore-Leselogik in Hook auslagern.
[ ] Später alle Missionsarten einheitlich anbinden.

---

TASK-ID: WF-REFACTOR-010 – Globale AppShell prüfen
STATUS: [~] In Arbeit

Erledigt:
[x] app/AppSidebar.tsx vorhanden.
[x] app/AppFooter.tsx vorhanden.

Offen:
[ ] Prüfen, ob eingeloggte Seiten ein gemeinsames AppLayout bekommen.
[ ] Footer als eigene zentrale Komponente finalisieren.
[ ] Header/Sidebar/Footer auf allen eingeloggten Seiten konsistent halten.

---

## PHASE 2 – Stabilisierung nach Refactor

TASK-ID: WF-QA-001
STATUS: [ ] Offen

[ ] Build und UI nach Refactor testen.
[ ] Login/Register Desktop testen.
[ ] Login/Register Mobile testen.
[ ] Dashboard Mobile/Desktop testen.
[ ] Mobile App Flow testen.

TASK-ID: WF-DOC-001
STATUS: [ ] Offen

[ ] README.md aktualisieren.
[ ] Projektstruktur dokumentieren.
[ ] .env.example erstellen.
[ ] Firebase Setup dokumentieren.
[ ] Server Deploy dokumentieren.
[ ] PM2 Start/Restart dokumentieren.
[ ] Hinweis auf todolist/ einbauen.

TASK-ID: WF-FIRESTORE-RULES-001
STATUS: [~] In Arbeit

[x] firestore.rules angelegt.
[x] firebase.json verknüpft.
[x] users, missionBuddyEvents und trackingSessions erste Regeln angelegt.
[ ] Firestore Rules im Firebase Emulator testen.
[ ] Firestore Rules deployen.
[ ] Regeln für neue Mobile-/Vision-/Tracking-Collections nachschärfen.
[ ] Punkte-/Reward-/Buddy-Felder langfristig serverseitig validieren.

TASK-ID: WF-LEGAL-002
STATUS: [ ] Offen

[ ] Datenschutz um Kamera/AR erweitern.
[ ] Datenschutz um Pose Tracking erweitern.
[ ] Datenschutz um HealthKit/Health Connect/Watch-Daten erweitern.
[ ] Optionale Emotion/Mimik-Analyse gesondert zustimmungspflichtig machen.
[ ] Keine Speicherung von Bildern/Videos als Standard.
