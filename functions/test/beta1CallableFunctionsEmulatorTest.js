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
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${functionName} muss accepted=true liefern: ${describeCall(response)}`);
  return result;
}

async function expectCallableError(functionName, token, data, label) {
  const response = await callCallable(functionName, token, data);
  assert(!response.ok, `${label || functionName} muss fehlschlagen: ${describeCall(response)}`);
  return response;
}

function glitchWindow(offsetStartMinutes = -1, offsetEndMinutes = 9) {
  const now = Date.now();
  return {
    windowStart: new Date(now + offsetStartMinutes * 60000).toISOString(),
    windowEnd: new Date(now + offsetEndMinutes * 60000).toISOString(),
  };
}

async function run() {
  console.log("WellFit Beta 1 Callable Functions Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser("beta1-admin", true);
  const userToken = await createAuthUser("beta1-user", false);
  const otherToken = await createAuthUser("beta1-other", false);

  await expectCallableError("adminCreateMission", userToken, { title: "Hack" }, "Nicht-Admin darf keine Mission anlegen");
  const missionCreate = await expectOk("adminCreateMission", adminToken, {
    missionId: "mission_beta1",
    title: "Beta 1 Walk",
    rewardXp: 35,
    childAllowed: true,
  });
  assert(missionCreate.status === "draft", "Admin Mission Create muss draft liefern.");
  const missionPublish = await expectOk("adminPublishMission", adminToken, { missionId: "mission_beta1" });
  assert(missionPublish.status === "published", "Admin Mission Publish muss published liefern.");

  const family = await expectOk("createGuardianFamilyAccount", userToken, { displayName: "Beta Family" });
  const child = await expectOk("createChildProfile", userToken, {
    familyAccountId: family.familyAccountId,
    nickname: "Kid",
    age: 10,
    permissions: { missions: true },
  });
  assert(child.standaloneLoginAllowed === false, "Child Profile darf keinen Standalone Login erlauben.");
  await expectCallableError(
    "startMissionAttempt",
    userToken,
    { missionId: "mission_beta1", childProfileId: child.childProfileId },
    "Child Mission Start braucht Consent",
  );
  for (const consentType of ["missions", "shop", "location", "cameraEvidence"]) {
    await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType });
  }
  await expectOk("updateChildPermissions", userToken, {
    childProfileId: child.childProfileId,
    permissions: { missions: true, shop: true, location: true, cameraEvidence: true },
  });
  await expectCallableError(
    "startMissionAttempt",
    otherToken,
    { missionId: "mission_beta1", childProfileId: child.childProfileId },
    "Nicht verlinkter Guardian darf Child Mission nicht starten",
  );

  const attempt = await expectOk("startMissionAttempt", userToken, {
    missionId: "mission_beta1",
    childProfileId: child.childProfileId,
    deviceId: "device-1",
  });
  const evidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: attempt.attemptId,
    evidenceType: "manual-test",
  });
  assert(evidence.reviewStatus === "pending-server-review" && evidence.xpAuthorized === false, "Evidence muss auf Review warten.");
  await expectCallableError(
    "completeMissionAttempt",
    userToken,
    { attemptId: attempt.attemptId },
    "Mission Completion muss vor Evidence Review blockiert sein",
  );
  await expectCallableError(
    "adminReviewMissionEvidence",
    userToken,
    { evidenceId: evidence.evidenceId, decision: "approved", reviewNote: "unauthorized" },
    "Nicht-Admin darf Mission Evidence nicht freigeben",
  );
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: evidence.evidenceId,
    decision: "approved",
    reviewNote: "Emulator QA Evidence freigegeben",
  });
  const completion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(completion.xpAuthorized === true && completion.tokenAuthorized === false, "Completion darf nur interne WFXP autorisieren.");
  const duplicateCompletion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(duplicateCompletion.idempotent === true && duplicateCompletion.xpLedgerEventId === completion.xpLedgerEventId, "Duplicate Completion muss idempotent sein.");

  const wallet = await expectOk("getXpWallet", userToken, { childProfileId: child.childProfileId });
  assert(wallet.wallet.balance === 35, `Child Wallet muss 35 WFXP enthalten: ${JSON.stringify(wallet)}`);
  const ledgerDoc = await db.collection("xpLedgerEvents").doc(completion.xpLedgerEventId).get();
  assert(ledgerDoc.exists && ledgerDoc.data().noMonetaryValue === true, "Completion muss einen internen Ledger schreiben.");
  assert(ledgerDoc.data().blockchainBacked === false && ledgerDoc.data().cashoutAllowed === false, "Ledger darf nicht blockchain-backed oder auszahlbar sein.");

  await expectCallableError(
    "adminAdjustXp",
    adminToken,
    { ownerUserId: "beta1-user", delta: 1 },
    "Admin XP Adjustment braucht reason",
  );
  const adjustment = await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: "beta1-user",
    childProfileId: child.childProfileId,
    delta: 5,
    reason: "qa-hardening",
    idempotencyKey: "qa_adjust_child",
  });
  assert(adjustment.noMonetaryValue === true && adjustment.cashoutAllowed === false, "Admin XP Adjustment bleibt internal-only.");
  const adjustmentReplay = await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: "beta1-user",
    childProfileId: child.childProfileId,
    delta: 5,
    reason: "qa-hardening",
    idempotencyKey: "qa_adjust_child",
  });
  assert(adjustmentReplay.idempotent === true, "Admin XP Adjustment muss idempotent sein.");

  const intent = await expectOk("createShopPurchaseIntent", userToken, {
    shopItemId: "beta_shoes",
    childProfileId: child.childProfileId,
  });
  const purchase = await expectOk("completeXpShopPurchase", userToken, { intentId: intent.intentId });
  assert(purchase.purchaseAuthorized === true && purchase.inventoryAuthorized === true, "Server Purchase muss Kauf und Inventory autorisieren.");
  await expectCallableError(
    "completeXpShopPurchase",
    userToken,
    { intentId: intent.intentId },
    "Duplicate Shop Purchase darf Inventory nicht doppelt grantieren",
  );
  const walletAfterPurchase = await expectOk("getXpWallet", userToken, { childProfileId: child.childProfileId });
  assert(walletAfterPurchase.wallet.balance === 20, "Wallet muss nach Adjustment und Shop Spend 20 WFXP enthalten.");

  const checkpoint = await expectOk("adminCreateCheckpoint", adminToken, {
    checkpointId: "cp_beta1",
    title: "Beta Checkpoint",
  });
  assert(checkpoint.checkpointId === "cp_beta1", "Admin Checkpoint muss angelegt werden.");
  const score = await expectOk("submitCheckpointScore", userToken, { checkpointId: "cp_beta1", score: 123 });
  assert(score.mayorAuthorized === false, "Checkpoint Score darf Mayor nicht clientseitig autorisieren.");
  const mayorShare = await expectOk("adminGrantMayorShareXp", adminToken, {
    mayorUserId: "beta1-user",
    checkpointId: "cp_beta1",
    xpAmount: 5,
    idempotencyKey: "mayor-share-qa",
  });
  assert(mayorShare.xpAuthorized === true && mayorShare.cashoutAllowed === false, "Mayor Share muss WFXP-only bleiben.");

  const BERLIN_LOCATION_ID = "safe-location-berlin";
  const BERLIN = { latitude: 52.520008, longitude: 13.404954 };
  await expectOk("adminUpsertMissionLocation", adminToken, {
    locationId: BERLIN_LOCATION_ID,
    title: "Berlin Global Glitch Hub",
    regionId: "de-berlin",
    countryCode: "DE",
    locality: "Berlin",
    locationType: "public-space",
    latitude: BERLIN.latitude,
    longitude: BERLIN.longitude,
    missionIds: ["mission_beta1"],
    safeLocationReviewed: true,
    safetyReviewNote: "[emulator-qa] global sicher",
    status: "published",
  });

  const activeWindow = glitchWindow();
  await expectCallableError(
    "adminScheduleGlitchEvent",
    adminToken,
    {
      glitchEventId: "glitch_too_long",
      regionId: "de-berlin",
      locationIds: [BERLIN_LOCATION_ID],
      windowStart: activeWindow.windowStart,
      windowEnd: new Date(Date.now() + 11 * 60000).toISOString(),
      multiplierCap: 10,
    },
    "Glitch Dauer ueber 10 Minuten muss abgelehnt werden",
  );
  await expectCallableError(
    "adminScheduleGlitchEvent",
    adminToken,
    { glitchEventId: "glitch_invalid_region", regionId: "Berlin Mitte!", locationIds: [BERLIN_LOCATION_ID], ...activeWindow, multiplierCap: 2 },
    "Ungueltige globale Regions-ID muss abgelehnt werden",
  );
  await expectCallableError(
    "adminScheduleGlitchEvent",
    adminToken,
    { glitchEventId: "glitch_wrong_region", regionId: "fr-paris", locationIds: [BERLIN_LOCATION_ID], ...activeWindow, multiplierCap: 2 },
    "Glitch-Ort muss zur angegebenen Region gehoeren",
  );
  await expectCallableError(
    "adminScheduleGlitchEvent",
    adminToken,
    { glitchEventId: "glitch_unsafe", regionId: "de-berlin", locationIds: [BERLIN_LOCATION_ID], ...activeWindow, unsafeLocation: true, multiplierCap: 2 },
    "Unsafe Glitch Location muss abgelehnt werden",
  );

  const expiredWindow = glitchWindow(-20, -11);
  await expectOk("adminScheduleGlitchEvent", adminToken, {
    glitchEventId: "glitch_expired",
    regionId: "de-berlin",
    locationIds: [BERLIN_LOCATION_ID],
    ...expiredWindow,
    multiplierCap: 2,
  });
  await expectCallableError(
    "checkInToGlitch",
    userToken,
    {
      glitchEventId: "glitch_expired",
      locationId: BERLIN_LOCATION_ID,
      ...BERLIN,
      childProfileId: child.childProfileId,
    },
    "Glitch Check-in ausserhalb Fenster muss abgelehnt werden",
  );

  const glitch = await expectOk("adminScheduleGlitchEvent", adminToken, {
    glitchEventId: "glitch_beta1_global",
    regionId: "de-berlin",
    locationIds: [BERLIN_LOCATION_ID],
    ...activeWindow,
    multiplierCap: 10,
  });
  assert(glitch.multiplierCap === 10 && glitch.regionId === "de-berlin" && glitch.globalCatalog === true, "Globaler Glitch muss 10x und die Region ausweisen.");
  const listed = await expectOk("listGlitchEvents", userToken, { regionId: "de-berlin" });
  assert(listed.events.some((event) => event.glitchEventId === "glitch_beta1_global"), "Regionale Liste muss den Berliner Glitch enthalten.");
  await expectCallableError(
    "checkInToGlitch",
    userToken,
    {
      glitchEventId: "glitch_beta1_global",
      locationId: BERLIN_LOCATION_ID,
      latitude: 48.2082,
      longitude: 16.3738,
      childProfileId: child.childProfileId,
    },
    "Glitch Check-in muss unmittelbare Ortsnaehe verlangen",
  );
  const glitchCheckIn = await expectOk("checkInToGlitch", userToken, {
    glitchEventId: "glitch_beta1_global",
    locationId: BERLIN_LOCATION_ID,
    ...BERLIN,
    childProfileId: child.childProfileId,
  });
  assert(glitchCheckIn.boostAuthorized === false && glitchCheckIn.locationId === BERLIN_LOCATION_ID, "Check-in darf Boost nicht clientseitig autorisieren.");
  const duplicateGlitchCheckIn = await expectOk("checkInToGlitch", userToken, {
    glitchEventId: "glitch_beta1_global",
    locationId: BERLIN_LOCATION_ID,
    ...BERLIN,
    childProfileId: child.childProfileId,
  });
  assert(duplicateGlitchCheckIn.idempotent === true, "Duplicate Glitch Check-in muss idempotent bleiben.");
  const participant = (await db.collection("glitchParticipants").doc(glitchCheckIn.participantId).get()).data() || {};
  assert(participant.userLocationStored === false, "Glitch Participant muss Datensparsamkeit dokumentieren.");
  assert(participant.latitude === undefined && participant.longitude === undefined, "Glitch Participant darf keine Rohkoordinaten speichern.");
  await expectCallableError(
    "activateGlitchBoost",
    userToken,
    { glitchEventId: "glitch_beta1_global" },
    "activateGlitchBoost muss internal-only bleiben",
  );
  const cancelGlitch = await expectOk("cancelGlitchEvent", adminToken, {
    glitchEventId: "glitch_beta1_global",
    reason: "test cancel",
  });
  assert(cancelGlitch.status === "cancelled", "Admin Cancel muss Glitch abbrechen.");

  const report = await expectOk("reportMissionSafetyIssue", userToken, {
    subjectType: "mission",
    subjectId: "mission_beta1",
    severity: "review",
    message: "test",
  });
  const review = await expectOk("adminReviewSafetyReport", adminToken, {
    reportId: report.reportId,
    status: "reviewed",
    reviewNote: "handled",
  });
  assert(review.status === "reviewed", "Admin Safety Review muss reviewed schreiben.");

  const audits = await db.collection("adminActions").limit(50).get();
  assert(!audits.empty, "Admin-/Serverentscheidungen muessen Audit Records schreiben.");
  await expectCallableError(
    "adminAdjustXp",
    otherToken,
    { ownerUserId: "beta1-other", delta: 100 },
    "Nicht-Admin darf XP nicht adjustieren",
  );

  console.log("WellFit Beta 1 Callable Functions Emulator Test erfolgreich.");
  await admin.auth().deleteUser("beta1-admin");
  await admin.auth().deleteUser("beta1-user");
  await admin.auth().deleteUser("beta1-other");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
