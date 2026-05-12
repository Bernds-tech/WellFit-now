import { economyConfig, getPriceRate, getRewardRate } from "@/config/economy";

export type InternalReserveSnapshot = {
  totalSupply: number;
  reserve: number;
  circulating: number;
  burned: number;
  locked: number;
  reserveRatio: number;
  rewardRate: number;
  priceRate: number;
  activeCurrency: "points" | "token";
  tokenEnabled: boolean;
  nftEnabled: boolean;
};

export type InternalReserveSnapshotInput = Partial<
  Pick<InternalReserveSnapshot, "totalSupply" | "reserve" | "circulating" | "burned" | "locked">
>;

export type InternalEconomyHealthInput = InternalReserveSnapshotInput & {
  configuredDailyEmissionCap?: number;
  activeUsersDaily?: number;
  activeUsersMonthly?: number;
  emittedToday?: number;
  sinkReturnedToday?: number;
  requestedPointsToday?: number;
  rejectedEventsToday?: number;
  manualReviewEventsToday?: number;
  suspiciousEventsToday?: number;
};

export type EconomyHealthStatus = "healthy" | "balanced" | "strained" | "critical";

export type InternalEconomyHealthSnapshot = InternalReserveSnapshot & {
  configuredDailyEmissionCap: number;
  reserveBasedDailyBudget: number;
  sinkReturnShare: number;
  effectiveDailyEmissionBudget: number;
  emittedToday: number;
  remainingDailyEmissionBudget: number;
  dailyBudgetUsageRatio: number;
  sinkReturnedToday: number;
  activeUsersDaily: number;
  activeUsersMonthly: number;
  estimatedPerDailyActiveUserBudget: number;
  economyHealthScore: number;
  economyHealthStatus: EconomyHealthStatus;
  rewardThrottleRate: number;
  sinkPriceRate: number;
  reasons: string[];
  finalAuthority: false;
  tokenized: false;
};

const DEFAULT_DAILY_EMISSION_CAP = 5_000_000;
const DEFAULT_RESERVE_DAILY_BUDGET_RATIO = 0.00005;
const DEFAULT_SINK_RETURN_SHARE_RATE = 0.75;

const clampNonNegative = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const clampRatio = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

export const calculateReserveRatio = (reserve: number, totalSupply: number) => {
  if (!Number.isFinite(totalSupply) || totalSupply <= 0) return 0;
  return Math.max(0, Math.min(1, reserve / totalSupply));
};

export const getInternalReserveSnapshot = (
  input: InternalReserveSnapshotInput = {}
): InternalReserveSnapshot => {
  const totalSupply = clampNonNegative(input.totalSupply ?? economyConfig.totalSupply);
  const reserve = clampNonNegative(input.reserve ?? economyConfig.reserve);
  const circulating = clampNonNegative(input.circulating ?? economyConfig.circulating);
  const burned = clampNonNegative(input.burned ?? economyConfig.burned);
  const locked = clampNonNegative(input.locked ?? economyConfig.locked);

  return {
    totalSupply,
    reserve,
    circulating,
    burned,
    locked,
    reserveRatio: calculateReserveRatio(reserve, totalSupply),
    rewardRate: getRewardRate(reserve, totalSupply),
    priceRate: getPriceRate(reserve, totalSupply),
    activeCurrency: economyConfig.activeCurrency,
    tokenEnabled: economyConfig.tokenEnabled,
    nftEnabled: economyConfig.nftEnabled,
  };
};

export const calculateReserveAdjustedReward = (
  basePoints: number,
  snapshot: InternalReserveSnapshot = getInternalReserveSnapshot()
) => {
  if (!Number.isFinite(basePoints)) return 0;
  return Math.max(0, Math.round(basePoints * snapshot.rewardRate));
};

export const calculateReserveAdjustedPrice = (
  basePrice: number,
  snapshot: InternalReserveSnapshot = getInternalReserveSnapshot()
) => {
  if (!Number.isFinite(basePrice)) return 0;
  return Math.max(1, Math.round(basePrice * snapshot.priceRate));
};

