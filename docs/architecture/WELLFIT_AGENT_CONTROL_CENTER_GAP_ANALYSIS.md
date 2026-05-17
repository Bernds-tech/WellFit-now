# WellFit Agent Control Center Gap Analysis

Stand: 2026-05-17
Scope: Stufe-4B / docs-register-validator Vorbereitung ohne Runtime-Code, ohne Admin-UI, ohne Merge-/Deploy-Aktivierung.

## Zweck dieser Analyse

Diese Analyse prueft, ob WellFit bereits Bestandteile eines Agent Control Centers besitzt und welche minimale Erweiterung sinnvoll ist. Ziel ist **keine Parallelarchitektur**, sondern eine belastbare Entscheidungsgrundlage fuer ein spaeter bedienbares Admin-/Owner-System fuer Agent-Vorschlaege, Freigaben, Checks, PR-Handoffs und Audit-Historie.

## 1. Was existiert bereits?

WellFit besitzt bereits viele Bausteine, die ein Agent Control Center benoetigt:

| Bereich | Vorhandene Struktur | Bewertung |
| --- | --- | --- |
| Agent Registry / Catalog | `project-register/agent-catalog.json` | Bereits vorhanden. Sollte nicht ersetzt, sondern fuer Control-Center-Sichten referenziert werden. |
| Agent Task Queue | `project-register/agent-task-queue.json` | Bereits vorhanden. Dient als maschinenlesbare Queue fuer sichere naechste Aufgaben. |
| Approved Agent Build Backlog | `project-register/approved-agent-build-backlog.json` | Bereits vorhanden. Enthalt human-approved report-only/docs-register Agenten und blockierte Implementation-Agenten. |
| Autopilot Dry Run | `project-register/agent-autopilot.json`, `scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs` | Bereits vorhanden. Plant und waehlt Pfade report-only, ohne Umsetzung/Deploy. |
| Risk Classifier | `project-register/risk-classifier.json` | Bereits vorhanden. Sollte die Grundlage fuer Proposal-Risk-Gates bleiben. |
| Definition of Done | `project-register/definition-of-done.json` | Bereits vorhanden. Muss fuer generierte Codex-Auftraege weiterverwendet werden. |
| Quality Gate | `scripts/wellfit-dev-agent/src/quality-gate.mjs` | Bereits vorhanden. Eignet sich fuer report-only Integration weiterer Control-Center-Checks. |
| Proposal Mechanik | `project-register/agent-build-proposals.json`, `scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs`, `scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs` | Bereits vorhanden, aber agent-build-fokussiert. Ein allgemeines Proposal-Register fuer Owner/Admin-Entscheidungen fehlte bisher. |
| Approval Policy | `project-register/approved-agent-build-runner-policy.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/pr-review-policy.json` | Bereits vorhanden. Aktiviert aktuell keine Runtime-Autoritaet, keinen Auto-Merge und keinen Deploy. |
| Audit Log / Decision Log | `project-register/decisions.json`, `project-register/progress-log.json`, `project-register/agent-work-log.json` | Bereits vorhanden. Reicht fuer Governance-Historie; ein UI-tauglicher Proposal-Audit-Index fehlt noch. |
| Controlled Curiosity / Research Flow | `project-register/research-recommendations.json`, `docs/architecture/WELLFIT_RESEARCH_RECOMMENDATION_AGENT.md`, `scripts/wellfit-dev-agent/src/research-recommendation-check.mjs` | Bereits vorhanden als internal-first Research-Governance. Muss fuer Admin-Proposals sichtbarer verknuepft werden. |
| Human Approval Gate | Mehrere Policies fordern Human Review; z. B. Approved Runner, Auto-Merge, Auto-Repair, PR Review | Vorhanden als Policy, aber noch nicht als zentrales Control-Center-Modell sichtbar. |
| Admin UI | Keine gleichwertige Runtime-UI gefunden | Fehlt bewusst; diese Aufgabe baut keine UI. |

## 2. Relevante Dateien, Module und Skripte

### Primaere Governance-Dateien

- `AGENTS.md`
- `agents/AGENTS.md`
- `agents/modes/stufe-4.md`
- `project-register/agent-catalog.json`
- `project-register/agent-task-queue.json`
- `project-register/approved-agent-build-backlog.json`
- `project-register/agent-build-proposals.json`
- `project-register/agent-autopilot.json`
- `project-register/risk-classifier.json`
- `project-register/definition-of-done.json`
- `project-register/approved-agent-build-runner-policy.json`
- `project-register/auto-merge-policy.json`
- `project-register/auto-repair-policy.json`
- `project-register/pr-review-policy.json`
- `project-register/research-recommendations.json`
- `project-register/decisions.json`
- `project-register/progress-log.json`
- `project-register/agent-work-log.json`

### Primaere Skripte

