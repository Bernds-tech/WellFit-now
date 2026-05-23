# WELLFIT Agent Opportunity Dossier

## Zweck
Jeder Agent-/Mission-/Produktvorschlag muss als vollstaendiges Entscheidungs-Dossier dokumentiert werden, bevor ein Task fuer Umsetzung vorgeschlagen wird.

## Pflichtfelder pro Dossier
- proposalId
- title
- proposalType (`product_feature | mission | mission_story | ui_improvement | safety_improvement | business_opportunity | research_followup | technical_foundation`)
- shortSummary
- researchSummary
- internalEvidence
- externalSources
- benefits
- expectedChange
- reasonForChange
- targetUsers
- userProblemSolved
- chances
- risks
- safetyConcerns
- canonicalTruthCompatibility
- beta1Fit
- WFP_XP_Impact
- whatWillNotChange
- implementationEffort
- requiredEvidence
- recommendation
- recommendedDecision
- suggestedBranch
- allowedFiles
- blockedFiles
- requiredChecks
- adminDecision
- ownerNotes

## Entscheidungs- und Schutzregeln
- Kein Dossier darf direkt eine Umsetzung ausloesen.
- Umsetzung ist erst nach Admin/Owner-Approval erlaubt.
- Research bleibt report-only.
- Quellen muessen nachvollziehbar zitiert werden (intern/extern).
- Keine Dark Patterns oder manipulative Suchtdynamik.
- Keine Beta-1 Token/Cashout/Blockchain-Aktivierung.
- Canonical Truth bleibt protected; owner-only Dateien werden nicht geaendert.

## Ergebnis
Das Dossier liefert Admin/Owner eine klare Entscheidungsvorlage: `approve | reject | revise | research_more`.

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
