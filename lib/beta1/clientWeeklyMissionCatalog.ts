import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import {
  WEEKLY_MISSION_CATALOG_ID,
  WEEKLY_MISSION_CATALOG_VERSION,
  WEEKLY_MISSION_COMPLETION_POLICY,
  WEEKLY_MISSION_EVIDENCE_TYPE,
  type WeeklyMission,
} from "@/app/missionen/wochenmissionen/missions";

export type Beta1WeeklyMissionCatalogResult = {
  catalogId: typeof WEEKLY_MISSION_CATALOG_ID;
  catalogVersion: typeof WEEKLY_MISSION_CATALOG_VERSION;
  completionPolicy: typeof WEEKLY_MISSION_COMPLETION_POLICY;
  weeklyGoal: number;
  count: number;
  currency: "WFXP";
  noMonetaryValue: true;
  tokenAuthorized: false;
  cashoutAllowed: false;
  missions: WeeklyMission[];
};

type RawCatalogResponse = {
  accepted?: boolean;
  catalogId?: string;
  catalogVersion?: string;
  completionPolicy?: string;
  weeklyGoal?: number;
  count?: number;
  currency?: string;
  noMonetaryValue?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
  missions?: Array<Record<string, unknown>>;
};

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
  if (diagnostic.includes("failed-precondition")) return "Der Wochenmissionskatalog ist unvollständig oder verletzt eine Beta-1-Sicherheitsgrenze.";
  return "Der Wochenmissionskatalog konnte nicht sicher veröffentlicht werden.";
}

function mapMission(value: Record<string, unknown>): WeeklyMission | null {
  const id = typeof value.missionId === "string" ? value.missionId : "";
  const title = typeof value.title === "string" ? value.title : "";
  const reward = Number(value.rewardXp);
  const difficulty = value.difficulty;
  const description = typeof value.description === "string" ? value.description : "";
  const duration = value.duration;
  const displayType = value.displayType;
  const serverType = value.type;
  const targetValue = Number(value.targetValue);
  const targetUnit = value.targetUnit;
  if (
    !id
    || !title
    || !Number.isInteger(reward)
    || reward < 1
    || reward > 100
    || difficulty !== "Mittel"
    || !description
    || duration !== "1 Woche"
    || (displayType !== "Bewegung" && displayType !== "Workout" && displayType !== "Abenteuer")
    || (serverType !== "movement" && serverType !== "workout" && serverType !== "learning")
    || !Number.isFinite(targetValue)
    || targetValue <= 0
    || (targetUnit !== "steps" && targetUnit !== "workouts" && targetUnit !== "learning-modules")
    || value.evidenceType !== WEEKLY_MISSION_EVIDENCE_TYPE
    || value.reviewRequired !== true
    || value.childAllowed !== false
    || value.completionPolicy !== WEEKLY_MISSION_COMPLETION_POLICY
    || value.status !== "published"
    || value.noMonetaryValue !== true
    || value.tokenAuthorized === true
    || value.cashoutAllowed === true
  ) {
    return null;
  }

  const icon = id === "weekly-steps-50000" ? "👣" : id === "weekly-workouts-3" ? "💪" : "🧠";
  return {
    id,
    title,
    reward,
    rewardLabel: `+${reward} WFXP nach Freigabe`,
    icon,
    difficulty,
    description,
    duration,
    type: displayType,
    serverType,
    targetValue,
    targetUnit,
    evidenceType: WEEKLY_MISSION_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  };
}

export async function ensureWeeklyMissionCatalogForAdmin(): Promise<Beta1WeeklyMissionCatalogResult> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawCatalogResponse>(
      getFunctions(),
      "adminEnsureWeeklyMissionCatalog",
    );
    const result = await callable({});
    const data = result.data;
    const missions = Array.isArray(data.missions)
      ? data.missions.map(mapMission).filter((mission): mission is WeeklyMission => mission !== null)
      : [];
    if (
      !data.accepted
      || data.catalogId !== WEEKLY_MISSION_CATALOG_ID
      || data.catalogVersion !== WEEKLY_MISSION_CATALOG_VERSION
      || data.completionPolicy !== WEEKLY_MISSION_COMPLETION_POLICY
      || data.weeklyGoal !== 3
      || data.currency !== "WFXP"
      || data.noMonetaryValue !== true
      || data.tokenAuthorized === true
      || data.cashoutAllowed === true
      || data.count !== missions.length
      || missions.length !== 3
    ) {
      throw new Error("failed-precondition: invalid weekly mission catalog response");
    }
    return {
      catalogId: WEEKLY_MISSION_CATALOG_ID,
      catalogVersion: WEEKLY_MISSION_CATALOG_VERSION,
      completionPolicy: WEEKLY_MISSION_COMPLETION_POLICY,
      weeklyGoal: 3,
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
