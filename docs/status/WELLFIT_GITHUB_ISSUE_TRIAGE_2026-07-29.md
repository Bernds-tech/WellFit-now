# WellFit GitHub Issue Triage — 2026-07-29

Status: reviewed against current `main`, open pull requests, current runtime and Beta-1 boundaries
Open issues reviewed: 16
Open pull requests reviewed: #263 and protected Unity PR #13

This file defines the recommended disposition. It does not silently delete product ideas or claim unverified completion.

## Recommended issue dispositions

| Issue | Current classification | Recommended action | Evidence / replacement scope |
|---:|---|---|---|
| #22 PR #20 synchronisieren | obsolete | close as superseded | Governance layer and later Quality-Gate work are long merged; PR #20 is no longer the active delivery path. |
| #21 Stufe-4-Folgeblock | implemented with regression | keep until current gate is green, then close | Validators, Mojibake, route/API checks and Quality Gate exist. Current failures are tracked on the execution board. |
| #19 Agenten-Gedaechtnis/Self-Check/Crawl | implemented | close with evidence | `agents/`, `project-register/`, inventories, Quality Gate and route/site audits exist. |
| #18 autonomer Verbesserungs-Agent | partially implemented, high risk | keep and rewrite | Report/governance layers and real runner code exist; deployment, credentials, least privilege and denial-path evidence are unresolved. Use the Agent/AI audit as scope. |
| #16 Projekt-Arbeitsbuch | implemented | close with current pointers | `todolist/`, current board, Work Map, TODO Index, Done Log and machine-readable registers provide the workbook. |
| #11 Missionslogik-Paralleltrack | largely implemented/superseded | close after mapping remaining gaps | Mission server-authority paths, catalogs, history and UI are implemented. New work must use specific remaining runtime/evidence tasks, not the 2026-04 placeholder baseline. |
| #10 kontextuelle AR-Raetselrallye | roadmap/partial architecture | keep, narrow | Keep as later AR/AI product epic; require consent, data minimization, safe locations, server completion and no raw camera/location retention by default. |
| #9 Desktop/Web Buddy | roadmap | keep | No duplicate Buddy/AI authority. Build later as UX overlay on existing Buddy provider and app router. |
| #8 AR-Buddy-Bewegung | protected Unity track | keep | Requires real Unity/device evidence; PR #13 remains protected. |
| #7 Skalierungsarchitektur | umbrella, partly implemented | keep and update | Server-authority, Firebase and fallback foundations exist; remaining scope is observability, cost, rate, data, device and load evidence. |
| #6 Mobile-AR-Handytest | open evidence task | keep and update | Replace old generic/PM2 assumptions with a device matrix and current Docker staging URL. |
| #5 echten Buddy-Modellprovider aktivieren | blocked on safety/readiness | keep and rewrite | Rules mode is live; model activation needs auth/App Check, limits, timeout/retry, strict schema, moderation, minor safeguards, evals and monitoring. |
| #4 erster Unity Android ARCore Build | protected device task | keep | Requires Unity tooling and a real ARCore device; no repository-only completion claim. |
| #3 Einstellungen modularisieren | needs current code re-audit | keep, narrow to measured debt | Do not follow the April file list blindly; inventory current page/hooks/components and refactor behavior-preserving only if complexity evidence supports it. |
| #2 AR-Schatzkisten | concept-only | keep in later roadmap | Do not create proposed parallel collections/routes before current Adventure/mission/inventory owners are mapped. |
| #1 Missionsseiten kompakt angleichen | stale mixed issue | close or rewrite after visual audit | April size/localStorage assumptions are stale. Reopen only measured route-specific UI or persistence gaps. |

## Pull-request disposition

### PR #263 — Add owner claim setup helper

- Open and not currently mergeable.
- Review unresolved security/operations feedback.
- Compare with current owner/admin claim and Firebase release paths.
- Close if it duplicates newer claim tooling; otherwise replace with a minimal, reviewed and tested branch.
- Never merge merely to clear backlog.

### PR #13 — Add local Unity AR Buddy companion project

- Open, large and not currently mergeable.
- Protected by repository policy.
- Do not rebase, rewrite, close or merge incidentally.
- Handle through a dedicated Unity inventory/build/security/device review with owner approval.

## Issue update template

When updating or closing an issue, include:

1. original scope,
2. current implementation evidence with file/PR references,
3. what is genuinely complete,
4. what moved to a current source or replacement task,
5. what remains unverified,
6. explicit Beta-/Safety-/Unity/Legal boundaries,
7. current validation result.

## No-duplicate rule

- Do not create replacement issues until this table and current code have been searched.
- Use one issue for one measurable outcome.
- Separate product implementation from deployment/configuration/live evidence.
- Separate legal, security, Firebase, Agent/GitHub runner, Buddy AI and Unity work into reviewable scopes.
- Close obsolete coordinating issues only after linking the current board or replacement task.

## KI-Fortsetzungs-Prompt

Before creating or acting on a WellFit issue, read the current execution board, runtime state and this triage. Recheck the issue against current code and merged PRs. Update or close stale issues with evidence instead of repeating April/May work. Keep PR #13 protected, treat PR #263 as a security-sensitive review, and do not activate Buddy AI, agent automation or WFT/blockchain work through a stale issue.
