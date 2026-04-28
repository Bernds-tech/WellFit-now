import { createBuddyKiSafety, type BuddyKiContext, type BuddyKiIntent, type BuddyKiProvider, type BuddyKiResponse } from "./buddyKiTypes";

type OpenAiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiChatChoice = {
  message?: {
    content?: string;
  };
};

type OpenAiChatResponse = {
  choices?: OpenAiChatChoice[];
};

type RawBuddyKiModelResponse = Partial<Pick<BuddyKiResponse, "title" | "message" | "mood" | "options">>;

const allowedMoods: BuddyKiResponse["mood"][] = ["neutral", "happy", "curious", "helpful", "warning"];

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

function buildSystemPrompt() {
  return [
    "Du bist der WellFit KI-Buddy.",
    "Antworte kurz, freundlich, motivierend, kind-/familientauglich und auf Deutsch oder Englisch passend zum Kontext.",
    "Du darfst keine medizinischen Diagnosen geben.",
    "Du darfst keine Scham-, Druck- oder Angst-Sprache verwenden.",
    "Du darfst keine Rewards, Punkte, XP, Token, WFT, Jackpot, Burn, Leaderboards oder Mission Completion autorisieren.",
    "Du darfst keine Token-, Presale-, Trading-, Staking- oder NFT-Marktplatz-Funktion vorschlagen.",
    "Wenn eine Fähigkeit oder ein Item fehlt, schlage zuerst eine sichere spielerische Alternative oder einen Detour vor.",
    "Antworte ausschliesslich als JSON-Objekt mit den Feldern: title, message, mood, options.",
    "mood ist genau einer von: neutral, happy, curious, helpful, warning.",
    "options ist ein Array mit maximal 3 Objekten: { id, label, intent, payload }.",
    "intent muss einer der erlaubten WellFit-Intents sein.",
  ].join("\n");
}

function buildUserPrompt(intent: BuddyKiIntent, context: BuddyKiContext) {
  return JSON.stringify({
    task: "Generate a safe WellFit Buddy response.",
    intent,
    context: {
      language: context.language,
      buddyId: context.buddyId,
      currentMissionId: context.currentMissionId,
      currentMissionType: context.currentMissionType,
      currentRoute: context.currentRoute,
      ageBand: context.ageBand,
      parentMode: context.parentMode,
      inventoryCapabilityIds: context.inventoryCapabilityIds?.slice(0, 20) ?? [],
      missingCapabilityId: context.missingCapabilityId,
      markerId: context.markerId,
      riskLevel: context.riskLevel,
      cameraActive: context.cameraActive,
    },
  });
}

function safeParseModelJson(content: string): RawBuddyKiModelResponse | null {
  try {
    const trimmed = content.trim();
    const withoutFence = trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(withoutFence) as RawBuddyKiModelResponse;
  } catch {
    return null;
  }
}

function sanitizeModelResponse(intent: BuddyKiIntent, raw: RawBuddyKiModelResponse | null): BuddyKiResponse {
  const title = typeof raw?.title === "string" && raw.title.trim() ? raw.title.trim().slice(0, 80) : "Buddy";
  const message = typeof raw?.message === "string" && raw.message.trim()
    ? raw.message.trim().slice(0, 420)
    : "Ich bin da und helfe dir beim nächsten sicheren Schritt.";
  const mood = allowedMoods.includes(raw?.mood as BuddyKiResponse["mood"]) ? raw?.mood as BuddyKiResponse["mood"] : "helpful";
  const rawOptions = Array.isArray(raw?.options) ? raw?.options : [];

  const options = rawOptions.slice(0, 3).flatMap((option, index) => {
    if (!option || typeof option !== "object") return [];

    const candidate = option as Record<string, unknown>;
    const optionIntent = candidate.intent;
    if (!allowedIntents.includes(optionIntent as BuddyKiIntent)) return [];

    return [{
      id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.trim().slice(0, 40) : `option-${index + 1}`,
      label: typeof candidate.label === "string" && candidate.label.trim() ? candidate.label.trim().slice(0, 80) : "Weiter",
      intent: optionIntent as BuddyKiIntent,
      payload: typeof candidate.payload === "object" && candidate.payload !== null ? candidate.payload as Record<string, string | number | boolean | undefined> : undefined,
    }];
  });

  return {
    providerMode: "remote-ai",
    intent,
    title,
    message,
    mood,
    options,
    safety: createBuddyKiSafety(),
  };
}

async function requestOpenAiChat(intent: BuddyKiIntent, context: BuddyKiContext): Promise<BuddyKiResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("openai-api-key-missing");
  }

  const model = process.env.BUDDY_KI_MODEL || "gpt-4o-mini";
  const messages: OpenAiChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(intent, context) },
  ];

  const result = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!result.ok) {
    throw new Error(`openai-http-${result.status}`);
  }

  const data = await result.json() as OpenAiChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("openai-empty-response");
  }

  return sanitizeModelResponse(intent, safeParseModelJson(content));
}

export const buddyKiOpenAiProvider: BuddyKiProvider = {
  mode: "remote-ai",

  async generateResponse(intent, context) {
    return requestOpenAiChat(intent, context);
  },
};
