export type ArQuestionType =
  | "objectRecognition"
  | "natureQuiz"
  | "locationRiddle"
  | "historyQuestion"
  | "museumQuest"
  | "familyRally"
  | "schoolQuiz"
  | "nutritionQuestion"
  | "movementProof";

export type ArQuestionDifficulty = "easy" | "medium" | "hard" | "expert";

export type ArRepeatPenaltyLevel = "none" | "low" | "medium" | "high" | "blocked";

export type ArRiskLevel = "low" | "medium" | "high" | "manualReview";

export type ArEvidenceSource = "mobile-ar" | "unity-ar" | "web-fallback";

export type ArQuestionAnswerOption = {
  id: string;
  label: string;
};
