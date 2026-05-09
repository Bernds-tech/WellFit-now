# MASTER OPEN / DONE LIST - WELLFIT

Stand: 2026-05-07
Status: zentrale Einzeluebersicht fuer offene und erledigte Aufgaben

## Zweck

Diese Datei fasst in einer einzigen Liste zusammen:
- was bereits erledigt ist
- was noch offen ist
- was spaeter kommt
- welche Regeln fuer Punkte, Abrechnung, Token, App Store, Datenbank und KI-Agenten gelten

Diese Datei ersetzt keine alten TODO-Dateien. Alte TODOs bleiben erhalten. Diese Datei ist die schnelle Fuehrungsliste.

## Sehr wichtige Produktregel von Bernd

WellFit startet mit einem internen Punkte- und Abrechnungssystem.

Die 25 Milliarden Punkte sind die interne Ausgangsmenge / Supply-Logik fuer WellFit. Mit diesen 25 Milliarden Punkten muss das interne System wirtschaften.

Grundlogik:
- Wenn WellFit viele Punkte in der eigenen Reserve / Boerse / Wallet haelt, kann das System mehr an Nutzer ausschuetten.
- Wenn viele Punkte im Umlauf sind oder die eigene Reserve sinkt, schuettet das System weniger aus.
- Wenn die Reserve hoch ist, kosten Goodies / Items / Gewand / Schilder / spaetere NFT-nahe Ausstattungen weniger interne Punkte.
- Wenn die Reserve niedrig ist, werden Goodies / Items / Gewand / Schilder teurer.
- Dadurch entsteht ein Kreislauf: Punkte werden verdient, ausgegeben, gebunden, verbrannt oder in Reserve-/Abrechnungslogik zurueckgefuehrt.
- Erst wenn diese interne Punkte-, Preis- und Abrechnungslogik stabil funktioniert, koennen Token die internen Punkte spaeter ersetzen oder spiegeln.

Harte Regel:
- Keine echten Token jetzt.
- Keine echten NFTs jetzt.
- Keine WFT-Transfers jetzt.
- Kein Trading, Staking, Marketplace oder Presale in der Beta.
- Name, Token-Branding und groessere Blockchain-Kommunikation erst ganz am Schluss, wenn erste Nutzer da sind und App-Store-Pfad klar ist.

## Erledigt

### Projektgedaechtnis / TODO-System
- [x] `todolist/MASTER_PROMPT_FOR_AI.md` angelegt.
- [x] `todolist/TODO_INDEX.md` als zentraler Index angelegt.
- [x] `todolist/TODO_CONSOLIDATION.md` angelegt.
- [x] `todolist/NEXT_ACTIONS.md` angelegt und mit alter Roadmap zusammengefuehrt.
- [x] `todolist/PROJECT_STRUCTURE.md` angelegt.
- [x] `todolist/DONE_LOG.md` angelegt.
- [x] Alte Haupt-TODOs A-E, J/J1/J8.x, H/F/G/I/K und Statusdateien indexiert.
- [x] Alt-TODOs duerfen bearbeitet/markiert, aber nicht geloescht werden.
- [x] KI-Fortsetzungs-Prompts in wichtigen TODO-/Planungsdateien ergaenzt.
- [x] TODO-Markierungen festgelegt: offen, erledigt, duplikat, veraltet, zu pruefen.

