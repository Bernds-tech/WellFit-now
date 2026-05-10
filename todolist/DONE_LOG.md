# DONE LOG - WELLFIT

## Zweck
Diese Datei dokumentiert erledigte Arbeiten, damit der Projektstand nachvollziehbar bleibt.

## Eintraege

### 2026-05-09
- Mega-Block 13 - Auth-/User-Validierung fuer Economy APIs vorbereitet.
- Datei `lib/economy/serverAuth.ts` angelegt: Beta-sichere Auth-/Ownership-Vorstufe mit `beta_body_user_fallback` und spaeterem `verified_server_auth`-Modus.
- Datei `lib/economy/index.ts` erweitert: `serverAuth` wird zentral exportiert.
- Datei `app/api/economy/reward-preview/route.ts` erweitert: API nutzt Auth-Kontext und gibt `auth`-Summary zurueck.
- Datei `app/api/economy/complete-mission/route.ts` erweitert: API nutzt Auth-Kontext und gibt `auth`-Summary zurueck.
- Datei `app/api/economy/spend-preview/route.ts` erweitert: API nutzt Auth-Kontext und gibt `auth`-Summary zurueck.
- Datei `todolist/PROJECT_STRUCTURE.md` aktualisiert: `serverAuth.ts` und Auth-Kontext in Economy APIs dokumentiert.
- Harte Auth-Pflicht wurde bewusst noch nicht aktiviert, damit Beta-Fallbacks nicht brechen.
- Keine Firestore Rules gehaertet.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- Kein Live-Test auf `wellfit-now.io` erforderlich.
- Lokaler Test erforderlich: Agent + Build.

### 2026-05-09
- Mega-Block 12 - Server-Ledger-Persistenz-Vorstufe konkretisiert.
- Datei `lib/economy/serverPersistence.ts` erweitert: Dry-Run-Persistenz-Requests, Collection-Allowlist, Dokument-ID-Pruefung und Pfadbildung fuer spaetere server-only Firestore Writes.
- Datei `app/api/economy/reward-preview/route.ts` erweitert: API gibt jetzt `persistenceRequest` fuer den RewardPreview-Draft zurueck.
- Datei `app/api/economy/complete-mission/route.ts` erweitert: API gibt jetzt `persistenceRequests` fuer Completion Evaluation und Reward Event zurueck.
- Datei `app/api/economy/spend-preview/route.ts` erweitert: API gibt jetzt `persistenceRequest` fuer den SpendPreview-Draft zurueck.
- Datei `todolist/CODEBASE_FEATURE_MAP.md` aktualisiert: Dry-Run-Persistenz-Requests dokumentiert.
- Echte Persistenz bleibt weiterhin deaktiviert: `draft_only`, `writeEnabled: false`, `firestoreWritesEnabled: false`.
- Keine Firestore Rules gehaertet.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- Kein Live-Test auf `wellfit-now.io` erforderlich.
- Lokaler Test erforderlich: Agent + Build.

### 2026-05-09
- Mega-Block 12-14 Restpfad-Planung - Web-Beta-Roadmap ohne Buddy AR / Unity angelegt.
- Datei `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md` angelegt: fuehrender sauberer Web-Beta-Restpfad mit 12–14 Mega-Bloecken.
- Entscheidung dokumentiert: Bernd bevorzugt sauber und stressaermer statt Minimalpfad.
- Buddy AR / Unity explizit aus dieser Web-Beta-Planung ausgeschlossen.
- Restpfad mit Mega-Block 12 bis 25 definiert: Server-Ledger-Persistenz, Auth, Client-Write-Entkopplung, Punkte-Sinks, Emulator-Tests, Rules-Haertung, UX, Missionen, Mobile-Web, Onboarding, Legal, Smoke-Test und Puffer.
- Datei `todolist/PROJECT_STRUCTURE.md` aktualisiert: neue Web-Beta-Roadmap unter `docs/architecture/` aufgenommen.
- Keine App-/UI-/Live-Seiten-Aenderung.
- Kein Live-Test auf `wellfit-now.io` erforderlich.
- Lokaler Test erforderlich: Agent + Build.

### 2026-05-09
- Mega-Block 11 - Server-Persistenz-Schalter / Guardrail-API vorbereitet.
- Datei `lib/economy/serverPersistence.ts` angelegt: zentraler Persistence-Status mit `mode: draft_only`, `writeEnabled: false`, `firestoreWritesEnabled: false`, `finalAuthority: false`, `tokenized: false`.
- Datei `lib/economy/index.ts` erweitert: `serverPersistence` wird zentral exportiert.
- Datei `app/api/economy/persistence-status/route.ts` angelegt: API zeigt explizit, dass Economy-Server-Persistenz aktuell nur Draft-only ist.
- Datei `app/api/economy/security-plan/route.ts` erweitert: Security-Plan gibt Persistence-Status mit aus.
- Datei `todolist/CODEBASE_FEATURE_MAP.md` aktualisiert: Persistence-Status und Guardrails dokumentiert.
- Datei `todolist/PROJECT_STRUCTURE.md` aktualisiert: neue Persistence-Datei und API dokumentiert.
- Keine echten Serverwrites aktiviert.
- Keine Firestore Rules gehaertet.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- Kein Live-Test auf `wellfit-now.io` erforderlich.
- Lokaler Test erforderlich: Agent + Build.

