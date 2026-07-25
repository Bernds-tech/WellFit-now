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

const USER_ID = "mission-history-user";
const OTHER_USER_ID = "mission-history-other";

async function expectOk(functionName, token, data) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${functionName} muss accepted=true liefern: ${describeCall(response)}`);
  return result;
}

async function run() {
  console.log("WellFit Beta 1 Server Mission History Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const userToken = await createAuthUser(USER_ID, false);
  const otherToken = await createAuthUser(OTHER_USER_ID, false);
  const now = admin.firestore.Timestamp.now();
  const earlier = admin.firestore.Timestamp.fromMillis(now.toMillis() - 60 * 60 * 1000);
  const oldest = admin.firestore.Timestamp.fromMillis(now.toMillis() - 2 * 60 * 60 * 1000);

  const batch = db.batch();
  const missions = [
    ["daily-history-water", "Wasserziel", "wellfit-beta1-daily-missions"],
    ["weekly-history-active", "Aktive Woche", "wellfit-beta1-weekly-missions"],
    ["challenge-history-reaction", "Reaction Test", "wellfit-beta1-challenge-missions"],
    ["adventure-history-city", "City Sprint", "wellfit-beta1-adventure-missions"],
    ["daily-history-inconsistent", "Ledger-Prüfung", "wellfit-beta1-daily-missions"],
    ["daily-other-private", "Fremde Mission", "wellfit-beta1-daily-missions"],
  ];
  missions.forEach(([missionId, title, catalogId]) => {
    batch.set(db.collection("missions").doc(missionId), {
      missionId,
      title,
      catalogId,
      status: "published",
      rewardXp: 10,
      noMonetaryValue: true,
    });
  });

  batch.set(db.collection("missionAttempts").doc("private-attempt-completed"), {
    attemptId: "private-attempt-completed",
    missionId: "daily-history-water",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "completed",
    dateKey: "2026-07-25",
    timeZone: "Europe/Vienna",
    createdAt: earlier,
    updatedAt: now,
  });
  batch.set(db.collection("missionEvidence").doc("private-evidence-completed"), {
    evidenceId: "private-evidence-completed",
    attemptId: "private-attempt-completed",
    missionId: "daily-history-water",
    ownerUserId: USER_ID,
    userId: USER_ID,
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    storageRef: "private/storage/completed.jpg",
    metadata: { privateSignal: "must-not-leak" },
    createdAt: earlier,
    reviewedAt: now,
  });
  batch.set(db.collection("missionCompletions").doc("private-attempt-completed"), {
    completionId: "private-attempt-completed",
    attemptId: "private-attempt-completed",
    missionId: "daily-history-water",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "completed",
    rewardXp: 9,
    xpLedgerEventId: "private-ledger-completed",
    dateKey: "2026-07-25",
    timeZone: "Europe/Vienna",
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  batch.set(db.collection("missionAttempts").doc("private-attempt-approved"), {
    attemptId: "private-attempt-approved",
    missionId: "weekly-history-active",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "evidence-approved",
    weekKey: "2026-W30",
    timeZone: "Europe/Vienna",
    createdAt: oldest,
    updatedAt: earlier,
  });
  batch.set(db.collection("missionEvidence").doc("private-evidence-approved"), {
    evidenceId: "private-evidence-approved",
    attemptId: "private-attempt-approved",
    missionId: "weekly-history-active",
    ownerUserId: USER_ID,
    userId: USER_ID,
    reviewStatus: "approved",
    serverValidationStatus: "evidence-approved",
    createdAt: oldest,
    reviewedAt: earlier,
  });

  batch.set(db.collection("missionAttempts").doc("private-attempt-pending"), {
    attemptId: "private-attempt-pending",
    missionId: "challenge-history-reaction",
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: "private-child-profile",
    locationId: "private-location-id",
    locationTitle: "Safe Public Test Location",
    status: "evidence-submitted",
    createdAt: oldest,
    updatedAt: earlier,
  });
  batch.set(db.collection("missionEvidence").doc("private-evidence-pending"), {
    evidenceId: "private-evidence-pending",
    attemptId: "private-attempt-pending",
    missionId: "challenge-history-reaction",
    ownerUserId: USER_ID,
    userId: USER_ID,
    childProfileId: "private-child-profile",
    reviewStatus: "pending-server-review",
    storageRef: "private/storage/pending.jpg",
    metadata: { latitude: 48.1, longitude: 16.3, privateSignal: "hidden" },
    createdAt: earlier,
  });

  batch.set(db.collection("missionAttempts").doc("private-attempt-adventure"), {
    attemptId: "private-attempt-adventure",
    missionId: "adventure-history-city",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "started",
    accessAuthorized: true,
    accessLedgerEventId: "private-access-ledger",
    accessCostWfxp: 12,
    locationId: "private-adventure-location",
    createdAt: oldest,
    updatedAt: oldest,
  });

  batch.set(db.collection("missionAttempts").doc("private-attempt-inconsistent"), {
    attemptId: "private-attempt-inconsistent",
    missionId: "daily-history-inconsistent",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "completed",
    dateKey: "2026-07-24",
    timeZone: "Europe/Vienna",
    createdAt: oldest,
    updatedAt: oldest,
  });
  batch.set(db.collection("missionCompletions").doc("private-attempt-inconsistent"), {
    completionId: "private-attempt-inconsistent",
    attemptId: "private-attempt-inconsistent",
    missionId: "daily-history-inconsistent",
    ownerUserId: USER_ID,
    userId: USER_ID,
    status: "completed",
    rewardXp: 7,
    completedAt: oldest,
    createdAt: oldest,
    updatedAt: oldest,
  });

  batch.set(db.collection("missionAttempts").doc("private-other-attempt"), {
    attemptId: "private-other-attempt",
    missionId: "daily-other-private",
    ownerUserId: OTHER_USER_ID,
    userId: OTHER_USER_ID,
    status: "completed",
    createdAt: now,
    updatedAt: now,
  });
  batch.set(db.collection("missionCompletions").doc("private-other-attempt"), {
    completionId: "private-other-attempt",
    attemptId: "private-other-attempt",
    missionId: "daily-other-private",
    ownerUserId: OTHER_USER_ID,
    userId: OTHER_USER_ID,
    status: "completed",
    rewardXp: 99,
    xpLedgerEventId: "private-other-ledger",
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  await batch.commit();

  const unauthenticated = await callCallable("getMissionHistory", null, { limit: 50 });
  assert(!unauthenticated.ok, `Mission History muss Login verlangen: ${describeCall(unauthenticated)}`);

  const beforeAuditCount = (await db.collection("auditEvents").get()).size;
  const beforeAdminActionCount = (await db.collection("adminActions").get()).size;
  const beforeLegacyHistoryCount = (await db.collection("history").get()).size;

  const result = await expectOk("getMissionHistory", userToken, { limit: 50 });
  assert(result.historyVersion === "2026-07-25-v1", "History version muss kanonisch sein.");
  assert(result.progressAuthority === "server-read", "History muss read-only Serverautoritaet ausweisen.");
  assert(result.noMonetaryValue === true && result.tokenAuthorized === false && result.cashoutAllowed === false, "History muss WFXP-only bleiben.");
  assert(result.rawEvidenceIncluded === false && result.rawLocationIncluded === false, "History darf keine Evidence- oder Rohstandortdaten enthalten.");
  assert(result.userIdentifiersIncluded === false && result.recordIdentifiersIncluded === false, "History darf keine Nutzer- oder Record-IDs ausgeben.");
  assert(result.writesPerformed === false, "History callable darf keine Writes melden.");
  assert(Array.isArray(result.entries) && result.entries.length === 5, `Genau fuenf eigene History-Eintraege erwartet: ${JSON.stringify(result.entries)}`);

  const completed = result.entries.find((entry) => entry.missionId === "daily-history-water");
  assert(completed && completed.status === "completed", "Ledger-backed Completion muss abgeschlossen sein.");
  assert(completed.rewardXp === 9 && completed.ledgerRecorded === true, "Reward muss aus Completion/Ledger stammen.");
  assert(completed.periodType === "day" && completed.periodKey === "2026-07-25", "Daily Zeitraum muss vorhanden sein.");

  const approved = result.entries.find((entry) => entry.missionId === "weekly-history-active");
  assert(approved && approved.status === "review-approved" && approved.actionRequired === true, "Freigegebene Evidence muss den Completion-Schritt verlangen.");
  assert(approved.periodType === "week" && approved.periodKey === "2026-W30", "Weekly Zeitraum muss vorhanden sein.");

  const pending = result.entries.find((entry) => entry.missionId === "challenge-history-reaction");
  assert(pending && pending.status === "review-pending" && pending.actionRequired === false, "Pending Challenge muss Review abwarten.");
  assert(pending.isLocationBound === true && pending.childProfile === true, "Nur sichere Bool-Projektionen fuer Ort und Child Scope sind erlaubt.");

  const adventure = result.entries.find((entry) => entry.missionId === "adventure-history-city");
  assert(adventure && adventure.status === "started", "Adventure Access ohne Evidence bleibt gestartet.");
  assert(adventure.accessDebited === true && adventure.accessCostWfxp === 12, "Einmaliger interner Adventure-Zugang muss sichtbar sein.");

  const inconsistent = result.entries.find((entry) => entry.missionId === "daily-history-inconsistent");
  assert(inconsistent && inconsistent.status === "server-inconsistent" && inconsistent.serverAttentionRequired === true, "Completion ohne Ledger muss als Inkonsistenz erscheinen.");
  assert(inconsistent.rewardXp === 0 && inconsistent.ledgerRecorded === false, "Inkonsistenter Datensatz darf keinen bestaetigten Reward anzeigen.");

  const serialized = JSON.stringify(result);
  for (const forbidden of [
    USER_ID,
    OTHER_USER_ID,
    "daily-other-private",
    "private-attempt",
    "private-evidence",
    "private-ledger",
    "private-access-ledger",
    "private-child-profile",
    "private-location-id",
    "private-adventure-location",
    "private/storage",
    "must-not-leak",
    "latitude",
    "longitude",
  ]) {
    assert(!serialized.includes(forbidden), `Mission History leakt verbotenen Wert: ${forbidden}`);
  }
  assert(result.entries.every((entry) => /^history_[a-f0-9]{24}$/.test(entry.historyId)), "History IDs muessen opaque Hashes sein.");

  const limited = await expectOk("getMissionHistory", userToken, { limit: 2 });
  assert(limited.entries.length === 2 && limited.requestedLimit === 2, "History Limit muss serverseitig gelten.");

  const repeated = await expectOk("getMissionHistory", userToken, { limit: 50 });
  assert(JSON.stringify(repeated.entries) === JSON.stringify(result.entries), "Read-only History muss deterministische Eintraege liefern.");
  assert((await db.collection("auditEvents").get()).size === beforeAuditCount, "History darf kein Audit Event schreiben.");
  assert((await db.collection("adminActions").get()).size === beforeAdminActionCount, "History darf keine Admin Action schreiben.");
  assert((await db.collection("history").get()).size === beforeLegacyHistoryCount, "History darf keine Legacy-History-Dokumente schreiben.");

  const otherResult = await expectOk("getMissionHistory", otherToken, { limit: 50 });
  assert(otherResult.entries.length === 1 && otherResult.entries[0].missionId === "daily-other-private", "Nutzer duerfen nur die eigene History sehen.");

  console.log("WellFit Beta 1 Server Mission History Emulator Test erfolgreich.");
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
