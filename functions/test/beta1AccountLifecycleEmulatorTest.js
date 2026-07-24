const crypto = require("node:crypto");
const {
  db,
  assert,
  createAuthUser,
  callCallable,
  getCallableResult,
  describeCall,
  resetBeta1Collections,
  seedBeta1RuntimeData,
} = require("./beta1RuntimeFixtures");

const USER_ID = "account-lifecycle-user";
const OTHER_USER_ID = "account-lifecycle-other";
const GUARDIAN_USER_ID = "account-lifecycle-guardian";
const ADMIN_USER_ID = "account-lifecycle-admin";

function dateYearsAgo(years) {
  const now = new Date();
  return `${now.getUTCFullYear() - years}-02-15`;
}

function onboardingPayload(userId) {
  return {
    firstName: "Account",
    lastName: "Lifecycle",
    displayName: `Account ${userId}`,
    email: `${userId}@wellfit.test`,
    birthDate: dateYearsAgo(32),
    language: "de",
    timeZone: "Europe/Berlin",
    buddy: { id: "flammi" },
    registrationSource: "account-lifecycle-emulator-test",
    consents: {
      termsAccepted: true,
      privacyAccepted: true,
      healthPersonalization: true,
      anonymousAnalytics: false,
      marketing: false,
    },
    preferences: {
      activityLevel: "medium",
      trainingTime: "flexible",
      communityMode: "private",
      interests: ["Natur"],
      goals: ["Mehr Bewegung"],
      activities: ["walking"],
    },
    healthProfile: {
      heightCm: 178,
      weightKg: 79,
      fitnessLevel: "medium",
      sleepHours: "6-8",
      sleepQuality: "good",
      nutrition: "all",
      stressLevel: 2,
      limitations: [],
      medicationDeclared: false,
    },
  };
}

