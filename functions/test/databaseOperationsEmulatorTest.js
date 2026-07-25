const admin = require("firebase-admin");
const {
  runSelection,
} = require("../scripts/database/runDatabaseOperation");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-no-project";
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearCollection(collectionName) {
  for (let page = 0; page < 1000; page += 1) {
    const snapshot = await db.collection(collectionName).limit(400).get();
    if (snapshot.empty) return;
    const batch = db.batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
  throw new Error(`Collection ${collectionName} exceeded the reset limit.`);
}

async function reset() {
  for (const collectionName of [
    "users",
    "userPrivateProfiles",
    "accountLifecycleRecords",
    "xpWallets",
    "xpLedgerEvents",
    "ledgerEvents",
    "missions",
    "databaseSchemaState",
    "databaseMigrationRuns",
    "databaseSeedRuns",
    "databaseOperationLeases",
    "databaseOperationAudit",
  ]) {
    await clearCollection(collectionName);
  }
}

async function seedLegacyState() {
  await Promise.all([
    db.collection("users").doc("legacy-user").set({
      email: "legacy-user@wellfit.test",
      points: 99,
      xp: 88,
      level: 7,
      energy: 50,
      stepsToday: 1234,
      avatar: { hunger: 2 },
      consent: { legacy: true },
      inventory: { legacy: true },
    }),
    db.collection("userPrivateProfiles").doc("legacy-user").set({
      ownerUserId: "legacy-user",
      userId: "legacy-user",
      birthDate: "1980-01-01",
      medicationName: "forbidden",
      healthNotes: "forbidden",
      healthSettings: {
        vitals: {
          medicationDeclared: true,
          medicationName: "forbidden",
          medicationDose: "forbidden",
        },
        lifestyle: {
          notes: "forbidden",
        },
      },
    }),
    db.collection("xpWallets").doc("legacy-user").set({
      ownerUserId: "legacy-user",
      balance: 25,
      currency: "TOKEN",
      tokenAuthorized: true,
      cashoutAllowed: true,
    }),
    db.collection("xpLedgerEvents").doc("legacy-ledger").set({
      ownerUserId: "legacy-user",
      delta: 25,
    }),
    db.collection("ledgerEvents").doc("legacy-ledger").set({
      ownerUserId: "legacy-user",
      delta: 25,
    }),
  ]);
}

async function run() {
  console.log("WellFit database operations emulator test starts...");
  await reset();
  await seedLegacyState();

  const migrationDryRun = await runSelection({
    db,
    projectId: PROJECT_ID,
    kind: "migration",
    all: true,
    execute: false,
    releaseSha: "emulator-dry-run",
    operator: "emulator-test",
    changeTicket: "emulator-dry-run",
  });
  assert(migrationDryRun.count === 5, "Dry-run must include all five migrations.");
  assert((await db.collection("databaseMigrationRuns").limit(1).get()).empty, "Dry-run must not write migration records.");
  const legacyBefore = (await db.collection("users").doc("legacy-user").get()).data() || {};
  assert(legacyBefore.points === 99, "Dry-run must not mutate legacy user fields.");

  const migrationExecution = await runSelection({
    db,
    projectId: PROJECT_ID,
    kind: "migration",
    all: true,
    execute: true,
    allowDestructive: true,
    releaseSha: "emulator-execution",
    operator: "emulator-test",
    changeTicket: "emulator-migrations",
  });
  assert(migrationExecution.results.every((result) => result.status === "completed"), "All migrations must complete.");

  const migratedUser = (await db.collection("users").doc("legacy-user").get()).data() || {};
  for (const forbiddenField of ["points", "xp", "level", "energy", "stepsToday", "avatar", "consent", "inventory"]) {
    assert(migratedUser[forbiddenField] === undefined, `Legacy user field ${forbiddenField} must be removed.`);
  }
  assert(migratedUser.accountStatus === "active" && migratedUser.accountMutationsFrozen === false, "Account authority must be backfilled.");

  const lifecycle = (await db.collection("accountLifecycleRecords").doc("legacy-user").get()).data() || {};
  assert(lifecycle.status === "active" && lifecycle.freezeMutations === false, "Lifecycle record must be created.");

  const privateProfile = (await db.collection("userPrivateProfiles").doc("legacy-user").get()).data() || {};
  assert(privateProfile.birthDate === undefined && privateProfile.medicationName === undefined && privateProfile.healthNotes === undefined, "Forbidden private health fields must be removed.");
  assert(privateProfile.healthSettings.vitals.medicationName === undefined, "Nested medication name must be removed.");
  assert(privateProfile.healthSettings.lifestyle.notes === undefined, "Nested free-text lifestyle notes must be removed.");
  assert(privateProfile.rawBirthDateStored === false && privateProfile.medicationDetailsStored === false, "Privacy safety flags must be set.");

  for (const [collectionName, documentId] of [
    ["xpWallets", "legacy-user"],
    ["xpLedgerEvents", "legacy-ledger"],
    ["ledgerEvents", "legacy-ledger"],
  ]) {
    const data = (await db.collection(collectionName).doc(documentId).get()).data() || {};
    assert(data.currency === "WFXP", `${collectionName} must use WFXP runtime currency.`);
    assert(data.noMonetaryValue === true && data.tokenAuthorized === false && data.cashoutAllowed === false && data.realMoney === false, `${collectionName} must have non-monetary boundaries.`);
  }
  const schemaState = (await db.collection("databaseSchemaState").doc("current").get()).data() || {};
  assert(schemaState.schemaVersion === "2026-07-25-v1", "Schema baseline must be recorded.");
  assert(schemaState.canonicalCurrencyDecision === "pending-owner-migration-decision", "Currency terminology conflict must remain explicit.");

  const migrationRepeat = await runSelection({
    db,
    projectId: PROJECT_ID,
    kind: "migration",
    all: true,
    execute: true,
    allowDestructive: true,
    releaseSha: "emulator-execution",
    operator: "emulator-test",
    changeTicket: "emulator-migrations-repeat",
  });
  assert(migrationRepeat.results.every((result) => result.executed === false && result.idempotent === true), "Completed migrations must be idempotent.");

  const seedDryRun = await runSelection({
    db,
    projectId: PROJECT_ID,
    kind: "seed",
    all: true,
    execute: false,
    releaseSha: "emulator-seed-dry-run",
    operator: "emulator-test",
    changeTicket: "emulator-seed-dry-run",
  });
  assert(seedDryRun.count === 4, "Dry-run must include all four catalog seeds.");
  assert((await db.collection("missions").limit(1).get()).empty, "Seed dry-run must not write missions.");

  const seedExecution = await runSelection({
    db,
    projectId: PROJECT_ID,
    kind: "seed",
    all: true,
    execute: true,
    releaseSha: "emulator-seed-execution",
    operator: "emulator-test",
    changeTicket: "emulator-seeds",
  });
  assert(seedExecution.results.every((result) => result.status === "completed"), "All catalog seeds must complete.");
  const missionSnapshot = await db.collection("missions").get();
  assert(missionSnapshot.size === 23, `Expected 23 canonical missions, got ${missionSnapshot.size}.`);
  for (const missionDocument of missionSnapshot.docs) {
    const mission = missionDocument.data() || {};
    assert(mission.status === "published", `${missionDocument.id} must be published.`);
    assert(mission.currency === "WFXP", `${missionDocument.id} must use WFXP.`);
    assert(mission.noMonetaryValue === true, `${missionDocument.id} must be non-monetary.`);
    assert(mission.tokenAuthorized === false && mission.cashoutAllowed === false && mission.realMoney === false, `${missionDocument.id} must not authorize token or cash-out.`);
    assert(mission.childAllowed === false, `${missionDocument.id} must not silently enable child access.`);
    assert(mission.evidencePolicy && mission.evidencePolicy.reviewRequired === true, `${missionDocument.id} must require evidence review.`);
    assert(mission.createdAt, `${missionDocument.id} must retain a creation timestamp.`);
  }

  const tamperedRef = db.collection("missions").doc("daily-squats-15");
  await tamperedRef.update({ tokenAuthorized: true, cashoutAllowed: true, title: "tampered" });
  const seedRepeat = await runSelection({
    db,
    projectId: PROJECT_ID,
    kind: "seed",
    all: true,
    execute: true,
    releaseSha: "emulator-seed-execution",
    operator: "emulator-test",
    changeTicket: "emulator-seeds-repeat",
  });
  assert(seedRepeat.results.every((result) => result.executed === true), "Seeds must support reconciliation reruns.");
  const repaired = (await tamperedRef.get()).data() || {};
  assert(repaired.title === "15 saubere Kniebeugen", "Seed rerun must repair canonical content.");
  assert(repaired.tokenAuthorized === false && repaired.cashoutAllowed === false, "Seed rerun must repair safety boundaries.");
  assert((await db.collection("missions").get()).size === 23, "Seed rerun must not create duplicates.");

  assert((await db.collection("databaseOperationLeases").get()).empty, "Operation leases must be released.");
  const migrationRuns = await db.collection("databaseMigrationRuns").get();
  const seedRuns = await db.collection("databaseSeedRuns").get();
  assert(migrationRuns.size === 5, "Five migration run records are required.");
  assert(seedRuns.size === 4, "Four seed run records are required.");

  console.log("WellFit database operations emulator test successful.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
