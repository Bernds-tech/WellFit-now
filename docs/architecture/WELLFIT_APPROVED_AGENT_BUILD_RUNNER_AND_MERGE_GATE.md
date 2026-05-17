# WellFit Approved Agent Build Runner and Merge Gate

Status: single-agent docs/register/check-script execution plus PR handoff and narrow safe docs/register repair approved; runtime, protected-scope, auto-merge and deploy remain disabled
Updated: 2026-05-17
Primary policy: `project-register/approved-agent-build-runner-policy.json`
State register: `project-register/agent-build-runner-state.json`
Merge-gate register: `project-register/approved-agent-build-runner-merge-gate.json`

## Why this runner exists

The Approved Agent Build Runner exists because WellFit now has an approved backlog of future governance agents, but autonomous execution must not outrun review, checks, or protected-scope guardrails. The project owner has approved the backlog entries in `project-register/approved-agent-build-backlog.json` for sequential future building. That approval is not permission to change runtime product code, skip required checks, merge when evidence is missing, self-approve, deploy, or touch protected areas.

The immediate risk addressed by this framework is the PR #109 pattern: a PR body can state that heavy checks were not executed in the current session and should be run later by CI or a maintainer. Under this runner, that is classified as `not_merge_ready`. A required check is merge evidence only when the exact command was actually run and passed, or when a GitHub required check is available and successful. Missing, skipped, unknown, pending, delegated-to-future-CI, or environment-blocked checks fail the merge gate.

## How this differs from Agent Architect

The Agent Architect & Proposal Agent proposes the next safe future-agent build by reading the catalog, approved backlog, extension policy, risk sources, and continuity map. It generates a human-readable build prompt but does not execute that prompt.

The Approved Agent Build Runner is the governed execution and merge-gate layer. The current approved autonomy stage is `single_agent_docs_register_build`: one agent may execute exactly one already-human-approved docs/register/validator/check-script agent-build task per branch inside the policy allowlist, including branch, commit, and PR handoff. The small policy tier added on 2026-05-17 also permits only allowlisted docs/register/JSON-format safe repairs with same-branch commit and rerun evidence. Runtime product changes, protected-scope changes, Unity/PR #13 changes, token/reward/payment authority changes, automatic merge, approval, closing PRs, and deployment remain disabled unless a later human-approved policy change raises the relevant policy to a higher stage.

## Autonomie-Freigabe vom 2026-05-17

Bernd hat die bereits besprochenen und im Approved-Agent-Build-Backlog als `alreadyHumanApproved` gefuehrten Agenten fuer die autonome Erstellung freigegeben, solange sie als Docs-/Register-/Validator-/Report-Agenten gebaut werden. Diese Freigabe erlaubt Branch, Commit und PR-Handoff fuer genau einen freigegebenen Agenten pro Branch. Die neue kleine Policy-Stufe erlaubt zusaetzlich nur ungefaehrliche Doku-/Register-/JSON-Format-Reparaturen innerhalb dieses Scopes, jeweils mit neuem Same-Branch-Commit und erneutem Check-Nachweis. Sie erlaubt weiterhin keine Runtime-Produktlogik, kein Auto-Merge, kein Deploy, keine Selbstfreigabe und keine geschuetzten Token-/Wallet-/Reward-Authority-/Mission-Authority-/Health-/Child-/Location-/Camera-/Legal-/Privacy-/Unity-/PR-#13-Aenderungen.

Der aktive Modus heisst `single_agent_docs_register_build`. High-/Critical-Domain-Risk darf in diesem Modus nur bedeuten, dass der Guard-/Report-Agent ein kritisches Thema beobachtet; die Implementierung selbst muss docs/register/validator-only bleiben und darf keine Runtime-Autoritaet erhalten. Neue Agenten ausserhalb des bereits freigegebenen Backlogs brauchen weiterhin eine explizite Vorstellung und Freigabe durch Bernd.

