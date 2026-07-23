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

const ADMIN_ID = "buddy-actions-admin";
const USER_ID = "buddy-actions-user";
const OTHER_ID = "buddy-actions-other";

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function actionId(userId, childProfileId, actionType, requestId) {
  return `buddy_action_${safeDocIdPart(userId)}_${safeDocIdPart(childProfileId || "self")}_${safeDocIdPart(actionType)}_${safeDocIdPart(requestId)}`;
}

async function expectHttpOk(functionName, token, data) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result, `${functionName} muss ein Callable-Ergebnis liefern: ${describeCall(response)}`);
  return result;
}

async function expectAccepted(functionName, token, data) {
  const result = await expectHttpOk(functionName, token, data);
  assert(result.accepted === true, `${functionName} muss accepted=true liefern: ${JSON.stringify(result)}`);
  return result;
}

async function expectCallableError(functionName, token, data, label) {
  const response = await callCallable(functionName, token, data);
  assert(!response.ok, `${label || functionName} muss fehlschlagen: ${describeCall(response)}`);
  return response;
}

async function fundWallet(adminToken, ownerUserId, delta, idempotencyKey, childProfileId) {
  return expectAccepted("adminAdjustXp", adminToken, {
    ownerUserId,
    ...(childProfileId ? { childProfileId } : {}),
    delta,
    reason: "buddy-actions-emulator-funding",
    idempotencyKey,
  });
}

