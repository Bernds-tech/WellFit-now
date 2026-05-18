# WellFit Beta 1 Firestore Data Model and Function Contracts

Status: canonical Beta-1 data-model planning artifact  
Updated: 2026-05-17  
Runtime status: documentation/register only; no runtime product code is changed by this artifact.

## Principles

- Firebase/Firestore is the repository baseline for Beta 1. Do not introduce a parallel PostgreSQL backend for this scope.
- WellFit-XP (`WFXP`) is internal beta points only: no monetary value, no crypto value, no cashout, no exchange and no blockchain.
- Clients may preview and request; server functions must final-authorize XP grants, XP spends, inventory grants, mission completions, mayor share and glitch boosts.
- Protected child, location, camera/evidence, reward, shop, mayor and glitch decisions require server authority plus auditability.
- Existing collections such as `ledgerEvents`, `auditEvents`, `userEconomyProjections`, `pointsSinkEvents`, `itemDefinitions`, `userInventory`, `trackingSessions`, `trackingProofEvents`, `missionContextEvaluations`, `missionCompletionEvaluations`, `missionRewardPreviews`, `missionEvidenceReviews`, `missionPatternReviews`, `missionCooldownReviews`, `missionRewardPolicies` and `missionRewardEvents` must be reused or mapped before adding runtime collections.

## Collections

### `users`

- Purpose: Root authenticated user profile, adult tester/guardian identity and safe beta preferences.
- Key fields: userId, role, displayName, emailHash, profile, settings, consent, createdAt, updatedAt
- Owner/participant fields: userId, guardianFamilyAccountIds
- Read/write posture: Owner read/write only for safe profile fields today; all economy/progression authority must move server-side.
- Server-authority fields: No XP, mission completion, reward, mayor or shop authority should be trusted from this doc.
- Child-safety notes: Child users are not standalone; child data is represented by childProfiles under guardian control.
- Relation to existing collections: Existing users rule allows temporary owner-writable bridge fields; future Beta-1 runtime should prefer ledgerEvents/auditEvents/userEconomyProjections.

### `familyAccounts`

- Purpose: Guardian-owned family container for adult tester and child profiles.
- Key fields: familyAccountId, guardianUserIds, childProfileIds, status, createdAt, archivedAt
- Owner/participant fields: guardianUserIds, childProfileIds
- Read/write posture: Guardian-readable; create/update through server functions only.
- Server-authority fields: Membership, child profile attachment and archive status.
- Child-safety notes: Required for children aged 8-13; no public child profile discovery.
- Relation to existing collections: New collection; relates to users and guardianChildLinks.

### `childProfiles`

- Purpose: Non-login profile for a child aged 8-13 under guardian account.
- Key fields: childProfileId, familyAccountId, nickname, ageBand, avatarId, permissions, status
- Owner/participant fields: familyAccountId, guardianUserIds, childProfileId
- Read/write posture: Guardian-readable; server-only writes after consent checks.
- Server-authority fields: Profile creation, permission state, archive state.
- Child-safety notes: No standalone login, public profile, open chat, public location or real-money/crypto rewards.
- Relation to existing collections: New collection; may project safe avatar/inventory state from userInventory without direct child auth.

### `guardianChildLinks`

- Purpose: Explicit relationship records between guardian users and child profiles.
- Key fields: linkId, guardianUserId, childProfileId, familyAccountId, relationship, status
- Owner/participant fields: guardianUserId, childProfileId
- Read/write posture: Guardian-readable for own links; server-only writes.
- Server-authority fields: Relationship verification, status changes.
- Child-safety notes: Enforces guardian-first onboarding and delegated permissions.
- Relation to existing collections: New collection; supports parentalConsents.

### `parentalConsents`

- Purpose: Consent evidence and version tracking for child profile features.
- Key fields: consentId, guardianUserId, childProfileId, consentType, version, grantedAt, revokedAt
- Owner/participant fields: guardianUserId, childProfileId
- Read/write posture: Guardian-readable; server-only append/update.
- Server-authority fields: Consent grant/revoke timestamps and active state.
- Child-safety notes: Required before child shop/location/camera-adjacent flows.
- Relation to existing collections: New collection; links to auditEvents for admin/server actions.

