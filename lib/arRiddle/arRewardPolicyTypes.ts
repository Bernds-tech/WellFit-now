import type { ArQuestionDifficulty, ArQuestionType, ArRepeatPenaltyLevel, ArRiskLevel } from "./arRiddleBaseTypes";

export type ArRewardPolicyInput = {
  userId: string;
  buddyId?: string;
  missionId: string;
  missionType: "arRiddle" | "natureQuiz" | "locationRally" | "objectRecognition";
  questionId: string;
  questionType: ArQuestionType;
  objectType?: string;
  recognizedObjectLabel?: string;
  answerCorrectness: "correct" | "wrong" | "unknown";
  baseDifficulty: ArQuestionDifficulty;
  userLevel?: number;
  buddyLevel?: number;
  questionNoveltyScore: number;
  locationNoveltyScore: number;
  repeatPenaltyLevel: ArRepeatPenaltyLevel;
  dailyUserCapState?: "available" | "near-limit" | "blocked";
  missionTypeCapState?: "available" | "near-limit" | "blocked";
  systemReserveState?: "healthy" | "watch" | "restricted";
  economyHealthScore?: number;
  riskLevel: ArRiskLevel;
  evidenceQuality: "low" | "medium" | "high";
  clientTimestamp: string;
  serverTimestamp: string;
};

/**
 * Preview/result from server-side reward policy only.
 * Client, Unity, camera, and Buddy KI must not create authoritative results.
 */
export type ArRewardPolicyResult = {
  pointsPreview: number;
  xpPreview: number;
  rewardAllowed: boolean;
  manualReviewRequired: boolean;
  capReason?: string;
  riskReason?: string;
  repeatReason?: string;
  ledgerEventDraft?: Record<string, unknown>;
};
