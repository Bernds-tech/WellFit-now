import type { ReactNode, RefObject } from "react";
import type { CameraPermissionState } from "@/lib/vision/visionTypes";

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  permissionState: CameraPermissionState;
  children?: ReactNode;
};

export default function CameraPreview({ videoRef, permissionState, children }: CameraPreviewProps) {
  const isActive = permissionState === "granted";

  return (
    <section className="overflow-hidden rounded-[28px] bg-black/35 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
      <div className="relative aspect-[9/14] max-h-[520px] w-full bg-black">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${isActive ? "opacity-100" : "opacity-0"}`}
          muted
          playsInline
        />

        {isActive && children}

        {!isActive && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <div className="text-6xl">📷</div>
              <h2 className="mt-4 text-2xl font-black text-white">Kamera noch aus</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Starte die Kamera, um die Grundlage für Skeleton Tracking, Face Tracking und Übungszählung zu testen.
              </p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#042f35]/80 px-3 py-1 text-xs font-black text-cyan-100">
          {isActive ? "Live Preview + Skeleton" : "Preview"}
        </div>
      </div>
    </section>
  );
}
