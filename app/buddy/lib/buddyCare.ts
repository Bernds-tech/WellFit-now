import type { BuddyState } from "../types";

export type BuddyCareRule = {
  title: string;
  text: string;
  severity: "good" | "watch" | "danger";
};

export function getBuddyCareRules(buddy: BuddyState): BuddyCareRule[] {
  const rules: BuddyCareRule[] = [];

  if (buddy.hunger < 35) {
    rules.push({
      title: "Hunger niedrig",
      text: "Flammi braucht Futter. Wenn Hunger länger niedrig bleibt, sinken Stimmung und Loyalität.",
      severity: "watch",
    });
  }

  if (buddy.cleanliness < 35) {
    rules.push({
      title: "Chaos-Gefahr",
      text: "Wenn der Horst zu chaotisch wird, entsteht eine Aufräum-Aufgabe. Flammi schämt sich, aber wartet auf Hilfe.",
      severity: "watch",
    });
  }

  if (buddy.bond < 30 || buddy.loyalty < 25) {
    rules.push({
      title: "Weglauf-Risiko",
      text: "Wenn Bindung und Loyalität stark fallen, kann Flammi auf Abenteuer gehen. Dann startet später eine Rückholsuche.",
      severity: "danger",
    });
  }

  if (buddy.energy > 60 && buddy.bond > 55 && buddy.cleanliness > 55) {
    rules.push({
      title: "Stabile Bindung",
      text: "Flammi fühlt sich sicher. Gute Pflege hält ihn aktiv und macht spätere AR-Abenteuer wahrscheinlicher.",
      severity: "good",
    });
  }

  if (rules.length === 0) {
    rules.push({
      title: "Ausgeglichen",
      text: "Flammi ist stabil. Eine kleine Aktion reicht, um eure Beziehung heute weiter zu stärken.",
      severity: "good",
    });
  }

  return rules;
}

export function getBuddyNextBestAction(buddy: BuddyState) {
  if (buddy.status === "ranAway") return "Spuren sammeln und Rückholsuche vorbereiten";
  if (buddy.cleanliness < 35) return "Horst aufräumen";
  if (buddy.hunger < 40) return "Flammi füttern";
  if (buddy.bond < 45) return "Kurz mit Flammi spielen";
  if (buddy.energy < 45) return "Sanft starten oder später trainieren";
  return "Bindung stärken und nächsten Fortschritt planen";
}