### Agent / Automatisierung / Quality Gate
- [x] WellFit Dev Agent erkannt und weiter genutzt.
- [x] Agent-Konfiguration auf Source-of-Truth-Dateien erweitert.
- [x] Identity Gate fuer Coder-Rollen aktiv.
- [x] Coder 1 / Coder 2 / Coder 3 Rollen aktiv.
- [x] No-Delete-Policy fuer TODOs aktiv.
- [x] `agent:validate` funktioniert.
- [x] `agent:goal-check` funktioniert.
- [x] `agent:memory-sync` angelegt und funktioniert.
- [x] `agent:coder-prompts` funktioniert.
- [x] `agent:dry-run` funktioniert.
- [x] `agent:quality-gate` angelegt und funktioniert.
- [x] Quality Gate erreicht PASS: Alpha 7/7, Missing Index 0, Missing Prompts 0.
- [x] PowerShell-Komplettlauf `run-agent-full.ps1` angelegt.
- [x] Watch-Agent `watch-agent.ps1` angelegt.
- [x] Watch-Agent auf relevante Projektbereiche erweitert: app, components, lib, functions, Unity Scripts, public, todolist, docs/architecture, agent source.
- [x] Watch-Agent ignoriert Output-, Cache- und Build-Pfade, damit keine Endlosschleife entsteht.

### Build / Stabilitaet
- [x] `npm install` erfolgreich.
- [x] `npm run build` mehrfach erfolgreich.
- [x] Next.js Build gruen.
- [x] TypeScript erfolgreich.
- [x] 34/34 statische Seiten generiert.
- [x] `/api/buddy-ki` als dynamische Route erkannt.
- [x] Dashboard, Missionen, Mobile, Register, Legal, Punkte-Shop und weitere Routen im Build erkannt.
- [x] Buildstatus in `todolist/LAST_BUILD_STATUS.md` dokumentiert.

### Architektur / Datenbank / Sicherheit
- [x] `todolist/DATABASE_PLAN.md` angelegt.
- [x] Datenbereiche geplant: Nutzer, Profile, Gesundheitseinstellungen, Missionen, Fortschritt, KI-Buddy, Gamification, Demo-Wallet, Content, Audit/Logs.
- [x] Architekturregel: grosse Dateien vermeiden, Funktionen in kleine Module aufteilen.
- [x] Health-/Kinder-/Standortdaten als besonders sensibel markiert.
- [x] Client darf keine finale Autoritaet fuer Punkte, XP, Rewards, Mission Completion, Leaderboards oder Anti-Cheat haben.

### Economy / Punkte / Ledger / Token-Abgrenzung
- [x] `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md` angelegt.
- [x] `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md` angelegt.
- [x] `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md` angelegt.
- [x] Interne Punkte/XP vor Token verbindlich festgelegt.
- [x] Blockchain/WFT/NFT erst nach stabiler Alpha-/Beta-/Testphase festgelegt.
- [x] Token koennen spaeter interne Punkte ersetzen oder spiegeln.
- [x] 25-Milliarden-Punkte-/Supply-/Reserve-Logik als interne Vorstufe festgehalten.
- [x] Dynamische Ausschüttungslogik dokumentiert: hohe Reserve = mehr Ausschüttung, niedrige Reserve = weniger Ausschüttung.
- [x] Dynamische Goodie-/Item-Preislogik dokumentiert: hohe Reserve = guenstiger, niedrige Reserve = teurer.
- [x] `lib/economy/ledger.ts` angelegt.
- [x] `lib/economy/caps.ts` angelegt.
- [x] `lib/economy/projection.ts` angelegt.
- [x] `lib/economy/rewardPreview.ts` angelegt.
- [x] `lib/economy/dashboardSnapshot.ts` angelegt.
- [x] `lib/economy/index.ts` angelegt.
- [x] Ledger-Event-Typen, Status, Reason Codes und Source Types vorbereitet.
- [x] RewardPreview-Entscheidung vorbereitet: preview_allowed / manual_review / blocked.
- [x] EconomyHealthScore-Status vorbereitet: healthy / watch / critical.
- [x] DailyEmissionCap, UserDailyCap und MissionTypeCap als Beta-Code vorbereitet.
- [x] Ledger-Projektion fuer Punkte, XP und Streaks vorbereitet.

