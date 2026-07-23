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

const ADMIN_ID = "nearby-admin";
const USER_ID = "nearby-user";

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

async function upsertLocation(adminToken, input) {
  return expectOk("adminUpsertMissionLocation", adminToken, {
    safeLocationReviewed: true,
    safetyReviewNote: "[emulator-qa] oeffentlicher Testort geprueft",
    status: "published",
    ...input,
  });
}

async function run() {
  console.log("WellFit Beta 1 Worldwide Nearby Mission Locations Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);

  await expectCallableError(
    "adminUpsertMissionLocation",
    userToken,
    {
      locationId: "hack",
      title: "Hack",
      regionId: "jp-tokyo",
      latitude: 35.6812,
      longitude: 139.7671,
      missionIds: ["adventure-city-sprint"],
      status: "published",
      safeLocationReviewed: true,
    },
    "Nicht-Admin darf keine Missionsorte veroeffentlichen",
  );

  await upsertLocation(adminToken, {
    locationId: "tokyo-station",
    title: "Tokyo Station WellFit Point",
    subtitle: "Sicherer oeffentlicher Startpunkt",
    regionId: "jp-tokyo",
    countryCode: "JP",
    locality: "Tokyo",
    locationType: "city-route",
    latitude: 35.681236,
    longitude: 139.767125,
    icon: "🏃",
    missionIds: ["adventure-city-sprint", "challenge-reaction-test"],
  });
  await upsertLocation(adminToken, {
    locationId: "new-york-central-park",
    title: "Central Park WellFit Point",
    regionId: "us-new-york",
    countryCode: "US",
    locality: "New York",
    locationType: "park",
    latitude: 40.7812,
    longitude: -73.9665,
    icon: "🌳",
    missionIds: ["adventure-ar-treasure", "challenge-balance-park"],
  });
  await upsertLocation(adminToken, {
    locationId: "vienna-museum",
    title: "Vienna Museum WellFit Point",
    regionId: "at-vienna",
    countryCode: "AT",
    locality: "Vienna",
    locationType: "museum",
    latitude: 48.203811,
    longitude: 16.361209,
    icon: "🏛️",
    missionIds: ["adventure-museum-quiz"],
  });

  await expectCallableError(
    "adminUpsertMissionLocation",
    adminToken,
    {
      locationId: "unsafe",
      title: "Unsicher",
      regionId: "global-test",
      latitude: 1,
      longitude: 1,
      missionIds: ["adventure-city-sprint"],
      status: "published",
      safeLocationReviewed: false,
    },
    "Veroeffentlichter Ort ohne Sicherheitspruefung muss blockiert werden",
  );

  const tokyo = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: 35.68125,
    longitude: 139.76715,
    radiusKm: 5,
  });
  assert(tokyo.globalCatalog === true && tokyo.locationAuthority === "server-published-nearby", "Umgebungssuche muss global und serverpubliziert sein.");
  assert(tokyo.userLocationStored === false, "Umgebungssuche darf den Nutzerstandort nicht speichern.");
  assert(tokyo.count === 1 && tokyo.locations[0].locationId === "tokyo-station", "Tokyo-Nutzer darf nur den nahen Tokyo-Ort erhalten.");
  assert(tokyo.locations[0].distanceKm < 0.1, "Distanz muss aus aktuellen Koordinaten berechnet werden.");

  const filtered = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: 35.68125,
    longitude: 139.76715,
    radiusKm: 5,
    missionIds: ["adventure-museum-quiz"],
  });
  assert(filtered.count === 0, "Missionfilter darf keine weit entfernten oder unpassenden Orte liefern.");

  const newYork = await expectOk("getNearbyMissionLocations", userToken, {
    latitude: 40.78125,
    longitude: -73.96655,
    radiusKm: 10,
    missionIds: ["adventure-ar-treasure"],
  });
  assert(newYork.count === 1 && newYork.locations[0].locationId === "new-york-central-park", "New-York-Nutzer muss den lokalen New-York-Ort erhalten.");

  await expectCallableError(
    "getNearbyMissionLocations",
    userToken,
    { latitude: 200, longitude: 10, radiusKm: 25 },
    "Ungueltige Koordinaten muessen blockiert werden",
  );

  const now = Date.now();
  const glitch = await expectOk("adminScheduleGlitchEvent", adminToken, {
    glitchEventId: "tokyo-glitch",
    regionId: "jp-tokyo",
    locationIds: ["tokyo-station"],
    windowStart: new Date(now - 60_000).toISOString(),
    windowEnd: new Date(now + 5 * 60_000).toISOString(),
    multiplierCap: 5,
    maxParticipants: 50,
    reason: "[emulator-qa] globaler Tokyo Glitch",
  });
  assert(glitch.regionId === "jp-tokyo" && glitch.globalCatalog === true, "Glitch darf weltweit ausserhalb Wiens geplant werden.");

  const tokyoEvents = await expectOk("listGlitchEvents", userToken, { regionId: "jp-tokyo" });
  assert(tokyoEvents.events.some((event) => event.glitchEventId === "tokyo-glitch"), "Tokyo-Region muss den Tokyo-Glitch sehen.");
  const viennaEvents = await expectOk("listGlitchEvents", userToken, { regionId: "at-vienna" });
  assert(viennaEvents.events.every((event) => event.glitchEventId !== "tokyo-glitch"), "Regionale Events duerfen nicht weltweit ungefiltert erscheinen.");

  const checkIn = await expectOk("checkInToGlitch", userToken, {
    glitchEventId: "tokyo-glitch",
    locationId: "tokyo-station",
    latitude: 35.68125,
    longitude: 139.76715,
  });
  assert(checkIn.locationId === "tokyo-station" && checkIn.boostAuthorized === false, "Naher Check-in muss angenommen, aber noch nicht belohnt werden.");
  const participant = await db.collection("glitchParticipants").doc(checkIn.participantId).get();
  const participantData = participant.data() || {};
  assert(participantData.regionId === "jp-tokyo" && participantData.userLocationStored === false, "Check-in darf Region, aber keine Rohkoordinaten speichern.");
  assert(Number(participantData.checkInDistanceMeters) <= 150, "Check-in muss innerhalb des serverseitigen Radius liegen.");

  const farUserToken = await createAuthUser("nearby-far-user", false);
  await expectCallableError(
    "checkInToGlitch",
    farUserToken,
    {
      glitchEventId: "tokyo-glitch",
      locationId: "tokyo-station",
      latitude: 35.6895,
      longitude: 139.6917,
    },
    "Entfernter Check-in muss blockiert werden",
  );

  const locationDocs = await db.collection("missionLocations").get();
  assert(locationDocs.size === 3, "Genau drei weltweit verteilte Testorte muessen publiziert sein.");
  assert(locationDocs.docs.every((doc) => (doc.data() || {}).safeLocationReviewed === true), "Alle publizierten Testorte muessen sicherheitsgeprueft sein.");

  console.log("WellFit Beta 1 Worldwide Nearby Mission Locations Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser("nearby-far-user");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});