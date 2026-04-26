type ArStatusCardProps = {
  cameraActive: boolean;
  message?: string | null;
};

export default function ArStatusCard({ cameraActive, message }: ArStatusCardProps) {
  return (
    <div className="absolute left-3 right-3 top-3 z-30 rounded-[24px] bg-[#042f35]/86 p-4 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">AR-Testmodus</p>
          <h1 className="mt-1 text-2xl font-black leading-none">Flammi im Raum</h1>
        </div>
        <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-black text-[#042f35]">
          {cameraActive ? "Kamera aktiv" : "bereit"}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-cyan-100/72">
        {message || "Starte die Kamera. Aktuell ist Flammi ein AR-Overlay; echte Bodenerkennung, Raumanker und 3D-Bewegung folgen in Phase 3."}
      </p>
    </div>
  );
}