- `scripts/wellfit-dev-agent/src/quality-gate.mjs`
- `scripts/wellfit-dev-agent/src/agent-autopilot-dry-run.mjs`
- `scripts/wellfit-dev-agent/src/approved-agent-build-runner-dry-run.mjs`
- `scripts/wellfit-dev-agent/src/approved-agent-build-runner-execute.mjs`
- `scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs`
- `scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs`
- `scripts/wellfit-dev-agent/src/research-recommendation-check.mjs`
- `scripts/wellfit-dev-agent/src/pr-review-policy-check.mjs`
- `scripts/wellfit-dev-agent/src/pr-diff-review-report.mjs`
- `scripts/wellfit-dev-agent/src/pr-post-creation-guard-check.mjs`
- `scripts/wellfit-dev-agent/src/auto-merge-eligibility-check.mjs`
- `scripts/wellfit-dev-agent/src/auto-repair-decision-check.mjs`

## 3. Was fehlt noch?

Es fehlen nicht die Grundbausteine, sondern die **zentrale Sicht und der verbindende Proposal-/Approval-Index**:

1. Ein explizites Agent-Control-Center-Konzept, das vorhandene Strukturen zusammenfuehrt.
2. Ein maschinenlesbares Control-Center-Register mit Rollen, Statusmodell, Risk-Gates, Admin-UI-Zielbild und blockierten Auto-Aktionen.
3. Ein allgemeines Proposal-Register fuer Owner/Admin-Entscheidungen, das nicht nur Agent-Build-Proposals abbildet.
4. Ein report-only Validator, der sicherstellt, dass Proposals keine Auto-Merge-/Auto-Deploy-/Protected-Scope-Autoritaet aktivieren.
5. Eine spaetere Admin-UI, die vorhandene Register nur liest bzw. kontrolliert freigegebene Aktionen vorbereitet.
6. Eine klare Trennung zwischen:
   - Proposal erstellen,
   - Proposal freigeben,
   - Codex-/Runner-Auftrag generieren,
   - Checks laufen lassen,
   - PR erstellen,
   - menschlich mergen/deployen.

## 4. Was waere doppelt und darf nicht neu gebaut werden?

Nicht neu bauen:

- Kein zweiter Agent Catalog neben `project-register/agent-catalog.json`.
- Keine zweite Task Queue neben `project-register/agent-task-queue.json`.
- Kein zweiter Approved Build Backlog neben `project-register/approved-agent-build-backlog.json`.
- Kein zweiter Risk Classifier neben `project-register/risk-classifier.json`.
- Kein zweites Definition-of-Done-System neben `project-register/definition-of-done.json`.
- Kein paralleles Quality Gate neben `scripts/wellfit-dev-agent/src/quality-gate.mjs`.
- Kein neues Research-System neben `project-register/research-recommendations.json`.
- Keine Admin Runtime UI in dieser Phase.
- Keine direkte Auto-Merge-, Auto-Approval- oder Deployment-Aktivierung in dieser Phase.

## 5. Welche bestehenden Strukturen sollten erweitert werden?

Sinnvolle minimale Erweiterungen:

1. `project-register/agent-control-center.json` als verbindende Control-Center-Policy.
2. `project-register/agent-proposals.json` als UI-taugliches Proposal-Register.
3. `scripts/wellfit-dev-agent/src/agent-control-center-check.mjs` als report-only Validator.
4. `scripts/wellfit-dev-agent/src/quality-gate.mjs` report-only um den neuen Validator ergaenzen.
5. `todolist/WORK_MAP.md` und `todolist/TODO_INDEX.md` nur mit Verweisen auf die neue Control-Center-Vorbereitung ergaenzen.

## 6. Welche Strukturen sollten nicht veraendert werden?

Nicht veraendern in dieser Phase:

- `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`.
- `native/**` und insbesondere `native/unity/WellFitBuddyAR/**`.
- Token-/NFT-/Wallet-/Payment-/Presale-/Trading-/Payout-Logik.
- Health-/Child-/Location-/Camera-/Privacy-/Consent-/Legal-Logik.
- Produktive Firebase-/Firestore-/Deployment-Konfiguration.
- Auto-Merge-/Auto-Deploy-Aktivierung.

## 7. Risiken

| Risiko | Bedeutung | Gegenmassnahme |
| --- | --- | --- |
| Parallelarchitektur | Ein neues Control Center koennte bestehende Register duplizieren. | Nur verbindendes Register und Gap Analysis erstellen; bestehende Register referenzieren. |
| Schein-Autonomie | `approved` koennte faelschlich als Merge-/Deploy-Freigabe verstanden werden. | Statusmodell trennt Approval, Execution Ready, PR Created, Completed; Auto-Merge/Deploy bleibt false. |
| Protected Scope Leakage | Vorschlaege koennten Reward, Health, Legal, Unity oder Payment indirekt aktivieren. | Validator blockiert High/Critical Auto-Execute und jede Auto-Merge/Deploy-Aktivierung. |
| SDK-Komplexitaet | Ein OpenAI Agents SDK Einbau wuerde neue Runtime-, Secret-, Tracing- und Tooling-Komplexitaet erzeugen. | Phase 1 ohne SDK; spaetere Evaluierung nur bei echtem Bedarf. |
| Admin UI zu frueh | UI koennte Approval-Buttons vortaeuschen, ohne Backend-/Auth-/Audit-Hardening. | In dieser Phase nur Konzept, keine UI, keine API, keine Writes. |
| Owner-Wunsch nach Merge/Deploy nach gruenen Checks | Kann sinnvoll fuer spaetere kontrollierte Pipeline sein, widerspricht aber dieser Aufgabe und aktuellen Schutzregeln. | Separates Policy-/Runner-Konzept noetig: Staging-vs-Production, Branch Protection, GitHub Checks, menschliche Release-Freigabe. |

