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
  const child = await expectOk("createChildProfile", userToken, { familyAccountId: family.familyAccountId, nickname: "Kid", age: 10, permissions: { missions: true } });
  assert(child.standaloneLoginAllowed === false, "Child Profile darf keinen Standalone Login erlauben.");
  await expectCallableError("startMissionAttempt", userToken, { missionId: "mission_beta1", childProfileId: child.childProfileId }, "Child Mission Start braucht Consent");
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "missions" });
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "shop" });
  await expectOk("recordParentalConsent", userToken, { childProfileId: child.childProfileId, consentType: "location" });

  const attempt = await expectOk("startMissionAttempt", userToken, { missionId: "mission_beta1", childProfileId: child.childProfileId, deviceId: "device-1" });
  assert(attempt.missionCompletionAuthorized === false, "Mission Start darf Completion nicht final autorisieren.");
  const evidence = await expectOk("submitMissionEvidence", userToken, { attemptId: attempt.attemptId, evidenceType: "manual-test" });
  assert(evidence.xpAuthorized === false, "Evidence Submit darf XP nicht final autorisieren.");
  const completion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(completion.xpAuthorized === true, "Server Completion muss XP autorisieren.");
  assert(completion.tokenAuthorized === false, "Server Completion darf keine Token autorisieren.");

  const wallet = await expectOk("getXpWallet", userToken, { childProfileId: child.childProfileId });
  assert(wallet.wallet.balance === 35, `Child Wallet muss 35 WFXP enthalten: ${JSON.stringify(wallet)}`);
  const ledgerDoc = await db.collection("xpLedgerEvents").doc(completion.xpLedgerEventId).get();
  assert(ledgerDoc.exists, "Completion muss xpLedgerEvents schreiben.");
  assert(ledgerDoc.data().noMonetaryValue === true, "XP Ledger muss noMonetaryValue=true schreiben.");

  const intent = await expectOk("createShopPurchaseIntent", userToken, { shopItemId: "beta_shoes", childProfileId: child.childProfileId });
  assert(intent.purchaseAuthorized === false, "Purchase Intent darf noch nicht final autorisieren.");
  const purchase = await expectOk("completeXpShopPurchase", userToken, { intentId: intent.intentId });
  assert(purchase.purchaseAuthorized === true && purchase.inventoryAuthorized === true, "Server Purchase muss Kauf und Inventory final autorisieren.");
  const walletAfterPurchase = await expectOk("getXpWallet", userToken, { childProfileId: child.childProfileId });
  assert(walletAfterPurchase.wallet.balance === 15, `Wallet muss nach Shop Spend 15 WFXP enthalten: ${JSON.stringify(walletAfterPurchase)}`);

  const checkpoint = await expectOk("adminCreateCheckpoint", adminToken, { checkpointId: "cp_beta1", title: "Beta Checkpoint" });
  assert(checkpoint.checkpointId === "cp_beta1", "Admin Checkpoint muss angelegt werden.");
  const score = await expectOk("submitCheckpointScore", userToken, { checkpointId: "cp_beta1", score: 123 });
  assert(score.mayorAuthorized === false, "Checkpoint Score darf Mayor nicht clientseitig autorisieren.");
  await expectCallableError("submitCheckpointScore", userToken, { checkpointId: "cp_beta1", score: 123, childProfileId: child.childProfileId }, "Junior Mayors muessen deaktiviert sein");
  const mayorShare = await expectOk("adminGrantMayorShareXp", adminToken, { mayorUserId: "beta1-user", checkpointId: "cp_beta1", xpAmount: 5 });
  assert(mayorShare.xpAuthorized === true && mayorShare.cashoutAllowed === false, "Mayor Share muss WFXP-only ohne Cashout sein.");

  const glitch = await expectOk("adminScheduleGlitchEvent", adminToken, { glitchEventId: "glitch_beta1", regionId: "vienna", locationIds: ["safe-location-1"], windowStart: "2026-05-18T10:00:00Z", windowEnd: "2026-05-18T10:10:00Z", multiplierCap: 10 });
  assert(glitch.multiplierCap === 10, "Glitch Cap darf 10x sein.");
  const glitchCheckIn = await expectOk("checkInToGlitch", userToken, { glitchEventId: "glitch_beta1", childProfileId: child.childProfileId });
  assert(glitchCheckIn.boostAuthorized === false, "Glitch Check-in darf Boost nicht clientseitig autorisieren.");
  await expectCallableError("activateGlitchBoost", userToken, { glitchEventId: "glitch_beta1" }, "activateGlitchBoost muss internal-only bleiben");
  const cancelGlitch = await expectOk("cancelGlitchEvent", adminToken, { glitchEventId: "glitch_beta1", reason: "test cancel" });
  assert(cancelGlitch.status === "cancelled", "Admin Cancel muss Glitch abbrechen.");

  const report = await expectOk("reportMissionSafetyIssue", userToken, { subjectType: "mission", subjectId: "mission_beta1", severity: "review", message: "test" });
  const review = await expectOk("adminReviewSafetyReport", adminToken, { reportId: report.reportId, status: "reviewed", reviewNote: "handled" });
  assert(review.status === "reviewed", "Admin Safety Review muss reviewed schreiben.");

  const audits = await db.collection("adminActions").limit(20).get();
  assert(!audits.empty, "Admin-/Serverentscheidungen muessen adminActions Audit Records schreiben.");
  await expectCallableError("adminAdjustXp", otherToken, { ownerUserId: "beta1-other", delta: 100 }, "Nicht-Admin darf XP nicht adjustieren");

  const rawWallet = await db.collection("xpWallets").doc(`beta1-user_${child.childProfileId}`).get();
  assert(rawWallet.exists, "XP Wallet Projection muss serverseitig geschrieben werden.");
  assert(rawWallet.data().blockchainBacked === false, "XP Wallet darf nicht blockchain-backed sein.");

  console.log("WellFit Beta 1 Callable Functions Emulator Test erfolgreich.");
  await admin.auth().deleteUser("beta1-admin");
  await admin.auth().deleteUser("beta1-user");
  await admin.auth().deleteUser("beta1-other");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
