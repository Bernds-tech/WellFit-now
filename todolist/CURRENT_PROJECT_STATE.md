# CURRENT PROJECT STATE - WELLFIT

Stand: 2026-05-15
Basis: aktueller Dokumentationsbaseline-Stand nach PR #45 (`419cded`, UI-/Route-Smoke-Check) und den Agent-Governance-/Autopilot-Ergaenzungen vom 2026-05-14.
Zweck: fuehrende Agent-Memory-Datei fuer den aktuellen Zustand. Diese Datei ersetzt keine Bereichs-TODOs, sondern verlinkt und ordnet sie.

## Aktuelle verifizierte Baseline

- Repository-Basis ist der Stand nach PR #45 plus den dokumentations-/registry-only Agent-Governance-, Autopilot-, Research-, Adaptive-Insight-, Master-Roadmap- und Visual-Check-Ergaenzungen vom 2026-05-14. PR #45 bleibt erhalten; diese Konsolidierung ist dokumentations-only.
- Aktuelle Route-Inventur umfasst Landing, Dashboard, Buddy, Mobile, Missionen, Punkte-Shop/Marktplatz, Analytics, Einstellungen, Hilfe/FAQ und Legal-Seiten sowie Economy- und Buddy-API-Routen.
- Next.js ist Version 16.2.3 laut `package.json`; bei kuenftigen Next.js-Codeaenderungen zuerst `node_modules/next/dist/docs/` lesen.
- Firebase Functions haben lokale Syntax-Checks ueber `npm --prefix functions run check` vorbereitet.
- Agent-Governance ist ueber `AGENTS.md`, `agents/`, `scripts/wellfit-dev-agent/`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/agent-autopilot.json` und `npm run agent:quality-gate` vorhanden.
- `todolist/WORK_MAP.md` ist die fuehrende topic-to-file map fuer bestehende App-, Backend-, Architektur- und TODO-Dateien.
- Diese Datei und `todolist/WORK_MAP.md` duerfen nicht zu Parallelarchitektur ausgebaut werden; sie zeigen nur auf bestehende Dateien.
- Baseline-Check am 2026-05-14 auf Branch `agent-doc-baseline-check`: `npm run agent:autopilot:dry-run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm --prefix functions run check` und `npm run agent:quality-gate` liefen erfolgreich; `agent:quality-gate` meldete PASS.
- Aktuelle Autopilot-/Batch-Dry-Runs waehlen `AGENT-REGISTRY-SYNC` als sichersten low-risk Registry-/Dokumentations-Task; Umsetzung bleibt auf erlaubte Dokumentations-/Registerdateien begrenzt und schreibt keine Runtime-Produktlogik.
- Zweiter Batch-Autopilot-Limited-Execution-Probe am 2026-05-15 auf Branch `batch-autopilot-probe-2`: ausgefuehrt wurde genau ein sicherer Low-Risk-Dokumentations-Task (`AGENT-DOC-BASELINE-CHECK`); `AGENT-PRODUCT-READINESS-MATRIX-MAINTENANCE` und `AGENT-AUTO-REPAIR-DECISION-GUARD` wurden nicht umgesetzt, weil dieser Probe auf Baseline-/Handoff-Dokumentation begrenzt bleibt. Auto-Merge, Auto-Repair, Deployment, Runtime-Produktcode, Unity/PR #13 und geschuetzte Compliance-/Reward-/Wallet-/Payment-Bereiche blieben unangetastet.
- Product-Readiness-Matrix-Maintenance am 2026-05-15 auf Branch `agent/product-readiness-matrix-maintenance`: docs/register-only Review nach Governance-, Inventory-, Cross-Reference-, Batch-Autopilot- und Progress-/Work-Log-Updates. Aktualisiert wurde nur das `agent_governance`-Modul mit bestehenden Quellen-/Check-Verweisen; keine Produkt-/Runtime-Dateien, Unity/PR #13 oder geschuetzten Token-/Wallet-/Payment-/Reward-/Health-/Child-/Location-/Privacy-/Legal-/Compliance-Bereiche wurden geaendert oder als production-ready markiert.
- Batch-Autopilot-Registry-Sync am 2026-05-15 auf Branch `batch-autopilot-registry-sync-1`: exakt ein Low-Risk-Task (`AGENT-REGISTRY-SYNC`) wurde als docs/register-only Pass ausgefuehrt. Ergaenzt wurden fehlende Definition-of-Done-Schluessel fuer bestehende Governance-/Inventory-Queue-Tasks, damit Dry-Run- und Queue-Register dieselben bestehenden Task-Typen referenzieren; Runtime-Produktcode, geschuetzte Pfade, Unity/PR #13, Auto-Merge, Auto-Repair und Deployment blieben unangetastet.
- Zweite reale Batch-Autopilot-Session am 2026-05-15 auf Branch `codex/batch-autopilot-session-2`: genau zwei Low-Risk-Governance-Tasks aus dem aktuellen Batch-Dry-Run wurden ausgefuehrt (`AGENT-AUTOPILOT-BATCH-DRY-RUN` und `AGENT-PR-REVIEW-POLICY-GOVERNANCE`). Aktualisiert wurden nur bestehende Batch-/PR-Review-Governance-Docs, Register und Handoff-Logs; Runtime-Produktcode, geschuetzte Pfade, Unity/PR #13, Public Assets, Package-Manifeste, Auto-Merge, Auto-Repair und Deployment blieben unangetastet.
- Setup-/Env-Dokumentation wurde am 2026-05-15 auf Branch `docs/setup-env-alignment` als docs-only Produkt-Foundation-Task ausgerichtet: `README.md`, `.env.example` und `todolist/J8.4D - LOCAL ENV UND BUILD SETUP ADDENDUM.md` erklaeren lokale Setup-Schritte, Firebase-`NEXT_PUBLIC_*`-Variablen, CI-Build-Verhalten ohne echte Secrets, serverseitige Provider-Key-Grenzen und Agenten-Safety ohne Runtime-Code-Aenderungen.
- Firebase-/PM2-/Emulator-Dokumentation wurde am 2026-05-15 auf Branch `docs/firebase-pm2-emulator-foundation` als zweiter docs-only Produkt-Foundation-Task geklaert: Root-App-Checks und `npm --prefix functions run check` sind getrennt, Emulator-Tests benoetigen Firebase CLI, Java, freie Ports, Login/Projektkontext und lokale Umgebung, PM2/Deployment bleibt human-approved, und Firestore Rules, Functions-Code, Runtime-Code, Reward-/Mission-Authority sowie Produktionswrites bleiben unveraendert.
- Register/User/Profile/Settings-Schema-Dokumentation wurde am 2026-05-15 auf Branch `docs/register-profile-settings-schema` als dritter docs-only Produkt-Foundation-Task erstellt: `todolist/DATABASE_PLAN.md` beschreibt Registrierungs-, User-Dokument-, Profil-, Settings-, Avatar-/`profile.aiBuddy`-, Consent- und KI-relevante Feldannahmen, markiert sensitive/unklare Felder als `review_required`, dokumentiert Duplicate-/Wrong-Field-Risiken und bestaetigt, dass diese Felder keine Reward-, Mission-Completion-, Anti-Cheat-, medizinische, rechtliche oder Finanz-Autoritaet sind. Runtime-, Auth-, Firestore-, Profil-, Settings-, Functions-, Rules-, Public-Asset-, Package- und Unity-Dateien blieben unveraendert.
- Safety-Wording-/Economy-Guardrail-Dokumentation wurde am 2026-05-15 auf Branch `docs/safety-economy-guardrails` als vierter docs-only Produkt-Foundation-Task ausgerichtet: bestehende Mobile-/Mission-/Economy-/Privacy-/Legal-Planungsquellen stellen klar, dass MVP/Beta nur interne Punkte/XP und Preview-/Anzeigezustaende nutzt, echte Token-/NFT-/Wallet-/Payment-/Trading-/Payout-/Presale-Logik deaktiviert und `review_required` bleibt, Clients keine Reward-/Mission-/Leaderboard-/Inventory-/Rare-Item-Autoritaet erhalten und Health-/Child-/Location-/Camera-/Face-/Motion-/Privacy-/Consent-Erweiterungen Human-Review, Datenminimierung und Fallbacks brauchen. Runtime-Code, Legal-Seiten, Functions, Rules, Package-Dateien, Public Assets und Unity blieben unveraendert.
- Data-Protection-Review-Dokumentation wurde am 2026-05-15 auf Branch `product-foundation-data-protection-review` als fuenfter docs/register-only Produkt-Foundation-Task ausgerichtet: Health-/Watch-, Child-/Minor-/Family-, Location-/GPS-/Radius-/Safe-Zone-, Camera-/AR-/Pose-/Face-/Biometric-, Motion-/DeviceMotion-/Raw-Sensor- und Consent-/Permission-Bereiche sind in bestehenden Guardrail-/Mission-/Mobile-/Legal-Planungsquellen und Registern als protected / `review_required` geklaert. Protected Data bleibt minimiert, consent-/fallback-/reviewpflichtig, raw images/videos/face/biometric/health/location/child details sind Default-`do_not_store`, und keine geschuetzten Signale duerfen direkte Reward-, XP-, Punkte-, Mission-Completion-, Anti-Cheat-, Leaderboard-, Inventory-, Rare-Item-, Token-, Payment-, Payout- oder medizinische Autoritaet erhalten. Runtime-Code, Legal-Seiten, Consent-Flows, Tracking, Datenerfassung, Functions, Rules, Package-Dateien, Public Assets und Unity blieben unveraendert.

- Task-Status-/Work-Log-Sync-Governance wurde am 2026-05-16 auf Branch `repair-task-status-work-log-sync` als replacement fuer die nicht mergebare PR #93 docs/register/validation-script-only neu aufgebaut: `project-register/task-status-policy.json`, `docs/architecture/WELLFIT_TASK_STATUS_AND_WORK_LOG_SYNC.md` und `scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs` definieren kanonische Statusmarker, Pflichtfelder fuer neue Work-Log-/Progress-Log-Evidence und einen report-only Quality-Gate-Check. Automatische TODO-Rewrites, Auto-Merge, Auto-Repair, Deployment, Runtime-Produktcode, Unity/PR #13 und geschuetzte Bereiche bleiben deaktiviert/untouched.

## Abgeschlossene Arbeit / vorhandene Grundlagen

- App-Shell, Navigation, Footer/Sidebar-Bruecken und mehrere Web-/Mobile-Seiten existieren im `app/`-Baum.
- Dashboard, Dashboard-Anpassung und lokale Dashboard-Pin-/Preference-Themen sind angelegt.
- Missionen, Tages-/Wochenmissionen, Challenge, Abenteuer, History und Favoriten existieren als Routen und begleitende Missions-Libs.
- Buddy/KI-Grundlagen, Rules-Fallback und optionaler serverseitiger Modellprovider sind dokumentiert und als API/Libs vorbereitet.
- Economy-/Punkte-/Reward-Preview-Pfade sind als interne Beta-/Preview-Schicht vorhanden; finale Autoritaet bleibt serverseitig bzw. als Draft/Preview markiert.
- Firestore-/Functions-/Rules-/Emulator-Planung und viele Statusdateien zu RewardPreview, Mission Completion, Evidence, Pattern und Cooldown sind vorhanden.
- PR #45 hat einen UI- und Route-Smoke-Check eingebracht; darauf aufbauen, nicht neu inventarisieren, sofern nicht noetig.
- Agent-Memory-Loop, Autopilot-Dry-Run, Research-Recommendation-Governance, Adaptive-User-Insight-Governance, Master-Roadmap-Import, Product-Readiness, Visual-Route-Smoke-Check, Drift-/Gap-Detektoren, TODO-Status-Sync und Task-Status-/Work-Log-Sync sind in `WORK_MAP.md`/`TODO_INDEX.md` verlinkt und im Quality Gate eingebunden.
- Cross-Reference-Maintenance-Framework ist als Register/Runbook/Validator verfuegbar: `project-register/cross-reference-maintenance.json`, `docs/architecture/WELLFIT_AGENT_SYSTEM_ANALYSIS.md`, `docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md` und `scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs`; kuenftige Agenten muessen nach jeder Aenderung passende Change-Kategorien pruefen und vorhandene Register/TODOs synchron halten.

## Offene Arbeit / aktuelle Schwerpunkte

- TODO-/Agent-Gedaechtnis weiter konsolidieren, ohne alte TODO-Dateien zu loeschen.
- UI-Shell, Landing, Dashboard, Sidebar, Footer, mobile Navigation, Legal/Hilfe und bestehende Mission-Routen stabil halten.
- Sicherheitswortlaut fuer Mobile/Beta ist docs-only nachgezogen; weiterhin keine aktiven Token-, NFT-, Wallet-, Presale-, Trading-, Zahlungs- oder Payout-Versprechen in Mobile/Beta-Flows.
- Economy/Rewards weiter als interne Punkte-/XP-/Preview-Mechanik behandeln, bis serverseitige Autoritaet, Firestore-Regeln und Emulator-Tests bereit sind.
- Daten-/Health-/Child-/Location-/Camera-/Consent-Bereiche nur mit explizitem Auftrag erweitern.
- Backend-/Firestore-/Functions-Readiness wurde am 2026-05-15 docs/register-only nachgezogen: Root-App-Checks, Functions-Syntaxcheck, Emulator-Voraussetzungen, Preview-/Draft-APIs, Persistence-Status, Firestore-Rules-Guardrails und Final-Authority-Grenzen sind in bestehenden Docs/Registern verlinkt; Runtime-Code, Functions, Rules, Deployments, Produktionswrites und finale Ledger-/Reward-/Mission-Authority bleiben unveraendert und `review_required`.
- Mobile/PWA Device-Testplanung wurde am 2026-05-15 docs/register-only nachgezogen und um eine Manual-Device-Evidence-Vorlage sowie einen Concise-Tester-Handoff-Checklist-Abschnitt erweitert: bestehende Mobile-Routen, Android Chrome, Samsung Internet, iPhone Safari, Desktop-Responsive-Smoke, QR-/PWA-Install, Kamera-Permission, MediaPipe/Pose/Face, DeviceMotion, WebGL/3D-Flammi, AR-Fallbacks, Screenshot-Smoke, Evidence-Felder, Statuswerte (`pass`/`fail`/`blocked`/`device_test_required`/`review_required`), Severity und Privacy-/Reward-Authority-Grenzen sind in bestehenden Planungsquellen und Registern dokumentiert. Runtime-Mobile-Code, Service Worker, Manifest/Public Assets, Tracking, Datenerfassung, Consent-Flows, Reward-/Mission-Authority, Functions/Rules, Unity/PR #13 und Produktlogik blieben unveraendert.
- Unity/WellFitBuddyAR getrennt inventarisieren; keine Unity-Dateien loeschen, ueberschreiben oder mit alten PRs vermischen.

## Riskante oder blockierte Bereiche

- Keine Produktlogik ohne Auftrag anfassen: Mission Completion, Rewards, Anti-Cheat, Punkte, Leaderboards, Inventory, Rare Items und PvP-Stakes.
- Keine Compliance-kritische Logik oder Texte ohne Review-Plan aendern: Token, NFT, Wallet, Payment, Purchase, Payout, Marketplace, Staking, Presale, Trading, Health, Watch, Child-Safety, Location, Camera, Privacy, Consent, Legal.
- PR #13 und `native/unity/WellFitBuddyAR` bleiben isoliert. Nicht mergen, schliessen, loeschen oder als Shortcut verwenden.
- Clientseitige Rewards sind MVP/UI-Logik und keine langfristige Autoritaet.
- Blockchain, WFT, echte NFTs, Trading, Staking und DAO bleiben Backlog bis nach stabiler Beta/Testphase.
- Firebase Emulator-Tests koennen lokale Voraussetzungen brauchen (Java, Ports, laufende Emulatoren, Login); Fehlschlaege immer klar als Umgebung oder Codeproblem dokumentieren.

## Master Roadmap import pointer

Stand: 2026-05-14

Die vom Nutzer bereitgestellte WellFit Master Roadmap / Developer To-Do List wurde als Import- und Mapping-Register in `project-register/master-roadmap-tasks.json` erfasst und in `docs/architecture/WELLFIT_MASTER_ROADMAP_IMPORT.md` dokumentiert. Diese Dateien dienen als Agenten-Gedaechtnis und ersetzen nicht diesen aktuellen Projektzustand oder `todolist/WORK_MAP.md`. Geschuetzte Roadmap-Themen wie Unity/PR #13, Token/NFT/Wallet/Payment, Reward Authority, Health/Child/Location/Privacy und Legal/Compliance bleiben reviewpflichtig.

## First-read file order fuer kuenftige Agenten

1. `AGENTS.md`
2. `todolist/CURRENT_PROJECT_STATE.md`
3. `todolist/WORK_MAP.md`
4. `todolist/TODO_INDEX.md`
5. `todolist/NEXT_ACTIONS.md`
6. `todolist/PROJECT_STRUCTURE.md`
7. `todolist/TODO_CONSOLIDATION.md`
8. Relevante Bereichs-TODOs und Architekturdateien aus `todolist/WORK_MAP.md`

## Naechste sichere Tasks

1. Nach jedem Rebase/Merge die Dokumentationsdateien `CURRENT_PROJECT_STATE.md`, `WORK_MAP.md`, `TODO_INDEX.md` und `NEXT_ACTIONS.md` konfliktfrei halten.
2. Nach jeder kuenftigen Aenderung passende Kategorien in `project-register/cross-reference-maintenance.json` pruefen, relevante Register/TODOs aktualisieren oder bewusst unveraendert lassen, und `node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` ausfuehren.
3. Den dokumentierten Baseline-Lauf bei kuenftigen Aenderungen erneut ausfuehren: `npm run agent:autopilot:dry-run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm --prefix functions run check` und `npm run agent:quality-gate`.
4. Als naechsten Autopilot-Kandidaten nach dieser Baseline-Aktualisierung erneut `npm run agent:autopilot:dry-run` verwenden; keine High-/Critical- oder geschuetzten Aufgaben automatisch umsetzen.
5. UI-/Route-Smoke-Ergebnisse aus PR #45 bei Bedarf in passende Statusdateien einordnen, ohne neue Shells oder parallele Systeme zu erstellen.
6. Data-Protection-Review fuer Health-/Child-/Location-/Camera-/Face-/Motion-/Consent-Flows ist docs/register-only dokumentiert; weiterhin keine Runtime-, Legaltext-, Consent-Flow-, Tracking- oder Datenerfassungs-Aenderungen ohne explizite Freigabe.
7. Als naechsten Produkt-Foundation-Schritt die Mobile/PWA-Geraetetests mit dem Manual-Tester-Handoff und der Evidence-Vorlage auf Android Chrome, Samsung Internet, iPhone Safari und Desktop-Responsive-Browsern ausfuehren und Findings als `pass`/`fail`/`blocked`/`device_test_required`/`review_required` dokumentieren; weiterhin keine Runtime-Mobile-, Service-Worker-/Manifest-/Public-Asset-, Tracking-, Consent-, Reward-/Mission-Authority-, Functions-/Rules-/Deploy- oder Unity-Aenderungen ohne explizite Freigabe.
8. Backend-/Firestore-Guardrails weiter dokumentiert vorbereiten, bevor Reward-/Mission-Autoritaet vom Client weg verlagert wird.
9. Unity/AR-Arbeit separat planen und nur vorhandene Unity-Dateien inventarisieren, nicht ueberschreiben.

## Continuation prompt

Lies zuerst `AGENTS.md`, dann `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `todolist/NEXT_ACTIONS.md`. Arbeite vom aktuellen `main` auf einem neuen task-spezifischen Branch. Halte Aenderungen klein, dokumentations-only wenn der Auftrag das verlangt, und nutze die bestehenden Dateien aus `WORK_MAP.md`, statt neue Architektur oder parallele Systeme anzulegen. PR #13 und Unity-Dateien nicht anfassen. Produkt-, Reward-, Payment-, Wallet-, Health-, Child-, Location-, Privacy- und Compliance-Logik nur mit explizitem Auftrag bearbeiten.

## Repository Inventory Pointer (2026-05-15)

- The active full-repository inventory is `project-register/repository-inventory.json`, with human-readable guidance in `docs/architecture/WELLFIT_REPOSITORY_INVENTORY_AUDIT.md` and report-only validation in `scripts/wellfit-dev-agent/src/repository-inventory-check.mjs`.
- Future agents should use the inventory to identify mapped, protected, unmapped, stale, duplicate, route, and API coverage before changing files; protected runtime, compliance, and Unity areas remain untouched unless explicitly assigned.
