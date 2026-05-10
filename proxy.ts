import { NextResponse, type NextRequest } from "next/server";

const WWW_HOST = "www.wellfit-now.io";
const APEX_ORIGIN = "https://wellfit-now.io";

export function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();

  if (hostname === WWW_HOST) {
    const redirectUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, APEX_ORIGIN);
    return NextResponse.redirect(redirectUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
