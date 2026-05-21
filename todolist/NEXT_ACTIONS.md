# NEXT ACTIONS - WELLFIT BETA

## Ziel
Diese Datei steuert die naechsten Schritte bis zur ersten Beta-Version.

## Arbeitsregel
Die KI soll die Aufgaben von oben nach unten bearbeiten, sofern keine neue hoehere Prioritaet von Bernd kommt.

## Fuehrende Quellen
Vor Arbeit an dieser Datei immer zuerst lesen:
- `AGENTS.md`
- `todolist/CURRENT_PROJECT_STATE.md`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`

Danach je nach Aufgabe lesen:
- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/TODO_CONSOLIDATION.md`
- `todolist/PROJECT_STRUCTURE.md`
- `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`
- `todolist/NEXT_CHAT_HANDOFF_PROMPT.md`
- `todolist/AUTONOMOUS_ITERATION_MODE.md`
- `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md`

## Aktueller Arbeitsfokus

Stand: 2026-05-15

Bernd hat entschieden (uebernommener Fokus aus dem 2026-05-07-Kontext, als TODO-Kontext erhalten):
- Mobile/AR/Unity/Handytests werden erst am Samstag weiterbearbeitet.
- Heute und morgen werden andere Beta-relevante Aufgaben bearbeitet.
- Nach Repo-/TODO-/Agent-Aenderungen soll Bernd wieder den kompletten Agentenlauf starten.
- Der Autopilot-Dry-Run vom 2026-05-14 waehlt `AGENT-DOC-BASELINE-CHECK` als aktuellen low-risk Dokumentationsbaseline-Task.

Aktueller Fokus aus diesem uebernommenen Kontext:
1. Build-/Server-/Installationsstabilitaet
2. interne Economy-Regeln als Dokumentation
3. Datenschutz-/Health-/Watch-Daten-Abgrenzung
4. Blockchain-/Chain-Trennung fuer spaeter
5. Website/Dashboard/Beta-Struktur, falls Zeit bleibt

## Aktueller Produktfokus aus alter Roadmap J

Status aus `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` wurde uebernommen:

- [x] Stufe 1 Mission Security / RewardPreview / Anti-Cheat Grundlage fachlich, emulatorseitig und produktionsseitig abgeschlossen.
- [>] KI-Buddy / echter AR-Begleiter / Unity AR Foundation ist wichtig, wird aber laut Bernd erst Samstag praktisch weiterbearbeitet.
- [>] Serverseitige Mission Completion / interne Rewards bleiben vorbereitet, werden aber nach KI-Buddy/AR weitergefuehrt.
- [>] Handy / AR / Avatar / Buddy bleibt fuer Produkt wichtig, ist aber heute/morgen nicht Arbeitsfokus.
- [~] Browser/WebGL bleibt Demo und Fallback.
- [~] Unity AR Foundation bleibt verbindlicher Hauptpfad fuer echten Buddy-AR.
- [~] Buddy-KI, Missionsempfehlungen, Raetselgenerierung und Reward-Bewertung bleiben ausserhalb von Unity in Backend/App-Logik.
- [!] Unity rendert und steuert AR, aber finale Rewards, Mission Completion und Anti-Cheat bleiben serverseitig.
- [!] Mobile bleibt App-Store-konform: keine Token-/NFT-/Trading-/Presale-Funktion in Mobile.
- [>] Token-/NFT-/Ownership-Funktionen bleiben spaeter Web-/PC-Dashboard.
- [~] WellFit muss zuerst als internes Punkte-, XP-, Reward- und Economy-System funktionieren.
- [>] Blockchain, echte NFTs und WFT werden erst nach stabiler Alpha-/Beta-/Testphase ergaenzt.

## Master Roadmap import available

Quelle / fuehrende Dateien: `project-register/master-roadmap-tasks.json`, `docs/architecture/WELLFIT_MASTER_ROADMAP_IMPORT.md`, `scripts/wellfit-dev-agent/src/master-roadmap-task-check.mjs`

- [x] Die WellFit Master Roadmap / Developer To-Do List ist als maschinenlesbare Registry importiert und auf bestehende Work-Map-/Product-Readiness-Themen gemappt.
- [ ] Safe next task 1: Nach diesem Dokumentationsbaseline-PR erneut `npm run agent:autopilot:dry-run` ausfuehren und den dann ausgewaehlten low-risk Task pruefen.
- [ ] Safe next task 1b: `project-register/master-roadmap-tasks.json` nach kuenftigen PRs registry-only aktualisieren und `node scripts/wellfit-dev-agent/src/master-roadmap-task-check.mjs` ausfuehren.
- [ ] Safe next task 2: Economy-Caps und EconomyHealthScore nur in bestehenden Guardrail-Dokumenten weiter spezifizieren, ohne finale Ledger-/Reward-Authority zu aktivieren.
- [ ] Safe next task 3: Unity/AR-Micro-Task-Kontext planning-only ausserhalb von `native/unity/WellFitBuddyAR` inventarisieren; PR #13 und Unity-Dateien nicht anfassen.

## Prio 0 - TODO-/Agent-Gedaechtnis stabilisieren

