# PROJECT STRUCTURE - WELLFIT

## Zweck
Diese Datei ist die zentrale Orientierung fuer Ordner, Dateien und gebaute Bereiche im WellFit-Projekt.

Sie soll jeder KI- oder Codex-Session helfen, schnell zu verstehen:
- wo welche Dateien liegen
- welche Bereiche bereits existieren
- wo neue Funktionen eingebaut werden sollen
- welche Dateien nicht geloescht werden duerfen
- welche Bereiche noch offen sind

## Wichtige Regel
Diese Datei wird laufend erweitert. Nichts loeschen, was noch relevant sein koennte. Veraltete Informationen lieber als `veraltet`, `offen` oder `zu pruefen` markieren.

## Konsolidierungsstand 2026-05-12

Die hochgeladene Datei `WELLFIT – MASTER ROADMAP & DEVELOPE.txt` wurde als historische Master-Roadmap / Entwickler-To-do-Liste abgeglichen.

Wichtige Erkenntnis:
- Avatar-Inventar, Avatar-Items, Item-Raritaeten, Wettkaempfe, interne Einsaetze, Punkte-Shop, Items/NFC/Buddy-Faehigkeiten und serverseitige Economy-Autoritaet waren bereits in der alten Roadmap enthalten.
- Neue Dateien zu Checkpoint Safety, Competition Stakes und Avatar Rare Items sind deshalb als Detail-/Guardrail-Ergaenzungen zu bestehenden Roadmap-Punkten zu behandeln, nicht als parallele neue Produktstruktur.
- Fuehrend bleiben `TODO_INDEX.md`, `MASTER_OPEN_DONE_LIST.md`, `CODEBASE_FEATURE_MAP.md`, `PROJECT_STRUCTURE.md`, `NEXT_ACTIONS.md` und die passenden Architekturdateien.

## Bekannte zentrale Ordner

### `todolist/`
Projektgedaechtnis, Aufgaben, Prompts, Entscheidungen und Logs.

Wichtige Dateien:
- `MASTER_PROMPT_FOR_AI.md` - zentrale Arbeitsanweisung fuer KI/Codex
- `MASTER_OPEN_DONE_LIST.md` - zentrale Einzeluebersicht: alles erledigt, alles offen, aktuelle Produktregeln
- `CODEBASE_FEATURE_MAP.md` - Bestandskarte der vorhandenen Codebereiche gegen Doppelarbeit
- `ARCHITECTURE_RULES.md` - Regeln fuer Skalierbarkeit und kleine Dateien
- `DATABASE_PLAN.md` - Datenbankplanung
- `NEXT_ACTIONS.md` - naechste Schritte bis Beta
- `DONE_LOG.md` - erledigte Arbeiten
- `PROJECT_STRUCTURE.md` - diese Strukturuebersicht
- `TODO_CONSOLIDATION.md` - Konsolidierung alter und kleiner TODO-Dateien ohne Loeschung
- `TODO_INDEX.md` - zentraler Index fuer TODOs, Querverweise und Alt-Dateien
- `LOCAL_AGENT_RUN_INSTRUCTIONS.md` - lokale Anleitung fuer Bernd zum Ausfuehren des Dev-Agenten
- `status/2026-05-10-firestore-economy-rules-guardrail-check-prepared.md` - Statusnachweis fuer Mega-Block-23-Guardrail-Check
- `status/2026-05-12-beta-order-and-megablock-priority-confirmed.md` - verbindliche Beta-Reihenfolge
- `status/2026-05-12-points-shop-paid-points-backlog-not-active.md` - Paid-Points-Backlog, nicht aktiv

### `config/`
Konfigurationen fuer Economy und globale App-Parameter.

Wichtige Dateien:
- `economy.ts` - 25-Mrd.-Punkte-Supply, Reserve, Umlauf, Burn/Lock, Reward-/Preis-Faktoren, Token/NFT deaktiviert

