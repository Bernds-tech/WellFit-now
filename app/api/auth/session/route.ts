import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/server/firebaseAdmin";
import { createWebSession, WEB_SESSION_COOKIE, WEB_SESSION_MAX_AGE_SECONDS } from "@/lib/server/webSession";

export const runtime = "nodejs";

const blockedStatuses = new Set(["suspended", "disabled", "deletion-pending", "deletion-processing", "deleted"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { idToken?: unknown };
    if (typeof body.idToken !== "string" || body.idToken.length < 100 || body.idToken.length > 10000) {
      return NextResponse.json({ ok: false, reason: "invalid-token" }, { status: 400 });
    }
    const decoded = await adminAuth.verifyIdToken(body.idToken, true);
    if (decoded.email_verified !== true) {
      return NextResponse.json({ ok: false, reason: "email-verification-required", redirectTo: "/verify-email" }, { status: 403 });
    }
    const [userSnapshot, onboardingSnapshot, lifecycleSnapshot] = await Promise.all([
      adminDb.collection("users").doc(decoded.uid).get(),
      adminDb.collection("userOnboardingRecords").doc(decoded.uid).get(),
      adminDb.collection("accountLifecycleRecords").doc(decoded.uid).get(),
    ]);
    const user = userSnapshot.data() || {};
    const onboarding = onboardingSnapshot.data() || {};
    const lifecycle = lifecycleSnapshot.data() || {};
    if (!userSnapshot.exists || user.onboardingCompleted !== true || onboarding.status !== "completed") {
      return NextResponse.json({ ok: false, reason: "initialization-required", redirectTo: "/register" }, { status: 409 });
    }
    const accountStatus = String(lifecycle.status || user.accountStatus || "active");
    if (lifecycle.freezeMutations === true || blockedStatuses.has(accountStatus)) {
      return NextResponse.json({ ok: false, reason: "account-blocked", redirectTo: "/account-status" }, { status: 403 });
    }
    const session = await createWebSession({
      userId: decoded.uid,
      admin: decoded.admin === true,
      userAgent: request.headers.get("user-agent"),
    });
    const response = NextResponse.json({ ok: true, redirectTo: decoded.admin === true ? "/admin" : "/dashboard" });
    response.cookies.set(WEB_SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: WEB_SESSION_MAX_AGE_SECONDS,
      expires: session.expiresAt,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch {
    return NextResponse.json({ ok: false, reason: "authentication-failed" }, { status: 401 });
  }
}
