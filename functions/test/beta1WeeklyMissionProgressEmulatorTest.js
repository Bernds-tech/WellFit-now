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
  weekKeyInTimeZone,
  weekRangeInTimeZone,
  weeklyMissionAttemptId,
  weeklyMissionCompletionIdempotencyKey,
  addUtcDays,
} = require("../lib/beta1WeeklyMissionProgress");

const ADMIN_ID = "weekly-admin";
const USER_ID = "weekly-user";
const OTHER_ID = "weekly-other";
const USER_TIME_ZONE = "Asia/Tokyo";
const OTHER_TIME_ZONE = "America/New_York";
const MISSIONS = [
  { missionId: "weekly-steps-50000", rewardXp: 25 },
  { missionId: "weekly-workouts-3", rewardXp: 15 },
  { missionId: "weekly-learning-5", rewardXp: 25 },
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

async function submitAndApprove({ userToken, adminToken, missionId, reviewNote }) {
  const submitted = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId,
    timeZone: USER_TIME_ZONE,
    clientVersion: "weekly-global-emulator-v2",
    appSessionId: `weekly-${missionId}`,
  });
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: submitted.evidenceId,
    decision: "approved",
    reviewNote: reviewNote || `[emulator-qa] ${missionId} verifiziert`,
  });
  return submitted;
}

