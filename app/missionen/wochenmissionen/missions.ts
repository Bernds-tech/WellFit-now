import weeklyMissionCatalog from "@/functions/config/beta1-weekly-missions.json";

export const WEEKLY_MISSION_CATALOG_ID = weeklyMissionCatalog.catalogId;
export const WEEKLY_MISSION_CATALOG_VERSION = weeklyMissionCatalog.version;
export const WEEKLY_MISSION_COMPLETION_POLICY = "once-per-mission-per-user-local-week" as const;
export const WEEKLY_MISSION_EVIDENCE_TYPE = "weekly-user-confirmation" as const;

export type WeeklyMissionType = "Bewegung" | "Workout" | "Abenteuer";
export type WeeklyMissionServerType = "movement" | "workout" | "learning";
export type WeeklyMissionTargetUnit = "steps" | "workouts" | "learning-modules";

export type WeeklyMission = {
  id: string;
  title: string;
  description: string;
  reward: number;
  rewardLabel: string;
  icon: string;
  difficulty: "Mittel";
  duration: "1 Woche";
  type: WeeklyMissionType;
  serverType: WeeklyMissionServerType;
  targetValue: number;
  targetUnit: WeeklyMissionTargetUnit;
  evidenceType: typeof WEEKLY_MISSION_EVIDENCE_TYPE;
  reviewRequired: true;
  childAllowed: false;
};

function missionIcon(serverType: WeeklyMissionServerType) {
  return serverType === "movement" ? "👣" : serverType === "workout" ? "💪" : "🧠";
}

function asMissionType(value: string): WeeklyMissionType {
  if (value === "Bewegung" || value === "Workout" || value === "Abenteuer") return value;
  throw new Error(`Invalid weekly mission display type: ${value}`);
}

function asServerType(value: string): WeeklyMissionServerType {
  if (value === "movement" || value === "workout" || value === "learning") return value;
  throw new Error(`Invalid weekly mission server type: ${value}`);
}

function asTargetUnit(value: string): WeeklyMissionTargetUnit {
  if (value === "steps" || value === "workouts" || value === "learning-modules") return value;
  throw new Error(`Invalid weekly mission target unit: ${value}`);
}

if (weeklyMissionCatalog.completionPolicy !== WEEKLY_MISSION_COMPLETION_POLICY) {
  throw new Error("Unsafe weekly mission completion policy.");
}

export const weeklyMissions: WeeklyMission[] = weeklyMissionCatalog.missions.map((mission) => {
  if (
    mission.evidenceType !== WEEKLY_MISSION_EVIDENCE_TYPE
    || mission.reviewRequired !== true
    || mission.childAllowed !== false
    || mission.difficulty !== "Mittel"
    || mission.duration !== "1 Woche"
  ) {
    throw new Error(`Unsafe weekly mission catalog boundary: ${mission.missionId}`);
  }
  const serverType = asServerType(mission.type);
  return {
    id: mission.missionId,
    title: mission.title,
    description: mission.description,
    reward: mission.rewardXp,
    rewardLabel: `+${mission.rewardXp} WFXP nach Freigabe`,
    icon: missionIcon(serverType),
    difficulty: "Mittel",
    duration: "1 Woche",
    type: asMissionType(mission.displayType),
    serverType,
    targetValue: mission.targetValue,
    targetUnit: asTargetUnit(mission.targetUnit),
    evidenceType: WEEKLY_MISSION_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  };
});