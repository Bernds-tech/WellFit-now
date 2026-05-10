import { NextResponse, type NextRequest } from "next/server";

const WWW_HOST = "www.wellfit-now.io";
const APEX_HOST = "wellfit-now.io";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (host === WWW_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = APEX_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
