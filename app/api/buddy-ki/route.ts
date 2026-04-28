import { NextResponse } from "next/server";
import { buddyKiOpenAiProvider } from "@/lib/buddyKi/buddyKiProviderOpenAi";
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

function shouldUseModelProvider() {
  return Boolean(process.env.OPENAI_API_KEY) && process.env.BUDDY_KI_PROVIDER === "openai";
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

async function generateBackendBuddyResponse(intent: BuddyKiIntent, context: BuddyKiContext) {
  if (!shouldUseModelProvider()) {
    const rulesResponse = await buddyKiRulesProvider.generateResponse(intent, context);
    return withSafety(rulesResponse, "rules", "model-provider-disabled");
  }

  try {
    const aiResponse = await buddyKiOpenAiProvider.generateResponse(intent, context);
    return withSafety(aiResponse, "remote-ai");
  } catch (error) {
    console.warn("Buddy KI model provider fallback to rules", error);
    const rulesResponse = await buddyKiRulesProvider.generateResponse(intent, context);
    return withSafety(rulesResponse, "rules", "model-provider-error");
  }
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
  const response = await generateBackendBuddyResponse(body.intent, context);

  return NextResponse.json({
    ok: true,
    response,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "buddy-ki",
    status: "ready",
    providerMode: shouldUseModelProvider() ? "remote-ai" : "rules",
    modelConfigured: Boolean(process.env.OPENAI_API_KEY),
    safety: {
      clientApiKeys: false,
      rewardAuthorized: false,
      missionCompletionAuthorized: false,
      mobileTokenTrading: false,
    },
  });
}
