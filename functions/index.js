const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { seedDemoItemsAndNfc } = require("./seed/demoItemsAndNfc");

admin.initializeApp();
const db = admin.firestore();

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Login erforderlich.");
  }
  return request.auth.uid;
}

function requireAdmin(request) {
  const userId = requireAuth(request);
  if (!request.auth.token || request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Admin-Berechtigung erforderlich.");
  }
  return userId;
}

function now() {
  return admin.firestore.FieldValue.serverTimestamp();
}

async function createRejectedScanEvent({ userId, publicCode, missionId, reason }) {
  const ref = db.collection("nfcScanEvents").doc();
  await ref.set({
    scanEventId: ref.id,
    publicCode: publicCode || "",
    userId,
    source: "nfc",
    missionId: missionId || null,
    status: "rejected",
    rejectionReason: reason,
    createdAt: now(),
    validatedAt: now(),
  });
  return ref.id;
}

exports.validateNfcScan = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const publicCode = String(data.publicCode || "").trim();
  const missionId = data.missionId ? String(data.missionId) : null;

  if (!publicCode) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, reason: "missing-public-code" });
    return { accepted: false, scanEventId, message: "NFC-Code fehlt.", rejectionReason: "missing-public-code" };
  }

  const tagSnapshot = await db.collection("nfcTags").where("publicCode", "==", publicCode).limit(1).get();
  if (tagSnapshot.empty) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, reason: "tag-not-found" });
    return { accepted: false, scanEventId, message: "NFC-Tag nicht gefunden.", rejectionReason: "tag-not-found" };
  }

  const tagDoc = tagSnapshot.docs[0];
  const tag = tagDoc.data();
  const tagId = tagDoc.id;

  if (tag.status !== "active") {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, reason: "tag-not-active" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag ist nicht aktiv.", rejectionReason: "tag-not-active" };
  }

  if (tag.usageLimit && Number(tag.usageCount || 0) >= Number(tag.usageLimit)) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, reason: "usage-limit-reached" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag wurde bereits zu oft genutzt.", rejectionReason: "usage-limit-reached" };
  }

  if (tag.linkedMissionId && missionId && tag.linkedMissionId !== missionId) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, reason: "mission-mismatch" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag passt nicht zu dieser Mission.", rejectionReason: "mission-mismatch" };
  }

  if (Array.isArray(tag.allowedUserIds) && tag.allowedUserIds.length > 0 && !tag.allowedUserIds.includes(userId)) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, reason: "user-not-allowed" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag ist nicht fuer diesen Nutzer freigegeben.", rejectionReason: "user-not-allowed" };
  }

  const scanRef = db.collection("nfcScanEvents").doc();
  const batch = db.batch();

  batch.set(scanRef, {
    scanEventId: scanRef.id,
    tagId,
    publicCode,
    userId,
    source: "nfc",
    missionId,
    status: "validated",
    grantedItemId: tag.linkedItemId || null,
    grantedCapabilityId: tag.linkedCapabilityId || null,
    createdAt: now(),
    validatedAt: now(),
    deviceId: data.deviceId || null,
    appSessionId: data.appSessionId || null,
    approximateLocationHash: data.approximateLocationHash || null,
  });

  batch.update(tagDoc.ref, {
    usageCount: admin.firestore.FieldValue.increment(1),
    updatedAt: now(),
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
      grantedAt: now(),
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
      unlockedAt: now(),
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
      createdAt: now(),
      completedAt: now(),
    });
  }

  await batch.commit();

  return {
    accepted: true,
    scanEventId: scanRef.id,
    tagId,
    grantedItemId: tag.linkedItemId || undefined,
    grantedCapabilityId: tag.linkedCapabilityId || undefined,
    message: "NFC-Scan validiert.",
  };
});

exports.auditItemUse = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const eventRef = db.collection("buddyItemUseEvents").doc();

  await eventRef.set({
    eventId: eventRef.id,
    userId,
    buddyId: data.buddyId || "default",
    inventoryItemId: data.inventoryItemId || null,
    itemId: data.itemId || null,
    capabilityId: data.capabilityId || null,
    missionId: data.missionId || null,
    arSessionId: data.arSessionId || null,
    status: data.status || "requested",
    reason: data.reason || null,
    createdAt: now(),
    completedAt: data.status === "completed" ? now() : null,
  });

  return { accepted: true, eventId: eventRef.id };
});

exports.seedDemoItemsAndNfc = onCall(async (request) => {
  requireAdmin(request);
  const result = await seedDemoItemsAndNfc(db);
  return {
    accepted: true,
    message: "Demo Items und NFC Tags wurden angelegt.",
    ...result,
  };
});

exports.grantItemOrCapability = onCall(async () => {
  throw new HttpsError("failed-precondition", "grantItemOrCapability ist vorerst nur als interner Server-Flow geplant.");
});

exports.validateMissionCompletionWithItem = onCall(async () => {
  throw new HttpsError("failed-precondition", "validateMissionCompletionWithItem ist geplant, aber noch nicht fuer Produktion aktiviert.");
});