## 8. Sinnvolle naechste Schritte

1. Diese Gap Analysis und das Control-Center-Konzept reviewen.
2. Das neue Proposal-Register mit realen Owner-Vorschlaegen fuellen, aber ohne Runtime-Autoritaet.
3. Einen kleinen Admin-UI-Planungs-PR vorbereiten, der nur Routen-/Datenmodell-Readiness beschreibt.
4. Danach optional eine read-only Admin-UI planen: `/admin/agent-center` oder `/admin/cognitive-core`.
5. Erst nach separater Entscheidung eine Stufe fuer `single_agent_safe_runtime_execution` definieren.
6. Merge/Deploy-Automatisierung nur als eigener Governance-PR mit Staging/Production-Trennung, Branch Protection, GitHub-Check-Evidence und Owner-Freigabe diskutieren.

## 9. OpenAI Agents SDK: jetzt noetig oder zu frueh?

### Was das SDK leisten kann

Die offiziellen OpenAI Agents SDK Docs beschreiben Agents als Modell plus Instructions, Tools, Guardrails, Handoffs und optional strukturierte Outputs; der SDK-Runner kann Orchestrierung, Tools, Guardrails, Handoffs und Sessions verwalten. Siehe: <https://openai.github.io/openai-agents-python/agents/>.

Die SDK-Dokumentation beschreibt ausserdem Guardrails fuer Input, Output und Tool-Aufrufe sowie Tracing fuer LLM-Generierungen, Tool Calls, Handoffs, Guardrails und Custom Events. Siehe: <https://openai.github.io/openai-agents-python/guardrails/> und <https://openai.github.io/openai-agents-python/tracing/>.

### Wann waere es sinnvoll?

Spaeter koennte das SDK sinnvoll sein, wenn WellFit echte Multi-Agent-Orchestrierung braucht:

- mehrere spezialisierte Agents mit Handoffs,
- echte Tool-Ausfuehrung in einer isolierten, auditierbaren Runtime,
- Tracing ueber Agent-Laeufe,
- einheitliche Guardrails fuer Tool Calls,
- reproduzierbare Sessions und strukturierte Outputs.

### Wann ist es zu frueh?

Aktuell ist es zu frueh, weil WellFit bereits eine Node-/Register-/Quality-Gate-Struktur besitzt und das Hauptproblem nicht fehlende SDK-Orchestrierung ist, sondern fehlende kontrollierte Produktfreigabe. Ein SDK-Einbau wuerde neue Dependencies, Secrets, Laufzeitpfade, Tracing-Daten und Review-Oberflaechen erzeugen, ohne das aktuelle Kernproblem zu loesen.

### Wuerde das SDK bestehende Strukturen ersetzen?

Nein. Es duerfte bestehende WellFit-Strukturen nicht ersetzen:

- `agent-catalog.json` bleibt Agent Registry.
- `agent-task-queue.json` bleibt Task Queue.
- `approved-agent-build-backlog.json` bleibt Freigabe-Backlog.
- `risk-classifier.json` bleibt Risk-Gate-Quelle.
- `definition-of-done.json` bleibt DoD-Quelle.
- `quality-gate.mjs` bleibt lokales Governance-Gate.

Das SDK waere hoechstens eine spaetere Ausfuehrungsschicht unter bestehenden Policies.

## 10. Entscheidungsvorschlag

**Phase 1:** Kein OpenAI Agents SDK einbauen. Bestehende Node-/Next-/Agent-Script-Struktur nutzen, Control-Center-Gap schliessen, Proposal-Register und Validator vorbereiten.

**Phase 2:** SDK-Evaluierung nur, wenn ein konkreter Bedarf entsteht: echte Multi-Agent-Handoffs, Tool-Runtime, Tracing, Sessions oder SDK-spezifische Guardrails. Dann mit separatem Spike, Security Review, Secret Handling, Datenflussanalyse und Rollback-Plan.

## KI-Fortsetzungs-Prompt

Wenn diese Datei weitergefuehrt wird, zuerst `project-register/agent-control-center.json`, `project-register/agent-proposals.json`, `project-register/agent-catalog.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/research-recommendations.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json` und `scripts/wellfit-dev-agent/src/agent-control-center-check.mjs` lesen. Keine Admin-UI, keine Runtime-Produktlogik, kein Auto-Merge und kein Deploy aktivieren, solange kein separater Owner-Approval-PR mit exakter Allowlist existiert.
