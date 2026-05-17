# WellFit Agent Control Center Gap Analysis

Stand: 2026-05-17
Scope: Stufe-4B / Docs-, Register- und Validator-Vorbereitung ohne Runtime-Code, ohne Admin-UI, ohne Merge-/Deploy-Aktivierung.

## Zweck und Ergebnis

Diese Analyse prueft, welche Bausteine fuer ein WellFit Agent Control Center bereits existieren, welche zentralen Register/Konzepte noch fehlen und welche Duplikate nicht neu gebaut werden duerfen. Ergebnis: WellFit braucht **keine Parallelarchitektur** und in Phase 1 **kein OpenAI Agents SDK**. Der sichere naechste Schritt bleibt eine verbindende Governance-Schicht ueber den vorhandenen Registern, Policies, Checks und Audit-Dateien.

Vor dieser Einschaetzung wurden die aktuellen Leitdateien, TODO-/Statusdateien, Agent-Register und Architekturvorgaben geprueft: `AGENTS.md`, `README.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/agent-autopilot.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-catalog.json`, `project-register/agent-build-proposals.json`, `project-register/approved-agent-build-runner-policy.json`, `project-register/approved-agent-build-runner-merge-gate.json`, `project-register/auto-merge-policy.json`, `docs/architecture/WELLFIT_AGENT_EXECUTION_CONTROLS.md`, `docs/architecture/WELLFIT_AGENT_ARCHITECT_PROPOSAL_AGENT.md`, `docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md` und `docs/architecture/WELLFIT_RESEARCH_RECOMMENDATION_AGENT.md`.

## 1. Bereits vorhandene Control-Center-Bausteine

WellFit besitzt bereits viele Teile, die ein Control Center benoetigt. Sie sollen referenziert und sichtbar verbunden werden, nicht ersetzt werden.

| Baustein | Vorhandene Quelle | Control-Center-Relevanz |
| --- | --- | --- |
| Repository-Regeln und Schutzbereiche | `AGENTS.md` | Fuehrende menschliche Regeln fuer Branching, kleine PRs, keine geschuetzten Runtime-/Compliance-Aenderungen und keine Unity-/PR-#13-Abkuerzungen. |
| Produkt-/Statuskontext | `README.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` | Liefern Ist-Zustand, Arbeitskarte, TODO-Index, naechste Aufgaben und Sicherheitskontext. |
| Agent Task Queue | `project-register/agent-task-queue.json` | Maschinenlesbare Auswahl sicherer naechster Agent-Aufgaben mit First-Read-Dateien, Stop-Regeln, Checks und PR-Erwartungen. |
| Agent Catalog | `project-register/agent-catalog.json` | Inventar bekannter Agenten und Agent-Faehigkeiten; Grundlage fuer eine sichtbare Agent-Liste im Control Center. |
| Approved Build Backlog | `project-register/approved-agent-build-backlog.json` | Human-approved Backlog fuer docs/register/report-only Agenten; blockiert Implementation-Agenten ohne Freigabe. |
| Agent Build Proposals | `project-register/agent-build-proposals.json`, `docs/architecture/WELLFIT_AGENT_ARCHITECT_PROPOSAL_AGENT.md` | Bestehender Proposal-Mechanismus fuer Agent-Build-Vorschlaege und Architect-Proposal-Checks. |
| Autopilot Dry Run | `project-register/agent-autopilot.json` | Plant safe/report-only Pfade ohne produktive Ausfuehrung, Deploy oder Merge. |
| Risk Classifier | `project-register/risk-classifier.json` | Zentrale Risiko-Einstufung fuer low/medium/high/critical, verbotene Themen und Protected Scopes. |
| Definition of Done | `project-register/definition-of-done.json` | Erwartete Ergebnis-, Check-, Evidence- und Reporting-Regeln fuer Aufgaben. |
| Execution Controls | `docs/architecture/WELLFIT_AGENT_EXECUTION_CONTROLS.md` | Bestehende Architektur fuer sichere Agent-Ausfuehrung, First-Read-Pflichten, Stop-Regeln und Quality-Gates. |
| Approved Runner / Merge Gate | `project-register/approved-agent-build-runner-policy.json`, `project-register/approved-agent-build-runner-merge-gate.json`, `docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md` | Definiert Runner-/Merge-Gate-Grenzen, PR-Handoff, Check-Pflichten und blockierte Runtime-/Protected-Scope-Aenderungen. |
| Auto-Merge Policy | `project-register/auto-merge-policy.json` | Haelt Auto-Merge bewusst deaktiviert bzw. streng gated; darf nicht durch das Control Center umgangen werden. |
| Research & Recommendation Agent | `docs/architecture/WELLFIT_RESEARCH_RECOMMENDATION_AGENT.md` | Internal-first Research-Governance fuer unklare Fragen, drei Optionen, genau eine Empfehlung und Human Review bei hohen Risiken. |
| Audit-/Historienquellen | `project-register/progress-log.json`, `project-register/agent-work-log.json`, `project-register/decisions.json` | Bestehende Historie fuer Agent-Arbeit, Fortschritt und Entscheidungen. |
| Control-Center-Entwurf | `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER.md`, `project-register/agent-control-center.json`, `project-register/agent-proposals.json` | Bereits vorhandene gleichwertige Konzept-/Registerbasis fuer Rollen, Status, Proposal-Sicht, Risk Gates und blockierte Auto-Aktionen. |

