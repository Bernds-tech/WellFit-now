# CODEX PROMPT — WellFit Agent Canonical Truth Integration

Du arbeitest im Repository `Bernds-tech/WellFit-now`.

## Ziel

Integriere die neue kanonische WellFit-Beta-1-Wahrheit so in die bestehende Agent-/Codex-/Automation-Logik, dass alle relevanten Agents vor Aufgabenbeginn wissen:

- Was WellFit Beta 1 ist.
- Was WFP, XP und später WFT bedeuten.
- Welche Funktionen Beta-1-relevant sind.
- Welche alten Quellen überschrieben wurden.
- Welche Bereiche tabu sind oder nur als Roadmap gelten.
- Wo die maschinenlesbare Wahrheit liegt.

## Bereits abgelegte zentrale Dateien

Prüfe, ob diese Dateien existieren und nutze sie als neue führende Quellen:

```text
project-register/wellfit-beta1-canonical-truth.json
docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md
todolist/CODEX_CONTEXT_WELLFIT_BETA1.md
```

## Pflichtänderungen

1. Aktualisiere `scripts/wellfit-dev-agent/wellfit-agent.config.json`:
   - Ergänze in `sourceOfTruth`:
     - `project-register/wellfit-beta1-canonical-truth.json`
     - `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
     - `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`
   - Ergänze `topicFiles.wellfitCanonicalTruth` mit:
     - `project-register/wellfit-beta1-canonical-truth.json`
     - `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
     - `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`
     - `project-register/wellfit-knowledge-core.json`
     - `docs/architecture/WELLFIT_KNOWLEDGE_CORE.md`
   - Ergänze die neue Wahrheit außerdem in relevanten Topics:
     - `rewardsEconomy`
     - `mobileArBuddy`
     - `databaseArchitecture`
     - `agentArchitecture`

2. Aktualisiere `todolist/WORK_MAP.md`:
   - Ergänze einen Abschnitt `WellFit Beta 1 Canonical Truth`.
   - Verweise auf die drei zentralen Dateien.
   - Stelle klar: Diese Dateien überschreiben alte Solana-/WFT-/PreSale-/Investor-Aussagen für Beta 1.
   - Keine Parallelarchitektur anlegen.

3. Aktualisiere `todolist/TODO_INDEX.md`:
   - Ergänze einen Eintrag für die neue kanonische Wahrheit.
   - Ergänze, welche Agents/Coder sie vor Arbeit lesen müssen.

4. Aktualisiere `docs/architecture/WELLFIT_KNOWLEDGE_CORE.md` und `project-register/wellfit-knowledge-core.json` nur als Wegweiser:
   - Verweise auf `project-register/wellfit-beta1-canonical-truth.json`.
   - Mache klar: Knowledge Core bleibt Orientierung, die neue Canonical Truth ist für Beta-1-Entscheidungen führend.

5. Prüfe, ob `project-register/internal-sources.json` ergänzt werden muss:
   - Verweise auf die neue Canonical Truth als normalisierte Zusammenführung der internen Quellen.

## Harte Regeln

- Keine App-Runtime ändern.
- Keine Firebase Rules ändern.
- Keine Functions ändern.
- Keine Reward-/Ledger-/Anti-Cheat-Produktlogik implementieren.
- Keine Token-/Blockchain-/NFT-/Payment-Funktionen aktivieren.
- Keine alten TODOs löschen.
- Keine Parallelarchitektur erstellen.
- Nur Dokumentation, Register, Agent-Konfiguration und Querverweise aktualisieren.

## Inhaltliche Normalisierung

Die neue Wahrheit legt fest:

- `WFP` = WellFit-Punkte, interne Spielwährung, maximal 25 Milliarden Systembestand.
- `XP` = Avatar-Fortschritt/Level, nicht ausgebbar.
- `WFT` = späterer SUI-Token, erst nach stabilem 10.000+-Nutzerlauf und ohne Nutzerzusage zur Konvertierung.
- Beta 1 arbeitet ohne Blockchain, ohne echten Token, ohne Pre-Sale, ohne Auszahlung.
- WFP-Zentralwallet steuert Ausschüttungen, Preise, Gebühren und Rückflüsse.
- WFP und XP sind strikt getrennt.
- Mission-Rewards, Itempreise und Gebühren sind dynamisch.
- Avatarzustand beeinflusst Missionen und WFP-Belohnungen.
- Rudi = Hilfe/Erklärung.
- Leon = Warnung, Rettung, Licht, Lost-Avatar, schwere Rettungsmissionen.
- Mehrere Avatare erlaubt, aber nur ein Hauptavatar ist aktiv; Nebenavatare sind eingefroren.
- Nutzer-zu-Nutzer-Itemhandel mit WFP ist erlaubt, mit dynamischer WellFit-Gebühr.
- P2P/PvP-Wetten mit echtem Token sind nicht Beta 1.
- Skill-Duelle gegen System/Zeit/Leaderboard sind erlaubt.

## Output

Erstelle eine kleine, sichere PR mit:

- geänderten Agent-/Dokumentations-/Registerdateien,
- kurzer PR-Beschreibung,
- Hinweis auf keine Runtime-Änderungen,
- Checkliste der aktualisierten Querverweise.

Wenn bestehende Dateien widersprechen, nicht löschen, sondern ergänzen und auf die neue Canonical Truth verweisen.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `todolist/NEXT_ACTIONS.md`.

Beta-1 Canonical Truth Pflicht:
- Vor Beta-1 Governance-Aenderungen immer `project-register/wellfit-beta1-canonical-truth.json`, `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md` und `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md` lesen.
- Die drei Canonical-Truth-Dateien sind owner-protected/read-only fuer Agenten.
- Keine Aenderung an owner-protected Canonical-Truth-Dateien ohne explizite Owner-Freigabe.
- Falls Aenderung noetig: nur Vorschlag in `todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md` dokumentieren.

Produktgrenzen:
- WFP = interne Punkte in Beta-1.
- XP = Avatar-Fortschritt.
- WFT/SUI/Blockchain/Token/NFT/Payment/Cashout sind nicht Beta-1 aktiv.
- Keine echte GitHub API, kein echtes Deploy, Runner bleibt metadata_only, Admin/Owner approval erforderlich.
