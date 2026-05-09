import {
  createInternalSpendPreviewDecision,
  summarizeInternalSpendDecisionForStorage,
  type InternalSpendDecisionStatus,
  type RewardPreviewDecision,
} from "@/lib/economy";
import type { User } from "@/types/user";
import type { DashboardMissionPreview, PersonalMission } from "../types";
import {
  createDashboardMissionRewardPreview,
  getRewardPreviewUiLabel,
} from "./missionRewardPreview";

type ServerRewardPreviewResponse = {
  ok?: boolean;
  status?: RewardPreviewDecision["status"];
  requestedPoints?: number;
  reserveAdjustedPoints?: number;
  cappedPoints?: number;
  reasons?: string[];
  rewardRate?: number;
  reserveRatio?: number;
  capDecision?: RewardPreviewDecision["capDecision"];
};

export type DashboardSpendPreviewResult = {
  status: InternalSpendDecisionStatus;
  spendPoints: number;
  remainingPoints: number;
  reasons: string[];
  source: "server" | "local";
  itemTitle?: string;
  ledgerSummary: ReturnType<typeof summarizeInternalSpendDecisionForStorage>;
};

const asFiniteNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const isRewardPreviewStatus = (value: unknown): value is RewardPreviewDecision["status"] => {
  return value === "preview_allowed" || value === "manual_review" || value === "blocked";
};

const isSpendDecisionStatus = (value: unknown): value is InternalSpendDecisionStatus => {
  return (
    value === "spend_allowed" ||
    value === "insufficient_points" ||
    value === "item_missing" ||
    value === "blocked"
  );
};

export const fetchDashboardMissionRewardPreview = async (params: {
  user: User | null;
  mission: PersonalMission;
  stepsToday: number;
}): Promise<DashboardMissionPreview> => {
  const fallbackDecision = createDashboardMissionRewardPreview(params);
  const fallbackPreview: DashboardMissionPreview = {
    decision: fallbackDecision,
    label: getRewardPreviewUiLabel(fallbackDecision),
    source: "local",
  };

  try {
    const response = await fetch("/api/economy/reward-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.user?.id ?? "dashboard-preview-user",
        sourceId: `dashboard-mission-${params.mission.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
        sourceType: "dashboard",
        missionType: "movement",
        requestedPoints: params.mission.reward,
        requestedXp: params.mission.reward,
        usage: {
          emittedToday: 0,
          userEarnedToday: Math.max(0, params.user?.points ?? 0),
          missionTypeEarnedToday: 0,
        },
        evidenceSummary: `Dashboard server preview for ${params.mission.title}. Steps today: ${params.stepsToday}.`,
        riskSummary: {
          proofQuality: "unknown",
          cooldownRisk: "unknown",
          patternRisk: "unknown",
          notes: ["Dashboard server preview. No final reward authority."],
        },
      }),
    });

    if (!response.ok) return fallbackPreview;

    const data = (await response.json()) as ServerRewardPreviewResponse;

    if (!data.ok) return fallbackPreview;

    const mergedDecision: RewardPreviewDecision = {
      ...fallbackDecision,
      status: isRewardPreviewStatus(data.status) ? data.status : fallbackDecision.status,
      requestedPoints: asFiniteNumber(data.requestedPoints, fallbackDecision.requestedPoints),
      reserveAdjustedPoints: asFiniteNumber(data.reserveAdjustedPoints, fallbackDecision.reserveAdjustedPoints),
      cappedPoints: asFiniteNumber(data.cappedPoints, fallbackDecision.cappedPoints),
      reasons: Array.isArray(data.reasons) ? data.reasons.filter((reason): reason is string => typeof reason === "string") : fallbackDecision.reasons,
      rewardRate: asFiniteNumber(data.rewardRate, fallbackDecision.rewardRate),
      reserveRatio: asFiniteNumber(data.reserveRatio, fallbackDecision.reserveRatio),
      capDecision: data.capDecision ?? fallbackDecision.capDecision,
    };

    return {
      decision: mergedDecision,
      label: getRewardPreviewUiLabel(mergedDecision),
      source: "server",
      serverPreviewCheckedAt: new Date().toISOString(),
    };
  } catch {
    return fallbackPreview;
  }
};

export const fetchDashboardSpendPreview = async (params: {
  userId: string;
  itemId: string;
  pointsBalance: number;
  sourceId: string;
}): Promise<DashboardSpendPreviewResult> => {
  const fallbackDecision = createInternalSpendPreviewDecision({
    userId: params.userId,
    itemId: params.itemId,
    pointsBalance: params.pointsBalance,
    sourceType: "buddy",
    sourceId: params.sourceId,
  });

  const fallbackResult: DashboardSpendPreviewResult = {
    status: fallbackDecision.status,
    spendPoints: fallbackDecision.spendPoints,
    remainingPoints: fallbackDecision.remainingPoints,
    reasons: fallbackDecision.reasons,
    source: "local",
    itemTitle: fallbackDecision.item?.title,
    ledgerSummary: summarizeInternalSpendDecisionForStorage(fallbackDecision),
  };

  try {
    const response = await fetch("/api/economy/spend-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId,
        itemId: params.itemId,
        pointsBalance: params.pointsBalance,
        sourceId: params.sourceId,
      }),
    });

    if (!response.ok) return fallbackResult;

    const data = (await response.json()) as {
      ok?: boolean;
      status?: unknown;
      item?: { title?: string } | null;
      spendPoints?: number;
      remainingPoints?: number;
      reasons?: string[];
      ledgerSummary?: DashboardSpendPreviewResult["ledgerSummary"];
    };

    if (!data.ok || !isSpendDecisionStatus(data.status)) return fallbackResult;

    return {
      status: data.status,
      spendPoints: Math.max(0, Math.floor(asFiniteNumber(data.spendPoints, fallbackResult.spendPoints))),
      remainingPoints: Math.max(0, Math.floor(asFiniteNumber(data.remainingPoints, fallbackResult.remainingPoints))),
      reasons: Array.isArray(data.reasons) ? data.reasons.filter((reason): reason is string => typeof reason === "string") : fallbackResult.reasons,
      source: "server",
      itemTitle: data.item?.title ?? fallbackResult.itemTitle,
      ledgerSummary: data.ledgerSummary ?? fallbackResult.ledgerSummary,
    };
  } catch {
    return fallbackResult;
  }
};