### `avatarDefinitions`

- Purpose: Server-published catalog of avatars, cosmetics and progression metadata.
- Key fields: avatarDefinitionId, type, rarity, xpUnlockPolicyId, assetKey, status
- Owner/participant fields: none or ownerUserId for private definitions
- Read/write posture: Signed-in read; server/admin-only writes.
- Server-authority fields: Unlock requirements and publication status.
- Child-safety notes: Child-safe item classification required.
- Relation to existing collections: Related to existing itemDefinitions; avoid duplicate catalogs by mapping shopItems/itemDefinitions to definitions.

### `userAvatars`

- Purpose: Projected owned/equipped avatar state for a user or child profile.
- Key fields: userAvatarId, ownerUserId, childProfileId, equippedItemIds, level, xpTotal
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only writes for progression/equip results.
- Server-authority fields: Level, XP projection, equip validation.
- Child-safety notes: Guardian gates child avatar changes where required.
- Relation to existing collections: Related to userEconomyProjections, userInventory and existing temporary user avatar fields.

### `avatarXpEvents`

- Purpose: Append-only XP events affecting avatar progression.
- Key fields: eventId, ownerUserId, childProfileId, sourceType, xpAmount, ledgerEventId
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only create; no client update/delete.
- Server-authority fields: XP amount, source and projection link.
- Child-safety notes: No monetary or crypto value.
- Relation to existing collections: Maps to ledgerEvents/userEconomyProjections.

### `regions`

- Purpose: Austria region taxonomy and rollout flags.
- Key fields: regionId, name, country, betaEnabled, glitchEnabled, safetyStatus
- Owner/participant fields: none
- Read/write posture: Signed-in read; admin/server-only writes.
- Server-authority fields: Enabled flags and safe-region status.
- Child-safety notes: No child targeting without guardian safety review.
- Relation to existing collections: New collection; used by missionLocations and glitchEvents.

### `missionLocations`

- Purpose: Approved physical/digital mission location records.
- Key fields: locationId, regionId, name, geoHash, radiusMeters, safeLocationStatus, childAllowed
- Owner/participant fields: regionId
- Read/write posture: Signed-in read only for published safe locations; admin/server-only writes.
- Server-authority fields: Safe-location approval and childAllowed flags.
- Child-safety notes: No live location exposure to other users.
- Relation to existing collections: Relates to trackingSessions/trackingProofEvents as evidence context.

### `missions`

- Purpose: Published/draft mission definitions and reward policy links.
- Key fields: missionId, title, type, regionIds, locationIds, rewardPolicyId, status
- Owner/participant fields: createdByAdminId
- Read/write posture: Signed-in read for published; admin/server-only writes.
- Server-authority fields: Publication, reward policy, eligibility constraints.
- Child-safety notes: Child eligibility must be explicit and guardian-safe.
- Relation to existing collections: Relates to missionRewardPolicies and evaluation/review collections in rules.

### `missionAttempts`

- Purpose: User/child attempt lifecycle for a mission.
- Key fields: attemptId, missionId, ownerUserId, childProfileId, status, startedAt
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; starts via server function; status server-only.
- Server-authority fields: Attempt status, eligibility, anti-cheat gates.
- Child-safety notes: Child attempts require guardian permissions.
- Relation to existing collections: Links to missionEvidence, missionCompletionEvaluations and missionCompletions.

### `missionEvidence`

- Purpose: Submitted evidence references, never final completion authority.
- Key fields: evidenceId, attemptId, ownerUserId, evidenceType, storageRef, metadata, submittedAt
- Owner/participant fields: ownerUserId
- Read/write posture: Owner/guardian read; create via server function; review fields server-only.
- Server-authority fields: Review state and accepted/rejected result.
- Child-safety notes: Minimize camera/health/location data and keep sensitive evidence private.
- Relation to existing collections: Relates to trackingProofEvents and missionEvidenceReviews.

### `missionCompletions`

- Purpose: Server-authorized completion records.
- Key fields: completionId, attemptId, missionId, ownerUserId, xpLedgerEventId, completedAt
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only create; immutable.
- Server-authority fields: Completion decision, XP grant linkage.
- Child-safety notes: No child reward without consent/eligibility.
- Relation to existing collections: Relates to missionCompletionEvaluations, missionRewardEvents and ledgerEvents.

