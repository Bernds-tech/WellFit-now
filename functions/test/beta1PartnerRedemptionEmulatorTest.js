const { db, admin, assert, createAuthUser, callCallable, getCallableResult, describeCall, clearCollection, resetBeta1Collections } = require("./beta1RuntimeFixtures");

const ADMIN_ID = "partner-admin";
const USER_ID = "partner-user";
const OTHER_ID = "partner-other";
const OPERATOR_ID = "partner-operator";
const FOREIGN_OPERATOR_ID = "partner-foreign-operator";

async function expectOk(name, token, data) {
  const response = await callCallable(name, token, data);
  assert(response.ok, `${name} muss erfolgreich sein: ${describeCall(response)}`);
  return getCallableResult(response);
}

async function expectError(name, token, data) {
  const response = await callCallable(name, token, data);
  assert(!response.ok, `${name} muss abgelehnt werden: ${describeCall(response)}`);
}

async function stableRateWindowStart(minimumRemainingMs = 8000) {
  const remaining = 60_000 - (Date.now() % 60_000);
  if (remaining < minimumRemainingMs) await new Promise((resolve) => setTimeout(resolve, remaining + 150));
  return Math.floor(Date.now() / 60_000) * 60_000;
}

async function run() {
  await resetBeta1Collections();
  const [adminToken, userToken, otherToken, operatorToken, foreignOperatorToken] = await Promise.all([
    createAuthUser(ADMIN_ID, true), createAuthUser(USER_ID, false), createAuthUser(OTHER_ID, false),
    createAuthUser(OPERATOR_ID, false), createAuthUser(FOREIGN_OPERATOR_ID, false),
  ]);
  const validFrom = new Date(Date.now() - 60_000).toISOString();
  const expiresAt = new Date(Date.now() + 3_600_000).toISOString();
  await expectError("adminUpsertPartner", userToken, { partnerId: "cafe", displayName: "Cafe" });
  await expectOk("adminUpsertPartner", adminToken, { partnerId: "cafe", displayName: "Beta Cafe" });
  await expectOk("adminUpsertPartner", adminToken, { partnerId: "gym", displayName: "Beta Gym" });
  await expectOk("adminUpsertPartnerOperator", adminToken, { partnerId: "cafe", operatorUserId: OPERATOR_ID });
  await expectOk("adminUpsertPartnerOperator", adminToken, { partnerId: "gym", operatorUserId: FOREIGN_OPERATOR_ID });
  await expectOk("adminUpsertPartnerOffer", adminToken, {
    offerId: "drink", partnerId: "cafe", title: "Getraenk", costWfxp: 25,
    remainingInventory: 2, validFrom, expiresAt,
  });
  await db.collection("xpWallets").doc(USER_ID).set({ ownerUserId: USER_ID, userId: USER_ID, balance: 100, lifetimeEarned: 100, lifetimeSpent: 0 });
  await db.collection("xpWallets").doc(OTHER_ID).set({ ownerUserId: OTHER_ID, userId: OTHER_ID, balance: 10, lifetimeEarned: 10, lifetimeSpent: 0 });

  const offers = await expectOk("listPartnerOffers", userToken, {});
  assert(offers.offers.length === 1 && offers.offers[0].offerId === "drink", "Aktives Angebot muss sichtbar sein.");
  const claim = await expectOk("claimPartnerOffer", userToken, { offerId: "drink", requestId: "request-1" });
  assert(claim.accepted && !claim.idempotent && claim.remainingWfxp === 75, "Erste Einloesung muss exakt einmal abbuchen.");
  const replay = await expectOk("claimPartnerOffer", userToken, { offerId: "drink", requestId: "request-1" });
  assert(replay.idempotent && replay.remainingWfxp === 75, "Replay darf nicht doppelt abbuchen.");
  assert((await db.collection("xpWallets").doc(USER_ID).get()).data().balance === 75, "Wallet muss 75 WFXP enthalten.");
  assert((await db.collection("partnerOffers").doc("drink").get()).data().remainingInventory === 1, "Bestand darf nur einmal sinken.");
  await expectError("claimPartnerOffer", otherToken, { offerId: "drink", requestId: "other-request" });

  const presentation = await expectOk("createPartnerRedemptionPresentation", userToken, { redemptionId: claim.redemptionId });
  await expectError("confirmPartnerRedemption", foreignOperatorToken, { redemptionId: claim.redemptionId, presentationToken: presentation.presentationToken });
  await expectError("confirmPartnerRedemption", operatorToken, { redemptionId: claim.redemptionId, presentationToken: "wrong-token" });
  const confirmed = await expectOk("confirmPartnerRedemption", operatorToken, { redemptionId: claim.redemptionId, presentationToken: presentation.presentationToken });
  assert(confirmed.status === "redeemed", "Admin muss Ausgabe bestaetigen koennen.");
  await expectError("confirmPartnerRedemption", operatorToken, { redemptionId: claim.redemptionId, presentationToken: presentation.presentationToken });

  await expectOk("adminUpsertPartnerOffer", adminToken, {
    offerId: "expired", partnerId: "cafe", title: "Abgelaufen", costWfxp: 1, remainingInventory: 1,
    validFrom: new Date(Date.now() - 120_000).toISOString(), expiresAt: new Date(Date.now() - 60_000).toISOString(),
  });
  await expectError("claimPartnerOffer", userToken, { offerId: "expired", requestId: "expired-request" });
  await expectOk("adminUpsertPartnerOffer", adminToken, {
    offerId: "cancel-me", partnerId: "cafe", title: "Stornierbar", costWfxp: 20, remainingInventory: 1,
    validFrom, expiresAt,
  });
  await db.collection("xpWallets").doc(OTHER_ID).update({ balance: 100, lifetimeEarned: 100 });
  const cancellable = await expectOk("claimPartnerOffer", otherToken, { offerId: "cancel-me", requestId: "cancel-request" });
  assert(cancellable.remainingWfxp === 80, "Einloesung muss vor Storno abbuchen.");
  const cancelled = await expectOk("cancelPartnerRedemption", otherToken, { redemptionId: cancellable.redemptionId });
  assert(cancelled.status === "cancelled" && cancelled.remainingWfxp === 100, "Storno muss WFXP erstatten.");
  const cancelReplay = await expectOk("cancelPartnerRedemption", otherToken, { redemptionId: cancellable.redemptionId });
  assert(cancelReplay.idempotent, "Storno-Replay muss idempotent sein.");
  await expectError("cancelPartnerRedemption", otherToken, { redemptionId: claim.redemptionId });
  await expectOk("adminUpsertPartnerOffer", adminToken, {
    offerId: "expired-proof", partnerId: "cafe", title: "Proof Ablauf", costWfxp: 5, remainingInventory: 1,
    validFrom, expiresAt,
  });
  const proofClaim = await expectOk("claimPartnerOffer", otherToken, { offerId: "expired-proof", requestId: "proof-request" });
  const expiredPresentation = await expectOk("createPartnerRedemptionPresentation", otherToken, { redemptionId: proofClaim.redemptionId });
  await db.collection("partnerRedemptionChallenges").doc(proofClaim.redemptionId).update({ expiresAt: new Date(Date.now() - 1000).toISOString() });
  await expectError("confirmPartnerRedemption", operatorToken, { redemptionId: proofClaim.redemptionId, presentationToken: expiredPresentation.presentationToken });
  const freshPresentation = await expectOk("createPartnerRedemptionPresentation", otherToken, { redemptionId: proofClaim.redemptionId });
  await expectOk("adminUpsertPartnerOperator", adminToken, { partnerId: "cafe", operatorUserId: OPERATOR_ID, status: "revoked" });
  await expectError("confirmPartnerRedemption", operatorToken, { redemptionId: proofClaim.redemptionId, presentationToken: freshPresentation.presentationToken });

  const confirmWindowStart = await stableRateWindowStart();
  await expectError("confirmPartnerRedemption", operatorToken, { redemptionId: proofClaim.redemptionId, presentationToken: "wrong-token" });
  const existingConfirmRates = await db.collection("partnerOperationRateLimits").where("subjectUserId", "==", OPERATOR_ID).get();
  const existingConfirmRate = existingConfirmRates.docs.find((doc) => doc.data().action === "partner-redemption-confirm"
    && doc.data().windowStart === new Date(confirmWindowStart).toISOString());
  assert(existingConfirmRate, "Operator-Zaehler muss vor Paralleltest existieren.");
  await existingConfirmRate.ref.update({ count: 11 });
  const concurrentConfirmAttempts = await Promise.all(Array.from({ length: 2 }, () =>
    callCallable("confirmPartnerRedemption", operatorToken, { redemptionId: proofClaim.redemptionId, presentationToken: "wrong-token" })));
  assert(concurrentConfirmAttempts.every((response) => !response.ok), "Parallele ungueltige Bestaetigungen muessen abgelehnt werden.");
  const confirmRateSnapshot = await db.collection("partnerOperationRateLimits").where("subjectUserId", "==", OPERATOR_ID).get();
  const confirmRateDocs = confirmRateSnapshot.docs.filter((doc) => doc.data().action === "partner-redemption-confirm"
    && doc.data().windowStart === new Date(confirmWindowStart).toISOString());
  assert(confirmRateDocs.length === 1 && confirmRateDocs[0].data().count === 12, "Operator-Limit muss auch parallel exakt bei 12 stoppen.");
  await expectOk("adminUpsertPartnerOperator", adminToken, { partnerId: "cafe", operatorUserId: OPERATOR_ID });
  await expectError("confirmPartnerRedemption", operatorToken, { redemptionId: proofClaim.redemptionId, presentationToken: freshPresentation.presentationToken });

  const issueWindowStart = await stableRateWindowStart();
  await expectOk("createPartnerRedemptionPresentation", otherToken, { redemptionId: proofClaim.redemptionId });
  const existingIssueRates = await db.collection("partnerOperationRateLimits").where("subjectUserId", "==", OTHER_ID).get();
  const existingIssueRate = existingIssueRates.docs.find((doc) => doc.data().action === "partner-presentation-issue"
    && doc.data().windowStart === new Date(issueWindowStart).toISOString());
  assert(existingIssueRate, "Ausgabe-Zaehler muss vor Paralleltest existieren.");
  await existingIssueRate.ref.update({ count: 4 });
  const concurrentIssueAttempts = await Promise.all(Array.from({ length: 2 }, () =>
    callCallable("createPartnerRedemptionPresentation", otherToken, { redemptionId: proofClaim.redemptionId })));
  assert(concurrentIssueAttempts.filter((response) => response.ok).length === 1, "Ausgabe-Limit muss parallel nur einen weiteren Nachweis bis zum Maximum zulassen.");
  const issueRateSnapshot = await db.collection("partnerOperationRateLimits").where("subjectUserId", "==", OTHER_ID).get();
  const issueRateDocs = issueRateSnapshot.docs.filter((doc) => doc.data().action === "partner-presentation-issue"
    && doc.data().windowStart === new Date(issueWindowStart).toISOString());
  assert(issueRateDocs.length === 1 && issueRateDocs[0].data().count === 5, "Nutzer-Limit muss auch parallel exakt bei 5 stoppen.");
  await expectError("createPartnerRedemptionPresentation", otherToken, { redemptionId: proofClaim.redemptionId });

  await expectOk("adminUpsertPartnerOffer", adminToken, {
    offerId: "active-cap", partnerId: "cafe", title: "Aktivlimit", costWfxp: 5, remainingInventory: 1,
    validFrom, expiresAt,
  });
  const cappedClaim = await expectOk("claimPartnerOffer", userToken, { offerId: "active-cap", requestId: "cap-request" });
  const future = new Date(Date.now() + 60_000).toISOString();
  await db.collection("partnerChallengeActivity").doc(USER_ID).set({
    ownerUserId: USER_ID, userId: USER_ID,
    activePresentations: { first: future, second: future, third: future },
  });
  await expectError("createPartnerRedemptionPresentation", userToken, { redemptionId: cappedClaim.redemptionId });

  const outcomeSnapshot = await db.collection("partnerOperationOutcomes").where("subjectUserId", "==", OPERATOR_ID).get();
  assert(!outcomeSnapshot.empty, "Datenschutzarme Ergebniszaehler muessen fuer den Betrieb vorhanden sein.");
  outcomeSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    assert(!Object.prototype.hasOwnProperty.call(data, "ipAddress") && !Object.prototype.hasOwnProperty.call(data, "location"), "Betriebszaehler duerfen keine IP oder Position speichern.");
  });

  await Promise.all([
    clearCollection("partnerOperationRateLimits"),
    clearCollection("partnerOperationOutcomes"),
    clearCollection("partnerRedemptionChallenges"),
    clearCollection("partnerChallengeActivity"),
  ]);
  const expired = new Date(Date.now() - 60_000).toISOString();
  const futureRetention = new Date(Date.now() + 3_600_000).toISOString();
  await Promise.all([
    db.collection("partnerOperationRateLimits").doc("expired-rate").set({ subjectUserId: USER_ID, expiresAt: expired }),
    db.collection("partnerOperationOutcomes").doc("expired-outcome").set({ subjectUserId: USER_ID, expiresAt: expired }),
    db.collection("partnerRedemptionChallenges").doc("expired-challenge").set({ ownerUserId: USER_ID, expiresAt: expired, status: "active" }),
    db.collection("partnerOperationRateLimits").doc("live-rate").set({ subjectUserId: USER_ID, expiresAt: futureRetention }),
    db.collection("partnerOperationOutcomes").doc("live-outcome").set({ subjectUserId: USER_ID, expiresAt: futureRetention }),
    db.collection("partnerRedemptionChallenges").doc("live-challenge").set({ ownerUserId: USER_ID, expiresAt: futureRetention, status: "active" }),
    db.collection("partnerChallengeActivity").doc(USER_ID).set({
      ownerUserId: USER_ID, userId: USER_ID,
      activePresentations: { expired: expired, live: futureRetention },
    }),
  ]);
  await expectError("adminCleanupPartnerOperationalData", userToken, { dryRun: true, limit: 2 });
  const cleanupPreview = await expectOk("adminCleanupPartnerOperationalData", adminToken, { dryRun: true, limit: 2 });
  assert(cleanupPreview.dryRun && cleanupPreview.operationCount === 2 && cleanupPreview.limitReached, "Dry-run muss exakt begrenzt und ohne Mutation planen.");
  assert((await db.collection("partnerOperationRateLimits").doc("expired-rate").get()).exists, "Dry-run darf keine Rate-Daten loeschen.");

  const firstCleanup = await expectOk("adminCleanupPartnerOperationalData", adminToken, { dryRun: false, limit: 2 });
  assert(firstCleanup.operationCount === 2 && firstCleanup.limitReached, "Erster Cleanup muss den globalen Batch-Grenzwert einhalten.");
  const secondCleanup = await expectOk("adminCleanupPartnerOperationalData", adminToken, { dryRun: false, limit: 10 });
  assert(secondCleanup.operationCount === 2 && !secondCleanup.limitReached, "Zweiter Cleanup muss Restdaten und Aktivprojektion bereinigen.");
  const repeatedCleanup = await expectOk("adminCleanupPartnerOperationalData", adminToken, { dryRun: false, limit: 10 });
  assert(repeatedCleanup.operationCount === 0, "Wiederholter Cleanup muss idempotent ohne weitere Mutation enden.");
  assert(!(await db.collection("partnerRedemptionChallenges").doc("expired-challenge").get()).exists, "Abgelaufener Nachweis muss entfernt sein.");
  assert((await db.collection("partnerRedemptionChallenges").doc("live-challenge").get()).exists, "Nicht abgelaufener Nachweis muss erhalten bleiben.");
  const retainedActivity = (await db.collection("partnerChallengeActivity").doc(USER_ID).get()).data();
  assert(retainedActivity.activePresentations.live === futureRetention && !retainedActivity.activePresentations.expired, "Nur abgelaufene Aktivprojektionen duerfen entfernt werden.");
  assert((await db.collection("partnerRedemptions").doc(claim.redemptionId).get()).exists, "Einloesungsautoritaet darf durch Retention nicht geloescht werden.");

  await db.collection("partnerOperationOutcomes").doc("summary-denied").set({
    subjectUserId: OPERATOR_ID,
    action: "partner-redemption-confirm",
    outcome: "denied",
    count: 3,
    expiresAt: futureRetention,
  });
  await expectError("adminGetPartnerOperationsSummary", userToken, { limit: 100 });
  const summary = await expectOk("adminGetPartnerOperationsSummary", adminToken, { limit: 100 });
  assert(summary.privacyMode === "aggregate-no-person-or-proof-data", "Betriebsbericht muss den Aggregat-Datenschutzmodus ausweisen.");
  assert(summary.redemptions.scanned >= 3 && summary.redemptions.partners.some((partner) => partner.partnerId === "cafe"), "Betriebsbericht muss Einloesungen nach Partner aggregieren.");
  assert(summary.outcomes.categories.some((category) => category.key === "partner-redemption-confirm:denied" && category.count === 3), "Betriebsbericht muss grobe Ergebniszaehler summieren.");
  const serializedSummary = JSON.stringify(summary);
  ["ownerUserId", "userId", "operatorUserId", "tokenHash", "presentationToken", "activePresentations"].forEach((forbidden) => {
    assert(!serializedSummary.includes(forbidden), `Betriebsbericht darf ${forbidden} nicht enthalten.`);
  });
  const truncatedSummary = await expectOk("adminGetPartnerOperationsSummary", adminToken, { limit: 1 });
  assert(truncatedSummary.redemptions.scanned === 1 && truncatedSummary.redemptions.truncated, "Begrenzte Betriebsberichte muessen Abschneidung explizit ausweisen.");

  await expectOk("adminUpsertPartner", adminToken, { partnerId: "cafe", displayName: "Beta Cafe", status: "inactive" });
  await expectError("claimPartnerOffer", otherToken, { offerId: "drink", requestId: "inactive-request" });

  await Promise.all([ADMIN_ID, USER_ID, OTHER_ID, OPERATOR_ID, FOREIGN_OPERATOR_ID].map((uid) => admin.auth().deleteUser(uid)));
  console.log("WellFit Beta 1 Partner Redemption Emulator Test erfolgreich.");
}

run().catch((error) => { console.error(error); process.exit(1); });
