import { createBuddyKiSafety, type BuddyKiContext, type BuddyKiIntent, type BuddyKiProvider, type BuddyKiResponse } from "./buddyKiTypes";

function createBaseResponse(intent: BuddyKiIntent, context: BuddyKiContext): BuddyKiResponse {
  return {
    providerMode: "rules",
    intent,
    title: "Buddy",
    message: "",
    mood: "neutral",
    options: [],
    safety: createBuddyKiSafety(),
  };
}

export const buddyKiRulesProvider: BuddyKiProvider = {
  mode: "rules",

  async generateResponse(intent, context) {
    const res = createBaseResponse(intent, context);

    switch (intent) {
      case "welcome": {
        res.title = "Hey, ich bin dein Buddy 🐉";
        res.message = "Lass uns gemeinsam etwas erleben. Ich kann dir Missionen vorschlagen oder Hinweise geben.";
        res.mood = "happy";
        res.options = [
          { id: "suggest", label: "Mission vorschlagen", intent: "suggestMission" },
        ];
        break;
      }

      case "suggestMission": {
        res.title = "Ich habe etwas für dich";
        res.message = "Wie wäre es mit einer einfachen AR-Mission in deiner Nähe?";
        res.mood = "curious";
        res.options = [
          { id: "start", label: "Mission starten", intent: "missionProgress", payload: { missionId: "demo_ar_walk_001" } },
          { id: "hint", label: "Hinweis anzeigen", intent: "arHint" },
        ];
        break;
      }

      case "explainMissingCapability": {
        res.title = "Ich brauche Hilfe";
        res.message = `Ich brauche ${context.missingCapabilityId || "eine Fähigkeit"}, um das zu schaffen.`;
        res.mood = "helpful";
        res.options = [
          { id: "detour", label: "Alternative Aufgabe", intent: "safeDetour" },
        ];
        break;
      }

      case "safeDetour": {
        res.title = "Alternative gefunden";
        res.message = "Wir machen einfach eine andere Aufgabe, die du sofort schaffen kannst.";
        res.mood = "happy";
        res.options = [
          { id: "start", label: "Los geht’s", intent: "missionProgress", payload: { missionId: "demo_safe_detour_001" } },
        ];
        break;
      }

      case "arHint": {
        res.title = "Schau mal dort";
        res.message = "Ich habe etwas in deiner Umgebung markiert.";
        res.mood = "curious";
        res.options = [
          { id: "focus", label: "Hinweis ansehen", intent: "arHint" },
        ];
        break;
      }

      case "missionProgress": {
        res.title = "Weiter geht’s";
        res.message = "Super, bleib dran. Wir schaffen das gemeinsam.";
        res.mood = "happy";
        res.options = [];
        break;
      }

      case "errorHelp": {
        res.title = "Etwas stimmt nicht";
        res.message = "Versuche es nochmal oder bewege dein Handy langsamer.";
        res.mood = "warning";
        res.options = [];
        break;
      }

      default: {
        res.title = "Ich bin da";
        res.message = "Sag mir, was du machen möchtest.";
      }
    }

    return res;
  },
};
