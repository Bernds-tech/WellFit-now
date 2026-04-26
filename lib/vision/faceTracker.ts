import type { MoodSignal } from "./visionTypes";

type BlendshapeCategory = {
  categoryName: string;
  score: number;
};

type FaceLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number
  ) => {
    faceLandmarks?: unknown[];
    faceBlendshapes?: Array<{ categories?: BlendshapeCategory[] }>;
  };
  close?: () => void;
};

type FaceLandmarkerConstructor = {
  createFromOptions: (
    vision: unknown,
    options: {
      baseOptions: {
        modelAssetPath: string;
        delegate?: "GPU" | "CPU";
      };
      runningMode: "VIDEO";
      numFaces: number;
      outputFaceBlendshapes: boolean;
      minFaceDetectionConfidence: number;
      minFacePresenceConfidence: number;
      minTrackingConfidence: number;
    }
  ) => Promise<FaceLandmarkerInstance>;
};

type FilesetResolverConstructor = {
  forVisionTasks: (wasmPath: string) => Promise<unknown>;
};

export type FaceSignalResult = {
  faceDetected: boolean;
  smileScore: number;
  eyeOpennessScore: number;
  headStabilityScore: number;
  moodSignal: MoodSignal;
};

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const FACE_MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

const findScore = (categories: BlendshapeCategory[] | undefined, names: string[]) => {
  if (!categories?.length) return 0;
  return Math.max(
    ...names.map((name) => categories.find((category) => category.categoryName === name)?.score ?? 0)
  );
};

function estimateMoodFromBlendshapes(categories: BlendshapeCategory[] | undefined): FaceSignalResult {
  if (!categories?.length) {
    return {
      faceDetected: false,
      smileScore: 0,
      eyeOpennessScore: 50,
      headStabilityScore: 50,
      moodSignal: "unknown",
    };
  }

  const smileScore = Math.round(findScore(categories, ["mouthSmileLeft", "mouthSmileRight"]) * 100);
  const blinkScore = Math.round(findScore(categories, ["eyeBlinkLeft", "eyeBlinkRight"]) * 100);
  const browScore = Math.round(findScore(categories, ["browDownLeft", "browDownRight", "browInnerUp"]) * 100);
  const jawOpenScore = Math.round(findScore(categories, ["jawOpen"]) * 100);
  const eyeOpennessScore = Math.max(0, 100 - blinkScore);
  const headStabilityScore = Math.max(0, 100 - Math.min(100, browScore + jawOpenScore));

  let moodSignal: MoodSignal = "calm";
  if (eyeOpennessScore < 28) moodSignal = "tired";
  else if (browScore > 55 || jawOpenScore > 45) moodSignal = "strained";
  else if (smileScore > 50) moodSignal = "motivated";
  else if (headStabilityScore > 65) moodSignal = "focused";

  return {
    faceDetected: true,
    smileScore,
    eyeOpennessScore,
    headStabilityScore,
    moodSignal,
  };
}

export async function createFaceTracker() {
  if (typeof window === "undefined") {
    throw new Error("Face Tracking ist nur im Browser verfügbar.");
  }

  const tasksVision = await import("@mediapipe/tasks-vision");
  const FilesetResolver = tasksVision.FilesetResolver as FilesetResolverConstructor;
  const FaceLandmarker = tasksVision.FaceLandmarker as FaceLandmarkerConstructor;
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: FACE_MODEL_PATH,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    minFaceDetectionConfidence: 0.55,
    minFacePresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });

  return {
    detect(video: HTMLVideoElement): FaceSignalResult {
      const result = faceLandmarker.detectForVideo(video, performance.now());
      const categories = result.faceBlendshapes?.[0]?.categories;
      return estimateMoodFromBlendshapes(categories);
    },
    close() {
      faceLandmarker.close?.();
    },
  };
}
