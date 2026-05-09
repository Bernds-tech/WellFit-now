import {
  createInternalMissionCompletionDecision,
  createInternalSpendPreviewDecision,
  summarizeInternalMissionCompletionForStorage,
  summarizeInternalSpendDecisionForStorage,
  type InternalSpendDecisionStatus,
  type MissionCompletionDecisionStatus,
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

export type DashboardMissionCompletionResult = {
  status: MissionCompletionDecisionStatus;
  approvedPointsPreview: number;
  approvedXpPreview: number;
  reasons: string[];
  source: "server" | "local";
  finalAuthority: false;
  tokenized: false;
  summary: ReturnType<typeof summarizeInternalMissionCompletionForStorage>;
  nextServerStep: string;
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

const isCompletionDecisionStatus = (value: unknown): value is MissionCompletionDecisionStatus => {
  return value === "completion_ready" || value === "manual_review_required" || value === "completion_blocked";
};

const isSpendDecisionStatus = (value: unknown): value is InternalSpendDecisionStatus => {
  return (
    value === "spend_allowed" ||
    value === "insufficient_points" ||
    value === "item_missing" ||
    value === "blocked"
  );
};

const dashboardMissionSourceId = (mission: PersonalMission) => {
  return `dashboard-mission-${mission.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;
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
        sourceId: dashboardMissionSourceId(params.mission),
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

export const fetchDashboardMissionCompletion = async (params: {
  user: User;
  mission: PersonalMission;
  missionPreview?: DashboardMissionPreview;
  stepsToday: number;
}): Promise<DashboardMissionCompletionResult> => {
  const fallbackDecision = createInternalMissionCompletionDecision({
    userId: params.user.id,
    sourceId: dashboardMissionSourceId(params.mission),
    sourceType: "dashboard",
    missionType: "movement",
    requestedPoints: params.missionPreview?.decision.cappedPoints ?? params.mission.reward,
    requestedXp: params.missionPreview?.decision.cappedPoints ?? params.mission.reward,
    usage: {
      emittedToday: 0,
      userEarnedToday: Math.max(0, params.user.points ?? 0),
      missionTypeEarnedToday: 0,
    },
    evidenceSummary: `Dashboard completion fallback for ${params.mission.title}. Steps today: ${params.stepsToday}.`,
    completionEvidenceSummary: "Dashboard mission completion beta bridge. Local fallback does not create final authority.",
    riskSummary: {
      proofQuality: "unknown",
      cooldownRisk: "unknown",
      patternRisk: "unknown",
      notes: ["Dashboard completion fallback. Firestore user patch remains temporary MVP bridge."],
    },
  });

  const fallbackResult: DashboardMissionCompletionResult = {
    status: fallbackDecision.status,
    approvedPointsPreview: fallbackDecision.approvedPointsPreview,
    approvedXpPreview: fallbackDecision.approvedXpPreview,
    reasons: fallbackDecision.reasons,
    source: "local",
    finalAuthority: false,
    tokenized: false,
    summary: summarizeInternalMissionCompletionForStorage(fallbackDecision),
    nextServerStep: fallbackDecision.nextServerStep,
  };

  try {
    const response = await fetch("/api/economy/complete-mission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.user.id,
        sourceId: dashboardMissionSourceId(params.mission),
        sourceType: "dashboard",
        missionType: "movement",
        requestedPoints: params.missionPreview?.decision.cappedPoints ?? params.mission.reward,
        requestedXp: params.missionPreview?.decision.cappedPoints ?? params.mission.reward,
        usage: {
          emittedToday: 0,
          userEarnedToday: Math.max(0, params.user.points ?? 0),
          missionTypeEarnedToday: 0,
        },
        evidenceSummary: `Dashboard mission completion for ${params.mission.title}. Steps today: ${params.stepsToday}.`,
        completionEvidenceSummary: "Dashboard mission completion request. Server decision first, final ledger later.",
        riskSummary: {
          proofQuality: "unknown",
          cooldownRisk: "unknown",
          patternRisk: "unknown",
          notes: ["Dashboard completion uses server decision before MVP user patch."],
        },
      }),
    });

    if (!response.ok) return fallbackResult;

    const data = (await response.json()) as {
      ok?: boolean;
      status?: unknown;
      approvedPointsPreview?: number;
      approvedXpPreview?: number;
      reasons?: string[];
      completionRequestEvent?: DashboardMissionCompletionResult["summary"]["completionRequestEvent"];
      nextServerStep?: string;
    };

    if (!data.ok || !isCompletionDecisionStatus(data.status)) return fallbackResult;

    return {
      status: data.status,
      approvedPointsPreview: Math.max(0, Math.floor(asFiniteNumber(data.approvedPointsPreview, fallbackResult.approvedPointsPreview))),
      approvedXpPreview: Math.max(0, Math.floor(asFiniteNumber(data.approvedXpPreview, fallbackResult.approvedXpPreview))),
      reasons: Array.isArray(data.reasons) ? data.reasons.filter((reason): reason is string => typeof reason === "string") : fallbackResult.reasons,
      source: "server",
      finalAuthority: false,
      tokenized: false,
      summary: {
        ...fallbackResult.summary,
        status: data.status,
        approvedPointsPreview: Math.max(0, Math.floor(asFiniteNumber(data.approvedPointsPreview, fallbackResult.approvedPointsPreview))),
        approvedXpPreview: Math.max(0, Math.floor(asFiniteNumber(data.approvedXpPreview, fallbackResult.approvedXpPreview))),
        reasons: Array.isArray(data.reasons) ? data.reasons.filter((reason): reason is string => typeof reason === "string") : fallbackResult.reasons,
        completionRequestEvent: data.completionRequestEvent ?? fallbackResult.summary.completionRequestEvent,
      },
      nextServerStep: typeof data.nextServerStep === "string" ? data.nextServerStep : fallbackResult.nextServerStep,
    };
  } catch {
    return fallbackResult;
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