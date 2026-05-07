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

## Bereits gefundene wichtige Alt-TODOs und Agent-Dateien

| Datei | Status | Inhalt kurz | Fuehrende Datei | Aktion |
|---|---|---|---|---|
| `todolist/CHAT_START_PROMPT.md` | zu pruefen | alter Chat-Start / Source-of-Truth Einstieg | `MASTER_PROMPT_FOR_AI.md` + `NEXT_CHAT_HANDOFF_PROMPT.md` | Inhalt pruefen und relevante Punkte uebernehmen |
| `todolist/CHAT_START_AGENT_AND_CODER_ADDENDUM.md` | aktiv | Regeln fuer Dev-Agent, Coder-Routing und Agentenlauf | `CODER_START_PROMPT.md` | als Pflichtdatei in Agentenstart behalten |
| `todolist/AUTONOMOUS_ITERATION_MODE.md` | aktiv | Micro-Task-Modus und autonomes Iterieren | `MASTER_PROMPT_FOR_AI.md` | Regeln in Master-/Next-Actions beruecksichtigen |
| `todolist/README.md` | zu pruefen | alter todolist-Ueberblick | `PROJECT_STRUCTURE.md` | pruefen und relevante Punkte uebernehmen |
| `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` | aktiv / zu pruefen | naechste empfohlene Arbeit aus alter Struktur | `NEXT_ACTIONS.md` | mit `NEXT_ACTIONS.md` abgleichen |
| `todolist/CODER_START_PROMPT.md` | aktiv | Startprompt fuer GPT/GitHub-Coder | `MASTER_PROMPT_FOR_AI.md` | in neue Struktur referenzieren, nicht loeschen |
| `todolist/NEXT_CHAT_HANDOFF_PROMPT.md` | aktiv | Handoff fuer neuen Chat mit aktuellem WellFit-Stand | `MASTER_PROMPT_FOR_AI.md` | mit neuen Dateien ergaenzen |
| `todolist/H - MOBILE - AR - TRACKING - KI` | aktiv / Bereichs-TODO | Mobile, AR, Tracking, KI | Bereich Mobile/AR | pruefen und mit Next Actions verknuepfen |
| `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY` | aktiv / Bereichs-TODO | Native AR, ARCore, ARKit, Unity | Bereich Mobile/AR | pruefen und mit Alpha/Beta abgleichen |
| `todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` | aktiv / Bereichs-TODO | Buddy als AR-Begleiter und KI-Guide | Bereich KI-Buddy | pruefen und priorisieren |
| `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md` | aktiv / Bereichs-TODO | AR-Buddy, Companion und Avatar-Grundlogik | Bereich KI-Buddy / Avatar | pruefen und priorisieren |
| `todolist/F - FIREBASE  - REALTIME - MISSIONEN` | aktiv / Bereichs-TODO | Firebase, Realtime, Missionen | `DATABASE_PLAN.md` | Datenbankplan damit abgleichen |
| `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS` | aktiv / Bereichs-TODO | Reward-System, System Health, Mechanics | Bereich Reward/Gamification | pruefen, aber keine echten Token/Transfers |
| `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN` | aktiv / Bereichs-TODO | interne Punkteoekonomie vor Blockchain | Bereich Gamification | fuer Beta sehr wichtig |
| `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL` | aktiv / Bereichs-TODO | Business, Website, Partner, Legal | Bereich Website/Legal | fuer Investor/Website wichtig |
| `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md` | aktiv | Alpha-Scope und Fokus | `NEXT_ACTIONS.md` | als Prioritaetsquelle nutzen |
| `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md` | aktiv | Self-hosted Dev-Agent Architektur | Agentenstrategie | fuer Automatisierung/Approval-Thema nutzen |
| `docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md` | aktiv / zu pruefen | spaeterer Nutzeranalyse-/Mission-Agent | Bereich Mission/KI | nach Beta weiterfuehren |
| `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` | aktiv / zu pruefen | Mission-/Reward-Kontextlogik | Missionen/Reward | mit Datenbankplan abgleichen |
| `scripts/wellfit-dev-agent/README.md` | aktiv | Dev-Agent Doku | Agentenstrategie | Agent zuerst dry-run, spaeter Schreibmodus |
| `scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md` | aktiv | wann Agent-Befehle laufen | Agentenstrategie | nach TODO-Aenderungen ausfuehren |
| `scripts/wellfit-dev-agent/wellfit-agent.config.json` | aktiv | Agent-Konfiguration, Source-of-Truth, Rollen, No-Delete-Policy | Agentenstrategie | bei neuen Source-Dateien aktualisieren |
| `scripts/wellfit-dev-agent/NEW_CODER_ENTRY_MESSAGE.md` | aktiv | Einstiegsnachricht fuer neue Coder | Coder-Start | behalten |

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
