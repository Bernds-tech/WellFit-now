const {
  BETA1_INTERNAL_CURRENCY,
  requireAuth,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  updatedTimestamp,
  assertGuardianCanUseChild,
  requireChildConsent,
  requireChildPermission,
  writeAudit,
} = require("./beta1Runtime");
const { applyXpDelta, readWallet } = require("./beta1XpLedger");

function publicShopItem(doc) {
  const data = doc.data() || {};
  return { shopItemId: doc.id, itemDefinitionId: data.itemDefinitionId, priceWfxp: data.priceWfxp || 0, category: data.category, childAllowed: data.childAllowed === true, status: data.status };
}

function registerBeta1ShopInventory(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.listShopItems = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const snapshot = await db.collection("shopItems").where("status", "==", "published").limit(50).get();
    return { accepted: true, currency: BETA1_INTERNAL_CURRENCY, noRealMoneyShop: true, items: snapshot.docs.map(publicShopItem) };
  });

  exportsTarget.createShopPurchaseIntent = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const shopItemId = requiredString(data.shopItemId, "shopItemId", HttpsError);
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "shop", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "shop", HttpsError);
    }
    const item = await db.collection("shopItems").doc(shopItemId).get();
    if (!item.exists || (item.data() || {}).status !== "published") throw new HttpsError("not-found", "Shop Item nicht verfuegbar.");
    if (childProfileId && (item.data() || {}).childAllowed !== true) throw new HttpsError("failed-precondition", "Shop Item ist nicht fuer Child Profiles freigegeben.");
    const priceWfxp = normalizedPositiveInteger((item.data() || {}).priceWfxp, 0, 100000);
    const intentRef = db.collection("shopPurchaseIntents").doc();
    await intentRef.set({ intentId: intentRef.id, ownerUserId: userId, userId, childProfileId: childProfileId || null, shopItemId, itemDefinitionId: item.data().itemDefinitionId || shopItemId, quotedPriceWfxp: priceWfxp, currency: BETA1_INTERNAL_CURRENCY, status: "pending", realMoney: false, iap: false, ...serverTimestamps() });
    return { accepted: true, intentId: intentRef.id, quotedPriceWfxp: priceWfxp, currency: BETA1_INTERNAL_CURRENCY, purchaseAuthorized: false };
  });

  exportsTarget.completeXpShopPurchase = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const intentId = requiredString((request.data || {}).intentId, "intentId", HttpsError);
    const intentRef = db.collection("shopPurchaseIntents").doc(intentId);
    const intent = await intentRef.get();
    if (!intent.exists || (intent.data() || {}).ownerUserId !== userId) throw new HttpsError("permission-denied", "Purchase Intent gehoert nicht diesem Nutzer.");
    const intentData = intent.data() || {};
    if (intentData.status !== "pending") throw new HttpsError("failed-precondition", "Purchase Intent ist nicht pending.");
    const price = normalizedPositiveInteger(intentData.quotedPriceWfxp, 0, 100000);
    const wallet = await readWallet(db, userId, intentData.childProfileId || null);
    if ((wallet.balance || 0) < price) {
      await intentRef.set({ status: "rejected", rejectionReason: "insufficient-wfxp-balance", ...updatedTimestamp() }, { merge: true });
      return { accepted: false, rejectionReason: "insufficient-wfxp-balance", purchaseAuthorized: false, inventoryAuthorized: false };
    }
    const ledger = await applyXpDelta(db, { ownerUserId: userId, childProfileId: intentData.childProfileId || null, delta: -price, reason: "xp-shop-purchase", sourceType: "shopPurchaseIntent", sourceId: intentId, actorUserId: "server", idempotencyKey: `shop_purchase_${intentId}` });
    const eventRef = db.collection("shopPurchaseEvents").doc(intentId);
    const inventoryRef = db.collection("userInventory").doc(`${userId}_${intentData.itemDefinitionId}_${intentId}`);
    await eventRef.set({ eventId: eventRef.id, intentId, ownerUserId: userId, userId, childProfileId: intentData.childProfileId || null, shopItemId: intentData.shopItemId, itemDefinitionId: intentData.itemDefinitionId, xpLedgerEventId: ledger.ledgerEventId, result: "completed", currency: BETA1_INTERNAL_CURRENCY, realMoney: false, ...serverTimestamps() });
    await inventoryRef.set({ inventoryItemId: inventoryRef.id, ownerUserId: userId, userId, childProfileId: intentData.childProfileId || null, itemDefinitionId: intentData.itemDefinitionId, itemId: intentData.itemDefinitionId, sourceEventId: eventRef.id, equipped: false, serverValidationStatus: "server-granted", ...serverTimestamps() });
    await intentRef.set({ status: "completed", shopPurchaseEventId: eventRef.id, inventoryItemId: inventoryRef.id, xpLedgerEventId: ledger.ledgerEventId, ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId: "server", actionType: "shop-purchase-completed", targetType: "shopPurchaseEvent", targetId: eventRef.id, ownerUserId: userId, childProfileId: intentData.childProfileId || null, metadata: { priceWfxp: price, inventoryItemId: inventoryRef.id } });
    return { accepted: true, eventId: eventRef.id, inventoryItemId: inventoryRef.id, xpLedgerEventId: ledger.ledgerEventId, purchaseAuthorized: true, inventoryAuthorized: true, tokenAuthorized: false };
  });

  exportsTarget.listInventory = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const childProfileId = optionalString((request.data || {}).childProfileId, 160);
    if (childProfileId) await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    let query = db.collection("userInventory").where("ownerUserId", "==", userId).limit(80);
    if (childProfileId) query = query.where("childProfileId", "==", childProfileId);
    const snapshot = await query.get();
    return { accepted: true, items: snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) })) };
  });

  exportsTarget.equipInventoryItem = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const inventoryItemId = requiredString((request.data || {}).inventoryItemId, "inventoryItemId", HttpsError);
    const inventoryRef = db.collection("userInventory").doc(inventoryItemId);
    const inventory = await inventoryRef.get();
    if (!inventory.exists || (inventory.data() || {}).ownerUserId !== userId) throw new HttpsError("permission-denied", "Inventory Item gehoert nicht diesem Nutzer.");
    await inventoryRef.set({ equipped: true, ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId: "server", actionType: "inventory-equipped", targetType: "userInventory", targetId: inventoryItemId, ownerUserId: userId, childProfileId: (inventory.data() || {}).childProfileId || null });
    return { accepted: true, inventoryItemId, equipped: true };
  });
}

module.exports = { registerBeta1ShopInventory };
