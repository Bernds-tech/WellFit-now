"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { recordUserSessionActivity } from "@/lib/beta1/clientUserPreferences";

export default function LandingSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || disposed) return;
      try {
        const session = await recordUserSessionActivity("login");
        if (!disposed) router.replace(session.requiresInitialization ? "/register" : "/dashboard");
      } catch {
        if (!disposed) router.replace("/dashboard");
      }
    });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [router]);

  return <span className="landing-scale-marker" aria-hidden="true" />;
}
