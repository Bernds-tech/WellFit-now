# WELLFIT – Neuer Chat Handoff-Prompt

Version: 2.0
Stand: 2026-07-29
Repository: `Bernds-tech/WellFit-now`

## Verwendung

Diesen Prompt in einem neuen WellFit-Chat verwenden. `todolist/MASTER_PROMPT_FOR_AI.md` bleibt die vollstaendige verbindliche Arbeitsanweisung.

## Prompt fuer den neuen Chat

```text
Du arbeitest am bestehenden Projekt WellFit. Starte nichts neu und vertraue keiner alten Chat-Zusammenfassung, bevor du den aktuellen Stand geprueft hast.

Lies vollstaendig und in dieser Reihenfolge:
1. AGENTS.md
2. todolist/MASTER_PROMPT_FOR_AI.md
3. docs/status/WELLFIT_RUNTIME_STATE_2026-07-29.md
4. todolist/CURRENT_EXECUTION_BOARD.md
5. project-register/wellfit-beta1-canonical-truth.json
6. docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md
7. todolist/CODEX_CONTEXT_WELLFIT_BETA1.md
8. todolist/TODO_INDEX.md
9. todolist/WORK_MAP.md
10. fuer Agent/KI: docs/architecture/WELLFIT_AGENT_AND_AI_RUNTIME_AUDIT_2026-07-29.md
11. fuer GitHub: docs/status/WELLFIT_GITHUB_ISSUE_TRIAGE_2026-07-29.md

Pruefe danach:
- aktuellen Branch, main-SHA und Arbeitsbaum
- offene PRs und Issues
- relevante Routen, APIs, Functions, Register und Tests
- ob etwas nur geplant, im Code vorhanden, gemergt, deployt, konfiguriert oder live verifiziert ist
- ob bereits ein fuehrendes Modul/TODO/Issue existiert

Aktueller belegter Betriebsstand:
- Docker/Nginx-Staging: http://172.86.88.107
- Merge/Push auf main loest den Staging-Deploy aus
- Staging ist HTTP/IP und nicht Produktion
- aktueller verifizierter Live-Commit: c0ef7d921ee1499cd20ffdd086ebca4050f1a189
- Buddy-KI ist live im Rules-Modus; Modellprovider aus/unconfigured
- Agent-Automation ist aus und Runtime-Autoritaet ungranted
- echter GitHub-Branch-/Datei-/PR-/Check-/Merge-Code existiert in Functions; deployte Aktivierung ist unverified

Aktuelle P0-Reihenfolge:
1. Source-of-Truth/Quality-Gate sauber halten
2. kritische/hohe Produktionsabhaengigkeiten separat aktualisieren
3. Public Legaltexte in einem Legal-/Privacy-PR an die echte Beta anpassen
4. Domain, HTTPS und Security Header
5. Agent-/GitHub-Runner-Rechte, Deployment, Kill Switch und Audit Evidence
6. E2E/Firebase/Device/Backup Evidence
7. erst danach Buddy-Modellprovider, Community und Unity/AR erweitern

Harte Grenzen:
- niemals direkt auf main; immer Branch/PR
- keine Parallelarchitektur und keine doppelte Arbeit
- geschuetzte Canonical Truth nicht editieren
- PR #13/Unity nicht nebenbei aendern oder mergen
- WFT, SUI, Solana, Blockchain, Wallet, Presale, Token, NFT, Trading, Staking und Cash-out bleiben in Beta inaktiv
- KI autorisiert keine Rewards, Mission Completion, medizinischen Aussagen, Standort-Sicherheit, Guardian Consent oder externe Aktionen
- Legal, Health, Minor, Location, Camera, Auth, Rules, Functions, Economy und Agent-Runtime nur in eigenen reviewbaren Scopes
- alte TODOs nicht loeschen; als erledigt, veraltet, duplikat, blockiert oder ersetzt markieren

Bevor du implementierst, suche mit rg in Code, project-register, docs und todolist sowie in offenen GitHub-Issues/PRs. Benenne eine fuehrende Datei. Nach der Arbeit synchronisiere Board, Register, TODO-Index, Work Map, Done-/Progress-Log und relevante Runbooks.

Validiere je nach Scope mindestens:
git diff --check
npm run lint -- --ignore-pattern 'database/**'
npx tsc --noEmit
npm --prefix functions run check
npm run build
npm run agent:quality-gate

Wenn ein Check rot ist, nenne die echte Ursache und behaupte nicht, alles sei gruen. Wenn der Nutzer "weiter" sagt, waehle den naechsten P0-Task aus dem Execution Board und pruefe zuerst, ob er bereits umgesetzt oder durch einen neueren Stand ersetzt wurde.
```

## KI-Fortsetzungs-Prompt

Lies `todolist/MASTER_PROMPT_FOR_AI.md` und verwende dann den Handoff-Text aus dieser Datei. Pruefe den aktuellen Repository-, GitHub- und Runtime-Stand erneut; uebernimm keine April-/Mai-Annahmen ungeprueft. Arbeite auf einem Branch/PR, halte die Beta-Grenzen und dokumentiere Code/Merge/Deploy/Konfiguration/Live-Evidence getrennt.
