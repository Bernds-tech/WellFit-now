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
  challengeMissionAttemptId,
  challengeMissionCompletionIdempotencyKey,
} = require("../lib/beta1ChallengeMissionProgress");

const ADMIN_ID = "challenge-admin";
const USER_ID = "challenge-user";
const OTHER_ID = "challenge-other";
const PRIMARY_LOCATION_ID = "challenge-jp-tokyo-station";
const SECONDARY_LOCATION_ID = "challenge-jp-tokyo-park";
const ORIGIN = { latitude: 35.681236, longitude: 139.767125 };
const FAR_ORIGIN = { latitude: 40.7128, longitude: -74.0060 };
const MISSIONS = [
  { missionId: "challenge-balance-park", rewardXp: 95 },
  { missionId: "challenge-fitness-duel", rewardXp: 110 },
  { missionId: "challenge-math-speed", rewardXp: 120 },
  { missionId: "challenge-reaction-test", rewardXp: 75 },
  { missionId: "challenge-ar-find", rewardXp: 140 },
  { missionId: "challenge-mindset-flow", rewardXp: 60 },
];

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

function locationPayload(locationId = PRIMARY_LOCATION_ID, coordinates = ORIGIN) {
  return {
    locationId,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
}

async function submitChallenge(userToken, missionId, suffix, locationId = PRIMARY_LOCATION_ID, coordinates = ORIGIN) {
  return expectOk("submitChallengeForReview", userToken, {
    missionId,
    ...locationPayload(locationId, coordinates),
    clientVersion: "challenge-emulator-v2",
    appSessionId: `challenge-${missionId}-${suffix}`,
  });
}

async function submitApproveComplete({ userToken, adminToken, missionId, expectedReward }) {
  const submitted = await submitChallenge(userToken, missionId, "complete");
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: submitted.evidenceId,
    decision: "approved",
    reviewNote: `[emulator-qa] ${missionId} verifiziert`,
  });
  const completion = await expectOk("completeChallengeAttempt", userToken, {
    attemptId: submitted.attemptId,
  });
  assert(completion.rewardXp === expectedReward, `${missionId} muss exakt ${expectedReward} WFXP vergeben.`);
  assert(completion.locationId === PRIMARY_LOCATION_ID, `${missionId} muss den freigegebenen Challenge-Ort dokumentieren.`);
  assert(completion.xpAuthorized === true && completion.missionCompletionAuthorized === true, `${missionId} muss erst bei Completion WFXP autorisieren.`);
  assert(completion.tokenAuthorized === false && completion.cashoutAllowed === false, `${missionId} darf keine Token- oder Cashout-Autoritaet erzeugen.`);
  return { submitted, completion };
}