### `lib/economy/`
Interne Punkte-, Reward-, Ledger- und Abrechnungslogik vor Tokenisierung.

Wichtige Dateien:
- `ledger.ts` - Ledger-Event-Typen, Status, Reason Codes, sichere Event-Factories
- `caps.ts` - DailyEmissionCap, UserDailyCap, MissionTypeCaps, EconomyHealthScore
- `projection.ts` - Projektion von Ledger-Events auf Punkte-/XP-/Streak-Staende
- `reserve.ts` - interne Reserve-, RewardRate-, PriceRate- und EconomyHealth-/Emission-/Sink-Draft-Logik
- `rewardPreview.ts` - sichere RewardPreview-Entscheidung: preview_allowed / manual_review / blocked
- `spend.ts` - SpendPreview fuer interne Punkte-Sinks, inklusive sicherem Custom-Spend-Draft fuer Beta-Flows
- `shopItems.ts` - interne Shop-Items und dynamische Preise als Punkte-Sinks, keine echten Kaeufe/Token/NFTs
- `serverAuth.ts` - Beta-sichere Auth-/Ownership-Vorstufe fuer Economy APIs, aktuell ohne harte Auth-Pflicht
- `serverCompletionPlan.ts` - Client-Write-Risiken, server-only Collections und Completion-Stufen
- `serverPersistence.ts` - Persistenz-Guardrails, aktuell `draft_only`, `writeEnabled: false`, `firestoreWritesEnabled: false`
- `serverLedgerDraft.ts` - serverseitige Draft-Records fuer spaetere Firestore-/Ledger-Persistenz, aktuell ohne Write-Autoritaet
- `completion.ts` - servernahe Mission-Completion-Entscheidung ohne finale Client-Autoritaet
- `dashboardSnapshot.ts` - Economy- und EconomyHealth-Snapshot fuer Dashboard-Anzeige
- `clientBetaProjection.ts` - lokale Beta-Projektion fuer Dashboard/Buddy/Missionen als MVP-Bruecke, keine finale Wahrheit
- `index.ts` - zentrale Economy-Exports

### `app/api/economy/`
Servernahe interne Economy-APIs. Keine echten Token, NFTs, Wallets, Auszahlungen oder echten Kaeufe.

Wichtige Dateien:
- `reward-preview/route.ts` - RewardPreview-API ohne finale Punktegutschrift, gibt Auth-Kontext, `serverDraft` und `persistenceRequest` zurueck
- `spend-preview/route.ts` - SpendPreview-API ohne echten Kauf, gibt Auth-Kontext, `serverDraft` und `persistenceRequest` zurueck
- `security-plan/route.ts` - Security-/Completion-Plan gegen clientseitige Economy-Autoritaet, inklusive Persistence-Status
- `persistence-status/route.ts` - zeigt explizit `draft_only` und deaktivierte Firestore-/Final-Writes
- `complete-mission/route.ts` - Mission-Completion-Entscheidung als Server-Vorstufe, gibt Auth-Kontext, `serverDrafts` und `persistenceRequests` zurueck, noch ohne finale Persistenz/Gutschrift
- `user-projection/route.ts` - servernahe User-Projection-Read/Preview-Vorstufe fuer Dashboard/Buddy/Missionen
- `buddy-sync-preview/route.ts` - Buddy-Sync-Preview fuer Mission-Buddy-Zustand, ohne finale Reward-Autoritaet
- `health-preview/route.ts` - EconomyHealth-/25-Mrd.-Reserve-/Emission-/Sink-Preview, nur Draft, keine finale Punktevergabe

### `app/dashboard/`
Dashboard-UI und dashboardnahe Produktlogik.

