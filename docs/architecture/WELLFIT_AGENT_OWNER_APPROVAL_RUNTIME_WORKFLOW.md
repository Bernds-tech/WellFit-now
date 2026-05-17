# WellFit Agent Owner Approval Runtime Workflow

Status: Entwurf fuer Owner-/Admin-Freigabe-Workflow; kein Merge, kein Deploy und keine Runtime-Aktivierung in dieser Stufe
Updated: 2026-05-17
Scope: Firebase Auth Rollenmodell, Firestore Approval-/Draft-/Audit-Collections und Governance-Regeln fuer eine spaetere kontrollierte Agent-Ausfuehrung

## 1. Zweck und aktuelle Grenze

Dieser Plan beschreibt eine separate, noch nicht aktivierte Runtime-Freigabe-Architektur fuer WellFit-Agenten. Er soll spaeter nachvollziehbar machen, wer eine einzelne Agentenaufgabe freigeben darf, welche Pfade dabei erlaubt sind, welche Checks erforderlich sind und wann ein Agent sofort stoppen muss.

Diese Stufe ist bewusst nur Planung. Es werden keine API-Routen, keine Firebase Rules, keine Cloud Functions, keine Admin-Buttons, keine Produktlogik, kein Merge und kein Deploy umgesetzt oder freigeschaltet.

## 2. Firebase Auth Rollenmodell

Die Rollen sollen spaeter serverseitig ueber Firebase Auth Custom Claims oder eine gleichwertige serverseitig validierte Rollenquelle geprueft werden. Client-Anzeigen duerfen Rollen anzeigen, aber keine Freigabeentscheidung final autorisieren.

| Rolle | Zweck | Darf | Darf nicht |
| --- | --- | --- | --- |
| `owner` | Hoechste menschliche Freigaberolle fuer einzelne dokumentierte Aufgaben | High/Critical-Aufgaben mit Reviewplan freigeben, Aufgaben ablehnen, Revisionen verlangen, Stop-Bedingungen verschaerfen | Eigene Agentenarbeit als Agent freigeben, Checks umgehen, pauschale Dauerfreigaben erteilen, Merge/Deploy in dieser Stufe ausloesen |
| `agent_admin` | Governance-Review fuer niedrige und mittlere Agentenaufgaben | Low/Medium-Drafts pruefen, Revisionen verlangen, nicht-kritische Freigaben vorbereiten oder gemaess Policy erteilen | High/Critical freigeben, eigene Arbeit freigeben, Protected Scopes oeffnen, Merge/Deploy ausloesen |
| `technical_admin` | Technische Vorpruefung und Task-Draft-Haertung | erlaubte Pfade, Checks, Stop-Bedingungen, Risiko-Level und Reviewplan pruefen; Ausfuehrbarkeit vorbereiten | Final freigeben, eigene Arbeit freigeben, Owner-Pflicht ersetzen, Merge/Deploy ausloesen |
| `viewer` | Read-only Transparenz | Vorschlaege, Checks, Audit-Historie und Status lesen | freigeben, ausfuehren, Pfade aendern, Merge/Deploy ausloesen |

### 2.1 Rollenregeln

- Kein Agent darf eigene Arbeit, eigene Vorschlaege, eigene PRs, eigene Reparaturen oder eigene Folgeaufgaben freigeben.
- Eine Freigabe gilt nur fuer genau eine dokumentierte Aufgabe mit eindeutiger Task-ID.
- High- und Critical-Aufgaben brauchen Owner-Freigabe und einen dokumentierten Reviewplan.
- Agent-/Technical-Admin-Entscheidungen duerfen Owner-Pflichten nicht ersetzen.
- Viewer bleiben read-only.

## 3. Firestore Collections

Die folgenden Collections sind Zielbild und noch keine produktive Implementierung. Schreibrechte duerfen spaeter nur serverseitig oder ueber streng gepruefte Admin-Funktionen erfolgen.

### 3.1 `agentTaskDrafts`

Speichert den aus einem Proposal erzeugten, noch nicht freigegebenen Aufgabendraft.

Pflichtfelder:

