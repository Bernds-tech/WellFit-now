# WellFit Agent Architect & Proposal Agent

Status: active / report-only  
Updated: 2026-05-16  
Primary policy: `project-register/agent-architect-policy.json`  
Proposal register: `project-register/agent-build-proposals.json`

## Why this agent exists

The Agent Architect & Proposal Agent exists to turn the already approved future-agent backlog into safe, one-agent-at-a-time implementation proposals. It is a planning and prompt-generation layer, not an implementation runner. Its first version reads existing governance sources, selects the next eligible future agent, explains why that agent is next, counts connected agents and registers, classifies risk from existing metadata, and writes a safe Codex build-prompt draft for human review.

This keeps WellFit from drifting into duplicate agent architecture or uncontrolled automation. The project already has an Agent Catalog, an Approved Agent Build Backlog, an Agent Extension Policy, a Continuity Dependency Sentinel, Product Readiness, Risk Classifier, task queue, workflow, autopilot, task-status, and PR-review governance. The Agent Architect coordinates those sources into a proposal without replacing them.

## How it differs from the Agent Catalog

The Agent Catalog (`project-register/agent-catalog.json`) is the inventory of existing WellFit agents/frameworks. It records current owners, primary registers, docs, validators, quality-gate integration, extension boundaries, and protected boundaries.

The Agent Architect does not redefine that inventory. It reads the catalog to understand existing agent owners and connected agents, then uses that context when proposing the next approved future agent. If an existing agent can be safely extended, the Agent Architect should not create a parallel system.

## How it differs from the Agent Extension Policy

The Agent Extension Policy (`project-register/agent-extension-policy.json`) decides whether a change belongs inside an existing agent or requires a new-agent proposal. It defines proposal triggers, overlap detection, connected-agent/register impact rules, forbidden auto-actions, and human-review requirements.

The Agent Architect uses that policy after a future agent has already been approved for planning/build sequencing in `project-register/approved-agent-build-backlog.json`. It does not grant approval by itself. It only drafts the next safe build prompt and confirms that human review is still required.

## How it chooses the next approved agent

The generator script (`scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs`) runs in report-only mode and reads:

- `project-register/approved-agent-build-backlog.json`
- `project-register/agent-catalog.json`
- `project-register/agent-extension-policy.json`
- `project-register/continuity-dependency-map.json`
- `project-register/agent-architect-policy.json`

Selection rules:

1. Consider only backlog entries with `status` equal to `approved_for_build` or `approved_for_planning`.
2. Skip `built`, `blocked`, `rejected`, `duplicate`, and `superseded` entries.
3. Sort by `suggestedBuildOrder`, then priority, then id.
4. Select exactly one eligible entry.
5. If no entry is eligible, report `NEXT_AGENT_BUILD_PROPOSAL_READY=false` and do not create a prompt.

After this task, the Agent Architect itself is recorded as an active catalog/proposal entry and the original future backlog placeholder is marked `superseded`, so the next generated proposal is expected to point at the next eligible approved future agent rather than rebuilding the Agent Architect.

## How it generates a safe build prompt

The generator writes two report-only outputs under the ignored agent output directory:

- `scripts/wellfit-dev-agent/output/next-agent-build-prompt.md`
- `scripts/wellfit-dev-agent/output/next-agent-build-proposal.md`

The prompt includes:

- first-read files
- selected source backlog id
- selected agent name
- reason and expected benefit
- risk level
- connected agents and connected registers
- connected counts
- required docs/registers/validation scripts
- allowed files
- forbidden files
- required checks
- report-only first-version boundaries
- explicit no-runtime/no-protected/no-auto-build/no-auto-merge/no-auto-repair/no-deploy instructions
- a human-review gate before execution

The generated prompt is a draft for a future Codex task. It is not executed by the generator.

## Why it only proposes one agent at a time

The approved backlog intentionally sequences future agents with `suggestedBuildOrder`. Building several future agents at once would increase overlap risk, blur ownership boundaries, and make it easier to accidentally introduce duplicate architecture. One-agent proposals keep PRs small, reviewable, and tied to one source backlog entry.

## Why human review is still required

Every generated proposal keeps `humanReviewRequired=true`. Even when a backlog entry is human-approved for planning or build sequencing, the actual implementation prompt still needs human review because the selected agent may touch governance boundaries, protected topics, or quality-gate behavior. The Agent Architect cannot approve PRs, merge PRs, close PRs, enable auto-merge, enable auto-repair, repair files, deploy, or mark future agents built without implementation evidence.

## How generated prompts become future Codex tasks

A human reviewer can inspect `scripts/wellfit-dev-agent/output/next-agent-build-prompt.md`. If accepted, that prompt can be copied into a future Codex task to build exactly the selected agent. The future task must still follow `AGENTS.md`, the Work Map, TODO Index, Current Project State, and the selected backlog entry's allowed/forbidden files.

## How built agents update the catalog/backlog/proposals afterward

After a future agent is actually built in its own scoped task, the implementing PR should update only the relevant governance files:

1. Add or update the built agent in `project-register/agent-catalog.json`.
2. Mark the source entry in `project-register/approved-agent-build-backlog.json` as `built` only when implementation evidence and checks exist.
3. Add or update the matching entry in `project-register/agent-build-proposals.json`.
4. Keep Work Map and TODO Index references synchronized.
5. Keep validation scripts report-only unless a later human-approved task grants narrower execution authority.
6. Preserve all protected-area stops and human-review requirements.

## Validation

`agent-architect-proposal-check.mjs` validates the policy/register/doc/script references, proposal statuses, proposal schema, required proposal fields, connected counts, human-review flags, and Work Map/TODO Index links. It prints `AGENT_ARCHITECT_PROPOSAL_READY=true/false` and never builds agents or modifies runtime files.

`generate-next-agent-build-proposal.mjs` prints `NEXT_AGENT_BUILD_PROPOSAL_READY=true/false`, writes the generated prompt/report outputs, and never creates agents, approves, merges, repairs, enables auto-merge/auto-repair, or deploys.

## KI-Fortsetzungs-Prompt

Read `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-extension-policy.json`, `project-register/continuity-dependency-map.json`, `project-register/agent-architect-policy.json`, and `project-register/agent-build-proposals.json` before changing Agent Architect governance. Keep the Agent Architect report-only, propose exactly one next approved agent at a time, require human review before any generated prompt becomes a Codex task, do not build future agents automatically, do not touch runtime/protected files, and run `node scripts/wellfit-dev-agent/src/agent-architect-proposal-check.mjs`, `node scripts/wellfit-dev-agent/src/generate-next-agent-build-proposal.mjs`, and `npm run agent:quality-gate` before PR handoff.
