import type { ArEvidenceSource, ArQuestionAnswerOption, ArQuestionType } from "./arRiddleBaseTypes";

/**
 * Evidence only. This event must never grant points directly.
 * Backend must transform it into reward-policy input and then into a ledger event if allowed.
 */
export type ArQuestionEvidenceEvent = {
  eventId: string;
  eventType: "arQuestionAnswered";
  userId: string;
  buddyId?: string;
  missionId: string;
  arSessionId?: string;
  questionId: string;
  questionFingerprint: string;
  questionType: ArQuestionType;
  objectType?: string;
  recognizedObjectLabel?: string;
  recognizedObjectConfidence?: number;
  locationHash?: string;
  placeContextId?: string;
  questionText: string;
  answerOptions: ArQuestionAnswerOption[];
  selectedAnswerId: string;
  selectedAnswerText: string;
  correctAnswerId?: string;
  isCorrect?: boolean;
  clientTimestamp: string;
  serverReceivedAt?: string;
  source: ArEvidenceSource;
  rewardAuthorized: false;
  missionCompletionAuthorized: false;
  pointsGranted: false;
};
