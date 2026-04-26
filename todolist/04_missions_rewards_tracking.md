# WellFit – Missionen, Rewards, Tracking und Anti-Cheat

Quelle: Version 2.8 + aktueller Mission/Buddy/Mobile-Stand

---

## 1. Missionen / localStorage / Firestore

TASK-ID: WF-MISS-LOCALSTORAGE-001
STATUS: [!] Kritisch / Offen

Ziel:
Missionen dürfen langfristig nicht mehr localStorage als Hauptspeicher verwenden.

Aktuell erkannt:
[x] Tagesmissionen besitzen Missionslogik.
[x] Wochenmissionen besitzen Missionslogik.
[x] Abenteuer besitzen Reise-/Kostenlogik.
[x] Challenge besitzt Kategorie-/Routenlogik.
[x] Wettkämpfe besitzen PvP-/Einsatz-/Jackpot-/Burn-Simulationslogik.
[x] Favoriten werden aktuell lokal gespeichert.
[x] History wurde bereits auf Firestore-Realtime umgestellt, aber lokale Restlogik existiert noch an anderen Stellen.
[x] Aktive Missionen werden aktuell teilweise lokal gespeichert.
[x] Punkte werden teilweise lokal über wellfit-user verändert.

Risiko:
[!] Daten sind nicht überall geräteübergreifend.
[!] Daten sind nicht überall zuverlässig für Pilot/Investoren-KPIs.
[!] Daten können durch Browserwechsel/Cache gelöscht werden, wenn sie noch lokal gehalten werden.
[!] Einsätze/Jackpot/Burn dürfen nicht clientseitig manipulierbar bleiben.

Umsetzung später:
[ ] Favoriten nach Firestore migrieren.
[x] History nach Firestore migrieren.
[ ] aktive Missionen nach Firestore migrieren.
[ ] Punktevergabe über Firestore/Backend-Regeln absichern.
[ ] Wettkampf-Einsätze serverseitig absichern.
[ ] Jackpot/Burn nur serverseitig oder per Smart Contract/Backend berechnen.
[ ] localStorage nur noch für UI-Zustände nutzen.

---

TASK-ID: WF-MISS-REALTIME-001
STATUS: [~] In Arbeit

[x] userMissionProgress Collection wird genutzt.
[ ] favorites Collection nutzen oder users/{uid}/favorites Subcollection definieren.
[x] history Collection wird genutzt.
[x] Missionsstatus wird per onSnapshot geladen.
[ ] Punkteänderung nach Mission live im Dashboard anzeigen.
[x] Tagesmissionen laden Missionen dynamisch aus Firestore.
[x] Fallback-Missionen schützen das UI bei leerer Datenbasis.

---

TASK-ID: WF-MISS-HISTORY-001
STATUS: [~] In Arbeit

Ziel:
Alle erledigten Missionen sollen in History abgelegt werden.

Aktuell:
[x] History-Seite existiert.
[x] History nutzt Firestore-Realtime via onSnapshot.
[x] History zeigt Titel, Kategorie, Belohnung, Icon und Abschlussdatum.
[x] Tagesmissionen schreiben bei Abschluss in History.
[ ] Alle Missionsarten schreiben noch nicht einheitlich in die History.

Umsetzung:
[x] Tagesmissionen bei Abschluss in History schreiben.
[ ] Wochenmissionen bei Abschluss in History schreiben.
[ ] Abenteuer bei Abschluss in History schreiben.
[ ] Challenge bei Abschluss in History schreiben.
[ ] Wettkämpfe bei Abschluss/Sieg/Teilnahme in History schreiben.
[ ] Mobile Kamera-Missionen sauber in History oder eigene mobile completions aufnehmen.

---

TASK-ID: WF-MISS-COMP-001
STATUS: [~] In Arbeit / MVP-Simulation umgesetzt

Ziel:
Wettkämpfe als Duell-/Einsatz-/Jackpot-Modul vorbereiten.

Umsetzung:
[x] Checkpoint-Duelle vorgesehen: Mathe, Buchstabieren, Rätsel.
[x] Wochen-Challenges vorgesehen: Wochenaufgabe schneller erreichen, mehr Schritte pro Woche.
[x] Avatar-Arena vorgesehen: z. B. Schwertkampf, Drachenkampf, Zauberduell.
[x] Einsatzlogik UI-seitig vorbereitet.
[x] 10 Prozent Jackpot-Anteil vorgesehen.
[x] Light Burn 1 bis 10 Prozent als MVP-Simulation vorgesehen.
[x] Jackpot-Anzeige vorhanden.

Risiko:
[!] Aktuell nur clientseitige Simulation.
[!] Später rechtlich, serverseitig und tokenökonomisch prüfen.