async function run() {
  console.log("WellFit Beta 1 Global User-Local Weekly Mission Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const otherToken = await createAuthUser(OTHER_ID, false);

  await expectCallableError(
    "adminEnsureWeeklyMissionCatalog",
    userToken,
    {},
    "Nicht-Admin darf Wochenmissionskatalog nicht veroeffentlichen",
  );

  const catalog = await expectOk("adminEnsureWeeklyMissionCatalog", adminToken, {});
  assert(catalog.catalogId === "wellfit-beta1-weekly-missions", "Wochenkatalog braucht die kanonische Catalog-ID.");
  assert(catalog.catalogVersion === "1.1.0", "Wochenkatalog braucht die globale Version 1.1.0.");
  assert(catalog.completionPolicy === "once-per-mission-per-user-local-week", "Wochenkatalog braucht die nutzerlokale Wochenpolicy.");
  assert(catalog.weeklyGoal === 3 && catalog.count === 3, "Wochenkatalog muss genau drei Hauptmissionen enthalten.");
  assert(catalog.currency === "WFXP" && catalog.noMonetaryValue === true, "Wochenkatalog muss WFXP-only bleiben.");

  for (const expected of MISSIONS) {
    const mission = catalog.missions.find((item) => item.missionId === expected.missionId);
    assert(mission && mission.rewardXp === expected.rewardXp, `Kanonische Wochenmission oder Reward fehlt: ${expected.missionId}`);
    assert(mission.childAllowed === false && mission.reviewRequired === true, `${expected.missionId} muss serverseitig reviewpflichtig sein.`);
    assert(mission.evidenceType === "weekly-user-confirmation", `${expected.missionId} braucht weekly-user-confirmation.`);
    const snapshot = await db.collection("missions").doc(expected.missionId).get();
    const data = snapshot.data() || {};
    assert(snapshot.exists && data.status === "published", `${expected.missionId} muss publiziert sein.`);
    assert(data.completionPolicy === catalog.completionPolicy, `${expected.missionId} braucht die nutzerlokale Wochenpolicy.`);
  }

  const expectedWeekKey = weekKeyInTimeZone(new Date(), USER_TIME_ZONE);
  const expectedRange = weekRangeInTimeZone(new Date(), USER_TIME_ZONE);
  assert(expectedWeekKey && expectedRange, "Aktuelle Nutzerwoche muss bestimmbar sein.");

  const initial = await expectOk("getWeeklyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(initial.weekKey === expectedWeekKey, "Progress muss die aktuelle nutzerlokale Kalenderwoche verwenden.");
  assert(initial.weekStartDateKey === expectedRange.weekStartDateKey && initial.weekEndDateKey === expectedRange.weekEndDateKey, "Progress muss lokale Wochenzeitgrenzen liefern.");
  assert(initial.timeZone === USER_TIME_ZONE && initial.calendarAuthority === "server-user-time-zone", "Wochenkalender muss serverseitig an Nutzerzeitzone gebunden sein.");
  assert(initial.startedMissionIds.length === 0 && initial.completedMissionIds.length === 0, "Neue Woche muss ohne Fortschritt starten.");
  assert(initial.progressAuthority === "server-read" && initial.noMonetaryValue === true, "Wochenfortschritt muss WFXP-only und serverseitig sein.");

  const other = await expectOk("getWeeklyMissionProgress", otherToken, { timeZone: OTHER_TIME_ZONE });
  assert(other.timeZone === OTHER_TIME_ZONE, "Andere Nutzer muessen eine unabhaengige lokale Wochenautoritaet erhalten.");

  const firstMission = MISSIONS[0];
  const firstSubmit = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: firstMission.missionId,
    timeZone: USER_TIME_ZONE,
    clientVersion: "weekly-global-emulator-v2",
    appSessionId: "weekly-first-submit",
  });
  const deterministicAttemptId = weeklyMissionAttemptId(USER_ID, firstMission.missionId, expectedWeekKey);
  assert(firstSubmit.attemptId === deterministicAttemptId, "Wochenmission braucht einen deterministischen Attempt pro Nutzer/Mission/lokaler Woche.");
  assert(firstSubmit.timeZone === USER_TIME_ZONE && firstSubmit.calendarAuthority === "server-user-time-zone", "Submission muss lokale Kalenderautoritaet dokumentieren.");
  assert(firstSubmit.reviewStatus === "pending-server-review" && firstSubmit.idempotent === false, "Neue Evidence muss reviewpflichtig sein.");

  const firstReplay = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: firstMission.missionId,
    timeZone: USER_TIME_ZONE,
    clientVersion: "weekly-global-emulator-v2",
    appSessionId: "weekly-first-replay",
  });
  assert(firstReplay.idempotent === true && firstReplay.attemptId === firstSubmit.attemptId, "Replay darf keine parallele Reward-Route erzeugen.");

  await expectCallableError(
    "submitMissionEvidence",
    userToken,
    { attemptId: firstSubmit.attemptId, evidenceType: "daily-user-confirmation" },
    "Wochenmission darf keinen Tages-Evidence-Typ akzeptieren",
  );
  await expectCallableError(
    "getMissionAttemptStatus",
    otherToken,
    { attemptId: firstSubmit.attemptId, evidenceId: firstSubmit.evidenceId },
    "Fremdnutzer darf Wochenattempt nicht lesen",
  );
  await expectCallableError(
    "completeWeeklyMissionAttempt",
    userToken,
    { attemptId: firstSubmit.attemptId, timeZone: USER_TIME_ZONE },
    "Completion vor Admin-Review muss blockiert sein",
  );

  const queue = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
    limit: 50,
  });
  const queueItem = queue.evidence.find((item) => item.evidenceId === firstSubmit.evidenceId);
  assert(queueItem && queueItem.evidenceType === "weekly-user-confirmation", "Wochen-Evidence muss in der bestehenden Admin-Queue erscheinen.");
  assert(queue.rawMetadataIncluded === false && queue.storageContentIncluded === false, "Admin-Queue darf keine freien Rohdaten liefern.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: firstSubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] 50.000-Schritte-Wochenmission verifiziert",
  });
  const firstCompletion = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: firstSubmit.attemptId,
    timeZone: USER_TIME_ZONE,
  });
  assert(firstCompletion.rewardXp === 25 && firstCompletion.idempotent === false, "Erste Wochenmission muss exakt 25 WFXP vergeben.");
  assert(firstCompletion.timeZone === USER_TIME_ZONE && firstCompletion.weekKey === expectedWeekKey, "Completion muss lokale Wochenautoritaet dokumentieren.");

  const replay = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: firstSubmit.attemptId,
    timeZone: USER_TIME_ZONE,
  });
  assert(replay.idempotent === true && replay.xpLedgerEventId === firstCompletion.xpLedgerEventId, "Completion-Replay muss idempotent sein.");

  const expectedLedgerId = weeklyMissionCompletionIdempotencyKey(USER_ID, firstMission.missionId, expectedWeekKey);
  assert(firstCompletion.xpLedgerEventId === expectedLedgerId, "Wochenabschluss braucht den deterministischen lokalen Ledger-Schluessel.");
  const firstLedger = await db.collection("xpLedgerEvents").doc(expectedLedgerId).get();
  assert(firstLedger.exists && firstLedger.data().delta === 25, "Wochenabschluss muss exakt ein +25-WFXP-Ledger schreiben.");
  assert(firstLedger.data().metadata.weekKey === expectedWeekKey && firstLedger.data().metadata.timeZone === USER_TIME_ZONE, "Ledger muss Woche und Nutzerzeitzone dokumentieren.");

  const duplicateAttemptId = "weekly_duplicate_attempt";
  const duplicateEvidenceId = "weekly_duplicate_evidence";
  await db.collection("missionAttempts").doc(duplicateAttemptId).set({
    attemptId: duplicateAttemptId,
    missionId: firstMission.missionId,
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "evidence-approved",
    weekKey: expectedWeekKey,
    timeZone: USER_TIME_ZONE,
    calendarAuthority: "server-user-time-zone",
    catalogId: catalog.catalogId,
    completionPolicy: catalog.completionPolicy,
    accessPolicy: null,
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
    evidenceType: "weekly-user-confirmation",
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    status: "submitted",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await expectCallableError(
    "completeWeeklyMissionAttempt",
    userToken,
    { attemptId: duplicateAttemptId, timeZone: USER_TIME_ZONE },
    "Manipulierter zweiter Attempt darf keine doppelte Wochenbelohnung erzeugen",
  );

  const secondSubmit = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: MISSIONS[1].missionId,
    timeZone: USER_TIME_ZONE,
    clientVersion: "weekly-global-emulator-v2",
    appSessionId: "weekly-second-submit",
  });
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondSubmit.evidenceId,
    decision: "needs-more-evidence",
    reviewNote: "[emulator-qa] Weitere Bestaetigung erforderlich",
  });
  const secondResubmit = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: MISSIONS[1].missionId,
    timeZone: USER_TIME_ZONE,
    clientVersion: "weekly-global-emulator-v2",
    appSessionId: "weekly-second-resubmit",
  });
  assert(secondResubmit.attemptId === secondSubmit.attemptId && secondResubmit.evidenceId !== secondSubmit.evidenceId, "Neue Evidence muss denselben Attempt und eine neue Revision verwenden.");
  await expectCallableError(
    "adminReviewMissionEvidence",
    adminToken,
    { evidenceId: secondSubmit.evidenceId, decision: "approved", reviewNote: "[emulator-qa] veraltete Revision" },
    "Veraltete Wochen-Evidence darf nicht freigegeben werden",
  );
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondResubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Drei Workouts verifiziert",
  });
  const secondCompletion = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: secondSubmit.attemptId,
    timeZone: USER_TIME_ZONE,
  });
  assert(secondCompletion.rewardXp === 15, "Zweite Wochenmission muss exakt 15 WFXP vergeben.");

  const thirdSubmit = await submitAndApprove({
    userToken,
    adminToken,
    missionId: MISSIONS[2].missionId,
    reviewNote: "[emulator-qa] Fuenf Lernmodule verifiziert",
  });
  const thirdCompletion = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: thirdSubmit.attemptId,
    timeZone: USER_TIME_ZONE,
  });
  assert(thirdCompletion.rewardXp === 25, "Dritte Wochenmission muss exakt 25 WFXP vergeben.");

  const finalProgress = await expectOk("getWeeklyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(finalProgress.completedMissionIds.length === 3 && finalProgress.goalCompleted === true, "Alle drei Hauptmissionen muessen abgeschlossen sein.");
  assert(finalProgress.walletBalance === 65 && finalProgress.xp === 65, "Wochenprojektion muss exakt 65 WFXP anzeigen.");
  assert(finalProgress.activeAttempts.length === 0, "Abgeschlossene Wochenmissionen duerfen nicht aktiv erscheinen.");

  const oldRange = weekRangeInTimeZone(new Date(Date.now() - 8 * 86400000), USER_TIME_ZONE);
  const oldWeekKey = oldRange && oldRange.weekKey;
  assert(oldWeekKey && oldRange && oldWeekKey !== expectedWeekKey, "Test braucht eine vorige nutzerlokale Woche.");
  const oldAttemptId = weeklyMissionAttemptId(USER_ID, MISSIONS[1].missionId, oldWeekKey);
  await db.collection("missionAttempts").doc(oldAttemptId).set({
    attemptId: oldAttemptId,
    missionId: MISSIONS[1].missionId,
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "evidence-submitted",
    weekKey: oldWeekKey,
    timeZone: USER_TIME_ZONE,
    weekStartDateKey: oldRange.weekStartDateKey,
    weekEndDateKey: oldRange.weekEndDateKey,
    catalogId: catalog.catalogId,
    completionPolicy: catalog.completionPolicy,
    latestEvidenceId: "old_week_evidence",
    createdAt: admin.firestore.Timestamp.fromDate(new Date(`${oldRange.weekStartDateKey}T12:00:00.000Z`)),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date(`${oldRange.weekStartDateKey}T12:00:00.000Z`)),
  });
  const progressWithOldAttempt = await expectOk("getWeeklyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(progressWithOldAttempt.activeAttempts.length === 0, "Attempt aus vorheriger lokaler Woche darf nicht als aktuell erscheinen.");
  assert(progressWithOldAttempt.weekKey === expectedWeekKey, "Alte Daten duerfen aktuelle Nutzerwoche nicht verschieben.");
  assert(addUtcDays(oldRange.weekEndDateKey, 1) === expectedRange.weekStartDateKey || oldWeekKey !== expectedWeekKey, "Wochenhelfer muss stabile Grenzen liefern.");

  const missionLedger = await db.collection("xpLedgerEvents").where("ownerUserId", "==", USER_ID).where("reason", "==", "mission-completion").get();
  assert(missionLedger.size === 3, "Drei Wochenmissionen duerfen exakt drei Reward-Ledger-Eintraege erzeugen.");
  const legacyUserSnapshot = await db.collection("users").doc(USER_ID).get();
  assert(!legacyUserSnapshot.exists, "Wochenmissionsflow darf kein legacy users.points-/XP-Dokument anlegen.");

  console.log("WellFit Beta 1 Global User-Local Weekly Mission Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});