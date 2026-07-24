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

const ADMIN_ID = "daily-progress-admin";
const USER_ID = "daily-progress-user";
const OTHER_ID = "daily-progress-other";
const USER_TIME_ZONE = "Pacific/Auckland";
const OTHER_TIME_ZONE = "America/Los_Angeles";
const TRAVEL_TIME_ZONE = "Asia/Tokyo";

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

function previousDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1, 12, 0, 0)).toISOString().slice(0, 10);
}

async function approveAndComplete({ userToken, adminToken, missionId }) {
  const attempt = await expectOk("startMissionAttempt", userToken, { missionId, timeZone: USER_TIME_ZONE });
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
  const completion = await expectOk("completeMissionAttempt", userToken, {
    attemptId: attempt.attemptId,
    timeZone: USER_TIME_ZONE,
  });
  return { attempt, evidence, completion };
}

async function run() {
  console.log("WellFit Beta 1 Global User-Local Daily Mission Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const otherToken = await createAuthUser(OTHER_ID, false);

  const catalog = await expectOk("adminEnsureDailyMissionCatalog", adminToken, {});
  assert(catalog.catalogVersion === "1.2.0", "Tageskatalog braucht die globale Version 1.2.0.");
  assert(catalog.completionPolicy === "once-per-mission-per-user-local-day", "Tageskatalog braucht die nutzerlokale Tagespolicy.");

  await expectCallableError(
    "getDailyMissionProgress",
    userToken,
    { timeZone: "Invalid/Planet" },
    "Ungueltige IANA-Zeitzone muss blockiert werden",
  );

  const saved = await expectOk("saveDailyMissionPreferences", userToken, {
    favoriteIds: ["daily-8000-steps", "daily-plank-60"],
    dailySlotIds: ["daily-8000-steps", "daily-plank-60", "daily-water-1500"],
    timeZone: USER_TIME_ZONE,
  });
  assert(saved.timeZone === USER_TIME_ZONE, "Server muss die nutzerlokale Zeitzone speichern.");
  assert(saved.calendarAuthority === "server-user-time-zone", "Kalenderautoritaet muss serverseitig sein.");
  assert(saved.timeZoneChangeCooldownHours === 20, "Zeitzonenwechsel brauchen eine reisetaugliche 20-Stunden-Anti-Abuse-Grenze.");

  await expectCallableError(
    "saveDailyMissionPreferences",
    userToken,
    { favoriteIds: ["unknown-mission"], dailySlotIds: [null, null, null], timeZone: USER_TIME_ZONE },
    "Unbekannte Mission darf nicht als Favorit gespeichert werden",
  );

  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: USER_ID,
    delta: 160,
    reason: "[emulator-qa] Tagesmissions-Level-Projektion",
    idempotencyKey: "daily_progress_seed_wallet",
  });

  const initial = await expectOk("getDailyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(initial.progressAuthority === "server-read", "Fortschritt muss aus der Serverprojektion kommen.");
  assert(initial.completionPolicy === "once-per-mission-per-user-local-day", "Nutzerlokale Tagesabschlussgrenze muss aktiv sein.");
  assert(initial.timeZone === USER_TIME_ZONE && initial.calendarAuthority === "server-user-time-zone", "Progress muss die servergesicherte Nutzerzeitzone verwenden.");
  assert(initial.timeZoneChangePolicy === "minimum-20-hours" && initial.timeZoneChangeCooldownHours === 20, "Progress muss die Reise-Anti-Abuse-Policy offenlegen.");
  assert(initial.walletAvailable === true && initial.xp === 160 && initial.level === 2, "WFXP-Levelprojektion muss serverseitig sein.");
  assert(initial.favoriteIds.includes("daily-8000-steps"), "Gespeicherte Favoriten muessen gelesen werden.");
  assert(initial.noMonetaryValue === true && initial.tokenAuthorized === false, "Tagesmissionen bleiben WFXP-only.");

  const deferredChange = await expectOk("getDailyMissionProgress", userToken, { timeZone: OTHER_TIME_ZONE });
  assert(deferredChange.timeZone === USER_TIME_ZONE, "Sofortiger Zeitzonenwechsel darf die Reward-Periode nicht verschieben.");
  assert(deferredChange.timeZoneChangeDeferred === true && typeof deferredChange.nextTimeZoneChangeAt === "string", "Schnelles Zeitzonen-Hopping muss aufgeschoben werden.");

  const otherProgress = await expectOk("getDailyMissionProgress", otherToken, { timeZone: OTHER_TIME_ZONE });
  assert(otherProgress.timeZone === OTHER_TIME_ZONE, "Andere Nutzer muessen unabhaengige lokale Kalender haben.");
  assert(otherProgress.favoriteIds.length === 0 && otherProgress.xp === 0, "Andere Nutzer duerfen keine fremde Projektion sehen.");
  await db.collection("userCalendarSettings").doc(OTHER_ID).set({
    timeZoneChangedAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
  }, { merge: true });
  const acceptedTravelChange = await expectOk("getDailyMissionProgress", otherToken, { timeZone: TRAVEL_TIME_ZONE });
  assert(acceptedTravelChange.timeZone === TRAVEL_TIME_ZONE, "Ein plausibler Reisewechsel nach 20 Stunden muss akzeptiert werden.");
  assert(acceptedTravelChange.timeZoneChangeDeferred === false, "Akzeptierter Reisewechsel darf nicht als deferred markiert sein.");

  const staleDateKey = previousDateKey(initial.dateKey);
  await db.collection("missionAttempts").doc("stale_daily_open_attempt").set({
    attemptId: "stale_daily_open_attempt",
    missionId: "daily-breathing-3",
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: null,
    status: "started",
    dateKey: staleDateKey,
    timeZone: USER_TIME_ZONE,
    calendarAuthority: "server-user-time-zone",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const staleAttemptProjection = await expectOk("getDailyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(!staleAttemptProjection.activeAttempts.some((attempt) => attempt.attemptId === "stale_daily_open_attempt"), "Offener Attempt vom Vortag darf heute nicht aktiv erscheinen.");
  assert(!staleAttemptProjection.startedMissionIds.includes("daily-breathing-3"), "Offener Attempt vom Vortag darf die heutige Startprojektion nicht verunreinigen.");

  const firstAttempt = await expectOk("startMissionAttempt", userToken, {
    missionId: "daily-8000-steps",
    timeZone: USER_TIME_ZONE,
  });
  const reusedAttempt = await expectOk("startMissionAttempt", userToken, {
    missionId: "daily-8000-steps",
    timeZone: USER_TIME_ZONE,
  });
  assert(firstAttempt.attemptId === reusedAttempt.attemptId, "Doppelte Starts muessen denselben nutzerlokalen Tages-Attempt verwenden.");
  assert(firstAttempt.dateKey === initial.dateKey && firstAttempt.timeZone === USER_TIME_ZONE, "Attempt muss lokalen Tag und Zeitzone dokumentieren.");
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
  assert(firstEvidence.evidenceId === reusedEvidence.evidenceId && reusedEvidence.idempotent === true, "Pending Evidence muss idempotent wiederverwendet werden.");

  await expectOk("adminReviewMissionEvidence", adminToken, {
    evidenceId: firstEvidence.evidenceId,
    decision: "approved",
    reviewNote: "[emulator-qa] Tagesmission freigegeben",
  });
  const firstCompletion = await expectOk("completeMissionAttempt", userToken, {
    attemptId: firstAttempt.attemptId,
    timeZone: USER_TIME_ZONE,
  });
  assert(firstCompletion.rewardXp === 8 && firstCompletion.xpAuthorized === true, "8.000-Schritte-Mission muss exakt 8 WFXP vergeben.");

  await expectCallableError(
    "startMissionAttempt",
    userToken,
    { missionId: "daily-8000-steps", timeZone: USER_TIME_ZONE },
    "Abgeschlossene Tagesmission darf am selben nutzerlokalen Tag nicht erneut starten",
  );

  const rogueAttemptId = "daily-progress-rogue-attempt";
  const rogueEvidenceId = "daily-progress-rogue-evidence";
  await db.collection("missionAttempts").doc(rogueAttemptId).set({
    attemptId: rogueAttemptId,
    missionId: "daily-8000-steps",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "evidence-approved",
    dateKey: initial.dateKey,
    timeZone: USER_TIME_ZONE,
    calendarAuthority: "server-user-time-zone",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection("missionEvidence").doc(rogueEvidenceId).set({
    evidenceId: rogueEvidenceId,
    attemptId: rogueAttemptId,
    missionId: "daily-8000-steps",
    ownerUserId: USER_ID,
    userId: USER_ID,
    evidenceType: "daily-user-confirmation",
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await expectCallableError(
    "completeMissionAttempt",
    userToken,
    { attemptId: rogueAttemptId, timeZone: USER_TIME_ZONE },
    "Zweiter Attempt darf keine zweite Tagesbelohnung erzeugen",
  );

  await approveAndComplete({ userToken, adminToken, missionId: "daily-plank-60" });
  await approveAndComplete({ userToken, adminToken, missionId: "daily-water-1500" });

  const completedToday = await expectOk("getDailyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(completedToday.completedMissionIds.length === 3 && completedToday.goalCompleted === true, "Drei eindeutige Missionen muessen das lokale Tagesziel abschliessen.");
  assert(completedToday.currentStreak === 1 && completedToday.xp === 186, "Streak und XP muessen aus lokalen Serverdaten entstehen.");

  const yesterday = previousDateKey(completedToday.dateKey);
  for (const missionId of ["daily-squats-15", "daily-memory-3", "daily-breathing-3"]) {
    const completionId = `yesterday_${missionId}`;
    await db.collection("missionCompletions").doc(completionId).set({
      completionId,
      attemptId: completionId,
      missionId,
      ownerUserId: USER_ID,
      userId: USER_ID,
      status: "completed",
      dateKey: yesterday,
      timeZone: USER_TIME_ZONE,
      rewardXp: 1,
      completedAt: `${yesterday}T12:00:00.000Z`,
    });
  }
  const streaked = await expectOk("getDailyMissionProgress", userToken, { timeZone: USER_TIME_ZONE });
  assert(streaked.currentStreak === 2 && streaked.longestStreak === 2, "Aufeinanderfolgende nutzerlokale Ziel-Tage muessen Streak 2 ergeben.");

  const wallet = (await db.collection("xpWallets").doc(USER_ID).get()).data() || {};
  assert(wallet.balance === 186, "Blockierter Doppelabschluss darf den Wallet-Saldo nicht veraendern.");
  const missionLedger = await db.collection("xpLedgerEvents").where("ownerUserId", "==", USER_ID).where("reason", "==", "mission-completion").get();
  assert(missionLedger.size === 3, "Genau drei Tagesmissions-Ledgerereignisse duerfen entstehen.");

  console.log("WellFit Beta 1 Global User-Local Daily Mission Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
