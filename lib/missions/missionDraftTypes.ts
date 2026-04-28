import type { WellFitMissionCategory } from "./missionCategoryTypes";

export type MissionDraftCreator = "ki-buddy" | "server" | "curator" | "partner";

export type MissionDraftSourceContext =
  | "ar"
  | "location"
  | "daily"
  | "weekly"
  | "sponsor"
  | "competition"
  | "manual";

export type MissionDraftStatus = "draft" | "allowed" | "rejected" | "needsReview";

export type MissionDraftAgeBand = "child" | "teen" | "adult" | "senior" | "family";

export type MissionDraftQuestion = {
  questionId: string;
  prompt: string;
  answerOptionLabels?: string[];
  expectedObjectType?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
};

export type MissionDraftWaypoint = {
  waypointId: string;
  label: string;
  locationHash?: string;
  distanceFromStartMeters?: number;
  safeAccessExpected: boolean;
};

/**
 * KI- or server-generated mission proposal.
 * A draft is not a completed mission and never grants points by itself.
 */
export type MissionDraft = {
  draftId: string;
  createdBy: MissionDraftCreator;
  suggestedCategory: WellFitMissionCategory;
  sourceContext: MissionDraftSourceContext;
  ageBand: MissionDraftAgeBand;
  parentMode?: boolean;
  title: string;
  description: string;
  estimatedDurationMinutes?: number;
  radiusMeters?: number;
  questionDrafts?: MissionDraftQuestion[];
  waypoints?: MissionDraftWaypoint[];
  safetyNotes: string[];
  requiresServerApproval: true;
  rewardPreviewUnavailableUntilEvidence: true;
  status: MissionDraftStatus;
  createdAt: string;
  updatedAt: string;
};
