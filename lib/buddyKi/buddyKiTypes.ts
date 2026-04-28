export type BuddyKiProviderMode = "rules" | "mock" | "remote-ai";

export type BuddyKiAgeBand = "toddler" | "child" | "teen" | "adult" | "senior";

export type BuddyKiMissionType =
  | "daily"
  | "weekly"
  | "adventure"
  | "challenge"
  | "competition"
  | "arRiddle"
  | "unknown";

export type BuddyKiIntent =
  | "welcome"
  | "explainMenu"
  | "suggestMission"
  | "explainMissingCapability"
  | "arHint"
  | "missionProgress"
  | "safeDetour"
  | "celebrate"
  | "errorHelp";

export type BuddyKiContext = {
  userId?: string;
  buddyId?: string;
  language: "de" | "en";
  ageBand?: BuddyKiAgeBand;
  parentMode?: boolean;
  currentMissionId?: string;
  currentMissionType?: BuddyKiMissionType;
  currentRoute?: string;
  inventoryCapabilityIds?: string[];
  missingCapabilityId?: string;
  markerId?: string;
  riskLevel?: "low" | "medium" | "high";
  cameraActive?: boolean;
};

export type BuddyKiOption = {
  id: string;
  label: string;
  intent: BuddyKiIntent;
  payload?: Record<string, string | number | boolean | undefined>;
};

/**
 * Buddy KI is advisory only.
 * It may suggest missions, hints, dialogue, detours, or progress language,
 * but it must never authorize rewards, points, tokens, trading, medical diagnosis,
 * or final mission completion from the client/mobile layer.
 */
export type BuddyKiResponse = {
  providerMode: BuddyKiProviderMode;
  intent: BuddyKiIntent;
  title: string;
  message: string;
  mood: "neutral" | "happy" | "curious" | "helpful" | "warning";
  options: BuddyKiOption[];
  safety: {
    rewardAuthorized: false;
    missionCompletionAuthorized: false;
    medicalDiagnosis: false;
    mobileTokenTrading: false;
  };
};

export type BuddyKiProvider = {
  mode: BuddyKiProviderMode;
  generateResponse: (intent: BuddyKiIntent, context: BuddyKiContext) => Promise<BuddyKiResponse>;
};

export const createBuddyKiSafety = () => ({
  rewardAuthorized: false as const,
  missionCompletionAuthorized: false as const,
  medicalDiagnosis: false as const,
  mobileTokenTrading: false as const,
});
