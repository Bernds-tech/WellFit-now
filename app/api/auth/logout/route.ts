import { NextRequest, NextResponse } from "next/server";
import { revokeAllWebSessions, revokeWebSession, WEB_SESSION_COOKIE } from "@/lib/server/webSession";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(WEB_SESSION_COOKIE)?.value;
  if (request.nextUrl.searchParams.get("all") === "true") {
    const { readWebSession } = await import("@/lib/server/webSession");
    const session = await readWebSession(token);
    if (session) await revokeAllWebSessions(session.userId);
  } else {
    await revokeWebSession(token);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(WEB_SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