- [x] `todolist/TODO_INDEX.md` als zentralen Index mit Querverweisen angelegt.
- [x] `todolist/TODO_CONSOLIDATION.md` als Konsolidierungsdatei angelegt.
- [x] Gefundene Alt-TODOs in `TODO_INDEX.md` referenziert.
- [x] KI-Fortsetzungs-Prompts in wichtigen TODO-/Planungsdateien ergaenzt.
- [x] Quality-Gate erreicht PASS: Alpha 7/7, Missing Index 0, Missing Prompts 0, Micro-Tasks 12.
- [x] 2026-05-14 Baseline auf `agent-doc-baseline-check`: `npm run agent:autopilot:dry-run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm --prefix functions run check` und `npm run agent:quality-gate` erfolgreich.
- [x] Agent-Governance-/Autopilot-/Research-/Adaptive-Insight-/Master-Roadmap-/Visual-Check-Mapping in `WORK_MAP.md` und `TODO_INDEX.md` geprueft; keine Parallelarchitektur angelegt.
- [ ] Inhalte von `todolist/README.md` weiter pruefen und relevante Punkte in fuehrende Dateien uebernehmen.
- [ ] Inhalte von `todolist/CHAT_START_PROMPT.md` weiter pruefen und relevante Punkte in fuehrende Dateien uebernehmen.
- [ ] Doppelte TODOs als `duplikat` markieren, aber nicht loeschen.
- [ ] Veraltete TODOs als `veraltet` markieren, aber nicht loeschen.

## Prio 1 - Heute/Morgen: Build, Server, Beta-Basis

- [x] Setup-/README-/Env-Dokumentation am 2026-05-15 docs-only abgeglichen: lokale Setup-Schritte, `npm install`-Grenze, `npm run build`/`npm run dev`, Firebase-`NEXT_PUBLIC_*`, CI-Build ohne echte Secrets, serverseitige Keys ohne `NEXT_PUBLIC_`, `.env.local`-No-Commit-Regel und Agenten-Safety dokumentiert.
Quelle: Dry-Run-Report, `todolist/README.md`, `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`

- [x] Firebase-/PM2-/Emulator-Voraussetzungen am 2026-05-15 docs-only nachgezogen: Root-App-Checks vs. Functions-Syntaxcheck getrennt, `npm --prefix functions run check` beschrieben, Emulator-Voraussetzungen (Firebase CLI, Java, Ports, Login/Projektkontext, lokale Umgebung) dokumentiert, PM2/Server-Deployment nur mit expliziter Human-Freigabe, keine Firestore-Rules-/Functions-/Runtime-/Reward-/Mission-Authority-Aenderung.
Quelle: `README.md`, `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md`, `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md`, `docs/architecture/MISSION_DRAFT_EMULATOR_TEST_PLAN.md`

- [x] Register/User/Profile/Settings Schema-Baseline am 2026-05-15 docs-only erstellt: Registrierungsfelder, User-Dokumentfelder, Profil-/Settings-Kategorien, Avatar-/`profile.aiBuddy`-Felder, Consent-Felder, KI-relevante Felder, sensitive Felder, Duplicate-/Wrong-Field-Risiken und Nicht-Autoritaetsgrenzen in `todolist/DATABASE_PLAN.md` dokumentiert; unklare Felder bleiben `review_required`. Keine Runtime-, Auth-, Firestore-, Profil-, Settings-, Functions-, Rules-, Public-Asset-, Package- oder Unity-Aenderung.
Quelle: `todolist/DATABASE_PLAN.md`, `todolist/B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT`

- [x] Safety-wording / economy-guardrail documentation pass am 2026-05-15 docs-only in bestehenden Mobile-/Mission-/Economy-/Privacy-/Legal-Planungsquellen umgesetzt: MVP/Beta bleibt interne Punkte/XP und Preview/Anzeige, echte Token-/NFT-/Wallet-/Payment-/Trading-/Payout-/Presale-Logik bleibt deaktiviert und `review_required`, Clients erhalten keine Reward-/Mission-/Leaderboard-/Inventory-/Rare-Item-Autoritaet, Health-/Child-/Location-/Camera-/Face-/Motion-/Privacy-/Consent-Erweiterungen bleiben reviewpflichtig. Keine Runtime-Logik, keine Legal-/Compliance-Seiten, keine Reward-/Mission-Authority und keine Token-/NFT-/Wallet-/Payment-/Betting-Aktivierung.

- [x] Data-protection-review documentation pass am 2026-05-15 docs/register-only umgesetzt: Health-/Watch-, Child-/Family-, Location-/GPS-/Radius-/Safe-Zone-, Camera-/AR-/Pose-/Face-/Biometric-, Motion-/DeviceMotion- und Consent-/Permission-Bereiche sind als protected / `review_required` mit Datenminimierung, Consent, Fallback, Human-/Legal-/Privacy-Review und Nicht-Autoritaetsgrenzen dokumentiert. Keine Runtime-Code-, Legaltext-, Consent-Flow-, Tracking-, Datenerfassungs-, Reward- oder Mission-Authority-Aenderung wurde aktiviert.

- [x] Backend-readiness documentation/register pass am 2026-05-15 docs/register-only umgesetzt: Root-App-Checks vs. Functions-Syntaxcheck vs. Emulator-Tests, Firebase CLI/Java/Port/Projektkontext-Voraussetzungen, Preview-/Draft-/Status-API-Grenzen, Persistence-Status, Firestore-Rules-Guardrails und finale Ledger-/Reward-/Mission-Authority als `review_required` dokumentiert. Keine Runtime-Code-, Rules-, Functions-, API-Verhaltens-, Ledger-, Reward-, Mission-Authority-, Deployment- oder Produktionswrite-Aenderung.