## Report-Agent- vs. Implementierungs-Agent-Semantik

Report-Agenten aus `project-register/approved-agent-build-backlog.json` duerfen in diesem Runner als Docs-/Register-/Validator-/Report-Artefakte gebaut werden. Dazu gehoeren auch Guard- oder Audit-Agenten mit `high` oder `critical` Domain-Risk, solange diese Einstufung nur beschreibt, welche Produkt- oder Schutzdomaene der Report beobachtet, prueft oder als Risiko markiert. `domainRisk=high` oder `domainRisk=critical` ist damit ein Beobachtungs-/Pruefbereich, keine Produktfreigabe.

Implementierungs-Agenten bleiben blockiert. Eine spaetere Runtime-Aufgabe braucht vorab eine separate Human Approval, die mindestens die exakten Runtime-Dateien oder Globs, die Schutzgrenzen und Stop-Bedingungen sowie die auszufuehrenden Tests/Checks fuer genau diese Aufgabe benennt. Ohne diese separate Freigabe darf der Runner keine Produkt-, Health-, Child-Safety-, Location-, Reward-, Token-, Wallet-, Payment-, Legal-, Privacy-, Unity- oder sonstige geschuetzte Runtime-Logik veraendern.

Runner-Berichte muessen die Trennung maschinenlesbar ausgeben: `domainRisk`, `implementationRisk`, `runtimeAuthorityGranted: false` und `reportOnly: true`. Fuer Report-Agenten bleibt `implementationRisk` auf `blocked_until_separate_human_approval_names_exact_runtime_files_boundaries_and_tests`, auch wenn der Domain-Risk hoch oder kritisch ist.

## Autonomie-Modell

The policy set now uses an explicit numbered stage model so the desired long-term autonomy direction is visible without silently activating unsafe capabilities. The effective release on 2026-05-17 is limited to docs/register PR handoff (`Stage 1.1`) plus narrowly scoped docs/register JSON-format repair (`Stage 1.2`) where the adjacent policies already allow it. Merge and deploy capability stay non-executing: `Stage 1.3` may produce only eligibility reports, while `Stage 2.0` and `Stage 3.0` are future options that require separate explicit owner approval before any implementation or activation.

| Stage | Activation value | Allowed autonomy | Explicit blockers | Current status |
| --- | --- | --- | --- | --- |
| 1.0 | `report_only` | Analyse, dry-runs, reports, eligibility decisions, and governance validation only. | No implementation, repair, runtime edits, runner-created PRs, approval, merge, or deploy. | Baseline safe mode and still the active mode for auto-merge itself. |
| 1.1 | `docs_register_check_script_pr_handoff` / legacy `single_agent_docs_register_build` | Exactly one already-human-approved agent may be built per branch as docs/register/validator/check-script artifacts in allowlisted governance paths, including branch, commit, and PR handoff. | No runtime product files, protected compliance/economy/health/child/location/camera/Unity/PR #13 areas, automatic merge, or deploy. | Allowed only for the narrow approved docs/register/check-script runner scope. |
| 1.2 | `safe_docs_register_json_format_repair_with_rerun_evidence` / legacy `safe_docs_register_json_format_repair_allowed` | Only safe docs/register JSON parse/format repairs may be attempted inside the approved docs/register scope, with a repair record, a new same-branch commit, and rerun evidence showing the repaired check result. | No runtime/protected repairs, script rewrites outside the approved validator scope, hidden failures, merge, deploy, dependency changes, Unity/PR #13, or token/reward/payment authority changes. | Allowed only as narrow evidence repair where the safe-repair policy explicitly permits it. |
| 1.3 | `merge_deploy_eligibility_report_only` | Produce a merge/deploy eligibility report that states whether required evidence appears present or missing. | No actual merge, no approval, no repository-setting change, no PR close, no deploy, no secret/environment mutation, and no bypass of missing/unknown/pending/skipped/failed/environment-blocked evidence. | Report-only visibility target; it may expose gaps but must not execute merge or deploy. |
| 2.0 | `manual_merge_assistant_future_optional` | Optional future assistant may prepare a human-facing merge checklist, command suggestion, or handoff after explicit owner approval. | No autonomous merge, no self-approval, no branch-protection bypass, no merge with missing required checks/reviews, and no protected/runtime merge without named review evidence. | Not active; requires a separate owner-approved policy update and review plan. |
| 3.0 | `deploy_assistant_future_optional` | Optional future assistant may prepare a deployment checklist or handoff only after explicit owner approval, hosted CI evidence, rollback plan, environment separation, and protected-scope exclusion. | No autonomous deploy, no production secret access, no environment mixing, no protected-scope deploy, no Firebase/package/workflow/deploy-config mutation unless separately approved, and no deploy from local-only evidence. | Not active; requires a separate owner-approved policy update, hosted CI proof, rollback plan, environment plan, and protected-scope exclusion. |

