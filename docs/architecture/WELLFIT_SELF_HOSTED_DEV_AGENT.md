# WELLFIT – SELF-HOSTED DEV AGENT / OPENCLAW-ALTERNATIVE

Status: MVP-Dry-Run-Grundlage angelegt / Kostenoptimierung
Kontext: GitHub, Server, Backend-Micro-Tasks, KI-gestützte Weiterentwicklung
Ziel: Eine eigene, kontrollierte Agenten-Schicht für WellFit vorbereiten, die Backend-, Website- und App-Aufgaben beschleunigt, ohne produktive Sicherheitsregeln zu verletzen.

---

## 1. Grundentscheidung

WellFit kann eine eigene OpenClaw-ähnliche Agentenstruktur aufbauen.

Der Agent darf:

- Repository lesen,
- ToDo-Listen und Architekturdateien auswerten,
- Micro-Tasks ableiten,
- Codeänderungen in separaten Branches vorbereiten,
- Pull Requests erstellen,
- Tests ausführen oder anstoßen,
- Build-/Security-Hinweise dokumentieren,
- Roadmap-/ToDo-Dateien aktualisieren.

Der Agent darf nicht ohne Review:

- direkt nach `main` schreiben,
- Produktion deployen,
- Firestore Rules lockern,
- Punkte/XP/Rewards produktiv autorisieren,
- Mission Completion produktiv freigeben,
- Anti-Cheat-Regeln entfernen,
- Token-/NFT-/Trading-/Presale-Funktionen in Mobile einbauen,
- Secrets/API Keys ins Frontend schreiben,
- Health-/Kinder-/Standortdaten unkontrolliert an externe Provider senden.

---

## 2. Zielbild

```txt
WellFit Self-Hosted Dev Agent
        ↓
liest Repository + todolist/
        ↓
plant 4–8 Micro-Tasks
        ↓
erstellt Branch
        ↓
ändert Code/Doku/Tests
        ↓
führt Checks aus
        ↓
erstellt Pull Request
        ↓
Review + Merge durch Mensch / kontrollierte Policy
```

---

## 3. Warum self-hosted?

Vorteile:

- geringere laufende Plattformkosten,
- volle Kontrolle über Repository-Zugriffe,
- an WellFit-Regeln anpassbar,
- private Roadmap-/Produktlogik bleibt intern,
- eigene Safety-Gates möglich,
- später austauschbare Modellprovider möglich.

Nachteile / Risiken:

- Aufbau und Wartung liegen bei WellFit,
- Modell-/API-Kosten bleiben je nach Provider trotzdem bestehen,
- Security-Härtung nötig,
- Agent darf nicht zu viele Rechte bekommen,
- Tests und Review bleiben Pflicht.

---

## 4. Minimaler MVP

Der erste MVP ist kein vollständiges OpenClaw-Klon-System, sondern ein kleiner WellFit-spezifischer Dev-Agent im Dry-Run-Modus.

### MVP-Funktionen

```txt
[x] GitHub-/Repo-Dateien lokal/serverseitig über Repo-Arbeitskopie lesen.
[x] todolist/README.md lesen.
[x] todolist/J - NÄCHSTE EMPFOHLENE ARBEIT lesen.
[x] relevante A–I-/G1-/H1-/H2-Dateien je Aufgabe konfigurierbar lesen.
[x] Micro-Task-Plan aus offenen `[ ]`, `[~]`, `[!]`, `[>]` Aufgaben erzeugen.
[ ] Branch erzeugen.
[ ] Dateiänderungen vorbereiten.
[ ] npm run build ausführen oder dokumentieren.
[ ] functions npm run check ausführen oder dokumentieren.
[ ] Pull Request erstellen.
[x] PR-Beschreibung mit Risiken/Testhinweisen als Template vorbereitet.
[x] Dry-Run-Report unter `scripts/wellfit-dev-agent/output/dry-run-report.md` erzeugen.
[x] `npm run agent:dry-run` als Startbefehl ergänzt.
```

