import { getEconomyServerPersistenceStatus } from "./serverPersistence";
import { summarizeEconomyProjectionPlan } from "./serverProjectionPlan";

export type UserProjectionSource = "server_projection_draft" | "beta_fallback_projection";

export type UserProjectionInput = {
  userId: string;
  points?: unknown;
  xp?: unknown;
  level?: unknown;
  stepsToday?: unknown;
  avatar?: unknown;
  currentStreak?: unknown;
  longestStreak?: unknown;
};

export type UserProjectionSnapshot = {
  userId: string;
  source: UserProjectionSource;
  finalAuthority: false;
  tokenized: false;
  walletEnabled: false;
  nftEnabled: false;
  writeEnabledNow: false;
  generatedAt: string;
  balance: {
    points: number;
    xp: number;
    level: number;
    stepsToday: number;
  };
  avatar: {
    level: number;
    energy: number;
    hunger: number;
  };
  daily: {
    currentStreak: number;
    longestStreak: number;
  };
  projectionDocuments: {
    balance: string;
    avatar: string;
    daily: string;
    progress: string;
  };
  persistence: ReturnType<typeof getEconomyServerPersistenceStatus>;
  projectionPlan: ReturnType<typeof summarizeEconomyProjectionPlan>;
  warnings: string[];
};

function toNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function createUserProjectionSnapshot(input: UserProjectionInput): UserProjectionSnapshot {
  const avatar = readObject(input.avatar);
  const userId = input.userId || "economy-beta-user";
  const persistence = getEconomyServerPersistenceStatus();
  const projectionPlan = summarizeEconomyProjectionPlan();

  return {
    userId,
    source: "beta_fallback_projection",
    finalAuthority: false,
    tokenized: false,
    walletEnabled: false,
    nftEnabled: false,
    writeEnabledNow: false,
    generatedAt: new Date().toISOString(),
    balance: {
      points: Math.max(0, toNumber(input.points, 0)),
      xp: Math.max(0, toNumber(input.xp, 0)),
      level: Math.max(1, toNumber(input.level, 1)),
      stepsToday: Math.max(0, toNumber(input.stepsToday, 0)),
    },
    avatar: {
      level: Math.max(1, toNumber(avatar.level, toNumber(input.level, 1))),
      energy: Math.max(0, Math.min(100, toNumber(avatar.energy, 75))),
      hunger: Math.max(0, Math.min(100, toNumber(avatar.hunger, 65))),
    },
    daily: {
      currentStreak: Math.max(0, toNumber(input.currentStreak, 0)),
      longestStreak: Math.max(0, toNumber(input.longestStreak, 0)),
    },
    projectionDocuments: {
      balance: `${userId}_balance`,
      avatar: `${userId}_avatar`,
      daily: `${userId}_daily_current`,
      progress: `${userId}_progress`,
    },
    persistence,
    projectionPlan,
    warnings: [
      "Projection is a beta read fallback, not final ledger authority.",
      "Do not harden firestore.rules for points, XP, level, avatar or daily state until UI reads server projections safely.",
      "No token, NFT, wallet, payout, purchase or blockchain transfer is enabled.",
    ],
  };
}
