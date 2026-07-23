import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import {
  CHALLENGE_CATALOG_ID,
  CHALLENGE_CATALOG_VERSION,
  CHALLENGE_COMPLETION_POLICY,
  CHALLENGE_EVIDENCE_TYPE,
  type ChallengeCategory,
  type ChallengeDisplayType,
  type ChallengeServerType,
} from "@/app/missionen/challenge/challengeData";

export type Beta1ChallengeCatalogMission = {
  missionId: string;
  title: string;
  rewardWfxp: number;
  category: ChallengeCategory;
  description: string;
  displayType: ChallengeDisplayType;
  serverType: ChallengeServerType;
  levelRecommendation: string;
  movementGoal: string;
};

export type Beta1ChallengeCatalogResult = {
  catalogId: typeof CHALLENGE_CATALOG_ID;
  catalogVersion: typeof CHALLENGE_CATALOG_VERSION;
  completionPolicy: typeof CHALLENGE_COMPLETION_POLICY;
  count: number;
  currency: "WFXP";
  noMonetaryValue: true;
  tokenAuthorized: false;
  cashoutAllowed: false;
  missions: Beta1ChallengeCatalogMission[];
};

type RawCatalogResponse = {
  accepted?: boolean;
  catalogId?: string;
  catalogVersion?: string;
  completionPolicy?: string;
  count?: number;
  currency?: string;
  noMonetaryValue?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
  missions?: Array<Record<string, unknown>>;
};

const categories: ChallengeCategory[] = [
  "Sport & Bewegung",
  "Fitness & Klarheit",
  "Wissen & Klarheit",
  "Geschicklichkeit",
  "AR & Erlebnis",
  "Wellness & Mindset",
];
const displayTypes: ChallengeDisplayType[] = ["Bewegung", "Workout", "Abenteuer"];
const serverTypes: ChallengeServerType[] = ["movement", "workout", "learning", "skill", "ar", "wellness"];

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Admin-Login erforderlich.");
}

function errorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Admin-Login erforderlich.";
  if (diagnostic.includes("permission-denied")) return "Die Admin-Rolle fehlt oder ist nicht aktuell.";
  if (diagnostic.includes("failed-precondition")) return "Der Challenge-Katalog ist unvollständig oder verletzt eine Beta-1-Sicherheitsgrenze.";
  return "Der Challenge-Katalog konnte nicht sicher veröffentlicht werden.";
}

function isCategory(value: unknown): value is ChallengeCategory {
  return typeof value === "string" && categories.includes(value as ChallengeCategory);
}

function isDisplayType(value: unknown): value is ChallengeDisplayType {
  return typeof value === "string" && displayTypes.includes(value as ChallengeDisplayType);
}

function isServerType(value: unknown): value is ChallengeServerType {
  return typeof value === "string" && serverTypes.includes(value as ChallengeServerType);
}

function mapMission(value: Record<string, unknown>): Beta1ChallengeCatalogMission | null {
  const missionId = typeof value.missionId === "string" ? value.missionId : "";
  const title = typeof value.title === "string" ? value.title : "";
  const rewardWfxp = Number(value.rewardXp);
  const description = typeof value.description === "string" ? value.description : "";
  const levelRecommendation = typeof value.levelRecommendation === "string" ? value.levelRecommendation : "";
  const movementGoal = typeof value.movementGoal === "string" ? value.movementGoal : "";
  if (
    !missionId
    || !title
    || !Number.isInteger(rewardWfxp)
    || rewardWfxp < 1
    || rewardWfxp > 150
    || !isCategory(value.category)
    || !description
    || !isDisplayType(value.displayType)
    || !isServerType(value.type)
    || !levelRecommendation
    || !movementGoal
    || value.evidenceType !== CHALLENGE_EVIDENCE_TYPE
    || value.reviewRequired !== true
    || value.childAllowed !== false
    || value.completionPolicy !== CHALLENGE_COMPLETION_POLICY
    || value.status !== "published"
    || value.noMonetaryValue !== true
    || value.tokenAuthorized === true
    || value.cashoutAllowed === true
  ) {
    return null;
  }
  return {
    missionId,
    title,
    rewardWfxp,
    category: value.category,
    description,
    displayType: value.displayType,
    serverType: value.type,
    levelRecommendation,
    movementGoal,
  };
}

export async function ensureChallengeMissionCatalogForAdmin(): Promise<Beta1ChallengeCatalogResult> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawCatalogResponse>(
      getFunctions(),
      "adminEnsureChallengeMissionCatalog",
    );
    const result = await callable({});
    const data = result.data;
    const missions = Array.isArray(data.missions)
      ? data.missions.map(mapMission).filter((mission): mission is Beta1ChallengeCatalogMission => mission !== null)
      : [];
    if (
      !data.accepted
      || data.catalogId !== CHALLENGE_CATALOG_ID
      || data.catalogVersion !== CHALLENGE_CATALOG_VERSION
      || data.completionPolicy !== CHALLENGE_COMPLETION_POLICY
      || data.currency !== "WFXP"
      || data.noMonetaryValue !== true
      || data.tokenAuthorized === true
      || data.cashoutAllowed === true
      || data.count !== missions.length
      || missions.length !== 6
    ) {
      throw new Error("failed-precondition: invalid challenge mission catalog response");
    }
    return {
      catalogId: CHALLENGE_CATALOG_ID,
      catalogVersion: CHALLENGE_CATALOG_VERSION,
      completionPolicy: CHALLENGE_COMPLETION_POLICY,
      count: missions.length,
      currency: "WFXP",
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      missions,
    };
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}
