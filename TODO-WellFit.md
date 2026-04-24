# WELLFIT – MASTER ROADMAP & DEVELOPER TO-DO LIST

Version: 2.7 – MERGED MASTER ROADMAP / REFACTOR-FIRST / AR-FIRST UPDATE
Status: Aktive Produktumsetzung / Entwickler- und KI-Arbeitsgrundlage
Repository: Bernds-tech/WellFit-now
Datei: TODO-WellFit.md

## WICHTIGER HINWEIS

Diese Datei führt die bestehende To-do-Liste, die aktuelle GitHub-Erweiterung und die neue AR-Grundentscheidung zusammen.
Sie ersetzt keine früheren Inhalte durch Kürzung. Version 2.1, 2.2, 2.3, 2.4, 2.5 und 2.6 bleiben inhaltlich gültig.
Alle bestehenden Punkte bleiben gültig. Neue Erkenntnisse werden ergänzt, nicht ersetzt.

## A. NICHT-LÖSCHEN-REGEL / MASTER-LISTEN-REGEL

[!] Diese To-do-Liste darf niemals kleiner werden.
[!] Es dürfen keine bestehenden Aufgaben, Ideen, Epics, Businessplan-Punkte oder Architekturentscheidungen gelöscht werden.
[!] Erledigte Punkte bleiben sichtbar und werden auf [x] gesetzt.
[!] Verschobene Punkte bleiben sichtbar und werden auf [>] gesetzt.
[!] Blockierte Punkte bleiben sichtbar und werden auf [!] gesetzt.
[!] Wenn Inhalte zusammengeführt werden, muss der Inhalt erhalten bleiben.
[!] Neue Erkenntnisse werden ergänzt, nicht ersetzt.
[!] Die Reihenfolge darf geändert werden, aber der Inhalt muss erhalten bleiben.
[!] Kein produktrelevanter Punkt darf nur im Chat stehen bleiben.
[!] Bei jeder neuen Umsetzung muss diese Datei aktualisiert werden.

Statussystem:
- [ ] Offen
- [x] Fertig
- [~] In Arbeit
- [!] Blockiert / kritisch
- [>] Später / Backlog

Sichere Server-Deployment-Reihenfolge:
```bash
cd /var/www/WellFit-now
pm2 stop wellfit-now
git pull origin main
rm -rf .next
npm run build
pm2 restart wellfit-now --update-env
curl -I http://127.0.0.1:3000
```

## B. AKTUELLE STRATEGISCHE ENTSCHEIDUNGEN

[x] Alle Missionen sollen perspektivisch über AR laufen.
[x] Schritte zählen nicht mehr als Kernmission.
[>] Schritt-/Health-/Watch-Daten können später als unterstützende Validierungs- oder Kontextdaten dienen, aber nicht als Hauptmechanik.
[x] Tagesmissionen bleiben aktuell technischer Prototyp für Game Loop, Reward, Streak, XP und UI.
[!] Missionen egal ob Tagesmissionen, Wochenmissionen, Abenteuer, Challenge oder Wettkämpfe werden erst später inhaltlich weiter ausgebaut.
[!] Vor dem weiteren Missionsausbau werden zuerst große Dateien sauber modularisiert.
[x] Keine echte Token-Ausschüttung vor Testphase mit ca. 2.000–3.000 Testern.
[x] Aktuell alles über interne Punkte und XP abbilden.

## C. NEUE PRIORITÄTEN-REIHENFOLGE

### Phase 1 – Refactor zuerst: große Dateien aufteilen

[~] WF-REFACTOR-000 – Refactor-first Arbeitsregel
ZIEL: Erst Dateistruktur und Wartbarkeit stabilisieren, bevor neue Features weiter ausgebaut werden.
AKZEPTANZKRITERIEN:
[ ] Keine große App-Seite bleibt als schwer wartbare Monolith-Datei.
[ ] Wiederverwendbare Layout-Bausteine liegen zentral.
[ ] Seitenlogik, UI-Komponenten, Daten, Types und Helper sind getrennt.
[ ] Jede Änderung ist kleiner, kontrollierbarer und build-sicherer.

