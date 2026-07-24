const { FieldPath } = require("firebase-admin/firestore");
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
const MAX_GEO_CANDIDATES = 10000;
const DEFAULT_START_DISTANCE_KM = 0.5;
const FIRESTORE_IN_VALUE_LIMIT = 30;
const TARGET_MAX_GEO_CELLS = 240;
const MAX_REINDEX_BATCH = 400;
const GEO_INDEX_VERSION = "grid-v1";
const GEO_INDEX_LEVELS = [
  { field: "geoCell001", sizeDegrees: 0.01, idPrefix: "g001" },
  { field: "geoCell005", sizeDegrees: 0.05, idPrefix: "g005" },
  { field: "geoCell01", sizeDegrees: 0.1, idPrefix: "g01" },
  { field: "geoCell025", sizeDegrees: 0.25, idPrefix: "g025" },
  { field: "geoCell05", sizeDegrees: 0.5, idPrefix: "g05" },
  { field: "geoCell1", sizeDegrees: 1, idPrefix: "g1" },
  { field: "geoCell5", sizeDegrees: 5, idPrefix: "g5" },
  { field: "geoCell15", sizeDegrees: 15, idPrefix: "g15" },
];
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

function normalizeLongitude(value) {
  const normalized = ((Number(value) + 180) % 360 + 360) % 360 - 180;
  return normalized === 180 ? -180 : normalized;
}

function geoCellId(coordinates, level) {
  const latitude = Math.max(-90, Math.min(89.999999, Number(coordinates.latitude)));
  const longitude = normalizeLongitude(coordinates.longitude);
  const latitudeCellCount = Math.ceil(180 / level.sizeDegrees);
  const longitudeCellCount = Math.ceil(360 / level.sizeDegrees);
  const latitudeIndex = Math.max(0, Math.min(
    latitudeCellCount - 1,
    Math.floor((latitude + 90) / level.sizeDegrees),
  ));
  const longitudeIndex = Math.max(0, Math.min(
    longitudeCellCount - 1,
    Math.floor((longitude + 180) / level.sizeDegrees),
  ));
  return `${level.idPrefix}:${latitudeIndex}:${longitudeIndex}`;
}

function geoIndexFields(coordinates) {
  return {
    geoIndexVersion: GEO_INDEX_VERSION,
    ...Object.fromEntries(GEO_INDEX_LEVELS.map((level) => [level.field, geoCellId(coordinates, level)])),
  };
}

function nearbyGeoCellIds(origin, radiusKm, level) {
  const latitudeCellCount = Math.ceil(180 / level.sizeDegrees);
  const longitudeCellCount = Math.ceil(360 / level.sizeDegrees);
  const centerLatitude = Math.max(-90, Math.min(89.999999, Number(origin.latitude)));
  const centerLongitude = normalizeLongitude(origin.longitude);
  const centerLatitudeIndex = Math.max(0, Math.min(
    latitudeCellCount - 1,
    Math.floor((centerLatitude + 90) / level.sizeDegrees),
  ));
  const centerLongitudeIndex = Math.max(0, Math.min(
    longitudeCellCount - 1,
    Math.floor((centerLongitude + 180) / level.sizeDegrees),
  ));

  const latitudeDelta = Math.min(180, radiusKm / 110.574);
  const latitudeCosine = Math.max(0.01, Math.abs(Math.cos(centerLatitude * Math.PI / 180)));
  const longitudeDelta = Math.min(180, radiusKm / (111.32 * latitudeCosine));
  const latitudeReach = Math.ceil(latitudeDelta / level.sizeDegrees) + 1;
  const longitudeReach = longitudeDelta >= 180
    ? longitudeCellCount
    : Math.ceil(longitudeDelta / level.sizeDegrees) + 1;

  const latitudeIndexes = [];
  for (
    let latitudeIndex = Math.max(0, centerLatitudeIndex - latitudeReach);
    latitudeIndex <= Math.min(latitudeCellCount - 1, centerLatitudeIndex + latitudeReach);
    latitudeIndex += 1
  ) {
    latitudeIndexes.push(latitudeIndex);
  }

  const longitudeIndexes = new Set();
  if (longitudeReach * 2 + 1 >= longitudeCellCount) {
    for (let longitudeIndex = 0; longitudeIndex < longitudeCellCount; longitudeIndex += 1) {
      longitudeIndexes.add(longitudeIndex);
    }
  } else {
    for (let offset = -longitudeReach; offset <= longitudeReach; offset += 1) {
      longitudeIndexes.add((centerLongitudeIndex + offset + longitudeCellCount) % longitudeCellCount);
    }
  }

  const cells = [];
  for (const latitudeIndex of latitudeIndexes) {
    for (const longitudeIndex of longitudeIndexes) {
      cells.push(`${level.idPrefix}:${latitudeIndex}:${longitudeIndex}`);
    }
  }
  return cells;
}

