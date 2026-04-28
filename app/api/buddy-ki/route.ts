import { NextResponse } from "next/server";
import { buddyKiRulesProvider } from "@/lib/buddyKi/buddyKiProviderRules";
import type { BuddyKiContext, BuddyKiIntent } from "@/lib/buddyKi/buddyKiTypes";

export const runtime = "nodejs";

type BuddyKiRequestBody = {
  intent?: BuddyKiIntent;
  context?: Partial<BuddyKiContext>;
};

const allowedIntents: BuddyKiIntent[] = [
  "welcome",
  "explainMenu",
  "suggestMission",
  "explainMissingCapability",
  "arHint",
  "missionProgress",
  "safeDetour",
  "celebrate",
  "errorHelp",
];

function isAllowedIntent(value: unknown): value is BuddyKiIntent {
  return typeof value === "string" && allowedIntents.includes(value as BuddyKiIntent);
}

function sanitizeContext(context: Partial<BuddyKiContext> | undefined): BuddyKiContext {
  return {
    language: context?.language === "en" ? "en" : "de",
    buddyId: context?.buddyId || "default",
    currentMissionId: context?.currentMissionId,
    currentMissionType: context?.currentMissionType || "unknown",
    currentRoute: context?.currentRoute,
    ageBand: context?.ageBand,
    parentMode: Boolean(context?.parentMode),
    inventoryCapabilityIds: Array.isArray(context?.inventoryCapabilityIds) ? context.inventoryCapabilityIds.slice(0, 20) : [],
    missingCapabilityId: context?.missingCapabilityId,
    markerId: context?.markerId,
    riskLevel: context?.riskLevel || "low",
    cameraActive: Boolean(context?.cameraActive),
  };
}

export async function POST(request: Request) {
  let body: BuddyKiRequestBody;

  try {
    body = (await request.json()) as BuddyKiRequestBody;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  if (!isAllowedIntent(body.intent)) {
    return NextResponse.json({ error: "invalid-intent" }, { status: 400 });
  }

  const context = sanitizeContext(body.context);

  // Stufe 1: sichere Rules-Antwort aus Backend.
  // Stufe 2: hier spaeter echten KI-Provider anbinden, niemals direkt im Client.
  const response = await buddyKiRulesProvider.generateResponse(body.intent, context);

  return NextResponse.json({
    ok: true,
    response: {
      ...response,
      providerMode: "rules",
      safety: {
        rewardAuthorized: false,
        missionCompletionAuthorized: false,
        medicalDiagnosis: false,
        mobileTokenTrading: false,
      },
    },
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "buddy-ki",
    status: "ready",
    providerMode: "rules",
    safety: {
      clientApiKeys: false,
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      mobileTokenTrading: false,
    },
  });
}
