# WellFit Dev Agent

Status: MVP / Dry-Run-Grundlage mit Coder-Identitäts-Gate, Registry-Validator und Alpha-Zielkurs-Check

Dieser Ordner enthält den selbst gehosteten WellFit Dev Agent als OpenClaw-ähnliche, aber WellFit-spezifische Agentenstruktur.

Der Agent ist zuerst bewusst als Dry-Run-Agent gebaut:

- Er liest Roadmap-/ToDo-Dateien.
- Er erkennt offene Micro-Tasks.
- Er bewertet Aufgaben gegen Safety-Regeln.
- Er prüft, ob wir noch auf Kurs zur ersten testbaren Alpha sind.
- Er erzeugt einen Markdown-Report.
- Er erzeugt Coder-spezifische Prompts.
- Er validiert die Coder-Registry und Agent-Policies.
- Er schreibt noch keinen produktiven Code.
- Er erstellt noch keine Branches oder Pull Requests.

---

## Wann Agent ausführen?

Das verbindliche Runbook liegt hier:

```txt
scripts/wellfit-dev-agent/RUNBOOK_WHEN_TO_RUN_AGENT.md
```

Kurzregel:

```txt
Neuer Coder oder neuer GPT-/GitHub-Arbeitsblock?
→ npm run agent:validate
→ npm run agent:goal-check
→ npm run agent:coder-prompts
→ npm run agent:dry-run
→ Identity-Gate im Chat anzeigen
→ Coder nennt Rolle
→ passenden Coder-Prompt verwenden
→ erst dann Codearbeit
```

---

## Pflicht: Coder-Identität vor jeder Arbeit

Bevor ein GPT/Coder am Code oder auf GitHub weitermacht, muss zuerst gefragt werden:

```txt
Welcher Coder bist du? Antworte exakt mit deiner registrierten Rolle, z. B. Coder 1, Coder 2, Coder 3 ...
```

Ohne gültige Antwort wird keine Aufgabe zugewiesen.

Aktuelle Rollen werden nicht hart codiert, sondern dynamisch aus der Registry gelesen:

```txt
scripts/wellfit-dev-agent/wellfit-agent.config.json
scripts/wellfit-dev-agent/coder-registry.schema.md
```

Aktueller Startzustand:

```txt
Coder 1 = Mobile / AR / Buddy / Unity
Coder 2 = Backend / Firebase / Mission Completion / Security
Coder 3 = Website / UX / QA / Datenschutz / Dokumentation / Agent
```

Später können Coder 4, 5, 6 oder 15 ergänzt werden, ohne die Agentenlogik neu zu bauen.

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

## Alpha-Zielkurs-Check

Der Agent soll nicht nur Aufgaben verteilen, sondern regelmäßig prüfen, ob WellFit noch direkt auf die ersten Testläufe hinarbeitet.

Leitfrage:

```txt
Hilft diese Aufgabe direkt zur ersten testbaren WellFit-Alpha mit echten Testläufen?
```

Der Zielkurs-Check prüft aktuell diese Bereiche:

```txt
1. Login / Registrierung / Nutzerprofil
2. Mobile / AR / sichtbarer Buddy
3. Missionen / Challenges spielbar
4. interne Punkte / XP ohne Token
5. Backend / Firebase / Security Rules / Completion
6. Deployment / Debug / QA / Testläufe
7. Datenschutz / App-Store-Konformität
```

Output:

```txt
scripts/wellfit-dev-agent/output/alpha-goal-check.md
```

---

## ToDo-/Roadmap-No-Delete-Policy

Der Agent und alle Coder dürfen ToDo-/Roadmap-Dateien nicht bereinigen, zusammenkürzen oder alte Punkte löschen.

Verboten:

```txt
[!] bestehende ToDo-Einträge löschen
[!] alte Roadmap-Abschnitte entfernen
[!] Visionseinträge entfernen, nur weil sie nicht Alpha-kritisch sind
[!] erledigte Einträge löschen
[!] blockierte Einträge löschen
```

Erlaubt:

```txt
[x] Statusmarker ändern: [ ] -> [x], [~], [!], [>]
[x] Priorität ändern
[x] neue Erkenntnisse ergänzen
[x] Hinweise / Risiken / Build-Notizen ergänzen
[x] Backlog mit [>] markieren
[x] Aufgaben in neue Abschnitte kopieren und als verschoben markieren
```

Grundregel:

```txt
Nicht löschen, sondern sichtbar umpriorisieren.
```

---

## Abgrenzung

Dieser Agent ist der Dev-Agent.

Er ist zuständig für:

- Repository-/Roadmap-Analyse,
- technische Micro-Task-Planung,
- Alpha-Zielkurs-Analyse,
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
- sensible Nutzer-/Kinder-/Health-/Standortdaten lesen,
- ToDo-/Roadmap-Einträge löschen.

## Befehle

Agent-Konfiguration und Registry prüfen:

```bash
npm run agent:validate
```

Alpha-Zielkurs prüfen:

```bash
npm run agent:goal-check
```

Dry-Run-Report erzeugen:

```bash
npm run agent:dry-run
```

Coder-Prompts und Identity-Gate erzeugen:

```bash
npm run agent:coder-prompts
```

Empfohlene Reihenfolge nach Registry- oder Roadmap-Änderungen:

```bash
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
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
coder-registry.schema.md
RUNBOOK_WHEN_TO_RUN_AGENT.md
safety-checklist.md
pr-template.md
src/validate-agent-config.mjs
src/alpha-goal-check.mjs
src/dry-run.mjs
src/generate-coder-prompts.mjs
output/.gitkeep
```

## Nächste Ausbauphasen

1. Dry-Run-Report stabilisieren.
2. Alpha-Zielkurs-Check mit konkreten Blocker-Empfehlungen erweitern.
3. ToDo-Dateien automatisch auswerten.
4. Priorisierung nach `J - NÄCHSTE EMPFOHLENE ARBEIT` und Alpha-Scope.
5. Safety-Check je Task.
6. Coder-Prompts mit echten Dry-Run-Zuweisungen verbinden.
7. Optionaler Branch-/PR-Modus für ungefährliche Doku-/UI-Aufgaben.
8. Backend-Aufgaben nur mit Review-Pflicht und ohne Konflikt mit parallelem Backend-Coder.