- [x] Mobile/PWA Device-Testplan am 2026-05-15 docs/register-only ausgerichtet: bestehende Mobile-Routen `/mobile`, `/mobile/missionen`, `/mobile/missionen/squat`, `/mobile/buddy`, `/mobile/analyse`, `/mobile/bewegung`, `/mobile/einstellungen`, `/mobile/ar`, Android Chrome, Samsung Internet, iPhone Safari, Desktop-Responsive-Smoke, QR-/PWA-Install, Kamera-Permission, MediaPipe/Pose/Face, DeviceMotion, WebGL/3D-Flammi, AR-Fallbacks, Screenshot-Smoke und Privacy-/Reward-Authority-Grenzen sind als `device_test_required`/`review_required` dokumentiert. Keine Runtime-Mobile-, Service-Worker-/Manifest-/Public-Asset-, Tracking-, Consent-, Daten-, Reward-/Mission-Authority-, Functions-/Rules-/Deploy- oder Unity-Aenderung.

- [x] Manual Mobile/PWA Device-Evidence-Vorlage und Concise-Tester-Handoff am 2026-05-15 docs/register-only ergaenzt: Menschen koennen fuer Android Chrome, Samsung Internet, iPhone Safari und Desktop-Responsive-Browser Testdatum, Tester, Device/OS/Browser, Route, erwartetes/aktuelles Ergebnis, Status (`pass`/`fail`/`blocked`/`device_test_required`/`review_required`), Evidence-Referenz, Safety-Notizen, Follow-up und Severity erfassen; ungetestete Items bleiben `device_test_required`. Keine Runtime-Mobile-, Service-Worker-/Manifest-/Public-Asset-, Tracking-, Consent-, Daten-, Reward-/Mission-Authority-, Functions-/Rules-/Deploy- oder Unity-Aenderung.

- [x] Erste Human-Mobile/PWA-Evidence am 2026-05-16 docs/register-only erfasst: Phone Chrome auf `https://wellfit-now.io/mobile`, `/mobile/ar` Kamera startet = `pass`, Buddy erscheint = `pass`, Buddy final = `review_required` / `expected_incomplete`; Device Model/OS/Chrome-Version fehlen und bleiben `missing_device_metadata` / `device_test_required`; Desktop-Responsive-Screenshots fuer `/mobile`, `/mobile/missionen`, `/mobile/buddy`, `/mobile/einstellungen`, `/mobile/bewegung` = `pass` / `screenshot_provided`, `/mobile/missionen/squat` = `desktop_camera_source_blocked_or_unavailable` (kein Phone-Fehler), `/mobile/ar` = `pass_with_review_required`. Keine Screenshots/Binaries/Rohdaten, Runtime-Code-, Service-Worker-/Manifest-/Public-Asset-, Tracking-, Consent-, Reward-/Mission-Authority-, Functions-/Rules-, Unity-, Deploy-, Auto-Merge- oder Auto-Repair-Aenderung.

- [x] Beta-1 Emulator-Verifikation bleibt als abgeschlossen dokumentiert (siehe `docs/beta/BETA1_EMULATOR_VERIFICATION.md`).
- [x] Beta-1 Pilot Evidence Run am 2026-05-21 als docs/register-only Nachweis abgeschlossen: `BETA1_PILOT_EVIDENCE_RUN.md` + `BETA1_PILOT_EVIDENCE_SUMMARY.md` erstellt; Matrix/Checklist/Support-Runbook evidence-konservativ aktualisiert; aktueller Status bleibt NO-GO bis Manual-Seed- und Device-Evidence vorliegen.
- [x] Guardrail-Bestaetigung (2026-05-21): keine Runtime-Dateien geaendert, keine neuen Firebase Functions, keine Firestore-Rules-Aenderung, keine echten Tester-Daten/PII, keine Token/NFT/Payment/Cashout-Aktivierung.
- [>] Empfohlener naechster Branch nach Evidence-Run: `readiness/beta1-pilot-evidence-gaps-close` (falls Readiness priorisiert) oder optional `runtime/beta1-mission-detail-projections` erst nach Gap-Close/Go-Freigabe.
- [x] Beta-1 Evidence Gaps Close Plan/Template-Set am 2026-05-21 als docs/register-only erstellt (`BETA1_PILOT_EVIDENCE_GAPS_CLOSE_PLAN.md`, `BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md`, `BETA1_PILOT_STOP_COMMUNICATION_TEMPLATE.md`) und Matrix/Checklist/Summary mit Referenzen aktualisiert; Wave 1 bleibt NO-GO bis Human-Evidence vorliegt.
- [x] Guardrail-Bestaetigung (2026-05-21, Gap-Close-PR): keine Runtime-Dateien geaendert, keine echten Tester-Daten/PII, keine Functions/Rules/Deploys.
- [>] Empfohlener naechster Branch nach Gap-Close-Plan: `readiness/beta1-human-evidence-capture` (prioritaer) oder optional `runtime/beta1-mission-detail-projections` erst nach belegter Readiness-Evidence.
- [x] Neuer Planungsschritt (2026-05-20): Beta-1 Client-Read-Projections-Plan + Admin-Panel-Integrations-Plan inkl. Folgeprompts fuer getrennte Runtime-Implementierungs-PRs erstellt.
- [x] Naechster Umsetzungsschritt abgeschlossen am 2026-05-20: Implementierungs-PR auf `runtime/beta1-client-read-projections` mit erstem safe read-only client projection slice (Wallet, Ledger, Missions, Inventory, Shop, Checkpoints, Glitch, optionale Guardian-Child-Liste in bestehender Dashboard-Section) umgesetzt; ohne neue Authority, ohne Functions-/Rules-Aenderung.
- [x] Naechster Schritt abgeschlossen am 2026-05-20: Implementierungs-PR auf `runtime/beta1-admin-panel-integration` mit minimaler Admin-UI + Admin-Claim-Guard + bestehende Admin-Callables umgesetzt; ohne neue Functions, ohne Rules-Aenderung, ohne Client-Final-Authority.

