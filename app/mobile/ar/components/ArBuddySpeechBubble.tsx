import type { ArBuddyMood } from "./ArBuddyOverlay";

type ArBuddySpeechBubbleProps = {
  mood: ArBuddyMood;
  message: string;
};

const moodLabel: Record<ArBuddyMood, string> = {
  idle: "Bereit",
  called: "Kommt",
  happy: "Freude",
  listening: "Zuhören",
};

export default function ArBuddySpeechBubble({ mood, message }: ArBuddySpeechBubbleProps) {
  return (
    <div className="pointer-events-none mb-3 max-w-[190px] rounded-[22px] bg-[#042f35]/86 p-3 text-left shadow-[0_14px_36px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/54">Flammi</span>
        <span className="rounded-full bg-orange-300 px-2 py-0.5 text-[10px] font-black text-[#042f35]">{moodLabel[mood]}</span>
      </div>
      <p className="mt-2 text-xs font-bold leading-snug text-cyan-50">{message}</p>
    </div>
  );
}
