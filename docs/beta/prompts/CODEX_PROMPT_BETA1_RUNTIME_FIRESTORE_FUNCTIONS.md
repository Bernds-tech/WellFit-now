# Codex Prompt: Beta 1 Runtime Firestore Rules + Firebase Functions + Emulator Tests

Status: implementation handoff prompt for the next runtime PR  
Prepared after: PR #170 merged  
Runtime branch to create next: `runtime/beta1-firestore-functions-emulator-tests`  
Do not use this docs-only branch for runtime work.

## Mission

Implement the first narrowly scoped Beta 1 runtime slice for Firestore rules, Firebase callable functions and emulator tests. The implementation must establish server-authoritative Beta 1 foundations for:

- WellFit-XP server-only ledger and wallet projections.
- Guardian accounts, child profiles and parental consent gates.
- Missions, attempts, evidence and completions.
- Shop and inventory using WellFit-XP only.
- Checkpoints and mayor assignment/share events.
- Reality Glitch controlled micro-events.
- Safety reports and admin cancellation/review.

Keep this PR runtime-focused and small enough to review. Do not add UI, client routes or new product copy.

## Required reading before code

Read these files before editing anything:

1. `AGENTS.md`
2. `docs/beta/WELLFIT_BETA1_SCOPE.yaml`
3. `docs/beta/AGENTS_WELLFIT_BETA1.md`
4. `docs/beta/WELLFIT_BETA1_DATA_MODEL.md`
5. `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml`
6. `agents/beta1/firestore-rules-guard-agent.md`
7. `agents/beta1/qa-emulator-agent.md`
8. `functions/package.json`
9. `firestore.rules`
10. Existing callable/test files under `functions/`, especially `functions/index.js`, `functions/cooldownIndex.js` and `functions/test/*EmulatorTest.js`.

## Branch and commit for the next runtime PR

- Branch: `runtime/beta1-firestore-functions-emulator-tests`
- Commit: `feat: add beta1 runtime firestore functions emulator tests`
- PR title: `Add Beta-1 runtime Firestore/Functions emulator coverage`

## Allowed files for the next runtime PR

Only edit these runtime files unless a blocker proves one more file is absolutely required and the reason is documented in the PR:

- `firestore.rules`
- `functions/index.js`
- `functions/cooldownIndex.js` only if exports must stay aligned with the current functions entrypoint pattern.
- `functions/lib/beta1Runtime.js` (new)
- `functions/lib/beta1XpLedger.js` (new)
- `functions/lib/beta1GuardianChild.js` (new)
- `functions/lib/beta1Missions.js` (new)
- `functions/lib/beta1ShopInventory.js` (new)
- `functions/lib/beta1CheckpointsMayor.js` (new)
- `functions/lib/beta1RealityGlitch.js` (new)
- `functions/lib/beta1SafetyAdmin.js` (new)
- `functions/test/beta1FirestoreRulesEmulatorTest.js` (new)
- `functions/test/beta1CallableFunctionsEmulatorTest.js` (new)
- `functions/test/beta1RuntimeFixtures.js` (new)
- `functions/package.json` only to add explicit syntax-check and emulator-test scripts for the new files.
- `docs/beta/prompts/CODEX_PROMPT_BETA1_RUNTIME_FIRESTORE_FUNCTIONS.md` only if the prompt must record an implementation deviation discovered during the runtime PR.
- `project-register/agent-work-log.json` and `project-register/progress-log.json` only for minimal handoff status updates after checks.
- `todolist/NEXT_ACTIONS.md` only if the next action pointer must change after this runtime slice.

## Forbidden files for the next runtime PR

Do not edit:

- `app/**`
- `components/**`
- `lib/**` outside `functions/lib/**`
- `firebase.json`
- root `package.json`
- root `package-lock.json`
- `.github/**`
- `native/**`
- `native/unity/**`
- `public/**`
- generated build output
- generated emulator export data
- dependency directories including `node_modules/**`

Do not install dependencies unless the existing package manifests are missing required packages and the PR explicitly justifies the manifest and lockfile change. Prefer the packages already present in `functions/package.json`.

## Non-negotiable Beta 1 safety boundaries

- WellFit-XP (`WFXP`) is internal only: no monetary value, no crypto value, no exchange, no cashout and no blockchain backing.
- No token, NFT marketplace, DePIN, public wallet, payment, IAP, cashout, real PvP stake, betting or revenue-share mechanics.
- Children aged 8-13 may exist only as child profiles under guardian accounts; no standalone child login.
- Clients must never final-authorize XP grants/spend, mission completion, evidence validation, inventory grants, mayor assignment/share, glitch boosts or admin cancels.
- Admin/server decisions must write audit records.
- Client-readable projections may exist, but canonical authority stays in server-only collections.
- Location and child-safety paths must avoid public child profiles, live child location exposure and unsafe mass-event behavior.

