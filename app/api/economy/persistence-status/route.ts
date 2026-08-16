import { NextResponse } from "next/server";
import { requireRequestWebSession } from "@/lib/server/webSession";
import { getEconomyServerPersistenceStatus } from "@/lib/economy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireRequestWebSession(request);
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    ok: true,
    route: "/api/economy/persistence-status",
    mode: "internal_points_beta",
    persistence: getEconomyServerPersistenceStatus(),
    message:
      "Economy server persistence is currently draft-only. No final points, tokens, NFTs, wallets, purchases or payouts are active.",
  });
}
