# WellFit Agent Control Center

Stand: 2026-05-17
Status: Konzept und Register-Vorbereitung, keine Runtime-Automatisierung.

## 1. Zweck

Das Agent Control Center soll Agent-Vorschlaege sichtbar machen, bewerten, freigeben, ablehnen, ueberarbeiten lassen oder blockieren. Es ist keine neue Agent-Parallelarchitektur, sondern eine sichtbare Entscheidungs- und Kontrollschicht ueber bestehenden WellFit-Registern, Policies und Quality Gates.

## 2. Zielbild

- Agents analysieren WellFit anhand bestehender Source-of-Truth-Dateien.
- Agents erkennen Luecken, Widersprueche, Chancen und Risiken.
- Agents erstellen Vorschlaege als maschinenlesbare Proposals.
- Vorschlaege erscheinen fuer Admin/Owner in einer spaeteren UI.
- Admin/Owner kann freigeben, ablehnen oder Ueberarbeitung verlangen.
- Nach Freigabe wird ein kontrollierter Codex-/Runner-Task vorbereitet.
- Ergebnisse werden geprueft, dokumentiert und nicht automatisch produktiv deployed.

## 3. Admin-Rollen

| Rolle | Rechte | Grenzen |
| --- | --- | --- |
| Viewer | Darf Vorschlaege und Check-Ergebnisse lesen. | Keine Freigabe, keine Ausfuehrung. |
| Agent Admin | Darf Low-/Medium-Risk Vorschlaege freigeben, wenn die Policy es erlaubt. | Keine High-/Critical-Freigabe; keine eigene Arbeit self-approven. |
| Technical Admin | Darf technische Ausfuehrung vorbereiten und Codex-Auftraege pruefen. | Keine Production-Deploys ohne Owner-/Release-Freigabe. |
| Owner | Muss High-/Critical-Risk Vorschlaege freigeben. | Auch Owner-Freigabe ersetzt keine Tests, Audit-Hinweise oder Reviewplaene. |
| System Agent | Darf Vorschlaege erstellen, Risiken klassifizieren und Checks vorschlagen. | Darf nie selbst freigeben, mergen, deployen oder Protected Scopes aktivieren. |

## 4. Proposal-Workflow

Statusmodell:

1. `draft`
2. `pending_review`
3. `pending_approval`
4. `approved`
5. `rejected`
6. `needs_revision`
7. `execution_ready`
8. `execution_running`
9. `checks_running`
10. `pr_created`
11. `blocked`
12. `completed`

Wichtig: `approved` bedeutet nur fachliche Freigabe fuer den naechsten kontrollierten Schritt. Es bedeutet **nicht** Auto-Merge, Auto-Deploy, Runtime-Autoritaet oder Schutzbereichsfreigabe.

## 5. Risk-Gate

| Risk Level | Bedeutung | Default-Automation |
| --- | --- | --- |
| Low | Docs/Register/report-only Aenderungen. | Darf nach Bereichsfreigabe vorbereitet werden; kein Auto-Merge/Deploy. |
| Medium | Neue Analyse-Skripte, neue Admin-Konzepte, neue Agent-Erweiterungen. | Braucht Konzeptfreigabe und Checks; kein Auto-Merge/Deploy. |
| High | Runtime-Code, Userdaten, Rewards, Mission Completion, Backend-Autoritaet. | Einzel-Freigabe und Reviewplan erforderlich; keine automatische Ausfuehrung. |
| Critical | Token, Wallet, Payment, Presale, Health, Child Safety, Location, Camera/Biometric, Legal, Firestore Rules, Production Deployment. | Einzel-Freigabe, Audit-Hinweis, Reviewplan; nie automatisch gemerged/deployed. |

## 6. Freigabelogik