[~] WF-REFACTOR-001 – Tagesmissionen modularisiert
STATUS: [x] Basis erledigt
ERLEDIGT:
[x] `app/missionen/tagesmissionen/page.tsx` verkleinert.
[x] `MissionTile.tsx` erstellt.
[x] `MissionDetails.tsx` erstellt.
[x] `DailyHeader.tsx` erstellt.
[x] `DailySlots.tsx` erstellt.
[x] `FavoritesStrip.tsx` erstellt.
[x] `MissionPool.tsx` erstellt.
[x] `missions.ts` erstellt.
[x] `rewardEngine.ts` erstellt.
[x] `useDailyMissionFirebase.ts` erstellt.
OFFEN:
[ ] Prüfen, ob page.tsx weiter verkleinert werden soll.
[ ] Types ggf. in `types.ts` auslagern.
[ ] Hooks ggf. weiter teilen: persistence, level, streak, reward.

[ ] WF-REFACTOR-002 – Dashboard modularisieren
ZIEL: Dashboard wie Tagesmissionen in kleinere Dateien aufteilen.
UMSETZUNG:
[ ] Dashboard Header auslagern.
[ ] Avatar-/User-Karte auslagern.
[ ] Fortschritts-/Punktekarte auslagern.
[ ] Firebase-/Realtime-Logik in Hook auslagern.
[ ] Dashboard Types auslagern.
AKZEPTANZKRITERIEN:
[ ] Dashboard page.tsx ist deutlich kleiner und übersichtlich.
[ ] Keine Firebase-Logik direkt tief im JSX.

[ ] WF-REFACTOR-003 – Einstellungen modularisieren
ZIEL: Einstellungen in kleinere Komponenten und Hooks aufteilen.
UMSETZUNG:
[ ] Formularbereiche auslagern.
[ ] Permissions/Berechtigungen auslagern.
[ ] Firebase-Lade-/Speicherlogik in Hook auslagern.
[ ] Validierung / Types auslagern.
AKZEPTANZKRITERIEN:
[ ] Einstellungen sind wartbar und später realtime-fähig.

[ ] WF-REFACTOR-004 – Wochenmissionen modularisieren
ZIEL: Wochenmissionen strukturieren, aber inhaltlich nicht weiter ausbauen.
UMSETZUNG:
[ ] Header / Tabs / Cards / Details trennen.
[ ] Daten/Types/Helper auslagern.
[ ] Keine neue Missionslogik vor AR-Konzeptentscheidung.
AKZEPTANZKRITERIEN:
[ ] Wochenmissionen sind kleiner und skalierbar.

[ ] WF-REFACTOR-005 – Abenteuer modularisieren
ZIEL: Abenteuer-Seite strukturieren, aber inhaltlich nicht weiter ausbauen.
UMSETZUNG:
[ ] Reise-/Kostenlogik trennen.
[ ] Cards und Details auslagern.
[ ] Daten/Types/Helper auslagern.

[ ] WF-REFACTOR-006 – Challenge modularisieren
ZIEL: Challenge-Seite strukturieren, aber inhaltlich nicht weiter ausbauen.
UMSETZUNG:
[ ] Kategorien auslagern.
[ ] Challenge Cards auslagern.
[ ] Daten/Types/Helper auslagern.

[ ] WF-REFACTOR-007 – Wettkämpfe modularisieren
ZIEL: Wettkämpfe strukturieren, aber noch keine echte PvP-/Einsatzlogik ausbauen.
UMSETZUNG:
[ ] Jackpot Header auslagern.
[ ] Wettkampf Cards auslagern.
[ ] Einsatz-/Burn-Simulation klar als Simulation isolieren.
[ ] Types/Helper auslagern.

[ ] WF-REFACTOR-008 – Favoriten modularisieren und State später anbinden
ZIEL: Favoriten-Seite strukturieren.
UMSETZUNG:
[ ] UI-Komponenten trennen.
[ ] Später echten Favoriten-State anbinden.

[ ] WF-REFACTOR-009 – History modularisieren und State später vereinheitlichen
ZIEL: History-Seite strukturieren.
UMSETZUNG:
[ ] UI-Komponenten trennen.
[ ] Firestore-Leselogik in Hook auslagern.
[ ] Später alle Missionsarten einheitlich anbinden.

[ ] WF-REFACTOR-010 – Globale AppShell prüfen
ZIEL: Sidebar/Footer/Layout zentralisieren.
ERLEDIGT:
[x] `app/AppSidebar.tsx` vorhanden.
[x] `app/AppFooter.tsx` vorhanden.
OFFEN:
[ ] Prüfen, ob eingeloggte Seiten ein gemeinsames AppLayout bekommen.
[ ] Footer als eigene zentrale Komponente finalisieren.
[ ] Header/Sidebar/Footer auf allen eingeloggten Seiten konsistent halten.

