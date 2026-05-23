# AGENT Mission Story Proposals (Planning Only)

Zweck: Vorlage fuer narrative Missionen, bei denen Nutzer eine motivierende Story erleben.

```yaml
storyId:
title:
missionType:
targetUsers:
ageSafetyClass:
storyPremise:
userFantasy:
emotionalGoal:
realWorldAction:
learningGoal:
movementGoal:
socialGoal:
chapterStructure:
missionSteps:
rewardType: WFP | XP | badge | cosmetic | none
WFP_XP_Notes:
avatarRole:
buddyDialogueStyle:
safetyBoundaries:
childGuardianNotes:
locationPrivacyNotes:
evidenceNeeded:
whyThisStoryMotivates:
risks:
mitigation:
canonicalTruthCompatibility:
beta1Fit:
requiredAdminApproval: true

ecosystemPillarFit:
financialImpact:
internalEconomyImpact:
storyMonetizationFit:
WFPSourceOrSink:
XPProgressionFit:
avatarBondingImpact:
replayability:
partnerOrLocationFit:
B2BUsePotential:
sponsorFit:
riskSourceAssessment:
ownerDecision:
```

## Regeln
- Keine medizinischen Diagnosen.
- Keine Scham-/Drucksprache.
- Keine echten Token/NFT/Cashout.
- Keine Kinderprofile oeffentlich.
- Keine sensiblen Standortdaten oeffentlich.
- Missionen muessen WFP/XP sauber trennen.
- Geschichten sollen motivieren, nicht manipulieren.

- Narrative Missionen duerfen motivierend sein, aber nicht manipulativ.
- Keine Suchtspirale als positives Ziel.
- Kein Gluecksspiel.
- Kein Pay-to-Win.
- Kein Kinder-Monetarisierungsdruck.
- Keine Heilversprechen.

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
