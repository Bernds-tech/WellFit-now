const fs = require("fs");
const path = require("path");
const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");
const { PROJECT_ID, assert } = require("./beta1RuntimeFixtures");

async function run() {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  const rules = fs.readFileSync(path.join(__dirname, "..", "..", "firestore.rules"), "utf8");
  const testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules, host: "127.0.0.1", port: 8080 } });

  try {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection("users").doc("alice").set({
        firstName: "Alice",
        email: "alice@wellfit.test",
        profile: { account: { displayName: "Alice" } },
        settings: { language: "Deutsch", privacy: { profileVisibility: "Privat" } },
        points: 25,
        xp: 50,
        level: 2,
        energy: 80,
        stepsToday: 3000,
        avatar: { hunger: 70 },
        lastMissionCompletedAt: "2026-07-23T10:00:00.000Z",
        deviceLocation: { regionId: "legacy" },
        consent: { legacy: true },
        inventory: { legacy: true },
      });
      await adminDb.collection("userOnboardingRecords").doc("alice").set({ ownerUserId: "alice", userId: "alice", status: "completed" });
      await adminDb.collection("userPrivateProfiles").doc("alice").set({ ownerUserId: "alice", userId: "alice", healthProfileStored: false });
      await adminDb.collection("userConsentEvents").doc("consent_user_alice").set({ ownerUserId: "alice", userId: "alice", consentType: "privacy", status: "active" });
      await adminDb.collection("familyAccounts").doc("fam_alice").set({ guardianUserIds: ["alice"], childProfileIds: ["child_alice"] });
      await adminDb.collection("childProfiles").doc("child_alice").set({ guardianUserIds: ["alice"], familyAccountId: "fam_alice", nickname: "Kid", status: "active" });
      await adminDb.collection("parentalConsents").doc("consent_alice").set({ guardianUserId: "alice", childProfileId: "child_alice", status: "active" });
      await adminDb.collection("missions").doc("mission_public").set({ status: "published", title: "Public Mission", rewardXp: 25 });
      await adminDb.collection("missions").doc("mission_draft").set({ status: "draft", title: "Draft Mission" });
      await adminDb.collection("missionLocations").doc("location_public_safe").set({ status: "published", safeLocationReviewed: true, regionId: "jp-tokyo", countryCode: "JP", title: "Tokyo Safe Mission Hub" });
      await adminDb.collection("missionLocations").doc("location_public_unreviewed").set({ status: "published", safeLocationReviewed: false, regionId: "us-new-york", countryCode: "US", title: "Unreviewed Mission Hub" });
      await adminDb.collection("missionLocations").doc("location_draft_safe").set({ status: "draft", safeLocationReviewed: true, regionId: "de-berlin", countryCode: "DE", title: "Draft Mission Hub" });
      await adminDb.collection("missionAttempts").doc("attempt_alice").set({ ownerUserId: "alice", userId: "alice", missionId: "mission_public", status: "started" });
      await adminDb.collection("missionEvidence").doc("evidence_alice").set({ ownerUserId: "alice", userId: "alice", attemptId: "attempt_alice" });
      await adminDb.collection("missionCompletions").doc("completion_alice").set({ ownerUserId: "alice", userId: "alice", attemptId: "attempt_alice", xpLedgerEventId: "xp_alice" });
      await adminDb.collection("adventureAccessEvents").doc("access_alice").set({ ownerUserId: "alice", userId: "alice", attemptId: "attempt_alice", locationId: "location_public_safe", status: "completed" });
      await adminDb.collection("userDailyMissionState").doc("alice_2026-07-23").set({ ownerUserId: "alice", userId: "alice", dateKey: "2026-07-23", favoriteIds: ["mission_public"], dailySlotIds: ["mission_public", null, null] });
      await adminDb.collection("userCalendarSettings").doc("alice").set({ ownerUserId: "alice", userId: "alice", timeZone: "Asia/Tokyo", calendarAuthority: "server-user-time-zone" });
      await adminDb.collection("userDailyStreaks").doc("alice").set({ ownerUserId: "alice", userId: "alice", currentStreak: 2, longestStreak: 3 });
      await adminDb.collection("userLevels").doc("alice").set({ ownerUserId: "alice", userId: "alice", xp: 120, level: 2 });
      await adminDb.collection("xpWallets").doc("alice").set({ ownerUserId: "alice", userId: "alice", balance: 100 });
      await adminDb.collection("xpLedgerEvents").doc("xp_alice").set({ ownerUserId: "alice", userId: "alice", delta: 25 });
      await adminDb.collection("userAvatars").doc("alice_self_default").set({ ownerUserId: "alice", userId: "alice", buddyId: "default", hunger: 70, serverValidationStatus: "server-projected" });
      await adminDb.collection("buddyCareActions").doc("action_alice").set({ ownerUserId: "alice", userId: "alice", actionType: "care", status: "completed" });
      await adminDb.collection("shopItems").doc("shop_public").set({ status: "published", priceWfxp: 20 });
      await adminDb.collection("shopPurchaseIntents").doc("intent_alice").set({ ownerUserId: "alice", userId: "alice", status: "pending" });
      await adminDb.collection("shopPurchaseEvents").doc("purchase_alice").set({ ownerUserId: "alice", userId: "alice", result: "completed" });
      await adminDb.collection("userInventory").doc("inv_alice").set({ ownerUserId: "alice", userId: "alice", itemDefinitionId: "shoes_001" });
      await adminDb.collection("checkpoints").doc("cp_public").set({ status: "published", title: "Checkpoint" });
      await adminDb.collection("checkpointScores").doc("score_alice").set({ ownerUserId: "alice", userId: "alice", checkpointId: "cp_public" });
      await adminDb.collection("checkpointMayors").doc("mayor_cp").set({ checkpointId: "cp_public", ownerUserId: "alice" });
      await adminDb.collection("mayorShareEvents").doc("share_alice").set({ mayorUserId: "alice", ownerUserId: "alice", xpAmount: 5 });
      await adminDb.collection("glitchEvents").doc("glitch_active").set({ status: "active", multiplierCap: 10, regionId: "de-berlin" });
      await adminDb.collection("glitchParticipants").doc("glitch_alice").set({ ownerUserId: "alice", userId: "alice", glitchEventId: "glitch_active" });
      await adminDb.collection("glitchBoostWindows").doc("boost_alice").set({ ownerUserId: "alice", userId: "alice", multiplier: 2 });
      await adminDb.collection("glitchSafetyRules").doc("rule_beta1").set({ regionId: "de-berlin", status: "active" });
      await adminDb.collection("safetyReports").doc("report_alice").set({ reporterUserId: "alice", ownerUserId: "alice", status: "submitted" });
      await adminDb.collection("adminActions").doc("admin_action").set({ actorUserId: "admin", actionType: "mission-published" });
    });

    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const bobDb = testEnv.authenticatedContext("bob").firestore();
    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(aliceDb.collection("users").doc("alice").get());
    await assertFails(bobDb.collection("users").doc("alice").get());
    await assertFails(anonDb.collection("users").doc("alice").get());
    await assertFails(aliceDb.collection("users").doc("alice_new").set({ profile: { account: { displayName: "Client-created" } } }));
    for (const mutation of [
      { profile: { account: { displayName: "Alice Safe" } } },
      { settings: { language: "English" } },
      { lastLoginAt: "2026-07-24T12:00:00.000Z" },
      { points: 999999 },
      { xp: 999999 },
      { level: 99 },
      { energy: 100 },
      { stepsToday: 999999 },
      { avatar: { hunger: 100 } },
      { lastMissionCompletedAt: "2099-01-01T00:00:00.000Z" },
      { deviceLocation: { regionId: "hack" } },
      { consent: { bypass: true } },
      { inventory: { rare: true } },
    ]) {
      await assertFails(aliceDb.collection("users").doc("alice").update(mutation));
    }
    await assertFails(aliceDb.collection("users").doc("alice").delete());

    for (const [collectionName, documentId] of [
      ["userOnboardingRecords", "alice"],
      ["userPrivateProfiles", "alice"],
      ["userConsentEvents", "consent_user_alice"],
    ]) {
      await assertFails(aliceDb.collection(collectionName).doc(documentId).get());
      await assertFails(bobDb.collection(collectionName).doc(documentId).get());
      await assertFails(anonDb.collection(collectionName).doc(documentId).get());
      await assertFails(aliceDb.collection(collectionName).doc(`${documentId}_hack`).set({ ownerUserId: "alice", userId: "alice" }));
      await assertFails(aliceDb.collection(collectionName).doc(documentId).update({ status: "hacked" }));
      await assertFails(aliceDb.collection(collectionName).doc(documentId).delete());
    }

    await assertSucceeds(aliceDb.collection("familyAccounts").doc("fam_alice").get());
    await assertFails(bobDb.collection("familyAccounts").doc("fam_alice").get());
    await assertSucceeds(aliceDb.collection("childProfiles").doc("child_alice").get());
    await assertFails(bobDb.collection("childProfiles").doc("child_alice").get());
    await assertFails(anonDb.collection("childProfiles").doc("child_alice").get());
    await assertFails(aliceDb.collection("childProfiles").doc("child_hack").set({ guardianUserIds: ["alice"] }));
    await assertFails(aliceDb.collection("childProfiles").doc("child_alice").update({ publicProfile: true, standaloneLoginAllowed: true }));
    await assertSucceeds(aliceDb.collection("parentalConsents").doc("consent_alice").get());
    await assertFails(aliceDb.collection("parentalConsents").doc("consent_hack").set({ guardianUserId: "alice" }));

    await assertSucceeds(aliceDb.collection("missions").doc("mission_public").get());
    await assertFails(aliceDb.collection("missions").doc("mission_draft").get());
    await assertFails(aliceDb.collection("missions").doc("mission_hack").set({ status: "published", rewardXp: 9999 }));

    await assertFails(aliceDb.collection("missionLocations").doc("location_public_safe").get());
    await assertFails(bobDb.collection("missionLocations").doc("location_public_safe").get());
    await assertFails(anonDb.collection("missionLocations").doc("location_public_safe").get());
    await assertFails(aliceDb.collection("missionLocations").limit(10).get());
    await assertFails(aliceDb.collection("missionLocations").doc("location_public_unreviewed").get());
    await assertFails(aliceDb.collection("missionLocations").doc("location_draft_safe").get());
    await assertFails(aliceDb.collection("missionLocations").doc("location_hack").set({ status: "published", safeLocationReviewed: true, title: "Fake" }));
    await assertFails(aliceDb.collection("missionLocations").doc("location_public_safe").update({ safeLocationReviewed: false }));
    await assertFails(aliceDb.collection("missionLocations").doc("location_public_safe").delete());

    for (const [collectionName, ownedDocId, hackPayload] of [
      ["missionAttempts", "attempt_alice", { ownerUserId: "alice", status: "completed" }],
      ["missionEvidence", "evidence_alice", { ownerUserId: "alice", reviewStatus: "accepted" }],
      ["missionCompletions", "completion_alice", { ownerUserId: "alice", xpLedgerEventId: "fake" }],
      ["adventureAccessEvents", "access_alice", { ownerUserId: "alice", accessCostWfxp: 0 }],
      ["xpWallets", "alice", { ownerUserId: "alice", balance: 999999 }],
      ["xpLedgerEvents", "xp_alice", { ownerUserId: "alice", delta: 999999 }],
      ["userAvatars", "alice_self_default", { ownerUserId: "alice", hunger: 100 }],
      ["shopPurchaseIntents", "intent_alice", { ownerUserId: "alice", status: "completed" }],
      ["shopPurchaseEvents", "purchase_alice", { ownerUserId: "alice", result: "completed" }],
      ["userInventory", "inv_alice", { ownerUserId: "alice", itemDefinitionId: "rare" }],
      ["checkpointScores", "score_alice", { ownerUserId: "alice", score: 999999 }],
      ["glitchParticipants", "glitch_alice", { ownerUserId: "alice", boostAuthorized: true }],
      ["glitchBoostWindows", "boost_alice", { ownerUserId: "alice", multiplier: 10 }],
      ["safetyReports", "report_alice", { reporterUserId: "alice", status: "reviewed" }],
    ]) {
      await assertSucceeds(aliceDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(bobDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(anonDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(aliceDb.collection(collectionName).doc(`${collectionName}_hack`).set(hackPayload));
      await assertFails(aliceDb.collection(collectionName).doc(ownedDocId).update(hackPayload));
      await assertFails(aliceDb.collection(collectionName).doc(ownedDocId).delete());
    }

    for (const [collectionName, ownedDocId, createDocId, mutation] of [
      ["userDailyMissionState", "alice_2026-07-23", "alice_2026-07-24", { favoriteIds: ["mission_public"] }],
      ["userCalendarSettings", "alice", "alice_new", { timeZone: "Europe/London" }],
      ["userDailyStreaks", "alice", "alice_new", { currentStreak: 99 }],
      ["userLevels", "alice", "alice_new", { xp: 999999, level: 99 }],
    ]) {
      await assertSucceeds(aliceDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(bobDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(anonDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(aliceDb.collection(collectionName).doc(createDocId).set({ ownerUserId: "alice", userId: "alice", ...mutation }));
      await assertFails(aliceDb.collection(collectionName).doc(ownedDocId).update(mutation));
      await assertFails(aliceDb.collection(collectionName).doc(ownedDocId).delete());
    }

    await assertFails(aliceDb.collection("buddyCareActions").doc("action_alice").get());
    await assertFails(bobDb.collection("buddyCareActions").doc("action_alice").get());
    await assertFails(anonDb.collection("buddyCareActions").doc("action_alice").get());
    await assertFails(aliceDb.collection("buddyCareActions").doc("action_hack").set({ ownerUserId: "alice", actionType: "care", status: "completed" }));
    await assertFails(aliceDb.collection("buddyCareActions").doc("action_alice").update({ costWfxp: 0 }));
    await assertFails(aliceDb.collection("buddyCareActions").doc("action_alice").delete());

    await assertFails(anonDb.collection("shopItems").doc("shop_public").get());
    await assertSucceeds(aliceDb.collection("shopItems").doc("shop_public").get());
    await assertFails(aliceDb.collection("shopItems").doc("shop_hack").set({ status: "published", priceWfxp: 1 }));
    await assertSucceeds(aliceDb.collection("checkpoints").doc("cp_public").get());
    await assertFails(aliceDb.collection("checkpointMayors").doc("mayor_hack").set({ ownerUserId: "alice" }));
    await assertFails(aliceDb.collection("checkpointMayors").doc("mayor_cp").update({ ownerUserId: "bob" }));
    await assertSucceeds(aliceDb.collection("mayorShareEvents").doc("share_alice").get());
    await assertFails(bobDb.collection("mayorShareEvents").doc("share_alice").get());
    await assertSucceeds(aliceDb.collection("glitchEvents").doc("glitch_active").get());
    await assertFails(aliceDb.collection("glitchEvents").doc("glitch_hack").set({ status: "active", multiplierCap: 100 }));
    await assertFails(aliceDb.collection("glitchSafetyRules").doc("rule_beta1").get());
    await assertFails(aliceDb.collection("glitchSafetyRules").doc("glitchSafetyRules_hack").set({ regionId: "de-berlin", status: "active" }));
    await assertFails(aliceDb.collection("glitchSafetyRules").doc("rule_beta1").update({ status: "inactive" }));
    await assertFails(aliceDb.collection("glitchSafetyRules").doc("rule_beta1").delete());
    await assertFails(aliceDb.collection("adminActions").doc("admin_action").get());
    await assertFails(aliceDb.collection("adminActions").doc("admin_hack").set({ actorUserId: "alice" }));
    await assertFails(aliceDb.collection("adminActions").doc("admin_action").update({ reason: "hack" }));

    assert(true, "Beta 1 Firestore Rules Emulator Test erfolgreich.");
    console.log("WellFit Beta 1 Firestore Rules Emulator Test erfolgreich.");
  } finally {
    await testEnv.cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
