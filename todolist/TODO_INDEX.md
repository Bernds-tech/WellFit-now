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
| `todolist/DATABASE_PLAN.md` | aktiv | Datenbankplanung inkl. Register/User/Profile/Settings-Schema-Baseline, Consent-/KI-Feldgrenzen und Duplicate-/Wrong-Field-Risiken | Missionen, Nutzer, KI-Buddy, Wallet, Gamification, Auth / Profil |
| `todolist/LOCAL_AGENT_RUN_INSTRUCTIONS.md` | aktiv | lokale Anleitung zum Agentenlauf | Agent-Runbook, PowerShell-Skript |
| `README.md` | aktiv / Setup | fuehrende Root-Setup-Dokumentation fuer lokale Entwicklung, Env-Variablen, Firebase-CI-Build-Verhalten und sichere Agenten-Grenzen; bei Setup-/Env-Doku-Aenderungen synchron halten und keine Runtime-Konfiguration aendern | `todolist/J8.4D - LOCAL ENV UND BUILD SETUP ADDENDUM.md`, `WORK_MAP.md` |
| `.env.example` | aktiv / Env-Vorlage |
| `docs/beta/AGENT_ADMIN_PHASE1_AND_AT_CLOSED_BETA_PLAN.md` | aktiv / Plan | stufenplan fuer Agent-Admin Phase 1, Rollen/Audit-Gap, Pilot-Readiness und AT Closed Beta 25-50 | `todolist/NEXT_ACTIONS.md`, `project-register/progress-log.json` |
 committete Platzhalter-Vorlage fuer Firebase-Web-App-Variablen und optionale serverseitige Buddy-KI-Provider-Keys; keine echten Secrets oder Projektwerte eintragen, `.env.local` bleibt uncommitted | `README.md`, `todolist/J8.4D - LOCAL ENV UND BUILD SETUP ADDENDUM.md` |

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



## Cross-Reference Maintenance / Agent-System Analysis

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/cross-reference-maintenance.json` | aktiv / Register | maschinenlesbares Cross-Reference-Maintenance-Register mit Change-Kategorien, Pflicht-Inspect-Dateien, Update-Zielen, Forbidden-Auto-Updates, Human-Review-Regeln, Validierungen und Beispielen | `todolist/WORK_MAP.md`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json` | nach jeder Agent-/Governance-/Route-/API-/Modul-/Roadmap-/Feedback-/Insight-/Visual-/Unity-/Compliance-Aenderung passende Kategorien pruefen und synchron halten |
| `docs/architecture/WELLFIT_AGENT_SYSTEM_ANALYSIS.md` | aktiv / Architektur-Analyse | aktueller Agent-/Autopilot-/Governance-Systembericht mit Memory-Dateien, Task-Auswahl, Loop-Guards, Validation Scripts, Register-Familien, Schutzbereichen und Autopilot-Grenzen | `project-register/cross-reference-maintenance.json` | vor groesseren Agent-Governance-Aenderungen lesen; nicht als Ersatz fuer AGENTS.md oder Work Map verwenden |
| `docs/architecture/WELLFIT_CROSS_REFERENCE_MAINTENANCE.md` | aktiv / Agent Governance | human-readable Runbook fuer Cross-Reference-Maintenance-Agent und PR-Berichtspflichten | `project-register/cross-reference-maintenance.json` | bei kuenftigen PRs als Checkliste fuer Cross-Reference-Updates nutzen |
| `scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs` | aktiv / Agent-Code | validiert Cross-Reference-Register, Pflichtkategorien, referenzierte Dateien, Work-Map-/TODO-Index-Verweise und Major-Register-Coverage | `project-register/cross-reference-maintenance.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt nach Cross-Reference-/Governance-Aenderungen ausfuehren; im Quality Gate eingebunden |


## Website Agent Framework / Website Readiness

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/website-agents.json` | aktiv / Register | maschinenlesbares Website-Agentenregister fuer Website Completion, Route-/Link-Integritaet, Mobile First, Visual Regression, Content, Trust/Compliance, Conversion, SEO, Waitlist, Investor, Analytics/Experiment und Self-Improving-Planung | `docs/architecture/WELLFIT_WEBSITE_AGENT_FRAMEWORK.md` | vor Website-Readiness-Arbeit lesen; report-only, keine Runtime-/Legal-/Tracking-/Reward-/Payment-/Token-/Unity-Aenderungen |
| `project-register/website-readiness.json` | aktiv / Register | maschinenlesbare Readiness-Matrix fuer Public Pages, Legal Pages, Desktop-Beta, Mobile/PWA und protected/review-required Routen | `project-register/website-agents.json`, `project-register/routes.json`, `project-register/product-readiness.json` | bei Website-Baseline-Audits aktualisieren; geschuetzte Themen `review_required` halten |
| `docs/architecture/WELLFIT_WEBSITE_AGENT_FRAMEWORK.md` | aktiv / Architektur-Notiz | human-readable Runbook fuer das Website Agent Framework, Route-Gruppen, Readiness-Reports, Schutzthemen und Anschluss an bestehende Governance | `project-register/website-agents.json`, `project-register/website-readiness.json` | keine parallele Website-Architektur anlegen; vor kuenftigen Website-Agenten lesen |
| `scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs` | aktiv / Agent-Code | report-only Validator fuer Website-Agenten, Website-Readiness, routes.json-Abgleich, Work-Map-/TODO-Index-Verweise und No-Runtime-/No-Merge-/No-Repair-/No-Deploy-Grenzen | `project-register/website-agents.json`, `project-register/website-readiness.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt nach Website-Governance-Aenderungen ausfuehren; im Quality Gate eingebunden |
| `project-register/website-agent-backlog.json` | aktiv / Register | maschinenlesbarer Website-Agent-Backlog fuer Findings, Route Issues, Conversion-/Content-/SEO-Gaps, Trust/Compliance-Review, Mobile/PWA-Evidence, blocked Items, Follow-ups und naechste sichere Tasks | `project-register/website-agents.json`, `project-register/website-readiness.json`, `docs/architecture/WELLFIT_WEBSITE_AGENT_BACKLOG.md` | bei Website-Baseline- und fokussierten Website-Agent-Audits als Findings-Register nutzen; protected Topics `review_required` lassen |
| `docs/architecture/WELLFIT_WEBSITE_AGENT_BACKLOG.md` | aktiv / Architektur-Notiz | human-readable Runbook fuer Website-Agent-Backlog, Findings-Erfassung, Readiness-Mapping, Task-Queue-Uebergabe, Review-required-Erhalt und Mobile/PWA-Evidence | `project-register/website-agent-backlog.json`, `scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs` | vor Website-Findings-/Baseline-Audits lesen; keine Runtime-Aenderungen aus dem Backlog ableiten |
| `scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs` | aktiv / Agent-Code | report-only Validator fuer Website-Agent-Backlog-Schema, Source-Agent-Abgleich, Route-/Readiness-Mapping, Human-Review-Regeln und Work-Map-/TODO-Index-Verweise | `project-register/website-agent-backlog.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | nach Backlog-/Findings-Aenderungen ausfuehren; im Quality Gate report-only eingebunden |