## 2. Fehlende zentrale Register/Konzepte

Die Luecken liegen nicht in fehlenden Einzelmechanismen, sondern in der zentralen Sichtbarkeit und Verknuepfung:

1. **Kanonische Control-Center-Landing-Referenz:** `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER.md` existiert bereits und soll die fuehrende Konzeptdatei bleiben. Sie muss bei Folgearbeiten nur erweitert werden, nicht neu erfunden.
2. **UI-tauglicher Proposal-/Audit-Index:** `project-register/agent-proposals.json` existiert bereits als Ansatz. Falls spaeter erweitert, muss er nur Status, Review-Hinweise, Risk Gates, PR-Links, Check-Evidence und Audit-Historie sichtbar machen; keine Approval-/Merge-/Deploy-Autoritaet.
3. **Read-only Admin-UI-Spezifikation:** Es fehlt eine separate Spezifikation fuer eine spaetere read-only Admin-Ansicht. Diese Spezifikation darf noch keine Runtime-Route, API, Auth-Logik, Buttons oder Firebase Writes bauen.
4. **Codex-Task-Draft-Schema:** Es fehlt hoechstens eine einheitliche Sicht, wie aus einem genehmigten Proposal ein Codex-Auftrag mit First-Read-Dateien, erlaubten/verbotenen Pfaden, Checks, Stop-Regeln und DoD-Evidence generiert wird. Die Daten muessen aus bestehenden Registern kommen.
5. **Cross-Register-Statusabgleich:** Ein spaeterer report-only Check kann pruefen, ob `agent-control-center.json`, `agent-proposals.json`, Agent Catalog, Task Queue, Approved Backlog, Risk Classifier, DoD und Quality Gate konsistent bleiben.
6. **Human-Approval-Evidence:** High-/Critical-Risk-Proposals brauchen explizite, nachvollziehbare Human-Review-Hinweise. Das Control Center darf diese Hinweise anzeigen oder einfordern, aber nicht selbst ersetzen.

## 3. Duplikate, die nicht neu gebaut werden duerfen

Folgende Strukturen sind bereits fuehrend und duerfen nicht als neue Control-Center-Parallelversion dupliziert werden:

