import {
  createLedgerEventDraft,
  type LedgerEvent,
  type LedgerSourceType,
} from "./ledger";
import {
  findBetaShopItemWithPrice,
  type InternalShopItemWithPrice,
} from "./shopItems";

export type InternalSpendDecisionStatus =
  | "spend_allowed"
  | "insufficient_points"
  | "item_missing"
  | "blocked";

export type InternalSpendDecision = {
  status: InternalSpendDecisionStatus;
  item?: InternalShopItemWithPrice;
  pointsBalance: number;
  spendPoints: number;
  remainingPoints: number;
  reasons: string[];
  ledgerEvent: LedgerEvent;
};

export const createInternalSpendPreviewDecision = (params: {
  userId: string;
  itemId: string;
  pointsBalance: number;
  sourceType?: LedgerSourceType;
  sourceId?: string;
  correlationId?: string;
  customItem?: InternalShopItemWithPrice;
}): InternalSpendDecision => {
  const item = findBetaShopItemWithPrice(params.itemId) ?? params.customItem;
  const sourceType = params.sourceType ?? "shop";
  const sourceId = params.sourceId ?? `internal-spend-${params.itemId}`;
  const pointsBalance = Math.max(0, Math.floor(Number(params.pointsBalance) || 0));

  if (!item) {
    const ledgerEvent = createLedgerEventDraft({
      eventType: "spend_preview_created",
      userId: params.userId,
      sourceType,
      sourceId,
      pointsDelta: 0,
      status: "rejected",
      reasonCode: "internal_points_sink",
      evidenceSummary: `Internal spend preview failed. Unknown item: ${params.itemId}.`,
      createdBy: "beta_helper",
      correlationId: params.correlationId,
    });

    return {
      status: "item_missing",
      item: undefined,
      pointsBalance,
      spendPoints: 0,
      remainingPoints: pointsBalance,
      reasons: ["item_missing"],
      ledgerEvent,
    };
  }

  const canAfford = pointsBalance >= item.price;
  const spendPoints = canAfford ? item.price : 0;
  const remainingPoints = Math.max(0, pointsBalance - spendPoints);

  const ledgerEvent = createLedgerEventDraft({
    eventType: "spend_preview_created",
    userId: params.userId,
    sourceType,
    sourceId,
    pointsDelta: canAfford ? -item.price : 0,
    status: canAfford ? "preview_only" : "rejected",
    reasonCode: canAfford ? "internal_points_spend_preview" : "insufficient_internal_points",
    evidenceSummary: `Internal beta spend preview for ${item.title}. No token, NFT, wallet or payout authority.`,
    createdBy: "beta_helper",
    correlationId: params.correlationId,
  });

  return {
    status: canAfford ? "spend_allowed" : "insufficient_points",
    item,
    pointsBalance,
    spendPoints,
    remainingPoints,
    reasons: canAfford ? ["internal_spend_preview_only"] : ["insufficient_internal_points"],
    ledgerEvent,
  };
};

export const summarizeInternalSpendDecisionForStorage = (decision: InternalSpendDecision) => {
  return {
    status: decision.status,
    itemId: decision.item?.id,
    itemTitle: decision.item?.title,
    spendPoints: decision.spendPoints,
    remainingPoints: decision.remainingPoints,
    reasons: decision.reasons,
    ledgerEventId: decision.ledgerEvent.eventId,
    ledgerEventType: decision.ledgerEvent.eventType,
    reasonCode: decision.ledgerEvent.reasonCode,
    economyMode: "internal_points_beta",
    tokenized: false,
    finalServerAuthorityRequired: true,
  };
};