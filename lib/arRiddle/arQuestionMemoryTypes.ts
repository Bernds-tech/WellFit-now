import type { ArQuestionDifficulty, ArQuestionType, ArRepeatPenaltyLevel, ArRiskLevel } from "./arRiddleBaseTypes";

/**
 * Remembers which questions and object/location combinations were already used.
 * It feeds novelty, repeat, cooldown, and farming signals into reward policy.
 * It does not decide points.
 */
export type ArQuestionMemory = {
  memoryId: string;
  userId: string;
  buddyId?: string;
  questionId: string;
  questionFingerprint: string;
  questionType: ArQuestionType;
  objectType?: string;
  objectFingerprint?: string;
  recognizedObjectLabel?: string;
  locationHash?: string;
  placeContextId?: string;
  missionId?: string;
  timesAsked: number;
  timesAnsweredCorrectly: number;
  timesAnsweredWrong: number;
  firstAskedAt: string;
  lastAskedAt: string;
  lastCorrectAt?: string;
  lastWrongAt?: string;
  difficultyLevel: ArQuestionDifficulty;
  nextAllowedAt?: string;
  repeatPenaltyLevel: ArRepeatPenaltyLevel;
  noveltyScore: number;
  riskLevel: ArRiskLevel;
  createdAt: string;
  updatedAt: string;
};