- `taskId`: stabile eindeutige Task-ID.
- `title`: kurze Aufgabenbezeichnung.
- `description`: dokumentierter Aufgabeninhalt.
- `createdBy`: Agent-/User-ID des Erstellers.
- `createdByRole`: Rolle des Erstellers.
- `createdAt`: Server-Zeitstempel.
- `updatedAt`: Server-Zeitstempel.
- `allowedPaths`: exakte Datei-/Pfad-Allowlist.
- `blockedPaths`: gesperrte Dateien, Globs oder Schutzbereiche.
- `riskLevel`: `low`, `medium`, `high` oder `critical`.
- `checksRequired`: Pflichtchecks vor PR-Handoff oder Abschluss.
- `stopConditions`: Bedingungen, bei denen der Agent sofort stoppen muss.
- `reviewPlan`: Reviewplan; fuer `high` und `critical` verpflichtend.
- `nonGoals`: explizite Nicht-Ziele, insbesondere kein Merge/Deploy.
- `status`: z. B. `draft`, `pending_approval`, `needs_revision`, `approved_for_single_execution`, `rejected`, `expired`.

### 3.2 `agentApprovals`

Speichert die menschliche Freigabe oder Ablehnung einer genau dokumentierten Aufgabe.

Pflichtfelder:

- `approvalId`: eindeutige Approval-ID.
- `taskId`: Referenz auf genau einen `agentTaskDrafts`-Eintrag.
- `approvalScopeHash`: Hash oder stabile Signatur des freigegebenen Draft-Scopes.
- `allowedPaths`: kopierte Pfad-Allowlist aus dem freigegebenen Draft.
- `riskLevel`: freigegebenes Risiko-Level.
- `approvedBy`: Firebase UID oder Admin-ID des Freigabegebers.
- `approvedByRole`: `owner`, `agent_admin` oder gemaess Policy erlaubte Rolle.
- `approvedAt`: Server-Zeitstempel der Entscheidung.
- `expiresAt`: Ablaufzeitpunkt; keine Dauerfreigaben.
- `checksRequired`: kopierte Pflichtchecks.
- `stopConditions`: kopierte Stop-Bedingungen.
- `reviewPlan`: verpflichtend fuer `high` und `critical`.
- `decision`: `approved`, `rejected` oder `needs_revision`.
- `decisionNote`: menschliche Begruendung oder Audit-Notiz.
- `selfApprovalCheck`: Ergebnis der Pruefung, dass Freigeber nicht Ersteller/Ausfuehrer der eigenen Arbeit ist.
- `mergeDeployAllowed`: muss in dieser Stufe immer `false` sein.

### 3.3 `agentExecutionAudits`

Speichert append-only Ausfuehrungs-, Check- und Stopp-Ereignisse.

Pflichtfelder:

- `auditId`: eindeutige Audit-ID.
- `taskId`: Referenz auf die einzelne Aufgabe.
- `approvalId`: Referenz auf die verwendete Approval-Entscheidung.
- `executedBy`: Agent-/User-ID der Ausfuehrung.
- `executedByRole`: Rolle oder Agententyp der Ausfuehrung.
- `startedAt`: Server-Zeitstempel.
- `finishedAt`: Server-Zeitstempel oder `null`, solange laufend.
- `allowedPathsUsed`: tatsaechlich verwendete Pfade.
- `changedPaths`: geaenderte Pfade, falls eine spaetere Stufe Schreibzugriff erlaubt.
- `riskLevel`: Risiko-Level der Aufgabe.
- `checksRun`: ausgefuehrte Checks mit Ergebnis, Zeit und Log-Referenz.
- `checksSkipped`: uebersprungene Checks mit Grund und Einstufung.
- `stopConditionsEvaluated`: dokumentierte Stop-Condition-Pruefung.
- `stopTriggered`: `true`/`false`.
- `stopReason`: Pflichtfeld, wenn `stopTriggered=true`.
- `resultStatus`: `completed`, `blocked`, `failed`, `needs_human_review` oder `pr_handoff_only`.
- `mergeDeployAttempted`: muss in dieser Stufe immer `false` sein.

## 4. Approval-Gates

