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

const USER_ID = "deletion-processor-user";
const OTHER_USER_ID = "deletion-processor-other";
const BLOCKED_USER_ID = "deletion-processor-blocked";
const MEDIA_USER_ID = "deletion-processor-media";
const ADMIN_USER_ID = "deletion-processor-admin";

function adultBirthDate() {
  const date = new Date();
  return `${date.getUTCFullYear() - 35}-02-15`;
}

function onboardingPayload(userId, healthPersonalization = false) {
  return {
    firstName: "Deletion",
    lastName: "Processor",
    displayName: `Deletion ${userId}`,
    email: `${userId}@wellfit.test`,
    birthDate: adultBirthDate(),
    language: "de",
    timeZone: "Europe/Berlin",
    buddy: { id: "flammi" },
    registrationSource: "deletion-processor-emulator-test",
    consents: {
      termsAccepted: true,
      privacyAccepted: true,
      healthPersonalization,
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
    ...(healthPersonalization ? {
      healthProfile: {
        heightCm: 176,
        weightKg: 78,
        fitnessLevel: "medium",
        sleepHours: "6-8",
        sleepQuality: "good",
        nutrition: "all",
        stressLevel: 2,
        limitations: [],
        medicationDeclared: false,
      },
    } : {}),
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

async function requestDeletionAndMakeDue(userId, token) {
  await expectOk("requestAccountDeletion", token, {
    email: `${userId}@wellfit.test`,
    confirmation: "LOESCHEN",
    source: "deletion-processor-emulator-test",
  });
  await db.collection("accountLifecycleRecords").doc(userId).update({
    deletionScheduledFor: new Date(Date.now() - 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function authUserMissing(userId) {
  try {
    await admin.auth().getUser(userId);
    return false;
  } catch (error) {
    if (error && error.code === "auth/user-not-found") return true;
    throw error;
  }
}

async function assertDocumentMissing(collection, documentId, message) {
  const snapshot = await db.collection(collection).doc(documentId).get();
  assert(!snapshot.exists, message || `${collection}/${documentId} muss geloescht sein.`);
}

async function run() {
  console.log("WellFit Beta 1 Account Deletion Processor Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const [userToken, otherToken, blockedToken, mediaToken, adminToken] = await Promise.all([
    createAuthUser(USER_ID, false),
    createAuthUser(OTHER_USER_ID, false),
    createAuthUser(BLOCKED_USER_ID, false),
    createAuthUser(MEDIA_USER_ID, false),
    createAuthUser(ADMIN_USER_ID, true),
  ]);

  await expectOk("initializeUserAccount", userToken, onboardingPayload(USER_ID, true));
  await expectOk("initializeUserAccount", otherToken, onboardingPayload(OTHER_USER_ID));
  await expectOk("initializeUserAccount", blockedToken, onboardingPayload(BLOCKED_USER_ID));
  await expectOk("initializeUserAccount", mediaToken, onboardingPayload(MEDIA_USER_ID));

  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: USER_ID,
    delta: 50,
    reason: "deletion processor fixture",
    idempotencyKey: `${USER_ID}_fixture_wfxp`,
  });
  await db.collection("missionAttempts").doc(`${USER_ID}_attempt`).set({
    attemptId: `${USER_ID}_attempt`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    missionId: "challenge-reaction-test",
    status: "started",
  });
  await db.collection("missionEvidence").doc(`${USER_ID}_evidence`).set({
    evidenceId: `${USER_ID}_evidence`,
    attemptId: `${USER_ID}_attempt`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    evidenceType: "manual-test",
    reviewStatus: "approved",
    rawMediaStored: false,
  });
  await db.collection("missionCompletions").doc(`${USER_ID}_completion`).set({
    completionId: `${USER_ID}_completion`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    missionId: "challenge-reaction-test",
    status: "completed",
  });
  await db.collection("userInventory").doc(`${USER_ID}_inventory`).set({
    inventoryItemId: `${USER_ID}_inventory`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    itemId: "deletion-fixture-item",
    quantity: 1,
  });

  const sharedFamilyId = "deletion-shared-family";
  const sharedChildId = "deletion-shared-child";
  await db.collection("familyAccounts").doc(sharedFamilyId).set({
    familyAccountId: sharedFamilyId,
    guardianUserIds: [USER_ID, OTHER_USER_ID],
    childProfileIds: [sharedChildId],
    status: "active",
  });
  await db.collection("childProfiles").doc(sharedChildId).set({
    childProfileId: sharedChildId,
    familyAccountId: sharedFamilyId,
    guardianUserIds: [USER_ID, OTHER_USER_ID],
    nickname: "Shared Child",
    status: "active",
  });
  await db.collection("guardianChildLinks").doc(`${USER_ID}_${sharedChildId}`).set({
    guardianUserId: USER_ID,
    childProfileId: sharedChildId,
    familyAccountId: sharedFamilyId,
    status: "active",
  });
  await db.collection("guardianChildLinks").doc(`${OTHER_USER_ID}_${sharedChildId}`).set({
    guardianUserId: OTHER_USER_ID,
    childProfileId: sharedChildId,
    familyAccountId: sharedFamilyId,
    status: "active",
  });

  const archivedFamilyId = "deletion-archived-family";
  const archivedChildId = "deletion-archived-child";
  await db.collection("familyAccounts").doc(archivedFamilyId).set({
    familyAccountId: archivedFamilyId,
    guardianUserIds: [USER_ID],
    childProfileIds: [archivedChildId],
    status: "active",
  });
  await db.collection("childProfiles").doc(archivedChildId).set({
    childProfileId: archivedChildId,
    familyAccountId: archivedFamilyId,
    guardianUserIds: [USER_ID],
    nickname: "Archived Child",
    status: "archived",
  });
  await db.collection("guardianChildLinks").doc(`${USER_ID}_${archivedChildId}`).set({
    guardianUserId: USER_ID,
    childProfileId: archivedChildId,
    familyAccountId: archivedFamilyId,
    status: "archived",
  });
  await db.collection("userAvatars").doc(`${archivedChildId}_avatar`).set({
    userAvatarId: `${archivedChildId}_avatar`,
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: archivedChildId,
    buddyId: "flammi",
  });

  await db.collection("auditEvents").doc("deletion-cross-account-audit").set({
    auditEventId: "deletion-cross-account-audit",
    actorUserId: USER_ID,
    ownerUserId: OTHER_USER_ID,
    userId: OTHER_USER_ID,
    actionType: "cross-account-test-action",
    targetType: "test",
    targetId: OTHER_USER_ID,
    metadata: { privateActorContext: "must-be-removed" },
  });
  await db.collection("adminActions").doc("deletion-cross-account-admin-action").set({
    adminActionId: "deletion-cross-account-admin-action",
    actorUserId: USER_ID,
    ownerUserId: OTHER_USER_ID,
    userId: OTHER_USER_ID,
    actionType: "cross-account-test-action",
    metadata: { privateActorContext: "must-be-deleted" },
  });

  const exportResult = await expectOk("requestUserDataExport", userToken);
  assert(exportResult.ready === true && exportResult.totalChunks > 0, "Vor der Loeschung muss ein Exportauftrag existieren.");
  await requestDeletionAndMakeDue(USER_ID, userToken);

  const previewCandidates = await expectOk("adminPreviewDueAccountDeletions", adminToken, { limit: 10 });
  assert(previewCandidates.candidates.some((candidate) => candidate.userId === USER_ID), "Faelliger Loeschantrag muss in der Admin-Vorschau erscheinen.");

  const dryRun = await expectOk("adminProcessAccountDeletion", adminToken, {
    userId: USER_ID,
    dryRun: true,
  });
  assert(dryRun.dryRun === true && dryRun.due === true && dryRun.eligible === true, "Dry-Run muss die Loeschung als faellig und zulaessig ausweisen.");
  assert(dryRun.collectionCounts.users >= 1, "Dry-Run muss das Nutzerprofil zaehlen.");
  assert((await db.collection("users").doc(USER_ID).get()).exists, "Dry-Run darf keine Daten loeschen.");
  assert((await admin.auth().getUser(USER_ID)).disabled === false, "Dry-Run darf Firebase Auth nicht deaktivieren.");

  const processed = await expectOk("adminProcessAccountDeletion", adminToken, {
    userId: USER_ID,
    dryRun: false,
  });
  assert(processed.status === "deleted" && processed.authDeleted === true, "Ausfuehrung muss das Konto vollstaendig loeschen.");
  assert(processed.tokenAuthorized === false && processed.cashoutAllowed === false, "Loeschung darf keine Token- oder Cashout-Autoritaet erzeugen.");
  assert(await authUserMissing(USER_ID), "Firebase-Auth-Nutzer muss zuletzt geloescht werden.");

  for (const collection of [
    "users",
    "userOnboardingRecords",
    "userPrivateProfiles",
    "userCalendarSettings",
    "accountLifecycleRecords",
    "userDataExportJobs",
    "xpWallets",
  ]) {
    await assertDocumentMissing(collection, USER_ID);
  }
  await assertDocumentMissing("missionAttempts", `${USER_ID}_attempt`);
  await assertDocumentMissing("missionEvidence", `${USER_ID}_evidence`);
  await assertDocumentMissing("missionCompletions", `${USER_ID}_completion`);
  await assertDocumentMissing("userInventory", `${USER_ID}_inventory`);
  const exportChunks = await db.collection("userDataExportChunks").where("ownerUserId", "==", USER_ID).get();
  assert(exportChunks.empty, "Export-Chunks muessen geloescht werden.");
  const ledgerEvents = await db.collection("xpLedgerEvents").where("ownerUserId", "==", USER_ID).get();
  assert(ledgerEvents.empty, "WFXP-Ledger des geloeschten Kontos muss entfernt werden.");

  const sharedChild = (await db.collection("childProfiles").doc(sharedChildId).get()).data() || {};
  assert(JSON.stringify(sharedChild.guardianUserIds) === JSON.stringify([OTHER_USER_ID]), "Aktives gemeinsames Kinderprofil muss beim verbleibenden Guardian bleiben.");
  const sharedFamily = (await db.collection("familyAccounts").doc(sharedFamilyId).get()).data() || {};
  assert(JSON.stringify(sharedFamily.guardianUserIds) === JSON.stringify([OTHER_USER_ID]), "Gemeinsames Familienkonto muss den geloeschten Guardian entfernen.");
  assert((await db.collection("guardianChildLinks").doc(`${OTHER_USER_ID}_${sharedChildId}`).get()).exists, "Verbleibende Guardian-Verknuepfung muss erhalten bleiben.");
  await assertDocumentMissing("guardianChildLinks", `${USER_ID}_${sharedChildId}`);
  await assertDocumentMissing("childProfiles", archivedChildId);
  await assertDocumentMissing("familyAccounts", archivedFamilyId);
  await assertDocumentMissing("userAvatars", `${archivedChildId}_avatar`);

  const crossAudit = (await db.collection("auditEvents").doc("deletion-cross-account-audit").get()).data() || {};
  assert(crossAudit.actorUserId === "deleted-user" && crossAudit.actorDeleted === true, "Cross-Account-Audit muss den geloeschten Actor anonymisieren.");
  assert(crossAudit.actorDeletionTombstoneId === processed.deletionTombstoneId, "Anonymisiertes Audit muss auf den nicht-identifizierenden Tombstone verweisen.");
  assert(crossAudit.metadata && crossAudit.metadata.originalMetadataRemoved === true, "Persoenlicher Actor-Kontext muss entfernt werden.");
  await assertDocumentMissing("adminActions", "deletion-cross-account-admin-action", "Doppelte Admin-Action mit geloeschtem Actor muss entfernt werden.");

  const tombstoneSnapshot = await db.collection("accountDeletionTombstones").doc(processed.deletionTombstoneId).get();
  assert(tombstoneSnapshot.exists, "Nicht-identifizierender Loesch-Tombstone muss vorhanden sein.");
  const tombstone = tombstoneSnapshot.data() || {};
  assert(tombstone.originalUserIdentifierStored === false && tombstone.originalEmailStored === false, "Tombstone darf weder UID noch E-Mail speichern.");
  const serializedTombstone = JSON.stringify(tombstone).toLowerCase();
  assert(!serializedTombstone.includes(USER_ID.toLowerCase()), "Tombstone darf die urspruengliche UID nicht enthalten.");
  assert(!serializedTombstone.includes(`${USER_ID}@wellfit.test`.toLowerCase()), "Tombstone darf die E-Mail nicht enthalten.");
  assert((await db.collection("users").doc(OTHER_USER_ID).get()).exists, "Anderes Nutzerkonto darf nicht geloescht werden.");

  // Re-check Guardian dependencies at processing time, not only at request time.
  await requestDeletionAndMakeDue(BLOCKED_USER_ID, blockedToken);
  const blockedFamilyId = "deletion-blocked-family";
  const blockedChildId = "deletion-blocked-child";
  await db.collection("familyAccounts").doc(blockedFamilyId).set({
    familyAccountId: blockedFamilyId,
    guardianUserIds: [BLOCKED_USER_ID],
    childProfileIds: [blockedChildId],
    status: "active",
  });
  await db.collection("childProfiles").doc(blockedChildId).set({
    childProfileId: blockedChildId,
    familyAccountId: blockedFamilyId,
    guardianUserIds: [BLOCKED_USER_ID],
    nickname: "Blocking Child",
    status: "active",
  });
  await expectError("adminProcessAccountDeletion", adminToken, {
    userId: BLOCKED_USER_ID,
    dryRun: false,
  }, "Loeschung muss bei neu entstandener alleiniger Guardian-Verantwortung blockieren");
  const blockedLifecycle = (await db.collection("accountLifecycleRecords").doc(BLOCKED_USER_ID).get()).data() || {};
  assert(blockedLifecycle.status === "deletion-blocked" && blockedLifecycle.freezeMutations === true, "Blockierter Loeschprozess muss sicher eingefroren bleiben.");
  assert((await admin.auth().getUser(BLOCKED_USER_ID)).disabled === false, "Blockierte Vorpruefung darf Firebase Auth nicht deaktivieren.");
  const cancelledBlocked = await expectOk("cancelAccountDeletion", blockedToken, { reason: "guardian-dependency" });
  assert(cancelledBlocked.status === "active" && cancelledBlocked.freezeMutations === false, "Nutzer muss einen blockierten Antrag widerrufen koennen.");

  // External media references fail closed until a storage-aware erasure path exists.
  await requestDeletionAndMakeDue(MEDIA_USER_ID, mediaToken);
  await db.collection("missionEvidence").doc(`${MEDIA_USER_ID}_media`).set({
    evidenceId: `${MEDIA_USER_ID}_media`,
    ownerUserId: MEDIA_USER_ID,
    userId: MEDIA_USER_ID,
    evidenceType: "image",
    storagePath: `users/${MEDIA_USER_ID}/evidence/image.jpg`,
  });
  await expectError("adminProcessAccountDeletion", adminToken, {
    userId: MEDIA_USER_ID,
    dryRun: false,
  }, "Referenzierte Mediendatei muss den Prozessor fail-closed blockieren");
  const mediaLifecycle = (await db.collection("accountLifecycleRecords").doc(MEDIA_USER_ID).get()).data() || {};
  assert(mediaLifecycle.status === "deletion-blocked", "Media-Blocker muss als deletion-blocked sichtbar sein.");
  assert(mediaLifecycle.blockedExternalStorageReferenceCount === 1, "Media-Blocker muss die Referenzanzahl dokumentieren.");
  assert((await admin.auth().getUser(MEDIA_USER_ID)).disabled === false, "Media-Vorpruefung darf Firebase Auth nicht deaktivieren.");
  const mediaCancelled = await expectOk("cancelAccountDeletion", mediaToken, { reason: "media-cleanup-required" });
  assert(mediaCancelled.status === "active", "Media-blockierter Antrag muss widerrufbar sein.");

  console.log("WellFit Beta 1 Account Deletion Processor Emulator Test PASS");
}

run().catch((error) => {
  console.error("WellFit Beta 1 Account Deletion Processor Emulator Test FAIL");
  console.error(error);
  process.exit(1);
});
