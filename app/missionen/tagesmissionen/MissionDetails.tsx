"use client";

import Image from "next/image";
import { DailyMission, missionIcon } from "./missions";

type MissionDetailsProps = {
  mission: DailyMission;
  reward: number;
  diversityMultiplier: number;
  antiFarmingMultiplier: number;
  isFavorite: boolean;
  rewardDetailsOpen: boolean;
  onToggleFavorite: (missionId: string) => void;
  onToggleRewardDetails: () => void;
};

export default function MissionDetails({
  mission,
  reward,
  diversityMultiplier,
  antiFarmingMultiplier,
  isFavorite,
  rewardDetailsOpen,
  onToggleFavorite,
  onToggleRewardDetails,
}: MissionDetailsProps) {
  return (
    <aside className="h-full overflow-hidden rounded-[6px] bg-[#003d46]/95 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
      <div className="flex h-full flex-col overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-2xl font-extrabold tracking-wide">Missionsdetails</h2>
          <button onClick={() => onToggleFavorite(mission.id)} className={`text-5xl leading-none transition hover:scale-125 ${isFavorite ? "text-yellow-400" : "text-white/25 hover:text-yellow-300"}`}>★</button>
        </div>

        <div className="flex justify-center text-6xl text-cyan-300">{missionIcon(mission.type)}</div>
        <h3 className="mt-3 text-center text-3xl font-extrabold leading-tight">{mission.title}</h3>
        <p className="mt-3 text-center text-base leading-tight text-white/90">{mission.description}</p>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-white/75">
            <span>Fortschritt</span>
            <span className="font-bold">0%</span>
          </div>
          <div className="h-5 overflow-hidden rounded bg-[#062e34]">
            <div className="h-full rounded bg-cyan-300 transition-all duration-700" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-base">
          <span>Schwierigkeit</span>
          <span className="font-bold">{mission.difficulty}</span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-lg font-bold">
          <Image src="/coin.png" alt="Punkte" width={34} height={34} className="rounded-full" />
          <span>+ {reward} Punkte</span>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xs text-white/80">
          <button onClick={onToggleRewardDetails} className="flex w-full items-center justify-between p-3 text-left font-bold text-yellow-300">
            <span>So entstehen die Punkte</span>
            <span>{rewardDetailsOpen ? "−" : "+"}</span>
          </button>
          {rewardDetailsOpen && (
            <div className="border-t border-yellow-500/20 px-3 pb-3">
              <div className="mt-2 grid grid-cols-2 gap-1">
                <span>Basis</span>
                <span className="text-right">{mission.reward}</span>
                <span>Vielfalt</span>
                <span className="text-right">×{diversityMultiplier.toFixed(2)}</span>
                <span>Anti-Farming</span>
                <span className="text-right">×{antiFarmingMultiplier.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-cyan-50/80">Abwechslung erhöht die Punkte. Wiederholung senkt sie.</p>
            </div>
          )}
        </div>

        <button className="mt-4 w-full rounded-[16px] bg-blue-600 px-4 py-3 text-lg font-extrabold transition hover:bg-blue-700 active:scale-95">Mission starten</button>
      </div>
    </aside>
  );
}