| Nicht neu bauen | Fuehrende bestehende Struktur | Warum nicht duplizieren? |
| --- | --- | --- |
| Neuer Agent-Katalog | `project-register/agent-catalog.json` | Sonst entstehen widerspruechliche Agent-IDs, Rollen und Faehigkeiten. |
| Neue Task Queue | `project-register/agent-task-queue.json` | Task-Auswahl, First-Reads, Stop-Regeln und Check-Erwartungen sind dort bereits maschinenlesbar. |
| Neuer Risk Classifier | `project-register/risk-classifier.json` | Risiko- und Protected-Scope-Logik muss einheitlich bleiben. |
| Neue Definition of Done | `project-register/definition-of-done.json` | DoD-/Evidence-Regeln duerfen nicht je UI/Agent abweichen. |
| Neuer Approved Build Runner | `project-register/approved-agent-build-runner-policy.json` und `docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md` | Runner- und Merge-Gate-Grenzen sind bereits sicherheitskritisch definiert. |
| Neue Auto-Merge-Regeln | `project-register/auto-merge-policy.json` | Das Control Center darf Auto-Merge nicht implizit aktivieren oder lockern. |
| Neuer Research-Prozess | `docs/architecture/WELLFIT_RESEARCH_RECOMMENDATION_AGENT.md` | Internal-first Research, drei Optionen und Human Review sind bereits geregelt. |
| Neue Compliance-/Runtime-Policy | `AGENTS.md`, `risk-classifier.json`, Runner-/Merge-Gate-Policies | Token, Payment, Health, Legal, Firestore Rules, Unity und andere Protected Scopes bleiben zentral blockiert. |
| Neues Produkt-Adminsystem | Kein aktiver Runtime-Scope fuer diese Aufgabe | Diese Analyse baut keine App-Route, API, Auth-/Role-Logik oder Firebase-Write-Funktion. |

## 4. Erweiterungspunkte an bestehenden Strukturen

Sichere Folgearbeiten sollten bestehende Dateien minimal erweitern:

1. **`docs/architecture/WELLFIT_AGENT_CONTROL_CENTER.md`:** Fuehrendes Konzept fuer Rollen, Statusmodell, Risk Gates, Proposal-Sicht, Controlled Curiosity, Codex-Task-Drafts und read-only Admin-UI-Zielbild.
2. **`project-register/agent-control-center.json`:** Verbindendes Policy-Register fuer Rollen, erlaubte Aktionen, blockierte Aktionen, Statusmodell, Risk Gates, Protected Scopes und SDK-Entscheidung.
3. **`project-register/agent-proposals.json`:** UI-ready Proposal-Index fuer konkrete Vorschlaege, Review-Status, Check-Evidence und PR-Handoff-Links.
4. **`project-register/agent-build-proposals.json`:** Weiter fuer Agent-Build-Vorschlaege nutzen; nicht durch ein generisches Register ueberschreiben.
5. **`project-register/agent-task-queue.json`:** Nur referenzieren oder fuer genehmigte, sichere naechste Aufgaben erweitern.
6. **`project-register/approved-agent-build-backlog.json`:** Neue Agent-Build-Arbeit nur dort aufnehmen, wenn sie wirklich human-approved, klein und reviewbar ist.
7. **`scripts/wellfit-dev-agent/src/quality-gate.mjs`:** Spaetere report-only Validatoren koennen hier eingebunden werden, sofern sie keine Runtime-Autoritaet aktivieren.
8. **Audit-Dateien:** `progress-log.json`, `agent-work-log.json` und `decisions.json` koennen Status/Evidence aufnehmen, duerfen aber historische Eintraege nicht loeschen.

## 5. Blockierte Bereiche

Das Agent Control Center ist in dieser Phase eine Governance- und Planungsschicht. Es darf die folgenden Bereiche weder direkt aendern noch indirekt freischalten:

| Blockierter Bereich | Grenze |
| --- | --- |
| Runtime-App | Keine Aenderungen an `app/**`, `components/**`, `lib/**` oder produktiver UI/API-Logik fuer ein Admin Center. |
| Protected Scopes | Keine Ausweitung von Reward Authority, Mission Completion Authority, Anti-Cheat, finalen Ledger Writes oder produktionsnahen Datenwrites. |
| Unity / PR #13 | Keine Aenderungen unter `native/unity/WellFitBuddyAR/**`, kein Loeschen/Overwrite lokaler Unity-Dateien, keine Abhaengigkeit von altem Unity PR #13. |
| Firestore Rules / Backend Authority | Keine Aenderungen an `firestore.rules`, `functions/**` oder serverseitiger Autoritaetslogik ohne separaten expliziten Reviewplan. |
| Token / Payment / Economy | Keine Token-, NFT-, Wallet-, Payment-, Purchase-, Payout-, Marketplace-, Staking-, Presale-, Trading- oder Betting-Aktivierung. |
| Health / Child / Location / Camera / Privacy | Keine Erweiterung von Health-, Watch-, Kinderschutz-, Standort-, Kamera-, Biometrie-, Consent-, Privacy- oder medizinnahen Flows. |
| Legal / Compliance | Keine Aenderung an AGB, Datenschutz, Impressum, Legal- oder Compliance-Messaging. |
| Merge / Deploy / Approval Authority | Kein Auto-Merge, kein Auto-Deploy, keine Self-Approval, keine Produktionseingriffe, keine GitHub-Settings-/Branch-Protection-Aenderungen. |

