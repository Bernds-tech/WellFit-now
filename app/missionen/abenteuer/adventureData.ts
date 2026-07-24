import adventureCatalog from "@/functions/config/beta1-adventure-missions.json";

export const ADVENTURE_CATALOG_ID = adventureCatalog.catalogId;
export const ADVENTURE_CATALOG_VERSION = adventureCatalog.version;
export const ADVENTURE_COMPLETION_POLICY = "once-per-mission-per-user" as const;
export const ADVENTURE_ACCESS_POLICY = "one-time-wfxp-access-per-user" as const;
export const ADVENTURE_LOCATION_POLICY = "nearby-published-location" as const;
export const ADVENTURE_START_RADIUS_METERS = 500 as const;
export const ADVENTURE_EVIDENCE_TYPE = "adventure-user-confirmation" as const;

export type AdventureCategory = "Museen" | "Parks & Städte" | "Tierparks" | "Burgen & Natur";
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
  icon: string;
  displayType: AdventureDisplayType;
  serverType: AdventureServerType;
  locationTypes: string[];
  milestones: string[];
  evidenceType: typeof ADVENTURE_EVIDENCE_TYPE;
  reviewRequired: true;
  childAllowed: false;
  locationPolicy: typeof ADVENTURE_LOCATION_POLICY;
};

const categoryValues: AdventureCategory[] = ["Museen", "Parks & Städte", "Tierparks", "Burgen & Natur"];
const displayTypeValues: AdventureDisplayType[] = ["Bewegung", "Abenteuer"];
const serverTypeValues: AdventureServerType[] = ["movement", "learning", "ar"];

function asCategory(value: string): AdventureCategory {
  if (categoryValues.includes(value as AdventureCategory)) return value as AdventureCategory;
  throw new Error(`Invalid adventure category: ${value}`);
}

function asDisplayType(value: string): AdventureDisplayType {
  if (displayTypeValues.includes(value as AdventureDisplayType)) return value as AdventureDisplayType;
  throw new Error(`Invalid adventure display type: ${value}`);
}

function asServerType(value: string): AdventureServerType {
  if (serverTypeValues.includes(value as AdventureServerType)) return value as AdventureServerType;
  throw new Error(`Invalid adventure server type: ${value}`);
}

function iconForMission(missionId: string) {
  if (missionId === "adventure-museum-quiz") return "🏛️";
  if (missionId === "adventure-city-sprint") return "🏃";
  if (missionId === "adventure-zoo-explorer") return "🦁";
  return "🗺️";
}

if (
  adventureCatalog.completionPolicy !== ADVENTURE_COMPLETION_POLICY
  || adventureCatalog.accessPolicy !== ADVENTURE_ACCESS_POLICY
  || adventureCatalog.locationPolicy !== ADVENTURE_LOCATION_POLICY
  || adventureCatalog.startRadiusMeters !== ADVENTURE_START_RADIUS_METERS
) {
  throw new Error("Unsafe adventure catalog policy.");
}

export const adventures: Adventure[] = adventureCatalog.missions.map((mission, index) => {
  if (
    mission.evidenceType !== ADVENTURE_EVIDENCE_TYPE
    || mission.reviewRequired !== true
    || mission.childAllowed !== false
    || !Array.isArray(mission.locationTypes)
    || mission.locationTypes.length === 0
    || !Array.isArray(mission.milestones)
    || mission.milestones.length === 0
  ) {
    throw new Error(`Unsafe adventure catalog boundary: ${mission.missionId}`);
  }
  return {
    id: index + 1,
    missionId: mission.missionId,
    title: mission.title,
    shortLabel: mission.shortLabel,
    rewardWfxp: mission.rewardXp,
    accessCostWfxp: mission.accessCostWfxp,
    category: asCategory(mission.category),
    description: mission.description,
    icon: iconForMission(mission.missionId),
    displayType: asDisplayType(mission.displayType),
    serverType: asServerType(mission.type),
    locationTypes: [...mission.locationTypes],
    milestones: [...mission.milestones],
    evidenceType: ADVENTURE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
    locationPolicy: ADVENTURE_LOCATION_POLICY,
  };
});

export const adventureCategories: ("Alle Orte" | AdventureCategory)[] = [
  "Alle Orte",
  "Museen",
  "Parks & Städte",
  "Tierparks",
  "Burgen & Natur",
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