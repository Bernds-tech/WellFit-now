# WELLFIT AGENT GITHUB RUNNER E2E SMOKE

## Zweck
Sicherer E2E-Smoke fuer den supervised Agent-Pfad: Dossier -> Task -> Worker Queue -> GitHub Runner -> PR/Checks -> gated merge oder repair_required.

## Voraussetzungen
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_BASE_BRANCH`
- `GITHUB_RUNNER_TOKEN` **oder** GitHub App Server-Konfiguration
- Keine Secrets im Client, nur serverseitig.

## Testfluss
1. Admin approves test dossier.
2. `createAgentTaskProposalFromApprovedDossier`.
3. Admin approves task proposal.
4. `createWorkerQueueFromApprovedAgentTask`.
5. `createGithubRunnerJobFromWorkerQueue`.
6. create branch.
7. apply safe file change nur in `docs/test-runner-smoke/**`.
8. create PR.
9. refresh required checks.
10. auto-merge nur wenn checks + quality gate gruen.
11. bei Failure: `repair_required` verifizieren.

## Sicherheitsgrenzen
- Kein Production Deploy.
- Kein direct main write.
- Kein Token/NFT/Payment/Cashout/Marketplace runtime feature.
- Canonical Truth owner-protected.

## Stop Conditions
- missing_server_config
- known blocker mit `blocksRealRunner=true`
- automation off/paused/halted
- required checks rot / quality gate rot
- Canonical Truth edit angefordert

## UI Hinweis
"E2E Smoke requires server GitHub config; if missing, status missing_server_config."


## KI-Fortsetzungs-Prompt
Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md`, `docs/architecture/WELLFIT_AGENT_SUPERVISED_RUNNER_GITHUB_INTEGRATION.md` und `docs/architecture/WELLFIT_AGENT_AUTOMATION_CONTROL_AND_RETRY_GUARD.md`.
