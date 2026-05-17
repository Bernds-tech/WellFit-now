# Codex Master Prompt: WellFit Beta 1 Agent Pack + Data Model Placement

You are Codex working inside the GitHub repository `Bernds-tech/WellFit-now`.

## Primary goal

Create and correctly place the WellFit Beta-1 canonical scope, agent instructions, and data model artifacts so agents can begin coordinated backend/database/API work without creating parallel systems or violating the repo governance rules.

This is primarily a docs/register/agent-runbook task. Runtime implementation is not allowed unless this prompt explicitly names a file and a separate human approval is present. For this task, do not change runtime product code.

## Read first

Before changing anything, read these files:

1. `AGENTS.md`
2. `package.json`
3. `firebase.json`
4. `firestore.rules`
5. `functions/package.json`
6. `todolist/CURRENT_PROJECT_STATE.md`
7. `todolist/WORK_MAP.md`
8. `todolist/TODO_INDEX.md`
9. `docs/architecture/WELLFIT_APPROVED_AGENT_BUILD_RUNNER_AND_MERGE_GATE.md`
10. `project-register/agent-catalog.json` if present
11. `project-register/approved-agent-build-backlog.json` if present
12. `project-register/agent-work-log.json` if present
13. `project-register/progress-log.json` if present

## Hard product decisions for Beta 1

Use these decisions as canonical:

- Beta 1 is a closed, free test version.
- Internal points are called `WellFit-XP`.
- Suggested internal symbol: `WFXP`.
- WellFit-XP has no monetary value, no crypto value, no cashout, no exchange, no blockchain.
- Blockchain is not implemented in Beta 1.
- Later release blockchain direction is Sui, but Sui implementation starts later after the points system works.
- Premium is not active in Beta 1. Before release, all beta testing remains free. At release, there is a 3-month free phase before premium starts.
- Children aged 8-13 are allowed only as child profiles under guardian/parent accounts.
- Children do not have standalone login.
- Only family/parent accounts are included in Beta 1. No school accounts, teacher accounts, corporate accounts.
- Shop exists in Beta 1, but only with internal WellFit-XP. No real money and no sandbox IAP in the first Beta-1 build.
- Mayor system is included in Beta 1.
- There are no separate Junior Mayors.
- Mayor share/revenue share is only internal WellFit-XP. No money, no token, no cashout.
- Reality Glitch is included in Beta 1 as controlled micro-events.
- Reality Glitch starts first in Vienna and Lower Austria.
- Tester rollout: wave 1 = 25-50 testers, wave 2 = 250 testers.
- Not included in Beta 1: public token, cashout, NFT marketplace, DePIN, real-money shop, real PvP stake, school/teacher accounts, corporate accounts, single/dating overlay.

## Existing repo reality

The repo uses Next.js, Firebase, Firestore, Firebase Functions and existing agent automation. Do not introduce a parallel PostgreSQL backend for this task. The conceptual architecture may mention Node.js + PostgreSQL in older docs, but this repository baseline is Firebase/Firestore. Beta-1 data model must be expressed as Firestore collections and Firebase callable/HTTP function contracts.

## Required file placement

Create or update these canonical files:

1. `docs/beta/WELLFIT_BETA1_SCOPE.yaml`
2. `docs/beta/AGENTS_WELLFIT_BETA1.md`
3. `docs/beta/WELLFIT_BETA1_DATA_MODEL.md`
4. `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml`

If `docs/beta/` does not exist, create it.

If an `agents/` directory exists or if the project register expects file-based agent runbooks, create:

- `agents/beta1/beta1-scope-steward.md`
- `agents/beta1/beta1-data-model-agent.md`
- `agents/beta1/beta1-api-contract-agent.md`
- `agents/beta1/firestore-rules-guard-agent.md`
- `agents/beta1/guardian-child-safety-agent.md`
- `agents/beta1/wellfit-xp-economy-agent.md`
- `agents/beta1/mission-checkpoint-agent.md`
- `agents/beta1/mayor-system-agent.md`
- `agents/beta1/reality-glitch-safety-agent.md`
- `agents/beta1/shop-inventory-agent.md`
- `agents/beta1/qa-emulator-agent.md`

If there is no established file-based agent convention, create `docs/beta/WELLFIT_BETA1_AGENT_PACK.md` instead and do not invent a conflicting agent directory.

## Required `WELLFIT_BETA1_SCOPE.yaml` content

Create a clean YAML scope file with at least:

```yaml
version: 2.0
status: canonical_beta_1_scope
updated: 2026-05-17
product: WellFit
beta_1:
  definition: closed_free_test_version
  tester_rollout:
    wave_1: 25-50
    wave_2: 250
  currency:
    name: WellFit-XP
    symbol: WFXP
    type: internal_beta_points
    monetary_value: false
    crypto_value: false
    exchangeable: false
    cashout: false
    blockchain: false
  blockchain:
    beta_1: none
    release_direction: Sui
    sui_implementation: after_points_system_release_path
  accounts:
    adult_tester: true
    guardian_parent: true
    child_profiles_8_13: true
    child_standalone_login: false
    school_accounts: false
    teacher_accounts: false
    corporate_accounts: false
  child_safety:
    guardian_first_onboarding: true
    public_child_profiles: false
    open_chat: false
    live_location_visible_to_other_users: false
    real_money_rewards: false
    crypto_rewards: false
    shop_guardian_gate: true
  shop:
    included: true
    payment: WellFit-XP-only
    real_money: false
    sandbox_iap_first_build: false
    pay_to_win: false
  mayor_system:
    included: true
    junior_mayors: false
    reward_currency: WellFit-XP
    money_revenue_share: false
    crypto_revenue_share: false
    cashout: false
  reality_glitch:
    included: true
    first_regions:
      - Vienna
      - Lower Austria
    type: controlled_micro_event
    uncontrolled_mass_flashmob: false
    checkin_window_minutes: 15
    boost_duration_minutes: 10
    multiplier_cap: 10
    safe_locations_only: true
    admin_cancel_required: true
  excluded:
    - public_token
    - cashout
    - nft_marketplace
    - depin
    - real_money_shop
    - real_pvp_stakes
    - school_accounts
    - teacher_accounts
    - corporate_accounts
    - single_dating_overlay
```

## Required `AGENTS_WELLFIT_BETA1.md` content

Create a Markdown file with:

- Beta-1 canonical decisions
- clear statement that `AGENTS.md` remains the top repository instruction file
- no runtime implementation without scoped human approval
- Beta-1 agent pack overview
- safety boundaries for child/location/reward/shop/mayor/glitch
- rule: all final XP, mission completion, mayor share, shop spend and glitch boost authority stays server-side
- rule: client may preview but not final-authorize
- rule: no blockchain, no cashout, no public token in Beta 1
- file placement map
- handoff procedure for future runtime PRs

## Required `WELLFIT_BETA1_DATA_MODEL.md` content

Create a complete Markdown data model for Firestore collections and function contracts. It must cover:

### Identity / family / child safety

- `users`
- `familyAccounts`
- `childProfiles`
- `guardianChildLinks`
- `parentalConsents`

### Avatar and progression

- `avatarDefinitions`
- `userAvatars`
- `avatarXpEvents`

### Austria map / locations

- `regions`
- `missionLocations`

### Missions

- `missions`
- `missionAttempts`
- `missionEvidence`
- `missionCompletions`

### WellFit-XP economy

- `xpWallets`
- `xpLedgerEvents`
- `xpRewardPolicies`

### Shop and inventory

- `shopItems`
- `shopPurchaseIntents`
- `shopPurchaseEvents`
- `userInventory`

### Checkpoints / mayor system

- `checkpoints`
- `checkpointScores`
- `checkpointMayors`
- `mayorShareEvents`

### Reality Glitch

- `glitchEvents`
- `glitchParticipants`
- `glitchBoostWindows`
- `glitchSafetyRules`

### Safety / moderation / audit

- `safetyReports`
- `adminActions`

For each collection include:

- purpose
- key fields
- owner/participant fields
- read/write posture
- server-authority fields
- child-safety notes where relevant
- relation to existing collections, especially `ledgerEvents`, `auditEvents`, `userEconomyProjections`, `pointsSinkEvents`, `itemDefinitions`, `userInventory`, `trackingSessions`, `trackingProofEvents`, and the mission evaluation/review collections already mentioned in `firestore.rules`.

## Required `WELLFIT_BETA1_DATA_MODEL.yaml` content

Create a machine-readable YAML version of the same model. Include:

- `version`
- `status`
- `beta_1` decisions
- `principles`
- `collections`
- `api_functions`
- `required_emulator_tests`
- `repo_placement`

## Required Beta-1 API/function plan

In the data model and/or agent pack, define these proposed server functions:

### Identity and family

- `createGuardianFamilyAccount`
- `createChildProfile`
- `updateChildPermissions`
- `recordParentalConsent`
- `archiveChildProfile`

### Avatar

- `createUserAvatar`
- `equipInventoryItem`
- `getAvatarProgress`

### Missions

- `listMissions`
- `getMissionDetail`
- `startMissionAttempt`
- `submitMissionEvidence`
- `completeMissionAttempt`
- `reportMissionSafetyIssue`

### XP economy

- `getXpWallet`
- `previewXpReward`
- `grantXpServerOnly` internal only
- `spendXpForShopItem`
- `listXpLedger`

### Shop and inventory