export const calculateInternalEconomyHealth = (
  input: InternalEconomyHealthInput = {}
): InternalEconomyHealthSnapshot => {
  const reserveSnapshot = getInternalReserveSnapshot(input);
  const configuredDailyEmissionCap = Math.max(1, clampNonNegative(input.configuredDailyEmissionCap ?? DEFAULT_DAILY_EMISSION_CAP));
  const emittedToday = clampNonNegative(input.emittedToday ?? 0);
  const sinkReturnedToday = clampNonNegative(input.sinkReturnedToday ?? 0);
  const activeUsersDaily = clampNonNegative(input.activeUsersDaily ?? 1);
  const activeUsersMonthly = clampNonNegative(input.activeUsersMonthly ?? activeUsersDaily);
  const rejectedEventsToday = clampNonNegative(input.rejectedEventsToday ?? 0);
  const manualReviewEventsToday = clampNonNegative(input.manualReviewEventsToday ?? 0);
  const suspiciousEventsToday = clampNonNegative(input.suspiciousEventsToday ?? 0);

  const reserveBasedDailyBudget = Math.floor(reserveSnapshot.reserve * DEFAULT_RESERVE_DAILY_BUDGET_RATIO);
  const sinkReturnShare = Math.floor(sinkReturnedToday * DEFAULT_SINK_RETURN_SHARE_RATE);
  const effectiveDailyEmissionBudget = Math.max(0, Math.min(configuredDailyEmissionCap, reserveBasedDailyBudget + sinkReturnShare));
  const remainingDailyEmissionBudget = Math.max(0, effectiveDailyEmissionBudget - emittedToday);
  const dailyBudgetUsageRatio = effectiveDailyEmissionBudget > 0 ? clampRatio(emittedToday / effectiveDailyEmissionBudget) : 1;
  const estimatedPerDailyActiveUserBudget = activeUsersDaily > 0 ? Math.floor(effectiveDailyEmissionBudget / activeUsersDaily) : 0;

  const reserveScore = Math.round(reserveSnapshot.reserveRatio * 45);
  const budgetScore = Math.round((1 - dailyBudgetUsageRatio) * 25);
  const sinkScore = Math.round(clampRatio(sinkReturnedToday / Math.max(1, emittedToday)) * 15);
  const riskPenalty = Math.min(25, suspiciousEventsToday * 3 + manualReviewEventsToday * 2 + rejectedEventsToday);
  const economyHealthScore = Math.max(0, Math.min(100, reserveScore + budgetScore + sinkScore + 15 - riskPenalty));

  const economyHealthStatus: EconomyHealthStatus =
    economyHealthScore >= 80 ? "healthy" :
    economyHealthScore >= 60 ? "balanced" :
    economyHealthScore >= 35 ? "strained" :
    "critical";

  const rewardThrottleRate =
    economyHealthStatus === "healthy" ? 1 :
    economyHealthStatus === "balanced" ? 0.85 :
    economyHealthStatus === "strained" ? 0.55 :
    0.25;

  const sinkPriceRate =
    economyHealthStatus === "healthy" ? reserveSnapshot.priceRate :
    economyHealthStatus === "balanced" ? Math.max(reserveSnapshot.priceRate, 1) :
    economyHealthStatus === "strained" ? Math.max(reserveSnapshot.priceRate, 1.25) :
    Math.max(reserveSnapshot.priceRate, 1.75);

  const reasons: string[] = [];
  if (reserveSnapshot.reserveRatio < 0.2) reasons.push("reserve_low");
  if (dailyBudgetUsageRatio >= 0.9) reasons.push("daily_emission_budget_nearly_used");
  if (sinkReturnedToday < emittedToday * 0.1 && emittedToday > 0) reasons.push("sink_return_low");
  if (suspiciousEventsToday > 0) reasons.push("suspicious_activity_present");
  if (economyHealthStatus === "critical") reasons.push("critical_throttle_required");
  if (reasons.length === 0) reasons.push("economy_within_beta_guardrails");

  return {
    ...reserveSnapshot,
    configuredDailyEmissionCap,
    reserveBasedDailyBudget,
    sinkReturnShare,
    effectiveDailyEmissionBudget,
    emittedToday,
    remainingDailyEmissionBudget,
    dailyBudgetUsageRatio,
    sinkReturnedToday,
    activeUsersDaily,
    activeUsersMonthly,
    estimatedPerDailyActiveUserBudget,
    economyHealthScore,
    economyHealthStatus,
    rewardThrottleRate,
    sinkPriceRate,
    reasons,
    finalAuthority: false,
    tokenized: false,
  };
};

export const calculateEconomyHealthAdjustedReward = (
  basePoints: number,
  snapshot: InternalEconomyHealthSnapshot = calculateInternalEconomyHealth()
) => {
  if (!Number.isFinite(basePoints)) return 0;
  return Math.max(0, Math.round(basePoints * snapshot.rewardRate * snapshot.rewardThrottleRate));
};

export const formatReservePercent = (snapshot: InternalReserveSnapshot) => {
  return `${Math.round(snapshot.reserveRatio * 100)}%`;
};

export const assertInternalPointsMode = (snapshot: InternalReserveSnapshot = getInternalReserveSnapshot()) => {
  if (snapshot.tokenEnabled || snapshot.nftEnabled || snapshot.activeCurrency !== "points") {
    throw new Error("WellFit beta must stay in internal-points mode.");
  }
};