### 2026-05-09
- Mega-Block 10 - Firestore-Haertung Stufe 1 vorbereitet, ohne harte Sperre.
- Datei `firestore.rules` strukturiert: `hasOnlySafeUserProfileKeys()`, `hasOnlyTemporaryEconomyBridgeKeys()` und `hasOnlyUserWritableKeys()` getrennt.
- Riskante temporaere Economy-Brueckenfelder markiert: `points`, `avatar`, `lastMissionCompletedAt`, `xp`, `level`, `stepsToday`, `energy`, `deviceLocation`.
- Temporäre Mission-Progress-Collections markiert: `userDailyMissionState`, `userDailyStreaks`, `userLevels`.
- Datei `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` angelegt: Emulator-/Rules-Testplan mit aktueller Beta-Kompatibilitaet, spaeterer server-only Haertung und Regression.
- Datei `todolist/TODO_INDEX.md` aktualisiert: neuer Firestore-Economy-Rules-Testplan indexiert.
- Datei `todolist/PROJECT_STRUCTURE.md` aktualisiert: `firestore.rules` und Testplan dokumentiert.
- Keine harte Sperre von `users.points/xp/level/avatar` aktiviert.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- Kein Live-Test auf `wellfit-now.io` erforderlich.
- Lokaler Test erforderlich: Agent + Build.

### 2026-05-09
- Mega-Block 9 - Dashboard Ledger-/Review-/Correction-Summary sichtbar gemacht.
- Datei `lib/economy/dashboardSnapshot.ts` erweitert: `ledgerSummary` mit Preview-, Completion-, Draft-, Review-, Correction- und Rules-Haertungsstatus.
- Datei `app/dashboard/components/DashboardEconomyPanel.tsx` erweitert: sichtbare Ledger-/Review-/Correction-Kachel im Dashboard.
- Dashboard zeigt jetzt: Server-Preview aktiv, Completion vorbereitet, Server-Draft noch nicht gespeichert, Rules-Haertung wartet auf Server-Persistenz.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- Keine Firestore Rules gehaertet.
- Lokaler Test erforderlich: Agent + Build.
- Live-Test auf `wellfit-now.io` sinnvoll, sobald Deployment angekommen ist, weil die Dashboard-UI sichtbar geaendert wurde.

### 2026-05-09
- Mega-Block 8 - Server-Ledger-Draft-/Persistenz-Vorstufe vorbereitet.
- Datei `lib/economy/serverLedgerDraft.ts` angelegt: serverseitige Draft-Records fuer spaetere Firestore-/Ledger-Persistenz.
- Datei `lib/economy/index.ts` erweitert: `serverLedgerDraft` wird zentral exportiert.
- Datei `app/api/economy/reward-preview/route.ts` erweitert: API gibt `serverDraft` fuer `missionRewardPreviews` zurueck.
- Datei `app/api/economy/complete-mission/route.ts` erweitert: API gibt `serverDrafts` fuer Completion Evaluation und Reward Event zurueck.
- Datei `app/api/economy/spend-preview/route.ts` erweitert: API gibt `serverDraft` fuer interne Punkte-Sink-Preview zurueck.
- Alle Drafts sind bewusst `writeNow: false` und `finalAuthority: false`.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- Keine Firestore Rules gehaertet; echte server-only Persistenz bleibt naechster Block nach lokalem Agent-/Build-Test.

### 2026-05-09
- Mega-Block 7 - Dev-Agent / Quality-Gate-Haertung vorbereitet.
- Datei `scripts/wellfit-dev-agent/src/quality-gate.mjs` aktualisiert: `shell: true` entfernt.
- Windows nutzt jetzt direkten Node-Skriptaufruf statt npm-shell.
- Ziel: Node `DEP0190` Warnung vermeiden und Agentenlauf sicherer machen.
- Lokaler Test durch Bernd bestaetigt: Quality Gate PASS ohne `[DEP0190]` Warnung.
- Keine App-/UI-/Live-Seiten-Aenderung.
- Kein Live-Test auf `wellfit-now.io` erforderlich.