### `xpWallets`

- Purpose: Projection of WellFit-XP balance for a user/family/child scope.
- Key fields: walletId, ownerUserId, childProfileId, balance, lifetimeEarned, lifetimeSpent, updatedAt
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only writes.
- Server-authority fields: Balance and projection derived from ledger.
- Child-safety notes: WellFit-XP has no monetary/crypto/cashout value.
- Relation to existing collections: Related to userEconomyProjections; can be projection wrapper.

### `xpLedgerEvents`

- Purpose: Canonical append-only WellFit-XP ledger for Beta 1.
- Key fields: ledgerEventId, ownerUserId, childProfileId, delta, reason, sourceId, idempotencyKey
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server/internal-only create; no update/delete.
- Server-authority fields: All XP grants/spends/shares.
- Child-safety notes: No monetary value, no cashout, no blockchain.
- Relation to existing collections: Maps to existing ledgerEvents; runtime may choose to extend ledgerEvents instead of parallel collection.

### `xpRewardPolicies`

- Purpose: Server-controlled reward/cap policy definitions.
- Key fields: policyId, sourceType, baseXp, caps, eligibility, status
- Owner/participant fields: none
- Read/write posture: Signed-in read for active policies; admin/server-only writes.
- Server-authority fields: Reward amounts, caps, eligibility.
- Child-safety notes: Child-safe reward caps and no real-money rewards.
- Relation to existing collections: Related to missionRewardPolicies.

### `shopItems`

- Purpose: Beta shop catalog using WellFit-XP only.
- Key fields: shopItemId, itemDefinitionId, priceWfxp, category, childAllowed, status
- Owner/participant fields: none
- Read/write posture: Signed-in read for published; admin/server-only writes.
- Server-authority fields: Price, availability, childAllowed.
- Child-safety notes: Guardian gate required for child purchases; no pay-to-win.
- Relation to existing collections: Related to itemDefinitions and userInventory.

### `shopPurchaseIntents`

- Purpose: Server-created pending intent for XP-only purchase.
- Key fields: intentId, ownerUserId, childProfileId, shopItemId, quotedPriceWfxp, status
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; create/complete via server functions.
- Server-authority fields: Quote, eligibility, expiry.
- Child-safety notes: Child intent requires guardian permission.
- Relation to existing collections: Precedes pointsSinkEvents/xpLedgerEvents and shopPurchaseEvents.

### `shopPurchaseEvents`

- Purpose: Completed or rejected shop purchase audit trail.
- Key fields: eventId, intentId, ownerUserId, shopItemId, xpLedgerEventId, result
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only create.
- Server-authority fields: Final spend result and inventory grant.
- Child-safety notes: No real money or sandbox IAP.
- Relation to existing collections: Maps to pointsSinkEvents and auditEvents.

### `userInventory`

- Purpose: Owned items/equipment projection.
- Key fields: inventoryItemId, ownerUserId, childProfileId, itemDefinitionId, sourceEventId, equipped
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only writes for grants/equips.
- Server-authority fields: Grant source and equip validity.
- Child-safety notes: Child inventory must respect childAllowed.
- Relation to existing collections: Existing userInventory is server-only in rules.

### `checkpoints`

- Purpose: Map checkpoint definitions for score and mayor contests.
- Key fields: checkpointId, regionId, locationId, title, status, childAllowed
- Owner/participant fields: regionId
- Read/write posture: Signed-in read for published; admin/server-only writes.
- Server-authority fields: Publication and safe-location status.
- Child-safety notes: No unsafe locations or public child location exposure.
- Relation to existing collections: Relates to missionLocations.

### `checkpointScores`

- Purpose: Server-validated checkpoint scoring records.
- Key fields: scoreId, checkpointId, ownerUserId, score, proofEventId, submittedAt
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read own; server-only create/update after validation.
- Server-authority fields: Validated score and anti-cheat proof.
- Child-safety notes: Child eligibility and privacy required.
- Relation to existing collections: Relates to trackingProofEvents.