## Agent Catalog and Approved Agent Build Backlog

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `docs/architecture/WELLFIT_AGENT_OS_AUTONOMY_LEVELS.md` | aktiv / Agent Governance | human-readable Autonomie-Level-Policy fuer Agent OS Level 0-5, aktuelle Stufe 2, naechste freigabefaehige Stufe 3 und Runtime-Authority-Prerequisites | `project-register/agent-control-center.json`, `project-register/agent-catalog.json` | bei Agent-OS-/Control-Center-Aenderungen synchron halten; `runtimeAuthorityGranted=false` bis serverseitige Rollenpruefung, Audit-Log, exakte Allowlist und Stop-Bedingungen vorhanden sind |
| `project-register/agent-catalog.json` | aktiv / Register / report_only | maschinenlesbarer Katalog bestehender WellFit-Agenten/Frameworks mit Owner-Bereich, primaeren Registern, Docs, Validatoren, Quality-Gate-Status, Related Agents/Registers, erlaubten Extension-Typen, Proposal-Pflichten und Protected Boundaries | `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md`, `project-register/agent-extension-policy.json` | vor Agent-/Framework-Erweiterungen lesen; bestehende Owner erweitern statt Parallelarchitektur anlegen |
| `project-register/approved-agent-build-backlog.json` | aktiv / Register / approved_planning_backlog | maschinenlesbarer Backlog human-approved kuenftiger Agenten/Frameworks mit Prioritaet, Risiko, connectedAgents/-Registers, Pflichtoutputs, Allowed/Forbidden Files, Build-Reihenfolge und Human-Approval-Pflicht | `project-register/agent-catalog.json`, `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md` | kuenftige Agenten einzeln und report-only zuerst bauen; Backlog-Eintrag erzeugt keine Agenten automatisch |
| `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md` | aktiv / Agent Governance | human-readable Runbook fuer Agent-Katalog, Approved Build Backlog, Extension-vs-New-Agent-Entscheidung, Connected-Count-Regeln, Built-Status, Protected-Scope-Stops und autonome Kontrolle | `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json` | bei Agent-Katalog-/Backlog-Aenderungen synchron halten |
| `scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs` | aktiv / Code | report-only Validator fuer Katalog-/Backlog-Top-Level-Felder, Pflichtentries, Entry-Felder, Human-Approval-Regeln, Connected Counts, High/Critical-not-built-Regel und Work-Map-/TODO-Index-Verweise | `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; schreibt nur `scripts/wellfit-dev-agent/output/agent-catalog-backlog-report.md` |
| `project-register/agent-build-runner-state.json` | aktiv / Register / report_only | Phase-1-Statussync fuer bereits gebaute approved report-only Agenten; dokumentiert, dass Human Motivation Engine, Ethical Engagement Guard, Adaptive Difficulty Agent und Multisensory Learning Engine als `built` synchronisiert wurden, ohne neue Agenten oder Runtime-Systeme zu bauen | `project-register/approved-agent-build-backlog.json`, `project-register/agent-build-proposals.json`, `project-register/continuity-dependency-map.json` | nach Status-Sync-PR als Evidenz fuer den naechsten genau-ein-Agent-Loop-Schritt lesen; keine Auto-Merge-/Auto-Repair-/Deploy-Autoritaet |

## Agent Architect & Proposal Agent

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/agent-architect-policy.json` | aktiv / Register / report_only | maschinenlesbare Policy fuer Auswahl des naechsten approved Agenten, Proposal-Regeln, Prompt-Generierung, Connected-Agent-/Register-Zaehllogik, Risiko-Regeln, verbotene Auto-Aktionen und Report-Schema | `docs/architecture/WELLFIT_AGENT_ARCHITECT_PROPOSAL_AGENT.md`, `project-register/approved-agent-build-backlog.json` | vor Next-Agent-Prompt-Erzeugung lesen; keine Future Agents automatisch bauen |
| `project-register/human-motivation-engine.json` | aktiv / Register / report_only | maschinenlesbares Human-Motivation-Engine-Framework fuer gesunde Habit-Loops, Autonomie, Kompetenz, Relatedness, Identitaet, Fortschritt, Recovery, Family/Social Connection, Buddy-Grenzen, adaptive Difficulty Inputs, multisensorisches Lernen und verbotene addictive/dark-pattern Engagement-Mechaniken | `docs/architecture/WELLFIT_HUMAN_MOTIVATION_ENGINE.md`, `scripts/wellfit-dev-agent/src/human-motivation-engine-check.mjs`, `project-register/adaptive-user-insights.json`, `project-register/research-recommendations.json` | report-only halten; keine Runtime-Personalisierung, keine Produktlogik und protected Topics review_required; naechste Aufgabe Ethical Engagement Guard |
| `docs/architecture/WELLFIT_HUMAN_MOTIVATION_ENGINE.md` | aktiv / Architektur / report_only | human-readable Architektur fuer gesunde Motivation statt addictive Design, AI-Buddy-Motivation ohne Manipulation, adaptive Difficulty ohne unsafe Profiling, Datenminimierung, Reward-/Monetization-Trust-Boundaries und Verbindungen zu bestehenden Agenten | `project-register/human-motivation-engine.json` | bei Motivation-/Retention-/Buddy-/Mission-Factory-/Product-Intelligence-Planung lesen; keine Parallelarchitektur anlegen |
| `scripts/wellfit-dev-agent/src/human-motivation-engine-check.mjs` | aktiv / Code / report_only | Validator fuer Pflichtfelder, Motivation Principles, Healthy-Retention-vs-Forbidden-Engagement-Regeln, User-Motivation-Dimensions, protected review_required Topics und Work-Map-/TODO-Index-Verweise; schreibt `scripts/wellfit-dev-agent/output/human-motivation-engine-report.md` | `project-register/human-motivation-engine.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; keine Runtime-Dateien, keine Personalisierung, kein Approval/Merge/Repair/Deploy |
| `project-register/ethical-engagement-guard.json` | aktiv / Register / report_only | maschinenlesbares Ethical-Engagement-Guard-Framework fuer gesunde Retention, Autonomie, Consent, altersgerechtes Design, Wuerde/No-Shame, Recovery/Rest, Transparenz, Fairness, trust-preserving Rewards, sichere Social Connection, Privacy-Minimierung und Blockade manipulativer Engagement-Muster | `docs/architecture/WELLFIT_ETHICAL_ENGAGEMENT_GUARD.md`, `scripts/wellfit-dev-agent/src/ethical-engagement-guard-check.mjs`, `project-register/human-motivation-engine.json`, `project-register/product-readiness.json` | report-only halten; keine Runtime-Engagement-Logik, keine Personalisierung, kein Tracking/Profiling, keine Reward-/Mission-Autoritaet, keine Monetarisierung und protected Topics review_required |
| `docs/architecture/WELLFIT_ETHICAL_ENGAGEMENT_GUARD.md` | aktiv / Architektur / report_only | human-readable Architektur fuer Ethical Engagement Guard, gesunde Retention statt manipulativer Engagement-Loops, altersgerechtes Design, Recovery/Pause, AI-Buddy-Ton, Missions-/Reward-/Social-/Website-/Sponsor-/Monetization-Pruefung und geschuetzte Datenminimierung | `project-register/ethical-engagement-guard.json` | vor Engagement-, Mission-, Reward-, Buddy-, Website-, Sponsor-, Monetarisierungs- oder Product-Intelligence-Planung lesen; keine Parallelarchitektur anlegen |
| `scripts/wellfit-dev-agent/src/ethical-engagement-guard-check.mjs` | aktiv / Code / report_only | Validator fuer Pflichtfelder, Ethical Principles, allowed/forbidden Engagement Patterns, FOMO/Shame/Gambling/Lootbox/Sleep/Dark-Pattern/Age-/Social-/Paywall-Abdeckung, altersgerechte Regeln, Recovery/Pause, Buddy Tone, Mission/Reward, Website/Sponsor, protected review_required Topics und Work-Map-/TODO-Index-Verweise; schreibt `scripts/wellfit-dev-agent/output/ethical-engagement-guard-report.md` | `project-register/ethical-engagement-guard.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; keine Runtime-Dateien, keine Personalisierung, kein Tracking/Profiling, kein Approval/Merge/Repair/Deploy |
| `project-register/reward-fairness-guard.json` | aktiv / Register / report_only | maschinenlesbarer Reward-Fairness-Guard fuer interne Punkte, XP, Streaks, Mission Completion, Challenge Rewards, Anti-Cheat, Fairness fuer Anfaenger/Fortgeschrittene und keine Pay-to-win-Mechanik | `docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD.md`, `scripts/wellfit-dev-agent/src/reward-fairness-guard-check.mjs`, `project-register/mission-buddy-economy-flow.json`, `project-register/risk-classifier.json` | report-only halten; keine Reward Writes, keine Completion-/Challenge-/Anti-Cheat-Autoritaet, keine Runtime-Dateien, keine Pay-to-win-/Token-/Wallet-/Payment-/NFT-/Betting-Mechanik |
| `docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD.md` | aktiv / Architektur / report_only | human-readable Guard fuer Reward-Fairness-Pruefbereiche, Server-Authority-Blocker, No-Pay-to-win-Regeln, Beginner/Advanced-Balance, Streak-/XP-/Punkte-Grenzen und Anti-Cheat-Berichtspflichten | `project-register/reward-fairness-guard.json`, `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md`, `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` | vor Reward-/Mission-Completion-/Challenge-/Anti-Cheat-Planung lesen; nur Berichte und Blocker, keine Autorisierung oder Runtime-Aenderung |
| `scripts/wellfit-dev-agent/src/reward-fairness-guard-check.mjs` | aktiv / Code / report_only | Validator fuer Reward-Fairness-Guard-Artefakte, verbundene Source-of-Truth-Dateien, Pflicht-Pruefbereiche, erlaubte Report-Outputs und verbotene Reward-/Completion-/Anti-Cheat-Autoritaet; schreibt `scripts/wellfit-dev-agent/output/reward-fairness-guard-report.md` | `project-register/reward-fairness-guard.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | bei Reward-Fairness-Aenderungen ausfuehren; schreibt nur ignorierten Bericht, keine Runtime-Dateien und keine Rewards/Completions |
| `project-register/adaptive-difficulty-agent.json` | aktiv / Register / report_only | maschinenlesbares Adaptive-Difficulty-Agent-Framework fuer planungssichere Vorschlaege zu Mission Difficulty, Mission Length, Buddy Tone, Learning Format, Activity Intensity, Recovery Mode und Social/Solo Mode auf Basis aggregate-safe, consent-aware und review_required Signale | `docs/architecture/WELLFIT_ADAPTIVE_DIFFICULTY_AGENT.md`, `scripts/wellfit-dev-agent/src/adaptive-difficulty-agent-check.mjs`, `project-register/human-motivation-engine.json`, `project-register/ethical-engagement-guard.json`, `project-register/adaptive-user-insights.json` | report-only halten; keine Runtime-Personalisierung, kein Difficulty Tuning, kein protected-data Profiling, keine Reward-/Mission-Autoritaet und protected Topics review_required; naechste Aufgabe Multisensory Learning Engine |
| `docs/architecture/WELLFIT_ADAPTIVE_DIFFICULTY_AGENT.md` | aktiv / Architektur / report_only | human-readable Architektur fuer Adaptive Difficulty, Unterschied zu Runtime-Personalisierung, planungssichere Signale, altersgerechte Grenzen, Recovery vor Druck, Buddy-Tone-, Mission-Length-, Learning-Format- und Social-Mode-Vorschlaege sowie Reward-/Mission-Authority-Boundaries | `project-register/adaptive-difficulty-agent.json` | vor Mission-Factory-, Product-Intelligence-, Buddy-, Learning- oder Difficulty-Planung lesen; keine Parallelarchitektur anlegen |
| `scripts/wellfit-dev-agent/src/adaptive-difficulty-agent-check.mjs` | aktiv / Code / report_only | Validator fuer Pflichtfelder, Difficulty Principles, allowed/forbidden Signals, Difficulty Dimensions, altersgerechte Regeln, Recovery Mode, Buddy Tone, Mission Length, Learning Format, Social Mode, protected review_required Topics, Reward-/Mission-Authority-Boundaries und Work-Map-/TODO-Index-Verweise; schreibt `scripts/wellfit-dev-agent/output/adaptive-difficulty-agent-report.md` | `project-register/adaptive-difficulty-agent.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; keine Runtime-Dateien, keine Personalisierung, kein Difficulty Tuning, kein Protected-Data-Profiling, kein Approval/Merge/Repair/Deploy |
| `project-register/agent-build-proposals.json` | aktiv / Register / proposal_backlog | Proposal-Backlog fuer Agent-Architect-Ausgaben mit Statuswerten, Pflichtschema, Seed-Eintrag fuer den gebauten Agent Architect und Human-Review-Pflicht | `project-register/agent-architect-policy.json`, `project-register/agent-catalog.json` | nach gebauten Agenten aktualisieren; nicht als automatische Build-Freigabe verwenden |
| `docs/architecture/WELLFIT_AGENT_ARCHITECT_PROPOSAL_AGENT.md` | aktiv / Agent Governance | human-readable Runbook fuer Agent Architect, Unterschied zu Katalog/Extension Policy, Auswahlregeln, sichere Prompt-Generierung, One-Agent-Regel, Human Review und Nachpflege gebauter Agenten | `project-register/agent-architect-policy.json`, `project-register/agent-build-proposals.json` | bei Agent-Architect-Aenderungen synchron halten |
| `scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs` | aktiv / Agent-Code / report_only | validiert Policy, Proposal-Register, Approved-Backlog-Bezug, Proposal-Statuses, Pflichtfelder, Connected Counts, Human-Review-Pflicht und Work-Map-/TODO-Index-Referenzen | `project-register/agent-architect-policy.json`, `project-register/agent-build-proposals.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; baut keine Agenten und aendert keine Runtime-Dateien |
| `scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs` | aktiv / Agent-Code / report_only | waehlt genau einen naechsten approved_for_build/approved_for_planning Agent aus dem Backlog, ueberspringt built/blocked Eintraege, erzeugt Prompt und Proposal-Report unter `scripts/wellfit-dev-agent/output/` | `project-register/approved-agent-build-backlog.json`, `project-register/agent-catalog.json`, `project-register/agent-extension-policy.json` | nach Review ausfuehren; generierter Prompt wird erst durch Human Acceptance ein kuenftiger Codex-Task |

## Agent Extension vs New Agent Proposal Policy

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/agent-extension-policy.json` | aktiv / Register / report_only | maschinenlesbare Policy fuer Existing-Agent-Extension vs New-Agent-Proposal mit Extension-Regeln, Proposal-Triggern, Overlap-Erkennung, Connected-Agent-/Register-Regeln, Human-Review-Pflichten, verbotenen Auto-Aktionen und Report-Schema | `docs/architecture/WELLFIT_AGENT_EXTENSION_POLICY.md`, `todolist/WORK_MAP.md`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json` | vor neuen Agentnamen, Agent-Registern, Workflow-Familien oder Agent-Faehigkeiten lesen; keine Agenten automatisch erstellen |
| `docs/architecture/WELLFIT_AGENT_EXTENSION_POLICY.md` | aktiv / Agent Governance | human-readable Regelwerk, wann bestehende Agenten erweitert werden duerfen und wann eine neue Agent-Proposal mit Human Review erforderlich ist | `project-register/agent-extension-policy.json` | bei Agent-/Framework-Governance-Aenderungen lesen; keine Duplicate Architecture anlegen |
| `scripts/wellfit-dev-agent/src/agent-extension-policy-check.mjs` | aktiv / Agent-Code / report_only | validiert Agent-Extension-Policy, Pflichtbeispiele, verbotene Auto-Aktionen sowie Work-Map-/TODO-Index-Referenzen und schreibt `scripts/wellfit-dev-agent/output/agent-extension-policy-report.md` | `project-register/agent-extension-policy.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | nach Policy-Aenderungen und im Quality Gate ausfuehren; erstellt keine Agenten, approved/merged/repariert/deployed nicht |

