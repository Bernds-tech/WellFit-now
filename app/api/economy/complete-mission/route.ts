import { NextResponse } from "next/server";
import {
  createEconomyServerAuthContext,
  createEconomyServerPersistenceRequests,
  createInternalMissionCompletionDecision,
  createMissionCompletionServerDraft,
  createMissionRewardEventServerDraft,
  summarizeEconomyServerAuthContext,
  summarizeInternalMissionCompletionForStorage,
  type EconomyUsageSnapshot,
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
  return ledgerSourceTypes.includes(value as LedgerSourceType) ? (value as LedgerSourceType) : "mission";
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

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/economy/complete-mission",
    mode: "internal_points_beta",
    finalAuthority: false,
    tokenized: false,
    message:
      "Mission completion API is prepared as a server-side decision layer. It does not grant final points, tokens, NFTs or payouts yet.",
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

    const authContext = createEconomyServerAuthContext({
      bodyUserId: body.userId,
      fallbackUserId: "api-completion-user",
    });

    const decision = createInternalMissionCompletionDecision({
      userId: authContext.userId,
      sourceId: asString(body.sourceId, "api-complete-mission"),
      sourceType: asLedgerSourceType(body.sourceType),
      missionType: asMissionRewardType(body.missionType),
      requestedPoints,
      requestedXp: Math.max(0, Math.floor(asNumber(body.requestedXp, requestedPoints))),
      missionId: typeof body.missionId === "string" ? body.missionId : undefined,
      usage: asUsageSnapshot(body.usage),
      evidenceSummary:
        typeof body.evidenceSummary === "string"
          ? body.evidenceSummary
          : "API mission completion request. No final client authority.",
      completionEvidenceSummary:
        typeof body.completionEvidenceSummary === "string" ? body.completionEvidenceSummary : undefined,
      riskSummary: asRiskSummary(body.riskSummary),
      correlationId: typeof body.correlationId === "string" ? body.correlationId : undefined,
      clientCompletedAt: typeof body.clientCompletedAt === "string" ? body.clientCompletedAt : undefined,
    });
    const serverDrafts = {
      completionEvaluation: createMissionCompletionServerDraft(decision),
      rewardEvent: createMissionRewardEventServerDraft(decision),
    };

    return NextResponse.json({
      ok: true,
      mode: "internal_points_beta",
      finalAuthority: decision.finalAuthority,
      tokenized: decision.tokenized,
      auth: summarizeEconomyServerAuthContext(authContext),
      status: decision.status,
      requestedPoints: decision.requestedPoints,
      approvedPointsPreview: decision.approvedPointsPreview,
      approvedXpPreview: decision.approvedXpPreview,
      reasons: decision.reasons,
      rewardPreview: {
        status: decision.rewardPreview.status,
        requestedPoints: decision.rewardPreview.requestedPoints,
        reserveAdjustedPoints: decision.rewardPreview.reserveAdjustedPoints,
        cappedPoints: decision.rewardPreview.cappedPoints,
        missionType: decision.rewardPreview.missionType,
        reasons: decision.rewardPreview.reasons,
        rewardRate: decision.rewardPreview.rewardRate,
        reserveRatio: decision.rewardPreview.reserveRatio,
      },
      completionRequestEvent: summarizeInternalMissionCompletionForStorage(decision).completionRequestEvent,
      serverDrafts,
      persistenceRequests: createEconomyServerPersistenceRequests([
        serverDrafts.completionEvaluation,
        serverDrafts.rewardEvent,
      ]),
      nextServerStep: decision.nextServerStep,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Mission completion decision failed.",
        mode: "internal_points_beta",
        finalAuthority: false,
        tokenized: false,
      },
      { status: 400 }
    );
  }
}
