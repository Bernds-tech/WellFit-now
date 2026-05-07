# TODO CONSOLIDATION - WELLFIT

## Zweck
Diese Datei konsolidiert kleinere, verstreute TODO-Dateien, ohne alte Informationen zu loeschen.

## Grundregel von Bernd
TODO-Dateien duerfen bearbeitet, erweitert und markiert werden. Sie duerfen nicht geloescht werden, damit keine Idee, Aufgabe oder erledigte Arbeit verloren geht.

## Konsolidierungsregeln
- Alte TODOs nicht loeschen.
- Doppelte Punkte als `duplikat` markieren und auf die fuehrende Aufgabe verweisen.
- Veraltete Punkte als `veraltet` markieren, nicht entfernen.
- Erledigte Punkte als `erledigt` markieren und im `DONE_LOG.md` dokumentieren.
- Wichtige offene Punkte nach `NEXT_ACTIONS.md` uebernehmen.
- Jede wichtige TODO-Datei soll einen eigenen KI-Fortsetzungs-Prompt bekommen.
- Wenn unklar ist, ob ein Punkt wichtig ist, als `zu pruefen` markieren.

## Status der Konsolidierung
Erste wichtige Alt-TODOs und Agent-Dateien wurden gefunden und in `todolist/TODO_INDEX.md` aufgenommen.

Wichtig: Die GitHub-/Connector-Suche ist nicht immer vollstaendig. Deshalb bleibt ein spaeterer lokaler/Codex-Scan Pflicht.

## Bereits gefundene relevante Dateien

### Chat-/Coder-/Agent-Start
- `todolist/CHAT_START_PROMPT.md`
- `todolist/CHAT_START_AGENT_AND_CODER_ADDENDUM.md`
- `todolist/CODER_START_PROMPT.md`
- `todolist/NEXT_CHAT_HANDOFF_PROMPT.md`
- `todolist/AUTONOMOUS_ITERATION_MODE.md`
- `scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md`
- `scripts/wellfit-dev-agent/README.md`
- `scripts/wellfit-dev-agent/NEW_CODER_ENTRY_MESSAGE.md`
- `scripts/wellfit-dev-agent/wellfit-agent.config.json`

### Bereichs-TODOs
- `todolist/H - MOBILE - AR - TRACKING - KI`
- `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY`
- `todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE`
- `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md`
- `todolist/F - FIREBASE  - REALTIME - MISSIONEN`
- `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS`
- `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`
- `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`

### Architektur-/Agent-Dateien
- `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md`
- `docs/architecture/WELLFIT_SELF_HOSTED_DEV_AGENT.md`
- `docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md`
- `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`

## Uebernahme in neue Struktur
Die neue Struktur ersetzt die alten Dateien nicht. Sie verlinkt und fuehrt sie.

Fuehrende Dateien:
- `todolist/MASTER_PROMPT_FOR_AI.md` - globale KI-Arbeitsanweisung
- `todolist/TODO_INDEX.md` - Index und Querverweise
- `todolist/NEXT_ACTIONS.md` - operative Beta-Aufgaben
- `todolist/PROJECT_STRUCTURE.md` - Datei-/Ordner-Landkarte
- `todolist/DONE_LOG.md` - erledigte Arbeiten
- `todolist/DATABASE_PLAN.md` - Datenbankplanung
- `todolist/ARCHITECTURE_RULES.md` - Skalierbarkeit

## Offene Konsolidierungsaufgaben
- [ ] Inhalte von `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` mit `NEXT_ACTIONS.md` abgleichen.
- [ ] Inhalte von `todolist/README.md` in `PROJECT_STRUCTURE.md` uebernehmen, falls noch nicht enthalten.
- [ ] Mobile-/AR-Dateien H, H1, H2 und K in einen Bereichsueberblick verlinken.
- [ ] Firebase-/Mission-/Reward-Dateien F, G, G1 mit `DATABASE_PLAN.md` abgleichen.
- [ ] Business-/Website-/Legal-Datei I mit Website-/Beta-Aufgaben abgleichen.
- [ ] Alle wichtigen Alt-Dateien auf KI-Fortsetzungs-Prompt pruefen und fehlende Prompts ergaenzen.
- [ ] `scripts/wellfit-dev-agent/wellfit-agent.config.json` um neue zentrale Dateien ergaenzen, falls noch nicht enthalten.

## Vorgehen fuer spaetere KI/Codex-Sessions
1. Repository-Dateien lokal oder ueber GitHub vollstaendig durchsuchen.
2. Alle Dateien mit Begriffen wie TODO, todolist, Aufgabe, offen, erledigt, Prompt finden.
3. Inhalte lesen und hier kurz referenzieren.
4. Wichtige Punkte nach `NEXT_ACTIONS.md` uebernehmen.
5. Jede relevante Alt-Datei mit einem KI-Fortsetzungs-Prompt ergaenzen.
6. Nichts loeschen.

## KI-Fortsetzungs-Prompt
Lies diese Datei, danach `TODO_INDEX.md`, `NEXT_ACTIONS.md`, `PROJECT_STRUCTURE.md` und alle gefundenen Alt-TODO-Dateien. Konsolidiere Aufgaben, ohne etwas zu loeschen. Uebertrage wichtige offene Punkte nach `NEXT_ACTIONS.md`. Markiere Dopplungen, veraltete Punkte und erledigte Aufgaben nachvollziehbar.
