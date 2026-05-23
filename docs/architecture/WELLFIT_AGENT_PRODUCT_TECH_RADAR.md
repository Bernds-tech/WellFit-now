# WELLFIT AGENT PRODUCT / TECHNOLOGY RADAR

Status: report_only / admin_review_required

## 1) Zweck
Agenten sollen neue Produkte und Technologien systematisch erfassen, wenn sie WellFit sinnvoll verbessern koennen.

## 2) Beobachtungsfelder
- Smartwatches
- Smart Rings
- Health APIs
- AR glasses
- XR headsets
- AI glasses
- on-device AI
- computer vision
- pose / activity recognition
- GPS / location APIs
- SUI / Dynamic Assets (Future only)
- B2B health platforms
- corporate wellness tools
- education / EdTech tools
- tourism / museum / city AR tools

## 3) Product Radar Dossier (Pflicht bei neuer Technologie)
```yaml
productRadarId:
productName:
vendor:
productCategory:
releaseStatus:
sourceLinks:
  - title:
    url:
    date:
whatItDoes:
whyItMattersForWellFit:
affectedWellFitPillars:
  - preventionMovement
possibleIntegration:
possibleResaleOrBundle:
possibleB2BUse:
dataNeeded:
privacyRisk:
childSafetyRisk:
healthClaimRisk:
technicalComplexity:
estimatedCost:
expectedBenefit:
recommendedAction: ignore | monitor | research_more | propose_integration | propose_partner_test | blocked
beta1Fit:
futureRoadmapFit:
```

## 4) Beispiele
- Neue Smartwatch: pruefen, ob Schritt-/Herz-/Schlaf-/Routen-Daten sicher und review-konform nutzbar sind.
- Neue AR-Brille: pruefen, ob WellFit AR-Missionen, Buddy-Hinweise oder Location-Based Entertainment profitieren.
- Neue AI-API: pruefen, ob KI-Buddy, Missionengenerator oder Admin-Agenten profitieren.
- Neue SUI/Dynamic-Asset-Funktion: nur Zukunftsanalyse, keine Beta-1-Aktivierung.

## 5) Regeln
- Product Radar ist report-only.
- Keine Integration ohne Admin approval.
- Keine Health-/Child-/Location-Daten ohne Review.
- Keine Produktpartnerschaft ohne Business Review.
- Keine Quellen ohne Zitat.
- Keine spekulativen Krypto-Versprechen.

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
