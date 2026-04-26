type ArBuddyPreviewProps = {
  isRunning: boolean;
};

export default function ArBuddyPreview({ isRunning }: ArBuddyPreviewProps) {
  return (
    <div className="pointer-events-none absolute right-5 top-24 z-20">
      <div className="relative">
        <div className={`grid h-20 w-20 place-items-center rounded-full bg-orange-400/90 text-5xl shadow-[0_12px_28px_rgba(0,0,0,0.28)] ${isRunning ? "animate-bounce" : ""}`}>
          🐉
        </div>
        <div className="absolute -bottom-8 right-0 w-44 rounded-2xl bg-[#042f35]/82 p-2 text-right text-xs font-bold leading-snug text-cyan-100 backdrop-blur-md">
          {isRunning ? "Flammi schaut zu und zählt mit." : "Später läuft Flammi hier in AR durch den echten Raum."}
        </div>
      </div>
    </div>
  );
}
