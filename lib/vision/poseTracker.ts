import type { PoseLandmarks, VisionPoint } from "./visionTypes";

type MediaPipeLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type PoseLandmarkerInstance = {
  detectForVideo: (video: HTMLVideoElement, timestampMs: number) => { landmarks?: MediaPipeLandmark[][] };
  close?: () => void;
};

type PoseLandmarkerConstructor = {
  createFromOptions: (
    vision: unknown,
    options: {
      baseOptions: {
        modelAssetPath: string;
        delegate?: "GPU" | "CPU";
      };
      runningMode: "VIDEO";
      numPoses: number;
      minPoseDetectionConfidence: number;
      minPosePresenceConfidence: number;
      minTrackingConfidence: number;
    }
  ) => Promise<PoseLandmarkerInstance>;
};

type FilesetResolverConstructor = {
  forVisionTasks: (wasmPath: string) => Promise<unknown>;
};

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const POSE_MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

const toPoint = (landmark?: MediaPipeLandmark): VisionPoint | undefined => {
  if (!landmark) return undefined;
  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: landmark.visibility,
  };
};

export function mapMediaPipePoseLandmarks(landmarks: MediaPipeLandmark[] | undefined): PoseLandmarks {
  if (!landmarks?.length) return {};

  return {
    nose: toPoint(landmarks[0]),
    leftShoulder: toPoint(landmarks[11]),
    rightShoulder: toPoint(landmarks[12]),
    leftElbow: toPoint(landmarks[13]),
    rightElbow: toPoint(landmarks[14]),
    leftWrist: toPoint(landmarks[15]),
    rightWrist: toPoint(landmarks[16]),
    leftHip: toPoint(landmarks[23]),
    rightHip: toPoint(landmarks[24]),
    leftKnee: toPoint(landmarks[25]),
    rightKnee: toPoint(landmarks[26]),
    leftAnkle: toPoint(landmarks[27]),
    rightAnkle: toPoint(landmarks[28]),
  };
}

export async function createPoseTracker() {
  if (typeof window === "undefined") {
    throw new Error("Pose Tracking ist nur im Browser verfügbar.");
  }

  const tasksVision = await import("@mediapipe/tasks-vision");
  const FilesetResolver = tasksVision.FilesetResolver as FilesetResolverConstructor;
  const PoseLandmarker = tasksVision.PoseLandmarker as PoseLandmarkerConstructor;
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: POSE_MODEL_PATH,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.55,
    minPosePresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });

  return {
    detect(video: HTMLVideoElement) {
      const result = poseLandmarker.detectForVideo(video, performance.now());
      return mapMediaPipePoseLandmarks(result.landmarks?.[0]);
    },
    close() {
      poseLandmarker.close?.();
    },
  };
}
