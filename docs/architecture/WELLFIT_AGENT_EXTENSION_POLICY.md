# WellFit Agent Extension vs New Agent Proposal Policy

Status: active / report-only governance  
Updated: 2026-05-16  
Machine-readable policy: `project-register/agent-extension-policy.json`  
Validator: `scripts/wellfit-dev-agent/src/agent-extension-policy-check.mjs`

## Purpose

WellFit already has many governance agents and frameworks: Autopilot, Batch Execution Runner, PR Review, PR Diff Review, Post-PR Guard, Task Status Sync, Continuity Sentinel, Website Agent Framework, Website Agent Backlog, Product Readiness, Repository Inventory, Cross-Reference Maintenance, Research/Recommendation, and Adaptive User Insight.

Future work may need new capabilities, but future agents must not create duplicate architecture or silently add new autonomous roles. This policy gives future WellFit agents a report-only decision rule:

- extend an existing agent/framework when the change clearly belongs to that agent's existing purpose; or
- stop and create a new-agent proposal for human review before building anything new.

The first version is governance-only and report-only. It does not create agents, create registers automatically, approve PRs, merge, repair files, deploy, or grant runtime authority.

## Why extensions are allowed

Extensions are allowed because existing WellFit agents already define source-of-truth files, validators, reports, task queues, status rules, and safety boundaries. A small extension keeps work reviewable when it:

1. stays inside the existing agent's purpose;
2. updates the existing register/doc/script instead of introducing a parallel system;
3. preserves `report_only`, `planning_only`, review-required, and blocked semantics;
4. improves existing validation or cross-reference coverage; and
5. updates Work Map and TODO Index pointers when a durable governance file is added.

Examples of safe extensions include:

- Website Agent Framework receiving Website Agent Backlog;
- PR Review Agent receiving PR Diff Review integration;
- Continuity Sentinel receiving new must-not-forget entries;
- Task Status Sync receiving stricter work-log validation;
- Product Readiness receiving updated next-safe-task metadata; and
- Cross-Reference Maintenance receiving new file dependency rules.

## Why new agents require proposal first

A new agent name, role, workflow family, task category, register, or execution authority can change ownership and risk. Without a proposal, multiple agents can begin to govern the same area, or a new agent can accidentally bypass established safety controls.

A proposal is required before building when the capability:

- creates a new agent name or role;
- creates a new agent register;
- creates a new agent workflow family;
- creates a task queue category not covered by existing agents;
- overlaps with two or more existing agents;
- touches protected or high-risk scope;
- adds runtime execution authority;
- adds auto-merge, auto-repair, deployment, self-approval, PR approval, or PR close behavior; or
- changes reward, mission authority, health, child, location, privacy, legal, compliance, token, NFT, wallet, payment, betting, Unity, or PR #13 scope.

Proposal-required examples include Human Motivation Engine, Ethical Engagement Guard, Mission Factory Agent, Product Intelligence Agent, Agent Architect & Proposal Agent, Auto-Merge Activation Agent, Auto-Repair Execution Agent, and Runtime Product Fix Agent.

## Extension vs new-agent decision process

Use this sequence before any agent-governance change:

1. **Read the leading files.** Start with `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, and the relevant project registers.
2. **Name the intended capability.** Write one sentence describing the capability and whether it is report-only, registry-only, validator-only, task-selection guidance, or execution authority.
3. **Find the existing owner.** Search the mapped files for an existing agent/framework that already owns the purpose.
4. **Count connected agents and registers.** Use the rules below to decide whether the work has one clear owner or overlaps multiple owners.
5. **Check protected scope.** If protected/high-risk areas are involved, require human review even if one agent appears to own the area.
6. **Choose the path.**
   - One clear owner, compatible purpose, no protected authority change: extend the existing agent.
   - No clear owner, two or more overlapping owners, or new authority: create a proposal first.
7. **Record evidence.** Update only the relevant Work Map, TODO Index, task queue, readiness, and continuity pointers needed for future agents to find the policy.

## How to count connected agents

Count an agent/framework as connected when the proposed capability would cause that agent to:

- read the new data;
- validate the new data;
- include the new data in a report;
- decide or recommend status, risk, priority, readiness, task selection, mergeability, repairability, or follow-up behavior; or
- own a handoff, blocked reason, open point, or next safe task.

If exactly one existing agent is connected and the capability fits its purpose, an extension is usually acceptable. If two or more agents are connected and ownership is not purely read-only/reference-only, a proposal is required unless a human explicitly assigns ownership to one existing agent.

## How to count connected registers

Count a register or planning file as connected when it is read, validated, referenced in output, or used to decide status, risk, priority, readiness, task selection, or review requirements.

Always consider these files for agent-governance changes:

- `project-register/agent-workflows.json`
- `project-register/agent-task-queue.json`
- `project-register/agent-autopilot.json`
- `project-register/continuity-dependency-map.json`
- `project-register/cross-reference-maintenance.json`
- `project-register/task-status-policy.json`
- `project-register/pr-review-policy.json`
- `project-register/website-agents.json`
- `project-register/website-agent-backlog.json`
- `project-register/product-readiness.json`
- `project-register/repository-inventory.json`
- `project-register/risk-classifier.json`
- `project-register/definition-of-done.json`
- `todolist/WORK_MAP.md`
- `todolist/TODO_INDEX.md`

Connected-register impact is not build approval. It is evidence for a report, proposal, or future task selection.

## Avoiding duplicate architecture

Do not create a new architecture when an existing one can be extended. Instead:

- add fields to the existing register when compatible;
- add validation to the existing validator when compatible;
- add status values only when compatible with the existing lifecycle;
- add backlog/finding categories inside the existing domain;
- add cross-reference rules for already mapped files;
- improve report-only checks rather than adding execution authority; and
- update Work Map, TODO Index, Product Readiness, task queue, and continuity pointers only where necessary.

If the proposed capability sounds like a new system but solves a problem already covered by Product Readiness, Repository Inventory, Cross-Reference Maintenance, Continuity Sentinel, PR Review, Website Agents, Research/Recommendation, Adaptive User Insight, Autopilot, or Batch Execution Runner, stop and explain why the existing owner cannot be extended before proposing a new agent.

## Preserving open points in Continuity Sentinel

Continuity Sentinel is the guard for must-not-forget items, open points, dependencies, blockers, follow-ups, and next-agent handoffs. When extending an existing agent or proposing a new one:

1. do not delete continuity entries just because a related task moved forward;
2. mark entries as done, blocked, stale, duplicate, or review-required only when evidence supports the status;
3. add must-not-forget entries when the new policy creates durable review obligations;
4. link affected registers/docs/scripts as dependencies; and
5. keep protected areas and ambiguous ownership as human-review-required.

This preserves historical TODO/status context and prevents future agents from losing unresolved governance questions.

## How a proposed new agent becomes a future build task

A proposal is not a build. A proposal should include:

- proposed agent name and purpose;
- why existing agents cannot cover the capability;
- benefit and intended output;
- risk level and protected-scope analysis;
- connected agents/frameworks;
- connected registers/docs/scripts;
- forbidden auto-actions;
- human-review requirement; and
- a suggested future task candidate if approved.

Only after human review may a future task add the new agent/register/workflow. Until then, proposal-required examples remain report-only planning topics and must not be implemented as autonomous agents.

## Why protected/high-risk areas always require human review

Protected/high-risk areas can affect users, legal obligations, privacy, safety, financial-equivalent mechanics, or app authority. These include token, NFT, wallet, payment, betting, reward authority, mission completion authority, health, child, location, privacy, legal, compliance, camera, biometric, Unity, PR #13, runtime product code, Firebase Functions, Firestore rules, packages, GitHub workflows, and deployment behavior.

Even when a protected topic appears inside an existing agent's domain, future agents must stop for human review before changing scope or authority. Report-only documentation may describe the risk, but it must not activate product behavior, approve PRs, merge, repair, deploy, change protected logic, or create new execution authority.

## Validator and report-only output

Run:

```bash
node scripts/wellfit-dev-agent/src/agent-extension-policy-check.mjs
```

The validator parses `project-register/agent-extension-policy.json`, confirms the required rule sections and examples, checks that Work Map and TODO Index reference the policy/doc/script, and writes:

` scripts/wellfit-dev-agent/output/agent-extension-policy-report.md`

The expected stdout includes:

- `Mode: REPORT_ONLY`
- `Never creates agents: true`
- `Never creates agent registers: true`
- `Never approves PRs: true`
- `Never merges PRs: true`
- `Never repairs files: true`
- `Never deploys: true`
- `AGENT_EXTENSION_POLICY_READY=true|false`

## Boundaries

This policy must not:

- create agents automatically;
- create agent registers automatically;
- create workflow families automatically;
- enable auto-merge;
- enable auto-repair;
- approve, merge, close, or deploy PRs;
- modify runtime product code;
- touch Unity/PR #13 work;
- alter reward, mission authority, health, child, location, privacy, legal, compliance, token, NFT, wallet, payment, betting, or trading logic; or
- create duplicate architecture or parallel systems.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-extension-policy.json`, `project-register/agent-workflows.json`, `project-register/agent-task-queue.json`, `project-register/agent-autopilot.json`, `project-register/continuity-dependency-map.json`, `project-register/cross-reference-maintenance.json`, `project-register/task-status-policy.json`, `project-register/pr-review-policy.json`, `project-register/website-agents.json`, `project-register/website-agent-backlog.json` und `project-register/product-readiness.json`. Erweitere bestehende Agenten nur, wenn eine eindeutige Owner-Domain besteht; bei neuen Agentnamen, neuen Registern, Mehrfach-Overlap, Runtime-/Protected-Scope oder Auto-Aktionen zuerst eine menschlich zu pruefende Proposal erstellen. Der Check bleibt report-only und darf keine Agenten erstellen, keine Runtime-Dateien aendern, keine PRs approven/mergen/schliessen, keine Reparaturen ausfuehren und nicht deployen.