- [x] Naechster Schritt abgeschlossen am 2026-05-20: Admin-Panel-Validation-Hardening auf `runtime/beta1-admin-panel-validation-hardening` umgesetzt (Payload-Vorvalidierung, pro Formular Loading/Success/Error, safer Error-Messages, differenzierter Admin-Claim-Guard); keine neuen Functions, keine Firestore-Rules-Aenderung, keine Client-Final-Authority.
- [x] Validation-Hardening Detail (2026-05-20): Beta-1 Admin-Panel uebergibt nur vorvalidierte/normalisierte Payloads (trimmed Strings, optionale leere Felder entfernt, ISO-Zeitfenstergrenzen geprueft); keine neue Function, keine Rules-Aenderung, keine Server-Authority-Verschiebung.

- [x] Naechster Schritt abgeschlossen am 2026-05-20: E2E-Smoke-Slice auf `runtime/beta1-admin-panel-e2e-smoke` vorbereitet/abgesichert (Smoke-Plan-Dokument, kleine Admin-UI-Hinweise, statische Smoke-Templates, Dashboard Mission Preview mit title/type/rewardXp fuer erste 3 Published Missions + Hinweis "Detailansicht folgt").
- [x] E2E-Smoke Guardrail-Status (2026-05-20): keine neuen Firebase Functions, keine Firestore Rules-Aenderung, keine .github-Aenderung, keine Client-Final-Authority.
- [x] PR-#186-Follow-up-Fix abgeschlossen am 2026-05-20 auf `fix/beta1-smoke-template-validation`: Smoke-Templates auf Client-Validation ausgerichtet (`mission.type=movement`, Glitch-Fenster 10 Minuten), Mission-Preview zeigt fehlendes/ungueltiges `rewardXp` nicht mehr als `0 WFXP`, sondern als `Reward offen`; numerisches `0` bleibt `0 WFXP`. Keine Functions-/Rules-/.github-Aenderung und keine Client-Final-Authority eingefuehrt.
- [>] Empfohlener naechster Branch nach diesem Slice: `runtime/beta1-seed-demo-content-and-test-users` (zuerst), danach optional `runtime/beta1-mission-detail-projections`.

- [ ] Naechster sicherer Product-Foundation-Schritt: fehlende Phone-Metadaten (Device Model, Android-Version, Chrome-Version, PWA/Viewport-Modus) erfassen und Phone-Routen `/mobile`, `/mobile/missionen`, `/mobile/buddy`, `/mobile/einstellungen`, `/mobile/bewegung`, `/mobile/missionen/squat` mit dem Tester-Handoff explizit pruefen; `/mobile/ar` Controls, WebGL/Kamera-Layering, Performance/Fallbacks und Buddy-Endverhalten weiter als `review_required` dokumentieren; keine Auto-Reparatur, keine Runtime-Code-, Service-Worker-/Manifest-/Public-Asset-, Tracking-, Consent-, Reward-/Mission-Authority-, Functions-/Rules-, Unity- oder Deployment-Aenderung ohne explizite Freigabe.

- [x] 2026-05-14 aktuellen Baseline-Check ausgefuehrt: Lint, Typecheck, Build, Functions-Syntaxcheck und Quality Gate erfolgreich.
- [~] Root-Installation bleibt unveraendert; `npm install` wurde nicht ausgefuehrt, weil Abhaengigkeiten fuer die Checks vorhanden waren.
- [ ] `LAST_BUILD_STATUS.md` nur aktualisieren, wenn ein kuenftiger Auftrag diese Statusdatei ausdruecklich in den erlaubten Dateien einschliesst.
- [ ] Build-/Server-Hinweise mit `DONE_LOG.md` und Status-Dateien abgleichen, sobald diese Dateien in einem passenden Dokumentationsauftrag erlaubt sind.

## Prio 2 - Heute/Morgen: interne Economy-Regeln dokumentieren

Quelle: Dry-Run-Report, `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`, `docs/architecture/AR_REWARD_LEDGER_EVENT.md`, `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`

- [ ] DailyEmissionCap, UserDailyCap, MissionTypeCap und EconomyHealthScore definieren.
- [ ] Klar festlegen: interne Punkte/XP zuerst, keine echten Token/NFT/WFT vor stabiler Beta/Testphase.
- [ ] Punkte-Ledger, Audit-Events, Caps und EconomyHealthScore nur als interne Logik planen, nicht produktiv freischalten.
- [ ] Jackpot, Burn-Aequivalente und 25-Mrd.-Supply-Logik nur als Simulation/Dokumentation behandeln.

## Prio 3 - Heute/Morgen: Datenschutz, Health, Watch, Standort

Quelle: `todolist/CHAT_START_PROMPT.md`, `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md`, `docs/architecture/MISSION_DRAFT_SECURITY_PLAN.md`

