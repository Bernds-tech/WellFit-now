import { economyConfig } from "@/config/economy";
import { calculateReserveAdjustedPrice, getInternalReserveSnapshot } from "./reserve";

export type InternalShopItemType =
  | "food"
  | "outfit"
  | "shield"
  | "buddy_upgrade"
  | "mission_hint"
  | "care";

export type InternalShopItem = {
  id: string;
  title: string;
  type: InternalShopItemType;
  basePrice: number;
  betaDescription: string;
  appStoreSafe: boolean;
  tokenizedLater: boolean;
};

export type InternalShopItemWithPrice = InternalShopItem & {
  price: number;
  priceRate: number;
  currencyLabel: "interne Punkte";
};

export const betaInternalShopItems: InternalShopItem[] = [
  {
    id: "buddy-food-basic",
    title: "Basis-Futter",
    type: "food",
    basePrice: economyConfig.baseFoodPrice,
    betaDescription: "Ein einfacher interner Punkte-Sink fuer Buddy-Hunger. Keine Echtgeld- oder Token-Funktion.",
    appStoreSafe: true,
    tokenizedLater: false,
  },
  {
    id: "buddy-care-kit",
    title: "Pflege-Set",
    type: "care",
    basePrice: 12,
    betaDescription: "Kosmetische Buddy-Pflege als interner Punkte-Sink.",
    appStoreSafe: true,
    tokenizedLater: false,
  },
  {
    id: "outfit-starter-band",
    title: "Starter-Gewand",
    type: "outfit",
    basePrice: 35,
    betaDescription: "Spaeter kosmetisches Gewand. In der Beta nur interne Punkte und keine NFT-Eigenschaft.",
    appStoreSafe: true,
    tokenizedLater: true,
  },
  {
    id: "shield-bronze",
    title: "Bronze-Schild",
    type: "shield",
    basePrice: 45,
    betaDescription: "Kosmetisches Schild / Abzeichen. Spaeter optional tokenisierbar, jetzt rein intern.",
    appStoreSafe: true,
    tokenizedLater: true,
  },
  {
    id: "buddy-jump-style",
    title: "Buddy-Sprungstil",
    type: "buddy_upgrade",
    basePrice: 60,
    betaDescription: "Kosmetisches Buddy-Upgrade ohne Vorteil bei Rewards oder Mission Completion.",
    appStoreSafe: true,
    tokenizedLater: false,
  },
  {
    id: "mission-hint-small",
    title: "Kleiner Missionshinweis",
    type: "mission_hint",
    basePrice: 15,
    betaDescription: "Hilft bei einer Mission, autorisiert aber keine Completion und keine Rewards.",
    appStoreSafe: true,
    tokenizedLater: false,
  },
];

export const getBetaShopItemsWithPrices = (): InternalShopItemWithPrice[] => {
  const snapshot = getInternalReserveSnapshot();

  return betaInternalShopItems.map((item) => ({
    ...item,
    price: calculateReserveAdjustedPrice(item.basePrice, snapshot),
    priceRate: snapshot.priceRate,
    currencyLabel: "interne Punkte",
  }));
};

export const findBetaShopItemWithPrice = (itemId: string) => {
  return getBetaShopItemsWithPrices().find((item) => item.id === itemId);
};