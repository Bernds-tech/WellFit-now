import ArBuddyCharacter from "./ArBuddyCharacter";
import ArBuddySpeechBubble from "./ArBuddySpeechBubble";
import ArPlacementHint from "./ArPlacementHint";

export type ArBuddyMood = "idle" | "called" | "happy" | "listening";

type ArBuddyOverlayProps = {
  isCameraActive: boolean;
  mood: ArBuddyMood;
  position: "near" | "center" | "far";
  onBuddyTap: () => void;
};

const positionClass = {
  near: "bottom-[25%] left-[11%] scale-110",
  center: "bottom-[31%] left-1/2 -translate-x-1/2 scale-100",
  far: "bottom-[40%] right-[13%] scale-90",
};

const moodMessage: Record<ArBuddyMood, string> = {
  idle: "Ich warte auf dich.",
  called: "Ich komme! Halte das Handy ruhig.",
  happy: "Gut gemacht! Ich bin bei dir.",
  listening: "Ich höre zu. Was machen wir als Nächstes?",
};

export default function ArBuddyOverlay({ isCameraActive, mood, position, onBuddyTap }: ArBuddyOverlayProps) {
  return (
    <div className="absolute inset-0 z-20">
      <ArPlacementHint isCameraActive={isCameraActive} mood={mood} />

      <div
        className={`absolute transition-all duration-700 ease-out ${positionClass[position]} ${
          isCameraActive ? "opacity-100" : "opacity-55"
        }`}
      >
        <ArBuddySpeechBubble mood={mood} message={moodMessage[mood]} />
        <ArBuddyCharacter mood={mood} isCameraActive={isCameraActive} onTap={onBuddyTap} />
        <div className="mx-auto mt-2 h-7 w-28 rounded-full bg-black/35 blur-md" />
      </div>
    </div>
  );
}
