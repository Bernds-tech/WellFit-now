import type { WellFitMissionCategory } from "./missionCategoryTypes";
import type { MissionUiStatus } from "./missionUiStatusTypes";

export type MissionFavoriteStatus =
  | "savedPlaceholder"
  | "kiDraftSaved"
  | "approvedMissionSaved"
  | "rejectedUnavailable";

export type MissionHistoryEventStatus =
  | "evidenceSubmitted"
  | "rewardPreviewed"
  | "rewardGranted"
  | "noRewardRepeatBlocked"
  | "manualReview"
  | "serverCompleted"
  | "serverRejected";

export type MissionListEntryKind = "mainMission" | "kiDraft" | "arSideQuest" | "auditEvent";

export type MissionFavoriteListEntry = {
  id: string;
  kind: MissionListEntryKind;
  category?: WellFitMissionCategory;
  title: string;
  description: string;
  favoriteStatus: MissionFavoriteStatus;
  uiStatus: MissionUiStatus;
  canAuthorizeReward: false;
};

export type MissionHistoryListEntry = {
  id: string;
  kind: MissionListEntryKind;
  category?: WellFitMissionCategory;
  title: string;
  description: string;
  eventStatus: MissionHistoryEventStatus;
  uiStatus: MissionUiStatus;
  createdAt: string;
  canAuthorizeReward: false;
};

export const missionFavoriteStatusLabels: Record<MissionFavoriteStatus, string> = {
  savedPlaceholder: "Platzhalter gemerkt",
  kiDraftSaved: "KI-Vorschlag gemerkt",
  approvedMissionSaved: "Freigegebene Mission gemerkt",
  rejectedUnavailable: "Nicht verfuegbar",
};

export const missionHistoryEventStatusLabels: Record<MissionHistoryEventStatus, string> = {
  evidenceSubmitted: "Evidence eingereicht",
  rewardPreviewed: "Reward geprueft",
  rewardGranted: "Reward serverseitig gebucht",
  noRewardRepeatBlocked: "Wiederholung blockiert",
  manualReview: "Manuelle Pruefung",
  serverCompleted: "Serverseitig abgeschlossen",
  serverRejected: "Serverseitig abgelehnt",
};
