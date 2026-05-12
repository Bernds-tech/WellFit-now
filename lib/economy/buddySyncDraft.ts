export type BuddySyncSource = "dailyMission" | "dashboard" | "mobile" | "ar" | "pose";

export type BuddySyncEffect = {
  energy: number;
  hunger: number;
  mood: number;
  cleanliness: number;
  bond: number;
  loyalty: number;
  curiosity: number;
};

export type BuddySyncDraftInput = {
  userId: string;
  missionId: string;
  missionTitle: string;
  missionType: string;
  rewardPoints: number;
  source: BuddySyncSource;
  currentAvatar?: Record<string, unknown> | null;
};

export type BuddySyncDraftBundle = {
  mode: "internal_points_beta";
  source: "server_buddy_sync_draft";
  finalAuthority: false;
  tokenized: false;
  writeNow: false;
  userId: string;
  missionId: string;
  missionTitle: string;
  rewardPoints: number;
  effect: BuddySyncEffect;
  projectedAvatar: Record<string, unknown>;
  drafts: Array<{
    collection: "auditEvents" | "userEconomyProjections";
    documentId: string;
    writeNow: false;
    record: Record<string, unknown>;
  }>;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const numberFrom = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};
const safeId = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 160);

const defaultEffect: BuddySyncEffect = {
  energy: -2,
  hunger: -2,
  mood: 4,
  cleanliness: -1,
  bond: 3,
  loyalty: 2,
  curiosity: 2,
};

const effectsByMissionType: Record<string, BuddySyncEffect> = {
  Bewegung: { energy: -4, hunger: -2, mood: 5, cleanliness: -1, bond: 3, loyalty: 2, curiosity: 5 },
  Workout: { energy: -6, hunger: -3, mood: 6, cleanliness: -2, bond: 4, loyalty: 2, curiosity: 3 },
  Ernährung: { energy: 2, hunger: 8, mood: 4, cleanliness: 0, bond: 2, loyalty: 3, curiosity: 1 },
  Abenteuer: { energy: -3, hunger: -2, mood: 6, cleanliness: -1, bond: 5, loyalty: 2, curiosity: 8 },
  Community: { energy: 1, hunger: 0, mood: 5, cleanliness: 0, bond: 3, loyalty: 5, curiosity: 2 },
};

function getBuddyStatus(input: { energy: number; hunger: number; cleanliness: number; bond: number; loyalty: number }) {
  if (input.loyalty <= 12 && input.bond <= 15) return "ranAway";
  if (input.cleanliness <= 25) return "messy";
  if (input.energy <= 30 || input.hunger <= 30 || input.bond <= 30) return "needsCare";
  if (input.energy <= 45 || input.hunger <= 45) return "tired";
  return "active";
}

function getDailyMode(input: { energy: number; hunger: number; cleanliness: number; mood: number; curiosity: number }) {
  if (input.cleanliness < 35) return "chaotisch";
  if (input.hunger < 40) return "hungrig";
  if (input.energy < 45) return "muede";
  if (input.mood > 78) return "stolz";
  if (input.curiosity > 72) return "abenteuerlustig";
  if (input.mood > 58) return "verspielt";
  return "neugierig";
}

export function createBuddySyncDraftBundle(input: BuddySyncDraftInput): BuddySyncDraftBundle {
  const effect = effectsByMissionType[input.missionType] ?? defaultEffect;
  const avatar = input.currentAvatar ?? {};
  const eventId = safeId(`${input.userId}_${input.missionId}_${Date.now()}`);
  const rewardPoints = Math.max(0, Math.round(Number(input.rewardPoints) || 0));

  const nextValues = {
    energy: clamp(numberFrom(avatar.energy, 75) + effect.energy),
    hunger: clamp(numberFrom(avatar.hunger, 70) + effect.hunger),
    mood: clamp(numberFrom(avatar.mood, 65) + effect.mood),
    cleanliness: clamp(numberFrom(avatar.cleanliness, 75) + effect.cleanliness),
    bond: clamp(numberFrom(avatar.bond, 60) + effect.bond),
    loyalty: clamp(numberFrom(avatar.loyalty, 70) + effect.loyalty),
    curiosity: clamp(numberFrom(avatar.curiosity, 60) + effect.curiosity),
    level: Math.max(1, numberFrom(avatar.level, 1)),
  };

  const projectedAvatar = {
    ...avatar,
    ...nextValues,
    status: getBuddyStatus(nextValues),
    dailyMode: getDailyMode(nextValues),
    lastMissionEffectAt: new Date().toISOString(),
    lastBuddySyncSource: input.source,
    lastBuddySyncFinalAuthority: false,
  };

  return {
    mode: "internal_points_beta",
    source: "server_buddy_sync_draft",
    finalAuthority: false,
    tokenized: false,
    writeNow: false,
    userId: input.userId,
    missionId: input.missionId,
    missionTitle: input.missionTitle,
    rewardPoints,
    effect,
    projectedAvatar,
    drafts: [
      {
        collection: "auditEvents",
        documentId: `${eventId}_buddy-audit`,
        writeNow: false,
        record: {
          userId: input.userId,
          missionId: input.missionId,
          missionTitle: input.missionTitle,
          source: input.source,
          effect,
          projectedAvatar,
        },
      },
      {
        collection: "userEconomyProjections",
        documentId: `${eventId}_buddy-projection`,
        writeNow: false,
        record: {
          userId: input.userId,
          sourceEventId: eventId,
          projectedPointsDelta: rewardPoints,
          projectedAvatar,
        },
      },
    ],
  };
}