Stages must be raised in order, and activation values with legacy names remain compatibility aliases only; they do not expand capability. `maxAgentsPerRun` remains `1`. Any movement beyond Stage 1.2 execution or Stage 1.3 report-only visibility requires a separate human-approved policy update that names the exact scope, evidence, stop conditions, and review owner.

## PR creation, merge recommendation, and auto-merge capability states

The merge gate deliberately separates three capability states so a reviewable PR can exist without implying merge permission:

| Capability state | Meaning | Current policy result |
| --- | --- | --- |
| `pr_creation_allowed` | An agent may create a reviewable PR for allowed docs/register/validator/governance work only. | This is the first meaningful next state for the current docs/register governance runner. It does not bypass review, branch protection, required checks, or merge gates. |
| `merge_recommendation_allowed` | An agent may recommend merge only when full machine-readable evidence is green. | A recommendation requires exact local command evidence, successful machine-readable GitHub required checks, mergeability, satisfied branch protection, satisfied review rules, and no runtime/protected path findings. Missing, pending, skipped, unknown, failed, or environment-blocked checks block the recommendation. |
| `auto_merge_allowed` | Real auto-merge would allow a merge action only after all higher evidence and approval gates are proven. | Disabled. It requires a separate explicit human approval plus machine-readable GitHub checks, branch protection, review rules, mergeability evidence, and human approval evidence before any future activation. |

PR creation is not merge permission. Merge recommendation is not auto-merge. Auto-merge remains disabled, and PR creation does not bypass human review, branch protection, required GitHub checks, local evidence, protected-path review, or any merge gate. Runtime/product/protected paths remain blocked.

## Freigabe 2026-05-17

The approved execution stage for this policy family maps to Stage 1.1 (`docs_register_check_script_pr_handoff`, legacy `single_agent_docs_register_build`) plus Stage 1.2 (`safe_docs_register_json_format_repair_with_rerun_evidence`, legacy `safe_docs_register_json_format_repair_allowed`) only where the adjacent safe-repair policy permits it. Stage 1.3 is report-only visibility for merge/deploy eligibility, not execution. The release is intentionally narrow:

- `project-register/approved-agent-build-runner-policy.json` and `project-register/agent-autopilot.json` use `activationState: single_agent_docs_register_build`; batch execution remains separately governed and must not expand beyond its own policy.
- `project-register/pr-post-creation-guard.json` uses `activationState: pr_handoff_allowed_no_merge`, so PR creation and handoff are allowed only for the active docs/register/validator scope.
- `project-register/auto-repair-policy.json` uses `activationState: safe_docs_register_json_format_repair_allowed`, so only narrow docs/register/JSON-format evidence repairs may be attempted and committed on the same branch after a failed safe check.
- `project-register/auto-merge-policy.json` remains `activationState: report_only`, so no automatic merge is enabled by this release.
- Runtime execution, protected-scope repair or unrestricted repair, Stage 2.0 manual merge assistance, and Stage 3.0 deploy assistance are future gated stages and require separate owner approval before implementation or activation. Stage 3.0 also requires hosted CI evidence, a rollback plan, environment separation, and protected-scope exclusion.