### `checkpointMayors`

- Purpose: Current and historical mayor assignment per checkpoint.
- Key fields: mayorId, checkpointId, ownerUserId, scoreId, termStart, termEnd
- Owner/participant fields: ownerUserId
- Read/write posture: Signed-in read limited to safe display fields; server-only writes.
- Server-authority fields: Mayor evaluation result.
- Child-safety notes: No Junior Mayors in Beta 1.
- Relation to existing collections: Related to mayorShareEvents.

### `mayorShareEvents`

- Purpose: Internal WellFit-XP-only mayor share events.
- Key fields: eventId, checkpointId, mayorUserId, xpAmount, ledgerEventId, reason
- Owner/participant fields: mayorUserId
- Read/write posture: Owner read; server/internal-only create.
- Server-authority fields: XP share amount and ledger link.
- Child-safety notes: No money, token, revenue cashout or crypto share.
- Relation to existing collections: Maps to xpLedgerEvents/ledgerEvents.

### `glitchEvents`

- Purpose: Controlled Reality Glitch micro-event definitions.
- Key fields: glitchEventId, regionId, locationIds, windowStart, windowEnd, status, multiplierCap
- Owner/participant fields: regionId
- Read/write posture: Signed-in read for active safe events; admin/server-only writes.
- Server-authority fields: Schedule, cancel status, cap and safety flags.
- Child-safety notes: Starts in Vienna/Lower Austria; safe locations only; admin cancel required.
- Relation to existing collections: Relates to missionLocations/regions.

### `glitchParticipants`

- Purpose: User check-in and participation records for glitch events.
- Key fields: participantId, glitchEventId, ownerUserId, checkInAt, eligibilityStatus
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; server-only writes after check-in validation.
- Server-authority fields: Eligibility and check-in window.
- Child-safety notes: Child participation requires guardian-safe location rules.
- Relation to existing collections: Relates to glitchBoostWindows.

### `glitchBoostWindows`

- Purpose: Server-authorized temporary boost windows.
- Key fields: boostWindowId, glitchEventId, ownerUserId, startsAt, endsAt, multiplier
- Owner/participant fields: ownerUserId, childProfileId
- Read/write posture: Owner/guardian read; internal server-only create.
- Server-authority fields: Boost activation, duration and multiplier cap.
- Child-safety notes: Max 10x cap, 10 minutes, no unsafe mass event.
- Relation to existing collections: Influences preview/reward policy but never client-authorized.

### `glitchSafetyRules`

- Purpose: Admin-defined safety constraints for glitch events.
- Key fields: ruleId, regionId, maxParticipants, blockedLocations, cancelTriggers, status
- Owner/participant fields: regionId
- Read/write posture: Admin/server read-write; optionally public safe summary.
- Server-authority fields: Cancel triggers and caps.
- Child-safety notes: Prevents uncontrolled flashmob behavior.
- Relation to existing collections: Related to adminActions/auditEvents.

### `safetyReports`

- Purpose: User/guardian/admin reports for missions, locations, shop, glitch or child safety.
- Key fields: reportId, reporterUserId, subjectType, subjectId, severity, status
- Owner/participant fields: reporterUserId, childProfileId
- Read/write posture: Reporter read own; admin/server review; no public read.
- Server-authority fields: Triage status and moderation outcome.
- Child-safety notes: Child reports get priority and privacy protection.
- Relation to existing collections: Related to adminActions and auditEvents.

### `adminActions`

- Purpose: Append-only admin/server audit trail.
- Key fields: adminActionId, actorUserId, actionType, targetType, targetId, reason, createdAt
- Owner/participant fields: actorUserId
- Read/write posture: Admin/server only with safe user-facing projections where needed.
- Server-authority fields: All protected mutations and overrides.
- Child-safety notes: Required for child/location/reward/shop/mayor/glitch decisions.
- Relation to existing collections: Related to existing auditEvents.

## Proposed Firebase function contracts

All write functions validate auth, guardian/child permissions, idempotency, region/location safety, caps and audit requirements. Internal-only functions are not callable by clients.

### Identity and family

