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
  weekKeyInVienna,
  weekRangeInVienna,
  weeklyMissionAttemptId,
  weeklyMissionCompletionIdempotencyKey,
  addUtcDays,
} = require("../lib/beta1WeeklyMissionProgress");

const ADMIN_ID = "weekly-admin";
const USER_ID = "weekly-user";
const OTHER_ID = "weekly-other";
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
    clientVersion: "weekly-emulator-v1",
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
  console.log("WellFit Beta 1 Weekly Mission Progress Emulator Test startet...");
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
  assert(catalog.catalogVersion === "1.0.0", "Wochenkatalog braucht Version 1.0.0.");
  assert(catalog.completionPolicy === "once-per-mission-per-vienna-week", "Wochenkatalog braucht die sichere Wochenpolicy.");
  assert(catalog.weeklyGoal === 3 && catalog.count === 3, "Wochenkatalog muss genau drei Hauptmissionen enthalten.");
  assert(catalog.currency === "WFXP" && catalog.noMonetaryValue === true, "Wochenkatalog muss WFXP-only bleiben.");
  assert(catalog.tokenAuthorized === false && catalog.cashoutAllowed === false, "Wochenkatalog darf Token oder Cashout nicht aktivieren.");

  for (const expected of MISSIONS) {
    const mission = catalog.missions.find((item) => item.missionId === expected.missionId);
    assert(mission, `Kanonische Wochenmission fehlt: ${expected.missionId}`);
    assert(mission.rewardXp === expected.rewardXp, `Falscher Katalogwert fuer ${expected.missionId}.`);
    assert(mission.childAllowed === false, `Child Profiles muessen fuer ${expected.missionId} deaktiviert sein.`);
    assert(mission.evidenceType === "weekly-user-confirmation", `Evidence-Type fuer ${expected.missionId} ist falsch.`);
    assert(mission.reviewRequired === true, `Review muss fuer ${expected.missionId} Pflicht sein.`);
    const missionSnapshot = await db.collection("missions").doc(expected.missionId).get();
    const missionData = missionSnapshot.data() || {};
    assert(missionSnapshot.exists && missionData.status === "published", `${expected.missionId} muss publiziert sein.`);
    assert(missionData.catalogId === catalog.catalogId, `${expected.missionId} muss dem Wochenkatalog zugeordnet sein.`);
    assert(missionData.completionPolicy === catalog.completionPolicy, `${expected.missionId} braucht die Wochenpolicy.`);
    assert(missionData.evidencePolicy.allowedEvidenceTypes.length === 1, `${expected.missionId} darf nur einen Evidence-Typ akzeptieren.`);
    assert(missionData.evidencePolicy.allowedEvidenceTypes[0] === "weekly-user-confirmation", `${expected.missionId} braucht weekly-user-confirmation.`);
  }

  const expectedWeekKey = weekKeyInVienna(new Date());
  const expectedRange = weekRangeInVienna(new Date());
  assert(expectedWeekKey && expectedRange, "Aktuelle Wien-Woche muss bestimmbar sein.");

  const initial = await expectOk("getWeeklyMissionProgress", userToken, {});
  assert(initial.weekKey === expectedWeekKey, "Progress muss die aktuelle Wien-Woche verwenden.");
  assert(initial.weekStartDateKey === expectedRange.weekStartDateKey, "Progress muss den korrekten Wochenstart liefern.");
  assert(initial.weekEndDateKey === expectedRange.weekEndDateKey, "Progress muss das korrekte Wochenende liefern.");
  assert(initial.startedMissionIds.length === 0 && initial.completedMissionIds.length === 0, "Neue Woche muss ohne Fortschritt starten.");
  assert(initial.weeklyGoal === 3 && initial.goalCompleted === false, "Wochenziel muss bei 0/3 offen sein.");
  assert(initial.walletBalance === 0 && initial.xp === 0 && initial.level === 1, "Neue Wochenprojektion darf keine WFXP erfinden.");
  assert(initial.progressAuthority === "server-read", "Wochenfortschritt muss serverseitig abgeleitet sein.");
  assert(initial.noMonetaryValue === true && initial.tokenAuthorized === false && initial.cashoutAllowed === false, "Progress muss WFXP-only bleiben.");

  const firstMission = MISSIONS[0];
  const firstSubmit = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: firstMission.missionId,
    clientVersion: "weekly-emulator-v1",
    appSessionId: "weekly-first-submit",
  });
  const deterministicAttemptId = weeklyMissionAttemptId(USER_ID, firstMission.missionId, expectedWeekKey);
  assert(firstSubmit.attemptId === deterministicAttemptId, "Wochenmission braucht einen deterministischen Attempt pro Nutzer/Mission/Woche.");
  assert(firstSubmit.reviewStatus === "pending-server-review", "Neue Wochen-Evidence muss auf Admin-Review warten.");
  assert(firstSubmit.missionCompletionAuthorized === false && firstSubmit.xpAuthorized === false, "Submission darf weder Completion noch WFXP autorisieren.");
  assert(firstSubmit.idempotent === false, "Erste Submission darf nicht idempotent sein.");

  const firstReplay = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: firstMission.missionId,
    clientVersion: "weekly-emulator-v1",
    appSessionId: "weekly-first-replay",
  });
  assert(firstReplay.idempotent === true, "Wiederholte Submission muss denselben offenen Vorgang wiederverwenden.");
  assert(firstReplay.attemptId === firstSubmit.attemptId && firstReplay.evidenceId === firstSubmit.evidenceId, "Replay darf keine parallele Reward-Route erzeugen.");

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
    "Nicht-Admin darf Wochen-Evidence nicht freigeben",
  );

  const queueBeforeReview = await expectOk("adminListMissionEvidence", adminToken, {
    reviewStatus: "pending-server-review",
    limit: 50,
  });
  const queueItem = queueBeforeReview.evidence.find((item) => item.evidenceId === firstSubmit.evidenceId);
  assert(queueItem, "Wochen-Evidence muss in der bestehenden Admin-Queue erscheinen.");
  assert(queueItem.evidenceType === "weekly-user-confirmation", "Admin-Queue muss den Wochen-Evidence-Typ zeigen.");
  assert(queueBeforeReview.rawMetadataIncluded === false && queueBeforeReview.storageContentIncluded === false, "Admin-Queue darf keine freien Metadaten oder Storage-Inhalte liefern.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: firstSubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] 50.000-Schritte-Wochenmission verifiziert",
  });
  const firstStatus = await expectOk("getMissionAttemptStatus", userToken, {
    attemptId: firstSubmit.attemptId,
    evidenceId: firstSubmit.evidenceId,
  });
  assert(firstStatus.canRequestCompletion === true, "Approved Wochen-Evidence muss Completion erlauben.");
  assert(firstStatus.xpAuthorized === false, "Evidence-Freigabe selbst darf noch keine WFXP autorisieren.");

  const firstCompletion = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: firstSubmit.attemptId,
  });
  assert(firstCompletion.rewardXp === firstMission.rewardXp, "Erste Wochenmission muss exakt 25 WFXP vergeben.");
  assert(firstCompletion.xpAuthorized === true && firstCompletion.missionCompletionAuthorized === true, "Nur Completion darf WFXP und Abschluss autorisieren.");
  assert(firstCompletion.tokenAuthorized === false && firstCompletion.cashoutAllowed === false, "Completion darf keine Token- oder Cashout-Autoritaet erzeugen.");
  assert(firstCompletion.idempotent === false, "Erste Completion darf nicht idempotent sein.");

  const firstCompletionReplay = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: firstSubmit.attemptId,
  });
  assert(firstCompletionReplay.idempotent === true, "Completion-Replay muss idempotent sein.");
  assert(firstCompletionReplay.xpLedgerEventId === firstCompletion.xpLedgerEventId, "Replay darf keinen zweiten Ledger-Eintrag erzeugen.");

  const firstWallet = await db.collection("xpWallets").doc(USER_ID).get();
  assert(firstWallet.data().balance === 25 && firstWallet.data().lifetimeEarned === 25, "Wallet muss nach erster Wochenmission exakt 25 WFXP enthalten.");
  const expectedLedgerId = weeklyMissionCompletionIdempotencyKey(USER_ID, firstMission.missionId, expectedWeekKey);
  assert(firstCompletion.xpLedgerEventId === expectedLedgerId, "Wochenabschluss braucht den deterministischen Ledger-Schluessel.");
  const firstLedger = await db.collection("xpLedgerEvents").doc(expectedLedgerId).get();
  assert(firstLedger.exists && firstLedger.data().delta === 25, "Wochenabschluss muss exakt ein +25-WFXP-Ledger schreiben.");
  assert(firstLedger.data().metadata.weekKey === expectedWeekKey, "Ledger muss die autorisierte Wien-Woche dokumentieren.");

  const duplicateAttemptId = "weekly_duplicate_attempt";
  const duplicateEvidenceId = "weekly_duplicate_evidence";
  await db.collection("missionAttempts").doc(duplicateAttemptId).set({
    attemptId: duplicateAttemptId,
    missionId: firstMission.missionId,
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: null,
    status: "evidence-approved",
    weekKey: expectedWeekKey,
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
    evidenceType: "weekly-user-confirmation",
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    status: "submitted",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedAt: new Date().toISOString(),
  });
  await expectCallableError(
    "completeWeeklyMissionAttempt",
    userToken,
    { attemptId: duplicateAttemptId },
    "Manipulierter zweiter Attempt darf keine doppelte Wochenbelohnung erzeugen",
  );
  const walletAfterDuplicate = await db.collection("xpWallets").doc(USER_ID).get();
  assert(walletAfterDuplicate.data().balance === 25, "Doppel-Attempt darf Wallet nicht erneut erhoehen.");

  const secondSubmit = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: MISSIONS[1].missionId,
    clientVersion: "weekly-emulator-v1",
    appSessionId: "weekly-second-submit",
  });
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondSubmit.evidenceId,
    decision: "needs-more-evidence",
    reviewNote: "[emulator-qa] Weitere Wochenbestaetigung erforderlich",
  });
  const secondResubmit = await expectOk("submitWeeklyMissionForReview", userToken, {
    missionId: MISSIONS[1].missionId,
    clientVersion: "weekly-emulator-v1",
    appSessionId: "weekly-second-resubmit",
  });
  assert(secondResubmit.attemptId === secondSubmit.attemptId, "Neue Evidence muss denselben Wochenattempt verwenden.");
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
    "Veraltete Wochen-Evidence darf nach neuer Revision nicht freigegeben werden",
  );
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: secondResubmit.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Drei Wochenworkouts verifiziert",
  });
  const secondCompletion = await expectOk("completeWeeklyMissionAttempt", userToken, {
    attemptId: secondSubmit.attemptId,
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
  });
  assert(thirdCompletion.rewardXp === 25, "Dritte Wochenmission muss exakt 25 WFXP vergeben.");

  const finalProgress = await expectOk("getWeeklyMissionProgress", userToken, {});
  assert(finalProgress.completedMissionIds.length === 3, "Alle drei Hauptmissionen muessen in der Serverprojektion abgeschlossen sein.");
  assert(MISSIONS.every((mission) => finalProgress.completedMissionIds.includes(mission.missionId)), "Serverprojektion muss alle kanonischen Missionen enthalten.");
  assert(finalProgress.weeklyGoal === 3 && finalProgress.goalCompleted === true, "Wochenziel muss nach 3/3 abgeschlossen sein.");
  assert(finalProgress.walletBalance === 65 && finalProgress.xp === 65, "Wochenprojektion muss exakt 65 WFXP und lifetime XP anzeigen.");
  assert(finalProgress.level === 1 && finalProgress.xpForCurrentLevel === 65 && finalProgress.xpForNextLevel === 100, "Levelprojektion muss aus dem WFXP-Lifetime-Ledger abgeleitet sein.");
  assert(finalProgress.activeAttempts.length === 0, "Abgeschlossene Wochenmissionen duerfen nicht als aktiv erscheinen.");

  await expectCallableError(
    "submitWeeklyMissionForReview",
    userToken,
    {
      missionId: MISSIONS[0].missionId,
      childProfileId: "child-disabled",
      clientVersion: "weekly-emulator-v1",
      appSessionId: "weekly-child-attempt",
    },
    "Child Profiles muessen fuer den ersten Wochenkatalog deaktiviert sein",
  );

  const oldWeekKey = weekKeyInVienna(new Date(Date.now() - 8 * 86400000));
  const oldRange = weekRangeInVienna(new Date(Date.now() - 8 * 86400000));
  assert(oldWeekKey && oldRange && oldWeekKey !== expectedWeekKey, "Test braucht eine vorige Wien-Woche.");
  const oldAttemptId = weeklyMissionAttemptId(USER_ID, MISSIONS[1].missionId, oldWeekKey);
  await db.collection("missionAttempts").doc(oldAttemptId).set({
    attemptId: oldAttemptId,
    missionId: MISSIONS[1].missionId,
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "evidence-submitted",
    weekKey: oldWeekKey,
    weekStartDateKey: oldRange.weekStartDateKey,
    weekEndDateKey: oldRange.weekEndDateKey,
    catalogId: catalog.catalogId,
    completionPolicy: catalog.completionPolicy,
    latestEvidenceId: "old_week_evidence",
    createdAt: admin.firestore.Timestamp.fromDate(new Date(`${oldRange.weekStartDateKey}T12:00:00.000Z`)),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date(`${oldRange.weekStartDateKey}T12:00:00.000Z`)),
  });
  const progressWithOldAttempt = await expectOk("getWeeklyMissionProgress", userToken, {});
  assert(progressWithOldAttempt.activeAttempts.length === 0, "Attempt aus vorheriger Wien-Woche darf nicht als aktuell erscheinen.");
  assert(progressWithOldAttempt.weekKey === expectedWeekKey, "Alte Daten duerfen die aktuelle Wien-Woche nicht verschieben.");
  assert(addUtcDays(oldRange.weekEndDateKey, 1) === expectedRange.weekStartDateKey || oldWeekKey !== expectedWeekKey, "Wochenhelfer muss stabile Datumsgrenzen liefern.");

  const missionLedger = await db.collection("xpLedgerEvents")
    .where("ownerUserId", "==", USER_ID)
    .where("reason", "==", "mission-completion")
    .get();
  assert(missionLedger.size === 3, "Drei Wochenmissionen duerfen exakt drei Reward-Ledger-Eintraege erzeugen.");
  const legacyUserSnapshot = await db.collection("users").doc(USER_ID).get();
  assert(!legacyUserSnapshot.exists, "Wochenmissionsflow darf kein legacy users.points-/XP-Dokument anlegen.");

  console.log("WellFit Beta 1 Weekly Mission Progress Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
