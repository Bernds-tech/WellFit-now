# WellFit Agent and AI Runtime Audit — 2026-07-29

Status: current architecture and risk reference
Scope: repository agents, Admin/Agent Center, GitHub runner, Buddy AI and activation gates

## Executive finding

WellFit does not have one homogeneous “agent system”. It has four different layers that were previously described inconsistently:

| Layer | Current evidence | Authority |
|---|---|---|
| Agent registers/catalogs | machine-readable plans and governance | no runtime authority |
| Local validator/report scripts | executable checks and generated reports | repository analysis only |
| Admin/Agent Center Functions | proposal, approval, worker and automation callables in code | server authority possible if deployed/configured |
| GitHub runner Functions | real branch, file, PR, check and merge code exists | external write authority possible if deployed/configured |
| Buddy Rules provider | live on staging | response guidance only |
| Buddy model provider | code exists; live disabled/unconfigured | no live model authority |

The safe default is not “everything is read-only”. The safe default is: capabilities in code are treated as security-sensitive, while operational activation remains unproven and must stay disabled.

## Repository evidence

### Report-only and planning agents

The catalogs, policies and many scripts under `project-register/` and `scripts/wellfit-dev-agent/` describe or validate:

- roadmap and TODO coverage,
- code/route inventories,
- product readiness,
- mission/economy boundaries,
- agent proposals and approvals,
- auto-merge/auto-repair eligibility,
- motivation, retention, difficulty and learning concepts.

Their reports do not make product, reward, merge or deployment decisions. A successful report is evidence about its declared checks only.

### Admin/Agent Center

`functions/lib/agentAdminRolesAudit.js` contains callable flows for proposals, approvals, worker queues, automation decisions and runner jobs. The admin UI also exposes controls related to these flows.

This is materially newer than documents that call the Agent Center a static read-only page. Those documents/register fields must not be used as proof that no external write path exists.

### GitHub runner

`functions/lib/agentGithubRunner.js` and its callers implement:

- repository configuration and authentication,
- branch creation,
- committing files through the GitHub API,
- pull-request creation,
- check/status inspection,
- pull-request merge.

The code includes approval and check gates, but gates in source code are not a substitute for:

- verifying the deployed Functions version,
- verifying server-side automation control,
- inspecting GitHub App/token permissions,
- proving protected-branch enforcement,
- proving audit logging and replay protection,
- testing denial paths in a non-production repository.

### Contradictory metadata

Some register fields still say `real_github_api_not_yet_implemented` or `real_github_api: not_implemented`. These statements are stale relative to the implementation files. They may still describe an unconfigured deployment, but they cannot accurately describe repository capability.

## Required containment before runner activation

1. Keep `automationEnabled=false` and runtime authority ungranted.
2. Inventory the exact deployed Firebase Functions and their source commit.
3. Inspect GitHub App/token permissions; use least privilege and repository scoping.
4. Require authenticated owner/admin roles and App Check where supported.
5. Bind approvals to immutable proposal, diff/base SHA, branch and required-check snapshots.
6. Prevent self-approval and require a second human decision for production.
7. Protect `main`, Canonical Truth, legal, Rules, Functions, secrets, deployment and Unity paths.
8. Add idempotency, replay protection, rate limits, maximum changed-file/byte limits and kill switch.
9. Run denial/abuse tests in a disposable repository.
10. Record every branch, commit, PR, approval, merge and failure with actor and immutable evidence.
11. Reconcile all machine-readable registers with the verified capability and deployment state.
12. Activate one reversible, low-risk operation at a time.

No auto-merge or deploy should be enabled while the repository Quality Gate is red.

## Buddy AI architecture

Current path:

```text
/mobile/ar
  -> buddyKiRemoteProvider
  -> /api/buddy-ki
  -> Rules provider (live)
  -> optional OpenAI provider (repository code, disabled live)
```

The route restricts intents, sanitizes context, forces non-authority safety flags and falls back to rules. These are useful safeguards.

Open gaps before model activation:

- no authenticated user/App Check gate on the public endpoint,
- no explicit per-user/IP rate limit or spend budget,
- no bounded request timeout, retry/backoff or circuit breaker,
- JSON mode instead of strict schema-constrained Structured Outputs,
- no moderation or age-specific output policy enforcement,
- no under-18 escalation and high-risk handling evidence,
- no versioned eval set, adversarial tests, monitoring or quality rollback criteria,
- no documented data retention and provider data-control decision for Buddy prompts.

## Buddy AI activation sequence

1. Define supported age bands and forbidden/high-risk intents.
2. Add authentication/App Check and privacy-safe rate limiting.
3. Add hard timeout, bounded retry, circuit breaker and cost ceilings.
4. Move provider response validation to a strict schema.
5. Add input/output safety classification and safe high-risk handoff.
6. Create German/English evals for minors, health language, body image, coercion, rewards, privacy and prompt injection.
7. Run shadow/offline evaluation; do not expose to users.
8. Enable only for an internal adult test cohort.
9. Monitor safety, latency, fallback rate, spend and user feedback.
10. Expand only after documented human review.

OpenAI currently recommends the Responses API for new projects, Structured Outputs over JSON mode when possible, and additional safeguards for services used by minors. Provider-specific implementation work must use current official documentation at the time of activation.

## Non-authority rules

Neither rules nor model output may authorize:

- points, XP, WFP/WFXP or inventory writes,
- mission completion or evidence approval,
- health diagnosis or treatment,
- location safety decisions,
- guardian consent,
- moderation sanctions,
- wallet/token/NFT/presale/payment/cash-out actions,
- GitHub changes, merges or deployments.

## Definition of done for this audit area

- repository capability and deployment state are recorded separately,
- stale registers are reconciled without claiming unverified activation,
- Quality Gate passes on a clean branch,
- automation remains disabled until a scoped activation review,
- Buddy model provider remains disabled until all prerequisites have test evidence,
- every external authority has a kill switch, least privilege and audit trail.

## KI-Fortsetzungs-Prompt

Before changing an agent, Admin Center, GitHub runner or Buddy AI path, read this audit, the current runtime state and protected Beta-1 truth. Reverify both code capability and deployed configuration. Do not call code presence “live”, and do not call inactive configuration “safe” without denial-path evidence. Keep runner automation and the Buddy model provider disabled unless the entire activation sequence is approved and evidenced.