## PR Review Agent Governance

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/pr-review-policy.json` | aktiv / Register | maschinenlesbare report-only PR-Review-Policy mit Pflichtinputs, Review-Checkliste, Protected-Area-Checks, Batch-Autopilot-PR-Handoff-Feldern, Cross-Reference-/Readiness-/Inventory-Checks, Auto-Merge-/Auto-Repair-Reportpflicht, PR-Beschreibungsfeldern, Human-Review-Stops und No-Duplicate-Architecture-Regeln | `docs/architecture/WELLFIT_PR_REVIEW_AGENT.md`, `scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs` | vor PR-Handoff und Code Review lesen; nicht als Auto-Approval-/Merge-/Repair-Autorisierung verwenden |
| `docs/architecture/WELLFIT_PR_REVIEW_AGENT.md` | aktiv / Agent Governance | human-readable Runbook fuer WellFit PR Review Agent Checks, Protected-Area Review, Cross-Reference/Readiness/Inventory Review, PR-Beschreibungsfelder und report-only Auto-Merge-/Auto-Repair-Grenzen | `project-register/pr-review-policy.json` | bei PR-Review-Governance-Aenderungen synchron halten; keine zweite Review-Architektur anlegen |
| `scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs` | aktiv / Agent-Code | validiert PR-Review-Policy, Pflicht-Checklistenfelder, Protected-Area-Checks, Work-Map-/TODO-Index-Verweise und report-only Auto-Merge-/Auto-Repair-Grenzen; gibt `PR_REVIEW_POLICY_READY=true/false` aus und schreibt keine Dateien | `project-register/pr-review-policy.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt nach PR-Review-Governance-Aenderungen ausfuehren; im Quality Gate eingebunden |
| `project-register/pr-post-creation-guard.json` | aktiv / Register | maschinenlesbare report-only PR-Post-Creation-Mergeability-Policy mit Pflichtchecks nach PR-Erstellung, Mergeability-/Check-Statuswerten, Safe-Repair-Grenzen, Replacement-PR-Regeln, Forbidden Auto Actions und PR-Beschreibungsfeldern | `docs/architecture/WELLFIT_PR_POST_CREATION_MERGEABILITY_GUARD.md`, `scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs` | nach PR-Erstellung und bei Guard-Aenderungen lesen; nicht als Auto-Merge-/Approval-/Deploy-/Repair-Autorisierung verwenden |
| `docs/architecture/WELLFIT_PR_POST_CREATION_MERGEABILITY_GUARD.md` | aktiv / Agent Governance | human-readable Runbook fuer Post-PR-Mergeability, Required-Checks, PR-#93-Lernpunkt, Safe-Repair-Guidance, Replacement-PR-Strategie und Human-Review-Stops | `project-register/pr-post-creation-guard.json` | mit PR-Review-, Auto-Merge-, Auto-Repair- und Task-Status-Governance synchron halten; keine parallele Architektur anlegen |
| `scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs` | aktiv / Agent-Code | validiert den PR Post-Creation Guard report-only, meldet `PR_POST_CREATION_GUARD_READY=true/false`, schreibt keine Dateien und fuehrt keine GitHub-Merge-/Approval-/Repair-/Deploy-Aktion aus | `project-register/pr-post-creation-guard.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt nach Guard-Aenderungen ausfuehren; im Quality Gate eingebunden |

## Master Roadmap Import / Registry

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/master-roadmap-tasks.json` | aktiv / Register | maschinenlesbarer Import der WellFit Master Roadmap / Developer To-Do List mit Phasen, Tasks, Risk- und Mapping-Feldern | `todolist/WORK_MAP.md`, `project-register/product-readiness.json`, `project-register/internal-sources.json` | nach Roadmap-/Status-Aenderungen registry-only aktualisieren |
| `docs/architecture/WELLFIT_MASTER_ROADMAP_IMPORT.md` | aktiv / Architektur-Notiz | Importprinzip, Schutzregeln, Validierung und sichere naechste Aufgaben zum Master-Roadmap-Import | `project-register/master-roadmap-tasks.json` | als Kontext lesen, nicht als Ersatz fuer aktuelle Source-of-Truth-Dateien verwenden |
| `scripts/wellfit-dev-agent/src/master-roadmap-task-check.mjs` | aktiv / Agent-Code | validiert Master-Roadmap-Registry, Statusmarker, Pflichtfelder, Risk-/Human-Approval-Regeln und Safe-Auto-Work-Schutz | `project-register/master-roadmap-tasks.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | nach Registry-Aenderungen ausfuehren; im Quality Gate eingebunden |

## Research Recommendation Agent / Governance

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `project-register/research-recommendations.json` | aktiv / Register | maschinenlesbare Governance fuer interne-first Research-Reports, optionale externe Recherche, drei Optionen, eine Empfehlung, Risiko und Human Review | `todolist/WORK_MAP.md`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json` | nach Recommendation-Governance-Aenderungen mit `research-recommendation-check.mjs` validieren |
| `docs/architecture/WELLFIT_RESEARCH_RECOMMENDATION_AGENT.md` | aktiv / Architektur-Notiz | menschliche Anleitung fuer Research-&-Recommendation-Agenten ohne Laufzeitlogik oder parallele Architektur | `project-register/research-recommendations.json` | vor unklaren Produkt-/Technikentscheidungen lesen; High-/Critical-Empfehlungen nicht ohne Human Approval umsetzen |
| `scripts/wellfit-dev-agent/src/research-recommendation-check.mjs` | aktiv / Agent-Code | validiert Internal-First-Regel, optionale externe Recherche, Drei-Optionen-Schema, eine Empfehlung, Human Review und geschuetzte Themen | `project-register/research-recommendations.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt nach Registry-Aenderungen ausfuehren; im Quality Gate eingebunden |
| `project-register/adaptive-user-insights.json` | aktiv / Register / planning_only | maschinenlesbare Governance fuer spaetere aggregate Adaptive-User-Insight-Summaries ohne Live-Tracking, Rohdaten, Identifier oder Runtime-Produktlogik | `todolist/WORK_MAP.md`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/research-recommendations.json` | nach Insight-Governance-Aenderungen mit `adaptive-user-insight-check.mjs` validieren |
| `docs/architecture/WELLFIT_ADAPTIVE_USER_INSIGHT_AGENT.md` | aktiv / Architektur-Notiz / planning_only | menschliche Anleitung fuer Adaptive-User-Insight-Governance mit erlaubten Aggregatsignalen, verbotenen sensiblen Feldern, Explainability und Human Review | `project-register/adaptive-user-insights.json` | vor Nutzer-Insight-Planung lesen; keine Live-Tracking- oder Runtime-Logik aktivieren |
| `project-register/auto-merge-policy.json` | aktiv / Register | maschinenlesbarer report-only Auto-Merge Eligibility Guard mit erlaubten Kategorien, verbotenen Pfaden/Themen, Pflichtchecks, PR-State-Anforderungen, Human-Approval-Regeln und Report-Schema | `docs/architecture/WELLFIT_AUTO_MERGE_POLICY.md`, `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs` | nicht als Merge-Autorisierung verwenden; echte Auto-Merge-Aktivierung bleibt verboten ohne explizite Human Approval |
| `docs/architecture/WELLFIT_AUTO_MERGE_POLICY.md` | aktiv / Architektur-Notiz | menschliche Beschreibung des report-only Auto-Merge Eligibility Guards, seiner Grenzen, Pflichtchecks und Quality-Gate-Einbindung | `project-register/auto-merge-policy.json`, `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs` | vor Auto-Merge-Governance-Aenderungen lesen; keine parallele Merge-Architektur anlegen |
| `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs` | aktiv / Agent-Code | prueft Git-Diff, docs/register-only Scope, verbotene Pfade, verbotene Themen, Pflichtcheck-Liste und Groessenlimits; gibt report-only `AUTO_MERGE_ELIGIBLE=true/false` mit Gruenden aus und merged niemals | `project-register/auto-merge-policy.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt vor PR-Handoff und im Quality Gate ausfuehren; Ineligibility ist kein Scriptfehler |
| `project-register/auto-repair-policy.json` | aktiv / Register | maschinenlesbarer report-only Auto-Repair Decision Guard mit maximalen Reparaturversuchen, erlaubten Failure-Kategorien, verbotenen Pfaden/Themen, Stop Conditions, Evidence-Pflichten und Report-Schema | `docs/architecture/WELLFIT_AUTO_REPAIR_POLICY.md`, `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs` | nicht als Reparatur-Autorisierung verwenden; echte Auto-Repair-Aktivierung bleibt verboten ohne explizite Human Approval |
| `docs/architecture/WELLFIT_AUTO_REPAIR_POLICY.md` | aktiv / Architektur-Notiz | menschliche Beschreibung des report-only Auto-Repair Guards, seiner Safe-/Stop-Regeln, Evidence-Pflichten und Quality-Gate-Einbindung | `project-register/auto-repair-policy.json`, `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs` | vor Auto-Repair-Governance-Aenderungen lesen; keine parallele Reparatur-Architektur anlegen |
| `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs` | aktiv / Agent-Code | liest Policy und vorhandene Quality-Gate-Reports, klassifiziert safe repairable Failures report-only, gibt `AUTO_REPAIR_ALLOWED=true/false` mit Gruenden aus und repariert oder merged niemals | `project-register/auto-repair-policy.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | nach fehlgeschlagenen Checks und im Quality Gate ausfuehren; `false` ist kein Scriptfehler |
| `scripts/wellfit-dev-agent/src/adaptive-user-insight-check.mjs` | aktiv / Agent-Code | validiert Adaptive-User-Insight-Registry, `planning_only`, Aggregate, verbotene Roh-/Sensitivdaten, Mindestschwellen, Explainability und High-/Critical-Human-Review | `project-register/adaptive-user-insights.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | direkt nach Registry-Aenderungen ausfuehren; im Quality Gate eingebunden |
| `docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` | aktiv / Architektur-Notiz / planning_only | menschliche Mission-Insight-Ergaenzung fuer spaetere aggregierte Missionsanalyse ohne Runtime-Produktlogik oder Reward-Autoritaet | `project-register/adaptive-user-insights.json`, `project-register/product-readiness.json` | zusammen mit Adaptive-User-Insight-Governance lesen; keine Live-Tuning-, Reward- oder Mission-Completion-Logik aktivieren |

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
| `todolist/H - MOBILE - AR - TRACKING - KI` | aktiv / Bereichs-TODO | Mobile, AR, Tracking, KI inkl. Mobile/PWA Device-Testplan, Manual-Evidence-Vorlage und Tester-Handoff fuer bestehende Routen, PWA-Install, Kamera/Pose/Face/Motion/WebGL-Fallbacks und Safety-Grenzen | Bereich Mobile/AR | pruefen und mit Next Actions verknuepfen; echte Geraeteergebnisse als `device_test_required`/`review_required` dokumentieren |
| `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY` | aktiv / Bereichs-TODO | Native AR, ARCore, ARKit, Unity | Bereich Mobile/AR | pruefen und mit Alpha/Beta abgleichen |
| `todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` | aktiv / Bereichs-TODO | Buddy als AR-Begleiter und KI-Guide | Bereich KI-Buddy | pruefen und priorisieren |
| `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md` | aktiv / Bereichs-TODO | AR-Buddy, Companion und Avatar-Grundlogik | Bereich KI-Buddy / Avatar | pruefen und priorisieren |
| `todolist/J1 - ISSUE 8 AR-BUDDY MICRO-TASK LOG` | aktiv / Micro-Task-Log | AR-Buddy Micro-Tasks | Bereich KI-Buddy | offene Punkte uebernehmen |
| `todolist/J8.2 - AR BUDDY EVENT SECURITY ADDENDUM.md` | aktiv / Security | AR-Buddy Event Security | Bereich KI-Buddy / Security | mit Safety-Regeln abgleichen |
| `todolist/ROADMAP_BUDDY_PHASES_ADDENDUM` | aktiv / Roadmap | Buddy-Phasen | Bereich KI-Buddy | mit Beta-Roadmap abgleichen |

## Bereichs-TODOs Missionen, Maps, Rewards, Economy

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/F - FIREBASE  - REALTIME - MISSIONEN` | aktiv / Bereichs-TODO | Firebase, Realtime, Missionen inkl. Beta-internen Punkte-/XP- und Server-Authority-Grenzen | `DATABASE_PLAN.md` | Datenbankplan damit abgleichen; keine Client-Reward-/Mission-Authority aktivieren |
| `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS` | aktiv / Bereichs-TODO | Reward-System, System Health, Mechanics inkl. Safety-/Economy-Guardrails | Bereich Reward/Gamification | pruefen, aber keine echten Token/Transfers, keine finalen Client-Rewards und keine Ledger-Writes aktivieren |
| `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN` | aktiv / Bereichs-TODO | interne Punkteoekonomie vor Blockchain | Bereich Gamification | fuer Beta sehr wichtig |
| `todolist/J8.3 - AR RAETSELRALLYE REWARD ALGORITHMUS ADDENDUM.md` | aktiv / Reward | AR-Raetselrallye Reward-Algorithmus | Bereich Mission/Reward | mit Reward-Safety abgleichen |
| `todolist/J8.4 - MISSIONSTYPEN UND KI MISSION ENGINE ADDENDUM.md` | aktiv / Mission Engine | Missionstypen und KI Mission Engine | Bereich Mission/KI | priorisieren |
| `todolist/J8.4A - MISSION DRAFT SECURITY ADDENDUM.md` | aktiv / Mission Security | Mission Draft Security | Bereich Mission/KI | mit Backend-Safety abgleichen |
| `todolist/J8.4B - MISSION UI HISTORY FAVORITEN ADDENDUM.md` | aktiv / Mission UI | Mission UI, History, Favoriten | Bereich Mission/UI | mit AppShell abgleichen |
| `todolist/J8.4C - MISSION MAPS UND STANDORT HANDOFF.md` | aktiv / Standort | Mission Maps und Standort-Handoff | Bereich Mission/Location | Datenschutz beachten |

