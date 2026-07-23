import { getBuddyCareDashboardSnapshot } from "@/lib/beta1/clientBuddyCareCommands";
import { readXpWalletProjection } from "@/lib/beta1/clientReadProjections";
import { readClientBetaProjection } from "@/lib/economy/clientBetaProjection";
import type { User } from "@/types/user";

export type DashboardProjectionSource = "server" | "local";

export type DashboardUserProjection = {
  source: DashboardProjectionSource;
  finalAuthority: false;
  balanceFinalAuthority: boolean;
  buddyCareServerOwned: boolean;
  buddyFoodAvailable: boolean;
  buddyFoodPriceWfxp: number;
  buddyCareError: string | null;
  tokenized: false;
  walletEnabled: boolean;
  nftEnabled: false;
  writeEnabledNow: false;
  currency: "WFXP" | "legacy-points";
  points: number;
  xp: number;
  level: number;
  stepsToday: number;
  avatarLevel: number;
  avatarEnergy: number;
  avatarHunger: number;
  checkedAt: string;
  warnings: string[];
};

const asFiniteNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const readObject = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
};

export const createLocalDashboardUserProjection = (user: User | null): DashboardUserProjection => {
  const clientProjection = readClientBetaProjection(user?.id ?? null);

  if (clientProjection) {
    return {
      source: "local",
      finalAuthority: false,
      balanceFinalAuthority: false,
      buddyCareServerOwned: false,
      buddyFoodAvailable: false,
      buddyFoodPriceWfxp: 5,
      buddyCareError: "Serverseitige Buddy-Care-Projektion ist noch nicht verfügbar.",
      tokenized: false,
      walletEnabled: false,
      nftEnabled: false,
      writeEnabledNow: false,
      currency: "legacy-points",
      points: clientProjection.points,
      xp: clientProjection.xp,
      level: clientProjection.level,
      stepsToday: clientProjection.stepsToday,
      avatarLevel: clientProjection.avatar.level,
      avatarEnergy: clientProjection.avatar.energy,
      avatarHunger: clientProjection.avatar.hunger,
      checkedAt: new Date().toISOString(),
      warnings: ["Client beta projection fallback. WFXP wallet and Buddy-care server projection are not available yet."],
    };
  }

  return {
    source: "local",
    finalAuthority: false,
    balanceFinalAuthority: false,
    buddyCareServerOwned: false,
    buddyFoodAvailable: false,
    buddyFoodPriceWfxp: 5,
    buddyCareError: "Serverseitige Buddy-Care-Projektion ist noch nicht verfügbar.",
    tokenized: false,
    walletEnabled: false,
    nftEnabled: false,
    writeEnabledNow: false,
    currency: "legacy-points",
    points: Math.max(0, user?.points ?? 0),
    xp: Math.max(0, user?.xp ?? 0),
    level: Math.max(1, user?.level ?? user?.avatar?.level ?? 1),
    stepsToday: Math.max(0, user?.stepsToday ?? 0),
    avatarLevel: Math.max(1, user?.avatar?.level ?? user?.level ?? 1),
    avatarEnergy: Math.max(0, Math.min(100, user?.avatar?.energy ?? 100)),
    avatarHunger: Math.max(0, Math.min(100, user?.avatar?.hunger ?? 100)),
    checkedAt: new Date().toISOString(),
    warnings: ["Local legacy fallback. WFXP wallet and Buddy-care server projection are not available yet."],
  };
};

const readLegacyServerPreview = async (
  user: User,
  fallback: DashboardUserProjection,
): Promise<DashboardUserProjection> => {
  try {
    const response = await fetch("/api/economy/user-projection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        points: fallback.points,
        xp: fallback.xp,
        level: fallback.level,
        stepsToday: fallback.stepsToday,
        avatar: {
          ...(user.avatar ?? {}),
          level: fallback.avatarLevel,
          energy: fallback.avatarEnergy,
          hunger: fallback.avatarHunger,
        },
      }),
    });

    if (!response.ok) return fallback;

    const data = await response.json() as {
      ok?: boolean;
      projection?: unknown;
    };

    if (!data.ok) return fallback;

    const projection = readObject(data.projection);
    const balance = readObject(projection.balance);
    const avatar = readObject(projection.avatar);

    return {
      ...fallback,
      source: "server",
      points: Math.max(0, asFiniteNumber(balance.points, fallback.points)),
      xp: Math.max(0, asFiniteNumber(balance.xp, fallback.xp)),
      level: Math.max(1, asFiniteNumber(balance.level, fallback.level)),
      stepsToday: Math.max(0, asFiniteNumber(balance.stepsToday, fallback.stepsToday)),
      avatarLevel: Math.max(1, asFiniteNumber(avatar.level, fallback.avatarLevel)),
      avatarEnergy: Math.max(0, Math.min(100, asFiniteNumber(avatar.energy, fallback.avatarEnergy))),
      avatarHunger: Math.max(0, Math.min(100, asFiniteNumber(avatar.hunger, fallback.avatarHunger))),
      checkedAt: new Date().toISOString(),
      warnings: Array.isArray(projection.warnings)
        ? projection.warnings.filter((warning): warning is string => typeof warning === "string")
        : fallback.warnings,
    };
  } catch {
    return fallback;
  }
};

export const fetchDashboardUserProjection = async (user: User | null): Promise<DashboardUserProjection> => {
  const fallback = createLocalDashboardUserProjection(user);
  if (!user) return fallback;

  const [walletResult, legacyPreview, buddyCare] = await Promise.all([
    readXpWalletProjection(),
    readLegacyServerPreview(user, fallback),
    getBuddyCareDashboardSnapshot(),
  ]);

  const walletProjection: DashboardUserProjection = walletResult.data
    ? {
        ...legacyPreview,
        source: "server",
        balanceFinalAuthority: true,
        walletEnabled: true,
        currency: "WFXP",
        points: Math.max(0, walletResult.data.balance),
      }
    : legacyPreview;

  if (!buddyCare.buddy) {
    return {
      ...walletProjection,
      buddyCareServerOwned: false,
      buddyFoodAvailable: buddyCare.foodItemAvailable,
      buddyFoodPriceWfxp: buddyCare.foodItem?.priceWfxp ?? 5,
      buddyCareError: buddyCare.error,
      checkedAt: new Date().toISOString(),
      warnings: [
        ...walletProjection.warnings,
        buddyCare.error ?? "Buddy-care server projection is not available.",
      ],
    };
  }

  return {
    ...walletProjection,
    source: "server",
    buddyCareServerOwned: true,
    buddyFoodAvailable: buddyCare.foodItemAvailable,
    buddyFoodPriceWfxp: buddyCare.foodItem?.priceWfxp ?? 5,
    buddyCareError: buddyCare.error,
    avatarLevel: buddyCare.buddy.level,
    avatarEnergy: buddyCare.buddy.energy,
    avatarHunger: buddyCare.buddy.hunger,
    checkedAt: new Date().toISOString(),
    warnings: [
      ...(walletResult.data
        ? ["Balance comes from the server-authoritative Beta-1 WFXP wallet."]
        : walletProjection.warnings),
      "Buddy hunger, energy and level come from the server-owned userAvatars projection.",
      "Step display remains on the transitional projection until its separate migration is complete.",
      ...(buddyCare.error ? [buddyCare.error] : []),
    ],
  };
};
