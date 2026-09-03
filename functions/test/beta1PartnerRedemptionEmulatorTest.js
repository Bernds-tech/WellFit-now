const { db, admin, assert, createAuthUser, callCallable, getCallableResult, describeCall, resetBeta1Collections } = require("./beta1RuntimeFixtures");

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
  await expectOk("adminUpsertPartner", adminToken, { partnerId: "cafe", displayName: "Beta Cafe", status: "inactive" });
  await expectError("claimPartnerOffer", otherToken, { offerId: "drink", requestId: "inactive-request" });

  await Promise.all([ADMIN_ID, USER_ID, OTHER_ID, OPERATOR_ID, FOREIGN_OPERATOR_ID].map((uid) => admin.auth().deleteUser(uid)));
  console.log("WellFit Beta 1 Partner Redemption Emulator Test erfolgreich.");
}

run().catch((error) => { console.error(error); process.exit(1); });
