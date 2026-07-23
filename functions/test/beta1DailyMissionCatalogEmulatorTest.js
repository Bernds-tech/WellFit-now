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

async function expectOk(functionName, token, data) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  return getCallableResult(response);
}

async function expectCallableError(functionName, token, data, label) {
  const response = await callCallable(functionName, token, data);
  assert(!response.ok, `${label || functionName} muss fehlschlagen: ${describeCall(response)}`);
  return response;
}

async function run() {
  console.log("WellFit Beta 1 Daily Mission Catalog Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser("daily-catalog-admin", true);
  const userToken = await createAuthUser("daily-catalog-user", false);

  await expectCallableError(
    "adminEnsureDailyMissionCatalog",
    userToken,
    {},
    "Nicht-Admin darf Tagesmissionskatalog nicht publizieren",
  );

  const ensured = await expectOk("adminEnsureDailyMissionCatalog", adminToken, {});
  assert(ensured.accepted === true, "Admin-Katalogabgleich muss accepted=true liefern.");
  assert(ensured.count === 10, `Tagesmissionskatalog muss 10 Missionen enthalten: ${JSON.stringify(ensured)}`);
  assert(ensured.currency === "WFXP", "Tagesmissionskatalog muss WFXP verwenden.");
  assert(ensured.noMonetaryValue === true, "Tagesmissionskatalog muss noMonetaryValue=true liefern.");
  assert(ensured.tokenAuthorized === false && ensured.cashoutAllowed === false, "Katalog darf Token/Cashout nicht autorisieren.");
  assert(ensured.missions.every((mission) => mission.reviewRequired === true), "Alle Tagesmissionen brauchen Review.");
  assert(ensured.missions.every((mission) => mission.childAllowed === false), "Child Missions bleiben in diesem Beta-1 Katalog deaktiviert.");
  assert(ensured.missions.every((mission) => mission.evidenceType === "daily-user-confirmation"), "Evidence-Typ muss kanonisch sein.");
  assert(ensured.missions.every((mission) => Number.isInteger(mission.rewardXp) && mission.rewardXp >= 1 && mission.rewardXp <= 100), "WFXP muss im sicheren Bereich liegen.");

  const stored = await db.collection("missions").where("catalogId", "==", "wellfit-beta1-daily-missions").get();
  assert(stored.size === 10, `Firestore muss genau 10 Katalogmissionen enthalten: ${stored.size}`);
  for (const doc of stored.docs) {
    const mission = doc.data();
    assert(mission.status === "published", `${doc.id} muss published sein.`);
    assert(mission.currency === "WFXP", `${doc.id} muss WFXP verwenden.`);
    assert(mission.noMonetaryValue === true, `${doc.id} muss noMonetaryValue=true sein.`);
    assert(mission.tokenAuthorized === false && mission.cashoutAllowed === false, `${doc.id} darf Token/Cashout nicht autorisieren.`);
    assert(mission.childAllowed === false, `${doc.id} darf Child Profiles noch nicht freigeben.`);
    assert(mission.evidencePolicy.reviewRequired === true, `${doc.id} muss Evidence Review verlangen.`);
    assert(mission.evidencePolicy.rawMediaRequired === false, `${doc.id} darf kein Rohmedium erzwingen.`);
    assert(mission.evidencePolicy.allowedEvidenceTypes.includes("daily-user-confirmation"), `${doc.id} muss den kanonischen Evidence-Typ erlauben.`);
  }

  const listed = await expectOk("listMissions", userToken, {});
  const listedIds = new Set(listed.missions.map((mission) => mission.missionId));
  for (const mission of ensured.missions) {
    assert(listedIds.has(mission.missionId), `${mission.missionId} muss in listMissions sichtbar sein.`);
  }

  const attempt = await expectOk("startMissionAttempt", userToken, { missionId: "daily-8000-steps" });
  assert(attempt.status === "started", "Publizierte Tagesmission muss serverseitig startbar sein.");
  assert(attempt.missionCompletionAuthorized === false, "Missionstart darf Completion nicht autorisieren.");

  const secondEnsure = await expectOk("adminEnsureDailyMissionCatalog", adminToken, {});
  assert(secondEnsure.count === 10, "Wiederholter Katalogabgleich muss idempotent 10 Missionen liefern.");
  const storedAfterSecondEnsure = await db.collection("missions").where("catalogId", "==", "wellfit-beta1-daily-missions").get();
  assert(storedAfterSecondEnsure.size === 10, "Wiederholter Katalogabgleich darf keine Duplikate erzeugen.");

  const audit = await db.collection("adminActions").where("actionType", "==", "daily-mission-catalog-ensured").limit(1).get();
  assert(!audit.empty, "Katalogabgleich muss ein Admin-Audit schreiben.");

  console.log("WellFit Beta 1 Daily Mission Catalog Emulator Test erfolgreich.");
  await admin.auth().deleteUser("daily-catalog-admin");
  await admin.auth().deleteUser("daily-catalog-user");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
