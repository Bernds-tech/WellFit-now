# WellFit Beta Operations Cockpit

Updated: 2026-07-25  
Status: implemented in code; no production deployment performed

## Purpose

The cockpit gives a closed-beta operator one read-only overview of product activation, retention, mission flow, Evidence review, internal WFXP grants, operational failures and anti-abuse signals.

It deliberately does not create a second analytics platform. The server aggregates existing operational records that WellFit already needs for onboarding, mission authority, Evidence review, Buddy care, the internal WFXP ledger, safety and account lifecycle.

## Access and authority

```text
Admin browser
→ verified Firebase admin claim
→ getBetaOperationsSnapshot callable
→ bounded Admin SDK reads
→ aggregate-only response
```

The callable requires the existing Firebase `admin=true` claim. It performs no Firestore write, reward grant, mission completion, account action, deployment or token operation.

## Privacy boundary

The response does not contain:

- Firebase user IDs;
- email addresses;
- names;
- age bands or other profile attributes;
- Health data;
- coordinates or location hashes;
- Evidence metadata or media references;
- device IDs or app-session IDs;
- free text;
- individual mission titles or user histories.

User IDs are transformed only in server memory into one-way SHA-256 comparison keys so distinct-account and cohort counts can be calculated. Those hashes are not persisted and are not returned to the client.

No new session, clickstream or behavioral tracking collection is introduced. Engagement is inferred from existing mission attempts, Evidence, completions and Buddy-care actions.

Retention rates are suppressed when fewer than five eligible accounts are in the cohort.

## Time windows

The admin can select 7, 14 or 30 days. All aggregate windows and daily trend rows use UTC. This does not replace the user-local calendar authority used for daily and weekly missions.

## KPI definitions

### Initialized accounts

Count of `userOnboardingRecords` with `status=completed`.

### New accounts

Completed onboarding records whose completion timestamp falls inside the selected UTC window.

### Engaged accounts

Distinct accounts with at least one of these operational events in the selected window:

- mission attempt;
- mission Evidence submission;
- mission completion;
- completed Buddy-care action.

### Activation within 24 hours

A new account is activated when its first mission attempt begins no later than 24 hours after completed onboarding.

This is intentionally a product activation metric, not a login metric.

### D1 and D7 retention

For accounts completed inside the selected cohort window and old enough to mature:

- D1: at least one defined product engagement on the next UTC calendar day;
- D7: at least one defined product engagement on the seventh UTC calendar day.

If the eligible cohort contains fewer than five accounts, the rate and retained count are not returned.

### Evidence submission rate

Distinct attempts with at least one Evidence submission in the window divided by mission attempts started in the same window.

### Completion rate

Completed missions in the window divided by mission attempts started in the same window.

This is a window ratio, not a strict attempt cohort funnel; a completion may have started earlier. The UI labels this boundary rather than presenting it as exact causal conversion.

### Evidence review quality and speed

The cockpit shows:

- total pending Evidence;
- approved, rejected and needs-more-evidence decisions in the window;
- approval rate among reviewed Evidence;
- median and P90 time from Evidence creation to review.

### WFXP

Only positive, server-recorded `xpLedgerEvents` are summed. WFXP remains:

```text
internal
non-monetary
not blockchain-backed
not transferable
not cash-out enabled
```

### Operational failure signals

Current/selected-window counters include:

- failed user data exports;
- blocked account deletions;
- open Safety reports.

### Anti-abuse signals

Existing pattern and cooldown review records are aggregated:

- manual pattern review required;
- pattern watchlist;
- soft cooldown recommended;
- hard cooldown recommended.

The cockpit does not itself block a user or authorize/deny rewards. It reports the existing review outputs.

## Bounded scanning

Each source collection is read in document-ID pages with a hard ceiling of 12,000 documents per collection. If a collection exceeds the ceiling, the snapshot identifies the truncated collection and marks itself incomplete. The UI warns that rates may then be partial.

This bounded scanner is appropriate for the closed beta. Before larger-scale operation, the next step is a scheduled aggregate projection with explicit retention and backfill rules rather than unbounded live scans.

## UI

The cockpit is displayed first on:

```text
/admin/beta1
```

It includes:

- account and activation cards;
- D1/D7 protected retention cards;
- mission/Evidence/completion funnel cards;
- review latency;
- internal WFXP totals;
- Safety, failure and abuse indicators;
- a daily UTC trend table;
- scan completeness and privacy declarations.

## Validation

The package includes:

- pure deterministic unit tests for activation, D1/D7 retention, percentages, latency percentiles, failure/risk aggregation and cohort suppression;
- Auth/Firestore/Functions emulator coverage proving admin-only access;
- checks that the response contains no fixture user IDs, email addresses, coordinates or storage references;
- a no-write assertion for the read-only callable;
- integration into the complete Beta-1 emulator regression and production application build.
