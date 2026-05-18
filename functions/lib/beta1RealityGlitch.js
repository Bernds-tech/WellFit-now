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

function registerBeta1RealityGlitch(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.listGlitchEvents = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const snapshot = await db.collection("glitchEvents").where("status", "==", "active").limit(20).get();
    return { accepted: true, maxMultiplier: MAX_GLITCH_MULTIPLIER, events: snapshot.docs.map((doc) => ({ glitchEventId: doc.id, ...(doc.data() || {}) })) };
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
    const regionId = optionalString(data.regionId, 80) || "vienna";
    if (!isAllowedBeta1GlitchRegion(regionId)) {
      throw new HttpsError("failed-precondition", "Reality Glitch ist in Beta 1 nur fuer Wien/Niederoesterreich freigegeben.");
    }
    if (data.unsafeLocation === true) {
      throw new HttpsError("failed-precondition", "Reality Glitch benoetigt eine als sicher freigegebene Location.");
    }
    const locationIds = Array.isArray(data.locationIds) ? data.locationIds.map((item) => optionalString(item, 160)).filter(Boolean).slice(0, 10) : [];
    if (locationIds.length === 0) throw new HttpsError("invalid-argument", "Mindestens eine sichere Location ist erforderlich.");
    const requestedGlitchEventId = optionalString(data.glitchEventId, 160);
    const glitchRef = requestedGlitchEventId ? db.collection("glitchEvents").doc(requestedGlitchEventId) : db.collection("glitchEvents").doc();
    await glitchRef.set({ glitchEventId: glitchRef.id, regionId, locationIds, windowStart: windowStartDate.toISOString(), windowEnd: windowEndDate.toISOString(), durationMinutes, status: "active", multiplierCap, safeLocationReviewed: true, unsafeLocation: false, maxParticipants: normalizedPositiveInteger(data.maxParticipants, 25, 500), createdByAdminId: actorUserId, ...serverTimestamps() });
    await writeAudit(db, { actorUserId, actionType: "glitch-event-scheduled", targetType: "glitchEvent", targetId: glitchRef.id, reason: data.reason, metadata: { multiplierCap, locationIds } });
    return { accepted: true, glitchEventId: glitchRef.id, multiplierCap };
  });

  exportsTarget.checkInToGlitch = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const glitchEventId = requiredString(data.glitchEventId, "glitchEventId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "location", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "location", HttpsError);
    }
    const glitch = await db.collection("glitchEvents").doc(glitchEventId).get();
    const glitchData = glitch.data() || {};
    if (!glitch.exists || glitchData.status !== "active") throw new HttpsError("failed-precondition", "Glitch Event ist nicht aktiv.");
    const now = new Date();
    const windowStart = new Date(glitchData.windowStart);
    const windowEnd = new Date(glitchData.windowEnd);
    if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime()) || now < windowStart || now > windowEnd) {
      throw new HttpsError("failed-precondition", "Glitch Check-in ist nur innerhalb des aktiven Fensters erlaubt.");
    }
    const participantRef = db.collection("glitchParticipants").doc(`${glitchEventId}_${userId}_${childProfileId || "self"}`);
    const existingParticipant = await participantRef.get();
    if (existingParticipant.exists) {
      return { accepted: true, participantId: participantRef.id, boostAuthorized: false, idempotent: true };
    }
    await participantRef.set({ participantId: participantRef.id, glitchEventId, ownerUserId: userId, userId, childProfileId: childProfileId || null, checkInAt: now.toISOString(), eligibilityStatus: "checked-in", boostAuthorized: false, ...serverTimestamps() });
    return { accepted: true, participantId: participantRef.id, boostAuthorized: false, idempotent: false };
  });

  exportsTarget.activateGlitchBoost = onCall(async () => {
    throw new HttpsError("failed-precondition", "activateGlitchBoost ist internal-only und nicht als Client Callable aktiviert.");
  });

  exportsTarget.cancelGlitchEvent = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const data = request.data || {};
    const glitchEventId = requiredString(data.glitchEventId, "glitchEventId", HttpsError);
    await db.collection("glitchEvents").doc(glitchEventId).set({ status: "cancelled", cancelledAt: new Date().toISOString(), cancelReason: optionalString(data.reason, 240) || "admin-cancelled", ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId, actionType: "glitch-event-cancelled", targetType: "glitchEvent", targetId: glitchEventId, reason: data.reason });
    return { accepted: true, glitchEventId, status: "cancelled" };
  });
}

module.exports = { registerBeta1RealityGlitch };
