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

const MISSION_ID = "daily-squats-15";
const TARGET_REPS = 15;
const USER_ID = "mobile-pose-user";
const OTHER_USER_ID = "mobile-pose-other";
const ADMIN_ID = "mobile-pose-admin";

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

async function run() {
  console.log("WellFit Beta 1 Mobile Pose Mission Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const otherToken = await createAuthUser(OTHER_USER_ID, false);

  await expectOk("adminEnsureDailyMissionCatalog", adminToken, {});

  const attempt = await expectOk("startMissionAttempt", userToken, {
    missionId: MISSION_ID,
    clientVersion: "mobile-squat-emulator-v1",
  });
  assert(attempt.missionCompletionAuthorized === false, "Missionsstart darf keine Completion autorisieren.");

  const poseSession = await expectOk("createTrackingSession", userToken, {
    missionId: MISSION_ID,
    source: "mobile",
    proofType: "pose",
    appSessionId: "mobile-pose-session",
    clientVersion: "mobile-squat-emulator-v1",
  });
  assert(poseSession.serverValidationStatus === "pending", "Pose-Session muss als pending starten.");

  const proofInput = {
    sessionId: poseSession.sessionId,
    targetReps: TARGET_REPS,
    validReps: TARGET_REPS,
    invalidReps: 2,
    qualityScore: 88.4,
    confidence: 0.93,
    moodSignal: "positive",
    exercise: "squat",
    appSessionId: "mobile-pose-proof",
    clientVersion: "mobile-squat-emulator-v1",
  };
  const proof = await expectOk("recordPoseTrackingProof", userToken, proofInput);
  assert(proof.idempotent === false, "Erster Pose-Proof darf nicht idempotent sein.");
  assert(proof.proofEventId === `pose_${poseSession.sessionId}`, "Pose-Proof braucht deterministische ID.");
  assert(proof.serverValidationStatus === "pose-summary-received", "Pose-Proof muss als Zusammenfassung markiert sein.");
  assert(proof.rawMediaStored === false && proof.rawMediaUploaded === false, "Pose-Proof darf keine Rohmedien speichern oder hochladen.");
  assert(proof.rewardAuthorized === false && proof.missionCompletionAuthorized === false && proof.xpAuthorized === false, "Pose-Proof darf keine Reward-Autoritaet erhalten.");
  assert(proof.proofSummary.validReps === TARGET_REPS, "Saubere Wiederholungen muessen begrenzt gespeichert werden.");
  assert(proof.proofSummary.qualityScore === 88.4, "Qualitaet muss in der sicheren Zusammenfassung erhalten bleiben.");

  const replay = await expectOk("recordPoseTrackingProof", userToken, {
    ...proofInput,
    validReps: 250,
    qualityScore: 1,
  });
  assert(replay.idempotent === true, "Wiederholter Pose-Proof muss idempotent sein.");
  assert(replay.proofEventId === proof.proofEventId, "Replay darf keinen zweiten Proof erzeugen.");
  assert(replay.proofSummary.validReps === TARGET_REPS && replay.proofSummary.qualityScore === 88.4, "Replay darf die zuerst gespeicherte Zusammenfassung nicht ueberschreiben.");

  await expectCallableError(
    "recordPoseTrackingProof",
    otherToken,
    proofInput,
    "Fremdnutzer darf Pose-Session nicht verwenden",
  );

  const motionSession = await expectOk("createTrackingSession", userToken, {
    missionId: MISSION_ID,
    source: "mobile",
    proofType: "motion",
    appSessionId: "mobile-motion-session",
    clientVersion: "mobile-squat-emulator-v1",
  });
  await expectCallableError(
    "recordPoseTrackingProof",
    userToken,
    { ...proofInput, sessionId: motionSession.sessionId },
    "Motion-Session darf keine Pose-Zusammenfassung annehmen",
  );

  const evidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: attempt.attemptId,
    evidenceType: "daily-user-confirmation",
    appSessionId: "mobile-pose-evidence",
    clientVersion: "mobile-squat-emulator-v1",
    metadata: {
      source: "mobile-pose",
      verificationMode: "on-device-pose-summary",
      trackingSessionId: poseSession.sessionId,
      trackingProofEventId: proof.proofEventId,
      targetReps: TARGET_REPS,
      validReps: TARGET_REPS,
      invalidReps: 2,
      qualityScore: 88.4,
      confidence: 0.93,
      exercise: "squat",
      rawMediaStored: false,
      rawMediaUploaded: false,
    },
  });
  assert(evidence.reviewStatus === "pending-server-review", "Mobile Pose Evidence muss auf Admin-Review warten.");
  assert(evidence.missionCompletionAuthorized === false && evidence.xpAuthorized === false, "Evidence-Upload darf keine WFXP oder Completion autorisieren.");

  await db.collection("missionEvidence").doc("mobile_pose_missing_proof").set({
    evidenceId: "mobile_pose_missing_proof",
    attemptId: "missing_attempt",
    missionId: MISSION_ID,
    ownerUserId: USER_ID,
    userId: USER_ID,
    evidenceType: "daily-user-confirmation",
    status: "submitted",
    reviewStatus: "pending-server-review",
    serverValidationStatus: "evidence-received",
    storageRef: null,
    metadata: {
      source: "mobile-pose",
      trackingProofEventId: "missing_pose_proof",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const queue = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
    limit: 50,
  });
  assert(queue.rawMetadataIncluded === false, "Admin Queue darf keine freien Metadatenwerte zurueckgeben.");
  assert(queue.storageContentIncluded === false, "Admin Queue darf keine Storage-Inhalte zurueckgeben.");
  assert(queue.poseSummaryIncluded === true, "Admin Queue muss sichere Pose-Zusammenfassungen kennzeichnen.");

  const queueItem = queue.evidence.find((item) => item.evidenceId === evidence.evidenceId);
  assert(queueItem, "Mobile Pose Evidence muss in der Pending Queue erscheinen.");
  assert(queueItem.poseProofStatus === "verified-server-record", `Pose-Proof muss serverseitig verifiziert sein: ${JSON.stringify(queueItem)}`);
  assert(queueItem.poseSummary.validReps === TARGET_REPS, "Admin Queue muss die sichere Wiederholungszahl anzeigen.");
  assert(queueItem.poseSummary.invalidReps === 2, "Admin Queue muss unsaubere Wiederholungen anzeigen.");
  assert(queueItem.poseSummary.qualityScore === 88.4, "Admin Queue muss die begrenzte Qualitaet anzeigen.");
  assert(queueItem.poseSummary.rawMediaStored === false && queueItem.poseSummary.rawMediaUploaded === false, "Admin Queue muss Rohmedienfreiheit ausweisen.");
  const serializedSummary = JSON.stringify(queueItem.poseSummary);
  assert(!serializedSummary.includes(poseSession.sessionId), "Pose-Summary darf keine Session-ID enthalten.");
  assert(!serializedSummary.includes(proof.proofEventId), "Pose-Summary darf keine Proof-ID enthalten.");

  const missingItem = queue.evidence.find((item) => item.evidenceId === "mobile_pose_missing_proof");
  assert(missingItem && missingItem.poseProofStatus === "missing-server-record", "Fehlende serverseitige Pose-Proofs muessen sichtbar blockiert werden.");
  assert(missingItem.poseSummary === null, "Fehlender Pose-Proof darf keine erfundene Zusammenfassung liefern.");

  const beforeReviewStatus = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: attempt.attemptId,
    evidenceId: evidence.evidenceId,
  });
  assert(beforeReviewStatus.canRequestCompletion === false, "Pending Pose-Evidence darf Completion nicht erlauben.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: evidence.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Sichere Pose-Zusammenfassung und Testlauf verifiziert",
  });

  const approvedStatus = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: attempt.attemptId,
    evidenceId: evidence.evidenceId,
  });
  assert(approvedStatus.canRequestCompletion === true, "Approved Pose-Evidence muss Server-Completion erlauben.");
  assert(approvedStatus.xpAuthorized === false, "Vor Completion darf noch keine WFXP-Autoritaet bestehen.");

  const completion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(completion.rewardXp === 9, "Kanonische Kniebeugen-Mission muss 9 WFXP vergeben.");
  assert(completion.xpAuthorized === true && completion.missionCompletionAuthorized === true, "Nur Completion darf WFXP und Abschluss autorisieren.");
  assert(completion.tokenAuthorized === false, "Mobile Mission darf keine Token-Autoritaet erzeugen.");

  const completionReplay = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  assert(completionReplay.idempotent === true, "Wiederholte Completion muss idempotent sein.");
  assert(completionReplay.xpLedgerEventId === completion.xpLedgerEventId, "Replay darf keinen zweiten Ledger-Eintrag erzeugen.");

  const walletSnapshot = await db.collection("xpWallets").doc(USER_ID).get();
  const wallet = walletSnapshot.data() || {};
  assert(wallet.balance === 9 && wallet.lifetimeEarned === 9, `Wallet muss exakt 9 WFXP enthalten: ${JSON.stringify(wallet)}`);
  const missionLedger = await db.collection("xpLedgerEvents")
    .where("ownerUserId", "==", USER_ID)
    .where("reason", "==", "mission-completion")
    .get();
  assert(missionLedger.size === 1, "Mobile Kniebeugen-Mission darf exakt eine Ledger-Buchung erzeugen.");
  const legacyUserSnapshot = await db.collection("users").doc(USER_ID).get();
  assert(!legacyUserSnapshot.exists, "Mobile Pose Flow darf kein users.points-/Avatar-Dokument anlegen.");

  console.log("WellFit Beta 1 Mobile Pose Mission Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