function selectGeoQuery(origin, radiusKm) {
  const options = GEO_INDEX_LEVELS.map((level) => ({
    ...level,
    cells: nearbyGeoCellIds(origin, radiusKm, level),
  }));
  return options.find((option) => option.cells.length <= TARGET_MAX_GEO_CELLS)
    || options.reduce((best, option) => option.cells.length < best.cells.length ? option : best);
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

async function readGeoCandidateDocuments(db, origin, radiusKm) {
  const geoQuery = selectGeoQuery(origin, radiusKm);
  const cellBatches = chunk(geoQuery.cells, FIRESTORE_IN_VALUE_LIMIT);
  const snapshots = await Promise.all(cellBatches.map((cells) => db.collection("missionLocations")
    .where(geoQuery.field, "in", cells)
    .get()));
  const byId = new Map();
  for (const snapshot of snapshots) {
    for (const doc of snapshot.docs) byId.set(doc.id, doc);
  }
  return {
    docs: [...byId.values()],
    field: geoQuery.field,
    sizeDegrees: geoQuery.sizeDegrees,
    cellCount: geoQuery.cells.length,
    queryCount: cellBatches.length,
  };
}

function safeMissionIds(value) {
  return Array.isArray(value)
    ? value.map((entry) => optionalString(entry, 160)).filter(Boolean).slice(0, 20)
    : [];
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
    missionIds: safeMissionIds(data.missionIds),
    safeLocationReviewed: data.safeLocationReviewed === true,
    status: "published",
  };
}