### 2026-05-09
- Mega-Block 6 - Dashboard/Tagesmissionen auf Server-Completion-Vorstufe umgestellt.
- Datei `app/dashboard/lib/serverPreviewApi.ts` erweitert: `fetchDashboardMissionCompletion` ruft `/api/economy/complete-mission` mit lokalem Completion-Fallback.
- Datei `app/dashboard/hooks/useDashboardActions.ts` erweitert: Mission Start fragt jetzt zuerst Server-Completion ab, blockiert/manual_review wird nicht lokal gutgeschrieben.
- Datei `app/missionen/tagesmissionen/serverCompletionApi.ts` angelegt: Tagesmissionen haben eigenen Completion-API-Client mit lokalem Fallback.
- Datei `app/missionen/tagesmissionen/page.tsx` erweitert: `completeMission` ruft jetzt vor lokaler/Firebase-Beta-Persistenz `fetchDailyMissionCompletion` auf.
- Dashboard und Tagesmissionen nutzen weiterhin MVP-Bruecken fuer lokale/Firebase-Anzeige, aber erst nach Server-Completion-Entscheidung.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- `firestore.rules` weiterhin bewusst noch nicht gehaertet; naechster Schritt ist lokaler Agent-/Build-Test und danach schrittweise Rules-Haertung.

### 2026-05-09
- Mega-Block Firestore-/Security-Haertung vorbereitet.
- Datei `lib/economy/serverCompletionPlan.ts` angelegt: riskante Client-Schreibfelder, server-only Collections und Completion-Stufen dokumentiert.
- Datei `lib/economy/completion.ts` angelegt: servernahe Mission-Completion-Entscheidung vorbereitet.
- Datei `app/api/economy/security-plan/route.ts` angelegt: API gibt Security-/Completion-Plan fuer interne Punkte aus.
- Datei `app/api/economy/complete-mission/route.ts` angelegt: servernahe Completion-API entscheidet `completion_ready`, `manual_review_required` oder `completion_blocked`.
- Datei `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` angelegt: Zielpfad `RewardPreview -> Completion -> Ledger -> Audit -> Projection` dokumentiert.
- Datei `lib/economy/index.ts` erweitert: `completion` und `serverCompletionPlan` werden zentral exportiert.
- Datei `todolist/CODEBASE_FEATURE_MAP.md` aktualisiert: neue Economy-/Security-Dateien, API-Routen und offene Folgepunkte aufgenommen.
- Datei `todolist/PROJECT_STRUCTURE.md` aktualisiert: `app/api/economy/**`, neue Economy-Module, neue Architekturdatei und Unity-Sperre fuer diesen Hauptchat dokumentiert.
- Keine echten Token, NFTs, Wallets, Auszahlungen, echten Kaeufe oder Blockchain-Funktionen aktiviert.
- `firestore.rules` bewusst noch nicht gehaertet, damit Dashboard/Tagesmissionen nicht vor Server-Completion brechen.