### Phase 2 – Stabilisierung nach Refactor

[ ] WF-QA-001 – Build und UI nach Refactor testen.
[ ] WF-DOC-001 – README, Setup, Deployment, .env.example und Entwicklerübergabe finalisieren.
[ ] WF-SETTINGS-REALTIME-001 – Einstellungen auf onSnapshot umstellen.
[ ] WF-FIRESTORE-RULES-001 – Firestore-Regeln für neue Collections prüfen.
[ ] WF-LEGAL-002 – Datenschutz für AR/Kamera/Pose/Health/Watch erweitern.

### Phase 3 – Avatar / Inventory vor AR-Kisten

[ ] WF-AVATAR-INV-001 – Avatar-Inventar anlegen.
[ ] WF-AVATAR-INV-002 – Avatar-Items definieren: Helm, Rüstung, Handschuhe, Schuhe, Accessoires, Skins.
[ ] WF-AVATAR-INV-003 – Equipment Slots definieren.
[ ] WF-AVATAR-INV-004 – Item-Raritäten definieren: common, rare, epic, legendary.
[ ] WF-AVATAR-INV-005 – Belohnungen aus Kisten ins Inventar schreiben.
[ ] WF-AVATAR-INV-006 – Avatar-Ausrüstung im UI anzeigen.

### Phase 4 – AR-Grundsystem

[ ] WF-AR-CORE-001 – AR-Missionstyp definieren.
[ ] WF-AR-CORE-002 – AR-Sicherheitsregeln definieren: keine Straßen, keine gefährlichen Orte, keine Privatgrundstücke.
[ ] WF-AR-CORE-003 – AR-Ortslogik definieren: sichere Zonen, Radius, Zeitfenster, Altersfilter.
[ ] WF-AR-CORE-004 – Missionen als echte AR-Aufgaben definieren: Ort finden, Objekt scannen, Aufgabe erfüllen, Quiz beantworten.
[ ] WF-AR-CORE-005 – Schrittzähl-Missionen entfernen oder ersetzen.

### Phase 5 – AR-Schatzkisten / Loot Loop

[x] WF-AR-CHEST-000 – Konzept als GitHub Issue dokumentiert.
[ ] WF-AR-CHEST-001 – AR-Chest Mission Datenmodell erstellen.
[ ] WF-AR-CHEST-002 – Statusmodell: locked → tasksActive → chestRevealed → quizActive → claimed.
[ ] WF-AR-CHEST-003 – Aufgabenketten pro Kiste definieren.
[ ] WF-AR-CHEST-004 – Finale Quiz-/Frage-Komponente bauen.
[ ] WF-AR-CHEST-005 – Belohnung nach erfolgreichem Öffnen vergeben.
[ ] WF-AR-CHEST-006 – Anti-Cheat für Standort und Zeitfenster vorbereiten.

### Phase 6 – KI-Missionen und Personalisierung

[~] WF-MISS-AI-001 – KI-personalisierte Missionen architektonisch vorbereitet.
[ ] WF-AI-MISSIONS-001 – KI erstellt personalisierte Missionen basierend auf Nutzerprofil.
[ ] WF-AI-MISSIONS-002 – Speicherung aller KI-generierten Missionen in `aiGeneratedMissions`.
[ ] WF-AI-MISSIONS-003 – Verknüpfung von KI-Missionen mit Nutzer: userId + missionId + sessionId.
[ ] WF-AI-MISSIONS-004 – Tracking wie oft eine KI-Mission gespielt wird: usageCount.
[ ] WF-AI-MISSIONS-005 – Bewertungssystem: Completion Rate, Abbruchrate, Favoritenrate.
[ ] WF-AI-MISSIONS-006 – Mission Ratings speichern: likes, completionSuccess, difficultyMatch.
[ ] WF-AI-MISSIONS-007 – Gute KI-Missionen in globale Collection `missions` hochstufen.
[ ] WF-AI-MISSIONS-008 – Herkunft kennzeichnen: source prefab | ai | user.
[ ] WF-AI-MISSIONS-009 – KI darf nur Missionen erstellen, die zum Nutzerprofil passen.
[ ] WF-AI-MISSIONS-010 – Versionierung von Missionen.
[ ] WF-AI-MISSIONS-011 – Moderation / Qualitätssicherung.
[ ] WF-AI-MISSIONS-012 – Logging aller KI-Entscheidungen.
[ ] WF-AI-MISSIONS-013 – Creator Reward für Nutzer, deren Mission global übernommen wird.
[ ] WF-AI-MISSIONS-014 – Pipeline: KI erstellt → Nutzer spielt → Bewertung → global oder verworfen.

