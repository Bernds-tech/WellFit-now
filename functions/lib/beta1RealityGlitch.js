const {
  MAX_GLITCH_MULTIPLIER,
  MAX_GLITCH_DURATION_MINUTES,
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  updatedTimestamp,
  assertGuardianCanUseChild,
  requireChildConsent,
  requireChildPermission,
  isAllowedBeta1GlitchRegion,
  parseRequiredDate,
  minutesBetween,
  writeAudit,
} = require("./beta1Runtime");
const {
  normalizeCoordinates,
  haversineDistanceKm,
} = require("./beta1NearbyMissionLocations");
const { isPublishedSafeMissionLocation } = require("./beta1MissionLocationSafety");

const MAX_CHECK_IN_DISTANCE_KM = 0.15;

function registerBeta1RealityGlitch(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.listGlitchEvents = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const data = request.data || {};
    const regionId = requiredString(data.regionId, "regionId", HttpsError, 80).toLowerCase();
    if (!isAllowedBeta1GlitchRegion(regionId)) {
      throw new HttpsError("invalid-argument", "regionId ist ungueltig.");
    }
    const snapshot = await db.collection("glitchEvents").limit(100).get();
    const events = snapshot.docs
      .filter((doc) => {
        const event = doc.data() || {};
        return event.status === "active" && event.regionId === regionId;
      })
      .slice(0, 20)
      .map((doc) => ({ glitchEventId: doc.id, ...(doc.data() || {}) }));
    return {
      accepted: true,
      regionId,
      maxMultiplier: MAX_GLITCH_MULTIPLIER,
      events,
      regionalAuthority: "server-published-location",
      globalCatalog: true,
    };
  });

  exportsTarget.adminScheduleGlitchEvent = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const requestedMultiplierCap = normalizedPositiveInteger(data.multiplierCap, 2, 100000);
    if (requestedMultiplierCap > MAX_GLITCH_MULTIPLIER) throw new HttpsError("failed-precondition", "Glitch Multiplier ist auf 10x begrenzt.");
    const multiplierCap = requestedMultiplierCap;
    const windowStartDate = parseRequiredDate(data.windowStart, "windowStart", HttpsError);
    const windowEndDate = parseRequiredDate(data.windowEnd, "windowEnd", HttpsError);
    const durationMinutes = minutesBetween(windowStartDate, windowEndDate);
    if (durationMinutes <= 0 || durationMinutes > MAX_GLITCH_DURATION_MINUTES) {
      throw new HttpsError("failed-precondition", "Glitch Dauer ist in Beta 1 auf maximal 10 Minuten begrenzt.");
    }
    const regionId = requiredString(data.regionId, "regionId", HttpsError, 80).toLowerCase();
    if (!isAllowedBeta1GlitchRegion(regionId)) {
      throw new HttpsError("invalid-argument", "regionId ist ungueltig.");
    }
    if (data.unsafeLocation === true) {
      throw new HttpsError("failed-precondition", "Reality Glitch benoetigt eine als sicher freigegebene Location.");
    }
    const locationIds = Array.isArray(data.locationIds)
      ? [...new Set(data.locationIds.map((item) => optionalString(item, 160)).filter(Boolean))].slice(0, 10)
      : [];
    if (locationIds.length === 0) throw new HttpsError("invalid-argument", "Mindestens eine sichere Location ist erforderlich.");

    const locationSnapshots = await Promise.all(locationIds.map((locationId) => db.collection("missionLocations").doc(locationId).get()));
    const invalidLocation = locationSnapshots.find((snapshot) => {
      if (!snapshot.exists) return true;
      const location = snapshot.data() || {};
      return !isPublishedSafeMissionLocation(location) || location.regionId !== regionId;
    });
    if (invalidLocation) {
      throw new HttpsError("failed-precondition", "Alle Glitch-Locations muessen veroeffentlicht, kryptografisch pruefbar sicher und derselben Region zugeordnet sein.");
    }

    const requestedGlitchEventId = optionalString(data.glitchEventId, 160);
    const glitchRef = requestedGlitchEventId ? db.collection("glitchEvents").doc(requestedGlitchEventId) : db.collection("glitchEvents").doc();
    await glitchRef.set({
      glitchEventId: glitchRef.id,
      regionId,
      locationIds,
      windowStart: windowStartDate.toISOString(),
      windowEnd: windowEndDate.toISOString(),
      durationMinutes,
      status: "active",
      multiplierCap,
      safeLocationReviewed: true,
      unsafeLocation: false,
      maxParticipants: normalizedPositiveInteger(data.maxParticipants, 25, 500),
      createdByAdminId: actorUserId,
      globalCatalog: true,
      ...serverTimestamps(),
    });
    await writeAudit(db, {
      actorUserId,
      actionType: "glitch-event-scheduled",
      targetType: "glitchEvent",
      targetId: glitchRef.id,
      reason: data.reason,
      metadata: { multiplierCap, locationIds, regionId },
    });
    return { accepted: true, glitchEventId: glitchRef.id, multiplierCap, regionId, globalCatalog: true };
  });

  exportsTarget.checkInToGlitch = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const glitchEventId = requiredString(data.glitchEventId, "glitchEventId", HttpsError);
    const locationId = requiredString(data.locationId, "locationId", HttpsError, 160);
    const userCoordinates = normalizeCoordinates(data, HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "location", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "location", HttpsError);
    }
    const [glitch, locationSnapshot] = await Promise.all([
      db.collection("glitchEvents").doc(glitchEventId).get(),
      db.collection("missionLocations").doc(locationId).get(),
    ]);
    const glitchData = glitch.data() || {};
    if (!glitch.exists || glitchData.status !== "active") throw new HttpsError("failed-precondition", "Glitch Event ist nicht aktiv.");
    if (!Array.isArray(glitchData.locationIds) || !glitchData.locationIds.includes(locationId)) {
      throw new HttpsError("failed-precondition", "Location gehoert nicht zu diesem Glitch Event.");
    }
    const location = locationSnapshot.exists ? locationSnapshot.data() || {} : {};
    if (
      !locationSnapshot.exists
      || !isPublishedSafeMissionLocation(location)
      || location.regionId !== glitchData.regionId
    ) {
      throw new HttpsError("failed-precondition", "Glitch Location ist nicht nachvollziehbar sicher veroeffentlicht.");
    }
    const distanceKm = haversineDistanceKm(userCoordinates, {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    });
    if (!Number.isFinite(distanceKm) || distanceKm > MAX_CHECK_IN_DISTANCE_KM) {
      throw new HttpsError("failed-precondition", "Check-in ist nur in unmittelbarer Naehe der veroeffentlichten Location moeglich.");
    }

    const now = new Date();
    const windowStart = new Date(glitchData.windowStart);
    const windowEnd = new Date(glitchData.windowEnd);
    if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime()) || now < windowStart || now > windowEnd) {
      throw new HttpsError("failed-precondition", "Glitch Check-in ist nur innerhalb des aktiven Fensters erlaubt.");
    }
    const participantRef = db.collection("glitchParticipants").doc(`${glitchEventId}_${userId}_${childProfileId || "self"}`);
    const existingParticipant = await participantRef.get();
    if (existingParticipant.exists) {
      return { accepted: true, participantId: participantRef.id, locationId, boostAuthorized: false, idempotent: true };
    }
    await participantRef.set({
      participantId: participantRef.id,
      glitchEventId,
      locationId,
      regionId: glitchData.regionId,
      ownerUserId: userId,
      userId,
      childProfileId: childProfileId || null,
      checkInAt: now.toISOString(),
      checkInDistanceMeters: Math.round(distanceKm * 1000),
      eligibilityStatus: "checked-in",
      boostAuthorized: false,
      userLocationStored: false,
      ...serverTimestamps(),
    });
    return { accepted: true, participantId: participantRef.id, locationId, boostAuthorized: false, idempotent: false };
  });

  exportsTarget.activateGlitchBoost = onCall(async () => {
    throw new HttpsError("failed-precondition", "activateGlitchBoost ist internal-only und nicht als Client Callable aktiviert.");
  });

  exportsTarget.cancelGlitchEvent = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const glitchEventId = requiredString(data.glitchEventId, "glitchEventId", HttpsError);
    await db.collection("glitchEvents").doc(glitchEventId).set({
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: optionalString(data.reason, 240) || "admin-cancelled",
      ...updatedTimestamp(),
    }, { merge: true });
    await writeAudit(db, { actorUserId, actionType: "glitch-event-cancelled", targetType: "glitchEvent", targetId: glitchEventId, reason: data.reason });
    return { accepted: true, glitchEventId, status: "cancelled" };
  });
}

module.exports = { registerBeta1RealityGlitch, MAX_CHECK_IN_DISTANCE_KM };
