import type { ArBuddyMood } from "./ArBuddyOverlay";

type ArBuddySpeechBubbleProps = {
  mood: ArBuddyMood;
  message: string;
};

const moodLabel: Record<ArBuddyMood, string> = {
  idle: "Bereit",
  called: "Da",
  happy: "Freude",
  listening: "Zuhören",
  curious: "Neugier",
  playful: "Spiel",
  returning: "Zurück",
};

export default function ArBuddySpeechBubble({ mood, message }: ArBuddySpeechBubbleProps) {
  return (
    <div className="pointer-events-none mb-2 max-w-[170px] rounded-[20px] bg-[#042f35]/86 p-2.5 text-left shadow-[0_14px_36px_rgba(0,0,0,0.32)] backdrop-blur-md sm:max-w-[190px] sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/54 sm:text-[10px]">Flammi</span>
        <span className="rounded-full bg-orange-300 px-2 py-0.5 text-[9px] font-black text-[#042f35] sm:text-[10px]">{moodLabel[mood]}</span>
      </div>
      <p className="mt-1.5 text-[11px] font-bold leading-snug text-cyan-50 sm:mt-2 sm:text-xs">{message}</p>
    </div>
  );
}
