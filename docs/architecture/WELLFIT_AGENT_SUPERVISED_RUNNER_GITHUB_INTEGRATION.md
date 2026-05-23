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

## Github Runner Status-Semantik (verbindlich)
- `metadata_only`: nur Metadaten, kein realer GitHub API Effekt.
- `missing_server_config`: serverseitige Config fehlt.
- `github_api_not_implemented`: Config kann vorhanden sein, aber keine echte GitHub API Branch/PR/Merge-Implementierung aktiv.
- `branch_metadata_prepared`: Branch-Information nur als Metadaten gespeichert.
- `pr_metadata_ready`: PR-Metadaten vorbereitet, aber keine echte PR erstellt.
- `pr_created`: nur bei echter GitHub API Response (echte PR Nummer/URL).
- `checks_pending`/`checks_passed`/`checks_failed`: Check-Status-Snapshot.
- `auto_merge_metadata_ready`: Auto-Merge als Metadaten freigegeben, nicht ausgefuehrt.
- `auto_merged`: nur bei echtem erfolgreichem GitHub Merge via API.
- `blocked`/`failed`: Runner gestoppt oder fehlgeschlagen.

Regel: Statuswerte mit `*_metadata_*` oder `metadata_only` duerfen niemals als realer GitHub Erfolg interpretiert werden.

## KI-Fortsetzungs-Prompt
Pruefe vor jeder Runner-Aktion zuerst Automation-Control, required checks, Quality-Gate und die ehrliche Status-Semantik. Setze `pr_created` und `auto_merged` nur bei echter GitHub API Response; sonst bei Metadaten konsequent `metadata_only`, `missing_server_config` oder `github_api_not_implemented` dokumentieren.


## Klarstellungen nach PR #228 (2026-05-23)
- `pr_created` bedeutet ausschliesslich: echte GitHub-API-Antwort mit realer PR-Referenz.
- `auto_merged` bedeutet ausschliesslich: echter GitHub-Merge ueber API.
- `github_api_not_implemented` bedeutet: Governance/Config/Flow vorhanden, aber keine reale GitHub-API-Seitenwirkung.
- `metadata_only` bedeutet: keine GitHub-Seitenwirkung (nur Register/Statusmetadaten).
- Keine Fake-Refs und keine simulierten Erfolgsmeldungen.
- Kein direct main write.
- Kein Production Deploy im aktuellen Stand.
