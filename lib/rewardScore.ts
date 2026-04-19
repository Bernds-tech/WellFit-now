export type RewardScoreInput = {
  baseReward: number;
  systemRewardRate: number;
  avatarMultiplier: number;
  userEconomyMultiplier: number;
  precisionFactor?: number;
  socialMultiplier?: number;
  streakMultiplier?: number;
  sponsorMultiplier?: number;
  validationRisk?: number;
  diversityMultiplier?: number;
  antiFarmingMultiplier?: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function calculateDynamicRewardScore(input: RewardScoreInput) {
  const precisionFactor = clamp(input.precisionFactor ?? 1, 0.7, 1.15);
  const socialMultiplier = clamp(input.socialMultiplier ?? 1, 1, 1.2);
  const streakMultiplier = clamp(input.streakMultiplier ?? 1, 0.95, 1.15);
  const sponsorMultiplier = clamp(input.sponsorMultiplier ?? 1, 1, 1.5);
  const diversityMultiplier = clamp(input.diversityMultiplier ?? 1, 1, 1.25);
  const antiFarmingMultiplier = clamp(input.antiFarmingMultiplier ?? 1, 0.5, 1);
  const validationRisk = clamp(input.validationRisk ?? 0, 0, 1);
  const integrityMultiplier = clamp(1 - validationRisk * 0.35, 0.65, 1);

  const raw =
    input.baseReward *
    input.systemRewardRate *
    input.avatarMultiplier *
    input.userEconomyMultiplier *
    precisionFactor *
    socialMultiplier *
    streakMultiplier *
    sponsorMultiplier *
    diversityMultiplier *
    antiFarmingMultiplier *
    integrityMultiplier;

  return {
    finalReward: Math.max(1, Math.round(raw)),
    precisionFactor,
    socialMultiplier,
    streakMultiplier,
    sponsorMultiplier,
    diversityMultiplier,
    antiFarmingMultiplier,
    integrityMultiplier,
    validationRisk,
  };
}
