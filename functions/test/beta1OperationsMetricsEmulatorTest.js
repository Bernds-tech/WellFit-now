const {
  db,
  assert,
  createAuthUser,
  callCallable,
  getCallableResult,
  describeCall,
  resetBeta1Collections,
} = require("./beta1RuntimeFixtures");

const ADMIN_ID = "operations-admin";
const USER_ID = "operations-user";
const COHORT_IDS = Array.from({ length: 6 }, (_, index) => `operations-cohort-${index + 1}`);

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function expectOk(name, token, data) {
  const response = await callCallable(name, token, data);
  assert(response.ok, `${name} must be HTTP OK: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${name} must return accepted=true: ${describeCall(response)}`);
  return result;
}

async function seedOperationsData() {
  const now = new Date();
  const cohortCreatedAt = addDays(now, -8);
  const dayOne = addDays(cohortCreatedAt, 1);
  const daySeven = addDays(cohortCreatedAt, 7);
  const recent = addDays(now, -2);
  const batch = db.batch();

  COHORT_IDS.forEach((userId, index) => {
    batch.set(db.collection("userOnboardingRecords").doc(userId), {
      onboardingRecordId: userId,
      ownerUserId: userId,
      userId,
      status: "completed",
      completedAt: cohortCreatedAt.toISOString(),
      consentSummary: { anonymousAnalytics: index < 3 },
      createdAt: cohortCreatedAt,
      updatedAt: cohortCreatedAt,
    });
  });

  COHORT_IDS.slice(0, 4).forEach((userId, index) => {
    const attemptId = `operations-activation-${index + 1}`;
    batch.set(db.collection("missionAttempts").doc(attemptId), {
      attemptId,
      ownerUserId: userId,
      userId,
      missionId: "daily-squats-15",
      status: "started",
      createdAt: new Date(cohortCreatedAt.getTime() + (index + 1) * 60 * 60 * 1000),
      updatedAt: new Date(cohortCreatedAt.getTime() + (index + 1) * 60 * 60 * 1000),
    });
    batch.set(db.collection("buddyCareActions").doc(`operations-d1-${index + 1}`), {
      ownerUserId: userId,
      userId,
      status: "completed",
      createdAt: dayOne,
      completedAt: dayOne,
      updatedAt: dayOne,
    });
    batch.set(db.collection("missionCompletions").doc(`operations-d7-${index + 1}`), {
      completionId: `operations-d7-${index + 1}`,
      attemptId,
      ownerUserId: userId,
      userId,
      missionId: "daily-squats-15",
      status: "completed",
      rewardXp: 9,
      completedAt: daySeven.toISOString(),
      createdAt: daySeven,
      updatedAt: daySeven,
    });
  });

  batch.set(db.collection("missionAttempts").doc("operations-late-attempt"), {
    attemptId: "operations-late-attempt",
    ownerUserId: COHORT_IDS[4],
    userId: COHORT_IDS[4],
    missionId: "daily-squats-15",
    status: "started",
    createdAt: new Date(cohortCreatedAt.getTime() + 26 * 60 * 60 * 1000),
    updatedAt: new Date(cohortCreatedAt.getTime() + 26 * 60 * 60 * 1000),
  });

  batch.set(db.collection("missionEvidence").doc("operations-evidence-approved"), {
    evidenceId: "operations-evidence-approved",
    attemptId: "operations-activation-1",
    missionId: "daily-squats-15",
    ownerUserId: COHORT_IDS[0],
    userId: COHORT_IDS[0],
    reviewStatus: "approved",
    createdAt: addDays(recent, -1),
    reviewedAt: recent.toISOString(),
    updatedAt: recent,
  });
  batch.set(db.collection("missionEvidence").doc("operations-evidence-pending"), {
    evidenceId: "operations-evidence-pending",
    attemptId: "operations-activation-2",
    missionId: "daily-squats-15",
    ownerUserId: COHORT_IDS[1],
    userId: COHORT_IDS[1],
    reviewStatus: "pending-server-review",
    createdAt: recent,
    updatedAt: recent,
  });
  batch.set(db.collection("xpLedgerEvents").doc("operations-ledger"), {
    ledgerEventId: "operations-ledger",
    ownerUserId: COHORT_IDS[0],
    userId: COHORT_IDS[0],
    delta: 9,
    currency: "WFXP",
    noMonetaryValue: true,
    tokenAuthorized: false,
    cashoutAllowed: false,
    createdAt: recent,
    updatedAt: recent,
  });
  batch.set(db.collection("safetyReports").doc("operations-safety"), {
    reportId: "operations-safety",
    reporterUserId: COHORT_IDS[0],
    ownerUserId: COHORT_IDS[0],
    status: "submitted",
    createdAt: recent,
    updatedAt: recent,
  });
  batch.set(db.collection("userDataExportJobs").doc(COHORT_IDS[0]), {
    ownerUserId: COHORT_IDS[0],
    userId: COHORT_IDS[0],
    status: "failed",
    failedAt: recent,
    failureCode: "emulator-fixture",
    updatedAt: recent,
  });
  batch.set(db.collection("accountLifecycleRecords").doc(COHORT_IDS[1]), {
    lifecycleId: COHORT_IDS[1],
    ownerUserId: COHORT_IDS[1],
    userId: COHORT_IDS[1],
    status: "deletion-blocked",
    updatedAt: recent,
  });
  batch.set(db.collection("missionPatternReviews").doc("operations-pattern"), {
    userId: COHORT_IDS[0],
    recommendation: "manual-review-required",
    patternRiskScore: 80,
    createdAt: recent,
    updatedAt: recent,
  });
  batch.set(db.collection("missionCooldownReviews").doc("operations-cooldown"), {
    userId: COHORT_IDS[0],
    cooldownStatus: "hard-cooldown-recommended",
    cooldownRiskScore: 90,
    createdAt: recent,
    updatedAt: recent,
  });

  await batch.commit();
}

