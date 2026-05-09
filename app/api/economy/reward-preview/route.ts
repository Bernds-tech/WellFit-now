import { NextResponse } from "next/server";
import {
  createInternalRewardPreviewDecision,
  type EconomyUsageSnapshot,
  type LedgerEvent,
  type LedgerRiskSummary,
  type LedgerSourceType,
  type MissionRewardType,
} from "@/lib/economy";

export const dynamic = "force-dynamic";

const missionRewardTypes: MissionRewardType[] = [
  "movement",
  "learning",
  "ar_riddle",
  "nfc_scan",
  "social_challenge",
  "buddy_guide",
  "unknown",
];

const ledgerSourceTypes: LedgerSourceType[] = [
  "mission",
  "buddy",
  "dashboard",
  "system",
  "manual_review",
  "correction",
  "shop",
];

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

const asMissionRewardType = (value: unknown): MissionRewardType => {
  return missionRewardTypes.includes(value as MissionRewardType) ? (value as MissionRewardType) : "unknown";
};

const asLedgerSourceType = (value: unknown): LedgerSourceType => {
  return ledgerSourceTypes.includes(value as LedgerSourceType) ? (value as LedgerSourceType) : "system";
};

const asUsageSnapshot = (value: unknown): EconomyUsageSnapshot => {
  const record = asRecord(value);

  return {
    emittedToday: Math.max(0, Math.floor(asNumber(record.emittedToday, 0))),
    userEarnedToday: Math.max(0, Math.floor(asNumber(record.userEarnedToday, 0))),
    missionTypeEarnedToday: Math.max(0, Math.floor(asNumber(record.missionTypeEarnedToday, 0))),
  };
};

const asRiskSummary = (value: unknown): LedgerRiskSummary | undefined => {
  const record = asRecord(value);
  if (Object.keys(record).length === 0) return undefined;

  return {
    proofQuality: record.proofQuality as LedgerRiskSummary["proofQuality"],
    cooldownRisk: record.cooldownRisk as LedgerRiskSummary["cooldownRisk"],
    patternRisk: record.patternRisk as LedgerRiskSummary["patternRisk"],
    notes: Array.isArray(record.notes)
      ? record.notes.filter((note): note is string => typeof note === "string").slice(0, 8)
      : undefined,
  };
};

const summarizeLedgerEvent = (event: LedgerEvent) => ({
  eventId: event.eventId,
  eventType: event.eventType,
  status: event.status,
  reasonCode: event.reasonCode,
  pointsDelta: event.pointsDelta ?? 0,
  xpDelta: event.xpDelta ?? 0,
  schemaVersion: event.schemaVersion,
  createdAt: event.createdAt,
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/economy/reward-preview",
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    message: "Reward preview API is active. It does not grant final points, tokens, NFTs or payouts.",
  });
}

export async function POST(request: Request) {
  try {
    const body = asRecord(await request.json());

    const requestedPoints = Math.max(0, Math.floor(asNumber(body.requestedPoints, 0)));

    if (requestedPoints <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "requestedPoints must be greater than 0.",
          mode: "internal_points_beta",
          finalAuthority: false,
          tokenized: false,
        },
        { status: 400 }
      );
    }

    const decision = createInternalRewardPreviewDecision({
      userId: asString(body.userId, "api-preview-user"),
      sourceId: asString(body.sourceId, "api-reward-preview"),
      sourceType: asLedgerSourceType(body.sourceType),
      missionType: asMissionRewardType(body.missionType),
      requestedPoints,
      requestedXp: Math.max(0, Math.floor(asNumber(body.requestedXp, requestedPoints))),
      missionId: typeof body.missionId === "string" ? body.missionId : undefined,
      usage: asUsageSnapshot(body.usage),
      evidenceSummary: typeof body.evidenceSummary === "string" ? body.evidenceSummary : "API reward preview. No final reward authority.",
      riskSummary: asRiskSummary(body.riskSummary),
      correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
    });

    return NextResponse.json({
      ok: true,
      mode: "internal_points_beta",
      finalAuthority: false,
      tokenized: false,
      status: decision.status,
      requestedPoints: decision.requestedPoints,
      reserveAdjustedPoints: decision.reserveAdjustedPoints,
      cappedPoints: decision.cappedPoints,
      missionType: decision.missionType,
      reasons: decision.reasons,
      rewardRate: decision.rewardRate,
      reserveRatio: decision.reserveRatio,
      capDecision: decision.capDecision,
      ledgerEvent: summarizeLedgerEvent(decision.ledgerEvent),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Reward preview failed.",
        mode: "internal_points_beta",
        finalAuthority: false,
        tokenized: false,
      },
      { status: 400 }
    );
  }
}