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
| `todolist/MASTER_PROMPT_FOR_AI.md` | aktiv | zentrale Arbeitsanweisung fuer KI/Codex | `NEXT_ACTIONS.md`, `PROJECT_STRUCTURE.md`, `TODO_CONSOLIDATION.md`, `TODO_INDEX.md` |
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
| `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` | aktiv / Roadmap | naechste empfohlene Arbeit | `NEXT_ACTIONS.md` | bereits teilweise uebernommen, weiter abgleichen |
| `todolist/README.md` | aktiv / Ueberblick | alter todolist-Ueberblick | `PROJECT_STRUCTURE.md` | pruefen und relevante Punkte uebernehmen |

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
| `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md` | aktiv | Alpha-Scope und Fokus | `NEXT_ACTIONS.md` | als Prioritaetsquelle nutzen |
| `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md` | aktiv | Self-hosted Dev-Agent Architektur | Agentenstrategie | fuer Automatisierung nutzen |
| `docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` | aktiv / zu pruefen | spaeterer Nutzeranalyse-/Mission-Agent | Bereich Mission/KI | nach Beta weiterfuehren |
| `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` | aktiv / zu pruefen | Mission-/Reward-Kontextlogik | Missionen/Reward | mit Datenbankplan abgleichen |
| `docs/architecture/AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md` | aktiv / Security | AR-Raetsel Firestore Security | Backend/Security | mit Coder 2 abgleichen |
| `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md` | aktiv / Security | Refactor gegen Client-Write bei User Points | Backend/Security | fuer Beta wichtig |

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
| `scripts/wellfit-dev-agent/src/apply-memory-prompts.mjs` | aktiv / Code | ergaenzt KI-Fortsetzungs-Prompts kontrolliert | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/quality-gate.mjs` | aktiv / Code | fuehrt Agent-Kontrollkette aus und entscheidet PASS/FAIL | Agent-Code | keine KI-Prompt-Pflicht |

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
