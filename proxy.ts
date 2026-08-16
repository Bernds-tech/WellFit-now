import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readWebSession, WEB_SESSION_COOKIE } from "@/lib/server/webSession";

const WWW_HOST = "www.wellfit-now.io";
const APEX_ORIGIN = "https://wellfit-now.io";
const protectedPrefixes = [
  "/dashboard", "/buddy", "/missionen", "/mobile", "/einstellungen", "/analytics",
  "/leaderboard", "/shop", "/punkte-shop", "/marketplace", "/marktplatz", "/admin",
  "/api/buddy-ki", "/api/economy",
];

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname.toLowerCase() === WWW_HOST) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, APEX_ORIGIN), 307);
  }
  if (!protectedPrefixes.some((prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }
  const session = await readWebSession(request.cookies.get(WEB_SESSION_COOKIE)?.value);
  if (!session) return unauthorized(request);
  if (request.nextUrl.pathname.startsWith("/admin") && !session.admin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
