# Dashboard Mission Server Review Flow

Status: implemented on branch `runtime/dashboard-beta1-mission-review-flow`; merge requires a green GitHub Build.

## Replaced behavior

The dashboard previously treated mission start as an immediate local completion and wrote `users.points`, `users.xp`, `users.level`, `users.stepsToday`, and avatar state directly from the browser.

## New behavior

- Dashboard selects an existing published Beta-1 mission from the canonical `missions` collection.
- The visible personal mission remains only a disabled suggestion when no published server mission exists.
- Mission start calls the existing `startMissionAttempt` callable.
- A minimal `dashboard-user-confirmation` evidence record is submitted through `submitMissionEvidence`.
- Evidence remains `pending-server-review` and grants neither XP nor mission completion.
- The dashboard no longer writes points, XP, level, steps, energy, hunger, or mission completion during mission start.
- WFXP can only be produced later by the server-authoritative completion path after approved evidence.

## Deliberately unchanged in this block

Buddy feeding still uses the documented temporary client projection bridge. It is the next economy migration target and must move to the existing Beta-1 WFXP shop/inventory path rather than creating a new sink system.

## Required check

- GitHub `Build` workflow, including repository product-boundary check and Next.js build.
