import type { PoseLandmarks, PoseLandmarkName, VisionPoint } from "@/lib/vision/visionTypes";

type SkeletonOverlayProps = {
  landmarks: PoseLandmarks;
};

const bones: Array<[PoseLandmarkName, PoseLandmarkName]> = [
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
];

function isVisible(point?: VisionPoint) {
  return Boolean(point && (point.visibility ?? 1) > 0.45);
}

export default function SkeletonOverlay({ landmarks }: SkeletonOverlayProps) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
      {bones.map(([from, to]) => {
        const a = landmarks[from];
        const b = landmarks[to];
        if (!isVisible(a) || !isVisible(b)) return null;

        return (
          <line
            key={`${from}-${to}`}
            x1={a!.x}
            y1={a!.y}
            x2={b!.x}
            y2={b!.y}
            stroke="rgba(103,232,249,0.85)"
            strokeWidth="0.008"
            strokeLinecap="round"
          />
        );
      })}

      {Object.entries(landmarks).map(([name, point]) => {
        if (!isVisible(point)) return null;
        return <circle key={name} cx={point.x} cy={point.y} r="0.012" fill="rgba(251,146,60,0.95)" />;
      })}
    </svg>
  );
}
