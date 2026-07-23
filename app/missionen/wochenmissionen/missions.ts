export const WEEKLY_MISSION_CATALOG_ID = "wellfit-beta1-weekly-missions";
export const WEEKLY_MISSION_CATALOG_VERSION = "1.0.0";
export const WEEKLY_MISSION_COMPLETION_POLICY = "once-per-mission-per-vienna-week" as const;
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

export const weeklyMissions: WeeklyMission[] = [
  {
    id: "weekly-steps-50000",
    title: "Wöchentliche Bewegungsmission",
    description: "Sammle innerhalb der aktuellen Wien-Woche insgesamt 50.000 Schritte.",
    reward: 25,
    rewardLabel: "+25 WFXP nach Freigabe",
    icon: "👣",
    difficulty: "Mittel",
    duration: "1 Woche",
    type: "Bewegung",
    serverType: "movement",
    targetValue: 50000,
    targetUnit: "steps",
    evidenceType: WEEKLY_MISSION_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: "weekly-workouts-3",
    title: "Wöchentliche Fitnessmission",
    description: "Absolviere in der aktuellen Wien-Woche drei kontrollierte Ganzkörper-Trainings.",
    reward: 15,
    rewardLabel: "+15 WFXP nach Freigabe",
    icon: "💪",
    difficulty: "Mittel",
    duration: "1 Woche",
    type: "Workout",
    serverType: "workout",
    targetValue: 3,
    targetUnit: "workouts",
    evidenceType: WEEKLY_MISSION_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: "weekly-learning-5",
    title: "Wöchentliche Wissensmission",
    description: "Schließe in der aktuellen Wien-Woche fünf Lernmodule oder Wissensaufgaben ab.",
    reward: 25,
    rewardLabel: "+25 WFXP nach Freigabe",
    icon: "🧠",
    difficulty: "Mittel",
    duration: "1 Woche",
    type: "Abenteuer",
    serverType: "learning",
    targetValue: 5,
    targetUnit: "learning-modules",
    evidenceType: WEEKLY_MISSION_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
];