Umsetzung später:
[ ] Matchmaking.
[ ] Servervalidierte Einsätze.
[ ] Anti-Cheat.
[ ] Ergebniserfassung.
[ ] Jackpot-Settlement.
[ ] Burn-Mechanik rechtlich/technisch prüfen.
[ ] Avatar-Kampfregeln definieren.

---

## 2. Mission Engine

TASK-ID: WF-MISS-ENGINE-001
STATUS: [x] Fertig / Basis umgesetzt

[x] Tagesmissionen lesen aktive Missionen aus der missions Collection.
[x] Missionen werden per onSnapshot live geladen.
[x] Fallback-Missionen für leere / fehlerhafte Firestore-Situationen sind vorhanden.
[x] Feldnormalisierung für reward / pointsReward / category / difficulty / type / duration / targetValue / unit ist vorbereitet.
[x] Kennzeichnung der Quelle: firestore / fallback / ai ist im UI vorgesehen.

TASK-ID: WF-MISS-COMPLETE-002
STATUS: [x] Fertig / Basis umgesetzt

[x] lib/missionCompletion.ts erstellt.
[x] userMissionProgress wird bei Abschluss geschrieben.
[x] users.points / pointsTotal werden erhöht.
[x] history Eintrag wird erstellt.

TASK-ID: WF-MISS-PROGRESS-001
STATUS: [x] Fertig / Basis-Realtime umgesetzt

[x] onAuthStateChanged für aktuellen User.
[x] userMissionProgress Query mit userId Filter.
[x] onSnapshot lädt Status und progressValue live.
[x] completedMissionIds werden aus Firestore abgeleitet.
[x] activeMissionIds werden aus Firestore abgeleitet.
[x] Fortschrittsbalken in Tagesmissionen basiert auf Firestore-Daten.

TASK-ID: WF-MISS-BUDDY-BRIDGE-001
STATUS: [x] Fertig / Produktverbindung umgesetzt

[x] app/missionen/lib/missionBuddyBridge.ts erstellt.
[x] Mission Completion kann Buddy-Werte verändern.
[x] Mission Completion kann Punkte vergeben.
[x] Doppelte Punkte-/Buddy-Effekte werden über missionBuddyEvents verhindert.
[x] Mobile Kniebeugen-Mission triggert Bridge nach pose-validierter Completion.
[ ] Bridge langfristig serverseitig validieren.

---

## 3. KI-Missionen und Personalisierung

TASK-ID: WF-MISS-AI-001
STATUS: [~] In Arbeit / Architektur vorbereitet

[x] Missionsmodell enthält aiPersonalized.
[x] Missionsquelle firestore / fallback / ai ist vorgesehen.
[x] UI kommuniziert KI-personalisierte Quests.
[ ] Nutzerprofil, Aktivität, Schlaf, Stress, Stimmung und Ziele als Inputs final definieren.
[ ] KI-Generierungslogik für individuelle Tagesmissionen aufbauen.
[ ] Generierte Missionen in Firestore speichern.

Erweiterung:
[ ] WF-AI-MISSIONS-001 – KI erstellt personalisierte Missionen basierend auf Nutzerprofil.
[ ] WF-AI-MISSIONS-002 – Speicherung aller KI-generierten Missionen in separater Collection aiGeneratedMissions.
[ ] WF-AI-MISSIONS-003 – Verknüpfung von KI-Missionen mit Nutzer: userId + missionId + sessionId.
[ ] WF-AI-MISSIONS-004 – Tracking wie oft eine KI-Mission gespielt wird: usageCount.
[ ] WF-AI-MISSIONS-005 – Bewertungssystem für Missionen: Completion Rate, Abbruchrate, Favoritenrate.
[ ] WF-AI-MISSIONS-006 – Speicherung von Mission Ratings: likes, completionSuccess, difficultyMatch.
[ ] WF-AI-MISSIONS-007 – Gute KI-Missionen in globale Collection missions hochstufen.
[ ] WF-AI-MISSIONS-008 – Herkunft kennzeichnen: source prefab | ai | user.
[ ] WF-AI-MISSIONS-009 – KI darf nur Missionen erstellen, die zum Nutzerprofil passen.
[ ] WF-AI-MISSIONS-010 – Versionierung von Missionen.
[ ] WF-AI-MISSIONS-011 – Moderation / Qualitätssicherung.
[ ] WF-AI-MISSIONS-012 – Logging aller KI-Entscheidungen.
[ ] WF-AI-MISSIONS-013 – Creator Reward für Nutzer, deren Mission global übernommen wird.
[ ] WF-AI-MISSIONS-014 – Pipeline: KI erstellt -> Nutzer spielt -> Bewertung -> global oder verworfen.

