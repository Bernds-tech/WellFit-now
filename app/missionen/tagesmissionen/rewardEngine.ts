import { DailyMission } from "./missions";

export function calculateDailyReward(
  mission: DailyMission,
  selectedTypes: string[],
  streakBonus = 0
) {
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