- [x] Schritt-, Health- und Watch-Daten duerfen spaeter nur als unterstuetzende Validierungs-, Kontext- oder Plausibilitaetsdaten dienen; direkte Reward-/Mission-Authority bleibt verboten.
- [x] Health-/Kinder-/Standort-/Kamera-/Face-/Motion-/Consent-Daten sind protected und `review_required` dokumentiert.
- [x] Keine sensible Gesundheits-/Standort-/Kamera-/Face-/Motion-Logik als Beta-Hauptmechanik verwenden.
- [x] Mobile-App bleibt frei von Token-, NFT-, Trading- und Presale-Funktionen.

## Prio 4 - Heute/Morgen: Chain-/Blockchain-Trennung

Quelle: `todolist/CHAT_START_PROMPT.md`, `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`, `docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md`

- [ ] Historische Solana/SPL-Unterlagen und neuere SUI/Dynamic-Objects-Unterlagen nicht vermischen.
- [ ] Finale Chain-Entscheidung spaeter treffen.
- [ ] Blockchain, WFT, NFT, Trading, Marketplace, Staking und DAO bleiben Backlog bis nach stabiler Beta/Testphase.
- [ ] Fuer Beta nur interne Punkte-/XP-/Reward-Simulation verwenden.

## Prio 5 - Samstag: KI-Buddy / Unity AR Foundation

Quelle: `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`, `todolist/H*`, `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md`

- [ ] `/mobile/ar` am Handy erneut testen: Kamera startet, Umgebung sichtbar, Avatar sichtbar, Buttons scrollbar.
- [ ] `/mobile/ar` pruefen: Provider-Anzeige, Text, Optionen, Fallback und Scrollbarkeit in aktiver/inaktiver Kamera.
- [ ] Unity-Projekt lokal erzeugen.
- [ ] Erste Android-ARCore-Build-Kette testen.
- [ ] Buddy platzieren, bewegen, springen und zum Nutzer zurueckrufen als echten Unity-AR-Pfad weiterfuehren.
- [ ] WebGL-Buddy als Demo/Fallback klar kennzeichnen.

## Prio 6 - KI-Buddy als Guide / Dialog / Missionsempfehler

Quelle: `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`, `docs/architecture/BUDDY_KI_INTEGRATION.md`, `docs/architecture/BUDDY_KI_MODEL_PROVIDER_RUNBOOK.md`

- [x] `app/api/buddy-ki/route.ts` vorhanden laut Roadmap J.
- [x] Rules-Fallback fuer Buddy-KI vorhanden laut Roadmap J.
- [x] Optionaler serverseitiger OpenAI-Modellprovider vorbereitet laut Roadmap J.
- [>] Server-Env fuer echten Modelltest nur setzen, wenn Bernd das ausdruecklich will.
- [ ] Buddy-KI-Guide Datenmodell in App/Backend weiter ausbauen.
- [ ] KI-Buddy darf Vorschlaege machen, aber keine Rewards, Punkte, Token oder Mission-Completion autorisieren.

## Prio 7 - Serverseitige Mission Completion / interne Rewards

Quelle: `todolist/F - FIREBASE  - REALTIME - MISSIONEN`, `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS`, `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`, `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`, `todolist/DATABASE_PLAN.md`

- [!] `validateMissionCompletionWithItem` produktionsreif vorbereiten: reviewpflichtig.
- [!] `grantItemOrCapability` produktionsreif vorbereiten: reviewpflichtig.
- [ ] `missionRewardEvents` als echte Audit-Events planen.
- [ ] Serverseitiges Punkte-Ledger als Pflichtarchitektur vorbereiten.
- [ ] Server-Transaktionen fuer interne XP/Punkte/Streaks vorbereiten.
- [ ] UserDailyCap gegen Nutzerhistorie pruefen.
- [ ] MissionTypeCap gegen Missionstyp und Kontext pruefen.
- [ ] Completion nur bei ausreichender Evidence erlauben.
- [ ] Completion bei hohem Pattern-/Cooldown-/Evidence-Risiko auf Manual Review setzen.
- [ ] Rejected-/Manual-Review-Pfade sauber auditieren.
- [ ] Firestore Rules fuer Nutzerpunkte/XP weiter haerten.
- [ ] Tagesmissionen schrittweise von MVP-Client-Reward auf Server-Preview/Server-Completion umstellen.

## Prio 8 - Website / Dashboard / Navigation / Beta-Demo

- [ ] Website Route & Link Integrity Audit report-only ausfuehren, um `/challenge`-/`/missionen/challenge`-Alias, Navigation, Route-Link-Evidence und Visual/Mobile-Smoke-Evidence-Luecken zu klaeren, ohne Runtime-/Legal-/Protected-Code zu aendern.
Quelle: `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`, `PROJECT_STRUCTURE.md`

- [ ] Startseite analysieren und verbessern.
- [ ] Dashboard analysieren und stabilisieren.
- [ ] Navigation und Seitenstruktur pruefen.
- [ ] Nutzerprofil und Avatar-Grundlage planen.
- [ ] Demo-Wallet klar als Mockup kennzeichnen.
- [ ] Mobile Ansicht pruefen.
- [ ] Beta-Akzeptanzkriterien definieren.

## Prio 9 - Datenbank / Backend / Auth

Quelle: `todolist/DATABASE_PLAN.md`, `todolist/F - FIREBASE  - REALTIME - MISSIONEN`

