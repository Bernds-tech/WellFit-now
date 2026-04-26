const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { seedDemoItemsAndNfc: runDemoItemsAndNfcSeed } = require("./seed/demoItemsAndNfc");

admin.initializeApp();
const db = admin.firestore();

const ALLOWED_TRACKING_SOURCES = ["mobile", "ar", "buddy", "nfc", "manual-test"];
const ALLOWED_TRACKING_STATUSES = ["started", "proof-submitted", "completed", "rejected"];
const ALLOWED_PROOF_TYPES = ["pose", "motion", "ar", "nfc", "gps-context", "manual-test"];
const ALLOWED_BUDDY_EVENT_TYPES = [
  "recommendationShown",
  "missionStarted",
  "buddyActionRequested",
  "buddyActionCompleted",
  "hintShown",
  "itemNeeded",
  "itemUsed",
  "missionExplained",
];
const ALLOWED_BUDDY_EVENT_STATUSES = ["recorded", "requested", "completed", "rejected"];

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
  return FieldValue.serverTimestamp();
}

function incrementBy(value) {
  return FieldValue.increment(value);
}

function toErrorMessage(error) {
  if (!error) return "Unbekannter Fehler";
  if (error instanceof Error) return error.message;
  return String(error);
}

function optionalString(value, maxLength = 160) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function requiredString(value, fieldName, maxLength = 160) {
  const normalized = optionalString(value, maxLength);
  if (!normalized) {
    throw new HttpsError("invalid-argument", `${fieldName} fehlt.`);
  }
  return normalized;
}

function enumValue(value, allowed, fallback) {
  const normalized = optionalString(value, 80) || fallback;
  return allowed.includes(normalized) ? normalized : fallback;
}

function minimalClientContext(data) {
  return {
    deviceId: optionalString(data.deviceId, 120),
    appSessionId: optionalString(data.appSessionId, 120),
    approximateLocationHash: optionalString(data.approximateLocationHash, 160),
    clientVersion: optionalString(data.clientVersion, 80),
  };
}

async function readOwnedMissionDoc({ collectionName, docId, userId, missionId, label }) {
  const normalizedDocId = optionalString(docId, 180);
  if (!normalizedDocId) return null;

  const snapshot = await db.collection(collectionName).doc(normalizedDocId).get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", `${label} wurde nicht gefunden.`);
  }

  const data = snapshot.data() || {};
  if (data.userId !== userId && data.ownerUserId !== userId) {
    throw new HttpsError("permission-denied", `${label} gehoert nicht diesem Nutzer.`);
  }

  if (data.missionId && data.missionId !== missionId) {
    throw new HttpsError("failed-precondition", `${label} passt nicht zu dieser Mission.`);
  }

  return { id: snapshot.id, data };
}

