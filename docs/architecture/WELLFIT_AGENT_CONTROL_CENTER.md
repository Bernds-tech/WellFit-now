# WellFit Agent Control Center

Stand: 2026-05-17
Status: Konzept, Register-Vorbereitung und read-only Admin-Übersicht; keine Runtime-Automatisierung.

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

## 6.1 Freigabe-Nutzer und erlaubte Freigabearten

Der aktuell eindeutig beschriebene Freigabe-Nutzer fuer spaetere Governance-Flows ist **Guggenberger Bernd**. Er darf in einem zukuenftigen, separat freigegebenen Approval-System nur als Rolle `owner` oder `agent_admin` aufgeloest werden. Die Rolle muss serverseitig ueber Auth-/Role-Check geprueft werden; der Anzeigename allein reicht nicht als Berechtigung.

Erlaubte Freigabearten im Konzept:

- Read-only Register-Review-Bestaetigung ohne Ausfuehrungswirkung.
- Low-Risk Docs-/Register-Scope-Freigabe, wenn die Policy es erlaubt.
- Medium-Risk Konzeptfreigabe, solange kein Protected Scope betroffen ist.
- Als `owner`: High-Risk Einzel-Freigabe nur mit exakter Allowlist, Reviewplan, Stop-Bedingungen und erforderlichen Checks.
- Als `owner`: Critical-Risk nur manuell, mit Audit-Hinweis und weiterhin ohne Auto-Merge oder Auto-Deploy.

Blockierte Aktionen fuer diesen Nutzer in der aktuellen Umsetzung und fuer alle spaeteren Agent-Admin-Pfade:

- Keine Freigabe ohne Auth-/Role-Check.
- Keine Freigabe ohne append-only Audit-Log.
- Keine Self-Approval-Freigabe eigener Arbeit oder eigener Agent-Ausgaben.
- Keine Protected-Scope-Freigabe als `agent_admin`.
- Kein Merge, Deploy, Auto-Repair, Runtime-Execution, Firebase Write oder Production-Data-Write.
- Keine Aktivierung von Token-/Wallet-/Payment-, Reward-Authority-, Unity-/PR-13-, Firestore-Rules- oder Functions-Aenderungen ohne eigenen Reviewplan.

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

Dieses Kapitel beschreibt das Admin-UI-Zielbild und die jetzt erlaubte kleinste Zwischenstufe. Erlaubt ist nur eine read-only Uebersicht unter `app/admin/agent-center/page.tsx`, die statische Register sichtbar macht. Weiterhin verboten bleiben Runtime-Admin-Funktionen, API-Routen, Firebase Writes, Approval-Buttons und produktive Approval- oder Ausfuehrungsmechanismen.

### 9.1 Route-Kandidaten

Die read-only Zwischenstufe darf den folgenden Pfad nutzen, solange sie keine Aktionen ausloest. Moegliche Route-Kandidaten bleiben:

- `/admin/agent-center` als jetzt verwendeter read-only Admin-Pfad fuer Agent-Vorschlaege und Kontrollstatus.
- `/admin/cognitive-core` als alternativer Name, falls der Bereich breiter als Agent-Proposals gefasst wird.

### 9.1.1 Read-only Zwischenstufe

Die aktuelle kleine Admin-Route darf ausschliesslich folgende statische Register zusammenfassen:

- `project-register/agent-catalog.json`
- `project-register/approved-agent-build-backlog.json`
- `project-register/agent-build-proposals.json`
- `project-register/agent-control-center.json`

Die Route darf nur Status, Zaehler, Risiko-/Capability-Hinweise, erlaubte und blockierte Scopes sowie Follow-up-Anforderungen anzeigen. Sie darf keine Buttons fuer Freigabe, Merge, Deploy, Auto-Repair oder Runtime-Ausfuehrung enthalten und darf keine API-Route oder Firebase-Write-Pfade anlegen.

### 9.2 Vorschlagsliste

Die Vorschlagsliste soll alle offenen und historischen Agent-Proposals read-only sichtbar machen. Mindestfelder:

- Proposal-ID, Titel, Kurzbeschreibung und Ersteller-Typ.
- Status aus dem Proposal-Workflow.
- Risiko-Level und naechste erforderliche menschliche Aktion.
- Betroffene Dateien oder Register.
- Letzte Aktualisierung, verantwortliche Rolle und verknuepfte Checks.

### 9.3 Detailansicht

Die Detailansicht soll pro Proposal die Entscheidungsgrundlage vollstaendig anzeigen:

- Ziel, Nicht-Ziele, erwarteter Nutzen und Annahmen.
- Risiko inklusive Begruendung, Eskalationsbedarf und Stop-Bedingungen.
- Betroffene Dateien, Routen, APIs, Register und Dokumente.
- Erlaubte Scopes, verbotene Scopes und explizite Protected-Scope-Hinweise.
- Vorgeschlagene Checks, Check-Ergebnisse und bekannte Blocker.
- PR-Link, falls ein Review-PR aus dem Proposal entstanden ist.
- Audit-Historie mit Statuswechseln, Kommentaren, Rollen und Zeitstempeln.