### Phase 7 – Missionen zuletzt weiter ausbauen

[>] WF-MISS-FUTURE-001 – Tagesmissionen inhaltlich auf AR-Logik umbauen.
[>] WF-MISS-FUTURE-002 – Wochenmissionen inhaltlich auf AR-Logik umbauen.
[>] WF-MISS-FUTURE-003 – Abenteuer inhaltlich auf AR-Logik umbauen.
[>] WF-MISS-FUTURE-004 – Challenge inhaltlich auf AR-Logik umbauen.
[>] WF-MISS-FUTURE-005 – Wettkämpfe inhaltlich auf AR-/Avatar-/PvP-Logik umbauen.
[>] WF-MISS-FUTURE-006 – 10 finale hochwertige Tagesmissionen erst nach AR-Regeln ersetzen.
[>] WF-MISS-FUTURE-007 – Punktewerte final balancen erst nach AR-/Avatar-/Reward-Modell.

## D. AKTUELLER UMSETZUNGSSTAND / WAS BEREITS VORHANDEN IST

[x] Dashboard existiert.
[x] Einstellungen existieren.
[x] Hilfe-Seite existiert.
[x] Tagesmissionen existieren.
[x] Wochenmissionen existieren.
[x] Abenteuer existieren.
[x] Challenge existiert.
[x] Wettkämpfe existieren.
[x] Favoriten existieren.
[x] History existiert.
[x] Rechtliche Seiten / Basislinks vorhanden: Datenschutz, AGB, Impressum, FAQ.
[x] Register-Seite vorhanden.
[x] Firebase Auth wird bereits in Dashboard/Einstellungen verwendet.
[x] Dashboard nutzt onAuthStateChanged.
[x] Dashboard nutzt onSnapshot / Live Sync für Userdaten.
[x] Dashboard nutzt lokalen Cache als schnelle Anzeige.
[x] Dashboard schreibt Fortschritt über setDoc mit merge.
[x] Punkte, Schritte, Level und Avatarwerte bleiben über Firebase/Cache nach Reload erhalten.
[x] lastLoginAt / updatedAt werden aktualisiert.
[x] Einstellungen speichern viele Userdaten in Firestore.
[x] Logout im Dashboard funktional.
[x] Logout in Einstellungen funktional.
[x] Hilfe-Seite mit Rudi Rastlos / Mascottchen vorbereitet.
[x] Rudi Rastlos Datei: mascottchen.png.
[x] Hilfe-Seite wurde kompakter/animierter vorbereitet.
[x] Sidebar wurde auf Dashboard-Standard gebracht.
[x] App aufs Handy laden steht einzeilig.
[x] Hilfe ist auf den umgebauten App-Seiten als Link zu /hilfe gesetzt.
[x] Punkte-Shop statt Wallet in der MVP-Sidebar auf den umgebauten Seiten.
[x] App-Content wurde auf den Hauptseiten ca. 30 Prozent kompakter gemacht.
[x] Mission Completion Helper für Firestore existiert.
[x] History-Seite nutzt Firestore-Realtime via onSnapshot.
[x] Tracking Session Helper für Firestore existiert.
[x] Browser-basierter Step Counter für Android-/PWA-nahe Tests vorbereitet.
[>] Schritte können technisch gezählt werden, sind aber nicht mehr Kernmission.
[>] Schrittbasierte Missionen können technisch automatisch abgeschlossen werden, sollen aber durch AR-Missionen ersetzt werden.
[x] Health Connect Vorbereitungsadapter / Architekturhinweis existiert.

## E. UI-KONSISTENZ / KOMPAKTER APP-STANDARD

