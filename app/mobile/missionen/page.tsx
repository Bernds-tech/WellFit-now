"use client";

import { useState } from "react";
import MobileBottomNav from "../components/MobileBottomNav";

const mobileMissions = [
  {
    id: "mobile-squat-test",
    title: "10 saubere Kniebeugen",
    type: "Pose-Test",
    description: "Starte die Analyse, stelle dein Handy auf und lasse WellFit deine Kniebeugen prüfen.",
    href: "/mobile/analyse",
  },
  {
    id: "mobile-motion-test",
    title: "Bewegungstest",
    type: "Sensor-Test",
    description: "Teste Schritte und grobe Aktivität direkt über die Bewegungssensoren deines Handys.",
    href: "/mobile/bewegung",
  },
  {
    id: "mobile-buddy-care",
    title: "Flammi versorgen",
    type: "Buddy",
    description: "Füttere oder pflege deinen Buddy in der mobilen Testansicht.",
    href: "/mobile/buddy",
  },
];

export default function MobileMissionenPage() {
  const [message, setMessage] = useState("Wähle eine mobile Testmission. Keine Desktop-Seite nötig.");

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-24 text-white">
      <section className="px-4 pt-4">
        <div className="rounded-[30px] bg-[#04343b] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/55">Mobile Missionen</p>
          <h1 className="mt-2 text-4xl font-black leading-none">Spielen</h1>
          <p className="mt-3 text-sm leading-relaxed text-cyan-100/75">{message}</p>
        </div>

        <div className="mt-4 grid gap-3">
          {mobileMissions.map((mission) => (
            <a
              key={mission.id}
              href={mission.href}
              onClick={() => setMessage(`${mission.title} wird geöffnet.`)}
              className="block rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)] active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/55">{mission.type}</p>
                  <h2 className="mt-1 text-xl font-black text-white">{mission.title}</h2>
                </div>
                <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-black text-[#042f35]">Start</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{mission.description}</p>
            </a>
          ))}
        </div>
      </section>

      <MobileBottomNav activeTab="missions" />
    </main>
  );
}
