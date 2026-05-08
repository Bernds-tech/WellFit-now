import {
  createInternalRewardPreviewDecision,
  type RewardPreviewDecision,
} from "@/lib/economy";
import type { User } from "@/types/user";
import type { PersonalMission } from "../types";

export const createDashboardMissionRewardPreview = (params: {
  user: User | null;
  mission: PersonalMission;
  stepsToday: number;
}): RewardPreviewDecision => {
  const userId = params.user?.id ?? "dashboard-preview-user";
  const missionId = params.mission.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-");

  return createInternalRewardPreviewDecision({
    userId,
    missionId,
    sourceId: `dashboard-mission-${missionId}`,
    sourceType: "dashboard",
    missionType: "movement",
    requestedPoints: params.mission.reward,
    requestedXp: params.mission.reward,
    usage: {
      emittedToday: 0,
      userEarnedToday: Math.max(0, params.user?.points ?? 0),
      missionTypeEarnedToday: 0,
    },
    evidenceSummary: `Dashboard beta preview for ${params.mission.title}. Steps today: ${params.stepsToday}.`,
    riskSummary: {
      proofQuality: "unknown",
      cooldownRisk: "unknown",
      patternRisk: "unknown",
      notes: ["Dashboard preview only. Final mission reward authority remains server-side."],
    },
  });
};

export const getRewardPreviewUiLabel = (decision: RewardPreviewDecision) => {
  if (decision.status === "preview_allowed") return "Preview bereit";
  if (decision.status === "manual_review") return "Review nötig";
  return "Blockiert";
};
