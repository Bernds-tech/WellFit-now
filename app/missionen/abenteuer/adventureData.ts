export const ADVENTURE_CATALOG_ID = "wellfit-beta1-adventure-missions";
export const ADVENTURE_CATALOG_VERSION = "1.0.0";
export const ADVENTURE_COMPLETION_POLICY = "once-per-mission-per-user" as const;
export const ADVENTURE_ACCESS_POLICY = "one-time-wfxp-access-per-user" as const;
export const ADVENTURE_EVIDENCE_TYPE = "adventure-user-confirmation" as const;

export type AdventureCategory = "Wissen & Kultur" | "Bewegung & Stadt" | "Lernen & Natur" | "AR & Erlebnis";
export type AdventureDisplayType = "Bewegung" | "Abenteuer";
export type AdventureServerType = "movement" | "learning" | "ar";

export type Adventure = {
  id: number;
  missionId: string;
  title: string;
  shortLabel: string;
  rewardWfxp: number;
  accessCostWfxp: number;
  category: AdventureCategory;
  description: string;
  statusLabel: string;
  distanceLabel: string;
  playersLabel: string;
  icon: string;
  displayType: AdventureDisplayType;
  serverType: AdventureServerType;
  evidenceType: typeof ADVENTURE_EVIDENCE_TYPE;
  reviewRequired: true;
  childAllowed: false;
  position: { left: string; top: string };
};

export const adventures: Adventure[] = [
  {
    id: 1,
    missionId: "adventure-museum-quiz",
    title: "Museums-Quiz",
    shortLabel: "Quiz",
    rewardWfxp: 240,
    accessCostWfxp: 10,
    category: "Wissen & Kultur",
    description: "Entdecke ein Museum, löse Fragen und reiche den Abschluss zur serverseitigen Prüfung ein.",
    statusLabel: "Premium",
    distanceLabel: "2,6 km",
    playersLabel: "4 vor Ort",
    icon: "🏛️",
    displayType: "Abenteuer",
    serverType: "learning",
    evidenceType: ADVENTURE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
    position: { left: "24%", top: "18%" },
  },
  {
    id: 2,
    missionId: "adventure-city-sprint",
    title: "City-Sprint",
    shortLabel: "City",
    rewardWfxp: 180,
    accessCostWfxp: 8,
    category: "Bewegung & Stadt",
    description: "Erkunde eine Stadtstrecke, erreiche die Checkpoints und bestätige das Abenteuer zur Prüfung.",
    statusLabel: "Startpunkt",
    distanceLabel: "1,8 km",
    playersLabel: "8 vor Ort",
    icon: "🏃",
    displayType: "Bewegung",
    serverType: "movement",
    evidenceType: ADVENTURE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
    position: { left: "44%", top: "40%" },
  },
  {
    id: 3,
    missionId: "adventure-zoo-explorer",
    title: "Zoo-Explorer",
    shortLabel: "Zoo",
    rewardWfxp: 180,
    accessCostWfxp: 10,
    category: "Lernen & Natur",
    description: "Folge der Tierparkroute, löse Wissensaufgaben und reiche den Abschluss zur Prüfung ein.",
    statusLabel: "Premium",
    distanceLabel: "1,4 km",
    playersLabel: "5 vor Ort",
    icon: "🦁",
    displayType: "Abenteuer",
    serverType: "learning",
    evidenceType: ADVENTURE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
    position: { left: "65%", top: "28%" },
  },
  {
    id: 4,
    missionId: "adventure-ar-treasure",
    title: "AR-Schatzsuche",
    shortLabel: "AR",
    rewardWfxp: 300,
    accessCostWfxp: 12,
    category: "AR & Erlebnis",
    description: "Finde AR-Marker in deiner Umgebung und lasse den Abschluss serverseitig prüfen.",
    statusLabel: "Premium",
    distanceLabel: "3,0 km",
    playersLabel: "9 vor Ort",
    icon: "🗺️",
    displayType: "Abenteuer",
    serverType: "ar",
    evidenceType: ADVENTURE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
    position: { left: "76%", top: "58%" },
  },
];

export const missionTabs = [
  { label: "Tagesmissionen", href: "/missionen/tagesmissionen" },
  { label: "Wochenmissionen", href: "/missionen/wochenmissionen" },
  { label: "Abenteuer", href: "/missionen/abenteuer" },
  { label: "Challenge", href: "/missionen/challenge" },
  { label: "Wettkämpfe", href: "/missionen/wettkaempfe" },
  { label: "Favoriten", href: "/missionen/favoriten" },
  { label: "History", href: "/missionen/history" },
];
