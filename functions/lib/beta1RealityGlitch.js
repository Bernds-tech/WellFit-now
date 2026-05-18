const {
  MAX_GLITCH_MULTIPLIER,
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  updatedTimestamp,
  assertGuardianCanUseChild,
  requireChildConsent,
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
    const multiplierCap = normalizedPositiveInteger(data.multiplierCap, 2, MAX_GLITCH_MULTIPLIER);
    if (multiplierCap > MAX_GLITCH_MULTIPLIER) throw new HttpsError("failed-precondition", "Glitch Multiplier ist auf 10x begrenzt.");
    const locationIds = Array.isArray(data.locationIds) ? data.locationIds.map((item) => optionalString(item, 160)).filter(Boolean).slice(0, 10) : [];
    if (locationIds.length === 0) throw new HttpsError("invalid-argument", "Mindestens eine sichere Location ist erforderlich.");
    const requestedGlitchEventId = optionalString(data.glitchEventId, 160);
    const glitchRef = requestedGlitchEventId ? db.collection("glitchEvents").doc(requestedGlitchEventId) : db.collection("glitchEvents").doc();
    await glitchRef.set({ glitchEventId: glitchRef.id, regionId: optionalString(data.regionId, 80) || "beta1-at", locationIds, windowStart: requiredString(data.windowStart, "windowStart", HttpsError, 80), windowEnd: requiredString(data.windowEnd, "windowEnd", HttpsError, 80), status: "active", multiplierCap, safeLocationReviewed: true, maxParticipants: normalizedPositiveInteger(data.maxParticipants, 25, 500), createdByAdminId: actorUserId, ...serverTimestamps() });
    await writeAudit(db, { actorUserId, actionType: "glitch-event-scheduled", targetType: "glitchEvent", targetId: glitchRef.id, reason: data.reason, metadata: { multiplierCap, locationIds } });
    return { accepted: true, glitchEventId: glitchRef.id, multiplierCap };
  });

  exportsTarget.checkInToGlitch = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const glitchEventId = requiredString(data.glitchEventId, "glitchEventId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      await requireChildConsent(db, userId, childProfileId, "location", HttpsError);
    }
    const glitch = await db.collection("glitchEvents").doc(glitchEventId).get();
    if (!glitch.exists || (glitch.data() || {}).status !== "active") throw new HttpsError("failed-precondition", "Glitch Event ist nicht aktiv.");
    const participantRef = db.collection("glitchParticipants").doc(`${glitchEventId}_${userId}_${childProfileId || "self"}`);
    await participantRef.set({ participantId: participantRef.id, glitchEventId, ownerUserId: userId, userId, childProfileId: childProfileId || null, checkInAt: new Date().toISOString(), eligibilityStatus: "checked-in", boostAuthorized: false, ...serverTimestamps() }, { merge: true });
    return { accepted: true, participantId: participantRef.id, boostAuthorized: false };
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
