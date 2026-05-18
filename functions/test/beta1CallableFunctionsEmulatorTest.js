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
  const missionCreate = await expectOk("adminCreateMission", adminToken, { missionId: "mission_beta1", title: "Beta 1 Walk", rewardXp: 35, childAllowed: true });
  assert(missionCreate.status === "draft", "Admin Mission Create muss draft liefern.");
  const missionPublish = await expectOk("adminPublishMission", adminToken, { missionId: "mission_beta1" });
  assert(missionPublish.status === "published", "Admin Mission Publish muss published liefern.");

  const family = await expectOk("createGuardianFamilyAccount", userToken, { displayName: "Beta Family" });
  assert(family.familyAccountId, "Family Account muss erzeugt werden.");
  await expectCallableError("createChildProfile", userToken, { familyAccountId: family.familyAccountId, nickname: "TooYoung", age: 7 }, "Child Profile unter 8 muss abgelehnt werden");
  await expectCallableError("createChildProfile", userToken, { familyAccountId: family.familyAccountId, nickname: "TooOld", age: 14 }, "Child Profile ueber 13 muss abgelehnt werden");
  const child = await expectOk("createChildProfile", userToken, { familyAccountId: family.familyAccountId, nickname: "Kid", age: 10, permissions: { missions: true } });
  assert(child.standaloneLoginAllowed === false, "Child Profile darf keinen Standalone Login erlauben.");
  await expectCallableError("startMissionAttempt", userToken, { missionId: "mission_beta1", childProfileId: child.childProfileId }, "Child Mission Start braucht Consent");
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "missions" });
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "shop" });
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "location" });
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "cameraEvidence" });
  await expectOk("updateChildPermissions", userToken, { childProfileId: child.childProfileId, permissions: { missions: true, shop: true, location: true, cameraEvidence: true } });
  await expectCallableError("startMissionAttempt", otherToken, { missionId: "mission_beta1", childProfileId: child.childProfileId }, "Nicht verlinkter Guardian darf Child Mission nicht starten");

  const attempt = await expectOk("startMissionAttempt", userToken, { missionId: "mission_beta1", childProfileId: child.childProfileId, deviceId: "device-1" });
  assert(attempt.missionCompletionAuthorized === false, "Mission Start darf Completion nicht final autorisieren.");
  const evidence = await expectOk("submitMissionEvidence", userToken, { attemptId: attempt.attemptId, evidenceType: "manual-test" });
  assert(evidence.xpAuthorized === false, "Evidence Submit darf XP nicht final autorisieren.");
  const cameraEvidence = await expectOk("submitMissionEvidence", userToken, { attemptId: attempt.attemptId, evidenceType: "camera" });
  assert(cameraEvidence.xpAuthorized === false, "Camera Evidence darf XP nicht final autorisieren.");
  const completion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(completion.xpAuthorized === true, "Server Completion muss XP autorisieren.");
  assert(completion.tokenAuthorized === false, "Server Completion darf keine Token autorisieren.");
  const duplicateCompletion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(duplicateCompletion.xpLedgerEventId === completion.xpLedgerEventId || duplicateCompletion.completionId === completion.completionId, "Duplicate Mission Completion muss denselben Completion-Kontext nutzen.");

  const wallet = await expectOk("getXpWallet", userToken, { childProfileId: child.childProfileId });
  assert(wallet.wallet.balance === 35, `Child Wallet muss 35 WFXP enthalten: ${JSON.stringify(wallet)}`);
  const ledgerDoc = await db.collection("xpLedgerEvents").doc(completion.xpLedgerEventId).get();
  assert(ledgerDoc.exists, "Completion muss xpLedgerEvents schreiben.");
  assert(ledgerDoc.data().noMonetaryValue === true, "XP Ledger muss noMonetaryValue=true schreiben.");
  assert(ledgerDoc.data().blockchainBacked === false, "XP Ledger darf nicht blockchain-backed sein.");
  assert(ledgerDoc.data().cashoutAllowed === false, "XP Ledger darf kein Cashout erlauben.");
  await expectCallableError("adminAdjustXp", adminToken, { ownerUserId: "beta1-user", delta: 1 }, "Admin XP Adjustment braucht reason");
  const adminAdjustment = await expectOk("adminAdjustXp", adminToken, { ownerUserId: "beta1-user", childProfileId: child.childProfileId, delta: 5, reason: "qa-hardening", idempotencyKey: "qa_adjust_child" });
  assert(adminAdjustment.noMonetaryValue === true && adminAdjustment.cashoutAllowed === false, "Admin XP Adjustment bleibt internal-only.");
  await expectOk("adminAdjustXp", adminToken, { ownerUserId: "beta1-user", childProfileId: child.childProfileId, delta: 5, reason: "qa-hardening", idempotencyKey: "qa_adjust_child" });

  const intent = await expectOk("createShopPurchaseIntent", userToken, { shopItemId: "beta_shoes", childProfileId: child.childProfileId });
  assert(intent.purchaseAuthorized === false, "Purchase Intent darf noch nicht final autorisieren.");
  const purchase = await expectOk("completeXpShopPurchase", userToken, { intentId: intent.intentId });
  assert(purchase.purchaseAuthorized === true && purchase.inventoryAuthorized === true, "Server Purchase muss Kauf und Inventory final autorisieren.");
  await expectCallableError("completeXpShopPurchase", userToken, { intentId: intent.intentId }, "Duplicate Shop Purchase darf Inventory nicht doppelt grantieren");
  const walletAfterPurchase = await expectOk("getXpWallet", userToken, { childProfileId: child.childProfileId });
  assert(walletAfterPurchase.wallet.balance === 20, `Wallet muss nach Admin Adjustment und Shop Spend 20 WFXP enthalten: ${JSON.stringify(walletAfterPurchase)}`);
  const inventory = await expectOk("listInventory", userToken, { childProfileId: child.childProfileId });
  assert(inventory.items.length === 1, `Duplicate Shop Purchase darf nur ein Inventory Item grantieren: ${JSON.stringify(inventory)}`);

  const checkpoint = await expectOk("adminCreateCheckpoint", adminToken, { checkpointId: "cp_beta1", title: "Beta Checkpoint" });
  assert(checkpoint.checkpointId === "cp_beta1", "Admin Checkpoint muss angelegt werden.");
  const score = await expectOk("submitCheckpointScore", userToken, { checkpointId: "cp_beta1", score: 123 });
  assert(score.mayorAuthorized === false, "Checkpoint Score darf Mayor nicht clientseitig autorisieren.");
  await expectCallableError("submitCheckpointScore", userToken, { checkpointId: "cp_beta1", score: 123, childProfileId: child.childProfileId }, "Junior Mayors muessen deaktiviert sein");
  const mayorShare = await expectOk("adminGrantMayorShareXp", adminToken, { mayorUserId: "beta1-user", checkpointId: "cp_beta1", xpAmount: 5, idempotencyKey: "mayor-share-qa" });
  assert(mayorShare.xpAuthorized === true && mayorShare.cashoutAllowed === false, "Mayor Share muss WFXP-only ohne Cashout sein.");
  const duplicateMayorShare = await expectOk("adminGrantMayorShareXp", adminToken, { mayorUserId: "beta1-user", checkpointId: "cp_beta1", xpAmount: 5, idempotencyKey: "mayor-share-qa" });
  assert(duplicateMayorShare.idempotent === true, "Mayor Share muss Idempotency Key respektieren.");

  const activeWindow = glitchWindow();
  await expectCallableError("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_too_long", regionId: "vienna", locationIds: ["safe-location-1"], windowStart: activeWindow.windowStart, windowEnd: new Date(Date.now() + 11 * 60000).toISOString(), multiplierCap: 10 }, "Glitch Dauer ueber 10 Minuten muss abgelehnt werden");
  await expectCallableError("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_too_high", regionId: "vienna", locationIds: ["safe-location-1"], ...activeWindow, multiplierCap: 11 }, "Glitch Multiplier ueber 10 muss abgelehnt werden");
  await expectCallableError("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_region", regionId: "berlin", locationIds: ["safe-location-1"], ...activeWindow, multiplierCap: 2 }, "Glitch ausserhalb Wien/Niederoesterreich muss abgelehnt werden");
  await expectCallableError("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_unsafe", regionId: "vienna", locationIds: ["safe-location-1"], ...activeWindow, unsafeLocation: true, multiplierCap: 2 }, "Unsafe Glitch Location muss abgelehnt werden");
  const expiredWindow = glitchWindow(-20, -11);
  await expectOk("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_expired", regionId: "vienna", locationIds: ["safe-location-1"], ...expiredWindow, multiplierCap: 2 });
  await expectCallableError("checkInToGlitch", userToken, { glitchEventId: "glitch_expired", childProfileId: child.childProfileId }, "Glitch Check-in ausserhalb Fenster muss abgelehnt werden");
  const glitch = await expectOk("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_beta1", regionId: "vienna", locationIds: ["safe-location-1"], ...activeWindow, multiplierCap: 10 });
  assert(glitch.multiplierCap === 10, "Glitch Cap darf 10x sein.");
  const glitchCheckIn = await expectOk("checkInToGlitch", userToken, { glitchEventId: "glitch_beta1", childProfileId: child.childProfileId });
  assert(glitchCheckIn.boostAuthorized === false, "Glitch Check-in darf Boost nicht clientseitig autorisieren.");
  const duplicateGlitchCheckIn = await expectOk("checkInToGlitch", userToken, { glitchEventId: "glitch_beta1", childProfileId: child.childProfileId });
  assert(duplicateGlitchCheckIn.idempotent === true, "Duplicate Glitch Check-in muss idempotent bleiben.");
  await expectCallableError("activateGlitchBoost", userToken, { glitchEventId: "glitch_beta1" }, "activateGlitchBoost muss internal-only bleiben");
  const cancelGlitch = await expectOk("cancelGlitchEvent", adminToken, { glitchEventId: "glitch_beta1", reason: "test cancel" });
  assert(cancelGlitch.status === "cancelled", "Admin Cancel muss Glitch abbrechen.");
  await expectCallableError("checkInToGlitch", userToken, { glitchEventId: "glitch_beta1", childProfileId: child.childProfileId }, "Cancelled Glitch darf keine Boost-Aktivierung/Check-in erlauben");

  const report = await expectOk("reportMissionSafetyIssue", userToken, { subjectType: "mission", subjectId: "mission_beta1", severity: "review", message: "test" });
  const review = await expectOk("adminReviewSafetyReport", adminToken, { reportId: report.reportId, status: "reviewed", reviewNote: "handled" });
  assert(review.status === "reviewed", "Admin Safety Review muss reviewed schreiben.");

  const audits = await db.collection("adminActions").limit(20).get();
  assert(!audits.empty, "Admin-/Serverentscheidungen muessen adminActions Audit Records schreiben.");
  await expectCallableError("adminAdjustXp", otherToken, { ownerUserId: "beta1-other", delta: 100 }, "Nicht-Admin darf XP nicht adjustieren");

  const rawWallet = await db.collection("xpWallets").doc(`beta1-user_${child.childProfileId}`).get();
  assert(rawWallet.exists, "XP Wallet Projection muss serverseitig geschrieben werden.");
  assert(rawWallet.data().blockchainBacked === false, "XP Wallet darf nicht blockchain-backed sein.");
  assert(rawWallet.data().cashoutAllowed === false && rawWallet.data().realMoney === false, "XP Wallet darf Cashout/Real Money nicht aktivieren.");

  console.log("WellFit Beta 1 Callable Functions Emulator Test erfolgreich.");
  await admin.auth().deleteUser("beta1-admin");
  await admin.auth().deleteUser("beta1-user");
  await admin.auth().deleteUser("beta1-other");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
