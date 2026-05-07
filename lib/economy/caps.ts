export type MissionRewardType =
  | "movement"
  | "learning"
  | "ar_riddle"
  | "nfc_scan"
  | "social_challenge"
  | "buddy_guide"
  | "unknown";

export type EconomyHealthState = "healthy" | "watch" | "critical";

export type InternalEconomyCaps = {
  dailyEmissionCap: number;
  userDailyCap: number;
  missionTypeCaps: Record<MissionRewardType, number>;
  economyHealthWarningRatio: number;
  economyHealthCriticalRatio: number;
};

export type EconomyUsageSnapshot = {
  emittedToday: number;
  userEarnedToday: number;
  missionTypeEarnedToday: number;
};

export type EconomyCapDecision = {
  allowed: boolean;
  cappedPoints: number;
  healthState: EconomyHealthState;
  reasons: string[];
  capsApplied: {
    dailyEmissionCap: boolean;
    userDailyCap: boolean;
    missionTypeCap: boolean;
    economyHealthScore: EconomyHealthState;
  };
};

export const betaInternalEconomyCaps: InternalEconomyCaps = {
  dailyEmissionCap: 100_000,
  userDailyCap: 500,
  missionTypeCaps: {
    movement: 120,
    learning: 100,
    ar_riddle: 150,
    nfc_scan: 80,
    social_challenge: 120,
    buddy_guide: 60,
    unknown: 50,
  },
  economyHealthWarningRatio: 0.75,
  economyHealthCriticalRatio: 0.95,
};

const clampNonNegativeInteger = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

export const getEconomyHealthState = (
  emittedToday: number,
  dailyEmissionCap: number,
  caps: Pick<InternalEconomyCaps, "economyHealthWarningRatio" | "economyHealthCriticalRatio"> = betaInternalEconomyCaps
): EconomyHealthState => {
  if (dailyEmissionCap <= 0) return "critical";

  const ratio = emittedToday / dailyEmissionCap;

  if (ratio >= caps.economyHealthCriticalRatio) return "critical";
  if (ratio >= caps.economyHealthWarningRatio) return "watch";
  return "healthy";
};

export const evaluateInternalRewardCaps = (params: {
  requestedPoints: number;
  missionType: MissionRewardType;
  usage: EconomyUsageSnapshot;
  caps?: InternalEconomyCaps;
}): EconomyCapDecision => {
  const caps = params.caps ?? betaInternalEconomyCaps;
  const requestedPoints = clampNonNegativeInteger(params.requestedPoints);
  const missionTypeCap = caps.missionTypeCaps[params.missionType] ?? caps.missionTypeCaps.unknown;
  const remainingDaily = Math.max(0, caps.dailyEmissionCap - params.usage.emittedToday);
  const remainingUser = Math.max(0, caps.userDailyCap - params.usage.userEarnedToday);
  const remainingMissionType = Math.max(0, missionTypeCap - params.usage.missionTypeEarnedToday);
  const cappedPoints = Math.min(requestedPoints, remainingDaily, remainingUser, remainingMissionType);
  const healthState = getEconomyHealthState(params.usage.emittedToday + cappedPoints, caps.dailyEmissionCap, caps);

  const reasons: string[] = [];

  if (requestedPoints <= 0) reasons.push("requested_points_zero");
  if (remainingDaily <= 0) reasons.push("global_daily_cap_reached");
  if (remainingUser <= 0) reasons.push("user_daily_cap_reached");
  if (remainingMissionType <= 0) reasons.push("mission_type_cap_reached");
  if (cappedPoints < requestedPoints) reasons.push("reward_capped");
  if (healthState === "critical") reasons.push("economy_health_critical");
  if (healthState === "watch") reasons.push("economy_health_watch");

  return {
    allowed: cappedPoints > 0 && healthState !== "critical",
    cappedPoints,
    healthState,
    reasons,
    capsApplied: {
      dailyEmissionCap: cappedPoints < requestedPoints && remainingDaily <= requestedPoints,
      userDailyCap: cappedPoints < requestedPoints && remainingUser <= requestedPoints,
      missionTypeCap: cappedPoints < requestedPoints && remainingMissionType <= requestedPoints,
      economyHealthScore: healthState,
    },
  };
};
