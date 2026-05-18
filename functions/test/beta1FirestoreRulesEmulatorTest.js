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
      await adminDb.collection("familyAccounts").doc("fam_alice").set({ guardianUserIds: ["alice"], childProfileIds: ["child_alice"] });
      await adminDb.collection("childProfiles").doc("child_alice").set({ guardianUserIds: ["alice"], familyAccountId: "fam_alice", nickname: "Kid", status: "active" });
      await adminDb.collection("parentalConsents").doc("consent_alice").set({ guardianUserId: "alice", childProfileId: "child_alice", status: "active" });
      await adminDb.collection("missions").doc("mission_public").set({ status: "published", title: "Public Mission", rewardXp: 25 });
      await adminDb.collection("missions").doc("mission_draft").set({ status: "draft", title: "Draft Mission" });
      await adminDb.collection("missionAttempts").doc("attempt_alice").set({ ownerUserId: "alice", userId: "alice", missionId: "mission_public", status: "started" });
      await adminDb.collection("missionEvidence").doc("evidence_alice").set({ ownerUserId: "alice", userId: "alice", attemptId: "attempt_alice" });
      await adminDb.collection("missionCompletions").doc("completion_alice").set({ ownerUserId: "alice", userId: "alice", attemptId: "attempt_alice", xpLedgerEventId: "xp_alice" });
      await adminDb.collection("xpWallets").doc("alice").set({ ownerUserId: "alice", userId: "alice", balance: 100 });
      await adminDb.collection("xpLedgerEvents").doc("xp_alice").set({ ownerUserId: "alice", userId: "alice", delta: 25 });
      await adminDb.collection("shopItems").doc("shop_public").set({ status: "published", priceWfxp: 20 });
      await adminDb.collection("shopPurchaseIntents").doc("intent_alice").set({ ownerUserId: "alice", userId: "alice", status: "pending" });
      await adminDb.collection("shopPurchaseEvents").doc("purchase_alice").set({ ownerUserId: "alice", userId: "alice", result: "completed" });
      await adminDb.collection("userInventory").doc("inv_alice").set({ ownerUserId: "alice", userId: "alice", itemDefinitionId: "shoes_001" });
      await adminDb.collection("checkpoints").doc("cp_public").set({ status: "published", title: "Checkpoint" });
      await adminDb.collection("checkpointScores").doc("score_alice").set({ ownerUserId: "alice", userId: "alice", checkpointId: "cp_public" });
      await adminDb.collection("checkpointMayors").doc("mayor_cp").set({ checkpointId: "cp_public", ownerUserId: "alice" });
      await adminDb.collection("mayorShareEvents").doc("share_alice").set({ mayorUserId: "alice", ownerUserId: "alice", xpAmount: 5 });
      await adminDb.collection("glitchEvents").doc("glitch_active").set({ status: "active", multiplierCap: 10 });
      await adminDb.collection("glitchParticipants").doc("glitch_alice").set({ ownerUserId: "alice", userId: "alice", glitchEventId: "glitch_active" });
      await adminDb.collection("glitchBoostWindows").doc("boost_alice").set({ ownerUserId: "alice", userId: "alice", multiplier: 2 });
      await adminDb.collection("safetyReports").doc("report_alice").set({ reporterUserId: "alice", ownerUserId: "alice", status: "submitted" });
      await adminDb.collection("adminActions").doc("admin_action").set({ actorUserId: "admin", actionType: "mission-published" });
    });

    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const bobDb = testEnv.authenticatedContext("bob").firestore();
    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(aliceDb.collection("familyAccounts").doc("fam_alice").get());
    await assertFails(bobDb.collection("familyAccounts").doc("fam_alice").get());
    await assertSucceeds(aliceDb.collection("childProfiles").doc("child_alice").get());
    await assertFails(aliceDb.collection("childProfiles").doc("child_hack").set({ guardianUserIds: ["alice"] }));
    await assertSucceeds(aliceDb.collection("parentalConsents").doc("consent_alice").get());
    await assertFails(aliceDb.collection("parentalConsents").doc("consent_hack").set({ guardianUserId: "alice" }));

    await assertSucceeds(aliceDb.collection("missions").doc("mission_public").get());
    await assertFails(aliceDb.collection("missions").doc("mission_draft").get());
    await assertFails(aliceDb.collection("missions").doc("mission_hack").set({ status: "published", rewardXp: 9999 }));

    for (const [collectionName, ownedDocId, hackPayload] of [
      ["missionAttempts", "attempt_alice", { ownerUserId: "alice", status: "completed" }],
      ["missionEvidence", "evidence_alice", { ownerUserId: "alice", reviewStatus: "accepted" }],
      ["missionCompletions", "completion_alice", { ownerUserId: "alice", xpLedgerEventId: "fake" }],
      ["xpWallets", "alice", { ownerUserId: "alice", balance: 999999 }],
      ["xpLedgerEvents", "xp_alice", { ownerUserId: "alice", delta: 999999 }],
      ["shopPurchaseIntents", "intent_alice", { ownerUserId: "alice", status: "completed" }],
      ["shopPurchaseEvents", "purchase_alice", { ownerUserId: "alice", result: "completed" }],
      ["userInventory", "inv_alice", { ownerUserId: "alice", itemDefinitionId: "rare" }],
      ["checkpointScores", "score_alice", { ownerUserId: "alice", score: 999999 }],
      ["glitchParticipants", "glitch_alice", { ownerUserId: "alice", boostAuthorized: true }],
      ["glitchBoostWindows", "boost_alice", { ownerUserId: "alice", multiplier: 10 }],
      ["safetyReports", "report_alice", { reporterUserId: "alice", status: "reviewed" }],
    ]) {
      await assertSucceeds(aliceDb.collection(collectionName).doc(ownedDocId).get());
      await assertFails(aliceDb.collection(collectionName).doc(`${collectionName}_hack`).set(hackPayload));
      await assertFails(aliceDb.collection(collectionName).doc(ownedDocId).update(hackPayload));
    }

    await assertFails(anonDb.collection("shopItems").doc("shop_public").get());
    await assertSucceeds(aliceDb.collection("shopItems").doc("shop_public").get());
    await assertFails(aliceDb.collection("shopItems").doc("shop_hack").set({ status: "published", priceWfxp: 1 }));
    await assertSucceeds(aliceDb.collection("checkpoints").doc("cp_public").get());
    await assertFails(aliceDb.collection("checkpointMayors").doc("mayor_hack").set({ ownerUserId: "alice" }));
    await assertSucceeds(aliceDb.collection("mayorShareEvents").doc("share_alice").get());
    await assertFails(bobDb.collection("mayorShareEvents").doc("share_alice").get());
    await assertSucceeds(aliceDb.collection("glitchEvents").doc("glitch_active").get());
    await assertFails(aliceDb.collection("glitchEvents").doc("glitch_hack").set({ status: "active", multiplierCap: 100 }));
    await assertFails(aliceDb.collection("adminActions").doc("admin_action").get());
    await assertFails(aliceDb.collection("adminActions").doc("admin_hack").set({ actorUserId: "alice" }));

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