TASK-ID: WF-UI-001
STATUS: [x] Fertig
ZIEL: App-UI vereinheitlichen und Inhaltsbereiche kompakter machen, ohne Sidebar-Breite zu verändern.
ERLEDIGT:
[x] Dashboard rechter Bereich kompakter.
[x] Dashboard Sidebar-Abstände korrigiert.
[x] Einstellungen rechter Bereich kompakter.
[x] Einstellungen Sidebar angeglichen.
[x] Hilfe-Seite ca. 30 Prozent kleiner.
[x] Tagesmissionen kompakter.
[x] Wochenmissionen kompakter.
[x] Abenteuer kompakter.
[x] Challenge kompakter.
[x] Wettkämpfe kompakter und inhaltlich neu strukturiert.
[x] Favoriten kompakter.
[x] History kompakter.
AKZEPTANZKRITERIEN:
[x] Alle App-Seiten wirken wie ein einheitliches Produkt.
[x] Sidebar bleibt 250px breit.
[x] Hauptcontent ist dichter und professioneller.
[x] App aufs Handy laden ist einzeilig.
[x] Hilfe ist als Link eingebunden.

TASK-ID: WF-HELP-001
STATUS: [x] Fertig / Basis umgesetzt
ZIEL: Hilfeseite als Nutzerunterstützung aufbauen.
ERLEDIGT:
[x] Hilfe-Seite vorhanden.
[x] Hilfe-Link in Sidebar eingebunden.
[x] Layout kompakter gemacht.
[x] Rudi Rastlos / Mascottchen als Hilfebegleiter vorgesehen.
OFFEN:
[ ] Inhalte der Hilfe-Seite später fachlich erweitern.
[ ] FAQ-/Supportstruktur später verknüpfen.

TASK-ID: WF-HELP-002
STATUS: [~] In Arbeit
ZIEL: Rudi Rastlos als animiertes Mascottchen / Hilfebegleiter vorbereiten.
ERLEDIGT:
[x] Mascottchen-Dateiname festgelegt: mascottchen.png.
[x] Hilfeseite soll Rudi Rastlos nutzen.
OFFEN:
[ ] Rudi später animieren: gehen, springen, winken, reagieren.
[ ] Später 3D/Avatar-Darstellung vorbereiten.
[ ] Später Interaktion mit KI-Buddy/Chat verbinden.

## F. DASHBOARD / REALTIME / FIREBASE

TASK-ID: WF-DASH-004
STATUS: [x] Fertig / Basis-Realtime umgesetzt
[x] Dashboard nutzt Firebase Auth mit onAuthStateChanged.
[x] Dashboard nutzt lokalen Cache.
[x] Dashboard nutzt Firestore onSnapshot.
[x] Dashboard schreibt Fortschritt über setDoc mit merge.
[x] Punkte, Schritte, Level und Avatarwerte bleiben nach Reload erhalten.
[x] lastLoginAt / updatedAt werden aktualisiert.
[x] Listener werden sauber unsubscribed.
[ ] Realtime-Verhalten in Mehrtab-/Mehrgerät-Test prüfen.

TASK-ID: WF-DASH-003
STATUS: [x] Fertig / Basis umgesetzt
[x] Dashboard nutzt Firebase signOut.
[x] Einstellungen nutzt Firebase signOut.
[x] Redirect auf Startseite nach Logout.
[ ] Logout auf allen Geräten später ergänzen.

TASK-ID: WF-SETTINGS-REALTIME-001
STATUS: [ ] Offen
[ ] Einstellungen von getDoc-basierter Lade-Logik auf onSnapshot umstellen.
[ ] Cache/Loading-State sauber kombinieren.
[ ] Listener sauber unsubscriben.

## G. MISSIONEN / LOCALSTORAGE / FIRESTORE

TASK-ID: WF-MISS-LOCALSTORAGE-001
STATUS: [!] Kritisch / Offen
ZIEL: Missionen dürfen langfristig nicht mehr localStorage als Hauptspeicher verwenden.
RISIKO:
[!] Daten sind nicht überall geräteübergreifend.
[!] Daten sind nicht überall zuverlässig für Pilot/Investoren-KPIs.
[!] Daten können durch Browserwechsel/Cache gelöscht werden.
[!] Einsätze/Jackpot/Burn dürfen nicht clientseitig manipulierbar bleiben.
ERLEDIGT:
[x] History nach Firestore migriert.
[x] Tagesmissionen haben Hybrid-Persistenz localStorage + Firebase.
OFFEN:
[ ] Favoriten vollständig nach Firestore migrieren.
[ ] aktive Missionen vollständig nach Firestore migrieren.
[ ] Punktevergabe über Firestore/Backend-Regeln absichern.
[ ] Wettkampf-Einsätze serverseitig absichern.
[ ] Jackpot/Burn nur serverseitig oder per Smart Contract/Backend berechnen.
[ ] localStorage nur noch für UI-Zustände nutzen.

