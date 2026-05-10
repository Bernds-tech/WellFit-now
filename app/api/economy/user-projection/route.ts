import { NextResponse } from "next/server";
import { createEconomyServerAuthContext, summarizeEconomyServerAuthContext } from "@/lib/economy/serverAuth";
import { createUserProjectionSnapshot } from "@/lib/economy/userProjection";

export const dynamic = "force-dynamic";

type ProjectionRequestBody = {
  userId?: unknown;
  points?: unknown;
  xp?: unknown;
  level?: unknown;
  stepsToday?: unknown;
  avatar?: unknown;
  currentStreak?: unknown;
  longestStreak?: unknown;
};

async function readBody(request: Request): Promise<ProjectionRequestBody> {
  try {
    return (await request.json()) as ProjectionRequestBody;
  } catch {
    return {};
  }
}

export async function GET() {
  const auth = createEconomyServerAuthContext({ fallbackUserId: "economy-beta-user" });
  const projection = createUserProjectionSnapshot({ userId: auth.userId });

  return NextResponse.json({
    ok: true,
    route: "/api/economy/user-projection",
    method: "GET",
    mode: "internal_points_beta",
    auth: summarizeEconomyServerAuthContext(auth),
    projection,
    message:
      "Beta projection fallback only. No final ledger write, token, NFT, wallet, purchase, payout or blockchain transfer is active.",
  });
}

export async function POST(request: Request) {
  const body = await readBody(request);
  const auth = createEconomyServerAuthContext({
    bodyUserId: body.userId,
    fallbackUserId: "economy-beta-user",
  });

  const projection = createUserProjectionSnapshot({
    userId: auth.userId,
    points: body.points,
    xp: body.xp,
    level: body.level,
    stepsToday: body.stepsToday,
    avatar: body.avatar,
    currentStreak: body.currentStreak,
    longestStreak: body.longestStreak,
  });

  return NextResponse.json({
    ok: true,
    route: "/api/economy/user-projection",
    method: "POST",
    mode: "internal_points_beta",
    auth: summarizeEconomyServerAuthContext(auth),
    projection,
    nextStep:
      "Use this endpoint as the read-side bridge before replacing temporary client writes with server-authored userEconomyProjections.",
  });
}
