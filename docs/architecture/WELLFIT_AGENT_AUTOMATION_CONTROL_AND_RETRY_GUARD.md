# WELLFIT Agent Automation Control and Retry Guard

## Zweck
Zentrale Steuerung, ob Agents automatisch weiterarbeiten duerfen.

## Automation Modes
- off
- planning_only
- supervised
- runner_enabled
- paused
- repair_required
- halted_waiting_owner

## Grundregeln
- Automation nur mit Admin/Owner-Freigabe.
- Bei Merge/PR/Check-Fehlern keine neuen Feature-/Research-/Runtime-Tasks.
- Erst Repair/Conflict/Governance-Fix.
- Maximal 3 Repair-Versuche.
- Danach Halt (`halted_waiting_owner`) mit Owner Review.
- Danach nur mit erneuter Admin/Owner-Freigabe weiter.
- Jeder neue Zyklus startet mit frischer Analyse.

## Always Start From Top
1. Analyse interner Quellen
2. Analyse Repo-/Code-Status
3. Canonical-Truth-Vergleich
4. Quality-Gate/Known-Blocker-Pruefung
5. Offene Tasks/Dossiers/Proposals pruefen
6. Admin Approval pruefen
7. Erst dann Worker/Runner/PR

## Stop Conditions
- merge_failed
- merge_conflict
- checks_failed
- quality_gate_failed_without_override
- canonical_truth_conflict
- protected_scope_without_approval
- repair_attempts_exceeded
- admin_paused
- owner_review_required

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
\n- 2026-05-23: Admin-Center Status-Buckets + Timeline-Felder (approved/rejected/blocked/in_progress/completed) erweitert; kein Deploy, keine GitHub-API-Neuimplementierung, keine Canonical-Truth-Aenderung.

- 2026-05-23: Final hardening: failed/checks_failed/conflict/blocked => repair_required, max 3 repair attempts, then halted_waiting_owner. Successful merge sets nextCycleRequired=true and restarts analysis from internal_sources_analysis.


- 2026-05-24: Retry-Guard UX ergaenzt um klare Inbox-Sync-/Decision-Blocker-Hinweise im Admin-Center; keine Runner-/Deploy-Aenderung.

- 2026-05-24: Admin-Center Sync-Feedback erweitert (created/updated/0-Fallback + Server-Inbox-Ladehinweis) und Decision-Gating-Gruende sichtbar gemacht; keine Runtime- oder Deploy-Aenderung.

- 2026-05-24: Retry-Guard konkretisiert fuer Admin-Center: ohne inboxId bleiben Aktionen gesperrt (Erst Inbox synchronisieren), revise trotz fehlender kritischer Daten bei pending/review erlaubt, approve erst bei kritischen Daten + gueltigem Status.

- 2026-05-24: Retry-Guard ergaenzt um Snapshot-Shape-Debug fuer Admin-Center-Sync (serverSnapshotReceived/serverCandidateCount/skippedReasons). Keine Automation-Aktivierung, kein Deploy.

- 2026-05-24 Addendum: Admin-Center Inbox-Sync bekam Version-/Shape-Diagnostik fuer Frontend-vs-Backend Mismatch-Hinweise. Wenn callableVersion live fehlt, ist der naechste operative Schritt ein separates Firebase-Functions-Deploy (nicht Teil dieses PR).
- 2026-05-25: Retry-/Diagnose-Guard aktualisiert: Admin-Client verwirft bei `accepted=false` keine Sync-Diagnosefelder mehr. Damit bleiben callableVersion/responseShapeVersion/serverCandidateCount fuer sichere Live-Debugs erhalten, ohne Stacktraces/Secrets im Fehlertext. Kein Runner/Branch/PR/Merge/Deploy/Firebase-Deploy in diesem PR.

- 2026-05-25: Retry-/Diagnose-Guard fuer Admin-Center-Sync erweitert: `effectiveFirstRunRegisterSnapshot` erzwingt eine einzige Payload-Quelle fuer sichtbare Kandidaten und Sync-Call. Bei fehlender syncfaehiger Snapshot-Payload wird der Call blockiert und eine klare Warnung angezeigt. Zusätzliche Konsistenzpruefung: `clientVisibleCandidateCount` muss `clientSendingCandidateCount` entsprechen, sonst gelber Warnhinweis. Kein Runner/Branch/PR/Merge/Deploy in diesem Fix; kein Functions-Deploy notwendig, solange nur Client-Dateien betroffen sind.

