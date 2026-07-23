const { FieldValue } = require("firebase-admin/firestore");
const {
  BETA1_INTERNAL_CURRENCY,
  requireAuth,
  requireAdmin,
  requiredString,
  optionalString,
  normalizedPositiveInteger,
  serverTimestamps,
  updatedTimestamp,
  scopedOwnerFields,
  assertGuardianCanUseChild,
  requireChildConsent,
  requireChildPermission,
  writeAudit,
  getWalletRef,
} = require("./beta1Runtime");

const BUDDY_FOOD_SHOP_ITEM_ID = "buddy_food_basic";
const BUDDY_FOOD_ITEM_DEFINITION_ID = "buddy_food_basic";
const BUDDY_FOOD_PRICE_WFXP = 5;
const BUDDY_FOOD_HUNGER_RESTORE = 10;
const DEFAULT_BUDDY_HUNGER = 70;
const DEFAULT_BUDDY_ENERGY = 100;
const DEFAULT_BUDDY_MOOD = 100;

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function buddyAvatarId(ownerUserId, childProfileId) {
  return `${safeDocIdPart(ownerUserId)}_${safeDocIdPart(childProfileId || "self")}_default`;
}

function publicShopItem(doc) {
  const data = doc.data() || {};
  return {
    shopItemId: doc.id,
    title: optionalString(data.title, 120) || doc.id,
    itemDefinitionId: data.itemDefinitionId,
    priceWfxp: data.priceWfxp || 0,
    category: data.category,
    consumable: data.consumable === true,
    effectType: optionalString(data.effectType, 80),
    effectAmount: normalizedPositiveInteger(data.effectAmount, 0, 100),
    childAllowed: data.childAllowed === true,
    status: data.status,
    noRealMoney: data.realMoney !== true,
    tokenAuthorized: false,
  };
}

function publicBuddyCareProjection(avatarId, data, initialized) {
  return {
    userAvatarId: avatarId,
    ownerUserId: optionalString(data.ownerUserId, 180),
    childProfileId: optionalString(data.childProfileId, 180),
    buddyId: optionalString(data.buddyId, 80) || "default",
    hunger: clamp(data.hunger, 0, 100, DEFAULT_BUDDY_HUNGER),
    energy: clamp(data.energy, 0, 100, DEFAULT_BUDDY_ENERGY),
    mood: clamp(data.mood, 0, 100, DEFAULT_BUDDY_MOOD),
    level: Math.max(1, Math.floor(clamp(data.level, 1, 1000, 1))),
    xpTotal: Math.max(0, Math.floor(clamp(data.xpTotal, 0, Number.MAX_SAFE_INTEGER, 0))),
    lastFedAt: optionalString(data.lastFedAt, 80),
    initialized,
    serverValidationStatus: optionalString(data.serverValidationStatus, 120) || "server-projected",
  };
}

function defaultBuddyCareDocument(ownerUserId, childProfileId) {
  return {
    userAvatarId: buddyAvatarId(ownerUserId, childProfileId),
    ...scopedOwnerFields(ownerUserId, childProfileId),
    buddyId: "default",
    equippedItemIds: [],
    level: 1,
    xpTotal: 0,
    hunger: DEFAULT_BUDDY_HUNGER,
    energy: DEFAULT_BUDDY_ENERGY,
    mood: DEFAULT_BUDDY_MOOD,
    lastFedAt: null,
    serverValidationStatus: "server-projected",
    ...serverTimestamps(),
  };
}

function purchaseAuditBase({ refId, actionType, targetType, targetId, userId, childProfileId, metadata }) {
  return {
    actorUserId: userId,
    actionType,
    targetType,
    targetId,
    reason: "beta1-server-authorized",
    ownerUserId: userId,
    userId,
    childProfileId: childProfileId || null,
    metadata: metadata || {},
    source: "beta1-runtime",
    ...serverTimestamps(),
    refId,
  };
}

