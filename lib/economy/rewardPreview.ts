import {
  betaInternalEconomyCaps,
  evaluateInternalRewardCaps,
  type EconomyCapDecision,
  type EconomyUsageSnapshot,
  type MissionRewardType,
} from "./caps";
import {
  createManualReviewLedgerEvent,
  createRewardPreviewLedgerEvent,
  type LedgerEvent,
  type LedgerRiskSummary,
  type LedgerSourceType,
} from "./ledger";
import {
  calculateReserveAdjustedReward,
  getInternalReserveSnapshot,
  type InternalReserveSnapshot,
} from "./reserve";

export type RewardPreviewDecision = {
  status: "preview_allowed" | "manual_review" | "blocked";
  requestedPoints: number;
  reserveAdjustedPoints: number;
  cappedPoints: number;
  missionType: MissionRewardType;
  reasons: string[];
  ledgerEvent: LedgerEvent;
  reserveSnapshot: InternalReserveSnapshot;
  rewardRate: number;
  reserveRatio: number;
  capDecision: EconomyCapDecision;
};

export type RewardPreviewInput = {
  userId: string;
  sourceId: string;
  sourceType: LedgerSourceType;
  missionType: MissionRewardType;
  requestedPoints: number;
  requestedXp?: number;
  missionId?: string;
  usage: EconomyUsageSnapshot;
  reserveSnapshot?: InternalReserveSnapshot;
  evidenceSummary?: string;
  riskSummary?: LedgerRiskSummary;
  correlationId?: string;
};

const hasHighRiskSignal = (riskSummary?: LedgerRiskSummary) => {
  if (!riskSummary) return false;

  return (
    riskSummary.proofQuality === "low" ||
    riskSummary.cooldownRisk === "high" ||
    riskSummary.patternRisk === "high"
  );
};

export const createInternalRewardPreviewDecision = (input: RewardPreviewInput): RewardPreviewDecision => {
  const reserveSnapshot = input.reserveSnapshot ?? getInternalReserveSnapshot();
  const reserveAdjustedPoints = calculateReserveAdjustedReward(input.requestedPoints, reserveSnapshot);

  const capDecision = evaluateInternalRewardCaps({
    requestedPoints: reserveAdjustedPoints,
    missionType: input.missionType,
    usage: input.usage,
    caps: betaInternalEconomyCaps,
  });

  const reasons = [...capDecision.reasons];
  const highRisk = hasHighRiskSignal(input.riskSummary);

  if (reserveAdjustedPoints !== input.requestedPoints) {
    reasons.push("reserve_reward_rate_applied");
  }

  if (highRisk) {
    reasons.push("high_risk_signal_manual_review");
  }

  if (!capDecision.allowed || highRisk) {
    const ledgerEvent = createManualReviewLedgerEvent({
      userId: input.userId,
      missionId: input.missionId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      reasonCode: highRisk ? "manual_review_required" : "global_daily_cap_reached",
      evidenceSummary: input.evidenceSummary,
      riskSummary: input.riskSummary,
      correlationId: input.correlationId,
    });

    return {
      status: capDecision.cappedPoints > 0 ? "manual_review" : "blocked",
      requestedPoints: input.requestedPoints,
      reserveAdjustedPoints,
      cappedPoints: capDecision.cappedPoints,
      missionType: input.missionType,
      reasons,
      ledgerEvent,
      reserveSnapshot,
      rewardRate: reserveSnapshot.rewardRate,
      reserveRatio: reserveSnapshot.reserveRatio,
      capDecision,
    };
  }

  return {
    status: "preview_allowed",
    requestedPoints: input.requestedPoints,
    reserveAdjustedPoints,
    cappedPoints: capDecision.cappedPoints,
    missionType: input.missionType,
    reasons,
    reserveSnapshot,
    rewardRate: reserveSnapshot.rewardRate,
    reserveRatio: reserveSnapshot.reserveRatio,
    capDecision,
    ledgerEvent: createRewardPreviewLedgerEvent({
      userId: input.userId,
      missionId: input.missionId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      pointsPreview: capDecision.cappedPoints,
      xpPreview: input.requestedXp,
      evidenceSummary: input.evidenceSummary,
      correlationId: input.correlationId,
    }),
  };
};