### MVP-Nicht-Ziele

```txt
[>] Kein automatischer Production-Deploy.
[>] Keine autonome Reward-/Punkte-Freigabe.
[>] Keine autonome Firestore-Rules-Lockerung.
[>] Keine Token-/NFT-/Trading-Funktion.
[>] Keine Verarbeitung sensibler Rohdaten.
```

---

## 5. Empfohlene technische Architektur

### 5.1 Agent Runner

Optionen:

- eigener Node.js CLI-Agent im Repo,
- eigener Python-Agent auf Server,
- GitHub Actions Workflow mit manuellem Trigger,
- Serverdienst unter PM2 nur für interne Agentenläufe.

Empfehlung für WellFit:

```txt
Phase 1: Node.js CLI-Agent lokal/Server
Phase 2: GitHub Action mit manual_dispatch
Phase 3: optional PM2-Agent mit Job Queue
```

Aktueller Stand:

```txt
[x] Phase 1 als Node.js CLI-Dry-Run-Agent begonnen.
[ ] Phase 2 GitHub Action offen.
[ ] Phase 3 PM2-/Job-Queue-Agent offen.
```

### 5.2 Provider-Abstraktion

Der Agent darf nicht hart an einen einzigen KI-Anbieter gekoppelt werden.

```ts
interface DevAgentModelProvider {
  completeTask(input: DevAgentTaskInput): Promise<DevAgentTaskOutput>;
}
```

Mögliche Provider:

- Rules-only Fallback,
- lokales Modell,
- OpenAI API,
- anderer kompatibler Provider,
- OpenClaw-ähnlicher externer Agent, falls später sinnvoll.

Aktueller Stand:

```txt
[x] Dry-Run arbeitet aktuell ohne Modellprovider, regelbasiert.
[ ] Provider-Abstraktion später ergänzen.
```

---

## 6. Berechtigungsmodell

### Sicherer Start

```txt
GitHub Token: nur Repo-spezifisch
Branch-only Writes: ja
Main Writes: nein
PR erstellen: ja
Secrets lesen: nein
Deploy auslösen: nein
Production Env ändern: nein
```

Aktueller Dry-Run-Stand:

```txt
[x] Keine Branch-Erstellung.
[x] Keine PR-Erstellung.
[x] Keine Codeänderung durch Agentenlauf.
[x] Nur Report-Datei als Output vorgesehen.
```

### Kritische Bereiche mit Review-Pflicht

```txt
firestore.rules
functions/**
app/api/**
lib/**reward**
lib/**mission**
lib/**economy**
lib/**antiCheat**
app/mobile/**
app/missionen/**
```

---

## 7. WellFit Safety Gates

Vor jedem PR muss der Agent prüfen:

```txt
[x] Keine clientseitige Autorität für Punkte/Rewards/Completion.
[x] Keine Token-/NFT-/Trading-Funktion in Mobile.
[x] Keine Secrets im Frontend.
[x] Kein localStorage als Hauptspeicher produktkritischer Daten.
[x] Keine medizinischen Diagnosen.
[x] Keine harte Scham-/Drucksprache.
[x] Keine großen Monolith-Dateien aufblasen.
[x] ToDo-/Roadmap-Bezug dokumentiert.
[x] Build-/Test-Hinweise vorhanden.
```

Aktueller Stand:

```txt
[x] Safety-Checklist als Markdown-Datei angelegt.
[x] Dry-Run klassifiziert Tasks grob nach Risiko.
[ ] Tiefer statischer Code-Safety-Scan offen.
```

---

## 8. Erste geeignete Aufgaben für den Agenten

Geeignet:

```txt
[x] Doku-/Roadmap-Konsolidierung.
[x] Website-Texte verbessern.
[x] tote Links finden.
[x] Komponenten auslagern.
[x] TypeScript-Typen ergänzen.
[x] Firestore-Datenmodelle als Entwurf vorbereiten.
[x] Emulator-Testplan erweitern.
[x] RewardPreview nur als Simulation erweitern.
[x] Mission-History-Migration vorbereiten.
```

