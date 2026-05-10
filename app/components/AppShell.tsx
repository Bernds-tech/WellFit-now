"use client";

import type { ReactNode } from "react";
import AppFooter from "@/app/AppFooter";
import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";

type AppShellProps = {
  children: ReactNode;
  reward?: number;
  onLogout?: () => void;
  contentClassName?: string;
};

export default function AppShell({
  children,
  reward = 0,
  onLogout,
  contentClassName = "px-7 py-5 pb-0",
}: AppShellProps) {
  const [brightness, setBrightness] = useWellFitBrightness(100);

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar
          brightness={brightness}
          onBrightnessChange={setBrightness}
          onLogout={onLogout}
        />

        <section className={`relative flex h-full flex-1 flex-col overflow-hidden ${contentClassName}`}>
          {children}
          <AppFooter reward={reward} brightness={brightness} />
        </section>
      </div>
    </main>
  );
}
