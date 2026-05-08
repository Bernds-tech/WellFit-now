import {
  betaInternalEconomyCaps,
  evaluateInternalRewardCaps,
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

export type RewardPreviewDecision = {
  status: "preview_allowed" | "manual_review" | "blocked";
  requestedPoints: number;
  cappedPoints: number;
  missionType: MissionRewardType;
  reasons: string[];
  ledgerEvent: LedgerEvent;
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
  const capDecision = evaluateInternalRewardCaps({
    requestedPoints: input.requestedPoints,
    missionType: input.missionType,
    usage: input.usage,
    caps: betaInternalEconomyCaps,
  });

  const reasons = [...capDecision.reasons];
  const highRisk = hasHighRiskSignal(input.riskSummary);

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
      cappedPoints: capDecision.cappedPoints,
      missionType: input.missionType,
      reasons,
      ledgerEvent,
    };
  }

  return {
    status: "preview_allowed",
    requestedPoints: input.requestedPoints,
    cappedPoints: capDecision.cappedPoints,
    missionType: input.missionType,
    reasons,
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
