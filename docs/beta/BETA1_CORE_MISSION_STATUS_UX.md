# WellFit Beta-1 Core Mission Status UX

Status: implemented on the `runtime/core-mission-quality` delivery branch.

## Purpose

Tages- und Wochenmissionen use the same user-facing lifecycle without creating a second mission engine:

1. **Start** – the server creates or reuses the authoritative mission attempt.
2. **Bestätigung** – the allowed evidence/confirmation is submitted to the server.
3. **Review** – the server-side review decides whether the confirmation is approved, rejected or needs more information.
4. **WFXP** – only a separately authorized completion writes internal WFXP to the existing ledger.

The browser is a control surface and projection only. It does not authorize mission completion, XP, WFXP, levels, streaks, Buddy values or rewards.

## Canonical presentation source

The shared state resolver is:

```text
lib/beta1/missionStatusPresentation.mjs
```

The shared UI is:

```text
components/mission/MissionLifecyclePanel.tsx
```

Both the daily and weekly mission interfaces use this source. This prevents terminology and action labels from drifting between mission types.

## User-facing states

| State | Meaning | Primary action |
| --- | --- | --- |
| Login required | Local selection may be visible, but no server authority is available | disabled |
| Loading | The authoritative period and attempts are being loaded | disabled |
| Server unavailable | Local values may be stale and cannot authorize rewards | refresh server status |
| Ready | No active attempt exists for the selected mission and period | start and confirm |
| Attempt open | An authoritative attempt exists but no accepted confirmation is projected | submit confirmation |
| Review pending | Confirmation is stored and waiting for review | check review status |
| Review approved | Review passed, but completion and WFXP have not yet been written | complete approval |
| Rejected | The same attempt remains open for a new confirmation | submit a new confirmation |
| More information required | The same attempt remains open for an additional confirmation | supplement confirmation |
| Completed | Completion and internal WFXP ledger write already exist | disabled |
| Processing | An action is in flight and must not be duplicated | disabled |

## Recovery and idempotency communication

Whenever an attempt already exists, the UI explicitly states that the existing server-side process is resumed. It does not tell the user to create a new mission.

This reflects the existing runtime boundaries:

- repeat starts reuse the valid daily/weekly attempt where allowed;
- pending evidence can be returned idempotently;
- an approved completion can be read again without a second ledger write;
- period-specific idempotency keys prevent duplicate WFXP grants.

The presentation layer does not replace these server checks. It only makes them understandable.

## User-local calendar periods

The UI no longer treats one city as calendar authority. It displays:

- the server-authoritative IANA time zone;
- the current user-local calendar day or calendar week;
- a warning if a rapid time-zone change was deferred by the anti-abuse policy;
- the next time at which the requested time-zone change may be accepted.

A device time zone is labeled as preview-only until the server projection is available.

## Offline and unavailable behavior

When the server projection cannot be loaded:

- local favorites or slot selections may remain visible;
- mission action buttons are blocked;
- the UI states that local data has no completion or reward authority;
- a separate **Serverstatus aktualisieren** action is available;
- no optimistic WFXP, level, streak or completion state is created.

## WFXP boundary

In Beta-1, WFXP are described consistently as internal, non-transferable progress points:

- no monetary value;
- no token authorization;
- no transfer;
- no payout or cash-out;
- no blockchain, NFT or marketplace activation through this UX work.

## Regression checks

The Build workflow runs:

```bash
npm run mission:quality-check
```

This executes:

- deterministic state-resolution unit tests;
- the canonical lifecycle-order check;
- blocked legacy regional wording checks for daily and weekly mission UI;
- required server-authority and recovery language checks.

The normal Next.js build, full Beta-1 emulator suite, database package tests and standalone container health test remain required before merge.
