# WellFit Dev Agent

Status: MVP / Dry-Run-Grundlage

Dieser Ordner enthält den selbst gehosteten WellFit Dev Agent als OpenClaw-ähnliche, aber WellFit-spezifische Agentenstruktur.

Der Agent ist zuerst bewusst als Dry-Run-Agent gebaut:

- Er liest Roadmap-/ToDo-Dateien.
- Er erkennt offene Micro-Tasks.
- Er bewertet Aufgaben gegen Safety-Regeln.
- Er erzeugt einen Markdown-Report.
- Er schreibt noch keinen produktiven Code.
- Er erstellt noch keine Branches oder Pull Requests.

## Abgrenzung

Dieser Agent ist der Dev-Agent.

Er ist zuständig für:

- Repository-/Roadmap-Analyse,
- technische Micro-Task-Planung,
- Doku-/UI-/Code-Aufgaben als spätere PR-Vorbereitung,
- Build-/Test-Hinweise,
- Safety-Checks für geplante Änderungen.

Nicht zuständig für:

- Nutzeranalyse,
- personalisierte Missionserstellung,
- Buddy-Motivationsprofile,
- Reward-/Punkte-/XP-Freigabe,
- Mission Completion,
- Anti-Cheat-Entscheidungen,
- Production Deployments.

Für Nutzeranalyse und adaptive Missionen ist separat vorgesehen:

```txt
docs/architecture/WELLFIT_ADAPTIVE_MISSION_INSIGHT_AGENT.md
```

## Harte Regeln

Der Dev-Agent darf langfristig nur über kontrollierte Branches und Pull Requests arbeiten.

Er darf nicht ohne Review:

- nach `main` schreiben,
- Produktion deployen,
- Firestore Rules lockern,
- Punkte/XP/Rewards autorisieren,
- Mission Completion aktivieren,
- Anti-Cheat-Regeln entfernen,
- Token-/NFT-/Trading-/Presale-Funktionen in Mobile einbauen,
- Secrets/API Keys ins Frontend schreiben,
- sensible Nutzer-/Kinder-/Health-/Standortdaten lesen.

## Geplanter Ablauf

```txt
npm run agent:dry-run
```

Der Dry-Run erzeugt später einen Report unter:

```txt
scripts/wellfit-dev-agent/output/dry-run-report.md
```

## MVP-Dateien

```txt
wellfit-agent.config.json
safety-checklist.md
src/dry-run.mjs
output/.gitkeep
```

## Nächste Ausbauphasen

1. Dry-Run-Report stabilisieren.
2. ToDo-Dateien automatisch auswerten.
3. Priorisierung nach `J - NÄCHSTE EMPFOHLENE ARBEIT`.
4. Safety-Check je Task.
5. Optionaler Branch-/PR-Modus für ungefährliche Doku-/UI-Aufgaben.
6. Backend-Aufgaben nur mit Review-Pflicht und ohne Konflikt mit parallelem Backend-Coder.