### 9.4 Entscheidungsaktionen

Die spaetere UI kann Entscheidungsaktionen sichtbar machen, darf sie aber erst aktivieren, wenn die Governance-Bedingungen aus Abschnitt 9.6 erfuellt sind:

- Freigabe fuer den naechsten kontrollierten Schritt.
- Ablehnung mit Begruendung.
- Ueberarbeitung anfordern, inklusive konkreter Rueckfrage oder Aenderungsanforderung.

Freigabe bedeutet weiterhin nur Freigabe des naechsten kontrollierten Schritts, nicht Auto-Merge, Auto-Deploy, Runtime-Autoritaet oder Protected-Scope-Freischaltung.

### 9.5 Ausfuehrungs- und Reviewstatus

Die UI soll den Ausfuehrungsstatus transparent, aber nicht selbst-autorisierend darstellen:

- Task vorbereitet, wartend, laufend, blockiert oder abgeschlossen.
- Check-Ergebnisse mit Befehl, Ergebnis, Zeitstempel und Einordnung.
- PR-Link und Reviewstatus, falls vorhanden.
- Audit-Historie fuer Proposal-Erstellung, Risikoklassifizierung, Freigaben, Ablehnungen, Ueberarbeitungen, Ausfuehrung und Checks.

### 9.6 Harte Bauvoraussetzung

Echte Entscheidungs- und Ausfuehrungsfunktionen dieser UI duerfen erst gebaut werden, wenn alle folgenden Grundlagen stabil, dokumentiert und reviewed sind:

- Register fuer Proposals, Risiken, Definition of Done, Audit Events und Task-Handoffs.
- Validator fuer Schema, Risk-Gates, Scopes, Check-Pflichten und Audit-Vollstaendigkeit.
- Rollenmodell mit Viewer, Agent Admin, Technical Admin, Owner und System Agent.
- Human-Approval-Gate gegen Self-Approval, fehlende Reviewplaene und unklare Verantwortlichkeit.
- Protected-Scope-Policies fuer Token, Wallet, Payment, Presale, Health, Child Safety, Location, Camera/Biometric, Legal, Firestore Rules, Production Deployments und weitere compliance-kritische Bereiche.

Bis diese Voraussetzungen erfuellt sind, bleibt die implementierte Route eine reine read-only Register-Uebersicht und darf nicht als Runtime-Admin-UI oder Approval-UI implementiert werden.

## 10. Grenzen

Dieses Konzept aktiviert keine direkte Runtime-Automatisierung, keine produktiven Writes, keine Token-/Payment-/Health-/Legal-Aenderungen und kein Deployment.

Explizit nicht in dieser Phase:

- Keine weiteren Dateien unter `app/admin/agent-center/**` ausser der read-only `page.tsx`.
- Keine interaktiven UI-Komponenten fuer Freigabe oder Ausfuehrung.
- Keine API-Routen.
- Keine Firebase Writes.
- Keine Auth-/Role-Logik.
- Keine Approval Buttons.
- Keine Production Workflows.
- Keine Auto-Merge-/Auto-Deploy-Aktivierung.

## 11. Naechster kleinster Schritt

Nach dieser read-only Uebersicht ist der naechste separate PR ein echter Approval-Follow-up: Auth-/Role-Check fuer `owner`/`agent_admin`, append-only Audit-Log, Self-Approval-Block, Owner-Review fuer High/Critical/Protected Scopes, exakte Scope-Allowlist, Pflichtchecks und Reviewplan. Erst danach duerfen echte Freigabeaktionen diskutiert werden; Merge, Deploy, Auto-Repair und Runtime-Ausfuehrung bleiben weiterhin getrennt freizugeben.


## 12. Phase model and SDK boundary

Phase 1 remains docs/register/report-only governance on top of existing WellFit structures. It uses Markdown, JSON registers, existing npm scripts, quality gates and human review. It does **not** use or require the OpenAI Agents SDK because the current gap is central visibility, proposal governance and safe handoff, not a missing tool-runtime.

Phase 2 may evaluate the OpenAI Agents SDK only if a real need appears, such as auditable multi-agent orchestration, controlled tool runtime, traceable human-in-the-loop gates or complexity that static registers and report-only validators cannot manage. A Phase 2 SDK evaluation must be its own reviewed proposal and still must not activate runtime product logic, Protected Scope edits, Firestore/Functions writes, auto-merge, deployment or self-approval.

## KI-Fortsetzungs-Prompt

Wenn an diesem Konzept weitergearbeitet wird, zuerst `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER_GAP_ANALYSIS.md`, `project-register/agent-control-center.json`, `project-register/agent-proposals.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json` und `scripts/wellfit-dev-agent/src/agent-control-center-check.mjs` lesen. Nur bestehende Agent-Governance erweitern, keine Parallelarchitektur, keine Runtime-UI und keine Auto-Merge-/Deploy-Aktivierung bauen.