- 2026-05-27: Retry-/Diagnose-Guard erweitert fuer Snapshot-Serialisierung: Client unterscheidet Auth-Fehler klar ("Admin-Login erforderlich...") von Snapshot-Shape-Fehlern und behaelt clientSending-Statusfelder nach Callable-Response. Backend diagnostiziert nun explizit, ob `registerSnapshot`-Field vorhanden war, aber undefined/null geliefert wurde. Kein Runner/Branch/PR/Merge/Deploy in diesem PR.

- 2026-05-27: Retry-Guard erweitert: Bei fehlender Auth wird Snapshot-Shape-Warnung unterdrueckt und stattdessen klare Auth-Meldung gezeigt ("Admin-Login erforderlich..."). Damit keine irrefuehrende 0-Kandidaten-Diagnose bei `auth:MISSING`.

- 2026-05-27 Admin-Center Auth-Guard Ergänzung: Client unterscheidet `client_auth_loading`, `client_auth_missing`, `client_auth_not_ready`; nur bei Firebase-User+Token+Claim werden Admin-Callables freigegeben. Keine UID/E-Mail/Token-Ausgabe im Debug.

- 2026-05-28: Admin-Center Login-/Inbox-ID-Fix: Auth/Owner-Claim ist live funktionsfaehig (`agentRoleClaim=owner`, `adminCallableAuthReady=true`). Google Popup-Login erhaelt einen Redirect-Fallback inklusive `getRedirectResult`-Auswertung und privacy-sicheren Meldungen; Product-Evolution Inbox-Dokument-IDs werden slash-sicher/idempotent erzeugt, waehrend `sourceDossierId` unveraendert im Dokumentfeld erhalten bleibt. Kein Runner/Branch-PR-Merge/Deploy im PR. Nach Merge gezielt Functions-Deploy fuer `syncProductEvolutionFirstRunInbox` und anschliessend Frontend/Hosting-Deploy einplanen. Naechster Schritt nach erfolgreichem Sync: `runtime/admin-center-task-proposal-to-worker-queue`.

## Autopilot priority order update (2026-05-31)

The Safety Sentinel must sort future Autopilot and Product-Evolution work in this order before any worker/runner automation is considered:

1. P0/P1 safety blockers.
2. Auth/deploy/build/merge blockers.
3. Agent-pipeline blockers.
4. Beta-1 core functions.
5. Public-beta functions including AR and the AI buddy.
6. B2B fiat/economic-loop extensions.
7. SUI, Dynamic Assets, token, WFT, payment, and cashout work only later and only after explicit Owner plus Legal/Policy approval.

AR and the AI buddy are public-beta product areas. SUI/WFT/token/payment/cashout are not part of Beta-1 activation. P0/P1 reset-safety work must be recommended before a Product-Evolution restart or worker automation. Dossiers may prepare metadata-only build orders, but they must not start GitHub, runner, branch, PR, merge, or deploy automation.

## Builder serial queue and public-beta order (2026-05-31)

- Builder work packages are metadata-only in `agentBuilderWorkPackages` and must stay serial for `serialGroup=main_repo` with `maxConcurrentWorkPackages=1`.
- Approved dossiers may be converted into waiting work packages, but this does not start a runner, create a branch, create a PR, merge, deploy, or call GitHub APIs.
- AI buddy and AR are public-beta product areas and can be considered after P0/P1 safety, build/deploy, and pipeline blockers are handled.
- SUI, WFT, token, payment, cashout, wallet trading, NFT, Dynamic Assets, and blockchain activation are not part of Beta-1 activation. They remain future topics behind explicit Owner plus Legal/Policy gates.
- Agents and builders must order proposals accordingly: public-beta AR/AI-buddy before any later token/Dynamic-Assets work, and token/payment/blockchain proposals must remain blocked/deferred unless separately approved.
