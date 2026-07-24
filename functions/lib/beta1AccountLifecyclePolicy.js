const crypto = require("node:crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { requireAuth, optionalString } = require("./beta1Runtime");

const ACCOUNT_LIFECYCLE_VERSION = "2026-07-24-v1";
const ACCOUNT_EXPORT_VERSION = "2026-07-24-v1";
const ACCOUNT_DELETION_GRACE_DAYS = 7;
const ACCOUNT_EXPORT_EXPIRY_HOURS = 24;
const RECENT_AUTH_MAX_AGE_SECONDS = 10 * 60;
const BLOCKED_ACCOUNT_STATUSES = new Set([
  "deletion-pending",
  "deletion-processing",
  "deleted",
]);

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function asDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function requireRecentAuth(request, HttpsError, maxAgeSeconds = RECENT_AUTH_MAX_AGE_SECONDS) {
  const userId = requireAuth(request, HttpsError);
  const authTimeSeconds = Number(request.auth && request.auth.token && request.auth.token.auth_time);
  if (!Number.isFinite(authTimeSeconds) || authTimeSeconds <= 0) {
    throw new HttpsError("failed-precondition", "Aus Sicherheitsgruenden ist eine erneute Anmeldung erforderlich.");
  }
  const ageSeconds = Math.max(0, Math.floor(Date.now() / 1000) - Math.floor(authTimeSeconds));
  if (ageSeconds > maxAgeSeconds) {
    throw new HttpsError("failed-precondition", "Die letzte Anmeldung ist zu lange her. Bitte melde dich erneut an.");
  }
  return userId;
}

function lifecycleRef(db, userId) {
  return db.collection("accountLifecycleRecords").doc(userId);
}

async function readAccountLifecycle(db, userId) {
  const snapshot = await lifecycleRef(db, userId).get();
  return snapshot.exists
    ? { lifecycleId: snapshot.id, ...(snapshot.data() || {}) }
    : {
      lifecycleId: userId,
      ownerUserId: userId,
      userId,
      status: "active",
      freezeMutations: false,
      lifecycleVersion: ACCOUNT_LIFECYCLE_VERSION,
    };
}

function isAccountMutationBlocked(lifecycle) {
  if (!lifecycle) return false;
  return lifecycle.freezeMutations === true || BLOCKED_ACCOUNT_STATUSES.has(lifecycle.status);
}

async function assertAccountMutationAllowed(db, userId, HttpsError) {
  const lifecycle = await readAccountLifecycle(db, userId);
  if (isAccountMutationBlocked(lifecycle)) {
    throw new HttpsError(
      "failed-precondition",
      "Das Konto ist fuer neue Missionen, WFXP- und Shop-Aktionen eingefroren, solange ein Loeschantrag aktiv ist.",
    );
  }
  return lifecycle;
}

function requireDeletionConfirmation(data, tokenEmail, HttpsError) {
  const confirmation = optionalString(data && data.confirmation, 80);
  if (!confirmation || confirmation.toLocaleUpperCase("de-DE") !== "LOESCHEN") {
    throw new HttpsError("invalid-argument", "Zur Bestaetigung muss LOESCHEN eingegeben werden.");
  }
  const submittedEmail = optionalString(data && data.email, 320);
  const authenticatedEmail = optionalString(tokenEmail, 320);
  if (!submittedEmail || !authenticatedEmail || submittedEmail.toLowerCase() !== authenticatedEmail.toLowerCase()) {
    throw new HttpsError("permission-denied", "Die bestaetigte E-Mail-Adresse stimmt nicht mit dem angemeldeten Konto ueberein.");
  }
  return authenticatedEmail.toLowerCase();
}

function serializeFirestoreValue(value) {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
  }
  if (Buffer.isBuffer(value)) return { encoding: "base64", value: value.toString("base64") };
  if (Array.isArray(value)) return value.map(serializeFirestoreValue);
  if (typeof value === "object") {
    if (typeof value.latitude === "number" && typeof value.longitude === "number") {
      return { latitude: value.latitude, longitude: value.longitude };
    }
    if (typeof value.path === "string" && value.firestore) return { documentPath: value.path };
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serializeFirestoreValue(nested)]),
    );
  }
  return String(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function publicLifecycleState(lifecycle) {
  const status = optionalString(lifecycle && lifecycle.status, 80) || "active";
  return {
    lifecycleId: optionalString(lifecycle && lifecycle.lifecycleId, 180) || null,
    status,
    freezeMutations: isAccountMutationBlocked(lifecycle),
    deletionRequestedAt: asDate(lifecycle && lifecycle.deletionRequestedAt)?.toISOString()
      || optionalString(lifecycle && lifecycle.deletionRequestedAt, 80),
    deletionScheduledFor: asDate(lifecycle && lifecycle.deletionScheduledFor)?.toISOString()
      || optionalString(lifecycle && lifecycle.deletionScheduledFor, 80),
    deletionCancelledAt: asDate(lifecycle && lifecycle.deletionCancelledAt)?.toISOString()
      || optionalString(lifecycle && lifecycle.deletionCancelledAt, 80),
    deletionCompletedAt: asDate(lifecycle && lifecycle.deletionCompletedAt)?.toISOString()
      || optionalString(lifecycle && lifecycle.deletionCompletedAt, 80),
    lifecycleVersion: optionalString(lifecycle && lifecycle.lifecycleVersion, 80) || ACCOUNT_LIFECYCLE_VERSION,
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
  };
}

function lifecycleCreatePayload(userId) {
  return {
    lifecycleId: userId,
    ownerUserId: userId,
    userId,
    status: "active",
    freezeMutations: false,
    lifecycleVersion: ACCOUNT_LIFECYCLE_VERSION,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

module.exports = {
  ACCOUNT_LIFECYCLE_VERSION,
  ACCOUNT_EXPORT_VERSION,
  ACCOUNT_DELETION_GRACE_DAYS,
  ACCOUNT_EXPORT_EXPIRY_HOURS,
  RECENT_AUTH_MAX_AGE_SECONDS,
  safeDocIdPart,
  addHours,
  addDays,
  asDate,
  requireRecentAuth,
  lifecycleRef,
  readAccountLifecycle,
  isAccountMutationBlocked,
  assertAccountMutationAllowed,
  requireDeletionConfirmation,
  serializeFirestoreValue,
  sha256,
  publicLifecycleState,
  lifecycleCreatePayload,
};