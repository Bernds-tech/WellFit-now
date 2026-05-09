import {
  createInternalRewardPreviewDecision,
  type RewardPreviewDecision,
  type RewardPreviewInput,
} from "./rewardPreview";
import { createLedgerEventDraft, type LedgerEvent } from "./ledger";

export type MissionCompletionDecisionStatus =
  | "completion_ready"
  | "manual_review_required"
  | "completion_blocked";

export type MissionCompletionDecision = {
  status: MissionCompletionDecisionStatus;
  finalAuthority: false;
  tokenized: false;
  requestedPoints: number;
  approvedPointsPreview: number;
  approvedXpPreview: number;
  reasons: string[];
  rewardPreview: RewardPreviewDecision;
  completionRequestEvent: LedgerEvent;
  nextServerStep: string;
};

export type MissionCompletionInput = RewardPreviewInput & {
  clientCompletedAt?: string;
  completionEvidenceSummary?: string;
};

const normalizeXpPreview = (input: MissionCompletionInput, approvedPointsPreview: number) => {
  const requestedXp = Number(input.requestedXp ?? approvedPointsPreview);
  return Number.isFinite(requestedXp) ? Math.max(0, Math.floor(requestedXp)) : approvedPointsPreview;
};

export function createInternalMissionCompletionDecision(
  input: MissionCompletionInput
): MissionCompletionDecision {
  const rewardPreview = createInternalRewardPreviewDecision(input);
  const approvedPointsPreview = Math.max(0, Math.floor(rewardPreview.cappedPoints));
  const approvedXpPreview = normalizeXpPreview(input, approvedPointsPreview);
  const reasons = [...rewardPreview.reasons];

  let status: MissionCompletionDecisionStatus = "completion_ready";
  let nextServerStep =
    "Persist a server-created mission_completion_requested event, then grant points only from a server-authorized ledger transaction.";

  if (rewardPreview.status === "manual_review") {
    status = "manual_review_required";
    reasons.push("completion_requires_manual_review_before_grant");
    nextServerStep =
      "Persist manual review request. Do not grant points/xp until a server/admin review approves a ledger event.";
  }

  if (rewardPreview.status === "blocked" || approvedPointsPreview <= 0) {
    status = "completion_blocked";
    reasons.push("completion_blocked_no_final_grant");
    nextServerStep =
      "Persist blocked/rejected audit trace only. Do not grant points/xp.";
  }

  const completionRequestEvent = createLedgerEventDraft({
    eventType: "mission_completion_requested",
    userId: input.userId,
    missionId: input.missionId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    pointsDelta: status === "completion_ready" ? approvedPointsPreview : undefined,
    xpDelta: status === "completion_ready" ? approvedXpPreview : undefined,
    status: status === "completion_ready" ? "pending" : status === "manual_review_required" ? "manual_review" : "rejected",
    reasonCode:
      status === "completion_ready"
        ? "beta_preview_only"
        : status === "manual_review_required"
          ? "manual_review_required"
          : "global_daily_cap_reached",
    evidenceSummary:
      input.completionEvidenceSummary ?? input.evidenceSummary ?? "Mission completion request. No final client authority.",
    riskSummary: input.riskSummary,
    createdBy: "server",
    correlationId: input.correlationId,
  });

  return {
    status,
    finalAuthority: false,
    tokenized: false,
    requestedPoints: input.requestedPoints,
    approvedPointsPreview,
    approvedXpPreview,
    reasons,
    rewardPreview,
    completionRequestEvent,
    nextServerStep,
  };
}

export function summarizeInternalMissionCompletionForStorage(decision: MissionCompletionDecision) {
  return {
    status: decision.status,
    finalAuthority: decision.finalAuthority,
    tokenized: decision.tokenized,
    requestedPoints: decision.requestedPoints,
    approvedPointsPreview: decision.approvedPointsPreview,
    approvedXpPreview: decision.approvedXpPreview,
    reasons: decision.reasons,
    rewardPreviewStatus: decision.rewardPreview.status,
    completionRequestEvent: {
      eventId: decision.completionRequestEvent.eventId,
      eventType: decision.completionRequestEvent.eventType,
      status: decision.completionRequestEvent.status,
      reasonCode: decision.completionRequestEvent.reasonCode,
      pointsDelta: decision.completionRequestEvent.pointsDelta ?? 0,
      xpDelta: decision.completionRequestEvent.xpDelta ?? 0,
      schemaVersion: decision.completionRequestEvent.schemaVersion,
      createdAt: decision.completionRequestEvent.createdAt,
    },
  };
}