- `createGuardianFamilyAccount`: server function contract for identity and family Beta-1 workflow.
- `createChildProfile`: server function contract for identity and family Beta-1 workflow.
- `updateChildPermissions`: server function contract for identity and family Beta-1 workflow.
- `recordParentalConsent`: server function contract for identity and family Beta-1 workflow.
- `archiveChildProfile`: server function contract for identity and family Beta-1 workflow.

### Avatar

- `createUserAvatar`: server function contract for avatar Beta-1 workflow.
- `equipInventoryItem`: server function contract for avatar Beta-1 workflow.
- `getAvatarProgress`: server function contract for avatar Beta-1 workflow.

### Missions

- `listMissions`: server function contract for missions Beta-1 workflow.
- `getMissionDetail`: server function contract for missions Beta-1 workflow.
- `startMissionAttempt`: server function contract for missions Beta-1 workflow.
- `submitMissionEvidence`: server function contract for missions Beta-1 workflow.
- `completeMissionAttempt`: server function contract for missions Beta-1 workflow.
- `reportMissionSafetyIssue`: server function contract for missions Beta-1 workflow.

### XP economy

- `getXpWallet`: server function contract for xp economy Beta-1 workflow.
- `previewXpReward`: server function contract for xp economy Beta-1 workflow.
- `grantXpServerOnly`: server function contract for xp economy Beta-1 workflow. Internal-only; not callable by clients.
- `spendXpForShopItem`: server function contract for xp economy Beta-1 workflow.
- `listXpLedger`: server function contract for xp economy Beta-1 workflow.

### Shop and inventory

- `listShopItems`: server function contract for shop and inventory Beta-1 workflow.
- `createShopPurchaseIntent`: server function contract for shop and inventory Beta-1 workflow.
- `completeXpShopPurchase`: server function contract for shop and inventory Beta-1 workflow.
- `listInventory`: server function contract for shop and inventory Beta-1 workflow.
- `equipInventoryItem`: server function contract for shop and inventory Beta-1 workflow.

### Checkpoints / mayor

- `listCheckpoints`: server function contract for checkpoints / mayor Beta-1 workflow.
- `submitCheckpointScore`: server function contract for checkpoints / mayor Beta-1 workflow.
- `evaluateCheckpointMayor`: server function contract for checkpoints / mayor Beta-1 workflow. Internal-only; not callable by clients.
- `listCheckpointMayorHistory`: server function contract for checkpoints / mayor Beta-1 workflow.
- `grantMayorShareXp`: server function contract for checkpoints / mayor Beta-1 workflow. Internal-only; not callable by clients.

### Reality Glitch

- `listGlitchEvents`: server function contract for reality glitch Beta-1 workflow.
- `adminScheduleGlitchEvent`: server function contract for reality glitch Beta-1 workflow.
- `checkInToGlitch`: server function contract for reality glitch Beta-1 workflow.
- `activateGlitchBoost`: server function contract for reality glitch Beta-1 workflow. Internal-only; not callable by clients.
- `cancelGlitchEvent`: server function contract for reality glitch Beta-1 workflow.

### Admin

- `adminCreateMission`: server function contract for admin Beta-1 workflow.
- `adminUpdateMission`: server function contract for admin Beta-1 workflow.
- `adminPublishMission`: server function contract for admin Beta-1 workflow.
- `adminCreateCheckpoint`: server function contract for admin Beta-1 workflow.
- `adminReviewSafetyReport`: server function contract for admin Beta-1 workflow.
- `adminAdjustXp`: server function contract for admin Beta-1 workflow.

## Required emulator tests for a future runtime PR

- Unauthenticated users cannot read private Beta-1 records.
- Owners/guardians can read only their own user, family, child, wallet, ledger, mission attempt, evidence, inventory and safety report records.
- Clients cannot create/update/delete XP ledger, wallet projection, mission completion, shop purchase event, inventory grant, mayor share, glitch boost or admin action records directly.
- Server-authorized functions can create success-path records and append audit/ledger events.
- Child profile creation requires guardian auth and parental consent rules.
- Shop purchases are WellFit-XP-only, guardian-gated for child profiles and blocked for insufficient balance.
- Reality Glitch scheduling is admin-only, limited to safe locations, cancellable, capped at 10x and bounded to configured windows.
