"use client";

import { useEffect } from "react";

export default function PwaInstaller() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA registration is best-effort for the test app.
    });
  }, []);

  return null;
}
