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

ecosystemPillarFit:
  preventionMovement:
  learningEdTech:
  socialCommunity:
  arLocationEntertainment:
  aiBuddyAvatarBonding:
  suiDynamicAssetsFuture:
  b2bFiatMonetization:
  tokenUtilityNoSpeculation:
financialImpact:
  revenuePotential:
  costImpact:
  marginPotential:
  premiumConversionImpact:
  retentionImpact:
  CACImpact:
  B2BPartnerPotential:
  sponsorshipPotential:
  licensingPotential:
  marketplaceFeePotential:
internalEconomyImpact:
  WFPSourceOrSink:
  WFPInflationRisk:
  WFPReserveImpact:
  XPImpact:
  avatarEconomyImpact:
  itemEconomyImpact:
  missionRewardImpact:
  requiredCaps:
  requiredAdminReview:
  economyHealthRisk:
sourceRiskAssessment:
  sourceRiskClassification:
  riskReasons:
  rejectedSources:
  usableSources:
  notes:
productRadarAssessment:
  productDetected:
  productCategory:
  integrationPotential:
  resaleOrBundlePotential:
  B2BUsePotential:
  beta1Fit:
  futureRoadmapFit:
  recommendedAction:
forWellFitBenefitSummary: ""
whyNow: ""
whyNotNow: ""
economicRecommendation: ""
internalEconomyRecommendation: ""
```

## Pflichtregel
Keine echte Umsetzung ohne dokumentierte Owner/Admin approval im Agent Control Center und in den zugehoerigen Registern.


## Expanded Opportunity Dossier Template
```yaml
researchSummary:
  summary:
  keyFindings:
  sourceQuality:
benefits:
  userBenefits:
  businessBenefits:
  productBenefits:
expectedChange:
  whatChanges:
  whyChange:
  whatDoesNotChange:
targetUsers:
  primary:
  secondary:
  excludedOrNeedsReview:
chances:
  - ""
risks:
  - risk:
    mitigation:
    riskLevel:
sources:
  internal:
    - file:
      reason:
  external:
    - title:
      url:
      date:
      sourceType:
      relevance:
recommendation:
  agentRecommendation:
  confidence:
  recommendedDecision:
  reason:
adminDecision:
  state: pending
  decidedBy:
  decidedAt:
  notes:
```

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