Wichtige Dateien:
- `page.tsx` - Dashboard-Hauptseite, laedt Projection API und EconomyHealth Preview
- `components/DashboardEconomyPanel.tsx` - Anzeige der internen Beta-Economy, Caps, RewardPreview, Ledger-/Review-/Correction-Summary und EconomyHealth-/25-Mrd.-Punkte-Draft
- `components/DashboardMissionPanel.tsx` - Mission mit RewardPreview und Beta-Hinweis
- `components/DashboardAvatarPanel.tsx` - Buddy-Status und Futteraktion
- `hooks/useDashboardActions.ts` - Dashboard-Aktionen fuer Mission/Buddy; nutzt Server-Completion/Spend-Preview vor lokalen MVP-Bruecken
- `lib/serverPreviewApi.ts` - Server-Preview-/Completion-/EconomyHealth-API-Client mit lokalem Fallback
- `lib/serverProjectionApi.ts` - Projection API Client mit lokalem Fallback
- `lib/missionRewardPreview.ts` - Dashboard-nahe MissionRewardPreview
- `lib/personalMission.ts` - persoenliche Dashboard-Mission
- `lib/dashboardUser.ts` - lokale Nutzer-/Cache-Logik

### `app/missionen/`
Missionen, Tagesmissionen, Wochenmissionen, Abenteuer, Challenge, Wettkaempfe und Mission-Buddy-Bridge.

Wichtige Dateien:
- `components/GoogleMissionMap.tsx` - gemeinsame Google-Maps-Komponente mit automatischer Standortanforderung fuer Abenteuer/Challenge/Wettkaempfe, ohne manuellen Standort-Button
- `tagesmissionen/page.tsx` - Tagesmissionen UI
- `tagesmissionen/rewardEngine.ts` - lokale Beta-Rewardlogik mit Diversity/Anti-Farming/Streak
- `tagesmissionen/serverCompletionApi.ts` - Tagesmissionen rufen Server-Completion vor lokaler/Firebase-Beta-Persistenz
- `tagesmissionen/useDailyMissionFirebase.ts` - Tagesmissionsstate, Streak und Level; noch clientnah
- `wochenmissionen/page.tsx` - Wochenmissionen, bereits an Economy-/Projection-/Buddy-Sync-Pfad angebunden
- `abenteuer/page.tsx` - Abenteuer, nutzt Spend-/Reward-/Completion-/Projection-/Buddy-Sync-Pfade und automatische Standortlogik
- `abenteuer/serverAdventureEconomyApi.ts` - Abenteuer-API-Client fuer Spend-/Reward-/Completion-/Projection-/Buddy-Sync
- `challenge/page.tsx` - Challenge-Seite mit automatischer Standortlogik und Bewegungskontext
- `wettkaempfe/page.tsx` - Wettkaempfe mit sicheren Checkpoints, Duell-Vorschau und klarer Abgrenzung gegen echte Wetten/Auszahlungen
- `wettkaempfe/GoogleCompetitionMap.tsx` - Wettkampfkarte auf Basis von `GoogleMissionMap` mit `autoRequestLocation`
- `lib/missionBuddyBridge.ts` - Firestore Transaction fuer Buddy-Effekt und Punkte; noch clientnah, Ziel: Server-Completion

### `app/punkte-shop/`
Interner Punkte-Shop als sicherer Beta-Sink, keine echten Kaeufe, keine Token, keine NFTs.

Wichtige Dateien:
- `page.tsx` - Punkte-Shop-Seite mit internen Shop-Items und Sicherheitshinweisen
- `ShopSpendPreviewPanel.tsx` - sichtbare Spend-Preview fuer interne Punkte-Sinks

### Root / Firebase

Wichtige Dateien:
- `firestore.rules` - Firestore Rules; aktuell Safe-Profile-Felder und temporaere Economy-Brueckenfelder getrennt markiert, harte Sperre noch nicht aktiv
- `firebase.json` - Firebase-Emulatoren und Firestore-Rules-Datei konfiguriert

### `scripts/wellfit-dev-agent/`
Lokaler WellFit Dev Agent fuer Dry-Run, Zielkurs-Check, Coder-Prompts und Aufgabenverteilung.

