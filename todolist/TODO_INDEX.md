# TODO INDEX - WELLFIT

## Zweck
Diese Datei ist der zentrale Index fuer alle TODO-Dateien, Arbeitslisten, Prompts und Querverweise im WellFit-Projekt.

Ziel:
- jede TODO-Datei auffindbar machen
- Verweise zwischen TODOs dokumentieren
- verhindern, dass Aufgaben vergessen werden
- spaeteren KI-/Codex-Sessions sofort zeigen, wo was steht

## Wichtige Regel
Keine TODO-Datei loeschen. Wenn eine Datei veraltet oder doppelt ist, hier markieren und auf die fuehrende Datei verweisen.

## Zentrale TODO- und Steuerdateien

| Datei | Status | Zweck | Fuehrende Verweise |
|---|---|---|---|
| `todolist/CURRENT_PROJECT_STATE.md` | aktiv / fuehrend | fuehrender aktueller Projektzustand, Baseline, Risiken und Fortsetzungs-Prompt | `WORK_MAP.md`, `NEXT_ACTIONS.md`, `PROJECT_STRUCTURE.md` |
| `todolist/WORK_MAP.md` | aktiv / fuehrend | fuehrende Topic-to-File-Map gegen doppelte Architektur und parallele Systeme | `CURRENT_PROJECT_STATE.md`, Bereichs-TODOs, `docs/architecture/` |
| `todolist/MASTER_PROMPT_FOR_AI.md` | aktiv | zentrale Arbeitsanweisung fuer KI/Codex | `NEXT_ACTIONS.md`, `PROJECT_STRUCTURE.md`, `TODO_CONSOLIDATION.md`, `TODO_INDEX.md` |
| `todolist/MASTER_OPEN_DONE_LIST.md` | aktiv | zentrale Einzeluebersicht fuer erledigte/offene Aufgaben und Produktregeln | `NEXT_ACTIONS.md`, `DONE_LOG.md`, `PROJECT_STRUCTURE.md` |
| `todolist/NEXT_ACTIONS.md` | aktiv | operative Aufgaben bis Beta | alle Bereichs-TODOs |
| `todolist/TODO_CONSOLIDATION.md` | aktiv | Konsolidierung alter TODOs ohne Loeschung | dieser Index, Alt-TODOs |
| `todolist/PROJECT_STRUCTURE.md` | aktiv | Datei- und Ordneruebersicht | gebaute Bereiche und Feature-Dateien |
| `todolist/DONE_LOG.md` | aktiv | erledigte Arbeiten | geaenderte Dateien und abgeschlossene Aufgaben |
| `todolist/ARCHITECTURE_RULES.md` | aktiv | Skalierbarkeit und kleine Dateien | Struktur- und Feature-Entscheidungen |
| `todolist/DATABASE_PLAN.md` | aktiv | Datenbankplanung | Missionen, Nutzer, KI-Buddy, Wallet, Gamification |
| `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md` | aktiv | lokale Anleitung zum Agentenlauf | Agent-Runbook, PowerShell-Skript |

## Alte Haupt-TODO-Dateien

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/A - MASTER-REGELN - STATUSSYSTEM` | aktiv / zu pruefen | Master-Regeln und Statussystem | `MASTER_PROMPT_FOR_AI.md` | Regeln uebernehmen, nicht loeschen |
| `todolist/B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT` | aktiv / Sprint | Login, Registrierung, Deployment | `NEXT_ACTIONS.md` | offene Sprint-Punkte abgleichen |
| `todolist/C - STRATEGISCHE GRUNDENTSCHEIDUNGEN` | aktiv / Strategie | strategische Produktentscheidungen | `MASTER_PROMPT_FOR_AI.md` | Entscheidungen referenzieren |
| `todolist/D - VERBINDLICHE REIHENFOLGE` | aktiv / Reihenfolge | verbindliche Arbeitsreihenfolge | `NEXT_ACTIONS.md` | Priorisierung abgleichen |
| `todolist/E - AKTUELLER UMSETZUNGSSTAND - VORHANDEN` | aktiv / Ist-Stand | vorhandene Umsetzung | `PROJECT_STRUCTURE.md` | Ist-Stand in Struktur uebernehmen |
| `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT | `NEXT_ACTIONS.md` | bereits teilweise uebernommen, weiter abgleichen |
| `todolist/README.md` | aktiv / Ueberblick | alter todolist-Ueberblick | `PROJECT_STRUCTURE.md` | pruefen und relevante Punkte uebernehmen |

