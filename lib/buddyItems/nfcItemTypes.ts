import type { BuddyCapabilityId, BuddyItemSource } from "./buddyItemTypes";

export type NfcTagStatus = "active" | "inactive" | "revoked" | "expired" | "blocked";

export type NfcTagPurpose = "grantItem" | "unlockCapability" | "startMission" | "revealHint" | "partnerCheckIn";

export type NfcTagDefinition = {
  tagId: string;
  publicCode: string;
  purpose: NfcTagPurpose;
  status: NfcTagStatus;
  linkedItemId?: string;
  linkedCapabilityId?: BuddyCapabilityId;
  linkedMissionId?: string;
  allowedUserIds?: string[];
  allowedGroupIds?: string[];
  usageLimit?: number;
  usageCount: number;
  validFrom?: string;
  validUntil?: string;
  partnerId?: string;
  locationHint?: string;
  createdAt: string;
  updatedAt: string;
};

export type NfcScanPayload = {
  publicCode: string;
  signedPayload?: string;
  scannedAt: string;
  deviceId?: string;
  appSessionId?: string;
  missionId?: string;
  approximateLocationHash?: string;
};

export type NfcScanEvent = {
  scanEventId: string;
  tagId?: string;
  publicCode: string;
  userId: string;
  source: BuddyItemSource;
  missionId?: string;
  status: "received" | "validated" | "rejected" | "duplicate" | "blocked";
  rejectionReason?: string;
  grantedItemId?: string;
  grantedCapabilityId?: BuddyCapabilityId;
  createdAt: string;
  validatedAt?: string;
};

export type NfcValidationResult = {
  accepted: boolean;
  scanEventId: string;
  tagId?: string;
  grantedItemId?: string;
  grantedCapabilityId?: BuddyCapabilityId;
  message: string;
  rejectionReason?: string;
};
