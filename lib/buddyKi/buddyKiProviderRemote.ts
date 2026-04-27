import { buddyKiRulesProvider } from "./buddyKiProviderRules";
import { type BuddyKiContext, type BuddyKiIntent, type BuddyKiProvider, type BuddyKiResponse } from "./buddyKiTypes";

/**
 * Remote-AI Provider Placeholder.
 *
 * Diese Datei haelt die spaetere echte KI-Anbindung austauschbar.
 * Aktuell faellt sie bewusst auf den Rules Provider zurueck, damit Mobile/UI/AR
 * stabil bleiben, solange noch kein sicherer Backend-KI-Endpunkt existiert.
 *
 * Wichtig:
 * - Keine API Keys im Client.
 * - Keine direkte OpenAI-/LLM-Anbindung aus Mobile Client.
 * - Echte KI spaeter nur ueber einen serverseitigen WellFit Endpoint.
 */
export const buddyKiRemoteProvider: BuddyKiProvider = {
  mode: "remote-ai",

  async generateResponse(intent: BuddyKiIntent, context: BuddyKiContext): Promise<BuddyKiResponse> {
    // TODO: Spaeter serverseitigen Endpoint verwenden, z. B. /api/buddy-ki/respond.
    // Bis dahin: sichere lokale Fallback-Antwort.
    const fallback = await buddyKiRulesProvider.generateResponse(intent, context);

    return {
      ...fallback,
      providerMode: "remote-ai",
      message: `${fallback.message}`,
    };
  },
};
