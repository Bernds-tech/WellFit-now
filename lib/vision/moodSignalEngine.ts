import type { MoodSignal } from "./visionTypes";

type MoodSignalInput = {
  faceDetected?: boolean;
  smileScore?: number;
  eyeOpennessScore?: number;
  headStabilityScore?: number;
  exerciseQualityScore?: number;
};

export function estimateMoodSignal(input: MoodSignalInput): MoodSignal {
  const smile = input.smileScore ?? 0;
  const eyes = input.eyeOpennessScore ?? 50;
  const head = input.headStabilityScore ?? 55;
  const quality = input.exerciseQualityScore ?? 50;

  if (input.faceDetected === false) return "unknown";
  if (eyes < 25) return "tired";
  if (head < 30) return "uneasy";
  if (quality >= 75 && smile >= 55) return "motivated";
  if (quality >= 65) return "focused";
  if (quality < 35) return "strained";
  return "calm";
}

export function getMoodSignalLabel(signal: MoodSignal) {
  const labels: Record<MoodSignal, string> = {
    unknown: "nicht bewertet",
    focused: "konzentriert",
    motivated: "motiviert",
    strained: "angestrengt",
    uneasy: "unruhig",
    tired: "müde",
    calm: "ruhig",
  };

  return labels[signal];
}
