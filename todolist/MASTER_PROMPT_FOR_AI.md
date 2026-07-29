# MASTER PROMPT FOR AI - WELLFIT

Stand: 2026-07-29
Owner: Bernd / WellFit
Zweck: Verbindlicher Arbeitsauftrag fuer jede KI- oder Agenten-Session. Dieser Prompt verhindert Parallelarchitektur, doppelte Arbeit, veraltete Statusannahmen und unkontrollierte Runtime-Aktivierung.

## Auftrag

Arbeite WellFit schrittweise zu einer sicheren, nachvollziehbaren und testbaren Beta weiter. Verlasse dich nie nur auf alte TODOs, Konzeptdokumente oder eine gruen markierte CI. Pruefe immer getrennt:

1. Was ist im aktuellen Code vorhanden?
2. Was ist gemergt?
3. Was wurde deployt?
4. Was ist serverseitig konfiguriert?
5. Was wurde live nachgewiesen?
6. Was ist nur Konzept, Roadmap oder historische Quelle?

Behaupte niemals eine hoehere Stufe als die vorhandene Evidence belegt.

## Verbindliche Startreihenfolge

1. `AGENTS.md`
2. `docs/status/WELLFIT_RUNTIME_STATE_2026-07-29.md`
3. `todolist/CURRENT_EXECUTION_BOARD.md`
4. `project-register/wellfit-beta1-canonical-truth.json`
5. `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
6. `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`
7. `todolist/TODO_INDEX.md`
8. `todolist/WORK_MAP.md`
9. die fuer den Auftrag relevanten Code-, Register-, Test- und Statusdateien

`todolist/CURRENT_PROJECT_STATE.md`, alte Statusdateien und die bereitgestellten WellFit-Konzept-, Finanz-, Whitepaper-, Token- und Zielgruppendokumente bleiben als Historie und Produktinput erhalten. Sie duerfen den aktuellen Code, die Runtime-Evidence oder die geschuetzte Beta-1 Canonical Truth nicht ueberstimmen.

## Source-of-Truth-Regel

Bei Widerspruechen gilt:

1. aktueller Code plus aktuelle Tests,
2. aktuelle Runtime-Evidence,
3. Owner-geschuetzte Beta-1 Canonical Truth,
4. aktuelles Execution Board und aktuelle Register,
5. historische Status-, TODO-, Konzept- und Business-Dokumente.

Einen Widerspruch nicht still aufloesen. Quelle, Datum, betroffene Funktion und erforderliche Owner-/Legal-/Security-Entscheidung dokumentieren.

## Aktueller Betriebsstand

- Repository: `Bernds-tech/WellFit-now`
- Arbeitsweise: immer task-spezifischer Branch und Pull Request; niemals direkt auf `main`
- Aktuelles Staging: `http://172.86.88.107`
- Deployment: Merge/Push auf `main` loest aktuell den Docker-Staging-Workflow aus
- Staging ist kein freigegebenes Produktionssystem
- HTTP/IP-Betrieb, fehlendes TLS und fehlende zentrale Security-Header sind offene P0-Betriebsrisiken
- Firebase-, Functions-, Rules- und Agent-Runtime-Aktivierung brauchen jeweils eigene deployte/live Evidence; Repository-Code allein ist kein Aktivierungsnachweis

## Beta-1-Produktgrenzen

- Beta-1 verwendet interne, nicht uebertragbare Fortschrittsmechaniken.
- WFP sind ausgebbare interne Punkte; XP ist separater, nicht ausgebbarer Fortschritt.
- Die aktuelle Runtime fuehrt an mehreren Stellen noch die historische Bezeichnung WFXP. Diese Abweichung nicht durch ein neues Economy-System loesen, sondern in einem eigenen Migrations-/Kompatibilitaets-PR.
- WFT, SUI, Solana, Blockchain, Wallet, Presale, Tokenhandel, NFT-Handel, Staking, Cash-out, Auszahlungen und Echtgeldtransfers bleiben in Beta-1 inaktiv.
- KI darf keine Punkte, Rewards, Mission Completion, medizinischen Aussagen, Zahlungen oder Moderationsentscheidungen autorisieren.
- Unity/PR #13 bleibt ein geschuetzter separater Track. Nicht nebenbei aendern, mergen oder ersetzen.

## Agenten- und KI-Regel

Die Bezeichnung „Agent“ sagt nicht, dass ein autonomes Live-System aktiv ist.

- Report-/Planungsagenten: lesen Register, erzeugen Berichte oder Vorschlaege; keine Runtime-Autoritaet.
- Lokale Agent-Skripte: koennen Checks und Dry-Runs ausfuehren; ihre Reports sind Evidence, keine Produktentscheidung.
- Admin/Agent Center: enthaelt im Code echte GitHub-Branch-, Datei-, PR-, Check- und Merge-Faehigkeiten. Deren deployte Konfiguration und Live-Aktivierung ist nicht nachgewiesen. Bis zu einem eigenen Security-/Runtime-Nachweis gilt: Automation aus, keine Freigabe, kein Auto-Merge, kein Auto-Deploy.
- Buddy-KI: live im Rules-Modus. Ein Modellprovider bleibt deaktiviert, bis Auth/App Check, Rate-/Kostenlimits, Timeout/Retry, strukturierte Ausgabe, Moderation, Minderjaehrigen-Schutz, Evals und Monitoring nachgewiesen sind.

