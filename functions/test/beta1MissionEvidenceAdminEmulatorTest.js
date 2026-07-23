const {
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
  console.log("WellFit Beta 1 Mission Evidence Admin Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser("evidence-admin", true);
  const userToken = await createAuthUser("evidence-user", false);

  await expectOk("adminCreateMission", adminToken, {
    missionId: "mission_evidence_queue",
    title: "Evidence Queue Mission",
    type: "movement",
    rewardXp: 25,
    childAllowed: false,
  });
  await expectOk("adminPublishMission", adminToken, { missionId: "mission_evidence_queue" });
  const attempt = await expectOk("startMissionAttempt", userToken, { missionId: "mission_evidence_queue" });
  const evidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: attempt.attemptId,
    evidenceType: "dashboard-user-confirmation",
    metadata: { source: "dashboard", requiresHumanReview: true },
  });

  await expectCallableError(
    "adminListMissionEvidence",
    userToken,
    { reviewStatus: "pending-server-review" },
    "Nicht-Admin darf Evidence Queue nicht lesen",
  );
  await expectCallableError(
    "adminListMissionEvidence",
    adminToken,
    { reviewStatus: "unknown-status" },
    "Ungueltiger Queue-Status muss abgelehnt werden",
  );

  const pending = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
    limit: 50,
  });
  assert(pending.rawMetadataIncluded === false, "Evidence Queue darf keine Rohmetadaten ausgeben.");
  assert(pending.storageContentIncluded === false, "Evidence Queue darf keine Storage-Inhalte ausgeben.");
  assert(Array.isArray(pending.evidence), "Evidence Queue muss ein Array liefern.");
  const pendingItem = pending.evidence.find((item) => item.evidenceId === evidence.evidenceId);
  assert(pendingItem, "Pending Evidence muss in der Admin Queue sichtbar sein.");
  assert(pendingItem.evidenceType === "dashboard-user-confirmation", "Evidence Type muss sichtbar sein.");
  assert(pendingItem.storageRefPresent === false, "Queue darf nur Storage-Praesenz anzeigen.");
  assert(Array.isArray(pendingItem.metadataKeys) && pendingItem.metadataKeys.includes("source"), "Queue darf nur Metadaten-Schluessel anzeigen.");

  const review = await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: evidence.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Evidence Queue Flow geprueft",
  });
  assert(review.decision === "approved", "Admin Evidence Review muss approved liefern.");

  const pendingAfterReview = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
  });
  assert(!pendingAfterReview.evidence.some((item) => item.evidenceId === evidence.evidenceId), "Freigegebene Evidence darf nicht pending bleiben.");

  const approved = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "approved",
  });
  const approvedItem = approved.evidence.find((item) => item.evidenceId === evidence.evidenceId);
  assert(approvedItem, "Freigegebene Evidence muss in der approved Queue sichtbar sein.");
  assert(approvedItem.serverValidationStatus === "evidence-approved", "Approved Queue muss serverseitigen Status zeigen.");

  console.log("WellFit Beta 1 Mission Evidence Admin Emulator Test erfolgreich.");
  await admin.auth().deleteUser("evidence-admin");
  await admin.auth().deleteUser("evidence-user");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