Wichtige Dateien:
- `README.md` - Agent-Ueberblick
- `RUNBOOK_WHEN_TO_RUN_AGENT.md` - wann der Agent auszufuehren ist
- `wellfit-agent.config.json` - Agent-Konfiguration, Source-of-Truth, Rollen, Policies
- `run-agent-full.ps1` - PowerShell-Hilfsskript fuer kompletten Agentenlauf inklusive Firestore-Economy-Rules-Check
- `watch-agent.ps1` - lokaler Watch-Agent fuer automatische Agentenlaeufe bei relevanten Aenderungen
- `src/validate-agent-config.mjs` - validiert Agent-Konfiguration
- `src/alpha-goal-check.mjs` - prueft Alpha-/Beta-Zielkurs
- `src/generate-coder-prompts.mjs` - erzeugt Coder-Prompts
- `src/dry-run.mjs` - erzeugt Dry-Run-Report
- `src/memory-sync.mjs` - prueft Arbeitsgedaechtnis-Abdeckung
- `src/apply-memory-prompts.mjs` - ergaenzt fehlende KI-Fortsetzungs-Prompts kontrolliert
- `src/code-inventory.mjs` - Code-Inventur gegen Doppelarbeit
- `src/firestore-economy-rules-check.mjs` - statischer Guardrail-Check fuer Firestore Economy Rules und Mega-Block-22-ALLOW/DENY-Haltung
- `src/quality-gate.mjs` - fuehrt Kontrollkette inklusive Firestore-Economy-Rules-Check aus und entscheidet PASS/FAIL ohne `shell: true`
- `output/firestore-economy-rules-check.md` - generierter Report des Firestore-Economy-Rules-Checks
- `output/` - erzeugte Reports und Coder-Prompts

### `docs/architecture/`
Architektur-, Sicherheits- und Produktentscheidungen.

Wichtige Dateien:
- `WEB_BETA_ROADMAP_NO_BUDDY_AR.md` - fuehrender sauberer Web-Beta-Restpfad mit 12–14 Mega-Bloecken, ohne Buddy AR / Unity
- `WELLFIT_ALPHA_SCOPE_CUT.md` - verbindlicher Alpha-/Beta-Fokus
- `WELLFIT_SELF_HOSTED_DEV_AGENT.md` - Architektur fuer eigenen Dev-Agenten
- `WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` - spaeterer Insight-/Mission-Agent
- `MISSION_REWARD_CONTEXT_ENGINE.md` - Mission-/Reward-Kontextlogik
- `WELLFIT_KNOWLEDGE_CORE.md` - referenzierender Produkt-/Architektur-Wegweiser fuer Vision, Move-Learn-Social-Earn, Buddy, Missionen, Challenges, interne Punkte/XP, Token-/NFT-Grenzen, Safety Boundaries, Nutzergruppen und offene Produktfragen; gekoppelt an `project-register/wellfit-knowledge-core.json` und den Concept Learning Agent
- `INTERNAL_ECONOMY_GUARDRAILS.md` - interne Punkte-/XP-/Reward-Leitplanken vor Blockchain, inklusive 20-Meter-Checkpoint-Ziel und 25-Mrd.-Reserve-/Rueckflusslogik
- `INTERNAL_POINTS_LEDGER_AND_BILLING.md` - internes Punkte-Ledger, Abrechnung, Audit und Korrektur vor Tokenisierung
- `ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` - Server-Completion-Plan und Firestore-Haertung fuer Economy-Felder
- `FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` - Emulator-/Rules-Testplan und statischer Guardrail-Befehl fuer Economy-Haertung
- `CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md` - sichere Checkpoint-Orte, verbotene Orte, 20-Meter-Zielradius, Standortplatzierung
- `COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` - interne Duell-Einsaetze, Punkte-/Item-Locks, keine echten Wetten/Auszahlungen
- `AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` - Avatar-Duelle, seltene interne Items, Excalibur/Fairness, keine NFT/Token
- `BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md` - Token/WFT/NFT erst nach stabilem internem Punkte- und Abrechnungssystem
- `HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` - Health-, Watch-, Kamera-, AR-, Standort- und Kinder-/Jugenddaten
- `AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md` - AR-Raetsel Firestore Security
- `USER_POINTS_CLIENT_WRITE_REFACTOR.md` - Client-Write-Risiko fuer Punkte/XP
- `USER_ECONOMY_WRITE_SEARCH_NOTES.md` - Suchnotiz zu direkten Economy-Schreibstellen
- `BUDDY_KI_INTEGRATION.md` - Buddy-KI Server-/Provider-Integration
- `BUDDY_KI_GUIDE_DATA_MODEL.md` - Buddy-Guide Datenmodell
- `BUDDY_KI_MODEL_PROVIDER_RUNBOOK.md` - Modellprovider-Runbook ohne Frontend-Secrets
- `TRACKING_BUDDY_SERVER_EVENTS.md` - serverautorisierte Tracking-/Buddy-Events
- `MISSION_UI_STATUS_BADGES.md` - Missionsstatus-Badges und UI-Regeln
- `AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md` - Dimensionen, Items, NFC und spaetere NFT-/Economy-Abgrenzung

