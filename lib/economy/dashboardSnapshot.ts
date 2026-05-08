import {
  betaInternalEconomyCaps,
  evaluateInternalRewardCaps,
  type EconomyCapDecision,
  type MissionRewardType,
} from "./caps";
import { getInternalReserveSnapshot, type InternalReserveSnapshot } from "./reserve";
import { createInternalRewardPreviewDecision, type RewardPreviewDecision } from "./rewardPreview";

export type DashboardEconomySnapshot = {
  pointsBalance: number;
  displayBalance: string;
  currencyLabel: "interne Punkte";
  ledgerStatus: "preview" | "internal_ledger_first";
  tokenStatus: "disabled_until_internal_billing_is_stable";
  healthState: EconomyCapDecision["healthState"];
  dailyEmissionCap: number;
  userDailyCap: number;
  sampleRewardPreview: RewardPreviewDecision;
  reserveSnapshot: InternalReserveSnapshot;
  reserveDisplay: string;
  rewardRateDisplay: string;
  priceRateDisplay: string;
};

export const createDashboardEconomySnapshot = (params: {
  pointsBalance: number;
  userId?: string;
  missionType?: MissionRewardType;
  requestedPoints?: number;
}): DashboardEconomySnapshot => {
  const requestedPoints = params.requestedPoints ?? 25;
  const missionType = params.missionType ?? "movement";
  const userId = params.userId ?? "beta-dashboard-preview";
  const reserveSnapshot = getInternalReserveSnapshot();

  const capDecision = evaluateInternalRewardCaps({
    requestedPoints,
    missionType,
    usage: {
      emittedToday: 0,
      userEarnedToday: 0,
      missionTypeEarnedToday: 0,
    },
  });

  const sampleRewardPreview = createInternalRewardPreviewDecision({
    userId,
    sourceId: "dashboard-economy-preview",
    sourceType: "dashboard",
    missionType,
    requestedPoints,
    reserveSnapshot,
    usage: {
      emittedToday: 0,
      userEarnedToday: 0,
      missionTypeEarnedToday: 0,
    },
    evidenceSummary: "Dashboard-only beta preview. No final reward authority.",
  });

  return {
    pointsBalance: params.pointsBalance,
    displayBalance: params.pointsBalance.toLocaleString("de-DE"),
    currencyLabel: "interne Punkte",
    ledgerStatus: "internal_ledger_first",
    tokenStatus: "disabled_until_internal_billing_is_stable",
    healthState: capDecision.healthState,
    dailyEmissionCap: betaInternalEconomyCaps.dailyEmissionCap,
    userDailyCap: betaInternalEconomyCaps.userDailyCap,
    sampleRewardPreview,
    reserveSnapshot,
    reserveDisplay: `${Math.round(reserveSnapshot.reserveRatio * 100)}%`,
    rewardRateDisplay: `${reserveSnapshot.rewardRate.toFixed(2)}x`,
    priceRateDisplay: `${reserveSnapshot.priceRate.toFixed(2)}x`,
  };
};
