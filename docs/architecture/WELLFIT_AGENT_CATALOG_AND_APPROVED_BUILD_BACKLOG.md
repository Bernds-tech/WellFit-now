# WellFit Agent Catalog and Approved Agent Build Backlog

Status: active / report-only governance  
Updated: 2026-05-17

## Purpose

WellFit now keeps three separate machine-readable files for agent governance:

- `project-register/agent-catalog.json` catalogs existing WellFit agents, frameworks, validators, owned registers, human-readable docs, extension boundaries, protected boundaries, runtime capability labels, and next safe maintenance tasks.
- `project-register/approved-agent-build-backlog.json` records human-approved future agents/frameworks that may be planned or built later, one at a time, without silently creating duplicate architecture.
- `project-register/agent-build-proposals.json` records generated/accepted build proposals and carries the same runtime capability labels so a proposal marked `built` is not mistaken for autonomous runtime authority.

This separation lets future agents understand **what already exists** before proposing or building anything new. It also preserves the PR #104 Extension Policy: an existing agent can be extended only inside its current domain; a new durable agent role must be tracked, justified, and validated before build work starts.

## Why the Agent Catalog exists

The WellFit governance surface now includes task queues, readiness registers, inventory audits, PR guards, Website Agent Frameworks, continuity sentinels, auto-merge/auto-repair guards, report-only validators, and human-readable architecture docs. Without a catalog, future agents could accidentally:

1. create a duplicate register for a domain that already has an owner,
2. add a new validator family instead of extending the existing report-only validator,
3. forget which docs/registers/scripts must stay synchronized,
4. cross protected boundaries such as health, child safety, location, privacy, legal, reward authority, token/payment, Unity, or PR #13 scope, or
5. treat report-only planning as approval to execute runtime/product behavior.

The catalog makes those responsibilities explicit. Every entry includes owned registers, docs, scripts, related agents/registers, allowed extension types, proposal-required changes, protected boundaries, and a next safe maintenance task.

## Why approved future agents are separate from existing agents

Existing agents/frameworks are operational governance assets. They already have source files, docs, validation scripts, quality-gate wiring, and extension boundaries.

Approved future agents are different: the owner has approved them as a backlog of desired future capabilities, but they are **not built by this task**. The backlog records priority, risk, connected existing agents/registers, required docs/registers/scripts, allowed/forbidden files, dependencies, build order, and protected boundaries. This prevents an approved idea from being mistaken for an active agent.

## Critical/high-risk two-phase backlog split

Critical and high-risk approved backlog families are split into explicit `*-report-agent` and `*-implementation-agent` phases when they could otherwise be mistaken for runtime/product authority. The split currently covers reward fairness, child/age-appropriate safety, health claims, location safety, sponsor integrity, trust-safe monetization, user-memory governance, and recovery/pause/anti-overuse governance. The already built Mission Factory Agent remains report-only and does not imply runtime mission generation authority.

A `*-report-agent` entry is limited to governance evidence: analysis, findings, rule checks, register updates, documentation updates, validation-script policy checks, and `review_required` markers. It may use only docs/register/validator scopes in a human-approved documentation task. It must not implement product behavior, protected logic, reward authority, mission completion authority, anti-cheat authority, monetization/payment/wallet/token/NFT/betting behavior, protected-data handling, deployment, approval, merge, auto-merge, auto-repair, or unrestricted repair. Report-agent status therefore does **not** imply implementation authority.

A `*-implementation-agent` entry is intentionally `blocked`. Its active runtime write allowlist is empty, and it remains unavailable until a later explicit human approval names that implementation entry and provides all required evidence. Before activation, the task must include a dedicated test strategy, exact path allowlist, rollback/review plan, protected-topic review plan, and PR review evidence. Until those items exist, protected areas remain blocked and the paired report-agent remains the only safe governance phase.

The validator enforces this separation by checking that each required split family has both phase IDs, report-agent entries include `allowedActions`, `forbiddenActions`, and `requiredHumanApproval`, implementation-agent entries remain blocked with no active runtime writes, and built/report-only entries are not interpreted as runtime-capable.

## Runtime capability and status fields

The lifecycle field `status` is still used for catalog/backlog workflow state (`active`, `approved_for_planning`, `built`, `superseded`, and similar values). It is **not** a runtime-autonomy indicator. To prevent the word `built` from being misread as execution authority, the catalog, approved backlog, and proposal register now include these explicit fields on every entry:

- `artifactStatus`: implementation maturity of the artifact itself.
  - `planned`: idea/backlog entry exists, but the governance artifact has not been implemented yet.
  - `governance_built`: documentation/register governance exists, but there is no validator or runtime capability implied by this field alone.
  - `validator_built`: documentation/register governance plus report-only validation/check scripts exist.
  - `runtime_capable`: a later human-approved task has explicitly granted and documented runtime capability. This value must not be inferred from `status: built`.
- `executionCapability`: maximum documented execution ability for the current artifact.
  - `report_only`: may inspect/read and produce reports, but must not write product/runtime files automatically.
  - `docs_register_write`: may write only approved documentation, register, TODO/planning, and validator-script scopes in a human-approved implementation task.
  - `safe_runtime_write`: may write a specifically approved low-risk runtime scope, still bounded by explicit paths and review.
  - `repair_capable`: may perform a specifically approved repair workflow; it must still respect protected-scope and human-review gates.
  - `pr_capable`: may create or update PR artifacts only when a later task grants that ability; it does not imply merge, deploy, approval, or auto-repair authority.