TASK-ID: WF-MISS-REALTIME-001
STATUS: [~] In Arbeit
[x] Missionsstatus wird per onSnapshot geladen.
[x] History aktualisiert live.
[ ] Favorit setzen erscheint ohne Reload/Gerätewechsel.
[ ] Dashboard Punkte aktualisieren live.

TASK-ID: WF-MISS-HISTORY-001
STATUS: [~] In Arbeit
[x] History-Seite existiert.
[x] History nutzt Firestore-Realtime via onSnapshot.
[ ] Alle Missionsarten schreiben einheitlich in die History.

TASK-ID: WF-MISS-COMP-001
STATUS: [~] In Arbeit / MVP-Simulation umgesetzt
[x] Wettkämpfe als Duell-/Einsatz-/Jackpot-Modul vorbereitet.
[!] Aktuell nur clientseitige Simulation.
[ ] Matchmaking.
[ ] Servervalidierte Einsätze.
[ ] Anti-Cheat.
[ ] Jackpot-Settlement.
[ ] Burn-Mechanik rechtlich/technisch prüfen.

TASK-ID: WF-MISS-ENGINE-001
STATUS: [x] Fertig / Basis umgesetzt
[x] Tagesmissionen können dynamische Missionen / Firestore / Fallback architektonisch nutzen.
[x] KI-generierte Missionen sind architektonisch vorbereitet.

TASK-ID: WF-MISS-COMPLETE-002
STATUS: [x] Fertig / Basis umgesetzt
[x] Zentrale Mission-Completion-Logik für Firestore vorhanden.
[x] userMissionProgress wird bei Abschluss geschrieben.
[x] users.points / pointsTotal werden erhöht.
[x] history Eintrag wird erstellt.

TASK-ID: WF-MISS-PROGRESS-001
STATUS: [x] Fertig / Basis-Realtime umgesetzt
[x] userMissionProgress live aus Firestore laden und im UI nutzen.
[x] completedMissionIds und activeMissionIds aus Firestore ableiten.

## H. REWARD SYSTEM / SYSTEM HEALTH / NEXT-GEN MECHANICS

[x] Vorerst keine echte Token-Ausschüttung.
[x] Interne Punkte-Ausschüttung.
[x] Persönliche Wallet-/Economy-Logik konzeptionell vorbereitet.
[x] Systemreserve-Logik vorbereitet.
[x] Reward Score Basis vorhanden.
[x] Avatar + Economy beeinflussen Reward konzeptionell/teilweise.
[x] Reward Breakdown im UI.
[x] Diversity Multiplier.
[x] Anti-Farming Multiplier.
[x] Daily Reward Loop.
[x] Tagesziel 3 Missionen.
[x] Streak System.
[x] Streak UI.
[x] XP-/Level-System.
[ ] Completion Trends über mehrere Tage/Wochen.
[ ] Precision / Workout Qualität.
[ ] Sensor Fusion.
[ ] Anti-Cheat AI.
[ ] Streak-Risiko/Verlust visuell stärker darstellen.

## I. MOBILE / AR / TRACKING / KI

TASK-ID: WF-MOBILE-001
STATUS: [>] Später / Backlog
[x] Web-App = Steuerzentrale.
[x] Mobile App = täglicher Begleiter.
[ ] Startscreen mit AR-Startbutton, nicht automatisch Kamera starten.
[ ] Rechts oben Nutzerbild.
[ ] Daneben Buddy-Level.
[ ] Links Hamburger-Menü.
[ ] Unten Tagesfortschritt nur als Balken.
[ ] AR-Elemente realistisch in Umgebung einbetten.

TASK-ID: WF-AI-POSE-001
STATUS: [>] Später / Backlog
[ ] Pose Tracking vorbereiten.
[ ] Skeleton Tracking definieren.
[ ] Saubere Wiederholungen zählen.
[ ] Schlechte Wiederholungen nicht zählen.

