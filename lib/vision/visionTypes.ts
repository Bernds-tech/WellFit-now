export type CameraPermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error";

export type ExerciseType = "squat" | "pushup" | "jumpingJack" | "plank";

export type MoodSignal = "unknown" | "focused" | "motivated" | "strained" | "uneasy" | "tired" | "calm";

export type ExercisePhase = "unknown" | "standing" | "descending" | "bottom" | "ascending";

export type VisionPoint = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type PoseLandmarkName =
  | "nose"
  | "leftShoulder"
  | "rightShoulder"
  | "leftElbow"
  | "rightElbow"
  | "leftWrist"
  | "rightWrist"
  | "leftHip"
  | "rightHip"
  | "leftKnee"
  | "rightKnee"
  | "leftAnkle"
  | "rightAnkle";

export type PoseLandmarks = Partial<Record<PoseLandmarkName, VisionPoint>>;

export type PoseAnalysisResult = {
  landmarks: PoseLandmarks;
  detected: boolean;
  confidence: number;
  hipKneeAnkleAngle: number | null;
  torsoLeanScore: number;
  stabilityScore: number;
};

export type ExerciseCounterState = {
  exercise: ExerciseType;
  validReps: number;
  invalidReps: number;
  confidence: number;
  qualityScore: number;
  moodSignal: MoodSignal;
  phase: ExercisePhase;
  feedback: string;
  isTracking: boolean;
  repCandidateValid: boolean;
};

export type ExerciseEvaluation = ExerciseCounterState & {
  detected: boolean;
  lastRepValid?: boolean;
};

export type VisionCapability = {
  title: string;
  status: "ready" | "planned" | "blocked";
  description: string;
};