Vor jeder Agenten- oder KI-Aenderung `docs/architecture/WELLFIT_AGENT_AND_AI_RUNTIME_AUDIT_2026-07-29.md` lesen.

## Arbeitsmethode gegen doppelte Arbeit

Vor Implementierung:

1. `rg` nach Route, Collection, Function, Typ, Agent, TODO-ID und verwandten Begriffen.
2. `project-register/`, `docs/`, `todolist/`, offene Issues und offene PRs pruefen.
3. Eine fuehrende Datei oder ein fuehrendes Modul bestimmen.
4. Bestehendes System erweitern; kein zweites Auth-, Mission-, Economy-, Buddy-, Agent-, Logging-, Deployment- oder Registersystem anlegen.
5. Status als `code_present`, `merged`, `deployed`, `configured`, `live_verified`, `planned`, `blocked`, `historical` oder `superseded` dokumentieren.
6. Nach der Arbeit Board, Register, TODO-Index, Progress-/Done-Log und relevante Runbooks synchronisieren.

Alte Aufgaben nie loeschen. Als `erledigt`, `teilweise erledigt`, `veraltet`, `duplikat`, `blockiert`, `review_required` oder `ersetzt durch` markieren und auf die fuehrende Quelle verweisen.

## Geschuetzte und sensible Bereiche

Folgende Aenderungen immer als eigenen begrenzten PR mit passender Human-/Legal-/Privacy-/Security-Pruefung behandeln:

- Legaltexte, Datenschutz, Einwilligung und Tracking
- Minderjaehrige, Familien-/Guardian-Flows
- Health-, Watch-, Standort-, Kamera-, Pose-, Face-, biometrische oder rohe Sensordaten
- Auth, Rollen, Owner-/Admin-Claims
- Firestore Rules, Functions, Produktionsdaten und Datenmigration
- Rewards, Economy, Payments, Wallet, Token, NFT, Presale oder Cash-out
- Agent-Runtime, GitHub-Schreibzugriff, Auto-Merge, Auto-Repair und Deploy-Autoritaet
- Unity/PR #13

Die geschuetzten Canonical-Truth-Dateien nicht editieren. Erforderliche Aenderungen in `todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md` vorschlagen.

## Mindestpruefung vor Handoff

Je nach Aenderung mindestens:

- `git diff --check`
- relevante gezielte Tests
- `npm run lint -- --ignore-pattern 'database/**'`
- `npx tsc --noEmit`
- `npm --prefix functions run check`
- `npm run build`
- `npm run agent:quality-gate`

Ein roter Check wird mit Ursache, Scope und naechstem Schritt dokumentiert. Nicht als „alles gruen“ zusammenfassen.

## Definition of Done

Eine Aufgabe ist erst fertig, wenn:

- keine bestehende Loesung unnoetig dupliziert wurde,
- Status und Evidence getrennt dokumentiert sind,
- Tests fuer den geaenderten Bereich erfolgreich sind oder ein echter Blocker belegt ist,
- TODO/Board/Register/Runbook nicht widersprechen,
- offene Risiken und menschliche Freigaben sichtbar bleiben,
- keine Secrets oder privaten Daten erfasst wurden,
- Branch, PR-Scope und naechster konkreter Schritt dokumentiert sind,
- bei sichtbaren Deployments ein separater Live-Smoke-Test dokumentiert ist.

## Aktueller Arbeitsauftrag

Bearbeite die P0-Reihenfolge aus `todolist/CURRENT_EXECUTION_BOARD.md`. Derzeit:

1. Source-of-Truth und Quality-Gate stabilisieren.
2. Kritische/hohe Produktionsabhaengigkeiten in einem eigenen Security-PR aktualisieren.
3. Oeffentliche Legaltexte in einem eigenen Legal-Review-PR an die tatsaechliche Beta anpassen.
4. Domain, HTTPS und Browser-Sicherheitsheader fuer Staging umsetzen.
5. Agent-/GitHub-Runner-Aktivierung beweissicher begrenzen.
6. End-to-End-, Firebase-, Mobile- und Backup-Evidence vervollstaendigen.
7. Erst danach Buddy-Modellprovider, Community, Unity/AR oder spaetere Economy-Schichten erweitern.

## KI-Fortsetzungs-Prompt

Lies die verbindliche Startreihenfolge aus dieser Datei vollstaendig. Pruefe aktuellen Branch, `main`, offene PRs/Issues, Live-/Deploy-Evidence und den Quality-Gate, bevor du einen Task waehlt. Arbeite niemals direkt auf `main`. Erweitere das fuehrende System statt eine Parallelarchitektur zu bauen. Unterscheide `code_present`, `merged`, `deployed`, `configured` und `live_verified`. Halte Beta-1 frei von WFT/SUI/Solana/Blockchain/Wallet/Token/NFT/Presale/Cash-out. Beende den Task erst nach Tests und synchronisierter Dokumentation.
