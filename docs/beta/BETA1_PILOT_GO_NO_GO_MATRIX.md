# Beta-1 Pilot Go/No-Go Matrix (AT Closed Beta Wave 1)

Status: readiness decision matrix (human evidence capture update)
Date: 2026-05-21
Branch context: `readiness/beta1-human-evidence-capture`
Scope: Closed Beta Wave 1 in Austria (25-50 testers)

## 1) Wave-1-Startregel

**Wave 1 darf nur starten, wenn alle Must-be-GREEN Kategorien GREEN sind.**

## 2) Matrix (konservativ)

| Kategorie | Status | Must be GREEN before Wave 1? | Hinweis |
| --- | --- | --- | --- |
| Live Pages Navigation | YELLOW | yes | Dokumentation aus PR #205 liegt vor; Device-Human-Evidence separat offen. |
| Mobile Device Evidence (Android Chrome + iPhone Safari) | TBD (pending_human_evidence) | yes | Keine echten Human Device Tests dokumentiert. |
| Desktop Responsive Smoke | TBD (pending_human_evidence) | yes | Human Smoke Evidence fehlt. |
| Manual Seed Run | TBD (pending_human_evidence) | yes | Runbook/Template vorhanden, aber kein ausgefuellter Run-Nachweis. |
| Dashboard Wallet/Ledger Smoke | YELLOW (pending_human_evidence) | yes | Aktueller Human-Konsistenznachweis fehlt. |
| Shop Page Smoke | TBD (pending_human_evidence) | yes | Human Evidence offen. |
| Leaderboard Page Smoke | TBD (pending_human_evidence) | yes | Human Evidence offen. |
| Analytics Page Smoke | TBD (pending_human_evidence) | yes | Human Evidence offen. |
| Marketplace Preview Smoke | TBD (pending_human_evidence) | yes | Human Evidence offen. |
| Guardian/Child Boundary | YELLOW (pending_human_evidence) | yes | Boundary ist definiert, aber nicht frisch manuell nachgewiesen. |
| Privacy/Consent Wording | YELLOW (required_review) | yes | Formale Review-Evidence fehlt. |
| Support Contact Replacement | YELLOW (required_to_replace) | yes | Placeholder noch nicht durch Rolle ersetzt. |
| Onboarding Dry Run | TBD (pending_human_evidence) | yes | Kein dokumentierter Dry Run. |
| Permission Denied No-Leak | YELLOW (pending_human_evidence) | yes | Denied-Flow Evidence fehlt. |
| Reality Glitch Safety | YELLOW (pending_human_evidence) | yes | Safety-Dry-Run Evidence fehlt. |

## 3) Aktueller Entscheidungsstatus

**NO-GO (Stand 2026-05-21)**, weil Must-be-GREEN Evidence weiterhin fehlt.

## 4) Guardrails

Keine Runtime-Logik, keine Functions/Rules, keine Deploys, keine PII, keine kuenstlichen GREEN-Status.
