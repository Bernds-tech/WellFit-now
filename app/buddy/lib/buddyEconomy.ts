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
  "Beta 1: Buddy-Zustand, WFXP-Abzüge, Inventar und Audit werden ausschließlich serverseitig autorisiert. WFXP haben keinen Geldwert und können nicht ausgezahlt werden.";
