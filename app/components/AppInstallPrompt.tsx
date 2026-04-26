"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function AppInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const mobileUrl = useMemo(() => `${origin || ""}/mobile`, [origin]);
  const isSecure = useMemo(() => mobileUrl.startsWith("https://") || mobileUrl.startsWith("http://localhost"), [mobileUrl]);
  const qrUrl = useMemo(() => {
    if (!mobileUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(mobileUrl)}`;
  }, [mobileUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopyMessage("Link kopiert.");
    } catch {
      setCopyMessage("Kopieren nicht möglich. Link bitte manuell öffnen.");
    }
  };

  const installPwa = async () => {
    if (!isSecure) {
      setCopyMessage("Installation, Kamera und Sensoren brauchen HTTPS. Bitte die https-Adresse scannen/öffnen.");
      return;
    }

    if (!deferredPrompt) {
      setCopyMessage("Am Handy öffnen: Android/Chrome Menü → App installieren. iPhone/Safari Teilen → Zum Home-Bildschirm.");
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-2 whitespace-nowrap text-left text-base font-bold text-green-400 hover:text-green-300"
      >
        App aufs Handy laden
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[430px] rounded-[30px] bg-[#04343b] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">WellFit Mobile</p>
                <h2 className="mt-2 text-3xl font-black leading-none">App testen</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-white/80">
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-cyan-100/75">
              Scanne den QR-Code mit deinem Handy. Die Test-App öffnet nur die reduzierte Mobile-Oberfläche: Missionen, Buddy, Analyse und Bewegungstest.
            </p>

            {!isSecure && (
              <p className="mt-3 rounded-2xl bg-red-400/15 p-3 text-xs font-bold leading-relaxed text-red-100">
                Achtung: Du bist nicht über HTTPS verbunden. Kamera, Sensoren und Installation funktionieren auf Handys meist nur über HTTPS.
              </p>
            )}

            <div className="mt-5 grid place-items-center rounded-[24px] bg-white p-4">
              {qrUrl ? <img src={qrUrl} alt="WellFit Mobile QR Code" width={260} height={260} /> : <div className="h-[260px] w-[260px] bg-white" />}
            </div>

            <div className="mt-4 rounded-2xl bg-black/18 p-3 text-sm font-semibold text-cyan-100/80 break-all">
              {mobileUrl || "/mobile"}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={copyLink} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white">
                Link kopieren
              </button>
              <button type="button" onClick={installPwa} className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-black text-[#042f35]">
                Installieren
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-black/18 p-3 text-xs leading-relaxed text-cyan-100/72">
              <p className="font-black text-cyan-100">Android/Chrome:</p>
              <p>QR öffnen → ⋮ Menü → App installieren oder Zum Startbildschirm hinzufügen.</p>
              <p className="mt-2 font-black text-cyan-100">iPhone/Safari:</p>
              <p>QR öffnen → Teilen-Symbol → Zum Home-Bildschirm.</p>
            </div>

            {copyMessage && <p className="mt-3 rounded-2xl bg-black/18 p-3 text-xs font-semibold text-cyan-100/75">{copyMessage}</p>}

            <p className="mt-4 text-xs leading-relaxed text-white/48">
              Hinweis: Der QR-Code nutzt vorerst einen externen QR-Bilddienst für den Test. Für App-Store-/Produktionsbetrieb ersetzen wir das später durch eine eigene QR-Erzeugung oder native Store-Links.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
