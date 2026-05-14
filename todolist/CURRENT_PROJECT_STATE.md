# CURRENT PROJECT STATE - WELLFIT

Stand: 2026-05-14  
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
- Autopilot waehlt weiterhin `AGENT-DOC-BASELINE-CHECK` als sichersten low-risk Dokumentations-Task; Umsetzung bleibt auf erlaubte Dokumentations-/Registerdateien begrenzt und schreibt keine Runtime-Produktlogik.

## Abgeschlossene Arbeit / vorhandene Grundlagen

- App-Shell, Navigation, Footer/Sidebar-Bruecken und mehrere Web-/Mobile-Seiten existieren im `app/`-Baum.
- Dashboard, Dashboard-Anpassung und lokale Dashboard-Pin-/Preference-Themen sind angelegt.
- Missionen, Tages-/Wochenmissionen, Challenge, Abenteuer, History und Favoriten existieren als Routen und begleitende Missions-Libs.
- Buddy/KI-Grundlagen, Rules-Fallback und optionaler serverseitiger Modellprovider sind dokumentiert und als API/Libs vorbereitet.
- Economy-/Punkte-/Reward-Preview-Pfade sind als interne Beta-/Preview-Schicht vorhanden; finale Autoritaet bleibt serverseitig bzw. als Draft/Preview markiert.
- Firestore-/Functions-/Rules-/Emulator-Planung und viele Statusdateien zu RewardPreview, Mission Completion, Evidence, Pattern und Cooldown sind vorhanden.
- PR #45 hat einen UI- und Route-Smoke-Check eingebracht; darauf aufbauen, nicht neu inventarisieren, sofern nicht noetig.
- Agent-Memory-Loop, Autopilot-Dry-Run, Research-Recommendation-Governance, Adaptive-User-Insight-Governance, Master-Roadmap-Import, Product-Readiness, Visual-Route-Smoke-Check, Drift-/Gap-Detektoren und TODO-Status-Sync sind in `WORK_MAP.md`/`TODO_INDEX.md` verlinkt und im Quality Gate eingebunden.

## Offene Arbeit / aktuelle Schwerpunkte

- TODO-/Agent-Gedaechtnis weiter konsolidieren, ohne alte TODO-Dateien zu loeschen.
- UI-Shell, Landing, Dashboard, Sidebar, Footer, mobile Navigation, Legal/Hilfe und bestehende Mission-Routen stabil halten.
- Sicherheitswortlaut fuer Mobile/Beta pruefen: keine aktiven Token-, NFT-, Wallet-, Presale-, Trading- oder Zahlungsversprechen in Mobile/Beta-Flows.
- Economy/Rewards weiter als interne Punkte-/XP-/Preview-Mechanik behandeln, bis serverseitige Autoritaet, Firestore-Regeln und Emulator-Tests bereit sind.
- Daten-/Health-/Child-/Location-/Camera-/Consent-Bereiche nur mit explizitem Auftrag erweitern.
- Backend-/Firestore-/Functions-Readiness in kleinen Schritten pruefen und dokumentieren.
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
2. Den dokumentierten Baseline-Lauf bei kuenftigen Aenderungen erneut ausfuehren: `npm run agent:autopilot:dry-run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm --prefix functions run check` und `npm run agent:quality-gate`.
3. Als naechsten Autopilot-Kandidaten nach dieser Baseline-Aktualisierung erneut `npm run agent:autopilot:dry-run` verwenden; keine High-/Critical- oder geschuetzten Aufgaben automatisch umsetzen.
4. UI-/Route-Smoke-Ergebnisse aus PR #45 bei Bedarf in passende Statusdateien einordnen, ohne neue Shells oder parallele Systeme zu erstellen.
5. Mobile/Beta-Safety-Wording in bestehenden Dateien pruefen, aber Compliance-Logik nur nach explizitem Auftrag aendern.
6. Backend-/Firestore-Guardrails weiter dokumentiert vorbereiten, bevor Reward-/Mission-Autoritaet vom Client weg verlagert wird.
7. Unity/AR-Arbeit separat planen und nur vorhandene Unity-Dateien inventarisieren, nicht ueberschreiben.

## Continuation prompt

Lies zuerst `AGENTS.md`, dann `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `todolist/NEXT_ACTIONS.md`. Arbeite vom aktuellen `main` auf einem neuen task-spezifischen Branch. Halte Aenderungen klein, dokumentations-only wenn der Auftrag das verlangt, und nutze die bestehenden Dateien aus `WORK_MAP.md`, statt neue Architektur oder parallele Systeme anzulegen. PR #13 und Unity-Dateien nicht anfassen. Produkt-, Reward-, Payment-, Wallet-, Health-, Child-, Location-, Privacy- und Compliance-Logik nur mit explizitem Auftrag bearbeiten.
