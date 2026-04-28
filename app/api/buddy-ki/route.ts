import { NextResponse } from "next/server";
import { buddyKiRulesProvider } from "@/lib/buddyKi/buddyKiProviderRules";
import type { BuddyKiContext, BuddyKiIntent, BuddyKiProviderMode, BuddyKiResponse } from "@/lib/buddyKi/buddyKiTypes";

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

function sanitizeText(value: unknown, maxLength = 120) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function sanitizeContext(context: Partial<BuddyKiContext> | undefined): BuddyKiContext {
  return {
    language: context?.language === "en" ? "en" : "de",
    buddyId: sanitizeText(context?.buddyId, 80) || "default",
    currentMissionId: sanitizeText(context?.currentMissionId, 120),
    currentMissionType: context?.currentMissionType || "unknown",
    currentRoute: sanitizeText(context?.currentRoute, 160),
    ageBand: context?.ageBand,
    parentMode: Boolean(context?.parentMode),
    inventoryCapabilityIds: Array.isArray(context?.inventoryCapabilityIds)
      ? context.inventoryCapabilityIds.map((id) => sanitizeText(id, 80)).filter(Boolean).slice(0, 20) as string[]
      : [],
    missingCapabilityId: sanitizeText(context?.missingCapabilityId, 80),
    markerId: sanitizeText(context?.markerId, 80),
    riskLevel: context?.riskLevel || "low",
    cameraActive: Boolean(context?.cameraActive),
  };
}

function hasModelConfiguration() {
  return Boolean(process.env.OPENAI_API_KEY) && Boolean(process.env.BUDDY_KI_MODEL);
}

function shouldUseModelProvider() {
  return hasModelConfiguration() && process.env.BUDDY_KI_PROVIDER === "openai";
}

function createHardFallbackResponse(intent: BuddyKiIntent, fallbackReason: string): BuddyKiResponse & { meta: { fallbackReason: string } } {
  return {
    providerMode: "rules",
    intent,
    title: intent === "suggestMission" ? "Ich habe etwas für dich" : "Buddy ist bereit",
    message: intent === "suggestMission"
      ? "Wie wäre es mit einer einfachen AR-Mission? Ich bleibe im sicheren Fallback und helfe dir Schritt für Schritt."
      : "Ich bin da. Der sichere Fallback ist aktiv und die App bleibt stabil.",
    mood: intent === "suggestMission" ? "curious" : "helpful",
    options: intent === "suggestMission"
      ? [
          { id: "start", label: "Mission starten", intent: "missionProgress", payload: { missionId: "demo_ar_walk_001" } },
          { id: "hint", label: "Hinweis anzeigen", intent: "arHint", payload: { markerId: "marker_mission_hint_001" } },
        ]
      : [],
    safety: {
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      medicalDiagnosis: false,
      mobileTokenTrading: false,
    },
    meta: { fallbackReason },
  };
}

function withSafety(response: BuddyKiResponse, providerMode: BuddyKiProviderMode, fallbackReason?: string) {
  return {
    ...response,
    providerMode,
    safety: {
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      medicalDiagnosis: false,
      mobileTokenTrading: false,
    },
    meta: {
      fallbackReason,
    },
  };
}

async function generateRulesResponse(intent: BuddyKiIntent, context: BuddyKiContext, fallbackReason?: string) {
  try {
    const rulesResponse = await buddyKiRulesProvider.generateResponse(intent, context);
    return withSafety(rulesResponse, "rules", fallbackReason);
  } catch (error) {
    console.error("Buddy KI rules provider hard fallback", error);
    return createHardFallbackResponse(intent, fallbackReason || "rules-provider-error");
  }
}

async function generateBackendBuddyResponse(intent: BuddyKiIntent, context: BuddyKiContext) {
  if (!shouldUseModelProvider()) {
    return generateRulesResponse(intent, context, "model-provider-disabled");
  }

  try {
    const { buddyKiOpenAiProvider } = await import("@/lib/buddyKi/buddyKiProviderOpenAi");
    const aiResponse = await buddyKiOpenAiProvider.generateResponse(intent, context);
    return withSafety(aiResponse, "remote-ai");
  } catch (error) {
    console.warn("Buddy KI model provider fallback to rules", error);
    return generateRulesResponse(intent, context, "model-provider-error");
  }
}

export async function POST(request: Request) {
  try {
    let body: BuddyKiRequestBody;

    try {
      body = (await request.json()) as BuddyKiRequestBody;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
    }

    if (!isAllowedIntent(body.intent)) {
      return NextResponse.json({ ok: false, error: "invalid-intent" }, { status: 400 });
    }

    const context = sanitizeContext(body.context);
    const response = await generateBackendBuddyResponse(body.intent, context);

    return NextResponse.json({
      ok: true,
      response,
    });
  } catch (error) {
    console.error("Buddy KI POST hard fallback", error);
    return NextResponse.json({ ok: true, response: createHardFallbackResponse("errorHelp", "route-fatal-error") });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      service: "buddy-ki",
      status: "ready",
      providerMode: shouldUseModelProvider() ? "remote-ai" : "rules",
      modelConfigured: hasModelConfiguration(),
      modelProviderEnabled: process.env.BUDDY_KI_PROVIDER === "openai",
      safety: {
        clientApiKeys: false,
        rewardAuthorized: false,
        missionCompletionAuthorized: false,
        mobileTokenTrading: false,
      },
    });
  } catch (error) {
    console.error("Buddy KI GET fatal fallback", error);
    return NextResponse.json({
      ok: true,
      service: "buddy-ki",
      status: "ready-fallback",
      providerMode: "rules",
      modelConfigured: false,
      modelProviderEnabled: false,
      safety: {
        clientApiKeys: false,
        rewardAuthorized: false,
        missionCompletionAuthorized: false,
        mobileTokenTrading: false,
      },
    });
  }
}
