const { createHash } = require("node:crypto");
const { optionalString } = require("./beta1Runtime");

const LOCATION_SAFETY_REVIEW_VERSION = "beta1-location-safety-v1";
const MIN_SAFETY_REVIEW_NOTE_LENGTH = 20;
const LOCATION_ID_PATTERN = /^[a-z0-9](?:[a-z0-9._:-]{0,158}[a-z0-9])?$/i;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

function normalizeLocationId(value) {
  const locationId = optionalString(value, 160);
  return locationId && LOCATION_ID_PATTERN.test(locationId) ? locationId.toLowerCase() : null;
}

function normalizeCountryCode(value) {
  const countryCode = optionalString(value, 8);
  if (!countryCode) return null;
  const normalized = countryCode.toUpperCase();
  return COUNTRY_CODE_PATTERN.test(normalized) ? normalized : null;
}

function normalizeMissionIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((entry) => optionalString(entry, 160)).filter(Boolean))].sort()
    : [];
}

function validSafetyReviewNote(value) {
  const note = optionalString(value, 500);
  return note && note.length >= MIN_SAFETY_REVIEW_NOTE_LENGTH ? note : null;
}

function normalizedCoordinate(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return Number(number.toFixed(6));
}

function canonicalSafetyPayload(location) {
  const locationId = normalizeLocationId(location.locationId);
  const regionId = optionalString(location.regionId, 80)?.toLowerCase() || null;
  const countryCode = normalizeCountryCode(location.countryCode);
  const locality = optionalString(location.locality, 120);
  const locationType = optionalString(location.locationType, 80) || "public-space";
  const latitude = normalizedCoordinate(location.latitude, -90, 90);
  const longitude = normalizedCoordinate(location.longitude, -180, 180);
  const missionIds = normalizeMissionIds(location.missionIds);
  if (!locationId || !regionId || latitude === null || longitude === null || missionIds.length === 0) return null;
  return {
    version: LOCATION_SAFETY_REVIEW_VERSION,
    locationId,
    regionId,
    countryCode,
    locality,
    locationType,
    latitude,
    longitude,
    missionIds,
  };
}

function locationSafetyFingerprint(location) {
  const payload = canonicalSafetyPayload(location);
  if (!payload) return null;
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function buildLocationSafetyFields(location, actorUserId, reviewedAt = new Date()) {
  const reviewerId = optionalString(actorUserId, 160);
  const note = validSafetyReviewNote(location.safetyReviewNote);
  const fingerprint = locationSafetyFingerprint(location);
  const reviewedAtDate = reviewedAt instanceof Date ? reviewedAt : new Date(reviewedAt);
  if (!reviewerId || !note || !fingerprint || Number.isNaN(reviewedAtDate.getTime())) return null;
  return {
    safeLocationReviewed: true,
    safetyReviewNote: note,
    safetyReviewVersion: LOCATION_SAFETY_REVIEW_VERSION,
    safetyReviewFingerprint: fingerprint,
    safetyReviewedByAdminId: reviewerId,
    safetyReviewedAt: reviewedAtDate.toISOString(),
  };
}

function hasValidLocationSafetyReview(location) {
  if (!location || typeof location !== "object") return false;
  const reviewedAt = optionalString(location.safetyReviewedAt, 80);
  const reviewedAtDate = reviewedAt ? new Date(reviewedAt) : null;
  return location.safeLocationReviewed === true
    && location.safetyReviewVersion === LOCATION_SAFETY_REVIEW_VERSION
    && Boolean(optionalString(location.safetyReviewedByAdminId, 160))
    && Boolean(validSafetyReviewNote(location.safetyReviewNote))
    && Boolean(reviewedAtDate && !Number.isNaN(reviewedAtDate.getTime()))
    && location.safetyReviewFingerprint === locationSafetyFingerprint(location);
}

function isPublishedSafeMissionLocation(location) {
  return Boolean(location && location.status === "published" && hasValidLocationSafetyReview(location));
}

async function requirePublishedMissionIds(db, missionIds, HttpsError) {
  const normalizedIds = normalizeMissionIds(missionIds);
  if (normalizedIds.length === 0) {
    throw new HttpsError("invalid-argument", "Mindestens eine Mission muss dem Ort zugeordnet sein.");
  }
  const snapshots = await Promise.all(normalizedIds.map((missionId) => db.collection("missions").doc(missionId).get()));
  const unavailable = snapshots
    .filter((snapshot) => !snapshot.exists || (snapshot.data() || {}).status !== "published")
    .map((snapshot) => snapshot.id);
  if (unavailable.length > 0) {
    throw new HttpsError(
      "failed-precondition",
      `Missionsorte duerfen nur veroeffentlichte Missionen referenzieren: ${unavailable.slice(0, 5).join(", ")}.`,
    );
  }
  return normalizedIds;
}

module.exports = {
  LOCATION_SAFETY_REVIEW_VERSION,
  MIN_SAFETY_REVIEW_NOTE_LENGTH,
  normalizeLocationId,
  normalizeCountryCode,
  normalizeMissionIds,
  validSafetyReviewNote,
  canonicalSafetyPayload,
  locationSafetyFingerprint,
  buildLocationSafetyFields,
  hasValidLocationSafetyReview,
  isPublishedSafeMissionLocation,
  requirePublishedMissionIds,
};