## Code-Inventur / Bestandspruefung

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `scripts/wellfit-dev-agent/src/code-inventory.mjs` | aktiv / Agent-Code | scannt Code, Routen, Module und Logiktreffer | `PROJECT_STRUCTURE.md` | nach groesseren Codebloecken ausfuehren |
| `scripts/wellfit-dev-agent/output/code-inventory-report.md` | generiert / lokal | lokaler Code-Inventur-Report | Agent Output | nicht manuell pflegen |

## Chat-, Coder- und Agent-Startdateien

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/CHAT_START_PROMPT.md` | aktiv / zu pruefen | Chat-Start / Source-of-Truth Einstieg | `MASTER_PROMPT_FOR_AI.md` + `NEXT_CHAT_HANDOFF_PROMPT.md` | Inhalt pruefen und relevante Punkte uebernehmen |
| `todolist/CHAT_START_AGENT_AND_CODER_ADDENDUM.md` | aktiv | Regeln fuer Dev-Agent, Coder-Routing und Agentenlauf | `CODER_START_PROMPT.md` | als Pflichtdatei behalten |
| `todolist/AUTONOMOUS_ITERATION_MODE.md` | aktiv | Micro-Task-Modus und autonomes Iterieren | `MASTER_PROMPT_FOR_AI.md` | Regeln in Master-/Next-Actions beruecksichtigen |
| `todolist/CODER_START_PROMPT.md` | aktiv | Startprompt fuer GPT/GitHub-Coder | `MASTER_PROMPT_FOR_AI.md` | in neue Struktur referenzieren, nicht loeschen |
| `todolist/NEXT_CHAT_HANDOFF_PROMPT.md` | aktiv | Handoff fuer neuen Chat mit aktuellem WellFit-Stand | `MASTER_PROMPT_FOR_AI.md` | mit neuen Dateien ergaenzen |

## Bereichs-TODOs Mobile, AR, Buddy

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/H - MOBILE - AR - TRACKING - KI` | aktiv / Bereichs-TODO | Mobile, AR, Tracking, KI | Bereich Mobile/AR | pruefen und mit Next Actions verknuepfen |
| `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY` | aktiv / Bereichs-TODO | Native AR, ARCore, ARKit, Unity | Bereich Mobile/AR | pruefen und mit Alpha/Beta abgleichen |
| `todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` | aktiv / Bereichs-TODO | Buddy als AR-Begleiter und KI-Guide | Bereich KI-Buddy | pruefen und priorisieren |
| `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md` | aktiv / Bereichs-TODO | AR-Buddy, Companion und Avatar-Grundlogik | Bereich KI-Buddy / Avatar | pruefen und priorisieren |
| `todolist/J1 - ISSUE 8 AR-BUDDY MICRO-TASK LOG` | aktiv / Micro-Task-Log | AR-Buddy Micro-Tasks | Bereich KI-Buddy | offene Punkte uebernehmen |
| `todolist/J8.2 - AR BUDDY EVENT SECURITY ADDENDUM.md` | aktiv / Security | AR-Buddy Event Security | Bereich KI-Buddy / Security | mit Safety-Regeln abgleichen |
| `todolist/ROADMAP_BUDDY_PHASES_ADDENDUM` | aktiv / Roadmap | Buddy-Phasen | Bereich KI-Buddy | mit Beta-Roadmap abgleichen |

