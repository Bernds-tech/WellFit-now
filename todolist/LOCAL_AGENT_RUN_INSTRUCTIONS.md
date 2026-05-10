# LOCAL AGENT RUN INSTRUCTIONS - WELLFIT

## Zweck
Diese Datei erklaert Bernd, wo und wie der lokale WellFit Dev Agent ausgefuehrt wird.

## Voraussetzung
Der WellFit-Code muss lokal auf dem Windows-PC vorhanden sein, z. B. in Visual Studio Code oder in einem GitHub-Ordner.

Fuer normale Agent-/Build-Laeufe reichen Node.js und npm.

Fuer Firebase Emulator Tests ist zusaetzlich Java erforderlich, weil Firebase Firestore Emulator ohne Java nicht startet.

Java pruefen:

```powershell
java -version
```

Wenn PowerShell `java` nicht findet, muss ein JDK installiert und danach PowerShell neu geoeffnet werden. Empfohlen ist ein aktuelles LTS-JDK wie Eclipse Temurin JDK oder Microsoft Build of OpenJDK.

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
cd C:\wellfit\WellFit-now
npm install
```

## Wichtig bei Git Pull Konflikten
Wenn `git pull` abbricht mit:

```text
Your local changes to the following files would be overwritten by merge
```

Dann gibt es lokale Aenderungen. Nicht blind loeschen.

Sichere Standardloesung:

```powershell
git status
git add .
git commit -m "Save local WellFit updates"
git pull --rebase
```

Falls bewusst nur lokale generierte Output-Dateien betroffen sind, koennen sie spaeter separat bereinigt werden. TODO- und Roadmap-Dateien nicht loeschen.

## Agent komplett ausfuehren
Im Hauptordner des Repositories ausfuehren, also dort, wo auch `package.json` liegt:

```powershell
npm run agent:validate
npm run agent:goal-check
npm run agent:memory-sync
npm run agent:coder-prompts
npm run agent:dry-run
npm run agent:firestore-economy-rules-check
npm run agent:quality-gate
```

## Firestore Economy Rules Check
`npm run agent:firestore-economy-rules-check` prueft statisch die aktuelle Beta-Haltung der Firestore Rules:

- sichere Profilfelder bleiben owner-writable
- temporaere Economy-Brueckenfelder bleiben vorerst als MVP-Bruecke erlaubt
- server-only Economy-Collections blockieren Client-Create/Update/Delete
- Ledger-/Audit-/Projection-/Sink-Collections bleiben client-write-denied

Wichtig: Dieser Check ersetzt noch keine Firebase-Emulator-Testdatei. Er ist eine Guardrail-Vorstufe fuer Mega-Block 22/23.

Output:

```text
scripts/wellfit-dev-agent/output/firestore-economy-rules-check.md
```

## Firestore Economy Rules Emulator-Test
Der Emulator-Test prueft die wichtigsten Allow-/Deny-Faelle wirklich gegen Firebase Auth + Firestore Emulator.

Vorbedingung:

```powershell
java -version
```

Terminal 1 im Repository-Root starten und offen lassen:

```powershell
cd C:\wellfit\WellFit-now
npm run emulators:rules
```

Terminal 2 im Repository-Root ausfuehren:

```powershell
cd C:\wellfit\WellFit-now
npm run agent:firestore-economy-rules-emulator-test
```

Erwartung:

```text
Firestore economy rules emulator test result: PASS
```

Hinweis: `npm run emulators:rules` startet nur Auth + Firestore und vermeidet Functions-Warnungen, die fuer Rules-Tests nicht benoetigt werden.

Wichtig: Dieser Emulator-Test ist bewusst nicht Teil von `agent:quality-gate`, weil er einen laufenden Emulator in einem separaten Terminal braucht.

## Einfacher mit Skript
Alternativ fuer den normalen Agentenlauf:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/wellfit-dev-agent/run-agent-full.ps1
```

## Lokale Automatik / Watch-Agent
Der Watch-Agent ueberwacht wichtige Projektgedaechtnis- und Agent-Dateien und startet nach Aenderungen automatisch den kompletten Agentenlauf.

Starten im Repository-Root:

```powershell
cd C:\wellfit\WellFit-now
powershell -ExecutionPolicy Bypass -File scripts/wellfit-dev-agent/watch-agent.ps1
```

Der Watch-Agent beobachtet:
- `todolist/`
- `docs/architecture/`
- `scripts/wellfit-dev-agent/`
- `.github/workflows/`, falls vorhanden
- wichtige Root-Dateien wie `package.json`, `package-lock.json`, `next.config.*`, `tsconfig.json`, `firebase.json`, `firestore.rules`

Log-Datei:

```text
scripts/wellfit-dev-agent/output/watch-agent.log
```

Stoppen:

```text
Ctrl+C
```

Hinweis: Der Watch-Agent laeuft nur lokal, solange das PowerShell-Fenster offen ist. Er ersetzt kein GitHub-Pull und keinen Commit/Push.

## Erwartete Ausgaben
Nach dem Lauf pruefen:

```text
scripts/wellfit-dev-agent/output/alpha-goal-check.md
scripts/wellfit-dev-agent/output/memory-sync-report.md
scripts/wellfit-dev-agent/output/dry-run-report.md
scripts/wellfit-dev-agent/output/firestore-economy-rules-check.md
scripts/wellfit-dev-agent/output/quality-gate-report.md
scripts/wellfit-dev-agent/output/coder-prompts/IDENTITY_GATE.md
scripts/wellfit-dev-agent/output/coder-prompts/coder1.md
scripts/wellfit-dev-agent/output/coder-prompts/coder2.md
scripts/wellfit-dev-agent/output/coder-prompts/coder3.md
```

## Danach im ChatGPT verwenden
1. Inhalt von `alpha-goal-check.md` ansehen.
2. Inhalt von `memory-sync-report.md` ansehen.
3. Inhalt von `dry-run-report.md` ansehen.
4. Inhalt von `firestore-economy-rules-check.md` ansehen.
5. Inhalt von `quality-gate-report.md` ansehen.
6. `IDENTITY_GATE.md` nutzen, wenn ein Coder startet.
7. Je nach Antwort `coder1.md`, `coder2.md` oder `coder3.md` verwenden.

## Memory-Sync
`npm run agent:memory-sync` scannt TODO-/Roadmap-/Agent-Dateien und erzeugt nur einen Report. Es aendert keine Projektdateien.

Output:

```text
scripts/wellfit-dev-agent/output/memory-sync-report.md
```

Der Report zeigt:
- welche TODO-aehnlichen Dateien gefunden wurden
- welche Dateien noch nicht im Index stehen
- welche Dateien keinen KI-Fortsetzungs-Prompt haben
- welche referenzierten Dateien fehlen

## Wann ausfuehren?
Immer wenn:
- ein neuer Chat / Arbeitstag startet
- neue TODOs oder Roadmap-Regeln geschrieben wurden
- ein neuer Coder/Codex-Agent starten soll
- unklar ist, was als naechstes wichtig ist
- vor groesseren Codeaenderungen

## Harte Regel
TODO-Dateien nicht loeschen. Alte Aufgaben nur markieren, verlinken oder in fuehrende Dateien uebernehmen.
