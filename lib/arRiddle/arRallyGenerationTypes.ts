import type { ArQuestionDifficulty, ArQuestionType, ArRiskLevel } from "./arRiddleBaseTypes";

export type ArRallyAgeBand = "child" | "teen" | "adult" | "senior" | "family";

export type ArRallyMobilityMode = "walk" | "wheelchair" | "bike" | "indoor" | "museum" | "school";

export type ArRallyWaypointKind =
  | "nature"
  | "park"
  | "playground"
  | "museum"
  | "school"
  | "city"
  | "history"
  | "zoo"
  | "generic";

export type ArRallyGenerationInput = {
  userId: string;
  buddyId?: string;
  ageBand: ArRallyAgeBand;
  parentMode?: boolean;
  currentLocationHash?: string;
  allowedRadiusMeters: number;
  missionDurationTargetMinutes: number;
  mobilityMode: ArRallyMobilityMode;
  interestTags?: string[];
  placeContextTags?: string[];
  questionHistorySummary?: string;
  riskLevel: ArRiskLevel;
};

export type ArRallyWaypointDraft = {
  waypointId: string;
  kind: ArRallyWaypointKind;
  label: string;
  locationHash?: string;
  distanceFromStartMeters?: number;
  publicOrSafeAccessExpected: boolean;
  accessibilityHint?: string;
};

export type ArRallyQuestionDraft = {
  questionId: string;
  waypointId?: string;
  questionType: ArQuestionType;
  difficulty: ArQuestionDifficulty;
  prompt: string;
  answerOptionLabels: string[];
  expectedObjectType?: string;
  requiresObjectRecognition?: boolean;
};

export type ArRallyGenerationDraft = {
  rallyDraftId: string;
  missionType: "arRiddle" | "natureQuiz" | "locationRally" | "objectRecognition";
  estimatedDurationMinutes: number;
  radiusMeters: number;
  waypoints: ArRallyWaypointDraft[];
  questionDrafts: ArRallyQuestionDraft[];
  safetyNotes: string[];
  requiresServerApproval: true;
  rewardPreviewUnavailableUntilEvidence: true;
};
