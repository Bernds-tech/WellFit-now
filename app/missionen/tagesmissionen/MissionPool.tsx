"use client";

import MissionTile from "./MissionTile";
import { DailyMission } from "./missions";

type Props = {
  missions: DailyMission[];
  selectedMissionId: string | null;
  favoriteIds: string[];
  recommendedIds: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export default function MissionPool({
  missions,
  selectedMissionId,
  favoriteIds,
  recommendedIds,
  onSelect,
  onToggleFavorite,
}: Props) {
  return (
    <section className="mt-4 rounded-[8px] bg-[#00606b]/75 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="w-fit border-b border-white/70 text-3xl font-extrabold tracking-wide">Missionspool</h2>
        <span className="rounded-full border border-yellow-400/50 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-200">
          KI empfiehlt gelb
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
        {missions.map((mission) => (
          <MissionTile
            key={mission.id}
            mission={mission}
            selectedMissionId={selectedMissionId}
            favoriteIds={favoriteIds}
            recommendedIds={recommendedIds}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
