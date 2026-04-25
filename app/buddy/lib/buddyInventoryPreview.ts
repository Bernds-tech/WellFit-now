export type BuddyPreviewItem = {
  name: string;
  category: "Futter" | "Pflege" | "Spielzeug" | "Skin" | "AR";
  price: number;
  status: "mvp" | "comingSoon";
  description: string;
};

export const buddyPreviewItems: BuddyPreviewItem[] = [
  {
    name: "Drachenbeere",
    category: "Futter",
    price: 5,
    status: "mvp",
    description: "Ein einfaches Futteritem für Hunger und Stimmung.",
  },
  {
    name: "Glanzbürste",
    category: "Pflege",
    price: 8,
    status: "mvp",
    description: "Verbessert Sauberkeit und Bindung.",
  },
  {
    name: "Funkenball",
    category: "Spielzeug",
    price: 12,
    status: "comingSoon",
    description: "Später für Spielen, Neugier und Mini-Interaktionen.",
  },
  {
    name: "Feuer-Schal",
    category: "Skin",
    price: 40,
    status: "comingSoon",
    description: "Kosmetisches Item für den späteren Punkte-Shop.",
  },
  {
    name: "Spuren-Kompass",
    category: "AR",
    price: 25,
    status: "comingSoon",
    description: "Hilft später bei der AR-Rückholsuche.",
  },
];
