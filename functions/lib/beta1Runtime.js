const { FieldValue } = require("firebase-admin/firestore");

const BETA1_INTERNAL_CURRENCY = "WFXP";
const MAX_GLITCH_MULTIPLIER = 10;
const MAX_GLITCH_DURATION_MINUTES = 10;
const BETA1_ALLOWED_GLITCH_REGION_IDS = new Set(["vienna", "wien", "lower-austria", "lower_austria", "niederoesterreich", "niederösterreich"]);

function requireAuth(request, HttpsError) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Login erforderlich.");
  }
  return request.auth.uid;
}

function requireAdmin(request, HttpsError) {
  const userId = requireAuth(request, HttpsError);
  if (!request.auth.token || request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Admin-Berechtigung erforderlich.");
  }
  return userId;
}

function optionalString(value, maxLength = 160) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function requiredString(value, fieldName, HttpsError, maxLength = 160) {
  const normalized = optionalString(value, maxLength);
  if (!normalized) throw new HttpsError("invalid-argument", `${fieldName} fehlt.`);
  return normalized;
}

function normalizedPositiveInteger(value, fallback = 0, max = 100000) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.floor(number), max);
}

function booleanValue(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return value === true;
}

function serverTimestamps() {
  return {
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function updatedTimestamp() {
  return { updatedAt: FieldValue.serverTimestamp() };
}

function clientContext(data) {
  return {
    deviceId: optionalString(data.deviceId, 120),
    appSessionId: optionalString(data.appSessionId, 120),
    clientVersion: optionalString(data.clientVersion, 80),
  };
}

function docData(snapshot) {
  return snapshot.exists ? { id: snapshot.id, ...(snapshot.data() || {}) } : null;
}

function scopedOwnerFields(userId, childProfileId) {
  return {
    ownerUserId: userId,
    userId,
    childProfileId: childProfileId || null,
  };
}

async function assertGuardianCanUseChild(db, guardianUserId, childProfileId, HttpsError) {
  const normalizedChildProfileId = optionalString(childProfileId, 160);
  if (!normalizedChildProfileId) return null;
  const childSnapshot = await db.collection("childProfiles").doc(normalizedChildProfileId).get();
  if (!childSnapshot.exists) {
    throw new HttpsError("not-found", "Child Profile wurde nicht gefunden.");
  }
  const child = childSnapshot.data() || {};
  if (!Array.isArray(child.guardianUserIds) || !child.guardianUserIds.includes(guardianUserId)) {
    throw new HttpsError("permission-denied", "Guardian ist fuer dieses Child Profile nicht berechtigt.");
  }
  if (child.status && child.status !== "active") {
    throw new HttpsError("failed-precondition", "Child Profile ist nicht aktiv.");
  }
  return { id: childSnapshot.id, ...child };
}

async function hasActiveConsent(db, guardianUserId, childProfileId, consentType) {
  const snapshot = await db.collection("parentalConsents")
    .where("guardianUserId", "==", guardianUserId)
    .where("childProfileId", "==", childProfileId)
    .where("consentType", "==", consentType)
    .where("status", "==", "active")
    .limit(1)
    .get();
  return !snapshot.empty;
}

async function requireChildConsent(db, guardianUserId, childProfileId, consentType, HttpsError) {
  if (!childProfileId) return;
  const active = await hasActiveConsent(db, guardianUserId, childProfileId, consentType);
  if (!active) {
    throw new HttpsError("failed-precondition", `Aktive Zustimmung fuer ${consentType} erforderlich.`);
  }
}

function requireChildPermission(childProfile, permissionName, HttpsError) {
  if (!childProfile) return;
  const permissions = childProfile.permissions || {};
  if (permissions[permissionName] !== true) {
    throw new HttpsError("failed-precondition", `Child Permission ${permissionName} erforderlich.`);
  }
}

function isAllowedBeta1GlitchRegion(regionId) {
  const normalized = optionalString(regionId, 80);
  return !!normalized && BETA1_ALLOWED_GLITCH_REGION_IDS.has(normalized.toLowerCase());
}

function parseRequiredDate(value, fieldName, HttpsError) {
  const raw = requiredString(value, fieldName, HttpsError, 80);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new HttpsError("invalid-argument", `${fieldName} muss ein gueltiger ISO-Zeitpunkt sein.`);
  }
  return date;
}

function minutesBetween(startDate, endDate) {
  return (endDate.getTime() - startDate.getTime()) / 60000;
}

async function writeAudit(db, { actorUserId, actionType, targetType, targetId, reason, ownerUserId, childProfileId, metadata }) {
  const adminActionRef = db.collection("adminActions").doc();
  const auditEventRef = db.collection("auditEvents").doc();
  const base = {
    actorUserId: actorUserId || "server",
    actionType,
    targetType,
    targetId: targetId || null,
    reason: optionalString(reason, 500) || "beta1-server-authorized",
    ownerUserId: ownerUserId || actorUserId || null,
    userId: ownerUserId || actorUserId || null,
    childProfileId: childProfileId || null,
    metadata: metadata || {},
    source: "beta1-runtime",
    ...serverTimestamps(),
  };
  await Promise.all([
    adminActionRef.set({ adminActionId: adminActionRef.id, ...base }),
    auditEventRef.set({ auditEventId: auditEventRef.id, ...base }),
  ]);
  return { adminActionId: adminActionRef.id, auditEventId: auditEventRef.id };
}

async function getWalletRef(db, ownerUserId, childProfileId) {
  const walletId = childProfileId ? `${ownerUserId}_${childProfileId}` : ownerUserId;
  return db.collection("xpWallets").doc(walletId);
}

module.exports = {
  BETA1_INTERNAL_CURRENCY,
  MAX_GLITCH_MULTIPLIER,
  MAX_GLITCH_DURATION_MINUTES,
  BETA1_ALLOWED_GLITCH_REGION_IDS,
  requireAuth,
  requireAdmin,
  optionalString,
  requiredString,
  normalizedPositiveInteger,
  booleanValue,
  serverTimestamps,
  updatedTimestamp,
  clientContext,
  docData,
  scopedOwnerFields,
  assertGuardianCanUseChild,
  hasActiveConsent,
  requireChildConsent,
  requireChildPermission,
  isAllowedBeta1GlitchRegion,
  parseRequiredDate,
  minutesBetween,
  writeAudit,
  getWalletRef,
};
