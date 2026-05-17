# WellFit Agent Catalog and Approved Agent Build Backlog

Status: active / report-only governance  
Updated: 2026-05-17

## Purpose

WellFit now keeps two separate machine-readable files for agent governance:

- `project-register/agent-catalog.json` catalogs existing WellFit agents, frameworks, validators, owned registers, human-readable docs, extension boundaries, protected boundaries, and next safe maintenance tasks.
- `project-register/approved-agent-build-backlog.json` records human-approved future agents/frameworks that may be planned or built later, one at a time, without silently creating duplicate architecture.

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

## Extension Policy: extend vs new agent

`project-register/agent-extension-policy.json` remains the controlling policy:

- Extend an existing agent when the change clearly fits one existing owner domain, preserves report-only behavior, updates the relevant register/doc/script pointers, and does not add runtime authority.
- Require a new-agent proposal when the work creates a new durable agent name, role, register, workflow family, execution authority, protected-scope owner, or overlaps two or more existing agents without one clear owner.
- Stop for human review when scope touches high/critical or protected areas.

The catalog gives future agents the evidence needed to decide which side of that policy applies.

## Approved backlog build sequencing

The approved backlog is not a batch-build authorization. Even when `alreadyHumanApproved` is `true`, each entry keeps `humanApprovalRequired: true` because build work still needs a scoped prompt, PR review, and evidence.

## Critical-agent two-phase split

Critical backlog entries are split into two explicit phases so report-only governance cannot be confused with implementation authority:

1. `*-report-agent` entries may only analyze existing docs/registers/validators, check governance and protected-boundary rules, emit findings and human-review questions, update report-only registers/docs inside their allowed path scope, and run or reference report-only validation scripts. They cannot modify runtime code, grant reward or mission authority, touch protected data behavior, approve, merge, repair, deploy, or mark implementation complete.
2. `*-implementation-agent` entries remain `blocked` with no allowed file writes until a later explicit Human-Approval records the approving human/date, exact implementation scope, test strategy, required validation scripts, rollback/review plan, and path allowlist. The implementation phase cannot move out of `blocked` merely because the report phase exists or because the idea was approved for planning.

The backlog records this split through `allowedActions`, `forbiddenActions`, `requiredHumanApproval`, `requiredValidationScripts`, `status`, and `riskLevel` on each critical phase entry. Report agents remain critical-domain governance entries, while paired implementation agents are critical and blocked by default.

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

Read `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-extension-policy.json`, `project-register/agent-catalog.json`, and `project-register/approved-agent-build-backlog.json` before changing agent governance. Extend an existing cataloged agent only when one owner domain clearly fits; otherwise use the approved backlog or create a proposal with human review. Keep first versions report-only, build future agents one at a time, do not touch runtime/protected files, and run `node scripts/wellfit-dev-agent/src/agent-catalog-backlog-check.mjs` plus the Quality Gate before PR handoff.
