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

async function submitApproveComplete({ userToken, adminToken, missionId, expectedReward }) {
  const submitted = await expectOk("submitChallengeForReview", userToken, {
    missionId,
    clientVersion: "challenge-emulator-v1",
    appSessionId: `challenge-${missionId}`,
  });
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: submitted.evidenceId,
    decision: "approved",
    reviewNote: `[emulator-qa] ${missionId} verifiziert`,
  });
  const completion = await expectOk("completeChallengeAttempt", userToken, {
    attemptId: submitted.attemptId,
  });
  assert(completion.rewardXp === expectedReward, `${missionId} muss exakt ${expectedReward} WFXP vergeben.`);
  assert(completion.xpAuthorized === true && completion.missionCompletionAuthorized === true, `${missionId} muss erst bei Completion WFXP autorisieren.`);
  assert(completion.tokenAuthorized === false && completion.cashoutAllowed === false, `${missionId} darf keine Token- oder Cashout-Autoritaet erzeugen.`);
  return { submitted, completion };
}

async function run() {
  console.log("WellFit Beta 1 Challenge Mission Progress Emulator Test startet...");
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
  assert(catalog.catalogVersion === "1.0.0", "Challenge-Katalog braucht Version 1.0.0.");
  assert(catalog.completionPolicy === "once-per-mission-per-user", "Challenge-Katalog braucht die sichere Abschluss-Policy.");
  assert(catalog.count === 6, "Challenge-Katalog muss genau sechs Missionen enthalten.");
  assert(catalog.currency === "WFXP" && catalog.noMonetaryValue === true, "Challenge-Katalog muss WFXP-only bleiben.");
  assert(catalog.tokenAuthorized === false && catalog.cashoutAllowed === false, "Challenge-Katalog darf Token oder Cashout nicht aktivieren.");

  for (const expected of MISSIONS) {
    const mission = catalog.missions.find((item) => item.missionId === expected.missionId);
    assert(mission, `Kanonische Challenge fehlt: ${expected.missionId}`);
    assert(mission.rewardXp === expected.rewardXp, `Falscher Katalogwert fuer ${expected.missionId}.`);
    assert(mission.childAllowed === false, `Child Profiles muessen fuer ${expected.missionId} deaktiviert sein.`);
    assert(mission.evidenceType === "challenge-user-confirmation", `Evidence-Type fuer ${expected.missionId} ist falsch.`);
    assert(mission.reviewRequired === true, `Review muss fuer ${expected.missionId} Pflicht sein.`);
    assert(mission.completionPolicy === "once-per-mission-per-user", `${expected.missionId} braucht die Abschluss-Policy.`);
    const missionSnapshot = await db.collection("missions").doc(expected.missionId).get();
    const missionData = missionSnapshot.data() || {};
    assert(missionSnapshot.exists && missionData.status === "published", `${expected.missionId} muss publiziert sein.`);
    assert(missionData.catalogId === catalog.catalogId, `${expected.missionId} muss dem Challenge-Katalog zugeordnet sein.`);
    assert(missionData.evidencePolicy.allowedEvidenceTypes.length === 1, `${expected.missionId} darf nur einen Evidence-Typ akzeptieren.`);
    assert(missionData.evidencePolicy.allowedEvidenceTypes[0] === "challenge-user-confirmation", `${expected.missionId} braucht challenge-user-confirmation.`);
  }

  const initial = await expectOk("getChallengeProgress", userToken, {});
  assert(initial.catalogId === catalog.catalogId && initial.catalogVersion === catalog.catalogVersion, "Progress muss den kanonischen Challenge-Katalog ausweisen.");
  assert(initial.startedMissionIds.length === 0 && initial.completedMissionIds.length === 0, "Neuer Nutzer muss ohne Challenge-Fortschritt starten.");
  assert(initial.activeAttempts.length === 0, "Neuer Nutzer darf keine aktiven Challenge-Attempts haben.");
  assert(initial.walletBalance === 0 && initial.xp === 0 && initial.level === 1, "Neue Challenge-Projektion darf keine WFXP erfinden.");
  assert(initial.progressAuthority === "server-read", "Challenge-Fortschritt muss serverseitig abgeleitet sein.");
  assert(initial.noMonetaryValue === true && initial.tokenAuthorized === false && initial.cashoutAllowed === false, "Progress muss WFXP-only bleiben.");

  const firstMission = MISSIONS[0];
  const firstSubmit = await expectOk("submitChallengeForReview", userToken, {
    missionId: firstMission.missionId,
    clientVersion: "challenge-emulator-v1",
    appSessionId: "challenge-first-submit",
  });
  const deterministicAttemptId = challengeMissionAttemptId(USER_ID, firstMission.missionId);
  assert(firstSubmit.attemptId === deterministicAttemptId, "Challenge braucht einen deterministischen Attempt pro Nutzer und Mission.");
  assert(firstSubmit.reviewStatus === "pending-server-review", "Neue Challenge-Evidence muss auf Admin-Review warten.");
  assert(firstSubmit.missionCompletionAuthorized === false && firstSubmit.xpAuthorized === false, "Submission darf weder Completion noch WFXP autorisieren.");
  assert(firstSubmit.idempotent === false, "Erste Submission darf nicht idempotent sein.");

  const firstReplay = await expectOk("submitChallengeForReview", userToken, {
    missionId: firstMission.missionId,
    clientVersion: "challenge-emulator-v1",
    appSessionId: "challenge-first-replay",
  });
  assert(firstReplay.idempotent === true, "Wiederholte Submission muss denselben offenen Vorgang wiederverwenden.");
  assert(firstReplay.attemptId === firstSubmit.attemptId && firstReplay.evidenceId === firstSubmit.evidenceId, "Replay darf keine parallele Reward-Route erzeugen.");

  await expectCallableError(
    "submitMissionEvidence",
    userToken,
    { attemptId: firstSubmit.attemptId, evidenceType: "daily-user-confirmation" },
    "Challenge darf keinen Tages-Evidence-Typ akzeptieren",
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
  await expectCallableError(
    "adminReviewMissionEvidence",
    userToken,
    {
      evidenceId: firstSubmit.evidenceId,
      decision: "approved",
      reviewNote: "unauthorized",
    },
    "Nicht-Admin darf Challenge-Evidence nicht freigeben",
  );

  const queueBeforeReview = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
    limit: 50,
  });
  const queueItem = queueBeforeReview.evidence.find((item) => item.evidenceId === firstSubmit.evidenceId);
  assert(queueItem, "Challenge-Evidence muss in der bestehenden Admin-Queue erscheinen.");
  assert(queueItem.evidenceType === "challenge-user-confirmation", "Admin-Queue muss den Challenge-Evidence-Typ zeigen.");
  assert(queueBeforeReview.rawMetadataIncluded === false && queueBeforeReview.storageContentIncluded === false, "Admin-Queue darf keine freien Metadaten oder Storage-Inhalte liefern.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: firstSubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Balance-Park Challenge verifiziert",
  });
  const firstStatus = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: firstSubmit.attemptId,
    evidenceId: firstSubmit.evidenceId,
  });
  assert(firstStatus.canRequestCompletion === true, "Approved Challenge-Evidence muss Completion erlauben.");
  assert(firstStatus.xpAuthorized === false, "Evidence-Freigabe selbst darf noch keine WFXP autorisieren.");

  const firstCompletion = await expectOk("completeChallengeAttempt", userToken, {
    attemptId: firstSubmit.attemptId,
  });
  assert(firstCompletion.rewardXp === firstMission.rewardXp, "Erste Challenge muss exakt 95 WFXP vergeben.");
  assert(firstCompletion.xpAuthorized === true && firstCompletion.missionCompletionAuthorized === true, "Nur Completion darf WFXP und Abschluss autorisieren.");
  assert(firstCompletion.tokenAuthorized === false && firstCompletion.cashoutAllowed === false, "Completion darf keine Token- oder Cashout-Autoritaet erzeugen.");
  assert(firstCompletion.idempotent === false, "Erste Completion darf nicht idempotent sein.");

  const firstCompletionReplay = await expectOk("completeChallengeAttempt", userToken, {
    attemptId: firstSubmit.attemptId,
  });
  assert(firstCompletionReplay.idempotent === true, "Completion-Replay muss idempotent sein.");
  assert(firstCompletionReplay.xpLedgerEventId === firstCompletion.xpLedgerEventId, "Replay darf keinen zweiten Ledger-Eintrag erzeugen.");

  const firstWallet = await db.collection("xpWallets").doc(USER_ID).get();
  assert(firstWallet.data().balance === 95 && firstWallet.data().lifetimeEarned === 95, "Wallet muss nach erster Challenge exakt 95 WFXP enthalten.");
  const expectedLedgerId = challengeMissionCompletionIdempotencyKey(USER_ID, firstMission.missionId);
  assert(firstCompletion.xpLedgerEventId === expectedLedgerId, "Challenge-Abschluss braucht den deterministischen Ledger-Schluessel.");
  const firstLedger = await db.collection("xpLedgerEvents").doc(expectedLedgerId).get();
  assert(firstLedger.exists && firstLedger.data().delta === 95, "Challenge-Abschluss muss exakt ein +95-WFXP-Ledger schreiben.");
  assert(firstLedger.data().metadata.catalogId === catalog.catalogId, "Ledger muss den autorisierten Challenge-Katalog dokumentieren.");

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
  const walletAfterDuplicate = await db.collection("xpWallets").doc(USER_ID).get();
  assert(walletAfterDuplicate.data().balance === 95, "Doppel-Attempt darf Wallet nicht erneut erhoehen.");

  const secondSubmit = await expectOk("submitChallengeForReview", userToken, {
    missionId: MISSIONS[1].missionId,
    clientVersion: "challenge-emulator-v1",
    appSessionId: "challenge-second-submit",
  });
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondSubmit.evidenceId,
    decision: "needs-more-evidence",
    reviewNote: "[emulator-qa] Weitere Challenge-Bestaetigung erforderlich",
  });
  const secondResubmit = await expectOk("submitChallengeForReview", userToken, {
    missionId: MISSIONS[1].missionId,
    clientVersion: "challenge-emulator-v1",
    appSessionId: "challenge-second-resubmit",
  });
  assert(secondResubmit.attemptId === secondSubmit.attemptId, "Neue Evidence muss denselben Challenge-Attempt verwenden.");
  assert(secondResubmit.evidenceId !== secondSubmit.evidenceId, "Needs-more-evidence muss eine neue deterministische Revision erzeugen.");
  assert(secondResubmit.reviewStatus === "pending-server-review", "Neue Revision muss wieder auf Review warten.");
  await expectCallableError(
    "adminReviewMissionEvidence",
    adminToken,
    {
      evidenceId: secondSubmit.evidenceId,
      decision: "approved",
      reviewNote: "[emulator-qa] veraltete Revision",
    },
    "Veraltete Challenge-Evidence darf nach neuer Revision nicht freigegeben werden",
  );
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondResubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Fitness-Duell verifiziert",
  });
  const secondCompletion = await expectOk("completeChallengeAttempt", userToken, {
    attemptId: secondSubmit.attemptId,
  });
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
  assert(MISSIONS.every((mission) => finalProgress.completedMissionIds.includes(mission.missionId)), "Serverprojektion muss alle kanonischen Challenges enthalten.");
  assert(finalProgress.walletBalance === 600 && finalProgress.xp === 600, "Challenge-Projektion muss exakt 600 WFXP und lifetime XP anzeigen.");
  assert(finalProgress.level === 4 && finalProgress.xpForCurrentLevel === 150 && finalProgress.xpForNextLevel === 250, "Levelprojektion muss aus dem WFXP-Lifetime-Ledger abgeleitet sein.");
  assert(finalProgress.activeAttempts.length === 0, "Abgeschlossene Challenges duerfen nicht als aktiv erscheinen.");

  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    {
      missionId: MISSIONS[2].missionId,
      childProfileId: "child-disabled",
      clientVersion: "challenge-emulator-v1",
      appSessionId: "challenge-child-attempt",
    },
    "Child Profiles muessen fuer den ersten Challenge-Katalog deaktiviert sein",
  );
  await expectCallableError(
    "submitChallengeForReview",
    userToken,
    {
      missionId: "challenge-unknown",
      clientVersion: "challenge-emulator-v1",
      appSessionId: "challenge-unknown-attempt",
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

  console.log("WellFit Beta 1 Challenge Mission Progress Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