## Planned Firestore collections

Implement rules coverage for these Beta 1 collections from the canonical data model. If an equivalent existing collection already exists, map to it rather than creating a parallel authority path, and document the mapping in comments/tests.

### Identity, family and consent

- `users`: authenticated adult tester/guardian profile. Keep existing safe profile writes narrowly limited; do not allow client economy authority.
- `familyAccounts`: guardian-owned family container; owner/guardian read; server-only create/update except safe profile metadata if explicitly required.
- `childProfiles`: non-login child profiles; guardian read; server-only writes; no public reads.
- `guardianChildLinks`: guardian-child relationship records; guardian read own; server-only writes.
- `parentalConsents`: consent evidence/version records; guardian read own; server-only writes after callable consent flow.

### Avatar and inventory projections

- `avatarDefinitions`: signed-in read of published definitions; server/admin-only writes.
- `userAvatars`: owner/guardian read; server-only projection writes.
- `avatarXpEvents`: owner/guardian read; server-only append-only writes.
- `userInventory`: owner/guardian read; server-only inventory grant/equip projection writes.

### Missions, attempts, evidence and completions

- `regions`: signed-in read of active Austria rollout taxonomy; server/admin-only writes.
- `missionLocations`: signed-in read of safe published locations; server/admin-only writes.
- `missions`: signed-in read of published missions; server/admin-only writes.
- `missionAttempts`: owner/guardian read; server-only create/update through callables.
- `missionEvidence`: owner/guardian read; server-only create/update through callable evidence submission/review.
- `missionCompletions`: owner/guardian read; server-only completion writes.

### WellFit-XP economy and shop

- `xpWallets`: owner/guardian read; server-only balance projection writes.
- `xpLedgerEvents`: owner/guardian read; server-only append-only canonical ledger writes.
- `xpRewardPolicies`: signed-in read of active policies; server/admin-only writes.
- `shopItems`: signed-in read of active WFXP-only items; server/admin-only writes.
- `shopPurchaseIntents`: owner/guardian read; server-only pending purchase writes.
- `shopPurchaseEvents`: owner/guardian read; server-only completion/rejection audit writes.

### Checkpoints and mayor system

- `checkpoints`: signed-in read of active safe checkpoints; server/admin-only writes.
- `checkpointScores`: owner/guardian read; server-only score writes.
- `checkpointMayors`: signed-in read of safe display fields; server-only assignment writes.
- `mayorShareEvents`: owner read for mayor user; server-only WFXP share writes.

### Reality Glitch micro-events

- `glitchEvents`: signed-in read of active safe/cancelled event summaries; server/admin-only writes.
- `glitchParticipants`: owner/guardian read; server-only check-in eligibility writes.
- `glitchBoostWindows`: owner/guardian read; server-only boost writes; enforce max 10x and 10-minute window in functions/tests.
- `glitchSafetyRules`: admin/server-only writes; no broad public read except a safe summary if explicitly implemented.

### Safety and admin

- `safetyReports`: reporter/guardian read own; server-only create/update through callable reporting/review flows; no public reads.
- `adminActions`: admin/server-only append-only audit trail; no public client reads.

## Planned callable functions

Export the callables from the existing functions entrypoint style. Use Firebase Functions v2 `onCall`, require auth for all user callables, require an admin custom claim for admin callables, and keep internal helpers unexported unless tests need a public callable path.

### Identity and family

- `createGuardianFamilyAccount`: creates/updates a guardian-owned family account and audit event.
- `createChildProfile`: creates a non-login child profile under an authenticated guardian.
- `updateChildPermissions`: updates server-owned child permission flags with guardian checks.
- `recordParentalConsent`: records consent version/evidence and links it to a child profile.
- `archiveChildProfile`: guardian/admin archive path; no delete.

### Avatar

- `createUserAvatar`: server-created avatar projection for a user/child scope.
- `equipInventoryItem`: validates ownership/guardian permission and updates avatar/inventory projection server-side.
- `getAvatarProgress`: read-only callable returning safe avatar progress.

### Missions