### Dashboard / sichtbares Produkt
- [x] Dashboard Economy Panel eingebaut.
- [x] Dashboard zeigt interne Beta-Punkte statt Token.
- [x] Dashboard erklaert: Punkte sind keine Token, keine WFT, keine Auszahlung.
- [x] Dashboard zeigt Economy-Status, UserDailyCap, DailyEmissionCap und RewardPreview-Status.
- [x] Mission Panel zeigt Reward Preview: bereit / Review nötig / blockiert.
- [x] Mission Start nutzt Preview-Entscheidung.
- [x] Wenn Review noetig ist, werden keine direkten Punkte gutgeschrieben.
- [x] Wenn blockiert, wird Mission durch interne Beta-Limits gestoppt.

### Datenschutz / Health / Standort / App Store
- [x] `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` angelegt.
- [x] Health-, Watch-, Kamera-, AR-, Standort- und Kinder-/Jugenddaten als sensibel markiert.
- [x] Health/Watch/Standort duerfen nur unterstuetzende Kontext-, Plausibilitaets- oder Evidence-Daten sein.
- [x] Mobile-App bleibt frei von Token, NFT, Trading, Staking, Presale und spekulativer Finanzmechanik.
- [x] App-Store-Konformitaet als harte Regel festgelegt.

### KI-Buddy / AR / Unity
- [x] KI-Buddy-Grundlage vorhanden.
- [x] `app/api/buddy-ki/route.ts` vorhanden laut Roadmap.
- [x] Rules-Fallback fuer Buddy-KI vorhanden laut Roadmap.
- [x] Optionaler serverseitiger Modellprovider vorbereitet laut Roadmap.
- [x] Unity-/AR-Buddy-Dateien lokal ins Repo eingebracht.
- [x] AR-/Buddy-Planung dokumentiert.
- [x] Mobile/AR/Unity/Handytests auf Samstag verschoben.

## Offen

### Sofort / Naechste Codebloecke
- [ ] Groesseren Codeblock bauen: Mission Start vollstaendiger an internes Ledger koppeln.
- [ ] Groesseren Codeblock bauen: Dashboard Ledger-/Review-/Correction-Summary sichtbarer machen.
- [ ] Groesseren Codeblock bauen: interne Punkte-/XP-Projektion in UI besser anzeigen.
- [ ] Groesseren Codeblock bauen: `points` und `xp` nicht nur direkt schreiben, sondern Ledger-kompatibel vorbereiten.
- [ ] Groesseren Codeblock bauen: Futter-/Buddy-Aktion als interne Economy-Ausgabe / Sink vorbereiten.
- [ ] Groesseren Codeblock bauen: Mission History/Favoriten/Sidequests mit RewardPreview verbinden.

### Interne Punkte / Abrechnung / 25-Mrd.-Kreislauf
- [ ] Konkrete Default-Werte fuer DailyEmissionCap final festlegen.
- [ ] Konkrete Default-Werte fuer UserDailyCap final festlegen.
- [ ] MissionTypeCaps je Missionstyp final festlegen.
- [ ] EconomyHealthScore-Formel finalisieren.
- [ ] Reserve-/Umlauf-/Auszahlungsformel fuer 25 Milliarden Punkte konkret definieren.
- [ ] Formel definieren: hohe Reserve = hoeherer Reward-Faktor.
- [ ] Formel definieren: niedrige Reserve = niedrigerer Reward-Faktor.
- [ ] Formel definieren: hohe Reserve = Goodies/Items billiger.
- [ ] Formel definieren: niedrige Reserve = Goodies/Items teurer.
- [ ] Punkte-Sinks definieren: Futter, Kleidung, Schilder, Ausruestung, Buddy-Upgrades, spaetere NFT-nahe Items.
- [ ] Burn-/Reserve-/Rueckfluss-Mechanik definieren.
- [ ] Jackpot- und Wettbewerbseinsaetze nur intern simulieren.
- [ ] Interne Abrechnung testen, bevor irgendeine Token-Migration geplant wird.
- [ ] Korrektur-/Rollback-Mechanik fuer falsche Buchungen definieren.
- [ ] User Balance Projection finalisieren.
- [ ] Firestore/PostgreSQL-Schema fuer Ledger-Events finalisieren.

