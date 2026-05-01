# WellFit Dev Agent

Status: MVP / Dry-Run-Grundlage mit Coder-Identitäts-Gate

Dieser Ordner enthält den selbst gehosteten WellFit Dev Agent als OpenClaw-ähnliche, aber WellFit-spezifische Agentenstruktur.

Der Agent ist zuerst bewusst als Dry-Run-Agent gebaut:

- Er liest Roadmap-/ToDo-Dateien.
- Er erkennt offene Micro-Tasks.
- Er bewertet Aufgaben gegen Safety-Regeln.
- Er erzeugt einen Markdown-Report.
- Er erzeugt Coder-spezifische Prompts.
- Er schreibt noch keinen produktiven Code.
- Er erstellt noch keine Branches oder Pull Requests.

---

## Pflicht: Coder-Identität vor jeder Arbeit

Bevor ein GPT/Coder am Code weitermacht, muss zuerst gefragt werden:

```txt
Bist du Coder 1, Coder 2 oder Coder 3? Antworte exakt mit: Coder 1, Coder 2 oder Coder 3.
```

Ohne gültige Antwort wird keine Aufgabe zugewiesen.

```txt
Coder 1 = Mobile / AR / Buddy / Unity
Coder 2 = Backend / Firebase / Mission Completion / Security
Coder 3 = Website / UX / QA / Datenschutz / Dokumentation / Agent
```

Danach wird ausschließlich der passende Prompt verwendet:

```txt
scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

Der allgemeine Einstieg liegt unter:

```txt
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
```

---

## Abgrenzung

Dieser Agent ist der Dev-Agent.

Er ist zuständig für:

- Repository-/Roadmap-Analyse,
- technische Micro-Task-Planung,
- Doku-/UI-/Code-Aufgaben als spätere PR-Vorbereitung,
- Build-/Test-Hinweise,
- Safety-Checks für geplante Änderungen,
- Coder-Routing und Coder-Prompts.

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

## Befehle

Dry-Run-Report erzeugen:

```bash
npm run agent:dry-run
```

Coder-Prompts und Identity-Gate erzeugen:

```bash
npm run agent:coder-prompts
```

Der Dry-Run erzeugt später einen Report unter:

```txt
scripts/wellfit-dev-agent/output/dry-run-report.md
```

Die Coder-Prompts werden erzeugt unter:

```txt
scripts/wellfit-dev-agent/output/coder-prompts/
```

## MVP-Dateien

```txt
wellfit-agent.config.json
safety-checklist.md
pr-template.md
src/dry-run.mjs
src/generate-coder-prompts.mjs
output/.gitkeep
```

## Nächste Ausbauphasen

1. Dry-Run-Report stabilisieren.
2. ToDo-Dateien automatisch auswerten.
3. Priorisierung nach `J - NÄCHSTE EMPFOHLENE ARBEIT` und Alpha-Scope.
4. Safety-Check je Task.
5. Coder-Prompts mit echten Dry-Run-Zuweisungen verbinden.
6. Optionaler Branch-/PR-Modus für ungefährliche Doku-/UI-Aufgaben.
7. Backend-Aufgaben nur mit Review-Pflicht und ohne Konflikt mit parallelem Backend-Coder.
