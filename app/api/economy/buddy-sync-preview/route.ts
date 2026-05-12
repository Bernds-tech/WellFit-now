import { NextResponse } from "next/server";
import { createEconomyServerAuthContext, summarizeEconomyServerAuthContext } from "@/lib/economy/serverAuth";
import { createBuddySyncDraftBundle, type BuddySyncSource } from "@/lib/economy/buddySyncDraft";

export const dynamic = "force-dynamic";

type BuddySyncPreviewBody = {
  userId?: unknown;
  missionId?: unknown;
  missionTitle?: unknown;
  missionType?: unknown;
  rewardPoints?: unknown;
  source?: unknown;
  currentAvatar?: unknown;
};

const readText = (value: unknown, fallback: string) => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const readNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const readAvatar = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
};

const readSource = (value: unknown): BuddySyncSource => {
  if (value === "dashboard" || value === "mobile" || value === "ar" || value === "pose") return value;
  return "dailyMission";
};

async function readBody(request: Request): Promise<BuddySyncPreviewBody> {
  try {
    return (await request.json()) as BuddySyncPreviewBody;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await readBody(request);
  const auth = createEconomyServerAuthContext({
    bodyUserId: body.userId,
    fallbackUserId: "buddy-sync-beta-user",
  });

  const bundle = createBuddySyncDraftBundle({
    userId: auth.userId,
    missionId: readText(body.missionId, "buddy-sync-preview-mission"),
    missionTitle: readText(body.missionTitle, "Buddy Sync Preview Mission"),
    missionType: readText(body.missionType, "Bewegung"),
    rewardPoints: readNumber(body.rewardPoints, 0),
    source: readSource(body.source),
    currentAvatar: readAvatar(body.currentAvatar),
  });

  return NextResponse.json({
    ok: true,
    route: "/api/economy/buddy-sync-preview",
    mode: "internal_points_beta",
    auth: summarizeEconomyServerAuthContext(auth),
    bundle,
    message: "Buddy sync preview bundle only. Final server persistence is not active.",
  });
}
