import { NextResponse } from "next/server";
import {
  createInternalSpendPreviewDecision,
  summarizeInternalSpendDecisionForStorage,
} from "@/lib/economy";

export const dynamic = "force-dynamic";

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const asString = (value: unknown, fallback: string) => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const asNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/economy/spend-preview",
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    message: "Spend preview API is active. It does not execute real purchases, tokens, NFTs or payouts.",
  });
}

export async function POST(request: Request) {
  try {
    const body = asRecord(await request.json());
    const pointsBalance = Math.max(0, Math.floor(asNumber(body.pointsBalance, 0)));

    const decision = createInternalSpendPreviewDecision({
      userId: asString(body.userId, "api-spend-preview-user"),
      itemId: asString(body.itemId, "buddy-food-basic"),
      pointsBalance,
      sourceType: "shop",
      sourceId: asString(body.sourceId, "api-spend-preview"),
      correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
    });

    return NextResponse.json({
      ok: true,
      mode: "internal_points_beta",
      finalAuthority: false,
      tokenized: false,
      status: decision.status,
      item: decision.item
        ? {
            id: decision.item.id,
            title: decision.item.title,
            type: decision.item.type,
            basePrice: decision.item.basePrice,
            price: decision.item.price,
            priceRate: decision.item.priceRate,
            currencyLabel: decision.item.currencyLabel,
            appStoreSafe: decision.item.appStoreSafe,
            tokenizedLater: decision.item.tokenizedLater,
          }
        : null,
      pointsBalance: decision.pointsBalance,
      spendPoints: decision.spendPoints,
      remainingPoints: decision.remainingPoints,
      reasons: decision.reasons,
      ledgerSummary: summarizeInternalSpendDecisionForStorage(decision),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Spend preview failed.",
        mode: "internal_points_beta",
        finalAuthority: false,
        tokenized: false,
      },
      { status: 400 }
    );
  }
}