- Low Risk darf nach Bereichsfreigabe automatisch als Task vorbereitet werden.
- Medium Risk braucht Konzeptfreigabe.
- High Risk braucht Einzel-Freigabe und Reviewplan.
- Critical Risk braucht Einzel-Freigabe, Audit-Hinweis und darf nie automatisch gemerged/deployed werden.
- Kein Agent darf seine eigene Arbeit freigeben.
- Auto-Merge bleibt deaktiviert.
- Auto-Deploy bleibt deaktiviert.
- Runtime-Ausfuehrung braucht eine separate, exakte Allowlist.

## 7. Controlled Curiosity / Research Flow

Die KI soll nicht unkontrolliert im Internet lernen. Stattdessen gilt:

1. Agent erkennt eine Wissensluecke.
2. Agent erstellt ein Research Proposal.
3. Proposal nennt Zweck, erlaubte Quellenarten, Risiko, erwarteten Nutzen und betroffene WellFit-Bereiche.
4. Admin/Owner gibt Recherche frei oder lehnt ab.
5. Ergebnisse werden als Research-Dokument gespeichert.
6. Ein anderer Agent oder Reviewer prueft Quellen, Risiken und Verwendbarkeit.
7. Erst danach darf Wissen in Roadmap, Website, Investorentexte oder Produktkonzept uebernommen werden.

Bestehende Quellen: `project-register/research-recommendations.json`, `docs/architecture/WELLFIT_RESEARCH_RECOMMENDATION_AGENT.md`, `scripts/wellfit-dev-agent/src/research-recommendation-check.mjs`.

## 8. Codex Task Generator

Aus einem freigegebenen Proposal soll ein sauberer Codex-Auftrag entstehen:

- First-read files.
- Erlaubte Dateien.
- Verbotene Dateien.
- Scope und Nicht-Ziele.
- Checks.
- Reporting-Anforderungen.
- Risiko.
- Erwarteter PR-/Diff-Umfang.
- Stop-Bedingungen.
- Human-Approval-Anforderungen.

Der Generator darf nur vorhandene Strukturen nutzen: Agent Catalog, Task Queue, Risk Classifier, Definition of Done, Approved Build Backlog, PR Review Policy und Quality Gate.

## 9. Admin UI Zielbild

Spaeterer Pfad:

- `/admin/agent-center`
- alternativ `/admin/cognitive-core`

Anzeige:

- Vorschlagsliste.
- Detailansicht.
- Risiko.
- Betroffene Dateien.
- Erlaubte/verbotene Scopes.
- Freigabe/Ablehnung/Revision-Anforderung.
- Ausfuehrungsstatus.
- Check-Ergebnisse.
- PR-Link.
- Audit-Historie.

Diese UI wird in dieser Phase nicht gebaut.

## 10. Grenzen

Dieses Konzept aktiviert keine direkte Runtime-Automatisierung, keine produktiven Writes, keine Token-/Payment-/Health-/Legal-Aenderungen und kein Deployment.

Explizit nicht in dieser Phase:

- Keine Dateien unter `app/admin/agent-center/**`.
- Keine UI-Komponenten.
- Keine API-Routen.
- Keine Firebase Writes.
- Keine Auth-/Role-Logik.
- Keine Approval Buttons.
- Keine Production Workflows.
- Keine Auto-Merge-/Auto-Deploy-Aktivierung.

## 11. Naechster kleinster Schritt

Nach Review dieses Konzepts sollte ein separater PR nur eine read-only Admin-UI-Spezifikation vorbereiten: Datenquellen, Felder, Rollenanzeige, Audit-Ansicht, aber weiterhin keine produktiven Writes und keine Approval-Buttons.

## KI-Fortsetzungs-Prompt

Wenn an diesem Konzept weitergearbeitet wird, zuerst `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER_GAP_ANALYSIS.md`, `project-register/agent-control-center.json`, `project-register/agent-proposals.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json` und `scripts/wellfit-dev-agent/src/agent-control-center-check.mjs` lesen. Nur bestehende Agent-Governance erweitern, keine Parallelarchitektur, keine Runtime-UI und keine Auto-Merge-/Deploy-Aktivierung bauen.
