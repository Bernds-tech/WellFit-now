export type CameraPermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error";

export type ExerciseType = "squat" | "pushup" | "jumpingJack" | "plank";

export type ExerciseCounterState = {
  exercise: ExerciseType;
  validReps: number;
  invalidReps: number;
  confidence: number;
  feedback: string;
  isTracking: boolean;
};

export type VisionCapability = {
  title: string;
  status: "ready" | "planned" | "blocked";
  description: string;
};
