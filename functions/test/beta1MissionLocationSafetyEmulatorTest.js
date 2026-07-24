const {
  db,
  admin,
  assert,
  createAuthUser,
  callCallable,
  getCallableResult,
  describeCall,
  resetBeta1Collections,
  seedBeta1RuntimeData,
} = require("./beta1RuntimeFixtures");
const {
  LOCATION_SAFETY_REVIEW_VERSION,
  hasValidLocationSafetyReview,
  isPublishedSafeMissionLocation,
} = require("../lib/beta1MissionLocationSafety");

const ADMIN_ID = "location-safety-admin";
const USER_ID = "location-safety-user";
const LOCATION_ID = "pt-lisbon-safety-point";
const LEGACY_LOCATION_ID = "pt-lisbon-legacy-safe";
const UNSAFE_LEGACY_LOCATION_ID = "pt-lisbon-legacy-short-note";
const MISSION_ID = "adventure-city-sprint";
const ORIGIN = { latitude: 38.7223, longitude: -9.1393 };

async function expectOk(functionName, token, data) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${functionName} muss accepted=true liefern: ${describeCall(response)}`);
  return result;
}

async function expectCallableError(functionName, token, data, label) {
  const response = await callCallable(functionName, token, data);
  assert(!response.ok, `${label || functionName} muss fehlschlagen: ${describeCall(response)}`);
  return response;
}

function validLocationPayload(overrides = {}) {
  return {
    locationId: LOCATION_ID,
    title: "Lisbon Safety Test Point",
    subtitle: "Kryptografisch freigegebener Emulator-Ort",
    regionId: "pt-lisbon",
    countryCode: "PT",
    locality: "Lisbon",
    locationType: "public-space",
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
    icon: "📍",
    missionIds: [MISSION_ID],
    safeLocationReviewed: true,
    safetyReviewNote: "[emulator-qa] Zugang, Verkehr und Umgebung vor Ort geprüft.",
    status: "published",
    ...overrides,
  };
}

function activeGlitchWindow() {
  const now = Date.now();
  return {
    windowStart: new Date(now - 60_000).toISOString(),
    windowEnd: new Date(now + 5 * 60_000).toISOString(),
  };
}

async function run() {
  console.log("WellFit Beta 1 Mission Location Safety Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);

  await expectCallableError(
    "adminUpsertMissionLocation",
    adminToken,
    validLocationPayload({ missionIds: ["mission-not-published"] }),
    "Nicht veroeffentlichte Mission darf keinen Missionsort erhalten",
  );
  await expectCallableError(
    "adminUpsertMissionLocation",
    adminToken,
    validLocationPayload({ countryCode: "PRT" }),
    "Ungueltiger Laendercode muss blockiert werden",
  );
  await expectCallableError(
    "adminUpsertMissionLocation",
    adminToken,
    validLocationPayload({ safetyReviewNote: "zu kurz" }),
    "Zu kurze Sicherheitsnotiz muss blockiert werden",
  );

  const upsert = await expectOk("adminUpsertMissionLocation", adminToken, validLocationPayload());
  assert(upsert.safetyReviewVersion === LOCATION_SAFETY_REVIEW_VERSION, "Upsert muss die kanonische Sicherheitsversion liefern.");
  assert(/^[a-f0-9]{64}$/.test(upsert.safetyReviewFingerprint), "Upsert muss einen SHA-256-Fingerprint liefern.");

  const locationRef = db.collection("missionLocations").doc(LOCATION_ID);
  const stored = (await locationRef.get()).data() || {};
  assert(stored.safetyReviewedByAdminId === ADMIN_ID, "Sicherheitsfreigabe muss den verantwortlichen Admin dokumentieren.");
  assert(typeof stored.safetyReviewedAt === "string", "Sicherheitsfreigabe muss einen Pruefzeitpunkt dokumentieren.");
  assert(hasValidLocationSafetyReview(stored), "Unveraenderter Ort muss eine gueltige Sicherheitsfreigabe besitzen.");
  assert(isPublishedSafeMissionLocation(stored), "Unveraenderter Ort muss als sicher veroeffentlicht gelten.");

  const nearbyBeforeTamper = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
    radiusKm: 1,
    missionIds: [MISSION_ID],
  });
  assert(nearbyBeforeTamper.count === 1 && nearbyBeforeTamper.locations[0].locationId === LOCATION_ID, "Gueltig freigegebener Ort muss in der Umgebung erscheinen.");
  assert(nearbyBeforeTamper.safetyReviewAuthority === LOCATION_SAFETY_REVIEW_VERSION, "Umgebungssuche muss die Sicherheitsautoritaet ausweisen.");

  const glitch = await expectOk("adminScheduleGlitchEvent", adminToken, {
    glitchEventId: "lisbon-safety-glitch",
    regionId: "pt-lisbon",
    locationIds: [LOCATION_ID],
    ...activeGlitchWindow(),
    multiplierCap: 2,
    reason: "[emulator-qa] Fingerprint-gebundener Glitch",
  });
  assert(glitch.glitchEventId === "lisbon-safety-glitch", "Glitch muss am signierten Ort planbar sein.");

  await locationRef.set({ latitude: ORIGIN.latitude + 0.0001 }, { merge: true });
  const tamperedCoordinate = (await locationRef.get()).data() || {};
  assert(!hasValidLocationSafetyReview(tamperedCoordinate), "Nach Koordinatenmanipulation muss der Fingerprint ungueltig sein.");

  const nearbyAfterCoordinateTamper = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
    radiusKm: 1,
  });
  assert(nearbyAfterCoordinateTamper.count === 0, "Manipulierter Ort darf nicht mehr in der Umgebung erscheinen.");
  await expectCallableError(
    "checkInToGlitch",
    userToken,
    {
      glitchEventId: "lisbon-safety-glitch",
      locationId: LOCATION_ID,
      latitude: ORIGIN.latitude,
      longitude: ORIGIN.longitude,
    },
    "Glitch Check-in muss bei ungueltigem Ortsfingerprint blockiert werden",
  );

  await expectOk("adminUpsertMissionLocation", adminToken, validLocationPayload());
  const repaired = (await locationRef.get()).data() || {};
  assert(hasValidLocationSafetyReview(repaired), "Erneute Admin-Pruefung muss den Ort wieder gueltig signieren.");
  const checkIn = await expectOk("checkInToGlitch", userToken, {
    glitchEventId: "lisbon-safety-glitch",
    locationId: LOCATION_ID,
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
  });
  assert(checkIn.locationId === LOCATION_ID && checkIn.boostAuthorized === false, "Reparierter Ort muss einen datensparsamen Check-in erlauben.");

  await locationRef.set({ missionIds: ["mission-not-published"] }, { merge: true });
  const tamperedMissions = (await locationRef.get()).data() || {};
  assert(!hasValidLocationSafetyReview(tamperedMissions), "Nach Missionsmanipulation muss der Fingerprint ungueltig sein.");
  const nearbyAfterMissionTamper = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
    radiusKm: 1,
  });
  assert(nearbyAfterMissionTamper.count === 0, "Ort mit manipulierter Missionsbindung darf nicht ausgeliefert werden.");
  await expectOk("adminUpsertMissionLocation", adminToken, validLocationPayload());

  await db.collection("missionLocations").doc(LEGACY_LOCATION_ID).set({
    locationId: LEGACY_LOCATION_ID,
    title: "Lisbon Legacy Safety Point",
    regionId: "pt-lisbon",
    countryCode: "PT",
    locality: "Lisbon",
    locationType: "public-space",
    latitude: ORIGIN.latitude + 0.001,
    longitude: ORIGIN.longitude,
    icon: "🧭",
    missionIds: [MISSION_ID],
    safeLocationReviewed: true,
    safetyReviewNote: "[emulator-qa] Historische Sicherheitsfreigabe vollständig geprüft.",
    status: "published",
    globalCatalog: true,
  });
  await db.collection("missionLocations").doc(UNSAFE_LEGACY_LOCATION_ID).set({
    locationId: UNSAFE_LEGACY_LOCATION_ID,
    title: "Lisbon Legacy Short Note",
    regionId: "pt-lisbon",
    countryCode: "PT",
    locality: "Lisbon",
    locationType: "public-space",
    latitude: ORIGIN.latitude + 0.002,
    longitude: ORIGIN.longitude,
    icon: "⚠️",
    missionIds: [MISSION_ID],
    safeLocationReviewed: true,
    safetyReviewNote: "zu kurz",
    status: "published",
    globalCatalog: true,
  });

  const reindex = await expectOk("adminReindexMissionLocations", adminToken, {
    limit: 100,
    reason: "[emulator-qa] Legacy-Sicherheitsfreigaben migrieren",
  });
  assert(reindex.safetyReviewVersion === LOCATION_SAFETY_REVIEW_VERSION, "Migration muss die Sicherheitsversion ausweisen.");

  const legacySafe = (await db.collection("missionLocations").doc(LEGACY_LOCATION_ID).get()).data() || {};
  const legacyUnsafe = (await db.collection("missionLocations").doc(UNSAFE_LEGACY_LOCATION_ID).get()).data() || {};
  assert(hasValidLocationSafetyReview(legacySafe), "Nachvollziehbarer Altbestand muss signiert migriert werden.");
  assert(!hasValidLocationSafetyReview(legacyUnsafe), "Altbestand mit unzureichender Pruefnotiz muss fail-closed bleiben.");

  const nearbyAfterMigration = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
    radiusKm: 1,
    missionIds: [MISSION_ID],
  });
  assert(nearbyAfterMigration.locations.some((location) => location.locationId === LOCATION_ID), "Aktueller Ort muss nach Migration sichtbar bleiben.");
  assert(nearbyAfterMigration.locations.some((location) => location.locationId === LEGACY_LOCATION_ID), "Gueltig migrierter Altbestand muss sichtbar werden.");
  assert(!nearbyAfterMigration.locations.some((location) => location.locationId === UNSAFE_LEGACY_LOCATION_ID), "Unsicherer Altbestand darf niemals ausgeliefert werden.");

  console.log("WellFit Beta 1 Mission Location Safety Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});