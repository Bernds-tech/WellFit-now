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
