import { buddyKiRulesProvider } from "./buddyKiProviderRules";
import { type BuddyKiContext, type BuddyKiIntent, type BuddyKiProvider, type BuddyKiResponse } from "./buddyKiTypes";

type BuddyKiApiResponse = {
  ok?: boolean;
  response?: BuddyKiResponse;
  error?: string;
};

/**
 * Remote-AI Provider.
 *
 * Der Client spricht nur mit dem eigenen WellFit Backend Endpoint `/api/buddy-ki`.
 * Keine API Keys im Client. Keine direkte OpenAI-/LLM-Verbindung aus Mobile.
 * Wenn der Endpoint ausfaellt, faellt der Provider sicher auf Rules zurueck.
 */
export const buddyKiRemoteProvider: BuddyKiProvider = {
  mode: "remote-ai",

  async generateResponse(intent: BuddyKiIntent, context: BuddyKiContext): Promise<BuddyKiResponse> {
    try {
      const result = await fetch("/api/buddy-ki", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intent, context }),
      });

      if (!result.ok) {
        throw new Error(`buddy-ki-http-${result.status}`);
      }

      const data = (await result.json()) as BuddyKiApiResponse;
      if (!data.ok || !data.response) {
        throw new Error(data.error || "buddy-ki-invalid-response");
      }

      return {
        ...data.response,
        providerMode: "remote-ai",
        safety: {
          rewardAuthorized: false,
          missionCompletionAuthorized: false,
          medicalDiagnosis: false,
          mobileTokenTrading: false,
        },
      };
    } catch (error) {
      console.warn("Buddy KI Remote Provider fallback to rules", error);
      const fallback = await buddyKiRulesProvider.generateResponse(intent, context);
      return {
        ...fallback,
        providerMode: "rules",
      };
    }
  },
};
