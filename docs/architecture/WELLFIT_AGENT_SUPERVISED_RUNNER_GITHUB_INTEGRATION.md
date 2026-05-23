# WELLFIT AGENT SUPERVISED RUNNER GITHUB INTEGRATION

## Zweck
Serverseitige GitHub-Integration fuer approved Agent Worker Queue Items, damit Branch/PR kontrolliert vorbereitet werden koennen.

## Sicherheitsmodell
- Keine Secrets im Client.
- GitHub Token/App nur serverseitig ueber Environment.
- Kein direkter Write auf `main`/`master`.
- Branch/PR zuerst.
- Auto-Merge nur mit Admin-Approval, gruener Checks-Lage, Quality Gate und Audit.
- Kein Production Deploy in diesem PR.

## Runner Flow
1. Automation Control pruefen.
2. Worker Queue Item lesen.
3. Automation Policy lesen.
4. Supervised Runner Job lesen/erstellen.
5. Canonical-Truth-Guardrails pruefen.
6. Allowed-/Blocked-Files pruefen.
7. Branchname validieren.
8. PR erstellen oder metadata-only handoff.
9. Check-Status erfassen.
10. Optional Auto-Merge nur bei gruener Gate-Lage.
11. Audit schreiben.
12. Bei Failure: `recordAgentAutomationMergeOutcome` -> `repair_required`.

## Stop Conditions
- missing server secret/config
- quality gate failed
- required checks failed
- automation paused/off/halted
- protected scope without approval
- canonical truth write attempt
- direct main write
- production deploy requested
