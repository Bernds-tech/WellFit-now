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
  console.log("WellFit Beta 1 Mission Status Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser("mission-status-admin", true);
  const userToken = await createAuthUser("mission-status-user", false);
  const otherToken = await createAuthUser("mission-status-other", false);

  await expectOk("adminCreateMission", adminToken, {
    missionId: "mission_status_loop",
    title: "Mission Status Loop",
    type: "movement",
    rewardXp: 30,
    childAllowed: false,
  });
  await expectOk("adminPublishMission", adminToken, { missionId: "mission_status_loop" });

  const attempt = await expectOk("startMissionAttempt", userToken, { missionId: "mission_status_loop" });
  const evidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: attempt.attemptId,
    evidenceType: "dashboard-user-confirmation",
    metadata: { source: "dashboard", requiresHumanReview: true },
  });

  await expectCallableError(
    "getMissionAttemptStatus",
    otherToken,
    { attemptId: attempt.attemptId, evidenceId: evidence.evidenceId },
    "Fremder Nutzer darf Mission Status nicht lesen",
  );

  const pending = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: attempt.attemptId,
    evidenceId: evidence.evidenceId,
  });
  assert(pending.reviewStatus === "pending-server-review", "Status muss vor Review pending sein.");
  assert(pending.canRequestCompletion === false, "Pending Evidence darf Completion nicht erlauben.");
  assert(pending.missionCompletionAuthorized === false, "Pending Status darf Completion nicht autorisieren.");
  assert(pending.xpAuthorized === false, "Pending Status darf XP nicht autorisieren.");
  assert(pending.tokenAuthorized === false && pending.cashoutAllowed === false, "Status bleibt ohne Token und Cashout.");
  assert(!Object.prototype.hasOwnProperty.call(pending, "metadata"), "Status darf keine Evidence-Metadaten ausgeben.");
  assert(!Object.prototype.hasOwnProperty.call(pending, "storageRef"), "Status darf keine Storage-Referenz ausgeben.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: evidence.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Mission Status Flow freigegeben",
  });

  const approved = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: attempt.attemptId,
    evidenceId: evidence.evidenceId,
  });
  assert(approved.reviewStatus === "approved", "Status muss approved anzeigen.");
  assert(approved.serverValidationStatus === "evidence-approved", "Server Validation muss approved sein.");
  assert(approved.canRequestCompletion === true, "Freigegebene Evidence muss Completion erlauben.");
  assert(approved.missionCompletionAuthorized === false, "Status-Read selbst darf Completion nicht autorisieren.");

  const completion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(completion.rewardXp === 30, "Completion muss 30 WFXP gewähren.");
  assert(completion.xpAuthorized === true, "Completion muss XP autorisieren.");

  const completed = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: attempt.attemptId,
    evidenceId: evidence.evidenceId,
  });
  assert(completed.completionStatus === "completed", "Status muss Completion anzeigen.");
  assert(completed.canRequestCompletion === false, "Abgeschlossene Mission darf keine weitere Completion anfordern.");
  assert(completed.missionCompletionAuthorized === true, "Abgeschlossener Status muss Completion bestätigen.");
  assert(completed.xpAuthorized === true, "Abgeschlossener Status muss XP bestätigen.");
  assert(completed.rewardXp === 30, "Status muss verbuchte WFXP anzeigen.");
  assert(typeof completed.xpLedgerEventId === "string", "Status muss Ledger Event referenzieren.");

  console.log("WellFit Beta 1 Mission Status Emulator Test erfolgreich.");
  await admin.auth().deleteUser("mission-status-admin");
  await admin.auth().deleteUser("mission-status-user");
  await admin.auth().deleteUser("mission-status-other");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
