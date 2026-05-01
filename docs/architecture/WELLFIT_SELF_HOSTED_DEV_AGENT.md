# WELLFIT – SELF-HOSTED DEV AGENT / OPENCLAW-ALTERNATIVE

Status: Architektur-Grundlage / Kostenoptimierung
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

Der erste MVP soll kein vollständiges OpenClaw-Klon-System sein, sondern ein kleiner WellFit-spezifischer Dev-Agent.

### MVP-Funktionen

```txt
[ ] GitHub Repo lesen.
[ ] todolist/README.md lesen.
[ ] todolist/J - NÄCHSTE EMPFOHLENE ARBEIT lesen.
[ ] relevante A–I-/G1-/H1-/H2-Dateien je Aufgabe lesen.
[ ] Micro-Task-Plan erzeugen.
[ ] Branch erzeugen.
[ ] Dateiänderungen vorbereiten.
[ ] npm run build ausführen oder dokumentieren.
[ ] functions npm run check ausführen oder dokumentieren.
[ ] Pull Request erstellen.
[ ] PR-Beschreibung mit Risiken/Testhinweisen erzeugen.
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
[ ] Keine clientseitige Autorität für Punkte/Rewards/Completion.
[ ] Keine Token-/NFT-/Trading-Funktion in Mobile.
[ ] Keine Secrets im Frontend.
[ ] Kein localStorage als Hauptspeicher produktkritischer Daten.
[ ] Keine medizinischen Diagnosen.
[ ] Keine harte Scham-/Drucksprache.
[ ] Keine großen Monolith-Dateien aufblasen.
[ ] ToDo-/Roadmap-Bezug dokumentiert.
[ ] Build-/Test-Hinweise vorhanden.
```

---

## 8. Erste geeignete Aufgaben für den Agenten

Geeignet:

```txt
[ ] Doku-/Roadmap-Konsolidierung.
[ ] Website-Texte verbessern.
[ ] tote Links finden.
[ ] Komponenten auslagern.
[ ] TypeScript-Typen ergänzen.
[ ] Firestore-Datenmodelle als Entwurf vorbereiten.
[ ] Emulator-Testplan erweitern.
[ ] RewardPreview nur als Simulation erweitern.
[ ] Mission-History-Migration vorbereiten.
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
[ ] `scripts/wellfit-dev-agent/` anlegen.
[ ] Agent-Konfigurationsdatei `wellfit-agent.config.json` entwerfen.
[ ] Repo-Reader implementieren: README + J + thematische Dateien lesen.
[ ] Task-Planner implementieren: offene `[ ]` Aufgaben extrahieren und priorisieren.
[ ] Safety-Checklist als statische Regeldatei anlegen.
[ ] PR-Template für Agentenänderungen erstellen.
[ ] Dry-Run-Modus implementieren: nur Vorschlag, keine Dateiänderung.
[ ] Branch-/PR-Modus erst danach ergänzen.
```

---

## 10. Empfohlene Reihenfolge

```txt
1. Architektur dokumentieren.
2. Dry-Run-Agent bauen.
3. Agent liest todolist/ und erstellt Micro-Task-Plan.
4. Agent erzeugt nur Markdown-Report.
5. Danach Branch-Schreibmodus für ungefährliche Doku-/UI-Aufgaben.
6. Danach Code-Änderungen mit Tests.
7. Danach Backend-Micro-Tasks mit Review-Pflicht.
8. Kein Production-Autopilot.
```

---

## 11. Fazit

Eine eigene OpenClaw-ähnliche Struktur ist für WellFit sinnvoll, wenn sie als kontrollierter Dev-Agent aufgebaut wird.

Sie kann Kosten sparen, Geschwindigkeit erhöhen und Backend-/Website-/App-Aufgaben automatisieren.

Die Kernregel bleibt:

```txt
Agent erzeugt Vorschläge und Pull Requests.
WellFit-Regeln, Tests und Review entscheiden über Übernahme.
```
