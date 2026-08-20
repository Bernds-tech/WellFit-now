# WellFit-now Dependencies

Track implementation ordering, external prerequisites and cross-repository dependencies here.

## WFN-DEP-001
- From: WellFit-now technical tasks
- Requires: repository/domain boundaries to remain explicit
- Type: cross-project governance
- Status: ACTIVE
- Updated: 2026-08-20
- Rule: WellFit-now owns technical product implementation including web/backend/auth/data/APIs/server authority and general technical application/mobile logic. WellFit owns graphical/UI/landing. WellFit-Buddy owns Buddy behavior/presentation/animation and Buddy-specific AR/camera interaction. Bridge work must carry a cross-project ID.

## WFN-DEP-002
- From: WFN-TECH-LEGACY-001
- Requires: exact legacy writer/reader inventory and current server-authoritative replacement paths
- Type: technical migration
- Status: BLOCKED
- Updated: 2026-08-20
- Rule: do not remove compatibility writes until every consumer is mapped and replacement + negative/rules regression evidence is green.

## WFN-DEP-003
- From: WFN-AUTH-CONSENT-001 / WFN-PRIVACY-001
- Requires: current canonical privacy/product requirements and existing session/access gates
- Type: security/privacy
- Status: ACTIVE
- Updated: 2026-08-20
- Rule: consent/account-lifecycle changes must preserve fail-closed access, tenant/user isolation and auditable destructive paths.

## WFN-DEP-004
- From: WFN-XREPO-001
- Requires: WellFit graphical baseline, WellFit-Buddy Buddy-domain migration/device evidence, V9 contracts and migration ledger
- Type: cross-repository convergence
- Status: BLOCKED
- Updated: 2026-08-20
- Rule: no physical code migration or authority switch until destination evidence and rollback are defined; general technical mobile logic remains WellFit-now.

## WFN-DEP-005
- From: future economy terminology migration
- Requires: explicit owner-reviewed WFXP -> canonical WFP/XP semantic/data-model decision
- Type: canonical product/economy
- Status: BLOCKED
- Updated: 2026-08-20
- Rule: never silently equate, rename or convert WFXP, WFP and XP; no WFT/token activation is implied.

States: `ACTIVE`, `SATISFIED`, `BLOCKED`, `SUPERSEDED`.