## 6. Empfehlung: Phase 1 ohne OpenAI Agents SDK, Phase 2 SDK-Evaluierung nur bei echtem Bedarf

### Phase 1: Ohne OpenAI Agents SDK

Phase 1 soll bewusst auf vorhandenen Markdown-/JSON-Registern, report-only Validatoren, bestehenden npm-Skripten und menschlichem Review basieren. Das ist ausreichend, weil die aktuelle Luecke eine Governance- und Sichtbarkeitsluecke ist, keine Tool-Runtime-Luecke.

Phase 1 darf:

- bestehende Register zusammenfuehren und sichtbar verlinken,
- Proposals, Risiken, Checks und PR-Handoffs report-only abbilden,
- Codex-Auftragsentwuerfe aus bestehenden Quellen vorbereiten,
- Quality-Gate-/Validator-Evidence sammeln,
- read-only Admin-UI-Spezifikationen dokumentieren.

Phase 1 darf nicht:

- Runtime-Tools ausfuehren,
- Produktdaten schreiben,
- Freigaben ersetzen,
- Deploys/Merges starten,
- Protected Scopes reparieren oder erweitern,
- eine neue parallele Agent-Orchestrierung einfuehren.

### Phase 2: SDK-Evaluierung nur bei echtem Bedarf

Eine OpenAI-Agents-SDK-Evaluierung ist erst sinnvoll, wenn mindestens einer dieser echten Bedarfe nachgewiesen ist:

1. mehrere Agenten muessen mit nachvollziehbarem Trace koordiniert werden,
2. Tool-Aufrufe brauchen eine streng kontrollierte Runtime mit Audit-Trail,
3. Vorschlags-, Review-, Check- und Handoff-Schritte werden so komplex, dass statische Register und einfache Validatoren nicht mehr reichen,
4. Human-in-the-loop-Freigaben muessen technisch durch eine Agent-Runtime erzwungen werden,
5. bestehende npm-/JSON-/Markdown-Governance erzeugt nachweislich zu viel manuellen Aufwand oder Inkonsistenz.

Auch in Phase 2 gilt: SDK-Evaluierung ist ein separater Proposal- und Review-Scope. Sie aktiviert keine Runtime-Produktlogik, keine Protected-Scope-Aenderungen, keine Firestore-/Functions-Aenderungen, keinen Auto-Merge, keinen Deploy und keine Self-Approval.

## Kleinster sicherer naechster Schritt

Da `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER.md` bereits als gleichwertige Konzeptdatei existiert, sollte sie nicht neu angelegt werden. Der naechste sichere Schritt ist, die bestehende Konzeptdatei und die vorhandenen Register nur dann minimal zu erweitern, wenn ein konkreter read-only Anzeige-, Proposal-Status- oder Validator-Abgleich benoetigt wird.

## KI-Fortsetzungs-Prompt

Wenn diese Analyse weitergefuehrt wird, zuerst `AGENTS.md`, `README.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `project-register/agent-control-center.json`, `project-register/agent-proposals.json`, `project-register/agent-catalog.json`, `project-register/agent-task-queue.json`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-build-proposals.json`, `project-register/approved-agent-build-runner-policy.json`, `project-register/approved-agent-build-runner-merge-gate.json`, `project-register/auto-merge-policy.json` und die zugehoerigen Architekturdateien lesen. Keine Admin-UI, keine Runtime-Produktlogik, keine Protected-Scope-Aenderungen, keine Unity-/PR-#13-Aenderungen, kein Auto-Merge und kein Deploy aktivieren.