- `allowedWriteScopes`: path globs that may be written only when the selected task explicitly grants write execution. Empty lists mean no autonomous writes are granted by the catalog entry itself.
- `forbiddenWriteScopes`: path globs that must not be written by that artifact/task. Forbidden scopes always override allowed scopes.
- `requiresHumanApprovalForRuntime`: `true` means any runtime execution, product writes, repairs, PR creation, protected-scope change, or stronger capability must be explicitly approved by a human before use.

Current WellFit agent governance should treat `validator_built + report_only` as the safe default for existing cataloged governance artifacts. Backlog/proposal entries that show `validator_built + docs_register_write` mean a scoped human build produced docs/register/validator outputs; they still do **not** authorize autonomous runtime behavior, reward authority, mission completion authority, protected data access, repairs, PR creation, merge, deployment, or product writes.

## Extension Policy: extend vs new agent

`project-register/agent-extension-policy.json` remains the controlling policy:

- Extend an existing agent when the change clearly fits one existing owner domain, preserves report-only behavior, updates the relevant register/doc/script pointers, and does not add runtime authority.
- Require a new-agent proposal when the work creates a new durable agent name, role, register, workflow family, execution authority, protected-scope owner, or overlaps two or more existing agents without one clear owner.
- Stop for human review when scope touches high/critical or protected areas.

The catalog gives future agents the evidence needed to decide which side of that policy applies.

## Approved backlog build sequencing

The approved backlog is not a batch-build authorization. Even when `alreadyHumanApproved` is `true`, each entry keeps `humanApprovalRequired: true` because build work still needs a scoped prompt, PR review, and evidence.

Future agents must build approved backlog items one at a time unless the Batch Execution Runner is explicitly authorized for that exact scope. A later build task should:

1. read `AGENTS.md`, Current State, Work Map, TODO Index, the Agent Catalog, the Approved Agent Build Backlog, and the Agent Extension Policy;
2. select one backlog entry;
3. confirm connected agents/registers and protected boundaries;
4. create or update the required doc/register/validator files;
5. keep first versions report-only unless a later human-approved task says otherwise;
6. update Work Map and TODO Index references;
7. integrate the validator into the Quality Gate if appropriate; and
8. record PR evidence before marking the backlog entry `built`.

## Connected agents and registers counts

Each approved backlog entry stores:

- `connectedAgents`: existing catalog IDs that the future agent must coordinate with;
- `connectedRegisters`: existing registers or machine-readable sources affected by planning/build work;
- `connectedAgentCount`: exact length of `connectedAgents`;
- `connectedRegisterCount`: exact length of `connectedRegisters`.

The report-only validator checks those counts. A mismatch means the backlog item is not ready because its impact metadata is stale or incomplete.

## Moving from approved_for_build to built

A backlog entry may move to `built` only after a future scoped task has produced all required outputs:

- human-readable architecture/runbook documentation,
- machine-readable register or register extension,
- report-only validation script,
- Work Map and TODO Index references,
- Quality Gate integration where applicable,
- passing checks or documented environment limitations, and
- PR evidence confirming no runtime/protected files were touched unless explicitly approved.

High/critical or protected-boundary entries must not be auto-marked `built` without human-reviewed build/status-sync evidence. Human review remains required even when the idea itself is already approved for planning, and a `built` status only confirms the report-only framework exists; it does not authorize runtime behavior, protected-data use, rewards, mission completion, monetization, Unity/AR, deployment, self-approval, or auto-merge.

## Protected/high-risk runtime behavior remains blocked

The catalog/backlog do not authorize product behavior. They do not allow agents to modify token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, Unity/PR #13, Functions, Firestore rules, package manifests, GitHub workflows, runtime pages, or public assets. Those areas remain blocked unless a later explicit task provides a clear review plan and allowed file scope.

The first version is report-only. It never creates agents automatically, never approves PRs, never merges, never repairs files, and never deploys.

## Support for future autonomous work without losing control

The catalog and backlog help autonomous agents by making ownership and next steps machine-readable, while control remains with human-approved prompts and report-only validators. Future agents can quickly answer:

- Does an agent/framework already exist for this domain?
- Which files own the domain?
- Which validator must pass?
- Which extensions are allowed?
- Which changes require a new-agent proposal?
- Which future agents are already approved for planning?
- Which protected boundaries stop work?
- What must be present before a future agent can be marked built?

This supports safer autonomy by reducing ambiguity without granting automatic build, merge, repair, deployment, or protected runtime authority.

## KI-Fortsetzungs-Prompt

Read `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-extension-policy.json`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, and `project-register/agent-build-proposals.json` before changing agent governance. Extend an existing cataloged agent only when one owner domain clearly fits; otherwise use the approved backlog or create a proposal with human review. Keep first versions report-only, build future agents one at a time, do not touch runtime/protected files, and run `node scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs` plus the Quality Gate before PR handoff.
