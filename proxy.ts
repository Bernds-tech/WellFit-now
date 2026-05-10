import { NextResponse, type NextRequest } from "next/server";

const WWW_HOST = "www.wellfit-now.io";
const APEX_HOST = "wellfit-now.io";

export function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();

  if (hostname === WWW_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = APEX_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
