# WellFit Website Agent Backlog and Findings Register

Status: active / report-only governance  
Register: `project-register/website-agent-backlog.json`  
Validator: `scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs`  
Updated: 2026-05-16

## Why this backlog exists

The Website Agent Framework defines website-focused agents and route readiness boundaries, but future website agents also need a durable, machine-readable place to record findings. The backlog exists so Website Readiness Baseline Audits and focused website agents can preserve:

- open findings and route issues,
- conversion gaps and content gaps,
- SEO and discovery planning gaps,
- trust/compliance review items,
- mobile/PWA device evidence gaps,
- blocked items,
- follow-ups, and
- the next safe task for a future agent.

This prevents context loss when an audit finds something that is not safe to auto-fix. Findings must be stored as structured entries instead of only prose in PR comments or markdown summaries.

## How website agents record findings

Website agents should append or update entries in `project-register/website-agent-backlog.json` with the required schema fields defined by `backlogEntrySchema`:

- stable `id`, `title`, `status`, `severity`, and `findingType`,
- `route` from `project-register/website-readiness.json` or the literal `global`,
- `routeGroup`, `sourceAgent`, source evidence, and related registers,
- concrete `finding`, `evidence`, `recommendedAction`, and `nextSafeTask`,
- `allowedFiles`, `forbiddenFiles`, and `requiredChecks`,
- `humanReviewRequired` and `protectedTopics`, and
- created/updated dates.

Agents must use existing route, readiness, product-readiness, task-queue, workflow, and cross-reference registers. They must not create a parallel website architecture, route registry, design system, analytics pipeline, legal-review system, or runtime repair loop.

## Mapping findings to `website-readiness.json`

Every route-specific backlog entry must map to an existing route in `project-register/website-readiness.json`. Cross-route findings use `route: "global"` and `routeGroup: "global"`.

When a finding affects route readiness:

1. Record the concrete issue in the backlog first.
2. Keep `website-readiness.json` as the route/readiness summary, not the detailed finding log.
3. Do not advance `conversion_ready`, `investor_ready`, or `beta_ready` while related trust/compliance or protected-topic findings remain `review_required`, `human_review_required`, `blocked`, or `device_test_required`.
4. Only update readiness status after evidence exists and required review/checks pass.

## Turning findings into future `agent-task-queue` tasks

A backlog entry can become a future task only when the next step is clear, safe, and not already represented by an existing task. Future agents should:

1. Check `project-register/agent-task-queue.json` for an existing matching task.
2. Reuse or update that task instead of creating a duplicate.
3. Keep task scope aligned with the backlog entry's `allowedFiles`, `forbiddenFiles`, stop conditions, and protected-topic rules.
4. Preserve the backlog entry as evidence, then mark it `in_progress`, `done`, `duplicate`, `superseded`, or `stale` when appropriate.

The first recommended next task from this backlog is the **Website Readiness Baseline Audit**.

## Why `review_required` findings are preserved instead of auto-fixed

Legal, privacy, health, child, token, NFT, wallet, payment, betting, reward, investor, analytics, public-claim, consent, camera, biometric, location, mission-completion-authority, and anti-cheat findings can affect compliance, safety, public claims, or product authority. These findings must remain explicit review items until a human decision is available.

The backlog therefore records the issue, evidence, next safe task, and required review state. It does **not** authorize automatic edits to legal text, runtime pages, consent flows, analytics, rewards, payments, health data flows, child-safety behavior, token/NFT/wallet mechanics, or mission/reward authority.

## Mobile and device evidence handling

Mobile/PWA findings can use `device_test_required` when evidence is missing or incomplete. Entries should record:

- route(s) tested or still missing,
- device model, OS, browser, and viewport when known,
- permission/camera/PWA/fallback observations,
- route-specific pass/fail/blocked evidence,
- privacy or protected-topic concerns, and
- the next safe manual evidence task.

Missing device evidence is not a runtime failure. It is a preserved stop condition that blocks readiness advancement until evidence exists.

## Trust & Compliance blocks readiness advancement

Trust & Compliance findings block `conversion_ready`, `investor_ready`, and `beta_ready` advancement when they involve protected topics or public claims. Website agents may document risk and propose review tasks, but they must not auto-rewrite public claims or legal/compliance wording.

## Runtime changes are not enabled by this backlog

This backlog is registry-only and report-only. It never enables:

- runtime website/app/mobile/legal changes,
- edits to `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, package files, Firebase config, GitHub workflow files, or Unity files,
- auto-merge,
- auto-repair,
- PR approval,
- deployment, or
- protected-topic logic changes.

The validator only reads registers/docs and writes its report to `scripts/wellfit-dev-agent/output/website-agent-backlog-report.md` when run.

## KI-Fortsetzungs-Prompt

Naechste KI/Codex-Session: Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/website-agents.json`, `project-register/website-readiness.json`, `project-register/website-agent-backlog.json` und dieses Dokument. Fuehre `node scripts/wellfit-dev-agent/src/website-agent-backlog-check.mjs` und `node scripts/wellfit-dev-agent/src/website-agent-framework-check.mjs` aus, bevor Website-Findings oder Website-Readiness-Aenderungen geplant werden. Nutze den Backlog fuer maschinenlesbare Findings, halte protected Topics `review_required`, erstelle keine parallele Website-Architektur, und aendere keine Runtime-Seiten, Legal-Texte, Tracking-, Reward-, Payment-, Token-, Health-, Child-, Camera-, Location-, Consent-, Unity-, Auto-Merge-, Auto-Repair-, Approval- oder Deployment-Logik.