### Backend / Security / Firestore
- [ ] Serverseitiges Punkte-Ledger implementieren.
- [ ] Server-Transaktionen fuer interne XP/Punkte/Streaks vorbereiten.
- [ ] `missionRewardEvents` als echte Audit-Events schreiben.
- [ ] `validateMissionCompletionWithItem` produktionsreif vorbereiten. Reviewpflichtig.
- [ ] `grantItemOrCapability` produktionsreif vorbereiten. Reviewpflichtig.
- [ ] UserDailyCap gegen Nutzerhistorie pruefen.
- [ ] MissionTypeCap gegen Missionstyp und Kontext pruefen.
- [ ] Completion nur bei ausreichender Evidence erlauben.
- [ ] Bei hohem Pattern-/Cooldown-/Evidence-Risiko auf Manual Review setzen.
- [ ] Rejected-/Manual-Review-Pfade auditierbar machen.
- [ ] Firestore Rules fuer Nutzerpunkte/XP weiter haerten.
- [ ] Clientseitige Tagesmissions-Rewards schrittweise auf Server-Preview/Server-Completion umstellen.

### Datenbank / Auth / Nutzer
- [ ] Datenbankentscheidung vorbereiten: Firebase/Firestore, Supabase/PostgreSQL oder eigener PostgreSQL-Server.
- [ ] Nutzer-, Missions-, Progress-, Reward- und Audit-Datenmodell mit Firebase-Dateien abgleichen.
- [ ] Authentifizierungsmodell pruefen.
- [ ] Nutzerprofil und Avatar-Grundlage weiter ausbauen.
- [ ] Health-/Kinder-/Standortdaten besonders schuetzen.
- [ ] Consent-Texte fuer Kamera, Standort, Health und Watch entwerfen.
- [ ] Fallbacks fuer Nutzer ohne Berechtigungen definieren.
- [ ] Kinder-/Jugendschutzlogik als eigene Detaildatei vorbereiten.

### Dashboard / Website / Beta-Demo
- [ ] Startseite analysieren und verbessern.
- [ ] Dashboard weiter stabilisieren.
- [ ] Navigation und Seitenstruktur pruefen.
- [ ] Demo-Wallet klar als Mockup kennzeichnen.
- [ ] Mobile Ansicht pruefen.
- [ ] Beta-Akzeptanzkriterien definieren.
- [ ] Dashboard-Anpassen weiter pruefen: Pin, Groesse, Reihenfolge, keine Weiterleitung im Bearbeitungsmodus.
- [ ] Punkte-Shop mit interner Punkte-/Sink-Logik verbinden.
- [ ] Marktplatz weiterhin nicht als echter NFT-/Trading-Markt darstellen.

### KI-Buddy / Missionen
- [ ] Buddy-KI-Guide Datenmodell in App/Backend weiter ausbauen.
- [ ] KI-Buddy darf Vorschlaege machen, aber keine Rewards, Punkte, Token oder Mission-Completion autorisieren.
- [ ] Missionen in Beta fokussiert halten.
- [ ] Missionen spaeter inhaltlich breit ausbauen.
- [ ] Mission Draft Security weiter ausarbeiten.
- [ ] Mission Draft Preview API weiter ausarbeiten.
- [ ] Mission History, Favorites und Sidequests weiter anbinden.

### Mobile / AR / Unity - Samstag
- [ ] `/mobile/ar` am Handy testen: Kamera startet, Umgebung sichtbar, Avatar sichtbar, Buttons scrollbar.
- [ ] `/mobile/ar` pruefen: Provider-Anzeige, Text, Optionen, Fallback, Scrollbarkeit bei aktiver/inaktiver Kamera.
- [ ] Unity-Projekt lokal erzeugen / pruefen.
- [ ] Erste Android-ARCore-Build-Kette testen.
- [ ] Buddy platzieren, bewegen, springen und zum Nutzer zurueckrufen weiterfuehren.
- [ ] WebGL-Buddy als Demo/Fallback klar kennzeichnen.