TASK-ID: WF-AI-MOOD-001
STATUS: [>] Später / Backlog
[ ] Mimik-/Stimmungszustände definieren.
[ ] Consent für Kamera/Mimik-Erkennung.
[ ] Keine Speicherung von Bildern/Videos als Standard.
[ ] Nur lokale Analyse prüfen.

TASK-ID: WF-WATCH-001
STATUS: [>] Später / Backlog
[>] Schritte, Smartwatch- und Health-Daten sind Kontextdaten, nicht Kernmission.
[ ] HealthKit prüfen.
[ ] Google Health Connect prüfen.
[ ] Smartwatch-Daten anbinden.
[ ] Datenminimierung und Consent festlegen.

TASK-ID: WF-TRACK-001
STATUS: [x] Fertig / Basis umgesetzt
[x] `lib/tracking.ts` erstellt.
[x] startTrackingSession vorhanden.
[x] finishTrackingSession vorhanden.
[x] trackingSessions Collection wird beschrieben.

TASK-ID: WF-TRACK-002
STATUS: [>] Später / technische Basis vorhanden
[x] `lib/stepCounter.ts` erstellt.
[x] DeviceMotionEvent wird verwendet.
[>] Schrittzählung bleibt technische Grundlage, aber keine Kernmission.

TASK-ID: WF-TRACK-005
STATUS: [ ] Offen / Architektur vorbereitet
[ ] Google Health Connect Integration.

TASK-ID: WF-TRACK-006
STATUS: [ ] Offen
[ ] Apple HealthKit vorbereiten.

TASK-ID: WF-TRACK-007
STATUS: [ ] Offen
[ ] Hybrid-Tracking-Engine schaffen.
[ ] Doppelte Zählung verhindern.
[ ] Trackingquellen transparent im UI anzeigen.

TASK-ID: WF-ANTI-CHEAT-001
STATUS: [ ] Offen
[ ] Cheat-Schutz für AR, Tracking und Wettbewerbe ausbauen.
[ ] Standort / Zeit / Aufgabe plausibilisieren.
[ ] Wettbewerbe serverseitig validieren.

## J. WEBSITE / LANDINGPAGE / BUSINESS / INVESTOREN / PILOT

[ ] Startseite klarer machen.
[ ] Hero-Text schärfen.
[ ] Problem erklären: Menschen bewegen sich zu wenig, Motivation fehlt, Gesundheitsprogramme sind oft langweilig.
[ ] Lösung erklären: WellFit macht Bewegung spielerisch, sozial und belohnend.
[ ] Zielgruppen darstellen: Nutzer, Familien, Firmen, Städte, Marken, Investoren.
[ ] echte App-Screens / Produkt-Screens einbauen.
[ ] Roadmap anzeigen.
[ ] Investor-Bereich einbauen.
[ ] Pilotpartner-Bereich einbauen.
[ ] Warteliste oder Registrierung einbauen.
[ ] Kontaktformular einbauen.
[ ] Impressum vollständig machen.
[ ] Datenschutzseite vollständig machen.
[ ] AGB vorbereiten.
[ ] Mobile Ansicht prüfen.
[ ] Ladezeiten prüfen.
[ ] Menüführung prüfen.
[ ] Tote Links entfernen.
[ ] Rechtschreibfehler korrigieren.
[ ] Token nicht zu dominant auf Startseite platzieren.
[ ] Keine unrealistischen Versprechen machen.

## K. WEITERE GRUNDGERÜST-PUNKTE AUS GESAMTKONZEPT

TASK-ID: WF-FAMILY-001
STATUS: [>] Später / Backlog
[ ] Familiengruppen definieren.
[ ] Enkel-/Kind-zu-Großeltern-Missionen definieren.
[ ] Silver-Economy-Use-Cases definieren.
[ ] Gemeinsame Familienziele definieren.
[ ] Datenschutz/Einwilligung für Familiengruppen prüfen.

TASK-ID: WF-CORP-001
STATUS: [>] Später / Backlog
[ ] Firmen-Challenges.
[ ] Teamranglisten.
[ ] anonymisierte Firmen-Analytics.
[ ] Company Admin Rolle.
[ ] Datenschutz für Arbeitgeberdaten streng abgrenzen.

TASK-ID: WF-CITY-001
STATUS: [>] Später / Backlog
[ ] Ortsmissionen.
[ ] Checkpoints.
[ ] Parks/Sehenswürdigkeiten.
[ ] Stadt-/Tourismus-Partner.
[ ] Eventmissionen.

