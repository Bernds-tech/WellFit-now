"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  title,
  children,
}: LegalPageLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthenticated(Boolean(firebaseUser));
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(isAuthenticated ? "/einstellungen" : "/");
  };

  const backLabel = authChecked && isAuthenticated ? "← Zurück zur App" : "← Zurück";

  return (
    <main
      className="relative min-h-screen w-screen overflow-x-hidden text-white"
      style={{
        backgroundImage: "url('/login-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-cyan-900/20" />

      <div className="relative z-10 min-h-screen px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#003f46]/92 px-8 py-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-cyan-400/60 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="text-left text-[18px] text-white/80 transition hover:text-white"
            >
              {backLabel}
            </button>

            <h1 className="text-center text-5xl font-bold leading-none">
              {title}
            </h1>

            <div className="relative h-20 w-28 shrink-0">
              <Image
                src="/logo.png"
                alt="WellFit Logo"
                fill
                sizes="112px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-4 text-[18px] leading-[1.55] text-white/95 [&_strong]:font-semibold [&_strong]:text-[#b9edf4]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
