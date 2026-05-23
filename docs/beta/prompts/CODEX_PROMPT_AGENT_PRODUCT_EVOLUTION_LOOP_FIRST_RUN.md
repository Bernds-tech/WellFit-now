# CODEX PROMPT - AGENT PRODUCT EVOLUTION LOOP FIRST RUN

Branch: `analysis/agent-product-evolution-first-run`

## Ziel
Fuehre einen ersten report-only Product-Evolution-Analyse-Lauf aus:
- interne Quellen
- Businessplan-nahe Artefakte
- Repository-/Registerstatus
- Canonical Truth als Read-only Referenz

## Grenzen
- Externe Research optional, aber nur report-only.
- Keine Runtime-Aenderungen.
- Keine Functions/Rules.
- Keine protected Canonical-Truth-Aenderungen.
- Kein Deploy, kein echter Runner, keine echte GitHub-API.

## Erwarteter Output
1. Opportunity report
2. Top 10 improvement proposals
3. Risk matrix
4. Next recommended owner-approved tasks


## Opportunity Dossier Pflichtausgabe
- Jeder Vorschlag muss als Opportunity Dossier ausgegeben werden.
- Missionen/Geschichten muessen zusaetzlich ein Mission Story Dossier nutzen.
- Jede externe Recherche braucht ein Research Summary.
- Jeder Vorschlag braucht Chancen, Risiken, Quellen und Empfehlung.
- Keine Umsetzung ohne Admin approval.
- Keine Canonical-Truth-Aenderungen.


## Erweiterte Pflichtregeln
- Jeder Vorschlag muss pruefen, was er WellFit als Gesamtoekosystem bringt.
- Jeder Vorschlag muss die Finanzwirkung pruefen.
- Jeder Vorschlag muss den internen WFP/XP-Wirtschaftskreislauf pruefen.
- Jeder Vorschlag muss den Multi-Saeulen-Oekosystem-Fit pruefen.
- Neue Produkte/Technologien muessen als Product Radar Dossier erfasst werden.
- Quellen mit Gluecksspiel/Ponzi/Heilversprechen/Kinder-Monetarisierung als Risikoquelle markieren und nicht positiv verwenden.
- Token als Utility darf analysiert werden, aber keine Beta-1 Token-Aktivierung.

## Update 2026-05-22: Automation Control + Retry Guard
- Vor jedem Lauf Agent Automation Control pruefen.
- mode off/paused/halted_waiting_owner => stop.
- mode repair_required => nur repair/governance/conflict.
- Zyklusstart immer: interne Quellen -> Repo-Status -> Canonical Truth -> Quality Gate -> offene Tasks/Dossiers -> Admin Approval.
- Keine Umsetzung ohne Admin approval.
- Kein GitHub Token/Secret im Client, keine echte GitHub API, kein echtes Deploy, kein Auto-Merge/Auto-Deploy bei roten Checks.

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
