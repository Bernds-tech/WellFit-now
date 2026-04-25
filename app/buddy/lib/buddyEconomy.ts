import type { BuddyActionType } from "../types";

export const buddyActionPrices: Record<BuddyActionType, number> = {
  feed: 5,
  care: 8,
  play: 3,
  clean: 4,
  call: 0,
  search: 0,
};

export const buddyEconomyNotice =
  "MVP: Punkteaktionen sind aktuell nur als interne WellFit-Logik vorbereitet. Produktkritische Abzüge, Rewards, Inventar und Rückholmechaniken müssen später serverseitig abgesichert werden.";
