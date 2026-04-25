import type { CameraPermissionState } from "@/lib/vision/visionTypes";

type CameraPermissionPanelProps = {
  permissionState: CameraPermissionState;
  errorMessage: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
};

const labels: Record<CameraPermissionState, string> = {
  idle: "Bereit",
  requesting: "Fragt an...",
  granted: "Kamera aktiv",
  denied: "Abgelehnt",
  unsupported: "Nicht unterstützt",
  error: "Fehler",
};

export default function CameraPermissionPanel({
  permissionState,
  errorMessage,
  onStartCamera,
  onStopCamera,
}: CameraPermissionPanelProps) {
  const isActive = permissionState === "granted";

  return (
    <section className="rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Kamera & Consent</p>
          <h1 className="mt-1 text-3xl font-black text-white">Nutzer analysieren</h1>
        </div>
        <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-[#042f35]">{labels[permissionState]}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/70">
        Die Kamera startet nur nach deiner aktiven Zustimmung. Rohbilder und Videos werden nicht automatisch gespeichert. Phase 2 bereitet Skeleton Tracking, Face Tracking und Übungszählung vor.
      </p>

      {errorMessage && <p className="mt-3 rounded-2xl bg-red-400/15 p-3 text-sm font-semibold text-red-100">{errorMessage}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onStartCamera}
          disabled={permissionState === "requesting" || isActive}
          className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-black text-[#042f35] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Kamera starten
        </button>
        <button
          type="button"
          onClick={onStopCamera}
          disabled={!isActive}
          className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          Kamera stoppen
        </button>
      </div>
    </section>
  );
}