async function run() {
  console.log("WellFit Beta 1 Global Challenge Mission Progress Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const otherToken = await createAuthUser(OTHER_ID, false);

  await expectCallableError(
    "adminEnsureChallengeMissionCatalog",
    userToken,
    {},
    "Nicht-Admin darf Challenge-Katalog nicht veroeffentlichen",
  );

  const catalog = await expectOk("adminEnsureChallengeMissionCatalog", adminToken, {});
  assert(catalog.catalogId === "wellfit-beta1-challenge-missions", "Challenge-Katalog braucht die kanonische Catalog-ID.");
  assert(catalog.catalogVersion === "1.1.0", "Challenge-Katalog braucht die globale Standortversion 1.1.0.");
  assert(catalog.completionPolicy === "once-per-mission-per-user", "Challenge-Katalog braucht die sichere Abschluss-Policy.");
  assert(catalog.locationPolicy === "nearby-published-location", "Challenge-Katalog muss weltweit nutzernahe, publizierte Orte verlangen.");
  assert(catalog.startRadiusMeters === 500, "Challenge-Start muss auf 500 Meter begrenzt sein.");
  assert(catalog.count === 6, "Challenge-Katalog muss genau sechs Missionen enthalten.");
  assert(catalog.currency === "WFXP" && catalog.noMonetaryValue === true, "Challenge-Katalog muss WFXP-only bleiben.");
  assert(catalog.tokenAuthorized === false && catalog.cashoutAllowed === false, "Challenge-Katalog darf Token oder Cashout nicht aktivieren.");

  for (const expected of MISSIONS) {
    const mission = catalog.missions.find((item) => item.missionId === expected.missionId);
    assert(mission, `Kanonische Challenge fehlt: ${expected.missionId}`);
    assert(mission.rewardXp === expected.rewardXp, `Falscher Katalogwert fuer ${expected.missionId}.`);
    assert(mission.locationPolicy === catalog.locationPolicy, `${expected.missionId} braucht die globale Standort-Policy.`);
    assert(mission.startRadiusMeters === 500, `${expected.missionId} braucht die 500-Meter-Grenze.`);
    const snapshot = await db.collection("missions").doc(expected.missionId).get();
    const data = snapshot.data() || {};
    assert(snapshot.exists && data.status === "published", `${expected.missionId} muss publiziert sein.`);
    assert(data.locationPolicy === catalog.locationPolicy, `${expected.missionId} muss serverseitig ortsgebunden sein.`);
  }

  for (const [locationId, title, longitude] of [
    [PRIMARY_LOCATION_ID, "Tokyo Station Challenge Hub", ORIGIN.longitude],
    [SECONDARY_LOCATION_ID, "Tokyo Park Challenge Hub", ORIGIN.longitude + 0.001],
  ]) {
    const location = await expectOk("adminUpsertMissionLocation", adminToken, {
      locationId,
      title,
      subtitle: "Globaler Emulator-Testort",
      regionId: "jp-tokyo",
      countryCode: "JP",
      locality: "Tokyo",
      locationType: "public-space",
      latitude: ORIGIN.latitude,
      longitude,
      icon: "📍",
      missionIds: MISSIONS.map((mission) => mission.missionId),
      safeLocationReviewed: true,
      safetyReviewNote: "[emulator-qa] sicherer Challenge-Testort",
      status: "published",
    });
    assert(location.globalCatalog === true && location.safeLocationReviewed === true, "Challenge-Ort muss weltweit und sicher publiziert sein.");
  }

  const initial = await expectOk("getChallengeProgress", userToken, {});
  assert(initial.catalogVersion === "1.1.0", "Progress muss die globale Challenge-Katalogversion ausweisen.");
  assert(initial.locationPolicy === "nearby-published-location", "Progress muss die Standort-Policy ausweisen.");
  assert(initial.locationAuthority === "server-published-nearby", "Progress muss die Ortsautoritaet ausweisen.");
  assert(initial.globalCatalog === true && initial.userLocationStored === false, "Progress muss global bleiben und keinen Rohstandort speichern.");
  assert(initial.startedMissionIds.length === 0 && initial.completedMissionIds.length === 0, "Neuer Nutzer muss ohne Challenge-Fortschritt starten.");

  const firstMission = MISSIONS[0];
  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    { missionId: firstMission.missionId },
    "Challenge ohne Ort und Koordinaten muss blockiert werden",
  );
  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    {
      missionId: firstMission.missionId,
      ...locationPayload(PRIMARY_LOCATION_ID, FAR_ORIGIN),
    },
    "Challenge ausserhalb des 500-Meter-Radius muss blockiert werden",
  );

  const firstSubmit = await submitChallenge(userToken, firstMission.missionId, "first");
  const deterministicAttemptId = challengeMissionAttemptId(USER_ID, firstMission.missionId);
  assert(firstSubmit.attemptId === deterministicAttemptId, "Challenge braucht einen deterministischen Attempt pro Nutzer und Mission.");
  assert(firstSubmit.locationId === PRIMARY_LOCATION_ID, "Challenge muss den ausgewaehlten globalen Ort binden.");
  assert(firstSubmit.locationAuthority === "server-published-nearby" && firstSubmit.userLocationStored === false, "Submission muss ortsautorisiert und datensparsam sein.");
  assert(firstSubmit.reviewStatus === "pending-server-review", "Neue Challenge-Evidence muss auf Admin-Review warten.");
  assert(firstSubmit.missionCompletionAuthorized === false && firstSubmit.xpAuthorized === false, "Submission darf weder Completion noch WFXP autorisieren.");

  const firstReplay = await submitChallenge(userToken, firstMission.missionId, "replay");
  assert(firstReplay.idempotent === true, "Wiederholte Submission am selben Ort muss denselben offenen Vorgang wiederverwenden.");
  assert(firstReplay.attemptId === firstSubmit.attemptId && firstReplay.evidenceId === firstSubmit.evidenceId, "Replay darf keine parallele Reward-Route erzeugen.");

  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    {
      missionId: firstMission.missionId,
      ...locationPayload(SECONDARY_LOCATION_ID, { latitude: ORIGIN.latitude, longitude: ORIGIN.longitude + 0.001 }),
    },
    "Bereits gestartete Challenge darf nicht an einen anderen Ort verschoben werden",
  );
  await expectCallableError(
    "getMissionAttemptStatus",
    otherToken,
    { attemptId: firstSubmit.attemptId, evidenceId: firstSubmit.evidenceId },
    "Fremdnutzer darf Challenge-Attempt nicht lesen",
  );
  await expectCallableError(
    "completeChallengeAttempt",
    userToken,
    { attemptId: firstSubmit.attemptId },
    "Completion vor Admin-Review muss blockiert sein",
  );

  const attemptDoc = (await db.collection("missionAttempts").doc(firstSubmit.attemptId).get()).data() || {};
  const evidenceDoc = (await db.collection("missionEvidence").doc(firstSubmit.evidenceId).get()).data() || {};
  assert(attemptDoc.locationId === PRIMARY_LOCATION_ID && attemptDoc.locationPolicy === catalog.locationPolicy, "Attempt muss Ort und Policy speichern.");
  assert(attemptDoc.latitude === undefined && attemptDoc.longitude === undefined, "Attempt darf keine Rohkoordinaten speichern.");
  assert(evidenceDoc.locationId === PRIMARY_LOCATION_ID, "Evidence muss mit dem Challenge-Ort verbunden sein.");
  assert(evidenceDoc.latitude === undefined && evidenceDoc.longitude === undefined, "Evidence darf keine Rohkoordinaten speichern.");

  const queue = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
    limit: 50,
  });
  assert(queue.evidence.some((item) => item.evidenceId === firstSubmit.evidenceId), "Challenge-Evidence muss in der bestehenden Admin-Queue erscheinen.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: firstSubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Tokyo Challenge verifiziert",
  });
  const firstStatus = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: firstSubmit.attemptId,
    evidenceId: firstSubmit.evidenceId,
  });
  assert(firstStatus.canRequestCompletion === true && firstStatus.xpAuthorized === false, "Approved Evidence muss Completion, aber noch keine WFXP erlauben.");

  const firstCompletion = await expectOk("completeChallengeAttempt", userToken, { attemptId: firstSubmit.attemptId });
  assert(firstCompletion.rewardXp === 95 && firstCompletion.locationId === PRIMARY_LOCATION_ID, "Erste Challenge muss 95 WFXP am autorisierten Ort vergeben.");
  const replayCompletion = await expectOk("completeChallengeAttempt", userToken, { attemptId: firstSubmit.attemptId });
  assert(replayCompletion.idempotent === true && replayCompletion.xpLedgerEventId === firstCompletion.xpLedgerEventId, "Completion-Replay darf keinen zweiten Ledger-Eintrag erzeugen.");

  const expectedLedgerId = challengeMissionCompletionIdempotencyKey(USER_ID, firstMission.missionId);
  const firstLedger = await db.collection("xpLedgerEvents").doc(expectedLedgerId).get();
  assert(firstLedger.exists && firstLedger.data().metadata.locationId === PRIMARY_LOCATION_ID, "Ledger muss den autorisierten Challenge-Ort dokumentieren.");

  const duplicateAttemptId = "challenge_duplicate_attempt";
  const duplicateEvidenceId = "challenge_duplicate_evidence";
  await db.collection("missionAttempts").doc(duplicateAttemptId).set({
    attemptId: duplicateAttemptId,
    missionId: firstMission.missionId,
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: null,
    status: "evidence-approved",
    catalogId: catalog.catalogId,
    completionPolicy: catalog.completionPolicy,
    locationPolicy: catalog.locationPolicy,
    locationId: PRIMARY_LOCATION_ID,
    locationTitle: "Tokyo Station Challenge Hub",
    locationAuthority: "server-published-nearby",
    latestEvidenceId: duplicateEvidenceId,
    latestEvidenceRevision: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection("missionEvidence").doc(duplicateEvidenceId).set({
    evidenceId: duplicateEvidenceId,
    attemptId: duplicateAttemptId,
    missionId: firstMission.missionId,
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: null,
    locationId: PRIMARY_LOCATION_ID,
    locationAuthority: "server-published-nearby",
    evidenceType: "challenge-user-confirmation",
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    status: "submitted",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedAt: new Date().toISOString(),
  });
  await expectCallableError(
    "completeChallengeAttempt",
    userToken,
    { attemptId: duplicateAttemptId },
    "Manipulierter zweiter Attempt darf keine doppelte Challenge-Belohnung erzeugen",
  );

  const secondSubmit = await submitChallenge(userToken, MISSIONS[1].missionId, "needs-more");
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondSubmit.evidenceId,
    decision: "needs-more-evidence",
    reviewNote: "[emulator-qa] Weitere Challenge-Bestaetigung erforderlich",
  });
  const secondResubmit = await submitChallenge(userToken, MISSIONS[1].missionId, "resubmit");
  assert(secondResubmit.attemptId === secondSubmit.attemptId, "Neue Evidence muss denselben ortsgebundenen Challenge-Attempt verwenden.");
  assert(secondResubmit.evidenceId !== secondSubmit.evidenceId, "Needs-more-evidence muss eine neue deterministische Revision erzeugen.");
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondResubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Fitness-Duell verifiziert",
  });
  const secondCompletion = await expectOk("completeChallengeAttempt", userToken, { attemptId: secondSubmit.attemptId });
  assert(secondCompletion.rewardXp === 110, "Zweite Challenge muss exakt 110 WFXP vergeben.");

  for (const mission of MISSIONS.slice(2)) {
    await submitApproveComplete({
      userToken,
      adminToken,
      missionId: mission.missionId,
      expectedReward: mission.rewardXp,
    });
  }

  const finalProgress = await expectOk("getChallengeProgress", userToken, {});
  assert(finalProgress.completedMissionIds.length === 6, "Alle sechs Challenges muessen in der Serverprojektion abgeschlossen sein.");
  assert(finalProgress.walletBalance === 600 && finalProgress.xp === 600, "Challenge-Projektion muss exakt 600 WFXP und lifetime XP anzeigen.");
  assert(finalProgress.activeAttempts.length === 0, "Abgeschlossene Challenges duerfen nicht als aktiv erscheinen.");

  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    {
      missionId: MISSIONS[2].missionId,
      childProfileId: "child-disabled",
      ...locationPayload(),
    },
    "Child Profiles muessen fuer den ersten Challenge-Katalog deaktiviert sein",
  );
  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    {
      missionId: "challenge-unknown",
      ...locationPayload(),
    },
    "Unbekannte Challenge muss abgelehnt werden",
  );

  const missionLedger = await db.collection("xpLedgerEvents")
    .where("ownerUserId", "==", USER_ID)
    .where("reason", "==", "mission-completion")
    .get();
  assert(missionLedger.size === 6, "Sechs Challenges duerfen exakt sechs Reward-Ledger-Eintraege erzeugen.");
  const legacyUserSnapshot = await db.collection("users").doc(USER_ID).get();
  assert(!legacyUserSnapshot.exists, "Challenge-Flow darf kein legacy users.points-/XP-Dokument anlegen.");

  console.log("WellFit Beta 1 Global Challenge Mission Progress Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
