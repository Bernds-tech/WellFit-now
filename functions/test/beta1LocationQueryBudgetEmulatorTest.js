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
  MAX_NEARBY_QUERIES_PER_WINDOW,
  locationQueryBudgetId,
} = require("../lib/beta1LocationQueryBudget");

const ADMIN_ID = "location-budget-admin";
const USER_ID = "location-budget-user";
const OTHER_USER_ID = "location-budget-other";

async function expectOk(functionName, token, data) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${functionName} muss accepted=true liefern: ${describeCall(response)}`);
  return result;
}

async function run() {
  console.log("WellFit Beta 1 Nearby Location Query Budget Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const otherUserToken = await createAuthUser(OTHER_USER_ID, false);

  await expectOk("adminUpsertMissionLocation", adminToken, {
    locationId: "lisbon-budget-point",
    title: "Lisbon Budget Test Point",
    regionId: "pt-lisbon",
    countryCode: "PT",
    locality: "Lisbon",
    locationType: "public-space",
    latitude: 38.7223,
    longitude: -9.1393,
    icon: "📍",
    missionIds: ["adventure-city-sprint"],
    safeLocationReviewed: true,
    safetyReviewNote: "[emulator-qa] sicherer Rate-Limit-Testort",
    status: "published",
  });

  for (let index = 0; index < MAX_NEARBY_QUERIES_PER_WINDOW; index += 1) {
    const result = await expectOk("getNearbyMissionLocations", userToken, {
      latitude: 38.72231,
      longitude: -9.13931,
      radiusKm: 1,
      missionIds: ["adventure-city-sprint"],
    });
    assert(result.count === 1 && result.locations[0].locationId === "lisbon-budget-point", "Zulaessige Budgetabfrage muss den lokalen Ort liefern.");
    assert(
      result.queryBudgetRemaining === MAX_NEARBY_QUERIES_PER_WINDOW - index - 1,
      `Restbudget muss nach Abfrage ${index + 1} korrekt sinken.`,
    );
    assert(result.queryBudgetRawCoordinatesStored === false, "Budgetantwort darf keine Rohkoordinaten-Persistenz ausweisen.");
  }

  const blocked = await callCallable("getNearbyMissionLocations", userToken, {
    latitude: 38.72231,
    longitude: -9.13931,
    radiusKm: 1,
  });
  assert(!blocked.ok, `Abfrage ueber dem Budget muss fehlschlagen: ${describeCall(blocked)}`);
  assert(
    JSON.stringify(blocked.json).toLowerCase().includes("resource-exhausted"),
    `Budgetfehler muss resource-exhausted liefern: ${describeCall(blocked)}`,
  );

  const budgetSnapshot = await db.collection("locationQueryBudgets").doc(locationQueryBudgetId(USER_ID)).get();
  const budget = budgetSnapshot.data() || {};
  assert(budgetSnapshot.exists, "Server muss einen nutzerbezogenen Query-Budget-Datensatz schreiben.");
  assert(budget.queryCount === MAX_NEARBY_QUERIES_PER_WINDOW, "Blockierte Abfrage darf den Budgetzaehler nicht ueber das Maximum erhoehen.");
  assert(budget.rawCoordinatesStored === false && budget.locationAuthority === "rate-limit-only", "Budgetdatensatz muss datensparsam und koordinatenfrei sein.");
  assert(budget.latitude === undefined && budget.longitude === undefined, "Budgetdatensatz darf keine Rohkoordinaten enthalten.");
  assert(typeof budget.windowStartedAt === "string" && typeof budget.windowExpiresAt === "string", "Budget muss ein kontrollierbares Zeitfenster dokumentieren.");

  const independent = await expectOk("getNearbyMissionLocations", otherUserToken, {
    latitude: 38.72231,
    longitude: -9.13931,
    radiusKm: 1,
  });
  assert(independent.queryBudgetRemaining === MAX_NEARBY_QUERIES_PER_WINDOW - 1, "Andere Nutzer brauchen ein unabhaengiges Query-Budget.");

  console.log("WellFit Beta 1 Nearby Location Query Budget Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
