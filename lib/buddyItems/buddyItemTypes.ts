export type BuddyItemType =
  | "cosmetic"
  | "tool"
  | "protection"
  | "movement"
  | "puzzle"
  | "event-nfc"
  | "partner";

export type BuddyItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "event";

export type BuddyItemSource = "mission" | "shop" | "nfc" | "partner" | "event" | "admin";

export type BuddyCapabilityId =
  | "climbUp"
  | "jumpDown"
  | "jumpBoost"
  | "fetchClue"
  | "scanObject"
  | "revealHint"
  | "protect"
  | "carry";

export type BuddyEquipmentSlot =
  | "head"
  | "body"
  | "back"
  | "leftHand"
  | "rightHand"
  | "feet"
  | "accessory"
  | "tool";

export type ServerValidationStatus = "pending" | "validated" | "rejected" | "revoked";

export type BuddyItemDefinition = {
  itemId: string;
  name: string;
  description: string;
  itemType: BuddyItemType;
  rarity: BuddyItemRarity;
  equipmentSlots: BuddyEquipmentSlot[];
  capabilityUnlocks: BuddyCapabilityId[];
  assetKey?: string;
  unityPrefabKey?: string;
  isTradable: boolean;
  isConsumable: boolean;
  isAppStoreSensitive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserInventoryItem = {
  inventoryItemId: string;
  ownerUserId: string;
  itemId: string;
  source: BuddyItemSource;
  quantity: number;
  equipped: boolean;
  equippedSlot?: BuddyEquipmentSlot;
  serverValidationStatus: ServerValidationStatus;
  grantedByEventId?: string;
  grantedAt: string;
  revokedAt?: string;
};

export type BuddyCapabilityState = {
  userId: string;
  buddyId: string;
  capabilityId: BuddyCapabilityId;
  unlocked: boolean;
  unlockedByItemId?: string;
  unlockedByMissionId?: string;
  unlockedAt?: string;
  expiresAt?: string;
  serverValidationStatus: ServerValidationStatus;
};

export type BuddyItemUseEvent = {
  eventId: string;
  userId: string;
  buddyId: string;
  inventoryItemId: string;
  itemId: string;
  capabilityId?: BuddyCapabilityId;
  missionId?: string;
  arSessionId?: string;
  status: "requested" | "accepted" | "completed" | "rejected";
  reason?: string;
  createdAt: string;
  completedAt?: string;
};
