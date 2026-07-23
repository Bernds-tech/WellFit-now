import dailyMissionCatalog from "@/functions/config/beta1-daily-missions.json";

export type DailyMissionType = "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";
export type DailyMissionServerType = "movement" | "workout" | "learning" | "nutrition" | "wellness";

export type DailyMission = {
  id: string;
  title: string;
  reward: number;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  description: string;
  duration: string;
  type: DailyMissionType;
  serverType: DailyMissionServerType;
  evidenceType: "daily-user-confirmation";
  reviewRequired: true;
  childAllowed: false;
};

const DISPLAY_TYPES: DailyMissionType[] = ["Bewegung", "Ernährung", "Workout", "Community", "Abenteuer"];
const SERVER_TYPES: DailyMissionServerType[] = ["movement", "workout", "learning", "nutrition", "wellness"];
const DIFFICULTIES: DailyMission["difficulty"][] = ["Leicht", "Mittel", "Schwer"];

function isDisplayType(value: string): value is DailyMissionType {
  return DISPLAY_TYPES.includes(value as DailyMissionType);
}

function isServerType(value: string): value is DailyMissionServerType {
  return SERVER_TYPES.includes(value as DailyMissionServerType);
}

function isDifficulty(value: string): value is DailyMission["difficulty"] {
  return DIFFICULTIES.includes(value as DailyMission["difficulty"]);
}

export const DAILY_MISSION_CATALOG_ID = dailyMissionCatalog.catalogId;
export const DAILY_MISSION_CATALOG_VERSION = dailyMissionCatalog.version;

export const dailyMissions: DailyMission[] = dailyMissionCatalog.missions.map((mission) => {
  if (!isDisplayType(mission.displayType)) throw new Error(`Invalid daily mission display type: ${mission.missionId}`);
  if (!isServerType(mission.type)) throw new Error(`Invalid daily mission server type: ${mission.missionId}`);
  if (!isDifficulty(mission.difficulty)) throw new Error(`Invalid daily mission difficulty: ${mission.missionId}`);
  if (
    mission.evidenceType !== "daily-user-confirmation"
    || mission.reviewRequired !== true
    || mission.childAllowed !== false
  ) {
    throw new Error(`Unsafe daily mission catalog boundary: ${mission.missionId}`);
  }

  return {
    id: mission.missionId,
    title: mission.title,
    reward: mission.rewardXp,
    difficulty: mission.difficulty,
    description: mission.description,
    duration: mission.duration,
    type: mission.displayType,
    serverType: mission.type,
    evidenceType: "daily-user-confirmation",
    reviewRequired: true,
    childAllowed: false,
  };
});

export function missionIcon(type: DailyMissionType) {
  return type === "Bewegung" ? "🏃" : type === "Ernährung" ? "🥗" : type === "Workout" ? "💪" : type === "Community" ? "🧘" : "🧠";
}
