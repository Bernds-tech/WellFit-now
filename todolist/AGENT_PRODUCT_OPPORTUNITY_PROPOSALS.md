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


## First Run 2026-05-23 — Product Evolution Opportunity Dossiers

### 1)
dossierId: PE-20260523-01
title: Family Walk & Learn Seasonal Mission Pack
category: mission_content_system
targetPillar: Praevention / Bewegung
problem: Beta-1 hat noch zu wenig strukturierte familiengeeignete Mission-Bundles mit klaren Safety-Boundaries.
proposedChange: Admin-freigabefaehiges Dossier fuer saisonale Walk+Learn Mission-Packs (nur Konzeption).
whyNow: Nach PR #241 ist Control-Center technisch vorbereitet; jetzt braucht es hochwertige Inhalte fuer Approval-Pipeline.
WellFit benefit: Schnellere Aktivierung sicherer Mission-Roadmap ohne Runtime-Risiko.
user benefit: Klare, motivierende Familienmissionen mit Bewegung und Lernanteil.
business benefit: Hoehere Retention + vorbereitete B2B Family-Wellness Story.
financial impact: mittel (indirekt ueber Retention/Konversion).
WFP/XP economy impact: WFP als kontrollierter Reward-Loop, XP fuer Avatar Progress.
internal economy impact: erfordert Reward-Caps und saisonale Sink-Mechanik.
beta1Allowed: yes
beta1Scope: docs/register proposal only
forbiddenScope: token/nft/payment/cashout/runtime reward authority
risks: Reward-Inflation, Child-Safety-Missverstaendnisse
mitigation: Reward-Caps, Guardian-Boundary, admin approval gate
researchSummary: internal-only analysis ausreichend fuer first-run proposal
evidenceSource:
  internal_sources: [WORK_MAP, TODO_INDEX, user-feedback, adaptive-user-insights]
  repo_status: [agent-control-center, dossier-to-runner pipeline]
  external_research_pending: true
recommendation: approve
suggestedTaskProposal:
  suggestedBranch: proposal/family-seasonal-mission-pack
  allowedFiles: [docs/**, todolist/**, project-register/**]
  blockedFiles: [app/**, functions/**, firestore.rules, native/**]
  requiredChecks: [npm run agent:validate, npm run agent:quality-gate, npm run lint, npm run build, git diff --check]
  riskLevel: medium
  runnerEligibility: true
  adminDecisionPlaceholder: pending

### 2)
dossierId: PE-20260523-02
title: Buddy Habit Reflection Loop (Non-medical)
category: ai_buddy_engagement
targetPillar: KI-Buddy / Avatarbindung
problem: Buddy-Bindung ist konzeptionell stark, aber Dossier fuer sichere Beta-1 Habit-Reflexion fehlt.
proposedChange: Proposal fuer taegliche Reflexionsprompts ohne Gesundheitsdiagnostik.
whyNow: Hoeherer Engagement-Hebel ohne neue Compliance-kritische Datenpfade.
WellFit benefit: staerkere Avatarbindung mit XP-Fortschritt.
user benefit: mehr Motivation durch kleine taegliche Ziele.
business benefit: bessere D1/D7-Retention.
financial impact: mittel
WFP/XP economy impact: XP-first, WFP nur bei regelkonformen mission steps.
internal economy impact: niedrige Inflation bei XP-Fokus.
beta1Allowed: yes
beta1Scope: proposal + narrative design
forbiddenScope: medical claims, sensitive inference, tokenization
risks: motivational pressure, health-adjacent wording
mitigation: ethical copy review + risk filter
researchSummary: externe Verhaltensforschung optional spaeter
evidenceSource:
  internal_sources: [AGENT_MISSION_STORY_PROPOSALS, user-feedback]
  repo_status: [agent approval flow ready]
  external_research_pending: true
recommendation: approve
suggestedTaskProposal:
  suggestedBranch: proposal/buddy-habit-reflection-loop
  allowedFiles: [docs/**, todolist/**, project-register/**]
  blockedFiles: [app/**, functions/**]
  requiredChecks: [npm run agent:validate, npm run agent:quality-gate, npm run lint, npm run build]
  riskLevel: medium
  runnerEligibility: true
  adminDecisionPlaceholder: pending

### 3)
dossierId: PE-20260523-03
title: AR-Lite Discovery Route Framework
category: ar_location_mission_design
targetPillar: AR / Location-Based Entertainment
problem: AR-Wertversprechen da, aber Beta-1 braucht privacy-safe low-risk Einstieg ohne Unity-Abhaengigkeit.
proposedChange: Dossier fuer AR-lite Mission-Blueprint mit coarse location boundaries.
whyNow: Unity bleibt isoliert; trotzdem kann Web-Beta Story vorbereitet werden.
WellFit benefit: AR-Track roadmapfaehig ohne native risk.
user benefit: spielerische Bewegung in sicheren Zonen.
business benefit: vorbereitetes Partner-/Location Narrative.
financial impact: mittel-langfristig
WFP/XP economy impact: XP progression via exploration chapters.
internal economy impact: WFP nur capped completion bonus.
beta1Allowed: yes
beta1Scope: docs/register only
forbiddenScope: precise tracking, child location exposure
risks: privacy/location sensitivity
mitigation: coarse zones + no public coordinates
researchSummary: external device/platform benchmarking pending
evidenceSource:
  internal_sources: [WELLFIT_AGENT_PRODUCT_TECH_RADAR, canonical truth docs]
  repo_status: [unity isolation rule]
  external_research_pending: true
recommendation: research_more
...
