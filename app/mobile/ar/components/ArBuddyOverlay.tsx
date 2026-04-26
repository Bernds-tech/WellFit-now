import ArBuddyCharacter from "./ArBuddyCharacter";
import ArBuddySpeechBubble from "./ArBuddySpeechBubble";
import ArPlacementHint from "./ArPlacementHint";

export type ArBuddyMood = "idle" | "called" | "happy" | "listening" | "curious" | "playful" | "returning";
export type ArBuddyPosition = "near" | "center" | "far";

type ArBuddyOverlayProps = {
  isCameraActive: boolean;
  mood: ArBuddyMood;
  position: ArBuddyPosition;
  onBuddyTap: () => void;
};

const positionClass: Record<ArBuddyPosition, string> = {
  near: "bottom-[23%] left-[8%] scale-105",
  center: "bottom-[31%] left-1/2 -translate-x-1/2 scale-95",
  far: "bottom-[39%] right-[8%] scale-85",
};

const moodMessage: Record<ArBuddyMood, string> = {
  idle: "Ich warte auf dich.",
  called: "Ich bin da. Halte das Handy ruhig.",
  happy: "Gut gemacht! Ich bin bei dir.",
  listening: "Ich höre zu. Was machen wir als Nächstes?",
  curious: "Interessant! Ich sehe mich hier um.",
  playful: "Ich hüpfe durch den sicheren Bereich.",
  returning: "Ich komme zurück zu dir.",
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
        <div className="mx-auto mt-1 h-6 w-24 rounded-full bg-black/35 blur-md" />
      </div>
    </div>
  );
}