### Blockchain / Token / Name / Branding - spaeter
- [ ] Blockchain erst nach stabilem internen Punkte- und Abrechnungssystem.
- [ ] Token erst nach funktionierender interner Abrechnung.
- [ ] Interne Punkte spaeter durch Token ersetzen oder spiegeln.
- [ ] Solana/SPL und SUI/Dynamic Objects nicht vermischen.
- [ ] Finale Chain-Entscheidung spaeter treffen.
- [ ] WFT, NFT, Trading, Marketplace, Staking, DAO bleiben Backlog.
- [ ] Name, Token-Name, Token-Kommunikation und groesseres Blockchain-Branding erst ganz am Schluss aendern.
- [ ] App-Store-Pfad zuerst sichern, bevor Finanz-/Token-Sprache sichtbar wird.

### DevOps / Build / Agent
- [ ] Next.js Workspace-Root-Warnung loesen: `turbopack.root` setzen oder uebergeordnetes Lockfile pruefen.
- [ ] `npm audit` auswerten: 6 vulnerabilities, aber nicht blind `npm audit fix --force`.
- [ ] Node DeprecationWarning im `quality-gate.mjs` spaeter bereinigen.
- [ ] Watch-Agent weiter beobachten und bei Schleifen/False Positives haerten.
- [ ] GitHub Actions fuer Agent/Build/Quality Gate spaeter ergaenzen.
- [ ] Lokalen Agenten spaeter optional mit Schreibmodus/PR-Modus erweitern.

## Aktueller Kontrollstatus

- Quality Gate: PASS
- Alpha Tracks: 7/7
- Missing Index: 0
- Missing Prompts: 0
- Build: gruen
- TypeScript: gruen
- Statische Seiten: 34/34

## Naechster empfohlener grosser Arbeitsblock

1. Mission Start staerker an internes Ledger anbinden.
2. Futter/Buddy-Ausgaben als interne Punkte-Sinks vorbereiten.
3. Punkte-Shop auf interne Punkte-Sinks vorbereiten.
4. Dashboard um Ledger-/Review-/Correction-Summary erweitern.
5. Danach wieder Agent + Build laufen lassen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `todolist/DONE_LOG.md` und diese Datei. Arbeite offene Punkte in groesseren zusammenhaengenden Bloecken ab. Plane nur, wenn Architektur, Sicherheit oder Produktlogik unklar ist. Setze ansonsten mehrere zusammenhaengende Code-Dateien pro Arbeitsblock um. Loesche keine alten TODOs. Aktualisiere diese Datei, wenn neue grosse Aufgaben erledigt oder neue offene Punkte erkannt werden.
# Mega-Block 1 - Economy-Verbindung eingebaut

Stand: 2026-05-08

## Eingebaute Dateien

- `lib/economy/reserve.ts`
- `lib/economy/shopItems.ts`
- `lib/economy/rewardPreview.ts`
- `lib/economy/dashboardSnapshot.ts`
- `lib/economy/index.ts`
- `app/dashboard/components/DashboardEconomyPanel.tsx`
- `app/punkte-shop/page.tsx`

## Was umgesetzt wurde

- 25-Mrd.-Punkte-/Reserve-Logik aus `config/economy.ts` wird jetzt ueber `lib/economy/reserve.ts` nutzbar gemacht.
- RewardRate wird in RewardPreview eingerechnet.
- PriceRate wird fuer Punkte-Shop-Items eingerechnet.
- Punkte-Shop zeigt interne Goodies/Items mit dynamischem internen Punktepreis.
- Dashboard zeigt Reserve, Ausschüttungsfaktor und Goodie-Preisfaktor.
- Token/NFT bleiben deaktiviert.
- Shop ist weiterhin nur interne Beta-Struktur, kein Kauf, kein NFT, kein Wallet, kein Trading.

