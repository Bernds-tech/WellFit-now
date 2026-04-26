const DEFAULT_REWARD_POLICY_VERSION = "preview-v1";

const DEFAULT_MISSION_REWARD_POLICIES = {
  default: {
    policyId: "default_safe_preview_v1",
    missionType: "general",
    ageBand: "all",
    baseRewardRange: { min: 5, max: 30 },
    maxDailyReward: 90,
    maxQuestDepth: 1,
    allowedRadiusMeters: 250,
    requiresParentMode: false,
    allowedTimeWindows: ["morning", "afternoon", "evening"],
    proofRequirements: ["context-evaluation", "completion-evaluation"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 30,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
  child: {
    policyId: "child_safe_preview_v1",
    missionType: "general",
    ageBand: "child",
    baseRewardRange: { min: 3, max: 18 },
    maxDailyReward: 45,
    maxQuestDepth: 1,
    allowedRadiusMeters: 80,
    requiresParentMode: true,
    allowedTimeWindows: ["morning", "afternoon"],
    proofRequirements: ["parent-mode", "context-evaluation", "completion-evaluation"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 18,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
  toddler: {
    policyId: "toddler_strict_preview_v1",
    missionType: "general",
    ageBand: "toddler",
    baseRewardRange: { min: 1, max: 8 },
    maxDailyReward: 20,
    maxQuestDepth: 0,
    allowedRadiusMeters: 25,
    requiresParentMode: true,
    allowedTimeWindows: ["morning", "afternoon"],
    proofRequirements: ["parent-mode", "safe-radius", "context-evaluation"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 8,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
  senior: {
    policyId: "senior_safe_preview_v1",
    missionType: "general",
    ageBand: "senior",
    baseRewardRange: { min: 3, max: 20 },
    maxDailyReward: 50,
    maxQuestDepth: 1,
    allowedRadiusMeters: 150,
    requiresParentMode: false,
    allowedTimeWindows: ["morning", "afternoon", "evening"],
    proofRequirements: ["context-evaluation", "completion-evaluation"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 20,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
};

function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, numericValue));
}

function optionalString(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
}

function selectPolicy(ageBand) {
  const normalizedAgeBand = optionalString(ageBand, "default");
  return DEFAULT_MISSION_REWARD_POLICIES[normalizedAgeBand] || DEFAULT_MISSION_REWARD_POLICIES.default;
}

function policySnapshot(policy, missionType) {
  return {
    policyId: policy.policyId,
    policyVersion: policy.version,
    missionType: optionalString(missionType, policy.missionType),
    ageBand: policy.ageBand,
    baseRewardRange: policy.baseRewardRange,
    maxDailyReward: policy.maxDailyReward,
    maxQuestDepth: policy.maxQuestDepth,
    allowedRadiusMeters: policy.allowedRadiusMeters,
    requiresParentMode: policy.requiresParentMode,
    allowedTimeWindows: policy.allowedTimeWindows,
    proofRequirements: policy.proofRequirements,
    antiFarmingRules: policy.antiFarmingRules,
    systemReserveWeight: policy.systemReserveWeight,
  };
}

function multiplierFromScore(score, fallback, min = 0.25) {
  const normalizedScore = clampNumber(score, 0, 100, fallback);
  return Number(Math.max(min, normalizedScore / 100).toFixed(2));
}

function calculateMissionRewardPreview(input = {}) {
  const missionId = optionalString(input.missionId, "unknown-mission");
  const missionType = optionalString(input.missionType, "general");
  const contextEvaluation = input.contextEvaluation || {};
  const completionEvaluation = input.completionEvaluation || {};
  const ageBand = optionalString(input.ageBand, contextEvaluation.ageBand || "default");
  const policy = selectPolicy(ageBand);
  const requestedBaseReward = clampNumber(
    input.requestedBaseReward,
    policy.baseRewardRange.min,
    policy.baseRewardRange.max,
    policy.baseRewardRange.min
  );
  const contextFitMultiplier = multiplierFromScore(contextEvaluation.contextFitScore, 50);
  const proofQualityMultiplier = multiplierFromScore(contextEvaluation.proofQualityScore, completionEvaluation.evidenceCount > 0 ? 50 : 20, 0.1);
  const safetyMultiplier = multiplierFromScore(contextEvaluation.safetyScore, 50, 0);
  const rejectedByContext = ["reject-or-parent-review"].includes(contextEvaluation.recommendation);
  const evidenceCount = Number(completionEvaluation.evidenceCount || 0);
  const evidenceMultiplier = evidenceCount > 0 ? 0.5 : 0.15;
  const safePreviewReward = rejectedByContext
    ? 0
    : Math.min(
      policy.maxDailyReward,
      Math.round(requestedBaseReward * contextFitMultiplier * proofQualityMultiplier * safetyMultiplier * evidenceMultiplier)
    );

  return {
    previewStatus: rejectedByContext ? "context-rejected-preview" : "simulation-only",
    missionId,
    missionType,
    ageBand,
    policy: policySnapshot(policy, missionType),
    baseRewardPreview: requestedBaseReward,
    multipliers: {
      contextFitMultiplier,
      proofQualityMultiplier,
      ageSafetyMultiplier: safetyMultiplier,
      evidenceMultiplier,
      systemReserveMultiplier: 1,
      questDepthLimiter: 1,
    },
    estimatedInternalPoints: safePreviewReward,
    estimatedXp: safePreviewReward,
    estimatedTokenEquivalent: null,
    estimatedBurnEquivalent: null,
    reason: "RewardPreview ist nur Simulation und schreibt keine Auszahlung gut.",
    flags: Array.isArray(contextEvaluation.flags) ? contextEvaluation.flags : [],
    rewardAuthorized: false,
    xpAuthorized: false,
    pointsAuthorized: false,
    tokenAuthorized: false,
    missionCompletionAuthorized: false,
  };
}

module.exports = {
  DEFAULT_MISSION_REWARD_POLICIES,
  DEFAULT_REWARD_POLICY_VERSION,
  calculateMissionRewardPreview,
};
