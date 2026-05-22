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
