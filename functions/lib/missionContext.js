const AGE_BANDS = ["toddler", "child", "teen", "adult", "senior", "unknown"];
const DAY_TYPES = ["school-day", "weekday", "weekend", "holiday", "unknown"];
const TIME_WINDOWS = ["morning", "afternoon", "evening", "night", "unknown"];
const PARENT_MODES = ["required", "enabled", "not-required", "unknown"];
const GPS_SAFETY_STATUSES = ["inside-radius", "near-radius", "outside-radius", "unavailable", "unknown"];
const PROOF_QUALITIES = ["none", "low", "medium", "high", "manual-test"];

const AGE_BAND_LIMITS = {
  toddler: { allowedRadiusMeters: 25, requiresParentMode: true, maxEstimatedMinutes: 10 },
  child: { allowedRadiusMeters: 100, requiresParentMode: true, maxEstimatedMinutes: 20 },
  teen: { allowedRadiusMeters: 500, requiresParentMode: false, maxEstimatedMinutes: 45 },
  adult: { allowedRadiusMeters: 1500, requiresParentMode: false, maxEstimatedMinutes: 90 },
  senior: { allowedRadiusMeters: 500, requiresParentMode: false, maxEstimatedMinutes: 45 },
  unknown: { allowedRadiusMeters: 50, requiresParentMode: true, maxEstimatedMinutes: 15 },
};

function normalizeEnum(value, allowedValues, fallback) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function evaluateMissionContext(input = {}) {
  const ageBand = normalizeEnum(input.ageBand, AGE_BANDS, "unknown");
  const dayType = normalizeEnum(input.dayType, DAY_TYPES, "unknown");
  const timeWindow = normalizeEnum(input.timeWindow, TIME_WINDOWS, "unknown");
  const parentMode = normalizeEnum(input.parentMode, PARENT_MODES, "unknown");
  const gpsSafetyStatus = normalizeEnum(input.gpsSafetyStatus, GPS_SAFETY_STATUSES, "unknown");
  const proofQuality = normalizeEnum(input.proofQuality, PROOF_QUALITIES, "none");
  const estimatedMinutes = normalizeNumber(input.estimatedMinutes, 0, 0, 240);
  const providedRadiusMeters = normalizeNumber(input.radiusMeters, 0, 0, 10000);
  const ageLimits = AGE_BAND_LIMITS[ageBand] || AGE_BAND_LIMITS.unknown;

  const flags = [];
  let safetyScore = 100;
  let contextFitScore = 100;
  let proofQualityScore = 0;

  if (ageLimits.requiresParentMode && parentMode !== "enabled" && parentMode !== "required") {
    flags.push("parent-mode-required");
    safetyScore -= 35;
  }

  if ((ageBand === "toddler" || ageBand === "child") && timeWindow === "night") {
    flags.push("night-not-safe-for-child");
    safetyScore -= 45;
  }

  if (gpsSafetyStatus === "outside-radius") {
    flags.push("outside-radius");
    safetyScore -= 40;
  } else if (gpsSafetyStatus === "near-radius") {
    flags.push("near-radius");
    safetyScore -= 15;
  } else if (gpsSafetyStatus === "unavailable" || gpsSafetyStatus === "unknown") {
    flags.push("gps-context-weak");
    safetyScore -= 10;
  }

  if (providedRadiusMeters > ageLimits.allowedRadiusMeters) {
    flags.push("radius-exceeds-age-band-limit");
    safetyScore -= 25;
  }

  if (estimatedMinutes > ageLimits.maxEstimatedMinutes) {
    flags.push("estimated-duration-exceeds-age-band-limit");
    contextFitScore -= 25;
  }

  if (dayType === "school-day" && estimatedMinutes > 30 && (ageBand === "child" || ageBand === "teen")) {
    flags.push("school-day-duration-risk");
    contextFitScore -= 15;
  }

  if (proofQuality === "high") proofQualityScore = 90;
  if (proofQuality === "medium") proofQualityScore = 65;
  if (proofQuality === "low") proofQualityScore = 35;
  if (proofQuality === "manual-test") proofQualityScore = 50;
  if (proofQuality === "none") {
    proofQualityScore = 0;
    flags.push("proof-missing");
  }

  safetyScore = Math.max(0, Math.min(100, safetyScore));
  contextFitScore = Math.max(0, Math.min(100, contextFitScore));

  let recommendation = "needs-review";
  if (flags.includes("parent-mode-required") || flags.includes("night-not-safe-for-child") || flags.includes("outside-radius")) {
    recommendation = "reject-or-parent-review";
  } else if (safetyScore >= 80 && contextFitScore >= 75 && proofQualityScore >= 50) {
    recommendation = "context-ok-for-review";
  }

  return {
    ageBand,
    dayType,
    timeWindow,
    parentMode,
    gpsSafetyStatus,
    proofQuality,
    allowedRadiusMeters: ageLimits.allowedRadiusMeters,
    radiusMeters: providedRadiusMeters,
    estimatedMinutes,
    requiresParentMode: ageLimits.requiresParentMode,
    safetyScore,
    contextFitScore,
    proofQualityScore,
    recommendation,
    flags,
    rewardAuthorized: false,
    missionCompletionAuthorized: false,
  };
}

module.exports = {
  AGE_BANDS,
  DAY_TYPES,
  TIME_WINDOWS,
  PARENT_MODES,
  GPS_SAFETY_STATUSES,
  PROOF_QUALITIES,
  evaluateMissionContext,
};