## NPM command sequence for approved runner handoff

The approved runner flow must be discoverable through `npm run ...` commands, not only through direct `node scripts/...` paths. Use the commands below in this order so the allowed sequence is auditable from `package.json`:

1. **Dry-run command:** `npm run agent:approved-runner:dry-run` selects at most one already-human-approved backlog entry, writes the report-only dry-run evidence, and does not modify governance artifacts, commit, create PRs, merge, or deploy.
2. **Artifact build/generator command:** `npm run agent:approved-runner:generate-artifacts -- --dry-run` previews the docs/register/validator artifact changes for the selected entry. When the dry-run evidence is reviewed and the branch is correct, `npm run agent:approved-runner:generate-artifacts -- --entry-id <approved-backlog-id>` may generate only the allowed docs/register/validator artifacts for that one entry.
3. **Execute/commit command:** `npm run agent:approved-runner:execute` is the governed one-step executor. It reselects exactly one eligible approved entry, generates allowed docs/register/validator artifacts, validates changed paths, runs required local governance checks, and creates a branch commit when all executor checks pass. It must be run only on a task branch, never on `main` or another protected branch.
4. **PR handoff rule:** after the execute command creates the scoped commit, open a reviewable PR by handoff with exact command evidence, changed files, known risks, skipped/environment-blocked checks, and a clear statement that PR creation is not merge permission. The PR remains human-review and merge-gate controlled.
5. **Stop rules for merge, deploy, runtime, and protected scope:** stop without merge, deploy, approval, self-approval, or repair if any required check is missing, pending, skipped, unknown, failed, or environment-blocked; if GitHub mergeability or required checks are unavailable; if runtime/product/protected paths or topics are touched; if package/dependency, workflow, Firebase, native/Unity, PR #13, token/NFT/wallet/payment/economy authority, reward authority, mission-completion authority, health, child-safety, location, camera, biometric, consent, privacy, legal, or compliance logic changes appear; or if the requested action includes merge, deploy, release, repository settings, branch protection changes, or broader auto-repair.

## Approved backlog source and one-agent selection

The runner reads `project-register/approved-agent-build-backlog.json` as the source of already human-approved future-agent candidates. It sorts eligible entries by `suggestedBuildOrder` and selects only the first entry whose status remains eligible for planning/build and whose `alreadyHumanApproved` flag is true.

`maxAgentsPerRun` is fixed at `1` for the active docs/register build tier. Future increases require a separate approved policy update. The runner may build only the one selected already-human-approved docs/register/validator candidate on a non-main branch and hand it off by PR; merge remains blocked until separate evidence and human review gates pass.

## Generated prompts

The runner remains compatible with `scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs`. That proposal script can create the next prompt from the approved backlog. The runner treats the prompt as build input, not as merge evidence. A generated prompt may guide a future one-agent implementation, but the future PR must still provide exact local and GitHub check evidence before the merge gate can pass.

## Required checks and evidence

The policy separates required checks into pre-build, build, post-build, post-PR, and merge-gate groups. Required local commands include lint, TypeScript, build, Firebase Functions check, `git diff --check`, JSON validation for changed project-register files, quality gate, PR diff review, PR post-creation guard, auto-merge eligibility, auto-repair decision, task status/work-log sync, Agent Catalog/Backlog checks, and Agent Architect proposal checks.

A PR must record exact commands and results. PR body claims must match executed checks. If a command was not run, the merge gate fails. If GitHub required checks are unavailable, unknown, pending, missing, or failing, the merge gate fails unless a separate explicit human override is present.


## Corrected report-only merge-gate semantics

The merge-gate validator now separates configuration readiness from concrete merge readiness:

- `REPORT_ONLY_MERGE_GATE=true` means this gate only reports and validates safety semantics.
- `GATE_CONFIGURATION_READY=true` means the gate configuration, register, documentation, validator output, and Quality Gate integration are valid.
- `MERGE_READY=false` is the expected safe report-only state when a concrete PR still lacks post-PR mergeability evidence, required GitHub check success, complete local-check evidence, or human review.
- `MISSING_CHECKS_BLOCK_MERGE=true` keeps missing, unknown, pending, skipped, failed, or environment-blocked checks as actual merge blockers.
- `SAFE_REPAIR_LIMITED=true`, `NEVER_MERGES=true`, and `NEVER_DEPLOYS=true` keep the runner non-authorizing.
- `APPROVED_AGENT_BUILD_RUNNER_MERGE_GATE_READY=true` is emitted only when the gate configuration is valid.

The validator must exit `0` when `GATE_CONFIGURATION_READY=true`, even while `MERGE_READY=false`. It must exit non-zero only when `GATE_CONFIGURATION_READY=false`. Therefore a report-only PR can pass validation and Quality Gate while still reporting that actual merge readiness is blocked until complete evidence exists.

## Missing-check handling

Missing required checks block merge. The runner must try to run missing checks before deciding. If a check cannot run because of environment or tooling limitations, the result is `environment_blocked` and the PR is not merge-ready. If a check fails for one exactly matched allowlisted docs/register/JSON-format reason, the active safe-repair tier may attempt repair within the same PR branch, commit the repair, and rerun the failed check plus the required suite. If a check fails because of runtime, protected, high-risk, or product-judgment scope, the runner must stop, mark `repair_required`, and create a report/repair plan instead of merging.

## Safe repair rules

Safe repair is deliberately narrow. It may only address docs/register/JSON-format evidence issues: Markdown trailing whitespace or missing final newlines in docs/register markdown, JSON formatting or parse errors in `project-register/*.json`, missing Work Map or TODO Index pointers for newly added governance artifacts, missing KI-Fortsetzungs-Prompt sections in newly added architecture docs, and missing work-log/progress-log evidence while every changed file remains in allowed docs/register paths. It must not repair runtime code, package/dependency state, GitHub workflows, Firebase configuration, Unity/native assets, protected product authority, or scripts outside an explicitly approved validator/check/report task scope.

A safe repair must be committed as a new commit on the same PR branch, rerun the failed checks, rerun the full required build and post-PR checks, record the repair attempt, and remain unmerged until all required checks pass.

## When the runner stops instead of merging

The runner stops instead of merging when any protected/runtime path changes, any high/critical risk or source-of-truth ambiguity appears, any required check is missing or failing, GitHub mergeability is unknown/dirty/blocked/pending/failed, auto-repair reports unresolved `repair_required`, PR diff review reports protected path findings, no task/work-log evidence exists, or any deploy, approval, self-approval, repository-setting, PR #13, or Unity action is detected.

## Runtime and protected changes remain blocked