async function requirePublishedNearbyMissionLocation(db, input, HttpsError) {
  const locationId = requiredString(input.locationId, "locationId", HttpsError, 160);
  const missionId = requiredString(input.missionId, "missionId", HttpsError, 160);
  const origin = normalizeCoordinates(input, HttpsError);
  const maximumDistanceKm = Number.isFinite(Number(input.maxDistanceKm))
    ? Math.max(0.05, Math.min(5, Number(input.maxDistanceKm)))
    : DEFAULT_START_DISTANCE_KM;
  const snapshot = await db.collection("missionLocations").doc(locationId).get();
  if (!snapshot.exists) throw new HttpsError("not-found", "Der ausgewaehlte WellFit-Ort wurde nicht gefunden.");
  const location = snapshot.data() || {};
  const missionIds = safeMissionIds(location.missionIds);
  if (
    location.status !== "published"
    || location.safeLocationReviewed !== true
    || !missionIds.includes(missionId)
    || !Number.isFinite(Number(location.latitude))
    || !Number.isFinite(Number(location.longitude))
  ) {
    throw new HttpsError("failed-precondition", "Der ausgewaehlte Ort ist fuer diese Mission nicht sicher veroeffentlicht.");
  }
  const distanceKm = haversineDistanceKm(origin, {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
  });
  if (!Number.isFinite(distanceKm) || distanceKm > maximumDistanceKm) {
    throw new HttpsError(
      "failed-precondition",
      `Die Mission kann nur in der Naehe des veroeffentlichten Orts gestartet werden (maximal ${Math.round(maximumDistanceKm * 1000)} Meter).`,
    );
  }
  return {
    locationId,
    missionId,
    title: optionalString(location.title, 120) || "WellFit Ort",
    regionId: optionalString(location.regionId, 80),
    countryCode: optionalString(location.countryCode, 8),
    locality: optionalString(location.locality, 120),
    locationType: optionalString(location.locationType, 80) || "public-space",
    distanceKm,
    distanceMeters: Math.round(distanceKm * 1000),
    maximumDistanceKm,
    locationAuthority: "server-published-nearby",
    userLocationStored: false,
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
    const missionIds = new Set(safeMissionIds(data.missionIds));
    const locationTypes = new Set(Array.isArray(data.locationTypes)
      ? data.locationTypes.map((value) => optionalString(value, 80)).filter(Boolean).slice(0, 10)
      : []);

    const candidates = await readGeoCandidateDocuments(db, origin, radiusKm);
    if (candidates.docs.length > MAX_GEO_CANDIDATES) {
      throw new HttpsError(
        "resource-exhausted",
        "In dieser Umgebung liegen zu viele Missionsorte. Bitte Radius oder Missionsfilter verkleinern.",
      );
    }
    const locations = candidates.docs
      .flatMap((doc) => {
        const location = doc.data() || {};
        if (
          location.status !== "published"
          || location.safeLocationReviewed !== true
          || location.geoIndexVersion !== GEO_INDEX_VERSION
          || !Number.isFinite(Number(location.latitude))
          || !Number.isFinite(Number(location.longitude))
        ) {
          return [];
        }
        const publishedMissionIds = safeMissionIds(location.missionIds);
        if (missionIds.size > 0 && !publishedMissionIds.some((missionId) => missionIds.has(missionId))) return [];
        const locationType = optionalString(location.locationType, 80) || "public-space";
        if (locationTypes.size > 0 && !locationTypes.has(locationType)) return [];
        const distanceKm = haversineDistanceKm(origin, {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        });
        if (!Number.isFinite(distanceKm) || distanceKm > radiusKm) return [];
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
      geoIndexAuthority: GEO_INDEX_VERSION,
      geoQueryCellSizeDegrees: candidates.sizeDegrees,
      geoQueryCellCount: candidates.cellCount,
      geoQueryCount: candidates.queryCount,
      candidateCount: candidates.docs.length,
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
    const missionIds = [...new Set(safeMissionIds(data.missionIds))];
    if (missionIds.length === 0) {
      throw new HttpsError("invalid-argument", "Mindestens eine Mission muss dem Ort zugeordnet sein.");
    }
    const status = data.status === "published" ? "published" : "draft";
    if (status === "published" && data.safeLocationReviewed !== true) {
      throw new HttpsError("failed-precondition", "Ein veroeffentlichter Missionsort benoetigt eine dokumentierte Sicherheitspruefung.");
    }

    const ref = db.collection("missionLocations").doc(locationId);
    const snapshot = await ref.get();
    const indexFields = geoIndexFields(coordinates);
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
      ...indexFields,
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
        geoIndexVersion: GEO_INDEX_VERSION,
      },
    });

    return {
      accepted: true,
      locationId,
      regionId,
      status,
      missionIds,
      safeLocationReviewed: data.safeLocationReviewed === true,
      geoIndexVersion: GEO_INDEX_VERSION,
      globalCatalog: true,
    };
  });

  exportsTarget.adminReindexMissionLocations = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const requestedLimit = normalizedPositiveInteger(data.limit, 200, MAX_REINDEX_BATCH);
    const afterLocationId = optionalString(data.afterLocationId, 160);
    let query = db.collection("missionLocations").orderBy(FieldPath.documentId()).limit(requestedLimit);
    if (afterLocationId) query = query.startAfter(afterLocationId);
    const snapshot = await query.get();
    const batch = db.batch();
    let updatedCount = 0;
    let skippedCount = 0;

    for (const doc of snapshot.docs) {
      const location = doc.data() || {};
      const latitude = Number(location.latitude);
      const longitude = Number(location.longitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        skippedCount += 1;
        continue;
      }
      const indexFields = geoIndexFields({ latitude, longitude });
      if (
        location.geoIndexVersion === indexFields.geoIndexVersion
        && GEO_INDEX_LEVELS.every((level) => location[level.field] === indexFields[level.field])
      ) {
        continue;
      }
      batch.set(doc.ref, {
        ...indexFields,
        geoIndexUpdatedByAdminId: actorUserId,
        ...updatedTimestamp(),
      }, { merge: true });
      updatedCount += 1;
    }
    if (updatedCount > 0) await batch.commit();

    const nextAfterLocationId = snapshot.docs.at(-1)?.id || null;
    await writeAudit(db, {
      actorUserId,
      actionType: "mission-location-geo-index-reconciled",
      targetType: "missionLocationCatalog",
      targetId: nextAfterLocationId || "empty",
      reason: data.reason,
      metadata: {
        scannedCount: snapshot.size,
        updatedCount,
        skippedCount,
        afterLocationId,
        nextAfterLocationId,
        geoIndexVersion: GEO_INDEX_VERSION,
      },
    });

    return {
      accepted: true,
      scannedCount: snapshot.size,
      updatedCount,
      skippedCount,
      nextAfterLocationId,
      hasMore: snapshot.size === requestedLimit,
      geoIndexVersion: GEO_INDEX_VERSION,
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
      geoIndexVersion: GEO_INDEX_VERSION,
      globalCatalog: true,
    };
  });
}

module.exports = {
  registerBeta1NearbyMissionLocations,
  normalizeRegionId,
  normalizeCoordinates,
  haversineDistanceKm,
  normalizeLongitude,
  geoCellId,
  geoIndexFields,
  nearbyGeoCellIds,
  selectGeoQuery,
  readGeoCandidateDocuments,
  safeMissionIds,
  publicMissionLocation,
  requirePublishedNearbyMissionLocation,
  DEFAULT_START_DISTANCE_KM,
  GEO_INDEX_VERSION,
  GEO_INDEX_LEVELS,
};
