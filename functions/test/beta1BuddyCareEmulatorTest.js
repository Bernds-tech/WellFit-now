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

async function run() {
  console.log("WellFit Beta 1 Buddy Care Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const adminToken = await createAuthUser("buddy-care-admin", true);
  const userToken = await createAuthUser("buddy-care-user", false);
  const otherToken = await createAuthUser("buddy-care-other", false);

  await expectCallableError(
    "adminEnsureBuddyFoodItem",
    userToken,
    {},
    "Nicht-Admin darf Buddy-Futterkatalog nicht anlegen",
  );
  const ensured = await expectOk("adminEnsureBuddyFoodItem", adminToken, {});
  assert(ensured.item.shopItemId === "buddy_food_basic", "Kanonisches Buddy-Futter muss angelegt werden.");
  assert(ensured.item.priceWfxp === 5, "Buddy-Futter muss 5 WFXP kosten.");
  assert(ensured.item.noRealMoney === true, "Buddy-Futter darf kein Echtgelditem sein.");
  assert(ensured.item.tokenAuthorized === false, "Buddy-Futter darf keine Token autorisieren.");

  const shop = await expectOk("listShopItems", userToken, {});
  const food = shop.items.find((item) => item.shopItemId === "buddy_food_basic");
  assert(food, "Buddy-Futter muss im publizierten Shop sichtbar sein.");
  assert(food.consumable === true && food.effectType === "buddy-hunger", "Buddy-Futter muss als Hunger-Consumable markiert sein.");
  assert(shop.noRealMoneyShop === true && shop.cashoutAllowed === false, "Shop muss WFXP-only bleiben.");

  const initialCare = await expectOk("getBuddyCareProjection", userToken, {});
  assert(initialCare.buddy.hunger === 70, `Server-Buddy muss mit Hunger 70 initialisieren: ${JSON.stringify(initialCare)}`);
  assert(initialCare.balanceAffected === false, "Buddy-Care Read darf keine Wallet verändern.");
  const secondCareRead = await expectOk("getBuddyCareProjection", userToken, {});
  assert(secondCareRead.buddy.initialized === true, "Zweiter Buddy-Care Read muss vorhandene Serverprojektion nutzen.");

  await expectOk("adminAdjustXp", adminToken, {
    ownerUserId: "buddy-care-user",
    delta: 20,
    reason: "buddy-care-emulator-funding",
    idempotencyKey: "buddy_care_funding",
  });
  const walletBefore = await expectOk("getXpWallet", userToken, {});
  assert(walletBefore.wallet.balance === 20, "Buddy-Care Wallet muss vor Kauf 20 WFXP enthalten.");

  const intent = await expectOk("createShopPurchaseIntent", userToken, { shopItemId: "buddy_food_basic" });
  assert(intent.purchaseAuthorized === false, "Purchase Intent darf Kauf noch nicht autorisieren.");
  assert(intent.quotedPriceWfxp === 5, "Purchase Intent muss Serverpreis 5 WFXP verwenden.");

  const purchase = await expectOk("completeXpShopPurchase", userToken, { intentId: intent.intentId });
  assert(purchase.purchaseAuthorized === true, "Serverkauf muss autorisiert werden.");
  assert(purchase.inventoryAuthorized === true, "Serverkauf muss Inventar autorisieren.");
  assert(purchase.remainingWfxp === 15, "Serverkauf muss genau 5 WFXP abbuchen.");
  assert(purchase.tokenAuthorized === false && purchase.cashoutAllowed === false, "Kauf bleibt ohne Token/Cashout.");
  await expectCallableError(
    "completeXpShopPurchase",
    userToken,
    { intentId: intent.intentId },
    "Bereits abgeschlossener Purchase Intent darf nicht erneut ausgeführt werden",
  );

  const walletAfterPurchase = await expectOk("getXpWallet", userToken, {});
  assert(walletAfterPurchase.wallet.balance === 15, "Wallet muss nach Buddy-Futterkauf 15 WFXP enthalten.");
  const purchaseLedger = await db.collection("xpLedgerEvents").doc(purchase.xpLedgerEventId).get();
  assert(purchaseLedger.exists, "Atomarer Kauf muss XP Ledger Event schreiben.");
  assert(purchaseLedger.data().delta === -5, "Buddy-Futterkauf muss Ledger Delta -5 schreiben.");
  assert(purchaseLedger.data().cashoutAllowed === false, "Kauf-Ledger darf kein Cashout erlauben.");

  const inventoryBeforeConsume = await db.collection("userInventory").doc(purchase.inventoryItemId).get();
  assert(inventoryBeforeConsume.exists, "Atomarer Kauf muss Inventory Item schreiben.");
  assert(inventoryBeforeConsume.data().status === "available", "Buddy-Futter muss vor Verbrauch verfügbar sein.");
  assert(inventoryBeforeConsume.data().quantity === 1, "Buddy-Futter muss Menge 1 haben.");

  await expectCallableError(
    "consumeBuddyFoodItem",
    otherToken,
    { inventoryItemId: purchase.inventoryItemId },
    "Fremder Nutzer darf Buddy-Futter nicht konsumieren",
  );

  const consumed = await expectOk("consumeBuddyFoodItem", userToken, { inventoryItemId: purchase.inventoryItemId });
  assert(consumed.accepted === true && consumed.idempotent === false, "Erster Buddy-Futterverbrauch muss ausgeführt werden.");
  assert(consumed.buddy.hunger === 80, "Buddy-Hunger muss serverseitig von 70 auf 80 steigen.");
  assert(consumed.tokenAuthorized === false && consumed.cashoutAllowed === false, "Buddy-Futterverbrauch bleibt ohne Token/Cashout.");

  const duplicateConsume = await expectOk("consumeBuddyFoodItem", userToken, { inventoryItemId: purchase.inventoryItemId });
  assert(duplicateConsume.accepted === true && duplicateConsume.idempotent === true, "Doppelter Verbrauch muss idempotent sein.");
  assert(duplicateConsume.buddy.hunger === 80, "Doppelter Verbrauch darf Hunger nicht nochmals erhöhen.");

  const inventoryAfterConsume = await db.collection("userInventory").doc(purchase.inventoryItemId).get();
  assert(inventoryAfterConsume.data().status === "consumed", "Verbrauchtes Futter muss consumed sein.");
  assert(inventoryAfterConsume.data().quantity === 0, "Verbrauchtes Futter muss Menge 0 haben.");
  const careAfterConsume = await expectOk("getBuddyCareProjection", userToken, {});
  assert(careAfterConsume.buddy.hunger === 80, "Buddy-Care Projektion muss Hunger 80 liefern.");
  const walletAfterConsume = await expectOk("getXpWallet", userToken, {});
  assert(walletAfterConsume.wallet.balance === 15, "Futterverbrauch darf keine zweite WFXP-Abbuchung erzeugen.");

  const emptyIntent = await expectOk("createShopPurchaseIntent", otherToken, { shopItemId: "buddy_food_basic" });
  const insufficient = await expectOk("completeXpShopPurchase", otherToken, { intentId: emptyIntent.intentId });
  assert(insufficient.accepted === false, "Kauf ohne WFXP muss fachlich abgelehnt werden.");
  assert(insufficient.rejectionReason === "insufficient-wfxp-balance", "Ablehnung muss insufficient-wfxp-balance liefern.");
  const otherInventory = await db.collection("userInventory").where("ownerUserId", "==", "buddy-care-other").get();
  assert(otherInventory.empty, "Abgelehnter Kauf darf kein Inventory Item erzeugen.");

  const purchaseAudit = await db.collection("auditEvents").doc(`shop_purchase_${encodeURIComponent(intent.intentId)}`).get();
  assert(purchaseAudit.exists, "Atomarer Shopkauf muss Audit Event im selben Commit schreiben.");
  const feedAudit = await db.collection("auditEvents").doc(`buddy_feed_${encodeURIComponent(purchase.inventoryItemId)}`).get();
  assert(feedAudit.exists, "Buddy-Futterverbrauch muss Audit Event schreiben.");

  console.log("WellFit Beta 1 Buddy Care Emulator Test erfolgreich.");
  await admin.auth().deleteUser("buddy-care-admin");
  await admin.auth().deleteUser("buddy-care-user");
  await admin.auth().deleteUser("buddy-care-other");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
