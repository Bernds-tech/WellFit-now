# Contradiction / Reconciliation Register

Any conflict between project memory and actual Git/PR/CI/runtime evidence is recorded here and forces `RECONCILIATION_REQUIRED` until resolved.

Statuses: `OPEN`, `RECONCILIATION_REQUIRED`, `RESOLVED`, `SUPERSEDED`.

Template:
```text
## CTR-YYYY-NNN
- Date:
- Updated:
- Related task/change:
- Risk: R1|R2|R3|R4
- Source A:
- Claim A:
- Source B:
- Claim B:
- Stronger/current evidence:
- Status: RECONCILIATION_REQUIRED
- Resolution/action:
- Evidence:
```

Mandatory triggers include:
- task marked complete while PR/check/runtime evidence is not complete;
- merged/closed PR with stale IN_PROGRESS/STARTED_WORK state;
- active work with missing started-work/lock/receipt records;
- dependency status conflicting with actual prerequisite state;
- evidence bound to an older commit/build/target;
- project-memory statement contradicted by current code or runtime evidence.

Never resolve a contradiction by deleting the older record. Record which source was stale or wrong and why.
