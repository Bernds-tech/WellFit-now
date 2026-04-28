type ArBuddyControlsProps = {
  autoWalkEnabled: boolean;
  anchorMode: boolean;
  hasAnchor: boolean;
  onStopCamera: () => void;
  onCallBuddy: () => void;
  onToggleWalk: () => void;
  onToggleAnchorMode: () => void;
  onClearAnchor: () => void;
  floating?: boolean;
};

export default function ArBuddyControls({
  autoWalkEnabled,
  anchorMode,
  hasAnchor,
  onStopCamera,
  onCallBuddy,
  onToggleWalk,
  onToggleAnchorMode,
  onClearAnchor,
  floating = true,
}: ArBuddyControlsProps) {
  const positionClass = floating
    ? "absolute inset-x-3 bottom-3 z-40"
    : "relative z-40";

  return (
    <div className={`${positionClass} rounded-[24px] bg-[#042f35]/76 p-2 shadow-[0_16px_38px_rgba(0,0,0,0.28)] backdrop-blur-md`}>
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onStopCamera}
          className="rounded-2xl bg-white/12 px-2 py-2.5 text-[10px] font-black text-white sm:px-4 sm:py-3 sm:text-sm"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={onCallBuddy}
          className="rounded-2xl bg-orange-400 px-2 py-2.5 text-[10px] font-black text-[#042f35] shadow-[0_12px_30px_rgba(251,146,60,0.28)] sm:px-4 sm:py-3 sm:text-sm"
        >
          Rufen
        </button>
        <button
          type="button"
          onClick={onToggleWalk}
          className={`rounded-2xl px-2 py-2.5 text-[10px] font-black sm:px-4 sm:py-3 sm:text-sm ${
            autoWalkEnabled ? "bg-cyan-100 text-[#042f35]" : "bg-white/12 text-white"
          }`}
        >
          {autoWalkEnabled ? "Pause" : "Laufen"}
        </button>
        <button
          type="button"
          onClick={onToggleAnchorMode}
          className={`rounded-2xl px-2 py-2.5 text-[10px] font-black sm:px-4 sm:py-3 sm:text-sm ${
            anchorMode ? "bg-green-300 text-[#042f35]" : "bg-white/12 text-white"
          }`}
        >
          Anker
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-bold leading-snug text-cyan-50/66">
        <p>{anchorMode ? "Tippe im Kamerabild auf den Boden, um Flammi dort zu platzieren." : hasAnchor ? "Anker gesetzt: Flammi bleibt am gesetzten Punkt." : "Kein Anker gesetzt: Bewegung ist noch simuliert."}</p>
        {hasAnchor && (
          <button type="button" onClick={onClearAnchor} className="shrink-0 rounded-full bg-white/10 px-2 py-1 font-black text-white">
            lösen
          </button>
        )}
      </div>
    </div>
  );
}