- `listMissions`: returns safe published mission summaries.
- `getMissionDetail`: returns one safe published mission detail.
- `startMissionAttempt`: creates a server-owned attempt for a user/child participant.
- `submitMissionEvidence`: records evidence metadata/reference for an existing attempt; does not final-complete.
- `completeMissionAttempt`: validates server-side attempt/evidence/rules and writes completion, XP ledger event and wallet projection.
- `reportMissionSafetyIssue`: creates a safety report and audit event.

### WellFit-XP economy

- `getXpWallet`: returns safe wallet projection for owner/guardian scope.
- `previewXpReward`: computes non-authoritative preview only.
- `grantXpServerOnly`: internal helper, not directly callable by normal clients; used by completion/mayor/admin flows.
- `spendXpForShopItem`: validates WFXP-only purchase and writes spend ledger event.
- `listXpLedger`: returns owner/guardian-visible ledger entries.

### Shop and inventory

- `listShopItems`: returns active WFXP-only catalog entries.
- `createShopPurchaseIntent`: creates a server-owned pending intent after guardian/child/shop checks.
- `completeXpShopPurchase`: atomically spends WFXP, creates purchase event and grants inventory.
- `listInventory`: returns owner/guardian inventory projection.
- `equipInventoryItem`: may share implementation with avatar flow; do not duplicate conflicting exports.

### Checkpoints and mayor

- `listCheckpoints`: returns safe active checkpoint summaries.
- `submitCheckpointScore`: validates participant/checkpoint proof metadata and writes score.
- `evaluateCheckpointMayor`: internal/admin-triggered helper to update current mayor.
- `listCheckpointMayorHistory`: returns safe display history.
- `grantMayorShareXp`: internal helper that writes WFXP-only mayor share ledger and audit records.

### Reality Glitch

- `listGlitchEvents`: returns active safe/cancelled micro-event summaries.
- `adminScheduleGlitchEvent`: admin-only schedule path requiring safety rule/cap fields.
- `checkInToGlitch`: validates window, location safety and child/guardian permissions before participant write.
- `activateGlitchBoost`: internal helper creating capped boost windows only after eligibility checks.
- `cancelGlitchEvent`: admin-only cancel path that updates event status and writes `adminActions`.

### Admin and safety

- `adminCreateMission`: admin-only draft mission create.
- `adminUpdateMission`: admin-only mission update.
- `adminPublishMission`: admin-only publish after safe location/reward policy checks.
- `adminCreateCheckpoint`: admin-only checkpoint create.
- `adminReviewSafetyReport`: admin-only triage/update path.
- `adminAdjustXp`: admin-only corrective XP ledger event with mandatory reason/audit.

## Rules test cases

Add `functions/test/beta1FirestoreRulesEmulatorTest.js` and cover at least these Firestore rules cases with `@firebase/rules-unit-testing`:

1. Anonymous users cannot read or write any Beta 1 protected collection.
2. Authenticated user can read their own `xpWallets`, `xpLedgerEvents`, `missionAttempts`, `missionEvidence`, `missionCompletions`, `shopPurchaseEvents`, `userInventory`, `safetyReports`, `glitchParticipants` and `glitchBoostWindows` records when owner fields match.
3. Authenticated user cannot read another user’s owner-scoped records.
4. Guardian can read linked child profile scoped records when a server-seeded `guardianChildLinks`/family relation exists.
5. Child profile records are not publicly readable and cannot be created/updated/deleted by a client.
6. Client writes fail for `xpLedgerEvents`, `xpWallets`, `missionCompletions`, `shopPurchaseEvents`, `userInventory`, `checkpointMayors`, `mayorShareEvents`, `glitchBoostWindows`, `glitchSafetyRules`, `adminActions` and `parentalConsents`.
7. Signed-in users can read published/safe catalog records only: active `missions`, `missionLocations`, `regions`, `avatarDefinitions`, `xpRewardPolicies`, `shopItems`, `checkpoints` and safe `glitchEvents`.
8. Draft/inactive/unsafe catalog records are not readable by normal signed-in users if rules can distinguish status fields.
9. `safetyReports` are readable by reporter/guardian only and not by unrelated users.
10. Existing MVP bridge rules remain intentionally documented; do not silently grant new client economy authority through `users`, `userDailyMissionState`, `userDailyStreaks` or `userLevels`.
11. Default catch-all still denies unknown reads and writes.

## Emulator callable test cases

Add `functions/test/beta1CallableFunctionsEmulatorTest.js` and cover at least these callable/server-authorized cases. Use existing emulator URL patterns from `functions/package.json` and existing tests.

