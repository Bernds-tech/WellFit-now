import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export const BETA1_BUDDY_FOOD_SHOP_ITEM_ID = "buddy_food_basic";
export const BETA1_BUDDY_FOOD_FALLBACK_PRICE_WFXP = 5;

export type Beta1BuddyCareProjection = {
  userAvatarId: string;
  ownerUserId?: string | null;
  childProfileId?: string | null;
  buddyId: string;
  hunger: number;
  energy: number;
  mood: number;
  level: number;
  xpTotal: number;
  lastFedAt?: string | null;
  initialized: boolean;
  serverValidationStatus: string;
};

export type Beta1BuddyFoodItem = {
  shopItemId: string;
  title: string;
  itemDefinitionId: string;
  priceWfxp: number;
  category?: string | null;
  consumable: true;
  effectType: "buddy-hunger";
  effectAmount: number;
  childAllowed: boolean;
  status: "published";
  noRealMoney: true;
  tokenAuthorized: false;
};

export type Beta1BuddyFoodInventoryItem = {
  id: string;
  inventoryItemId: string;
  itemDefinitionId: string;
  itemId?: string;
  quantity: number;
  status: string;
  consumable: boolean;
  effectType?: string | null;
  effectAmount?: number;
  serverValidationStatus?: string;
};

export type Beta1BuddyCareDashboardSnapshot = {
  buddy: Beta1BuddyCareProjection | null;
  foodItem: Beta1BuddyFoodItem | null;
  serverCareReady: boolean;
  foodItemAvailable: boolean;
  error: string | null;
};

export type Beta1BuddyFeedResult = {
  buddy: Beta1BuddyCareProjection;
  inventoryItemId: string;
  remainingWfxp: number | null;
  usedExistingInventory: boolean;
  purchaseEventId: string | null;
  idempotent: boolean;
};

type CallableResult<T> = T & { accepted?: boolean; message?: string };

type ListShopItemsResponse = CallableResult<{
  currency?: string;
  noRealMoneyShop?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
  items?: unknown[];
}>;

type ListInventoryResponse = CallableResult<{ items?: unknown[] }>;

type BuddyProjectionResponse = CallableResult<{
  buddy?: unknown;
  balanceAffected?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
}>;

type PurchaseIntentResponse = CallableResult<{
  intentId?: string;
  quotedPriceWfxp?: number;
  currency?: string;
  purchaseAuthorized?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
}>;

type PurchaseResponse = CallableResult<{
  rejectionReason?: string;
  eventId?: string;
  inventoryItemId?: string;
  xpLedgerEventId?: string;
  remainingWfxp?: number;
  purchaseAuthorized?: boolean;
  inventoryAuthorized?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
}>;

type ConsumeResponse = CallableResult<{
  rejectionReason?: string;
  idempotent?: boolean;
  inventoryItemId?: string;
  buddy?: unknown;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
}>;

type EnsureCatalogResponse = CallableResult<{ item?: unknown }>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  return Math.min(max, Math.max(min, asNumber(value, fallback)));
}

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("unauthenticated: Firebase user missing");
  return user;
}

function callableErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const details = typeof error === "object" && error && "details" in error
    ? String((error as { details?: unknown }).details ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${details} ${message}`.toLowerCase();

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, bevor du Flammi fütterst.";
  if (diagnostic.includes("permission-denied")) return "Dieses Buddy-Futter oder Inventar gehört nicht zu deinem Konto.";
  if (diagnostic.includes("insufficient-wfxp-balance")) return "Dein WFXP-Guthaben reicht für den Energie-Snack nicht aus.";
  if (diagnostic.includes("buddy-hunger-full")) return "Flammi ist bereits satt. Es wurde nichts verbraucht.";
  if (diagnostic.includes("shop item nicht verfuegbar") || diagnostic.includes("not-found")) {
    return "Der Beta-1 Energie-Snack ist noch nicht veröffentlicht. Bitte im Beta-1-Adminbereich vorbereiten.";
  }
  if (diagnostic.includes("failed-precondition")) return "Der Buddy-Futtervorgang kann in seinem aktuellen Status nicht fortgesetzt werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Buddy-Care-Server ist gerade nicht erreichbar.";
  return "Flammi konnte nicht sicher über den WFXP-Serverpfad gefüttert werden.";
}

function mapBuddy(value: unknown): Beta1BuddyCareProjection | null {
  const data = asRecord(value);
  const userAvatarId = asString(data.userAvatarId);
  if (!userAvatarId) return null;
  return {
    userAvatarId,
    ownerUserId: asString(data.ownerUserId) || null,
    childProfileId: asString(data.childProfileId) || null,
    buddyId: asString(data.buddyId, "default"),
    hunger: Math.floor(clamp(data.hunger, 0, 100, 70)),
    energy: Math.floor(clamp(data.energy, 0, 100, 100)),
    mood: Math.floor(clamp(data.mood, 0, 100, 100)),
    level: Math.max(1, Math.floor(asNumber(data.level, 1))),
    xpTotal: Math.max(0, Math.floor(asNumber(data.xpTotal, 0))),
    lastFedAt: asString(data.lastFedAt) || null,
    initialized: data.initialized === true,
    serverValidationStatus: asString(data.serverValidationStatus, "server-projected"),
  };
}

function mapFoodItem(value: unknown): Beta1BuddyFoodItem | null {
  const data = asRecord(value);
  if (
    asString(data.shopItemId) !== BETA1_BUDDY_FOOD_SHOP_ITEM_ID
    || asString(data.status) !== "published"
    || data.consumable !== true
    || asString(data.effectType) !== "buddy-hunger"
    || data.noRealMoney !== true
    || data.tokenAuthorized === true
  ) {
    return null;
  }
  const itemDefinitionId = asString(data.itemDefinitionId);
  const priceWfxp = Math.floor(asNumber(data.priceWfxp, 0));
  if (!itemDefinitionId || priceWfxp <= 0) return null;
  return {
    shopItemId: BETA1_BUDDY_FOOD_SHOP_ITEM_ID,
    title: asString(data.title, "Flammi Energie-Snack"),
    itemDefinitionId,
    priceWfxp,
    category: asString(data.category) || null,
    consumable: true,
    effectType: "buddy-hunger",
    effectAmount: Math.max(1, Math.floor(asNumber(data.effectAmount, 10))),
    childAllowed: data.childAllowed === true,
    status: "published",
    noRealMoney: true,
    tokenAuthorized: false,
  };
}

function mapInventoryItem(value: unknown): Beta1BuddyFoodInventoryItem | null {
  const data = asRecord(value);
  const id = asString(data.id) || asString(data.inventoryItemId);
  const inventoryItemId = asString(data.inventoryItemId, id);
  const itemDefinitionId = asString(data.itemDefinitionId) || asString(data.itemId);
  if (!id || !inventoryItemId || !itemDefinitionId) return null;
  return {
    id,
    inventoryItemId,
    itemDefinitionId,
    itemId: asString(data.itemId) || undefined,
    quantity: Math.max(0, Math.floor(asNumber(data.quantity, 0))),
    status: asString(data.status, "unknown"),
    consumable: data.consumable === true,
    effectType: asString(data.effectType) || null,
    effectAmount: Math.max(0, Math.floor(asNumber(data.effectAmount, 0))),
    serverValidationStatus: asString(data.serverValidationStatus) || undefined,
  };
}

async function listPublishedBuddyFood(): Promise<Beta1BuddyFoodItem | null> {
  const callable = httpsCallable<Record<string, never>, ListShopItemsResponse>(getFunctions(), "listShopItems");
  const result = await callable({});
  if (
    !result.data.accepted
    || result.data.noRealMoneyShop !== true
    || result.data.tokenAuthorized === true
    || result.data.cashoutAllowed === true
  ) {
    return null;
  }
  return (Array.isArray(result.data.items) ? result.data.items : [])
    .map(mapFoodItem)
    .find((item): item is Beta1BuddyFoodItem => item !== null) ?? null;
}

async function listAvailableBuddyFoodInventory(): Promise<Beta1BuddyFoodInventoryItem[]> {
  const callable = httpsCallable<Record<string, never>, ListInventoryResponse>(getFunctions(), "listInventory");
  const result = await callable({});
  if (!result.data.accepted) return [];
  return (Array.isArray(result.data.items) ? result.data.items : [])
    .map(mapInventoryItem)
    .filter((item): item is Beta1BuddyFoodInventoryItem => Boolean(
      item
      && item.itemDefinitionId === BETA1_BUDDY_FOOD_SHOP_ITEM_ID
      && item.status === "available"
      && item.quantity > 0
      && item.consumable
      && item.effectType === "buddy-hunger"
      && item.serverValidationStatus === "server-granted",
    ));
}

export async function getBuddyCareProjection(): Promise<Beta1BuddyCareProjection> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, BuddyProjectionResponse>(getFunctions(), "getBuddyCareProjection");
    const result = await callable({});
    const buddy = mapBuddy(result.data.buddy);
    if (
      !result.data.accepted
      || !buddy
      || result.data.balanceAffected === true
      || result.data.tokenAuthorized === true
      || result.data.cashoutAllowed === true
    ) {
      throw new Error("failed-precondition: invalid Buddy-care projection");
    }
    return buddy;
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function getBuddyCareDashboardSnapshot(): Promise<Beta1BuddyCareDashboardSnapshot> {
  requireSignedInUser();
  try {
    const [buddy, foodItem] = await Promise.all([
      getBuddyCareProjection(),
      listPublishedBuddyFood(),
    ]);
    return {
      buddy,
      foodItem,
      serverCareReady: true,
      foodItemAvailable: Boolean(foodItem),
      error: foodItem ? null : "Der Beta-1 Energie-Snack ist noch nicht im Serverkatalog veröffentlicht.",
    };
  } catch (error) {
    return {
      buddy: null,
      foodItem: null,
      serverCareReady: false,
      foodItemAvailable: false,
      error: error instanceof Error ? error.message : callableErrorMessage(error),
    };
  }
}

async function createAndCompleteBuddyFoodPurchase(foodItem: Beta1BuddyFoodItem): Promise<{
  inventoryItemId: string;
  remainingWfxp: number;
  purchaseEventId: string;
}> {
  const createIntent = httpsCallable<
    { shopItemId: string },
    PurchaseIntentResponse
  >(getFunctions(), "createShopPurchaseIntent");
  const completePurchase = httpsCallable<
    { intentId: string },
    PurchaseResponse
  >(getFunctions(), "completeXpShopPurchase");

  const intentResult = await createIntent({ shopItemId: foodItem.shopItemId });
  const intentId = asString(intentResult.data.intentId);
  if (
    !intentResult.data.accepted
    || !intentId
    || intentResult.data.purchaseAuthorized === true
    || intentResult.data.tokenAuthorized === true
    || intentResult.data.cashoutAllowed === true
    || asNumber(intentResult.data.quotedPriceWfxp, -1) !== foodItem.priceWfxp
  ) {
    throw new Error("failed-precondition: invalid Buddy-food purchase intent");
  }

  const purchaseResult = await completePurchase({ intentId });
  if (!purchaseResult.data.accepted) {
    if (purchaseResult.data.rejectionReason === "insufficient-wfxp-balance") {
      throw new Error("insufficient-wfxp-balance");
    }
    throw new Error("failed-precondition: Buddy-food purchase rejected");
  }
  const inventoryItemId = asString(purchaseResult.data.inventoryItemId);
  const purchaseEventId = asString(purchaseResult.data.eventId);
  if (
    !inventoryItemId
    || !purchaseEventId
    || purchaseResult.data.purchaseAuthorized !== true
    || purchaseResult.data.inventoryAuthorized !== true
    || purchaseResult.data.tokenAuthorized === true
    || purchaseResult.data.cashoutAllowed === true
  ) {
    throw new Error("failed-precondition: invalid Buddy-food purchase result");
  }
  return {
    inventoryItemId,
    remainingWfxp: Math.max(0, Math.floor(asNumber(purchaseResult.data.remainingWfxp, 0))),
    purchaseEventId,
  };
}

async function consumeBuddyFood(inventoryItemId: string): Promise<{
  buddy: Beta1BuddyCareProjection;
  idempotent: boolean;
}> {
  const callable = httpsCallable<{ inventoryItemId: string }, ConsumeResponse>(getFunctions(), "consumeBuddyFoodItem");
  const result = await callable({ inventoryItemId });
  if (!result.data.accepted) {
    if (result.data.rejectionReason === "buddy-hunger-full") throw new Error("buddy-hunger-full");
    throw new Error("failed-precondition: Buddy-food consumption rejected");
  }
  const buddy = mapBuddy(result.data.buddy);
  if (
    !buddy
    || asString(result.data.inventoryItemId) !== inventoryItemId
    || result.data.tokenAuthorized === true
    || result.data.cashoutAllowed === true
  ) {
    throw new Error("failed-precondition: invalid Buddy-food consumption result");
  }
  return { buddy, idempotent: result.data.idempotent === true };
}

export async function feedBuddyWithWfxp(): Promise<Beta1BuddyFeedResult> {
  requireSignedInUser();
  try {
    const currentBuddy = await getBuddyCareProjection();
    if (currentBuddy.hunger >= 100) throw new Error("buddy-hunger-full");

    const availableInventory = await listAvailableBuddyFoodInventory();
    let inventoryItemId = availableInventory[0]?.inventoryItemId ?? "";
    let remainingWfxp: number | null = null;
    let purchaseEventId: string | null = null;
    const usedExistingInventory = Boolean(inventoryItemId);

    if (!inventoryItemId) {
      const foodItem = await listPublishedBuddyFood();
      if (!foodItem) throw new Error("Shop Item nicht verfuegbar");
      const purchase = await createAndCompleteBuddyFoodPurchase(foodItem);
      inventoryItemId = purchase.inventoryItemId;
      remainingWfxp = purchase.remainingWfxp;
      purchaseEventId = purchase.purchaseEventId;
    }

    const consumed = await consumeBuddyFood(inventoryItemId);
    return {
      buddy: consumed.buddy,
      inventoryItemId,
      remainingWfxp,
      usedExistingInventory,
      purchaseEventId,
      idempotent: consumed.idempotent,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function ensureBuddyFoodCatalogForAdmin(): Promise<Beta1BuddyFoodItem> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, EnsureCatalogResponse>(getFunctions(), "adminEnsureBuddyFoodItem");
    const result = await callable({});
    const item = mapFoodItem(result.data.item);
    if (!result.data.accepted || !item) {
      throw new Error("failed-precondition: invalid Buddy-food catalog response");
    }
    return item;
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}
