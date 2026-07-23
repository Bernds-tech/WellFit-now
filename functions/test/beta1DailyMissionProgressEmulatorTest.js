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

function previousDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1, 12, 0, 0)).toISOString().slice(0, 10);
}

async function approveAndComplete({ userToken, adminToken, missionId }) {
  const attempt = await expectOk("startMissionAttempt", userToken, { missionId });
  const evidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: attempt.attemptId,
    evidenceType: "daily-user-confirmation",
    metadata: { source: "daily-missions", requiresHumanReview: true, grantsClientReward: false },
  });
  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: evidence.evidenceId,
    decision: "approved",
    reviewNote: `[emulator-qa] ${missionId} freigegeben`,
  });
  const completion = await expectOk("completeMissionAttempt", userToken, { attemptId: attempt.attemptId });
  return { attempt, evidence, completion };
}

async function run() {
  console.log("WellFit Beta 1 Daily Mission Progress Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser("daily-progress-admin", true);
  const userToken = await createAuthUser("daily-progress-user", false);
  const otherToken = await createAuthUser("daily-progress-other", false);

  await expectOk("adminEnsureDailyMissionCatalog", adminToken, {});

  const saved = await expectOk("saveDailyMissionPreferences", userToken, {
    favoriteIds: ["daily-8000-steps", "daily-plank-60"],
    dailySlotIds: ["daily-8000-steps", "daily-plank-60", "daily-water-1500"],
  });
  assert(saved.accepted === true, "Server muss Tagesmissions-Praeferenzen annehmen.");
  assert(saved.favoriteIds.length === 2, "Zwei Favoriten muessen gespeichert werden.");
  assert(saved.dailySlotIds.length === 3, "Drei Slots muessen gespeichert werden.");

  await expectCallableError(
    "saveDailyMissionPreferences",
    userToken,
    { favoriteIds: ["unknown-mission"], dailySlotIds: [null, null, null] },
    "Unbekannte Mission darf nicht als Favorit gespeichert werden",
  );

  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: "daily-progress-user",
    delta: 160,
    reason: "[emulator-qa] Tagesmissions-Level-Projektion",
    idempotencyKey: "daily_progress_seed_wallet",
  });

  const initial = await expectOk("getDailyMissionProgress", userToken, {});
  assert(initial.progressAuthority === "server-read", "Fortschritt muss aus der Serverprojektion kommen.");
  assert(initial.completionPolicy === "once-per-mission-per-vienna-day", "Sichere Tagesabschlussgrenze muss aktiv sein.");
  assert(initial.walletAvailable === true, "WFXP-Wallet muss erkannt werden.");
  assert(initial.xp === 160 && initial.level === 2, `Wallet-Lifetime-XP muss Level ableiten: ${JSON.stringify(initial)}`);
  assert(initial.favoriteIds.includes("daily-8000-steps"), "Gespeicherte Favoriten muessen gelesen werden.");
  assert(initial.noMonetaryValue === true && initial.tokenAuthorized === false, "Tagesmissionen bleiben nicht-monetaer und nicht-tokenisiert.");

  const otherProgress = await expectOk("getDailyMissionProgress", otherToken, {});
  assert(otherProgress.favoriteIds.length === 0, "Andere Nutzer duerfen keine fremden Praeferenzen sehen.");
  assert(otherProgress.xp === 0, "Andere Nutzer duerfen keine fremde Wallet-Projektion sehen.");

  const firstAttempt = await expectOk("startMissionAttempt", userToken, { missionId: "daily-8000-steps" });
  const reusedAttempt = await expectOk("startMissionAttempt", userToken, { missionId: "daily-8000-steps" });
  assert(firstAttempt.attemptId === reusedAttempt.attemptId, "Doppelte Starts muessen denselben Tages-Attempt verwenden.");
  assert(reusedAttempt.idempotent === true && reusedAttempt.reusedDailyAttempt === true, "Wiederholter Start muss als Reuse markiert sein.");

  await expectCallableError(
    "submitMissionEvidence",
    userToken,
    { attemptId: firstAttempt.attemptId, evidenceType: "dashboard-user-confirmation" },
    "Falscher Evidence-Typ muss serverseitig blockiert werden",
  );

  const firstEvidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: firstAttempt.attemptId,
    evidenceType: "daily-user-confirmation",
    metadata: { source: "daily-missions", requiresHumanReview: true },
  });
  const reusedEvidence = await expectOk("submitMissionEvidence", userToken, {
    attemptId: firstAttempt.attemptId,
    evidenceType: "daily-user-confirmation",
    metadata: { source: "daily-missions", requiresHumanReview: true },
  });
  assert(firstEvidence.evidenceId === reusedEvidence.evidenceId, "Pending Evidence muss idempotent wiederverwendet werden.");
  assert(reusedEvidence.idempotent === true, "Wiederverwendete Evidence muss idempotent markiert sein.");

  const pending = await expectOk("getDailyMissionProgress", userToken, {});
  const pendingAttempt = pending.activeAttempts.find((attempt) => attempt.missionId === "daily-8000-steps");
  assert(pendingAttempt && pendingAttempt.reviewStatus === "pending-server-review", "Offener Review muss in der Serverprojektion erscheinen.");
  assert(pendingAttempt.canRequestCompletion === false, "Pending Review darf Completion nicht erlauben.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: firstEvidence.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Tagesmission freigegeben",
  });
  const approved = await expectOk("getDailyMissionProgress", userToken, {});
  const approvedAttempt = approved.activeAttempts.find((attempt) => attempt.missionId === "daily-8000-steps");
  assert(approvedAttempt && approvedAttempt.canRequestCompletion === true, "Approved Evidence muss Completion freigeben.");

  const firstCompletion = await expectOk("completeMissionAttempt", userToken, { attemptId: firstAttempt.attemptId });
  assert(firstCompletion.rewardXp === 8, "Katalogwert der 8.000-Schritte-Mission muss 8 WFXP sein.");
  assert(firstCompletion.xpAuthorized === true && firstCompletion.tokenAuthorized === false, "Nur interne WFXP duerfen autorisiert werden.");

  await expectCallableError(
    "startMissionAttempt",
    userToken,
    { missionId: "daily-8000-steps" },
    "Abgeschlossene Tagesmission darf am selben Wien-Tag nicht erneut starten",
  );

  const rogueAttemptId = "daily-progress-rogue-attempt";
  const rogueEvidenceId = "daily-progress-rogue-evidence";
  await db.collection("missionAttempts").doc(rogueAttemptId).set({
    attemptId: rogueAttemptId,
    missionId: "daily-8000-steps",
    ownerUserId: "daily-progress-user",
    userId: "daily-progress-user",
    status: "evidence-approved",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection("missionEvidence").doc(rogueEvidenceId).set({
    evidenceId: rogueEvidenceId,
    attemptId: rogueAttemptId,
    missionId: "daily-8000-steps",
    ownerUserId: "daily-progress-user",
    userId: "daily-progress-user",
    evidenceType: "daily-user-confirmation",
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await expectCallableError(
    "completeMissionAttempt",
    userToken,
    { attemptId: rogueAttemptId },
    "Zweiter Attempt darf keine zweite Tagesbelohnung erzeugen",
  );

  await approveAndComplete({ userToken, adminToken, missionId: "daily-plank-60" });
  await approveAndComplete({ userToken, adminToken, missionId: "daily-water-1500" });

  const completedToday = await expectOk("getDailyMissionProgress", userToken, {});
  assert(completedToday.completedMissionIds.length === 3, `Drei eindeutige Tagesmissionen muessen zaehlen: ${JSON.stringify(completedToday.completedMissionIds)}`);
  assert(completedToday.goalCompleted === true, "Tagesziel muss nach drei serverseitigen Abschluessen erreicht sein.");
  assert(completedToday.currentStreak === 1, "Erster abgeschlossener Tag muss Streak 1 ergeben.");
  assert(completedToday.activeAttempts.every((attempt) => attempt.missionId !== "daily-8000-steps"), "Abgeschlossene Mission darf nicht als offener Attempt erscheinen.");
  assert(completedToday.xp === 186, `Lifetime XP muss Seed plus drei Katalogwerte enthalten: ${completedToday.xp}`);

  const yesterday = previousDateKey(completedToday.dateKey);
  for (const missionId of ["daily-squats-15", "daily-memory-3", "daily-breathing-3"]) {
    const completionId = `yesterday_${missionId}`;
    await db.collection("missionCompletions").doc(completionId).set({
      completionId,
      attemptId: completionId,
      missionId,
      ownerUserId: "daily-progress-user",
      userId: "daily-progress-user",
      status: "completed",
      dateKey: yesterday,
      rewardXp: 1,
      completedAt: `${yesterday}T12:00:00.000Z`,
    });
  }
  const streaked = await expectOk("getDailyMissionProgress", userToken, {});
  assert(streaked.currentStreak === 2 && streaked.longestStreak === 2, `Aufeinanderfolgende Ziel-Tage muessen Streak 2 ergeben: ${JSON.stringify(streaked)}`);

  const wallet = (await db.collection("xpWallets").doc("daily-progress-user").get()).data() || {};
  assert(wallet.balance === 186, "Blockierter Doppelabschluss darf den Wallet-Saldo nicht veraendern.");
  const dailyLedger = await db.collection("xpLedgerEvents").where("ownerUserId", "==", "daily-progress-user").get();
  const missionLedger = dailyLedger.docs.filter((doc) => (doc.data() || {}).reason === "mission-completion");
  assert(missionLedger.length === 3, "Genau drei Tagesmissions-Ledgerereignisse duerfen erzeugt werden.");

  console.log("WellFit Beta 1 Daily Mission Progress Emulator Test erfolgreich.");
  await admin.auth().deleteUser("daily-progress-admin");
  await admin.auth().deleteUser("daily-progress-user");
  await admin.auth().deleteUser("daily-progress-other");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
