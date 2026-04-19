import { DailyMission } from "./missions";

export function calculateDailyReward(
  mission: DailyMission,
  selectedTypes: string[]
) {
  const diversityCount = new Set(selectedTypes).size;

  const diversityMultiplier =
    diversityCount >= 3 ? 1.2 : diversityCount === 2 ? 1.1 : 1;

  const sameTypeCount = selectedTypes.filter(
    (t) => t === mission.type
  ).length;

  const antiFarmingMultiplier = sameTypeCount >= 2 ? 0.8 : 1;

  const finalReward = Math.max(
    1,
    Math.round(mission.reward * diversityMultiplier * antiFarmingMultiplier)
  );

  return {
    finalReward,
    diversityMultiplier,
    antiFarmingMultiplier,
    diversityCount,
  };
}
