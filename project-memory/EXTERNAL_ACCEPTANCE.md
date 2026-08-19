# WellFit-now External Acceptance

Repository code cannot self-close these controls when current provider/runtime/operator evidence is required.

## EXT-RUNTIME
- Related gate: `backend_runtime`
- Status: OPEN
- Acceptance: current target/runtime is verified against the exact deployed/release commit.

## EXT-AUTH-CONSENT
- Related gate: `auth_consent`
- Status: OPEN
- Acceptance: real provider/browser behavior matches the current registration/auth/consent contract where repository tests alone are insufficient.

## EXT-PRIVACY
- Related gate: `account_privacy`
- Status: OPEN
- Acceptance: applicable account lifecycle/privacy behavior is verified against the current environment.

## EXT-PRODUCT-DECISION
- Related gate: `rewards_missions`
- Status: OPEN
- Acceptance: unresolved owner product decisions such as WFP/WFXP/XP semantics are explicitly resolved before dependent acceptance.

## EXT-CONVERGENCE-DECISION
- Related gate: `cross_repo_contract`
- Status: OPEN
- Acceptance: each concrete migration step has source, destination, scope, dependencies, evidence and rollback.

## Rules
- Code/CI alone cannot mark required external acceptance `ACCEPTED`.
- Never store secrets, tokens or private provider evidence here.