## Wichtig

Diese Umsetzung aktiviert keine echten Token, NFTs oder Auszahlungen.
# Mega-Block 2 - Tagesmissionen an RewardPreview und Ledger-Vorbereitung angebunden

Stand: 2026-05-08

## Eingebaute Dateien

- `app/missionen/tagesmissionen/rewardEngine.ts`
- `app/missionen/tagesmissionen/page.tsx`
- `app/missionen/tagesmissionen/MissionDetails.tsx`
- `app/missionen/lib/missionBuddyBridge.ts`

## Was umgesetzt wurde

- Tagesmissionen behalten vorhandene Diversity-, Anti-Farming- und Streak-Rewardlogik.
- Tagesmissionen erzeugen jetzt eine interne RewardPreview ueber `lib/economy/rewardPreview.ts`.
- Reserve-/Ausschüttungslogik wird ueber RewardPreview beruecksichtigt.
- MissionDetails zeigt Preview-Status, interne Punkte, Reserve-Ausschüttung und Beta-Hinweise.
- Blockierte Missionen werden nicht direkt gestartet/abgeschlossen.
- Review-Missionen werden nicht direkt gutgeschrieben.
- MissionBuddyBridge erhaelt Ledger-kompatible RewardPreview-Summary.
- Doppelte Punktevergabe bleibt verhindert.
- Keine Token, NFT, Wallet, Trading oder Auszahlung aktiviert.

## Wichtig

Dieser Block bleibt Beta-/MVP-sicher. Die echte finale Reward-Autoritaet muss spaeter serverseitig werden.

# Mega-Block 3 - Interne Punkte-Sinks und Buddy-Futter verbunden

Stand: 2026-05-08

## Eingebaute Dateien

- `lib/economy/spend.ts`
- `lib/economy/shopItems.ts`
- `lib/economy/ledger.ts`
- `lib/economy/index.ts`
- `app/dashboard/hooks/useDashboardActions.ts`
- `app/dashboard/components/DashboardAvatarPanel.tsx`

## Was umgesetzt wurde

- Interne SpendPreview fuer Punkte-Sinks vorbereitet.
- Buddy-Futter nutzt nun eine interne SpendPreview-Entscheidung.
- Buddy-Futter speichert eine kompakte SpendPreview-Summary am Avatar.
- ShopItems koennen nach Item-ID mit dynamischem Preis gelesen werden.
- Ledger kennt SpendPreview-/PointsSpent-Typen als Vorbereitung.
- Futter bleibt internes Beta-System: kein Kauf, kein Token, kein NFT, keine Auszahlung.

## Wichtig

Die finale Punkte-Sink-Autoritaet muss spaeter serverseitig werden. Aktuell bleibt es Beta-/MVP-Vorbereitung.

# Mega-Block 4 - Server-Preview-APIs vorbereitet

Stand: 2026-05-09

## Eingebaute Dateien

- `app/api/economy/reward-preview/route.ts`
- `app/api/economy/spend-preview/route.ts`

## Was umgesetzt wurde

- Servernahe RewardPreview-API vorbereitet.
- Servernahe SpendPreview-API vorbereitet.
- Beide APIs bleiben interne Beta-Preview.
- Keine finale Punktegutschrift.
- Keine echten K�ufe.
- Keine Token, NFTs, Wallets, Trading, Staking oder Auszahlung.
- Vorbereitung fuer spaetere serverseitige Abrechnung und Cloud-Function-/API-Autoritaet.

## Wichtig

Diese APIs sind Preview- und Sicherheitsvorbereitung. Die finale Reward-/Spend-Autoritaet muss spaeter serverseitig mit Auth, Firestore Rules, Transaktionen und Audit-Events durchgesetzt werden.