async function run() {
  console.log("WellFit Beta 1 Operations Metrics Emulator Test starts...");
  await resetBeta1Collections();
  await seedOperationsData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);

  const denied = await callCallable("getBetaOperationsSnapshot", userToken, { windowDays: 14 });
  assert(!denied.ok, `Non-admin operations snapshot must fail: ${describeCall(denied)}`);

  const adminActionsBefore = await db.collection("adminActions").get();
  const snapshot = await expectOk("getBetaOperationsSnapshot", adminToken, { windowDays: 14 });
  const adminActionsAfter = await db.collection("adminActions").get();

  assert(snapshot.snapshotVersion === "2026-07-25-v1", "Snapshot version is incorrect.");
  assert(snapshot.accounts.initializedTotal === 6, "Initialized account count is incorrect.");
  assert(snapshot.accounts.activatedWithin24Hours === 4, "Activation count is incorrect.");
  assert(snapshot.accounts.activationRatePercent === 66.7, "Activation rate is incorrect.");
  assert(snapshot.retention.d1.suppressed === false && snapshot.retention.d1.retainedAccounts === 5, "D1 retention is incorrect.");
  assert(snapshot.retention.d7.suppressed === false && snapshot.retention.d7.retainedAccounts === 4, "D7 retention is incorrect.");
  assert(snapshot.missions.starts === 5, "Mission start count is incorrect.");
  assert(snapshot.evidence.pendingTotal === 1, "Pending evidence count is incorrect.");
  assert(snapshot.evidence.approvedInWindow === 1, "Approved evidence count is incorrect.");
  assert(snapshot.economy.grantedInWindow === 9, "WFXP aggregate is incorrect.");
  assert(snapshot.operations.openSafetyReports === 1, "Safety queue count is incorrect.");
  assert(snapshot.operations.failedDataExportsInWindow === 1, "Failed export signal is incorrect.");
  assert(snapshot.operations.blockedAccountDeletions === 1, "Blocked deletion signal is incorrect.");
  assert(snapshot.operations.manualPatternReviewsInWindow === 1, "Pattern risk signal is incorrect.");
  assert(snapshot.operations.hardCooldownSignalsInWindow === 1, "Cooldown risk signal is incorrect.");
  assert(snapshot.privacy.aggregateOnly === true, "Snapshot must be aggregate-only.");
  assert(snapshot.privacy.returnsUserIdentifiers === false, "Snapshot must declare no user identifiers.");
  assert(snapshot.privacy.returnsHealthData === false && snapshot.privacy.returnsCoordinates === false, "Snapshot must exclude Health and coordinates.");
  assert(snapshot.scan.complete === true, "Fixture scan must not be truncated.");
  assert(snapshot.tokenAuthorized === false && snapshot.cashoutAllowed === false && snapshot.realMoney === false, "Snapshot must not authorize money or token actions.");
  assert(adminActionsAfter.size === adminActionsBefore.size, "Read-only snapshot must not create admin writes.");

  const serialized = JSON.stringify(snapshot);
  for (const forbidden of [...COHORT_IDS, `${COHORT_IDS[0]}@wellfit.test`, "storageRef", "latitude", "longitude"]) {
    assert(!serialized.includes(forbidden), `Snapshot leaked forbidden value: ${forbidden}`);
  }

  const fallbackWindow = await expectOk("getBetaOperationsSnapshot", adminToken, { windowDays: 99 });
  assert(fallbackWindow.window.days === 14, "Unknown window must fall back to 14 days.");

  console.log("WellFit Beta 1 Operations Metrics Emulator Test successful.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