---

## 4. Reward System / System Health / Next-Gen Mechanics

[x] Vorerst KEINE echte Token-Ausschüttung.
[x] Interne Punkte-Ausschüttung.
[x] Persönliche Wallet-/Economy-Logik vorbereitet.
[x] Systemreserve-Logik vorbereitet.
[x] Reward Score Basis vorhanden.
[x] Avatar + Economy beeinflussen Reward konzeptionell/teilweise.
[x] Reward wird beim Start fixiert.
[x] Reward Breakdown im UI sichtbar, einklappbar, animiert.
[x] Systemgesundheit im UI.
[x] Avatar-Zustand im UI.
[x] Nutzerverhalten im UI.
[x] Diversity Multiplier.
[x] Anti-Farming Multiplier.
[x] Social Multiplier – Basisfeld technisch vorbereitet.
[x] Daily Reward Loop.
[x] Tagesziel 3 Missionen.
[x] Streak System.
[x] Streak Bonus.
[x] Streak UI.
[x] XP-/Level-System.
[x] Precision / Workout Qualität technisch in mobiler Kniebeugen-Mission vorbereitet.
[ ] Sensor Fusion.
[ ] Anti-Cheat AI.
[ ] Completion Trends über mehrere Tage/Wochen.
[ ] Streak-Risiko/Verlust visuell stärker darstellen.
[ ] DePIN Compute.
[ ] Pharma Simulation.
[ ] External Economy.
[>] Echte Token-/WFT-Anbindung bewusst verschoben bis nach Testphase.

---

## 5. Tracking / Health / Anti-Cheat

TASK-ID: WF-TRACK-001
STATUS: [x] Fertig / Basis umgesetzt

[x] lib/tracking.ts erstellt.
[x] startTrackingSession vorhanden.
[x] finishTrackingSession vorhanden.
[x] trackingSessions Collection wird beschrieben.
[x] source / missionId / missionTitle / activityType / startTime / endTime / stepsAggregated / eventsCount / validReps / invalidReps sind berücksichtigt.
[x] qualityScore / confidence / moodSignal / exercise sind ergänzt.

TASK-ID: WF-TRACK-002
STATUS: [>] Später / technische Basis vorhanden

[x] lib/stepCounter.ts erstellt beziehungsweise Browser-Motion-Logik vorbereitet.
[x] DeviceMotionEvent wird verwendet.
[x] Schritt-Peaks werden erkannt.
[x] Min-/Max-Intervall als Basis-Anti-Cheat integriert.
[x] Permission-Request für Motion-Sensor ist vorgesehen.
[>] Schrittzählung bleibt technische Grundlage, aber keine Kernmission.

TASK-ID: WF-TRACK-005
STATUS: [ ] Offen / Architektur vorbereitet

[x] healthConnect Adapter / Planungsdatei vorbereitet.
[ ] Android App / Native Bridge vorbereiten.
[ ] Health Connect SDK integrieren.
[ ] User Consent Screen bauen.
[ ] Tages-/Wochen-Schritte aus Health Connect lesen.
[ ] Aggregierte Tageswerte in Firestore trackingSessions oder Daily Activity Collection speichern.
[ ] Plausibilitätsprüfung / Anti-Cheat ergänzen.

TASK-ID: WF-TRACK-006
STATUS: [ ] Offen

[ ] Native iOS/App-Layer definieren.
[ ] HealthKit Berechtigungen und Consent planen.
[ ] Schritt- und Aktivitätsdaten in Firestore synchronisieren.

TASK-ID: WF-TRACK-007
STATUS: [ ] Offen

[ ] Hybrid-Tracking-Engine schaffen: Browser/PWA + Health Connect + HealthKit + Watch.
[ ] Prioritätslogik definieren: Systemdaten vor Browserdaten.
[ ] Doppelte Zählung verhindern.
[ ] Trackingquellen transparent im UI anzeigen.
[ ] Firestore Datenmodell für Quellenharmonisierung definieren.

TASK-ID: WF-ANTI-CHEAT-001
STATUS: [ ] Offen

[ ] Cheat-Schutz für AR, Tracking und Wettbewerbe ausbauen.
[ ] Standort / Zeit / Aufgabe plausibilisieren.
[ ] Schrittmuster validieren.
[ ] Geschwindigkeit / Distanz / Zeitfenster plausibilisieren.
[ ] Unplausible Tracking-Sessions markieren.
[ ] Wettbewerbe serverseitig validieren.
[ ] Pose-basierte Completion serverseitig plausibilisieren.