## Bereichs-TODOs Missionen, Maps, Rewards, Economy

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/F - FIREBASE  - REALTIME - MISSIONEN` | aktiv / Bereichs-TODO | Firebase, Realtime, Missionen | `DATABASE_PLAN.md` | Datenbankplan damit abgleichen |
| `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS` | aktiv / Bereichs-TODO | Reward-System, System Health, Mechanics | Bereich Reward/Gamification | pruefen, aber keine echten Token/Transfers |
| `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN` | aktiv / Bereichs-TODO | interne Punkteoekonomie vor Blockchain | Bereich Gamification | fuer Beta sehr wichtig |
| `todolist/J8.3 - AR RAETSELRALLYE REWARD ALGORITHMUS ADDENDUM.md` | aktiv / Reward | AR-Raetselrallye Reward-Algorithmus | Bereich Mission/Reward | mit Reward-Safety abgleichen |
| `todolist/J8.4 - MISSIONSTYPEN UND KI MISSION ENGINE ADDENDUM.md` | aktiv / Mission Engine | Missionstypen und KI Mission Engine | Bereich Mission/KI | priorisieren |
| `todolist/J8.4A - MISSION DRAFT SECURITY ADDENDUM.md` | aktiv / Mission Security | Mission Draft Security | Bereich Mission/KI | mit Backend-Safety abgleichen |
| `todolist/J8.4B - MISSION UI HISTORY FAVORITEN ADDENDUM.md` | aktiv / Mission UI | Mission UI, History, Favoriten | Bereich Mission/UI | mit AppShell abgleichen |
| `todolist/J8.4C - MISSION MAPS UND STANDORT HANDOFF.md` | aktiv / Standort | Mission Maps und Standort-Handoff | Bereich Mission/Location | Datenschutz beachten |

## Bereichs-TODOs AppShell, Dashboard, Website, Legal

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL` | aktiv / Bereichs-TODO | Business, Website, Partner, Legal | Bereich Website/Legal | fuer Investor/Website wichtig |
| `todolist/J8.4C - APPSHELL UND PRODUKTMODUL-SKALIERUNG ADDENDUM.md` | aktiv / AppShell | AppShell und Produktmodul-Skalierung | `ARCHITECTURE_RULES.md` | mit Modularitaet abgleichen |
| `todolist/J8.4D - LOCAL ENV UND BUILD SETUP ADDENDUM.md` | aktiv / Setup | lokale Umgebung und Build Setup | Build/DevOps | mit Agent-Runbook abgleichen |
| `todolist/J8.4E - PERSONALISIERBARES DASHBOARD UND PIN-CARDS.md` | aktiv / Dashboard | personalisierbares Dashboard, Pin-Cards | Bereich Dashboard | fuer Beta pruefen |
| `todolist/WF-DASH-PERSIST-001 - Dashboard Preferences lokal.md` | aktiv / Dashboard | lokale Dashboard Preferences | Bereich Dashboard | ggf. in NEXT_ACTIONS aufnehmen |
| `todolist/LAST_BUILD_STATUS.md` | aktiv / Status | letzter Buildstatus | `DONE_LOG.md` | fortlaufend referenzieren |

## Status-Dateien

Status-Dateien sind historische Nachweise und Build-/Emulator-/PM2-/Test-Logs. Sie werden indexiert, aber nicht jede einzelne Status-Datei braucht einen eigenen KI-Fortsetzungs-Prompt.