async function createRejectedScanEvent({ userId, publicCode, missionId, tagId, reason }) {
  const ref = db.collection("nfcScanEvents").doc();
  const event = {
    scanEventId: ref.id,
    publicCode: publicCode || "",
    userId,
    source: "nfc",
    missionId: missionId || null,
    status: "rejected",
    rejectionReason: reason,
    createdAt: now(),
    validatedAt: now(),
  };

  if (tagId) {
    event.tagId = tagId;
  }

  await ref.set(event);
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
    const reason = tag.status === "revoked" ? "tag-revoked" : "tag-not-active";
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, tagId, reason });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag ist nicht aktiv.", rejectionReason: reason };
  }

  if (tag.usageLimit && Number(tag.usageCount || 0) >= Number(tag.usageLimit)) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, tagId, reason: "usage-limit-reached" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag wurde bereits zu oft genutzt.", rejectionReason: "usage-limit-reached" };
  }

  if (tag.linkedMissionId && missionId && tag.linkedMissionId !== missionId) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, tagId, reason: "mission-mismatch" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag passt nicht zu dieser Mission.", rejectionReason: "mission-mismatch" };
  }

  if (Array.isArray(tag.allowedUserIds) && tag.allowedUserIds.length > 0 && !tag.allowedUserIds.includes(userId)) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, tagId, reason: "user-not-allowed" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag ist nicht fuer diesen Nutzer freigegeben.", rejectionReason: "user-not-allowed" };
  }

  const duplicateSnapshot = await db.collection("nfcScanEvents")
    .where("tagId", "==", tagId)
    .where("userId", "==", userId)
    .where("missionId", "==", missionId)
    .where("status", "==", "validated")
    .limit(1)
    .get();

  if (!duplicateSnapshot.empty) {
    const scanEventId = await createRejectedScanEvent({ userId, publicCode, missionId, tagId, reason: "duplicate-scan" });
    return { accepted: false, scanEventId, tagId, message: "NFC-Tag wurde fuer diese Mission bereits genutzt.", rejectionReason: "duplicate-scan" };
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
    usageCount: incrementBy(1),
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

exports.createTrackingSession = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const missionId = requiredString(data.missionId, "missionId");
  const source = enumValue(data.source, ALLOWED_TRACKING_SOURCES, "mobile");
  const proofType = enumValue(data.proofType, ALLOWED_PROOF_TYPES, "motion");
  const sessionRef = db.collection("trackingSessions").doc();

  await sessionRef.set({
    sessionId: sessionRef.id,
    userId,
    missionId,
    source,
    proofType,
    status: "started",
    serverValidationStatus: "pending",
    proofEventCount: 0,
    rewardAuthorized: false,
    missionCompletionAuthorized: false,
    createdAt: now(),
    startedAt: now(),
    updatedAt: now(),
    ...minimalClientContext(data),
  });

  return {
    accepted: true,
    sessionId: sessionRef.id,
    status: "started",
    serverValidationStatus: "pending",
  };
});

exports.recordTrackingProof = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const sessionId = requiredString(data.sessionId, "sessionId");
  const proofType = enumValue(data.proofType, ALLOWED_PROOF_TYPES, "motion");
  const clientClaimStatus = enumValue(data.status, ALLOWED_TRACKING_STATUSES, "proof-submitted");
  const sessionRef = db.collection("trackingSessions").doc(sessionId);
  const proofRef = db.collection("trackingProofEvents").doc();

  await db.runTransaction(async (transaction) => {
    const sessionDoc = await transaction.get(sessionRef);
    if (!sessionDoc.exists) {
      throw new HttpsError("not-found", "Tracking-Session wurde nicht gefunden.");
    }

    const session = sessionDoc.data();
    if (session.userId !== userId) {
      throw new HttpsError("permission-denied", "Tracking-Session gehoert nicht diesem Nutzer.");
    }

    transaction.set(proofRef, {
      proofEventId: proofRef.id,
      sessionId,
      userId,
      missionId: session.missionId || null,
      proofType,
      clientClaimStatus,
      serverValidationStatus: "received",
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      createdAt: now(),
      ...minimalClientContext(data),
    });

    transaction.update(sessionRef, {
      status: clientClaimStatus === "completed" ? "proof-submitted" : clientClaimStatus,
      lastProofType: proofType,
      lastProofEventId: proofRef.id,
      proofEventCount: incrementBy(1),
      serverValidationStatus: "proof-received",
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      updatedAt: now(),
    });
  });

  return {
    accepted: true,
    proofEventId: proofRef.id,
    sessionId,
    serverValidationStatus: "received",
  };
});

