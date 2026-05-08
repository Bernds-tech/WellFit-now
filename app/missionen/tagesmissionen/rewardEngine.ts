import {
  createInternalRewardPreviewDecision,
  type EconomyUsageSnapshot,
  type MissionRewardType,
  type RewardPreviewDecision,
} from "@/lib/economy";
import type { DailyMission, DailyMissionType } from "./missions";

export type DailyRewardResult = {
  finalReward: number;
  diversityMultiplier: number;
  antiFarmingMultiplier: number;
  streakMultiplier: number;
  streakBonus: number;
  diversityCount: number;
};

export function mapDailyMissionTypeToRewardType(type: DailyMissionType): MissionRewardType {
  if (type === "Bewegung" || type === "Workout") return "movement";
  if (type === "Community") return "social_challenge";
  if (type === "Abenteuer") return "buddy_guide";
  if (type === "Ernährung") return "learning";
  return "unknown";
}

export function calculateDailyReward(
  mission: DailyMission,
  selectedTypes: string[],
  streakBonus = 0
): DailyRewardResult {
  const diversityCount = new Set(selectedTypes).size;

  const diversityMultiplier =
    diversityCount >= 3 ? 1.2 : diversityCount === 2 ? 1.1 : 1;

  const sameTypeCount = selectedTypes.filter(
    (t) => t === mission.type
  ).length;

  const antiFarmingMultiplier = sameTypeCount >= 2 ? 0.8 : 1;
  const streakMultiplier = 1 + Math.max(0, streakBonus) / 100;

  const finalReward = Math.max(
    1,
    Math.round(mission.reward * diversityMultiplier * antiFarmingMultiplier * streakMultiplier)
  );

  return {
    finalReward,
    diversityMultiplier,
    antiFarmingMultiplier,
    streakMultiplier,
    streakBonus,
    diversityCount,
  };
}

export function createDailyMissionRewardPreview(params: {
  userId: string | null;
  mission: DailyMission;
  selectedTypes: string[];
  streakBonus: number;
  usage?: EconomyUsageSnapshot;
}): RewardPreviewDecision {
  const reward = calculateDailyReward(params.mission, params.selectedTypes, params.streakBonus);
  const missionType = mapDailyMissionTypeToRewardType(params.mission.type);

  return createInternalRewardPreviewDecision({
    userId: params.userId ?? "daily-mission-local-preview",
    missionId: params.mission.id,
    sourceId: `daily-mission-${params.mission.id}`,
    sourceType: "mission",
    missionType,
    requestedPoints: reward.finalReward,
    requestedXp: reward.finalReward,
    usage: params.usage ?? {
      emittedToday: 0,
      userEarnedToday: 0,
      missionTypeEarnedToday: 0,
    },
    evidenceSummary: `Daily mission beta preview: ${params.mission.title}. Existing rewardEngine applied diversity, anti-farming and streak logic.`,
    riskSummary: {
      proofQuality: "unknown",
      cooldownRisk: "unknown",
      patternRisk: "unknown",
      notes: [
        "Daily mission preview only. Final reward authority must become server-side before real billing.",
        "No token, NFT, wallet, trading or payout authority.",
      ],
    },
  });
}

export function getDailyMissionRewardPreviewLabel(decision: RewardPreviewDecision) {
  if (decision.status === "preview_allowed") return "Preview bereit";
  if (decision.status === "manual_review") return "Review nötig";
  return "Blockiert";
}
