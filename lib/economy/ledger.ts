export type LedgerEventType =
  | "mission_completion_requested"
  | "mission_completion_approved"
  | "mission_completion_rejected"
  | "reward_preview_created"
  | "points_granted"
  | "xp_granted"
  | "streak_updated"
  | "cap_applied"
  | "manual_review_requested"
  | "ledger_correction"
  | "spend_preview_created"
  | "points_spent";

export type LedgerEventStatus =
  | "pending"
  | "preview_only"
  | "approved"
  | "rejected"
  | "throttled"
  | "manual_review"
  | "corrected"
  | "voided";

export type LedgerReasonCode =
  | "mission_completed"
  | "proof_quality_low"
  | "duplicate_evidence"
  | "cooldown_active"
  | "daily_user_cap_reached"
  | "mission_type_cap_reached"
  | "global_daily_cap_reached"
  | "suspicious_pattern"
  | "manual_review_required"
  | "correction_applied"
  | "beta_preview_only"
  | "internal_points_spend_preview"
  | "insufficient_internal_points"
  | "internal_points_sink";

export type LedgerSourceType =
  | "mission"
  | "buddy"
  | "dashboard"
  | "system"
  | "manual_review"
  | "correction"
  | "shop";

export type LedgerRiskSummary = {
  proofQuality?: "unknown" | "low" | "medium" | "high";
  cooldownRisk?: "unknown" | "low" | "medium" | "high";
  patternRisk?: "unknown" | "low" | "medium" | "high";
  notes?: string[];
};

export type LedgerCapsApplied = {
  dailyEmissionCap?: boolean;
  userDailyCap?: boolean;
  missionTypeCap?: boolean;
  economyHealthScore?: "unknown" | "healthy" | "watch" | "critical";
};

export type LedgerEventInput = {
  eventType: LedgerEventType;
  userId: string;
  missionId?: string;
  sourceType: LedgerSourceType;
  sourceId: string;
  pointsDelta?: number;
  xpDelta?: number;
  streakDelta?: number;
  status: LedgerEventStatus;
  reasonCode: LedgerReasonCode;
  evidenceSummary?: string;
  riskSummary?: LedgerRiskSummary;
  capsApplied?: LedgerCapsApplied;
  createdBy?: "server" | "system" | "admin" | "beta_helper";
  correlationId?: string;
};

export type LedgerEvent = LedgerEventInput & {
  eventId: string;
  createdAt: string;
  schemaVersion: 1;
};

const MAX_ABSOLUTE_BETA_POINTS_DELTA = 100_000;
const MAX_ABSOLUTE_BETA_XP_DELTA = 100_000;
const MAX_ABSOLUTE_BETA_STREAK_DELTA = 365;

const createLedgerId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `ledger_${Date.now()}_${randomPart}`;
};

const assertFiniteDelta = (label: string, value: number | undefined, maxAbs: number) => {
  if (value === undefined) return;

  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }

  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer.`);
  }

  if (Math.abs(value) > maxAbs) {
    throw new Error(`${label} exceeds the beta safety limit.`);
  }
};

export const isFinalRewardLedgerEvent = (event: LedgerEventInput) => {
  return event.status === "approved" && (event.pointsDelta !== undefined || event.xpDelta !== undefined);
};

export const isClientAuthoritativeLedgerEvent = (event: LedgerEventInput) => {
  return isFinalRewardLedgerEvent(event) && event.createdBy !== "server";
};

export const createLedgerEventDraft = (input: LedgerEventInput): LedgerEvent => {
  if (!input.userId.trim()) {
    throw new Error("userId is required for a ledger event.");
  }

  if (!input.sourceId.trim()) {
    throw new Error("sourceId is required for a ledger event.");
  }

  assertFiniteDelta("pointsDelta", input.pointsDelta, MAX_ABSOLUTE_BETA_POINTS_DELTA);
  assertFiniteDelta("xpDelta", input.xpDelta, MAX_ABSOLUTE_BETA_XP_DELTA);
  assertFiniteDelta("streakDelta", input.streakDelta, MAX_ABSOLUTE_BETA_STREAK_DELTA);

  if (isClientAuthoritativeLedgerEvent(input)) {
    throw new Error("Final points/xp ledger events must be created by the server.");
  }

  return {
    ...input,
    eventId: createLedgerId(),
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy ?? "beta_helper",
    riskSummary: input.riskSummary ?? {
      proofQuality: "unknown",
      cooldownRisk: "unknown",
      patternRisk: "unknown",
    },
    capsApplied: input.capsApplied ?? {
      economyHealthScore: "unknown",
    },
    schemaVersion: 1,
  };
};

export const createRewardPreviewLedgerEvent = (params: {
  userId: string;
  sourceId: string;
  sourceType: LedgerSourceType;
  missionId?: string;
  pointsPreview?: number;
  xpPreview?: number;
  evidenceSummary?: string;
  correlationId?: string;
}): LedgerEvent => {
  return createLedgerEventDraft({
    eventType: "reward_preview_created",
    userId: params.userId,
    missionId: params.missionId,
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    pointsDelta: params.pointsPreview,
    xpDelta: params.xpPreview,
    status: "preview_only",
    reasonCode: "beta_preview_only",
    evidenceSummary: params.evidenceSummary,
    createdBy: "beta_helper",
    correlationId: params.correlationId,
  });
};

export const createManualReviewLedgerEvent = (params: {
  userId: string;
  sourceId: string;
  sourceType: LedgerSourceType;
  missionId?: string;
  reasonCode?: LedgerReasonCode;
  evidenceSummary?: string;
  riskSummary?: LedgerRiskSummary;
  correlationId?: string;
}): LedgerEvent => {
  return createLedgerEventDraft({
    eventType: "manual_review_requested",
    userId: params.userId,
    missionId: params.missionId,
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    status: "manual_review",
    reasonCode: params.reasonCode ?? "manual_review_required",
    evidenceSummary: params.evidenceSummary,
    riskSummary: params.riskSummary,
    createdBy: "beta_helper",
    correlationId: params.correlationId,
  });
};