| Bereich | Status | Pfad / Dateien | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| Challenge Buddy Consistency | erledigt / sichtbar OK | `todolist/status/2026-05-12-challenge-buddy-consistency-ok.md` | `todolist/status/2026-05-12-challenge-economy-path-prepared.md` | Nachweis fuer Challenge/Dashboard/Buddy-Konsistenz behalten |
| Challenge Economy Path | umgesetzt / Build offen | `todolist/status/2026-05-12-challenge-economy-path-prepared.md` | `app/missionen/challenge/**`, `app/api/economy/**` | Nachweis fuer Challenge-Economy-Pfad behalten |
| Roadmap-Konsolidierung | erledigt / Nachweis | `todolist/status/2026-05-12-roadmap-consolidation-master-upload-done.md` | `todolist/PROJECT_STRUCTURE.md`, `todolist/CODEBASE_FEATURE_MAP.md` | Nachweis fuer Master-Roadmap-Upload-Abgleich behalten |
| Beta-Reihenfolge | aktiv / verbindlich | `todolist/status/2026-05-12-beta-order-and-megablock-priority-confirmed.md` | `todolist/MASTER_OPEN_DONE_LIST.md` | Reihenfolge fuer Megabloecke, KI-Buddy, Beta und spaetere NFT-Themen behalten |
| Points Shop Paid Points | aktiv / Backlog nicht aktiv | `todolist/status/2026-05-12-points-shop-paid-points-backlog-not-active.md` | `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md`, `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md` | als Backlog-Nachweis behalten; keine echten Kaeufe vor Beta |
| WWW Domain | aktiv / Live OK | `todolist/status/2026-05-10-www-domain-live-ok.md` | `todolist/LAST_BUILD_STATUS.md` | als Domain-Nachweis behalten |
| User Projection API | aktiv / Build OK | `todolist/status/2026-05-10-user-projection-api-build-ok.md` | `todolist/LAST_BUILD_STATUS.md` | als Build-Nachweis behalten |
| User Projection API | aktiv / Live+Lokal OK | `todolist/status/2026-05-10-user-projection-api-live-local-ok.md` | `todolist/LAST_BUILD_STATUS.md` | als API-Testnachweis behalten |
| Firestore Economy Emulator | aktiv / PASS | `todolist/status/2026-05-10-firestore-economy-emulator-pass.md` | `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` | als lokalen Emulator-Nachweis behalten |
| Firestore Economy Rules | aktiv / Guardrail | `todolist/status/2026-05-10-firestore-economy-rules-guardrail-check-prepared.md` | `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` | Nachweis fuer Mega-Block 23 behalten |
| Mobile / Wettkaempfe | historisch | `todolist/status/2026-04-26-mobile-wettkaempfe-http-200-ok.md` | `DONE_LOG.md` | als Nachweis behalten |
| Reward Preview / Build / PM2 | historisch | `todolist/status/2026-04-26-reward-preview-build-pm2-ok.md` | `DONE_LOG.md` | als Nachweis behalten |
| AR Event Contract | historisch | `todolist/status/2026-04-27-ar-event-contract-prepared.md` | `DONE_LOG.md` | als Nachweis behalten |
| Security / Reward Status | historisch | `todolist/status/2026-04-27-consolidated-security-reward-status.md` | `DONE_LOG.md` | als Nachweis behalten |
| Cooldown Tests | historisch | `todolist/status/2026-04-27-cooldown-callable-emulator-ok.md`, `todolist/status/2026-04-27-cooldown-callable-full-emulator-ok.md`, `todolist/status/2026-04-27-cooldown-helper-test-ok.md`, `todolist/status/2026-04-27-stufe-1-cooldown-full-emulator-ok.md` | `DONE_LOG.md` | als Nachweis behalten |
| Foundation / Unity Plan | historisch | `todolist/status/2026-04-27-foundation-roadmap-stufe-1-2-3-unity-plan.md`, `todolist/status/2026-04-27-ki-buddy-unity-ar-repo-prep.md` | `NEXT_ACTIONS.md` | mit Buddy-Roadmap abgleichen |
| Mission Evidence / Pattern / NFC | historisch | `todolist/status/2026-04-27-mission-evidence-review-emulator-ok.md`, `todolist/status/2026-04-27-mission-pattern-review-emulator-ok.md`, `todolist/status/2026-04-27-nfc-transactional-claims-emulator-ok.md` | `DONE_LOG.md` | als Nachweis behalten |
| Pattern Review Serie | historisch | `todolist/status/2026-04-27-pattern-review-emulator-confirmed-after-restart.md`, `todolist/status/2026-04-27-pattern-review-emulator-retest-confirmed.md`, `todolist/status/2026-04-27-pattern-review-emulator-suite-ok.md`, `todolist/status/2026-04-27-pattern-review-http200-log-recheck-needed.md`, `todolist/status/2026-04-27-pattern-review-pm2-single-instance-pending-http.md`, `todolist/status/2026-04-27-pattern-review-production-ok.md`, `todolist/status/2026-04-27-pattern-review-retest-ok.md`, `todolist/status/2026-04-27-pattern-review-test-run-0904-ok.md` | `DONE_LOG.md` | als Nachweis behalten |
| PM2 / Server / Roadmap | historisch | `todolist/status/2026-04-27-pm2-online-ready.md`, `todolist/status/2026-04-27-roadmap-consolidation-build-pm2-ok.md`, `todolist/status/2026-04-27-server-stabilized-http-200-clean-logs.md` | `DONE_LOG.md` | als Nachweis behalten |
| Proof Quality / Reward Preview v3 | historisch | `todolist/status/2026-04-27-proof-quality-dampening-emulator-ok.md`, `todolist/status/2026-04-27-reward-preview-v3-system-reserve-emulator-ok.md`, `todolist/status/2026-04-27-reward-preview-v3-system-safety-caps-emulator-ok.md`, `todolist/status/2026-04-27-stufe-1-rewardpreview-v3-retest-ok.md` | `DONE_LOG.md` | als Nachweis behalten |

