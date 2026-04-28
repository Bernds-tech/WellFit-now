type NativeArModeCardProps = {
  floating?: boolean;
};

export default function NativeArModeCard({ floating = true }: NativeArModeCardProps) {
  const positionClass = floating
    ? "absolute inset-x-3 top-[122px] z-30"
    : "relative z-30";

  return (
    <section className={`${positionClass} rounded-[22px] border border-cyan-100/10 bg-[#042f35]/68 p-3 text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-md`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-100/50">Naechster echter Modus</p>
          <h2 className="mt-1 text-sm font-black">Native ARCore / ARKit</h2>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-black text-cyan-100">geplant</span>
      </div>
      <p className="mt-2 text-[10px] font-semibold leading-relaxed text-cyan-50/66">
        Dieser Browser-Modus testet nur UI und Flammi. Raumfeste Anker, echte Flaechen und Bewegung auf Couch, Boden oder Tisch brauchen die native AR-Schicht.
      </p>
    </section>
  );
}
