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
  adventureMissionAttemptId,
  adventureAccessLedgerId,
  adventureRewardLedgerId,
} = require("../lib/beta1AdventureMissionProgress");

const ADMIN_ID = "adventure-admin";
const USER_ID = "adventure-user";
const EMPTY_USER_ID = "adventure-empty";
const LOCATION_ID = "adventure-museum-tokyo";
const ORIGIN = { latitude: 35.710063, longitude: 139.8107 };
const FAR_ORIGIN = { latitude: 48.2082, longitude: 16.3738 };
const MISSION_ID = "adventure-museum-quiz";

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

async function expectBusinessRejection(functionName, token, data, expectedReason) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} Business-Rejection muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === false, `${functionName} muss accepted=false liefern: ${describeCall(response)}`);
  assert(result.rejectionReason === expectedReason, `${functionName} muss ${expectedReason} liefern: ${JSON.stringify(result)}`);
  return result;
}

function accessPayload(coordinates = ORIGIN) {
  return {
    missionId: MISSION_ID,
    locationId: LOCATION_ID,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    clientVersion: "adventure-emulator-v2",
    appSessionId: `adventure-${Date.now()}`,
  };
}

async function run() {
  console.log("WellFit Beta 1 Global Adventure Mission Progress Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const emptyUserToken = await createAuthUser(EMPTY_USER_ID, false);

  await expectCallableError(
    "adminEnsureAdventureMissionCatalog",
    userToken,
    {},
    "Nicht-Admin darf Abenteuerkatalog nicht veroeffentlichen",
  );
  const catalog = await expectOk("adminEnsureAdventureMissionCatalog", adminToken, {});
  assert(catalog.catalogId === "wellfit-beta1-adventure-missions", "Abenteuerkatalog braucht die kanonische Catalog-ID.");
  assert(catalog.catalogVersion === "1.1.0", "Abenteuerkatalog braucht die globale Standortversion 1.1.0.");
  assert(catalog.accessPolicy === "one-time-wfxp-access-per-user", "Abenteuerkatalog braucht eine einmalige Zugangs-Policy.");
  assert(catalog.locationPolicy === "nearby-published-location" && catalog.startRadiusMeters === 500, "Abenteuerkatalog muss sichere nahe Orte verlangen.");
  assert(catalog.count === 4 && catalog.noMonetaryValue === true, "Abenteuerkatalog muss vier interne WFXP-Missionen enthalten.");

  const location = await expectOk("adminUpsertMissionLocation", adminToken, {
    locationId: LOCATION_ID,
    title: "Tokyo Museum Adventure Hub",
    subtitle: "Globaler Abenteuer-Testort",
    regionId: "jp-tokyo",
    countryCode: "JP",
    locality: "Tokyo",
    locationType: "museum",
    latitude: ORIGIN.latitude,
    longitude: ORIGIN.longitude,
    icon: "🏛️",
    missionIds: [MISSION_ID],
    safeLocationReviewed: true,
    safetyReviewNote: "[emulator-qa] sicherer Museumsort",
    status: "published",
  });
  assert(location.globalCatalog === true && location.safeLocationReviewed === true, "Abenteuerort muss weltweit und sicher publiziert sein.");

  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: USER_ID,
    delta: 50,
    reason: "[emulator-qa] Abenteuer-Wallet Seed",
    idempotencyKey: "adventure_wallet_seed",
  });

  const initial = await expectOk("getAdventureProgress", userToken, {});
  assert(initial.walletBalance === 50 && initial.completedMissionIds.length === 0, "Initiale Abenteuerprojektion muss den Wallet-Seed lesen.");
  assert(initial.locationPolicy === "nearby-published-location", "Progress muss die globale Standort-Policy ausweisen.");
  assert(initial.locationAuthority === "server-published-nearby", "Progress muss die serverseitige Ortsautoritaet ausweisen.");

  await expectCallableError(
    "startAdventureMission",
    userToken,
    { missionId: MISSION_ID },
    "Abenteuerstart ohne Ort und Koordinaten muss blockiert werden",
  );
  await expectCallableError(
    "startAdventureMission",
    userToken,
    accessPayload(FAR_ORIGIN),
    "Abenteuerstart ausserhalb des 500-Meter-Radius muss blockiert werden",
  );
  const insufficient = await expectBusinessRejection(
    "startAdventureMission",
    emptyUserToken,
    accessPayload(),
    "insufficient-wfxp-balance",
  );
  assert(insufficient.accessAuthorized === false && insufficient.remainingWfxp === 0, "Leeres Wallet darf keinen Abenteuerzugang erhalten.");

  const access = await expectOk("startAdventureMission", userToken, accessPayload());
  const attemptId = adventureMissionAttemptId(USER_ID, MISSION_ID);
  const accessLedgerEventId = adventureAccessLedgerId(USER_ID, MISSION_ID);
  assert(access.attemptId === attemptId, "Abenteuerzugang braucht einen deterministischen Attempt.");
  assert(access.accessLedgerEventId === accessLedgerEventId, "Abenteuerzugang braucht einen deterministischen Ledger-Eintrag.");
  assert(access.accessAuthorized === true && access.accessCostWfxp === 10 && access.remainingWfxp === 40, "Museum-Abenteuer muss einmalig 10 WFXP abbuchen.");
  assert(access.locationId === LOCATION_ID && access.locationAuthority === "server-published-nearby", "Zugang muss den sicheren Ort binden.");
  assert(access.userLocationStored === false, "Zugang muss Datensparsamkeit dokumentieren.");

  const accessReplay = await expectOk("startAdventureMission", userToken, accessPayload());
  assert(accessReplay.idempotent === true && accessReplay.remainingWfxp === 40, "Zugangs-Replay darf kein zweites Mal abbuchen.");
  assert(accessReplay.accessLedgerEventId === accessLedgerEventId, "Zugangs-Replay muss denselben Ledger-Kontext nutzen.");

  const attemptDoc = (await db.collection("missionAttempts").doc(attemptId).get()).data() || {};
  const accessEvent = (await db.collection("adventureAccessEvents").doc(accessLedgerEventId).get()).data() || {};
  const accessLedger = (await db.collection("xpLedgerEvents").doc(accessLedgerEventId).get()).data() || {};
  assert(attemptDoc.locationId === LOCATION_ID && attemptDoc.locationPolicy === catalog.locationPolicy, "Attempt muss den Ort serverseitig binden.");
  assert(attemptDoc.latitude === undefined && attemptDoc.longitude === undefined, "Attempt darf keine Rohkoordinaten speichern.");
  assert(accessEvent.locationId === LOCATION_ID && accessEvent.userLocationStored === false, "Access Event muss nur den freigegebenen Ort speichern.");
  assert(accessLedger.delta === -10 && accessLedger.metadata.locationId === LOCATION_ID, "Access Ledger muss exakt -10 WFXP und den Ort dokumentieren.");

  await expectCallableError(
    "completeAdventureAttempt",
    userToken,
    { attemptId },
    "Abenteuerabschluss ohne Evidence muss blockiert werden",
  );
  const submitted = await expectOk("submitAdventureForReview", userToken, {
    missionId: MISSION_ID,
    clientVersion: "adventure-emulator-v2",
    appSessionId: "adventure-review-first",
  });
  assert(submitted.locationId === LOCATION_ID && submitted.reviewStatus === "pending-server-review", "Evidence muss den bezahlten Startort uebernehmen.");
  assert(submitted.missionCompletionAuthorized === false && submitted.xpAuthorized === false, "Submission darf keine Reward-Autoritaet erzeugen.");

  const submittedReplay = await expectOk("submitAdventureForReview", userToken, {
    missionId: MISSION_ID,
    clientVersion: "adventure-emulator-v2",
    appSessionId: "adventure-review-replay",
  });
  assert(submittedReplay.idempotent === true && submittedReplay.evidenceId === submitted.evidenceId, "Pending Adventure Evidence muss idempotent bleiben.");

  const evidenceRef = db.collection("missionEvidence").doc(submitted.evidenceId);
  const evidenceDoc = (await evidenceRef.get()).data() || {};
  assert(evidenceDoc.locationId === LOCATION_ID && evidenceDoc.latitude === undefined && evidenceDoc.longitude === undefined, "Adventure Evidence muss ortsgebunden und rohdatensparsam sein.");
  assert(evidenceDoc.locationAuthority === "server-published-nearby" && evidenceDoc.userLocationStored === false, "Adventure Evidence muss die serverseitige Ortsautoritaet dokumentieren.");
  await expectCallableError(
    "completeAdventureAttempt",
    userToken,
    { attemptId },
    "Abenteuerabschluss vor Admin-Review muss blockiert werden",
  );

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: submitted.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Tokyo Museums-Quiz verifiziert",
  });
  await evidenceRef.set({ locationId: "tampered-location" }, { merge: true });
  await expectCallableError(
    "completeAdventureAttempt",
    userToken,
    { attemptId },
    "Manipulierter Evidence-Standort darf keine Abenteuerbelohnung autorisieren",
  );
  await evidenceRef.set({
    locationId: LOCATION_ID,
    locationAuthority: "server-published-nearby",
    userLocationStored: false,
  }, { merge: true });

  const completion = await expectOk("completeAdventureAttempt", userToken, { attemptId });
  const rewardLedgerEventId = adventureRewardLedgerId(USER_ID, MISSION_ID);
  assert(completion.xpLedgerEventId === rewardLedgerEventId, "Abenteuerreward braucht einen deterministischen Ledger-Eintrag.");
  assert(completion.rewardXp === 240 && completion.remainingWfxp === 280, "Museums-Abenteuer muss nach Review +240 WFXP gutschreiben.");
  assert(completion.locationId === LOCATION_ID && completion.missionCompletionAuthorized === true, "Completion muss den autorisierten Ort dokumentieren.");
  assert(completion.tokenAuthorized === false && completion.cashoutAllowed === false, "Adventure Completion darf keine Token- oder Cashout-Autoritaet erzeugen.");

  const completionReplay = await expectOk("completeAdventureAttempt", userToken, { attemptId });
  assert(completionReplay.idempotent === true && completionReplay.xpLedgerEventId === rewardLedgerEventId, "Completion-Replay darf keinen zweiten Reward schreiben.");
  const completedAccessReplay = await expectOk("startAdventureMission", userToken, accessPayload());
  assert(completedAccessReplay.idempotent === true && completedAccessReplay.missionCompletionAuthorized === true, "Abgeschlossenes Abenteuer darf weder neu abbuchen noch neu starten.");

  const finalProgress = await expectOk("getAdventureProgress", userToken, {});
  assert(finalProgress.completedMissionIds.includes(MISSION_ID), "Abenteuerprojektion muss das abgeschlossene Museums-Quiz enthalten.");
  assert(finalProgress.walletBalance === 280 && finalProgress.lifetimeSpent === 10, "Abenteuerprojektion muss Wallet und einmaligen Spend korrekt anzeigen.");
  assert(finalProgress.activeAttempts.length === 0, "Abgeschlossenes Abenteuer darf nicht mehr aktiv sein.");

  const wallet = (await db.collection("xpWallets").doc(USER_ID).get()).data() || {};
  assert(wallet.balance === 280 && wallet.lifetimeSpent === 10, "Wallet muss atomaren Access-Spend und Reward enthalten.");
  const accessLedgerCount = await db.collection("xpLedgerEvents").where("ownerUserId", "==", USER_ID).where("reason", "==", "adventure-access").get();
  assert(accessLedgerCount.size === 1, "Ein Abenteuer darf exakt einen Access-Ledger-Eintrag erzeugen.");
  const rewardLedgerCount = await db.collection("xpLedgerEvents").where("ownerUserId", "==", USER_ID).where("reason", "==", "mission-completion").get();
  assert(rewardLedgerCount.size === 1, "Adventure Completion darf exakt einen Reward-Ledger-Eintrag erzeugen.");

  await expectCallableError(
    "startAdventureMission",
    userToken,
    { ...accessPayload(), childProfileId: "child-disabled" },
    "Child Profiles muessen fuer den ersten Abenteuerkatalog deaktiviert sein",
  );
  await expectCallableError(
    "startAdventureMission",
    userToken,
    { ...accessPayload(), missionId: "adventure-unknown" },
    "Unbekanntes Abenteuer muss abgelehnt werden",
  );

  console.log("WellFit Beta 1 Global Adventure Mission Progress Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(EMPTY_USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
