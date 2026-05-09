import {
  createInternalMissionCompletionDecision,
  summarizeInternalMissionCompletionForStorage,
  type MissionCompletionDecisionStatus,
  type RewardPreviewDecision,
} from "@/lib/economy";
import type { DailyMission } from "./missions";
import { mapDailyMissionTypeToRewardType } from "./rewardEngine";

export type DailyMissionCompletionResult = {
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

const asFiniteNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const isCompletionDecisionStatus = (value: unknown): value is MissionCompletionDecisionStatus => {
  return value === "completion_ready" || value === "manual_review_required" || value === "completion_blocked";
};

export async function fetchDailyMissionCompletion(params: {
  userId: string | null;
  mission: DailyMission;
  rewardPreview: RewardPreviewDecision;
  selectedTypes: string[];
  streakBonus: number;
}): Promise<DailyMissionCompletionResult> {
  const fallbackDecision = createInternalMissionCompletionDecision({
    userId: params.userId ?? "daily-mission-local-completion",
    missionId: params.mission.id,
    sourceId: `daily-mission-${params.mission.id}`,
    sourceType: "mission",
    missionType: mapDailyMissionTypeToRewardType(params.mission.type),
    requestedPoints: params.rewardPreview.cappedPoints,
    requestedXp: params.rewardPreview.cappedPoints,
    usage: {
      emittedToday: 0,
      userEarnedToday: 0,
      missionTypeEarnedToday: 0,
    },
    evidenceSummary: `Daily mission completion fallback: ${params.mission.title}.`,
    completionEvidenceSummary: "Daily mission completion beta bridge. Local fallback does not create final authority.",
    riskSummary: {
      proofQuality: "unknown",
      cooldownRisk: "unknown",
      patternRisk: "unknown",
      notes: [
        "Daily mission completion fallback. Firebase state write remains a temporary MVP bridge.",
        `Selected mission types: ${params.selectedTypes.join(", ") || "none"}. Streak bonus: ${params.streakBonus}.`,
      ],
    },
  });

  const fallbackResult: DailyMissionCompletionResult = {
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
        userId: params.userId ?? "daily-mission-local-completion",
        missionId: params.mission.id,
        sourceId: `daily-mission-${params.mission.id}`,
        sourceType: "mission",
        missionType: mapDailyMissionTypeToRewardType(params.mission.type),
        requestedPoints: params.rewardPreview.cappedPoints,
        requestedXp: params.rewardPreview.cappedPoints,
        usage: {
          emittedToday: 0,
          userEarnedToday: 0,
          missionTypeEarnedToday: 0,
        },
        evidenceSummary: `Daily mission completion request: ${params.mission.title}.`,
        completionEvidenceSummary: "Daily mission completion request. Server decision first, final ledger later.",
        riskSummary: {
          proofQuality: "unknown",
          cooldownRisk: "unknown",
          patternRisk: "unknown",
          notes: [
            "Daily mission completion uses server decision before MVP Firebase state write.",
            `Selected mission types: ${params.selectedTypes.join(", ") || "none"}. Streak bonus: ${params.streakBonus}.`,
          ],
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
      completionRequestEvent?: DailyMissionCompletionResult["summary"]["completionRequestEvent"];
      nextServerStep?: string;
    };

    if (!data.ok || !isCompletionDecisionStatus(data.status)) return fallbackResult;

    const approvedPointsPreview = Math.max(
      0,
      Math.floor(asFiniteNumber(data.approvedPointsPreview, fallbackResult.approvedPointsPreview))
    );
    const approvedXpPreview = Math.max(
      0,
      Math.floor(asFiniteNumber(data.approvedXpPreview, fallbackResult.approvedXpPreview))
    );
    const reasons = Array.isArray(data.reasons)
      ? data.reasons.filter((reason): reason is string => typeof reason === "string")
      : fallbackResult.reasons;

    return {
      status: data.status,
      approvedPointsPreview,
      approvedXpPreview,
      reasons,
      source: "server",
      finalAuthority: false,
      tokenized: false,
      summary: {
        ...fallbackResult.summary,
        status: data.status,
        approvedPointsPreview,
        approvedXpPreview,
        reasons,
        completionRequestEvent: data.completionRequestEvent ?? fallbackResult.summary.completionRequestEvent,
      },
      nextServerStep: typeof data.nextServerStep === "string" ? data.nextServerStep : fallbackResult.nextServerStep,
    };
  } catch {
    return fallbackResult;
  }
}