- [ ] Datenbankentscheidung vorbereiten: Firebase/Firestore, Supabase/PostgreSQL oder eigener PostgreSQL-Server.
- [ ] Nutzer-, Missions-, Progress-, Reward- und Audit-Datenmodell mit vorhandenen Firebase-Dateien abgleichen.
- [ ] Health-/Kinder-/Standortdaten besonders schuetzen.
- [ ] Keine clientseitige Autoritaet fuer Punkte, XP, Rewards, Mission Completion, Leaderboards oder Anti-Cheat.

## Dauerhafte Hinweise aus alter Roadmap J

- [!] Bei `npm install` kann ENOTEMPTY in `node_modules` auftreten; wenn Build danach erfolgreich ist, ist es nicht zwingend blockierend.
- [!] Bei wiederholten Fehlern `node_modules` bereinigen und neu installieren.
- [!] Firebase CLI: Nicht eingeloggt ist fuer lokale Demo-Emulator-Tests nicht immer kritisch; Deploys und produktive Projektzugriffe bleiben explizit human-approved.
- [!] Firebase CLI: Java < 21 wird ab firebase-tools@15 nicht mehr unterstuetzt; spaeter auf Java 21 wechseln, falls lokale Emulatoren deshalb scheitern.
- [!] Nur eine Emulator-Instanz parallel starten, sonst sind Ports 4000/8080/9099/5001 belegt.
- [!] Nur eine PM2-Instanz `wellfit-now` starten; PM2-Restarts/Server-Env-Aenderungen nicht in docs-only Tasks ausfuehren.
- [!] Nicht `next start` starten, solange `next build` noch laeuft oder `.next` unvollstaendig ist.
- [!] Mobile-App darf keine App-Store-kritischen Token-/NFT-/Trading-Funktionen enthalten.
- [!] Clientseitige Tagesmissions-Rewards sind MVP/UI-Logik, nicht langfristige Autoritaet.
- [!] WellFit bleibt bis nach stabiler Beta/Testphase internes Punkte-/XP-System; Blockchain, WFT und NFTs kommen danach als separate Schicht.

