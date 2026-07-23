import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import {
  DAILY_MISSION_CATALOG_ID,
  DAILY_MISSION_CATALOG_VERSION,
  type DailyMission,
} from "@/app/missionen/tagesmissionen/missions";

export type Beta1DailyMissionCatalogResult = {
  catalogId: string;
  catalogVersion: string;
  count: number;
  currency: "WFXP";
  noMonetaryValue: true;
  tokenAuthorized: false;
  cashoutAllowed: false;
  missions: DailyMission[];
};

type RawCatalogResponse = {
  accepted?: boolean;
  catalogId?: string;
  catalogVersion?: string;
  count?: number;
  currency?: string;
  noMonetaryValue?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
  missions?: Array<Record<string, unknown>>;
};

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Admin-Login erforderlich.");
  return user;
}

function errorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Admin-Login erforderlich.";
  if (diagnostic.includes("permission-denied")) return "Die Admin-Rolle fehlt oder ist nicht aktuell.";
  if (diagnostic.includes("failed-precondition")) return "Der Tagesmissionskatalog ist unvollständig oder verletzt eine Beta-1-Sicherheitsgrenze.";
  return "Der Tagesmissionskatalog konnte nicht sicher veröffentlicht werden.";
}

function mapMission(value: Record<string, unknown>): DailyMission | null {
  const id = typeof value.missionId === "string" ? value.missionId : "";
  const title = typeof value.title === "string" ? value.title : "";
  const reward = Number(value.rewardXp);
  const difficulty = value.difficulty;
  const description = typeof value.description === "string" ? value.description : "";
  const duration = typeof value.duration === "string" ? value.duration : "";
  const displayType = value.displayType;
  const serverType = value.type;
  if (
    !id
    || !title
    || !Number.isInteger(reward)
    || reward < 1
    || reward > 100
    || (difficulty !== "Leicht" && difficulty !== "Mittel" && difficulty !== "Schwer")
    || !description
    || !duration
    || (displayType !== "Bewegung" && displayType !== "Ernährung" && displayType !== "Workout" && displayType !== "Community" && displayType !== "Abenteuer")
    || (serverType !== "movement" && serverType !== "workout" && serverType !== "learning" && serverType !== "nutrition" && serverType !== "wellness")
    || value.evidenceType !== "daily-user-confirmation"
    || value.reviewRequired !== true
    || value.childAllowed !== false
    || value.status !== "published"
    || value.noMonetaryValue !== true
    || value.tokenAuthorized === true
    || value.cashoutAllowed === true
  ) {
    return null;
  }
  return {
    id,
    title,
    reward,
    difficulty,
    description,
    duration,
    type: displayType,
    serverType,
    evidenceType: "daily-user-confirmation",
    reviewRequired: true,
    childAllowed: false,
  };
}

export async function ensureDailyMissionCatalogForAdmin(): Promise<Beta1DailyMissionCatalogResult> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawCatalogResponse>(
      getFunctions(),
      "adminEnsureDailyMissionCatalog",
    );
    const result = await callable({});
    const data = result.data;
    const missions = Array.isArray(data.missions)
      ? data.missions.map(mapMission).filter((mission): mission is DailyMission => mission !== null)
      : [];
    if (
      !data.accepted
      || data.catalogId !== DAILY_MISSION_CATALOG_ID
      || data.catalogVersion !== DAILY_MISSION_CATALOG_VERSION
      || data.currency !== "WFXP"
      || data.noMonetaryValue !== true
      || data.tokenAuthorized === true
      || data.cashoutAllowed === true
      || data.count !== missions.length
      || missions.length === 0
    ) {
      throw new Error("failed-precondition: invalid daily mission catalog response");
    }
    return {
      catalogId: data.catalogId,
      catalogVersion: data.catalogVersion,
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