### `project-register/`
Maschinenlesbare Produkt-, Governance- und Agentenregister.

Wichtige Dateien:
- `wellfit-knowledge-core.json` - maschinenlesbare Begleitdatei zum Knowledge Core mit Quellenpolitik, Abschnittsindex, offenen Produktfragen, Runtime-Boundaries und Concept-Learning-Agent-Anschluss
- `concept-learning-agent.json` - report-only Concept Learning Agent; jetzt mit Knowledge-Core-Markdown und Begleitregister verbunden

### `native/unity/WellFitBuddyAR/`
Separater Unity-/Native-AR-Arbeitsbereich.

Regel fuer diesen Hauptchat:
- Nicht bearbeiten.
- Nicht loeschen.
- Nicht anfassen, solange parallel ein anderer Chat am Unity-/AR-Bereich arbeitet.

## TODO-Konsolidierung
Alte oder kleinere TODO-Dateien duerfen nicht geloescht werden. Sie sollen in `TODO_CONSOLIDATION.md` referenziert, markiert und in die neue Struktur uebernommen werden.

Markierungen:
- `offen`
- `erledigt`
- `duplikat`
- `veraltet`
- `zu pruefen`

## Noch zu pruefende Bereiche
Die tatsaechliche Code-Struktur muss weiter analysiert und hier nachgetragen werden.

Zu pruefen:
- Startseite / Landingpage
- Navigation
- Nutzerprofil / Avatar
- Avatar-Inventar / Equipment Slots / Item-Raritaeten gegen `AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` und vorhandene alte Roadmap-Punkte abgleichen
- Punkte-Shop als interner Sink gegen `shopItems.ts`, SpendPreview und Item-/Inventory-Roadmap abgleichen
- Wettkampf-Duell-Einsaetze gegen `COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` serverseitig als Draft planen
- Wallet / Demo-Wallet
- Styles / CSS
- JavaScript / App-Logik
- Assets / Bilder / Logos
- Backend / API
- Datenbank / Datenmodelle
- echte Firebase-Emulator-Testdateien fuer Firestore Rules nach Server-Completion

## Einbau-Regel fuer neue Features
Wenn eine neue Funktion gebaut wird, muss hier dokumentiert werden:
- Name des Features
- betroffene Dateien
- neuer Ordner, falls angelegt
- Status: geplant, in Arbeit, Demo, Beta, fertig
- naechster offener Punkt

## KI-Fortsetzungs-Prompt
Lies diese Datei zu Beginn jeder strukturellen Arbeit. Wenn du Dateien oder Ordner findest, die hier noch nicht dokumentiert sind, ergaenze sie. Wenn du neue Dateien anlegst oder wichtige Dateien aenderst, aktualisiere diese Strukturuebersicht. Loesche keine historischen Hinweise, sondern markiere sie bei Bedarf als veraltet oder zu pruefen.