## Bereichs-TODOs AppShell, Dashboard, Website, Legal

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL` | aktiv / Bereichs-TODO | Business, Website, Partner, Legal inkl. review_required-Grenzen fuer sensible Claims | Bereich Website/Legal | fuer Investor/Website wichtig; Runtime-Legaltexte nicht ohne Review aendern |
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
| `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md` | aktiv | Self-hosted Dev-Agent Architektur inkl. PM2-/Server-Grenzen | Agentenstrategie | fuer Automatisierung nutzen; keine Deploys, PM2-Restarts oder Server-Env-Aenderungen ohne Human-Freigabe |
| `docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` | duplikat / verlinkt | Details stehen in der fuehrenden Research-Recommendation-/Adaptive-Insight-Sektion oben | `project-register/adaptive-user-insights.json` | nicht separat fortfuehren; oben synchron halten |
| `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` | aktiv / Guardrail | Mission-/Reward-Kontextlogik mit Beta-Safety-Grenze, Preview-/Stub-Status und Server-Authority-Zielbild | Missionen/Reward | mit Datenbankplan abgleichen; keine finalen Ledger-Writes oder Client-Autoritaet aktivieren |
| `docs/architecture/INTERNAL_ECONOMY_GUARDRAILS.md` | aktiv / Economy Guardrails | interne Punkte-/XP-/Reward-Leitplanken vor Blockchain | Economy/Reward | fuehrend fuer Beta-Economy-Regeln |
| `docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md` | aktiv / Economy Guardrail | KI-generierte Dimensionen, Items, Detours und spaetere NFT-/Ownership-Grenzen mit MVP-/Beta-Economy-Safety | Economy/Items/KI | keine Token-/NFT-/Wallet-/Payment-/Trading-/Payout-Aktivierung; faire Detours vor Kaufdruck |
| `docs/architecture/INTERNAL_POINTS_LEDGER_AND_BILLING.md` | aktiv / Ledger und Abrechnung | internes Punkte-/XP-/Reward-Ledger vor Tokenisierung | Economy/Reward/Backend | fuehrend fuer interne Abrechnung |
| `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md` | aktiv / Security | Server-Completion-Plan und Firestore-Haertung fuer interne Punkte, XP, Level, Avatar und Mission Completion | Backend/Economy | fuehrend fuer naechsten Server-Completion-Block |
| `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` | aktiv / Testplan | Firestore Economy Rules Haertung, DENY/ALLOW Emulator-Stufen, Client-Write-Migration, Backend-Readiness-Grenzen, Preview-/Draft-Persistenzstatus und Emulator-Voraussetzungen | Backend/Economy/QA | vor harter Rules-/Ledger-/Reward-/Mission-Authority-Aenderung nutzen; Emulator-Limits als Umgebung dokumentieren, nicht durch Rules-/Functions-/Deployment-Aenderungen umgehen |
| `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` | aktiv / Privacy Guardrails | Health-/Watch-, Child-/Family-, Location-/GPS-/Radius-/Safe-Zone-, Kamera-/AR-/Pose-/Face-/Biometric-, Motion-/DeviceMotion-/Raw-Sensor- und Consent-/Permission-Daten inkl. review_required-, Data-Minimization-, Fallback- und Nicht-Autoritaetsgrenzen | Datenschutz/Safety | fuehrend fuer sensible Daten und Berechtigungen; keine neuen Daten-/Consent-/Tracking-/Collection-Flows ohne Review |
| `docs/architecture/CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md` | aktiv / Checkpoint Safety | sichere echte Orte, verbotene Orte, 20-Meter-Radius, Standortplatzierung und geschuetzte GPS-/Radius-/Safe-Zone-Grenzen | Mission/Location/Safety | fuehrend fuer Checkpoint-Erzeugung nutzen; keine Standorterfassung, Safe-Zone, Reward-/Completion-Authority oder Live-Tracking ohne Review |
| `docs/architecture/COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` | aktiv / Competition Stakes | interne Duell-Einsaetze, Punkte-/Item-Locks, keine echten Wetten/Auszahlungen | Wettkaempfe/Economy/Safety | fuehrend fuer Wettkampf-Einsaetze nutzen |
| `docs/architecture/AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` | aktiv / Avatar Competition | Avatar-Duelle, seltene interne Items, Excalibur/Fairness, keine NFT/Token | Avatar/Wettkaempfe/Items/Safety | fuehrend fuer Avatar-Duelle und Rare Items nutzen |
| `docs/architecture/BLOCKCHAIN_TOKEN_MIGRATION_GUARDRAILS.md` | aktiv / Blockchain Backlog | Token/WFT/NFT erst nach stabilem internem Punkte- und Abrechnungssystem | Blockchain/Token | fuehrend fuer spaetere Token-Migration |
| `docs/architecture/AR_RIDDLE_FIRESTORE_SECURITY_PLAN.md` | aktiv / Security | AR-Raetsel Firestore Security | Backend/Security | mit Coder 2 abgleichen |
| `docs/architecture/USER_POINTS_CLIENT_WRITE_REFACTOR.md` | aktiv / Security | Refactor gegen Client-Write bei User Points | Backend/Security | fuer Beta wichtig |
| `docs/architecture/AR_REWARD_LEDGER_EVENT.md` | aktiv / Reward Ledger | AR-Reward-Ledger-Event | Backend/Reward | mit Coder 2 und Punkte-Ledger abgleichen |
| `docs/architecture/AR_RIDDLE_EMULATOR_TEST_PLAN.md` | aktiv / Testplan | AR-Riddle Emulator-Testplan | Backend/QA | mit Emulator-/QA-Tasks abgleichen |
| `docs/architecture/BUDDY_KI_MODEL_PROVIDER_RUNBOOK.md` | aktiv / Runbook | Buddy-KI Modellprovider | Buddy-KI/Backend | keine Frontend-Secrets, Provider sauber testen |
| `docs/architecture/MISSION_DRAFT_EMULATOR_TEST_PLAN.md` | aktiv / Testplan | Mission-Draft Emulator-Testplan inkl. lokaler Emulator-Voraussetzungen, Backend-Readiness-Status und Authority-Grenzen | Mission/QA | mit Coder 2 abgleichen; keine MissionDraft-Reward-/Completion-/Ledger-/Inventory-Autoritaet aktivieren |
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
| `project-register/visual-regression.json` | aktiv / maschinenlesbares Register | Visual-/Screenshot-Route-Check-Plan mit Route-Gruppen, Viewports, Artefaktregeln, Browser-Optionalitaet, Protected-Route-Grenzen, Mobile/PWA-Device-Test-Metadaten, Manual-Evidence-Template-/Tester-Handoff-Metadaten und Screenshot-Pflichtregeln | `docs/architecture/WELLFIT_VISUAL_REGRESSION_CHECKS.md`, `project-register/routes.json` | bei UI-/Routen-QA- oder Mobile/PWA-Testplan-Aenderungen synchron halten; keine Screenshot-Artefakte committen |
| `docs/architecture/WELLFIT_VISUAL_REGRESSION_CHECKS.md` | aktiv / Agent Governance | Human-readable Plan fuer optionale Visual-Regression-, Screenshot-Smoke-, Mobile/PWA-Device-Checks und Manual-Device-Evidence plus Tester-Handoff ohne Produktlogik-Aenderungen | `project-register/visual-regression.json`, `scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs` | vor sichtbaren UI-Aenderungen, Mobile/PWA-Geraetetests und Visual-QA-Follow-ups lesen |

| `project-register/pr-diff-review-policy.json` | aktiv / Register | maschinenlesbare report-only Policy fuer PR-Diff-/Changed-File-Review mit Klassifizierung, Protected-Path/-Topic-Erkennung, Cross-Reference-/Readiness-/Inventory-/Task-Status-Impact und Guard-Summaries | `docs/architecture/WELLFIT_PR_DIFF_REVIEW_REPORT.md`, `scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs` | vor PR-Handoff/Review ausfuehren; nicht als Auto-Approval-/Merge-/Repair-Autorisierung verwenden |
| `docs/architecture/WELLFIT_PR_DIFF_REVIEW_REPORT.md` | aktiv / Architektur-Notiz | menschliche Anleitung fuer den report-only PR Diff Review Report und seine No-Auto-Approval-/No-Merge-/No-Repair-/No-Deploy-Grenzen | `project-register/pr-diff-review-policy.json`, `scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs` | bestehende PR-Review-Governance erweitern; keine Parallelarchitektur anlegen |

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
| `scripts/wellfit-dev-agent/src/visual-route-smoke-check.mjs` | aktiv / Code | validiert Visual-Regression-Routen gegen `project-register/routes.json` und fuehrt optionale Browser-Screenshot-Smokes non-blocking aus | `project-register/visual-regression.json` | bei UI-Aenderungen direkt ausfuehren; im Quality Gate report-only |
| `scripts/wellfit-dev-agent/src/firestore-economy-rules-check.mjs` | aktiv / Code | prueft statisch die Firestore-Economy-Rules-Guardrails | Agent-Code / Firestore QA | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/apply-memory-prompts.mjs` | aktiv / Code | ergaenzt KI-Fortsetzungs-Prompts kontrolliert | Agent-Code | keine KI-Prompt-Pflicht |
| `scripts/wellfit-dev-agent/src/agent-governance-control-check.mjs` | aktiv / Code | validiert Agent-Control-Register, Risk Classifier, Definition of Done, Task Queue sowie TODO_INDEX-/WORK_MAP-Verweise | `project-register/agent-task-queue.json`, `project-register/definition-of-done.json`, `project-register/risk-classifier.json` | wird durch Quality Gate ausgefuehrt |
| `scripts/wellfit-dev-agent/src/product-readiness-check.mjs` | aktiv / Code | validiert die Produktbereitschafts-Matrix, Pflichtmodule und geschuetzte Statusregeln | `project-register/product-readiness.json` | wird durch Quality Gate ausgefuehrt |
| `scripts/wellfit-dev-agent/src/route-api-drift-detector.mjs` | aktiv / Code | scannt `app/**/page.tsx` und `app/**/route.ts` gegen Routen-/API-/Feature-/Readiness-Register und meldet Drift ohne Rewrite | `project-register/routes.json`, `project-register/apis.json`, `project-register/features.json`, `project-register/product-readiness.json` | wird durch Quality Gate ausgefuehrt; High-/Critical-Warnungen nicht automatisch fixen |
| `scripts/wellfit-dev-agent/src/concept-to-code-gap-analyzer.mjs` | aktiv / Code | prueft Internal-Source-Konzeptgruppen gegen Work Map und Product Readiness, meldet Mapping-Luecken und Duplicate-Architektur-Risiken ohne Rewrite | `project-register/internal-sources.json`, `todolist/WORK_MAP.md`, `project-register/product-readiness.json` | wird durch Quality Gate ausgefuehrt; Konzeptluecken registry-only nachziehen |
| `scripts/wellfit-dev-agent/src/quality-gate.mjs` | aktiv / Code | fuehrt Kontrollkette inklusive Drift-/Gap-Detektoren, Agent-Governance-Control-Check, Research-Recommendation-Check, Adaptive-User-Insight-Check, Batch-Autopilot-Dry-Run, Auto-Merge-Eligibility-Check, Auto-Repair-Decision-Check, PR-Review-Policy-Check, Firestore-Economy-Rules-Check, Next-Task-Picker und TODO-Status-Sync aus und entscheidet PASS/FAIL | Agent-Code | keine KI-Prompt-Pflicht |
| `project-register/agent-autopilot.json` | aktiv / Register | maschinenlesbarer Dry-run-only Autopilot-Orchestrator mit First-Read-Dateien, Iterationsphasen, erlaubten/verbotenen Aktionen, Stop Conditions, Risk Gates, Checks, Report Output und Human-Approval-Regeln | `docs/architecture/WELLFIT_AGENT_AUTOPILOT_RUNBOOK.md`, `scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs` | vor Agenten-Iteration lesen; nicht als Merge-/Deploy-Autorisierung verwenden |
| `docs/architecture/WELLFIT_AGENT_AUTOPILOT_RUNBOOK.md` | aktiv / Architektur-Notiz | menschliches Runbook fuer den governed Autopilot-Ablauf von Memory-Read bis PR-Handoff und Stop-before-merge | `project-register/agent-autopilot.json` | als zentrale Autopilot-Einstiegsanleitung fuer Codex/KI-Agenten nutzen |
| `scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs` | aktiv / Code | liest Autopilot, Task Queue, Risk Classifier, Definition of Done, Product Readiness, Research Recommendations und Adaptive User Insights report-only und gibt naechsten sicheren Task, Risiko, Checks, Dateien und Stop-Bedingungen aus | `project-register/agent-autopilot.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json` | vor Umsetzung ausfuehren; schreibt keine Dateien automatisch; im Quality Gate eingebunden |
| `project-register/autopilot-batch-policy.json` | aktiv / Register | maschinenlesbare dry-run-only Batch-Autopilot-Policy fuer kurze Mehrfach-Task-Plaene mit Maximalanzahl, Laufzeitlimit, erlaubten Risiken/Kategorien, Human-Approved-Session-Guardrails, verbotenen Pfaden/Themen, Pflichtchecks, Stop Conditions und Report-Schema | `docs/architecture/WELLFIT_AUTOPILOT_BATCH_MODE.md`, `scripts/wellfit-dev-agent/src/autopilot-batch-dry-run.mjs` | nicht als Execution-/Merge-/Repair-Autorisierung verwenden; nur report-only planen |
| `docs/architecture/WELLFIT_AUTOPILOT_BATCH_MODE.md` | aktiv / Architektur-Notiz | menschliche Beschreibung des Batch Autopilot Dry Runs, seiner erlaubten Low-Risk-Planung, Cooldown-/Loop-Guard-Nutzung, manuellen Human-Approved-Session-Guardrails und Future-only Auto-Merge-/Auto-Repair-Grenzen | `project-register/autopilot-batch-policy.json` | vor Batch-Autopilot-Governance-Aenderungen lesen; keine parallele Agent-Architektur anlegen |
| `scripts/wellfit-dev-agent/src/autopilot-batch-dry-run.mjs` | aktiv / Code | liest Batch-Policy, Task Queue, Progress Log und Agent Work Log, respektiert Cooldown/Loop Guard und gibt bis zu `maxPlannedTasks` sichere Kandidaten mit Checks und Stop Conditions aus, ohne Dateien zu schreiben | `project-register/autopilot-batch-policy.json`, `project-register/agent-task-queue.json`, `project-register/progress-log.json`, `project-register/agent-work-log.json` | im Quality Gate report-only ausfuehren; echte Batch-Ausfuehrung, Auto-Merge und Auto-Repair bleiben deaktiviert |
| `project-register/autopilot-batch-execution-policy.json` | aktiv / Register | maschinenlesbare Limited-Execution-Policy fuer eine spaetere strikt begrenzte Batch-Ausfuehrung von Low-Risk-Dokumentations-/Register-/Governance-/Inventaraufgaben; erste Version bleibt `limited_execution_planning` und report/check-only | `docs/architecture/WELLFIT_AUTOPILOT_BATCH_LIMITED_EXECUTION.md`, `scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs` | nicht als echte Execution-/PR-/Merge-/Repair-/Deploy-Autorisierung verwenden; Human Approval bleibt Pflicht |
| `docs/architecture/WELLFIT_AUTOPILOT_BATCH_LIMITED_EXECUTION.md` | aktiv / Architektur-Notiz | menschliche Beschreibung der erlaubten Kategorien, Pfadgrenzen, Stop Conditions, Human-Approval-Regeln und No-Auto-Merge/No-Auto-Repair/No-Deploy-Grenzen fuer Limited Execution | `project-register/autopilot-batch-execution-policy.json` | vor jeder Batch-Execution-Governance-Aenderung lesen; keine parallele Agent-Architektur anlegen |
| `scripts/wellfit-dev-agent/src/autopilot-batch-limited-execution-check.mjs` | aktiv / Code | liest Limited-Execution-Policy, Batch-Dry-Run-Policy, Task Queue, Progress Log und Agent Work Log, meldet `BATCH_LIMITED_EXECUTION_READY=true/false` und fuehrt keine Tasks, PRs, Merges, Repairs oder Deployments aus | `project-register/autopilot-batch-execution-policy.json`, `project-register/autopilot-batch-policy.json`, `project-register/agent-task-queue.json` | im Quality Gate report-only ausfuehren; echte Batch-Ausfuehrung bleibt bis nach Human Review deaktiviert |
| `project-register/batch-execution-runner-policy.json` | aktiv / Register | maschinenlesbare framework-only Batch-Execution-Runner-Policy fuer maximal zwei spaetere Low-Risk-Dokumentations-/Register-/Governance-/Inventaraufgaben mit Task-Auswahl-, Status-/Work-Log-, Cross-Reference-, PR-Handoff- und Post-PR-Report-Gates | `docs/architecture/WELLFIT_BATCH_EXECUTION_RUNNER.md`, `scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs` | nicht als echte Execution-/PR-/Merge-/Repair-/Deploy-Autorisierung verwenden; erste Version bleibt `framework_only` und report/check-only |
| `docs/architecture/WELLFIT_BATCH_EXECUTION_RUNNER.md` | aktiv / Architektur-Notiz | human-readable Runner-Framework fuer den Anschluss von Batch-Task-Auswahl, erlaubten Pfaden, Work-Log/Status-Evidence, Cross-Reference Maintenance, PR-Diff-Report und PR-Post-Creation-Guard | `project-register/batch-execution-runner-policy.json` | vor jeder Runner-Aktivierung lesen; keine parallele Architektur anlegen und nur separate Human-Review-Aktivierung fuer spaetere Ein-Task-Ausfuehrung |
| `scripts/wellfit-dev-agent/src/batch-execution-runner-check.mjs` | aktiv / Code | validiert die Runner-Policy gegen Batch-Limited-Execution, Batch-Dry-Run, Task Queue, Auto-Merge, Auto-Repair und PR-Post-Creation-Guard, meldet `BATCH_EXECUTION_RUNNER_READY=true/false` und fuehrt keine Tasks, PRs, Merges, Repairs oder Deployments aus | `project-register/batch-execution-runner-policy.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; echte Runner-Aktivierung bleibt deaktiviert |
| `project-register/continuity-dependency-map.json` | aktiv / Register | maschinenlesbarer Continuity-&-Dependency-Sentinel fuer offene Punkte, Follow-ups, Review-/Blocker-Status, Dependency Chains, betroffene Register, erforderliche Output-Orte und naechste Agenten-Handoffs | `docs/architecture/WELLFIT_CONTINUITY_DEPENDENCY_SENTINEL.md`, `scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs` | report-only; erstellt keine Tasks automatisch und aktiviert kein Auto-Merge, Auto-Repair, Approval, Deployment oder Runtime-Aenderungen |
| `docs/architecture/WELLFIT_CONTINUITY_DEPENDENCY_SENTINEL.md` | aktiv / Architektur-Notiz | menschliche Anleitung fuer den Sentinel, Abgrenzung zu Cross-Reference Maintenance und Task Status Sync, Entry-Pflege, Task-Queue-Ueberfuehrung und Erhalt von `review_required`/`blocked` Items | `project-register/continuity-dependency-map.json` | vor Governance-/Framework-Abschluss lesen, um offene Punkte und Required-Next-Files nicht zu vergessen |
| `scripts/wellfit-dev-agent/src/continuity-dependency-check.mjs` | aktiv / Code | validiert Sentinel-Top-Level-Felder, Statuswerte, Dependency-Typen, Entry-Pflichtfelder, Referenzen, Work-Map-/TODO-Index-Verweise und schreibt `scripts/wellfit-dev-agent/output/continuity-dependency-report.md` | `project-register/continuity-dependency-map.json`, `scripts/wellfit-dev-agent/src/quality-gate.mjs` | im Quality Gate report-only ausfuehren; schreibt nur den Report und erstellt keine Tasks/PR-Aktionen |
| `scripts/wellfit-dev-agent/src/suggest-next-agent-task.mjs` | aktiv / Code | liest Agent Task Queue, Risk Classifier, Definition of Done, Current State und Work Map und schlaegt den sichersten nicht-blockierten Task vor | `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json` | vor autonomer Task-Auswahl ausfuehren |
| `scripts/wellfit-dev-agent/src/follow-up-detector.mjs` | aktiv / Code | erkennt Follow-up-Kategorien aus Work Map, Current State, Task Queue und optionalen Internal-Source-/Feedback-Registern report-only | `project-register/agent-follow-ups.json`, `project-register/risk-classifier.json` | nach PR-/Task-Arbeit und im Quality Gate ausfuehren |
| `scripts/wellfit-dev-agent/src/pr-outcome-recorder.mjs` | aktiv / Code | validiert PR-Outcome-Daten im Dry-Run und definiert lokales Append-Format fuer `agent-work-log.json` | `project-register/agent-work-log.json`, `docs/architecture/WELLFIT_AGENT_MEMORY_LOOP.md` | nach PR-Abschluss dry-run nutzen; Schreibmodus nur mit explizitem Flag |
| `scripts/wellfit-dev-agent/src/todo-status-sync.mjs` | aktiv / Code | validiert TODO-Statusmarker und meldet fehlende Fuehrungsdatei-Links in NEXT_ACTIONS/TODO_INDEX ohne Rewrite | `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md` | nach TODO-Aenderungen und im Quality Gate ausfuehren |
| `project-register/task-status-policy.json` | aktiv / Register | maschinenlesbare report-only Policy fuer kanonische Task-Statusmarker, Lifecycle-Regeln, Work-Log-/Progress-Log-Pflichtfelder, PR-/Changed-File-/Check-/Follow-up-/Next-Task-Evidence und Batch-Session-Grenzen | `docs/architecture/WELLFIT_TASK_STATUS_AND_WORK_LOG_SYNC.md`, `scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs` | vor laengeren Autopilot-/Batch-Sessions lesen; nicht als Auto-Rewrite-/Merge-/Repair-Autorisierung verwenden |
| `docs/architecture/WELLFIT_TASK_STATUS_AND_WORK_LOG_SYNC.md` | aktiv / Architektur-Notiz | menschliches Runbook fuer Status-/Work-Log-Sync ueber TODO-Dateien, Task Queue, Progress Log, Agent Work Log, PR Outcome, PR Review, Auto-Merge-Report und Auto-Repair-Report | `project-register/task-status-policy.json` | bestehende Agent-Memory-Struktur erweitern; keine Parallelarchitektur anlegen |
| `scripts/wellfit-dev-agent/src/task-status-work-log-check.mjs` | aktiv / Code | validiert `task-status-policy.json`, `agent-work-log.json`, `progress-log.json`, `TODO_INDEX.md` und `NEXT_ACTIONS.md` report-only, meldet `TASK_STATUS_SYNC_READY=true/false` und schreibt keine Dateien automatisch um | `project-register/task-status-policy.json`, `project-register/agent-work-log.json`, `project-register/progress-log.json` | im Quality Gate report-only ausfuehren; Warnungen fuer Legacy-Eintraege transparent berichten |
| `scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs` | aktiv / Code | liest PR-Diff-Policy, Repository Inventory, Product Readiness, Cross-Reference Maintenance und Git-Changed-Files, meldet `PR_DIFF_REVIEW_READY=true/false` und schreibt den Report nach `scripts/wellfit-dev-agent/output/pr-diff-review-report.md` | `project-register/pr-diff-review-policy.json`, `project-register/repository-inventory.json`, `project-register/product-readiness.json` | im Quality Gate report-only ausfuehren; keine Auto-Approval-, Merge-, Repair-, Deploy- oder Runtime-Aktion |

## Querverweis-Regel
Jede wichtige TODO-Datei soll enthalten:
- Link zur fuehrenden Datei
- Link zu verwandten TODOs
- Link zu betroffenen Code-Dateien
- KI-Fortsetzungs-Prompt
- Status: offen, in Arbeit, erledigt, duplikat, veraltet oder zu pruefen

## Uebernahme-Regel aus Alt-TODOs
Wenn neue zentrale TODO-Dateien angelegt werden, muessen relevante Inhalte aus alten TODO-Dateien uebernommen oder zumindest hier verlinkt werden. Keine Alt-Datei darf ignoriert werden.

- Website Readiness Baseline Audit wurde am 2026-05-16 docs/register-only auf Branch `website-readiness-baseline-audit` erfasst: `docs/architecture/WELLFIT_WEBSITE_AGENT_BACKLOG.md` enthaelt den Report fuer Public-, Legal-, Desktop-Beta-, Mobile/PWA- und Protected-Routes; `project-register/website-readiness.json` enthaelt die Baseline-Summary und unterstuetzte Readiness-Eintraege fuer bereits registrierte Subroutes; `project-register/website-agent-backlog.json` markiert WAB-001 als erledigt und dokumentiert die Visual-/Mobile-Evidence-Luecke. Keine Runtime-/Legal-/Mobile-/Protected-Code-Aenderungen, keine Unity/PR-#13-Aenderungen, kein Auto-Merge, keine Auto-Repair, keine Approval- oder Deployment-Aktivierung.

## KI-Fortsetzungs-Prompt
Lies diesen Index zuerst, wenn du mit TODOs arbeitest. Suche danach alle TODO-Dateien im Repository. Ergaenze gefundene Dateien in diesem Index. Uebertrage wichtige offene Aufgaben nach `NEXT_ACTIONS.md`. Loesche keine TODO-Dateien. Markiere doppelte oder veraltete Inhalte nur und setze Verweise auf die fuehrende Datei.

## Codebase Feature Map

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|
| `todolist/CODEBASE_FEATURE_MAP.md` | aktiv | Bestandskarte vorhandener Codebereiche gegen Doppelarbeit | `MASTER_OPEN_DONE_LIST.md` | vor grossen Codebloecken pruefen |


## Repository Inventory / Coverage Audit

- [x] `project-register/repository-inventory.json` is the machine-readable full-repository inventory for mapped, protected, unmapped, stale/duplicate, module/topic, risk, and follow-up coverage.
- [x] `docs/architecture/WELLFIT_REPOSITORY_INVENTORY_AUDIT.md` documents how future agents should use the inventory without creating duplicate architecture or touching protected runtime areas.
- [x] `scripts/wellfit-dev-agent/src/repository-inventory-check.mjs` validates inventory coverage in report-only mode and is included in the quality gate as warning-based triage.
- [x] 2026-05-15 first safe inventory triage pass mapped documentation/register/public/script groups into existing repository inventory topics, reduced unmapped inventory noise from 421 to 275, and marked sensitive/unclear safe files as `review_required` for later review without touching runtime product code.
- [x] 2026-05-16 Round 2 read-only inventory triage mapped `app/**`, `components/**`, `lib/**`, and `functions/**` runtime-adjacent files into existing repository inventory topics, reduced unmapped inventory noise from 275 to 71, and marked 103 sensitive or authority-adjacent runtime references as `review_required` without modifying product code.

- [x] Erste Human-Mobile/PWA-Evidence am 2026-05-16 docs/register-only erfasst: Phone Chrome `/mobile/ar` Kamera und Buddy sichtbar = `pass`, Buddy final = `review_required`/`expected_incomplete`, fehlendes Device Model = `missing_device_metadata`/`device_test_required`, Desktop-Responsive-Screenshots als externe Smoke-Evidence dokumentiert; keine Screenshots/Binaries/Rohdaten oder Runtime-/Protected-Code-Aenderungen.

## Approved Agent Build Runner and Merge Gate (2026-05-16)

- [x] `project-register/approved-agent-build-runner-policy.json` — report-only Policy fuer kuenftige sequenzielle Approved-Agent-Builds mit Missing-Check-Merge-Blockade, Safe-Repair-Grenzen, Merge-Gate-Pflichtchecks und `maxAgentsPerRun: 1`.
- [x] `project-register/agent-build-runner-state.json` — report-only Statusregister fuer Runner-Dry-Run, Repair- und Merge-Gate-Evidenz ohne Agent-Build, PR-Erstellung, Repair, Merge, Approval oder Deploy.
- [x] `project-register/approved-agent-build-runner-merge-gate.json` — report-only Gate-Register mit korrigierter Semantik: `GATE_CONFIGURATION_READY=true` bedeutet gueltige Konfiguration; `MERGE_READY=false` bleibt erwarteter Merge-Readiness-Blocker, ohne Validator/Quality-Gate zu failen.
- [x] `docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md` — Architektur und KI-Fortsetzungs-Prompt fuer Runner, Merge Gate, PR-#109-Risiko, Missing-Check-Handling und Protected-Scope-Stopps.
- [x] `scripts/wellfit-dev-agent/src/approved-agent-build-runner-check.mjs` — report/check-only Validator fuer Policy, State, erlaubte/verbotene Pfade, Pflichtchecks, Safe Repair, Unsafe Stop, Missing Checks und Work-Map-/TODO-Index-Referenzen.
- [x] `scripts/wellfit-dev-agent/src/approved-agent-build-runner-dry-run.mjs` — report-only Dry Run fuer die Auswahl genau eines naechsten already-approved Backlog-Agenten ohne Build, PR, Merge, Repair oder Deploy.
- [x] `scripts/wellfit-dev-agent/src/approved-agent-build-runner-merge-gate-check.mjs` — report-only Merge-Gate-Validator, der `MERGE_READY=false` bei `GATE_CONFIGURATION_READY=true` akzeptiert und fehlende Checks weiter als Merge-Blocker meldet.
- [x] `scripts/wellfit-dev-agent/src/quality-gate.mjs` — bindet Approved-Agent-Build-Runner-Check, Dry Run und Merge-Gate-Check report-only in das bestehende Quality Gate ein.

## Multisensory Learning Engine / Approved Agent Build Runner Activation (2026-05-16)

| Topic | Leading files | Status | Notes |
|---|---|---|---|
| Multisensory Learning Engine | `project-register/multisensory-learning-engine.json`, `docs/architecture/WELLFIT_MULTISENSORY_LEARNING_ENGINE.md`, `scripts/wellfit-dev-agent/src/multisensory-learning-engine-check.mjs` | report_only / active | First controlled Approved Agent Build Runner activation built exactly one approved framework. No runtime learning personalization, AR/Unity behavior, protected-data tracking/profiling, reward authority, mission-completion authority, token/NFT/wallet/payment/betting behavior, auto-merge, auto-repair, approval, deploy, or PR #13 action is enabled. |


### Supervised GitHub Runner Integration (2026-05-23 follow-up)

- `docs/architecture/WELLFIT_AGENT_SUPERVISED_RUNNER_GITHUB_INTEGRATION.md` - Architektur + Status-Semantik fuer ehrliche metadata/not-implemented Runner-Zustaende; `pr_created`/`auto_merged` nur bei echter GitHub API Response.

## Product Intelligence Agent report-only references - 2026-05-17

- `project-register/product-intelligence-agent.json` - canonical report-only Product Intelligence Agent register for evidence-based product prioritization and decision-brief boundaries.
- `docs/architecture/WELLFIT_PRODUCT_INTELLIGENCE_AGENT.md` - architecture explanation and continuation prompt for Product Intelligence without runtime authority.
- `scripts/wellfit-dev-agent/src/product-intelligence-agent-check.mjs` - validator that writes `scripts/wellfit-dev-agent/output/product-intelligence-agent-report.md` and reports `PRODUCT_INTELLIGENCE_AGENT_READY=true/false`.
- Related governance references: `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-build-proposals.json`, `project-register/agent-build-runner-state.json`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/agent-autopilot.json`, `project-register/continuity-dependency-map.json`.

### Mission Factory Agent report-only framework (2026-05-17)

- `project-register/mission-factory-agent.json` - canonical report-only Mission Factory Agent register for mission concept inventory, planning briefs, dependency maps, readiness checklists, safety boundary reports, human-review questions, server-authority boundaries, and protected-topic review stops.
- `docs/architecture/WELLFIT_MISSION_FACTORY_AGENT.md` - human-readable Mission Factory architecture note and KI-Fortsetzungs-Prompt; no runtime mission generation, mission-completion authority, reward authority, anti-cheat authority, protected-data behavior, Unity/AR/native behavior, or deployment.
- `scripts/wellfit-dev-agent/src/mission-factory-agent-check.mjs` - validator that writes `scripts/wellfit-dev-agent/output/mission-factory-agent-report.md` and reports `MISSION_FACTORY_AGENT_READY=true/false`.
- `scripts/wellfit-dev-agent/src/quality-gate.mjs` - now includes the Mission Factory Agent validator as a required report-only governance check.

### Healthy Retention Agent report-only framework (2026-05-17)

- `project-register/healthy-retention-agent.json` - canonical report-only Healthy Retention Agent register for wellbeing-first retention reviews, pause/recovery checklists, user-agency and opt-out checks, dark-pattern boundaries, aggregate feedback theme summaries, and human-review questions.
- `docs/architecture/WELLFIT_HEALTHY_RETENTION_AGENT.md` - architecture note defining allowed report-only outputs, forbidden retention/profiling/notification/streak/reward/mission/protected implementation outputs, and review-required boundaries.
- `scripts/wellfit-dev-agent/src/healthy-retention-agent-check.mjs` - validator for Healthy Retention register fields, source references, non-authorizing signals, Work Map/TODO Index links, and quality-gate readiness.
- `scripts/wellfit-dev-agent/src/quality-gate.mjs` - includes the Healthy Retention Agent validator as a required report-only governance check.
- Status: `report_only / built`; no runtime product files, retention automation, user profiling, notification triggers, streak/reward modifications, reward authority, mission-completion authority, protected data logic, Unity/PR #13, deployment, approval, merge, or repair authority were added.


## Agent autonomy update 2026-05-17

- `project-register/approved-agent-build-runner-policy.json` and `project-register/agent-autopilot.json` now describe `single_agent_docs_register_build` for already-human-approved docs/register/validator agent builds.
- Follow-up: build approved agents one at a time, starting from the approved backlog order, without runtime/protected changes.

## Agent Control Center planning references - 2026-05-17

- [x] `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER_GAP_ANALYSIS.md` - gap analysis showing existing Agent Catalog, Task Queue, Approved Build Backlog, Autopilot, Risk Classifier, Definition of Done, Quality Gate, proposal, approval, research, audit and human-approval structures; recommends Phase 1 without OpenAI Agents SDK and Phase 2 SDK evaluation only if real orchestration/tracing/tool-runtime need appears.
- [x] `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER.md` - concept for proposal visibility, admin/owner roles, proposal lifecycle, risk gates, controlled curiosity, Codex task draft generation and future read-only Admin UI path without runtime automation.
- [x] `project-register/agent-control-center.json` - machine-readable Control Center policy for roles, statuses, risk levels, approval rules, protected scopes, blocked auto actions, Codex task generation and controlled curiosity.
- [x] `project-register/agent-proposals.json` - initial UI-ready proposal examples for Product Intelligence Review, Website UX Audit, MVP Scope Check, Controlled Research Request, Codex Task Generation and Admin Agent Center UI Planning.
- [x] `scripts/wellfit-dev-agent/src/agent-control-center-check.mjs` - report-only validator for Control Center registers, required proposal fields, high/critical auto-execute blocking, auto-merge/deploy false, protected-scope blocking, human approval and controlled curiosity boundaries.
- [x] `scripts/wellfit-dev-agent/src/quality-gate.mjs` - integrates the Agent Control Center validator report-only into the existing quality gate.

## Approved Agent Planning Artifacts 2026-05-17

| Datei | Status | Zweck | Fuehrende Quelle | Hinweis |
| --- | --- | --- | --- | --- |
| `docs/architecture/WELLFIT_PRODUCT_MEMORY_AGENT.md` | aktiv / Architektur-Notiz | report-only Architektur fuer Product Memory Agent und Bernds lernendes Konzeptverstaendnis | `project-register/product-memory-agent.json` | Prioritaet 1; keine Runtime, keine Nutzerprofilierung |
| `docs/architecture/WELLFIT_AI_BUDDY_PERSONALITY_TONE_GUARD.md` | aktiv / Architektur-Notiz | report-only Architektur fuer Buddy-Persoenlichkeit und Tonalitaetsgrenzen | `project-register/ai-buddy-personality-tone-guard.json` | Prioritaet 2; keine Buddy-Runtime oder UI-Ausfuehrung |
| `docs/architecture/WELLFIT_REWARD_FAIRNESS_GUARD_REPORT_AGENT.md` | aktiv / Architektur-Notiz | report-only Guard-Architektur fuer Reward-Fairness | `project-register/reward-fairness-guard-report-agent.json` | kritischer Guard nur report-only; keine Reward-Autoritaet |
| `docs/architecture/WELLFIT_CHILD_SAFETY_GUARD_REPORT_AGENT.md` | aktiv / Architektur-Notiz | report-only Guard-Architektur fuer Child Safety | `project-register/child-safety-guard-report-agent.json` | kritischer Guard nur report-only; keine Runtime-/Policy-Aenderung |
| `docs/architecture/WELLFIT_CHILD_SAFETY_GUARD.md` | aktiv / Architektur-Notiz / blocked | Child-Safety-Guard fuer altersgerechte Sprache, sichere Bewegungsaufforderungen, Standortschutz, private Kinderdaten, soziale Risiken und manipulative Retention | `project-register/child-safety-guard.json`, `scripts/wellfit-dev-agent/src/child-safety-guard-check.mjs`, `project-register/ethical-engagement-guard.json`, `project-register/healthy-retention-agent.json`, `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` | Runtime-Child-Safety-Logik bleibt blockiert bis ein expliziter Reviewplan existiert |
| `docs/architecture/WELLFIT_HEALTH_CLAIMS_GUARD_REPORT_AGENT.md` | aktiv / Architektur-Notiz | report-only Guard-Architektur fuer Health Claims | `project-register/health-claims-guard-report-agent.json` | kritischer Guard nur report-only; keine medizinischen Claims aendern |
| `docs/architecture/WELLFIT_HEALTH_CLAIMS_GUARD.md` | aktiv / Architektur-Notiz / Pointer | stabiler Legacy-/Kurzlink zum Health Claims Guard Report Agent | `docs/architecture/WELLFIT_HEALTH_CLAIMS_GUARD_REPORT_AGENT.md` | keine Diagnose, Therapie oder Health-Runtime-Autoritaet |
| `docs/architecture/WELLFIT_LOCATION_SAFETY_GUARD_REPORT_AGENT.md` | aktiv / Architektur-Notiz | report-only Guard-Architektur fuer Location Safety | `project-register/location-safety-guard-report-agent.json` | kritischer Guard nur report-only; keine Standort-/AR-Runtime aendern |
| `docs/architecture/WELLFIT_LOCATION_SAFETY_GUARD.md` | aktiv / Architektur-Notiz / Pointer | stabiler Legacy-/Kurzlink zum Location Safety Guard Report Agent | `docs/architecture/WELLFIT_LOCATION_SAFETY_GUARD_REPORT_AGENT.md` | keine Live-Standortverarbeitung oder AR-Runtime-Autoritaet |
| `docs/architecture/WELLFIT_KNOWLEDGE_CORE.md` | aktiv / Architektur-Notiz | referenzierender Wegweiser fuer WellFit Vision, Move-Learn-Social-Earn, Buddy, Missionen, Challenges, interne Punkte/XP, Token-/NFT-Grenzen, Safety Boundaries, Nutzergruppen und offene Produktfragen | `project-register/wellfit-knowledge-core.json`, `project-register/concept-learning-agent.json` | nur als kurze Quellenkarte pflegen; keine Runtime-Autoritaet |
| `project-register/wellfit-knowledge-core.json` | aktiv / Register / report_only | maschinenlesbarer Knowledge-Core-Begleiter mit Quellenpolitik, Abschnittsindex, offenen Produktfragen, Runtime-Boundaries und Concept-Learning-Agent-Verbindung | `docs/architecture/WELLFIT_KNOWLEDGE_CORE.md`, `project-register/concept-learning-agent.json` | synchron mit Markdown halten; keine Runtime-/Reward-/Token-Autoritaet |

<!-- WELLFIT-GENERATED-APPROVED-AGENT:sponsor-integrity-guard-report-agent:todolist/TODO_INDEX.md -->

## Generated approved-agent reference: Sponsor Integrity Guard Report Agent

- Status: report-only artifact generated from `project-register/approved-agent-build-backlog.json` on 2026-05-17.
- Backlog entry: `sponsor-integrity-guard-report-agent`.
- Required docs: `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md`.
- Required registers: `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-extension-policy.json`, `project-register/website-agent-backlog.json`, `project-register/pr-review-policy.json`, `project-register/product-readiness.json`.
- Required validation scripts: `scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs`.
- Boundary: generated governance evidence only; no runtime/protected, merge, deploy, approval, reward-authority, mission-completion-authority, economy, native, Unity, or repair authority.


<!-- WELLFIT-GENERATED-APPROVED-AGENT:trust-safe-monetization-agent-report-agent:todolist/TODO_INDEX.md -->

## Generated approved-agent reference: Trust-Safe Monetization Agent Report Agent

- Status: report-only artifact generated from `project-register/approved-agent-build-backlog.json` on 2026-05-17.
- Backlog entry: `trust-safe-monetization-agent-report-agent`.
- Required docs: `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md`.
- Required registers: `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-extension-policy.json`, `project-register/risk-classifier.json`, `project-register/website-agent-backlog.json`, `project-register/auto-merge-policy.json`.
- Required validation scripts: `scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs`.
- Boundary: generated governance evidence only; no runtime/protected, merge, deploy, approval, reward-authority, mission-completion-authority, economy, native, Unity, or repair authority.


<!-- WELLFIT-GENERATED-APPROVED-AGENT:user-memory-governance-agent-report-agent:todolist/TODO_INDEX.md -->

## Generated approved-agent reference: User Memory Governance Agent Report Agent

- Status: report-only artifact generated from `project-register/approved-agent-build-backlog.json` on 2026-05-17.
- Backlog entry: `user-memory-governance-agent-report-agent`.
- Required docs: `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md`.
- Required registers: `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-extension-policy.json`, `project-register/adaptive-user-insights.json`, `project-register/user-feedback.json`, `project-register/risk-classifier.json`.
- Required validation scripts: `scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs`.
- Boundary: generated governance evidence only; no runtime/protected, merge, deploy, approval, reward-authority, mission-completion-authority, economy, native, Unity, or repair authority.


<!-- WELLFIT-GENERATED-APPROVED-AGENT:recovery-pause-anti-overuse-guard-report-agent:todolist/TODO_INDEX.md -->

## Generated approved-agent reference: Recovery / Pause / Anti-Overuse Guard Report Agent

- Status: report-only artifact generated from `project-register/approved-agent-build-backlog.json` on 2026-05-17.
- Backlog entry: `recovery-pause-anti-overuse-guard-report-agent`.
- Required docs: `docs/architecture/WELLFIT_AGENT_CATALOG_AND_APPROVED_BUILD_BACKLOG.md`.
- Required registers: `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-extension-policy.json`, `project-register/risk-classifier.json`, `project-register/adaptive-user-insights.json`, `project-register/product-readiness.json`.
- Required validation scripts: `scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs`.
- Boundary: generated governance evidence only; no runtime/protected, merge, deploy, approval, reward-authority, mission-completion-authority, economy, native, Unity, or repair authority.

## Beta 1 scope, agent pack and data model

| Datei | Status | Zweck | Fuehrende / verknuepfte Dateien | Naechste Aktion |
| --- | --- | --- | --- | --- |
| `docs/beta/WELLFIT_BETA1_SCOPE.yaml` | canonical_beta_1_scope | Kanonischer Beta-1-Scope: closed/free Beta, WellFit-XP/WFXP, Family/Guardian, Child-Safety, Shop, Mayor, Reality Glitch und ausgeschlossene Token-/Cashout-/NFT-/Real-Money-Themen | `docs/beta/AGENTS_WELLFIT_BETA1.md`, `docs/beta/WELLFIT_BETA1_DATA_MODEL.md` | Vor Runtime-Beta-1-PRs lesen und gegen Scope-Drift pruefen |
| `docs/beta/AGENTS_WELLFIT_BETA1.md` | aktiv / Agent-Runbook | Human-readable Beta-1-Agent-Pack; erweitert `AGENTS.md`, ersetzt es nicht, und erteilt keine Runtime-Autoritaet | `agents/beta1/`, `project-register/agent-catalog.json` | Fuer kuenftige Backend/Rules/Functions-Handoffs verwenden |
| `docs/beta/WELLFIT_BETA1_DATA_MODEL.md` | aktiv / Data-Model-Planung | Firestore-Collections, bestehende Collection-Mappings, Firebase-Function-Plan und Server-Authority-Grenzen fuer Beta 1 | `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml`, `firestore.rules` | Als Grundlage fuer separaten genehmigten Runtime-PR nutzen |
| `agents/beta1/` | aktiv / docs-register agents | Einzelne Beta-1-Agent-Runbooks fuer Scope, Data Model, API Contracts, Rules Guard, Child Safety, XP Economy, Missions, Mayor, Reality Glitch, Shop und QA Emulator | `docs/beta/AGENTS_WELLFIT_BETA1.md`, `project-register/agent-catalog.json` | Nur planen/validieren; Runtime erst nach separater Human Approval |
| `docs/beta/prompts/CODEX_PROMPT_BETA1_AGENTS_DATA_MODEL.md` | aktiv / Prompt | Auftragsprompt fuer Beta-1 Scope-, Agent- und Datenmodell-Platzierung; nur docs/register, keine Runtime-Dateien | `docs/beta/WELLFIT_BETA1_SCOPE.yaml`, `docs/beta/AGENTS_WELLFIT_BETA1.md` | Nach Ausfuehrung als historische Prompt-Quelle behalten |
| `docs/beta/prompts/CODEX_PROMPT_BETA1_RUNTIME_FIRESTORE_FUNCTIONS.md` | aktiv / Runtime-Handoff-Prompt | Exakt gescopter Codex-Prompt fuer den naechsten Beta-1 Runtime-PR zu Firestore Rules, Firebase Functions und Emulator Tests; dieser Plan-PR aendert keine Runtime-Dateien | `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml`, `agents/beta1/firestore-rules-guard-agent.md`, `agents/beta1/qa-emulator-agent.md` | Naechster Runtime-Branch: `runtime/beta1-firestore-functions-emulator-tests` |
| `docs/beta/prompts/CODEX_PROMPT_BETA1_EMULATOR_CI_VERIFICATION.md` | aktiv / Verification-Handoff-Prompt | Folgeprompt fuer echte Beta-1 Firestore-Rules- und Callable-Emulator-Verifikation, inklusive lokaler/CI-Blockerbehandlung und Human-Approval-Grenze fuer `.github/**` | `functions/test/beta1FirestoreRulesEmulatorTest.js`, `functions/test/beta1CallableFunctionsEmulatorTest.js`, `project-register/progress-log.json` | Naechster empfohlener Branch: `ci/beta1-emulator-verification`; `.github/**` nur nach separater Freigabe |
| `docs/beta/BETA1_EMULATOR_VERIFICATION.md` | aktiv / Beta-1 Emulator-Verifikations-Runbook | Aktiver Runbook- und Verifikationsnachweis fuer Beta-1 Firestore-Rules-/Callable-Emulator-Checks, CI-Workflow und bekannte lokale Emulator-Blocker | `.github/workflows/beta1-emulator-tests.yml`, `functions/test/beta1FirestoreRulesEmulatorTest.js`, `functions/test/beta1CallableFunctionsEmulatorTest.js`, `project-register/progress-log.json` | Bei Beta-1-Emulator-Reviews und CI-Nachweisen als fuehrenden Verifikations-/Runbook-Eintrag nutzen |
| `docs/architecture/WELLFIT_ADMIN_APPROVED_AGENT_AUTONOMY.md` | aktiv / Architektur-Notiz | Bestehender Pointer zur Admin-approved Agent Autonomy Governance, damit TODO-Index/Quality-Gate keine fehlende Fuehrungsreferenz meldet | `project-register/agent-catalog.json` | Nur in einem separaten Governance-Auftrag inhaltlich pruefen |
| `docs/architecture/WELLFIT_AGENT_OWNER_APPROVAL_RUNTIME_WORKFLOW.md` | aktiv / Architektur-Notiz | Bestehender Pointer zum Owner-Approval Runtime Workflow, damit TODO-Index/Quality-Gate keine fehlende Fuehrungsreferenz meldet | `project-register/agent-catalog.json` | Nur in einem separaten Governance-Auftrag inhaltlich pruefen |


## Beta-1 neue Planungs-/Prompt-Artefakte (2026-05-20)

- `docs/beta/BETA1_CLIENT_READ_PROJECTIONS_PLAN.md`
- `docs/beta/BETA1_ADMIN_PANEL_INTEGRATION_PLAN.md`
- `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md`
- `docs/beta/prompts/CODEX_PROMPT_BETA1_CLIENT_READ_PROJECTIONS.md`
- `docs/beta/prompts/CODEX_PROMPT_BETA1_ADMIN_PANEL_INTEGRATION.md`

## Beta-1 Demo Seed/Testuser Planung (2026-05-20)

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `docs/beta/BETA1_SEED_DEMO_CONTENT_PLAN.md` | neu / planning_only | Demo-Missionen, Checkpoints, Glitches, Shop- und Avatar-Ideen fuer Wave-1 (25-50), nur planned seed templates | `docs/beta/WELLFIT_BETA1_SCOPE.yaml` | als Grundlage fuer manuellen Admin-Seed nutzen; keine Auto-Writes |
| `docs/beta/BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md` | neu / planning_only | Testrollen, Einschluss/Ausschluss, Stop-Conditions und 25 Platzhalter-Tester fuer Closed Beta | `docs/beta/WELLFIT_BETA1_SCOPE.yaml` | nur Platzhalter nutzen; keine echten personenbezogenen Daten |
| `lib/admin/beta1DemoSeedTemplates.ts` | neu / static_templates | Statische no-write Demo-Objekte fuer Mission, Checkpoint, Glitch, Shop, Avatar und Testuser-Placeholder | `lib/admin/beta1SmokeTemplates.ts` | optional als Eingabehilfe fuer manuelle `/admin/beta1`-Runs verwenden |
| `docs/beta/prompts/CODEX_PROMPT_BETA1_MANUAL_SEED_RUNBOOK.md` | neu / prompt_handoff | Folgeprompt fuer spaeteren manuellen Seed-Lauf ueber bestehendes Admin-Panel | `docs/beta/BETA1_ADMIN_CLIENT_E2E_SMOKE_PLAN.md` | naechster Task: `ops/beta1-manual-demo-seed-runbook` |
| `docs/beta/BETA1_MANUAL_DEMO_SEED_RUNBOOK.md` | neu / beta_runbook | Ausfuehrbares manuelles Admin-Runbook fuer Beta-1 Demo-Seed (Missionen, Checkpoints, Glitches, optionale Shop/Avatar-Items, Testuser nur Platzhalter) mit Safety-/Stop-/Go-No-Go-Regeln | `docs/beta/BETA1_SEED_DEMO_CONTENT_PLAN.md`, `lib/admin/beta1DemoSeedTemplates.ts` | fuer kontrollierte manuelle `/admin/beta1`-Seeding-Durchlaeufe nutzen; keine Auto-Writes |
| `docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md` | neu / evidence_template | Kopierbare Evidence-Tabelle fuer manuelle Seed-Runs mit pass/fail/blocked und Safety-Checklist | `docs/beta/BETA1_MANUAL_DEMO_SEED_RUNBOOK.md` | bei jedem manuellen Seed-Lauf ausfuellen und ohne sensitive Daten ablegen |

| `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md` | neu / readiness_matrix | Objektive Beta-1 Pilot-Go/No-Go Matrix fuer AT Wave 1 (25-50) mit Kategorien, Evidence-Anforderungen, Must-be-Green-Gate und No-Go-Regeln | `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md`, `docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md` | vor jeder Wave-1-Freigabe als fuehrende Entscheidungsbasis nutzen |
| `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md` | neu / readiness_checklist | Operative Freigabe-Checkliste fuer Manual Seed, Device-Checks, Dashboard-Sichtbarkeit, Support-Kontakt, Guardian/Child- und Privacy-Checks | `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md` | vor Testerfreigabe vollstaendig abhaken |
| `docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md` | neu / pilot_support_ops | Support- und Incident-Runbook fuer Beta-1 Wave 1 mit P0-P3 Logik, Stop Conditions und Incident-Evidence-Template | `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`, `docs/beta/BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md` | fuer Incident-Triage und Pilot-Pause-Entscheidungen verwenden |
| `docs/beta/prompts/CODEX_PROMPT_BETA1_PILOT_READINESS_EXECUTION.md` | neu / prompt_handoff | Folgeprompt fuer Evidence-Ausfuehrungs-PR auf Branch `readiness/beta1-pilot-evidence-run` (manual seed/device/dashboard/support evidence) | `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`, `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md` | naechster empfohlener Task: `readiness/beta1-pilot-evidence-run` |

| `docs/beta/BETA1_PILOT_EVIDENCE_RUN.md` | aktiv / Beta-Readiness Evidence | erster konsolidierter Evidence-Run fuer AT Closed Beta Wave 1 mit konservativer GREEN/YELLOW/TBD/RED-Bewertung und fehlender Evidence-Liste | `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md`, `docs/beta/BETA1_PILOT_READINESS_CHECKLIST.md`, `docs/beta/BETA1_PILOT_EVIDENCE_SUMMARY.md` | vor Wave-1-Go/No-Go aktualisieren; ohne Runtime-/PII-Aenderung pflegen |
| `docs/beta/BETA1_PILOT_EVIDENCE_SUMMARY.md` | aktiv / Beta-Readiness Summary | Executive Summary des Pilot-Evidence-Runs inkl. GREEN, YELLOW/TBD, RED und naechster Gap-Close-Schritte | `docs/beta/BETA1_PILOT_EVIDENCE_RUN.md`, `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md` | als Entscheidungsuebersicht vor Pilotfreigabe verwenden |

| `docs/beta/BETA1_PILOT_EVIDENCE_GAPS_CLOSE_PLAN.md` | aktiv / beta readiness | strukturierter Gap-Close-Plan fuer offene Wave-1 Evidence-Luecken inkl. Human-Only-Kennzeichnung | `docs/beta/BETA1_PILOT_GO_NO_GO_MATRIX.md` | als Fuehrung fuer Human Evidence Capture verwenden; kein GREEN ohne Nachweis |
| `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` | aktiv / beta evidence template | einheitliches Evidence-Pack mit 10 Sektionen und no-PII-Feldern | `docs/beta/BETA1_PILOT_EVIDENCE_GAPS_CLOSE_PLAN.md` | fuer alle manuellen Evidence-Runs kopieren/ausfuellen |
| `docs/beta/BETA1_PILOT_STOP_COMMUNICATION_TEMPLATE.md` | aktiv / beta incident comms | Platzhalter fuer Pilot-Pause/Stop-Kommunikation ohne PII/Schuldzuweisung | `docs/beta/BETA1_PILOT_SUPPORT_RUNBOOK.md` | bei NO-GO/Stop-Conditions verwenden |
| `docs/beta/prompts/CODEX_PROMPT_BETA1_PILOT_HUMAN_EVIDENCE_CAPTURE.md` | aktiv / follow-up prompt | Folgetask fuer human evidence capture auf eigenem Readiness-Branch | `docs/beta/BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md` | nach diesem Gap-Close-PR als naechsten Schritt nutzen |

## Update 2026-05-21 - Beta1 Agent Admin + Live Readiness Masterplan

- Masterplan erstellt: `docs/beta/BETA1_AGENT_ADMIN_AND_LIVE_READINESS_MASTERPLAN.md`.
- Agent-Admin Server Roles/Audit Plan erstellt: `docs/beta/AGENT_ADMIN_SERVER_ROLES_AUDIT_PLAN.md`.
- Live Pages Readiness Plan erstellt: `docs/beta/BETA1_LIVE_PAGES_READINESS_PLAN.md`.
- Folgeprompts erstellt: `CODEX_PROMPT_AGENT_ADMIN_SERVER_ROLES_AUDIT.md`, `CODEX_PROMPT_BETA1_LIVE_PAGES_RUNTIME_PLAN.md`; Human-Evidence-Prompt auf Masterplan verwiesen.
- Bestaetigt: keine Runtime-Dateien/Firebase-Functions/Firestore-Rules geaendert; keine Pilotfreigabe; keine Agent-Runtime-Autonomie aktiviert.
- Human evidence capture docs ergänzt: `docs/beta/BETA1_HUMAN_EVIDENCE_CAPTURE.md`, `docs/beta/BETA1_HUMAN_EVIDENCE_CAPTURE_INSTRUCTIONS.md`.
- Folgeprompts ergänzt: `docs/beta/prompts/CODEX_PROMPT_AGENT_ADMIN_SERVER_ROLES_AUDIT.md`, `docs/beta/prompts/CODEX_PROMPT_BETA1_LIVE_PAGES_RUNTIME_PLAN.md`, `docs/beta/prompts/CODEX_PROMPT_BETA1_ANALYTICS_STATS_OWN_VIEW.md`, `docs/beta/prompts/CODEX_PROMPT_BETA1_LEADERBOARD_READONLY.md`, `docs/beta/prompts/CODEX_PROMPT_BETA1_MARKETPLACE_PREVIEW.md`, `docs/beta/prompts/CODEX_PROMPT_BETA1_POINTS_SHOP_PAGE.md`, `docs/beta/prompts/CODEX_PROMPT_BETA1_PROFESSIONAL_UI_FOUNDATION.md`.
- Canonical-Truth-Handoff-Prompts referenziert: `todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md`, `todolist/CODEX_PROMPT_AGENT_CANONICAL_TRUTH_INTEGRATION.md`.
- Naechster empfohlener Branch: `plan/agent-admin-server-roles-audit-runtime-scope` (Prioritaet) oder `plan/beta1-live-pages-runtime-scope`.

- Runtime slice delivered: agent admin server roles/audit foundation (collections + callables + rules baseline).

- 2026-05-21: Runtime slice PR-Handoff Queue ergänzt (Execution-Handoff-Felder, prepare/mark/block/list Callables, requiredChecks-Metadaten, humanMergeRequired=true). Kein Auto-Merge, kein Auto-Deploy, keine automatische Codeausführung.


## 2026-05-21 Safe Codex Handoff Prompts
- Added `agentTaskHandoffPrompts` handoff model with audit-ready fields and copy-status flow.
- Added callables: `generateAgentTaskCodexPrompt`, `getAgentTaskCodexPrompt`, `markAgentTaskCodexPromptCopied`, `listAgentTaskHandoffPrompts`.
- Admin UI flow is manual-only; no auto-run, no GitHub API, no auto-merge/deploy; human merge required.
- Next recommended branch: `plan/beta1-live-pages-runtime-scope` (alternative: `runtime/agent-admin-live-page-task-template`).

## 2026-05-21 Addendum - Beta1 Live Pages Runtime Scope

- Neu: `docs/beta/BETA1_PROFESSIONAL_UI_DIRECTION.md`
- Neu: `docs/beta/BETA1_LIVE_PAGES_RUNTIME_SCOPE.md`
- Neu: `docs/beta/BETA1_LIVE_PAGES_PR_SEQUENCE.md`
- Neu: `docs/beta/AGENT_ADMIN_LIVE_PAGE_TASK_TEMPLATES.md`
- Neu: Prompts unter `docs/beta/prompts/`
  - `CODEX_PROMPT_BETA1_PROFESSIONAL_UI_FOUNDATION.md`
  - `CODEX_PROMPT_BETA1_POINTS_SHOP_PAGE.md`
  - `CODEX_PROMPT_BETA1_LEADERBOARD_READONLY.md`
  - `CODEX_PROMPT_BETA1_ANALYTICS_STATS_OWN_VIEW.md`
  - `CODEX_PROMPT_BETA1_MARKETPLACE_PREVIEW.md`
- Scope bleibt planning-only: keine Runtime-Seiten, keine globalen UI-Implementierungen, keine Functions/Rules-Aenderungen, keine Pilotfreigabe.

## Update 2026-05-21 - Beta-1 Professional UI Foundation

- `runtime/beta1-professional-ui-foundation` hat UI-Foundation-Bausteine fuer Beta-1 in `components/beta1/` eingefuehrt und bestehende Dashboard/Admin-Bereiche ohne Runtime-Authority-Aenderung umgestellt.
- Folgearbeit bleibt in separaten Runtime-Slices: `runtime/beta1-points-shop-page`, `runtime/beta1-leaderboard-readonly`, `runtime/beta1-analytics-stats-own-view`, `runtime/beta1-marketplace-preview-placeholder`.

## Update 2026-05-21 - Runtime Slice Beta1 Punkte-Shop

- Status: umgesetzt auf `runtime/beta1-points-shop-page`.
- Runtime-Route: `/shop` als WFXP-only Read-/Intent-Slice ohne clientseitige Final-Authority.
- Read-Projections: Wallet-Balance, publizierte Shop-Items (inkl. `priceWfxp`, optional `category`/`rarity`), User-Inventory.
- Keine Functions-/Rules-Aenderung; keine Payment/Token/NFT/Cashout-Aktivierung.
- Next: `runtime/beta1-leaderboard-readonly`.

## Update 2026-05-21 - Runtime Beta1 Leaderboard Read-only

- Status: umgesetzt auf `runtime/beta1-leaderboard-readonly`.
- Route: `/leaderboard` nutzt professionelles Beta1-UI und klaren Privacy-Hinweis (read-only, keine öffentlichen Kinderprofile).
- Daten: sichere Read-Projektionen für eigene Fortschrittsmetriken; bei fehlender freigegebener Leaderboard-Aggregation wird eine limitierte Vorschau ohne Fremdprofile angezeigt.
- Guardrails: keine Functions-/Rules-Aenderung, keine clientseitige Ranking-/Reward-Autorität, keine sensiblen Rohdaten.
- Next: `runtime/beta1-analytics-stats-own-view`.

- [x] 2026-05-21 Runtime-Slice `runtime/beta1-analytics-stats-own-view` umgesetzt: `/analytics` als Beta-1 Analytics/Stats Own-View mit sicheren Read-Projections und Limited-Preview-Fallback ohne neue Functions/Rules und ohne Client-Authority.
- [x] 2026-05-21 Runtime-Slice `runtime/beta1-marketplace-preview-placeholder` umgesetzt: `/marketplace` + `/marktplatz` Alias als safe Preview/Placeholder mit Beta1 Foundation UI-Bausteinen.
- [x] Guardrails bestaetigt: keine echten Listings/Trades, keine Wallet-/Token-/NFT-/Cashout-/Payment-Semantik, keine Firestore Writes, keine neuen Functions, keine Rules-Aenderung, keine Client-Final-Authority.
- [>] Next: `readiness/beta1-live-pages-navigation-and-device-smoke` (alternativ `runtime/beta1-live-pages-navigation-polish`).

- 2026-05-21: Beta-1 Live-Pages Navigation/Device-Smoke-Readiness als docs/register/navigation-Slice ergaenzt (`docs/beta/BETA1_LIVE_PAGES_NAVIGATION_DEVICE_SMOKE.md`), inklusive pending_human_device_evidence-Status und Follow-up-Branch `readiness/beta1-human-evidence-capture`.

- BETA1-HUMAN-EVIDENCE-CAPTURE-2026-05-21: docs/register/todo-only Update; Human Evidence Capture erstellt, Evidence Pack erweitert, Matrix/Checklist/Summary konservativ auf NO-GO gehalten, Support role_alias_required markiert.

- 2026-05-21: `runtime/beta1-live-pages-app-shell-fix` (layout-only) in Register/Docs aufgenommen; Live-Seiten-AppShell jetzt konsistent, Device-Evidence bleibt pending_human_device_evidence.


## Update: Agent Worker Queue Foundation
- Collection `agentTaskWorkerQueue` added as metadata-only queue with `humanMergeRequired=true`, `autoMerge=false`, `autoDeploy=false`.
- New callables: create/claim/update/checks/pr-prepared/block/list/get for worker queue.
- No automatic code execution, no GitHub API integration, no auto-merge/deploy. Human merge remains required.
- Next recommended branch: `runtime/agent-admin-supervised-pr-creation-plan` (alternative: `readiness/beta1-human-device-evidence-fill`).

- 2026-05-21: PR runtime/agent-admin-automation-gates-completion ergänzt Automation Gates (Admin-Zustimmung + required checks + quality gate/override + production second owner approval). Runner bleibt metadata_only; keine echte GitHub API, kein echtes Deploy ohne sichere Server-Secrets/Owner-Freigabe.

- 2026-05-21: Follow-up fix branch `fix/agent-admin-production-deploy-second-approval` finalisiert Production-Second-Approval: nach 2. Owner-Freigabe werden `autoDeployApproved=true`, `autoDeploy=true`, Status `approved_for_production_deploy` und Worker snapshots gesetzt. Runner bleibt `metadata_only`; weiterhin keine echte GitHub API und kein echtes Deploy. PR #210 fachlich ersetzt durch PR #211.

- 2026-05-21: Branch `fix/agent-admin-runner-deploy-gate-semantics` haertet Runner-Gate-Semantik: deployAllowed fuer preview/staging/production getrennt (production weiter nur mit zweiter Owner-Freigabe), mergeAllowed metadata ergaenzt, Worker-Statusupdates erhalten genehmigte autoMerge/autoDeploy Snapshots bei neutralen Updates. Runner bleibt metadata_only; keine echte GitHub API, kein echtes Deploy, keine Secrets/Production IDs. Naechster empfohlener Branch: `runtime/agent-admin-supervised-runner-real-github-integration`.

## Canonical Truth Pflichtquelle (Beta 1)

- `project-register/wellfit-beta1-canonical-truth.json` (fuehrend, maschinenlesbar)
- `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md` (fuehrend, menschenlesbar)
- `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md` (schneller Codex-Kontext)

Pflicht fuer Agenten/Coder vor Beta-1-relevanten Aufgaben: Codex, wellfit-dev-agent, PR-/Review-/Quality-Gate-nahe Automationsagenten und alle Dokumentations-/Register-Maintenance-Agents.


- 2026-05-22: Agent-Admin Canonical-Truth-Guardrails (Task/Approval/Handoff/Worker/Automation) aktiv, inklusive ownerApproval-Flag und proposal-only Pfad.
- 2026-05-22: Branch `fix/agent-admin-canonical-truth-worker-snapshots` ergänzt Canonical-Truth-Metadaten in Worker-Queue-Snapshots, validiert `approvedAllowedFiles` final in `approveAgentTaskProposal` und härtet `prepareAgentTaskPrHandoff` gegen inkonsistente historische Approvals. Canonical-Truth-Dateien blieben unverändert. Runner bleibt `metadata_only`; keine echte GitHub API, kein echtes Deploy. Nächster empfohlener Branch: `runtime/agent-admin-supervised-runner-real-github-integration`.

- Product Evolution Loop Governance geplant: Architektur, Research Guardrails, Opportunity Template, machine-readable Register und First-Run Prompt erstellt (planning_only).


- [x] Agent Opportunity Dossier Architektur + Schema + Templates (planning_only, no runtime changes).

- [x] Agent Ecosystem/Economy Dossier Architektur hinzugefuegt (2026-05-22).
- [x] Agent Product/Technology Radar Architektur hinzugefuegt (2026-05-22).
- [x] Agent Risk Source Classifier Register hinzugefuegt (2026-05-22).
- [x] Opportunity/Mission/Research Dossier-Templates um Ecosystem/Finance/WFP-XP/Product-Radar erweitert (2026-05-22).
\n

## Update 2026-05-23 - Agent Product Evolution / Automation Control Prompt-Index Sync

- `todolist/AGENT_MISSION_STORY_PROPOSALS.md` als Mission-Story-Dossier-Template und Governance-Planungsdatei aktiv referenziert.
- `todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md` als Opportunity-Dossier-Template aktiv referenziert.
- `todolist/AGENT_RESEARCH_SUMMARY_TEMPLATE.md` als External-Research-Summary-Template aktiv referenziert.
- `docs/architecture/WELLFIT_AGENT_AUTOMATION_CONTROL_AND_RETRY_GUARD.md` als Automation-Control/Retry-Guard Architekturreferenz aktiv indexiert.
- `docs/architecture/WELLFIT_AGENT_ECOSYSTEM_ECONOMY_DOSSIER.md` als Ecosystem/Economy-Dossier-Architekturreferenz aktiv indexiert.
- `docs/architecture/WELLFIT_AGENT_EXTERNAL_RESEARCH_GUARDRAILS.md` als External-Research-Guardrail-Architekturreferenz aktiv indexiert.
- `docs/architecture/WELLFIT_AGENT_OPPORTUNITY_DOSSIER.md` als Opportunity-Dossier-Architekturreferenz aktiv indexiert.
- `docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_LOOP.md` als Product-Evolution-Loop-Architekturreferenz aktiv indexiert.
- `docs/architecture/WELLFIT_AGENT_PRODUCT_TECH_RADAR.md` als Product/Tech-Radar-Architekturreferenz aktiv indexiert.
- `docs/beta/prompts/CODEX_PROMPT_AGENT_PRODUCT_EVOLUTION_LOOP_FIRST_RUN.md` als Product-Evolution-Loop-First-Run-Handoff-Prompt aktiv indexiert.
- `todolist/CODEX_PROMPT_AGENT_CANONICAL_TRUTH_INTEGRATION.md` bleibt der nicht-protected Companion-Prompt fuer Canonical-Truth-Integration (owner-protected Dateien bleiben read-only).

- 2026-05-23: Fix-Branch `fix/agent-github-runner-no-fake-pr-merge-status` haertet Supervised GitHub Runner Status-Semantik: kein `pr_created`/`auto_merged` ohne echte GitHub API Response; stattdessen ehrliche Status `missing_server_config` bzw. `github_api_not_implemented`. Zudem TODO/Architektur-Index-Follow-up fuer Runner-Doku synchronisiert.

| `docs/architecture/WELLFIT_AGENT_SUPERVISED_RUNNER_GITHUB_INTEGRATION.md` | aktiv | supervised runner governance inkl. metadata-only/no-fake-status Semantik bis real GitHub API umgesetzt ist | `project-register/agent-control-center.json`, `project-register/agent-task-queue.json`, `NEXT_ACTIONS.md` |


## 2026-05-23 PR/Check contract hardening
- createAgentGithubPullRequest resolves base branch from repo config and only allows safe optional override not equal runner branch.
- Admin client/UI now send `jobId`, `title`, `body`, optional `baseBranch` to PR callable.
- Required checks are matched through normalized alias mapping against GitHub check names; local-only checks are marked `local_required_not_reported`/`skipped_with_reason` and never fake-pass.
- No production deploy changes; canonical truth protected files remain unchanged.
- Next branch recommendation: `runtime/agent-admin-supervised-runner-deploy-integration` (or `analysis/agent-product-evolution-first-run`).

- 2026-05-23 update: Agent Control Center check aligned to gated automation contract; known blocker 2026-05-23-agent-control-center-check-fail resolved after PASS quality-gate run.

- 2026-05-23: Agent-Control-Center gated automation hardening abgeschlossen: Admin approval als single human decision gate dokumentiert, Auto-Merge/Deploy technisch gegated, deploy policy maschinenlesbar erzwungen, known blockers fail-closed. Kein echter Deploy/GitHub API; Canonical-Truth-Dateien unverändert. Next: runtime/agent-admin-supervised-runner-deploy-integration (alternativ analysis/agent-product-evolution-first-run).

- 2026-05-23: Report-Template-Wording im Agent-Control-Center auf gated automation bereinigt (alte "Never merges PRs"/"Never deploys" entfernt); Console und Markdown-Report semantisch synchron. Keine Runtime-/GitHub-API-/Deploy-/Canonical-Truth-Aenderung. Next: `analysis/agent-product-evolution-first-run`.

- [ ] Runner E2E Smoke Governance: `docs/architecture/WELLFIT_AGENT_GITHUB_RUNNER_E2E_SMOKE.md`
\n- 2026-05-23: Admin-Center Status-Buckets + Timeline-Felder (approved/rejected/blocked/in_progress/completed) erweitert; kein Deploy, keine GitHub-API-Neuimplementierung, keine Canonical-Truth-Aenderung.


- Pipeline hardening follow-up (2026-05-23): verify admin pipeline status board with real runner dataset.

- 2026-05-23: Revalidation abgeschlossen (`fix/agent-control-center-output-revalidation`): Agent-Control-Center-Check Output sicher/gated, revalidation-blocker resolved, keine Runtime-/Deploy-/GitHub-API-/Canonical-Truth-Aenderung.

- docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_FIRST_RUN_ANALYSIS.md - First run analysis dossier (admin review required).
- docs/beta/BETA1_PRODUCT_EVOLUTION_FIRST_RUN_READINESS_GAPS.md - Beta wave readiness gaps dossier.

- 2026-05-23: Admin-Center Pending/List Sync ergaenzt: explizites Filter-Mapping, Product-Evolution-First-Run Datenquelle im Admin-Center, einheitliche Status-Bucket-Berechnung fuer Zahlen und Listen, Pending-Sync-Fix dokumentiert.

- admin-center: Pending-Approval-Logik nutzt jetzt nur echte Review-States; lokale technische Catalog-/Framework-Einträge werden als nicht entscheidbar markiert bis Inbox-Sync.


- 2026-05-24: Admin-Center Dossier-Detail-Overlay und Inbox-Completion-Fix eingepflegt; keine Runner/Deploy/Canonical-Truth-Aenderung.

- 2026-05-24: Admin-Center-Fix abgeschlossen (Filterlabels, Dossierauszug, Inbox-Matching, Button-Gating); naechster Branch: runtime/admin-center-task-proposal-to-worker-queue.

- 2026-05-24: Admin-Center Inbox-Sync & Dossier-Content follow-up (PR #250 Restpunkte): Sync-Message/Zaehllogik + Dossier-Overlay-Inhalte + Button-Gating in Bearbeitung/abgeschlossen, ohne Runner/Deploy.

- 2026-05-24: Snapshot-shape sync fix dokumentiert (client/server debug, multi-shape parser, string/object candidate handling). Next: runtime/admin-center-task-proposal-to-worker-queue.

- 2026-05-24: Admin-Center Inbox-Sync Backend-Version-Diagnostik ergänzt (callableVersion/responseShapeVersion/payloadUnwrappedFrom). Falls live weiterhin keine callableVersion sichtbar ist: Functions deploy als naechster operativer Schritt.

- 2026-05-25: Admin-Center Sync-Diagnose-Preserve-Fix dokumentiert: Client sanitizer darf bei `accepted=false` keine diagnostischen Response-Felder verwerfen; Debug-Felder bleiben sichtbar, Fehlertexte bleiben safe (keine Stacktraces/Secrets). Kein Runner/Branch/PR/Merge/Deploy/Firebase-Deploy in diesem PR.

- 2026-05-25 Addendum (Admin-Center Sync Bugfix): Ursache war eine inkonsistente Snapshot-Quelle zwischen Anzeige-Counts und Sync-Payload. Fuehrender Fix: `app/admin/agent-center/AgentCenterInteractive.tsx` mit `effectiveFirstRunRegisterSnapshot` als einziger Sync-Quelle inkl. Fallback + Konsistenzdebug (`clientVisibleCandidateCount`/`clientSendingCandidateCount`). Kein Runner/Deploy in diesem PR.

- 2026-05-27 Update: Admin-Center-Sync Snapshot-Serialisierung/Debug-Persistenz behoben (Client + Functions Diagnostik). Folgeaktion: nach Merge Functions-Deploy fuer `syncProductEvolutionFirstRunInbox` und anschliessend Frontend/Hosting-Deploy abwarten.

- [x] 2026-05-27 Auth-/Callable-Readiness-Fix: `fix/admin-center-callable-auth-readiness` blockiert Admin-Callables bei fehlender Firebase-Auth und trennt Auth-Fehler von Snapshot-Shape-Fehlern.

- 2026-05-27: Admin-Center Firebase-Auth-Login/Session-Fix dokumentiert (Google-Login, Auth-State, Logout, sichere Debug-Felder; keine UID/E-Mail/Token).
