# WELLFIT AGENT ECOSYSTEM & ECONOMY DOSSIER

Status: planning_only / governance_required

## 1) Zweck
Jeder Agent-/Mission-/Produkt-/Research-Vorschlag muss transparent bewerten, welchen konkreten Nutzen der Vorschlag fuer WellFit als Gesamtoekosystem liefert.

## 2) Multi-Saeulen-Analyse (Pflicht)
Jeder Vorschlag bewertet folgende Saeulen:
- preventionMovement (Praevention / Bewegung)
- learningEdTech (Lernen / EdTech)
- socialCommunity (Social / Community)
- arLocationEntertainment (AR / Location-Based Entertainment)
- aiBuddyAvatarBonding (KI-Buddy / Avatarbindung)
- suiDynamicAssetsFuture (SUI / Dynamic Assets, nur Zukunftsanalyse)
- b2bFiatMonetization (B2B-Fiat-Monetarisierung)
- tokenUtilityNoSpeculation (Token als Utility, ohne Spekulationsversprechen)

## 3) Finanzwirkung (Pflicht)
Pro Vorschlag dokumentieren:
- revenuePotential
- costImpact
- marginPotential
- premiumConversionImpact
- retentionImpact
- CACImpact
- B2BPartnerPotential
- sponsorshipPotential
- licensingPotential
- marketplaceFeePotential
- implementationCostClass
- operationalCostClass

## 4) Interner Wirtschaftskreislauf (Pflicht)
Pro Vorschlag dokumentieren:
- WFPSourceOrSink
- WFPInflationRisk
- WFPReserveImpact
- XPImpact
- avatarEconomyImpact
- itemEconomyImpact
- missionRewardImpact
- requiredCaps
- requiredAdminReview
- economyHealthRisk

## 5) Regeln / Guardrails
- WFP bleibt in Beta 1 ein internes Punktesystem.
- XP bleibt Avatar-Fortschritt und ist getrennt von WFP zu betrachten.
- WFT/SUI/Dynamic Assets sind nur Future-/Backlog-Analyse, keine Beta-1-Aktivierung.
- Token duerfen nur als Utility analysiert werden, nicht als Spekulationsversprechen.
- Kein Cashout/Payment/Token/NFT in Beta 1 aktivieren.
- Keine Kinder-Monetarisierung.
- Kein Gluecksspiel, kein Ponzi.

## 6) Bewertungs-Output (Kurzschema)
```yaml
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
  implementationCostClass:
  operationalCostClass:
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
