import type { ArBuddyMood } from "./ArBuddyOverlay";

type ArPlacementHintProps = {
  isCameraActive: boolean;
  mood: ArBuddyMood;
};

export default function ArPlacementHint({ isCameraActive, mood }: ArPlacementHintProps) {
  if (!isCameraActive) {
    return null;
  }

  const isPlaced = mood !== "idle";

  return (
    <div className="pointer-events-none absolute inset-x-8 bottom-[18%] grid place-items-center">
      <div className={`h-20 w-44 rounded-[999px] border border-dashed ${isPlaced ? "border-orange-200/55 bg-orange-300/8" : "border-cyan-100/35 bg-cyan-100/8"}`}>
        <div className="grid h-full place-items-center text-center text-[11px] font-black uppercase tracking-[0.16em] text-cyan-50/72">
          {isPlaced ? "Flammi-Anker simuliert" : "Raum suchen"}
        </div>
      </div>
      <p className="mt-2 max-w-[260px] text-center text-[11px] font-bold leading-snug text-white/68">
        Prototyp: noch kein echter AR-Bodenanker. Halte die Kamera ruhig auf eine freie Fläche.
      </p>
    </div>
  );
}