async function run() {
  console.log("WellFit Beta 1 Buddy Actions Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser(ADMIN_ID, true);
  const userToken = await createAuthUser(USER_ID, false);
  const otherToken = await createAuthUser(OTHER_ID, false);

  const initial = await expectAccepted("getBuddyStateProjection", userToken, {});
  assert(initial.finalAuthority === true, "Buddy-Projektion muss serverseitige Finalautoritaet ausweisen.");
  assert(initial.noMonetaryValue === true && initial.tokenAuthorized === false && initial.cashoutAllowed === false, "Buddy-Projektion muss WFXP-only bleiben.");
  assert(initial.buddy.points === 0, "Neue Buddy-Projektion muss mit 0 WFXP starten.");
  assert(initial.buddy.cleanliness === 76 && initial.buddy.bond === 68, "Neue Buddy-Projektion muss kanonische Startwerte verwenden.");
  assert(initial.buddy.xp === 0 && initial.buddy.nextLevelXp === 100, "Buddy-Levelprojektion muss XP innerhalb des aktuellen Levels liefern.");
  assert(initial.actionPolicies.care.costWfxp === 8, "Pflegen muss serverseitig 8 WFXP kosten.");
  assert(initial.actionPolicies.play.costWfxp === 3, "Spielen muss serverseitig 3 WFXP kosten.");
  assert(initial.actionPolicies.clean.costWfxp === 4, "Aufraeumen muss serverseitig 4 WFXP kosten.");

  const insufficientRequestId = "care-insufficient";
  const insufficient = await expectHttpOk("performBuddyCareAction", userToken, {
    actionType: "care",
    requestId: insufficientRequestId,
  });
  assert(insufficient.accepted === false, "Pflegen ohne WFXP muss fachlich abgelehnt werden.");
  assert(insufficient.rejectionReason === "insufficient-wfxp-balance", "Ablehnung muss insufficient-wfxp-balance liefern.");
  assert(insufficient.remainingWfxp === 0, "Abgelehnte Aktion darf den Saldo nicht veraendern.");
  const rejectedAction = await db.collection("buddyCareActions").doc(actionId(USER_ID, null, "care", insufficientRequestId)).get();
  assert(!rejectedAction.exists, "Abgelehnte Aktion darf kein abgeschlossenes Authority-Dokument erzeugen.");

  await fundWallet(adminToken, USER_ID, 40, "buddy_actions_user_funding");
  const fundedProjection = await expectAccepted("getBuddyStateProjection", userToken, {});
  assert(fundedProjection.buddy.points === 40, "Buddy muss den serverseitigen Wallet-Saldo anzeigen.");
  assert(fundedProjection.buddy.xp === 40 && fundedProjection.buddy.nextLevelXp === 100, "Buddy-XP muss aus lifetimeEarned abgeleitet werden.");

  const careRequestId = "care-1";
  const care = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "care",
    requestId: careRequestId,
  });
  assert(care.idempotent === false, "Erste Pflegeaktion darf nicht idempotent sein.");
  assert(care.costWfxp === 8 && care.remainingWfxp === 32, "Pflegen muss exakt 8 WFXP abbuchen.");
  assert(care.buddy.cleanliness === 94, "Pflegen muss Sauberkeit von 76 auf 94 erhoehen.");
  assert(care.buddy.bond === 74 && care.buddy.mood === 72 && care.buddy.loyalty === 77, "Pflegen muss nur die kanonischen Buddy-Effekte anwenden.");
  assert(care.buddy.points === 32, "Buddy-Projektion muss den neuen Wallet-Saldo anzeigen.");
  assert(care.tokenAuthorized === false && care.cashoutAllowed === false, "Buddy-Aktion darf keine Token- oder Cashout-Autoritaet erzeugen.");

  const careActionDoc = await db.collection("buddyCareActions").doc(care.actionId).get();
  const careLedgerDoc = await db.collection("xpLedgerEvents").doc(care.actionId).get();
  const careLegacyLedgerDoc = await db.collection("ledgerEvents").doc(care.actionId).get();
  const careAuditDoc = await db.collection("auditEvents").doc(care.actionId).get();
  assert(careActionDoc.exists, "Erfolgreiche Pflege muss ein Authority-Dokument schreiben.");
  assert(careActionDoc.data().ownerUserId === USER_ID && careActionDoc.data().status === "completed", "Buddy-Action muss owner-scoped und completed sein.");
  assert(careLedgerDoc.exists && careLedgerDoc.data().delta === -8, "Pflegen muss ein XP-Ledger-Delta -8 schreiben.");
  assert(careLedgerDoc.data().reason === "buddy-care-action", "Buddy-Ledger braucht den kanonischen Grund.");
  assert(careLegacyLedgerDoc.exists && careLegacyLedgerDoc.data().delta === -8, "Kompatibilitaets-Ledger muss atomar gespiegelt werden.");
  assert(careAuditDoc.exists, "Buddy-Aktion muss im selben Commit ein Audit Event schreiben.");

  const careReplay = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "care",
    requestId: careRequestId,
  });
  assert(careReplay.idempotent === true, "Identischer Pflegeauftrag muss idempotent sein.");
  assert(careReplay.actionId === care.actionId && careReplay.remainingWfxp === 32, "Replay darf weder Action-ID noch WFXP-Saldo veraendern.");
  const walletAfterReplay = await db.collection("xpWallets").doc(USER_ID).get();
  assert(walletAfterReplay.data().balance === 32 && walletAfterReplay.data().lifetimeSpent === 8, "Replay darf Wallet und lifetimeSpent nicht doppelt belasten.");

  await expectCallableError(
    "performBuddyCareAction",
    userToken,
    { actionType: "care", requestId: "care-too-soon" },
    "Neue Pflegeaktion innerhalb des Cooldowns muss blockiert sein",
  );

  const play = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "play",
    requestId: "play-1",
  });
  assert(play.costWfxp === 3 && play.remainingWfxp === 29, "Spielen muss exakt 3 WFXP abbuchen.");
  assert(play.buddy.energy === 74 && play.buddy.hunger === 67, "Spielen muss Energie und Hunger begrenzt reduzieren.");
  assert(play.buddy.mood === 88 && play.buddy.curiosity === 74 && play.buddy.bond === 79, "Spielen muss Stimmung, Neugier und Bindung erhoehen.");

  const call = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "call",
    requestId: "call-1",
  });
  assert(call.costWfxp === 0 && call.remainingWfxp === 29, "Rufen muss kostenlos sein.");
  const callLedger = await db.collection("xpLedgerEvents").doc(call.actionId).get();
  assert(!callLedger.exists, "Kostenlose Buddy-Aktion darf kein WFXP-Ledger-Delta erzeugen.");

  await expectCallableError(
    "performBuddyCareAction",
    userToken,
    { actionType: "clean", requestId: "clean-not-needed" },
    "Aufraeumen darf ausserhalb des messy-Zustands nicht ausgefuehrt werden",
  );

  await db.collection("userAvatars").doc(`${USER_ID}_self_default`).set({ cleanliness: 10 }, { merge: true });
  const messyProjection = await expectAccepted("getBuddyStateProjection", userToken, {});
  assert(messyProjection.buddy.status === "messy", "Niedrige Sauberkeit muss den serverseitigen messy-Zustand ergeben.");
  const clean = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "clean",
    requestId: "clean-1",
  });
  assert(clean.costWfxp === 4 && clean.remainingWfxp === 25, "Aufraeumen muss exakt 4 WFXP abbuchen.");
  assert(clean.buddy.cleanliness === 50 && clean.buddy.status !== "messy", "Aufraeumen muss den chaotischen Zustand serverseitig beheben.");

  await db.collection("userAvatars").doc(`${USER_ID}_self_default`).set({ bond: 10, loyalty: 10 }, { merge: true });
  const awayProjection = await expectAccepted("getBuddyStateProjection", userToken, {});
  assert(awayProjection.buddy.status === "ranAway", "Niedrige Bindung und Loyalitaet muessen ranAway ausloesen.");
  await expectCallableError(
    "performBuddyCareAction",
    userToken,
    { actionType: "call", requestId: "call-while-away" },
    "Verschwundener Buddy darf nur gesucht werden",
  );
  const search = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "search",
    requestId: "search-1",
  });
  assert(search.costWfxp === 0 && search.remainingWfxp === 25, "Rueckholsuche muss kostenlos bleiben.");
  assert(search.buddy.status !== "ranAway", "Rueckholsuche muss Flammi aus ranAway herausfuehren.");
  const searchReplay = await expectAccepted("performBuddyCareAction", userToken, {
    actionType: "search",
    requestId: "search-1",
  });
  assert(searchReplay.idempotent === true && searchReplay.remainingWfxp === 25, "Rueckhol-Replay darf nichts doppelt anwenden.");
  await expectCallableError(
    "performBuddyCareAction",
    userToken,
    { actionType: "search", requestId: "search-not-needed" },
    "Suche darf bei anwesendem Buddy nicht erneut starten",
  );

  await fundWallet(adminToken, OTHER_ID, 20, "buddy_actions_other_funding");
  await expectAccepted("getBuddyStateProjection", otherToken, {});
  await db.collection("userAvatars").doc(`${OTHER_ID}_self_default`).set({
    cleanliness: 100,
    bond: 100,
    mood: 100,
    loyalty: 100,
  }, { merge: true });
  const noEffect = await expectHttpOk("performBuddyCareAction", otherToken, {
    actionType: "care",
    requestId: "care-no-effect",
  });
  assert(noEffect.accepted === false && noEffect.rejectionReason === "buddy-action-no-effect", "Wirkungslose Pflege muss ohne Buchung abgelehnt werden.");
  const otherWallet = await db.collection("xpWallets").doc(OTHER_ID).get();
  assert(otherWallet.data().balance === 20 && Number(otherWallet.data().lifetimeSpent || 0) === 0, "Wirkungslose Aktion darf keine WFXP abbuchen.");
  const noEffectAction = await db.collection("buddyCareActions").doc(actionId(OTHER_ID, null, "care", "care-no-effect")).get();
  assert(!noEffectAction.exists, "Wirkungslose Aktion darf kein completed Action-Dokument erzeugen.");

  const family = await expectAccepted("createGuardianFamilyAccount", userToken, { displayName: "Buddy Action Family" });
  const child = await expectAccepted("createChildProfile", userToken, {
    familyAccountId: family.familyAccountId,
    nickname: "Buddy Kid",
    age: 10,
    permissions: { shop: true },
  });
  await expectAccepted("getBuddyStateProjection", userToken, { childProfileId: child.childProfileId });
  await expectCallableError(
    "performBuddyCareAction",
    userToken,
    { childProfileId: child.childProfileId, actionType: "care", requestId: "child-without-consent" },
    "Child Buddy-Aktion braucht aktive Shop-Freigabe und Consent",
  );
  await expectAccepted("recordParentalConsent", userToken, {
    childProfileId: child.childProfileId,
    consentType: "shop",
  });
  await expectAccepted("updateChildPermissions", userToken, {
    childProfileId: child.childProfileId,
    permissions: { shop: true },
  });
  await fundWallet(adminToken, USER_ID, 20, "buddy_actions_child_funding", child.childProfileId);
  const childCare = await expectAccepted("performBuddyCareAction", userToken, {
    childProfileId: child.childProfileId,
    actionType: "care",
    requestId: "child-care-1",
  });
  assert(childCare.remainingWfxp === 12, "Child Buddy-Pflege muss das Child Wallet exakt mit 8 WFXP belasten.");
  assert(childCare.buddy.points === 12, "Child Buddy-Projektion muss das Child Wallet anzeigen.");
  await expectCallableError(
    "getBuddyStateProjection",
    otherToken,
    { childProfileId: child.childProfileId },
    "Fremdnutzer darf Child Buddy-Projektion nicht lesen",
  );

  const userLegacyDoc = await db.collection("users").doc(USER_ID).get();
  const childLegacyDoc = await db.collection("users").doc(child.childProfileId).get();
  assert(!userLegacyDoc.exists && !childLegacyDoc.exists, "Buddy-Actions duerfen keine legacy users.points- oder users.avatar-Dokumente anlegen.");

  console.log("WellFit Beta 1 Buddy Actions Emulator Test erfolgreich.");
  await admin.auth().deleteUser(ADMIN_ID);
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(OTHER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
