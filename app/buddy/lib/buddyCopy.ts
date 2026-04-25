import type { BuddyAction, BuddyState } from "../types";

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

export function getBuddyActions(buddy: BuddyState): BuddyAction[] {
  return [
    {
      type: "feed",
      label: "Füttern",
      description: "Gibt Hunger zurück und stärkt kurzzeitig die Stimmung.",
      cost: 5,
      disabled: buddy.points < 5 || buddy.status === "ranAway",
    },
    {
      type: "care",
      label: "Pflegen",
      description: "Verbessert Sauberkeit und Bindung.",
      cost: 8,
      disabled: buddy.points < 8 || buddy.status === "ranAway",
    },
    {
      type: "play",
      label: "Spielen",
      description: "Erhöht Stimmung, Neugier und eure Verbindung.",
      cost: 3,
      disabled: buddy.points < 3 || buddy.status === "ranAway",
    },
    {
      type: "clean",
      label: "Aufräumen",
      description: "Beseitigt Chaos in Flammis Zuhause.",
      cost: 4,
      disabled: buddy.points < 4 || buddy.status !== "messy",
    },
    {
      type: "call",
      label: "Rufen",
      description: "Zeigt Flammi, dass du wieder da bist.",
      cost: 0,
      disabled: buddy.status === "ranAway",
    },
    {
      type: "search",
      label: "Suchen",
      description: "Startet später die Rückhol- und AR-Suche.",
      cost: 0,
      disabled: buddy.status !== "ranAway",
    },
  ];
}
