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

const clampNonNegative = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
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

export const formatReservePercent = (snapshot: InternalReserveSnapshot) => {
  return `${Math.round(snapshot.reserveRatio * 100)}%`;
};

export const assertInternalPointsMode = (snapshot: InternalReserveSnapshot = getInternalReserveSnapshot()) => {
  if (snapshot.tokenEnabled || snapshot.nftEnabled || snapshot.activeCurrency !== "points") {
    throw new Error("WellFit beta must stay in internal-points mode.");
  }
};
