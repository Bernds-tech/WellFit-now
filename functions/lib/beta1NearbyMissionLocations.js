const {
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  updatedTimestamp,
  writeAudit,
} = require("./beta1Runtime");

const MAX_LOCATION_DOCS = 500;
const MAX_NEARBY_RESULTS = 50;
const MAX_RADIUS_KM = 100;
const REGION_ID_PATTERN = /^[a-z0-9](?:[a-z0-9._:-]{0,78}[a-z0-9])?$/i;

function normalizeRegionId(value) {
  const regionId = optionalString(value, 80);
  return regionId && REGION_ID_PATTERN.test(regionId) ? regionId.toLowerCase() : null;
}

function finiteCoordinate(value, min, max, fieldName, HttpsError) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new HttpsError("invalid-argument", `${fieldName} liegt ausserhalb des gueltigen Bereichs.`);
  }
  return Number(number.toFixed(6));
}

function normalizeCoordinates(data, HttpsError) {
  return {
    latitude: finiteCoordinate(data.latitude, -90, 90, "latitude", HttpsError),
    longitude: finiteCoordinate(data.longitude, -180, 180, "longitude", HttpsError),
  };
}

function haversineDistanceKm(left, right) {
  const radius = 6371;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latDelta = toRadians(right.latitude - left.latitude);
  const lonDelta = toRadians(right.longitude - left.longitude);
  const leftLat = toRadians(left.latitude);
  const rightLat = toRadians(right.latitude);
  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(lonDelta / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function publicMissionLocation(doc, distanceKm) {
  const data = doc.data() || {};
  return {
    locationId: doc.id,
    title: optionalString(data.title, 120) || "WellFit Ort",
    subtitle: optionalString(data.subtitle, 180),
    regionId: optionalString(data.regionId, 80),
    countryCode: optionalString(data.countryCode, 8),
    locality: optionalString(data.locality, 120),
    locationType: optionalString(data.locationType, 80) || "public-space",
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    distanceKm: Number(distanceKm.toFixed(2)),
    icon: optionalString(data.icon, 12) || "📍",
    partnerName: optionalString(data.partnerName, 120),
    missionIds: Array.isArray(data.missionIds)
      ? data.missionIds.map((value) => optionalString(value, 160)).filter(Boolean).slice(0, 20)
      : [],
    safeLocationReviewed: data.safeLocationReviewed === true,
    status: "published",
  };
}

function registerBeta1NearbyMissionLocations(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getNearbyMissionLocations = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const data = request.data || {};
    const origin = normalizeCoordinates(data, HttpsError);
    const requestedRadius = Number(data.radiusKm);
    const radiusKm = Number.isFinite(requestedRadius)
      ? Math.max(0.25, Math.min(MAX_RADIUS_KM, requestedRadius))
      : 25;
    const missionIds = new Set(Array.isArray(data.missionIds)
      ? data.missionIds.map((value) => optionalString(value, 160)).filter(Boolean).slice(0, 20)
      : []);
    const locationTypes = new Set(Array.isArray(data.locationTypes)
      ? data.locationTypes.map((value) => optionalString(value, 80)).filter(Boolean).slice(0, 10)
      : []);

    const snapshot = await db.collection("missionLocations").limit(MAX_LOCATION_DOCS).get();
    const locations = snapshot.docs
      .flatMap((doc) => {
        const location = doc.data() || {};
        if (
          location.status !== "published"
          || location.safeLocationReviewed !== true
          || !Number.isFinite(Number(location.latitude))
          || !Number.isFinite(Number(location.longitude))
        ) {
          return [];
        }
        const publishedMissionIds = Array.isArray(location.missionIds)
          ? location.missionIds.map((value) => optionalString(value, 160)).filter(Boolean)
          : [];
        if (missionIds.size > 0 && !publishedMissionIds.some((missionId) => missionIds.has(missionId))) return [];
        const locationType = optionalString(location.locationType, 80) || "public-space";
        if (locationTypes.size > 0 && !locationTypes.has(locationType)) return [];
        const distanceKm = haversineDistanceKm(origin, {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        });
        if (distanceKm > radiusKm) return [];
        return [publicMissionLocation(doc, distanceKm)];
      })
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .slice(0, MAX_NEARBY_RESULTS);

    return {
      accepted: true,
      radiusKm,
      count: locations.length,
      locations,
      locationAuthority: "server-published-nearby",
      userLocationStored: false,
      globalCatalog: true,
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
    };
  });

  exportsTarget.adminUpsertMissionLocation = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const locationId = requiredString(data.locationId, "locationId", HttpsError, 160);
    const title = requiredString(data.title, "title", HttpsError, 120);
    const regionId = normalizeRegionId(data.regionId);
    if (!regionId) throw new HttpsError("invalid-argument", "regionId ist ungueltig.");
    const coordinates = normalizeCoordinates(data, HttpsError);
    const missionIds = Array.isArray(data.missionIds)
      ? [...new Set(data.missionIds.map((value) => optionalString(value, 160)).filter(Boolean))].slice(0, 20)
      : [];
    if (missionIds.length === 0) {
      throw new HttpsError("invalid-argument", "Mindestens eine Mission muss dem Ort zugeordnet sein.");
    }
    const status = data.status === "published" ? "published" : "draft";
    if (status === "published" && data.safeLocationReviewed !== true) {
      throw new HttpsError("failed-precondition", "Ein veroeffentlichter Missionsort benoetigt eine dokumentierte Sicherheitspruefung.");
    }

    const ref = db.collection("missionLocations").doc(locationId);
    const snapshot = await ref.get();
    await ref.set({
      locationId,
      title,
      subtitle: optionalString(data.subtitle, 180),
      regionId,
      countryCode: optionalString(data.countryCode, 8),
      locality: optionalString(data.locality, 120),
      locationType: optionalString(data.locationType, 80) || "public-space",
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      icon: optionalString(data.icon, 12) || "📍",
      partnerName: optionalString(data.partnerName, 120),
      missionIds,
      safeLocationReviewed: data.safeLocationReviewed === true,
      safetyReviewNote: optionalString(data.safetyReviewNote, 500),
      status,
      globalCatalog: true,
      createdByAdminId: snapshot.exists ? optionalString((snapshot.data() || {}).createdByAdminId, 160) || actorUserId : actorUserId,
      updatedByAdminId: actorUserId,
      ...(snapshot.exists ? updatedTimestamp() : serverTimestamps()),
    }, { merge: true });

    await writeAudit(db, {
      actorUserId,
      actionType: snapshot.exists ? "mission-location-updated" : "mission-location-created",
      targetType: "missionLocation",
      targetId: locationId,
      reason: data.safetyReviewNote,
      metadata: {
        regionId,
        countryCode: optionalString(data.countryCode, 8),
        status,
        missionCount: missionIds.length,
        safeLocationReviewed: data.safeLocationReviewed === true,
      },
    });

    return {
      accepted: true,
      locationId,
      regionId,
      status,
      missionIds,
      safeLocationReviewed: data.safeLocationReviewed === true,
      globalCatalog: true,
    };
  });

  exportsTarget.adminListMissionLocations = onCall(async (request) => {
    requireAdmin(request, HttpsError);
    const data = request.data || {};
    const requestedLimit = normalizedPositiveInteger(data.limit, 100, MAX_LOCATION_DOCS);
    const snapshot = await db.collection("missionLocations").limit(requestedLimit).get();
    return {
      accepted: true,
      count: snapshot.size,
      locations: snapshot.docs.map((doc) => ({ locationId: doc.id, ...(doc.data() || {}) })),
      globalCatalog: true,
    };
  });
}

module.exports = {
  registerBeta1NearbyMissionLocations,
  normalizeRegionId,
  normalizeCoordinates,
  haversineDistanceKm,
  publicMissionLocation,
};