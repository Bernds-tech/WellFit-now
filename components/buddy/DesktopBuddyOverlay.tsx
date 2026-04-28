"use client";

import Image from "next/image";
import { useState } from "react";

type Step = {
  title: string;
  text: string;
};

type DesktopBuddyOverlayProps = {
  routeLabel?: string;
  steps?: Step[];
};

const defaultSteps: Step[] = [
  { title: "Ich bin da!", text: "Ich begleite dich durch WellFit und zeige dir spaeter, wo du was findest." },
  { title: "Einstellungen", text: "Oben findest du die Einstellungen fuer Profil, Datenschutz und Berechtigungen." },
  { title: "Missionen", text: "Ich kann dir spaeter passende Missionen vorschlagen und dich durch die App fuehren." },
];

export default function DesktopBuddyOverlay({ routeLabel = "WellFit", steps = defaultSteps }: DesktopBuddyOverlayProps) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const step = steps[index] || steps[0];

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-50 rounded-full bg-[#042f35] px-4 py-3 text-sm font-black text-white shadow-2xl">
        Buddy
      </button>
    );
  }

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(320px,calc(100vw-24px))] rounded-[28px] border border-cyan-100/15 bg-[#042f35]/90 p-4 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex gap-3">
        <button type="button" onClick={() => setIndex((current) => (current + 1) % steps.length)} className="relative h-20 w-20 shrink-0 rounded-[22px] bg-white/10">
          <Image src="/mascottchen.png" alt="WellFit Buddy" fill className="object-contain p-1" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/55">{routeLabel} Guide</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-white/80">aus</button>
          </div>
          <h2 className="mt-1 text-lg font-black">{step.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-cyan-50/80">{step.text}</p>
        </div>
      </div>
      <button type="button" onClick={() => setIndex((current) => (current + 1) % steps.length)} className="mt-3 rounded-full bg-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-50">
        Naechster Tipp
      </button>
    </aside>
  );
}
