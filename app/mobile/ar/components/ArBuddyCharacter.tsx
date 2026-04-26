import type { ArBuddyMood } from "./ArBuddyOverlay";

type ArBuddyCharacterProps = {
  mood: ArBuddyMood;
  isCameraActive: boolean;
  onTap: () => void;
};

const moodAnimation: Record<ArBuddyMood, string> = {
  idle: "animate-pulse",
  called: "animate-bounce",
  happy: "animate-bounce",
  listening: "animate-pulse",
};

const moodFace: Record<ArBuddyMood, string> = {
  idle: "🐉",
  called: "🔥",
  happy: "🐲",
  listening: "👂",
};

export default function ArBuddyCharacter({ mood, isCameraActive, onTap }: ArBuddyCharacterProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!isCameraActive}
      aria-label="Flammi antippen"
      className={`relative grid h-28 w-28 place-items-center rounded-full border border-orange-200/45 bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500 text-6xl shadow-[0_22px_58px_rgba(0,0,0,0.45)] transition-transform active:scale-95 disabled:pointer-events-none ${
        isCameraActive ? moodAnimation[mood] : "opacity-60"
      }`}
    >
      <span className="absolute -inset-2 rounded-full border border-orange-200/20" />
      <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(165,243,252,0.9)]" />
      <span className="drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]">{moodFace[mood]}</span>
      <span className="absolute -bottom-2 rounded-full bg-[#042f35]/90 px-3 py-1 text-xs font-black text-cyan-100 backdrop-blur-md">
        Flammi
      </span>
    </button>
  );
}