function registerBeta1ShopInventory(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.adminEnsureBuddyFoodItem = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const itemDefinitionRef = db.collection("itemDefinitions").doc(BUDDY_FOOD_ITEM_DEFINITION_ID);
    const shopItemRef = db.collection("shopItems").doc(BUDDY_FOOD_SHOP_ITEM_ID);
    const definition = {
      itemDefinitionId: BUDDY_FOOD_ITEM_DEFINITION_ID,
      title: "Flammi Energie-Snack",
      category: "buddy-care",
      rarity: "common",
      consumable: true,
      effectType: "buddy-hunger",
      effectAmount: BUDDY_FOOD_HUNGER_RESTORE,
      childAllowed: true,
      status: "published",
      realMoney: false,
      tokenized: false,
      ...updatedTimestamp(),
    };
    const shopItem = {
      shopItemId: BUDDY_FOOD_SHOP_ITEM_ID,
      title: definition.title,
      itemDefinitionId: BUDDY_FOOD_ITEM_DEFINITION_ID,
      priceWfxp: BUDDY_FOOD_PRICE_WFXP,
      category: definition.category,
      consumable: true,
      effectType: definition.effectType,
      effectAmount: definition.effectAmount,
      childAllowed: true,
      status: "published",
      realMoney: false,
      iap: false,
      tokenized: false,
      ...updatedTimestamp(),
    };
    await Promise.all([
      itemDefinitionRef.set({ ...definition, createdAt: FieldValue.serverTimestamp() }, { merge: true }),
      shopItemRef.set({ ...shopItem, createdAt: FieldValue.serverTimestamp() }, { merge: true }),
    ]);
    await writeAudit(db, {
      actorUserId,
      actionType: "buddy-food-catalog-ensured",
      targetType: "shopItem",
      targetId: shopItemRef.id,
      metadata: { priceWfxp: BUDDY_FOOD_PRICE_WFXP, effectAmount: BUDDY_FOOD_HUNGER_RESTORE },
    });
    return {
      accepted: true,
      item: {
        ...shopItem,
        currency: BETA1_INTERNAL_CURRENCY,
        noRealMoney: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
      },
    };
  });

  exportsTarget.listShopItems = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const snapshot = await db.collection("shopItems").where("status", "==", "published").limit(50).get();
    return {
      accepted: true,
      currency: BETA1_INTERNAL_CURRENCY,
      noRealMoneyShop: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      items: snapshot.docs.map(publicShopItem),
    };
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
    const itemData = item.data() || {};
    if (!item.exists || itemData.status !== "published") {
      throw new HttpsError("not-found", "Shop Item nicht verfuegbar.");
    }
    if (itemData.realMoney === true || itemData.tokenized === true) {
      throw new HttpsError("failed-precondition", "Beta-1 Shop erlaubt nur interne WFXP Items.");
    }
    if (childProfileId && itemData.childAllowed !== true) {
      throw new HttpsError("failed-precondition", "Shop Item ist nicht fuer Child Profiles freigegeben.");
    }
    const priceWfxp = normalizedPositiveInteger(itemData.priceWfxp, 0, 100000);
    if (priceWfxp <= 0) throw new HttpsError("failed-precondition", "Shop Item hat keinen gueltigen WFXP Preis.");
    const intentRef = db.collection("shopPurchaseIntents").doc();
    await intentRef.set({
      intentId: intentRef.id,
      ...scopedOwnerFields(userId, childProfileId),
      shopItemId,
      title: optionalString(itemData.title, 120) || shopItemId,
      itemDefinitionId: itemData.itemDefinitionId || shopItemId,
      quotedPriceWfxp: priceWfxp,
      category: optionalString(itemData.category, 80) || "unknown",
      consumable: itemData.consumable === true,
      effectType: optionalString(itemData.effectType, 80),
      effectAmount: normalizedPositiveInteger(itemData.effectAmount, 0, 100),
      currency: BETA1_INTERNAL_CURRENCY,
      status: "pending",
      realMoney: false,
      iap: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      ...serverTimestamps(),
    });
    return {
      accepted: true,
      intentId: intentRef.id,
      quotedPriceWfxp: priceWfxp,
      currency: BETA1_INTERNAL_CURRENCY,
      purchaseAuthorized: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
    };
  });

  exportsTarget.completeXpShopPurchase = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const intentId = requiredString((request.data || {}).intentId, "intentId", HttpsError);
    const intentRef = db.collection("shopPurchaseIntents").doc(intentId);

    const result = await db.runTransaction(async (transaction) => {
      const intentSnapshot = await transaction.get(intentRef);
      if (!intentSnapshot.exists || (intentSnapshot.data() || {}).ownerUserId !== userId) {
        throw new HttpsError("permission-denied", "Purchase Intent gehoert nicht diesem Nutzer.");
      }
      const intentData = intentSnapshot.data() || {};
      if (intentData.status !== "pending") {
        throw new HttpsError("failed-precondition", "Purchase Intent ist nicht pending.");
      }

      const childProfileId = intentData.childProfileId || null;
      const price = normalizedPositiveInteger(intentData.quotedPriceWfxp, 0, 100000);
      if (price <= 0) throw new HttpsError("failed-precondition", "Purchase Intent hat keinen gueltigen Preis.");
      const walletRef = await getWalletRef(db, userId, childProfileId);
      const ledgerRef = db.collection("xpLedgerEvents").doc(`shop_purchase_${safeDocIdPart(intentId)}`);
      const legacyLedgerRef = db.collection("ledgerEvents").doc(ledgerRef.id);
      const eventRef = db.collection("shopPurchaseEvents").doc(intentId);
      const inventoryRef = db.collection("userInventory").doc(
        `${safeDocIdPart(userId)}_${safeDocIdPart(intentData.itemDefinitionId)}_${safeDocIdPart(intentId)}`,
      );
      const adminActionRef = db.collection("adminActions").doc(`shop_purchase_${safeDocIdPart(intentId)}`);
      const auditEventRef = db.collection("auditEvents").doc(`shop_purchase_${safeDocIdPart(intentId)}`);

      const [walletSnapshot, ledgerSnapshot, eventSnapshot, inventorySnapshot] = await Promise.all([
        transaction.get(walletRef),
        transaction.get(ledgerRef),
        transaction.get(eventRef),
        transaction.get(inventoryRef),
      ]);
      if (ledgerSnapshot.exists || eventSnapshot.exists || inventorySnapshot.exists) {
        throw new HttpsError("failed-precondition", "Purchase Intent hat einen inkonsistenten bestehenden Serverzustand.");
      }

      const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
      const currentBalance = Number(wallet.balance || 0);
      if (currentBalance < price) {
        transaction.set(intentRef, {
          status: "rejected",
          rejectionReason: "insufficient-wfxp-balance",
          ...updatedTimestamp(),
        }, { merge: true });
        return {
          accepted: false,
          rejectionReason: "insufficient-wfxp-balance",
          purchaseAuthorized: false,
          inventoryAuthorized: false,
        };
      }

      const nextBalance = currentBalance - price;
      const ledgerCommon = {
        ledgerEventId: ledgerRef.id,
        ...scopedOwnerFields(userId, childProfileId),
        delta: -price,
        reason: "xp-shop-purchase",
        sourceType: "shopPurchaseIntent",
        sourceId: intentId,
        actorUserId: userId,
        idempotencyKey: ledgerRef.id,
        currency: BETA1_INTERNAL_CURRENCY,
        noMonetaryValue: true,
        blockchainBacked: false,
        cashoutAllowed: false,
        tokenAuthorized: false,
        realMoney: false,
        metadata: { shopItemId: intentData.shopItemId, inventoryItemId: inventoryRef.id },
        ...serverTimestamps(),
      };
      const purchaseEvent = {
        eventId: eventRef.id,
        intentId,
        ...scopedOwnerFields(userId, childProfileId),
        shopItemId: intentData.shopItemId,
        itemDefinitionId: intentData.itemDefinitionId,
        xpLedgerEventId: ledgerRef.id,
        result: "completed",
        currency: BETA1_INTERNAL_CURRENCY,
        realMoney: false,
        tokenAuthorized: false,
        ...serverTimestamps(),
      };
      const inventoryItem = {
        inventoryItemId: inventoryRef.id,
        ...scopedOwnerFields(userId, childProfileId),
        itemDefinitionId: intentData.itemDefinitionId,
        itemId: intentData.itemDefinitionId,
        title: optionalString(intentData.title, 120) || intentData.itemDefinitionId,
        category: optionalString(intentData.category, 80) || "unknown",
        consumable: intentData.consumable === true,
        effectType: optionalString(intentData.effectType, 80),
        effectAmount: normalizedPositiveInteger(intentData.effectAmount, 0, 100),
        quantity: 1,
        status: "available",
        sourceEventId: eventRef.id,
        equipped: false,
        serverValidationStatus: "server-granted",
        ...serverTimestamps(),
      };
      const auditBase = purchaseAuditBase({
        refId: eventRef.id,
        actionType: "shop-purchase-completed",
        targetType: "shopPurchaseEvent",
        targetId: eventRef.id,
        userId,
        childProfileId,
        metadata: { priceWfxp: price, inventoryItemId: inventoryRef.id },
      });

      transaction.set(ledgerRef, ledgerCommon);
      transaction.set(legacyLedgerRef, ledgerCommon);
      transaction.set(walletRef, {
        walletId: walletRef.id,
        ...scopedOwnerFields(userId, childProfileId),
        balance: nextBalance,
        lifetimeEarned: Number(wallet.lifetimeEarned || 0),
        lifetimeSpent: Number(wallet.lifetimeSpent || 0) + price,
        currency: BETA1_INTERNAL_CURRENCY,
        noMonetaryValue: true,
        blockchainBacked: false,
        cashoutAllowed: false,
        tokenAuthorized: false,
        realMoney: false,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: wallet.createdAt || FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(eventRef, purchaseEvent);
      transaction.set(inventoryRef, inventoryItem);
      transaction.set(intentRef, {
        status: "completed",
        shopPurchaseEventId: eventRef.id,
        inventoryItemId: inventoryRef.id,
        xpLedgerEventId: ledgerRef.id,
        ...updatedTimestamp(),
      }, { merge: true });
      transaction.set(adminActionRef, { adminActionId: adminActionRef.id, ...auditBase });
      transaction.set(auditEventRef, { auditEventId: auditEventRef.id, ...auditBase });

      return {
        accepted: true,
        eventId: eventRef.id,
        inventoryItemId: inventoryRef.id,
        xpLedgerEventId: ledgerRef.id,
        remainingWfxp: nextBalance,
        purchaseAuthorized: true,
        inventoryAuthorized: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
      };
    });

    return result;
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

  exportsTarget.getBuddyCareProjection = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const childProfileId = optionalString((request.data || {}).childProfileId, 160);
    if (childProfileId) await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    const avatarRef = db.collection("userAvatars").doc(buddyAvatarId(userId, childProfileId));
    const projection = await db.runTransaction(async (transaction) => {
      const avatarSnapshot = await transaction.get(avatarRef);
      if (avatarSnapshot.exists) {
        return publicBuddyCareProjection(avatarRef.id, avatarSnapshot.data() || {}, true);
      }
      const defaultDocument = defaultBuddyCareDocument(userId, childProfileId);
      transaction.set(avatarRef, defaultDocument);
      return publicBuddyCareProjection(avatarRef.id, defaultDocument, false);
    });
    return {
      accepted: true,
      buddy: projection,
      balanceAffected: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
    };
  });

  exportsTarget.consumeBuddyFoodItem = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const inventoryItemId = requiredString((request.data || {}).inventoryItemId, "inventoryItemId", HttpsError, 220);
    const inventoryRef = db.collection("userInventory").doc(inventoryItemId);
    const initialInventorySnapshot = await inventoryRef.get();
    if (!initialInventorySnapshot.exists || (initialInventorySnapshot.data() || {}).ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Inventory Item gehoert nicht diesem Nutzer.");
    }
    const childProfileId = (initialInventorySnapshot.data() || {}).childProfileId || null;
    if (childProfileId) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "shop", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "shop", HttpsError);
    }
    const avatarRef = db.collection("userAvatars").doc(buddyAvatarId(userId, childProfileId));

    const result = await db.runTransaction(async (transaction) => {
      const [inventorySnapshot, avatarSnapshot] = await Promise.all([
        transaction.get(inventoryRef),
        transaction.get(avatarRef),
      ]);
      if (!inventorySnapshot.exists || (inventorySnapshot.data() || {}).ownerUserId !== userId) {
        throw new HttpsError("permission-denied", "Inventory Item gehoert nicht diesem Nutzer.");
      }
      const inventory = inventorySnapshot.data() || {};
      const avatarData = avatarSnapshot.exists ? avatarSnapshot.data() || {} : defaultBuddyCareDocument(userId, childProfileId);
      const currentProjection = publicBuddyCareProjection(avatarRef.id, avatarData, avatarSnapshot.exists);

      if (inventory.status === "consumed" || Number(inventory.quantity || 0) <= 0) {
        return {
          accepted: true,
          idempotent: true,
          inventoryItemId,
          buddy: currentProjection,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }
      if (
        inventory.serverValidationStatus !== "server-granted"
        || inventory.consumable !== true
        || inventory.effectType !== "buddy-hunger"
      ) {
        throw new HttpsError("failed-precondition", "Inventory Item ist kein freigegebenes Buddy-Futter.");
      }
      if (currentProjection.hunger >= 100) {
        return {
          accepted: false,
          idempotent: false,
          rejectionReason: "buddy-hunger-full",
          inventoryItemId,
          buddy: currentProjection,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }

      const effectAmount = normalizedPositiveInteger(inventory.effectAmount, BUDDY_FOOD_HUNGER_RESTORE, 25);
      const nextHunger = Math.min(100, currentProjection.hunger + effectAmount);
      const feedEventId = `buddy_feed_${safeDocIdPart(inventoryItemId)}`;
      const adminActionRef = db.collection("adminActions").doc(feedEventId);
      const auditEventRef = db.collection("auditEvents").doc(feedEventId);
      const fedAt = new Date().toISOString();
      const nextAvatar = {
        ...avatarData,
        userAvatarId: avatarRef.id,
        ...scopedOwnerFields(userId, childProfileId),
        buddyId: currentProjection.buddyId,
        hunger: nextHunger,
        energy: currentProjection.energy,
        mood: currentProjection.mood,
        level: currentProjection.level,
        xpTotal: currentProjection.xpTotal,
        equippedItemIds: Array.isArray(avatarData.equippedItemIds) ? avatarData.equippedItemIds : [],
        lastFedAt: fedAt,
        lastConsumedInventoryItemId: inventoryItemId,
        serverValidationStatus: "server-projected",
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: avatarData.createdAt || FieldValue.serverTimestamp(),
      };
      const auditBase = purchaseAuditBase({
        refId: feedEventId,
        actionType: "buddy-food-consumed",
        targetType: "userAvatar",
        targetId: avatarRef.id,
        userId,
        childProfileId,
        metadata: { inventoryItemId, previousHunger: currentProjection.hunger, nextHunger },
      });

      transaction.set(inventoryRef, {
        status: "consumed",
        quantity: 0,
        consumedAt: fedAt,
        consumedForAvatarId: avatarRef.id,
        consumptionEffect: { effectType: "buddy-hunger", effectAmount, previousHunger: currentProjection.hunger, nextHunger },
        equipped: false,
        ...updatedTimestamp(),
      }, { merge: true });
      transaction.set(avatarRef, nextAvatar, { merge: true });
      transaction.set(adminActionRef, { adminActionId: adminActionRef.id, ...auditBase });
      transaction.set(auditEventRef, { auditEventId: auditEventRef.id, ...auditBase });

      return {
        accepted: true,
        idempotent: false,
        inventoryItemId,
        buddy: publicBuddyCareProjection(avatarRef.id, nextAvatar, true),
        tokenAuthorized: false,
        cashoutAllowed: false,
      };
    });

    return result;
  });

  exportsTarget.equipInventoryItem = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const inventoryItemId = requiredString((request.data || {}).inventoryItemId, "inventoryItemId", HttpsError);
    const inventoryRef = db.collection("userInventory").doc(inventoryItemId);
    const inventory = await inventoryRef.get();
    const inventoryData = inventory.data() || {};
    if (!inventory.exists || inventoryData.ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Inventory Item gehoert nicht diesem Nutzer.");
    }
    if (inventoryData.status === "consumed" || inventoryData.consumable === true) {
      throw new HttpsError("failed-precondition", "Verbrauchte oder konsumierbare Items koennen nicht ausgeruestet werden.");
    }
    await inventoryRef.set({ equipped: true, ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, {
      actorUserId: "server",
      actionType: "inventory-equipped",
      targetType: "userInventory",
      targetId: inventoryItemId,
      ownerUserId: userId,
      childProfileId: inventoryData.childProfileId || null,
    });
    return { accepted: true, inventoryItemId, equipped: true };
  });
}

module.exports = {
  registerBeta1ShopInventory,
  BUDDY_FOOD_SHOP_ITEM_ID,
  BUDDY_FOOD_PRICE_WFXP,
  BUDDY_FOOD_HUNGER_RESTORE,
  DEFAULT_BUDDY_HUNGER,
};
