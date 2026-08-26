# Started Work Register

Canonical register for work that has started but is not yet fully completed.

## Rules
- Add an entry as soon as substantive work begins.
- Every active `IN_PROGRESS`, `PARTIAL`, `BLOCKED`, `IMPLEMENTED_NOT_VERIFIED` or `RECONCILIATION_REQUIRED` task must appear here until closed or superseded.
- Assign `Risk: R1|R2|R3|R4` before implementation continues.
- Never delete history; close with status, date, result, evidence and next step.
- Cross-link Task ID, Change Request, PR/branch, dependencies, work lock and execution receipt.

## Active work

## WFN-AVATAR-ATTN-001
- Started: 2026-08-26
- Updated: 2026-08-26
- Status: IMPLEMENTED_NOT_VERIFIED
- Risk: R2
- Scope: web-only avatar/mascot pointer-attention behavior across existing Buddy/Rudi/avatar image surfaces.
- Branch/PR: `codex/avatar-attention-20260826` / PR #387.
- Work lock: `LOCK-WFN-AVATAR-ATTN-001`.
- Dependencies: graphical authority remains WellFit; current physical web UI remains in WellFit-now pending WF-MIG-001 convergence.
- Completed so far: global client attention component created and mounted in the root layout; existing qualifying avatar images are discovered dynamically; fine-pointer movement, interactive-target prioritization, click pulse, keyboard focus, reduced-motion and coarse-pointer safeguards are implemented. PR #387 exact code revision `16a779992250879380a17deb8c040a9a628acbae` passed lint, TypeScript, Functions validation, runtime/database/release-package checks, mission-lifecycle boundary checks, repository product-boundary checks and the full Next.js Build workflow. Project Memory Guard/Quality/Status and Database Package Tests are green.
- Still open: Container Build for the exact implementation revision is still running, browser visual countercheck is unavailable on this branch, separate Sites-v71 synchronization remains open, and final visual acceptance is not claimed.
- Evidence so far: PR #387; code commits `15347fa7e451976afe8f59400ac9978394608046`, `5c88cb9f9f8421ed6fa7ed2647ea4edd46329855`; Build run #1188 success; Database Package Tests #165 success; Project Memory Guard/Quality/Status success.
- Exact next step: complete/countercheck the remaining Container Build and final PR diff; then release the implementation lock if no regression is found. Do not claim the separate Sites-v71 deployment is updated until that checkout is explicitly modified/deployed.
- Owner action needed: none for implementation; visual acceptance remains owner-facing after runnable preview evidence.

## WFN-TECH-LEGACY-001
- Started: before 2026-08-20
- Updated: 2026-08-20
- Status: PARTIAL
- Risk: R3
- Scope: inventory and migrate remaining legacy `users/{uid}` economy/Buddy writers and client compatibility fields to server-authoritative paths.
- Branch/PR: no implementation branch active; reconciliation only on `automation/reconcile-20260820`.
- Work lock: acquire before runtime/rules mutation.
- Dependencies: current server-authoritative mission/economy/Buddy flows; exact writer/reader inventory; Firestore/rules regression suite.
- Assumptions: exact remaining writer set is not yet reverified; record as NEEDS_VERIFICATION.
- Completed so far: server-authoritative mission completion, ledger/wallet and Buddy action foundations are present and repository-verified.
- Still open: exact legacy writer/read inventory, staged migration, compatibility-field removal, negative/rules regression evidence.
- Evidence so far: current `FINISHLINE_STATE.json`, main `bf1559b0073b511bf15de39a57df5e548e6dd3ad`.
- Exact next step: read-only code inventory of every remaining legacy field consumer before any mutation.
- Owner action needed: only if migration changes canonical WFP/WFXP/XP semantics.

## WFN-AUTH-CONSENT-001
- Started: before 2026-08-20
- Updated: 2026-08-20
- Status: PARTIAL
- Risk: R3
- Scope: close auth/consent after Closed-Beta session hardening.
- Branch/PR: no implementation branch active.
- Work lock: acquire before auth/consent mutation.
- Dependencies: canonical privacy/product requirements; existing PR #369-#371 access gates.
- Assumptions: current consent/health-adjacent fields and withdrawal flow require exact code revalidation before changes.
- Completed so far: age >=16, email verification, onboarding/status gating, server sessions, revocation/device sessions.
- Still open: informed/separate health-adjacent consent and withdrawal acceptance.
- Evidence so far: `FINISHLINE_STATE.json`, PR #369-#371.
- Exact next step: map registration/consent state and negative paths without weakening existing gates.
- Owner action needed: only for product/legal consent wording decisions.

## WFN-PRIVACY-001
- Started: before 2026-08-20
- Updated: 2026-08-20
- Status: PARTIAL
- Risk: R3
- Scope: account export/deletion/anonymization/withdrawal and complete family/child lifecycle acceptance.
- Branch/PR: no implementation branch active.
- Work lock: acquire before state-changing lifecycle work.
- Dependencies: data ownership map, retention/audit requirements, auth/session revocation.
- Assumptions: no completion claim until destructive and negative-path acceptance exists.
- Completed so far: privacy-conscious device-session display and session revocation.
- Still open: export, deletion/anonymization, withdrawal, parent/child lifecycle.
- Evidence so far: `FINISHLINE_STATE.json` and current session code.
- Exact next step: produce data/lifecycle inventory and acceptance matrix before mutation.
- Owner action needed: external/legal decisions where applicable.

## WFN-XREPO-001
- Started: 2026-08-19
- Updated: 2026-08-20
- Status: RECONCILIATION_REQUIRED
- Risk: R3
- Scope: reconcile graphical and Buddy ownership drift while retaining WellFit-now as technical authority.
- Branch/PR: matching memory reconciliation branches across WellFit/WellFit-now/WellFit-Buddy.
- Work lock: no code-migration lock until a specific `WF-MIG-*` task is approved.
- Dependencies: V9 contracts/dependencies, graphical baseline selection, Buddy device/migration evidence.
- Assumptions: general technical mobile logic remains in WellFit-now unless explicitly changed by owner.
- Completed so far: cross-repo V9 master and real physical ownership state documented.
- Still open: local role correction, graphical baseline, Buddy source migration decision/device acceptance, exact cross-repo E2E.
- Evidence so far: current main trees and V9 master.
- Exact next step: finish memory reconciliation; do not physically migrate code in this task.
- Owner action needed: only for later migration/acceptance decisions.

## Closed work

## WFN-MEM-005
- Started: 2026-08-19
- Closed: 2026-08-19
- Status: ACCEPTED
- Risk: R3
- Scope: V2-V5 Project Memory governance.
- Result: merged via PR #375 and retained in later memory versions.
- Evidence: merge `ec831cda0b6775783a30a9c2d6b78151cd2366ea`; later V9/current-main governance.