exports.createMissionBuddyEvent = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const missionId = requiredString(data.missionId, "missionId");
  const buddyId = optionalString(data.buddyId, 120) || "default";
  const eventType = enumValue(data.eventType, ALLOWED_BUDDY_EVENT_TYPES, "missionExplained");
  const status = enumValue(data.status, ALLOWED_BUDDY_EVENT_STATUSES, "recorded");
  const eventRef = db.collection("missionBuddyEvents").doc();

  await eventRef.set({
    eventId: eventRef.id,
    userId,
    buddyId,
    missionId,
    eventType,
    status,
    itemId: optionalString(data.itemId, 120),
    capabilityId: optionalString(data.capabilityId, 120),
    messageKey: optionalString(data.messageKey, 160),
    serverValidationStatus: "recorded",
    rewardAuthorized: false,
    missionCompletionAuthorized: false,
    createdAt: now(),
    ...minimalClientContext(data),
  });

  return {
    accepted: true,
    eventId: eventRef.id,
    serverValidationStatus: "recorded",
  };
});

exports.evaluateMissionCompletion = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const missionId = requiredString(data.missionId, "missionId");
  const evaluationRef = db.collection("missionCompletionEvaluations").doc();

  const trackingSession = await readOwnedMissionDoc({
    collectionName: "trackingSessions",
    docId: data.trackingSessionId,
    userId,
    missionId,
    label: "Tracking-Session",
  });

  const trackingProof = await readOwnedMissionDoc({
    collectionName: "trackingProofEvents",
    docId: data.trackingProofEventId,
    userId,
    missionId,
    label: "Tracking-Proof",
  });

  const nfcScan = await readOwnedMissionDoc({
    collectionName: "nfcScanEvents",
    docId: data.nfcScanEventId,
    userId,
    missionId,
    label: "NFC-Scan",
  });

  const buddyEvent = await readOwnedMissionDoc({
    collectionName: "missionBuddyEvents",
    docId: data.missionBuddyEventId,
    userId,
    missionId,
    label: "Buddy-Event",
  });

  const evidenceRefs = {
    trackingSessionId: trackingSession ? trackingSession.id : null,
    trackingProofEventId: trackingProof ? trackingProof.id : null,
    nfcScanEventId: nfcScan ? nfcScan.id : null,
    missionBuddyEventId: buddyEvent ? buddyEvent.id : null,
  };

  const evidenceCount = Object.values(evidenceRefs).filter(Boolean).length;
  const preliminaryStatus = evidenceCount > 0 ? "needs-review" : "insufficient-evidence";

  await evaluationRef.set({
    evaluationId: evaluationRef.id,
    userId,
    missionId,
    evidenceRefs,
    evidenceCount,
    preliminaryStatus,
    serverValidationStatus: "evaluation-created",
    accepted: false,
    rejectionReason: evidenceCount > 0 ? "manual-review-required" : "insufficient-evidence",
    rewardAuthorized: false,
    missionCompletionAuthorized: false,
    xpAuthorized: false,
    pointsAuthorized: false,
    createdAt: now(),
    updatedAt: now(),
    ...minimalClientContext(data),
  });

  return {
    accepted: false,
    evaluationId: evaluationRef.id,
    preliminaryStatus,
    evidenceCount,
    rewardAuthorized: false,
    missionCompletionAuthorized: false,
    rejectionReason: evidenceCount > 0 ? "manual-review-required" : "insufficient-evidence",
  };
});

exports.seedDemoItemsAndNfc = onCall(async (request) => {
  requireAdmin(request);
  try {
    const result = await runDemoItemsAndNfcSeed(db);
    return {
      accepted: true,
      message: "Demo Items und NFC Tags wurden angelegt.",
      ...result,
    };
  } catch (error) {
    console.error("seedDemoItemsAndNfc failed", error);
    throw new HttpsError("internal", `Seed Demo Items/NFC fehlgeschlagen: ${toErrorMessage(error)}`);
  }
});

exports.grantItemOrCapability = onCall(async () => {
  throw new HttpsError("failed-precondition", "grantItemOrCapability ist vorerst nur als interner Server-Flow geplant.");
});

exports.validateMissionCompletionWithItem = onCall(async () => {
  throw new HttpsError("failed-precondition", "validateMissionCompletionWithItem ist geplant, aber noch nicht fuer Produktion aktiviert.");
});
