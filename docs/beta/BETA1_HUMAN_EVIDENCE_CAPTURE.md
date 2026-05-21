# Beta-1 Human Evidence Capture (Wave 1)

Status: human/manual evidence capture register (no fabricated results)
Date: 2026-05-21
Branch context: `readiness/beta1-human-evidence-capture`

## 1) Zweck

Dieses Dokument erfasst offene Human-/Manual-Evidence fuer Beta-1 Wave 1 strukturiert und nachvollziehbar.

## 2) Aktueller Status

**Wave 1 bleibt NO-GO**, bis alle Must-be-GREEN Evidence-Punkte mit echter Human-/Manual-Evidence belegt sind.

## 3) Evidence-Matrix

| evidenceId | category | requiredForWave1 | currentStatus | evidenceSource | noPiiConfirmed | result | notes | canTurnGreen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| device_android_chrome | Android Chrome Device Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_RUN.md; BETA1_LIVE_PAGES_NAVIGATION_DEVICE_SMOKE.md | yes | TBD | Echter Device-Run mit Datum/Geraet/Browser fehlt. | yes |
| device_iphone_safari | iPhone Safari Device Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_RUN.md; BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md | yes | TBD | Echter iPhone-Safari-Nachweis fehlt. | yes |
| device_desktop_responsive | Desktop Responsive Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_RUN.md | yes | TBD | Human Smoke fuer relevante Breakpoints fehlt. | yes |
| live_pages_navigation | Live Pages Navigation Smoke | yes | captured | BETA1_LIVE_PAGES_NAVIGATION_DEVICE_SMOKE.md | yes | documented_navigation_smoke | Dokumentiert aus PR #205; Device-Teil bleibt separat pending. | yes |
| manual_seed_run | Manual Demo Seed Run | yes | pending_human_evidence | BETA1_MANUAL_DEMO_SEED_RUNBOOK.md; BETA1_MANUAL_SEED_EVIDENCE_TEMPLATE.md | yes | TBD | Runbook/Template vorhanden, kein ausgefuellter Run. | yes |
| shop_page_smoke | `/shop` Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md | yes | TBD | Human Route-Smoke fehlt. | yes |
| leaderboard_page_smoke | `/leaderboard` Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md | yes | TBD | Human Route-Smoke fehlt. | yes |
| analytics_page_smoke | `/analytics` Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md | yes | TBD | Human Route-Smoke fehlt. | yes |
| marketplace_preview_smoke | `/marketplace` Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_PACK_TEMPLATE.md | yes | TBD | Human Route-Smoke fehlt. | yes |
| dashboard_wallet_ledger_smoke | Dashboard Wallet/Ledger Smoke | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_RUN.md | yes | TBD | Aktueller Konsistenznachweis fehlt. | yes |
| guardian_child_boundary | Guardian/Child Boundary | yes | pending_human_evidence | WELLFIT_BETA1_SCOPE.yaml; BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md | yes | TBD | Scope vorhanden, aber kein aktueller manueller Boundary-Nachweis. | yes |
| privacy_consent_wording | Privacy/Consent Wording | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_RUN.md; BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md | yes | required_review | Formale Review-Evidence fehlt. | yes |
| support_contact_replacement | Support Contact Replacement | yes | pending_human_evidence | BETA1_PILOT_SUPPORT_RUNBOOK.md | yes | required_to_replace | Kontakt ist noch Placeholder/Role-Alias. | yes |
| onboarding_dry_run | Onboarding Dry Run | yes | pending_human_evidence | BETA1_TEST_USERS_AND_ROLLOUT_PLAN.md | yes | TBD | Dry-Run-Evidence fehlt. | yes |
| permission_denied_no_leak | Permission Denied No-Leak | yes | pending_human_evidence | BETA1_PILOT_EVIDENCE_RUN.md | yes | TBD | Denied-Flow mit human QA-Nachweis fehlt. | yes |
| reality_glitch_safety | Reality Glitch Safety Dry Run | yes | pending_human_evidence | WELLFIT_BETA1_SCOPE.yaml; BETA1_PILOT_EVIDENCE_RUN.md | yes | TBD | Safety-Dry-Run mit Stop-Check fehlt. | yes |

## 4) Safety Guardrails

- Keine Runtime-Produktlogik, Functions oder Firestore Rules wurden geaendert.
- Keine echten Tester-E-Mails, echten Namen oder sonstige personenbezogene Daten.
- Keine sensiblen Screenshots im Repo.
- Keine kuenstliche GREEN-Markierung ohne echte Human Evidence.
