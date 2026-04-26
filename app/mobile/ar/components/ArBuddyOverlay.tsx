type ArBuddyOverlayProps = {
  isCameraActive: boolean;
};

export default function ArBuddyOverlay({ isCameraActive }: ArBuddyOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="absolute bottom-[32%] left-[18%]">
        <div className={`grid h-24 w-24 place-items-center rounded-full bg-orange-400/90 text-6xl shadow-[0_18px_42px_rgba(0,0,0,0.35)] ${isCameraActive ? "animate-bounce" : "opacity-60"}`}>
          🐉
        </div>
        <div className="mt-2 rounded-2xl bg-[#042f35]/82 p-2 text-center text-xs font-black text-cyan-100 backdrop-blur-md">
          Flammi
        </div>
      </div>

      <div className="absolute bottom-[24%] left-[22%] h-6 w-24 rounded-full bg-black/35 blur-md" />
      <div className="absolute bottom-[20%] right-[14%] rounded-2xl bg-[#042f35]/78 p-3 text-right text-xs font-bold leading-snug text-cyan-100 backdrop-blur-md">
        Später läuft Flammi mit Bodenanker durch den echten Raum.
      </div>
    </div>
  );
}