async function expectOk(functionName, token, data = {}) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${functionName} muss accepted=true liefern: ${describeCall(response)}`);
  return result;
}

async function expectError(functionName, token, data, label) {
  const response = await callCallable(functionName, token, data || {});
  assert(!response.ok, `${label || functionName} muss fehlschlagen: ${describeCall(response)}`);
  return response;
}

function parseExportPayload(result) {
  assert(typeof result.payloadJson === "string", "Export-Chunk muss payloadJson liefern.");
  assert(typeof result.payloadSha256 === "string", "Export-Chunk muss SHA-256 liefern.");
  const actual = crypto.createHash("sha256").update(result.payloadJson).digest("hex");
  assert(actual === result.payloadSha256, "Export-Chunk muss einen gueltigen Integritaets-Hash besitzen.");
  return JSON.parse(result.payloadJson);
}

async function run() {
  console.log("WellFit Beta 1 Account Lifecycle Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const [userToken, otherToken, guardianToken, adminToken] = await Promise.all([
    createAuthUser(USER_ID, false),
    createAuthUser(OTHER_USER_ID, false),
    createAuthUser(GUARDIAN_USER_ID, false),
    createAuthUser(ADMIN_USER_ID, true),
  ]);

  await expectOk("initializeUserAccount", userToken, onboardingPayload(USER_ID));
  await expectOk("initializeUserAccount", otherToken, onboardingPayload(OTHER_USER_ID));
  await expectOk("initializeUserAccount", guardianToken, onboardingPayload(GUARDIAN_USER_ID));

  const activeStatus = await expectOk("getAccountLifecycleStatus", userToken);
  assert(activeStatus.status === "active" && activeStatus.freezeMutations === false, "Neues Konto muss aktiv sein.");
  assert(activeStatus.deletionCanBeRequested === true, "Konto ohne alleinige Kinderverantwortung muss einen Loeschantrag stellen koennen.");

  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: USER_ID,
    delta: 40,
    reason: "account lifecycle export fixture",
    idempotencyKey: `${USER_ID}_initial_wfxp`,
  });
  await db.collection("missionCompletions").doc(`${USER_ID}_completion`).set({
    completionId: `${USER_ID}_completion`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    missionId: "challenge-reaction-test",
    status: "completed",
    completedAt: new Date().toISOString(),
    rewardXp: 8,
    tokenAuthorized: false,
  });
  await db.collection("userInventory").doc(`${USER_ID}_inventory`).set({
    inventoryItemId: `${USER_ID}_inventory`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    itemId: "export-fixture-item",
    quantity: 1,
    equipped: false,
  });

  const exportResult = await expectOk("requestUserDataExport", userToken);
  assert(exportResult.status === "ready" && exportResult.ready === true, "Datenexport muss synchron als bereit markiert werden.");
  assert(exportResult.totalChunks > 1, "Datenexport muss Manifest und Datensektionen enthalten.");
  assert(exportResult.totalDocuments >= 5, "Datenexport muss mehrere personenbezogene Dokumente enthalten.");
  assert(exportResult.tokenAuthorized === false && exportResult.cashoutAllowed === false, "Export darf keine Tokenautoritaet erzeugen.");

  const sections = {};
  let manifest = null;
  for (let index = 0; index < exportResult.totalChunks; index += 1) {
    const chunkResult = await expectOk("downloadUserDataExportChunk", userToken, { index });
    assert(chunkResult.totalChunks === exportResult.totalChunks, "Alle Exportteile muessen demselben Auftrag angehoeren.");
    const payload = parseExportPayload(chunkResult);
    if (payload.section === "manifest") manifest = payload.items[0] && payload.items[0].data;
    else sections[payload.section] = [...(sections[payload.section] || []), ...(payload.items || [])];
  }
  assert(manifest && manifest.format === "wellfit-user-data-export-json-v1", "Export braucht ein versioniertes Manifest.");
  assert((sections["account-profile"] || []).some((item) => item.documentId === USER_ID), "Kontoprofil muss im Export enthalten sein.");
  assert((sections["private-profile"] || []).some((item) => item.documentId === USER_ID), "Privates Health-Profil muss im Export enthalten sein.");
  assert((sections["wfxp-wallets"] || []).some((item) => item.data && item.data.balance === 40), "WFXP-Wallet muss im Export enthalten sein.");
  assert((sections["mission-completions"] || []).some((item) => item.documentId === `${USER_ID}_completion`), "Mission Completion muss im Export enthalten sein.");
  assert((sections.inventory || []).some((item) => item.documentId === `${USER_ID}_inventory`), "Inventar muss im Export enthalten sein.");
  assert(JSON.stringify({ manifest, sections }).toLowerCase().includes("passwordhash") === false, "Export darf keinen Passwort-Hash enthalten.");

  const repeatedExport = await expectOk("requestUserDataExport", userToken);
  assert(repeatedExport.ready === true && repeatedExport.idempotent === true, "Wiederholter Export innerhalb der Gueltigkeit muss idempotent sein.");
  await expectError("downloadUserDataExportChunk", otherToken, { index: 0 }, "Fremder Nutzer darf Exportteile nicht laden");

  await expectError("requestAccountDeletion", userToken, {
    email: `${USER_ID}@wellfit.test`,
    confirmation: "DELETE",
  }, "Falscher Bestaetigungstext muss blockiert werden");
  await expectError("requestAccountDeletion", userToken, {
    email: "wrong@wellfit.test",
    confirmation: "LOESCHEN",
  }, "Falsche E-Mail muss blockiert werden");

  const family = await expectOk("createGuardianFamilyAccount", guardianToken, { displayName: "Lifecycle Family" });
  await expectOk("createChildProfile", guardianToken, {
    familyAccountId: family.familyAccountId,
    nickname: "Kind",
    age: 10,
    relationship: "guardian",
  });
  const guardianStatus = await expectOk("getAccountLifecycleStatus", guardianToken);
  assert(guardianStatus.dependencies.soleGuardianChildProfiles === 1, "Alleinige Guardian-Verantwortung muss erkannt werden.");
  await expectError("requestAccountDeletion", guardianToken, {
    email: `${GUARDIAN_USER_ID}@wellfit.test`,
    confirmation: "LOESCHEN",
  }, "Alleiniger Guardian darf das Konto nicht zur Loeschung vormerken");

  const deletion = await expectOk("requestAccountDeletion", userToken, {
    email: `${USER_ID}@wellfit.test`,
    confirmation: "LOESCHEN",
    source: "emulator-test",
    reasonCategory: "test",
  });
  assert(deletion.status === "deletion-pending" && deletion.freezeMutations === true, "Loeschantrag muss das Konto einfrieren.");
  assert(new Date(deletion.deletionScheduledFor).getTime() > Date.now(), "Loeschzeitpunkt muss in der Zukunft liegen.");

  const lifecycleSnapshot = await db.collection("accountLifecycleRecords").doc(USER_ID).get();
  const lifecycle = lifecycleSnapshot.data() || {};
  assert(lifecycle.status === "deletion-pending" && lifecycle.confirmedEmailHash, "Lifecycle-Dokument muss Antrag und gehashte Bestaetigung speichern.");
  assert(lifecycle.confirmedEmailHash !== `${USER_ID}@wellfit.test`, "E-Mail darf im Lifecycle-Dokument nicht im Klartext bestaetigt werden.");
  const accountSnapshot = await db.collection("users").doc(USER_ID).get();
  assert((accountSnapshot.data() || {}).accountMutationsFrozen === true, "Minimales Nutzerprofil muss Freeze-Zustand spiegeln.");

  const walletBeforeBlockedGrant = (await db.collection("xpWallets").doc(USER_ID).get()).data() || {};
  await expectError("adminAdjustXp", adminToken, {
    ownerUserId: USER_ID,
    delta: 5,
    reason: "must be blocked",
    idempotencyKey: `${USER_ID}_blocked_wfxp`,
  }, "WFXP-Aenderungen muessen waehrend der Karenzzeit blockiert werden");
  const walletAfterBlockedGrant = (await db.collection("xpWallets").doc(USER_ID).get()).data() || {};
  assert(walletAfterBlockedGrant.balance === walletBeforeBlockedGrant.balance, "Blockierte WFXP-Aktion darf den Saldo nicht veraendern.");

  const repeatedDeletion = await expectOk("requestAccountDeletion", userToken, {
    email: `${USER_ID}@wellfit.test`,
    confirmation: "LOESCHEN",
  });
  assert(repeatedDeletion.idempotent === true, "Wiederholter Loeschantrag muss idempotent sein.");

  const cancelled = await expectOk("cancelAccountDeletion", userToken, { reason: "test-cancel" });
  assert(cancelled.status === "active" && cancelled.freezeMutations === false, "Widerruf muss das Konto wieder aktivieren.");
  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: USER_ID,
    delta: 5,
    reason: "after deletion cancellation",
    idempotencyKey: `${USER_ID}_after_cancel_wfxp`,
  });
  const walletAfterCancellation = (await db.collection("xpWallets").doc(USER_ID).get()).data() || {};
  assert(walletAfterCancellation.balance === 45, "WFXP muss nach dem Widerruf wieder veraenderbar sein.");

  const cancellationAgain = await expectOk("cancelAccountDeletion", userToken, { reason: "duplicate" });
  assert(cancellationAgain.idempotent === true, "Wiederholter Widerruf muss idempotent sein.");

  const auditSnapshot = await db.collection("auditEvents").where("ownerUserId", "==", USER_ID).get();
  const actionTypes = auditSnapshot.docs.map((doc) => (doc.data() || {}).actionType);
  assert(actionTypes.includes("user-data-export-created"), "Datenexport braucht ein Audit-Ereignis.");
  assert(actionTypes.includes("account-deletion-requested"), "Loeschantrag braucht ein Audit-Ereignis.");
  assert(actionTypes.includes("account-deletion-cancelled"), "Widerruf braucht ein Audit-Ereignis.");

  console.log("WellFit Beta 1 Account Lifecycle Emulator Test PASS");
}

run().catch((error) => {
  console.error("WellFit Beta 1 Account Lifecycle Emulator Test FAIL");
  console.error(error);
  process.exit(1);
});
