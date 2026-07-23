import type { BuddyAction, BuddyActionType, BuddyState } from "../types";
import { buddyActionPrices } from "./buddyEconomy";

export function getBuddyStory(buddy: BuddyState) {
  if (buddy.status === "ranAway") {
    return "Flammi ist auf Abenteuer gegangen. Sammle Spuren, rufe ihn zurück und bereite ihm einen sicheren Platz vor.";
  }

  if (buddy.status === "messy") {
    return "Flammi war zu lange allein und hat ein kleines Chaos gemacht. Er schaut verlegen zu dir und wartet auf Hilfe.";
  }

  if (buddy.status === "needsCare") {
    return "Flammi braucht gerade Aufmerksamkeit. Ein bisschen Pflege, Futter oder gemeinsames Spielen bringt ihn wieder näher zu dir.";
  }

  if (buddy.status === "tired") {
    return "Flammi ist heute ruhiger als sonst. Ein kleiner gemeinsamer Start reicht, um wieder Energie aufzubauen.";
  }

  if (buddy.dailyMode === "abenteuerlustig") {
    return "Flammi ist heute voller Neugier und möchte später mit dir draußen etwas entdecken.";
  }

  if (buddy.dailyMode === "stolz") {
    return "Flammi wirkt stolz auf euren Fortschritt. Er spürt, dass eure Bindung stärker wird.";
  }

  return "Flammi ist wach, neugierig und bereit für euren nächsten kleinen Fortschritt.";
}

export function getBuddyStatusLabel(buddy: BuddyState) {
  const labels = {
    active: "Aktiv",
    tired: "Müde",
    needsCare: "Braucht Pflege",
    messy: "Chaos im Zuhause",
    ranAway: "Auf Abenteuer",
    foundByOther: "Von jemandem gesehen",
    recovered: "Wiedergefunden",
  } as const;

  return labels[buddy.status];
}

export type BuddyActionPriceMap = Partial<Record<BuddyActionType, number>>;

function actionCost(actionType: BuddyActionType, prices: BuddyActionPriceMap) {
  const value = Number(prices[actionType] ?? buddyActionPrices[actionType]);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : buddyActionPrices[actionType];
}

export function getBuddyActions(buddy: BuddyState, prices: BuddyActionPriceMap = {}): BuddyAction[] {
  const feedCost = actionCost("feed", prices);
  const careCost = actionCost("care", prices);
  const playCost = actionCost("play", prices);
  const cleanCost = actionCost("clean", prices);
  const callCost = actionCost("call", prices);
  const searchCost = actionCost("search", prices);
  const careWouldChange = buddy.cleanliness < 100 || buddy.bond < 100 || buddy.mood < 100 || buddy.loyalty < 100;
  const callWouldChange = buddy.bond < 100 || buddy.mood < 100 || buddy.loyalty < 100;

  return [
    {
      type: "feed",
      label: "Füttern",
      description: "Kauft oder nutzt serverseitig einen Energie-Snack und stärkt den Hungerwert.",
      cost: feedCost,
      disabled: buddy.points < feedCost || buddy.hunger >= 100 || buddy.status === "ranAway",
    },
    {
      type: "care",
      label: "Pflegen",
      description: "Verbessert Sauberkeit, Bindung und Stimmung über den sicheren WFXP-Pfad.",
      cost: careCost,
      disabled: buddy.points < careCost || buddy.status === "ranAway" || !careWouldChange,
    },
    {
      type: "play",
      label: "Spielen",
      description: "Erhöht Stimmung und Neugier; kostet etwas Energie und Hunger.",
      cost: playCost,
      disabled: buddy.points < playCost || buddy.status === "ranAway" || buddy.energy <= 10 || buddy.hunger <= 10,
    },
    {
      type: "clean",
      label: "Aufräumen",
      description: "Beseitigt einen serverseitig erkannten chaotischen Buddy-Zustand.",
      cost: cleanCost,
      disabled: buddy.points < cleanCost || buddy.status !== "messy",
    },
    {
      type: "call",
      label: "Rufen",
      description: "Stärkt kostenlos Bindung und Stimmung, solange Flammi bei dir ist.",
      cost: callCost,
      disabled: buddy.status === "ranAway" || !callWouldChange,
    },
    {
      type: "search",
      label: "Suchen",
      description: "Startet die serverseitige Rückholaktion, wenn Flammi auf Abenteuer ist.",
      cost: searchCost,
      disabled: buddy.status !== "ranAway",
    },
  ];
}
