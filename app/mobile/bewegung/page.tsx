"use client";

import MobileBottomNav from "../components/MobileBottomNav";
import MotionActivityPanel from "./components/MotionActivityPanel";
import { useMotionActivity } from "./hooks/useMotionActivity";

export default function MobileBewegungPage() {
  const { state, start, stop, reset } = useMotionActivity();

  return (
    <main className="h-screen overflow-y-auto bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-32 text-white">
      <section className="px-4 pt-4">
        <MotionActivityPanel state={state} onStart={start} onStop={stop} onReset={reset} />

        <div className="mt-4 rounded-[24px] border border-yellow-200/20 bg-[#042f35]/80 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-100/60">Wichtig</p>
          <p className="mt-2 text-sm leading-relaxed text-white/72">
            Browser-Sensoren sind ein Test-Prototyp. Auto, Motorrad und Joggen werden nur grob geschätzt. Für die echte App brauchen wir später native Activity Recognition und serverseitige Plausibilisierung gegen Betrug.
          </p>
        </div>
      </section>

      <div className="h-8" />
      <MobileBottomNav activeTab="settings" />
    </main>
  );
}
