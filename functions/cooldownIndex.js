const baseFunctions = require("./index");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { calculateMissionCooldownReview } = require("./lib/missionCooldownReview");

Object.assign(exports, baseFunctions);

const db = admin.firestore();

function optionalString(value, maxLength = 160) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Login erforderlich.");
  }
  return request.auth.uid;
}

function minimalClientContext(data) {
  return {
    deviceId: optionalString(data.deviceId, 120),
    appSessionId: optionalString(data.appSessionId, 120),
    approximateLocationHash: optionalString(data.approximateLocationHash, 160),
    clientVersion: optionalString(data.clientVersion, 80),
  };
}

async function readRecentUserDocs(collectionName, userId, limit = 80) {
  const snapshot = await db.collection(collectionName).where("userId", "==", userId).limit(limit).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }));
}

exports.reviewMissionCooldowns = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data || {};
  const missionId = optionalString(data.missionId, 160);
  const cooldownReviewRef = db.collection("missionCooldownReviews").doc();

  const [trackingSessions, trackingProofEvents, nfcScanEvents, missionBuddyEvents] = await Promise.all([
    readRecentUserDocs("trackingSessions", userId, 50),
    readRecentUserDocs("trackingProofEvents", userId, 80),
    readRecentUserDocs("nfcScanEvents", userId, 80),
    readRecentUserDocs("missionBuddyEvents", userId, 50),
  ]);

  const review = calculateMissionCooldownReview({
    missionId,
    deviceId: optionalString(data.deviceId, 120),
    appSessionId: optionalString(data.appSessionId, 120),
    trackingSessions,
    trackingProofEvents,
    nfcScanEvents,
    missionBuddyEvents,
  });

  await cooldownReviewRef.set({
    cooldownReviewId: cooldownReviewRef.id,
    userId,
    missionId: missionId || null,
    ...review,
    serverValidationStatus: "cooldown-reviewed",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    ...minimalClientContext(data),
  });

  return {
    accepted: false,
    cooldownReviewId: cooldownReviewRef.id,
    ...review,
    rewardAuthorized: false,
    xpAuthorized: false,
    pointsAuthorized: false,
    tokenAuthorized: false,
    missionCompletionAuthorized: false,
  };
});
