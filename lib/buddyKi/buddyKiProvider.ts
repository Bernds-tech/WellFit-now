import { buddyKiRulesProvider } from "./buddyKiProviderRules";
import { buddyKiRemoteProvider } from "./buddyKiProviderRemote";
import { type BuddyKiContext, type BuddyKiIntent, type BuddyKiProviderMode, type BuddyKiResponse } from "./buddyKiTypes";

let currentMode: BuddyKiProviderMode = "rules";

export function setBuddyKiMode(mode: BuddyKiProviderMode) {
  currentMode = mode;
}

export function getBuddyKiMode() {
  return currentMode;
}

async function resolveProvider() {
  switch (currentMode) {
    case "remote-ai":
      return buddyKiRemoteProvider;
    case "mock":
    case "rules":
    default:
      return buddyKiRulesProvider;
  }
}

export async function generateBuddyKiResponse(intent: BuddyKiIntent, context: BuddyKiContext): Promise<BuddyKiResponse> {
  const provider = await resolveProvider();
  return provider.generateResponse(intent, context);
}
