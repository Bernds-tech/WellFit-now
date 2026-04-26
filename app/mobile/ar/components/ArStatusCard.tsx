type ArStatusCardProps = {
  cameraActive: boolean;
  message?: string | null;
};

export default function ArStatusCard({ cameraActive, message }: ArStatusCardProps) {
  return (
    <div className="absolute left-3 right-3 top-3 z-30 rounded-[24px] bg-[#042f35]/82 p-3 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/55 sm:text-xs">AR-Testmodus</p>
          <h1 className="mt-1 text-xl font-black leading-none sm:text-2xl">3D-Flammi im Raum</h1>
        </div>
        <span className="rounded-full bg-orange-400 px-3 py-1 text-[10px] font-black text-[#042f35] sm:text-xs">
          {cameraActive ? "3D aktiv" : "bereit"}
        </span>
      </div>
      <p className="mt-2 text-[11px] font-semibold leading-relaxed text-cyan-100/72 sm:mt-3 sm:text-xs">
        {message || "Starte die Rückkamera. Flammi wird als 3D-WebGL-Drache über die Kamera gelegt; echter Bodenanker folgt mit WebXR/ARCore/ARKit."}
      </p>
    </div>
  );
}
