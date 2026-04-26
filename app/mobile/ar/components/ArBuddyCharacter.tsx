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
  curious: "animate-pulse",
  playful: "animate-bounce",
  returning: "animate-bounce",
};

const moodFace: Record<ArBuddyMood, string> = {
  idle: "🐉",
  called: "🔥",
  happy: "🐲",
  listening: "👂",
  curious: "👀",
  playful: "✨",
  returning: "🪽",
};

const moodGlow: Record<ArBuddyMood, string> = {
  idle: "shadow-[0_18px_44px_rgba(0,0,0,0.42)]",
  called: "shadow-[0_22px_58px_rgba(251,146,60,0.42)]",
  happy: "shadow-[0_22px_58px_rgba(34,211,238,0.36)]",
  listening: "shadow-[0_18px_44px_rgba(165,243,252,0.28)]",
  curious: "shadow-[0_20px_48px_rgba(250,204,21,0.34)]",
  playful: "shadow-[0_24px_64px_rgba(251,146,60,0.48)]",
  returning: "shadow-[0_20px_50px_rgba(255,255,255,0.28)]",
};

export default function ArBuddyCharacter({ mood, isCameraActive, onTap }: ArBuddyCharacterProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!isCameraActive}
      aria-label="Flammi antippen"
      className={`relative grid h-24 w-24 place-items-center rounded-full border border-orange-200/45 bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500 text-5xl transition-transform active:scale-95 disabled:pointer-events-none sm:h-28 sm:w-28 sm:text-6xl ${
        isCameraActive ? moodAnimation[mood] : "opacity-60"
      } ${moodGlow[mood]}`}
    >
      <span className="absolute -inset-2 rounded-full border border-orange-200/20" />
      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(165,243,252,0.9)] sm:h-5 sm:w-5" />
      <span className="drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]">{moodFace[mood]}</span>
      <span className="absolute -bottom-2 rounded-full bg-[#042f35]/90 px-3 py-1 text-[11px] font-black text-cyan-100 backdrop-blur-md">
        Flammi
      </span>
    </button>
  );
}