TASK-ID: WF-REVENUE-001
STATUS: [>] Später / Backlog
[ ] Firmenlizenzen.
[ ] BGM-Challenges.
[ ] Sponsored Missions.
[ ] Brand Campaigns.
[ ] Versicherungen/Prävention.
[ ] Städte/Tourismus.
[ ] Eventpartner.
[ ] Marketplace Fees.
[ ] Premium Accounts.
[ ] White-Label-Challenges.
[ ] Partner-Rewards.
[ ] anonymisierte Reports DSGVO-konform.
[ ] AR-Skins / digitale Items später.
[ ] API-/Platform Fees später.
[ ] Bildungs-/Lernmissionen.
[ ] Gesundheitsprogramme.
[ ] Corporate Team Challenges.
[ ] International Licensing.

TASK-ID: WF-INVEST-002
STATUS: [>] Später / Backlog
[ ] Fiat-to-Token / Treasury / Buyback / Burn-Logik dokumentieren.
[ ] Keine Rendite- oder Preisversprechen.
[ ] MiCAR-Prüfung vor Veröffentlichung.

TASK-ID: WF-PILOT-002
STATUS: [>] Später / Backlog
[ ] 100–500 echte User.
[ ] 2–3 Wochen Pilotdaten.
[ ] 2 LOIs: Corporate/BGM + Location/Event/Gemeinde.
[ ] 1 Tech Lead oder Agentur-Nachweis.
[ ] Retention, Aktivierung, Mission Completion, Feedbackscore messen.

TASK-ID: WF-APPSTORE-001
STATUS: [>] Später / Backlog
[ ] iOS TestFlight vorbereiten.
[ ] Google Play Internal/Closed Testing vorbereiten.
[ ] Technologieentscheidung: React Native/Expo, Capacitor, Flutter oder native Swift/Kotlin.
[ ] Kamera, AR, HealthKit, Health Connect, Smartwatch-Daten und Datenschutztexte store-konform planen.

TASK-ID: WF-BUDDY-CHAR-001
STATUS: [ ] Offen
[ ] Mehrere Buddy-Charaktere definieren.
[ ] Verhalten abhängig von Userdaten, Aktivität, Schlaf, Stress, Stimmung, Fortschritt.
[ ] Charakter kann sich entwickeln.

TASK-ID: WF-BUDDY-SAFETY-001
STATUS: [ ] Offen
[ ] Keine Diagnosen.
[ ] Keine Therapieempfehlungen.
[ ] Keine Scham-/Drucksprache.
[ ] Motivation positiv formulieren.
[ ] Bei Beschwerden Arzt/Expertin empfehlen.
[ ] Hinweis: ersetzt keine medizinische Beratung.

TASK-ID: WF-STORE-SAFE-002
STATUS: [>] Später / Backlog
[ ] Keine Mining-/DePIN-Last am Handy.
[ ] Mobile App macht Interface, Kamera, AR, GPS, Missionen, Gamification und lokale KI-Inferenz.
[ ] Rechenintensive Prozesse laufen off-device.
[ ] Apple/Google Policies prüfen.
[ ] Tokenmechaniken aus App-Store-kritischen Bereichen heraushalten.

## L. HINWEIS ZU VERSION 2.1 / 2.2 / 2.3 / 2.4 / 2.5 / 2.6

Frühere Versionen enthalten weiterhin gültige Inhalte zu:
- Ziel dieser Datei
- aktueller technischer Stand
- strategische Grundentscheidung
- Phasenplan
- technische Epics
- Firebase/Firestore
- Datenmodell
- Website/Landingpage
- App/Dashboard
- Missionen
- Gamification
- KI-Buddy
- Reward Center/Token
- Marktplatz
- Leaderboard
- Analytics
- Mobile/App/AR
- Pilot
- Businessplan
- Finanzmodell
- Investoren
- Partner/LOIs
- Marketing
- Recht/Compliance
- Store-Safe Architecture
- Agentur/Entwickler-Briefing
- GitHub
- Prioritäten
- offene Entscheidungen
- Merksätze
- Tests

Diese Version darf nicht genutzt werden, um frühere Versionen zu ersetzen oder zu kürzen. Neue Punkte werden ergänzt, nicht gelöscht.
