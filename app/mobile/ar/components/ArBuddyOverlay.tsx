import ArDragonScene, { type ArScreenAnchor } from "./ArDragonScene";
import ArBuddySpeechBubble from "./ArBuddySpeechBubble";
import ArPlacementHint from "./ArPlacementHint";

export type ArBuddyMood = "idle" | "called" | "happy" | "listening" | "curious" | "playful" | "returning";
export type ArBuddyPosition = "nearLeft" | "center" | "farRight" | "nearRight" | "farLeft";

type ArBuddyOverlayProps = {
  isCameraActive: boolean;
  mood: ArBuddyMood;
  position: ArBuddyPosition;
  actionCount: number;
  anchor: ArScreenAnchor | null;
  autoWalkEnabled: boolean;
  anchorMode: boolean;
  onBuddyTap: () => void;
  onSceneTap: (anchor: ArScreenAnchor) => void;
};

const bubblePositionClass: Record<ArBuddyPosition, string> = {
  nearLeft: "bottom-[47%] left-[5%]",
  center: "bottom-[56%] left-1/2 -translate-x-1/2",
  farRight: "bottom-[63%] right-[5%]",
  nearRight: "bottom-[48%] right-[7%]",
  farLeft: "bottom-[62%] left-[8%]",
};

const moodMessage: Record<ArBuddyMood, string> = {
  idle: "Setze einen Anker oder rufe mich zu dir.",
  called: "Ich bin da. Halte das Handy ruhig.",
  happy: "Gut gemacht! Ich bin bei dir.",
  listening: "Ich höre zu. Was machen wir als Nächstes?",
  curious: "Interessant! Ich sehe mich hier um.",
  playful: "Ich laufe um meinen gesetzten Punkt.",
  returning: "Ich komme zurück zu dir.",
};

export default function ArBuddyOverlay({
  isCameraActive,
  mood,
  position,
  actionCount,
  anchor,
  autoWalkEnabled,
  anchorMode,
  onBuddyTap,
  onSceneTap,
}: ArBuddyOverlayProps) {
  return (
    <div className="absolute inset-0 z-20">
      <ArPlacementHint isCameraActive={isCameraActive} mood={mood} />
      {anchorMode && (
        <div className="pointer-events-none absolute inset-x-6 top-[42%] z-40 rounded-[24px] border border-green-200/35 bg-[#042f35]/76 p-3 text-center text-xs font-black text-green-100 backdrop-blur-md">
          Tippe auf den Boden oder eine freie Stelle im Kamerabild.
        </div>
      )}
      <ArDragonScene
        isCameraActive={isCameraActive}
        mood={mood}
        position={position}
        actionCount={actionCount}
        anchor={anchor}
        autoWalkEnabled={autoWalkEnabled}
        onDragonTap={onBuddyTap}
        onSceneTap={onSceneTap}
      />

      <div
        key={`bubble-${position}-${mood}-${actionCount}`}
        className={`pointer-events-none absolute z-30 transition-all duration-500 ease-out ${bubblePositionClass[position]} ${
          isCameraActive ? "opacity-100" : "opacity-55"
        }`}
      >
        <ArBuddySpeechBubble mood={mood} message={moodMessage[mood]} />
      </div>
    </div>
  );
}
