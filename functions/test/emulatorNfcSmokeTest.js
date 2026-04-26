/*
  WellFit Emulator NFC Smoke Test

  Zweck:
  Dieses Skript prueft die Kernlogik im Firestore Emulator:
  - Demo Items/NFC-Tags seeden
  - Kletterseil-NFC-Tag validieren
  - userInventory Grant pruefen
  - buddyCapabilities Unlock pruefen
  - nfcScanEvents pruefen

  Voraussetzung:
  FIRESTORE_EMULATOR_HOST muss gesetzt sein, z. B. localhost:8080.

  Ausfuehrung im functions-Ordner:
  FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node test/emulatorNfcSmokeTest.js
*/

const admin = require("firebase-admin");
const { DEMO_NFC_TAGS, seedDemoItemsAndNfc } = require("../seed/demoItemsAndNfc");

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("FIRESTORE_EMULATOR_HOST ist nicht gesetzt. Starte zuerst den Firestore Emulator.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "wellfit-emulator" });
}

const db = admin.firestore();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function resetDemoCollections() {
  const collections = [
    "itemDefinitions",
    "nfcTags",
    "nfcScanEvents",
    "userInventory",
    "buddyCapabilities",
    "capabilityUnlockEvents",
    "buddyItemUseEvents",
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(250).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function simulateValidateNfcScan({ userId, publicCode, missionId }) {
  const tagSnapshot = await db.collection("nfcTags").where("publicCode", "==", publicCode).limit(1).get();
  if (tagSnapshot.empty) {
    const rejectedRef = db.collection("nfcScanEvents").doc();
    await rejectedRef.set({
      scanEventId: rejectedRef.id,
      publicCode,
      userId,
      source: "nfc",
      missionId,
      status: "rejected",
      rejectionReason: "tag-not-found",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      validatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { accepted: false, rejectionReason: "tag-not-found", scanEventId: rejectedRef.id };
  }

  const tagDoc = tagSnapshot.docs[0];
  const tag = tagDoc.data();

  if (tag.status !== "active") {
    return { accepted: false, rejectionReason: "tag-not-active" };
  }

  if (tag.linkedMissionId && missionId && tag.linkedMissionId !== missionId) {
    const rejectedRef = db.collection("nfcScanEvents").doc();
    await rejectedRef.set({
      scanEventId: rejectedRef.id,
      tagId: tagDoc.id,
      publicCode,
      userId,
      source: "nfc",
      missionId,
      status: "rejected",
      rejectionReason: "mission-mismatch",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      validatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { accepted: false, rejectionReason: "mission-mismatch", scanEventId: rejectedRef.id };
  }

  const scanRef = db.collection("nfcScanEvents").doc();
  const batch = db.batch();

  batch.set(scanRef, {
    scanEventId: scanRef.id,
    tagId: tagDoc.id,
    publicCode,
    userId,
    source: "nfc",
    missionId,
    status: "validated",
    grantedItemId: tag.linkedItemId || null,
    grantedCapabilityId: tag.linkedCapabilityId || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    validatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.update(tagDoc.ref, {
    usageCount: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (tag.linkedItemId) {
    const inventoryRef = db.collection("userInventory").doc();
    batch.set(inventoryRef, {
      inventoryItemId: inventoryRef.id,
      ownerUserId: userId,
      itemId: tag.linkedItemId,
      source: "nfc",
      quantity: 1,
      equipped: false,
      serverValidationStatus: "validated",
      grantedByEventId: scanRef.id,
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  if (tag.linkedCapabilityId) {
    const capabilityRef = db.collection("buddyCapabilities").doc(`${userId}_default_${tag.linkedCapabilityId}`);
    const unlockRef = db.collection("capabilityUnlockEvents").doc();
    batch.set(capabilityRef, {
      userId,
      buddyId: "default",
      capabilityId: tag.linkedCapabilityId,
      unlocked: true,
      unlockedByItemId: tag.linkedItemId || null,
      unlockedByMissionId: tag.linkedMissionId || null,
      unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
      serverValidationStatus: "validated",
    }, { merge: true });
    batch.set(unlockRef, {
      eventId: unlockRef.id,
      userId,
      buddyId: "default",
      capabilityId: tag.linkedCapabilityId,
      source: "nfc",
      sourceEventId: scanRef.id,
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return {
    accepted: true,
    scanEventId: scanRef.id,
    tagId: tagDoc.id,
    grantedItemId: tag.linkedItemId,
    grantedCapabilityId: tag.linkedCapabilityId,
  };
}

async function run() {
  console.log("WellFit Emulator NFC Smoke Test startet...");
  await resetDemoCollections();

  const seedResult = await seedDemoItemsAndNfc(db);
  assert(seedResult.itemDefinitions === 3, "Seed sollte 3 Item-Definitionen anlegen.");
  assert(seedResult.nfcTags === 2, "Seed sollte 2 NFC-Tags anlegen.");

  const ropeItem = await db.collection("itemDefinitions").doc("rope_001").get();
  assert(ropeItem.exists, "rope_001 muss existieren.");

  const ropeTag = DEMO_NFC_TAGS.find((tag) => tag.tagId === "demo_nfc_rope_tree_001");
  assert(ropeTag, "Demo Rope NFC Tag muss definiert sein.");

  const validScan = await simulateValidateNfcScan({
    userId: "test-user-001",
    publicCode: ropeTag.publicCode,
    missionId: "demo_tree_clue_001",
  });

  assert(validScan.accepted === true, "Gueltiger Rope NFC Scan muss akzeptiert werden.");
  assert(validScan.grantedItemId === "rope_001", "Rope Scan muss rope_001 vergeben.");
  assert(validScan.grantedCapabilityId === "climbUp", "Rope Scan muss climbUp freischalten.");

  const inventorySnapshot = await db.collection("userInventory")
    .where("ownerUserId", "==", "test-user-001")
    .where("itemId", "==", "rope_001")
    .get();
  assert(!inventorySnapshot.empty, "userInventory muss rope_001 fuer test-user-001 enthalten.");

  const capabilityDoc = await db.collection("buddyCapabilities").doc("test-user-001_default_climbUp").get();
  assert(capabilityDoc.exists, "buddyCapabilities muss climbUp enthalten.");
  assert(capabilityDoc.data().unlocked === true, "climbUp muss unlocked sein.");

  const wrongMission = await simulateValidateNfcScan({
    userId: "test-user-001",
    publicCode: ropeTag.publicCode,
    missionId: "wrong_mission",
  });
  assert(wrongMission.accepted === false, "Falsche Mission muss abgelehnt werden.");
  assert(wrongMission.rejectionReason === "mission-mismatch", "Falsche Mission muss mission-mismatch liefern.");

  console.log("WellFit Emulator NFC Smoke Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
