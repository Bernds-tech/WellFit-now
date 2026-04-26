export type MotionPermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error";

export type ActivityType = "unknown" | "still" | "walking" | "running" | "vehicle" | "motorbike";

export type MotionSensorSource = "browser-devicemotion" | "native-health-connect" | "native-healthkit" | "native-core-motion";

export type MotionValidationStatus = "collecting" | "valid" | "weak" | "suspicious" | "native-required";

export type MotionSample = {
  timestamp: number;
  accelerationMagnitude: number;
  rotationMagnitude: number;
};

export type MotionAnalysisState = {
  permissionState: MotionPermissionState;
  activityType: ActivityType;
  steps: number;
  cadence: number;
  accelerationMagnitude: number;
  rotationMagnitude: number;
  confidence: number;
  feedback: string;
  sensorSource: MotionSensorSource;
  validationStatus: MotionValidationStatus;
  validationFeedback: string;
  nativeStepAccessAvailable: boolean;
};
