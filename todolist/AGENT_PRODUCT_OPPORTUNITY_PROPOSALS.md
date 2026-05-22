# AGENT PRODUCT OPPORTUNITY PROPOSALS

Status: planning / owner-review-required

## Zweck
Vorlage fuer neue Verbesserungsvorschlaege aus internen Analysen und optionaler report-only externer Recherche. Keine Umsetzung ohne Owner/Admin approval.

## Proposal Vorlage
```yaml
proposalId: PROPOSAL-YYYYMMDD-XX
title: ""
source: internal_gap | user_feedback | business_plan | web_research | trend | safety_review
summary: ""
internalEvidence:
  - ""
externalSources:
  - title: ""
    link: ""
    date: ""
canonicalTruthCompatibility: compatible | partial | conflict
beta1Fit: high | medium | low
riskLevel: low | medium | high | critical
childHealthPrivacyRisk: none | low | medium | high
implementationEffort: small | medium | large
expectedUserBenefit: ""
expectedBusinessBenefit: ""
suggestedBranch: ""
allowedFiles:
  - ""
blockedFiles:
  - ""
requiredChecks:
  - npm run agent:validate
  - npm run agent:quality-gate
  - npm run lint
  - git diff --check
ownerDecision: pending | approved | rejected | revise
```

## Pflichtregel
Keine echte Umsetzung ohne dokumentierte Owner/Admin approval im Agent Control Center und in den zugehoerigen Registern.