This framework is documentation/register/validation-script only. It does not authorize changes to `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, `package.json`, `package-lock.json`, `firebase.json`, `.github/**`, `native/**`, `native/unity/WellFitBuddyAR/**`, PR #13, token/NFT/wallet/payment/economy authority, reward authority, mission completion authority, health, child, location, camera, biometric, consent, privacy, legal, or compliance logic.

Protected topics may be mentioned as safety boundaries in governance docs. They do not become implementation permission. If protected runtime files change, the runner must stop and report.

## Safe Runtime Allowlist task tiers

`runtimeAllowedPathsByTaskType` defines task-type path tiers for future guarded work. These profiles are not blanket runtime approval and do not override the global policy. Global `forbiddenPaths` always win over every task-specific `allowedPaths` entry, and protected sensitive topics always win even when a path appears in a future task profile.

Current task profiles are:

| Task type | Current state | Intended scope |
| --- | --- | --- |
| `docs_register_agent_build` | Active under `single_agent_docs_register_build` | One already-human-approved docs/register/validator agent artifact per branch; high/critical domain-risk report agents remain no-runtime guard artifacts only. |
| `docs_register_only` | Legacy alias under `single_agent_docs_register_build` | Older docs/register/check-script governance task profile retained for compatibility. |
| `ui_copy_safe` | Future profile only, not active | Narrow non-functional UI copy edits after exact human activation, file list, checks, and preview/screenshot evidence. |
| `route_register_sync` | Future profile only, not active | Synchronize route inventory/register documentation with already-existing routes after explicit activation; no route implementation edits. |
| `test_only` | Future profile only, not active | Add or update tests after explicit activation and exact test-scope approval; no product implementation changes. |

Only `docs_register_agent_build` is active now for already-human-approved docs/register/validator agent artifacts; `docs_register_only` remains a legacy alias. `ui_copy_safe`, `route_register_sync`, and `test_only` require a later explicit policy activation plus the task-specific minimum checks before they can be used. Their presence in the register is planning structure only; it does not activate runtime editing, unrestricted repair, auto-merge, deployment, approval, self-approval, or PR closing.

The following remain blocked without dedicated human approval and a test/review plan: `firestore.rules`, `functions/**`, `lib/**`, `native/**`, Unity/PR #13, wallet/payment/token/reward authority, mission-completion authority, health, child, location, camera, privacy, legal, and compliance logic.

## Avoiding the PR #109 missing-check risk

Under this gate, a PR body that says checks were not executed and should be run later is not merge-ready. The gate requires executed local check evidence and successful required GitHub checks. Delegating required checks to later CI without visible success evidence is treated the same as missing evidence. The runner must attempt to complete missing safe checks, attempt only allowed safe repairs if needed, and refuse merge until every required check is green.

## Future activation path

After this staged framework passes policy validation and quality gate checks, future work may continue controlled one-agent docs/register/validator builds for the next eligible already-human-approved backlog entry. Future activation should continue only from the approved backlog order, preserve `maxAgentsPerRun: 1`, report exact evidence, avoid protected/runtime paths, create a reviewable PR handoff, and pass the full merge gate before any merge. Runtime execution, protected-scope repair, unrestricted repair, and automatic merge require separate human-approved policy changes before activation.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/approved-agent-build-runner-policy.json`, `project-register/approved-agent-build-runner-merge-gate.json`, `project-register/agent-build-runner-state.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-catalog.json`, `project-register/agent-build-proposals.json`, `project-register/auto-merge-policy.json`, `project-register/auto-repair-policy.json`, `project-register/pr-review-policy.json`, `project-register/pr-post-creation-guard.json`, `project-register/pr-diff-review-policy.json`, `project-register/task-status-policy.json`, `project-register/continuity-dependency-map.json`, `scripts/wellfit-dev-agent/src/approved-agent-build-runner-check.mjs`, `scripts/wellfit-dev-agent/src/approved-agent-build-runner-dry-run.mjs`, `scripts/wellfit-dev-agent/src/approved-agent-build-runner-merge-gate-check.mjs` und `scripts/wellfit-dev-agent/src/quality-gate.mjs`. Arbeite weiter nur am bestehenden Approved-Agent-Build-Runner- und Merge-Gate-Rahmen. Nutze `single_agent_docs_register_build` nur fuer einen einzelnen bereits freigegebenen Docs/Register/Validator-Agenten pro Branch. Branch, Commit und PR-Handoff sind fuer diesen Scope erlaubt; repariere automatisch nur erlaubte Doku-/Register-/JSON-Formatfehler nach `safe_docs_register_json_format_repair_allowed` mit Same-Branch-Commit und erneuten Checks; merge nicht, deploye nicht, fasse keine Runtime-/Protected-/Unity-/PR-#13-Dateien an und erweitere `maxAgentsPerRun` nicht ohne separate Freigabe.
