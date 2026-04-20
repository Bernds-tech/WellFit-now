# WellFit – konsolidierte To-do-Liste

Stand: 2026-04-20

## Grundsatz-Update

- Alle Aufgaben und Missionen sollen perspektivisch über AR laufen.
- Schritte zählen nicht als Mission und werden nicht als Kernmechanik verwendet.
- Tagesmissionen bleiben aktuell der technische Prototyp für den Game Loop, werden aber später auf AR-Missionslogik umgestellt.

## Erledigt / aktuell umgesetzt

### Tagesmissionen – Struktur
- [x] Tagesmissionen-Datei modularisiert.
- [x] Globale Sidebar ausgelagert: `app/AppSidebar.tsx`.
- [x] Globaler Footer ausgelagert: `app/AppFooter.tsx`.
- [x] Tagesmissionen-Daten ausgelagert: `app/missionen/tagesmissionen/missions.ts`.
- [x] Tagesmissionen Reward Engine ausgelagert: `app/missionen/tagesmissionen/rewardEngine.ts`.
- [x] MissionTile ausgelagert.
- [x] MissionDetails ausgelagert.
- [x] DailyHeader ausgelagert.
- [x] DailySlots ausgelagert.
- [x] FavoritesStrip ausgelagert.
- [x] MissionPool ausgelagert.

### Tagesmissionen – aktueller Game Loop
- [x] Missionen per Drag & Drop in Tagesauswahl ziehen.
- [x] Favoriten setzen und anzeigen.
- [x] KI-Empfehlungen gelb markieren.
- [x] Mission starten.
- [x] Mission abschließen.
- [x] Abschluss bleibt nach Reload erhalten.
- [x] Fortschritt 0 % / gestartet / abgeschlossen anzeigen.
- [x] Punkte-Breakdown ein-/ausklappbar.
- [x] Diversity Bonus eingebaut.
- [x] Anti-Farming eingebaut.
- [x] Streak Bonus in Reward Engine integriert.
- [x] Daily Goal mit 3 abgeschlossenen Missionen eingebaut.
- [x] Daily Reset über Tages-Key vorbereitet.
- [x] Streak System eingebaut.
- [x] XP-/Level-System eingebaut.
- [x] Level-Fortschritt im Header vorbereitet.
- [x] localStorage + Firebase Hybrid-Persistenz für Tagesmissionen.

### Server / Build
- [x] Build-Fehler durch großen JSX-Block behoben.
- [x] Build läuft aktuell erfolgreich, wenn kein paralleler Next-Build-Prozess aktiv ist.
- [x] PM2 Restart-Prozess geklärt: erst nach grünem Build neu starten.

### Konzept / Produkt
- [x] AR-Schatzkisten-Mission als Konzept dokumentiert.
- [x] GitHub Issue erstellt: AR-Schatzkisten-Missionen für Avatar-Belohnungen.

## Offen / Nächste Aufgaben

### Sofort prüfen
- [ ] Build nach Level-System erneut testen.
- [ ] Prüfen, ob Header Level/XP sichtbar korrekt anzeigt.
- [ ] Prüfen, ob Daily Goal nach Abschluss von 1/3, 2/3, 3/3 live hochzählt.
- [ ] Prüfen, ob Streak erst nach 3 abgeschlossenen Tagesmissionen steigt.
- [ ] Prüfen, ob XP bei Abschluss mit `reward.finalReward` steigt.
- [ ] Prüfen, ob Firebase-Regeln Lesen/Schreiben für `userDailyMissionState`, `userDailyStreaks`, `userLevels` erlauben.

### Wichtig: AR-Umstellung
- [ ] Tagesmissionen von klassischen Karten auf AR-Missionskarten umdenken.
- [ ] Schrittzähl-Missionen entfernen oder ersetzen.
- [ ] Missionen sollen echte AR-Aufgaben sein, z. B. Ort finden, Objekt scannen, Aufgabe erfüllen, Quiz beantworten.
- [ ] AR-Missionstyp definieren.
- [ ] AR-Sicherheitsregeln definieren: keine Straßen, keine gefährlichen Orte, keine Privatgrundstücke.
- [ ] AR-Ortslogik definieren: sichere Zonen, Radius, Zeitfenster, Altersfilter.

### Avatar & Inventory
- [ ] Avatar-Inventar anlegen.
- [ ] Avatar-Items definieren: Helm, Rüstung, Handschuhe, Schuhe, Accessoires, besondere Skins.
- [ ] Equipment Slots definieren.
- [ ] Item-Raritäten definieren: common, rare, epic, legendary.
- [ ] Belohnungen aus Kisten ins Inventar schreiben.
- [ ] Avatar-Ausrüstung im UI anzeigen.

### AR-Schatzkisten-System
- [ ] AR-Chest Mission Datenmodell erstellen.
- [ ] Statusmodell: locked → tasksActive → chestRevealed → quizActive → claimed.
- [ ] Aufgabenketten pro Kiste definieren.
- [ ] Finale Quiz-/Frage-Komponente bauen.
- [ ] Belohnung nach erfolgreichem Öffnen vergeben.
- [ ] Anti-Cheat für Standort und Zeitfenster vorbereiten.

### KI-Missionen
- [ ] KI-Mission-Generator konzeptionell vorbereiten.
- [ ] KI darf Missionen entwerfen, aber Reward-/Sicherheitsregeln nicht überschreiben.
- [ ] KI soll Alter, Fitnesslevel, psychologischen Zustand und Ziele berücksichtigen.
- [ ] KI soll AR-Orte nur aus sicheren Zonen wählen.
- [ ] KI soll Missionsaufgaben abwechslungsreich und gesundheitsfördernd gestalten.

### Reward / Punkte / Token-Vorbereitung
- [ ] Keine Token im Live-System vor Testphase.
- [ ] Alles aktuell mit Punkten und XP abbilden.
- [ ] Token später nach Test mit 2.000–3.000 Testern vorbereiten.
- [ ] Punkte-System so halten, dass Token später austauschbar/ergänzbar sind.

### Weitere Missionsbereiche später separat prüfen
- [ ] Wochenmissionen modularisieren.
- [ ] Abenteuer modularisieren.
- [ ] Challenge modularisieren.
- [ ] Wettkämpfe modularisieren.
- [ ] Favoriten-Seite an echten Favoriten-State anschließen.
- [ ] History-Seite an abgeschlossene Missionen anschließen.

## Entscheidung

Nächster empfohlener Schritt: erst Build + Header/Level/Daily testen, dann Avatar-Inventar vorbereiten, weil AR-Kisten ohne Avatar-Belohnungen noch keinen starken Loot-Loop haben.
