# WELLFIT AGENT PRODUCT EVOLUTION LOOP

Status: planning_only  
Owner review: required before any implementation

## 1) Zweck
Der Product Evolution Loop erweitert den bestehenden WellFit-Agentenbetrieb: Agents sollen nicht nur offene Tasks abarbeiten, sondern nach Abschluss offener Arbeit kontrolliert neue Verbesserungsmoeglichkeiten identifizieren.

## 2) Grundprinzip
- Internal-first.
- Canonical Truth first.
- Research report-only.
- Admin approval required.
- No autonomous protected runtime.
- No dark patterns.
- No Beta-1 token/cashout/blockchain activation.

## 3) Loop
1. Intake
2. Internal analysis
3. Gap detection
4. Opportunity generation
5. External research (report-only)
6. Scoring
7. Admin approval
8. Task proposal
9. Worker queue
10. PR/runner
11. Evidence
12. Repeat

## 4) Agent Rollen
- Backlog Executor
- Concept Gap Analyzer
- Product Research Agent
- Behavioral Design Agent
- Safety/Compliance Critic
- Opportunity Scoring Agent
- Proposal-to-Task Agent

## 5) Stop Conditions
Stop und eskalieren, wenn mindestens einer dieser Punkte zutrifft:
- Canonical Truth conflict
- protected child/health/location/privacy/legal area betroffen
- token/payment/cashout/blockchain Aktivierung notwendig
- manipulative/addictive/dark pattern Mechanik als Ziel
- medizinischer Claim erforderlich
- no source / hallucinated research
- no admin approval

## 6) Governance Boundaries
- Keine Runtime-Produktlogik in diesem Loop-Plan.
- Keine Functions/Firestore-Rules-Aenderung.
- Kein Auto-Merge/Auto-Deploy.
- Externe Recherche bleibt optional und report-only.
- Umsetzung erst nach Owner/Admin-Entscheid und Task-Proposal->Worker-Queue Uebergabe.

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