- `listShopItems`
- `createShopPurchaseIntent`
- `completeXpShopPurchase`
- `listInventory`
- `equipInventoryItem`

### Checkpoints / mayor

- `listCheckpoints`
- `submitCheckpointScore`
- `evaluateCheckpointMayor` internal only
- `listCheckpointMayorHistory`
- `grantMayorShareXp` internal only

### Reality Glitch

- `listGlitchEvents`
- `adminScheduleGlitchEvent`
- `checkInToGlitch`
- `activateGlitchBoost` internal only
- `cancelGlitchEvent`

### Admin

- `adminCreateMission`
- `adminUpdateMission`
- `adminPublishMission`
- `adminCreateCheckpoint`
- `adminReviewSafetyReport`
- `adminAdjustXp`

## Agent pack to create or document

Define the following Beta-1 agents as docs/register agents. They are allowed to plan, validate, check and create prompts; they do not get runtime authority by default.

1. `beta1-scope-steward`
   - owns canonical Beta-1 decisions and prevents scope drift.

2. `beta1-data-model-agent`
   - owns Firestore collection design and relation mapping.

3. `beta1-api-contract-agent`
   - owns server function contract planning and request/response schemas.

4. `firestore-rules-guard-agent`
   - checks that protected collections remain server-only.

5. `guardian-child-safety-agent`
   - checks child profile, guardian consent, shop gate and location safety rules.

6. `wellfit-xp-economy-agent`
   - checks XP ledger, wallet projection, no monetary value and no client authority.

7. `mission-checkpoint-agent`
   - checks missions, evidence, completions, locations and Austria region support.

8. `mayor-system-agent`
   - checks checkpoint mayor logic and XP-only share rules.

9. `reality-glitch-safety-agent`
   - checks controlled micro-event safety, Vienna/Lower Austria start, admin cancel and multiplier caps.

10. `shop-inventory-agent`
    - checks WellFit-XP-only shop, item definitions, inventory and no pay-to-win.

11. `qa-emulator-agent`
    - defines emulator tests and quality-gate expectations.

Each runbook must include:

- purpose
- inputs
- outputs
- forbidden actions
- protected domains
- required checks
- next handoff

## Register updates

If the repository has `project-register/agent-catalog.json`, add or update Beta-1 agent entries without breaking existing JSON. If the repository has `project-register/approved-agent-build-backlog.json`, add these as not-runtime docs/register agents only if that matches existing backlog schema. Do not invent schema fields without reading existing schema style.

If updating project-register JSON fails schema validation or the schema is unclear, stop and create only docs/beta artifacts plus a `docs/beta/BETA1_REGISTER_UPDATE_PROPOSAL.md` explaining the exact proposed register changes.

## TODO / work map updates

Update existing planning files only with small pointers:

- `todolist/TODO_INDEX.md`
- `todolist/WORK_MAP.md`
- `todolist/NEXT_ACTIONS.md` if present

Do not delete or consolidate old TODO files.

## Forbidden changes for this task

Do not change:

- runtime app pages/components/lib logic
- Firebase Functions runtime logic
- `firestore.rules`
- `firebase.json`
- package dependencies
- `.github/**`
- native/Unity files
- payment, wallet, token, NFT, cashout, staking, presale or marketplace logic
- child runtime logic
- location runtime logic
- mission completion authority
- reward/XP authority
- legal/privacy text as product-facing policy

Exception: If a required docs/register validation points to a missing TODO pointer, update that pointer only.

## Checks to run

Run as many as environment permits:

1. `npm run agent:validate`
2. `npm run agent:quality-gate`
3. `npm run lint`
4. `npm run build`
5. `npm --prefix functions run check`
6. `git diff --check`

If any check cannot run because dependencies, environment, Firebase emulators, Java, ports, or local config are unavailable, document it clearly in the PR summary. Do not claim a skipped check passed.

## Branch and PR

Create a branch:

```bash
git checkout -b docs/beta1-agent-data-model
```

Commit message:

```text
docs: add beta1 agent scope and data model
```

PR title:

```text
Add Beta 1 agent scope and data model
```

PR body must include:

- files changed
- Beta-1 decisions captured
- checks run and results
- skipped/environment-blocked checks
- explicit statement: no runtime product code changed
- explicit statement: no blockchain/cashout/NFT marketplace/real-money shop activated
- next recommended task: scoped runtime implementation PR for Firestore rules/functions after approval

## Follow-up runtime implementation prompt boundary

Do not implement runtime in this PR. After docs/register approval, the next PR may be scoped to:

- Firestore rules additions for new collections
- Firebase Functions scaffolding for family/child profiles, mission attempts, XP ledger, shop XP spend, mayor XP share and glitch safety
- Emulator tests for protected write failures and server-authorized success paths

That runtime PR must name exact files and tests before starting.
