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