## Architektur- und Sicherheitsdokumente

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md` | aktiv / fuehrend | sauberer Web-Beta-Restpfad mit 12-14 Mega-Bloecken, ohne Buddy AR / Unity | Web-Beta-Restpfad | fuehrend fuer weitere Beta-Arbeit nutzen |
| `docs/architecture/WELLFIT_SITE_QUALITY_AUDIT_AGENT.md` | aktiv | Site-Quality-Audit-Agent fuer Routen-, Seitenqualitaets- und Nebenseitenpruefung | Agentenstrategie / Site QA | nach sichtbaren Website-/Routen-Aenderungen nutzen |
| `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md` | aktiv | Alpha-Scope und Fokus | `NEXT_ACTIONS.md` | als Prioritaetsquelle nutzen |
| `docs/architecture/WELLFIT_NEXT_PHASE_PREP_REPORT.md` | aktiv / Baseline-Report | Vorbereitung der naechsten WellFit-Phase, Shell-/Routen-/Unity-Inventur und Build-Hinweise nach PR #41-#43 | `todolist/LAST_BUILD_STATUS.md` | als historischen Vorbereitungsbericht behalten; aktuellen gruenen Baseline-Stand in `LAST_BUILD_STATUS.md` fuehren |
| `docs/architecture/STUFE_4_GOVERNANCE_BIS_G_ABSCHLUSS.md` | aktiv / Checkpoint | Stufe-4-Governance-Abschlussstand B-G, Quality-Gate-Pruefungen und Sicherheitsgrenzen | Agentenstrategie / Governance | vor groesseren Aenderungen als Governance-Anker nutzen |
| `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md` | aktiv | Self-hosted Dev-Agent Architektur | Agentenstrategie | fuer Automatisierung nutzen |
| `docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` | aktiv / zu pruefen | spaeterer Nutzeranalyse-/Mission-Agent | Bereich Mission/KI | nach Beta weiterfuehren |
| `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` | aktiv / zu pruefen | Mission-/Reward-Kontextlogik | Missionen/Reward | mit Datenbankplan abgleichen |
| `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md` | aktiv / Economy Guardrails | interne Punkte-/XP-/Reward-Leitplanken vor Blockchain | Economy/Reward | fuehrend fuer Beta-Economy-Regeln |
| `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md` | aktiv / Ledger und Abrechnung | internes Punkte-/XP-/Reward-Ledger vor Tokenisierung | Economy/Reward/Backend | fuehrend fuer interne Abrechnung |
| `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` | aktiv / Security | Server-Completion-Plan und Firestore-Haertung fuer interne Punkte, XP, Level, Avatar und Mission Completion | Backend/Economy | fuehrend fuer naechsten Server-Completion-Block |
| `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` | aktiv / Testplan | Firestore Economy Rules Haertung, DENY/ALLOW Emulator-Stufen und Client-Write-Migration | Backend/Economy/QA | vor harter Rules-Aenderung nutzen |
| `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` | aktiv / Privacy Guardrails | Health-, Watch-, Kamera-, AR-, Standort- und Kinder-/Jugenddaten | Datenschutz/Safety | fuehrend fuer sensible Daten und Berechtigungen |
| `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md` | aktiv / Checkpoint Safety | sichere echte Orte, verbotene Orte, 20-Meter-Radius und Standortplatzierung | Mission/Location/Safety | fuehrend fuer Checkpoint-Erzeugung nutzen |
| `docs/architecture/COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` | aktiv / Competition Stakes | interne Duell-Einsaetze, Punkte-/Item-Locks, keine echten Wetten/Auszahlungen | Wettkaempfe/Economy/Safety | fuehrend fuer Wettkampf-Einsaetze nutzen |
| `docs/architecture/AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` | aktiv / Avatar Competition | Avatar-Duelle, seltene interne Items, Excalibur/Fairness, keine NFT/Token | Avatar/Wettkaempfe/Items/Safety | fuehrend fuer Avatar-Duelle und Rare Items nutzen |
| `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md` | aktiv / Blockchain Backlog | Token/WFT/NFT erst nach stabilem internem Punkte- und Abrechnungssystem | Blockchain/Token | fuehrend fuer spaetere Token-Migration |
| `docs/architecture/AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md` | aktiv / Security | AR-Raetsel Firestore Security | Backend/Security | mit Coder 2 abgleichen |
| `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md` | aktiv / Security | Refactor gegen Client-Write bei User Points | Backend/Security | fuer Beta wichtig |
| `docs/architecture/AR_REWARD_LEDGER_EVENT.md` | aktiv / Reward Ledger | AR-Reward-Ledger-Event | Backend/Reward | mit Coder 2 und Punkte-Ledger abgleichen |
| `docs/architecture/AR_RIDDLE_EMULATOR_TEST_PLAN.md` | aktiv / Testplan | AR-Riddle Emulator-Testplan | Backend/QA | mit Emulator-/QA-Tasks abgleichen |
| `docs/architecture/BUDDY_KI_MODEL_PROVIDER_RUNBOOK.md` | aktiv / Runbook | Buddy-KI Modellprovider | Buddy-KI/Backend | keine Frontend-Secrets, Provider sauber testen |
| `docs/architecture/MISSION_DRAFT_EMULATOR_TEST_PLAN.md` | aktiv / Testplan | Mission-Draft Emulator-Testplan | Mission/QA | mit Coder 2 abgleichen |
| `docs/architecture/MISSION_DRAFT_FIRESTORE_RULES_DRAFT.md` | aktiv / Security | Mission-Draft Firestore Rules Draft | Backend/Security | reviewpflichtig |
| `docs/architecture/MISSION_DRAFT_PREVIEW_API.md` | aktiv / API | Mission-Draft Preview API | Backend/Mission | reviewpflichtig |
| `docs/architecture/MISSION_DRAFT_SECURITY_PLAN.md` | aktiv / Security | Mission-Draft Security Plan | Backend/Security | reviewpflichtig |
| `docs/architecture/MISSION_HISTORY_FAVORITES_SIDEQUESTS.md` | aktiv / Mission UI | Mission History, Favorites, Sidequests | Mission/UI | mit AppShell abgleichen |
| `docs/architecture/USER_ECONOMY_WRITE_SEARCH_NOTES.md` | aktiv / Security Notes | User Economy Write Search Notes | Backend/Economy | mit Client-Write-Refactor abgleichen |
| `docs/architecture/USER_FEEDBACK_DATABASE_FLOW.md` | aktiv / Feedback Privacy Architecture | Datenschutzsicherer Datenbank-Flow fuer User-Feedback, Aggregation und Agent-Auswertung ohne Live-Tracking | `project-register/user-feedback.json` | vor Feedback-API, Firestore-Writes oder Agent-Auswertung lesen; keine Rohdaten in Agentenreports |
| `project-register/user-feedback.json` | aktiv / maschinenlesbares Register | Machine-readable Feedback-Datenbankplan mit erlaubten/verbotenen Feldern, Consent, Retention, Summary-Format und API-Vorschlag | `docs/architecture/USER_FEEDBACK_DATABASE_FLOW.md` | bei Feedback-Datenmodell- oder API-Planung synchron halten |
| `project-register/internal-sources.json` | aktiv / maschinenlesbares Register | Machine-readable Internal-Source-to-Implementation-Map fuer Konzeptgruppen, vorhandene Repo-Bereiche, Luecken, Do-not-duplicate-Warnungen und sichere Fortsetzungsorte | `docs/architecture/WELLFIT_INTERNAL_SOURCE_MAP.md`, `todolist/WORK_MAP.md` | vor Konzept-/Quellen-getriebener Featureplanung lesen und synchron halten |
| `docs/architecture/WELLFIT_INTERNAL_SOURCE_MAP.md` | aktiv / Architektur-Erklaerung | Human-readable Erklaerung zur Internal-Source-Registry und Nutzung durch kuenftige Agenten | `project-register/internal-sources.json` | bei Aenderungen an der Registry synchron halten |

## Agenten-Modi und Workflows

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/agent-task-queue.json` | aktiv / maschinenlesbares Register | Agenten-Aufgabenwarteschlange mit Prioritaet, Risiko, erlaubten/verbotenen Dateien, First-Reads, Checks, PR-Ausgabe und Stop-Bedingungen | `AGENTS.md`, `project-register/agent-workflows.json`, `todolist/WORK_MAP.md` | vor autonomer Task-Auswahl lesen |
| `project-register/definition-of-done.json` | aktiv / maschinenlesbares Register | Definition-of-Done-Kriterien fuer Dokumentation, Registry, UI, API, Mission, Buddy/KI, Firebase/Backend, Feedback/Analytics, Unity/AR-Planung und compliance-sensitive Planung | `AGENTS.md`, `project-register/agent-workflows.json` | passenden Done-Key vor Umsetzung waehlen |
| `project-register/risk-classifier.json` | aktiv / maschinenlesbares Register | Risikoklassifikation, geschuetzte Bereiche, automatische Stop-Regeln, Planning-only-Regeln und Freigabepflichten fuer Agenten | `AGENTS.md`, `project-register/agent-workflows.json` | vor jeder neuen Aufgabe klassifizieren |
| `docs/architecture/WELLFIT_AGENT_EXECUTION_CONTROLS.md` | aktiv / Architektur-Erklaerung | Human-readable Erklaerung der Agent Task Queue, Definition of Done und Risk Classifier Controls | `project-register/agent-task-queue.json`, `project-register/definition-of-done.json`, `project-register/risk-classifier.json` | bei Aenderungen an den Agent-Control-Registern synchron halten |
| `docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md` | aktiv / Architektur-Erklaerung | Agenten-Memory-Loop fuer Start, sichere Task-Auswahl, Work-Log, TODO-Marker, Follow-ups und Human-Approval-Stops | `AGENTS.md`, `todolist/WORK_MAP.md`, `project-register/agent-workflows.json` | vor autonomen Agentenlaeufen lesen und synchron halten |
| `docs/architecture/WELLFIT_PRODUCT_READINESS_MATRIX.md` | aktiv / Produktbereitschaft | human-readable Produktbereitschafts-Matrix mit Research-Fallback-Regel und Modulstatus-Erklaerung | `project-register/product-readiness.json`, `todolist/WORK_MAP.md` | vor Modulstatus-/Readiness-Aenderungen lesen |
| `docs/architecture/WELLFIT_DRIFT_AND_GAP_ANALYSIS.md` | aktiv / Agent Governance | Route/API-Drift-Detector und Concept-to-Code-Gap-Analyzer Regeln, Warning-/Fail-Grenzen und Registry-only Follow-up-Pfad | `project-register/agent-workflows.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | bei Aenderungen an Drift-/Gap-Detektoren synchron halten |
| `project-register/agent-work-log.json` | aktiv / maschinenlesbares Register | Append-only Agenten-Arbeitslog mit Schema fuer Task-ID, Status, PR, geaenderte Dateien, Checks, Follow-ups und naechste Empfehlung | `docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md`, `project-register/agent-workflows.json` | nach Agentenlaeufen als Handoff-Protokoll pflegen |
| `project-register/agent-follow-ups.json` | aktiv / maschinenlesbares Register | Follow-up-Kategorien, Risk-Mapping, Review-Regeln, Beispiele und leeres Entries-Array fuer kuenftige Agenten-Follow-ups | `docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md`, `project-register/agent-workflows.json` | nach PR-/Task-Abschluss fuer Follow-up-Handoff nutzen |
| `agents/modes/stufe-4-autonomous-development.md` | aktiv / Stufe-4-Workflow | human-readable autonomer Entwicklungsworkflow mit Phasen, Safety-Gates, PR-/Preview-Grenzen und Pflichtchecks | `project-register/agent-workflows.json` | vor neuer Stufe-4-Featurearbeit lesen und befolgen |
| `project-register/product-readiness.json` | aktiv / maschinenlesbares Register | Produktbereitschafts-Matrix fuer Modulstatus, Risiko, fuehrende Dateien, Blocker, sichere naechste Aufgaben, Checks und Human Approval | `docs/architecture/WELLFIT_PRODUCT_READINESS_MATRIX.md`, `todolist/WORK_MAP.md` | bei Modulstatus-Aenderungen synchron halten |
| `project-register/agent-workflows.json` | aktiv / maschinenlesbares Register | maschinenlesbarer Stufe-4-Agentenworkflow, Pflichtdateien, Phasen, Autonomiegrenzen und Checks | `agents/modes/stufe-4-autonomous-development.md` | bei Workflow-Aenderungen synchron halten |

## Dev-Agent Dateien

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `scripts/wellfit-dev-agent/README.md` | aktiv | Dev-Agent Doku | Agentenstrategie | Agent zuerst dry-run, spaeter Schreibmodus |
| `scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md` | aktiv | wann Agent-Befehle laufen | Agentenstrategie | nach TODO-Aenderungen ausfuehren |
| `scripts/wellfit-dev-agent/wellfit-agent.config.json` | aktiv | Agent-Konfiguration, Source-of-Truth, Rollen, No-Delete-Policy | Agentenstrategie | bei neuen Source-Dateien aktualisieren |
| `scripts/wellfit-dev-agent/NEW_CODER_ENTRY_MESSAGE.md` | aktiv | Einstiegsnachricht fuer neue Coder | Coder-Start | behalten |
| `scripts/wellfit-dev-agent/coder-registry.schema.md` | aktiv | Schema fuer Coder-Registry | Agentenstrategie | behalten |
| `scripts/wellfit-dev-agent/pr-template.md` | aktiv | PR-Vorlage | Agentenstrategie | bei PR-Modus nutzen |
| `scripts/wellfit-dev-agent/safety-checklist.md` | aktiv | Safety-Checkliste | Agentenstrategie | vor riskanten Tasks nutzen |
| `scripts/wellfit-dev-agent/src/validate-agent-config.mjs` | aktiv / Code | validiert Agent-Konfiguration | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/alpha-goal-check.mjs` | aktiv / Code | prueft Alpha-Zielkurs | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/generate-coder-prompts.mjs` | aktiv / Code | erzeugt Coder-Prompts | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/dry-run.mjs` | aktiv / Code | erzeugt Dry-Run-Report | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/memory-sync.mjs` | aktiv / Code | erzeugt Memory-Sync-Report | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/code-inventory.mjs` | aktiv / Code | erzeugt Code-Inventur-Report gegen Doppelarbeit | Agent-Code | nach groesseren Codebloecken ausfuehren |
| `scripts/wellfit-dev-agent/src/site-quality-audit.mjs` | aktiv / Code | crawlt/prueft Site-Qualitaet, Routen und sichtbare Seitenqualitaet | Agent-Code / Site QA | nach sichtbaren Website-/Routen Aenderungen ausfuehren |
| `scripts/wellfit-dev-agent/src/firestore-economy-rules-check.mjs` | aktiv / Code | prueft statisch die Firestore-Economy-Rules-Guardrails | Agent-Code / Firestore QA | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/apply-memory-prompts.mjs` | aktiv / Code | ergaenzt KI-Fortsetzungs-Prompts kontrolliert | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/agent-governance-control-check.mjs` | aktiv / Code | validiert Agent-Control-Register, Risk Classifier, Definition of Done, Task Queue sowie TODO_INDEX-/WORK_MAP-Verweise | `project-register/agent-task-queue.json`, `project-register/definition-of-done.json`, `project-register/risk-classifier.json` | wird durch Quality Gate ausgefuehrt |
| `scripts/wellfit-dev-agent/src/product-readiness-check.mjs` | aktiv / Code | validiert die Produktbereitschafts-Matrix, Pflichtmodule und geschuetzte Statusregeln | `project-register/product-readiness.json` | wird durch Quality Gate ausgefuehrt |
| `scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs` | aktiv / Code | scannt `app/**/page.tsx` und `app/**/route.ts` gegen Routen-/API-/Feature-/Readiness-Register und meldet Drift ohne Rewrite | `project-register/routes.json`, `project-register/apis.json`, `project-register/features.json`, `project-register/product-readiness.json` | wird durch Quality Gate ausgefuehrt; High-/Critical-Warnungen nicht automatisch fixen |
| `scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs` | aktiv / Code | prueft Internal-Source-Konzeptgruppen gegen Work Map und Product Readiness, meldet Mapping-Luecken und Duplicate-Architektur-Risiken ohne Rewrite | `project-register/internal-sources.json`, `todolist/WORK_MAP.md`, `project-register/product-readiness.json` | wird durch Quality Gate ausgefuehrt; Konzeptluecken registry-only nachziehen |
| `scripts/wellfit-dev-agent/src/quality-gate.mjs` | aktiv / Code | fuehrt Kontrollkette inklusive Drift-/Gap-Detektoren, Agent-Governance-Control-Check, Firestore-Economy-Rules-Check, Next-Task-Picker und TODO-Status-Sync aus und entscheidet PASS/FAIL | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs` | aktiv / Code | liest Agent Task Queue, Risk Classifier, Definition of Done, Current State und Work Map und schlaegt den sichersten nicht-blockierten Task vor | `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json` | vor autonomer Task-Auswahl ausfuehren |
| `scripts/wellfit-dev-agent/src/follow-up-detector.mjs` | aktiv / Code | erkennt Follow-up-Kategorien aus Work Map, Current State, Task Queue und optionalen Internal-Source-/Feedback-Registern report-only | `project-register/agent-follow-ups.json`, `project-register/risk-classifier.json` | nach PR-/Task-Arbeit und im Quality Gate ausfuehren |
| `scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs` | aktiv / Code | validiert PR-Outcome-Daten im Dry-Run und definiert lokales Append-Format fuer `agent-work-log.json` | `project-register/agent-work-log.json`, `docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md` | nach PR-Abschluss dry-run nutzen; Schreibmodus nur mit explizitem Flag |
| `scripts/wellfit-dev-agent/src/todo-status-sync.mjs` | aktiv / Code | validiert TODO-Statusmarker und meldet fehlende Fuehrungsdatei-Links in NEXT_ACTIONS/TODO_INDEX ohne Rewrite | `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md` | nach TODO-Aenderungen und im Quality Gate ausfuehren |

## Querverweis-Regel
Jede wichtige TODO-Datei soll enthalten:
- Link zur fuehrenden Datei
- Link zu verwandten TODOs
- Link zu betroffenen Code-Dateien
- KI-Fortsetzungs-Prompt
- Status: offen, in Arbeit, erledigt, duplikat, veraltet oder zu pruefen

## Uebernahme-Regel aus Alt-TODOs
Wenn neue zentrale TODO-Dateien angelegt werden, muessen relevante Inhalte aus alten TODO-Dateien uebernommen oder zumindest hier verlinkt werden. Keine Alt-Datei darf ignoriert werden.

## KI-Fortsetzungs-Prompt
Lies diesen Index zuerst, wenn du mit TODOs arbeitest. Suche danach alle TODO-Dateien im Repository. Ergaenze gefundene Dateien in diesem Index. Uebertrage wichtige offene Aufgaben nach `NEXT_ACTIONS.md`. Loesche keine TODO-Dateien. Markiere doppelte oder veraltete Inhalte nur und setze Verweise auf die fuehrende Datei.

## Codebase Feature Map

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|
| `todolist/CODEBASE_FEATURE_MAP.md` | aktiv | Bestandskarte vorhandener Codebereiche gegen Doppelarbeit | `MASTER_OPEN_DONE_LIST.md` | vor grossen Codebloecken pruefen |

