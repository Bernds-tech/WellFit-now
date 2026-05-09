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
- `reserve.ts` - interne Reserve-, RewardRate- und PriceRate-Logik
- `rewardPreview.ts` - sichere RewardPreview-Entscheidung: preview_allowed / manual_review / blocked
- `spend.ts` - SpendPreview fuer interne Punkte-Sinks
- `serverCompletionPlan.ts` - Client-Write-Risiken, server-only Collections und Completion-Stufen
- `serverPersistence.ts` - Persistenz-Guardrails, aktuell `draft_only`, `writeEnabled: false`, `firestoreWritesEnabled: false`
- `serverLedgerDraft.ts` - serverseitige Draft-Records fuer spaetere Firestore-/Ledger-Persistenz, aktuell ohne Write-Autoritaet
- `completion.ts` - servernahe Mission-Completion-Entscheidung ohne finale Client-Autoritaet
- `dashboardSnapshot.ts` - Economy-Snapshot fuer Dashboard-Anzeige
- `index.ts` - zentrale Economy-Exports

### `app/api/economy/`
Servernahe interne Economy-APIs. Keine echten Token, NFTs, Wallets, Auszahlungen oder echten Kaeufe.

Wichtige Dateien:
- `reward-preview/route.ts` - RewardPreview-API ohne finale Punktegutschrift, gibt `serverDraft` zurueck
- `spend-preview/route.ts` - SpendPreview-API ohne echten Kauf, gibt `serverDraft` zurueck
- `security-plan/route.ts` - Security-/Completion-Plan gegen clientseitige Economy-Autoritaet, inklusive Persistence-Status
- `persistence-status/route.ts` - zeigt explizit `draft_only` und deaktivierte Firestore-/Final-Writes
- `complete-mission/route.ts` - Mission-Completion-Entscheidung als Server-Vorstufe, gibt `serverDrafts` zurueck, noch ohne finale Persistenz/Gutschrift

### `app/dashboard/`
Dashboard-UI und dashboardnahe Produktlogik.

Wichtige Dateien:
- `page.tsx` - Dashboard-Hauptseite
- `components/DashboardEconomyPanel.tsx` - Anzeige der internen Beta-Economy, Caps, RewardPreview und Ledger-/Review-/Correction-Summary
- `components/DashboardMissionPanel.tsx` - Mission mit RewardPreview und Beta-Hinweis
- `components/DashboardAvatarPanel.tsx` - Buddy-Status und Futteraktion
- `hooks/useDashboardActions.ts` - Dashboard-Aktionen fuer Mission/Buddy; noch clientnaher Persist-Patch fuer User-Punkte/Avatar
- `lib/serverPreviewApi.ts` - Server-Preview-/Completion-API-Client mit lokalem Fallback
- `lib/missionRewardPreview.ts` - Dashboard-nahe MissionRewardPreview

### `app/missionen/`
Missionen, Tagesmissionen und Mission-Buddy-Bridge.

Wichtige Dateien:
- `tagesmissionen/page.tsx` - Tagesmissionen UI
- `tagesmissionen/rewardEngine.ts` - lokale Beta-Rewardlogik mit Diversity/Anti-Farming/Streak
- `tagesmissionen/serverCompletionApi.ts` - Tagesmissionen rufen Server-Completion vor lokaler/Firebase-Beta-Persistenz
- `tagesmissionen/useDailyMissionFirebase.ts` - Tagesmissionsstate, Streak und Level; noch clientnah
- `lib/missionBuddyBridge.ts` - Firestore Transaction fuer Buddy-Effekt und Punkte; noch clientnah, Ziel: Server-Completion

### Root / Firebase

Wichtige Dateien:
- `firestore.rules` - Firestore Rules; aktuell Safe-Profile-Felder und temporaere Economy-Brueckenfelder getrennt markiert, harte Sperre noch nicht aktiv

### `scripts/wellfit-dev-agent/`
Lokaler WellFit Dev Agent fuer Dry-Run, Zielkurs-Check, Coder-Prompts und Aufgabenverteilung.

Wichtige Dateien:
- `README.md` - Agent-Ueberblick
- `RUNBOOK_WHEN_TO_RUN_AGENT.md` - wann der Agent auszufuehren ist
- `wellfit-agent.config.json` - Agent-Konfiguration, Source-of-Truth, Rollen, Policies
- `run-agent-full.ps1` - PowerShell-Hilfsskript fuer kompletten Agentenlauf
- `watch-agent.ps1` - lokaler Watch-Agent fuer automatische Agentenlaeufe bei relevanten Aenderungen
- `src/validate-agent-config.mjs` - validiert Agent-Konfiguration
- `src/alpha-goal-check.mjs` - prueft Alpha-/Beta-Zielkurs
- `src/generate-coder-prompts.mjs` - erzeugt Coder-Prompts
- `src/dry-run.mjs` - erzeugt Dry-Run-Report
- `src/memory-sync.mjs` - prueft Arbeitsgedaechtnis-Abdeckung
- `src/apply-memory-prompts.mjs` - ergaenzt fehlende KI-Fortsetzungs-Prompts kontrolliert
- `src/code-inventory.mjs` - Code-Inventur gegen Doppelarbeit
- `src/quality-gate.mjs` - fuehrt Kontrollkette aus und entscheidet PASS/FAIL ohne `shell: true`
- `output/` - erzeugte Reports und Coder-Prompts

### `docs/architecture/`
Architektur-, Sicherheits- und Produktentscheidungen.

Wichtige Dateien:
- `WELLFIT_ALPHA_SCOPE_CUT.md` - verbindlicher Alpha-/Beta-Fokus
- `WELLFIT_SELF_HOSTED_DEV_AGENT.md` - Architektur fuer eigenen Dev-Agenten
- `WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` - spaeterer Insight-/Mission-Agent
- `MISSION_REWARD_CONTEXT_ENGINE.md` - Mission-/Reward-Kontextlogik
- `INTERNAL_ECONOMY_GUARDRAILS.md` - interne Punkte-/XP-/Reward-Leitplanken vor Blockchain
- `INTERNAL_POINTS_LEDGER_AND_BILLING.md` - internes Punkte-Ledger, Abrechnung, Audit und Korrektur vor Tokenisierung
- `ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` - Server-Completion-Plan und Firestore-Haertung fuer Economy-Felder
- `FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` - Emulator-/Rules-Testplan fuer Economy-Haertung
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
- Dashboard Ledger-/Review-Summary
- Navigation
- Missionen Server-Completion-Umstellung
- KI-Buddy
- Nutzerprofil / Avatar
- Wallet / Demo-Wallet
- Styles / CSS
- JavaScript / App-Logik
- Assets / Bilder / Logos
- Backend / API
- Datenbank / Datenmodelle
- Firestore Rules nach Server-Completion

## Einbau-Regel fuer neue Features
Wenn eine neue Funktion gebaut wird, muss hier dokumentiert werden:
- Name des Features
- betroffene Dateien
- neuer Ordner, falls angelegt
- Status: geplant, in Arbeit, Demo, Beta, fertig
- naechster offener Punkt

## KI-Fortsetzungs-Prompt
Lies diese Datei zu Beginn jeder strukturellen Arbeit. Wenn du Dateien oder Ordner findest, die hier noch nicht dokumentiert sind, ergaenze sie. Wenn du neue Dateien anlegst oder wichtige Dateien aenderst, aktualisiere diese Strukturuebersicht. Loesche keine historischen Hinweise, sondern markiere sie bei Bedarf als veraltet oder zu pruefen.
