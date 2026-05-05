export type DashboardCardSize = "small" | "medium" | "large" | "wide";

export type DashboardCardCategory =
  | "core"
  | "mission"
  | "buddy"
  | "economy"
  | "social"
  | "analytics"
  | "system";

export type DashboardCardDefinition = {
  id: string;
  label: string;
  description: string;
  category: DashboardCardCategory;
  href?: string;
  allowedSizes: DashboardCardSize[];
  defaultSize: DashboardCardSize;
  defaultPinned: boolean;
  requiresAuth: boolean;
  requiresConsent?: boolean;
  isClientAuthority: false;
};

export const dashboardCards: DashboardCardDefinition[] = [
  {
    id: "dailyMission",
    label: "Heutige Mission",
    description: "Schneller Einstieg in die wichtigste Mission des Tages.",
    category: "mission",
    href: "/missionen/tagesmissionen",
    allowedSizes: ["medium", "large", "wide"],
    defaultSize: "wide",
    defaultPinned: true,
    requiresAuth: true,
    isClientAuthority: false,
  },
  {
    id: "buddyStatus",
    label: "KI-Buddy Status",
    description: "Stimmung, Energie und Bedürfnisse des Buddys als persönliche Statuskarte.",
    category: "buddy",
    href: "/buddy",
    allowedSizes: ["medium", "large", "wide"],
    defaultSize: "large",
    defaultPinned: true,
    requiresAuth: true,
    isClientAuthority: false,
  },
  {
    id: "userNeeds",
    label: "Bedürfnisse",
    description: "Zeigt, was gerade wichtig ist: Bewegung, Wasser, Pause, Schlaf oder Aufmerksamkeit.",
    category: "core",
    allowedSizes: ["medium", "large", "wide"],
    defaultSize: "medium",
    defaultPinned: true,
    requiresAuth: true,
    requiresConsent: true,
    isClientAuthority: false,
  },
  {
    id: "pointsBalance",
    label: "Punkte & XP",
    description: "Interne Punkte, XP und Level als reine Anzeige ohne clientseitige Autorität.",
    category: "economy",
    href: "/punkte-shop",
    allowedSizes: ["small", "medium", "large"],
    defaultSize: "medium",
    defaultPinned: true,
    requiresAuth: true,
    isClientAuthority: false,
  },
  {
    id: "healthProgress",
    label: "Gesundheitsfortschritt",
    description: "Übersicht für Aktivität, Fortschritt und Lifestyle-Daten mit Consent-Bezug.",
    category: "analytics",
    href: "/analytics",
    allowedSizes: ["medium", "large", "wide"],
    defaultSize: "medium",
    defaultPinned: true,
    requiresAuth: true,
    requiresConsent: true,
    isClientAuthority: false,
  },
  {
    id: "marketplace",
    label: "Marktplatz",
    description: "Einstieg zu geprüften digitalen Inhalten, Partnerangeboten und späteren Creator-Modulen.",
    category: "economy",
    href: "/marktplatz",
    allowedSizes: ["small", "medium", "large"],
    defaultSize: "small",
    defaultPinned: false,
    requiresAuth: true,
    isClientAuthority: false,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    description: "Einstieg zu später serverseitig validierten Ranglisten.",
    category: "social",
    href: "/leaderboard",
    allowedSizes: ["small", "medium", "large"],
    defaultSize: "small",
    defaultPinned: false,
    requiresAuth: true,
    isClientAuthority: false,
  },
  {
    id: "pointsShop",
    label: "Punkte-Shop",
    description: "Einstieg zu später serverseitig kontrollierten Punkteausgaben und internen Sinks.",
    category: "economy",
    href: "/punkte-shop",
    allowedSizes: ["small", "medium", "large"],
    defaultSize: "small",
    defaultPinned: false,
    requiresAuth: true,
    isClientAuthority: false,
  },
  {
    id: "analytics",
    label: "Analytics & Stats",
    description: "Persönliche Auswertung, Fortschritt und sichere Statistiken mit Datenschutzfokus.",
    category: "analytics",
    href: "/analytics",
    allowedSizes: ["medium", "large", "wide"],
    defaultSize: "medium",
    defaultPinned: false,
    requiresAuth: true,
    requiresConsent: true,
    isClientAuthority: false,
  },
  {
    id: "systemStatus",
    label: "Systemstatus",
    description: "Zeigt sichere Hinweise: interne Punkte, keine Token-Autorität, Serverprüfung vorbereitet.",
    category: "system",
    allowedSizes: ["small", "medium", "wide"],
    defaultSize: "medium",
    defaultPinned: false,
    requiresAuth: true,
    isClientAuthority: false,
  },
];

export const defaultPinnedDashboardCardIds = dashboardCards
  .filter((card) => card.defaultPinned)
  .map((card) => card.id);

export function getDashboardCardById(cardId: string) {
  return dashboardCards.find((card) => card.id === cardId);
}
