export type WellFitMissionCategory =
  | "daily"
  | "weekly"
  | "adventure"
  | "challenge"
  | "competition"
  | "arSideQuest";

export type WellFitMissionRouteKey =
  | "tagesmissionen"
  | "wochenmissionen"
  | "abenteuer"
  | "challenge"
  | "wettkaempfe"
  | "favoriten"
  | "history";

export type MissionCategoryDefinition = {
  category: WellFitMissionCategory;
  label: string;
  routeKey?: WellFitMissionRouteKey;
  pageExists: boolean;
  currentContentStatus: "placeholder" | "seeded" | "ki-generated" | "production";
  countsAsMainMission: boolean;
  countsAgainstDailySelectionLimit: boolean;
  generatedByKiBuddyMissionEngine: boolean;
  requiresServerRewardPolicy: true;
};

export const missionCategoryDefinitions: MissionCategoryDefinition[] = [
  {
    category: "daily",
    label: "Tagesmission",
    routeKey: "tagesmissionen",
    pageExists: true,
    currentContentStatus: "placeholder",
    countsAsMainMission: true,
    countsAgainstDailySelectionLimit: true,
    generatedByKiBuddyMissionEngine: true,
    requiresServerRewardPolicy: true,
  },
  {
    category: "weekly",
    label: "Wochenmission",
    routeKey: "wochenmissionen",
    pageExists: true,
    currentContentStatus: "placeholder",
    countsAsMainMission: true,
    countsAgainstDailySelectionLimit: false,
    generatedByKiBuddyMissionEngine: true,
    requiresServerRewardPolicy: true,
  },
  {
    category: "adventure",
    label: "Abenteuer",
    routeKey: "abenteuer",
    pageExists: true,
    currentContentStatus: "placeholder",
    countsAsMainMission: true,
    countsAgainstDailySelectionLimit: false,
    generatedByKiBuddyMissionEngine: true,
    requiresServerRewardPolicy: true,
  },
  {
    category: "challenge",
    label: "Challenge",
    routeKey: "challenge",
    pageExists: true,
    currentContentStatus: "placeholder",
    countsAsMainMission: true,
    countsAgainstDailySelectionLimit: false,
    generatedByKiBuddyMissionEngine: true,
    requiresServerRewardPolicy: true,
  },
  {
    category: "competition",
    label: "Wettkampf",
    routeKey: "wettkaempfe",
    pageExists: true,
    currentContentStatus: "placeholder",
    countsAsMainMission: true,
    countsAgainstDailySelectionLimit: false,
    generatedByKiBuddyMissionEngine: true,
    requiresServerRewardPolicy: true,
  },
  {
    category: "arSideQuest",
    label: "AR-Buddy-Nebenmission",
    pageExists: false,
    currentContentStatus: "ki-generated",
    countsAsMainMission: false,
    countsAgainstDailySelectionLimit: false,
    generatedByKiBuddyMissionEngine: true,
    requiresServerRewardPolicy: true,
  },
];
