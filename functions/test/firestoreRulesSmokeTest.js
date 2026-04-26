/*
  WellFit Firestore Rules Smoke Test

  Zweck:
  Dieses Skript prueft im Firestore Emulator, dass normale Nutzer produktkritische
  Collections nicht direkt schreiben koennen.

  Voraussetzung:
  - Firestore Emulator laeuft auf 127.0.0.1:8080
  - Ausfuehrung im functions-Ordner:
    npm run rules:firestore
*/

const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-no-project";
const FIRESTORE_HOST = "127.0.0.1";
const FIRESTORE_PORT = 8080;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = `${FIRESTORE_HOST}:${FIRESTORE_PORT}`;
  }

  const rulesPath = path.join(__dirname, "..", "..", "firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");

  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
    },
  });

  try {
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection("itemDefinitions").doc("rope_001").set({
        itemId: "rope_001",
        name: "Kletterseil",
        itemType: "tool",
        rarity: "common",
        createdAt: new Date().toISOString(),
      });
      await adminDb.collection("userInventory").doc("inv_alice_rope").set({
        inventoryItemId: "inv_alice_rope",
        ownerUserId: "alice",
        itemId: "rope_001",
        serverValidationStatus: "validated",
      });
      await adminDb.collection("userInventory").doc("inv_bob_rope").set({
        inventoryItemId: "inv_bob_rope",
        ownerUserId: "bob",
        itemId: "rope_001",
        serverValidationStatus: "validated",
      });
      await adminDb.collection("buddyCapabilities").doc("alice_default_climbUp").set({
        userId: "alice",
        buddyId: "default",
        capabilityId: "climbUp",
        unlocked: true,
      });
      await adminDb.collection("nfcTags").doc("demo_nfc_rope_tree_001").set({
        tagId: "demo_nfc_rope_tree_001",
        publicCode: "WF-DEMO-ROPE-TREE-001",
        status: "active",
      });
      await adminDb.collection("nfcScanEvents").doc("scan_alice_001").set({
        scanEventId: "scan_alice_001",
        userId: "alice",
        publicCode: "WF-DEMO-ROPE-TREE-001",
        status: "validated",
      });
      await adminDb.collection("capabilityUnlockEvents").doc("unlock_alice_001").set({
        eventId: "unlock_alice_001",
        userId: "alice",
        capabilityId: "climbUp",
        status: "completed",
      });
      await adminDb.collection("buddyItemUseEvents").doc("use_alice_001").set({
        eventId: "use_alice_001",
        userId: "alice",
        itemId: "rope_001",
        status: "completed",
      });
      await adminDb.collection("missionBuddyEvents").doc("buddy_alice_001").set({
        eventId: "buddy_alice_001",
        userId: "alice",
        missionId: "demo_tree_clue_001",
        status: "applied",
      });
      await adminDb.collection("missionBuddyEvents").doc("buddy_bob_001").set({
        eventId: "buddy_bob_001",
        userId: "bob",
        missionId: "demo_tree_clue_001",
        status: "applied",
      });
      await adminDb.collection("trackingSessions").doc("tracking_alice_001").set({
        sessionId: "tracking_alice_001",
        userId: "alice",
        status: "completed",
        proofQuality: "server-validated",
      });
      await adminDb.collection("trackingSessions").doc("tracking_bob_001").set({
        sessionId: "tracking_bob_001",
        userId: "bob",
        status: "completed",
        proofQuality: "server-validated",
      });
      await adminDb.collection("trackingProofEvents").doc("proof_alice_001").set({
        proofEventId: "proof_alice_001",
        sessionId: "tracking_alice_001",
        userId: "alice",
        proofType: "motion",
        serverValidationStatus: "received",
      });
      await adminDb.collection("trackingProofEvents").doc("proof_bob_001").set({
        proofEventId: "proof_bob_001",
        sessionId: "tracking_bob_001",
        userId: "bob",
        proofType: "motion",
        serverValidationStatus: "received",
      });
    });

    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(aliceDb.collection("itemDefinitions").doc("rope_001").get());
    await assertFails(anonDb.collection("itemDefinitions").doc("rope_001").get());

    await assertSucceeds(aliceDb.collection("userInventory").doc("inv_alice_rope").get());
    await assertFails(aliceDb.collection("userInventory").doc("inv_bob_rope").get());
    await assertFails(aliceDb.collection("userInventory").doc("inv_hack").set({
      inventoryItemId: "inv_hack",
      ownerUserId: "alice",
      itemId: "rope_001",
      serverValidationStatus: "validated",
    }));

    await assertSucceeds(aliceDb.collection("buddyCapabilities").doc("alice_default_climbUp").get());
    await assertFails(aliceDb.collection("buddyCapabilities").doc("alice_default_jumpBoost").set({
      userId: "alice",
      buddyId: "default",
      capabilityId: "jumpBoost",
      unlocked: true,
    }));

    await assertFails(aliceDb.collection("nfcTags").doc("demo_nfc_rope_tree_001").get());
    await assertFails(aliceDb.collection("nfcTags").doc("demo_nfc_rope_tree_001").set({
      tagId: "demo_nfc_rope_tree_001",
      publicCode: "WF-DEMO-ROPE-TREE-001",
      status: "active",
    }));

    await assertSucceeds(aliceDb.collection("nfcScanEvents").doc("scan_alice_001").get());
    await assertFails(aliceDb.collection("nfcScanEvents").doc("scan_hack").set({
      scanEventId: "scan_hack",
      userId: "alice",
      publicCode: "WF-DEMO-ROPE-TREE-001",
      status: "validated",
    }));

    await assertSucceeds(aliceDb.collection("capabilityUnlockEvents").doc("unlock_alice_001").get());
    await assertFails(aliceDb.collection("capabilityUnlockEvents").doc("unlock_hack").set({
      eventId: "unlock_hack",
      userId: "alice",
      capabilityId: "climbUp",
      status: "completed",
    }));

    await assertSucceeds(aliceDb.collection("buddyItemUseEvents").doc("use_alice_001").get());
    await assertFails(aliceDb.collection("buddyItemUseEvents").doc("use_hack").set({
      eventId: "use_hack",
      userId: "alice",
      itemId: "rope_001",
      status: "completed",
    }));

    await assertSucceeds(aliceDb.collection("missionBuddyEvents").doc("buddy_alice_001").get());
    await assertFails(aliceDb.collection("missionBuddyEvents").doc("buddy_bob_001").get());
    await assertFails(aliceDb.collection("missionBuddyEvents").doc("alice_buddy_hack").set({
      eventId: "alice_buddy_hack",
      userId: "alice",
      missionId: "demo_tree_clue_001",
      status: "applied",
    }));
    await assertFails(aliceDb.collection("missionBuddyEvents").doc("buddy_alice_001").update({
      status: "completed",
      rewardPreview: 999999,
    }));

    await assertSucceeds(aliceDb.collection("trackingSessions").doc("tracking_alice_001").get());
    await assertFails(aliceDb.collection("trackingSessions").doc("tracking_bob_001").get());
    await assertFails(aliceDb.collection("trackingSessions").doc("tracking_hack").set({
      sessionId: "tracking_hack",
      userId: "alice",
      status: "completed",
      steps: 999999,
      proofQuality: "client-claimed",
    }));
    await assertFails(aliceDb.collection("trackingSessions").doc("tracking_alice_001").update({
      status: "completed",
      steps: 999999,
      proofQuality: "client-claimed",
    }));

    await assertSucceeds(aliceDb.collection("trackingProofEvents").doc("proof_alice_001").get());
    await assertFails(aliceDb.collection("trackingProofEvents").doc("proof_bob_001").get());
    await assertFails(aliceDb.collection("trackingProofEvents").doc("proof_hack").set({
      proofEventId: "proof_hack",
      sessionId: "tracking_alice_001",
      userId: "alice",
      proofType: "motion",
      serverValidationStatus: "client-claimed",
    }));
    await assertFails(aliceDb.collection("trackingProofEvents").doc("proof_alice_001").update({
      serverValidationStatus: "client-modified",
      rewardAuthorized: true,
    }));

    assert(true, "Firestore Rules Smoke Test erfolgreich.");
    console.log("WellFit Firestore Rules Smoke Test erfolgreich.");
  } finally {
    await testEnv.cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
