import { NextResponse } from "next/server";
import { listWebSessionsForRequest, revokeOwnedWebSession, WEB_SESSION_COOKIE } from "@/lib/server/webSession";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const state = await listWebSessionsForRequest(request);
  if (!state) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, sessions: state.sessions }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function DELETE(request: Request) {
  const state = await listWebSessionsForRequest(request);
  if (!state) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { sessionId?: unknown };
  if (typeof body.sessionId !== "string") return NextResponse.json({ ok: false, error: "invalid-session" }, { status: 400 });
  const revoked = await revokeOwnedWebSession(state.userId, body.sessionId);
  if (!revoked) return NextResponse.json({ ok: false, error: "session-not-found" }, { status: 404 });
  const response = NextResponse.json({ ok: true, currentSessionRevoked: body.sessionId === state.currentId });
  if (body.sessionId === state.currentId) response.cookies.set(WEB_SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
