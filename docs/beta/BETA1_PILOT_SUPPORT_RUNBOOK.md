# Beta-1 Pilot Support Runbook

Status: support + incident handling playbook (closed beta wave 1)
Date: 2026-05-21
Branch context: `readiness/beta1-pilot-evidence-run`
Target: 25-50 Beta-Tester (Austria wave 1)

## 1) Ziel

Definiert den Supportprozess fuer die geschlossene Beta-1 Testphase mit 25-50 Testern, inklusive Incident-Klassifikation, Reaktionslogik und Stop Conditions.

## 2) Support-Kanaele (Placeholder, required_to_replace)

- `support-placeholder-email`
  - status: `placeholder`
  - required_to_replace: `before_wave_1`
- `admin/support operator`
  - status: `placeholder_role`
  - required_to_replace: `before_wave_1`
- `incident log placeholder`
  - status: `placeholder`
  - required_to_replace: `before_wave_1`

> Keine echten Namen oder echten E-Mail-Adressen in diesem Dokument verwenden.

## 3) Incident-Kategorien

- `login_problem`
- `mission_not_visible`
- `xp_wallet_issue`
- `permission_denied`
- `child_guardian_issue`
- `safety_report`
- `glitch_safety_issue`
- `shop_inventory_issue`
- `privacy_concern`
- `other`

## 4) Reaktionslogik (Severity)

- **P0**: Child safety/privacy/security/payment/token leakage
- **P1**: Login blocked, mission system unavailable, XP corruption
- **P2**: UI bug, missing content, unclear text
- **P3**: cosmetic/minor issue

### Ziel-SLA (Richtwerte)

- P0: Sofort eskalieren, Pilot pausieren, Incident Command aktivieren.
- P1: Schnell triagieren und priorisiert bearbeiten; bei Haeufung Pilot pausieren.
- P2: Sammeln, priorisieren, im laufenden Pilot beheben falls risikoarm.
- P3: Fuer spaetere Iteration dokumentieren.

## 5) Stop Conditions

Pilot pausieren, wenn einer der Punkte zutrifft:

1. P0 tritt auf.
2. Mehrere P1 in kurzer Zeit auftreten.
3. Child safety issue auftritt.
4. Token/Cashout/Payment expectation leak erkannt wird.

## 6) Incident Evidence Template

Verwende pro Incident mindestens:

- `incidentId`
- `date`
- `testerKey`
- `category`
- `severity`
- `description`
- `affectedRoute`
- `expected`
- `actual`
- `status`
- `owner`
- `resolutionNotes`

## 7) Operative Leitlinien

- Nur Placeholder-Testerkeys nutzen (keine echten personenbezogenen Daten).
- Keine Runtime-/Backend-Authority in Support-Dokumentation veraendern.
- Server bleibt finale Autoritaet fuer Rewards/Mission Completion/Anti-Cheat.
- Jede potenzielle Compliance-Verletzung als P0 behandeln.


## Wave-1 Contact Placeholder Requirement

- support-contact: `role_alias_required`
- Keine echte Person und keine echte E-Mail im Repository eintragen.
- Vor Wave 1 muss der Placeholder durch eine verantwortliche Rollenbezeichnung ersetzt werden (z. B. `beta1_support_oncall_role`).
- Diese Ersetzung muss als Human Evidence dokumentiert werden.
