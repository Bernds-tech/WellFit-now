import type { MissionCompletionDecision } from "./completion";
import type { LedgerEvent } from "./ledger";
import type { RewardPreviewDecision } from "./rewardPreview";
import type { InternalSpendDecision } from "./spend";

export type EconomyServerCollectionName =
  | "missionRewardPreviews"
  | "missionRewardEvents"
  | "missionCompletionEvaluations"
  | "missionContextEvaluations";

export type EconomyServerLedgerDraft = {
  collection: EconomyServerCollectionName;
  documentId: string;
  mode: "internal_points_beta";
  finalAuthority: false;
  tokenized: false;
  writeNow: false;
  createdAt: string;
  record: Record<string, unknown>;
};

const safeDocumentId = (parts: Array<string | undefined | null>) => {
  const raw = parts
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join("_");

  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180) || `economy-draft-${Date.now()}`;
};

const summarizeLedgerEvent = (event: LedgerEvent) => ({
  eventId: event.eventId,
  eventType: event.eventType,
  userId: event.userId,
  missionId: event.missionId,
  sourceType: event.sourceType,
  sourceId: event.sourceId,
  status: event.status,
  reasonCode: event.reasonCode,
  pointsDelta: event.pointsDelta ?? 0,
  xpDelta: event.xpDelta ?? 0,
  streakDelta: event.streakDelta ?? 0,
  createdAt: event.createdAt,
  schemaVersion: event.schemaVersion,
});

export function createRewardPreviewServerDraft(decision: RewardPreviewDecision): EconomyServerLedgerDraft {
  const event = decision.ledgerEvent;

  return {
    collection: "missionRewardPreviews",
    documentId: safeDocumentId([event.userId, event.missionId, event.eventId]),
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    writeNow: false,
    createdAt: new Date().toISOString(),
    record: {
      userId: event.userId,
      missionId: event.missionId,
      status: decision.status,
      requestedPoints: decision.requestedPoints,
      reserveAdjustedPoints: decision.reserveAdjustedPoints,
      cappedPoints: decision.cappedPoints,
      rewardRate: decision.rewardRate,
      reserveRatio: decision.reserveRatio,
      reasons: decision.reasons,
      capDecision: decision.capDecision,
      ledgerEvent: summarizeLedgerEvent(event),
      serverNote: "Server draft only. No final points, token, NFT, wallet or payout authority.",
    },
  };
}

export function createMissionCompletionServerDraft(
  decision: MissionCompletionDecision
): EconomyServerLedgerDraft {
  const event = decision.completionRequestEvent;

  return {
    collection: "missionCompletionEvaluations",
    documentId: safeDocumentId([event.userId, event.missionId, event.eventId]),
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    writeNow: false,
    createdAt: new Date().toISOString(),
    record: {
      userId: event.userId,
      missionId: event.missionId,
      status: decision.status,
      requestedPoints: decision.requestedPoints,
      approvedPointsPreview: decision.approvedPointsPreview,
      approvedXpPreview: decision.approvedXpPreview,
      reasons: decision.reasons,
      rewardPreviewStatus: decision.rewardPreview.status,
      completionRequestEvent: summarizeLedgerEvent(event),
      nextServerStep: decision.nextServerStep,
      serverNote: "Server completion draft only. Final ledger write is intentionally not active yet.",
    },
  };
}

export function createMissionRewardEventServerDraft(
  decision: MissionCompletionDecision
): EconomyServerLedgerDraft {
  const event = decision.completionRequestEvent;

  return {
    collection: "missionRewardEvents",
    documentId: safeDocumentId([event.userId, event.missionId, event.eventId, "reward-event"]),
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    writeNow: false,
    createdAt: new Date().toISOString(),
    record: {
      userId: event.userId,
      missionId: event.missionId,
      event: summarizeLedgerEvent(event),
      projectedPoints: decision.status === "completion_ready" ? decision.approvedPointsPreview : 0,
      projectedXp: decision.status === "completion_ready" ? decision.approvedXpPreview : 0,
      reviewRequired: decision.status === "manual_review_required",
      blocked: decision.status === "completion_blocked",
      reasons: decision.reasons,
      serverNote: "Draft for future server-only missionRewardEvents write. Client must not write this collection.",
    },
  };
}

export function createSpendPreviewServerDraft(decision: InternalSpendDecision): EconomyServerLedgerDraft {
  const event = decision.ledgerEvent;

  return {
    collection: "missionContextEvaluations",
    documentId: safeDocumentId([event.userId, event.sourceId, event.eventId, "points-sink-preview"]),
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    writeNow: false,
    createdAt: new Date().toISOString(),
    record: {
      userId: event.userId,
      sourceId: event.sourceId,
      status: decision.status,
      itemId: decision.item?.id,
      itemTitle: decision.item?.title,
      pointsBalance: decision.pointsBalance,
      spendPoints: decision.spendPoints,
      remainingPoints: decision.remainingPoints,
      reasons: decision.reasons,
      ledgerEvent: summarizeLedgerEvent(event),
      serverNote: "Internal points sink preview draft only. No real purchase or payout authority.",
    },
  };
}