1. Ein Agent erstellt oder aktualisiert einen `agentTaskDrafts`-Eintrag.
2. `technical_admin` prueft erlaubte Pfade, blockierte Pfade, Checks, Risiko-Level, Nicht-Ziele und Stop-Bedingungen.
3. `agent_admin` darf nur im erlaubten Low/Medium-Bereich reviewen oder gemaess Policy freigeben.
4. `owner` muss jede High/Critical-Aufgabe freigeben und den Reviewplan bestaetigen.
5. Vor Ausfuehrung wird geprueft, dass `approvedBy` nicht mit `createdBy`, `executedBy` oder dem verantwortlichen Agenten fuer die freizugebende Arbeit kollidiert.
6. Die Freigabe wird gegen `approvalScopeHash`, `taskId`, `allowedPaths`, `riskLevel`, `checksRequired` und `stopConditions` validiert.
7. Jede Ausfuehrung schreibt ein append-only Audit-Ereignis nach `agentExecutionAudits`.
8. Der Ablauf stoppt bei Scope-Abweichung, fehlender Owner-Freigabe, fehlendem Reviewplan, Check-Fehler, Self-Approval-Risiko oder beruehrtem Protected Scope ohne explizite Einzelaufgabenfreigabe.

## 5. Stop-Bedingungen

Ein Agent muss stoppen und menschliche Review verlangen, wenn mindestens eine Bedingung zutrifft:

- Die Aufgabe hat keine eindeutige `taskId`.
- `allowedPaths` fehlen oder sind breiter als die dokumentierte Aufgabe.
- Ein geplanter oder tatsaechlicher Pfad liegt ausserhalb der Allowlist.
- Der Freigeber ist Ersteller, Ausfuehrer oder verantwortlicher Agent derselben Arbeit.
- `riskLevel=high` oder `riskLevel=critical` ohne Owner-Freigabe.
- `riskLevel=high` oder `riskLevel=critical` ohne Reviewplan.
- Pflichtchecks fehlen, schlagen fehl oder werden ohne dokumentierte Umgebungslimitierung uebersprungen.
- Stop-Bedingungen, Protected Scopes oder Compliance-Bereiche werden beruehrt, ohne dass die Einzelaufgabe dies ausdruecklich freigibt.
- Merge, Deploy, Produktionsdaten-Write, Firebase-Write oder Runtime-Autoritaet waeren erforderlich.

## 6. Nicht-Ziele dieser Stufe

- Kein Merge.
- Kein Deploy.
- Keine Firebase Rules-Implementierung.
- Keine Cloud Functions-Implementierung.
- Keine API-Route und keine Admin-UI-Aktion.
- Keine produktiven Firestore Writes.
- Keine Runtime-Ausfuehrung, keine Reward-/Mission-Authority und keine Protected-Scope-Freischaltung.
- Keine pauschale oder wiederverwendbare Approval-Erlaubnis.

## 7. Naechster sicherer Schritt

Der naechste sichere Schritt waere ein separates, owner-freigegebenes Implementierungsdesign fuer Firestore Rules, serverseitige Role Checks und append-only Audit Writes. Auch dieser Schritt muesste eine einzelne dokumentierte Aufgabe mit erlaubten Pfaden, Risiko-Level, Reviewplan, Checks und Stop-Bedingungen bleiben.

## 8. KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `project-register/agent-control-center.json`, `docs/architecture/WELLFIT_AGENT_CONTROL_CENTER.md`, `docs/architecture/WELLFIT_AGENT_EXECUTION_CONTROLS.md`, `project-register/risk-classifier.json`, `project-register/definition-of-done.json` und dieses Dokument. Behandle den Owner-Approval-Runtime-Workflow als Planungs-Entwurf ohne Runtime-Autoritaet. Wenn eine spaetere Aufgabe Firebase Auth Rollen, Firestore Rules, Cloud Functions, Admin-Buttons, Approval Writes oder Ausfuehrung implementieren soll, stoppe bis eine einzelne Owner-freigegebene Aufgabe mit `taskId`, `allowedPaths`, `riskLevel`, `approvedBy`, Zeitstempeln, Pflichtchecks, Stop-Bedingungen und Reviewplan dokumentiert ist. High/Critical bleibt Owner-pflichtig, Self-Approval bleibt verboten, und Merge/Deploy bleibt ausserhalb dieser Stufe blockiert.
