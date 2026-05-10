export type DailyMissionProjectionSource = "server" | "local";

export type DailyMissionProjection = {
  source: DailyMissionProjectionSource;
  finalAuthority: false;
  tokenized: false;
  walletEnabled: false;
  nftEnabled: false;
  writeEnabledNow: false;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  checkedAt: string;
  warnings: string[];
};

const asFiniteNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const readObject = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
};

export const createLocalDailyMissionProjection = (params: {
  userId: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}): DailyMissionProjection => ({
  source: "local",
  finalAuthority: false,
  tokenized: false,
  walletEnabled: false,
  nftEnabled: false,
  writeEnabledNow: false,
  xp: Math.max(0, params.xp),
  level: Math.max(1, params.level),
  currentStreak: Math.max(0, params.currentStreak),
  longestStreak: Math.max(0, params.longestStreak),
  checkedAt: new Date().toISOString(),
  warnings: [
    params.userId
      ? "Local daily mission projection fallback. Final authority remains server ledger/projection target."
      : "Local daily mission projection fallback because no user profile is loaded.",
  ],
});

export const fetchDailyMissionProjection = async (params: {
  userId: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}): Promise<DailyMissionProjection> => {
  const fallback = createLocalDailyMissionProjection(params);
  if (!params.userId) return fallback;

  try {
    const response = await fetch("/api/economy/user-projection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId,
        xp: params.xp,
        level: params.level,
        currentStreak: params.currentStreak,
        longestStreak: params.longestStreak,
      }),
    });

    if (!response.ok) return fallback;

    const data = (await response.json()) as { ok?: boolean; projection?: unknown };
    if (!data.ok) return fallback;

    const projection = readObject(data.projection);
    const balance = readObject(projection.balance);
    const daily = readObject(projection.daily);

    return {
      source: "server",
      finalAuthority: false,
      tokenized: false,
      walletEnabled: false,
      nftEnabled: false,
      writeEnabledNow: false,
      xp: Math.max(0, asFiniteNumber(balance.xp, fallback.xp)),
      level: Math.max(1, asFiniteNumber(balance.level, fallback.level)),
      currentStreak: Math.max(0, asFiniteNumber(daily.currentStreak, fallback.currentStreak)),
      longestStreak: Math.max(0, asFiniteNumber(daily.longestStreak, fallback.longestStreak)),
      checkedAt: new Date().toISOString(),
      warnings: Array.isArray(projection.warnings)
        ? projection.warnings.filter((warning): warning is string => typeof warning === "string")
        : fallback.warnings,
    };
  } catch {
    return fallback;
  }
};
