import ArBuddyCharacter from "./ArBuddyCharacter";
import ArBuddySpeechBubble from "./ArBuddySpeechBubble";
import ArPlacementHint from "./ArPlacementHint";

export type ArBuddyMood = "idle" | "called" | "happy" | "listening" | "curious" | "playful" | "returning";
export type ArBuddyPosition = "nearLeft" | "center" | "farRight" | "nearRight" | "farLeft";

type ArBuddyOverlayProps = {
  isCameraActive: boolean;
  mood: ArBuddyMood;
  position: ArBuddyPosition;
  actionCount: number;
  onBuddyTap: () => void;
};

const positionClass: Record<ArBuddyPosition, string> = {
  nearLeft: "bottom-[22%] left-[6%] scale-105",
  center: "bottom-[31%] left-1/2 -translate-x-1/2 scale-95",
  farRight: "bottom-[41%] right-[6%] scale-85",
  nearRight: "bottom-[23%] right-[9%] scale-105",
  farLeft: "bottom-[40%] left-[10%] scale-85",
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

export default function ArBuddyOverlay({ isCameraActive, mood, position, actionCount, onBuddyTap }: ArBuddyOverlayProps) {
  return (
    <div className="absolute inset-0 z-20">
      <ArPlacementHint isCameraActive={isCameraActive} mood={mood} />

      <div
        key={`${position}-${mood}-${actionCount}`}
        className={`absolute transition-all duration-500 ease-out ${positionClass[position]} ${
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
