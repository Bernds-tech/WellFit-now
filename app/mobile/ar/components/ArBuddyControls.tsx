type ArBuddyControlsProps = {
  autoWalkEnabled: boolean;
  onStopCamera: () => void;
  onCallBuddy: () => void;
  onToggleWalk: () => void;
};

export default function ArBuddyControls({ autoWalkEnabled, onStopCamera, onCallBuddy, onToggleWalk }: ArBuddyControlsProps) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-30 rounded-[24px] bg-[#042f35]/70 p-2 shadow-[0_16px_38px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onStopCamera}
          className="rounded-2xl bg-white/12 px-2 py-2.5 text-[11px] font-black text-white sm:px-4 sm:py-3 sm:text-sm"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={onCallBuddy}
          className="rounded-2xl bg-orange-400 px-2 py-2.5 text-[11px] font-black text-[#042f35] shadow-[0_12px_30px_rgba(251,146,60,0.28)] sm:px-4 sm:py-3 sm:text-sm"
        >
          Rufen
        </button>
        <button
          type="button"
          onClick={onToggleWalk}
          className={`rounded-2xl px-2 py-2.5 text-[11px] font-black sm:px-4 sm:py-3 sm:text-sm ${
            autoWalkEnabled ? "bg-cyan-100 text-[#042f35]" : "bg-white/12 text-white"
          }`}
        >
          {autoWalkEnabled ? "Pause" : "Laufen"}
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] font-bold leading-snug text-cyan-50/62">
        Prototyp: sichere Bildschirmbewegung, noch kein echter AR-Raumanker.
      </p>
    </div>
  );
}