1. Unauthenticated callable request fails for user functions.
2. Non-admin callable request fails for admin functions.
3. `createGuardianFamilyAccount` creates a family account owned by the caller and writes an audit/admin action record.
4. `createChildProfile` creates a non-login child profile only under the authenticated guardian.
5. `recordParentalConsent` creates consent evidence and allows subsequent guardian-gated child actions.
6. `startMissionAttempt` creates an attempt with owner/child participant fields and server timestamps.
7. `submitMissionEvidence` writes evidence metadata for the attempt but does not create a completion by itself.
8. `completeMissionAttempt` writes a completion plus WFXP ledger event and wallet projection; duplicate completion is idempotent or rejected deterministically.
9. Direct client write to XP ledger fails while the callable server path succeeds.
10. `createShopPurchaseIntent` and `completeXpShopPurchase` spend only WFXP, reject insufficient balance and grant inventory only through server path.
11. Child shop purchase is guardian-gated and rejects missing consent/permission.
12. `submitCheckpointScore` writes a score only after server validation inputs are present.
13. `evaluateCheckpointMayor`/admin path updates mayor state and `grantMayorShareXp` writes WFXP-only share ledger; no money/revenue/cashout fields are written.
14. `adminScheduleGlitchEvent` rejects unsafe location/cap/window inputs; accepts Vienna/Lower Austria safe micro-events.
15. `checkInToGlitch` and `activateGlitchBoost` create participant/boost records only inside an active window and enforce max 10x multiplier and 10-minute duration.
16. `cancelGlitchEvent` switches status to cancelled and prevents future boost activation.
17. `reportMissionSafetyIssue` creates a reporter-scoped safety report.
18. `adminReviewSafetyReport` updates triage status and writes an admin audit record.
19. `adminAdjustXp` requires admin claim and mandatory reason, writes append-only ledger and audit records.
20. Re-run/idempotency checks do not duplicate XP ledger events, inventory grants or mission completions.

## Implementation notes

- Prefer small pure helper functions in `functions/lib/beta1*.js` and thin `onCall` wrappers in `functions/index.js`.
- Do not add try/catch around imports.
- Use transactions for any operation that changes XP balance, creates completions, spends shop XP, grants inventory, assigns mayor share or activates glitch boosts.
- Use deterministic idempotency keys where possible, for example mission completion per attempt and purchase event per intent.
- Store timestamps with `FieldValue.serverTimestamp()`.
- Use explicit allowlists for enum/status fields.
- Use owner fields consistently: `ownerUserId`, `guardianUserId`, `childProfileId`, `familyAccountId`.
- Keep safe public/signed-in projections separate from admin-only internal fields.
- Do not use client-submitted XP amounts as final authority. Look up policy/item/reward values server-side.
- Do not write monetary, token, cashout, crypto, NFT, betting or real-money fields.
- Do not delete existing compatibility collections unless explicitly approved.

## Stop conditions

Stop and report instead of continuing if any of these occur:

- You need to edit a forbidden file.
- A required Beta 1 safety boundary conflicts with existing runtime behavior.
- Existing functions entrypoint structure makes the planned exports unsafe or too broad for one PR.
- Emulator tests require a new dependency or Firebase config change not listed above.
- You cannot prove client writes fail for ledger, completion, shop spend, inventory, mayor, glitch boost and admin records.
- You find token/NFT/cashout/real-money/payout semantics in the planned runtime path.
- Child standalone login or public child profile access would be required.
- Reality Glitch logic cannot enforce safe regions, admin cancellation, cap and duration.
- Lint/build/function syntax checks fail for reasons other than documented environment limitations.

## Required checks for the runtime PR

Run and report all of these:

- `npm run agent:validate`
- `npm run agent:quality-gate`
- `npm run lint`
- `npm --prefix functions run check`
- `npm --prefix functions run test:emulator` if Firestore/Auth/Functions emulators are available.
- The new focused rules test command added to `functions/package.json`.
- The new focused callable test command added to `functions/package.json`.

If emulator commands cannot run because Java, Firebase emulators, ports or environment setup are unavailable, report the exact failure and classify it as an environment limitation only when appropriate.

## Expected PR report

The runtime PR final report must include:

- Branch name: `runtime/beta1-firestore-functions-emulator-tests`
- Changed runtime files.
- Added/changed callable functions.
- Added/changed Firestore rules collections.
- Rules tests and callable emulator tests added.
- All checks with pass/fail/warning status.
- Known risks and any intentionally deferred Beta 1 runtime areas.
- Whether dependencies were installed or left unchanged.
- Next recommended branch after runtime PR, likely `runtime/beta1-client-read-projections` only after server authority is covered.
