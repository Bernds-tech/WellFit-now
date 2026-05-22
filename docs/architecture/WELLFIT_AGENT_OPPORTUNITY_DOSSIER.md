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
