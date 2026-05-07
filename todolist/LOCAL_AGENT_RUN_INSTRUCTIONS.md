# LOCAL AGENT RUN INSTRUCTIONS - WELLFIT

## Zweck
Diese Datei erklaert Bernd, wo und wie der lokale WellFit Dev Agent ausgefuehrt wird.

## Voraussetzung
Der WellFit-Code muss lokal auf dem Windows-PC vorhanden sein, z. B. in Visual Studio Code oder in einem GitHub-Ordner.

## Einmaliger Einstieg
Falls das Repository noch nicht lokal vorhanden ist:

```powershell
git clone https://github.com/Bernds-tech/WellFit-now.git
cd WellFit-now
npm install
```

Falls das Repository bereits lokal vorhanden ist:

```powershell
cd PFAD_ZU_DEINEM_WELLFIT_ORDNER
npm install
```

Beispiel:

```powershell
cd C:\Users\BERND\Documents\GitHub\WellFit-now
npm install
```

## Agent komplett ausfuehren
Im Hauptordner des Repositories ausfuehren, also dort, wo auch `package.json` liegt:

```powershell
npm run agent:validate
npm run agent:goal-check
npm run agent:coder-prompts
npm run agent:dry-run
```

## Einfacher mit Skript
Alternativ:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/wellfit-dev-agent/run-agent-full.ps1
```

## Erwartete Ausgaben
Nach dem Lauf pruefen:

```text
scripts/wellfit-dev-agent/output/alpha-goal-check.md
scripts/wellfit-dev-agent/output/dry-run-report.md
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

## Danach im ChatGPT verwenden
1. Inhalt von `alpha-goal-check.md` ansehen.
2. Inhalt von `dry-run-report.md` ansehen.
3. `IDENTITY_GATE.md` nutzen, wenn ein Coder startet.
4. Je nach Antwort `coder1.md`, `coder2.md` oder `coder3.md` verwenden.

## Wann ausfuehren?
Immer wenn:
- ein neuer Chat / Arbeitstag startet
- neue TODOs oder Roadmap-Regeln geschrieben wurden
- ein neuer Coder/Codex-Agent starten soll
- unklar ist, was als naechstes wichtig ist
- vor groesseren Codeaenderungen

## Harte Regel
TODO-Dateien nicht loeschen. Alte Aufgaben nur markieren, verlinken oder in fuehrende Dateien uebernehmen.