Nur mit besonders strenger Review:

```txt
[ ] Firestore Rules ändern.
[ ] Cloud Functions mit Reward-/XP-Bezug ändern.
[ ] Mission Completion produktiv aktivieren.
[ ] Anti-Cheat ändern.
[ ] Economy-/Cap-/Ledger-Logik ändern.
```

Nicht geeignet für Autonomie:

```txt
[ ] Production Deploy.
[ ] echte Token-Ausschüttung.
[ ] echte NFT-/Trading-Funktionen.
[ ] KYC/AML/MiCA-relevante Produktfunktionen.
[ ] Verarbeitung sensibler Kinder-/Health-/Standort-Rohdaten ohne explizite Architekturprüfung.
```

---

## 9. Konkrete erste Micro-Tasks

```txt
[x] `scripts/wellfit-dev-agent/` anlegen.
[x] Agent-Konfigurationsdatei `wellfit-agent.config.json` entwerfen.
[x] Repo-Reader implementieren: README + J + thematische Dateien lesen.
[x] Task-Planner implementieren: offene `[ ]` Aufgaben extrahieren und priorisieren.
[x] Safety-Checklist als statische Regeldatei anlegen.
[x] PR-Template für Agentenänderungen erstellen.
[x] Dry-Run-Modus implementieren: nur Vorschlag, keine produktive Codeänderung.
[x] Output-Ordner vorbereiten.
[x] npm Script `agent:dry-run` ergänzen.
[ ] Dry-Run lokal/serverseitig ausführen und Report prüfen.
[ ] Dry-Run-Report optional in `.gitignore` ausnehmen oder bewusst versionieren entscheiden.
[ ] Branch-/PR-Modus erst danach ergänzen.
```

---

## 10. Empfohlene Reihenfolge

```txt
[x] 1. Architektur dokumentieren.
[x] 2. Dry-Run-Agent bauen.
[x] 3. Agent liest todolist/ und erstellt Micro-Task-Plan.
[x] 4. Agent erzeugt nur Markdown-Report.
[ ] 5. Danach Branch-Schreibmodus für ungefährliche Doku-/UI-Aufgaben.
[ ] 6. Danach Code-Änderungen mit Tests.
[ ] 7. Danach Backend-Micro-Tasks mit Review-Pflicht.
[ ] 8. Kein Production-Autopilot.
```

---

## 11. Aktuelle Dateien

```txt
scripts/wellfit-dev-agent/README.md
scripts/wellfit-dev-agent/wellfit-agent.config.json
scripts/wellfit-dev-agent/safety-checklist.md
scripts/wellfit-dev-agent/pr-template.md
scripts/wellfit-dev-agent/src/dry-run.mjs
scripts/wellfit-dev-agent/output/.gitkeep
```

Startbefehl:

```bash
npm run agent:dry-run
```

Optionale Themenflags:

```bash
npm run agent:dry-run -- --topic agentArchitecture
npm run agent:dry-run -- --include-buddy
npm run agent:dry-run -- --include-business
npm run agent:dry-run -- --include-rewards
```

Hinweis:

```txt
Rewards/Backend können gelesen und als Risiko markiert werden, aber im aktuellen Parallelbetrieb nicht autonom geändert werden, da ein zweiter Coder am Backend arbeitet.
```

---

## 12. Fazit

Eine eigene OpenClaw-ähnliche Struktur ist für WellFit sinnvoll, wenn sie als kontrollierter Dev-Agent aufgebaut wird.

Sie kann Kosten sparen, Geschwindigkeit erhöhen und Backend-/Website-/App-Aufgaben automatisieren.

Die Kernregel bleibt:

```txt
Agent erzeugt Vorschläge und Pull Requests.
WellFit-Regeln, Tests und Review entscheiden über Übernahme.
```

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `scripts/wellfit-dev-agent/README.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