## KI-Fortsetzungs-Prompt
Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, danach diese Datei, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md` und `todolist/TODO_CONSOLIDATION.md`. Waehle die naechste offene Aufgabe aus, setze sie pragmatisch um und dokumentiere das Ergebnis. Bis zur Beta darf direkt auf `main` gearbeitet werden. Halte Aenderungen klein und modular. TODO-Dateien nicht loeschen, sondern erweitern oder markieren.

## Hinweise von Bernd
- Skalierbarkeit ist wichtig.
- Alles soll in kleinere Dateien aufgeteilt werden.
- Die Datenbank darf nicht vergessen werden.
- TODO-Dateien sollen eigene Prompts enthalten, damit die KI weiterarbeiten kann.
- TODO-Dateien duerfen bearbeitet, aber nicht geloescht werden.
- Es soll dokumentiert werden, wo welche Datei und welcher Ordner liegt.
- Neue TODO-Listen muessen relevante Inhalte aus alten TODOs uebernehmen oder verlinken.
- Mobile/AR/Unity/Handytests werden erst am Samstag weitergemacht.

## Beta 1 data model and agent handoff

- [x] 2026-05-17 Beta-1-Scope-, Agent-Pack- und Firestore/Firebase-Datenmodell docs/register-only angelegt: `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/AGENTS_WELLFIT_BETA1.md`, `docs/beta/WELLFIT_BETA1_DATA_MODEL.md`, `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml` und `agents/beta1/`.
- [x] WellFit-XP/WFXP als interne Beta-Punkte ohne Geldwert, Crypto-Wert, Cashout, Exchange, Blockchain, NFT-Marketplace oder Real-Money-Shop dokumentiert; Client darf nur previewen und nie XP, Mission Completion, Mayor Share, Shop Spend, Inventory Grants oder Glitch Boost final autorisieren.
- [ ] Naechster Runtime-Task nach Approval: separater, exakt gescopter Firestore-Rules-/Firebase-Functions-PR mit Emulator-Tests fuer geschuetzte Client-Write-Failures und serverautorisierte Success Paths.

## 2026-05-18 - Beta-1 Runtime Firestore/Functions Follow-up

- [x] Branch `runtime/beta1-firestore-functions-emulator-tests` implements the first Beta-1 runtime slice for Firestore rules, server-authoritative callables and focused emulator test scripts.
- [x] Branch `runtime/beta1-emulator-verification-hardening` hardened Beta-1 runtime/test coverage, but exact emulator execution stayed blocked because the Codex environment received `403 Forbidden` while downloading the Firestore Emulator JAR and later hit `ECONNREFUSED 127.0.0.1:8080`.
- [x] Branch `docs/beta1-emulator-ci-verification-plan` adds the follow-up prompt `docs/beta/prompts/CODEX_PROMPT_BETA1_EMULATOR_CI_VERIFICATION.md` without changing Runtime, Firebase config or `.github/**`.
- [x] GitHub-Actions-Verifikation nach PR #178 ist grün dokumentiert: Build = success, Beta 1 Emulator Tests = success, Job `Beta-1 Firestore and callable emulator tests` = success, Step `Run focused Beta-1 emulator suites` = success (Merge-SHA `f3643800272dd152b3d6a6d3811a6229522e7cc3`, pre-merge Head-SHA `e79f21ffbd5558aa8efa5936093faf63d522b7a4`).
- [x] Historischer Stand (2026-05-18) bleibt als Kontext erhalten: lokale/Codex-Verifikation war damals durch fehlende Remote-/`gh`-Sicht und CONNECT-403 limitiert.
- [x] Klarstellung Blocker-Status: lokal/Codex kann der Firestore-Emulator-JAR-Download weiterhin mit `403 Forbidden` scheitern und danach `ECONNREFUSED 127.0.0.1:8080` verursachen; in GitHub Actions war dies fuer PR #178 nicht blockierend.
- [ ] Keep Beta-1 WFXP internal-only: no blockchain, token, NFT marketplace, cashout, real-money shop, IAP, DePIN, real PvP stakes, public child profiles, child standalone login or client-authorized XP/mission/shop/inventory/mayor/glitch/admin decisions.

- [ ] Naechster empfohlener Schritt nach dem grünen CI-Nachweis: Beta-1 Server/API-Flows für Client-Read-Projections oder Admin-Panel-Integration als kleinen, separaten Planungs-/Implementierungs-Branch schneiden.

- [ ] Follow-up: Expand Beta-1 client read projections to mission detail, guardian child profile list, avatar definitions, mission locations, and regions once safe UI slots are confirmed (runtime/beta1-admin-panel-integration or dedicated fix branch).

---

## 2026-05-20 - Owner Prompt Umsetzungsplan (Agent-Admin + AT Closed Beta)

Fuehrende Plan-Datei: `docs/beta/AGENT_ADMIN_PHASE1_AND_AT_CLOSED_BETA_PLAN.md`

### Reihenfolge (verbindlich)
1. Agent-Admin Freigabe Phase 1 nur fuer docs/register/check-script Automation ausfuehren.
2. Serverseitige Rollen + Audit-Log als kritischen Gap schliessen (vor Runtime-Autonomie).
3. Pilot-Readiness Sprint ausfuehren (Device Evidence + Backend Guardrail Evidence + Support Runbook).
4. AT Closed Beta (25-50 Tester:innen) mit Ein-/Ausschlusskriterien und Stop-Conditions freigeben.
5. Runtime-Autonomie erst danach eng allowlistet und task-spezifisch erweitern.

### Harte Grenzen
- Kein Auto-Merge, kein Auto-Deploy.
- Keine Runtime-/Protected-Scope-Aktivierung ohne explizite Owner-Freigabe und Reviewplan.
- Token/NFT/Wallet/Payment/Health/Child/Location/Legal bleiben review_required.

## Update 2026-05-20 - Beta-1 Demo Seed/Testuser Planung

- [x] Branch `runtime/beta1-seed-demo-content-and-test-users`: Demo-Content-Plan fuer 25-50 Closed-Beta-Tester erstellt (`docs/beta/BETA1_SEED_DEMO_CONTENT_PLAN.md`).
- [x] Testuser-/Rollout-Plan mit 25 Platzhalter-Testern erstellt (`docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md`).
- [x] Statische Demo-Seed-Templates (no-write) erstellt (`lib/admin/beta1DemoSeedTemplates.ts`).
- [x] Folgeprompt fuer spaeteren manuellen Seed-Runbook-Task erstellt (`docs/beta/prompts/CODEX_PROMPT_BETA1_MANUAL_SEED_RUNBOOK.md`).
- [x] Guardrails eingehalten: keine echten Writes, keine Functions-/Rules-/.github-Aenderung, keine Client-Final-Authority.
- [>] Empfohlener naechster Branch: `ops/beta1-manual-demo-seed-runbook`.

## Beta-1 Manual Seed Runbook Update (2026-05-20)
- [x] Branch `ops/beta1-manual-demo-seed-runbook`: Manuelles Beta-1 Demo-Seed-Runbook erstellt (`docs/beta/BETA1_MANUAL_DEMO_SEED_RUNBOOK.md`) inklusive Seed-Reihenfolge, Validierungs-/Stop-Regeln, Evidence-Protokoll und Go/No-Go-Kriterien ohne automatische Writes.
- [x] Evidence-Vorlage erstellt (`docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md`) mit kopierbarer Tabelle fuer manuelle Seed-Durchlaeufe; Testuser bleiben Platzhalter-only.
- [x] Guardrail-Bestaetigung: Keine Functions-/Firestore-Rules-/.github-Aenderungen, keine echten personenbezogenen Daten, keine echten Tester-E-Mails, keine Production-IDs.
- [>] Empfohlener naechster Branch: `readiness/beta1-pilot-go-no-go-matrix` (Alternative: `runtime/beta1-mission-detail-projections`).

## 2026-05-21 - Beta-1 Pilot Go/No-Go Readiness (Docs/Register-only)

- [x] Branch `readiness/beta1-pilot-go-no-go-matrix`: Go/No-Go Matrix fuer AT Closed Beta Wave 1 (25-50 Tester) angelegt (`docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`) inklusive Ampelsystem, Must-be-Green-Regel und verbindlichen No-Go-Regeln.
- [x] Pilot Readiness Checklist angelegt (`docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md`) mit Device-, Seed-, Support-, Guardian/Child-, Consent/Privacy- und Safety-Gates.
- [x] Pilot Support Runbook angelegt (`docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md`) mit Incident-Kategorien, P0-P3 Reaktionslogik, Stop Conditions und Incident-Evidence-Feldern.
- [x] Folgeprompt fuer den naechsten Evidence-PR angelegt (`docs/beta/prompts/CODEX_PROMPT_BETA1_PILOT_READINESS_EXECUTION.md`).
- [x] Bestaetigt: Keine Runtime-Dateien geaendert, keine echten Tester-Daten, keine Production IDs, keine Functions-/Rules-Aenderung.
- [>] Empfohlener naechster Branch: `readiness/beta1-pilot-evidence-run`.

- [x] 2026-05-21 Planungsschritt abgeschlossen: kombinierter Masterplan `docs/beta/BETA1_AGENT_ADMIN_AND_LIVE_READINESS_MASTERPLAN.md`, Rollen-/Audit-Plan `docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md`, Live-Seiten-Readiness-Plan `docs/beta/BETA1_LIVE_PAGES_READINESS_PLAN.md` sowie Folgeprompts erstellt/aktualisiert; keine Runtime-Dateien geaendert, keine Agent-Runtime-Autonomie aktiviert, keine Pilotfreigabe erteilt.
- [>] Empfohlener naechster Branch: `plan/agent-admin-server-roles-audit-runtime-scope` (sicherer zuerst) oder alternativ `plan/beta1-live-pages-runtime-scope` nachgezogen.

- [x] Runtime slice: agent admin roles/audit callable foundation (no auto-merge/deploy; audit required).
- [ ] Next branch recommendation: runtime/agent-admin-execution-queue-pr-handoff

- 2026-05-21: Runtime slice PR-Handoff Queue ergänzt (Execution-Handoff-Felder, prepare/mark/block/list Callables, requiredChecks-Metadaten, humanMergeRequired=true). Kein Auto-Merge, kein Auto-Deploy, keine automatische Codeausführung.


## 2026-05-21 Safe Codex Handoff Prompts
- Added `agentTaskHandoffPrompts` handoff model with audit-ready fields and copy-status flow.
- Added callables: `generateAgentTaskCodexPrompt`, `getAgentTaskCodexPrompt`, `markAgentTaskCodexPromptCopied`, `listAgentTaskHandoffPrompts`.
- Admin UI flow is manual-only; no auto-run, no GitHub API, no auto-merge/deploy; human merge required.
- Next recommended branch: `plan/beta1-live-pages-runtime-scope` (alternative: `runtime/agent-admin-live-page-task-template`).

## Update 2026-05-21 - Beta1 Live Pages Runtime Scope Planning

- [x] `docs/beta/BETA1_PROFESSIONAL_UI_DIRECTION.md` erstellt (professioneller, ruhiger Health-Tech-Dashboard-Stil; weniger verspielt).
- [x] `docs/beta/BETA1_LIVE_PAGES_RUNTIME_SCOPE.md` erstellt (Punkte-Shop, Leaderboard, Analytics & Stats, Marktplatz Preview mit Authority-/Privacy-Grenzen).
- [x] `docs/beta/BETA1_LIVE_PAGES_PR_SEQUENCE.md` erstellt (5 kleine Runtime-PR-Slices mit Checks/Stop-Bedingungen).
- [x] Folgeprompts erstellt: Professional UI Foundation, Points Shop, Leaderboard Readonly, Analytics Stats Own View, Marketplace Preview.
- [x] `docs/beta/AGENT_ADMIN_LIVE_PAGE_TASK_TEMPLATES.md` erstellt fuer spaetere admin-freigebbare Tasks (human merge required, autoMerge=false, autoDeploy=false).
- [x] Guardrail-Bestaetigung: keine Runtime-Dateien geaendert, keine Functions/Rules-Aenderung, keine Pilotfreigabe ausgesprochen.
- [>] Naechster empfohlener Branch: `runtime/beta1-professional-ui-foundation`, danach `runtime/beta1-points-shop-page`.

## Update 2026-05-21 - Beta-1 Professional UI Foundation

- [x] Branch `runtime/beta1-professional-ui-foundation`: erster UI-Foundation-Slice fuer Beta-1 umgesetzt (ruhigere Cards, klarere Status-Badges, strukturierte Metrik-Karten, professionelleres Dashboard/Admin-Wording).
- [x] Guardrail-Bestaetigung: keine Functions-/Rules-Aenderungen, keine neue Client-Authority, keine Payment-/Token-/NFT-/Cashout-Logik.
- [>] Naechste empfohlenen Runtime-Branches: `runtime/beta1-points-shop-page`, danach `runtime/beta1-leaderboard-readonly`, `runtime/beta1-analytics-stats-own-view`, `runtime/beta1-marketplace-preview-placeholder`.

## Update 2026-05-21 - Runtime Slice Beta1 Punkte-Shop

- [x] Branch `runtime/beta1-points-shop-page`: `/shop` Runtime-Seite mit professioneller Beta1-UI (`Beta1PageShell`, `Beta1SectionCard`, `Beta1MetricCard`, `Beta1StatusBadge`) umgesetzt.
- [x] Shop-/Inventory-Daten werden read-only aus sicheren Projections geladen (Wallet, `shopItems`, `userInventory`) und als WFXP-only dargestellt.
- [x] CTA bleibt request-/intent-only (deaktiviert: "Anfrage vormerken"), keine clientseitige finale Spend-/Purchase-Authority.
- [x] Guardrails eingehalten: keine Functions-/Rules-Aenderung, kein Echtgeld/IAP/Token/NFT/Cashout/Wallet-Connect.
- [>] Naechster empfohlener Branch: `runtime/beta1-leaderboard-readonly`.
