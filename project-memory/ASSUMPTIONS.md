# Assumption Verification Register

Critical assumptions used to plan or execute work must be recorded here before they are relied upon.

Statuses: `NEEDS_VERIFICATION`, `VERIFIED`, `INVALIDATED`, `SUPERSEDED`.

## ASM-WFN-001
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task: WFN-TECH-LEGACY-001
- Risk: R3
- Assumption: the exact set of remaining legacy `users/{uid}` writers/client compatibility fields is unchanged from older runtime documentation.
- Why it matters: removing or migrating the wrong fields could break current consumers or leave client authority behind.
- Verification source/evidence: current finishline confirms a remaining migration class but this run has not completed the exact code inventory.
- Status: NEEDS_VERIFICATION
- Recheck trigger: immediately before any legacy-writer mutation.
- Action if false: update the inventory and migrate only actually present consumers; do not recreate already-removed legacy paths.

## ASM-WFN-002
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task: WFN-TECH-LEGACY-001 / economy semantics
- Risk: R3
- Assumption: runtime `WFXP` can be silently treated as canonical `WFP` or merged with `XP`.
- Why it matters: this changes spendability, progression and data semantics.
- Verification source/evidence: canonical Beta-1 truth explicitly separates spendable WFP from non-spendable XP; current finishline flags WFXP terminology migration as owner-reviewed.
- Status: INVALIDATED
- Recheck trigger: any currency/data-model rename or migration proposal.
- Action if false: require explicit owner-reviewed semantic/data migration; no silent conversion and no WFT activation.

## ASM-WFN-003
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task: WFN-XREPO-001
- Risk: R3
- Assumption: WellFit-Buddy owns all technical mobile application logic.
- Why it matters: would move general technical responsibilities out of WellFit-now and blur server/client authority.
- Verification source/evidence: current owner role split: WellFit-now technical, WellFit graphical, WellFit-Buddy Buddy.
- Status: INVALIDATED
- Recheck trigger: explicit future owner decision changing domain boundaries.
- Action if false: keep general technical app/mobile logic in WellFit-now; move only Buddy-specific behavior/presentation/AR into WellFit-Buddy.

## ASM-WFN-004
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task: all technical finishline tasks
- Risk: R3
- Assumption: green repository/build/container/package checks prove Production, real-device, legal or owner acceptance.
- Why it matters: would prematurely close finishline gates.
- Verification source/evidence: `FINISHLINE_STATE.json` and evidence model distinguish repository verification from external/Production acceptance.
- Status: INVALIDATED
- Recheck trigger: every completion/acceptance claim.
- Action if false: require target-specific evidence and staged IMPLEMENTED -> VERIFIED -> COUNTERCHECKED -> ACCEPTED path.

## ASM-WFN-005
- Date: 2026-08-20
- Updated: 2026-08-20
- Related task: stale PR cleanup
- Risk: R2
- Assumption: every old open PR must be merged because it contains historical work.
- Why it matters: stale branches can reintroduce superseded code/governance or duplicate current main.
- Verification source/evidence: current main already contains later/superseding implementations for #13/#263/#363/#365/#376; #364 remains a separate deferred decision.
- Status: INVALIDATED
- Recheck trigger: before closing or reviving any stale PR.
- Action if false: preserve unique still-needed diff in a new scoped task; otherwise close as superseded.

Do not silently delete invalid assumptions. Preserve them as `INVALIDATED` or `SUPERSEDED` so the same mistaken premise is not reused later.
