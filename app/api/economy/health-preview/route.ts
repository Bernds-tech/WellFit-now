import { NextResponse } from "next/server";
import { calculateInternalEconomyHealth, calculateEconomyHealthAdjustedReward } from "@/lib/economy";

export const dynamic = "force-dynamic";

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const asNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const createPreview = (input: Record<string, unknown> = {}) => {
  const health = calculateInternalEconomyHealth({
    totalSupply: asNumber(input.totalSupply, undefined as unknown as number),
    reserve: asNumber(input.reserve, undefined as unknown as number),
    circulating: asNumber(input.circulating, undefined as unknown as number),
    burned: asNumber(input.burned, undefined as unknown as number),
    locked: asNumber(input.locked, undefined as unknown as number),
    configuredDailyEmissionCap: asNumber(input.configuredDailyEmissionCap, undefined as unknown as number),
    activeUsersDaily: asNumber(input.activeUsersDaily, undefined as unknown as number),
    activeUsersMonthly: asNumber(input.activeUsersMonthly, undefined as unknown as number),
    emittedToday: asNumber(input.emittedToday, 0),
    sinkReturnedToday: asNumber(input.sinkReturnedToday, 0),
    requestedPointsToday: asNumber(input.requestedPointsToday, 0),
    rejectedEventsToday: asNumber(input.rejectedEventsToday, 0),
    manualReviewEventsToday: asNumber(input.manualReviewEventsToday, 0),
    suspiciousEventsToday: asNumber(input.suspiciousEventsToday, 0),
  });
  const requestedReward = Math.max(0, Math.floor(asNumber(input.requestedReward, 100)));

  return {
    ok: true,
    route: "/api/economy/health-preview",
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    health,
    rewardSimulation: {
      requestedReward,
      adjustedReward: calculateEconomyHealthAdjustedReward(requestedReward, health),
      rewardRate: health.rewardRate,
      throttleRate: health.rewardThrottleRate,
    },
    message: "Economy health preview is a draft-only simulation. It does not grant final points, tokens, NFTs or payouts.",
  };
};

export async function GET() {
  return NextResponse.json(createPreview());
}

export async function POST(request: Request) {
  try {
    const body = asRecord(await request.json());
    return NextResponse.json(createPreview(body));
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Economy health preview failed.",
        mode: "internal_points_beta",
        finalAuthority: false,
        tokenized: false,
      },
      { status: 400 }
    );
  }
}
