import type { MissionCompletionDecision } from "./completion";
import type { LedgerEvent } from "./ledger";
import type { RewardPreviewDecision } from "./rewardPreview";
import type { InternalSpendDecision } from "./spend";

export type EconomyServerCollectionName =
  | "missionRewardPreviews"
  | "missionRewardEvents"
  | "missionCompletionEvaluations"
  | "missionContextEvaluations"
  | "systemReserveSnapshots"
  | "ledgerEvents"
  | "auditEvents"
  | "userEconomyProjections"
  | "pointsSinkEvents";

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

const createDraft = (
  collection: EconomyServerCollectionName,
  documentId: string,
  record: Record<string, unknown>
): EconomyServerLedgerDraft => ({
  collection,
  documentId,
  mode: "internal_points_beta",
  finalAuthority: false,
  tokenized: false,
  writeNow: false,
  createdAt: new Date().toISOString(),
  record,
});

export function createRewardPreviewServerDraft(decision: RewardPreviewDecision): EconomyServerLedgerDraft {
  const event = decision.ledgerEvent;

  return createDraft("missionRewardPreviews", safeDocumentId([event.userId, event.missionId, event.eventId]), {
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
  });
}

export function createMissionCompletionServerDraft(
  decision: MissionCompletionDecision
): EconomyServerLedgerDraft {
  const event = decision.completionRequestEvent;

  return createDraft("missionCompletionEvaluations", safeDocumentId([event.userId, event.missionId, event.eventId]), {
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
  });
}

export function createMissionRewardEventServerDraft(
  decision: MissionCompletionDecision
): EconomyServerLedgerDraft {
  const event = decision.completionRequestEvent;

  return createDraft(
    "missionRewardEvents",
    safeDocumentId([event.userId, event.missionId, event.eventId, "reward-event"]),
    {
      userId: event.userId,
      missionId: event.missionId,
      event: summarizeLedgerEvent(event),
      projectedPoints: decision.status === "completion_ready" ? decision.approvedPointsPreview : 0,
      projectedXp: decision.status === "completion_ready" ? decision.approvedXpPreview : 0,
      reviewRequired: decision.status === "manual_review_required",
      blocked: decision.status === "completion_blocked",
      reasons: decision.reasons,
      serverNote: "Draft for future server-only missionRewardEvents write. Client must not write this collection.",
    }
  );
}

export function createSpendPreviewServerDraft(decision: InternalSpendDecision): EconomyServerLedgerDraft {
  const event = decision.ledgerEvent;

  return createDraft(
    "missionContextEvaluations",
    safeDocumentId([event.userId, event.sourceId, event.eventId, "points-sink-preview"]),
    {
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
    }
  );
}

export function createLedgerEventServerDraft(event: LedgerEvent): EconomyServerLedgerDraft {
  return createDraft("ledgerEvents", safeDocumentId([event.userId, event.eventId]), {
    ...summarizeLedgerEvent(event),
    finalAuthority: false,
    tokenized: false,
    serverNote: "Future append-only ledger event. Draft only until server-only Firestore writes and rules tests are complete.",
  });
}

export function createAuditEventServerDraft(params: {
  eventId: string;
  userId: string;
  action: string;
  source: string;
  status: string;
  reasons?: string[];
  payload?: Record<string, unknown>;
}): EconomyServerLedgerDraft {
  return createDraft("auditEvents", safeDocumentId([params.userId, params.eventId, params.action]), {
    userId: params.userId,
    eventId: params.eventId,
    action: params.action,
    source: params.source,
    status: params.status,
    reasons: params.reasons ?? [],
    payload: params.payload ?? {},
    finalAuthority: false,
    tokenized: false,
    serverNote: "Future audit record for traceability. Draft only until server persistence is enabled.",
  });
}

export function createUserEconomyProjectionServerDraft(params: {
  userId: string;
  sourceEventId: string;
  pointsDelta: number;
  xpDelta: number;
  reason: string;
}): EconomyServerLedgerDraft {
  return createDraft("userEconomyProjections", safeDocumentId([params.userId, params.sourceEventId, "projection"]), {
    userId: params.userId,
    sourceEventId: params.sourceEventId,
    projectedPointsDelta: params.pointsDelta,
    projectedXpDelta: params.xpDelta,
    reason: params.reason,
    finalAuthority: false,
    tokenized: false,
    serverNote: "Future server-only user projection update. Draft only; client must not authoritatively mutate balances.",
  });
}

export function createPointsSinkEventServerDraft(decision: InternalSpendDecision): EconomyServerLedgerDraft {
  const event = decision.ledgerEvent;
  return createDraft("pointsSinkEvents", safeDocumentId([event.userId, event.eventId, "sink"]), {
    userId: event.userId,
    sourceId: event.sourceId,
    itemId: decision.item?.id,
    itemTitle: decision.item?.title,
    status: decision.status,
    pointsBalance: decision.pointsBalance,
    spendPoints: decision.spendPoints,
    remainingPoints: decision.remainingPoints,
    reasons: decision.reasons,
    ledgerEvent: summarizeLedgerEvent(event),
    finalAuthority: false,
    tokenized: false,
    serverNote: "Future internal points sink event. No real purchase, token, NFT, wallet or payout authority.",
  });
}

export function createMissionCompletionPersistenceBundle(decision: MissionCompletionDecision): EconomyServerLedgerDraft[] {
  const event = decision.completionRequestEvent;
  const pointsDelta = decision.status === "completion_ready" ? decision.approvedPointsPreview : 0;
  const xpDelta = decision.status === "completion_ready" ? decision.approvedXpPreview : 0;

  return [
    createMissionCompletionServerDraft(decision),
    createMissionRewardEventServerDraft(decision),
    createLedgerEventServerDraft(event),
    createAuditEventServerDraft({
      eventId: event.eventId,
      userId: event.userId,
      action: "mission_completion_evaluated",
      source: "api/economy/complete-mission",
      status: decision.status,
      reasons: decision.reasons,
      payload: {
        missionId: event.missionId,
        approvedPointsPreview: decision.approvedPointsPreview,
        approvedXpPreview: decision.approvedXpPreview,
        rewardPreviewStatus: decision.rewardPreview.status,
      },
    }),
    createUserEconomyProjectionServerDraft({
      userId: event.userId,
      sourceEventId: event.eventId,
      pointsDelta,
      xpDelta,
      reason: decision.status,
    }),
  ];
}

export function createSpendPersistenceBundle(decision: InternalSpendDecision): EconomyServerLedgerDraft[] {
  const event = decision.ledgerEvent;
  return [
    createSpendPreviewServerDraft(decision),
    createPointsSinkEventServerDraft(decision),
    createLedgerEventServerDraft(event),
    createAuditEventServerDraft({
      eventId: event.eventId,
      userId: event.userId,
      action: "points_sink_evaluated",
      source: "api/economy/spend-preview",
      status: decision.status,
      reasons: decision.reasons,
      payload: {
        sourceId: event.sourceId,
        itemId: decision.item?.id,
        spendPoints: decision.spendPoints,
        remainingPoints: decision.remainingPoints,
      },
    }),
    createUserEconomyProjectionServerDraft({
      userId: event.userId,
      sourceEventId: event.eventId,
      pointsDelta: decision.status === "spend_allowed" ? -decision.spendPoints : 0,
      xpDelta: 0,
      reason: decision.status,
    }),
  ];
}
