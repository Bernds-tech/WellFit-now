const DEFAULT_REWARD_POLICY_VERSION = "preview-v2-proof-quality";

const DEFAULT_MISSION_REWARD_POLICIES = {
  default: {
    policyId: "default_safe_preview_v2",
    missionType: "general",
    ageBand: "all",
    baseRewardRange: { min: 5, max: 30 },
    maxDailyReward: 90,
    maxQuestDepth: 1,
    allowedRadiusMeters: 250,
    requiresParentMode: false,
    allowedTimeWindows: ["morning", "afternoon", "evening"],
    proofRequirements: ["context-evaluation", "completion-evaluation", "evidence-review"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 30,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
  child: {
    policyId: "child_safe_preview_v2",
    missionType: "general",
    ageBand: "child",
    baseRewardRange: { min: 3, max: 18 },
    maxDailyReward: 45,
    maxQuestDepth: 1,
    allowedRadiusMeters: 80,
    requiresParentMode: true,
    allowedTimeWindows: ["morning", "afternoon"],
    proofRequirements: ["parent-mode", "context-evaluation", "completion-evaluation", "evidence-review"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 18,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
  toddler: {
    policyId: "toddler_strict_preview_v2",
    missionType: "general",
    ageBand: "toddler",
    baseRewardRange: { min: 1, max: 8 },
    maxDailyReward: 20,
    maxQuestDepth: 0,
    allowedRadiusMeters: 25,
    requiresParentMode: true,
    allowedTimeWindows: ["morning", "afternoon"],
    proofRequirements: ["parent-mode", "safe-radius", "context-evaluation", "evidence-review"],
    antiFarmingRules: {
      previewOnly: true,
      noPayout: true,
      maxPreviewBaseReward: 8,
    },
    systemReserveWeight: 0,
    version: DEFAULT_REWARD_POLICY_VERSION,
  },
  senior: {
    policyId: "senior_safe_preview_v2",
    missionType: "general",
    ageBand: "senior",
    baseRewardRange: { min: 3, max: 20 },
    maxDailyReward: 50,
    maxQuestDepth: 1,
    allowedRadiusMeters: 150,
    requiresParentMode: false,
    allowedTimeWindows: ["morning", "afternoon", "evening"],
    proofRequirements: ["context-evaluation", "completion-evaluation", "evidence-review"],
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

function calculateEvidenceReviewDampening(evidenceReview = null) {
  if (!evidenceReview) {
    return {
      evidenceReviewMultiplier: 0.65,
      evidenceReviewStatus: "missing-evidence-review",
      evidenceReviewReason: "Keine Evidence Review vorhanden; RewardPreview wird vorsichtig gedrosselt.",
      evidenceReviewFlags: ["missing-evidence-review"],
    };
  }

  const antiCheatRiskScore = clampNumber(evidenceReview.antiCheatRiskScore, 0, 100, 100);
  const proofQualityScore = clampNumber(evidenceReview.proofQualityScore, 0, 100, 0);
  const plausibilityScore = clampNumber(evidenceReview.plausibilityScore, 0, 100, 0);
  const recommendation = optionalString(evidenceReview.recommendation, "manual-review-required");
  const flags = Array.isArray(evidenceReview.flags) ? evidenceReview.flags : [];

  const hardStop = [
    "insufficient-evidence",
    "manual-review-required",
  ].includes(recommendation) || antiCheatRiskScore >= 75 || flags.includes("duplicate-scan-evidence") || flags.includes("context-rejected");

  if (hardStop) {
    return {
      evidenceReviewMultiplier: 0,
      evidenceReviewStatus: "manual-review-required",
      evidenceReviewReason: "Evidence Review ist riskant oder unzureichend; Preview wird auf 0 gesetzt.",
      evidenceReviewFlags: flags,
    };
  }

  if (recommendation === "needs-more-evidence" || antiCheatRiskScore >= 55 || proofQualityScore < 45 || plausibilityScore < 45) {
    return {
      evidenceReviewMultiplier: 0.35,
      evidenceReviewStatus: "dampened-needs-more-evidence",
      evidenceReviewReason: "Evidence Review ist schwach; Preview wird stark gedrosselt.",
      evidenceReviewFlags: flags,
    };
  }

  if (recommendation === "evidence-ok-for-review" && antiCheatRiskScore <= 55 && proofQualityScore >= 55 && plausibilityScore >= 60) {
    return {
      evidenceReviewMultiplier: 1,
      evidenceReviewStatus: "evidence-ok-for-preview",
      evidenceReviewReason: "Evidence Review ist plausibel; Preview bleibt normal simuliert.",
      evidenceReviewFlags: flags,
    };
  }

  return {
    evidenceReviewMultiplier: 0.5,
    evidenceReviewStatus: "dampened-unclear-evidence",
    evidenceReviewReason: "Evidence Review ist uneindeutig; Preview wird moderat gedrosselt.",
    evidenceReviewFlags: flags,
  };
}

function calculateMissionRewardPreview(input = {}) {
  const missionId = optionalString(input.missionId, "unknown-mission");
  const missionType = optionalString(input.missionType, "general");
  const contextEvaluation = input.contextEvaluation || {};
  const completionEvaluation = input.completionEvaluation || {};
  const evidenceReview = input.evidenceReview || null;
  const ageBand = optionalString(input.ageBand, contextEvaluation.ageBand || "default");
  const policy = selectPolicy(ageBand);
  const requestedBaseReward = clampNumber(input.requestedBaseReward, policy.baseRewardRange.min, policy.baseRewardRange.max, policy.baseRewardRange.min);
  const contextFitMultiplier = multiplierFromScore(contextEvaluation.contextFitScore, 50);
  const baseProofQualityMultiplier = multiplierFromScore(contextEvaluation.proofQualityScore, completionEvaluation.evidenceCount > 0 ? 50 : 20, 0.1);
  const safetyMultiplier = multiplierFromScore(contextEvaluation.safetyScore, 50, 0);
  const rejectedByContext = ["reject-or-parent-review"].includes(contextEvaluation.recommendation);
  const evidenceCount = Number(completionEvaluation.evidenceCount || 0);
  const evidenceMultiplier = evidenceCount > 0 ? 0.5 : 0.15;
  const dampening = calculateEvidenceReviewDampening(evidenceReview);
  const proofQualityMultiplier = Number((baseProofQualityMultiplier * dampening.evidenceReviewMultiplier).toFixed(2));

  const safePreviewReward = rejectedByContext
    ? 0
    : Math.min(
      policy.maxDailyReward,
      Math.round(requestedBaseReward * contextFitMultiplier * proofQualityMultiplier * safetyMultiplier * evidenceMultiplier)
    );

  const previewStatus = rejectedByContext
    ? "context-rejected-preview"
    : dampening.evidenceReviewStatus === "manual-review-required"
      ? "manual-review-required"
      : dampening.evidenceReviewStatus === "missing-evidence-review"
        ? "dampened-missing-evidence-review"
        : "simulation-only";

  const contextFlags = Array.isArray(contextEvaluation.flags) ? contextEvaluation.flags : [];

  return {
    previewStatus,
    missionId,
    missionType,
    ageBand,
    policy: policySnapshot(policy, missionType),
    baseRewardPreview: requestedBaseReward,
    multipliers: {
      contextFitMultiplier,
      baseProofQualityMultiplier,
      proofQualityMultiplier,
      ageSafetyMultiplier: safetyMultiplier,
      evidenceMultiplier,
      evidenceReviewMultiplier: dampening.evidenceReviewMultiplier,
      systemReserveMultiplier: 1,
      questDepthLimiter: 1,
    },
    estimatedInternalPoints: safePreviewReward,
    estimatedXp: safePreviewReward,
    estimatedTokenEquivalent: null,
    estimatedBurnEquivalent: null,
    reason: `${dampening.evidenceReviewReason} RewardPreview ist nur Simulation und schreibt keine Auszahlung gut.`,
    flags: Array.from(new Set([...contextFlags, ...dampening.evidenceReviewFlags])),
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
  calculateEvidenceReviewDampening,
};
