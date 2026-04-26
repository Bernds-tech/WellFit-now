import type { ExercisePhase, PoseAnalysisResult, PoseLandmarks, VisionPoint } from "./visionTypes";

const toDegrees = (radians: number) => radians * (180 / Math.PI);

function angleBetween(a: VisionPoint, b: VisionPoint, c: VisionPoint) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const abLength = Math.hypot(ab.x, ab.y);
  const cbLength = Math.hypot(cb.x, cb.y);

  if (!abLength || !cbLength) return null;

  const cosine = Math.min(Math.max(dot / (abLength * cbLength), -1), 1);
  return Math.round(toDegrees(Math.acos(cosine)));
}

function averageVisible(points: Array<VisionPoint | undefined>) {
  const visible = points.filter((point): point is VisionPoint => Boolean(point && (point.visibility ?? 1) > 0.45));
  if (!visible.length) return null;

  return {
    x: visible.reduce((sum, point) => sum + point.x, 0) / visible.length,
    y: visible.reduce((sum, point) => sum + point.y, 0) / visible.length,
    z: visible.reduce((sum, point) => sum + (point.z ?? 0), 0) / visible.length,
    visibility: visible.reduce((sum, point) => sum + (point.visibility ?? 1), 0) / visible.length,
  };
}

export function analyzeSquatPose(landmarks: PoseLandmarks): PoseAnalysisResult {
  const hip = averageVisible([landmarks.leftHip, landmarks.rightHip]);
  const knee = averageVisible([landmarks.leftKnee, landmarks.rightKnee]);
  const ankle = averageVisible([landmarks.leftAnkle, landmarks.rightAnkle]);
  const shoulder = averageVisible([landmarks.leftShoulder, landmarks.rightShoulder]);

  const requiredPoints = [hip, knee, ankle, shoulder].filter(Boolean).length;
  const detected = requiredPoints >= 3;
  const confidence = Math.round((requiredPoints / 4) * 100);
  const hipKneeAnkleAngle = hip && knee && ankle ? angleBetween(hip, knee, ankle) : null;

  const torsoLeanScore = hip && shoulder ? Math.max(0, 100 - Math.round(Math.abs(shoulder.x - hip.x) * 240)) : 0;
  const kneeBalanceScore = landmarks.leftKnee && landmarks.rightKnee
    ? Math.max(0, 100 - Math.round(Math.abs(landmarks.leftKnee.y - landmarks.rightKnee.y) * 350))
    : confidence;
  const ankleBalanceScore = landmarks.leftAnkle && landmarks.rightAnkle
    ? Math.max(0, 100 - Math.round(Math.abs(landmarks.leftAnkle.y - landmarks.rightAnkle.y) * 350))
    : confidence;

  return {
    landmarks,
    detected,
    confidence,
    hipKneeAnkleAngle,
    torsoLeanScore,
    stabilityScore: Math.round((kneeBalanceScore + ankleBalanceScore + torsoLeanScore) / 3),
  };
}

export function getSquatPhase(previousPhase: ExercisePhase, analysis: PoseAnalysisResult): ExercisePhase {
  const angle = analysis.hipKneeAnkleAngle;
  if (!analysis.detected || angle === null) return "unknown";

  if (angle >= 158) return "standing";
  if (angle <= 105) return "bottom";
  if (previousPhase === "standing" || previousPhase === "descending") return "descending";
  if (previousPhase === "bottom" || previousPhase === "ascending") return "ascending";
  return "unknown";
}

export function getSquatQualityScore(analysis: PoseAnalysisResult) {
  if (!analysis.detected || analysis.hipKneeAnkleAngle === null) return 0;

  const depthScore = analysis.hipKneeAnkleAngle <= 115 ? 100 : Math.max(0, 100 - (analysis.hipKneeAnkleAngle - 115) * 3);
  return Math.round((depthScore * 0.45) + (analysis.torsoLeanScore * 0.3) + (analysis.stabilityScore * 0.25));
}

export function isValidSquatRep(analysis: PoseAnalysisResult) {
  return analysis.detected
    && analysis.hipKneeAnkleAngle !== null
    && analysis.hipKneeAnkleAngle <= 115
    && analysis.torsoLeanScore >= 55
    && analysis.stabilityScore >= 50;
}
