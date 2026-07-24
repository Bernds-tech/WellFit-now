const assert = require("node:assert/strict");
const {
  LOCATION_SAFETY_REVIEW_VERSION,
  normalizeLocationId,
  normalizeCountryCode,
  canonicalSafetyPayload,
  locationSafetyFingerprint,
  buildLocationSafetyFields,
  hasValidLocationSafetyReview,
  isPublishedSafeMissionLocation,
} = require("../lib/beta1MissionLocationSafety");

function baseLocation() {
  return {
    locationId: "Tokyo-Museum-1",
    regionId: "JP-Tokyo",
    countryCode: "jp",
    locality: "Tokyo",
    locationType: "museum",
    latitude: 35.7100634,
    longitude: 139.8107004,
    missionIds: ["adventure-museum-quiz", "challenge-math-speed", "adventure-museum-quiz"],
    safetyReviewNote: "Sicherheitsprüfung vor Ort vollständig dokumentiert.",
    status: "published",
  };
}

function run() {
  assert.equal(normalizeLocationId("Tokyo-Museum-1"), "tokyo-museum-1");
  assert.equal(normalizeLocationId("invalid/location"), null);
  assert.equal(normalizeCountryCode("at"), "AT");
  assert.equal(normalizeCountryCode("AUT"), null);

  const location = baseLocation();
  const payload = canonicalSafetyPayload(location);
  assert.equal(payload.version, LOCATION_SAFETY_REVIEW_VERSION);
  assert.equal(payload.locationId, "tokyo-museum-1");
  assert.equal(payload.regionId, "jp-tokyo");
  assert.deepEqual(payload.missionIds, ["adventure-museum-quiz", "challenge-math-speed"]);

  const fingerprint = locationSafetyFingerprint(location);
  assert.match(fingerprint, /^[a-f0-9]{64}$/);
  assert.equal(locationSafetyFingerprint({ ...location, title: "Anderer Titel" }), fingerprint, "Reine Anzeige-Titel duerfen die Sicherheitsfreigabe nicht invalidieren.");
  assert.notEqual(locationSafetyFingerprint({ ...location, latitude: 35.72 }), fingerprint, "Koordinatenaenderungen muessen die Sicherheitsfreigabe invalidieren.");
  assert.notEqual(locationSafetyFingerprint({ ...location, missionIds: ["adventure-city-sprint"] }), fingerprint, "Missionsaenderungen muessen die Sicherheitsfreigabe invalidieren.");

  const safetyFields = buildLocationSafetyFields(location, "admin-reviewer", "2026-07-24T10:00:00.000Z");
  assert(safetyFields);
  const published = {
    ...location,
    locationId: normalizeLocationId(location.locationId),
    regionId: location.regionId.toLowerCase(),
    countryCode: normalizeCountryCode(location.countryCode),
    missionIds: payload.missionIds,
    ...safetyFields,
  };
  assert.equal(hasValidLocationSafetyReview(published), true);
  assert.equal(isPublishedSafeMissionLocation(published), true);
  assert.equal(hasValidLocationSafetyReview({ ...published, longitude: 139.9 }), false);
  assert.equal(hasValidLocationSafetyReview({ ...published, safetyReviewNote: "zu kurz" }), false);
  assert.equal(isPublishedSafeMissionLocation({ ...published, status: "draft" }), false);
  assert.equal(buildLocationSafetyFields({ ...location, safetyReviewNote: "zu kurz" }, "admin"), null);

  console.log("WellFit Beta 1 Mission Location Safety Unit Test erfolgreich.");
}

run();