### 2026-05-07
- Datei `todolist/MASTER_PROMPT_FOR_AI.md` angelegt.
- Datei `todolist/ARCHITECTURE_RULES.md` angelegt.
- Datei `todolist/DATABASE_PLAN.md` angelegt.
- Datei `todolist/NEXT_ACTIONS.md` angelegt.
- Datei `todolist/PROJECT_STRUCTURE.md` angelegt.
- `todolist/MASTER_PROMPT_FOR_AI.md` erweitert: TODO-Dateien duerfen bearbeitet und erweitert, aber nicht geloescht werden.
- Datei `todolist/TODO_CONSOLIDATION.md` angelegt, um alte und kleine TODO-Dateien ohne Loeschung zu konsolidieren.
- `todolist/NEXT_ACTIONS.md` erweitert: Alt-TODOs scannen, referenzieren, markieren und mit KI-Fortsetzungs-Prompts versehen.
- `todolist/PROJECT_STRUCTURE.md` erweitert: `TODO_CONSOLIDATION.md` und Markierungslogik aufgenommen.
- Datei `todolist/TODO_INDEX.md` angelegt und anschliessend mit gefundenen Alt-TODOs, Bereichs-TODOs und Agent-Dateien erweitert.
- `todolist/TODO_CONSOLIDATION.md` mit gefundenen Alt-TODOs und offenen Konsolidierungsaufgaben erweitert.
- `todolist/NEXT_ACTIONS.md` mit Inhalten aus `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` zusammengefuehrt.
- `scripts/wellfit-dev-agent/wellfit-agent.config.json` auf Version 0.5.0 aktualisiert: neue Source-of-Truth-Dateien, TODO-Memory-Bereich, Database-Bereich und Approval-Hinweise aufgenommen.
- Datei `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md` angelegt: Anleitung fuer Bernd, wie der lokale Agent in PowerShell/VS Code ausgefuehrt wird.
- Datei `scripts/wellfit-dev-agent/run-agent-full.ps1` angelegt: PowerShell-Skript fuer kompletten Agentenlauf.
- `todolist/PROJECT_STRUCTURE.md` um lokale Agent-Anleitung und PowerShell-Skript erweitert.
- Datei `scripts/wellfit-dev-agent/src/memory-sync.mjs` angelegt: sicherer Memory-Sync-Dry-Run fuer TODO-/Roadmap-/Agent-Dateien.
- `package.json` um Script `agent:memory-sync` erweitert.
- `scripts/wellfit-dev-agent/run-agent-full.ps1` erweitert, damit Memory-Sync im kompletten Agentenlauf mitlaeuft.
- `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md` um Memory-Sync-Befehl und Output `memory-sync-report.md` erweitert.
- Lokalen Memory-Sync-Report von Bernd ausgewertet: 117 gescannte Dateien, 89 TODO-/Roadmap-/Agent-aehnliche Dateien, 58 fehlende Index-Eintraege, 80 fehlende Prompt-Hinweise.
- `todolist/TODO_INDEX.md` massiv erweitert: alte Haupt-TODOs A-E, J/J1/J8.x, Status-Dateien, Architektur-Dokumente, Dev-Agent-Dateien und Dashboard-/Build-Dateien indexiert.
- `scripts/wellfit-dev-agent/src/memory-sync.mjs` verbessert: `.gitkeep`, historische Status-Logs, Agent-Source-Dateien, Config-/Schema-/Template-Dateien werden nicht mehr faelschlich als Prompt-pflichtig bewertet.
- Datei `scripts/wellfit-dev-agent/src/apply-memory-prompts.mjs` angelegt: fehlende KI-Fortsetzungs-Prompts koennen sicher per Dry-Run und Write-Modus angehaengt werden.
- `package.json` um `agent:apply-memory-prompts` und `agent:apply-memory-prompts:write` erweitert.
- Datei `scripts/wellfit-dev-agent/src/quality-gate.mjs` angelegt: Kontrollkette fuer validate, goal-check, memory-sync, coder-prompts und dry-run mit PASS/FAIL.
- `package.json` um `agent:quality-gate` erweitert.
- `scripts/wellfit-dev-agent/run-agent-full.ps1` erweitert, damit Quality-Gate im kompletten Agentenlauf mitlaeuft.
- `scripts/wellfit-dev-agent/src/quality-gate.mjs` repariert: Alpha-Coverage und Memory-Sync-Zahlen werden aus Report und Konsolen-Output gelesen.
- `todolist/TODO_INDEX.md` um `apply-memory-prompts.mjs` und `quality-gate.mjs` erweitert.
- `todolist/PROJECT_STRUCTURE.md` um wichtige Dateien aus `docs/architecture/` erweitert: Buddy-KI, Buddy-Datenmodell, Provider-Runbook, Tracking/Buddy-Events, Mission-UI-Status-Badges und AI-Dimensions/Items/NFC/NFT-Economy.

## Offene Folgepunkte
- Lokal erneut `git pull` und danach `npm run agent:code-inventory`, `powershell -ExecutionPolicy Bypass -File scripts/wellfit-dev-agent/run-agent-full.ps1` und `npm run build` ausfuehren.
- Wenn Quality-Gate FAIL meldet, `scripts/wellfit-dev-agent/output/memory-sync-report.md` pruefen und neue fehlende Dateien in `TODO_INDEX.md` oder `PROJECT_STRUCTURE.md` aufnehmen.
- Ab jetzt Web-Beta-Roadmap ohne Buddy AR / Unity in `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md` als fuehrenden Restpfad nutzen.
- Mega-Block 14 als naechstes: Dashboard- und Tagesmissionen von finalen User-Patches weiter entkoppeln.
- Danach Punkte-Sinks, Emulator-Tests, Rules-Haertung, UX, Missionen, Mobile-Web, Onboarding, Legal, Smoke-Test und Puffer abarbeiten.
- Wichtige offene Punkte nach `NEXT_ACTIONS.md` uebernehmen.
- Agent nach TODO-/Roadmap-Aenderungen lokal ausfuehren: `npm run agent:validate`, `npm run agent:goal-check`, `npm run agent:memory-sync`, `npm run agent:coder-prompts`, `npm run agent:dry-run`, `npm run agent:quality-gate`.
- Alternativ kompletten Agentenlauf mit `powershell -ExecutionPolicy Bypass -File scripts/wellfit-dev-agent/run-agent-full.ps1` starten.

## KI-Fortsetzungs-Prompt
Wenn eine Aufgabe erledigt wurde, fuege hier einen neuen Eintrag hinzu. Nenne Datum, Datei(en), kurze Beschreibung und offenen Folgepunkt.
