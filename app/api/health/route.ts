import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REQUIRED_FIREBASE_WEB_CONFIG = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

function isConfiguredValue(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return !(
    normalized.startsWith("your_")
    || normalized.includes("your-project")
    || normalized.includes("your_project")
    || normalized === "placeholder"
  );
}

export function GET() {
  const firebaseConfigured = REQUIRED_FIREBASE_WEB_CONFIG.every((name) =>
    isConfiguredValue(process.env[name]),
  );

  return NextResponse.json(
    {
      status: "ok",
      service: "wellfit-web",
      runtimeMode: process.env.WELLFIT_RUNTIME_MODE || process.env.NODE_ENV || "unknown",
      release: {
        sha: process.env.WELLFIT_RELEASE_SHA || "local",
        channel: process.env.WELLFIT_RELEASE_CHANNEL || "local",
      },
      dependencies: {
        firebaseClientConfig: firebaseConfigured ? "configured" : "not-configured",
      },
      deploymentPerformedByEndpoint: false,
      databaseWritePerformedByEndpoint: false,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
